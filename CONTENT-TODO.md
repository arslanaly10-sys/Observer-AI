# Before launch: verify or replace

Everything below is either a placeholder or a figure taken from the v10 demo workspace. None of it should go
live as a public claim until someone at Observer confirms it.

## Figures used as marketing claims (from the v10 dashboard, as requested)
- [ ] "Under four minutes" / "4 min" average first reply (home hero, results, solutions)
- [ ] 36% of leads drop before qualifying; 41% go quiet after qualifying (home › problem)
- [ ] 89% WhatsApp open rate vs 28% email (home › problem)
- [ ] 61.7% of qualified leads booked a viewing (home › results)
- [ ] 214 cold leads re-engaged (home › results, app dashboard)
- [ ] AED 42 cost per lead, down 18% (home › results)
- [ ] 91.3% scoring accuracy (app › lead scoring)
- [ ] "Leads answered within five minutes qualify at nearly twice the rate" (app › funnel)
- [ ] "Most teams are sending through Observer within a week" (pricing FAQ)

## Pricing (placeholders)
- [ ] Agent AED 490 / month, 1 seat, 300 leads
- [ ] Brokerage AED 2,900 / month, up to 15 agents
- [ ] Developer: custom

## Company facts
- [ ] "Based in Dubai", "teams across the UAE, Saudi Arabia and Qatar" (about)
- [ ] Data hosted in AWS Middle East (Bahrain), AES-256, PDPL controls (multiple pages)
- [ ] Integrations named: Bayut, Property Finder, Facebook, Instagram, WhatsApp Business API
- [ ] Canonical domain: `metadataBase` is set to `https://observer-ai.example` in `app/[locale]/layout.tsx`
- [ ] Open Graph image `/og.jpg` is a screenshot of the home hero; replace with a designed card if wanted

## Deliberately left out
- **Testimonials and customer logos.** None were provided, and inventing them would be false. Add real ones when you have permission.
- **Team photos and founder story.** The About page states beliefs, not an invented history.

## App demo data
- Tenant and user are fictional (Meridian Developments / Layla Haddad), replacing Emaar Properties / Sarah Ahmed from v10.
- The GCC developer directory names real public companies with **illustrative** figures, and the page says so.
  Verify or remove the figures before showing it to anyone outside the team.

## Images
- All photographs are from Unsplash (free licence). Each was checked to load and to match its subject.
- v10 problems that were fixed: a Netflix logo standing in for social; Masjid an-Nabawi (Medina) labelled
  "Ajman Corniche"; the Makkah clock tower labelled Riyadh; a wheat field labelled NEOM; rain labelled Doha;
  four broken image links; stock faces mismatched to Arabic names (replaced with monograms).

## Wiring
- [ ] Set `DEMO_WEBHOOK_URL` (Vercel env var) so demo requests reach your inbox or CRM. Without it they are only logged.
- [ ] Arabic copy: native Gulf copy-editor review.

## Added in v2: also verify
- [ ] Integrations list (home): Bayut, Property Finder, Dubizzle, WhatsApp Business, Facebook Lead Ads, Instagram, website forms, CRM by API
- [ ] Security page claims: AWS Bahrain, AES-256, TLS 1.3, key rotation, role-based access, audit log, WhatsApp Business Platform templates
- [ ] Contact addresses on Security/Privacy/Terms use `@observer-ai.example`; replace with real addresses
- [ ] Privacy and Terms are drafts (the pages say so); legal review needed before launch
- [ ] ROI calculator model (pricing): qualification falls with reply time (100% / 75% / 55% / 40% of 64%), 12 in 64 qualified leads close
- [ ] Set `NEXT_PUBLIC_SITE_URL` in Vercel once you have a custom domain (used for canonical URLs, sitemap and JSON-LD)

## Backend (Supabase): blocking items
- [ ] **Data residency claim.** Site copy says data is hosted in AWS Middle East (Bahrain). Supabase has no Middle East region (closest: Mumbai, Frankfurt). Choose a region and update the copy, or self-host. See SUPABASE_SETUP.md.
- [ ] Create the Supabase project and set `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Vercel (SUPABASE_SETUP.md).
- [ ] Custom SMTP for auth emails (Supabase's default sender is for testing only).
- [ ] Google OAuth client, if Google sign-in should be live.
- [ ] Invitations are shared as links; add an email sender (e.g. Resend) if you want them emailed automatically.
