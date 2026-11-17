-- Observer growth engine: AI settings, agent profiles for routing, the conversation log, inventory,
-- appointments, notifications, and a job queue driven by pg_cron.
--
-- Access model (on top of the first migration)
--   * Members read their workspace's settings, inventory and team profiles; owners and managers edit them.
--   * Each member may edit their own routing profile (languages, availability, phone for alerts).
--   * Messages and appointments are visible exactly when their lead is visible (lead RLS applies inside
--     the subquery), so agents only see conversations with their own leads and the unassigned pool.
--   * The job queue and webhook-facing columns are not exposed to anon/authenticated at all; the server
--     worker uses the secret key (service_role) for intake, AI turns and scheduled sends.

-- ── Workspace AI settings ───────────────────────────────────────────────
create table public.workspace_settings (
  workspace_id uuid primary key references public.workspaces (id) on delete cascade,
  assistant_name text not null default 'Noor' check (char_length(assistant_name) between 1 and 40),
  timezone text not null default 'Asia/Dubai' check (char_length(timezone) <= 64),
  -- {"mon": [["09:00","18:00"]], ..., "sun": []}
  office_hours jsonb not null default '{"mon":[["09:00","18:00"]],"tue":[["09:00","18:00"]],"wed":[["09:00","18:00"]],"thu":[["09:00","18:00"]],"fri":[["09:00","18:00"]],"sat":[],"sun":[]}'::jsonb,
  holidays date[] not null default '{}',
  ai_enabled boolean not null default true,
  sandbox_mode boolean not null default true,
  quiet_start time not null default '21:00',
  quiet_end time not null default '09:00',
  followup_days smallint[] not null default '{1,3,7}',
  escalate_score smallint not null default 85 check (escalate_score between 50 and 100),
  first_contact_delay_s smallint not null default 75 check (first_contact_delay_s between 0 and 180),
  ingest_token uuid not null default gen_random_uuid() unique,
  whatsapp_phone_number_id text check (char_length(whatsapp_phone_number_id) <= 40),
  whatsapp_template text not null default 'observer_first_contact' check (char_length(whatsapp_template) <= 80),
  email_from text check (char_length(email_from) <= 254),
  voice_from text check (char_length(voice_from) <= 40),
  meta_page_id text check (char_length(meta_page_id) <= 40),
  updated_at timestamptz not null default now()
);

-- ── Member routing profiles ─────────────────────────────────────────────
create table public.member_profiles (
  workspace_id uuid not null,
  user_id uuid not null,
  languages text[] not null default '{en}',
  areas text[] not null default '{}',
  max_open_leads smallint not null default 40 check (max_open_leads between 1 and 1000),
  available boolean not null default true,
  top_performer boolean not null default false,
  alert_phone text check (char_length(alert_phone) <= 40),
  -- {"mon": [["10:00","17:00"]], ...} for viewings and calls the AI may book
  availability jsonb not null default '{"mon":[["10:00","17:00"]],"tue":[["10:00","17:00"]],"wed":[["10:00","17:00"]],"thu":[["10:00","17:00"]],"fri":[["10:00","17:00"]],"sat":[["10:00","14:00"]],"sun":[]}'::jsonb,
  last_assigned_at timestamptz,
  primary key (workspace_id, user_id),
  foreign key (workspace_id, user_id) references public.workspace_members (workspace_id, user_id) on delete cascade
);

-- ── Lead fields for the growth engine ───────────────────────────────────
alter table public.leads
  add column language text check (char_length(language) <= 12),
  add column intent text check (intent in ('buyer', 'seller', 'investor', 'renter', 'unknown')),
  add column score_reason text check (char_length(score_reason) <= 600),
  add column channel text not null default 'manual' check (channel in ('manual', 'website', 'meta', 'google', 'tiktok', 'snapchat', 'portal', 'whatsapp', 'email', 'phone')),
  add column campaign text check (char_length(campaign) <= 200),
  add column external_ref text check (char_length(external_ref) <= 200),
  add column consent_whatsapp boolean not null default false,
  add column consent_email boolean not null default false,
  add column opted_out boolean not null default false,
  add column ai_mode text not null default 'ai' check (ai_mode in ('ai', 'human', 'paused')),
  add column handover_reason text check (char_length(handover_reason) <= 300),
  add column timezone text check (char_length(timezone) <= 64),
  add column last_inbound_at timestamptz,
  add column last_outbound_at timestamptz,
  add column agent_session_id text check (char_length(agent_session_id) <= 80);
create unique index leads_external_ref_idx on public.leads (workspace_id, channel, external_ref) where external_ref is not null;
create index leads_phone_idx on public.leads (workspace_id, phone);
create index leads_email_idx on public.leads (workspace_id, lower(email));

