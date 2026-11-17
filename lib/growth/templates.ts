/**
 * WhatsApp message templates. Meta only lets a business start a conversation (or write after 24 hours of
 * silence) with a pre-approved template, so these exact texts must be submitted in WhatsApp Manager, one per
 * language, under the names below. {{1}} = lead first name, {{2}} = assistant name, {{3}} = company.
 * Once the lead replies, the 24-hour window opens and the AI writes freely.
 */
export const TEMPLATE_NAMES = { first: "observer_first_contact", followup: "observer_followup", alert: "observer_agent_alert" } as const;

export const FIRST_CONTACT: Record<string, string> = {
  en: "Hi {{1}}, this is {{2}}, the AI assistant at {{3}}. Thank you for your enquiry. I can share prices, payment plans and viewing times right here. What would you like to know first?",
  ar: "مرحباً {{1}}، أنا {{2}}، المساعد الذكي في {{3}}. شكراً لاستفسارك. يمكنني مشاركة الأسعار وخطط السداد ومواعيد المعاينة هنا مباشرة. بماذا تحب أن نبدأ؟",
  hi: "नमस्ते {{1}}, मैं {{2}} हूँ, {{3}} की AI सहायक। आपकी पूछताछ के लिए धन्यवाद। मैं यहीं कीमतें, भुगतान योजनाएँ और विज़िट के समय बता सकती हूँ। आप पहले क्या जानना चाहेंगे?",
  ur: "السلام علیکم {{1}}، میں {{2}} ہوں، {{3}} کی AI اسسٹنٹ۔ آپ کی دلچسپی کا شکریہ۔ میں یہیں قیمتیں، ادائیگی کے منصوبے اور وزٹ کے اوقات بتا سکتی ہوں۔ آپ پہلے کیا جاننا چاہیں گے؟",
  es: "Hola {{1}}, soy {{2}}, la asistente de IA de {{3}}. Gracias por su consulta. Puedo compartir aquí precios, planes de pago y horarios de visita. ¿Qué le gustaría saber primero?",
  pt: "Olá {{1}}, sou {{2}}, a assistente de IA da {{3}}. Obrigada pelo seu contato. Posso compartilhar aqui preços, planos de pagamento e horários de visita. O que gostaria de saber primeiro?",
  ru: "Здравствуйте, {{1}}! Я {{2}}, ИИ-ассистент {{3}}. Спасибо за ваш запрос. Здесь я могу рассказать о ценах, планах оплаты и времени просмотра. С чего начнём?",
  fr: "Bonjour {{1}}, je suis {{2}}, l'assistante IA de {{3}}. Merci pour votre demande. Je peux vous indiquer ici les prix, les plans de paiement et les créneaux de visite. Par quoi souhaitez-vous commencer ?",
  zh: "{{1}}您好，我是{{3}}的AI助理{{2}}。感谢您的咨询。我可以在这里为您介绍价格、付款计划和看房时间。您想先了解哪方面？",
  fa: "سلام {{1}}، من {{2}} هستم، دستیار هوش مصنوعی {{3}}. از درخواست شما سپاسگزاریم. می‌توانم قیمت‌ها، طرح‌های پرداخت و زمان بازدید را همین‌جا بگویم. دوست دارید از کجا شروع کنیم؟",
};

export const FOLLOWUP: Record<string, string> = {
  en: "Hi {{1}}, {{2}} from {{3}} here. Just checking in on your property search. Shall I send a few options, or would you prefer a quick call with a colleague?",
  ar: "مرحباً {{1}}، معك {{2}} من {{3}}. أردت فقط الاطمئنان على بحثك عن عقار. هل أرسل لك بعض الخيارات، أم تفضّل مكالمة قصيرة مع أحد زملائي؟",
  hi: "नमस्ते {{1}}, मैं {{3}} से {{2}}। बस आपकी प्रॉपर्टी खोज के बारे में पूछना चाहती थी। क्या मैं कुछ विकल्प भेजूँ, या आप हमारे किसी सहकर्मी से छोटी सी कॉल पसंद करेंगे?",
  ur: "السلام علیکم {{1}}، میں {{3}} سے {{2}}۔ آپ کی پراپرٹی کی تلاش کے بارے میں پوچھنا چاہتی تھی۔ کیا میں کچھ آپشنز بھیجوں، یا آپ ہمارے کسی ساتھی سے مختصر کال پسند کریں گے؟",
  es: "Hola {{1}}, soy {{2}} de {{3}}. Solo quería saber cómo va su búsqueda. ¿Le envío algunas opciones o prefiere una llamada breve con un compañero?",
  pt: "Olá {{1}}, aqui é {{2}} da {{3}}. Só queria saber como está sua busca. Posso enviar algumas opções, ou prefere uma ligação rápida com um colega?",
  ru: "Здравствуйте, {{1}}! Это {{2}} из {{3}}. Как продвигается поиск недвижимости? Прислать несколько вариантов или удобнее короткий звонок с коллегой?",
  fr: "Bonjour {{1}}, ici {{2}} de {{3}}. Je prends des nouvelles de votre recherche. Je vous envoie quelques options, ou préférez-vous un court appel avec un collègue ?",
  zh: "{{1}}您好，我是{{3}}的{{2}}。想了解一下您的找房进展。需要我发送几个选项，还是安排同事和您简短通个电话？",
  fa: "سلام {{1}}، {{2}} از {{3}} هستم. خواستم از روند جستجوی ملک شما باخبر شوم. چند گزینه بفرستم یا ترجیح می‌دهید با یکی از همکارانم کوتاه صحبت کنید؟",
};

export const AGENT_ALERT_EN = "Observer: {{1}} Open the lead: {{2}}";

export function render(t: string, params: string[]) {
  return t.replace(/\{\{(\d)\}\}/g, (_, n) => params[Number(n) - 1] ?? "");
}
