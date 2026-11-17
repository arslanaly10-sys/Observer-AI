# Observer AI — Design System

Base: `.claude/skills/design-md/apple/DESIGN.md` (Apple), adapted for a premium Gulf real-estate product.
Everything below overrides the Apple base where it differs.

## Kind
Software (B2B SaaS). Sold to brokerage owners, agents, developers' in-house sales teams, and pitched to investors.
Main action: **Book a demo**. Secondary: **Open the live app**.

## Colour (role tokens, see `app/globals.css`)

| Token | Light | Dark | Role |
|---|---|---|---|
| `canvas` | `#ffffff` | `#000000` | page ground, product tiles |
| `parchment` | `#f5f5f7` | `#0d0d0e` | alternate tile, app sidebar, footer |
| `ink` | `#1d1d1f` | `#f5f5f7` | text |
| `ink-2` | `#6e6e73` | `#a1a1a6` | secondary text (4.6:1 on white) |
| `hairline` | `#d2d2d7` | `#2c2c2e` | dividers, card edges |
| `tile` | `#1d1d1f` | `#1d1d1f` | dark product tile |
| `creek` | `#006b7d` | `#3fc1d1` | the ONE interactive colour (links, primary button, focus) |

Why creek instead of Apple's Action Blue: it is the colour of Dubai Creek and the Gulf at dusk — the subject's own water —
while keeping Apple's rule of one quiet interactive colour.

Data colours (app only, never decoration): `hot #c2410c` (ember), `warm #a16207` (sand), `cold #3f6b8a` (slate),
`ok #1f8a4c`, `wa #128c4b` (WhatsApp channel only).

## Type
- **Instrument Sans** (400/500/600) for all Latin text — a grotesk with SF's calm, tight at display sizes (`-0.022em`).
- **IBM Plex Sans Arabic** (400/500/600) for Arabic; same scale, `letter-spacing: 0` (never track Arabic).
- Numbers: `font-variant-numeric: tabular-nums` in the app.
- Scale (Apple): 56 / 40 / 28 / 21 / 17 / 14 / 12. Body 17px, line-height 1.47.
- No all-caps labels, no monospace labels, no single italic/colour-accented word in headlines.

## Layout
- Apple tiles: full-bleed sections alternating `canvas` / `parchment` / `tile`, text centred, max line ~70ch.
- Media max-width 1180px; text column 760px. 16px gutter on phones.
- Radius: 8 (controls), 18 (cards, frames), pill (buttons). No shadow on chrome; one soft shadow under product frames only.
- Buttons: filled creek pill (primary) + text link with chevron-free underline (secondary). Two per screen max.

## Signature (the one bold move)
The home hero: a full-bleed dusk photograph of Sheikh Zayed Road, headline in white, and the real product
(screenshot of `/app`) rising out of the photograph onto the white page below. One orchestrated load
sequence; nothing else on the page animates on its own.

## Motion
- Load: hero photo settles from `scale(1.04)` over 1.6s `cubic-bezier(.16,1,.3,1)`; headline and frame fade/rise 16px, 120ms apart.
- Interaction only after that: buttons press to `scale(.97)`, linked cards lift 2px, photos zoom 1.03 in frame.
- No scroll-triggered fades on every section. `prefers-reduced-motion` → everything static.

## Imagery
- Curated Unsplash: Gulf skylines, villas, interiors, people at work. Every photo matches its caption (v10 had a Netflix
  logo, Medina's mosque labelled "Ajman", Makkah labelled "Riyadh", a wheat field labelled NEOM — all removed).
- Lead/agent avatars use monogram discs, not stock faces mismatched to Arabic names.
- Custom SVG diagrams for mechanisms (scoring signals, channel cascade).
- Real product screenshots from `/app`, captured by `npm run shots`.

## Icons
Phosphor (`@phosphor-icons/react`), regular weight. No emoji in UI.

## Voice
Premium, calm, specific. Short sentences. Numbers over adjectives. See `CONTENT.md`.
