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
| `WORKER_SECRET` | Authenticates the per-minute worker ping and signs call, audio and unsubscribe links. At least 24 characters; voice and unsubscribe refuse to work without it | `openssl rand -hex 32` |
| `TURNSTILE_SECRET_KEY` | Captcha on website forms that post straight to Observer (recommended) | Cloudflare → Turnstile |
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

Until a template is approved in a language, the WhatsApp first contact in that language fails (and shows as failed in the inbox); the email still goes out if the lead gave one. Outside WhatsApp's 24-hour window Observer never sends free text: an agent reply there is refused with a clear message, so use email or wait for the lead to write.

## 4. Lead Ads (Facebook, Instagram), Google, TikTok, Snapchat, portals, website

- **Meta Lead Ads:** in the same Meta app subscribe the Page to `leadgen` and enter the **Page ID** under *AI & channels*.
- **Google Ads lead forms:** webhook URL and key are shown under *Lead sources*.
- **TikTok, Snapchat:** paste the matching intake address into each platform's lead webhook (or via Zapier/Make).
- **Bayut, Property Finder, Dubizzle:** they send leads by email. Forward them through an email-to-webhook parser (Zapier Email Parser, Mailparser) to the portal intake address.
- **Your website and landing pages:** use the **form key** address (safe to put in a page). `POST` JSON or form data with any of `name`, `phone`, `email`, `message`, `budget`, `area`. Add a [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) widget and set `TURNSTILE_SECRET_KEY`; its token arrives as `cf-turnstile-response`. A hidden field named `_hp` is a honeypot.
- **Two keys.** The form key is for browsers. The private ingest token is for server-to-server tools only (Zapier, TikTok, Snapchat, portal parsers, Google). Owners and managers can replace either under *AI & channels*; the old one stops working at once.
- **Limits** (all sources): 5 form submissions per address per 10 minutes (60 for server tools), 3 leads per phone number per day, and 300 form leads per workspace per hour. Over a limit, intake answers `429` and nothing is sent.

```bash
curl -X POST "https://YOUR-APP/api/intake/INGEST_TOKEN?source=website" \
  -H "Content-Type: application/json" \
  -d '{"name":"Sara","phone":"+971501234567","email":"sara@example.com","message":"3 bed villa in Dubai Hills, around 5M"}'
```

## 5. Email (Resend)

Every email carries a one-click unsubscribe link and the `List-Unsubscribe` headers Gmail and Yahoo require. Unsubscribing opts the lead out of everything.


Verify your sending domain, then enter the from-address under *AI & channels*. For replies, set up inbound on a subdomain (e.g. `reply.yourbrokerage.ae`), set `RESEND_INBOUND_DOMAIN` to it, and point a Resend webhook at `https://YOUR-APP/api/webhooks/resend` with `email.*` events. Replies to `reply+<lead>@…` thread back to the right lead.

## 6. Voice (Twilio + ElevenLabs)

Buy a number with voice, enter it under *AI & channels*, and set its *A call comes in* webhook to `https://YOUR-APP/api/webhooks/twilio/voice` (POST). Calls run turn by turn: Twilio transcribes, Claude answers in the background while the caller hears a short "one moment", and ElevenLabs speaks. That keeps every webhook inside Twilio's 15-second limit. Expect a pause of a few seconds between turns. A real-time duplex voice needs a separate WebSocket server, which Vercel functions can't host.

Recording and calling rules differ by country. Check the rules for the countries you call before turning sandbox off.

## 7. Inventory and team

- **Inventory:** add projects, unit types with price ranges, payment plans (milestones that add to 100%) and brochures, or import a CSV. The AI quotes only what is here, and never negotiates.
- **Team → Lead routing:** each agent sets languages, areas, an alert WhatsApp number and the hours the AI may book them. Managers set capacity and top performers.
- **AI & channels:** office hours, holidays, quiet hours, follow-up days, escalation score, and assistant name.

## UAE market data and the broker calculator

`lib/market/uae.ts` holds the market reference the AI and the broker calculator use, checked November 2026 from public sources (each figure lists its source):

- Buying fees by emirate (Dubai DLD 4%, admin and trustee fees, mortgage registration 0.25% + AED 290; Abu Dhabi about 2%; Sharjah and RAK about 4%, where sources disagree).
- Mortgage rules (loan-to-value 80/70% expat, 85/75% national, 50% off-plan; 50% debt-burden cap; 25 years; age limits), the Central Bank base rate, EIBOR and typical fixed rates.
- Golden Visa through property (AED 2 million at the official valuation).
- Twenty areas in Dubai and Abu Dhabi with price per square foot, gross yield and service charges, as ranges.
- Fifteen developers (Emaar, DAMAC, Azizi, Binghatti, Ellington, Meraas, Nakheel, Imtiaz, Sobha, Danube, Samana, Omniyat, Aldar, Modon, Arada) with their usual payment plans.

The AI gets five tools on top of the inventory ones: `calculate_purchase_costs`, `check_mortgage_eligibility`, `build_payment_schedule`, `check_golden_visa` and `get_market_overview`. It presents market figures as indicative ranges with the month, and quotes a specific home's price only from your inventory.

Brokers use the same maths under **Calculator** (buying costs, mortgage, payment plan, rental yield, commission split, Golden Visa) and can send any result to a lead. **UAE market** shows the data with its sources.

Review `lib/market/uae.ts` every quarter: rates and prices move, and several 2026 rules (Golden Visa, fees) changed during the year.

## Reliability

- The worker claims jobs with `SKIP LOCKED`, so overlapping runs never double-send. A job left running for 5 minutes (a killed function) is retried, and failed after three attempts.
- Every AI turn has a hard time limit; when Claude is slow or down the rules engine replies instead.
- After hours the AI covers a handed-over lead only if no agent has written in the last 30 minutes.
- Lead scores are refreshed at most every 15 minutes per lead. An agent can set a score by hand; automatic rescoring then leaves it alone.
- **AI & channels → Health** shows when the background worker last ran, overdue and failed jobs, and failed sends.
- Leads who start on WhatsApp or by phone are scored, routed and announced like any other lead.
- A reply goes where it can arrive: WhatsApp inside its 24-hour window, otherwise email, otherwise the WhatsApp template.
- After the AI replies, gentle follow-ups start again if the lead goes quiet (at most six per lead).
- If a Managed Agent turn fails or times out, the session is interrupted and the lead starts a fresh one.
- `npm run test:e2e` runs the whole journey (intake, scoring, routing, first contact, reply, booking, hand-over, STOP, limits) against Postgres + PostgREST. CI runs it on every push.

## Try it before going live

With sandbox on, open *AI & channels → Try it*, send a test lead, and open the conversation. You'll see the score and reason, who it was routed to, the WhatsApp template and the AI-written email, all marked *Sandbox, not sent*.

## Data residency

Customer data is hosted in AWS Europe (Frankfurt, `eu-central-1`), and the site says so. Create the Supabase project in that region. Claude, Meta, Resend, Twilio and ElevenLabs process message content in their own regions; list them as subprocessors in your privacy policy.
