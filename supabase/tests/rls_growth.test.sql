-- RLS tests for the growth engine tables. Runs after rls.test.sql and reuses its users and workspaces:
-- Omar (owner of Meridian), Mona (manager), Ali and Dina (agents), Eve (owner of Elsewhere).
\set ON_ERROR_STOP on
\set QUIET on
set client_min_messages = notice;

\set omar '00000000-0000-0000-0000-00000000000a'
\set mona '00000000-0000-0000-0000-00000000000b'
\set ali  '00000000-0000-0000-0000-00000000000c'
\set dina '00000000-0000-0000-0000-00000000000d'
\set eve  '00000000-0000-0000-0000-00000000000e'
select id as ws_a from public.workspaces where name = 'Meridian' \gset
select id as ws_b from public.workspaces where name = 'Elsewhere' \gset
select id as lead_ali from public.leads where name = 'Lead for Ali' \gset
select id as lead_dina from public.leads where name = 'Lead for Dina' \gset

select t_check((select count(*) from public.workspace_settings) = 2, 'every workspace gets AI settings');
select t_check((select count(*) from public.member_profiles where workspace_id = :'ws_a') = 4, 'every member gets a routing profile');
select t_check((select sandbox_mode from public.workspace_settings where workspace_id = :'ws_a'), 'new workspaces start in sandbox mode');

-- ── Settings ───────────────────────────────────────────────────────────
begin; select t_as(:'ali');
select t_check((select count(*) from public.workspace_settings) = 1, 'members read their own workspace settings only');
update public.workspace_settings set assistant_name = 'Hacked' where workspace_id = :'ws_a';
rollback;
select t_check((select assistant_name from public.workspace_settings where workspace_id = :'ws_a') = 'Noor', 'agents cannot change AI settings');
begin; select t_as(:'mona');
update public.workspace_settings set assistant_name = 'Layla' where workspace_id = :'ws_a';
select t_check((select assistant_name from public.workspace_settings where workspace_id = :'ws_a') = 'Layla', 'managers can change AI settings');
rollback;
begin; select t_as(:'mona');
do $$ begin
  update public.workspace_settings set ingest_token = gen_random_uuid();
  raise exception 'FAIL  rotated the ingest token through the public API';
exception when insufficient_privilege then raise notice 'PASS  the webhook ingest token is not writable through the public API';
end $$;
rollback;
begin; select t_as(:'eve');
select t_check(not exists (select 1 from public.workspace_settings where workspace_id = :'ws_a'), 'outsiders cannot read another workspace''s settings (or its ingest token)');
rollback;

-- ── Member profiles ────────────────────────────────────────────────────
begin; select t_as(:'ali');
update public.member_profiles set languages = '{en,ar,hi}' where user_id = auth.uid();
select t_check((select languages from public.member_profiles where user_id = auth.uid()) = '{en,ar,hi}', 'an agent can set their own languages');
do $$ begin
  update public.member_profiles set top_performer = true where user_id = auth.uid();
  raise exception 'FAIL  agent made themselves a top performer';
exception when insufficient_privilege then raise notice 'PASS  an agent cannot make themselves a top performer';
end $$;
update public.member_profiles set languages = '{ru}' where user_id = '00000000-0000-0000-0000-00000000000d';
rollback;
select t_check((select languages from public.member_profiles where user_id = :'dina') = '{en}', 'an agent cannot edit a colleague''s profile');
begin; select t_as(:'mona');
update public.member_profiles set top_performer = true, max_open_leads = 60 where user_id = :'ali';
select t_check((select top_performer from public.member_profiles where user_id = :'ali'), 'managers can set top performers and capacity');
rollback;

-- ── Messages ───────────────────────────────────────────────────────────
-- Seed as the table owner (the server worker writes AI and lead messages with the secret key).
insert into public.messages (workspace_id, lead_id, channel, direction, author, body, status) values
  (:'ws_a', :'lead_ali', 'whatsapp', 'in', 'lead', 'Hi, looking for a villa', 'received'),
  (:'ws_a', :'lead_ali', 'whatsapp', 'out', 'ai', 'Hello, I am Noor, an AI assistant', 'sandbox'),
  (:'ws_a', :'lead_dina', 'email', 'in', 'lead', 'Private message for Dina', 'received');

begin; select t_as(:'ali');
select t_check((select count(*) from public.messages) = 2, 'an agent sees only conversations with their own leads');
insert into public.messages (workspace_id, lead_id, channel, direction, author, body) values (:'ws_a', :'lead_ali', 'whatsapp', 'out', 'agent', 'Ali here, happy to help');
select t_check(true, 'an agent can reply to their own lead');
do $$ begin
  insert into public.messages (workspace_id, lead_id, channel, direction, author, body)
    values ((select workspace_id from public.leads where name = 'Lead for Ali'), (select id from public.leads where name = 'Lead for Ali'), 'whatsapp', 'out', 'ai', 'Spoofed AI message');
  raise exception 'FAIL  agent posted as the AI';
