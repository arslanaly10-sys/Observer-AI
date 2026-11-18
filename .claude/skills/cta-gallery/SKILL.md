---
name: cta-gallery
description: Reference library of 40 real call-to-action sections from CTA Gallery (cta.gallery), tagged by pattern, plus CTA writing rules and Observer's CTA checklist. Use when designing, writing or reviewing any call to action, button label, sign-up or demo form, newsletter field, closing band or pricing ask on the Observer AI site.
---

# CTA Gallery

The library lives at the repository root in `cta-gallery/`:

- `cta-gallery/README.md`: the pattern catalogue, writing rules, Observer checklist, ideas not yet built, and an index of all 40 entries with links.
- `cta-gallery/entries.json`: the same entries as data (`patterns`, `category`, `industry`, `mode`, `note`, `site`, `gallery`).

No screenshots are stored: they belong to each site's owner. To see one, open its `gallery` link.

## How to use it

1. **Read `cta-gallery/README.md` first**, at least the pattern table and the checklist.
2. **Pick patterns, not a site.** Filter `entries.json` by the pattern you need (for example `field-cta`, `giant-type`, `reassurance`) and study two or three entries for each. Do not copy one entry's layout, colours or copy.
3. **Fit Observer's system.** Black night canvas with a white pill on dark; teal only for buttons and links on light; one primary action per section; English and Arabic.
4. **Reuse what exists** before building new CTA components:
   - `components/site/InlineCta.tsx`: the WhatsApp-number field (a GET form to `/{locale}/contact`; the demo form pre-fills the number).
   - `CloseBand` in `components/site/Section.tsx`: a photo, a giant headline, the inline field, a reassurance line and an optional quiet second link.
5. **Write the words** with the rules in the README: a verb, specific, two to four words, a true reassurance line, no invented urgency or numbers.
6. **Run the checklist** in the README before you ship, and check the result in a browser at desktop and 390px wide, in both languages.

## Cautions

- Decorative script or italic word swaps (Lxlcreative, Pixera, Studioloop) clash with the refero-design anti-slop rules. Do not use them without a real brand reason.
- Pop-up modals (Safds) interrupt a B2B buyer. Do not use them for the demo ask.
- Never add social proof, user counts or results that are not real.
