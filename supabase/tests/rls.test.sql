-- RLS tests for the Observer schema. Each block impersonates a user the way the Data API does
-- (role + request.jwt.claims) and asserts what that user can and cannot do.
-- Run with supabase/tests/run-local.sh (plain Postgres + auth shim).
\set ON_ERROR_STOP on
\set QUIET on
set client_min_messages = notice;

insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'omar@a.test', '{"full_name":"Omar Owner"}'),
  ('00000000-0000-0000-0000-00000000000b', 'mona@a.test', '{"full_name":"Mona Manager"}'),
  ('00000000-0000-0000-0000-00000000000c', 'ali@a.test',  '{"full_name":"Ali Agent"}'),
  ('00000000-0000-0000-0000-00000000000d', 'dina@a.test', '{"full_name":"Dina Agent"}'),
  ('00000000-0000-0000-0000-00000000000e', 'eve@b.test',  '{"full_name":"Eve Elsewhere"}');

create function public.t_as(uid text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
end $$;
create function public.t_check(ok boolean, label text) returns void language plpgsql as $$
begin
  if coalesce(ok, false) then raise notice 'PASS  %', label; else raise exception 'FAIL  %', label; end if;
end $$;
grant execute on function public.t_as(text), public.t_check(boolean, text) to authenticated, anon;

\set omar '00000000-0000-0000-0000-00000000000a'
\set mona '00000000-0000-0000-0000-00000000000b'
\set ali  '00000000-0000-0000-0000-00000000000c'
\set dina '00000000-0000-0000-0000-00000000000d'
\set eve  '00000000-0000-0000-0000-00000000000e'

select t_check((select count(*) from public.profiles) = 5, 'a profile is created for every new user');
select t_check((select full_name from public.profiles where id = :'ali') = 'Ali Agent', 'profile takes the sign-up name');

-- ── Workspaces ─────────────────────────────────────────────────────────
begin; select t_as(:'omar');
insert into public.workspaces (name, city) values ('Meridian', 'Dubai');
select t_check((select role from public.workspace_members where user_id = auth.uid()) = 'owner', 'creator becomes owner');
commit;
begin; select t_as(:'eve');
insert into public.workspaces (name) values ('Elsewhere');
commit;
select id as ws_a from public.workspaces where name = 'Meridian' \gset
select id as ws_b from public.workspaces where name = 'Elsewhere' \gset

begin; select t_as(:'eve');
select t_check((select count(*) from public.workspaces) = 1, 'a user sees only their own workspaces');
select t_check(not exists (select 1 from public.workspaces where id = :'ws_a'), 'outsider cannot see workspace A');
update public.workspaces set name = 'Hijacked' where id = :'ws_a';
rollback;
select t_check((select name from public.workspaces where id = :'ws_a') = 'Meridian', 'outsider cannot rename workspace A');

begin; select t_as(:'omar');
do $$ begin
  insert into public.workspaces (name, created_by) values ('Spoof', '00000000-0000-0000-0000-00000000000e');
  raise exception 'FAIL  created a workspace for someone else';
exception when insufficient_privilege then raise notice 'PASS  cannot create a workspace on someone else''s behalf';
end $$;
rollback;

-- ── Invitations ────────────────────────────────────────────────────────
begin; select t_as(:'omar');
insert into public.invitations (workspace_id, email, role) values (:'ws_a', 'mona@a.test', 'manager');
insert into public.invitations (workspace_id, email, role) values (:'ws_a', 'ali@a.test', 'agent');
insert into public.invitations (workspace_id, email, role) values (:'ws_a', 'dina@a.test', 'agent');
commit;
select token as mona_tok from public.invitations where email = 'mona@a.test' \gset
select token as ali_tok from public.invitations where email = 'ali@a.test' \gset
select token as dina_tok from public.invitations where email = 'dina@a.test' \gset

begin; select t_as(:'eve');
select t_check((select count(*) from public.invitations) = 0, 'outsider cannot read workspace A''s invitations');
do $$ begin
  insert into public.invitations (workspace_id, email, role)
    values ((select id from public.workspaces limit 0), 'x@y.z', 'agent');
exception when others then null; end $$;
rollback;

begin; select t_as(:'eve');
\set ON_ERROR_STOP off
select public.accept_invitation(:'mona_tok');
\set ON_ERROR_STOP on
rollback;
select t_check(not exists (select 1 from public.workspace_members where user_id = :'eve' and workspace_id = :'ws_a'),
  'an invitation cannot be used by a different email');

begin; select t_as(:'mona'); select public.accept_invitation(:'mona_tok'); commit;
begin; select t_as(:'ali');  select public.accept_invitation(:'ali_tok');  commit;
begin; select t_as(:'dina'); select public.accept_invitation(:'dina_tok'); commit;
select t_check((select role from public.workspace_members where user_id = :'mona') = 'manager', 'invitee joins with the invited role');
select t_check((select accepted_at is not null from public.invitations where token = :'ali_tok'), 'invitation is marked accepted');

begin; select t_as(:'ali');
\set ON_ERROR_STOP off
select public.accept_invitation(:'ali_tok');
\set ON_ERROR_STOP on
rollback;
select t_check((select count(*) from public.workspace_members where user_id = :'ali') = 1, 'an invitation works only once');

begin; select t_as(:'mona');
do $$ begin
  insert into public.invitations (workspace_id, email, role)
    values ((select workspace_id from public.workspace_members where user_id = auth.uid()), 'boss@a.test', 'manager');
  raise exception 'FAIL  manager invited a manager';
exception when insufficient_privilege then raise notice 'PASS  managers can invite agents only';
end $$;
insert into public.invitations (workspace_id, email, role)
  values ((select workspace_id from public.workspace_members where user_id = auth.uid()), 'new.agent@a.test', 'agent');
select t_check(true, 'managers can invite agents');
rollback;

begin; select t_as(:'ali');
select t_check((select count(*) from public.invitations) = 0, 'agents cannot see invitations');
rollback;

-- ── Roles ──────────────────────────────────────────────────────────────
begin; select t_as(:'mona');
update public.workspace_members set role = 'owner' where user_id = auth.uid();
rollback;
select t_check((select role from public.workspace_members where user_id = :'mona') = 'manager', 'a manager cannot promote themselves');

begin; select t_as(:'omar');
\set ON_ERROR_STOP off
delete from public.workspace_members where user_id = auth.uid();
\set ON_ERROR_STOP on
rollback;
select t_check(exists (select 1 from public.workspace_members where user_id = :'omar' and role = 'owner'), 'the last owner cannot leave');

begin; select t_as(:'ali');
select t_check((select count(*) from public.workspace_members) = 4, 'members see their teammates');
select t_check((select count(*) from public.profiles) = 4, 'members see teammates'' profiles, not outsiders''');
rollback;

-- ── Leads ──────────────────────────────────────────────────────────────
begin; select t_as(:'omar');
insert into public.leads (workspace_id, name, score, temp, assigned_to) values
  (:'ws_a', 'Lead for Ali', 87, 'hot', :'ali'),
  (:'ws_a', 'Lead for Dina', 70, 'warm', :'dina'),
  (:'ws_a', 'Unassigned lead', 40, 'cold', null);
commit;
begin; select t_as(:'eve');
insert into public.leads (workspace_id, name) values (:'ws_b', 'Eve''s lead');
commit;

begin; select t_as(:'mona');
select t_check((select count(*) from public.leads) = 3, 'a manager sees every lead in the workspace');
rollback;
begin; select t_as(:'ali');
select t_check((select count(*) from public.leads) = 2, 'an agent sees their leads and the unassigned pool');
select t_check(not exists (select 1 from public.leads where name = 'Lead for Dina'), 'an agent cannot see a colleague''s lead');
update public.leads set notes = 'tampered' where name = 'Lead for Dina';
rollback;
select t_check((select notes from public.leads where name = 'Lead for Dina') is null, 'an agent cannot edit a colleague''s lead');

begin; select t_as(:'ali');
update public.leads set assigned_to = auth.uid() where name = 'Unassigned lead';
select t_check((select assigned_to from public.leads where name = 'Unassigned lead') = auth.uid(), 'an agent can claim an unassigned lead');
rollback;

begin; select t_as(:'ali');
do $$ begin
  update public.leads set assigned_to = '00000000-0000-0000-0000-00000000000d' where name = 'Lead for Ali';
  raise exception 'FAIL  agent handed a lead to someone else';
exception when insufficient_privilege then raise notice 'PASS  an agent cannot reassign a lead to a colleague';
end $$;
rollback;

begin; select t_as(:'ali');
do $$ begin
  insert into public.leads (workspace_id, name, assigned_to)
    values ((select workspace_id from public.workspace_members where user_id = auth.uid()), 'Sneaky', '00000000-0000-0000-0000-00000000000d');
  raise exception 'FAIL  agent created a lead for a colleague';
exception when insufficient_privilege then raise notice 'PASS  an agent cannot create leads for a colleague';
end $$;
insert into public.leads (workspace_id, name, assigned_to)
  values ((select workspace_id from public.workspace_members where user_id = auth.uid()), 'Ali''s own', auth.uid());
select t_check(true, 'an agent can add their own lead');
delete from public.leads where name = 'Lead for Ali';
select t_check(exists (select 1 from public.leads where name = 'Lead for Ali'), 'an agent cannot delete leads');
rollback;

begin; select t_as(:'ali');
do $$ begin
  update public.leads set workspace_id = (select id from public.workspaces where name = 'Elsewhere') where name = 'Lead for Ali';
  raise exception 'FAIL  moved a lead between workspaces';
exception when insufficient_privilege then raise notice 'PASS  a lead cannot be moved to another workspace';
end $$;
rollback;

begin; select t_as(:'eve');
select t_check((select count(*) from public.leads) = 1, 'an outsider sees none of workspace A''s leads');
select set_config('test.ws_a', :'ws_a', true);
do $$ begin
  insert into public.leads (workspace_id, name) values (current_setting('test.ws_a')::uuid, 'Injected');
  raise exception 'FAIL  outsider inserted into workspace A';
exception when insufficient_privilege then raise notice 'PASS  an outsider cannot add leads to workspace A (policy refusal)';
end $$;
rollback;
select t_check(not exists (select 1 from public.leads where name = 'Injected'), 'no lead was injected into workspace A');

begin; select t_as(:'mona');
delete from public.leads where name = 'Unassigned lead';
select t_check(not exists (select 1 from public.leads where name = 'Unassigned lead'), 'a manager can delete leads');
rollback;

-- ── Activities ─────────────────────────────────────────────────────────
begin; select t_as(:'omar');
insert into public.activities (workspace_id, lead_id, kind, body)
  select workspace_id, id, 'note', 'Called, wants Thursday' from public.leads where name = 'Lead for Dina';
commit;
begin; select t_as(:'ali');
select t_check((select count(*) from public.activities) = 0, 'activity on a hidden lead stays hidden');
rollback;
begin; select t_as(:'dina');
select t_check((select count(*) from public.activities) = 1, 'the assigned agent sees the lead''s activity');
rollback;

-- ── Demo requests ──────────────────────────────────────────────────────
begin;
select set_config('role', 'anon', true);
insert into public.demo_requests (name, company, phone, email) values ('Visitor', 'Brokerage LLC', '+971500000000', 'v@b.ae');
select t_check(true, 'the website can submit a demo request');
do $$ begin
  perform count(*) from public.demo_requests;
  raise exception 'FAIL  anon read demo requests';
exception when insufficient_privilege then raise notice 'PASS  the website cannot read demo requests';
end $$;
do $$ begin
  perform count(*) from public.leads;
  raise exception 'FAIL  anon read leads';
exception when insufficient_privilege then raise notice 'PASS  anonymous visitors cannot read leads';
end $$;
rollback;

-- ── Workspace deletion cascades cleanly ────────────────────────────────
begin; select t_as(:'eve');
delete from public.workspaces where name = 'Elsewhere';
select t_check(not exists (select 1 from public.workspaces where name = 'Elsewhere'), 'an owner can delete their workspace');
rollback;

\echo 'ALL RLS TESTS PASSED'