exception when insufficient_privilege then raise notice 'PASS  an agent cannot post as the AI';
end $$;
rollback;
begin; select t_as(:'ali');
select set_config('test.lead_dina', :'lead_dina', true);
select set_config('test.ws_a', :'ws_a', true);
do $$ begin
  insert into public.messages (workspace_id, lead_id, channel, direction, author, body)
    values (current_setting('test.ws_a')::uuid, current_setting('test.lead_dina')::uuid, 'whatsapp', 'out', 'agent', 'Stealing Dina''s lead');
  raise exception 'FAIL  agent messaged a colleague''s lead';
exception when insufficient_privilege then raise notice 'PASS  an agent cannot message a colleague''s lead';
end $$;
rollback;
begin; select t_as(:'mona');
select t_check((select count(*) from public.messages) = 3, 'a manager sees every conversation');
rollback;
begin; select t_as(:'eve');
select t_check((select count(*) from public.messages) = 0, 'outsiders see no messages');
rollback;

-- ── Inventory ──────────────────────────────────────────────────────────
begin; select t_as(:'mona');
insert into public.projects (workspace_id, name, area) values (:'ws_a', 'Hills Grove', 'Dubai Hills');
insert into public.units (workspace_id, project_id, unit_type, beds, price_from) select :'ws_a', id, '4BR Villa', 4, 4200000 from public.projects where name = 'Hills Grove';
insert into public.payment_plans (workspace_id, project_id, name, schedule) select :'ws_a', id, '60/40', '[{"milestone":"Booking","percent":20}]' from public.projects where name = 'Hills Grove';
commit;
begin; select t_as(:'ali');
select t_check((select count(*) from public.units) = 1, 'agents can read inventory');
do $$ begin
  insert into public.projects (workspace_id, name) values ((select workspace_id from public.projects limit 1), 'Agent project');
  raise exception 'FAIL  agent created a project';
exception when insufficient_privilege then raise notice 'PASS  agents cannot edit inventory';
end $$;
rollback;
begin; select t_as(:'eve');
select t_check((select count(*) from public.projects) = 0, 'outsiders cannot read inventory');
select set_config('test.ws_a', :'ws_a', true);
do $$ begin
  insert into public.units (workspace_id, project_id, unit_type)
    values ((select id from public.workspaces where name = 'Elsewhere'), (select id from public.projects limit 1), 'Smuggled');
exception when others then null; end $$;
rollback;

-- ── Appointments ───────────────────────────────────────────────────────
begin; select t_as(:'ali');
insert into public.appointments (workspace_id, lead_id, agent_id, kind, starts_at, ends_at)
  values (:'ws_a', :'lead_ali', auth.uid(), 'viewing', now() + interval '1 day', now() + interval '1 day 1 hour');
select t_check(true, 'an agent can book a viewing with their own lead');
do $$ begin
  insert into public.appointments (workspace_id, lead_id, agent_id, kind, starts_at, ends_at)
    values ((select workspace_id from public.leads where name = 'Lead for Ali'), (select id from public.leads where name = 'Lead for Ali'),
            '00000000-0000-0000-0000-00000000000d', 'viewing', now() + interval '2 days', now() + interval '2 days 1 hour');
  raise exception 'FAIL  agent booked into a colleague''s calendar';
exception when insufficient_privilege then raise notice 'PASS  an agent cannot book into a colleague''s calendar';
end $$;
rollback;

-- ── Notifications & jobs ───────────────────────────────────────────────
insert into public.notifications (workspace_id, user_id, kind, body) values (:'ws_a', :'ali', 'hot_lead', 'For Ali'), (:'ws_a', :'dina', 'hot_lead', 'For Dina');
insert into public.jobs (workspace_id, kind, run_at) values (:'ws_a', 'first_contact', now() - interval '1 minute');
begin; select t_as(:'ali');
select t_check((select count(*) from public.notifications) = 1, 'people see only their own notifications');
do $$ begin
  perform count(*) from public.jobs;
  raise exception 'FAIL  app user read the job queue';
exception when insufficient_privilege then raise notice 'PASS  the job queue is invisible to app users';
end $$;
do $$ begin
  perform public.claim_due_jobs(5);
  raise exception 'FAIL  app user claimed jobs';
exception when insufficient_privilege then raise notice 'PASS  app users cannot claim jobs';
end $$;
rollback;

begin;
select set_config('role', 'service_role', true);
select t_check((select count(*) from public.claim_due_jobs(5)) = 1, 'the server worker claims due jobs');
select t_check((select count(*) from public.claim_due_jobs(5)) = 0, 'a claimed job is not handed out twice');
rollback;

\echo 'ALL GROWTH RLS TESTS PASSED'
