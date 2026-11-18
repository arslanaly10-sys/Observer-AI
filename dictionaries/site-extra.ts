/** Copy for the v2 marketing additions: live demo, ROI calculator, integrations, trust pages, 404. EN + AR. */
import type { Locale } from "@/lib/i18n";

const en = {
  demo: {
    h2: "Send Observer an enquiry.",
    body: "Paste a message the way a buyer would write it, in English or Arabic. Observer reads it, scores it, and drafts the first reply, right here in your browser.",
    label: "A buyer’s message",
    samples: [
      { label: "Cash buyer, this week", text: "Hi, looking for a villa in Dubai Hills around 4 million, cash. Need to see something this week." },
      { label: "Seller", text: "I have a 2BR in Business Bay. What price could I get? Just curious for now." },
      { label: "Investor", text: "Interested in an apartment in Dubai Marina as an investment, budget 2 million. What rental yield can I expect?" },
      { label: "بالعربية", text: "مرحباً، أبحث عن فيلا في نخلة جميرا بميزانية 6 ملايين نقداً، وأريد معاينة هذا الأسبوع." },
    ],
    run: "Read it",
    score: "Score", intent: "Intent", urgency: "Urgency", area: "Area", budget: "Budget", signals: "What it heard",
    reply: "Observer’s first reply", sent: "Read and drafted in", seconds: "ms, on your device",
    none: "No clear signal yet. Add a budget, an area or a timeframe.",
    unknown: "Not stated",
    note: "This demo runs the rules engine in your browser. In a workspace, Claude scores the lead and the reply only quotes your inventory.",
    vals: { Buyer: "Buyer", Seller: "Seller", Unknown: "Unclear", High: "High", Medium: "Medium", Low: "Low", hot: "Hot", warm: "Warm", cold: "Cold" } as Record<string, string>,
    sig: { Buyer: "Buyer", Seller: "Seller", Urgent: "Urgent", "High budget": "High budget", Serious: "Serious", Researching: "Just looking", Investor: "Investor" } as Record<string, string>,
  },
  integrations: {
    h2: "Works with what you already use.",
    body: "Leads arrive from the ads, portals and channels your buyers use. Your CRM can stay where it is.",
    items: ["WhatsApp Business", "Facebook Lead Ads", "Instagram", "Google Ads", "TikTok", "Snapchat", "Bayut", "Property Finder", "Dubizzle", "Website forms", "Email (Resend)", "AI calls (Twilio)", "Any tool, by webhook"],
  },
  roi: {
    h2: "What slow replies are costing you.",
    body: "Move the sliders to match your team. The model is simple and shown below, so you can check it.",
    leads: "Leads a month", deal: "Average sale price", commission: "Your commission", reply: "Your typical first reply",
    replies: { under5: "Under 5 minutes", "5to15": "5 to 15 minutes", "15to60": "15 to 60 minutes", over60: "Over an hour" } as Record<string, string>,
    lostH: "Qualified buyers lost each month", dealsH: "Extra closings a month", monthH: "Commission recovered a month", yearH: "Over a year",
    zero: "You’re already fast. Observer keeps you there at 2am too.",
    qualify: "Leads that qualify when answered within 5 minutes", close: "Qualified leads that close",
    model: "How this works: the two rates above are your own (the defaults are only examples, not research). We assume qualification falls to 75% of that rate when replies take 5 to 15 minutes, 55% at 15 to 60, and 40% after an hour. Use your CRM's numbers for a real estimate; this is not a guarantee.",
    cta: "See it with your own numbers",
  },
  solutionsMenu: "Who it’s for",
  trust: {
    security: {
      title: "Security",
      h1: "Your buyers’ data, handled with care.",
      sub: "Observer handles names, numbers and budgets. Here is exactly how we look after them.",
      sections: [
        { h: "Where data lives", t: "All customer data is stored in AWS Europe (Frankfurt), with backups in the same region. It is encrypted in transit and at rest." },
        { h: "Encryption", t: "Data is encrypted at rest (AES-256) by our database provider and in transit with TLS." },
        { h: "Who can see what", t: "Agents see their own leads and the unassigned pool. Managers and owners see the whole workspace. This is enforced in the database itself, not just the app. Every change to a lead (owner, stage, score, notes, messages, calls, bookings) is kept on its timeline." },
        { h: "Privacy law", t: "Observer is built with the UAE Personal Data Protection Law (Federal Decree-Law No. 45 of 2021) and Saudi Arabia’s Personal Data Protection Law in mind: it records each lead’s contact consent and opt-out, and deleting a lead deletes its messages and bookings. Hosting in Frankfurt means data is processed outside the GCC; check what that means for your own obligations." },
        { h: "WhatsApp", t: "Messages are sent through the official WhatsApp Business Platform, using templates approved by Meta. Buyers can opt out at any time." },
        { h: "AI and calls", t: "Observer’s assistant tells every lead it is an AI in its first message, and never claims to be a person. AI phone calls say they may be recorded; recordings are kept by our calling provider." },
        { h: "Services we use", t: "Supabase (database and sign-in, AWS Frankfurt), Vercel (hosting), Anthropic (Claude, which reads conversations to score leads and write replies), Meta (WhatsApp and Lead Ads), Resend (email), Twilio (phone calls and recordings), ElevenLabs (the assistant’s voice) and Cloudflare Turnstile (spam protection on forms). Each processes only what it needs for its job." },
        { h: "Reporting a problem", t: "If you believe you’ve found a security issue, contact {security}. We reply within one working day." },
      ],
    },
    privacy: {
      title: "Privacy",
      h1: "Privacy notice",
      draft: "Draft. This notice is pending legal review and will be finalised before launch.",
      sections: [
        { h: "Who we are", t: "Observer AI provides sales software to real estate brokerages and developers in the GCC. For leads our customers manage in Observer, the customer is the controller and we process data on their behalf." },
        { h: "What we collect on this website", t: "When you request a demo, we collect your name, company, role, phone number, email and anything you choose to tell us. We use it only to arrange and follow up on your demo." },
        { h: "How long we keep it", t: "Demo requests are kept for up to 24 months, then deleted, unless you become a customer." },
        { h: "Your rights", t: "You can ask to see, correct or delete your data at any time by writing to {privacy}." },
        { h: "Where it is stored", t: "In AWS Europe (Frankfurt)." },
        { h: "Leads in Observer", t: "For people who enquire with our customers, Observer stores their contact details, enquiry, messages, bookings and call records, and its AI provider (Anthropic) processes the conversation to score it and reply. Every message says how to stop: reply STOP, or use the unsubscribe link in an email." },
        { h: "Services we use", t: "Supabase, Vercel, Anthropic, Meta (WhatsApp), Resend, Twilio, ElevenLabs and Cloudflare. See the Security page for what each one does." },
      ],
    },
    terms: {
      title: "Terms",
      h1: "Terms of use",
      draft: "Draft. These terms are pending legal review and will be finalised before launch.",
      sections: [
        { h: "This website", t: "This site describes Observer AI. The app demo uses fictional data and does not connect to any real customer account." },
        { h: "Figures", t: "Figures on this site are sample figures from the demo workspace, and market figures are indicative ranges from public sources. Neither is a promise of results for your business." },
        { h: "Customer agreements", t: "Use of the Observer service is governed by a separate subscription agreement signed with each customer." },
        { h: "Contact", t: "Questions about these terms: write to {legal}." },
      ],
    },
  },
  footerLegal: [["Security", "/security"], ["Privacy", "/privacy"], ["Terms", "/terms"]] as [string, string][],
  notFound: { h1: "That page isn’t here.", body: "It may have moved. These will get you back on track.", home: "Go to the home page", app: "Open the app" },
};

