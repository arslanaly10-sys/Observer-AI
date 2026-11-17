-- Observer AI: workspaces, roles, leads, activity, invitations, demo requests.
--
-- Access model
--   * Every brokerage is a workspace. Members are owner, manager or agent.
--   * Owners and managers see every lead in their workspace. Agents see leads assigned to them
--     plus the unassigned pool, and can only edit their own.
--   * Only owners manage members and workspace settings. Owners and managers send invitations.
--   * The public website can insert demo requests but never read them.
--
-- Security notes (see the Supabase security checklist)
--   * RLS is on for every table in the exposed `public` schema; new tables are not auto-exposed
--     (Apr 2026 change), so every grant below is explicit and RLS still applies on top.
--   * Membership checks live in SECURITY DEFINER helpers inside the unexposed `private` schema,
--     so policies don't recurse through workspace_members' own RLS. They only read membership.
--   * Authorization never reads user_metadata.

create extension if not exists pgcrypto with schema extensions;

-- ── Types ────────────────────────────────────────────────────────────────
create type public.member_role as enum ('owner', 'manager', 'agent');
create type public.lead_stage as enum ('new', 'qualified', 'meeting', 'offer', 'won', 'lost');
create type public.lead_temp as enum ('hot', 'warm', 'cold');
create type public.lead_type as enum ('buyer', 'seller');

-- ── Tables ───────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (char_length(full_name) <= 120),
  locale text not null default 'en' check (locale in ('en', 'ar')),
  created_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  city text check (char_length(city) <= 80),
  created_by uuid not null default auth.uid() references auth.users (id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.member_role not null default 'agent',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
create index workspace_members_user_idx on public.workspace_members (user_id);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  role public.member_role not null default 'agent' check (role <> 'owner'),
  token uuid not null default gen_random_uuid() unique,
  invited_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
  accepted_at timestamptz,
  expires_at timestamptz not null default now() + interval '14 days',
  created_at timestamptz not null default now(),
  unique (workspace_id, email)
);
create index invitations_workspace_idx on public.invitations (workspace_id);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  assigned_to uuid references auth.users (id) on delete set null,
  name text not null check (char_length(name) between 1 and 120),
  phone text check (char_length(phone) <= 40),
  email text check (char_length(email) <= 254),
  type public.lead_type not null default 'buyer',
  source text not null default 'Website' check (char_length(source) <= 40),
  budget_aed numeric(14, 0) check (budget_aed >= 0),
  area text check (char_length(area) <= 80),
  timeframe text check (char_length(timeframe) <= 20),
  financing text check (financing in ('Cash', 'Mortgage', 'N/A', 'Unknown')),
  serious boolean not null default true,
  stage public.lead_stage not null default 'new',
  score smallint not null default 0 check (score between 0 and 100),
  temp public.lead_temp not null default 'warm',
  notes text check (char_length(notes) <= 4000),
  created_by uuid not null default auth.uid() references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index leads_workspace_idx on public.leads (workspace_id, score desc);
create index leads_assigned_idx on public.leads (assigned_to);
create index leads_created_by_idx on public.leads (created_by);

create table public.activities (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  actor_id uuid default auth.uid() references auth.users (id) on delete set null,
  kind text not null check (kind in ('created', 'stage', 'assigned', 'note', 'call', 'message')),
  body text check (char_length(body) <= 2000),
  created_at timestamptz not null default now()
);
create index activities_lead_idx on public.activities (lead_id, created_at desc);
create index activities_workspace_idx on public.activities (workspace_id, created_at desc);

create table public.demo_requests (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 120),
  company text not null check (char_length(company) between 1 and 160),
  role text check (char_length(role) <= 80),
  phone text not null check (char_length(phone) between 4 and 40),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  team_size text check (char_length(team_size) <= 20),
  message text check (char_length(message) <= 2000),
  locale text check (locale in ('en', 'ar')),
  created_at timestamptz not null default now()
);

-- ── Private helpers (unexposed schema) ───────────────────────────────────
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_member(ws uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.workspace_members m
    where m.workspace_id = ws and m.user_id = (select auth.uid())
  );
$$;

