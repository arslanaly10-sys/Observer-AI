/**
 * Marketing copy, English and Arabic. Voice: premium, calm, specific (see CONTENT.md).
 * Figures come from the demo workspace and are listed in CONTENT-TODO.md for verification before launch.
 */
import type { Locale } from "@/lib/i18n";

const en = {
  nav: {
    product: "Product", solutions: "Solutions", pricing: "Pricing", about: "About", contact: "Contact",
    demo: "Book a demo", app: "Try the demo", signin: "Sign in", menu: "Menu", close: "Close", lang: "العربية", skip: "Skip to content",
  },
  footer: {
    line: "The AI sales desk for Gulf real estate.",
    cols: [
      { h: "Product", links: [["Overview", "/product"], ["Pricing", "/pricing"], ["Try the demo", "/app/dashboard"]] },
      { h: "Solutions", links: [["Brokerages", "/solutions/brokerages"], ["Agents", "/solutions/agents"], ["Developers", "/solutions/developers"], ["Investors", "/solutions/investors"]] },
      { h: "Company", links: [["About", "/about"], ["Contact", "/contact"], ["Book a demo", "/contact"]] },
    ],
    data: "Customer data is hosted in AWS Europe (Frankfurt).",
    rights: "Observer AI. All rights reserved.",
    credits: "Photographs from Unsplash.",
  },
  home: {
    hero: {
      h1: "The AI sales desk for Gulf real estate.",
      sub: "Every enquiry from your ads, portals and website gets a WhatsApp and an email within two minutes. Observer scores how serious each buyer is, routes them to the right agent, and keeps the conversation going after hours, in ten languages.",
      cta: "Book a demo", cta2: "Try the demo",
    },
    problem: {
      h2: "Most leads are lost before anyone says hello.",
      body: "A buyer sends the same enquiry to five agencies at eleven at night. Whoever replies first, and well, usually gets the viewing. By morning the others are just a name in a spreadsheet.",
      facts: [
        { n: "2 min", t: "from a form or ad to the first WhatsApp and email. You choose the delay, down to zero." },
        { n: "10", t: "languages, from Arabic, Hindi and Urdu to Russian, Chinese and Farsi, picked up from the buyer’s first message." },
        { n: "24/7", t: "After office hours Observer keeps talking, answers price questions from your inventory, and books the viewing." },
      ],
    },
    desk: {
      h2: "One calm screen for the whole desk.",
      body: "Hot leads sit at the top. Next to them is what Observer did overnight, and below that the three things most worth your time today. Nothing else competes for your attention.",
    },
    whatsapp: {
      h2: "Replies that sound like your best agent.",
      body: "Observer replies in the buyer’s own language, quotes only the prices and payment plans in your inventory, and sends the brochure. It says plainly that it is an AI assistant, and hands over to your agent when the buyer is ready, wants to make an offer, or asks for a person.",
      link: "How WhatsApp works in Observer",
    },
    score: {
      h2: "A score your agents can argue with.",
      body: "Seven signals go into every score, from budget and financing to how quickly someone replies. Each score shows its working, so an agent can see why Ahmed is an 87 and Omar is a 44, and overrule it when they know better.",
    },
    cascade: {
      h2: "Follow-up that never forgets.",
      body: "The first WhatsApp and email go out within two minutes of an enquiry. If the buyer goes quiet, Observer follows up gently on days one, three and seven, never at night in their time zone. The moment they reply, it answers, and in office hours it hands the conversation to your agent.",
      steps: ["Enquiry", "WhatsApp + email", "Follow-up", "Follow-up", "Last follow-up", "Your agent"],
      waits: ["0 min", "2 min", "Day 1", "Day 3", "Day 7", "When ready"],
    },
    gulf: {
      h2: "Made for how property is sold here.",
      body: "Observer is built for Dubai, Abu Dhabi, Riyadh and Doha. That shapes the details, not just the language.",
      items: [
        { h: "Payment plans, with real fees", t: "Mortgage, developer, cash and post-handover plans, side by side, with the 4% DLD fee and trustee costs included." },
        { h: "Ten languages, Arabic done properly", t: "A full right-to-left interface, and replies in Arabic, Hindi, Urdu, Farsi, Russian, Chinese and more." },
        { h: "UAE market built in", t: "Developers and their usual payment plans, area prices and yields, fees by emirate and mortgage rules, with sources and dates." },
        { h: "Your data, protected", t: "Hosted in AWS Europe (Frankfurt), encrypted in transit and at rest, with role-based access for every agent." },
      ],
    },
    results: {
      h2: "A month in the demo workspace.",
      note: "Sample figures from the demo workspace, to show what Observer reports. Not customer results.",
      items: [
        { n: "4 min", t: "average time from enquiry to the first WhatsApp reply" },
        { n: "61.7%", t: "of qualified leads booked a viewing" },
        { n: "214", t: "cold leads brought back into conversation" },
        { n: "AED 42", t: "cost per lead, down 18% on the month before" },
      ],
    },
    who: { h2: "Built for everyone who sells a home." },
    close: { h2: "Bring a week of your enquiries.", body: "We’ll load them into Observer and show you who you would have called first, and what it was worth.", cta: "Book a demo", cta2: "Try the demo" },
  },
  audiences: {
    brokerages: {
      label: "Brokerages", short: "See every lead, every agent and every reply in one place, and stop losing buyers to whoever replies faster.",
      h1: "Run a faster brokerage without hiring a night shift.",
      sub: "Observer answers every portal, WhatsApp and social enquiry within minutes, scores it, and routes it to the right agent. You get a pipeline you can trust and a team that spends its day on viewings.",
      points: [
        { h: "No lead waits", t: "Every enquiry gets a WhatsApp and an email within two minutes, at any hour, from portals, ads, your website or WhatsApp itself." },
        { h: "Fair, visible routing", t: "Leads go to the agent who speaks the buyer’s language, knows the area and has room. Hot leads reach your top performers first, with a WhatsApp alert." },
        { h: "A pipeline you can defend", t: "Every lead carries its score, the reason for it, and the whole conversation, so stage changes are based on what buyers actually said." },
      ],
    },
    agents: {
      label: "Agents", short: "Wake up to booked viewings, not a list of people to chase.",
      h1: "Spend your day at viewings, not chasing replies.",
      sub: "Observer keeps every conversation warm while you’re showing a villa or asleep. It tells you who is ready to buy, answers their questions from your inventory, and books viewings into your hours.",
      points: [
        { h: "Know who to call first", t: "A ranked list each morning, built from budget, timing, financing and how quickly people reply." },
        { h: "Take over in one tap", t: "Every WhatsApp, email and call sits in one thread. Reply yourself and Observer steps back; switch it on again when you’re busy." },
        { h: "Your calendar, filled", t: "When a buyer agrees to a viewing or a call, Observer books it into your available hours and alerts you on WhatsApp." },
      ],
    },
    developers: {
      label: "Developers", short: "Turn launch-day demand into qualified, booked appointments.",
      h1: "Handle launch day demand without dropping a single buyer.",
      sub: "When a project launches, thousands of enquiries arrive in an afternoon. Observer answers each one, qualifies it against your inventory and payment plans, and books the serious buyers into your sales gallery.",
      points: [
        { h: "Scale on launch day", t: "Thousands of conversations at once, each with a personal reply, without adding temporary staff." },
        { h: "Payment plans that sell", t: "Buyers see post-handover and developer plans with real fees, worked out for the unit they asked about." },
        { h: "Inventory the AI can quote", t: "Upload projects, unit prices, payment plans and brochures, or import a CSV. Observer answers from them and never invents a price." },
      ],
    },
    investors: {
      label: "Investors", short: "The intelligence layer for the region’s fastest-growing property markets.",
      h1: "The intelligence layer for Gulf property sales.",
      sub: "Gulf real estate is sold on WhatsApp, at speed, in many languages, and most of it still runs on spreadsheets. Observer sits where every enquiry starts, which is where most of the value is lost or won.",
      points: [
        { h: "A large, under-served market", t: "Thousands of brokerages and developers across six GCC countries, most still working from spreadsheets and shared phones." },
        { h: "Built where the work happens", t: "WhatsApp-first and Arabic-native, with dirhams, DLD fees and Gulf portals built in. These are hard for global CRMs to copy." },
        { h: "Built for the Gulf’s real buyer mix", t: "Ten languages from day one, because buyers here write in Arabic, Hindi, Urdu, Russian and Chinese as often as English." },
      ],
    },
  },
  product: {
    h1: "Everything your sales desk does, done faster.",
    sub: "One quiet system. Here is what Observer does from the moment an enquiry arrives to the day the keys change hands. Items marked “Soon” are in the demo and on their way to workspaces.",
    groups: [
      { id: "intelligence", h: "Intelligence", t: "Observer reads every lead and every conversation, and turns them into a short list of what to do next.", items: [
        { h: "Lead scoring", t: "A score from 0 to 100, built from seven signals. It shows its working, and your team can adjust the weights." },
        { h: "Intent detection", t: "Highlights the words that matter, such as “cash”, “this week” or “just looking”, and labels buyers, sellers and investors." },
        { h: "Next best action", t: "Ranks the day’s actions by commission at stake, chance to close and how fast that chance is fading." },
        { h: "AI concierge", t: "Answers price, payment-plan and availability questions from your inventory, works out buying costs, mortgages and payment schedules, books viewings, and never negotiates." },
        { h: "Live call assistant", t: "Suggests the next line during an agent’s call and writes the call notes.", soon: true },
      ], shot: "scoring" },
      { id: "channels", h: "Channels", t: "Meet buyers where they already are, with replies that never sound automated.", items: [
        { h: "WhatsApp", t: "A shared inbox with suggested replies, listing cards with photographs, and one-tap viewing bookings." },
        { h: "Follow-ups", t: "WhatsApp and email within two minutes, then gentle follow-ups on days one, three and seven, paused at night and stopped the moment someone replies." },
        { h: "AI phone calls", t: "If a buyer asks for a call, Observer rings them, says it’s an AI assistant, and talks in their language." },
        { h: "Every lead source", t: "Facebook and Instagram Lead Ads, Google, TikTok and Snapchat lead forms, the portals and your website, all in one queue." },
      ], shot: "whatsapp" },
      { id: "analytics", h: "Analytics", t: "Know what’s working, which channel pays, and which agent needs a hand.", items: [
        { h: "Conversion funnel", t: "See where leads go quiet, with the most common reason at each stage.", soon: true },
        { h: "Channel ROI", t: "Cost per lead and revenue by portal, so you can move the budget to what works.", soon: true },
        { h: "Agent performance", t: "Reply times, viewings booked and conversion for every agent, in one table.", soon: true },
      ], shot: "dashboard" },
      { id: "market", h: "GCC market", t: "Tools that only make sense in the Gulf, and that buyers here expect.", items: [
        { h: "Broker calculator", t: "Buying costs by emirate, mortgage eligibility under Central Bank rules, off-plan schedules with dates, yields, commission splits and the Golden Visa. Send any result to a client." },
        { h: "UAE market data", t: "Emaar, DAMAC, Sobha, Aldar and more, with their usual payment plans, plus price per square foot and yields for 18 areas. The AI quotes them as indicative ranges." },
      ], shot: "payment-plans" },
      { id: "enterprise", h: "Enterprise", t: "Built for brokerages and developers who answer to a board and a regulator.", items: [
        { h: "Escalation", t: "Hot scores, offers, upset buyers and legal or visa questions go straight to a person, with a WhatsApp alert." },
        { h: "Compliance", t: "Data in Frankfurt, encryption in transit and at rest, role-based access, and a full activity log on every lead." },
        { h: "Notifications", t: "Only what needs a person. Observer deals with the rest quietly." },
      ], shot: "sequences" },
    ],
    close: { h2: "See it with your own leads.", cta: "Book a demo" },
  },
  pricing: {
    h1: "Simple pricing, in dirhams.",
    sub: "Every plan includes WhatsApp, lead scoring, Arabic and English, and encrypted hosting in Frankfurt. Prices exclude VAT.",
    month: "/ month",
    tiers: [
      { name: "Agent", price: "AED 490", note: "For one agent", cta: "Talk to us", features: ["One seat", "Up to 300 leads a month", "AI first contact on WhatsApp and email", "Lead scoring with reasons", "Inventory, payment plans and calendar", "Broker calculator and UAE market data"] },
      { name: "Brokerage", price: "AED 2,900", note: "Up to 15 agents", cta: "Book a demo", featured: true, features: ["Everything in Agent", "Unlimited leads", "Follow-ups across WhatsApp and email", "Meta, Google, TikTok and Snapchat lead ads", "Routing by language, area and capacity", "AI phone calls"] },
      { name: "Developer", price: "Custom", note: "For launches and large teams", cta: "Talk to us", features: ["Everything in Brokerage", "Launch-day capacity", "Broker partner routing", "AI calling at volume", "Dedicated success manager", "Single sign-on and audit exports"] },
    ],
    popular: "Best for teams",
    faqH: "Questions people ask",
    faq: [
      { q: "Do I need the WhatsApp Business API?", a: "Yes, and we set it up with you. Most teams are sending messages through Observer within a week." },
      { q: "Will buyers know they’re talking to AI?", a: "Yes. Observer introduces itself as your AI assistant in its first message and never pretends to be a person. Buyers can ask for a colleague at any time, and it hands over straight away." },
      { q: "Does it work with Bayut and Property Finder?", a: "Yes. The portals send leads by email; an email parser such as Zapier forwards them to Observer in seconds. Your website, Facebook, Instagram, Google, TikTok and Snapchat connect directly." },
      { q: "Where is our data stored?", a: "In AWS Europe (Frankfurt). It’s encrypted at rest and in transit, and backups stay in the same region." },
      { q: "Can we keep our existing CRM?", a: "Yes. Observer runs alongside it, and any tool that can send a webhook can push leads in. Two-way sync is on our roadmap." },
    ],
  },
  about: {
    h1: "Good agents shouldn’t lose good buyers to a slow reply.",
    sub: "Observer exists because the best property sales teams in the Gulf are brilliant in person and stretched everywhere else.",
    story: [
      "Property here is sold on WhatsApp, often late at night, in two languages, to buyers who have messaged five agencies at once. The agency that replies first, and replies well, usually gets the viewing.",
      "No team can be awake for every enquiry. So we built a desk that is. Observer replies, listens, scores and follows up, then hands the conversation to a person at exactly the moment a person matters.",
    ],
    principlesH: "What we believe",
    principles: [
      { h: "Speed is a courtesy", t: "A reply in two minutes tells a buyer they matter. Every product decision starts there." },
      { h: "Show the working", t: "A score nobody can explain is a score nobody trusts. Ours always shows why." },
      { h: "People close", t: "Observer prepares the ground. The handshake, the viewing and the keys stay with your team." },
      { h: "Local by design", t: "Arabic, dirhams, DLD fees and the Gulf portals are built in from the start, not added later." },
    ],
    whereH: "Where we are",
    where: "We’re based in Dubai and work with teams across the UAE, Saudi Arabia and Qatar. Customer data is hosted in Frankfurt.",
  },
  contact: {
    h1: "Book a demo.",
    sub: "Thirty minutes, with your own leads if you’d like. We’ll show you who Observer would have called first.",
    fields: { name: "Full name", company: "Company", role: "Your role", phone: "WhatsApp number", email: "Work email", size: "Team size", message: "Anything we should know?", consent: "Observer may contact me about this demo." },
    roles: ["Brokerage owner or director", "Head of sales", "Agent", "Developer sales team", "Investor", "Other"],
    sizes: ["Just me", "2–15", "16–50", "51–200", "200+"],
    submit: "Request a demo", sending: "Sending…",
    done: "Thank you. We’ll be in touch on WhatsApp within one working day.",
    error: "That didn’t send. Check the highlighted fields and try again.",
    required: "Please fill this in.",
    emailInvalid: "Enter an email like name@company.com.",
    asideH: "What happens next",
    aside: ["We confirm a time on WhatsApp.", "You share a week of enquiries, if you’d like to.", "We walk you through them in Observer, live."],
  },
  common: { learnMore: "Learn more", seeApp: "See it in the app", bookDemo: "Book a demo" },
};