export type ExtraDict = typeof en;

const ar: ExtraDict = {
  demo: {
    h2: "أرسل استفساراً إلى أوبزرفر.",
    body: "الصق رسالة كما يكتبها المشتري، بالعربية أو الإنجليزية. يقرأها أوبزرفر ويقيّمها ويكتب أول رد، هنا في متصفحك.",
    label: "رسالة المشتري",
    samples: [
      { label: "مشترٍ نقداً هذا الأسبوع", text: "مرحباً، أبحث عن فيلا في دبي هيلز بميزانية 4 مليون نقداً، وأريد معاينة هذا الأسبوع." },
      { label: "بائع", text: "عندي شقة غرفتين في الخليج التجاري، كم سعرها؟ أتصفح فقط حالياً." },
      { label: "مستثمر", text: "مهتم بشقة في دبي مارينا للاستثمار بميزانية 2 مليون، ما العائد الإيجاري المتوقع؟" },
      { label: "English", text: "Hi, looking for a villa in Palm Jumeirah around 6 million, cash. Ready to see it this week." },
    ],
    run: "اقرأها",
    score: "التقييم", intent: "النية", urgency: "الإلحاح", area: "المنطقة", budget: "الميزانية", signals: "ما سمعه",
    reply: "أول رد من أوبزرفر", sent: "قُرئت وكُتب الرد خلال", seconds: "ملّي ثانية على جهازك",
    none: "لا إشارة واضحة بعد. أضف ميزانية أو منطقة أو توقيتاً.",
    unknown: "غير مذكور",
    note: "يعمل هذا العرض بمحرك القواعد داخل متصفحك. في مساحة العمل، يقيّم Claude العميل ولا يقتبس الرد إلا من مخزونك.",
    vals: { Buyer: "مشترٍ", Seller: "بائع", Unknown: "غير واضح", High: "مرتفع", Medium: "متوسط", Low: "منخفض", hot: "ساخن", warm: "دافئ", cold: "بارد" },
    sig: { Buyer: "مشترٍ", Seller: "بائع", Urgent: "عاجل", "High budget": "ميزانية عالية", Serious: "جادّ", Researching: "يتصفح فقط", Investor: "مستثمر" },
  },
  integrations: {
    h2: "يعمل مع ما تستخدمه أصلاً.",
    body: "يصل العملاء من الإعلانات والبوابات والقنوات التي يستخدمها مشتروك، ويمكن لنظام إدارة العملاء لديك أن يبقى كما هو.",
    items: ["واتساب للأعمال", "إعلانات فيسبوك", "إنستغرام", "إعلانات Google", "تيك توك", "سناب شات", "بيوت", "بروبرتي فايندر", "دوبيزل", "نماذج الموقع", "البريد (Resend)", "مكالمات ذكية (Twilio)", "أي أداة عبر Webhook"],
  },
  roi: {
    h2: "كم تكلفك الردود المتأخرة.",
    body: "حرّك المؤشرات لتطابق فريقك. النموذج بسيط ومعروض أدناه لتتحقق منه.",
    leads: "العملاء شهرياً", deal: "متوسط سعر البيع", commission: "عمولتك", reply: "وقت ردك الأول المعتاد",
    replies: { under5: "أقل من 5 دقائق", "5to15": "من 5 إلى 15 دقيقة", "15to60": "من 15 إلى 60 دقيقة", over60: "أكثر من ساعة" },
    lostH: "مشترون مؤهلون يضيعون شهرياً", dealsH: "صفقات إضافية شهرياً", monthH: "عمولة مستردة شهرياً", yearH: "على مدى سنة",
    zero: "أنت سريع أصلاً. وأوبزرفر يبقيك كذلك في الثانية فجراً أيضاً.",
    qualify: "العملاء الذين يتأهلون عند الرد خلال 5 دقائق", close: "العملاء المؤهلون الذين يتم البيع لهم",
    model: "طريقة الحساب: النسبتان أعلاه خاصتان بك (القيم الافتراضية أمثلة وليست بحثاً). نفترض أن التأهل ينخفض إلى 75% من تلك النسبة عند الرد خلال 5 إلى 15 دقيقة، و55% خلال 15 إلى 60 دقيقة، و40% بعد ساعة. استخدم أرقام نظامك للحصول على تقدير حقيقي، وهذا ليس ضماناً.",
    cta: "شاهده بأرقامك أنت",
  },
  solutionsMenu: "لمن صُمّم",
  trust: {
    security: {
      title: "الأمان",
      h1: "بيانات مشتريك، في أيدٍ أمينة.",
      sub: "يتعامل أوبزرفر مع الأسماء والأرقام والميزانيات. وهذه بالضبط طريقتنا في حمايتها.",
      sections: [
        { h: "أين تُحفظ البيانات", t: "تُخزَّن جميع بيانات العملاء في AWS أوروبا (فرانكفورت)، والنسخ الاحتياطية في المنطقة نفسها، وهي مشفّرة أثناء النقل والتخزين." },
        { h: "التشفير", t: "البيانات مشفّرة أثناء التخزين (AES-256) لدى مزوّد قاعدة البيانات، وأثناء النقل عبر TLS." },
        { h: "من يرى ماذا", t: "يرى الوكيل عملاءه والعملاء غير المسندين، ويرى المدير والمالك مساحة العمل كاملة، ويُطبَّق ذلك في قاعدة البيانات نفسها. وكل تغيير على العميل (المسؤول، المرحلة، التقييم، الملاحظات، الرسائل، المكالمات، الحجوزات) يبقى في سجله الزمني." },
        { h: "قوانين الخصوصية", t: "صُمّم أوبزرفر مع مراعاة قانون حماية البيانات الشخصية الإماراتي (المرسوم بقانون اتحادي رقم 45 لسنة 2021) ونظام حماية البيانات الشخصية السعودي: يسجّل موافقة كل عميل على التواصل وإلغاء اشتراكه، وحذف العميل يحذف رسائله وحجوزاته. والاستضافة في فرانكفورت تعني معالجة البيانات خارج الخليج، فتحقق من أثر ذلك على التزاماتك." },
        { h: "واتساب", t: "تُرسَل الرسائل عبر منصة واتساب للأعمال الرسمية، بقوالب معتمدة من ميتا، ويمكن للمشتري إلغاء الاشتراك في أي وقت." },
        { h: "الذكاء الاصطناعي والمكالمات", t: "يخبر مساعد أوبزرفر كل عميل في أول رسالة أنه ذكاء اصطناعي، ولا يدّعي أبداً أنه إنسان. وتنبّه المكالمات الذكية إلى أنها قد تُسجَّل، ويحتفظ مزوّد الاتصال بالتسجيلات." },
        { h: "الخدمات التي نستخدمها", t: "Supabase (قاعدة البيانات وتسجيل الدخول، AWS فرانكفورت)، وVercel (الاستضافة)، وAnthropic (Claude الذي يقرأ المحادثات لتقييم العملاء وكتابة الردود)، وميتا (واتساب وإعلانات العملاء)، وResend (البريد)، وTwilio (المكالمات وتسجيلاتها)، وElevenLabs (صوت المساعد)، وCloudflare Turnstile (الحماية من الرسائل المزعجة). وكل منها يعالج ما يحتاجه فقط." },
        { h: "الإبلاغ عن مشكلة", t: "إن وجدت ثغرة أمنية، راسلنا {security}، ونرد خلال يوم عمل واحد." },
      ],
    },
    privacy: {
      title: "الخصوصية",
      h1: "إشعار الخصوصية",
      draft: "مسودة. هذا الإشعار قيد المراجعة القانونية وسيُعتمد قبل الإطلاق.",
      sections: [
        { h: "من نحن", t: "يقدّم أوبزرفر AI برنامج مبيعات لشركات الوساطة العقارية والمطوّرين في الخليج. بالنسبة لعملاء عملائنا في أوبزرفر، يكون العميل هو المتحكم بالبيانات ونعالجها نيابة عنه." },
        { h: "ما نجمعه في هذا الموقع", t: "عند طلب عرض توضيحي نجمع اسمك وشركتك ودورك ورقم هاتفك وبريدك وأي معلومات تختار مشاركتها، ونستخدمها فقط لترتيب العرض ومتابعته." },
        { h: "مدة الاحتفاظ", t: "نحتفظ بطلبات العروض مدة أقصاها 24 شهراً ثم نحذفها، ما لم تصبح عميلاً." },
        { h: "حقوقك", t: "يمكنك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها في أي وقت بمراسلتنا {privacy}." },
        { h: "مكان التخزين", t: "في AWS أوروبا (فرانكفورت)." },
        { h: "العملاء في أوبزرفر", t: "لمن يستفسر لدى عملائنا، يحفظ أوبزرفر بيانات التواصل والاستفسار والرسائل والحجوزات وسجلات المكالمات، ويعالج مزوّد الذكاء الاصطناعي (Anthropic) المحادثة لتقييمها والرد عليها. وكل رسالة توضّح طريقة التوقف: الرد بكلمة STOP أو رابط إلغاء الاشتراك في البريد." },
        { h: "الخدمات التي نستخدمها", t: "Supabase وVercel وAnthropic وميتا (واتساب) وResend وTwilio وElevenLabs وCloudflare. راجع صفحة الأمان لمعرفة دور كل منها." },
      ],
    },
    terms: {
      title: "الشروط",
      h1: "شروط الاستخدام",
      draft: "مسودة. هذه الشروط قيد المراجعة القانونية وستُعتمد قبل الإطلاق.",
      sections: [
        { h: "هذا الموقع", t: "يعرّف هذا الموقع بأوبزرفر AI. يستخدم العرض التوضيحي للتطبيق بيانات خيالية ولا يتصل بأي حساب عميل حقيقي." },
        { h: "الأرقام", t: "الأرقام في هذا الموقع نموذجية من مساحة العمل التجريبية، وأرقام السوق نطاقات تقريبية من مصادر عامة، وليست وعداً بنتائج لأعمالك." },
        { h: "اتفاقيات العملاء", t: "يخضع استخدام خدمة أوبزرفر لاتفاقية اشتراك منفصلة تُوقَّع مع كل عميل." },
        { h: "التواصل", t: "للاستفسار عن هذه الشروط: راسلنا {legal}." },
      ],
    },
  },
  footerLegal: [["الأمان", "/security"], ["الخصوصية", "/privacy"], ["الشروط", "/terms"]],
  notFound: { h1: "هذه الصفحة غير موجودة.", body: "ربما نُقلت. هذه الروابط ستعيدك إلى الطريق.", home: "الصفحة الرئيسية", app: "افتح التطبيق" },
};

export function getExtra(l: Locale): ExtraDict {
  return l === "ar" ? ar : en;
}
