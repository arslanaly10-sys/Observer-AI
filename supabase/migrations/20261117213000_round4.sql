-- Round 4: routing at scale, inbox "waiting" filter, manual score override, worker health.

-- ── Routing: open-lead counts per agent in one query ────────────────────
create or replace function public.open_lead_counts(ws uuid)
returns table (user_id uuid, open_leads bigint)
language sql stable security invoker set search_path = ''
as $$
  select assigned_to, count(*) from public.leads
  where workspace_id = ws and assigned_to is not null and stage not in ('won', 'lost')
  group by assigned_to;
$$;
revoke all on function public.open_lead_counts(uuid) from public, anon, authenticated;
grant execute on function public.open_lead_counts(uuid) to service_role;
create index if not exists leads_open_assigned_idx on public.leads (workspace_id, assigned_to) where stage not in ('won', 'lost');

-- ── Inbox: direction of the latest message, kept by the same trigger ────
alter table public.leads add column last_message_dir text check (last_message_dir in ('in', 'out'));
update public.leads l set last_message_dir = m.direction
  from (select distinct on (lead_id) lead_id, direction from public.messages order by lead_id, created_at desc) m where m.lead_id = l.id;
create or replace function private.touch_lead_last_message()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  update public.leads set last_message_at = new.created_at, last_message_dir = new.direction
  where id = new.lead_id and (last_message_at is null or last_message_at <= new.created_at);
  return new;
end $$;

-- ── Manual score override ───────────────────────────────────────────────
-- When an agent sets the score by hand, automatic rescoring leaves it alone.
alter table public.leads add column score_locked boolean not null default false;
grant update (score_locked, score_reason) on public.leads to authenticated;

-- ── Worker health ───────────────────────────────────────────────────────
create table public.worker_heartbeat (
  id smallint primary key default 1 check (id = 1),
  last_run_at timestamptz not null default now(),
  last_processed integer not null default 0
);
alter table public.worker_heartbeat enable row level security;
revoke all on public.worker_heartbeat from anon, authenticated;
grant all on public.worker_heartbeat to service_role;

/** What a manager needs to know is broken: last worker run, stuck/failed jobs, failed sends this week. */
create or replace function public.workspace_health(ws uuid)
returns table (last_worker_run timestamptz, overdue_jobs bigint, failed_jobs bigint, failed_messages bigint)
language sql stable security definer set search_path = ''
as $$
  select
    (select last_run_at from public.worker_heartbeat where id = 1),
    (select count(*) from public.jobs where workspace_id = ws and status = 'pending' and run_at < now() - interval '5 minutes'),
    (select count(*) from public.jobs where workspace_id = ws and status = 'failed' and updated_at > now() - interval '7 days'),
    (select count(*) from public.messages where workspace_id = ws and status = 'failed' and created_at > now() - interval '7 days')
  where private.has_role(ws, array['owner', 'manager']::public.member_role[]);
$$;
revoke all on function public.workspace_health(uuid) from public, anon;
grant execute on function public.workspace_health(uuid) to authenticated;

-- ── Plan limits ─────────────────────────────────────────────────────────
-- Leads per calendar month included in the workspace's plan (null = unlimited). Set by billing with the
-- service key only; not in the authenticated update grant, so owners can't raise their own limit.
alter table public.workspace_settings add column monthly_lead_limit integer check (monthly_lead_limit is null or monthly_lead_limit >= 0);
create index if not exists leads_paused_idx on public.leads (created_at) where ai_mode = 'paused';
