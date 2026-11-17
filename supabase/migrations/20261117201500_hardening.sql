-- Hardening after review: abuse limits on public intake, a separate key for browser forms, key rotation,
-- recovery of jobs whose worker died, and column privacy for keys.

-- ── Keys ─────────────────────────────────────────────────────────────────
-- ingest_token: server-to-server sources (Zapier, TikTok, portals, Google). Never put it in a web page.
-- form_key: safe to embed in a website form; intake requires a captcha and tighter limits for it.
alter table public.workspace_settings add column form_key uuid not null default gen_random_uuid() unique;

-- Agents don't need the keys: hide both columns from everyone but owners and managers.
revoke select on public.workspace_settings from authenticated;
grant select (workspace_id, assistant_name, timezone, office_hours, holidays, ai_enabled, sandbox_mode, quiet_start,
  quiet_end, followup_days, escalate_score, first_contact_delay_s, whatsapp_phone_number_id, whatsapp_template,
  email_from, voice_from, meta_page_id, updated_at) on public.workspace_settings to authenticated;

create or replace function public.workspace_keys(ws uuid)
returns table (ingest_token uuid, form_key uuid)
language sql stable security definer set search_path = ''
as $$
  select s.ingest_token, s.form_key from public.workspace_settings s
  where s.workspace_id = ws and private.has_role(ws, array['owner', 'manager']::public.member_role[]);
$$;
revoke all on function public.workspace_keys(uuid) from public, anon;
grant execute on function public.workspace_keys(uuid) to authenticated;

create or replace function public.rotate_workspace_key(ws uuid, which text)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare fresh uuid := gen_random_uuid();
begin
  if not private.has_role(ws, array['owner', 'manager']::public.member_role[]) then
    raise exception 'Only owners and managers can rotate keys' using errcode = '42501';
  end if;
  if which = 'ingest' then update public.workspace_settings set ingest_token = fresh where workspace_id = ws;
  elsif which = 'form' then update public.workspace_settings set form_key = fresh where workspace_id = ws;
  else raise exception 'Unknown key %', which; end if;
  return fresh;
end $$;
revoke all on function public.rotate_workspace_key(uuid, text) from public, anon;
grant execute on function public.rotate_workspace_key(uuid, text) to authenticated;

-- ── Intake rate limiting ────────────────────────────────────────────────
create table public.intake_events (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  ip_hash text not null check (char_length(ip_hash) <= 64),
  phone text check (char_length(phone) <= 40),
  public_form boolean not null default false,
  created_at timestamptz not null default now()
);
create index intake_events_ip_idx on public.intake_events (ip_hash, created_at desc);
create index intake_events_ws_idx on public.intake_events (workspace_id, created_at desc);
create index intake_events_phone_idx on public.intake_events (workspace_id, phone, created_at desc) where phone is not null;
alter table public.intake_events enable row level security; -- no policies: server only
revoke all on public.intake_events from anon, authenticated;
grant all on public.intake_events to service_role;

/**
 * Records an intake attempt and says whether it is allowed. Limits:
 * one address: 5 per 10 minutes (public forms) or 60 (server sources); one phone: 3 per day;
 * one workspace: 300 public-form leads per hour, which also caps AI spend from a flood.
 */
create or replace function public.intake_allowed(ws uuid, ip text, phone_number text, is_public boolean)
returns text
language plpgsql security invoker set search_path = ''
as $$
declare n int;
begin
  select count(*) into n from public.intake_events where ip_hash = ip and created_at > now() - interval '10 minutes';
  if n >= (case when is_public then 5 else 60 end) then return 'too many requests from this address'; end if;
  if phone_number is not null then
    select count(*) into n from public.intake_events where workspace_id = ws and phone = phone_number and created_at > now() - interval '1 day';
    if n >= 3 then return 'too many requests for this number'; end if;
  end if;
  if is_public then
    select count(*) into n from public.intake_events where workspace_id = ws and public_form and created_at > now() - interval '1 hour';
    if n >= 300 then return 'this workspace is receiving too many form submissions'; end if;
  end if;
  insert into public.intake_events (workspace_id, ip_hash, phone, public_form) values (ws, ip, phone_number, is_public);
  delete from public.intake_events where created_at < now() - interval '2 days' and id % 50 = 0;
  return null;
end $$;
revoke all on function public.intake_allowed(uuid, text, text, boolean) from public, anon, authenticated;
grant execute on function public.intake_allowed(uuid, text, text, boolean) to service_role;

-- ── Job recovery ────────────────────────────────────────────────────────
-- A job left "running" for 5 minutes means its worker was killed (e.g. a function timeout). Put it back
-- in the queue, or fail it after three attempts, before handing out new work.
create or replace function public.claim_due_jobs(max_jobs integer default 20)
returns setof public.jobs
language plpgsql security invoker set search_path = ''
as $$
begin
  update public.jobs set status = case when attempts >= 3 then 'failed' else 'pending' end,
    last_error = coalesce(last_error, 'worker stopped before finishing'), updated_at = now()
  where status = 'running' and updated_at < now() - interval '5 minutes';

  return query
  update public.jobs j set status = 'running', attempts = j.attempts + 1, updated_at = now()
  where j.id in (
    select id from public.jobs
    where status = 'pending' and run_at <= now()
    order by run_at
    limit greatest(1, least(max_jobs, 100))
    for update skip locked
  )
  returning j.*;
end $$;
revoke all on function public.claim_due_jobs(integer) from public, anon, authenticated;
grant execute on function public.claim_due_jobs(integer) to service_role;
create index if not exists jobs_running_idx on public.jobs (updated_at) where status = 'running';

-- ── WhatsApp's 24-hour window counts only WhatsApp messages ─────────────
-- last_inbound_at moves for any channel (web form, email, call); free-text WhatsApp is only allowed
-- within 24 hours of the lead's last *WhatsApp* message.
alter table public.leads add column last_whatsapp_in_at timestamptz;
