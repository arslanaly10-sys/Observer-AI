# Growth engine setup

The growth engine takes a lead from any ad or form, scores it hot, warm or cold with Claude, routes it to the right agent, and has the AI assistant (default name **Noor**) contact the lead on WhatsApp and email within two or three minutes. It speaks ten languages, books viewings and calls into the Observer calendar, quotes prices and payment plans from your inventory, hands over to a person when it should, and covers conversations on its own after office hours.

Everything works in **sandbox mode** first. New workspaces start there: every message is written, logged and shown in the inbox, and nothing reaches a real person. Turn sandbox off per workspace under **AI & channels** once the channels below are connected.

Do [SUPABASE_SETUP.md](SUPABASE_SETUP.md) first. These steps add to it.

## How a lead moves

1. **Intake.** A form, ad or portal posts to Observer (addresses are listed under *AI & channels → Lead sources*). Duplicates within 30 days join the existing conversation.
2. **Score.** Claude reads the enquiry and returns a 0–100 score, hot (78+), warm (55–77) or cold, the intent, language, area, budget, timing, financing and a one-line reason. With no API key, the built-in rules engine scores instead.
3. **Route.** The lead goes to the available agent who speaks the lead's language, then knows the area, then has the most room. Hot leads prefer top performers. Ties rotate.
4. **First contact** after `first_contact_delay_s` (75 s by default). WhatsApp opens with an approved template (Meta requires one for the first message); email gets a reply written by the AI. Both say plainly that the assistant is an AI.
5. **Conversation.** Once the lead replies, the AI writes freely. During office hours it qualifies (intent, area, budget) and then hands over to the agent. After hours it keeps going: it answers price and payment-plan questions from inventory, sends brochures, books viewings and calls, and runs payment calculations.
6. **Escalation.** The lead goes to a person (in-app notice plus a WhatsApp or email alert) when they ask for one, are upset, want to make an offer, ask a legal/visa/mortgage/tax question, or their score crosses `escalate_score` (85).
7. **Follow-ups.** If the lead goes quiet: gentle messages on days 1, 3 and 7, never during quiet hours (21:00–09:00 in the lead's time zone). Any reply cancels them. "STOP" in any supported language opts them out.
8. **Calls.** If a lead asks for a call and is happy to talk to the AI, Noor phones them (Twilio + Claude + ElevenLabs) and says at the start that it is an AI and the call may be recorded. If they want a person, it hands over instead.

## Environment variables (Vercel → Project → Settings → Environment Variables)

Server-only. None of these may start with `NEXT_PUBLIC_`.

| Variable | Needed for | Where it comes from |
|---|---|---|
| `SUPABASE_SECRET_KEY` | Webhooks and the worker (they act without a signed-in user) | Supabase → Project Settings → API keys → Secret key |
| `WORKER_SECRET` | Authenticates the per-minute worker ping and signs call links | Any long random string, e.g. `openssl rand -hex 32` |
| `APP_URL` | Absolute links in webhooks and alerts | Your production URL, e.g. `https://observer-ai-sable.vercel.app` |
| `ANTHROPIC_API_KEY` | Claude scoring, replies, voice | console.anthropic.com → API keys |
| `OBSERVER_AGENT_ID`, `OBSERVER_ENVIRONMENT_ID` | Managed Agent sessions (one per lead) | Printed by `npm run agent:setup` |
| `WHATSAPP_ACCESS_TOKEN` | Sending WhatsApp messages | Meta Business → System user token with `whatsapp_business_messaging` |
| `META_APP_SECRET` | Verifying every Meta webhook | Meta app → Settings → Basic |
| `META_VERIFY_TOKEN` | The one-time webhook handshake | Any string; type the same one in the Meta dashboard |
| `META_PAGE_ACCESS_TOKEN` | Fetching Lead Ads submissions | Page token with `leads_retrieval` |
| `RESEND_API_KEY` | Sending email | resend.com → API keys |
| `RESEND_WEBHOOK_SECRET`, `RESEND_INBOUND_DOMAIN` | Delivery events and email replies | Resend → Webhooks; your inbound domain |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` | AI phone calls | Twilio console |
| `ELEVENLABS_API_KEY` (optional `ELEVENLABS_VOICE_ID`) | Natural multilingual voice; Twilio's voice is the fallback | elevenlabs.io |

Never paste keys into chat or commit them. Add them in Vercel, then redeploy.

## 1. Database

Apply both migrations (`supabase db push`, or paste them into the SQL editor in order). The second one adds settings, routing profiles, messages, inventory, appointments, notifications, the job queue, and a private `brochures` storage bucket.

Then give the database the worker's address so pg_cron can wake it every minute. In the SQL editor:

```sql
select vault.create_secret('https://YOUR-APP.vercel.app/api/worker', 'observer_worker_url');
select vault.create_secret('THE SAME VALUE AS WORKER_SECRET', 'observer_worker_secret');
```

Enable the `pg_cron` and `pg_net` extensions (Database → Extensions) before applying the migration, or re-run its last block afterwards. The job `observer-worker` then runs every minute and the first reply lands within two or three minutes of a form being sent.

## 2. Claude

Set `ANTHROPIC_API_KEY`. Scoring and replies work right away through the Messages API. For long-running conversations, create the Managed Agent once:

```bash
ANTHROPIC_API_KEY=... npm run agent:setup
```

Copy the two IDs it prints into Vercel. Run the same command again, with the IDs set, whenever you change `lib/ai/definition.ts`; it publishes a new version. Managed Agents is in beta and is billed by session runtime as well as tokens. All requests opt into server-side fallback so a refusal is retried on a fallback model instead of failing.

## 3. WhatsApp (Meta Cloud API)

1. Create a Meta app with the WhatsApp product, add your business number, and note its **phone number ID** (enter it under *AI & channels → Channels*).
2. Webhook: callback URL `https://YOUR-APP/api/webhooks/meta`, verify token = `META_VERIFY_TOKEN`, subscribe to `messages`.
3. Submit these templates in WhatsApp Manager, one per language you sell in (category *Utility* for first contact and alerts, *Marketing* for follow-up). The exact wording for all ten languages is in [`lib/growth/templates.ts`](lib/growth/templates.ts).
   - `observer_first_contact`: {{1}} first name, {{2}} assistant name, {{3}} company
   - `observer_followup`: same parameters
   - `observer_agent_alert` (English): {{1}} alert text, {{2}} link to the lead

Until a template is approved in a language, first contact in that language falls back to email if the lead gave one.

## 4. Lead Ads (Facebook, Instagram), Google, TikTok, Snapchat, portals, website

- **Meta Lead Ads:** in the same Meta app subscribe the Page to `leadgen` and enter the **Page ID** under *AI & channels*.
- **Google Ads lead forms:** webhook URL and key are shown under *Lead sources*.
- **TikTok, Snapchat:** paste the matching intake address into each platform's lead webhook (or via Zapier/Make).
- **Bayut, Property Finder, Dubizzle:** they send leads by email. Forward them through an email-to-webhook parser (Zapier Email Parser, Mailparser) to the portal intake address.
- **Your website and landing pages:** `POST` JSON or form data with any of `name`, `phone`, `email`, `message`, `budget`, `area`. A hidden field named `_hp` is a honeypot.

```bash
curl -X POST "https://YOUR-APP/api/intake/INGEST_TOKEN?source=website" \
  -H "Content-Type: application/json" \
  -d '{"name":"Sara","phone":"+971501234567","email":"sara@example.com","message":"3 bed villa in Dubai Hills, around 5M"}'
```

## 5. Email (Resend)

Verify your sending domain, then enter the from-address under *AI & channels*. For replies, set up inbound on a subdomain (e.g. `reply.yourbrokerage.ae`), set `RESEND_INBOUND_DOMAIN` to it, and point a Resend webhook at `https://YOUR-APP/api/webhooks/resend` with `email.*` events. Replies to `reply+<lead>@…` thread back to the right lead.

## 6. Voice (Twilio + ElevenLabs)

Buy a number with voice, enter it under *AI & channels*, and set its *A call comes in* webhook to `https://YOUR-APP/api/webhooks/twilio/voice` (POST). Calls run turn by turn: Twilio transcribes, Claude answers, ElevenLabs speaks. Expect a short pause between turns. A real-time duplex voice needs a separate WebSocket server, which Vercel functions can't host.

Recording and calling rules differ by country. Check the rules for the countries you call before turning sandbox off.

## 7. Inventory and team

- **Inventory:** add projects, unit types with price ranges, payment plans (milestones that add to 100%) and brochures, or import a CSV. The AI quotes only what is here, and never negotiates.
- **Team → Lead routing:** each agent sets languages, areas, an alert WhatsApp number and the hours the AI may book them. Managers set capacity and top performers.
- **AI & channels:** office hours, holidays, quiet hours, follow-up days, escalation score, and assistant name.

## Try it before going live

With sandbox on, open *AI & channels → Try it*, send a test lead, and open the conversation. You'll see the score and reason, who it was routed to, the WhatsApp template and the AI-written email, all marked *Sandbox, not sent*.

## Data residency

Customer data is hosted in AWS Europe (Frankfurt, `eu-central-1`), and the site says so. Create the Supabase project in that region. Claude, Meta, Resend, Twilio and ElevenLabs process message content in their own regions; list them as subprocessors in your privacy policy.
