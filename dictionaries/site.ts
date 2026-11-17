/**
 * Marketing copy, English and Arabic. Voice: premium, calm, specific (see CONTENT.md).
 * Figures come from the demo workspace and are listed in CONTENT-TODO.md for verification before launch.
 */
import type { Locale } from "@/lib/i18n";

const en = {
  nav: {
    product: "Product", solutions: "Solutions", pricing: "Pricing", about: "About", contact: "Contact",
    demo: "Book a demo", app: "Open the app", signin: "Sign in", menu: "Menu", close: "Close", lang: "العربية", skip: "Skip to content",
  },
  footer: {
    line: "The AI sales desk for Gulf real estate.",
    cols: [
      { h: "Product", links: [["Overview", "/product"], ["Pricing", "/pricing"], ["Open the app", "/app/dashboard"]] },
      { h: "Solutions", links: [["Brokerages", "/solutions/brokerages"], ["Agents", "/solutions/agents"], ["Developers", "/solutions/developers"], ["Investors", "/solutions/investors"]] },
      { h: "Company", links: [["About", "/about"], ["Contact", "/contact"], ["Book a demo", "/contact"]] },
    ],
    data: "Customer data is hosted in AWS Middle East (Bahrain).",
    rights: "Observer AI. All rights reserved.",
    credits: "Photographs from Unsplash.",
  },
  home: {
    hero: {
      h1: "The AI sales desk for Gulf real estate.",
      sub: "Observer answers every enquiry on WhatsApp in under four minutes, reads how serious each buyer is, and tells your agents who to call next. Day and night, in English and Arabic.",
      cta: "Book a demo", cta2: "See the app",
    },
    problem: {
      h2: "Most leads are lost before anyone says hello.",
      body: "A buyer sends the same enquiry to five agencies at eleven at night. Whoever replies first, and well, usually gets the viewing. By morning the others are just a name in a spreadsheet.",
      facts: [
        { n: "36%", t: "of leads drop before they’re qualified. The usual reason is a first reply that took longer than fifteen minutes." },
        { n: "41%", t: "go quiet after qualifying, when nobody follows up on WhatsApp." },
        { n: "89%", t: "of WhatsApp messages are opened. Email manages 28%." },
      ],
    },
    desk: {
      h2: "One calm screen for the whole desk.",
      body: "Hot leads sit at the top. Next to them is what Observer did overnight, and below that the three things most worth your time today. Nothing else competes for your attention.",
    },
    whatsapp: {
      h2: "Replies that sound like your best agent.",
      body: "Observer writes in your agency’s voice, in English or Arabic, and sends the listing with its photographs. When the buyer replies, one of your agents takes over with the whole conversation in front of them.",
      link: "How WhatsApp works in Observer",
    },
    score: {
      h2: "A score your agents can argue with.",
      body: "Seven signals go into every score, from budget and financing to how quickly someone replies. Each score shows its working, so an agent can see why Ahmed is an 87 and Omar is a 44, and overrule it when they know better.",
    },
    cascade: {
      h2: "Follow-up that never forgets.",
      body: "WhatsApp comes first, then an SMS, then a short call from Observer, then a considered email. The moment the buyer answers on any channel, an agent takes over the conversation and Observer steps back.",
      steps: ["WhatsApp", "Second WhatsApp", "SMS", "AI call", "Email", "Your agent"],
      waits: ["0 min", "30 min", "2 hrs", "24 hrs", "48 hrs", "On reply"],
    },
    gulf: {
      h2: "Made for how property is sold here.",
      body: "Observer is built for Dubai, Abu Dhabi, Riyadh and Doha. That shapes the details, not just the language.",
      items: [
        { h: "Payment plans, with real fees", t: "Mortgage, developer, cash and post-handover plans, side by side, with the 4% DLD fee and trustee costs included." },
        { h: "Arabic, properly", t: "A full right-to-left interface, and replies that read as if a person wrote them in Arabic." },
        { h: "GCC developer directory", t: "Developers and flagship projects across six countries, so you can match a buyer to the right launch." },
        { h: "Your data stays in the region", t: "Hosted in AWS Middle East (Bahrain), encrypted end to end, built for UAE and Saudi PDPL." },
      ],
    },
    results: {
      h2: "A month into an Observer workspace.",
      items: [
        { n: "4 min", t: "average time from enquiry to the first WhatsApp reply" },
        { n: "61.7%", t: "of qualified leads booked a viewing" },
        { n: "214", t: "cold leads brought back into conversation" },
        { n: "AED 42", t: "cost per lead, down 18% on the month before" },
      ],
    },
    who: { h2: "Built for everyone who sells a home." },
    close: { h2: "Bring a week of your enquiries.", body: "We’ll load them into Observer and show you who you would have called first, and what it was worth.", cta: "Book a demo", cta2: "Open the app" },
  },
  audiences: {
    brokerages: {
      label: "Brokerages", short: "See every lead, every agent and every reply in one place, and stop losing buyers to whoever replies faster.",
      h1: "Run a faster brokerage without hiring a night shift.",
      sub: "Observer answers every portal, WhatsApp and social enquiry within minutes, scores it, and routes it to the right agent. You get a pipeline you can trust and a team that spends its day on viewings.",
      points: [
        { h: "No lead waits", t: "Every enquiry gets a personal reply in under four minutes, at any hour, from Bayut, Property Finder, WhatsApp or Instagram." },
        { h: "Fair, visible routing", t: "Leads go to agents by area, language and capacity. SLA timers show who is waiting, and escalate before a buyer goes cold." },
        { h: "A forecast you can defend", t: "A weighted pipeline by stage, and channel ROI that shows which portals actually pay for themselves." },
      ],
    },
    agents: {
      label: "Agents", short: "Wake up to booked viewings, not a list of people to chase.",
      h1: "Spend your day at viewings, not chasing replies.",
      sub: "Observer keeps every conversation warm while you’re showing a villa or asleep. It tells you who is ready to buy, drafts the next message, and listens in on calls to suggest what to say.",
      points: [
        { h: "Know who to call first", t: "A ranked list each morning, built from budget, timing, financing and how quickly people reply." },
        { h: "Messages that sound like you", t: "Suggested WhatsApp replies in your tone, in English or Arabic. Send them as they are, or edit first." },
        { h: "A second ear on every call", t: "Live prompts for objections, comparable prices to hand, and notes written for you before you hang up." },
      ],
    },
    developers: {
      label: "Developers", short: "Turn launch-day demand into qualified, booked appointments.",
      h1: "Handle launch day demand without dropping a single buyer.",
      sub: "When a project launches, thousands of enquiries arrive in an afternoon. Observer answers each one, qualifies it against your inventory and payment plans, and books the serious buyers into your sales gallery.",
      points: [
        { h: "Scale on launch day", t: "Thousands of conversations at once, each with a personal reply, without adding temporary staff." },
        { h: "Payment plans that sell", t: "Buyers see post-handover and developer plans with real fees, worked out for the unit they asked about." },
        { h: "Brokers and in-house, together", t: "Route enquiries to your own team or partner agencies, and see conversion by channel and by broker." },
      ],
    },
    investors: {
      label: "Investors", short: "The intelligence layer for the region’s fastest-growing property markets.",
      h1: "The intelligence layer for Gulf property sales.",
      sub: "Gulf real estate is sold on WhatsApp, at speed, in two languages, and most of it still runs on spreadsheets. Observer sits where every enquiry starts, which is where most of the value is lost or won.",
      points: [
        { h: "A large, under-served market", t: "Thousands of brokerages and developers across six GCC countries, most still working from spreadsheets and shared phones." },
        { h: "Built where the work happens", t: "WhatsApp-first, Arabic-native, and with data hosted in the region. These are hard for global CRMs to copy." },
        { h: "Compounding data", t: "Every conversation improves the scores and the timing for every other workspace on Observer." },
      ],
    },
  },
  product: {
    h1: "Everything your sales desk does, done faster.",
    sub: "Eighteen screens, one quiet system. Here is what Observer does from the moment an enquiry arrives to the day the keys change hands.",
    groups: [
      { id: "intelligence", h: "Intelligence", t: "Observer reads every lead and every conversation, and turns them into a short list of what to do next.", items: [
        { h: "Lead scoring", t: "A score from 0 to 100, built from seven signals. It shows its working, and your team can adjust the weights." },
        { h: "Intent detection", t: "Highlights the words that matter, such as “cash”, “this week” or “just looking”, and labels buyers, sellers and investors." },
        { h: "Next best action", t: "Ranks the day’s actions by commission at stake, chance to close and how fast that chance is fading." },
        { h: "Live call assistant", t: "Suggests the next line, handles objections with real comparables, and writes the call notes." },
      ], shot: "scoring" },
      { id: "channels", h: "Channels", t: "Meet buyers where they already are, with replies that never sound automated.", items: [
        { h: "WhatsApp", t: "A shared inbox with suggested replies, listing cards with photographs, and one-tap viewing bookings." },
        { h: "Sequences", t: "WhatsApp first, then SMS, then a call, then email, and it stops the moment someone replies." },
        { h: "Facebook and Instagram", t: "Lead forms, DMs and comments answered in seconds, with a call from Observer if the lead doesn’t close." },
      ], shot: "whatsapp" },
      { id: "analytics", h: "Analytics", t: "Know what’s working, which channel pays, and which agent needs a hand.", items: [
        { h: "Conversion funnel", t: "See where leads go quiet, with the most common reason at each stage." },
        { h: "Channel ROI", t: "Cost per lead and revenue by portal, so you can move the budget to what works." },
        { h: "Agent performance", t: "Reply times, viewings booked and conversion for every agent, in one table." },
      ], shot: "dashboard" },
      { id: "market", h: "GCC market", t: "Tools that only make sense in the Gulf, and that buyers here expect.", items: [
        { h: "Payment plans", t: "Bank, developer, cash and post-handover, side by side, with DLD, agency and trustee fees." },
        { h: "GCC developers", t: "A directory of developers and flagship projects across the UAE, Saudi Arabia, Qatar, Kuwait, Bahrain and Oman." },
      ], shot: "payment-plans" },
      { id: "enterprise", h: "Enterprise", t: "Built for brokerages and developers who answer to a board and a regulator.", items: [
        { h: "SLA tracking", t: "Live timers on every waiting lead, with escalation before a breach." },
        { h: "Compliance", t: "Data in Bahrain, AES-256 encryption, a full audit log, and UAE and Saudi PDPL controls." },
        { h: "Notifications", t: "Only what needs a person. Observer deals with the rest quietly." },
      ], shot: "sequences" },
    ],
    close: { h2: "See it with your own leads.", cta: "Book a demo" },
  },
  pricing: {
    h1: "Simple pricing, in dirhams.",
    sub: "Every plan includes WhatsApp, lead scoring, Arabic and English, and data hosted in the region. Prices exclude VAT.",
    month: "/ month",
    tiers: [
      { name: "Agent", price: "AED 490", note: "For one agent", cta: "Start with Agent", features: ["One seat", "Up to 300 leads a month", "WhatsApp inbox and suggested replies", "Lead scoring and next best action", "Payment plan calculator"] },
      { name: "Brokerage", price: "AED 2,900", note: "Up to 15 agents", cta: "Book a demo", featured: true, features: ["Everything in Agent", "Unlimited leads", "Sequences across WhatsApp, SMS and email", "Facebook and Instagram automation", "Routing, SLA timers and agent analytics", "Live call assistant"] },
      { name: "Developer", price: "Custom", note: "For launches and large teams", cta: "Talk to us", features: ["Everything in Brokerage", "Launch-day capacity", "Broker partner routing", "AI calling at volume", "Dedicated success manager", "Single sign-on and audit exports"] },
    ],
    popular: "Best for teams",
    faqH: "Questions people ask",
    faq: [
      { q: "Do I need the WhatsApp Business API?", a: "Yes, and we set it up with you. Most teams are sending messages through Observer within a week." },
      { q: "Will buyers know they’re talking to AI?", a: "Observer writes the first replies and follow-ups in your agency’s voice, and hands over to a person the moment a buyer engages. You decide how it introduces itself." },
      { q: "Does it work with Bayut and Property Finder?", a: "Yes. Leads from both portals arrive in Observer automatically, along with leads from your website, Facebook and Instagram." },
      { q: "Where is our data stored?", a: "In AWS Middle East (Bahrain). It’s encrypted at rest and in transit, and it never leaves the region." },
      { q: "Can we keep our existing CRM?", a: "Yes. Observer can run alongside it and sync contacts and stages, or replace it entirely. It’s your choice." },
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
      { h: "Speed is a courtesy", t: "A reply in four minutes tells a buyer they matter. Every product decision starts there." },
      { h: "Show the working", t: "A score nobody can explain is a score nobody trusts. Ours always shows why." },
      { h: "People close", t: "Observer prepares the ground. The handshake, the viewing and the keys stay with your team." },
      { h: "Local by design", t: "Arabic, dirhams, DLD fees and data in the region are built in from the start, not added later." },
    ],
    whereH: "Where we are",
    where: "We’re based in Dubai and work with teams across the UAE, Saudi Arabia and Qatar. Customer data is hosted in Bahrain.",
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
    demo: "احجز عرضاً توضيحياً", app: "افتح التطبيق", signin: "تسجيل الدخول", menu: "القائمة", close: "إغلاق", lang: "English", skip: "انتقل إلى المحتوى",
  },
  footer: {
    line: "مكتب المبيعات الذكي لعقارات الخليج.",
    cols: [
      { h: "المنتج", links: [["نظرة عامة", "/product"], ["الأسعار", "/pricing"], ["افتح التطبيق", "/app/dashboard"]] },
      { h: "الحلول", links: [["شركات الوساطة", "/solutions/brokerages"], ["الوكلاء", "/solutions/agents"], ["المطوّرون", "/solutions/developers"], ["المستثمرون", "/solutions/investors"]] },
      { h: "الشركة", links: [["من نحن", "/about"], ["تواصل معنا", "/contact"], ["احجز عرضاً توضيحياً", "/contact"]] },
    ],
    data: "بيانات العملاء مستضافة في AWS الشرق الأوسط (البحرين).",
    rights: "أوبزرفر AI. جميع الحقوق محفوظة.",
    credits: "الصور من Unsplash.",
  },
  home: {
    hero: {
      h1: "مكتب المبيعات الذكي لعقارات الخليج.",
      sub: "يرد أوبزرفر على كل استفسار عبر واتساب خلال أقل من أربع دقائق، ويقرأ مدى جدية كل مشترٍ، ويخبر وكلاءك بمن يتصلون أولاً. ليلاً ونهاراً، بالعربية والإنجليزية.",
      cta: "احجز عرضاً توضيحياً", cta2: "شاهد التطبيق",
    },
    problem: {
      h2: "معظم العملاء يضيعون قبل أن يقول لهم أحد: مرحباً.",
      body: "يرسل المشتري الاستفسار نفسه إلى خمس وكالات في الحادية عشرة ليلاً. من يرد أولاً، ويرد جيداً، يحصل غالباً على المعاينة. وفي الصباح يصبح الباقون مجرد اسم في جدول.",
      facts: [
        { n: "36%", t: "من العملاء يضيعون قبل تأهيلهم، والسبب الأكثر شيوعاً ردٌّ أول تأخر أكثر من خمس عشرة دقيقة." },
        { n: "41%", t: "يصمتون بعد التأهيل حين لا يتابعهم أحد على واتساب." },
        { n: "89%", t: "من رسائل واتساب تُفتح، مقابل 28% فقط للبريد الإلكتروني." },
      ],
    },
    desk: {
      h2: "شاشة واحدة هادئة للمكتب كله.",
      body: "العملاء الأكثر جاهزية في الأعلى، وبجانبهم ما أنجزه أوبزرفر خلال الليل، وتحتهم أهم ثلاثة أمور تستحق وقتك اليوم. لا شيء آخر يزاحم انتباهك.",
    },
    whatsapp: {
      h2: "ردود تشبه أفضل وكلائك.",
      body: "يكتب أوبزرفر بأسلوب وكالتك، بالعربية أو الإنجليزية، ويرسل العقار مع صوره. وحين يرد المشتري، يتولى أحد وكلائك المحادثة والسياق كله أمامه.",
      link: "كيف يعمل واتساب في أوبزرفر",
    },
    score: {
      h2: "تقييم يمكن لوكلائك مناقشته.",
      body: "سبع إشارات تدخل في كل تقييم، من الميزانية والتمويل إلى سرعة الرد. كل تقييم يعرض أسبابه، فيرى الوكيل لماذا حصل أحمد على 87 وعمر على 44، ويعدّله حين يعرف أكثر.",
    },
    cascade: {
      h2: "متابعة لا تنسى أحداً.",
      body: "واتساب أولاً، ثم رسالة نصية، ثم مكالمة قصيرة من أوبزرفر، ثم بريد مدروس. وفي اللحظة التي يرد فيها المشتري على أي قناة، يتولى أحد وكلائك المحادثة ويتنحى أوبزرفر.",
      steps: ["واتساب", "واتساب ثانٍ", "رسالة نصية", "مكالمة ذكية", "بريد إلكتروني", "وكيلك"],
      waits: ["0 دقيقة", "30 دقيقة", "ساعتان", "24 ساعة", "48 ساعة", "عند الرد"],
    },
    gulf: {
      h2: "مصمَّم لطريقة بيع العقار هنا.",
      body: "صُمّم أوبزرفر لدبي وأبوظبي والرياض والدوحة، وهذا يظهر في التفاصيل لا في اللغة وحدها.",
      items: [
        { h: "خطط سداد برسوم حقيقية", t: "الرهن العقاري وخطط المطوّر والدفع النقدي وما بعد التسليم جنباً إلى جنب، مع رسوم دائرة الأراضي 4% وأتعاب الأمين." },
        { h: "عربية كما ينبغي", t: "واجهة كاملة من اليمين إلى اليسار، وردود تُقرأ كأن إنساناً كتبها بالعربية." },
        { h: "دليل مطوّري الخليج", t: "المطوّرون ومشاريعهم الرئيسية في ست دول، لتطابق المشتري مع الإطلاق المناسب." },
        { h: "بياناتك تبقى في المنطقة", t: "مستضافة في AWS الشرق الأوسط (البحرين)، مشفّرة بالكامل، ومتوافقة مع قوانين حماية البيانات في الإمارات والسعودية." },
      ],
    },
    results: {
      h2: "بعد شهر من العمل على أوبزرفر.",
      items: [
        { n: "4 د", t: "متوسط الوقت من الاستفسار إلى أول رد على واتساب" },
        { n: "61.7%", t: "من العملاء المؤهلين حجزوا معاينة" },
        { n: "214", t: "عميلاً خاملاً عادوا إلى المحادثة" },
        { n: "42 درهم", t: "تكلفة العميل الواحد، بانخفاض 18% عن الشهر السابق" },
      ],
    },
    who: { h2: "مصمَّم لكل من يبيع منزلاً." },
    close: { h2: "أحضر استفسارات أسبوع واحد.", body: "سنحمّلها في أوبزرفر ونريك بمن كنت ستتصل أولاً، وكم كانت قيمة ذلك.", cta: "احجز عرضاً توضيحياً", cta2: "افتح التطبيق" },
  },
  audiences: {
    brokerages: {
      label: "شركات الوساطة", short: "كل عميل وكل وكيل وكل رد في مكان واحد، ولا مزيد من خسارة المشترين لمن يرد أسرع.",
      h1: "وساطة أسرع، دون الحاجة إلى نوبة ليلية.",
      sub: "يرد أوبزرفر على كل استفسار من البوابات وواتساب ووسائل التواصل خلال دقائق، ويقيّمه، ويحوّله إلى الوكيل المناسب. تحصل على خط مبيعات تثق به، وفريق يقضي يومه في المعاينات.",
      points: [
        { h: "لا عميل ينتظر", t: "كل استفسار يحصل على رد شخصي خلال أقل من أربع دقائق، في أي ساعة، من بيوت وبروبرتي فايندر وواتساب وإنستغرام." },
        { h: "توزيع عادل وواضح", t: "تُوزَّع العملاء حسب المنطقة واللغة والطاقة الاستيعابية، ومؤقتات مستوى الخدمة تُظهر من ينتظر وتصعّد قبل أن يبرد المشتري." },
        { h: "توقعات يمكنك الدفاع عنها", t: "خط مبيعات مرجّح حسب المرحلة، وعائد لكل قناة يُظهر أي البوابات تستحق ما تدفعه." },
      ],
    },
    agents: {
      label: "الوكلاء", short: "استيقظ على معاينات محجوزة، لا على قائمة أشخاص عليك ملاحقتهم.",
      h1: "اقضِ يومك في المعاينات، لا في ملاحقة الردود.",
      sub: "يبقي أوبزرفر كل محادثة دافئة وأنت تعرض فيلا أو نائم. يخبرك من هو جاهز للشراء، ويكتب الرسالة التالية، ويستمع إلى مكالماتك ليقترح ما تقوله.",
      points: [
        { h: "اعرف بمن تتصل أولاً", t: "قائمة مرتّبة كل صباح، مبنية على الميزانية والتوقيت والتمويل وسرعة الرد." },
        { h: "رسائل بصوتك", t: "ردود واتساب مقترحة بأسلوبك، بالعربية أو الإنجليزية. أرسلها كما هي أو عدّلها أولاً." },
        { h: "أذن ثانية في كل مكالمة", t: "اقتراحات فورية للاعتراضات، وأسعار مقارنة جاهزة، وملاحظات مكتوبة قبل أن تنهي المكالمة." },
      ],
    },
    developers: {
      label: "المطوّرون", short: "حوّل طلب يوم الإطلاق إلى مواعيد مؤهلة ومحجوزة.",
      h1: "استوعب طلب يوم الإطلاق دون أن تفقد مشترياً واحداً.",
      sub: "حين يُطلق مشروع، تصل آلاف الاستفسارات في ساعات. يرد أوبزرفر على كل منها، ويؤهله وفق مخزونك وخطط السداد، ويحجز للمشترين الجادين موعداً في صالة مبيعاتك.",
      points: [
        { h: "قدرة يوم الإطلاق", t: "آلاف المحادثات في الوقت نفسه، كلٌّ برد شخصي، دون موظفين مؤقتين." },
        { h: "خطط سداد تبيع", t: "يرى المشتري خطط ما بعد التسليم وخطط المطوّر برسوم حقيقية، محسوبة للوحدة التي سأل عنها." },
        { h: "الوسطاء وفريقك معاً", t: "وجّه الاستفسارات إلى فريقك أو الوكالات الشريكة، وتابع التحويل حسب القناة والوسيط." },
      ],
    },
    investors: {
      label: "المستثمرون", short: "طبقة الذكاء لأسرع أسواق العقار نمواً في المنطقة.",
      h1: "طبقة الذكاء لمبيعات العقار في الخليج.",
      sub: "يُباع عقار الخليج عبر واتساب، بسرعة، وبلغتين، ومعظمه ما زال يُدار بالجداول. يقف أوبزرفر حيث يبدأ كل استفسار، وهناك تُكسب معظم القيمة أو تُفقد.",
      points: [
        { h: "سوق كبير لم يُخدم بعد", t: "آلاف شركات الوساطة والمطوّرين في ست دول خليجية، ومعظمهم ما زال يعمل بالجداول والهواتف المشتركة." },
        { h: "مبني حيث يحدث العمل", t: "واتساب أولاً، وعربي أصيل، وبيانات مستضافة في المنطقة. يصعب على أنظمة إدارة العملاء العالمية تقليد ذلك." },
        { h: "بيانات تتراكم قيمتها", t: "كل محادثة تحسّن التقييمات والتوقيت لكل مساحة عمل أخرى على أوبزرفر." },
      ],
    },
  },
  product: {
    h1: "كل ما يفعله مكتب مبيعاتك، أسرع.",
    sub: "ثماني عشرة شاشة ونظام واحد هادئ. هذا ما يفعله أوبزرفر من لحظة وصول الاستفسار حتى يوم تسليم المفاتيح.",
    groups: [
      { id: "intelligence", h: "الذكاء", t: "يقرأ أوبزرفر كل عميل وكل محادثة، ويحوّلها إلى قائمة قصيرة بما يجب فعله.", items: [
        { h: "تقييم العملاء", t: "تقييم من 0 إلى 100 مبني على سبع إشارات. يعرض أسبابه، ويمكن لفريقك تعديل الأوزان." },
        { h: "كشف النية", t: "يبرز الكلمات المهمة مثل «نقداً» و«هذا الأسبوع» و«أتصفح فقط»، ويصنّف المشترين والبائعين والمستثمرين." },
        { h: "أفضل إجراء تالٍ", t: "يرتّب إجراءات اليوم حسب العمولة المعنية وفرصة الإغلاق وسرعة تلاشيها." },
        { h: "مساعد المكالمات المباشر", t: "يقترح الجملة التالية، ويعالج الاعتراضات بمقارنات حقيقية، ويكتب ملاحظات المكالمة." },
      ], shot: "scoring" },
      { id: "channels", h: "القنوات", t: "قابل المشترين حيث هم، بردود لا تبدو آلية أبداً.", items: [
        { h: "واتساب", t: "صندوق وارد مشترك مع ردود مقترحة، وبطاقات عقارات بالصور، وحجز معاينة بلمسة." },
        { h: "التسلسلات", t: "واتساب أولاً، ثم رسالة نصية، ثم مكالمة، ثم بريد، وتتوقف لحظة الرد." },
        { h: "فيسبوك وإنستغرام", t: "نماذج العملاء والرسائل والتعليقات يُرد عليها في ثوانٍ، مع مكالمة من أوبزرفر إن لم يُغلق العميل." },
      ], shot: "whatsapp" },
      { id: "analytics", h: "التحليلات", t: "اعرف ما ينجح، وأي قناة تستحق، وأي وكيل يحتاج إلى مساعدة.", items: [
        { h: "قمع التحويل", t: "اعرف أين يصمت العملاء، والسبب الأكثر شيوعاً في كل مرحلة." },
        { h: "عائد القنوات", t: "تكلفة العميل والإيرادات لكل بوابة، لتنقل الميزانية إلى ما ينجح." },
        { h: "أداء الوكلاء", t: "أوقات الرد والمعاينات المحجوزة والتحويل لكل وكيل، في جدول واحد." },
      ], shot: "dashboard" },
      { id: "market", h: "سوق الخليج", t: "أدوات لا معنى لها إلا في الخليج، ويتوقعها المشترون هنا.", items: [
        { h: "خطط السداد", t: "البنك والمطوّر والنقد وما بعد التسليم جنباً إلى جنب، مع رسوم دائرة الأراضي والوكالة والأمين." },
        { h: "مطوّرو الخليج", t: "دليل للمطوّرين ومشاريعهم الرئيسية في الإمارات والسعودية وقطر والكويت والبحرين وعُمان." },
      ], shot: "payment-plans" },
      { id: "enterprise", h: "المؤسسات", t: "لشركات الوساطة والمطوّرين المسؤولين أمام مجلس إدارة وجهة تنظيمية.", items: [
        { h: "تتبع مستوى الخدمة", t: "مؤقتات حية لكل عميل ينتظر، مع تصعيد قبل حدوث أي تجاوز." },
        { h: "الامتثال", t: "البيانات في البحرين، وتشفير AES-256، وسجل تدقيق كامل، وضوابط حماية البيانات الإماراتية والسعودية." },
        { h: "الإشعارات", t: "فقط ما يحتاج إلى إنسان. يتعامل أوبزرفر مع الباقي بهدوء." },
      ], shot: "sequences" },
    ],
    close: { h2: "شاهده مع عملائك أنت.", cta: "احجز عرضاً توضيحياً" },
  },
  pricing: {
    h1: "أسعار واضحة، بالدرهم.",
    sub: "كل باقة تشمل واتساب وتقييم العملاء والعربية والإنجليزية واستضافة البيانات في المنطقة. الأسعار لا تشمل ضريبة القيمة المضافة.",
    month: "/ شهرياً",
    tiers: [
      { name: "الوكيل", price: "490 درهم", note: "لوكيل واحد", cta: "ابدأ بباقة الوكيل", features: ["مقعد واحد", "حتى 300 عميل شهرياً", "صندوق واتساب وردود مقترحة", "تقييم العملاء وأفضل إجراء تالٍ", "حاسبة خطط السداد"] },
      { name: "الوساطة", price: "2,900 درهم", note: "حتى 15 وكيلاً", cta: "احجز عرضاً توضيحياً", featured: true, features: ["كل ما في باقة الوكيل", "عملاء بلا حدود", "تسلسلات عبر واتساب والرسائل والبريد", "أتمتة فيسبوك وإنستغرام", "التوزيع ومؤقتات الخدمة وتحليلات الوكلاء", "مساعد المكالمات المباشر"] },
      { name: "المطوّر", price: "حسب الطلب", note: "للإطلاقات والفرق الكبيرة", cta: "تحدّث إلينا", features: ["كل ما في باقة الوساطة", "قدرة يوم الإطلاق", "توزيع على الوسطاء الشركاء", "مكالمات ذكية بكثافة", "مدير نجاح مخصص", "تسجيل دخول موحّد وتصدير سجلات التدقيق"] },
    ],
    popular: "الأنسب للفرق",
    faqH: "أسئلة شائعة",
    faq: [
      { q: "هل أحتاج إلى واجهة واتساب للأعمال؟", a: "نعم، ونجهّزها معك. معظم الفرق ترسل رسائلها عبر أوبزرفر خلال أسبوع." },
      { q: "هل سيعرف المشترون أنهم يتحدثون مع ذكاء اصطناعي؟", a: "يكتب أوبزرفر الردود الأولى والمتابعات بأسلوب وكالتك، ويسلّم المحادثة لإنسان لحظة تفاعل المشتري. وأنت تقرر كيف يعرّف بنفسه." },
      { q: "هل يعمل مع بيوت وبروبرتي فايندر؟", a: "نعم. يصل العملاء من البوابتين إلى أوبزرفر تلقائياً، مع عملاء موقعك وفيسبوك وإنستغرام." },
      { q: "أين تُخزَّن بياناتنا؟", a: "في AWS الشرق الأوسط (البحرين)، مشفّرة أثناء التخزين والنقل، ولا تغادر المنطقة." },
      { q: "هل يمكننا الإبقاء على نظامنا الحالي لإدارة العملاء؟", a: "نعم. يعمل أوبزرفر إلى جانبه ويزامن جهات الاتصال والمراحل، أو يحل محله بالكامل. القرار لك." },
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
      { h: "السرعة لباقة", t: "الرد خلال أربع دقائق يخبر المشتري أنه مهم. ومن هنا يبدأ كل قرار في المنتج." },
      { h: "أظهِر الأسباب", t: "التقييم الذي لا يستطيع أحد شرحه لا يثق به أحد. تقييمنا يُظهر أسبابه دائماً." },
      { h: "الناس هم من يغلقون الصفقات", t: "يمهّد أوبزرفر الطريق، أما المصافحة والمعاينة والمفاتيح فتبقى مع فريقك." },
      { h: "محلي بالتصميم", t: "العربية والدرهم ورسوم دائرة الأراضي والبيانات في المنطقة، جزء منه من البداية لا إضافة لاحقة." },
    ],
    whereH: "أين نحن",
    where: "مقرنا في دبي، ونعمل مع فرق في الإمارات والسعودية وقطر. بيانات العملاء مستضافة في البحرين.",
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
