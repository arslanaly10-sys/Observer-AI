/**
 * Marketing copy, English and Arabic. Voice: premium, calm, specific (see CONTENT.md).
 * Figures come from the demo workspace and are listed in CONTENT-TODO.md for verification before launch.
 */
import type { Locale } from "@/lib/i18n";

const en = {
  nav: {
    product: "Product", solutions: "Solutions", pricing: "Pricing", about: "About", contact: "Contact",
    demo: "Book a demo", app: "Enter the demo", signin: "Sign in", menu: "Menu", close: "Close", lang: "العربية", skip: "Skip to content",
  },
  footer: {
    line: "The AI sales desk for Gulf real estate.",
    cols: [
      { h: "Product", links: [["Overview", "/product"], ["Pricing", "/pricing"], ["Enter the demonstration", "/demo"]] },
      { h: "Solutions", links: [["Brokerages", "/solutions/brokerages"], ["Agents", "/solutions/agents"], ["Developers", "/solutions/developers"], ["Investors", "/solutions/investors"]] },
      { h: "Company", links: [["About", "/about"], ["Contact", "/contact"], ["Book a demo", "/contact"]] },
    ],
    data: "Customer data is hosted in AWS Europe (Frankfurt).",
    rights: "Observer AI. All rights reserved.",
    credits: "Photographs from Unsplash.",
  },
  home: {
    hero: {
      h1: "The sales desk for the Gulf’s serious developers.",
      sub: "Every enquiry, from every portal and campaign, answered on WhatsApp in under a minute, in the buyer’s language. Qualified, routed to the right consultant, and followed through to the SPA.",
      cta: "Book a demo", cta2: "Enter the demonstration",
    },
    problem: {
      h2: "In this market, the first reply wins the viewing.",
      body: "A buyer sends the same enquiry to five agencies at eleven at night. The one who answers first, and answers well, books the viewing. By morning the others are a name in a spreadsheet.",
      facts: [
        { n: "38 s", t: "median from enquiry to the first WhatsApp reply, at any hour." },
        { n: "10", t: "languages, Arabic first, then Russian, Hindi, Chinese, Farsi and more, detected from the first message." },
        { n: "24/7", t: "After hours, Observer answers from your price list, holds the unit and books the viewing." },
      ],
    },
    desk: {
      h2: "One screen for the whole sales floor.",
      body: "The clients worth calling first, what the AI did overnight, and every decision waiting for a person. Nothing else competes for attention.",
    },
    whatsapp: {
      h2: "Replies in the voice of your best consultant.",
      body: "In the buyer’s language, quoting only the units and payment plans you actually have. It says plainly that it is an AI assistant, and hands over the moment a client wants to negotiate, or simply asks for a person.",
      link: "How WhatsApp works in Observer",
    },
    score: {
      h2: "A score your consultants can question.",
      body: "Seven signals, from budget and financing to how quickly a client replies. Every score shows its working, so a consultant can see why one family is an 87 and another a 44, and overrule it when they know better.",
    },
    cascade: {
      h2: "Follow-up that never lapses.",
      body: "The first message goes out in under a minute. If the client goes quiet, Observer follows up on days one, three and seven, never at night in their time zone. When they reply it answers, and in office hours it hands the conversation to your consultant.",
      steps: ["Enquiry", "WhatsApp + email", "Follow-up", "Follow-up", "Last follow-up", "Your consultant"],
      waits: ["0 min", "38 s", "Day 1", "Day 3", "Day 7", "When ready"],
    },
    gulf: {
      h2: "Built for how property is sold here.",
      body: "Dubai, Abu Dhabi and Riyadh. That shapes the details, not just the language.",
      items: [
        { h: "Off-plan, done properly", t: "EOI, booking, SPA and Oqood in one flow, with payment plans, the 4% DLD fee and trustee costs calculated per unit." },
        { h: "Arabic first, and nine more", t: "A complete right-to-left interface, and replies written in Arabic, not translated into it." },
        { h: "Inventory, live", t: "Every tower, floor and unit, with holds that expire on their own and a price list that cannot be quoted around." },
        { h: "Brokers, protected", t: "Partner agencies register clients once, keep them protected for the agreed period and see their commission." },
      ],
    },
    results: {
      h2: "One month at a top-tier group.",
      note: "Sample figures from the demo workspace, to show what Observer reports. Not customer results.",
      items: [
        { n: "41,280", t: "enquiries in a month, every one answered" },
        { n: "38 s", t: "median from enquiry to first reply" },
        { n: "AED 1.02B", t: "sold in the month, 486 SPAs signed" },
        { n: "3,960", t: "consultant hours saved by the AI" },
      ],
    },
    who: { h2: "For every seat in the business." },
    close: { h2: "Bring a week of your enquiries.", body: "We will load them into Observer and show you who you would have called first, and what it was worth.", cta: "Book a demo", cta2: "Enter the demonstration" },
  },
  audiences: {
    brokerages: {
      label: "Brokerages", short: "Every enquiry, every consultant and every reply on one screen. No client lost to a faster competitor.",
      h1: "A brokerage that answers first, at every hour.",
      sub: "Portal, WhatsApp and social enquiries answered in under a minute, qualified and passed to the right consultant. A pipeline you can stand behind, and a team that spends its day at viewings.",
      points: [
        { h: "No enquiry waits", t: "WhatsApp and email within a minute, day or night, whether the client came from Bayut, Property Finder, a campaign, your website or WhatsApp itself." },
        { h: "Routing that is fair, and seen to be", t: "Each client goes to the consultant who speaks their language, knows the community and has capacity. Serious buyers reach your strongest closers first." },
        { h: "A pipeline that holds up in a meeting", t: "Every client carries a score, the reason for it and the full conversation, so stage changes rest on what buyers actually said." },
      ],
    },
    agents: {
      label: "Consultants", short: "Begin the day with booked viewings, not a list of people to chase.",
      h1: "Spend your day at viewings, not chasing replies.",
      sub: "While you show a villa, or sleep, Observer keeps every conversation moving. It tells you who is ready, answers from your inventory and books viewings into your diary.",
      points: [
        { h: "The right call first", t: "A ranked list each morning, built from budget, timing, financing and how quickly each client replies." },
        { h: "Take over in a tap", t: "WhatsApp, email and calls in one thread. Reply yourself and Observer steps back; hand it back when you are with a client." },
        { h: "A diary that fills itself", t: "When a client agrees to a viewing or a call, Observer books it into your free hours and tells you on WhatsApp." },
      ],
    },
    developers: {
      label: "Developers", short: "Launch-night demand, turned into qualified EOIs and booked appointments.",
      h1: "Launch night, without losing a single buyer.",
      sub: "A launch brings thousands of enquiries in an evening. Observer answers each one, qualifies it against live inventory and payment plans, and brings serious buyers to your sales gallery.",
      points: [
        { h: "Capacity on launch night", t: "Thousands of personal conversations at once, without temporary staff." },
        { h: "Payment plans that close", t: "Developer and post-handover plans with real fees, worked out for the exact unit a client asked about." },
        { h: "Inventory the AI quotes exactly", t: "Projects, unit prices, payment plans and brochures, uploaded or imported. Observer answers from them and never invents a price." },
      ],
    },
    investors: {
      label: "Investors", short: "The intelligence layer for the region’s fastest-growing property markets.",
      h1: "Where Gulf property sales are won or lost.",
      sub: "Gulf real estate is sold on WhatsApp, at speed and in many languages, and much of it still runs on spreadsheets. Observer sits where every enquiry begins, which is where most of the value is decided.",
      points: [
        { h: "A large, under-served market", t: "Thousands of brokerages and developers across six GCC countries, most still working from spreadsheets and shared phones." },
        { h: "Built where the work happens", t: "WhatsApp-first and Arabic-native, with dirhams, DLD fees and the Gulf portals built in: hard for global CRMs to copy." },
        { h: "Built for the Gulf’s real buyer mix", t: "Ten languages from the first day, because buyers here write in Arabic, Russian, Hindi, Urdu and Chinese as often as English." },
      ],
    },
  },
  product: {
    h1: "From the first enquiry to the keys.",
    sub: "One system for the whole sales operation. This is what Observer does from the moment an enquiry arrives to the day of handover. Items marked “Soon” are in the demonstration and on their way to workspaces.",
    groups: [
      { id: "intelligence", h: "Intelligence", t: "Observer reads every enquiry and every conversation, and reduces them to what deserves attention next.", items: [
        { h: "Lead scoring", t: "A score from 0 to 100 built from seven signals. It shows its working, and your team sets the weights." },
        { h: "Intent detection", t: "Picks out the words that matter, such as “cash”, “this week” or “just looking”, and tells buyers, sellers and investors apart." },
        { h: "Next best action", t: "Ranks the day’s work by commission at stake, chance of closing and how quickly that chance is fading." },
        { h: "AI concierge", t: "Answers availability, price and payment-plan questions from your inventory, works out buying costs, mortgages and schedules, books viewings, and never negotiates." },
        { h: "Live call assistant", t: "Suggests the next line during a consultant’s call and writes the call notes.", soon: true },
      ], shot: "scoring" },
      { id: "channels", h: "Channels", t: "Clients are met where they already are, in replies that never read as automated.", items: [
        { h: "WhatsApp", t: "A shared inbox with suggested replies, unit cards with photographs and viewing bookings in a tap." },
        { h: "Follow-up", t: "WhatsApp and email within a minute, then follow-ups on days one, three and seven, paused at night and stopped the moment a client replies." },
        { h: "AI phone calls", t: "When a client asks for a call, Observer rings them, says it is an AI assistant and speaks their language." },
        { h: "Every source, one queue", t: "Meta, Google, TikTok and Snapchat lead forms, the portals and your website." },
      ], shot: "whatsapp" },
      { id: "analytics", h: "Analytics", t: "What is working, which channel pays and which consultant needs support.", items: [
        { h: "Conversion funnel", t: "Where clients go quiet, and the most common reason at each stage.", soon: true },
        { h: "Channel ROI", t: "Cost per enquiry and sales by source, so budget follows what works.", soon: true },
        { h: "Consultant performance", t: "Reply times, viewings booked and conversion for every consultant, in one table.", soon: true },
      ], shot: "dashboard" },
      { id: "market", h: "GCC market", t: "Tools that only make sense in the Gulf, and that buyers here expect.", items: [
        { h: "Broker calculator", t: "Buying costs by emirate, mortgage eligibility under Central Bank rules, off-plan schedules with dates, yields, commission splits and the Golden Visa. Any result can be sent to a client." },
        { h: "UAE market data", t: "Emaar, DAMAC, Sobha, Aldar and others with their usual payment plans, plus price per square foot and yields for 18 communities, quoted by the AI as indicative ranges." },
      ], shot: "payment-plans" },
      { id: "enterprise", h: "Enterprise", t: "For brokerages and developers accountable to a board and a regulator.", items: [
        { h: "Escalation", t: "High scores, offers, unhappy clients and legal or visa questions go straight to a person, with a WhatsApp alert." },
        { h: "Compliance", t: "Data in Frankfurt, encryption in transit and at rest, role-based access and a full activity record on every client." },
        { h: "Notifications", t: "Only what needs a person. Observer handles the rest quietly." },
      ], shot: "sequences" },
    ],
    close: { h2: "See it with your own enquiries.", cta: "Book a demo" },
  },
  pricing: {
    h1: "Priced in dirhams. Plainly.",
    sub: "Every plan includes WhatsApp, lead scoring, Arabic and English, and encrypted hosting in Frankfurt. Prices exclude VAT.",
    month: "/ month",
    tiers: [
      { name: "Consultant", price: "AED 490", note: "For one consultant", cta: "Talk to us", features: ["One seat", "Up to 300 enquiries a month", "AI first contact on WhatsApp and email", "Lead scoring with reasons", "Inventory, payment plans and calendar", "Broker calculator and UAE market data"] },
      { name: "Brokerage", price: "AED 2,900", note: "Up to 15 consultants", cta: "Book a demo", featured: true, features: ["Everything in Consultant", "Unlimited enquiries", "Follow-up across WhatsApp and email", "Meta, Google, TikTok and Snapchat lead ads", "Routing by language, community and capacity", "AI phone calls"] },
      { name: "Developer", price: "Custom", note: "For launches and large sales teams", cta: "Talk to us", features: ["Everything in Brokerage", "Launch-night capacity", "Broker partner routing", "AI calling at volume", "Dedicated success manager", "Single sign-on and audit exports"] },
    ],
    popular: "Most chosen",
    faqH: "Questions we are asked",
    faq: [
      { q: "Do we need the WhatsApp Business API?", a: "Yes, and we set it up with you. Most teams are sending through Observer within a week." },
      { q: "Will clients know they are speaking to AI?", a: "Yes. Observer introduces itself as your AI assistant in its first message and never presents itself as a person. Clients can ask for a colleague at any time and are handed over straight away." },
      { q: "Does it work with Bayut and Property Finder?", a: "Yes. The portals send enquiries by email, and an email parser such as Zapier forwards them to Observer in seconds. Your website, Facebook, Instagram, Google, TikTok and Snapchat connect directly." },
      { q: "Where is our data held?", a: "In AWS Europe (Frankfurt), encrypted at rest and in transit, with backups in the same region." },
      { q: "Can we keep our existing CRM?", a: "Yes. Observer runs alongside it, and any tool that can send a webhook can push enquiries in. Two-way sync is on our roadmap." },
    ],
  },
  about: {
    h1: "A good consultant should never lose a good buyer to a slow reply.",
    sub: "Observer exists because the Gulf’s best sales teams are formidable in person and stretched everywhere else.",
    story: [
      "Property here is sold on WhatsApp, often late at night, in more than one language, to buyers who have written to five agencies at once. The one that replies first, and replies well, usually books the viewing.",
      "No team can be awake for every enquiry, so we built a desk that is. Observer replies, listens, qualifies and follows up, then hands the conversation to a person at exactly the moment a person matters.",
    ],
    principlesH: "What we believe",
    principles: [
      { h: "Speed is a courtesy", t: "A reply within a minute tells a client they matter. Every product decision begins there." },
      { h: "Show the working", t: "A score no one can explain is a score no one trusts. Ours always shows why." },
      { h: "People close", t: "Observer prepares the ground. The handshake, the viewing and the keys stay with your team." },
      { h: "Local by design", t: "Arabic, dirhams, DLD fees and the Gulf portals are part of the foundation, not added later." },
    ],
    whereH: "Where we are",
    where: "Based in Dubai, working with teams across the UAE, Saudi Arabia and Qatar. Customer data is hosted in Frankfurt.",
  },
  contact: {
    h1: "Book a demo.",
    sub: "Thirty minutes, with your own enquiries if you wish. We will show you who Observer would have called first.",
    fields: { name: "Full name", company: "Company", role: "Your role", phone: "WhatsApp number", email: "Work email", size: "Team size", message: "Anything we should know?", consent: "Observer may contact me about this demo." },
    roles: ["Brokerage owner or director", "Head of sales", "Property consultant", "Developer sales team", "Investor", "Other"],
    sizes: ["Just me", "2–15", "16–50", "51–200", "200+"],
    submit: "Request a demo", sending: "Sending…",
    done: "Thank you. We will be in touch on WhatsApp within one working day.",
    error: "That did not send. Please check the highlighted fields and try again.",
    unavailable: "Online booking is not open yet, so your request was not sent. Please try again shortly.",
    required: "Please complete this field.",
    emailInvalid: "Enter an email such as name@company.com.",
    asideH: "What happens next",
    aside: ["We confirm a time on WhatsApp.", "You share a week of enquiries, if you wish.", "We walk you through them in Observer, live."],
  },
  common: { learnMore: "Learn more", seeApp: "See it in the app", bookDemo: "Book a demo" },
};

