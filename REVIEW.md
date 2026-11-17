# Observer AI: critical review (v1 → v2)

A full pass over v1 as a buyer, a designer, an engineer and a regulator would see it.
Each finding is marked **Fixed in v2**, **Open** (needs you), or **Accepted** (a deliberate trade-off).

## Severity key
🔴 would hurt a sale or launch · 🟠 noticeable quality gap · 🟡 polish

---

## 1. Product and marketing

| # | Finding | Status |
|---|---|---|
| 🔴 1.1 | **Nothing on the site let a visitor try the product.** For an AI product, a static screenshot is a claim; a live reading is proof. | **Fixed:** "Send Observer an enquiry" on the home page runs the real scoring and intent engine in the browser, in English and Arabic, and drafts the first reply. |
| 🔴 1.2 | **No answer to "what is this worth to me?"** Brokerage owners buy on ROI, and the pricing page had none. | **Fixed:** ROI calculator on Pricing (leads, deal size, commission, reply time), with its model printed underneath so it can be checked. |
| 🔴 1.3 | **Marketing figures are unverified.** 4 min, 89%, 61.7%, 214, AED 42 come from a demo dashboard. | **Open:** listed in CONTENT-TODO.md. Don't launch publicly until they're confirmed. |
| 🔴 1.4 | **No privacy notice, yet the demo form collects personal data** and the site cites PDPL. | **Fixed (draft):** Privacy, Terms and Security pages, linked from the footer. The Privacy and Terms pages say plainly that they're drafts pending legal review. |
| 🟠 1.5 | "Most chosen" on the Brokerage tier implied sales data we don't have. | **Fixed:** now "Best for teams". |
| 🟠 1.6 | No integrations story. Buyers' first question is "does it work with Bayut?" | **Fixed:** integrations section (text, not partner logos, to avoid implying partnerships). **Open:** confirm the list. |
| 🟠 1.7 | Solutions was a single link to Brokerages; the other three audiences were hard to find. | **Fixed:** Solutions menu on desktop with all four audiences; sub-links in the mobile menu. |
| 🟠 1.8 | No testimonials or customer logos. | **Accepted:** none were supplied, and inventing them would be false. Add real ones with permission. |
| 🟡 1.9 | The final call to action sat on the same pale ground as the section before it. | **Fixed:** the closing section is now a dark tile with the primary button. |

## 2. App prototype

| # | Finding | Status |
|---|---|---|
| 🔴 2.1 | **Most buttons did nothing** (Call, Send, Escalate, Book a viewing, New sequence, End call). A demo where clicks are dead reads as a mock-up. | **Fixed:** every action gives feedback through toasts, and many change state (SLA rows mark as handled, NBA rows complete, mute toggles). |
| 🔴 2.2 | **"Add lead" scored the lead and then threw it away.** | **Fixed:** added leads join All leads, the dashboard, Next best action and the pipeline's New column, and persist in the browser. |
| 🔴 2.3 | **The search bar was decorative.** | **Fixed:** ⌘K / Ctrl+K command palette searches leads, screens and actions, with full keyboard support. |
| 🟠 2.4 | **The pipeline promised drag-and-drop (v10) but was static.** | **Fixed:** drag cards between stages, or use the arrow button (keyboard and touch friendly). The weighted pipeline total recalculates. |
| 🟠 2.5 | **Copilot gave three canned answers.** | **Fixed:** answers come from live workspace data: named leads, SLA breaches, pipeline value and the next-best-action ranking. |
| 🟠 2.6 | No way to get data out. | **Fixed:** All leads has search and CSV export (UTF-8 with BOM, so Excel opens Arabic correctly). |
| 🟠 2.7 | Mobile overflow: the dashboard scrolled sideways at 390px because `hidden` lost to `inline-flex` and grid cards couldn't shrink. | **Fixed** (v1 patch) and checked on all 18 screens. |
| 🟡 2.8 | Monogram avatars stayed pale in dark mode. | **Fixed:** theme-aware avatar colours. |
| 🟡 2.9 | Copilot re-scored leads and quoted different numbers from the screens (96 vs 91). | **Fixed:** it quotes the same score the screens show. |
| 🟡 2.10 | Hard-coded headline numbers (247 leads, 34 hot) don't match the 10 demo leads in the list. | **Accepted:** demo storytelling. A real backend replaces both. |

## 3. Engineering

