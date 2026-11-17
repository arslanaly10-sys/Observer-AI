---
name: phosphor-icons
description: How Observer AI uses Phosphor Icons (@phosphor-icons/react). Use whenever adding or changing an icon in the app or marketing site.
---
# Phosphor Icons

Source: https://github.com/phosphor-icons/homepage (catalogue at https://phosphoricons.com).

- Import from `@phosphor-icons/react/dist/ssr` in Server Components, `@phosphor-icons/react` in Client Components.
- Default weight `regular` (1.5px look at 20px). Use `duotone` only for feature illustrations, `fill` only for active nav state.
- Size scale: 16 (inline/table), 18 (buttons), 20 (nav), 24 (cards), 32+ (feature tiles).
- Never mix emoji with icons in product UI. The v10 prototype used emoji; v11 replaces every one with a Phosphor glyph.
- Icons are decorative unless they are the only label; icon-only buttons need `aria-label`.
- Mirror directional icons (arrows, carets) in RTL with `rtl:-scale-x-100`.