-- Agents may take over or hand back a conversation and record why.
grant update (ai_mode, handover_reason, language) on public.leads to authenticated;

-- ── Conversation log ────────────────────────────────────────────────────
create table public.messages (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  channel text not null check (channel in ('whatsapp', 'email', 'voice', 'sms', 'web', 'note')),
  direction text not null check (direction in ('in', 'out')),
  author text not null check (author in ('lead', 'ai', 'agent', 'system')),
  author_id uuid default auth.uid() references auth.users (id) on delete set null,
  subject text check (char_length(subject) <= 300),
  body text not null check (char_length(body) <= 8000),
  media jsonb,
  status text not null default 'queued' check (status in ('queued', 'sent', 'delivered', 'read', 'failed', 'sandbox', 'received')),
  provider_id text check (char_length(provider_id) <= 200),
  error text check (char_length(error) <= 1000),
  created_at timestamptz not null default now()
);
create index messages_lead_idx on public.messages (lead_id, created_at);
create index messages_workspace_idx on public.messages (workspace_id, created_at desc);
create unique index messages_provider_idx on public.messages (provider_id) where provider_id is not null;

-- ── Inventory ───────────────────────────────────────────────────────────
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  developer text check (char_length(developer) <= 160),
  area text check (char_length(area) <= 120),
  city text check (char_length(city) <= 80),
  status text not null default 'off_plan' check (status in ('off_plan', 'ready', 'sold_out')),
  handover text check (char_length(handover) <= 60),
  description text check (char_length(description) <= 4000),
  amenities text[] not null default '{}',
  brochure_path text check (char_length(brochure_path) <= 400),
  source text not null default 'manual' check (source in ('manual', 'csv', 'feed', 'pdf')),
  external_ref text check (char_length(external_ref) <= 200),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index projects_workspace_idx on public.projects (workspace_id);
create unique index projects_external_idx on public.projects (workspace_id, external_ref) where external_ref is not null;

create table public.units (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  unit_type text not null check (char_length(unit_type) between 1 and 80),
  beds numeric(3, 1) check (beds >= 0),
  size_sqft integer check (size_sqft > 0),
  price_from numeric(14, 0) check (price_from >= 0),
  price_to numeric(14, 0) check (price_to >= 0),
  available integer check (available >= 0),
  notes text check (char_length(notes) <= 1000)
);
create index units_project_idx on public.units (project_id);

create table public.payment_plans (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  summary text check (char_length(summary) <= 1000),
  -- [{"milestone": "On booking", "percent": 20}, ...]
  schedule jsonb not null default '[]'::jsonb,
  post_handover boolean not null default false
);
create index payment_plans_project_idx on public.payment_plans (project_id);

-- ── Appointments (built-in calendar) ────────────────────────────────────
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  agent_id uuid references auth.users (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  kind text not null default 'viewing' check (kind in ('viewing', 'call', 'meeting')),
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  location text check (char_length(location) <= 300),
  notes text check (char_length(notes) <= 1000),
  status text not null default 'booked' check (status in ('booked', 'cancelled', 'done', 'no_show')),
  created_by_ai boolean not null default false,
  created_at timestamptz not null default now()
);
create index appointments_agent_idx on public.appointments (agent_id, starts_at);
create index appointments_workspace_idx on public.appointments (workspace_id, starts_at);