| # | Finding | Status |
|---|---|---|
| 🔴 3.1 | **No tests.** The scoring, intent and payment maths drive real decisions. | **Fixed:** 16 Vitest unit tests for the engine (scoring, English and Arabic intent, enquiry analysis, ranking, mortgage maths, ROI). |
| 🔴 3.2 | **No CI.** | **Fixed:** GitHub Actions runs typecheck, tests and a production build on every push and pull request. |
| 🟠 3.3 | Intent detection was English-only, in a bilingual product. | **Fixed:** Arabic patterns for every signal, plus Arabic area names and budgets. |
| 🟠 3.4 | `/` always went to English. | **Fixed:** `proxy.ts` sends Arabic browsers to `/ar` and remembers a language the visitor picks. |
| 🟠 3.5 | No security headers. | **Fixed:** HSTS, nosniff, frame options, referrer and permissions policies; `X-Powered-By` removed. |
| 🟠 3.6 | The demo endpoint had no spam protection. | **Fixed:** honeypot field and a payload size limit. **Open:** add rate limiting (for example Vercel Firewall) before running paid campaigns. |
| 🟠 3.7 | No sitemap, robots or hreflang; every page shared one canonical. | **Fixed:** `sitemap.xml` with EN/AR alternates, `robots.txt` (app and API excluded), per-page canonical and hreflang, Organization and SoftwareApplication JSON-LD. |
| 🟠 3.8 | Product screenshots were 300–440 KB JPEGs served full size to phones. | **Fixed:** served through `next/image` (responsive sizes, WebP). |
| 🟡 3.9 | `motion` was installed but never used. | **Fixed:** removed. |
| 🟡 3.10 | No custom 404. | **Fixed:** bilingual 404. |
| 🟡 3.11 | The demo widget's timing caused a hydration mismatch. | **Fixed:** measured only in the browser. |

## 4. Design and accessibility

| # | Finding | Status |
|---|---|---|
| 🟠 4.1 | v10 imagery: a Netflix logo, Medina's mosque labelled "Ajman", Makkah labelled "Riyadh", a wheat field labelled NEOM, four broken links. | **Fixed in v1.** |
| 🟡 4.2 | Dialogs (palette, lead drawer, add lead) need Escape and focus handling. | **Fixed:** Escape closes each; the palette is a combobox with arrow keys and `aria-activedescendant`. **Open:** add a full focus trap. |
| 🟡 4.3 | The Brokerages card photo (a generic Western office) is weak for a Gulf luxury brand. | **Open:** replace with a commissioned shoot of a real client office. |
| 🟡 4.4 | The Hallmark render audit could not run in this session (blocked by the session's safety check). | **Open:** run `/hallmark audit` locally. |

## 5. Still open (priority order)
1. Verify every public figure and the pricing (CONTENT-TODO.md).
2. Legal review of Privacy and Terms; native Gulf Arabic copy review.
3. Set `DEMO_WEBHOOK_URL` so demo requests reach sales; add rate limiting.
4. A real backend (Supabase or similar) to replace demo data, with auth and the WhatsApp Business API.
5. Real photography and customer proof.

## Review 3 (17 Nov 2026): fixes

Every item from the third critical review is addressed:

- **Abuse:** separate browser form key (Turnstile captcha), per-address, per-number and per-workspace intake limits; keys hidden from agents and rotatable.
- **Reliability:** stuck jobs recovered, hard AI turn time limits, background voice turns inside Twilio's 15 s limit, WhatsApp's 24-hour window counted from WhatsApp messages only (bug found by the new end-to-end test), template misuse refused, rescoring throttled.
- **Behaviour:** AI stays quiet for 30 minutes after an agent writes, even after hours.
- **Email:** one-click unsubscribe (List-Unsubscribe) and a footer link in ten languages.
- **Testing:** `npm run test:e2e` runs the full lead journey against Postgres + PostgREST; CI runs it on every push. 80 database checks, 59 unit tests.
- **Website:** copy matches the product (no SMS, two-minute first contact, ten languages, honest FAQ on AI disclosure, portals via email parser), sample figures labelled, demo reply no longer invents homes, "Soon" labels on demo-only features, modest ROI defaults, readable nav over photos, faded hero shot, phone notch fixed, branded 404 with the right status and title.
- **Sign-in:** split layout with Dubai at night and the assistant's overnight work.
- **Apps:** demo banner, compact Ask button, inbox by latest message with pages and Supabase Realtime, paginated leads, editable inventory, manual bookings and a week strip, "Observer this week" on the overview.

## Review 4 (17 Nov 2026): fixes and UAE market features

- Repeat web enquiries are answered by email (or the WhatsApp template), never dropped.
- WhatsApp- and phone-originated leads are scored, routed and announced.
- Timed-out Managed Agent sessions are interrupted and replaced.
- ElevenLabs requests no longer send `language_code` to models that reject it; Twilio's voice falls back to English for languages it can't speak; unknown callers are greeted in a language guessed from their country code.
- Health panel (worker heartbeat, overdue and failed jobs, failed sends).
- Security and privacy pages corrected (no false audit-log or retention claims) and now list every service that processes data, AI use and call recording.
- The score explanation matches the score; agents can overrule a score and lock it.
- Follow-ups re-arm after a reply goes quiet (max six); test leads are unique; routing counts in one query; the inbox "waiting" filter runs in the database; unassigned bookings can't double-book.
- New: UAE market data with sources, broker calculator (costs, mortgage, schedule, yield, commission, Golden Visa) in workspaces and the demo, five new AI tools, Market page.
- Tests: 81 unit, 85 database checks, end-to-end now covers repeat enquiries, WhatsApp-originated leads, market tools and score locks.