create or replace function private.has_role(ws uuid, roles public.member_role[])
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.workspace_members m
    where m.workspace_id = ws and m.user_id = (select auth.uid()) and m.role = any (roles)
  );
$$;

create or replace function private.shares_workspace(other uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.workspace_members a
    join public.workspace_members b on b.workspace_id = a.workspace_id
    where a.user_id = (select auth.uid()) and b.user_id = other
  );
$$;

revoke all on all functions in schema private from public;
grant execute on function private.is_member(uuid) to authenticated;
grant execute on function private.has_role(uuid, public.member_role[]) to authenticated;
grant execute on function private.shares_workspace(uuid) to authenticated;

-- ── Triggers ─────────────────────────────────────────────────────────────
-- New auth user → profile row (name from sign-up metadata is display data only, never authorization).
create or replace function private.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)), 120))
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- New workspace → its creator becomes the owner.
create or replace function private.handle_new_workspace()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;
create trigger on_workspace_created
  after insert on public.workspaces
  for each row execute function private.handle_new_workspace();

-- A workspace must always keep at least one owner.
create or replace function private.keep_an_owner()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare ws uuid := coalesce(old.workspace_id, new.workspace_id);
begin
  if old.role = 'owner' and (tg_op = 'DELETE' or new.role <> 'owner') then
    if not exists (
      select 1 from public.workspace_members
      where workspace_id = ws and role = 'owner' and user_id <> old.user_id
    ) and exists (select 1 from public.workspaces where id = ws) then
      raise exception 'A workspace needs at least one owner' using errcode = 'P0001';
    end if;
  end if;
  return coalesce(new, old);
end;
$$;
create trigger keep_an_owner
  before update or delete on public.workspace_members
  for each row execute function private.keep_an_owner();

-- Keep updated_at fresh; stop leads moving between workspaces.
create or replace function private.touch_lead()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  if new.workspace_id <> old.workspace_id then
    raise exception 'Leads cannot move between workspaces' using errcode = 'P0001';
  end if;
  new.updated_at := now();
  return new;
end;
$$;
create trigger touch_lead
  before update on public.leads
  for each row execute function private.touch_lead();

-- ── Row level security ──────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.invitations enable row level security;
alter table public.leads enable row level security;
alter table public.activities enable row level security;
alter table public.demo_requests enable row level security;

-- profiles
create policy "profiles: read self and teammates" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or private.shares_workspace(id));
create policy "profiles: update self" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- workspaces
create policy "workspaces: members read" on public.workspaces for select to authenticated
  using (private.is_member(id) or created_by = (select auth.uid()));
create policy "workspaces: anyone signed in can create their own" on public.workspaces for insert to authenticated
  with check (created_by = (select auth.uid()));
create policy "workspaces: owners update" on public.workspaces for update to authenticated
  using (private.has_role(id, '{owner}')) with check (private.has_role(id, '{owner}'));
create policy "workspaces: owners delete" on public.workspaces for delete to authenticated
  using (private.has_role(id, '{owner}'));

-- workspace_members (rows are added by the workspace trigger or by accept_invitation)
create policy "members: members read" on public.workspace_members for select to authenticated
  using (private.is_member(workspace_id));
create policy "members: owners change roles" on public.workspace_members for update to authenticated
  using (private.has_role(workspace_id, '{owner}')) with check (private.has_role(workspace_id, '{owner}'));
create policy "members: owners remove, anyone leaves" on public.workspace_members for delete to authenticated
  using (private.has_role(workspace_id, '{owner}') or user_id = (select auth.uid()));

-- invitations
create policy "invitations: owners and managers read" on public.invitations for select to authenticated
  using (private.has_role(workspace_id, '{owner,manager}'));
create policy "invitations: owners and managers invite" on public.invitations for insert to authenticated
  with check (
    private.has_role(workspace_id, '{owner,manager}')
    and invited_by = (select auth.uid())
    and (role = 'agent' or private.has_role(workspace_id, '{owner}'))
  );
create policy "invitations: owners and managers revoke" on public.invitations for delete to authenticated
  using (private.has_role(workspace_id, '{owner,manager}'));