export type SiteDict = typeof en;

const ar: SiteDict = {
  nav: {
    product: "المنتج", solutions: "الحلول", pricing: "الأسعار", about: "من نحن", contact: "تواصل معنا",
    demo: "احجز عرضاً توضيحياً", app: "جرّب النسخة التجريبية", signin: "تسجيل الدخول", menu: "القائمة", close: "إغلاق", lang: "English", skip: "انتقل إلى المحتوى",
  },
  footer: {
    line: "مكتب المبيعات الذكي لعقارات الخليج.",
    cols: [
      { h: "المنتج", links: [["نظرة عامة", "/product"], ["الأسعار", "/pricing"], ["جرّب النسخة التجريبية", "/app/dashboard"]] },
      { h: "الحلول", links: [["شركات الوساطة", "/solutions/brokerages"], ["الوكلاء", "/solutions/agents"], ["المطوّرون", "/solutions/developers"], ["المستثمرون", "/solutions/investors"]] },
      { h: "الشركة", links: [["من نحن", "/about"], ["تواصل معنا", "/contact"], ["احجز عرضاً توضيحياً", "/contact"]] },
    ],
    data: "بيانات العملاء مستضافة في AWS أوروبا (فرانكفورت).",
    rights: "أوبزرفر AI. جميع الحقوق محفوظة.",
    credits: "الصور من Unsplash.",
  },
  home: {
    hero: {
      h1: "مكتب المبيعات الذكي لعقارات الخليج.",
      sub: "كل استفسار من إعلاناتك وبواباتك وموقعك يصله رد على واتساب وبريد خلال دقيقتين. يقيّم أوبزرفر جدية كل مشترٍ، ويحوّله إلى الوكيل المناسب، ويواصل المحادثة بعد الدوام، بعشر لغات.",
      cta: "احجز عرضاً توضيحياً", cta2: "جرّب النسخة التجريبية",
    },
    problem: {
      h2: "معظم العملاء يضيعون قبل أن يقول لهم أحد: مرحباً.",
      body: "يرسل المشتري الاستفسار نفسه إلى خمس وكالات في الحادية عشرة ليلاً. من يرد أولاً، ويرد جيداً، يحصل غالباً على المعاينة. وفي الصباح يصبح الباقون مجرد اسم في جدول.",
      facts: [
        { n: "2 د", t: "من النموذج أو الإعلان إلى أول رسالة واتساب وبريد. أنت تختار التأخير، حتى الصفر." },
        { n: "10", t: "لغات، من العربية والهندية والأردية إلى الروسية والصينية والفارسية، تُكتشف من أول رسالة." },
        { n: "24/7", t: "بعد الدوام يواصل أوبزرفر الحديث، ويجيب عن الأسعار من مخزونك، ويحجز المعاينة." },
      ],
    },
    desk: {
      h2: "شاشة واحدة هادئة للمكتب كله.",
      body: "العملاء الأكثر جاهزية في الأعلى، وبجانبهم ما أنجزه أوبزرفر خلال الليل، وتحتهم أهم ثلاثة أمور تستحق وقتك اليوم. لا شيء آخر يزاحم انتباهك.",
    },
    whatsapp: {
      h2: "ردود تشبه أفضل وكلائك.",
      body: "يرد أوبزرفر بلغة المشتري نفسها، ولا يذكر إلا الأسعار وخطط السداد الموجودة في مخزونك، ويرسل الكتيّب. ويقول بوضوح إنه مساعد ذكي، ويسلّم المحادثة لوكيلك حين يكون المشتري جاهزاً أو يريد تقديم عرض أو يطلب شخصاً.",
      link: "كيف يعمل واتساب في أوبزرفر",
    },
    score: {
      h2: "تقييم يمكن لوكلائك مناقشته.",
      body: "سبع إشارات تدخل في كل تقييم، من الميزانية والتمويل إلى سرعة الرد. كل تقييم يعرض أسبابه، فيرى الوكيل لماذا حصل أحمد على 87 وعمر على 44، ويعدّله حين يعرف أكثر.",
    },
    cascade: {
      h2: "متابعة لا تنسى أحداً.",
      body: "تُرسل أول رسالة واتساب وبريد خلال دقيقتين من الاستفسار. وإن صمت المشتري، يتابعه أوبزرفر بلطف في اليوم الأول والثالث والسابع، ولا يراسله ليلاً بتوقيته. وحين يرد، يجيبه، وفي ساعات الدوام يسلّم المحادثة لوكيلك.",
      steps: ["الاستفسار", "واتساب + بريد", "متابعة", "متابعة", "آخر متابعة", "وكيلك"],
      waits: ["0 دقيقة", "دقيقتان", "اليوم 1", "اليوم 3", "اليوم 7", "عند الجاهزية"],
    },
    gulf: {
      h2: "مصمَّم لطريقة بيع العقار هنا.",
      body: "صُمّم أوبزرفر لدبي وأبوظبي والرياض والدوحة، وهذا يظهر في التفاصيل لا في اللغة وحدها.",
      items: [
        { h: "خطط سداد برسوم حقيقية", t: "الرهن العقاري وخطط المطوّر والدفع النقدي وما بعد التسليم جنباً إلى جنب، مع رسوم دائرة الأراضي 4% وأتعاب الأمين." },
        { h: "عشر لغات، والعربية كما ينبغي", t: "واجهة كاملة من اليمين إلى اليسار، وردود بالعربية والهندية والأردية والفارسية والروسية والصينية وغيرها." },
        { h: "سوق الإمارات مدمج", t: "المطوّرون وخطط السداد المعتادة، وأسعار المناطق وعوائدها، والرسوم حسب الإمارة وقواعد التمويل، مع المصادر والتواريخ." },
        { h: "بياناتك محمية", t: "مستضافة في AWS أوروبا (فرانكفورت)، ومشفّرة أثناء النقل والتخزين، مع صلاحيات وصول لكل وكيل." },
      ],
    },
    results: {
      h2: "شهر في مساحة العمل التجريبية.",
      note: "أرقام نموذجية من مساحة العمل التجريبية لتوضيح ما يعرضه أوبزرفر، وليست نتائج عملاء.",
      items: [
        { n: "4 د", t: "متوسط الوقت من الاستفسار إلى أول رد على واتساب" },
        { n: "61.7%", t: "من العملاء المؤهلين حجزوا معاينة" },
        { n: "214", t: "عميلاً خاملاً عادوا إلى المحادثة" },
        { n: "42 درهم", t: "تكلفة العميل الواحد، بانخفاض 18% عن الشهر السابق" },
      ],
    },
    who: { h2: "مصمَّم لكل من يبيع منزلاً." },
    close: { h2: "أحضر استفسارات أسبوع واحد.", body: "سنحمّلها في أوبزرفر ونريك بمن كنت ستتصل أولاً، وكم كانت قيمة ذلك.", cta: "احجز عرضاً توضيحياً", cta2: "جرّب النسخة التجريبية" },
  },
  audiences: {
    brokerages: {
      label: "شركات الوساطة", short: "كل عميل وكل وكيل وكل رد في مكان واحد، ولا مزيد من خسارة المشترين لمن يرد أسرع.",
      h1: "وساطة أسرع، دون الحاجة إلى نوبة ليلية.",
      sub: "يرد أوبزرفر على كل استفسار من البوابات والإعلانات وموقعك خلال دقيقتين، ويقيّمه، ويحوّله إلى الوكيل المناسب. تحصل على خط مبيعات تثق به، وفريق يقضي يومه في المعاينات.",
      points: [
        { h: "لا عميل ينتظر", t: "كل استفسار يصله رد على واتساب وبريد خلال دقيقتين، في أي ساعة، من البوابات والإعلانات وموقعك أو واتساب نفسه." },
        { h: "توزيع عادل وواضح", t: "يذهب العميل إلى الوكيل الذي يتحدث لغته ويعرف المنطقة ولديه متسع، والعملاء الساخنون يصلون أفضل وكلائك أولاً مع تنبيه على واتساب." },
        { h: "خط مبيعات يمكنك الدفاع عنه", t: "كل عميل يحمل تقييمه وسببه والمحادثة كاملة، فتُبنى المراحل على ما قاله المشترون فعلاً." },
      ],
    },
    agents: {
      label: "الوكلاء", short: "استيقظ على معاينات محجوزة، لا على قائمة أشخاص عليك ملاحقتهم.",
      h1: "اقضِ يومك في المعاينات، لا في ملاحقة الردود.",
      sub: "يبقي أوبزرفر كل محادثة دافئة وأنت تعرض فيلا أو نائم. يخبرك من هو جاهز للشراء، ويجيب عن أسئلته من مخزونك، ويحجز المعاينات في ساعاتك.",
      points: [
        { h: "اعرف بمن تتصل أولاً", t: "قائمة مرتّبة كل صباح، مبنية على الميزانية والتوقيت والتمويل وسرعة الرد." },
        { h: "تولَّ المحادثة بلمسة", t: "كل رسائل واتساب والبريد والمكالمات في محادثة واحدة. رُدّ بنفسك فيتنحى أوبزرفر، وأعِده حين تنشغل." },
        { h: "تقويمك ممتلئ", t: "حين يوافق المشتري على معاينة أو مكالمة، يحجزها أوبزرفر في ساعاتك المتاحة وينبّهك على واتساب." },
      ],
    },
    developers: {
      label: "المطوّرون", short: "حوّل طلب يوم الإطلاق إلى مواعيد مؤهلة ومحجوزة.",
      h1: "استوعب طلب يوم الإطلاق دون أن تفقد مشترياً واحداً.",
      sub: "حين يُطلق مشروع، تصل آلاف الاستفسارات في ساعات. يرد أوبزرفر على كل منها، ويؤهله وفق مخزونك وخطط السداد، ويحجز للمشترين الجادين موعداً في صالة مبيعاتك.",
      points: [
        { h: "قدرة يوم الإطلاق", t: "آلاف المحادثات في الوقت نفسه، كلٌّ برد شخصي، دون موظفين مؤقتين." },
        { h: "خطط سداد تبيع", t: "يرى المشتري خطط ما بعد التسليم وخطط المطوّر برسوم حقيقية، محسوبة للوحدة التي سأل عنها." },
        { h: "مخزون يقتبس منه الذكاء الاصطناعي", t: "حمّل المشاريع وأسعار الوحدات وخطط السداد والكتيّبات أو استورد ملف CSV. يجيب أوبزرفر منها ولا يخترع سعراً أبداً." },
      ],
    },
    investors: {
      label: "المستثمرون", short: "طبقة الذكاء لأسرع أسواق العقار نمواً في المنطقة.",
      h1: "طبقة الذكاء لمبيعات العقار في الخليج.",
      sub: "يُباع عقار الخليج عبر واتساب، بسرعة، وبلغات عدة، ومعظمه ما زال يُدار بالجداول. يقف أوبزرفر حيث يبدأ كل استفسار، وهناك تُكسب معظم القيمة أو تُفقد.",
      points: [
        { h: "سوق كبير لم يُخدم بعد", t: "آلاف شركات الوساطة والمطوّرين في ست دول خليجية، ومعظمهم ما زال يعمل بالجداول والهواتف المشتركة." },
        { h: "مبني حيث يحدث العمل", t: "واتساب أولاً، وعربي أصيل، مع الدرهم ورسوم دائرة الأراضي وبوابات العقار الخليجية مدمجة. يصعب على أنظمة إدارة العملاء العالمية تقليد ذلك." },
        { h: "مصمَّم لمزيج المشترين الحقيقي في الخليج", t: "عشر لغات منذ اليوم الأول، لأن المشترين هنا يكتبون بالعربية والهندية والأردية والروسية والصينية بقدر الإنجليزية." },
      ],
    },
  },
  product: {
    h1: "كل ما يفعله مكتب مبيعاتك، أسرع.",
    sub: "نظام واحد هادئ. هذا ما يفعله أوبزرفر من لحظة وصول الاستفسار حتى يوم تسليم المفاتيح. العناصر الموسومة «قريباً» موجودة في النسخة التجريبية وفي طريقها إلى مساحات العمل.",
    groups: [
      { id: "intelligence", h: "الذكاء", t: "يقرأ أوبزرفر كل عميل وكل محادثة، ويحوّلها إلى قائمة قصيرة بما يجب فعله.", items: [
        { h: "تقييم العملاء", t: "تقييم من 0 إلى 100 مبني على سبع إشارات. يعرض أسبابه، ويمكن لفريقك تعديل الأوزان." },
        { h: "كشف النية", t: "يبرز الكلمات المهمة مثل «نقداً» و«هذا الأسبوع» و«أتصفح فقط»، ويصنّف المشترين والبائعين والمستثمرين." },
        { h: "أفضل إجراء تالٍ", t: "يرتّب إجراءات اليوم حسب العمولة المعنية وفرصة الإغلاق وسرعة تلاشيها." },
        { h: "المساعد الذكي", t: "يجيب عن الأسعار وخطط السداد والتوفر من مخزونك، ويحسب تكاليف الشراء والتمويل وجداول السداد، ويحجز المعاينات، ولا يفاوض أبداً." },
        { h: "مساعد المكالمات المباشر", t: "يقترح الجملة التالية خلال مكالمة الوكيل ويكتب ملاحظاتها.", soon: true },
      ], shot: "scoring" },
      { id: "channels", h: "القنوات", t: "قابل المشترين حيث هم، بردود لا تبدو آلية أبداً.", items: [
        { h: "واتساب", t: "صندوق وارد مشترك مع ردود مقترحة، وبطاقات عقارات بالصور، وحجز معاينة بلمسة." },
        { h: "المتابعات", t: "واتساب وبريد خلال دقيقتين، ثم متابعات لطيفة في الأيام الأول والثالث والسابع، تتوقف ليلاً ولحظة الرد." },
        { h: "مكالمات ذكية", t: "إن طلب المشتري مكالمة، يتصل به أوبزرفر ويخبره أنه مساعد ذكي ويتحدث بلغته." },
        { h: "كل مصادر العملاء", t: "إعلانات فيسبوك وإنستغرام، ونماذج Google وتيك توك وسناب شات، والبوابات وموقعك، في قائمة واحدة." },
      ], shot: "whatsapp" },
      { id: "analytics", h: "التحليلات", t: "اعرف ما ينجح، وأي قناة تستحق، وأي وكيل يحتاج إلى مساعدة.", items: [
        { h: "قمع التحويل", t: "اعرف أين يصمت العملاء، والسبب الأكثر شيوعاً في كل مرحلة.", soon: true },
        { h: "عائد القنوات", t: "تكلفة العميل والإيرادات لكل بوابة، لتنقل الميزانية إلى ما ينجح.", soon: true },
        { h: "أداء الوكلاء", t: "أوقات الرد والمعاينات المحجوزة والتحويل لكل وكيل، في جدول واحد.", soon: true },
      ], shot: "dashboard" },
      { id: "market", h: "سوق الخليج", t: "أدوات لا معنى لها إلا في الخليج، ويتوقعها المشترون هنا.", items: [
        { h: "حاسبة الوسيط", t: "تكاليف الشراء حسب الإمارة، وأهلية التمويل وفق قواعد المصرف المركزي، وجداول السداد على الخارطة بالتواريخ، والعائد، وتقسيم العمولة، والإقامة الذهبية. وأرسل أي نتيجة للعميل." },
        { h: "بيانات سوق الإمارات", t: "إعمار وداماك وشوبا والدار وغيرهم مع خطط السداد المعتادة، وسعر القدم المربع والعائد لـ18 منطقة. ويذكرها الذكاء الاصطناعي كنطاقات تقريبية." },
      ], shot: "payment-plans" },
      { id: "enterprise", h: "المؤسسات", t: "لشركات الوساطة والمطوّرين المسؤولين أمام مجلس إدارة وجهة تنظيمية.", items: [
        { h: "تتبع مستوى الخدمة", t: "مؤقتات حية لكل عميل ينتظر، مع تصعيد قبل حدوث أي تجاوز." },
        { h: "الامتثال", t: "البيانات في فرانكفورت، وتشفير أثناء النقل والتخزين، وصلاحيات حسب الدور، وسجل نشاط كامل لكل عميل." },
        { h: "الإشعارات", t: "فقط ما يحتاج إلى إنسان. يتعامل أوبزرفر مع الباقي بهدوء." },
      ], shot: "sequences" },
    ],
    close: { h2: "شاهده مع عملائك أنت.", cta: "احجز عرضاً توضيحياً" },
  },
  pricing: {
    h1: "أسعار واضحة، بالدرهم.",
    sub: "كل باقة تشمل واتساب وتقييم العملاء والعربية والإنجليزية واستضافة مشفّرة في فرانكفورت. الأسعار لا تشمل ضريبة القيمة المضافة.",
    month: "/ شهرياً",
    tiers: [
      { name: "الوكيل", price: "490 درهم", note: "لوكيل واحد", cta: "تحدّث إلينا", features: ["مقعد واحد", "حتى 300 عميل شهرياً", "تواصل أول ذكي عبر واتساب والبريد", "تقييم العملاء مع الأسباب", "المخزون وخطط السداد والتقويم", "حاسبة الوسيط وبيانات سوق الإمارات"] },
      { name: "الوساطة", price: "2,900 درهم", note: "حتى 15 وكيلاً", cta: "احجز عرضاً توضيحياً", featured: true, features: ["كل ما في باقة الوكيل", "عملاء بلا حدود", "متابعات عبر واتساب والبريد", "إعلانات ميتا وGoogle وتيك توك وسناب شات", "توزيع حسب اللغة والمنطقة والطاقة", "مكالمات ذكية"] },
      { name: "المطوّر", price: "حسب الطلب", note: "للإطلاقات والفرق الكبيرة", cta: "تحدّث إلينا", features: ["كل ما في باقة الوساطة", "قدرة يوم الإطلاق", "توزيع على الوسطاء الشركاء", "مكالمات ذكية بكثافة", "مدير نجاح مخصص", "تسجيل دخول موحّد وتصدير سجلات التدقيق"] },
    ],
    popular: "الأنسب للفرق",
    faqH: "أسئلة شائعة",
    faq: [
      { q: "هل أحتاج إلى واجهة واتساب للأعمال؟", a: "نعم، ونجهّزها معك. معظم الفرق ترسل رسائلها عبر أوبزرفر خلال أسبوع." },
      { q: "هل سيعرف المشترون أنهم يتحدثون مع ذكاء اصطناعي؟", a: "نعم. يعرّف أوبزرفر بنفسه كمساعد ذكي في أول رسالة، ولا يدّعي أبداً أنه إنسان. ويمكن للمشتري طلب أحد الزملاء في أي وقت، فيسلّمه المحادثة فوراً." },
      { q: "هل يعمل مع بيوت وبروبرتي فايندر؟", a: "نعم. ترسل البوابات العملاء عبر البريد، وتحوّلهم أداة مثل Zapier إلى أوبزرفر خلال ثوانٍ. ويتصل موقعك وفيسبوك وإنستغرام وGoogle وتيك توك وسناب شات مباشرة." },
      { q: "أين تُخزَّن بياناتنا؟", a: "في AWS أوروبا (فرانكفورت)، مشفّرة أثناء التخزين والنقل، والنسخ الاحتياطية في المنطقة نفسها." },
      { q: "هل يمكننا الإبقاء على نظامنا الحالي لإدارة العملاء؟", a: "نعم. يعمل أوبزرفر إلى جانبه، ويمكن لأي أداة ترسل Webhook إضافة العملاء إليه. والمزامنة في الاتجاهين ضمن خطتنا القادمة." },
    ],
  },
  about: {
    h1: "لا ينبغي أن يخسر الوكيل الجيد مشترياً جيداً بسبب ردٍّ متأخر.",
    sub: "وُجد أوبزرفر لأن أفضل فرق مبيعات العقار في الخليج بارعة وجهاً لوجه، ومنهَكة في كل ما عدا ذلك.",
    story: [
      "العقار هنا يُباع عبر واتساب، غالباً في وقت متأخر من الليل، بلغتين، لمشترين راسلوا خمس وكالات في آن واحد. والوكالة التي ترد أولاً، وترد جيداً، تحصل غالباً على المعاينة.",
      "لا يستطيع أي فريق أن يبقى مستيقظاً لكل استفسار، فبنينا مكتباً يستطيع. يرد أوبزرفر ويستمع ويقيّم ويتابع، ثم يسلّم المحادثة لإنسان في اللحظة التي يصنع فيها الإنسان الفرق.",
    ],
    principlesH: "ما نؤمن به",
    principles: [
      { h: "السرعة لباقة", t: "الرد خلال دقيقتين يخبر المشتري أنه مهم. ومن هنا يبدأ كل قرار في المنتج." },
      { h: "أظهِر الأسباب", t: "التقييم الذي لا يستطيع أحد شرحه لا يثق به أحد. تقييمنا يُظهر أسبابه دائماً." },
      { h: "الناس هم من يغلقون الصفقات", t: "يمهّد أوبزرفر الطريق، أما المصافحة والمعاينة والمفاتيح فتبقى مع فريقك." },
      { h: "محلي بالتصميم", t: "العربية والدرهم ورسوم دائرة الأراضي وبوابات العقار الخليجية، جزء منه من البداية لا إضافة لاحقة." },
    ],
    whereH: "أين نحن",
    where: "مقرنا في دبي، ونعمل مع فرق في الإمارات والسعودية وقطر. بيانات العملاء مستضافة في فرانكفورت.",
  },
  contact: {
    h1: "احجز عرضاً توضيحياً.",
    sub: "ثلاثون دقيقة، مع عملائك أنت إن أردت. سنريك بمن كان أوبزرفر سيتصل أولاً.",
    fields: { name: "الاسم الكامل", company: "الشركة", role: "دورك", phone: "رقم واتساب", email: "بريد العمل", size: "حجم الفريق", message: "هل هناك ما يجب أن نعرفه؟", consent: "أوافق على أن يتواصل معي أوبزرفر بخصوص هذا العرض." },
    roles: ["مالك أو مدير شركة وساطة", "مدير مبيعات", "وكيل", "فريق مبيعات مطوّر", "مستثمر", "أخرى"],
    sizes: ["أنا فقط", "2–15", "16–50", "51–200", "+200"],
    submit: "اطلب عرضاً توضيحياً", sending: "جارٍ الإرسال…",
    done: "شكراً لك. سنتواصل معك عبر واتساب خلال يوم عمل واحد.",
    error: "لم يتم الإرسال. راجع الحقول المحددة وحاول مرة أخرى.",
    required: "يرجى تعبئة هذا الحقل.",
    emailInvalid: "أدخل بريداً مثل name@company.com.",
    asideH: "ما الذي سيحدث بعد ذلك",
    aside: ["نؤكد موعداً عبر واتساب.", "تشاركنا استفسارات أسبوع، إن رغبت.", "نستعرضها معك في أوبزرفر مباشرة."],
  },
  common: { learnMore: "اعرف المزيد", seeApp: "شاهده في التطبيق", bookDemo: "احجز عرضاً توضيحياً" },
};

export function getSite(l: Locale): SiteDict {
  return l === "ar" ? ar : en;
}
export const audienceIds = ["brokerages", "agents", "developers", "investors"] as const;
export type AudienceId = (typeof audienceIds)[number];
