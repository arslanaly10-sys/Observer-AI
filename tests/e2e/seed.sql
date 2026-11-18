-- Seed for the end-to-end pipeline test: one workspace in sandbox mode, an owner and two agents, inventory.
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-0000000000a1', 'owner@e2e.test', '{"full_name":"Omar Owner"}'),
  ('00000000-0000-0000-0000-0000000000a2', 'ali@e2e.test',   '{"full_name":"Ali Agent"}'),
  ('00000000-0000-0000-0000-0000000000a3', 'priya@e2e.test', '{"full_name":"Priya Agent"}');
insert into public.workspaces (id, name, city, created_by) values ('00000000-0000-0000-0000-00000000e2e0', 'Meridian E2E', 'Dubai', '00000000-0000-0000-0000-0000000000a1');
insert into public.workspace_members (workspace_id, user_id, role) values
  ('00000000-0000-0000-0000-00000000e2e0', '00000000-0000-0000-0000-0000000000a2', 'agent'),
  ('00000000-0000-0000-0000-00000000e2e0', '00000000-0000-0000-0000-0000000000a3', 'agent');
update public.member_profiles set languages = '{en,ar}', areas = '{Dubai Hills}' where user_id = '00000000-0000-0000-0000-0000000000a2';
update public.member_profiles set languages = '{en,hi,ur}' where user_id = '00000000-0000-0000-0000-0000000000a3';
update public.member_profiles set available = false where user_id = '00000000-0000-0000-0000-0000000000a1';
-- Open every day, all day, so the test doesn't depend on the clock; follow-ups immediately.
update public.workspace_settings set first_contact_delay_s = 0,
  office_hours = '{"mon":[["00:00","23:59"]],"tue":[["00:00","23:59"]],"wed":[["00:00","23:59"]],"thu":[["00:00","23:59"]],"fri":[["00:00","23:59"]],"sat":[["00:00","23:59"]],"sun":[["00:00","23:59"]]}',
  ingest_token = '11111111-1111-1111-1111-111111111111', form_key = '22222222-2222-2222-2222-222222222222', whatsapp_phone_number_id = '1112223334'
  where workspace_id = '00000000-0000-0000-0000-00000000e2e0';
insert into public.projects (id, workspace_id, name, developer, area, status, handover) values
  ('00000000-0000-0000-0000-00000000f001', '00000000-0000-0000-0000-00000000e2e0', 'Hills Grove', 'Emaar', 'Dubai Hills', 'off_plan', 'Q4 2028');
insert into public.units (workspace_id, project_id, unit_type, beds, size_sqft, price_from, price_to, available) values
  ('00000000-0000-0000-0000-00000000e2e0', '00000000-0000-0000-0000-00000000f001', '4 BR Villa', 4, 4200, 4800000, 5600000, 6);
insert into public.payment_plans (workspace_id, project_id, name, schedule) values
  ('00000000-0000-0000-0000-00000000e2e0', '00000000-0000-0000-0000-00000000f001', '60/40', '[{"milestone":"Booking","percent":20},{"milestone":"Construction","percent":40},{"milestone":"Handover","percent":40}]');

-- PostgREST connects as "authenticator" and switches to the role in the JWT.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'authenticator') then create role authenticator login password 'e2e' noinherit; end if;
end $$;
grant anon, authenticated, service_role to authenticator;
grant usage on schema public to service_role;
notify pgrst, 'reload schema';
