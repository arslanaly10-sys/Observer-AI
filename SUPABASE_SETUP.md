# Connecting Supabase (about 10 minutes)

The backend is fully built: database schema, row-level security, sign-in (email + password, magic link,
Google), workspaces with roles, leads, pipeline, team invitations and demo-request storage.
It switches on as soon as two environment variables are set. Until then the site works as before and the
sign-in pages say accounts are almost ready.

> **Region: Frankfurt (`eu-central-1`).** The site says customer data is hosted in AWS Europe (Frankfurt),
> so create the Supabase project in that region. Saudi PDPL and UAE data rules limit transfers abroad; check
> them with your customers' legal teams before onboarding regulated clients.

## 1. Create the project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Name it `observer-ai`, choose a strong database password, and pick the region (see the warning above).

## 2. Apply the schema
Pick one:

**A. CLI (recommended)**
```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

**B. Dashboard**: open **SQL Editor**, paste the contents of
`supabase/migrations/20261117154427_init_workspaces.sql`, and run it.

## 3. Auth settings (Dashboard → Authentication)
- **URL Configuration**
  - Site URL: `https://observer-ai-sable.vercel.app` (or your custom domain)
  - Redirect URLs: `https://observer-ai-sable.vercel.app/auth/callback**` and `http://localhost:3000/auth/callback**`
- **Sign In / Providers → Email**: keep **Confirm email** on. Minimum password length 8.
- **Google** (optional): create an OAuth client in Google Cloud Console (type *Web application*), add the
  authorised redirect URI shown in Supabase's Google provider panel, then paste the client ID and secret.
- **Emails**: Supabase's built-in email sender is rate-limited and for testing only. Before launch, set up
  custom SMTP (Resend, Postmark, Amazon SES…) under **Authentication → Emails → SMTP settings**.

## 4. Connect the site
In Vercel → Project `observer-ai` → **Settings → Environment Variables**, add (all environments):

| Name | Value | From |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` | Supabase → Project Settings → API / Connect |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` | Supabase → Project Settings → API Keys |

Then redeploy. **No secret or service-role key is needed or used anywhere**: every request runs as the
signed-in user and Postgres row-level security decides what they can see and change.

For local development, put the same two lines in `.env.local`.

## 5. Check it works
1. Visit `/en/login` → **Create an account** → confirm the email.
2. You land on onboarding → create a workspace (tick *sample leads* to look around).
3. **Team** → invite a second email as Agent → open the copied link in a private window and sign up with
   that email → the agent sees only their own leads and the unassigned pool.
4. Submit the **Book a demo** form → the row appears in Supabase → Table Editor → `demo_requests`.
5. Supabase → **Advisors** → run the security and performance advisors; expect no errors.

## What's in the database

| Table | Who can read | Who can write |
|---|---|---|
| `workspaces` | members | anyone signed in creates their own; owners edit/delete |
| `workspace_members` | members | owners change roles/remove; anyone can leave; last owner can't leave |
| `invitations` | owners, managers | owners invite anyone; managers invite agents |
| `leads` | owners/managers: all · agents: theirs + unassigned | members add; agents edit only their own; owners/managers delete |
| `activities` | whoever can see the lead | members, as themselves |
| `profiles` | yourself and teammates | yourself |
| `demo_requests` | nobody through the public key | the website (insert only) |

`supabase/tests/rls.test.sql` proves each of these rules (40 checks). Run them against any Postgres:
`PGHOST=localhost PGPORT=5432 bash supabase/tests/run-local.sh`. CI runs them on every push.
