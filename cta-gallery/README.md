# CTA Gallery reference library

A working reference for calls to action, pulled from [CTA Gallery](https://www.cta.gallery/) on 18 November 2026: all 40 entries listed there that day, the gallery's eight CTA types, and the advice on its [writing tips page](https://www.cta.gallery/cta-tips), summarised in our own words.

**What is and isn't here.** CTA Gallery states that every screenshot belongs to its site's owner, so this folder holds no copied images. It holds each entry's metadata, a link to the live site and to the gallery page, and our own note on what makes it work. Open the gallery link to see a CTA. `entries.json` has the same data for scripts and agents.

The `cta-gallery` skill (`.claude/skills/cta-gallery`) tells agents to use this library before they design or write a call to action in this project.

## The patterns

Each entry in the index is tagged with the patterns it shows. The first eight are the ones worth using; the last three are cautions.

| Pattern | What it is | Best examples | In Observer |
|---|---|---|---|
| `field-cta` | The call to action is a form field: type, then one button. One step instead of a separate page. | plnty, Twohands, Fctrylab, Studioloop | The WhatsApp-number field in the hero and every closing band (`components/site/InlineCta.tsx`) |
| `giant-type` | The headline is set across the full width, so the ask cannot be missed. | Augustus, Builderstable, Numa, Tines, Jemini | `.t-giant` in the closing band |
| `focal-object` / `photo-led` | One striking photograph or object carries the section; nothing competes with it. | Northeast Tomato, SVZ, Animos, Fctrylab | One photograph per closing band (a villa at dusk on home) |
| `reassurance` / `risk-reversal` | A short line under the button removes the risk: free, no card, refunds, time needed. | Animos, Bannerbear, Numa, Twohands | "30 minutes, with your own enquiries. No card needed." |
| `own-data-demo` | The demo promises to use the buyer's own material, not a canned example. | Heron ("inside one of your own projects") | "Bring a week of your enquiries." |
| `product-proof` / `stat` | A piece of the product, or one hard number, sits beside the ask. | Bannerbear, Kraftline, Overtake, Draftr | The live product cards in the hero |
| `specifics` | Exact dates, prices or quantities instead of adjectives. | Builderstable, Twohands, Kraftline, Kronborg | Timestamps (11:42 pm, 38 seconds) and AED figures |
| `multi-path` / `tile-choice` | Different audiences get their own button. | Lockerland, Eatsnackish, Wearedirect | Not yet used: candidate below |
| `question-headline` | The headline asks the reader a direct question. | Native Security, Sapphicindex | Not used |
| **Caution:** decorative script or serif word swaps | One word set in a script or italic face for "taste". | Lxlcreative, Pixera, Studioloop | Avoid. The refero-design skill lists this as a common AI-generated look; use only with a real brand reason. |
| **Caution:** `modal` | A pop-up that interrupts reading. | Safds | Avoid for a B2B demo; it costs trust. |

## Writing the words

From the gallery's tips page, in short:

1. **Say exactly what happens.** "Book a demo", not "Let's go" or "Click here".
2. **Start with a verb** that describes the action.
3. **Name the benefit** where the button allows it, or put it in the headline above.
4. **First person can feel warmer** ("Start my trial"). Test it before adopting it.
5. **Urgency only if it is true.** Never invent a deadline.
6. **Keep it short:** two to four words on a button.
7. **Contrast:** the button must be the most visible thing in its section.
8. **Put the main ask above the fold**, not only at the bottom of the page.
9. **Remove the risk** in a line under the button (time, cost, commitment).
10. **Answer the objection** the reader has at that moment.
11. **Social proof near the button**, but only real figures.
12. **Show what they get immediately** after clicking.
13. **Support the button with a strong headline** that makes the offer.
14. **Be specific to the offer and the audience,** never generic.
15. **Test and measure.** There is no universal best wording.

## Observer checklist

Before shipping a call to action on this site:

- [ ] One primary action per section. A second action is a quiet text link, never a second button of equal weight.
- [ ] The button is a verb phrase of two to four words, in English and Arabic.
- [ ] A reassurance line under it says what the click costs (time, money, commitment), and it is true.
- [ ] No invented urgency, user counts or results. The results band on home is labelled as demo figures; keep it that way until there are real customers.
- [ ] Works without JavaScript. The inline field is a plain GET form to `/{locale}/contact`.
- [ ] Mirrors correctly right to left; placeholders fit at 390px wide.
- [ ] Button contrast meets WCAG AA on its background (white pill on black, black button inside the white field).
- [ ] Visible above the fold on the page that carries it, and again at the end.

## Ideas not yet built

- **Audience split** (`multi-path`, after Lockerland): under the closing headline, offer "I run a brokerage", "I'm an agent" and "I'm a developer", each opening the demo form with the role pre-selected.
- **Proof beside the ask** (`stat`, after Overtake): once there are real customers, put one real number next to the closing field.
- **Question headline** (after Native Security) for the Security page: "Want to see where your buyers' data lives?" with a link to the security review.

## Index

All 40 entries, in the gallery's order (alphabetical by slug). Type, industry and light/dark mode are the gallery's own labels; patterns and notes are ours.

| # | CTA | Type | Industry | Mode | Patterns | What makes it work | Links |
|---|---|---|---|---|---|---|---|
| 1 | Animos | Button | Tech | Dark | `focal-object`, `reassurance` | One glowing sculptural object on black above a short centred headline; a single blue pill and a line removing risk (free up to 720p, no account needed). | [site](https://animos.app/) · [gallery](https://www.cta.gallery/cta/animos) |
| 2 | Augustus | Button | Tech | Light | `giant-type`, `illustration` | Two words, START BUILDING, set huge and left-aligned; one small black button; a line drawing of a building bleeds off the right edge. | [site](https://augustus.com/) · [gallery](https://www.cta.gallery/cta/augustus) |
| 3 | Aya | Button | Event / Conference | Light | `bold-colour`, `photo-break` | Acid-yellow rounded panel on purple and red with heavy display type; a cut-out photo breaks out of the panel edge; one black pill. | [site](https://aya.nl/) · [gallery](https://www.cta.gallery/cta/aya) |
| 4 | Bannerbear | Button | SaaS, Tech | Light | `product-proof`, `reassurance` | Start a Free Trial with the concrete offer underneath (30 API credits, no card); a tiny version of the product's workflow sits between headline and button. | [site](https://www.bannerbear.com/) · [gallery](https://www.cta.gallery/cta/bannerbear-new) |
| 5 | Builderstable | Pricing / Subscription | Event / Conference | Dark | `giant-type`, `specifics` | Uppercase headline across a dark grid; the line under it gives exact dates and prices; one lime button. | [site](https://builderstable.net/) · [gallery](https://www.cta.gallery/cta/builderstable) |
| 6 | counterpublic | Button | Services | Dark | `giant-button` | The button is the section: one enormous yellow pill on black. | [site](https://counterpublic.org/) · [gallery](https://www.cta.gallery/cta/counterpublic) |
| 7 | Designbomb | Newsletter | Event / Conference | Dark | `field-cta`, `collage` | Newsletter field in the corner of a dark panel, with a pile of event stickers along the bottom edge. | [site](https://www.designbomb.it/) · [gallery](https://www.cta.gallery/cta/designbomb) |
| 8 | Draftr - SaaS and Software Template | Template | – | – | `product-proof` | Template SaaS hero: centred headline, one pill (it's free) and product mockups directly under the ask. | [site](https://safds.com/) · [gallery](https://www.cta.gallery/cta/draftr-saas-and-software-template) |
| 9 | Eatsnackish | Button | Ecommerce | Light | `multi-path`, `photo` | Three side-by-side panels, each with its own action (find in store, follow, become a creator). | [site](https://eatsnackish.com/) · [gallery](https://www.cta.gallery/cta/eatsnackish) |
| 10 | Eternalblue | Button | Ecommerce | Light | `focal-object`, `quiet-cta` | Large still-life of the product; the CTA is a small text link, letting the product sell. | [site](https://eternalblue.co.nz/) · [gallery](https://www.cta.gallery/cta/eternalblue) |
| 11 | Fctrylab | Newsletter | Ecommerce | Light | `field-cta`, `focal-object`, `urgency` | BE FIRST. NEVER MISS A DROP. set over the product photo, with one email field and a black submit bar. | [site](https://fctrylab.com/) · [gallery](https://www.cta.gallery/cta/fctrylab) |
| 12 | Numa | Call-to-Buy | Ecommerce | Light | `human-face` | Variant of the Get-ripe founders CTA. | [site](https://numa.uprock.pro/) · [gallery](https://www.cta.gallery/cta/get-ripe-copy) |
| 13 | Get-ripe | Button | Education | Light | `human-face` | Short two-line claim above a photo of the two founders; small button to meet them. | [site](https://www.get-ripe.com/) · [gallery](https://www.cta.gallery/cta/get-ripe) |
| 14 | Hello World Studio | Newsletter | Design | Light | `focal-object`, `field-cta` | Two 3D characters flank a small newsletter card on an ASCII-art ground. | [site](https://www.hello-world.studio/) · [gallery](https://www.cta.gallery/cta/hello-world-studio) |
| 15 | Heronaiapp | Button | Architecture | Light | `own-data-demo` | SEE WHAT HERON CAN DO IN YOUR MODEL, with the promise to show it working inside one of the buyer's own projects; one red button. Closest match to Observer's 'with your own leads' demo. | [site](https://heronaiapp.com/) · [gallery](https://www.cta.gallery/cta/heronaiapp) |
| 16 | Hiartem | Button | Portfolio | Light | `minimal` | Soft gradient glow, two-word headline and a glassy Say hi! button. | [site](https://hiartem.com/) · [gallery](https://www.cta.gallery/cta/hiartem) |
| 17 | Jemini | Button | Agency | Light | `giant-type`, `human-face` | Huge orange headline with small portrait chips set inline between the words; pill link to learn more. | [site](https://jemini.co/) · [gallery](https://www.cta.gallery/cta/jemini) |
| 18 | Journey digital | Button | Agency | Dark | `photo-led` | Dark cinematic photograph, small centred text and a full-width lime bar as the button. | [site](https://journey-digital.com/) · [gallery](https://www.cta.gallery/cta/journey-digital) |
| 19 | Kraftline - Manufacturing & Production Template | Template | – | – | `product-proof`, `specifics` | Split: coloured panel with a two-line promise and two buttons, beside a factory photo carrying a hard number (minimum order). | [site](https://safds.com/) · [gallery](https://www.cta.gallery/cta/kraftline-manufacturing-production-template) |
| 20 | Kronborg | Button | Event / Conference | Dark | `offer`, `type-pattern` | A repeating 10% fills a blue panel; one line states the online discount; one yellow button. | [site](https://kronborg.dk/) · [gallery](https://www.cta.gallery/cta/kronborg) |
| 21 | Lockerland | Button | Agency | Light | `multi-path` | Get started, then two illustrated choices, one per audience (merchant or host), each with its own button. | [site](https://www.lockerland.com.au/) · [gallery](https://www.cta.gallery/cta/lockerland) |
| 22 | Lxlcreative | Button | Agency | Light | `giant-type` | Uppercase headline on dark brown with a video thumbnail above and one small orange button. Uses a script-word swap: see cautions. | [site](https://www.lxlcreative.co.uk/) · [gallery](https://www.cta.gallery/cta/lxlcreative) |
| 23 | Native Security | Button | SaaS, Tech | Light, Dark | `question-headline`, `two-path` | A question headline (Ready to enforce secure-by-design?) over a sculpted dark wave; primary Schedule a demo and secondary Explore the platform. | [site](https://www.native.security/) · [gallery](https://www.cta.gallery/cta/native.security) |
| 24 | Northeasttomato | Button | Ecommerce | Light | `focal-object`, `photo-led` | A macro photo of one tomato fills a rounded panel; Let's talk production centred on it with two small buttons. | [site](https://northeasttomato.com/) · [gallery](https://www.cta.gallery/cta/northeasttomato) |
| 25 | Overtake - Performance Marketing Agency Template | Template | – | – | `product-proof`, `stat` | Headline with an inline icon chip, two buttons, then a photo beside a dark stat card (6.4x ROAS). | [site](https://safds.com/) · [gallery](https://www.cta.gallery/cta/overtake-performance-marketing-agency-template) |
| 26 | Pixera - Portfolio Design & Creative Brand | Template | – | – | `photo-led` | Editorial serif headline above a close-up portrait. Uses a script-word swap: see cautions. | [site](https://safds.com/) · [gallery](https://www.cta.gallery/cta/pixera-portfolio-design-creative-brand) |
| 27 | pizza-amici | Button | Cafe | Dark | `collage`, `social-proof` | Polaroid collage with a stat badge (97 team members) and a card asking a direct question, with a yellow button. | [site](https://www.pizza-amici.nl/) · [gallery](https://www.cta.gallery/cta/pizza-amici) |
| 28 | plnty | Button | Tech, Design | Light | `field-cta` | Claim your handle: the whole CTA is one @ input. The clearest example of the field as the call to action. | [site](https://plnty.app/) · [gallery](https://www.cta.gallery/cta/plnty) |
| 29 | Quatrecentquatre | Button | Ecommerce | Dark | `minimal` | Pale panel: Interested? Let's talk! with a friendly illustrated laptop. | [site](https://quatrecentquatre.com/en) · [gallery](https://www.cta.gallery/cta/quatrecentquatre) |
| 30 | Safds | Modal / Pop-up | Agency | Light | `modal` | Newsletter modal over a photo. See cautions: avoid interrupting a B2B visitor. | [site](https://safds.com/) · [gallery](https://www.cta.gallery/cta/safds) |
| 31 | Sapphicindex | Button | Landing | Dark | `form`, `question-headline` | Question headline on a pink card with four fields; the email field explains why it is asked (so we can thank you). | [site](https://sapphicindex.com/) · [gallery](https://www.cta.gallery/cta/sapphicindex) |
| 32 | Studioloop | Newsletter | Design | Light | `field-cta` | Hand-drawn headline with an inline email bar underneath. Uses decorative script: see cautions. | [site](https://www.studioloop.com.br/) · [gallery](https://www.cta.gallery/cta/studioloop) |
| 33 | SVZ | Button | Services, Tech | Light | `focal-object` | One furry 3D object on black, headline across it, small Discovery call link. | [site](https://www.svz.io/) · [gallery](https://www.cta.gallery/cta/svz) |
| 34 | Thenavia | Button | AI, Marketing | Light | `photo-mosaic` | A mosaic of customer-life photos frames a white card with a warm headline and one orange pill. | [site](https://www.thenavia.com/) · [gallery](https://www.cta.gallery/cta/thenavia) |
| 35 | Tines | Pricing / Subscription | AI | Light | `giant-type`, `two-path` | Start today set huge and filled with illustration; Sign up free and Book a demo side by side. | [site](https://www.tines.com/) · [gallery](https://www.cta.gallery/cta/tines) |
| 36 | Trevornoah | Button | Portfolio | Dark | `focal-object` | A 3D stack of books as the single object, Explore more under it. | [site](https://www.trevornoah.com/) · [gallery](https://www.cta.gallery/cta/trevornoah) |
| 37 | Tryclucky | Download | Mobile App | Light | `download` | App mascot in a phone frame, App Store button, playful clock dials either side. | [site](https://tryclucky.com/) · [gallery](https://www.cta.gallery/cta/tryclucky) |
| 38 | Twohands | Call-to-Buy | Agency | Dark | `field-cta`, `reassurance`, `specifics` | Your website, in good hands. A wide white Get started bar plus Book a call, the starting price shown, and three short reassurance chips. | [site](https://www.twohands.studio/) · [gallery](https://www.cta.gallery/cta/twohands) |
| 39 | Wastetide | Button | AI, Tech | Light | `giant-type`, `focal-object`, `two-path` | Uppercase manifesto on the left, a red flag render on the right, Try it for free and Book a call. | [site](https://www.wastetide.ai/) · [gallery](https://www.cta.gallery/cta/wastetide) |
| 40 | Wearedirect | Button | Portfolio, Services | Dark | `tile-choice` | Two large tiles as the CTA: Prefer mail? with the address, and More work as the next page. | [site](https://wearedirect.co/) · [gallery](https://www.cta.gallery/cta/wearedirect) |
