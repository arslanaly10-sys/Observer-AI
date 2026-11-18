# Navbar Gallery reference library

A working reference for website navigation, pulled from [Navbar Gallery](https://www.navbar.gallery/) on 18 November 2026: all 491 navbars listed under its eight types that day, with the gallery's own metadata, plus a closer review of 30 of them chosen for Observer (every real-estate entry, and the strongest finance, SaaS, AI and architecture menus).

**What is and isn't here.** No screenshots are copied; they belong to each site's owner. Every entry has links to the live site, its gallery page and its preview image (`preview`, `preview_mobile` in `entries.json`). Reviewed entries carry our own pattern tags and a note on what makes them work; they are starred ★ in the catalogue below.

The `navbar-gallery` skill (`.claude/skills/navbar-gallery`) tells agents to use this library before they design or change navigation in this project.

## The eight types

| Type | What it is | Count | When it fits |
|---|---|---|---|
| Static | A plain bar, usually fixed to the top, no dropdowns. | 82 | Small sites with five or six destinations. |
| Dropdown | Items open a short list or panel underneath. | 122 | One or two items need a handful of sub-links. |
| Mega menu | A large panel with grouped columns, often descriptions, icons or a featured card. | 135 | Many products or audiences; the menu itself has to sell. |
| Full screen | The menu covers the page, often with photography or huge type. | 103 | Phones, and image-led brands (studios, architecture, property). |
| Sidebar | A vertical panel of links beside the content. | 45 | Apps, dashboards and documentation, not marketing pages. |
| Announcement | A slim strip above the bar with one message and a link. | 15 | A launch, an event or an offer, for a limited time. |
| Search bar | A search field in or under the navigation. | 10 | Large docs, help centres and libraries. |
| Breadcrumbs | A trail showing where the page sits. | 6 | Deep hierarchies such as docs and listings. |

## Patterns worth using

| Pattern | What it is | Best examples | In Observer |
|---|---|---|---|
| `audience-split` | The menu is organised by who the visitor is or what they want, not by product. | Relay (AngelList), Cal.com, HUTS, Wope | Solutions lists Brokerages, Agents, Developers, Investors |
| `icon-items` | Each item is an icon, a title and one short line. | Stripe, Column, Attio, Notion Calendar | Solutions items have a title and a line, no icon yet |
| `grouped-columns` | Items sit under small labels (By size, By partner). | Ramp, Stripe, Cloudflare | Not used: one group today |
| `intro-panel` | The first column explains the section in a sentence before the links. | Wealthsimple, Evervault, Relay | Not used |
| `featured-card` | One card in the menu promotes something specific, with an image. | Ramp, Sanity, Linear | Not used |
| `highlighted-cta` | One filled button in the bar; everything else is text. | Ramp, Titan, Clerk | Book a demo is the only filled button |
| `photo-backdrop` / `split-panel` | Full-screen menus that keep a photograph visible beside large links. | Andrematt, Michel Beaulieu, Heid, Real Template | Phone menu is a plain list on white |
| `contact-in-menu` | Phone, email or a field inside the menu itself. | Real Template, RRE Ventures | Not used |
| `announcement` | One slim line above the bar for news or an offer. | Clerk, Evervault, Titan, Together AI | Not used |
| `brand-colour` | The open menu uses the brand's colour, not a grey box. | Mistral, Warren and Mahoney, RRE Ventures | The bar turns transparent over dark photos |
| **Caution:** `many-columns` | Four to six dense columns of text. | Jasper, Cloudflare | Avoid: Observer has few destinations. Cloudflare only works because every column is labelled. |
| **Caution:** `ticker` | A scrolling line of news across the top. | Hex, Mesh | Avoid: moving text competes with the hero and fails reduced-motion users unless it stops. |

## Observer checklist

Before shipping a navigation change:

- [ ] One filled button in the bar (Book a demo). Sign in and the demo stay as text.
- [ ] Every dropdown opens on click and with the keyboard, closes on Escape and on a click outside, and has `aria-expanded` and `aria-controls`.
- [ ] Hover-only menus are not acceptable: touch screens and keyboards cannot hover.
- [ ] Menu item text is a destination, not a slogan, in English and Arabic.
- [ ] The phone menu traps focus, locks page scroll, and every target is at least 44px tall.
- [ ] Right to left: dropdowns open from the start edge, chevrons and arrows mirror.
- [ ] Over dark photography the bar is legible; once scrolled it gets a solid ground.
- [ ] The skip link still reaches `#main`.
- [ ] The bar is the same width as the page grid (1240px). Today it is 1180px: fix this when the nav is next touched.

## Ideas not yet built

- **Solutions menu with icons and an intro line** (after Stripe and Wealthsimple): add an icon to each audience and a one-sentence intro panel on the left ("Built for how property is sold in the Gulf").
- **Product as a small mega menu** (after Ramp): group the five product areas (Intelligence, Channels, Analytics, GCC market, Enterprise) with a featured card for the broker calculator or the night-shift film.
- **Phone menu with a photograph** (after Michel Beaulieu and Real Template): keep a Dubai photo at the top of the full-screen menu and put WhatsApp and the demo field at the bottom.
- **Announcement bar for launches** (after Clerk): one line, dismissible, only while there is real news.

## Reviewed entries

The 30 entries reviewed for Observer. Type and industry are the gallery's labels; patterns and notes are ours.

| # | Navbar | Type | Industry | Patterns | What makes it work | Links |
|---|---|---|---|---|---|---|
| 1 | Andrematt | Full screen | Real Estate | `full-screen`, `photo-backdrop`, `grouped-columns` | Full-screen menu over a dimmed photograph: six labelled groups in three columns with hairline rules, close X top left. Lets a real-estate brand show every section at once without leaving the mood. | [site](https://andermatt-realestate.ch/) · [gallery](https://www.navbar.gallery/navbar/andrematt) |
| 2 | HUTS | Mega menu | Real Estate | `mega-menu`, `illustrated-items`, `audience-split` | Cream mega menu listing housing types as cards, each with a small line illustration, a title and one line of description. The closest real-estate example of splitting a menu by what the visitor wants to buy. | [site](https://huts.com/) · [gallery](https://www.navbar.gallery/navbar/huts) |
| 3 | Michel Beaulieu | Full screen | Real Estate | `full-screen`, `side-panel`, `photo-backdrop` | The menu opens as a panel on the right over the property photo, with five large links, socials and a language switch at the bottom. The photo stays visible. | [site](https://michelbeaulieu.ca/en/) · [gallery](https://www.navbar.gallery/navbar/michel-beaulieu) |
| 4 | Real Template | Full screen | Real Estate | `full-screen`, `split-panel`, `contact-in-menu` | Split screen: agent photo, phone, email and address on the left, three huge links on the right. Contact details live inside the menu itself. | [site](https://realagent.framer.website/) · [gallery](https://www.navbar.gallery/navbar/real-template) |
| 5 | Ramp | Mega menu | Finance | `mega-menu`, `grouped-columns`, `featured-card`, `highlighted-cta` | White mega menu under a light bar: two link columns grouped By size and By partner, plus a featured news card. The active item gets a tinted pill; the yellow See a demo is the only filled button. | [site](https://ramp.com/welcome) · [gallery](https://www.navbar.gallery/navbar/ramp) |
| 6 | Wealthsimple | Mega menu | Finance | `mega-menu`, `two-row-bar`, `intro-panel` | Two-row bar (logo and account actions on top, product links below). The open menu has an intro panel on the left with a serif heading and one sentence, then uppercase-labelled link groups. | [site](https://www.wealthsimple.com/en-ca) · [gallery](https://www.navbar.gallery/navbar/wealthsimple) |
| 7 | Relay | Mega menu | Finance | `mega-menu`, `audience-split`, `intro-panel` | AngelList: a left rail of audiences (Fund Managers, Investors) with chevrons; choosing one swaps the right side, which has an overview card with an image and fund types with one-line descriptions. | [site](https://www.angellist.com/) · [gallery](https://www.navbar.gallery/navbar/relay) |
| 8 | Column | Dropdown | Finance | `dropdowns`, `icon-items`, `grouped-columns` | Wide dropdown under Products: two labelled groups (Infrastructure, Lending), every item an icon, a title and a short grey line. Dense but calm. | [site](https://column.com) · [gallery](https://www.navbar.gallery/navbar/column) |
| 9 | Cash App | Full screen | Finance | `full-screen`, `card-grid`, `dark` | Black full-screen menu: large product cards with images on the left, a plain list of actions and a secondary list of company links on the right, socials at the bottom. | [site](https://cash.app/) · [gallery](https://www.navbar.gallery/navbar/cash-app) |
| 10 | Evervault | Mega menu, Announcement | Finance | `mega-menu`, `announcement`, `pill-bar`, `dark` | Dark site with a one-line announcement bar above a pill-shaped centred nav. The menu has a description panel on the left and two labelled columns of icon items. | [site](https://evervault.com/) · [gallery](https://www.navbar.gallery/navbar/evervault) |
| 11 | Titan | Dropdown, Announcement | Investment | `dropdowns`, `announcement`, `centred-logo` | Grey announcement strip with a specific offer and Join Now link; the logo sits centred with links split either side and a yellow Get Started pill. | [site](https://www.titan.com/) · [gallery](https://www.navbar.gallery/navbar/titan) |
| 12 | Stripe | Dropdown | SaaS | `dropdowns`, `grouped-columns`, `icon-items`, `caret` | The classic: a white panel that drops from a small caret under the hovered item, a left column of product families, two columns of coloured-icon products with one-line descriptions. | [site](https://stripe.com/en-es) · [gallery](https://www.navbar.gallery/navbar/stripe) |
| 13 | Linear | Dropdown | SaaS | `dropdowns`, `feature-cards`, `dark` | Dark dropdown mixing a plain icon list (Issues, Cycles, Projects) with two image cards for the headline features, one tagged New. | [site](https://linear.app/) · [gallery](https://www.navbar.gallery/navbar/linear) |
| 14 | Attio | Dropdown | SaaS | `dropdowns`, `icon-items`, `two-level` | Product dropdown with icon features on the left and a second, text-only column of capabilities on the right; generous type and spacing. | [site](https://attio.com/) · [gallery](https://www.navbar.gallery/navbar/attio) |
| 15 | Cloudflare | Mega menu | SaaS | `mega-menu`, `many-columns`, `dark` | Full-width dark mega menu with six labelled columns (Compute, Storage, AI, Security...) of title plus description pairs. Works only because each column has a clear label. | [site](https://www.cloudflare.com/) · [gallery](https://www.navbar.gallery/navbar/cloudflare) |
| 16 | Clerk | Dropdown, Announcement | SaaS | `dropdowns`, `announcement`, `icon-items` | Black announcement strip with a funding headline and Read more; a light bar with a compact dropdown of icon items and descriptions. | [site](https://clerk.com/) · [gallery](https://www.navbar.gallery/navbar/clerk) |
| 17 | Cal.com | Mega menu | SaaS | `mega-menu`, `audience-split`, `use-case-grid` | Solutions menu split By team size (Individuals, Teams, Enterprises, Developers) and By use case (Sales, HR, Support...). Two ways into the same product. | [site](https://cal.com/) · [gallery](https://www.navbar.gallery/navbar/cal-com-2025) |
| 18 | Better Stack | Search bar | SaaS | `search-bar`, `sub-nav`, `dark` | A second row of tabs under the main bar for a section (Community, Guides, Questions...) and a search field in the page hero for the guides library. | [site](https://betterstack.com/community/guides/logging/) · [gallery](https://www.navbar.gallery/navbar/better-stack) |
| 19 | Remote | Sidebar | SaaS | `side-bar`, `app` | In-app sidebar: logo, current page highlighted, grouped sections under small labels with icons. Reference for the workspace app rather than the marketing site. | [site](https://remote.com/) · [gallery](https://www.navbar.gallery/navbar/remote) |
| 20 | Notion Calendar | Mega menu | SaaS | `mega-menu`, `icon-items`, `two-column` | Small two-column dropdown: colour icons for each product on the left, resources on the right, each with a one-line description. | [site](https://www.notion.so/product/calendar) · [gallery](https://www.navbar.gallery/navbar/notion-calendar) |
| 21 | Sanity | Mega menu | SaaS | `mega-menu`, `featured-card`, `dark` | Dark menu with a Platform column, a Feature highlight column, and a featured card with an illustration and its own Start building button. | [site](https://www.sanity.io/) · [gallery](https://www.navbar.gallery/navbar/sanity) |
| 22 | Mistral | Mega menu | AI | `mega-menu`, `brand-colour`, `grouped-columns` | Menu in the brand's warm orange gradient: Core products with chevrons, Apps and Pricing as labelled columns; the menu feels like part of the brand, not a grey box. | [site](https://mistral.ai/) · [gallery](https://www.navbar.gallery/navbar/mistral) |
| 23 | Hex Technologies | Mega menu, Announcement | AI | `mega-menu`, `announcement`, `ticker`, `centred-logo` | A scrolling ticker of short news lines across the very top; centred logo; the menu pairs Products with Capabilities and ends with an AI & agents row. | [site](https://hex.tech/) · [gallery](https://www.navbar.gallery/navbar/hex-2026) |
| 24 | Together AI | Dropdown, Announcement | AI | `dropdowns`, `announcement`, `pill-bar` | Bright blue announcement bar; pill-shaped nav; a minimal dropdown that is just four text links. Shows a dropdown need not be a mega menu. | [site](https://www.together.ai/) · [gallery](https://www.navbar.gallery/navbar/together-ai) |
| 25 | Jasper | Mega menu | AI | `mega-menu`, `many-columns`, `new-badges` | Very dense four-column menu with descriptions and New badges. A warning as much as a model: too much text to scan. | [site](https://www.jasper.ai/) · [gallery](https://www.navbar.gallery/navbar/jasper-2025) |
| 26 | Heid | Full screen | Architecture | `full-screen`, `split-panel`, `huge-type` | Half the screen is a photo, the other half three enormous links. Minimal and confident for a studio. | [site](https://heid.webflow.io/) · [gallery](https://www.navbar.gallery/navbar/heid) |
| 27 | Warren & Mahoney Architects | Full screen | Architecture | `full-screen`, `huge-type`, `brand-colour` | Solid colour full-screen menu with three giant words (Work, Practice, People), search and close top right. | [site](https://wam.studio) · [gallery](https://www.navbar.gallery/navbar/warren-mahoney-architects) |
| 28 | Mesh Architects | Full screen | Architecture | `full-screen`, `ticker`, `split-panel` | A scrolling hiring ticker above a split menu: photo left, coloured panel right with a dark-mode toggle and Close. | [site](https://www.mesharchitects.co.uk/) · [gallery](https://www.navbar.gallery/navbar/mesh-architects) |
| 29 | RRE Ventures | Full screen | Investment | `full-screen`, `subscribe-in-menu`, `brand-colour` | Blue full-screen menu with three large serif links and a newsletter field inside the menu. | [site](https://rre.com/) · [gallery](https://www.navbar.gallery/navbar/rre-ventures) |
| 30 | Wope | Mega menu | SaaS | `mega-menu`, `dark`, `audience-split` | Dark menu with a labelled For group (Agencies, Startups) and a Get started group (Partnership, Affiliate), each an icon, title and one line. | [site](https://wope.com/) · [gallery](https://www.navbar.gallery/navbar/wope) |

## Full catalogue

Every entry, grouped by type (an entry can appear under more than one). ★ marks a reviewed entry. "About" is the description the gallery shows for the site.

### Static (82)

| Navbar | Industry | About | Links |
|---|---|---|---|
| Agile by Design | Consulting | Making agile personal. | [site](https://www.agilebydesign.com/) · [gallery](https://www.navbar.gallery/navbar/agile-by-design) |
| Align UI | Design | A design system for Figma with over 5900 components. | [site](https://www.alignui.com/) · [gallery](https://www.navbar.gallery/navbar/align-ui) |
| Arc | SaaS | A browser that doesn’t just meet your needs — it anticipates them. | [site](https://arc.net/) · [gallery](https://www.navbar.gallery/navbar/arc) |
| Atelier de Troupe | eCommerce | Niche lighting and furniture brand inspired by Modernism, Art Deco, and cinema, taking a narrative approach to its collections. | [site](https://atelierdetroupe.com/) · [gallery](https://www.navbar.gallery/navbar/atelier-de-troupe) |
| Atoll Digital | Agency | Distinctive website solutions for leading and rising companies | [site](https://atolldigital.com/) · [gallery](https://www.navbar.gallery/navbar/atoll-digital) |
| Augen | AI | The first-of-its-kind AI Wearable Company. | [site](https://augen.pro/) · [gallery](https://www.navbar.gallery/navbar/augen) |
| Baptiste Glaymann | Portfolio | Paris-based Production Designer specializing in film, beauty, and luxury. | [site](https://baptisteglaymann.com/) · [gallery](https://www.navbar.gallery/navbar/baptiste-glaymann) |
| Brass Hands | Studio | Elevating B2B brands into market leaders. | [site](https://www.brasshands.com/) · [gallery](https://www.navbar.gallery/navbar/brass-hands) |
| Burner | Crypto | Burner is a small, secure computer that keeps your digital assets and identities safe. | [site](https://burner.pro/) · [gallery](https://www.navbar.gallery/navbar/burner) |
| Capital | Finance | Banking services for the needs of today's founders. | [site](https://capital.xyz/) · [gallery](https://www.navbar.gallery/navbar/capital) |
| Colabs | Studio | Supporting the transition to a circular bio-economy. | [site](https://colabs.com.au/) · [gallery](https://www.navbar.gallery/navbar/colabs) |
| Current | Finance | Banking that helps you make the most of your money. | [site](https://current.com/) · [gallery](https://www.navbar.gallery/navbar/current) |
| dancerobot | Food & Drink | Neon-lit '80s Japanese izakaya in Rittenhouse Square by chefs Jesse Ito & Justin Bacharach. | [site](https://dancerobotphl.com/) · [gallery](https://www.navbar.gallery/navbar/dancerobot) |
| Daytona | SaaS | Secure and Elastic Infrastructure for Running Your AI-Generated Code. | [site](https://www.daytona.io/) · [gallery](https://www.navbar.gallery/navbar/daytona) |
| Detail | Development | Deep scans of your codebase that find bugs you’ll be glad to know about. Security vulnerabilities, data loss, billing mistakes. | [site](https://detail.dev/) · [gallery](https://www.navbar.gallery/navbar/detail) |
| Dorst & Lesser | Social Media | Dorst & Lesser is a global social media agency based in Amsterdam, driven by a team of over 50 social media enthusiasts. | [site](https://dorstenlesser.com/) · [gallery](https://www.navbar.gallery/navbar/dorst-lesser) |
| Droppable | SaaS | Send large files from your Desktop in a couple of clicks. | [site](https://www.pixelwrld.co/droppable) · [gallery](https://www.navbar.gallery/navbar/droppable) |
| Early Majority | Retail | Outdoor clothing for all eventualities. | [site](https://www.earlymajority.com/) · [gallery](https://www.navbar.gallery/navbar/early-majority) |
| Eco | Crypto | Eco makes complex onchain actions a one-click stablecoin send. | [site](https://eco.com/) · [gallery](https://www.navbar.gallery/navbar/eco) |
| Eisner & Co. | Finance | ounded in Frankfurt, Eisner & Co. Bankhaus is a trusted partner to governments, corporations, and institutions worldwide. Rooted in German p | [site](https://eandco.framer.website/) · [gallery](https://www.navbar.gallery/navbar/eisner-co) |
| Elian Kent | Framer Template | Built with a striking dark theme, clean border grids, and a bold editorial aesthetic, this template delivers a portfolio experience that fee | [site](https://eliankent.framer.website/) · [gallery](https://www.navbar.gallery/navbar/elian-kent) |
| Espresso System | Development | The coordination layer for chains to create value for their users. | [site](https://www.espressosys.com/) · [gallery](https://www.navbar.gallery/navbar/espresso-system) |
| EventBeds | Event | The webs best hotel deals for events | [site](https://www.eventbeds.com/) · [gallery](https://www.navbar.gallery/navbar/eventbeds) |
| Factory | AI | Delegate software development tasks to agents called Droids. Droids take commands and deliver: pull requests, tickets, docs, and more. | [site](https://www.factory.ai/) · [gallery](https://www.navbar.gallery/navbar/factory) |
| Figr | AI | AI-Driven UI Design & Workflow | [site](https://figr.design/) · [gallery](https://www.navbar.gallery/navbar/figr) |
| Fly.io | Development | Developer-focused public cloud. | [site](https://fly.io/) · [gallery](https://www.navbar.gallery/navbar/fly-io) |
| Free Faces | Typography | This website is a curated collection of typefaces that are available under a variety of free licences somewhere on the interwebs. | [site](https://www.freefaces.gallery/) · [gallery](https://www.navbar.gallery/navbar/free-faces) |
| General Purpose | Digital Gallery | General Purpose is a space sifting the best of the web out of the noise. | [site](https://www.generalpurpose.directory/) · [gallery](https://www.navbar.gallery/navbar/general-purpose) |
| Genius by Diagram | AI | Your AI design companion | [site](https://genius-design.webflow.io/) · [gallery](https://www.navbar.gallery/navbar/genius-by-diagram) |
| Haley Park | Portfolio | The personal website and portfolio of Haley Park | [site](https://www.haleypark.design/) · [gallery](https://www.navbar.gallery/navbar/haley-park) |
| Heva Health | Health | Custom, connected wellness journeys. | [site](https://www.hevahealth.com/) · [gallery](https://www.navbar.gallery/navbar/heva-health) |
| Hillenbrand | Portfolio | Graphic designer with an addiction to detail and a love for storytelling. | [site](https://www.hillenbrand.xyz) · [gallery](https://www.navbar.gallery/navbar/hillenbrand) |
| humana studio | Studio | We design independent brands. Run by Ana Abreu and Tiago Narciso. | [site](https://www.humanastudio.com/) · [gallery](https://www.navbar.gallery/navbar/humana-studio) |
| Hungry Tiger | Food & Drink | Bold flavors from the kitchens of India. Crafted for those who crave more. | [site](https://www.eathungrytiger.com/) · [gallery](https://www.navbar.gallery/navbar/hungry-tiger) |
| Integrated Biosciences | Medicine | Unraveling complex biology with optogenetics, chemistry, and AI for small molecule therapeutic discovery. | [site](https://integratedbio.com/) · [gallery](https://www.navbar.gallery/navbar/integrated-biosciences) |
| Isomorphic Labs | Medicine | Digital biology company. | [site](https://www.isomorphiclabs.com/) · [gallery](https://www.navbar.gallery/navbar/isomorphic-labs) |
| JansenHarris | Agency | Building brave brands. | [site](https://jansenharris.com/) · [gallery](https://www.navbar.gallery/navbar/jansenharris) |
| Jordan Gilroy | Portfolio | Digital designer, creating visually captivating and functional websites that make a strong first impression. | [site](https://www.jordangilroy.com/) · [gallery](https://www.navbar.gallery/navbar/jordan-gilroy) |
| Karl Koch | Portfolio | Equal parts designer & developer | [site](https://kejk.tech/) · [gallery](https://www.navbar.gallery/navbar/karl-koch) |
| Koyeb | Development | Deploy intensive applications across GPUs, CPUs, and Accelerators in minutes - scale in 50+ locations | [site](https://www.koyeb.com/) · [gallery](https://www.navbar.gallery/navbar/koyeb) |
| L'Étude | Studio | Modular creative studio challenging creative boundaries. | [site](https://letude.group/) · [gallery](https://www.navbar.gallery/navbar/l-etude) |
| L'Étude | Studio | L'Étude is a modular creative studio offering multi-medium solutions, from simple designs to full-service creative direction, under the init | [site](https://letude.group/) · [gallery](https://www.navbar.gallery/navbar/letude) |
| Lassco | Health | Offer your employees personalized group insurance and retirement plan solutions with LASSCO. | [site](https://lassco.ca/) · [gallery](https://www.navbar.gallery/navbar/lassco) |
| Lue Studio | Studio | Lué Studio® is an end-to-end, powerhouse in digital design, development and direction. | [site](https://lue.studio/) · [gallery](https://www.navbar.gallery/navbar/lue-studio) |
| Maggie App | Fun | Your pocket guide to surviving parenthood, one activity at a time. | [site](https://maggie-app.com/) · [gallery](https://www.navbar.gallery/navbar/maggie-app) |
| Mum Studio | Studio | Boutique design studio for startups. | [site](https://www.mum.studio/) · [gallery](https://www.navbar.gallery/navbar/mum-studio) |
| Nitta Studio | Studio | Nitta Studio Co., Ltd. is a user interface (UI) production company established in 2020. | [site](https://nitta.studio/) · [gallery](https://www.navbar.gallery/navbar/nitta-studio) |
| OMSE | Studio | Brand identity studio. | [site](https://www.omse.co) · [gallery](https://www.navbar.gallery/navbar/omse) |
| Onverre | SaaS | Simple web analytics from data you trust. | [site](https://onverre.com/) · [gallery](https://www.navbar.gallery/navbar/onverre) |
| Opalhaus | Studio | Opalhaus turns vision into reality through bold design, branding, tech, and purposeful innovation. | [site](https://opalhaus.framer.website/) · [gallery](https://www.navbar.gallery/navbar/opalhaus) |
| Pebble | Automotive | California-based startup defining a new way to work, live and explore from anywhere with the 100% electric, hassle-free travel trailer. | [site](https://pebblelife.com/) · [gallery](https://www.navbar.gallery/navbar/pebble) |
| Peter Hulce | Portfolio | Webflow design, development, and upkeep with speed and precision. | [site](https://phd.so/) · [gallery](https://www.navbar.gallery/navbar/peter-hulce) |
| Plasticity | SaaS | Powerful solid and surface modeling, no subscription | [site](https://www.plasticity.xyz/) · [gallery](https://www.navbar.gallery/navbar/plasticity) |
| Polpis | Science | Polpis Systems is an open scientific experiment to advance hotter and deeper into the earth than ever before to produce GeoFusion energy. | [site](https://www.polpissystems.com/) · [gallery](https://www.navbar.gallery/navbar/polpis) |
| PostHog | Development | PostHog is open source product & data toolkit that helps you build successful products. | [site](https://posthog.com/) · [gallery](https://www.navbar.gallery/navbar/posthog) |
| Reflect | Productivity | All your notes, connected. | [site](https://reflect.app/) · [gallery](https://www.navbar.gallery/navbar/reflect) |
| Rekorder Studios | Studio | Carefully crafted studios and a community of colourful characters. | [site](https://www.rekorderstudios.com/) · [gallery](https://www.navbar.gallery/navbar/rekorder-studios) |
| Ribbit | Motion | Ribbit is a tight-knit team of animators, illustrators, and visual explorers, working with top-shelf companies to craft playful animations. | [site](https://ribbit.dk/) · [gallery](https://www.navbar.gallery/navbar/ribbit) |
| Rig.dev | Development | Rig.dev provides a developer-friendly application platform for Kubernetes. | [site](https://rig.dev/) · [gallery](https://www.navbar.gallery/navbar/rig-dev) |
| RRE | Venture Capital | Venture Capital company, backing the best for the distance. | [site](https://rre.com/) · [gallery](https://www.navbar.gallery/navbar/rre) |
| Scrintal | SaaS | Shape your ideas block by block | [site](https://scrintal.com/) · [gallery](https://www.navbar.gallery/navbar/scrintal) |
| Seen Advertising | Agency | All-in-one advertising agency. | [site](https://seenadvertising.agency/) · [gallery](https://www.navbar.gallery/navbar/seen-advertising) |
| Sienna | Framer Template | Showcase your talent with Sienna – a refined Framer template crafted for photographers and freelancers. With a sleek, modern layout, it high | [site](https://sienna.framer.photos/) · [gallery](https://www.navbar.gallery/navbar/sienna) |
| Solidroad | AI | Make every customer interaction better, faster, and more consistent with the optimization platform for human and AI agents. | [site](https://www.solidroad.com/) · [gallery](https://www.navbar.gallery/navbar/solidroad) |
| Somefolk | Portfolio | Portfolio website of Jason Harvey. | [site](https://www.somefolk.co/info) · [gallery](https://www.navbar.gallery/navbar/somefolk) |
| Supaste | MacOS App | Supaste saves your clipboard and screenshots in a beautiful visual history, automatically grouped by type, app, and custom categories, so yo | [site](https://www.supaste.com/) · [gallery](https://www.navbar.gallery/navbar/supaste) |
| SuperHeroes | Advertising | SuperHeroes helps a broad range of iconic brands grab attention. | [site](https://hellosuperheroes.com/) · [gallery](https://www.navbar.gallery/navbar/superheroes) |
| Superpower | Health | A health company that tests advanced blood biomarkers. | [site](https://www.superpower.com) · [gallery](https://www.navbar.gallery/navbar/superpower) |
| TensorStax | SaaS | Transforming natural-language requests into reliable, production-ready data transformations remains challenging. | [site](https://www.tensorstax.com/) · [gallery](https://www.navbar.gallery/navbar/tensorstax) |
| Tonemaki | Agency | Your go-to bespoke productized design service. | [site](https://www.tonemaki.com/) · [gallery](https://www.navbar.gallery/navbar/tonemaki) |
| Toormix | Studio | Created in 2000 in Barcelona by Ferran Mitjans and Oriol Armengou, Toormix is a mix of a brand consultancy, a design studio and a digital cr | [site](https://toormix.com/en/) · [gallery](https://www.navbar.gallery/navbar/toormix) |
| Traffic Productions | Agency | Service-oriented production house. | [site](https://www.traffic.productions/) · [gallery](https://www.navbar.gallery/navbar/traffic-productions) |
| Umrel | Design | Design system for accelerating development. | [site](https://umrel.com/) · [gallery](https://www.navbar.gallery/navbar/umrel) |
| Vicio | Food & Drink | Burger chain based in Spain. | [site](https://vicio.com/) · [gallery](https://www.navbar.gallery/navbar/vicio) |
| Vinay | Portfolio | A product designer specialising in crafting seamless websites, mobile apps, delightful micro interactions. | [site](https://vinay.design/) · [gallery](https://www.navbar.gallery/navbar/vinay) |
| Visual Domain | Video | The go-to Australian storytelling studio for global video production and animation. | [site](https://www.visualdomain.com.au/) · [gallery](https://www.navbar.gallery/navbar/visual-domain) |
| Vorta Studio | Studio | Framer template - At Vorta, we help companies build stronger brands, better products, and websites that actually perform. | [site](https://vorta.framer.website/) · [gallery](https://www.navbar.gallery/navbar/vorta-studio) |
| WaxyWab | Agency | Elevate your brand with bold designs, smart strategies, and real results. At WaxyWeb, we turn ideas into extraordinary realities. Let’s crea | [site](https://www.waxyweb.agency/) · [gallery](https://www.navbar.gallery/navbar/waxywab) |
| Wimp Decaf Coffee Co | Food & Drink | A delicious decaf brand with choices. | [site](https://www.wimpdecaf.com/) · [gallery](https://www.navbar.gallery/navbar/wimp-decaf-coffee-co) |
| ysabella | Portfolio | Creative porfolio website. | [site](https://www.ysabella.me/) · [gallery](https://www.navbar.gallery/navbar/ysabella) |
| Yummygum | Studio | Yummygum is a digital product agency. We help tech scale-ups take their platform from good to 'wow'. | [site](https://yummygum.com/) · [gallery](https://www.navbar.gallery/navbar/yummygum) |
| Zenwood Studio | Studio | esigning and building sites that wow visitors and win customers | [site](https://zenwood.studio/) · [gallery](https://www.navbar.gallery/navbar/zenwood-studio) |

### Dropdown (122)

| Navbar | Industry | About | Links |
|---|---|---|---|
| Aave | Crypto | Earn up to 6.50% on your stablecoins with industry-leading interest rates and balance protection up to $1mm. | [site](https://aave.com/) · [gallery](https://www.navbar.gallery/navbar/aave) |
| AccessGrid | Security | The platform for mobile keys in Apple/Google Wallet | [site](https://www.accessgrid.com/) · [gallery](https://www.navbar.gallery/navbar/accessgrid) |
| ai.work | – | Autonomous AI Workers designed for internal operations teams - IT, HR, Procurement, Legal and beyond. | [site](https://www.ai.work/) · [gallery](https://www.navbar.gallery/navbar/ai-work) |
| AlignUI | – | Flexible components, consistent UI, quick development, easy integration. | [site](https://www.alignui.com/) · [gallery](https://www.navbar.gallery/navbar/alignui) |
| Arrows | SaaS | Collaborative customer onboarding for teams using HubSpot. | [site](https://arrows.to/) · [gallery](https://www.navbar.gallery/navbar/arrows) |
| Ask Phill | Agency | The European Shopify Agency developing the future of commerce. | [site](https://askphill.com/) · [gallery](https://www.navbar.gallery/navbar/ask-phill) |
| Assurestor | Technology | The A to Z of modern business protection – in any data disaster. | [site](https://www.assurestor.com) · [gallery](https://www.navbar.gallery/navbar/assurestor) |
| Attio ★ | SaaS | Flexible and data-driven CRM Platform that can be customized for the needs of your business. | [site](https://attio.com/) · [gallery](https://www.navbar.gallery/navbar/attio) |
| Bequant | AI | Artificial Intelligence to improve the performance of your network. | [site](https://www.bequant.com/) · [gallery](https://www.navbar.gallery/navbar/bequant) |
| Bolt | D2C (Direct to Consumer) | Lightning-fast checkout. | [site](https://www.bolt.com/) · [gallery](https://www.navbar.gallery/navbar/bolt) |
| Bored Cow | Food & Drink | A new kind of milk alternative made with milk protein from fermentation instead of cows. | [site](https://tryboredcow.com/) · [gallery](https://www.navbar.gallery/navbar/bored-cow) |
| Brainfish | AI | Brainfish learns from your product videos and data to deliver AI agents that contextually support users across every channel. | [site](https://www.brainfishai.com/) · [gallery](https://www.navbar.gallery/navbar/brainfish) |
| Browserbase | SaaS | Browserbase makes the web as reliable and programmable as APIs | [site](https://www.browserbase.com/) · [gallery](https://www.navbar.gallery/navbar/browserbase) |
| Burner | Crypto | Burner is a small, secure computer that keeps your digital assets and identities safe. | [site](https://burner.pro/) · [gallery](https://www.navbar.gallery/navbar/burner) |
| CallSine | AI | CallSine goes beyond basic AI with autonomous agents that research, generate, and deploy outreach automatically. | [site](https://callsine.com/) · [gallery](https://www.navbar.gallery/navbar/callsine) |
| Campfire | Finance | Campfire is the AI-first ERP powering next-gen finance & accounting teams. General ledger, revenue automation, close management, and so much | [site](https://meetcampfire.com/) · [gallery](https://www.navbar.gallery/navbar/campfire) |
| Cleanforms | eCommerce | A truly effective Vitamin D formulation. | [site](https://cleanforms.co/) · [gallery](https://www.navbar.gallery/navbar/cleanforms) |
| CleanSpace | Architecture | CleanSpace designs, manufactures, and installs the world’s most advanced controlled spaces (clean spaces) using its design-to-deliver approa | [site](https://www.cleanspaceus.com/) · [gallery](https://www.navbar.gallery/navbar/cleanspace) |
| Clerk ★ | SaaS | User management platform. | [site](https://clerk.com/) · [gallery](https://www.navbar.gallery/navbar/clerk) |
| Column ★ | Finance | A nationally chartered bank built to enable developers and builders to create new financial products. | [site](https://column.com) · [gallery](https://www.navbar.gallery/navbar/column) |
| Commure | Health | We build software and AI experiences that simplify provider, administrator, and patient workflows. | [site](https://www.commure.com/) · [gallery](https://www.navbar.gallery/navbar/commure) |
| Compound Planning | Finance | Modern wealth management, built for people in tech. | [site](https://compoundplanning.com) · [gallery](https://www.navbar.gallery/navbar/compound-planning) |
| CPHFW '25 | Art | A collaboration between Samsøe Samsøe and Octarine. | [site](https://cphfw25.samsoe.com/) · [gallery](https://www.navbar.gallery/navbar/cphfw-25) |
| Craft | Productivity | Your space for notes, tasks, and big ideas | [site](https://www.craft.do/) · [gallery](https://www.navbar.gallery/navbar/craft) |
| Distributional | AI | Rely on your AI with Distributional — the only adaptive testing platform built for enterprise AI applications. | [site](https://www.distributional.com/) · [gallery](https://www.navbar.gallery/navbar/distributional) |
| Ditto Words | Writing | Build and manage your team’s single source of truth for product copy — from draft to design to deploy. | [site](https://www.dittowords.com/) · [gallery](https://www.navbar.gallery/navbar/ditto-words) |
| Duna | SaaS | Meet the platform that accelerates business onboarding, automates manual work and grows revenue. | [site](https://duna.com/) · [gallery](https://www.navbar.gallery/navbar/duna) |
| Ease Health | AI | Admit more patients, reduce staff burden, and get paid faster with an AI-native system built for behavioral healthcare. | [site](https://easehealth.com/) · [gallery](https://www.navbar.gallery/navbar/ease-health) |
| Effortel | SaaS | Streamline Operations, Skyrocket Revenue, and Delight Customers | [site](https://www.effortel.com/) · [gallery](https://www.navbar.gallery/navbar/effortel) |
| Energy Park | Automotive | Tailored and affordable smart EV charge point solutions. | [site](https://energy-park.co.uk/) · [gallery](https://www.navbar.gallery/navbar/energy-park) |
| Enpower Trading | Investment | Accelerating private investment. | [site](https://enpowertrading.co.za/) · [gallery](https://www.navbar.gallery/navbar/empower-trading) |
| Equals | Finance | The spreadsheet you’ve always wanted—connected to your data, built for real-time insights. | [site](https://equals.com/) · [gallery](https://www.navbar.gallery/navbar/equals-2025) |
| Equals | SaaS | Automate your reporting with precision. | [site](https://equals.com/) · [gallery](https://www.navbar.gallery/navbar/equals) |
| Espresso System | Development | The coordination layer for chains to create value for their users. | [site](https://www.espressosys.com/) · [gallery](https://www.navbar.gallery/navbar/espresso-system) |
| Fable | Studio | The modern creative studio. | [site](https://www.fable.app/) · [gallery](https://www.navbar.gallery/navbar/fable) |
| Factory | SaaS | Delegate software development tasks to agents called Droids. Droids take commands and deliver: pull requests, tickets, docs, and more. | [site](https://factory.ai/) · [gallery](https://www.navbar.gallery/navbar/factory-2) |
| Fey | Investment | Fey turns complex data, gated tools, and noisy news into instant earnings alerts, clear summaries, and a beautiful interface—so anyone can s | [site](https://www.fey.com/) · [gallery](https://www.navbar.gallery/navbar/fey) |
| Five Pathways Financial | Finance | A retirement roadmap for everyone. | [site](https://fivepathways.com/) · [gallery](https://www.navbar.gallery/navbar/five-pathways-financial) |
| Fly.io | Development | Developer-focused public cloud. | [site](https://fly.io/) · [gallery](https://www.navbar.gallery/navbar/fly-io) |
| Framer | Development | Build a Beautiful Website — Build a site with Framer, the website builder loved by designers and high-velocity teams. | [site](https://www.framer.com/) · [gallery](https://www.navbar.gallery/navbar/framer) |
| Fruitful | Finance | A partner and a platform that make money simple. | [site](https://www.fruitful.com/) · [gallery](https://www.navbar.gallery/navbar/fruitful) |
| Félix Péault | Architecture | Showcasing charismatic houses around the world. | [site](https://housesof.world/) · [gallery](https://www.navbar.gallery/navbar/felix-peault) |
| Giga AI | AI | AI that talks like a human. Handles millions of calls. | [site](https://giga.ai/) · [gallery](https://www.navbar.gallery/navbar/giga-ai) |
| GitButler | Development | A Git client for simultaneous branches on top of your existing workflow. | [site](https://gitbutler.com/) · [gallery](https://www.navbar.gallery/navbar/gitbutler) |
| Greptile | AI | AI agents that catch bugs in your pull requests with full context of your codebase. | [site](https://www.greptile.com/) · [gallery](https://www.navbar.gallery/navbar/greptile) |
| Half Past Nine | Marketing | Engineering growth marketing machines for brands. | [site](https://www.halfpastnine.io/) · [gallery](https://www.navbar.gallery/navbar/half-past-nine) |
| Hashnode | SaaS | Effortlessly build blogs, API docs, and product guides with Hashnode, with the flexibility of a headless CMS and more. | [site](https://hashnode.com/) · [gallery](https://www.navbar.gallery/navbar/hashnode) |
| Hex.tech | AI | Collaborative, AI-powered workspace. | [site](https://hex.tech/) · [gallery](https://www.navbar.gallery/navbar/hex-tech) |
| Hiking Patrol | Retail | A curated digital space for lifestyle and outdoor exploration. | [site](https://hikingpatrol.com/) · [gallery](https://www.navbar.gallery/navbar/hiking-patrol) |
| Hosier Brown | Portfolio | Modern Framer portfolio template. | [site](https://hosierbrown.framer.website/) · [gallery](https://www.navbar.gallery/navbar/hosier-brown) |
| huly | SaaS | Process, project, time, and knowledge management platform. | [site](https://huly.io/) · [gallery](https://www.navbar.gallery/navbar/huly) |
| illo | Studio | Design studio with focus on motion design, illustration and art direction. | [site](https://illo.tv/) · [gallery](https://www.navbar.gallery/navbar/illo) |
| Instant | SaaS | Instant helps you build high-converting landing pages and sections fast, with no-code required. | [site](https://instant.so/) · [gallery](https://www.navbar.gallery/navbar/instant) |
| Invertase | Technology | Invertase make developer tools, SDKs, and libraries for the open-source ecosystem. | [site](https://invertase.io/) · [gallery](https://www.navbar.gallery/navbar/invertase) |
| Isa de Burgh | Portfolio | Creative director, brand builder, and storyteller. | [site](https://isadeburgh.com/) · [gallery](https://www.navbar.gallery/navbar/isa-de-burgh) |
| Jellypepper | Agency | Jellypepper is a small team of designers and developers who are excited to help you bring your idea to life. We design and build beautiful b | [site](https://jellypepper.com/) · [gallery](https://www.navbar.gallery/navbar/jellypepper) |
| June | SaaS | Product analytics designed to help you retain more customers. | [site](https://www.june.so/) · [gallery](https://www.navbar.gallery/navbar/june) |
| Kaizen Labs | Health | A company working with cities, crafting unique solutions that help communities thrive. | [site](https://www.kaizenlabs.co/) · [gallery](https://www.navbar.gallery/navbar/kaizen-labs) |
| Kota | eCommerce | Access leading insurance and retirement providers globally. | [site](https://www.kota.io/) · [gallery](https://www.navbar.gallery/navbar/kota) |
| Lantern | AI | Let AI agents mine your tech stack for revenue signals and transform them into actionable opportunities. | [site](https://www.withlantern.com/) · [gallery](https://www.navbar.gallery/navbar/lantern) |
| Lattice | SaaS | Lattice is a people management platform that helps you make the most of your talent. | [site](https://lattice.com/) · [gallery](https://www.navbar.gallery/navbar/lattice) |
| Letta | SaaS | Create agents that remember everything, learn continuously, and improve themselves over time. | [site](https://www.letta.com) · [gallery](https://www.navbar.gallery/navbar/letta) |
| Linear ★ | SaaS | Linear helps to streamline issues, sprints, and product roadmaps. | [site](https://linear.app/) · [gallery](https://www.navbar.gallery/navbar/linear) |
| Manychat | Social Media | Sell more, engage better, and grow your audience with powerful automations for Instagram, WhatsApp, TikTok, and Messenger. | [site](https://manychat.com/) · [gallery](https://www.navbar.gallery/navbar/manychat) |
| Markopolo | AI | Reach 30–40% more customers with personal outreach at scale. | [site](https://markopolo.ai/) · [gallery](https://www.navbar.gallery/navbar/markopolo) |
| Mercu | AI | AI assistant for workforce. | [site](https://www.mercu.com/) · [gallery](https://www.navbar.gallery/navbar/mercu) |
| Mixpanel | SaaS | Simple and powerful product analytics. | [site](https://mixpanel.com/) · [gallery](https://www.navbar.gallery/navbar/mixpanel) |
| Mobbin Design | Design | Extensive curated library of the best apps and websites. | [site](https://mobbin.com) · [gallery](https://www.navbar.gallery/navbar/mobbin-design) |
| Mockuuups Studio | Design | Drag-and-drop tool for creating beautiful app previews or any marketing materials. Easily insert your screenshot into device and print mocku | [site](https://mockuuups.studio/) · [gallery](https://www.navbar.gallery/navbar/mockuuups-studio) |
| Modul | Productivity | Task manager, planner & calendar. | [site](https://www.modul.day/en) · [gallery](https://www.navbar.gallery/navbar/modul) |
| No-code Supply Co | Development | Hand-picked no-code inspiration, code, tools, and resources. | [site](https://www.nocodesupply.co) · [gallery](https://www.navbar.gallery/navbar/no-code-supply-co) |
| Nominal | Technology | Nominal powers mission-critical engineering work across aerospace, energy, automotive, and defense. Automation, analytics, and operations –  | [site](https://nominal.io/) · [gallery](https://www.navbar.gallery/navbar/nominal) |
| Obsidianos | SaaS | AI-powered practice management available now - with integrated custody and execution launching soon. | [site](https://obsidianos.com/) · [gallery](https://www.navbar.gallery/navbar/obsidianos) |
| On | eCommerce | Global sportswear brand defined by innovation. | [site](https://www.on.com/en-us) · [gallery](https://www.navbar.gallery/navbar/on) |
| Ona | Development | Run API-first, sandboxed development environments with full OS-level isolation. Pre-configured with all your tools, dependencies, and contro | [site](https://ona.com/) · [gallery](https://www.navbar.gallery/navbar/ona) |
| Opal | Electronics | Electronics company making cameras. | [site](https://opalcamera.com/) · [gallery](https://www.navbar.gallery/navbar/opal) |
| Orchid | SaaS | Orchid is your EA. It keeps your inbox, calendar, and follow-ups moving, so you stay focused on the work that matters. | [site](https://orchid.ai/) · [gallery](https://www.navbar.gallery/navbar/orchid) |
| Portal Gaming | Gaming | Portal is the universal liquidity network connecting developers with users anywhere. | [site](https://portalgaming.com/) · [gallery](https://www.navbar.gallery/navbar/portal-gaming) |
| Profound | AI | Reach millions of consumers who are using AI to discover new products and brands | [site](https://www.tryprofound.com/) · [gallery](https://www.navbar.gallery/navbar/profound) |
| Qatalog | AI | AI that works with your data | [site](https://qatalog.com/) · [gallery](https://www.navbar.gallery/navbar/qatalog) |
| Qechua Lookbook 2025 | Retail | The new Decathlon hiking collection is the ultimate invitation to explore the great outdoors, where cutting-edge technology meets contempora | [site](https://quechua-lookbook.com/ss25/) · [gallery](https://www.navbar.gallery/navbar/quechua-lookbook) |
| RAWLINE | Framer Template | E-Commerce template, RAWLINE, built in Framer with Framer Commerce is on the way. | [site](https://rawline.framer.website/) · [gallery](https://www.navbar.gallery/navbar/rawline) |
| Rayon | Architecture | The next generation CAD software for interior designers and architects. | [site](https://www.rayon.design/) · [gallery](https://www.navbar.gallery/navbar/rayon) |
| Reevo | AI | One unified platform for your entire GTM team, from first touch to closed won. Finally, everything just works together. | [site](https://reevo.ai) · [gallery](https://www.navbar.gallery/navbar/reevo) |
| Rekorder Studios | Studio | Carefully crafted studios and a community of colourful characters. | [site](https://www.rekorderstudios.com/) · [gallery](https://www.navbar.gallery/navbar/rekorder-studios) |
| Relume Library | Design | An agency with a mission to help web designers win in the era of no-code and generative AI | [site](https://www.relume.io/) · [gallery](https://www.navbar.gallery/navbar/relume-library) |
| reOrc | SaaS | For leaders ready to get more from their data, ReOrc builds an AI agent network that works around the clock, uncovering opportunities and dr | [site](https://reorc.com/) · [gallery](https://www.navbar.gallery/navbar/reorc) |
| Retool | Development | The best way to build internal software. Seamlessly connect databases, build with elegant components, and customize with code. | [site](https://retool.com/) · [gallery](https://www.navbar.gallery/navbar/retool) |
| Roman Tesliuk | Portfolio | Product designer portfolio website. | [site](https://www.pixelwrld.co/) · [gallery](https://www.navbar.gallery/navbar/roman-tesliuk) |
| Runway | Finance | Modern and intuitive finance platform. | [site](https://runway.com/) · [gallery](https://www.navbar.gallery/navbar/runway-2025) |
| Seed | Health | Daily essentials for nutrition and digestive health. | [site](https://seed.com/) · [gallery](https://www.navbar.gallery/navbar/seed) |
| Semplice | Development | WordPress-based portfolio tool. | [site](https://www.semplice.com/) · [gallery](https://www.navbar.gallery/navbar/semplice) |
| Sketch | Design | An app for designing, prototyping. | [site](https://www.sketch.com/) · [gallery](https://www.navbar.gallery/navbar/sketch) |
| Skiff Website | SaaS | A privacy end-to-end encrypted mail, drive, notes and calendar. | [site](https://skiff.com/) · [gallery](https://www.navbar.gallery/navbar/skiff-website) |
| SOHub | Agency | An unusual digital agency focusing on transforming your vision into a captivating digital experience. | [site](https://sohub.digital/) · [gallery](https://www.navbar.gallery/navbar/sohub) |
| Spaces | Design | Cooperative building portal to the design world. | [site](https://spaces.is/) · [gallery](https://www.navbar.gallery/navbar/spaces) |
| Spellbook | Legal | Draft and review contracts 10x faster, just like magic. | [site](https://www.spellbook.legal/main) · [gallery](https://www.navbar.gallery/navbar/spellbook) |
| Stripe ★ | SaaS | Payment infrastructure for businesses and individuals. | [site](https://stripe.com/en-es) · [gallery](https://www.navbar.gallery/navbar/stripe) |
| SummerRain | Food & Drink | Ceremonial quality matcha from the hills of Kyoto. | [site](https://www.getsummerrain.de/) · [gallery](https://www.navbar.gallery/navbar/summerrain) |
| Supernotes | Productivity | Efficient note-taking without the hassle. | [site](https://supernotes.app/) · [gallery](https://www.navbar.gallery/navbar/supernotes) |
| Tedy | SaaS | Where modern benefits meet clever compensation | [site](https://www.tedy.app/) · [gallery](https://www.navbar.gallery/navbar/tedy) |
| Throxy | SaaS | We run your entire outbound using our own custom-built tech that uncovers niche-specific data, delivers unique messaging at scale, and keeps | [site](https://throxy.com/) · [gallery](https://www.navbar.gallery/navbar/throxy) |
| Tines | SaaS | Builder of processes and automations. | [site](https://www.tines.com/) · [gallery](https://www.navbar.gallery/navbar/tines) |
| Titan ★ | Investment | Award winning investment management company. | [site](https://www.titan.com/) · [gallery](https://www.navbar.gallery/navbar/titan) |
| ToDesktop | SaaS | Release, Secure and Scale your Electron App. | [site](https://www.todesktop.com/) · [gallery](https://www.navbar.gallery/navbar/todesktop) |
| Together AI ★ | AI | Cloud platform for building and running generative AI. | [site](https://www.together.ai/) · [gallery](https://www.navbar.gallery/navbar/together-ai) |
| Tola | Finance | Tola makes it easy for SMBs to pay suppliers, send invoices and gain control over business cash flow in one place. | [site](https://www.tolahq.com/) · [gallery](https://www.navbar.gallery/navbar/tola) |
| Trullion | Finance | Trullion is an accounting oversight platform that uses AI to simplify revenue recognition, lease accounting, and audit workflows. | [site](https://trullion.com) · [gallery](https://www.navbar.gallery/navbar/trullion) |
| Trunk | Productivity | Helping teams build software better, faster. | [site](https://trunk.io/) · [gallery](https://www.navbar.gallery/navbar/trunk) |
| Truus | Agency | Audiences are more scattered and more reachable than ever. We help brands become leaders on the channels of the new mainstream. An agency bu | [site](https://truus.co/) · [gallery](https://www.navbar.gallery/navbar/truus) |
| Tux & Karma | Agency | A creative team that raises awareness to social and climate justice issues. | [site](https://tuxkarma.co/en/) · [gallery](https://www.navbar.gallery/navbar/tux-karma) |
| Twenty | SaaS | Twenty gives technical teams the building blocks for a custom CRM that meets complex business needs and quickly adapts as the business evolv | [site](https://twenty.com/) · [gallery](https://www.navbar.gallery/navbar/twenty) |
| Uniswap | Crypto | Swap or provide liquidity on the Uniswap Protocol. | [site](https://app.uniswap.org/) · [gallery](https://www.navbar.gallery/navbar/uniswap-dropdown) |
| Unlearn AI | AI | Simulate outcomes for every participant at the beginning of your clinical study. | [site](https://www.unlearn.ai/) · [gallery](https://www.navbar.gallery/navbar/unlearn-ai) |
| Visitors | SaaS | Understand your visitors and how they engage with your website or product in realtime. | [site](https://visitors.now/) · [gallery](https://www.navbar.gallery/navbar/visitors) |
| Walrus | SaaS | Scalable storage that lets you publish, deliver, and program any data, onchain | [site](https://www.walrus.xyz/) · [gallery](https://www.navbar.gallery/navbar/walrus) |
| Winden | Finance | Financial platform for running your business. | [site](https://www.winden.co/) · [gallery](https://www.navbar.gallery/navbar/winden) |
| Windsurf | Development | The Windsurf Editor is where the work of developers and AI truly flow together, allowing for a coding experience that feels like literal mag | [site](https://windsurf.com/) · [gallery](https://www.navbar.gallery/navbar/windsurf) |
| Wiza | SaaS | Wiza is a sales prospecting & engagement platform. | [site](https://wiza.co) · [gallery](https://www.navbar.gallery/navbar/wiza) |
| Woof Gang | Colorful | Dog groomers you can rely on. | [site](https://www.woofgangftl.com/) · [gallery](https://www.navbar.gallery/navbar/woof-gang) |
| WorkOS | Design | WorkOS is a set of building blocks for quickly adding enterprise features to your app. | [site](https://workos.com) · [gallery](https://www.navbar.gallery/navbar/workos) |
| Wrangle | SaaS | Wrangle lets you source in natural language, engage candidates at scale, and interview with intelligence. | [site](https://wrangle.ai/) · [gallery](https://www.navbar.gallery/navbar/wrangle) |

### Mega menu (135)

| Navbar | Industry | About | Links |
|---|---|---|---|
| 1x | Elegant | 1X designs androids that work alongside people. | [site](https://www.1x.tech/) · [gallery](https://www.navbar.gallery/navbar/1x) |
| AccessGrid | Security | The platform for mobile keys in Apple/Google Wallet | [site](https://www.accessgrid.com/) · [gallery](https://www.navbar.gallery/navbar/accessgrid) |
| Adaline | AI | The single platform to iterate, evaluate, deploy, and monitor LLMs | [site](https://www.adaline.ai/) · [gallery](https://www.navbar.gallery/navbar/adaline) |
| Amplemarket | AI | Empower reps, uncover opportunities, and grow revenue with an all-in-one AI platform. | [site](https://www.amplemarket.com/) · [gallery](https://www.navbar.gallery/navbar/amplemarket) |
| Ankar AI | AI | Elevate your patent lifecycle with AI powered tools that adapt to your team and workflow. Secure by design, precise in execution. | [site](https://ankar.ai/) · [gallery](https://www.navbar.gallery/navbar/ankar-ai) |
| Asana | SaaS | Supercharge your teams with AI that gets work done | [site](https://escape.cafe/fr?ref=navbar.gallery) · [gallery](https://www.navbar.gallery/navbar/asana) |
| Athleats | Health | Discover a wide-range of recipes crafted to fuel your training, optimize recovery, and help you achieve your best self. | [site](https://www.weareathleats.com/) · [gallery](https://www.navbar.gallery/navbar/athleats) |
| Awwwards | Design | Awwwards are the Website Awards that recognize and promote the talent and effort of the best developers, designers and web agencies in the w | [site](https://www.awwwards.com/) · [gallery](https://www.navbar.gallery/navbar/awwwards) |
| Baselayer | Security | Make your first line of fraud defence your strongest. | [site](https://baselayer.com/) · [gallery](https://www.navbar.gallery/navbar/baselayer) |
| BLCK CLD COLLECTIVE | Music | Unleashing the next wave of sonic innovation. | [site](https://blckcldcollective.com/) · [gallery](https://www.navbar.gallery/navbar/blck-cld-collective) |
| Bloxs | SaaS | The all-in-one solution for the Capital Markets | [site](https://bloxs.com.br/en) · [gallery](https://www.navbar.gallery/navbar/bloxs) |
| Brew | SaaS | Create stunning, on-brand emails with AI. | [site](https://brew.new/) · [gallery](https://www.navbar.gallery/navbar/brew) |
| Cake Equity | Startup | Equity platform for fast-growing startups. | [site](https://www.cakeequity.com/) · [gallery](https://www.navbar.gallery/navbar/cake-equity) |
| Cal.com ★ | SaaS | The better way to schedule your meetings | [site](https://cal.com/) · [gallery](https://www.navbar.gallery/navbar/cal-com-2025) |
| Canopy | Development | Canopy is a cloud-based accounting practice management software. | [site](https://www.canopyservicing.com/) · [gallery](https://www.navbar.gallery/navbar/canopy) |
| Cartage | SaaS | Meet Wilson—AI for logistics, built for manufacturers and distributors. | [site](https://www.cartage.ai/) · [gallery](https://www.navbar.gallery/navbar/cartage) |
| Chesapeake Plywood | Construction | Premium, wholesale specialty wood solutions partner serving visionary makers. | [site](https://chesapeakeplywood.com/) · [gallery](https://www.navbar.gallery/navbar/chesapeake-plywood) |
| Circle | SaaS | A home for your community, events, and courses. | [site](https://circle.so/) · [gallery](https://www.navbar.gallery/navbar/circle-so) |
| Clay | SaaS | Access 100+ premium data sources and AI research agents in one platform, then automate growth workflows to turn insights into revenue. | [site](https://www.clay.com/) · [gallery](https://www.navbar.gallery/navbar/clay) |
| Cloudflare ★ | SaaS | One platform for your apps, agents, and workforce. Build, secure, and scale without managing infrastructure. | [site](https://www.cloudflare.com/) · [gallery](https://www.navbar.gallery/navbar/cloudflare) |
| Coda | SaaS | Coda is a global leader in out-of-app monetization and commerce solutions, trusted by over 300 publishers to drive revenue growth and deepen | [site](https://www.coda.co/) · [gallery](https://www.navbar.gallery/navbar/coda) |
| Consensys | Finance | Building the era of Decentralized Finance. | [site](https://consensys.io/) · [gallery](https://www.navbar.gallery/navbar/consensys) |
| Contra | Startup | Build, manage and grow your flexible workforce — all in one place. | [site](https://contra.com/home) · [gallery](https://www.navbar.gallery/navbar/contra) |
| Craftwork | Design | Premium web design resources for busy creatives | [site](https://craftwork.design/) · [gallery](https://www.navbar.gallery/navbar/craftwork) |
| Crescent | Finance | Crescent is committed to building the most-loved financial services and software in the world. | [site](https://www.getcrescent.com/) · [gallery](https://www.navbar.gallery/navbar/crescent) |
| Customer.io | SaaS | Customer engagement platform. | [site](https://customer.io/) · [gallery](https://www.navbar.gallery/navbar/customer-io) |
| Daylit | SaaS | We ensure 100% of your invoices are paid on time by transporting your entire A/R process into the AI era within days of going live. | [site](https://www.daylit.com/) · [gallery](https://www.navbar.gallery/navbar/daylit) |
| Default | SaaS | Unlock inbound growth with one platform that automates scheduling, routing, and enrichment workflows. | [site](https://www.default.com/) · [gallery](https://www.navbar.gallery/navbar/default) |
| Descript | SaaS | Descript is the AI-powered, fully featured, end-to-end video editor that you already know how to use. | [site](https://www.descript.com/) · [gallery](https://www.navbar.gallery/navbar/descript) |
| Doss | SaaS | DOSS Operations Cloud is the ERP evolved | [site](https://www.doss.com/) · [gallery](https://www.navbar.gallery/navbar/doss) |
| Dovetail | Productivity | Turn calls, docs, and user feedback into insights, like magic. | [site](https://dovetail.com/) · [gallery](https://www.navbar.gallery/navbar/dovetail) |
| Droid | Development | Droip is a no-code, drag-and-drop WordPress builder that simplifies website creation with powerful capabilities. | [site](https://droip.com/) · [gallery](https://www.navbar.gallery/navbar/droid) |
| Dub | SaaS | Dub is the modern link attribution platform for short links, conversion tracking, and affiliate programs. | [site](https://dub.co/) · [gallery](https://www.navbar.gallery/navbar/dub) |
| Effortel | SaaS | Streamline Operations, Skyrocket Revenue, and Delight Customers | [site](https://www.effortel.com/) · [gallery](https://www.navbar.gallery/navbar/effortel) |
| Engine | Travel | The all-in-one engine for Business Travel | [site](https://engine.com/) · [gallery](https://www.navbar.gallery/navbar/engine) |
| Evervault ★ | Finance | Flexible payment security. | [site](https://evervault.com/) · [gallery](https://www.navbar.gallery/navbar/evervault) |
| Featurebase | SaaS | Support your customers with AI, collect feedback, and announce product updates — all with one tool. | [site](https://www.featurebase.app/) · [gallery](https://www.navbar.gallery/navbar/featurebase) |
| Figma Community | Design | Community made resources and plugins. | [site](https://www.figma.com/community) · [gallery](https://www.navbar.gallery/navbar/figma-community) |
| Finch | SaaS | Grow faster with HR and payroll connectivity | [site](https://www.tryfinch.com/) · [gallery](https://www.navbar.gallery/navbar/finch) |
| Firecrawl | AI | Power your AI apps with clean data crawled from any website. | [site](https://www.firecrawl.dev/) · [gallery](https://www.navbar.gallery/navbar/firecrawl) |
| Flowbase | Design | Flowbase is the world's largest premium library of Webflow, Figma & Framer components and tools. Build better, faster with Flowbase. | [site](https://www.flowbase.co/) · [gallery](https://www.navbar.gallery/navbar/flowbase) |
| Frame.io | SaaS | Manage all of your media and assets — video, photos, design files, docs, PDFs, and more — on a single secure surface to create and deliver h | [site](https://frame.io/) · [gallery](https://www.navbar.gallery/navbar/frame-io) |
| Frontify | SaaS | Bring your brand to life with the platform that unites resources and intelligent workflows. | [site](https://www.frontify.com/en) · [gallery](https://www.navbar.gallery/navbar/frontify) |
| Function | Health | Monitor early indicators of 1000s of diseases | [site](https://www.functionhealth.com/) · [gallery](https://www.navbar.gallery/navbar/function) |
| Giga Energy | Technology | Your hands-on energy infrastructure partner. | [site](https://www.gigaenergy.com/) · [gallery](https://www.navbar.gallery/navbar/giga-energy) |
| Gladia | SaaS | Gladia is the STT engine built for developers. Sub-300ms guaranteed latency, infinite scale, and no infrastructure headaches. | [site](https://gladia.io/) · [gallery](https://www.navbar.gallery/navbar/gladia) |
| Globalization Partners | SaaS | A platform that helps to find, hire, and manage global teams. | [site](https://www.globalization-partners.com) · [gallery](https://www.navbar.gallery/navbar/globalization-partners) |
| GoCardless | Finance | Hassle-free payments. | [site](https://gocardless.com/) · [gallery](https://www.navbar.gallery/navbar/gocardless) |
| GRAZA | Food & Drink | Olive oil made from 100% olives, and nothing else. | [site](https://www.graza.co/) · [gallery](https://www.navbar.gallery/navbar/graza) |
| Help Scout | SaaS | Help Scout unifies every client conversation under one platform. | [site](https://www.helpscout.com/) · [gallery](https://www.navbar.gallery/navbar/help-scout) |
| Hex Technologies ★ | AI | The AI Analytics Platform for your whole team. | [site](https://hex.tech/) · [gallery](https://www.navbar.gallery/navbar/hex-2026) |
| HIFI | Development | Developer Infrastructure for Modern Money Movement | [site](https://www.hifibridge.com/) · [gallery](https://www.navbar.gallery/navbar/hifi) |
| hims | Health | Personalized health treatments for men. | [site](https://www.hims.com/about) · [gallery](https://www.navbar.gallery/navbar/hims) |
| Hume | Audio | Voice AI models powered by emotional intelligence for creators, developers, and enterprises. Create audio books, podcasts, conversational ag | [site](https://www.hume.ai/) · [gallery](https://www.navbar.gallery/navbar/hume) |
| HUTS ★ | Real Estate | The best way to design and develop a property in the country | [site](https://huts.com/) · [gallery](https://www.navbar.gallery/navbar/huts) |
| Incident | Development | On-call, incident response, and status pages — everything you need to manage incidents and reduce downtime | [site](https://incident.io/) · [gallery](https://www.navbar.gallery/navbar/incident) |
| Intercom | Brutalist | AI-first customer service. | [site](https://www.intercom.com/) · [gallery](https://www.navbar.gallery/navbar/intercom) |
| Jasper ★ | AI | Jasper is the AI platform that unifies the brand experience, accelerates content velocity, and automates marketing processes—at scale. | [site](https://www.jasper.ai/) · [gallery](https://www.navbar.gallery/navbar/jasper-2025) |
| Jasper | Marketing | Elevate your team, your brand, and your impact with AI that's built for marketing. | [site](https://www.jasper.ai/) · [gallery](https://www.navbar.gallery/navbar/jasper) |
| Jitter | Animation | Jitter makes motion accessible to every designer, enabling creative teams to collaborate on and deliver engaging animations in record time. | [site](https://jitter.video/) · [gallery](https://www.navbar.gallery/navbar/jitter) |
| Kalstore | eCommerce | Kalstore designs paper tools that stay silent while you think, plan, and create. | [site](https://kal-store.com/) · [gallery](https://www.navbar.gallery/navbar/kalstore) |
| Latitude | SaaS | Reduce costs, improve performance and gain full control of your infrastructure without giving up on the flexibility of the cloud that you kn | [site](https://www.latitude.sh/) · [gallery](https://www.navbar.gallery/navbar/latitude) |
| Lattice | SaaS | Get time back with fast, reliable support that transforms HR from reactive to proactive. | [site](https://lattice.com/) · [gallery](https://www.navbar.gallery/navbar/lattice-2025) |
| Legora | Law | Spend less time on routine, and more time on the work only lawyers can do. Legora frees you from admin so you can think sharper, move faster | [site](https://legora.com/) · [gallery](https://www.navbar.gallery/navbar/legora) |
| Lightdash | AI | The only open source AI-native BI platform that lets AI build, refactor, and ship analytics in minutes. | [site](https://www.lightdash.com) · [gallery](https://www.navbar.gallery/navbar/lightdash) |
| LightningProxies | SaaS | Gather data efficiently with the industry-leading proxy network and enjoy limitless web scraping solutions on the most intense tasks. | [site](https://lightningproxies.net/) · [gallery](https://www.navbar.gallery/navbar/lightningproxies) |
| Linear 2024 | SaaS | Linear helps to streamline issues, sprints, and product roadmaps. | [site](https://linear.app/homepage) · [gallery](https://www.navbar.gallery/navbar/linear-2024) |
| ListenUp! | SaaS | Scale product discovery to ship better features. | [site](https://www.listenup.ai/) · [gallery](https://www.navbar.gallery/navbar/listenup) |
| Liveblocks | Development | Liveblocks provides customizable pre-built features that boost user engagement by adding collaboration to your product. | [site](https://liveblocks.io/) · [gallery](https://www.navbar.gallery/navbar/liveblocks) |
| Llama Index | AI | LlamaIndex delivers the world’s most accurate agentic OCR and document-specific AI workflows, powering complete enterprise automation | [site](https://www.llamaindex.ai/) · [gallery](https://www.navbar.gallery/navbar/llama-index) |
| Loop | SaaS | Returns operations platform for scaling brands. | [site](https://www.loopreturns.com/) · [gallery](https://www.navbar.gallery/navbar/loop) |
| Manychat | Social Media | Sell more, engage better, and grow your audience with powerful automations for Instagram, WhatsApp, TikTok, and Messenger. | [site](https://manychat.com/) · [gallery](https://www.navbar.gallery/navbar/manychat) |
| Medusa | eCommerce | Open-source platform for commerce. | [site](https://medusajs.com/) · [gallery](https://www.navbar.gallery/navbar/medusa) |
| Metaview | AI | Automatic, AI-powered notes. | [site](https://www.metaview.ai/) · [gallery](https://www.navbar.gallery/navbar/metaview) |
| Meter | SaaS | Network infrastructure for the enterprise Full-stack networks.  Internet, Wired, Wi-Fi, and Cellular. | [site](https://www.meter.com/) · [gallery](https://www.navbar.gallery/navbar/meter) |
| Midday | – | Midday provides you with greater insight into your business and automates the boring tasks, allowing you to focus on what you love to do ins | [site](https://midday.ai/) · [gallery](https://www.navbar.gallery/navbar/midday) |
| Mistral ★ | AI | We help organizations build tailored AI systems to solve the world’s hardest problems. | [site](https://mistral.ai/) · [gallery](https://www.navbar.gallery/navbar/mistral) |
| Miter | SaaS | How modern contractors manage payroll, HR, expenses, and field operations in one place. | [site](https://www.miter.com/) · [gallery](https://www.navbar.gallery/navbar/miter) |
| MiTrust | SaaS | A complete solution to collect data from original sources. | [site](https://www.mitrust.eu/) · [gallery](https://www.navbar.gallery/navbar/mitrust) |
| Neon Serverless Postgres | Development | The database developers trust, on a serverless platform designed to help you build reliable and scalable applications faster. | [site](https://neon.com/) · [gallery](https://www.navbar.gallery/navbar/neon-serverless-postgres) |
| Nextjsshop | Design | We design exceptional, user-friendly components and templates, ensuring they're built with the best technologies. | [site](https://www.nextjsshop.com/) · [gallery](https://www.navbar.gallery/navbar/nextjsshop) |
| Notion Calendar ★ | SaaS | Beautifully designed, fully integrated calendar. | [site](https://www.notion.so/product/calendar) · [gallery](https://www.navbar.gallery/navbar/notion-calendar) |
| Old Friends Studio | Studio | Old Friends is an engineering studio that builds custom websites. | [site](https://www.oldfriends.studio/) · [gallery](https://www.navbar.gallery/navbar/old-friends-studio) |
| Outerbase | SaaS | Outerbase makes working with data easy for engineers, researchers, and analysts alike. | [site](https://www.outerbase.com/) · [gallery](https://www.navbar.gallery/navbar/outerbase) |
| Owner | Restaurant | See where your restaurant is losing sales online. With Owner, you get more traffic, more sales, more repeat customers. | [site](https://www.owner.com/) · [gallery](https://www.navbar.gallery/navbar/owner) |
| Oxide Computer | Electronics | Oxide Computer is an efficient, rack-scale computing system complete with hardware and software. | [site](https://oxide.computer/) · [gallery](https://www.navbar.gallery/navbar/oxide-computer) |
| Pandawa | Framer Template | Pandawa is a Framer template for SaaS and AI startups with ASCII-inspired design, dark mode, and clean layouts to launch fast and grow. | [site](https://pandawa.framer.ai/) · [gallery](https://www.navbar.gallery/navbar/pandawa) |
| Paradigm | AI | The spreadsheet to automate manual data collection | [site](https://www.paradigmai.com/) · [gallery](https://www.navbar.gallery/navbar/paradigm) |
| Passionfroot | SaaS | Where B2B brands scale influencer marketing | [site](https://www.passionfroot.me/) · [gallery](https://www.navbar.gallery/navbar/passionfroot) |
| Payload | Development | Payload is the open-source Next.js backend used in production by the most innovative companies on earth. | [site](https://payloadcms.com/) · [gallery](https://www.navbar.gallery/navbar/payload) |
| Pipe | Investment | Working capital for companies and entrepreneurs. | [site](https://pipe.com/) · [gallery](https://www.navbar.gallery/navbar/pipe) |
| Planhat | AI | The Customer Platform — The world's most beautiful, flexible and powerful customer success platform. | [site](https://www.planhat.com/) · [gallery](https://www.navbar.gallery/navbar/planhat) |
| Plants to the Rescue | Health | Transforming health with herbal tinctures. | [site](https://plantstotherescue.co/) · [gallery](https://www.navbar.gallery/navbar/plants-to-the-rescue) |
| Playground | SaaS | Childcare management software directors love. | [site](https://www.tryplayground.com/) · [gallery](https://www.navbar.gallery/navbar/playground) |
| Rainmaker | Sustainability | Rainmaker provides water for farms, watersheds, and ecosystems, fortifying growth and stewarding the natural world. | [site](https://www.rainmaker.com/) · [gallery](https://www.navbar.gallery/navbar/rainmaker) |
| Ramp ★ | Finance | Banking and expense management. | [site](https://ramp.com/welcome) · [gallery](https://www.navbar.gallery/navbar/ramp) |
| ReflexAI | AI | Simulation and QA for critical conversations. | [site](https://www.reflexai.com/) · [gallery](https://www.navbar.gallery/navbar/reflexai) |
| Relay ★ | Finance | Smart portfolio management. | [site](https://www.angellist.com/) · [gallery](https://www.navbar.gallery/navbar/relay) |
| Rivian | Automotive | Rivian produces long-range electric vehicles, designed for adventure. Explore our innovative EV cars and join the movement towards a sustain | [site](https://rivian.com/) · [gallery](https://www.navbar.gallery/navbar/rivian) |
| Runway | AI | Runway is an applied AI research company shaping creativity. | [site](https://runwayml.com/) · [gallery](https://www.navbar.gallery/navbar/runway) |
| Ruul | – | We help contractors and businesses work together, handling invoicing, payments, and compliance. | [site](https://ruul.io/) · [gallery](https://www.navbar.gallery/navbar/ruul) |
| Saaristo | Tourism | World's largest archipelago by size and soul welcomes you with an open heart and a big smile. | [site](https://saaristo.fi/) · [gallery](https://www.navbar.gallery/navbar/saaristo) |
| Sanity ★ | SaaS | A fully customizable all-code backend for content-driven websites and apps—their builders and creators. | [site](https://www.sanity.io/) · [gallery](https://www.navbar.gallery/navbar/sanity) |
| Say Briefly | Productivity | Turn your client calls or meetings into organized summaries, highlights, briefs and feedback, while syncing all your calendars in one app. | [site](https://saybriefly.com/) · [gallery](https://www.navbar.gallery/navbar/say-briefly) |
| Schema | Elegant | Digital Resource Collective | [site](https://www.schema.supply/) · [gallery](https://www.navbar.gallery/navbar/schema) |
| Sequence | SaaS | Sequence is a complete platform for Finance teams to unlock error-free revenue collection at scale. | [site](https://www.sequencehq.com/) · [gallery](https://www.navbar.gallery/navbar/sequence) |
| Shade | SaaS | Intelligent file streaming, review and approval, automated metadata, AI search and a whole lot more for media teams. | [site](https://shade.inc/) · [gallery](https://www.navbar.gallery/navbar/shade) |
| SingleStore | SaaS | The only database you'll ever need. | [site](https://www.singlestore.com/) · [gallery](https://www.navbar.gallery/navbar/singlestore) |
| speakeasy | Development | Create APIs that developers love and LLMs understand. Polish OpenAPI, generate SDKs, and build MCP servers all on our complete API developme | [site](https://www.speakeasy.com/) · [gallery](https://www.navbar.gallery/navbar/speakeasy) |
| Squint | – | Squint is the leading Manufacturing Intelligence platform that helps the world’s most advanced companies lower downtime and improve quality  | [site](https://www.squint.ai/) · [gallery](https://www.navbar.gallery/navbar/squint) |
| Stenger Bike | eCommerce | Redefining the fun in cycling. | [site](https://stenger-bike.de) · [gallery](https://www.navbar.gallery/navbar/stenger-bike) |
| Super | SaaS | Super is how AI curious companies get to action. Connect all your tools, get the best enterprise search experience, prebuilt assistants, and | [site](https://super.work/) · [gallery](https://www.navbar.gallery/navbar/super) |
| Superpower | Health | Superpower is your new health intelligence. | [site](https://superpower.com/) · [gallery](https://www.navbar.gallery/navbar/superpower-2025) |
| SurferSEO | AI | Boost visibility in Google, ChatGPT, and beyond. Search has changed. People turn to Google, ChatGPT, and other AI chats to find answers. Sur | [site](https://surferseo.com/) · [gallery](https://www.navbar.gallery/navbar/surferseo) |
| Tabs | SaaS | From billing to revenue recognition, streamline your entire contract-to-cash process and eliminate manual work. | [site](https://www.tabs.com/) · [gallery](https://www.navbar.gallery/navbar/tabs) |
| TheyDo | SaaS | TheyDo provides context to your structured and unstructured data, aligning teams to uncover the path to deliver on your customer and busines | [site](https://www.theydo.com/) · [gallery](https://www.navbar.gallery/navbar/theydo) |
| Tomorro | SaaS | Tomorro helps companies reduce the time they spend managing contracts. | [site](https://www.gotomorro.com/) · [gallery](https://www.navbar.gallery/navbar/tomorro) |
| Twingate | SaaS | A comprehensive VPN replacement. | [site](https://www.twingate.com/) · [gallery](https://www.navbar.gallery/navbar/twingate) |
| V7Labs | SaaS | The operating layer for Private Market AI. | [site](https://www.v7labs.com/) · [gallery](https://www.navbar.gallery/navbar/v7labs) |
| Valmont | Nature | Valmont infrastructure strengthens power grids against the effects of climate change. | [site](https://www.valmont.com/) · [gallery](https://www.navbar.gallery/navbar/valmont) |
| Veed | SaaS | AI-powered video creation for teams. | [site](https://www.veed.io/) · [gallery](https://www.navbar.gallery/navbar/veed) |
| Velt | SaaS | Add powerful collaborative features ridiculously fast. | [site](https://velt.dev/) · [gallery](https://www.navbar.gallery/navbar/velt) |
| Veo | Sports | Capture and share your greatest moments with Veo. Record your game with the Veo Cam 3, watch and share with Veo Editor, and analyze with Veo | [site](https://www.veo.co/) · [gallery](https://www.navbar.gallery/navbar/veo) |
| Vercel | Development | Vercel provides the developer tools and cloud infrastructure to build, scale, and secure a faster, more personalized web. | [site](https://vercel.com/) · [gallery](https://www.navbar.gallery/navbar/vercel) |
| Vimeo | Video | Vimeo’s ad-free platform provides everything you need to host, manage, and share high-quality videos. | [site](https://vimeo.com/) · [gallery](https://www.navbar.gallery/navbar/vimeo) |
| VoiceFlow | AI | Build, launch, and scale advanced AI agents for support, lead generation, and beyond | [site](https://www.voiceflow.com/) · [gallery](https://www.navbar.gallery/navbar/voiceflow) |
| Wealthsimple ★ | Finance | Personal finance management. | [site](https://www.wealthsimple.com/en-ca) · [gallery](https://www.navbar.gallery/navbar/wealthsimple) |
| Webflow | Development | The website experience platform for high-performing brands | [site](https://webflow.com/) · [gallery](https://www.navbar.gallery/navbar/webflow-2025) |
| Webflow | Development | As the first-ever website experience platform, Webflow lets marketers, designers, and developers come together to build, manage, and optimiz | [site](https://webflow.com/) · [gallery](https://www.navbar.gallery/navbar/webflow) |
| Webyansh | Agency | Expert Web design and Webflow development agency to help you achieve your digital goals. We help startups and enterprises to scale and raise | [site](https://www.webyansh.com) · [gallery](https://www.navbar.gallery/navbar/webyansh) |
| Wisprflow | Productivity | Effortless voice dictation in every application: 4x faster than typing, AI commands and auto-edits. | [site](https://wisprflow.ai/) · [gallery](https://www.navbar.gallery/navbar/wisprflow) |
| Wope ★ | SaaS | Unlock higher SEO rankings. | [site](https://wope.com/) · [gallery](https://www.navbar.gallery/navbar/wope) |
| Wrike | Productivity | One platform to streamline all workflows. | [site](https://www.wrike.com/vap/) · [gallery](https://www.navbar.gallery/navbar/wrike) |
| Yucca Packaging | Food & Drink | Yucca Packaging is a trusted supplier of quality, innovative and sustainable food packaging solutions across the globe. | [site](https://yucca.co.za/about/) · [gallery](https://www.navbar.gallery/navbar/yucca-packaging) |
| Zendesk | AI | AI-first service. Catered to humans. | [site](https://www.zendesk.com/) · [gallery](https://www.navbar.gallery/navbar/zendesk) |

### Sidebar (45)

| Navbar | Industry | About | Links |
|---|---|---|---|
| Artone Studio | Studio | The design and product partner for your startup, built for the speed and flexibility you need. | [site](https://www.artone.studio/) · [gallery](https://www.navbar.gallery/navbar/artone-studio) |
| Aveon | Framer Template | Avéon is a Framer template, showcasing full-spectrum interior design services, project portfolios, and curated furniture selections. | [site](https://aveon.framer.website/) · [gallery](https://www.navbar.gallery/navbar/aveon) |
| Ayush Wanjari | Portfolio | Framer websites for tech startups and investment firms. Designed to be clear, on-brand, and ready for the rooms that matter. | [site](https://www.ayushwanjari.com/) · [gallery](https://www.navbar.gallery/navbar/ayush-wanjari) |
| Big Dirty Agency | – | A branding agency that transform brands into powerful assets. | [site](https://www.bigdirty.agency/) · [gallery](https://www.navbar.gallery/navbar/big-dirty-agency) |
| Brand Appart | Branding | We help funded startups ship iconic brands, conversion-ready sites, and investor-proof decks. | [site](https://www.brandappart.com/) · [gallery](https://www.navbar.gallery/navbar/brand-appart) |
| Brethen Design Co. | Studio | Creative allies for bold brands, in-house teams and agencies | [site](https://www.brethrendesignco.com/) · [gallery](https://www.navbar.gallery/navbar/brethen-design-co) |
| Bud | AI | Bud has a computer, browser, and number to code, run autonomously, and get work done. | [site](https://bud.app/) · [gallery](https://www.navbar.gallery/navbar/bud) |
| Buttery | Design | Buttery smooth icons for interfaces, updated weekly. | [site](https://www.buttery.so/icons) · [gallery](https://www.navbar.gallery/navbar/buttery) |
| Cedro | Studio | Design Studio from Armenia. | [site](https://cedro-new-3.webflow.io/) · [gallery](https://www.navbar.gallery/navbar/cedro) |
| Coterie | eCommerce | Award-winning diapering solutions | [site](https://www.coterie.com/) · [gallery](https://www.navbar.gallery/navbar/coterie) |
| CourseOS | Development | A Framer template that lets you build & host your online course directly in Framer and protect it with Outseta. | [site](https://www.framer.com/templates/courseos/) · [gallery](https://www.navbar.gallery/navbar/courseos) |
| Daylight | SaaS | The computer, de-invented. | [site](https://daylightcomputer.com/) · [gallery](https://www.navbar.gallery/navbar/daylight) |
| Divyansh Agarwal | Portfolio | Helping Visionary Brands to stand out in the digital era by designing and developing stunning visual experiences. | [site](https://divyanshagarwal.com/) · [gallery](https://www.navbar.gallery/navbar/divyansh-agarwal) |
| E Dey Happen | Film | E Dey Happen is a Nigerian animated series about three friends trying to survive Lagos. | [site](https://www.edhseries.com/) · [gallery](https://www.navbar.gallery/navbar/e-dey-happen) |
| Escape Cafe | Food & Drink | That one thing was always coffee. | [site](https://escape.cafe/) · [gallery](https://www.navbar.gallery/navbar/escape-cafe) |
| Expensify | Finance | The financial management super app. | [site](https://use.expensify.com/) · [gallery](https://www.navbar.gallery/navbar/expensify) |
| Grega Cuderman | Portfolio | Product designer building and helping build digital products. | [site](https://www.gregacuderman.com/) · [gallery](https://www.navbar.gallery/navbar/grega-cuderman) |
| Hims | Health | Personalized health treatments for men. | [site](https://www.hims.com/) · [gallery](https://www.navbar.gallery/navbar/hims-2026) |
| Linie | Framer Template | Linie© is a modern, sleek Framer template for agencies, consulting, and creative studios. Quickly create a professional website with a focus | [site](https://linie.framer.website/) · [gallery](https://www.navbar.gallery/navbar/linie) |
| Modeinspect | AI | Modeinspect is the visual AI editor for consumer software product designers. | [site](https://modeinspect.com/) · [gallery](https://www.navbar.gallery/navbar/modeinspect) |
| Mugen Studio | Studio | A premium Framer template built for agencies and freelancers who want to attract high-paying clients. | [site](https://mugenstudio.framer.website/) · [gallery](https://www.navbar.gallery/navbar/mugen-studio) |
| MvD Visuals | Studio | Motion design & animation studio helping brands, agencies & creators grow with explainer videos, animated branding, and visual storytelling  | [site](https://mvdvisuals.com/) · [gallery](https://www.navbar.gallery/navbar/mvd-visuals) |
| Nakula | Framer Template | A bold and professional Framer template for portfolios and agencies, designed for creativepreneurs who want to build and launch their websit | [site](https://nakula.framer.website/) · [gallery](https://www.navbar.gallery/navbar/nakula) |
| Paul Hanaoka | Portfolio | Designer with a passion for building. | [site](https://paul.hanaoka.co/) · [gallery](https://www.navbar.gallery/navbar/paul-hanaoka) |
| Polestar | Automotive | An electric performance car brand. | [site](https://www.polestar.com/global/) · [gallery](https://www.navbar.gallery/navbar/polestar) |
| PostHog | Development | Product analytics + session replay + A/B testing + feature flags + lots more = PostHog. | [site](https://posthog.com/) · [gallery](https://www.navbar.gallery/navbar/posthog-2025) |
| Raw Materials | Studio | Product design and development studio. | [site](https://www.therawmaterials.com/hello) · [gallery](https://www.navbar.gallery/navbar/raw-materials) |
| Read.cv | Design | Show, don't tell professional network. | [site](https://read.cv/explore) · [gallery](https://www.navbar.gallery/navbar/read-cv) |
| Remote ★ | SaaS | Remote is a SaaS that helps to run global teams in a simple manner. | [site](https://remote.com/) · [gallery](https://www.navbar.gallery/navbar/remote) |
| Robin Spielmann | Portfolio | Personal website of Robin Spielmann, a Design Engineer based in Munich. | [site](https://www.iamrob.in/) · [gallery](https://www.navbar.gallery/navbar/robin-spielmann) |
| Sana AI | AI | Your AI assistant for work | [site](https://sana.ai/) · [gallery](https://www.navbar.gallery/navbar/sana-ai) |
| Significa | Studio | We are not pixel pushers or code monkeys. We let our creativity lead the way, but we know where we're headed, and there's a purpose to every | [site](https://significa.co/) · [gallery](https://www.navbar.gallery/navbar/significa) |
| SJ Zhang | Portfolio | SJ Zhang's portfolio website. | [site](https://www.s-j-zhang.com/) · [gallery](https://www.navbar.gallery/navbar/sj-zhang) |
| Skiff | Productivity | End-to-end encrypted email, calendar, documents, and files that give you the power to communicate freely. | [site](https://app.skiff.com/mail/inbox) · [gallery](https://www.navbar.gallery/navbar/skiff) |
| Stable Audio | Audio | Create music with AI. | [site](https://stableaudio.com/) · [gallery](https://www.navbar.gallery/navbar/stable-audio) |
| Stack VC | Venture Capital | Stack is a multi-product asset manager that offers modular, sector-specific funds — purposefully designed to empower institutions. | [site](https://www.stack.vc/) · [gallery](https://www.navbar.gallery/navbar/stack-vc) |
| Supabase | Development | Supabase is an open source Firebase alternative. | [site](https://supabase.com/docs) · [gallery](https://www.navbar.gallery/navbar/supabase) |
| Swag App | AI | AI-powered job search. | [site](https://swagapp.com/jobs/) · [gallery](https://www.navbar.gallery/navbar/swag-app) |
| Things | Startup | Things, Inc. is an award winning startup creating software that promotes collaborative creation and emergent play. | [site](https://things.inc/) · [gallery](https://www.navbar.gallery/navbar/things) |
| This is FC88 | Sports | FC88 is a sustainable upcycle brand in the sports apparel industry working with sport teams, football clubs, federations and their sponsors. | [site](https://www.thisisfc88.com/) · [gallery](https://www.navbar.gallery/navbar/this-is-fc88) |
| Three Circles | Framer Template | Three circles is a premium agency template crafted for any creative agency, design studio, or independent agency. With a clean layout, premi | [site](https://three-circles-wbs.framer.website/) · [gallery](https://www.navbar.gallery/navbar/three-circles) |
| Toolfolio | SaaS | All the Tools, Resources & Products You Need in one place. Delivered weekly. | [site](https://toolfolio.io/) · [gallery](https://www.navbar.gallery/navbar/toolfolio) |
| Trifecta | Studio | (t)rifecta© is a bold Framer website template built for creative studios and agencies. Features sidebar navigation, ready-made sections with | [site](https://trifecta.framer.media/) · [gallery](https://www.navbar.gallery/navbar/trifecta) |
| Webflow University | Development | Webflow University helps you learn everything about Webflow. | [site](https://university.webflow.com/) · [gallery](https://www.navbar.gallery/navbar/webflow-university) |
| Zoox | Technology | It’s not a car. It’s a robotaxi designed around you. | [site](https://zoox.com/) · [gallery](https://www.navbar.gallery/navbar/zoox) |

### Search bar (10)

| Navbar | Industry | About | Links |
|---|---|---|---|
| Airbnb | Travel | Opening the door to extraordinary experiences. | [site](https://www.airbnb.com/) · [gallery](https://www.navbar.gallery/navbar/airbnb) |
| Apple | Technology | Search bar example from Apple's website. | [site](https://www.apple.com/) · [gallery](https://www.navbar.gallery/navbar/apple) |
| Better Stack ★ | SaaS | Spot, resolve, and prevent downtime. | [site](https://betterstack.com/community/guides/logging/) · [gallery](https://www.navbar.gallery/navbar/better-stack) |
| Cosmos | Design | A discovery engine for creatives. Save anything on the web, curate into clusters, and share with the world. Welcome to Cosmos. | [site](https://www.cosmos.so/home) · [gallery](https://www.navbar.gallery/navbar/cosmos) |
| Fresha | Beauty | Hassle-free hair appointment bookings. | [site](https://www.fresha.com/) · [gallery](https://www.navbar.gallery/navbar/fresha) |
| Mobbin | Design | Extensive curated library of the best apps and websites. | [site](https://mobbin.com/browse/web) · [gallery](https://www.navbar.gallery/navbar/mobbin) |
| Notion Help | Productivity | Help, tutorials & documentation from Notion. | [site](https://www.notion.so/help/) · [gallery](https://www.navbar.gallery/navbar/notion-help) |
| Relume | Development | Effortlessly generate sitemaps and wireframes for marketing websites. | [site](https://www.relume.io/components) · [gallery](https://www.navbar.gallery/navbar/relume) |
| Supabase Documentation | Development | Supabase is an open source Firebase alternative. | [site](https://supabase.com/docs) · [gallery](https://www.navbar.gallery/navbar/supabase-documentation) |
| Uniswap | Crypto | Swapping crypto made simple. | [site](https://app.uniswap.org) · [gallery](https://www.navbar.gallery/navbar/uniswap) |

### Full screen (103)

| Navbar | Industry | About | Links |
|---|---|---|---|
| 24/7 Artists | Art | Making the Music Business Better | [site](https://247artists.com/) · [gallery](https://www.navbar.gallery/navbar/24-7-artists) |
| Aether Studio | Framer Template | The Aether Studio Framer template is the ideal choice for luxury architecture studios and developers seeking a sophisticated, high-performin | [site](https://aetherstudio.framer.website/) · [gallery](https://www.navbar.gallery/navbar/aether-studio) |
| Airloom | Sustainability | The next era of wind power. Utility-scale, low-cost wind energy, built for the world. | [site](https://www.airloom.energy/) · [gallery](https://www.navbar.gallery/navbar/airloom) |
| Aker | Investment | Aker invests in residential communities at the intersection of urban and outdoor environments. | [site](https://www.akercompanies.com/) · [gallery](https://www.navbar.gallery/navbar/aker) |
| Alex Pierce | Portfolio | Portfolio website of Alex Pierce. | [site](https://thegeekdesigner.com/) · [gallery](https://www.navbar.gallery/navbar/alex-pierce) |
| Andrematt ★ | Real Estate | A vision for Swiss Alpine living. | [site](https://andermatt-realestate.ch/) · [gallery](https://www.navbar.gallery/navbar/andrematt) |
| Arrival | Travel | Zero-emission solutions for cities. Human-centred, intelligent design - to revitalise public transportation. | [site](https://arrival.com/) · [gallery](https://www.navbar.gallery/navbar/arrival) |
| Art of Documentary | Film | Courses for filmmaking. | [site](https://theartofdocumentary.com/) · [gallery](https://www.navbar.gallery/navbar/art-of-documentary) |
| Artboard Studio | Studio | Artboard Studio a design-oriented startup that buildw the ultimate online design tools. | [site](https://artboard.studio/) · [gallery](https://www.navbar.gallery/navbar/artboard-studio) |
| Article | Studio | Brand and Digital for Culture, Commerce and Good. | [site](https://madebyarticle.com/) · [gallery](https://www.navbar.gallery/navbar/article) |
| Awsmd | Studio | Innovative design and development studio. | [site](https://awsmd.com/) · [gallery](https://www.navbar.gallery/navbar/awsmd) |
| Ballance | Framer Template | Clear results from teams using Ballance to manage spending, issue cards, and stay in control as they grow. | [site](https://ballance.framer.website/) · [gallery](https://www.navbar.gallery/navbar/ballance) |
| Blackbird | Venture Capital | Blackbird is an Australasian investment firm whose mission is to invest in wild hearts, with the wildest ideas, right from the beginning. | [site](https://www.blackbird.vc/) · [gallery](https://www.navbar.gallery/navbar/blackbird) |
| Brandigo | Framer Template | Brandigo is a bold marketing agency template built in Framer, designed to help creative agencies, studios, and consultants showcase their se | [site](https://brandigo.framer.website/) · [gallery](https://www.navbar.gallery/navbar/brandigo) |
| Burner | Crypto | Burner is a small, secure computer that keeps your digital assets and identities safe. | [site](https://burner.pro/) · [gallery](https://www.navbar.gallery/navbar/burner) |
| Capsules | Travel | Spend unforgettable and remarkable time in the Californian desert with—Capsules. | [site](https://capsules.moyra.co/) · [gallery](https://www.navbar.gallery/navbar/capsules) |
| Cash App ★ | Finance | Bank without all the fees—send, spend, and grow your money the way you want. | [site](https://cash.app/) · [gallery](https://www.navbar.gallery/navbar/cash-app) |
| Clonix | Framer Template | Clonix is a premium Framer Multipurpose Agency Template for agencies to showcase branding, web design, content, and campaigns with clarity a | [site](https://clonix.framer.website/) · [gallery](https://www.navbar.gallery/navbar/clonix) |
| COB | Food & Drink | Tinier, tastier, & better for you than popcorn. | [site](https://cobfoods.com/) · [gallery](https://www.navbar.gallery/navbar/cob) |
| Codot | Agency | Framer template for agencies & studios by Erfan @ Pentaclay. | [site](https://codot.framer.website/) · [gallery](https://www.navbar.gallery/navbar/codot) |
| Craft | Consulting | The global creative talent consultancy. When the right people meet the right conditions, growth is inevitable. | [site](https://itscraft.com/) · [gallery](https://www.navbar.gallery/navbar/itscraft) |
| Cyd Stumpel | Portfolio | Award winning independent creative developer and parttime teacher at the Amsterdam University of Applied Sciences. | [site](https://cydstumpel.nl/) · [gallery](https://www.navbar.gallery/navbar/cyd-stumpel) |
| Dacoit Design | Design | WEB3 Design Studio. | [site](https://www.dacoit.design/) · [gallery](https://www.navbar.gallery/navbar/dacoit-design) |
| Daniel Petho | Portfolio | Creative developer portfolio. | [site](https://www.danielpetho.com/) · [gallery](https://www.navbar.gallery/navbar/daniel-petho) |
| DEF | Architecture | Combining urbanism and architecture, DEF are dedicated to creating urban and architectural solutions. | [site](https://www.defprojetos.com/) · [gallery](https://www.navbar.gallery/navbar/def) |
| Eislab | Food & Drink | An unparalleled ice cream experience. Always sustainable, always premium. | [site](https://eis-lab.de/en-us) · [gallery](https://www.navbar.gallery/navbar/eislab) |
| Fantasy | Studio | The creative partner behind world's biggest digital products. | [site](https://fantasy.co/) · [gallery](https://www.navbar.gallery/navbar/fantasy) |
| fatfish | Studio | Branding ideas with pazazz and web projects full of surprises. | [site](https://fatfish.ca/en/) · [gallery](https://www.navbar.gallery/navbar/fatfish) |
| Flexis | Automotive | A New Approach to Urban Logistics. | [site](https://flexis-mobility.com/) · [gallery](https://www.navbar.gallery/navbar/flexis) |
| Flying Papers | eCommerce | Enjoy your flight | [site](https://www.flyingpapers.com/) · [gallery](https://www.navbar.gallery/navbar/flying-papers) |
| Fooror | Agency | Vivid is designed to link clients with businesses in a meaningful way, stirring emotions and ensuring lasting recall. | [site](https://www.fooror.com/) · [gallery](https://www.navbar.gallery/navbar/fooror) |
| Fourmula | AI | Generate professional product shots, lifestyle images, and videos instantly with AI. | [site](https://fourmula.ai/) · [gallery](https://www.navbar.gallery/navbar/fourmula) |
| Frank Gehry | Museum | An online exhibition from Getty on how Frank Gehry and his team designed Walt Disney Concert Hall. | [site](https://gehry.getty.edu/) · [gallery](https://www.navbar.gallery/navbar/frank-gehry) |
| Freshman | Motion | Freshman is an award-winning production company that creates high-impact content that’s impossible to ignore. | [site](https://freshman.tv/) · [gallery](https://www.navbar.gallery/navbar/freshman) |
| Good Fella | Studio | Good Fella is a frontend development studio that works as your dedicated team. | [site](https://good-fella.com/) · [gallery](https://www.navbar.gallery/navbar/good-fella) |
| Heid ★ | Architecture | Architecture that inspires. Heid combines modern elegance with functional design. | [site](https://heid.webflow.io/) · [gallery](https://www.navbar.gallery/navbar/heid) |
| Heidelberg Materials | – | Heidelberg Materials stands for competence and quality. Our products are cement, aggregates, ready-mixed concrete, and asphalt. | [site](https://ccus.heidelbergmaterials.com/en/) · [gallery](https://www.navbar.gallery/navbar/heidelberg-materials) |
| How Studio | Studio | A branding agency in London and Los Angeles. | [site](https://how.studio/) · [gallery](https://www.navbar.gallery/navbar/how-studio) |
| Inversa | Nature | As a humane byproduct of ecosystem restoration that addresses the harm caused by non-native species, INVERSA™ ethical exotics restore balanc | [site](https://inversa.com/) · [gallery](https://www.navbar.gallery/navbar/inversa) |
| Jailhouse Lawyers | Legal | The Jailhouse Lawyers Initiative (JLI) and Zealous collaborated on this public education and advocacy project to raise the visibility of jai | [site](https://history.jailhouselawyers.org/) · [gallery](https://www.navbar.gallery/navbar/jailhouse-lawyers) |
| Jay Vasani | Portfolio | Freelance Creative Professional located in Gujarat, India, helping Members & businesses achieve their vision in media and design. | [site](https://jayvasani.framer.website/) · [gallery](https://www.navbar.gallery/navbar/jay-vasani) |
| Joby Aviation | Travel | All-electric air taxi: vertical take-off and landing, seamless door to door travel. | [site](https://www.jobyaviation.com/) · [gallery](https://www.navbar.gallery/navbar/joby-aviation) |
| Julian Fella | Agency | Building Award-Winning Websites For Tech Brands & Startups. | [site](https://www.julianfella.de/) · [gallery](https://www.navbar.gallery/navbar/julian-fella) |
| Katrine Pil | Portfolio | A documentary film director with four years of experience. | [site](https://katrinepil.com/) · [gallery](https://www.navbar.gallery/navbar/katrine-pil) |
| Kleur Studio | Studio | Website design studio. | [site](https://www.kleur.studio/) · [gallery](https://www.navbar.gallery/navbar/kleur-studio) |
| Kostin Design | Studio | Interace designer with 10+ years experience. | [site](https://kostin.design/) · [gallery](https://www.navbar.gallery/navbar/kostin-design) |
| KT Appliance — Builders Division | Technology | End-to-End Appliance Mastery for Large Scale Projects. | [site](https://builder.ktappliance.com/) · [gallery](https://www.navbar.gallery/navbar/kt-applianc) |
| Kyma | AI | Premium Framer template for AI automation agencies. | [site](https://kyma.framer.ai/) · [gallery](https://www.navbar.gallery/navbar/kyma) |
| Lando Norris | Sports | Official hub for British racing star Lando Norris: breaking news, 2025 race wins, exclusive merch, videos and behind-the-scenes access. | [site](https://landonorris.com/) · [gallery](https://www.navbar.gallery/navbar/lando-norris) |
| Leko Labs | Construction | Carbon Negative Construction. | [site](https://www.lekolabs.com/) · [gallery](https://www.navbar.gallery/navbar/leko-labs) |
| Lera.business | Agency | Lera.Business empowers startups and scaling businesses with tailored solutions. | [site](https://www.lera.business/) · [gallery](https://www.navbar.gallery/navbar/lera-business) |
| Life Time | Health | Championing your happy, healthy life with healthy living, healthy working, and healthy lifestyle destinations. | [site](https://www.lifetime.life/?ref=navbar.gallery) · [gallery](https://www.navbar.gallery/navbar/life-time) |
| Lightship | Travel | Revolutionizing the world of recreational travel | [site](https://lightshiprv.com/) · [gallery](https://www.navbar.gallery/navbar/lightship) |
| MakeReign | – | A Digital Interface Company. | [site](https://academy.makereign.com/) · [gallery](https://www.navbar.gallery/navbar/makereign) |
| Mat Voyce | Portfolio | Designed & animator, specializing in 2D type and animation and exploring type motion. | [site](https://matvoyce.tv/) · [gallery](https://www.navbar.gallery/navbar/mat-voyce) |
| Mesh Architects ★ | Architecture | Mesh Architects design great places that lift your spirits. They bring together creative thinking and masses of experience to give their cli | [site](https://www.mesharchitects.co.uk/) · [gallery](https://www.navbar.gallery/navbar/mesh-architects) |
| Metalab | Studio | Making interfaces for reputable brands, shipping products worth talking about. | [site](https://www.metalab.com/) · [gallery](https://www.navbar.gallery/navbar/metalab-cndv1) |
| Metalab | Agency | Agency making interfaces for top-tier companies. | [site](https://www.metalab.com/) · [gallery](https://www.navbar.gallery/navbar/metalab) |
| Metamask | Crypto | The everything wallet. | [site](https://metamask.io/) · [gallery](https://www.navbar.gallery/navbar/metamask) |
| Michel Beaulieu ★ | Real Estate | Exceptional residential real estate broker | [site](https://michelbeaulieu.ca/en/) · [gallery](https://www.navbar.gallery/navbar/michel-beaulieu) |
| Miki's Art | Photography | Framer photography website template by Arini Studio. | [site](https://photography.framer.photos/) · [gallery](https://www.navbar.gallery/navbar/mikis-art) |
| Mita | Music | A movement in music. | [site](https://www.joinmita.com) · [gallery](https://www.navbar.gallery/navbar/mita) |
| Mr. Pops | Food & Drink | Ice cream brand based in Ukraine. | [site](https://mrpops.ua/en/) · [gallery](https://www.navbar.gallery/navbar/mr-pops) |
| NEON | Film | NEON Rated, LLC, doing business as Neon, is an American independent film production and distribution company founded in 2017 by CEO Tom Quin | [site](http://www.neonrated.com) · [gallery](https://www.navbar.gallery/navbar/neon) |
| New Layer Capital | Investment | Investment firm propelling groundbreaking tech companies building on Bitcoin | [site](https://nlc.obys.agency/) · [gallery](https://www.navbar.gallery/navbar/new-layer-capital) |
| New Studio | Studio | New York–based brand transformation studio working across strategy, design, and digital. | [site](https://www.new.studio/) · [gallery](https://www.navbar.gallery/navbar/new-studio) |
| Niccolò Miranda | Portfolio | Multidisciplinary freelancer, creating iconic digital experiences. | [site](https://www.niccolomiranda.com/) · [gallery](https://www.navbar.gallery/navbar/niccolo-miranda) |
| Nicolas Bussière | Portfolio | Multi¬disciplinary Designer | [site](https://www.nicolasbussiere.com/) · [gallery](https://www.navbar.gallery/navbar/nicolas-bussiere) |
| No-code Supply Co | Development | Hand-picked no-code inspiration, code, tools, and resources. | [site](https://www.nocodesupply.co) · [gallery](https://www.navbar.gallery/navbar/no-code-supply-co) |
| Nothing | Technology | Nothing is a London-based company removing the barriers between people and technology to create a seamless digital future. | [site](https://nothing.tech/) · [gallery](https://www.navbar.gallery/navbar/nothing) |
| Pangram Pangram | Typography | Font foundry founded by Mathieu Desjar. | [site](https://pangrampangram.com/) · [gallery](https://www.navbar.gallery/navbar/pangram-pangram) |
| Pixelflakes | Architecture | Pixelflakes is an architectural marketing firm composed of creatives, designers and thinkers. | [site](https://www.pixelflakes.com/) · [gallery](https://www.navbar.gallery/navbar/pixelflakes) |
| Planhat | AI | The Customer Platform — The world's most beautiful, flexible and powerful customer success platform. | [site](https://www.planhat.com/) · [gallery](https://www.navbar.gallery/navbar/planhat) |
| Pomergranate | Health | Subscription-based predictive healthcare by the Really Intelligent Health people, because private medical insurance is out of touch, out of  | [site](https://pomegranate.health/) · [gallery](https://www.navbar.gallery/navbar/pomergranate) |
| Pop Up Grocer | Retail | Pop Up Grocer is the discovery destination for new, better-for-you products. | [site](https://popupgrocer.com/) · [gallery](https://www.navbar.gallery/navbar/pop-up-grocer) |
| Popp AI | AI | Popp’s AI recruitment platform amplifies what your team can do by effortlessly and instantly scaling your recruiting capacity. So your team  | [site](https://www.joinpopp.com/) · [gallery](https://www.navbar.gallery/navbar/popp-ai) |
| POV Budapest | Conference | Conference for visual practices. | [site](https://www.povbudapest.com/) · [gallery](https://www.navbar.gallery/navbar/pov-budapest) |
| Pureé Maison | Agency | Creative and independent agency, united to create emotion since 2015. | [site](https://pureemaison.com/) · [gallery](https://www.navbar.gallery/navbar/puree-maison) |
| Rains | Retail | Outerwear lifestyle brand. | [site](https://www.rains.com/) · [gallery](https://www.navbar.gallery/navbar/rains) |
| Real Template ★ | Real Estate | REAL is a modern and elegant template created for real estate professionals who value clean design and clear communication. | [site](https://realagent.framer.website/) · [gallery](https://www.navbar.gallery/navbar/real-template) |
| Rejouice | Studio | Digital brand accelerator based in Paris and San Diego. | [site](https://rejouice.com/) · [gallery](https://www.navbar.gallery/navbar/rejouice) |
| Rivian | Automotive | Rivian produces long-range electric vehicles, designed for adventure. Explore our innovative EV cars and join the movement towards a sustain | [site](https://rivian.com/) · [gallery](https://www.navbar.gallery/navbar/rivian) |
| RRE Ventures ★ | Investment | Venture Capital company, backing the best for the distance. | [site](https://rre.com/) · [gallery](https://www.navbar.gallery/navbar/rre-ventures) |
| Rune | Technology | The world’s first DC data center, built for solar and wind. | [site](https://www.rune.energy/) · [gallery](https://www.navbar.gallery/navbar/rune) |
| Selfaware | Studio | Design and technology practice of Jennifer Heintz & Mike Wagz | [site](https://selfaware.studio/) · [gallery](https://www.navbar.gallery/navbar/selfaware) |
| Southern Guild | Art | Contemporary artists from Africa and its diaspora. | [site](https://southernguild.com/) · [gallery](https://www.navbar.gallery/navbar/southern-guild) |
| Spacer | Framer Template | Showcase services and projects or launch a SaaS. Cohesive glitch effects create a cinematic, art-piece vibe. | [site](https://spacer.framer.ai/) · [gallery](https://www.navbar.gallery/navbar/spacer) |
| Spencer Gabor | Portfolio | Spencer Gabor is an llustrator, designer and muralist based in Brooklyn, New York. | [site](https://spencergabor.work) · [gallery](https://www.navbar.gallery/navbar/spencer-gabor) |
| Stacker HQ | Development | Create working applications for your team, customers and partners, then customize them in our no-code app platform | [site](https://stackerhq.com/) · [gallery](https://www.navbar.gallery/navbar/stacker-hq) |
| State of Create | Art | What's here, what's coming, and what's possible for creators in 2025 and beyond. | [site](https://stateofcreate.co/) · [gallery](https://www.navbar.gallery/navbar/state-of-create) |
| Sunday | Technology | Built for busy households, Memo works 24/7 to make your life lighter. Hand off your repetitive to-do’s, so you can focus on what really matt | [site](https://www.sunday.ai/) · [gallery](https://www.navbar.gallery/navbar/sunday) |
| Thonik | Design | From politics to culture to business, Dutch studio thonik strikes a balance between adventurous concepts and pragmatic resolutions. | [site](https://thonik.nl/) · [gallery](https://www.navbar.gallery/navbar/thonik) |
| Thread | Studio | Thread is a full-service creative studio based in Lancaster, Pennsylvania, serving clients worldwide. | [site](https://www.madebythread.com/) · [gallery](https://www.navbar.gallery/navbar/thread) |
| Trionn | Agency | Award-winning digital agency | [site](https://trionn.com/) · [gallery](https://www.navbar.gallery/navbar/trionn) |
| TUX | Agency | TUX is a creative agency based in Los Angeles with a production and post-production studio in Montreal | [site](https://tux.co/en/) · [gallery](https://www.navbar.gallery/navbar/tux) |
| Unlearn AI | AI | Simulate outcomes for every participant at the beginning of your clinical study. | [site](https://www.unlearn.ai/) · [gallery](https://www.navbar.gallery/navbar/unlearn-ai) |
| Vap | Studio | At VAP, we help brands and creators convey images and messages, with videos that will be read and reread, never just seen and seen again. | [site](https://www.vap.studio/) · [gallery](https://www.navbar.gallery/navbar/vap) |
| Vision Trilingual School | Education | Enabling children to develop language skills that will be valuable throughout their lives. | [site](https://ecolevision.com/en/) · [gallery](https://www.navbar.gallery/navbar/vision-trilingual-school) |
| Warren & Mahoney Architects ★ | Architecture | Design and consulting services. | [site](https://wam.studio) · [gallery](https://www.navbar.gallery/navbar/warren-mahoney-architects) |
| Wondermake | Studio | Digital-first creative studio bringing brands to life online and IRL. | [site](https://wondermake.xyz/) · [gallery](https://www.navbar.gallery/navbar/wondermake) |
| Yourbana | Photography | Yourbana it's a participatory project that tells the story of the city's movement through the images its inhabitants create daily using thei | [site](https://yourbana.com/) · [gallery](https://www.navbar.gallery/navbar/yourbana) |
| Zayla | Framer Template | A striking and modern Framer template made for independent creatives, developers, artists, and visionaries who want to leave a powerful firs | [site](https://zaylamonroe.framer.website/) · [gallery](https://www.navbar.gallery/navbar/zayla) |
| Zentry | Gaming | Zentry pioneers the Metagame, a Game of Games ecosystem where worlds converge and communities connect. | [site](https://zentry.com/) · [gallery](https://www.navbar.gallery/navbar/zentry) |

### Breadcrumbs (6)

| Navbar | Industry | About | Links |
|---|---|---|---|
| Attio | SaaS | Attio makes it easy to build the exact CRM your business needs. | [site](https://attio.com/help/reference/managing-your-data/records/merge-and-delete-records) · [gallery](https://www.navbar.gallery/navbar/attio-help) |
| Clerk | SaaS | The most comprehensive User Management Platform | [site](https://dashboard.clerk.com) · [gallery](https://www.navbar.gallery/navbar/clerk-dashboard) |
| Dovetail | – | AI-first customer insights hub that automates end-to-end qualitative data analysis and insight discovery. | [site](https://dovetail.com/help/welcome-to-dovetail/) · [gallery](https://www.navbar.gallery/navbar/dovetail-help-center) |
| Notion Templates | – | Build anything on Notion with thousands of templates. | [site](https://www.notion.so/templates/category/school) · [gallery](https://www.navbar.gallery/navbar/notion-templates) |
| Stripe | SaaS | Financial infrastructure to grow your revenue | [site](https://stripe.com/en-es/customers/instacart) · [gallery](https://www.navbar.gallery/navbar/stripe-customers) |
| Uniswap | – | Swap or provide liquidity on the Uniswap Protocol. | [site](https://app.uniswap.org/explore/tokens/ethereum/NATIVE) · [gallery](https://www.navbar.gallery/navbar/uniswap-breadcrumbs) |

### Announcement (15)

| Navbar | Industry | About | Links |
|---|---|---|---|
| ai.work | – | Autonomous AI Workers designed for internal operations teams - IT, HR, Procurement, Legal and beyond. | [site](https://www.ai.work/) · [gallery](https://www.navbar.gallery/navbar/ai-work) |
| Clerk ★ | SaaS | User management platform. | [site](https://clerk.com/) · [gallery](https://www.navbar.gallery/navbar/clerk) |
| Daytona | SaaS | Secure and Elastic Infrastructure for Running Your AI-Generated Code. | [site](https://www.daytona.io/) · [gallery](https://www.navbar.gallery/navbar/daytona) |
| Evervault ★ | Finance | Flexible payment security. | [site](https://evervault.com/) · [gallery](https://www.navbar.gallery/navbar/evervault) |
| Firecrawl | AI | Power your AI apps with clean data crawled from any website. | [site](https://www.firecrawl.dev/) · [gallery](https://www.navbar.gallery/navbar/firecrawl) |
| Hex Technologies ★ | AI | The AI Analytics Platform for your whole team. | [site](https://hex.tech/) · [gallery](https://www.navbar.gallery/navbar/hex-2026) |
| Hex.tech | AI | Collaborative, AI-powered workspace. | [site](https://hex.tech/) · [gallery](https://www.navbar.gallery/navbar/hex-tech) |
| Kota | eCommerce | Access leading insurance and retirement providers globally. | [site](https://www.kota.io/) · [gallery](https://www.navbar.gallery/navbar/kota) |
| Neon Serverless Postgres | Development | The database developers trust, on a serverless platform designed to help you build reliable and scalable applications faster. | [site](https://neon.com/) · [gallery](https://www.navbar.gallery/navbar/neon-serverless-postgres) |
| Ona | Development | Run API-first, sandboxed development environments with full OS-level isolation. Pre-configured with all your tools, dependencies, and contro | [site](https://ona.com/) · [gallery](https://www.navbar.gallery/navbar/ona) |
| RRE | Venture Capital | Venture Capital company, backing the best for the distance. | [site](https://rre.com/) · [gallery](https://www.navbar.gallery/navbar/rre) |
| Runway | Finance | Modern and intuitive finance platform. | [site](https://runway.com/) · [gallery](https://www.navbar.gallery/navbar/runway-2025) |
| Titan ★ | Investment | Award winning investment management company. | [site](https://www.titan.com/) · [gallery](https://www.navbar.gallery/navbar/titan) |
| Together AI ★ | AI | Cloud platform for building and running generative AI. | [site](https://www.together.ai/) · [gallery](https://www.navbar.gallery/navbar/together-ai) |
| Woof Gang | Colorful | Dog groomers you can rely on. | [site](https://www.woofgangftl.com/) · [gallery](https://www.navbar.gallery/navbar/woof-gang) |
