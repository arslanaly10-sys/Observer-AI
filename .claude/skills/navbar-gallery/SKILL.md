---
name: navbar-gallery
description: Reference library of 491 real website navbars from Navbar Gallery (navbar.gallery) in eight types (static, dropdown, mega menu, full screen, sidebar, announcement, search, breadcrumbs), 30 of them reviewed and pattern-tagged for Observer, plus a navigation checklist. Use when designing, changing or reviewing the site navigation, dropdowns, mega menus, the phone menu, announcement bars or the workspace sidebar on the Observer AI site.
---

# Navbar Gallery

The library lives at the repository root in `navbar-gallery/`:

- `navbar-gallery/README.md`: the eight types and when each fits, the pattern table mapped to Observer's current nav, the navigation checklist, ideas not yet built, the 30 reviewed entries with notes, and the full catalogue of 491 grouped by type.
- `navbar-gallery/entries.json`: every entry as data (`types`, `website_type`, `desc`, `site`, `gallery`, `preview`, `preview_mobile`), with `patterns` and `note` on reviewed entries (`reviewed: true`).

No screenshots are stored: they belong to each site's owner. To see one, open its `preview` or `gallery` link.

## How to use it

1. **Read `navbar-gallery/README.md` first**, at least the type table, the pattern table and the checklist.
2. **Start from the reviewed entries.** Filter `entries.json` for `reviewed: true` and the pattern you need (for example `audience-split`, `icon-items`, `photo-backdrop`). Use the wider catalogue to find more examples of a type or an industry. Study two or three; do not copy one site's layout, colours or wording.
3. **Change the real component:** `components/site/Nav.tsx` (top bar, Solutions dropdown, phone menu, language switch). Menu copy lives in `dictionaries/site.ts` and `dictionaries/site-extra.ts`, in English and Arabic.
4. **Keep Observer's rules:** one filled button (Book a demo); transparent bar over dark photography, solid once scrolled; teal only for buttons and links on light; menus that open on click and with the keyboard, never on hover alone.
5. **Run the checklist** in the README, then check in a browser at desktop and 390px wide, in both languages, with the keyboard only.

## Cautions

- Four to six dense columns (Jasper, Cloudflare) suit huge product lines, not Observer's handful of destinations.
- Scrolling tickers (Hex, Mesh) compete with the hero and must stop for reduced-motion users; avoid them.
- An announcement bar is for real, current news only, and should be dismissible.
