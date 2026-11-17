-- Tests for the hardening migration: key privacy, key rotation, intake limits, job recovery.
\set ON_ERROR_STOP on
\set QUIET on
set client_min_messages = notice;
\set omar '00000000-0000-0000-0000-00000000000a'
\set mona '00000000-0000-0000-0000-00000000000b'
\set ali  '00000000-0000-0000-0000-00000000000c'
\set eve  '00000000-0000-0000-0000-00000000000e'
select id as ws_a from public.workspaces where name = 'Meridian' \gset

begin; select t_as(:'ali');
select t_check((select assistant_name from public.workspace_settings) is not null, 'agents still read AI settings');
do $$ begin
  perform ingest_token from public.workspace_settings;
  raise exception 'FAIL  agent read the ingest token';
exception when insufficient_privilege then raise notice 'PASS  agents cannot read the ingest token';
end $$;
select t_check(not exists (select 1 from public.workspace_keys((select workspace_id from public.workspace_settings))), 'agents get no keys from workspace_keys');
do $$ begin
  perform public.rotate_workspace_key((select workspace_id from public.workspace_settings), 'ingest');
  raise exception 'FAIL  agent rotated a key';
exception when insufficient_privilege then raise notice 'PASS  agents cannot rotate keys';
end $$;
rollback;

begin; select t_as(:'mona');
select ingest_token as old_token from public.workspace_keys(:'ws_a') \gset
select t_check(:'old_token' is not null, 'managers read keys through workspace_keys');
select public.rotate_workspace_key(:'ws_a', 'ingest') as new_token \gset
select t_check(:'new_token' <> :'old_token' and (select ingest_token from public.workspace_keys(:'ws_a')) = :'new_token', 'managers rotate the ingest token');
rollback;

begin; select t_as(:'eve');
select t_check(not exists (select 1 from public.workspace_keys(:'ws_a')), 'outsiders get no keys');
rollback;

begin;
select set_config('role', 'service_role', true);
select t_check(public.intake_allowed(:'ws_a', 'ip1', '971500000001', true) is null, 'a first form submission is allowed');
select public.intake_allowed(:'ws_a', 'ip1', '97150000000' || g, true) from generate_series(2, 5) g;
select t_check(public.intake_allowed(:'ws_a', 'ip1', '971500000099', true) is not null, 'the sixth form submission from one address in 10 minutes is refused');
select public.intake_allowed(:'ws_a', 'ip' || g, '971511111111', false) from generate_series(10, 12) g;
select t_check(public.intake_allowed(:'ws_a', 'ip20', '971511111111', false) is not null, 'a fourth lead for the same number in a day is refused');
rollback;

begin;
select set_config('role', 'service_role', true);
insert into public.jobs (workspace_id, kind, status, attempts, updated_at) values (:'ws_a', 'first_contact', 'running', 1, now() - interval '10 minutes') returning id as stuck \gset
insert into public.jobs (workspace_id, kind, status, attempts, updated_at) values (:'ws_a', 'followup', 'running', 3, now() - interval '10 minutes');
select t_check(exists (select 1 from public.claim_due_jobs(10) where id = :'stuck' and attempts = 2), 'a job whose worker died is retried');
select t_check((select status from public.jobs where kind = 'followup' and attempts = 3) = 'failed', 'a job that died three times is failed');
rollback;

begin;
select id as some_lead from public.leads where name = 'Lead for Ali' \gset
insert into public.messages (workspace_id, lead_id, channel, direction, author, body, status) values (:'ws_a', :'some_lead', 'whatsapp', 'in', 'lead', 'ping', 'received');
select t_check((select last_message_at from public.leads where id = :'some_lead') is not null, 'a new message stamps the lead for the inbox');
rollback;

\echo 'ALL HARDENING TESTS PASSED'
