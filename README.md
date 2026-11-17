# Observer AI

The AI sales desk for Gulf real estate: a bilingual (English and Arabic) marketing site plus a working
prototype of the Observer app, built with Next.js and Tailwind.

## What's here

| Path | What it is |
|---|---|
| `/en`, `/ar` | Marketing site: Home, Product, Pricing, Solutions (Brokerages, Agents, Developers, Investors), About, Contact |
| `/en/app/*`, `/ar/app/*` | The app prototype: all 18 screens from v10, redesigned, with mock data and the scoring engine |
| `/en/security`, `/privacy`, `/terms` | Trust pages (Privacy and Terms are drafts pending legal review) |
| `/api/demo` | Book-a-demo endpoint. Validates, filters bots (honeypot), then forwards to `DEMO_WEBHOOK_URL` if set (otherwise logs) |
| `/en/login` | Sign in: email + password, magic link, Google, password reset (Supabase Auth) |
| `/en/workspace/*` | The real product: workspaces with Owner / Manager / Agent roles, leads, pipeline, team invites, settings |
| `/sitemap.xml`, `/robots.txt` | Generated, with English and Arabic alternates |

App screens: Dashboard, Pipeline, All leads, Lead scoring, Intent detection, Next best action, Live call assistant,
WhatsApp, Sequences, Facebook & Instagram, Conversion funnel, Channel ROI, Agent performance, GCC developers,
Payment plans, SLA tracking, Compliance, Notifications.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000 → /en or /ar by browser language
npm run build
npm test           # engine unit tests (Vitest)
```

In the app, press **⌘K / Ctrl+K** to search leads and screens. Added leads and pipeline moves are saved in the
browser; reset them from the palette ("Reset demo data").

Refresh the product screenshots used on the marketing site (needs the dev server running and Playwright):

```bash
BASE=http://localhost:3000 npm run shots
```

## Backend

Supabase (Postgres + Auth). Setup takes about 10 minutes: see **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)**.

The growth engine (lead intake from ads, forms and portals, Claude scoring, the multilingual AI assistant on WhatsApp, email and voice) is set up in **[GROWTH_SETUP.md](GROWTH_SETUP.md)**. It runs in sandbox mode until your channels are connected.
Without the two `NEXT_PUBLIC_SUPABASE_*` variables the site still runs; sign-in pages show a "not connected" notice.
Only the publishable key is used. Row-level security in `supabase/migrations/` is the access control, and
`supabase/tests/rls.test.sql` checks every rule (also in CI).

## Structure

```
app/[locale]/(site)/      marketing pages
app/[locale]/app/[view]/  app prototype routes
components/site/          nav, footer, tiles, SVG illustrations, demo form
components/app/           shell, UI kit, views/*
dictionaries/site.ts      all marketing copy, EN + AR
dictionaries/app-ar.ts    Arabic strings for the app (keys are the English strings)
lib/data.ts               demo workspace data (fictional tenant: Meridian Developments)
lib/engine.ts             explainable scoring, intent, next-best-action and payment-plan maths
lib/img.ts                curated, verified Unsplash library
DESIGN.md                 the design system (Apple base from awesome-design-md, adapted)
CONTENT.md                voice and copy rules
CONTENT-TODO.md           everything to verify or replace before launch
REVIEW.md                 the critical review, and what v2 fixed
proxy.ts                  "/" → /ar or /en; refreshes Supabase sessions; guards /workspace and /account
supabase/                 config.toml, migrations, RLS tests
lib/supabase/             browser and server clients, session refresh
lib/workspace.ts          server-side workspace context (user, memberships, current workspace)
app/[locale]/workspace/   the real product (server components + server actions)
tests/                    Vitest unit tests for lib/engine.ts
reference/                the original v10 single-file prototype
.claude/skills/           design and engineering skills for Claude Code sessions on this repo
```

## Skills bundled in `.claude/skills`

| Skill(s) | Source |
|---|---|
| `design-md` (80+ brand DESIGN.md systems) | [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) |
| `web-design-guidelines`, `react-best-practices`, `composition-patterns`, `writing-guidelines`, `deploy-to-vercel` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) |
| `design-taste-frontend` | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) |
| `playwright-cli` | [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli) |
| `12-principles-of-animation` (restored from the repo's archive), `motion`, `copy`, `color`, `restraint`, `audit` | [raphaelsalaja/skill](https://github.com/raphaelsalaja/skill) |
| `apple-design`, `emil-design-eng`, `animate`, `improve-animations`, `review-animations`, `choreograph`, `animation-performance`, `animation-vocabulary`, `find-animation-opportunities`, `learn-taste` | [emilkowalski/skills](https://github.com/emilkowalski/skills) |
| `ui-ux-pro-max`, `design-system`, `ui-styling`, `brand` | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |
| `hallmark` | [nutlope/hallmark](https://github.com/nutlope/hallmark) |
| `phosphor-icons` (usage guide; icons via `@phosphor-icons/react`) | [phosphor-icons/homepage](https://github.com/phosphor-icons/homepage) |

Each skill keeps its upstream licence file where it shipped one.