-- leads
create policy "leads: managers see all, agents see theirs and the pool" on public.leads for select to authenticated
  using (
    private.has_role(workspace_id, '{owner,manager}')
    or (private.is_member(workspace_id) and (assigned_to = (select auth.uid()) or assigned_to is null))
  );
create policy "leads: members add" on public.leads for insert to authenticated
  with check (
    private.is_member(workspace_id)
    and created_by = (select auth.uid())
    and (
      private.has_role(workspace_id, '{owner,manager}')
      or assigned_to is null or assigned_to = (select auth.uid())
    )
  );
create policy "leads: managers edit all, agents edit theirs" on public.leads for update to authenticated
  using (
    private.has_role(workspace_id, '{owner,manager}')
    or (private.is_member(workspace_id) and (assigned_to = (select auth.uid()) or assigned_to is null))
  )
  with check (
    private.has_role(workspace_id, '{owner,manager}')
    or (private.is_member(workspace_id) and assigned_to = (select auth.uid()))
  );
create policy "leads: managers delete" on public.leads for delete to authenticated
  using (private.has_role(workspace_id, '{owner,manager}'));

-- activities (visible when the lead is visible; RLS on leads applies inside the subquery)
create policy "activities: read with the lead" on public.activities for select to authenticated
  using (exists (select 1 from public.leads l where l.id = lead_id));
create policy "activities: members write their own" on public.activities for insert to authenticated
  with check (
    actor_id = (select auth.uid())
    and exists (select 1 from public.leads l where l.id = lead_id and l.workspace_id = activities.workspace_id)
  );

-- demo_requests: write-only from the website
create policy "demo requests: website can submit" on public.demo_requests for insert to anon, authenticated
  with check (true);

-- ── Accept an invitation ────────────────────────────────────────────────
-- SECURITY DEFINER is needed because the invitee is not yet a member, so RLS would hide the
-- invitation. It checks auth.uid() and that the signed-in email matches the invitation, and is
-- executable by signed-in users only.
create or replace function public.accept_invitation(invite_token uuid)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  inv public.invitations;
  me uuid := (select auth.uid());
  my_email text;
begin
  if me is null then
    raise exception 'Sign in to accept this invitation' using errcode = '42501';
  end if;
  select email into my_email from auth.users where id = me;
  select * into inv from public.invitations where token = invite_token for update;
  if inv.id is null or inv.accepted_at is not null or inv.expires_at < now() then
    raise exception 'This invitation is no longer valid' using errcode = 'P0002';
  end if;
  if lower(inv.email) <> lower(my_email) then
    raise exception 'This invitation was sent to a different email address' using errcode = '42501';
  end if;
  insert into public.workspace_members (workspace_id, user_id, role)
  values (inv.workspace_id, me, inv.role)
  on conflict (workspace_id, user_id) do nothing;
  update public.invitations set accepted_at = now() where id = inv.id;
  return inv.workspace_id;
end;
$$;
revoke all on function public.accept_invitation(uuid) from public, anon;
grant execute on function public.accept_invitation(uuid) to authenticated;

-- ── Grants (tables are not exposed to the Data API automatically) ───────
revoke all on public.profiles, public.workspaces, public.workspace_members, public.invitations,
  public.leads, public.activities, public.demo_requests from anon, authenticated;

grant select, update (full_name, locale) on public.profiles to authenticated;
grant select, insert (name, city), update (name, city), delete on public.workspaces to authenticated;
grant select, update (role), delete on public.workspace_members to authenticated;
grant select, insert (workspace_id, email, role), delete on public.invitations to authenticated;
grant select, delete on public.leads to authenticated;
grant insert (workspace_id, assigned_to, name, phone, email, type, source, budget_aed, area, timeframe, financing, serious, stage, score, temp, notes)
  on public.leads to authenticated;
grant update (assigned_to, name, phone, email, type, source, budget_aed, area, timeframe, financing, serious, stage, score, temp, notes)
  on public.leads to authenticated;
grant select, insert (workspace_id, lead_id, kind, body) on public.activities to authenticated;
grant insert (name, company, role, phone, email, team_size, message, locale) on public.demo_requests to anon, authenticated;