-- ── Notifications (in-app; alerts are also pushed by WhatsApp/email) ────
create table public.notifications (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete cascade,
  kind text not null check (kind in ('new_lead', 'hot_lead', 'handover', 'booking', 'reply', 'system')),
  body text not null check (char_length(body) <= 1000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

-- ── Job queue (server worker only) ──────────────────────────────────────
create table public.jobs (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete cascade,
  kind text not null check (kind in ('first_contact', 'ai_reply', 'followup', 'rescore', 'alert', 'feed_sync')),
  payload jsonb not null default '{}'::jsonb,
  run_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'running', 'done', 'failed', 'cancelled')),
  attempts smallint not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index jobs_due_idx on public.jobs (run_at) where status = 'pending';
create index jobs_lead_idx on public.jobs (lead_id, kind) where status = 'pending';

-- Claim due jobs atomically. SKIP LOCKED lets several workers run without double-sending.
-- SECURITY INVOKER and executable only by service_role, so it never bypasses RLS for app users.
create or replace function public.claim_due_jobs(max_jobs integer default 20)
returns setof public.jobs
language sql security invoker set search_path = ''
as $$
  update public.jobs j set status = 'running', attempts = j.attempts + 1, updated_at = now()
  where j.id in (
    select id from public.jobs
    where status = 'pending' and run_at <= now()
    order by run_at
    limit greatest(1, least(max_jobs, 100))
    for update skip locked
  )
  returning j.*;
$$;
revoke all on function public.claim_due_jobs(integer) from public, anon, authenticated;

-- ── Triggers ────────────────────────────────────────────────────────────
create or replace function private.handle_new_workspace_settings()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.workspace_settings (workspace_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;
create trigger on_workspace_settings
  after insert on public.workspaces
  for each row execute function private.handle_new_workspace_settings();

create or replace function private.handle_new_member_profile()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.member_profiles (workspace_id, user_id) values (new.workspace_id, new.user_id) on conflict do nothing;
  return new;
end;
$$;
create trigger on_member_profile
  after insert on public.workspace_members
  for each row execute function private.handle_new_member_profile();

-- Agents edit their own languages, areas, availability and alert phone, but only owners/managers may
-- change capacity or the top-performer flag (both affect who gets hot leads).
create or replace function private.guard_member_profile()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if (new.top_performer is distinct from old.top_performer or new.max_open_leads is distinct from old.max_open_leads)
     and (select auth.uid()) is not null
     and not private.has_role(new.workspace_id, '{owner,manager}') then
    raise exception 'Only owners and managers can change capacity or top-performer status' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger guard_member_profile
  before update on public.member_profiles
  for each row execute function private.guard_member_profile();

-- Backfill for workspaces and members created before this migration.
insert into public.workspace_settings (workspace_id) select id from public.workspaces on conflict do nothing;
insert into public.member_profiles (workspace_id, user_id) select workspace_id, user_id from public.workspace_members on conflict do nothing;

-- ── Row level security ──────────────────────────────────────────────────
alter table public.workspace_settings enable row level security;
alter table public.member_profiles enable row level security;
alter table public.messages enable row level security;
alter table public.projects enable row level security;
alter table public.units enable row level security;
alter table public.payment_plans enable row level security;
alter table public.appointments enable row level security;
alter table public.notifications enable row level security;
alter table public.jobs enable row level security;

create policy "settings: members read" on public.workspace_settings for select to authenticated
  using (private.is_member(workspace_id));
create policy "settings: owners and managers edit" on public.workspace_settings for update to authenticated
  using (private.has_role(workspace_id, '{owner,manager}')) with check (private.has_role(workspace_id, '{owner,manager}'));

create policy "profiles: members read" on public.member_profiles for select to authenticated
  using (private.is_member(workspace_id));
create policy "profiles: self or managers edit" on public.member_profiles for update to authenticated
  using (user_id = (select auth.uid()) or private.has_role(workspace_id, '{owner,manager}'))
  with check (user_id = (select auth.uid()) or private.has_role(workspace_id, '{owner,manager}'));

create policy "messages: read with the lead" on public.messages for select to authenticated
  using (exists (select 1 from public.leads l where l.id = lead_id and l.workspace_id = messages.workspace_id));
create policy "messages: agents write as themselves" on public.messages for insert to authenticated
  with check (
    author = 'agent' and direction = 'out' and author_id = (select auth.uid())
    and exists (select 1 from public.leads l where l.id = lead_id and l.workspace_id = messages.workspace_id)
  );

create policy "projects: members read" on public.projects for select to authenticated using (private.is_member(workspace_id));
create policy "projects: managers write" on public.projects for all to authenticated
  using (private.has_role(workspace_id, '{owner,manager}')) with check (private.has_role(workspace_id, '{owner,manager}'));
create policy "units: members read" on public.units for select to authenticated using (private.is_member(workspace_id));
create policy "units: managers write" on public.units for all to authenticated
  using (private.has_role(workspace_id, '{owner,manager}'))
  with check (private.has_role(workspace_id, '{owner,manager}') and exists (select 1 from public.projects p where p.id = project_id and p.workspace_id = units.workspace_id));
create policy "plans: members read" on public.payment_plans for select to authenticated using (private.is_member(workspace_id));
create policy "plans: managers write" on public.payment_plans for all to authenticated
  using (private.has_role(workspace_id, '{owner,manager}'))
  with check (private.has_role(workspace_id, '{owner,manager}') and exists (select 1 from public.projects p where p.id = project_id and p.workspace_id = payment_plans.workspace_id));

create policy "appointments: read with the lead or own" on public.appointments for select to authenticated
  using (agent_id = (select auth.uid()) or exists (select 1 from public.leads l where l.id = lead_id and l.workspace_id = appointments.workspace_id));
create policy "appointments: book for visible leads" on public.appointments for insert to authenticated
  with check (
    exists (select 1 from public.leads l where l.id = lead_id and l.workspace_id = appointments.workspace_id)
    and (agent_id = (select auth.uid()) or private.has_role(workspace_id, '{owner,manager}'))
    and created_by_ai = false
  );
create policy "appointments: own or managers update" on public.appointments for update to authenticated
  using (agent_id = (select auth.uid()) or private.has_role(workspace_id, '{owner,manager}'))
  with check (agent_id = (select auth.uid()) or private.has_role(workspace_id, '{owner,manager}'));

create policy "notifications: own" on public.notifications for select to authenticated using (user_id = (select auth.uid()));
create policy "notifications: mark own read" on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
-- jobs: RLS on, no policies, no grants. Only the service role (server worker) touches it.

-- ── Grants ──────────────────────────────────────────────────────────────
revoke all on public.workspace_settings, public.member_profiles, public.messages, public.projects, public.units,
  public.payment_plans, public.appointments, public.notifications, public.jobs from anon, authenticated;

grant select on public.workspace_settings to authenticated;
grant update (assistant_name, timezone, office_hours, holidays, ai_enabled, sandbox_mode, quiet_start, quiet_end,
  followup_days, escalate_score, first_contact_delay_s, whatsapp_phone_number_id, whatsapp_template, email_from,
  voice_from, meta_page_id) on public.workspace_settings to authenticated;
grant select, update (languages, areas, max_open_leads, available, top_performer, alert_phone, availability) on public.member_profiles to authenticated;
grant select, insert (workspace_id, lead_id, channel, direction, author, subject, body) on public.messages to authenticated;
grant select, insert, update, delete on public.projects, public.units, public.payment_plans to authenticated;
grant select, insert (workspace_id, lead_id, agent_id, project_id, kind, starts_at, ends_at, location, notes),
  update (agent_id, project_id, kind, starts_at, ends_at, location, notes, status) on public.appointments to authenticated;
grant select, update (read_at) on public.notifications to authenticated;
-- The server worker uses the secret key (service_role). New tables are not auto-exposed, so grant explicitly.
grant all on public.workspace_settings, public.member_profiles, public.messages, public.projects, public.units,
  public.payment_plans, public.appointments, public.notifications, public.jobs to service_role;
grant all on public.workspaces, public.workspace_members, public.leads, public.activities, public.profiles,
  public.invitations, public.demo_requests to service_role;
grant usage on all sequences in schema public to service_role;
grant execute on function public.claim_due_jobs(integer) to service_role;

-- ── Scheduler: pg_cron calls the app's worker every minute (Supabase only) ──
-- Reads the worker URL and shared secret from Supabase Vault (names: observer_worker_url, observer_worker_secret).
-- Skipped automatically on plain Postgres (local tests) where these extensions don't exist.
do $outer$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron')
     and exists (select 1 from pg_available_extensions where name = 'pg_net') then
    create extension if not exists pg_cron;
    create extension if not exists pg_net with schema extensions;
    execute $fn$
      create or replace function private.ping_worker()
      returns void language plpgsql security definer set search_path = ''
      as $body$
      declare url text; secret text;
      begin
        select decrypted_secret into url from vault.decrypted_secrets where name = 'observer_worker_url';
        select decrypted_secret into secret from vault.decrypted_secrets where name = 'observer_worker_secret';
        if url is null or secret is null then return; end if;
        if not exists (select 1 from public.jobs where status = 'pending' and run_at <= now()) then return; end if;
        perform net.http_post(url := url, headers := jsonb_build_object('Authorization', 'Bearer ' || secret, 'Content-Type', 'application/json'), body := '{}'::jsonb);
      end;
      $body$;
    $fn$;
    perform cron.schedule('observer-worker', '* * * * *', 'select private.ping_worker()');
  end if;
end
$outer$;

-- ── Brochure storage (private bucket; path = <workspace_id>/<file>) ─────
-- Guarded so the migration also runs on plain Postgres in CI, where the storage schema doesn't exist.
do $$
begin
  if to_regclass('storage.buckets') is null then return; end if;
  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('brochures', 'brochures', false, 26214400, array['application/pdf', 'image/jpeg', 'image/png'])
    on conflict (id) do nothing;
  execute $p$create policy "members read brochures" on storage.objects for select to authenticated
    using (bucket_id = 'brochures' and private.is_member(((storage.foldername(name))[1])::uuid))$p$;
  execute $p$create policy "managers upload brochures" on storage.objects for insert to authenticated
    with check (bucket_id = 'brochures' and private.has_role(((storage.foldername(name))[1])::uuid, array['owner','manager']::public.member_role[]))$p$;
  execute $p$create policy "managers delete brochures" on storage.objects for delete to authenticated
    using (bucket_id = 'brochures' and private.has_role(((storage.foldername(name))[1])::uuid, array['owner','manager']::public.member_role[]))$p$;
end $$;