export type SiteDict = typeof en;

const ar: SiteDict = {
  nav: {
    product: "المنتج", solutions: "الحلول", pricing: "الأسعار", about: "من نحن", contact: "تواصل معنا",
    demo: "احجز عرضاً توضيحياً", app: "ادخل النسخة التجريبية", signin: "تسجيل الدخول", menu: "القائمة", close: "إغلاق", lang: "English", skip: "انتقل إلى المحتوى",
  },
  footer: {
    line: "مكتب المبيعات الذكي لعقارات الخليج.",
    cols: [
      { h: "المنتج", links: [["نظرة عامة", "/product"], ["الأسعار", "/pricing"], ["ادخل النسخة التجريبية", "/demo"]] },
      { h: "الحلول", links: [["شركات الوساطة", "/solutions/brokerages"], ["الوكلاء", "/solutions/agents"], ["المطوّرون", "/solutions/developers"], ["المستثمرون", "/solutions/investors"]] },
      { h: "الشركة", links: [["من نحن", "/about"], ["تواصل معنا", "/contact"], ["احجز عرضاً توضيحياً", "/contact"]] },
    ],
    data: "بيانات العملاء مستضافة في AWS أوروبا (فرانكفورت).",
    rights: "أوبزرفر AI. جميع الحقوق محفوظة.",
    credits: "الصور من Unsplash.",
  },
  home: {
    hero: {
      h1: "مكتب المبيعات لكبار مطوّري الخليج.",
      sub: "كل استفسار، من كل بوابة وكل حملة، يتلقى رداً على واتساب في أقل من دقيقة وبلغة صاحبه. يُؤهَّل، ويُحوَّل إلى المستشار المناسب، ويُتابَع حتى توقيع عقد البيع.",
      cta: "احجز عرضاً توضيحياً", cta2: "ادخل النسخة التجريبية",
    },
    problem: {
      h2: "في هذا السوق، أول رد يكسب المعاينة.",
      body: "يرسل المشتري الاستفسار ذاته إلى خمس وكالات في الحادية عشرة ليلاً. من يرد أولاً، وبرد يليق، يحجز المعاينة. وفي الصباح يصبح الباقون اسماً في جدول.",
      facts: [
        { n: "38 ث", t: "متوسط الوقت من الاستفسار إلى أول رد على واتساب، في أي ساعة." },
        { n: "10", t: "لغات، العربية أولاً، ثم الروسية والهندية والصينية والفارسية وغيرها، تُعرف من أول رسالة." },
        { n: "24/7", t: "بعد الدوام، يجيب أوبزرفر من قائمة أسعارك، ويعلّق الوحدة، ويحجز المعاينة." },
      ],
    },
    desk: {
      h2: "شاشة واحدة لصالة المبيعات كلها.",
      body: "العملاء الأولى بالاتصال، وما أنجزه الذكاء الاصطناعي خلال الليل، وكل قرار ينتظر شخصاً. ولا شيء غير ذلك يزاحم الانتباه.",
    },
    whatsapp: {
      h2: "ردود بصوت أفضل مستشاريك.",
      body: "بلغة المشتري، ولا يذكر إلا الوحدات وخطط السداد المتاحة فعلاً. يقول بوضوح إنه مساعد ذكي، ويسلّم المحادثة فور أن يرغب العميل في التفاوض، أو يطلب شخصاً ببساطة.",
      link: "كيف يعمل واتساب في أوبزرفر",
    },
    score: {
      h2: "تقييم يمكن لمستشاريك مناقشته.",
      body: "سبع إشارات، من الميزانية والتمويل إلى سرعة رد العميل. كل تقييم يعرض أسبابه، فيرى المستشار لماذا حصلت عائلة على 87 وأخرى على 44، ويعدّله حين يعرف أكثر.",
    },
    cascade: {
      h2: "متابعة لا تنقطع.",
      body: "تخرج الرسالة الأولى في أقل من دقيقة. وإن صمت العميل، يتابعه أوبزرفر في اليوم الأول والثالث والسابع، ولا يراسله ليلاً بتوقيته. وحين يرد، يجيبه، وفي ساعات الدوام يسلّم المحادثة لمستشارك.",
      steps: ["استفسار", "واتساب وبريد", "متابعة", "متابعة", "متابعة أخيرة", "مستشارك"],
      waits: ["0 د", "38 ث", "اليوم 1", "اليوم 3", "اليوم 7", "عند الجاهزية"],
    },
    gulf: {
      h2: "صُمّم لطريقة بيع العقار هنا.",
      body: "دبي وأبوظبي والرياض. وهذا يظهر في التفاصيل، لا في اللغة وحدها.",
      items: [
        { h: "البيع على الخارطة كما ينبغي", t: "إبداء الاهتمام والحجز وعقد البيع وتسجيل عقود في مسار واحد، مع خطط السداد ورسوم دائرة الأراضي 4% وأتعاب الأمين محسوبة لكل وحدة." },
        { h: "العربية أولاً، وتسع لغات معها", t: "واجهة كاملة من اليمين إلى اليسار، وردود تُكتب بالعربية أصلاً لا تُترجم إليها." },
        { h: "المخزون لحظة بلحظة", t: "كل برج وطابق ووحدة، مع حجوزات تنتهي تلقائياً، وقائمة أسعار لا يمكن تجاوزها." },
        { h: "الوسطاء في أمان", t: "تسجّل الوكالات الشريكة عملاءها مرة واحدة، وتحتفظ بحمايتهم طوال المدة المتفق عليها، وتطّلع على عمولتها." },
      ],
    },
    results: {
      h2: "شهر واحد في مجموعة من الصف الأول.",
      note: "أرقام من المجموعة التجريبية إعمار العقارية، لتوضيح ما يعرضه أوبزرفر. ليست نتائج عملاء.",
      items: [
        { n: "41,280", t: "استفساراً في شهر، تلقّى كلٌّ منها رداً" },
        { n: "38 ث", t: "متوسط الوقت من الاستفسار إلى أول رد" },
        { n: "1.02 مليار", t: "درهم مبيعات الشهر، و486 عقد بيع موقّعاً" },
        { n: "3,960", t: "ساعة عمل وفّرها الذكاء الاصطناعي على المستشارين" },
      ],
    },
    who: { h2: "لكل مقعد في الشركة." },
    close: { h2: "أحضر استفسارات أسبوع واحد.", body: "سنحمّلها في أوبزرفر ونريك بمن كنت ستتصل أولاً، وكم كانت قيمة ذلك.", cta: "احجز عرضاً توضيحياً", cta2: "ادخل النسخة التجريبية" },
  },
  audiences: {
    brokerages: {
      label: "شركات الوساطة", short: "كل استفسار وكل مستشار وكل رد على شاشة واحدة، فلا يذهب عميل إلى منافس ردّ أسرع.",
      h1: "وساطة تردّ أولاً، في كل ساعة.",
      sub: "استفسارات البوابات وواتساب ومنصات التواصل تتلقى رداً في أقل من دقيقة، وتُؤهَّل وتُحوَّل إلى المستشار المناسب. خط مبيعات تقف خلفه بثقة، وفريق يقضي يومه في المعاينات.",
      points: [
        { h: "لا استفسار ينتظر", t: "واتساب وبريد خلال دقيقة، ليلاً أو نهاراً، سواء جاء العميل من بيوت أو بروبرتي فايندر أو حملة إعلانية أو موقعك أو واتساب نفسه." },
        { h: "توزيع عادل وواضح للجميع", t: "يذهب كل عميل إلى المستشار الذي يتحدث لغته ويعرف المجتمع ولديه متسع، ويصل المشترون الجادّون إلى أقوى مستشاريك أولاً." },
        { h: "خط مبيعات يصمد في الاجتماع", t: "لكل عميل تقييم وسببه والمحادثة كاملة، فتُبنى المراحل على ما قاله المشترون فعلاً." },
      ],
    },
    agents: {
      label: "المستشارون", short: "ابدأ يومك بمعاينات محجوزة، لا بقائمة أشخاص تلاحقهم.",
      h1: "اقضِ يومك في المعاينات، لا في ملاحقة الردود.",
      sub: "بينما تعرض فيلا، أو تنام، يُبقي أوبزرفر كل محادثة حيّة. يخبرك من هو جاهز، ويجيب من مخزونك، ويحجز المعاينات في جدولك.",
      points: [
        { h: "المكالمة الصحيحة أولاً", t: "قائمة مرتّبة كل صباح، مبنية على الميزانية والتوقيت والتمويل وسرعة رد كل عميل." },
        { h: "تتولى المحادثة بلمسة", t: "واتساب والبريد والمكالمات في سلسلة واحدة. ردّ بنفسك فيتراجع أوبزرفر، وأعِدها إليه حين تكون مع عميل." },
        { h: "جدول يمتلئ وحده", t: "حين يوافق العميل على معاينة أو مكالمة، يحجزها أوبزرفر في ساعاتك المتاحة ويبلغك على واتساب." },
      ],
    },
    developers: {
      label: "المطوّرون", short: "طلب ليلة الإطلاق، يتحول إلى إبداءات اهتمام مؤهلة ومواعيد محجوزة.",
      h1: "ليلة إطلاق، دون أن يضيع مشترٍ واحد.",
      sub: "يجلب الإطلاق آلاف الاستفسارات في أمسية واحدة. يجيب أوبزرفر على كل منها، ويؤهّلها وفق المخزون الحي وخطط السداد، ويأتي بالمشترين الجادّين إلى صالة مبيعاتك.",
      points: [
        { h: "طاقة ليلة الإطلاق", t: "آلاف المحادثات الشخصية في آن واحد، دون موظفين مؤقتين." },
        { h: "خطط سداد تُغلق الصفقات", t: "خطط المطوّر وما بعد التسليم برسومها الحقيقية، محسوبة للوحدة التي سأل عنها العميل بالضبط." },
        { h: "مخزون يقتبسه الذكاء الاصطناعي بدقة", t: "المشاريع وأسعار الوحدات وخطط السداد والكتيّبات، تُرفع أو تُستورد، ويجيب أوبزرفر منها ولا يخترع سعراً." },
      ],
    },
    investors: {
      label: "المستثمرون", short: "طبقة الذكاء لأسرع أسواق العقار نمواً في المنطقة.",
      h1: "حيث تُكسب مبيعات العقار في الخليج أو تُخسر.",
      sub: "يُباع العقار في الخليج على واتساب، بسرعة وبلغات كثيرة، ولا يزال كثير منه يُدار بجداول البيانات. يقف أوبزرفر حيث يبدأ كل استفسار، وهناك تتحدد معظم القيمة.",
      points: [
        { h: "سوق كبير لم يُخدم بعد", t: "آلاف شركات الوساطة والمطوّرين في ست دول خليجية، معظمها ما زال يعمل بجداول البيانات والهواتف المشتركة." },
        { h: "بُني حيث يجري العمل", t: "واتساب أولاً والعربية أصلاً، بالدرهم ورسوم دائرة الأراضي وبوابات الخليج، وهذا ما يصعب على أنظمة إدارة العملاء العالمية تقليده." },
        { h: "لمزيج المشترين الحقيقي في الخليج", t: "عشر لغات من اليوم الأول، لأن المشترين هنا يكتبون بالعربية والروسية والهندية والأردية والصينية بقدر ما يكتبون بالإنجليزية." },
      ],
    },
  },
  product: {
    h1: "من أول استفسار إلى استلام المفاتيح.",
    sub: "نظام واحد لعملية البيع كلها. هذا ما يفعله أوبزرفر منذ وصول الاستفسار حتى يوم التسليم. والعناصر المعلّمة بـ«قريباً» موجودة في النسخة التجريبية وفي طريقها إلى مساحات العمل.",
    groups: [
      { id: "intelligence", h: "الذكاء", t: "يقرأ أوبزرفر كل استفسار وكل محادثة، ويختصرها في ما يستحق الاهتمام تالياً.", items: [
        { h: "تقييم العملاء", t: "تقييم من 0 إلى 100 مبني على سبع إشارات، يعرض أسبابه، وفريقك يحدد أوزانه." },
        { h: "كشف النية", t: "يلتقط الكلمات المهمة مثل «نقداً» و«هذا الأسبوع» و«أتصفح فقط»، ويميّز المشتري من البائع من المستثمر." },
        { h: "أفضل إجراء تالٍ", t: "يرتّب عمل اليوم حسب العمولة المعرّضة وفرصة الإغلاق وسرعة تلاشي تلك الفرصة." },
        { h: "المساعد الذكي", t: "يجيب عن التوفر والأسعار وخطط السداد من مخزونك، ويحسب تكاليف الشراء والتمويل والجداول، ويحجز المعاينات، ولا يفاوض أبداً." },
        { h: "مساعد المكالمات المباشر", t: "يقترح الجملة التالية أثناء مكالمة المستشار، ويكتب ملاحظاتها.", soon: true },
      ], shot: "scoring" },
      { id: "channels", h: "القنوات", t: "نلتقي بالعملاء حيث هم، بردود لا تبدو آلية أبداً.", items: [
        { h: "واتساب", t: "صندوق وارد مشترك مع ردود مقترحة، وبطاقات وحدات بالصور، وحجز معاينة بلمسة." },
        { h: "المتابعة", t: "واتساب وبريد خلال دقيقة، ثم متابعة في اليوم الأول والثالث والسابع، تتوقف ليلاً وتنتهي فور رد العميل." },
        { h: "مكالمات بالذكاء الاصطناعي", t: "حين يطلب العميل مكالمة، يتصل به أوبزرفر، ويقول إنه مساعد ذكي، ويتحدث بلغته." },
        { h: "كل المصادر في طابور واحد", t: "نماذج ميتا وGoogle وتيك توك وسناب شات، والبوابات العقارية، وموقعك." },
      ], shot: "whatsapp" },
      { id: "analytics", h: "التحليلات", t: "ما الذي ينجح، وأي قناة تستحق، وأي مستشار يحتاج إلى دعم.", items: [
        { h: "قمع التحويل", t: "أين يصمت العملاء، وأكثر الأسباب شيوعاً في كل مرحلة.", soon: true },
        { h: "عائد القنوات", t: "تكلفة الاستفسار والمبيعات لكل مصدر، لتتبع الميزانية ما ينجح.", soon: true },
        { h: "أداء المستشارين", t: "زمن الرد والمعاينات المحجوزة ونسبة التحويل لكل مستشار، في جدول واحد.", soon: true },
      ], shot: "dashboard" },
      { id: "market", h: "سوق الخليج", t: "أدوات لا معنى لها إلا في الخليج، ويتوقعها المشترون هنا.", items: [
        { h: "حاسبة الوسيط", t: "تكاليف الشراء حسب الإمارة، وأهلية التمويل وفق قواعد المصرف المركزي، وجداول البيع على الخارطة بتواريخها، والعوائد وتقسيم العمولة والإقامة الذهبية. وتُرسل أي نتيجة إلى العميل." },
        { h: "بيانات سوق الإمارات", t: "إعمار وداماك وشوبا والدار وغيرها مع خطط سدادها المعتادة، وسعر القدم المربعة والعوائد في 18 مجتمعاً، يذكرها الذكاء الاصطناعي كنطاقات تقديرية." },
      ], shot: "payment-plans" },
      { id: "enterprise", h: "المؤسسات", t: "لشركات الوساطة والمطوّرين المسؤولين أمام مجلس إدارة وجهة تنظيمية.", items: [
        { h: "التصعيد", t: "التقييمات العالية والعروض والعملاء غير الراضين وأسئلة القانون والإقامة تذهب مباشرة إلى شخص، مع تنبيه على واتساب." },
        { h: "الامتثال", t: "البيانات في فرانكفورت، والتشفير أثناء النقل والتخزين، والصلاحيات حسب الدور، وسجل نشاط كامل لكل عميل." },
        { h: "الإشعارات", t: "ما يحتاج إلى شخص فقط، ويتولى أوبزرفر الباقي بهدوء." },
      ], shot: "sequences" },
    ],
    close: { h2: "شاهده باستفساراتك أنت.", cta: "احجز عرضاً توضيحياً" },
  },
  pricing: {
    h1: "أسعار بالدرهم، بوضوح.",
    sub: "تشمل كل باقة واتساب وتقييم العملاء والعربية والإنجليزية واستضافة مشفّرة في فرانكفورت. الأسعار لا تشمل ضريبة القيمة المضافة.",
    month: "/ شهرياً",
    tiers: [
      { name: "مستشار", price: "490 درهماً", note: "لمستشار واحد", cta: "تحدّث إلينا", features: ["مقعد واحد", "حتى 300 استفسار شهرياً", "تواصل أول ذكي عبر واتساب والبريد", "تقييم العملاء مع الأسباب", "المخزون وخطط السداد والتقويم", "حاسبة الوسيط وبيانات سوق الإمارات"] },
      { name: "شركة وساطة", price: "2,900 درهم", note: "حتى 15 مستشاراً", cta: "احجز عرضاً توضيحياً", featured: true, features: ["كل ما في باقة المستشار", "استفسارات بلا حدود", "متابعة عبر واتساب والبريد", "إعلانات ميتا وGoogle وتيك توك وسناب شات", "توزيع حسب اللغة والمجتمع والطاقة", "مكالمات بالذكاء الاصطناعي"] },
      { name: "مطوّر", price: "حسب الطلب", note: "للإطلاقات وفرق المبيعات الكبيرة", cta: "تحدّث إلينا", features: ["كل ما في باقة شركة الوساطة", "طاقة ليلة الإطلاق", "توزيع على الوسطاء الشركاء", "مكالمات ذكية بأعداد كبيرة", "مدير نجاح مخصص", "دخول موحّد وتصدير سجلات التدقيق"] },
    ],
    popular: "الأكثر اختياراً",
    faqH: "أسئلة تصلنا",
    faq: [
      { q: "هل نحتاج إلى واتساب للأعمال (API)؟", a: "نعم، ونجهّزه معك. ترسل معظم الفرق عبر أوبزرفر خلال أسبوع." },
      { q: "هل يعرف العملاء أنهم يتحدثون إلى ذكاء اصطناعي؟", a: "نعم. يعرّف أوبزرفر نفسه كمساعدك الذكي في أول رسالة، ولا يقدّم نفسه كشخص أبداً. ويمكن للعميل طلب أحد زملائك في أي وقت، فيُحوَّل فوراً." },
      { q: "هل يعمل مع بيوت وبروبرتي فايندر؟", a: "نعم. ترسل البوابات الاستفسارات بالبريد، وتحوّلها أداة مثل Zapier إلى أوبزرفر خلال ثوانٍ. ويتصل موقعك وفيسبوك وإنستغرام وGoogle وتيك توك وسناب شات مباشرة." },
      { q: "أين تُحفظ بياناتنا؟", a: "في AWS أوروبا (فرانكفورت)، مشفّرة أثناء التخزين والنقل، والنسخ الاحتياطية في المنطقة نفسها." },
      { q: "هل نحتفظ بنظام إدارة العملاء الحالي؟", a: "نعم. يعمل أوبزرفر بجانبه، وأي أداة ترسل Webhook يمكنها إدخال الاستفسارات. والمزامنة في الاتجاهين ضمن خطتنا القادمة." },
    ],
  },
  about: {
    h1: "لا ينبغي لمستشار جيد أن يخسر مشترياً جيداً بسبب رد متأخر.",
    sub: "وُجد أوبزرفر لأن أفضل فرق المبيعات في الخليج مبهرة وجهاً لوجه، ومنهكة في كل ما عدا ذلك.",
    story: [
      "يُباع العقار هنا على واتساب، وكثيراً في وقت متأخر من الليل، وبأكثر من لغة، لمشترين راسلوا خمس وكالات في وقت واحد. ومن يرد أولاً، وبرد يليق، يحجز المعاينة غالباً.",
      "لا يستطيع فريق أن يبقى مستيقظاً لكل استفسار، فبنينا مكتباً يبقى. يرد أوبزرفر ويُصغي ويؤهّل ويتابع، ثم يسلّم المحادثة لشخص في اللحظة التي يصبح فيها الشخص هو الفارق.",
    ],
    principlesH: "ما نؤمن به",
    principles: [
      { h: "السرعة لباقة", t: "الرد خلال دقيقة يخبر العميل أنه مهم، ومن هنا يبدأ كل قرار في المنتج." },
      { h: "أظهر الأسباب", t: "تقييم لا يستطيع أحد تفسيره تقييم لا يثق به أحد، وتقييمنا يبيّن السبب دائماً." },
      { h: "الإغلاق للناس", t: "يمهّد أوبزرفر الطريق، أما المصافحة والمعاينة والمفاتيح فتبقى لفريقك." },
      { h: "محلي بالتصميم", t: "العربية والدرهم ورسوم دائرة الأراضي وبوابات الخليج جزء من الأساس، لا إضافة لاحقة." },
    ],
    whereH: "أين نحن",
    where: "مقرنا دبي، ونعمل مع فرق في الإمارات والسعودية وقطر. وتُستضاف بيانات العملاء في فرانكفورت.",
  },
  contact: {
    h1: "احجز عرضاً توضيحياً.",
    sub: "ثلاثون دقيقة، باستفساراتك أنت إن رغبت. سنريك بمن كان أوبزرفر سيتصل أولاً.",
    fields: { name: "الاسم الكامل", company: "الشركة", role: "دورك", phone: "رقم واتساب", email: "بريد العمل", size: "حجم الفريق", message: "هل هناك ما يجب أن نعرفه؟", consent: "أوافق على أن يتواصل معي أوبزرفر بخصوص هذا العرض." },
    roles: ["مالك أو مدير شركة وساطة", "رئيس المبيعات", "مستشار عقاري", "فريق مبيعات مطوّر", "مستثمر", "أخرى"],
    sizes: ["أنا فقط", "2–15", "16–50", "51–200", "200+"],
    submit: "اطلب عرضاً توضيحياً", sending: "جارٍ الإرسال…",
    done: "شكراً لك. سنتواصل معك على واتساب خلال يوم عمل واحد.",
    error: "لم يُرسل الطلب. يرجى مراجعة الحقول المظللة والمحاولة مجدداً.",
    unavailable: "الحجز الإلكتروني غير متاح بعد، لذا لم يُرسل طلبك. يرجى المحاولة قريباً.",
    required: "يرجى تعبئة هذا الحقل.",
    emailInvalid: "أدخل بريداً مثل name@company.com.",
    asideH: "ما الذي سيحدث بعد ذلك",
    aside: ["نؤكد الموعد على واتساب.", "تشاركنا استفسارات أسبوع، إن رغبت.", "نستعرضها معك في أوبزرفر مباشرة."],
  },
  common: { learnMore: "اعرف المزيد", seeApp: "شاهده في التطبيق", bookDemo: "احجز عرضاً توضيحياً" },
};

export function getSite(l: Locale): SiteDict {
  return l === "ar" ? ar : en;
}
export const audienceIds = ["brokerages", "agents", "developers", "investors"] as const;
export type AudienceId = (typeof audienceIds)[number];
