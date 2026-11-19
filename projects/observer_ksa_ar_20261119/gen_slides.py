#!/usr/bin/env python3
"""Generate the Arabic (KSA) Observer deck as ppt-master SVG pages."""
import sys, os
from xml.sax.saxutils import escape

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)

OBS, IVORY, PARCH, GOLD, BRONZE = "#0F0D0A", "#F5F1EA", "#ECE5D8", "#CDB284", "#7A5A2B"
INK, MUTED, ONDARK, ONDARK2, LINE = "#1C1914", "#5E564B", "#F5F1EA", "#BDB3A3", "#D9CFBF"
DISPLAY = "Times New Roman, Amiri"
BODY = "Segoe UI, IBM Plex Sans Arabic"
R = 1200  # right text edge (RTL)

RATE = {"display": 3.1 * 56, "body": 9.5 * 18}  # clusters per 100px * size


def wrap(text, width, size, kind="body", head=0.92):
    per = RATE[kind] / size * width / 100 * head
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if len(t) > per and cur:
            lines.append(cur)
            cur = w
        else:
            cur = t
    if cur:
        lines.append(cur)
    return lines


def text(x, y, lines, size, fill, lh=1.5, family=None, weight=None, anchor=None, extra=""):
    if isinstance(lines, str):
        lines = [lines]
    # RTL lines must not end on a neutral sign: drop a line-final comma at each break
    lines = [ln.rstrip("،,") if i < len(lines) - 1 else ln for i, ln in enumerate(lines)]
    a = f' font-size="{size}" fill="{fill}"'
    if family:
        a += f' font-family="{family}"'
    if weight:
        a += f' font-weight="{weight}"'
    if anchor:
        a += f' text-anchor="{anchor}"'
    s = f'<text x="{x}" y="{y}"{a}{extra}>{escape(lines[0])}'
    for ln in lines[1:]:
        s += f'<tspan x="{x}" dy="{round(size * lh)}">{escape(ln)}</tspan>'
    return s + "</text>"


def page(name, role, bg, body, defs=""):
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" lang="ar-SA" '
           f'data-pptx-page-role="{role}" font-family="{BODY}" text-anchor="end">\n'
           f'<defs>{defs}</defs>\n'
           f'<rect id="bg" data-pptx-role="background" x="0" y="0" width="1280" height="720" fill="{bg}"/>\n'
           + body + "\n</svg>\n")
    open(os.path.join(OUT, name), "w", encoding="utf-8").write(svg)


def foot(dark):
    c = ONDARK2 if dark else MUTED
    return (f'<g id="footer" data-pptx-bounds="80 676 300 24">'
            f'<text x="80" y="694" font-size="13" fill="{c}" text-anchor="start" letter-spacing="2">OBSERVER AI</text></g>')


def eyebrow(y, label, dark, ai=False):
    """Gold kicker; AI pages carry a small 'ذكاء اصطناعي' badge to its left."""
    s = text(R, y, label, 17, GOLD if dark else BRONZE, weight="bold")
    if ai:
        w = 118
        lx = R - len(label) * 10.5 - 24 - w
        s += (f'<rect x="{lx:.0f}" y="{y - 20}" width="{w}" height="28" rx="14" fill="{GOLD}" fill-opacity="0.16" stroke="{GOLD}" stroke-width="1"/>'
              + text(round(lx + w / 2), y - 1, "ذكاء اصطناعي", 14, GOLD if dark else BRONZE, weight="bold", anchor="middle"))
    return s


def header(y, eb, title, dark, width=520, tsize=50, ai=False, lead=None, lsize=21):
    """Eyebrow + title (+ lead). Returns (svg, bottom_y)."""
    tl = wrap(title, width, tsize, "display")
    s = eyebrow(y, eb, dark, ai)
    ty = y + 24 + tsize
    s += text(R, ty, tl, tsize, ONDARK if dark else INK, lh=1.25, family=DISPLAY, weight="bold")
    bottom = ty + round(tsize * 1.25) * (len(tl) - 1) + 22
    if lead:
        ll = wrap(lead, width, lsize)
        ly = bottom + 18 + lsize
        s += text(R, ly, ll, lsize, ONDARK2 if dark else MUTED, lh=1.55)
        bottom = ly + round(lsize * 1.55) * (len(ll) - 1) + 10
    return s, bottom


def points(y, items, dark, width=440, gap=26):
    """Stacked RTL points: bold h3 + body, a gold rule on the right edge."""
    s, cy = "", y
    for h, b in items:
        bl = wrap(b, width - 22, 18)
        s += f'<rect x="{R - 3}" y="{cy - 20}" width="3" height="{30 + 28 * len(bl)}" fill="{GOLD}"/>'
        s += text(R - 20, cy, h, 21, ONDARK if dark else INK, weight="bold")
        s += text(R - 20, cy + 32, bl, 18, ONDARK2 if dark else MUTED, lh=1.55)
        cy += 32 + 28 * len(bl) + gap
    return s, cy


def shot(gid, img, x, y, w, h, dark, cap=None):
    frame = "#2A251E" if dark else "#FFFFFF"
    s = (f'<g id="{gid}" data-pptx-bounds="{x - 8} {y - 8} {w + 16} {h + 16 + (34 if cap else 0)}">'
         f'<rect x="{x - 8}" y="{y - 8}" width="{w + 16}" height="{h + 16}" rx="16" fill="{frame}" stroke="{GOLD}" stroke-opacity="0.45" stroke-width="1" filter="url(#lift)"/>'
         f'<image href="../images/{img}" x="{x}" y="{y}" width="{w}" height="{h}" preserveAspectRatio="xMidYMin slice" clip-path="url(#clip-{gid})"/>')
    if cap:
        s += text(x + w, y + h + 34, cap, 14, ONDARK2 if dark else MUTED)
    return s + "</g>"


def clip(gid, x, y, w, h):
    return f'<clipPath id="clip-{gid}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10"/></clipPath>'


LIFT = '<filter id="lift" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#000000" flood-opacity="0.14"/></filter>'


def photo_bg(img, scrim="right"):
    d = (f'<linearGradient id="scrim" x1="1" y1="0" x2="0" y2="0">'
         f'<stop offset="0%" stop-color="{OBS}" stop-opacity="0.92"/><stop offset="55%" stop-color="{OBS}" stop-opacity="0.55"/>'
         f'<stop offset="100%" stop-color="{OBS}" stop-opacity="0.10"/></linearGradient>')
    b = (f'<image id="photo" data-pptx-role="background" href="../images/{img}" x="0" y="0" width="1280" height="720" preserveAspectRatio="xMidYMid slice"/>\n'
         f'<rect id="scrim-layer" data-pptx-role="decoration" x="0" y="0" width="1280" height="720" fill="url(#scrim)"/>\n')
    return d, b


# ---------------------------------------------------------------- 01 cover
d, b = photo_bg("riyadh_night.jpg")
b += ('<g id="brand" data-pptx-bounds="640 96 560 40">'
      + text(R, 124, "OBSERVER AI", 18, GOLD, weight="bold", extra=' letter-spacing="5"') + '</g>')
b += ('<g id="title" data-pptx-bounds="260 180 940 250">'
      + text(R, 270, ["كل استفسار عقاري", "يُجاب خلال دقيقة"], 92, IVORY, lh=1.15, family=DISPLAY, weight="bold") + '</g>')
b += ('<g id="lead" data-pptx-bounds="540 452 660 90">'
      + text(R, 486, ["مكتب مبيعات يعمل بالذكاء الاصطناعي", "للمطورين والوسطاء في المملكة العربية السعودية"], 24, ONDARK2, lh=1.6) + '</g>')
b += (f'<g id="cities" data-pptx-bounds="640 600 560 56"><rect x="{R - 64}" y="606" width="64" height="2" fill="{GOLD}"/>'
      + text(R, 640, "الرياض · جدة · المنطقة الشرقية", 17, GOLD) + '</g>')
page("01_cover.svg", "cover", OBS, b, d)

# ---------------------------------------------------------------- 02 moment
defs = f'<linearGradient id="fadeL" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="{OBS}" stop-opacity="0"/><stop offset="100%" stop-color="{OBS}" stop-opacity="1"/></linearGradient>'
b = (f'<image id="dusk" data-pptx-role="background" href="../images/skyline_sunset.jpg" x="0" y="0" width="520" height="720" preserveAspectRatio="xMidYMid slice"/>\n'
     f'<rect id="dusk-fade" data-pptx-role="decoration" x="360" y="0" width="160" height="720" fill="url(#fadeL)"/>\n')
h, y = header(110, "لحظة تتكرر كل ليلة", "الساعة 11:47 مساءً، عميل يسأل عن فيلا في شمال الرياض", True, width=620, tsize=52)
b += f'<g id="header" data-pptx-bounds="580 100 620 {y - 100}">{h}</g>'
body = text(R, y + 44, ["ميزانيته أربعة ملايين ريال، والتمويل جاهز،", "ويريد المعاينة هذا الأسبوع"], 23, ONDARK2, lh=1.55)
body += text(R, y + 128, "يصله الرد في التاسعة صباحاً، وقد حجز لدى مطور آخر", 23, IVORY, weight="bold")
b += f'<g id="story" data-pptx-bounds="580 {y + 12} 620 {128 + 14 - 12}">{body}</g>'
b += (f'<g id="takeaway" data-pptx-bounds="580 590 620 60"><rect x="{R - 600}" y="596" width="600" height="1" fill="{GOLD}" fill-opacity="0.5"/>'
      + text(R, 636, "في سوق يتحرك بهذه السرعة، الدقيقة الأولى هي الصفقة", 22, GOLD, weight="bold") + '</g>')
b += foot(True)
page("02_moment.svg", "content", OBS, b, defs)

# ---------------------------------------------------------------- 03 leaks
h, y = header(110, "أين تضيع الصفقات؟", "أربعة تسريبات صامتة في كل فريق مبيعات", False, width=900, tsize=52)
b = f'<g id="header" data-pptx-bounds="280 80 920 {y - 80}">{h}</g>'
cards = [("01", "الرد المتأخر", "الاستفسارات تصل ليلاً وفي العطلات، والفريق يرد في الصباح"),
         ("02", "المتابعة المنسية", "العميل الذي لم يرد اليوم لا يتصل به أحد بعد أسبوع"),
         ("03", "الأولوية الغائبة", "المستشار يتصل بالأحدث، لا بالأقرب إلى الشراء"),
         ("04", "الذاكرة المفقودة", "كل محادثة تبدأ من الصفر حين ينتقل العميل بين المستشارين")]
cw, gap, top = 262, 24, y + 50
for i, (n, t, desc) in enumerate(cards):
    x1 = R - i * (cw + gap)
    x0 = x1 - cw
    c = (f'<rect x="{x0}" y="{top}" width="{cw}" height="300" rx="18" fill="#FFFFFF" stroke="{LINE}" stroke-width="1"/>'
         + text(x1 - 28, top + 70, n, 44, GOLD, family=DISPLAY, weight="bold")
         + text(x1 - 28, top + 130, t, 24, INK, weight="bold")
         + text(x1 - 28, top + 172, wrap(desc, cw - 56, 18), 18, MUTED, lh=1.6))
    b += f'<g id="leak-{n}" data-pptx-bounds="{x0} {top} {cw} 300">{c}</g>'
b += foot(False)
page("03_leaks.svg", "content", IVORY, b)

# ---------------------------------------------------------------- 04 market
b = f'<image id="aerial" data-pptx-role="background" href="../images/riyadh_aerial.jpg" x="0" y="0" width="460" height="720" preserveAspectRatio="xMidYMid slice"/>\n'
h, y = header(100, "السوق السعودي", "سوق يتسارع، وفرق مبيعات تحت ضغط", False, width=640, tsize=52)
b += f'<g id="header" data-pptx-bounds="540 70 660 {y - 70}">{h}</g>'
p, y2 = points(y + 44, [
    ("رؤية 2030 وبرنامج الإسكان", "بحلول عام 2030 تستهدف المملكة أن تتملك 70% من الأسر السعودية مساكنها"),
    ("البيع على الخارطة", "مشاريع مرخّصة عبر برنامج وافي، بدفعات ومستندات تحتاج إلى متابعة دقيقة"),
], False, width=640, gap=22)
b += f'<g id="drivers" data-pptx-bounds="540 {y + 18} 660 {y2 - y - 34}">{p}</g>'
chips = ["روشن", "دار الأركان", "ريتال", "الوطنية للإسكان", "العقارية", "جبل عمر"]
cs = text(R, y2 + 12, "مطورون يطلقون مشاريعهم على نطاق واسع", 21, INK, weight="bold")
cx = R
row_y = y2 + 34
for cname in chips:
    w = len(cname) * 13 + 40
    cs += (f'<rect x="{cx - w}" y="{row_y}" width="{w}" height="38" rx="19" fill="{PARCH}" stroke="{GOLD}" stroke-opacity="0.6" stroke-width="1"/>'
           + text(round(cx - w / 2), row_y + 25, cname, 16, INK, anchor="middle"))
    cx -= w + 10
    if cx < 760 and cname != chips[-1]:
        cx, row_y = R, row_y + 48
cs += text(R, row_y + 72, "أسماء المطورين للإشارة إلى السوق فقط، ولا تعني شراكة أو علاقة تجارية", 13, MUTED)
b += f'<g id="developers" data-pptx-bounds="540 {y2 - 14} 660 {row_y + 84 - y2 + 14}">{cs}</g>'
page("04_market.svg", "content", IVORY, b)

# ---------------------------------------------------------------- 05 meet the AI
defs = f'<radialGradient id="glow" cx="0.75" cy="0.25" r="0.5"><stop offset="0%" stop-color="{BRONZE}" stop-opacity="0.45"/><stop offset="100%" stop-color="{OBS}" stop-opacity="0"/></radialGradient>'
b = '<rect id="glow-layer" data-pptx-role="decoration" x="0" y="0" width="1280" height="720" fill="url(#glow)"/>\n'
h, y = header(96, "الذكاء الاصطناعي في المنصة", "مستشار ذكي لا ينام", True, width=900, tsize=60, ai=True,
              lead="يرد ويؤهّل ويتابع ويحجز المعاينات، ثم يسلّم العميل الجاهز لفريقكم", lsize=22)
b += f'<g id="header" data-pptx-bounds="280 66 920 {y - 66}">{h}</g>'
tiles = [("رد فوري على واتساب", "بلهجة العميل وخلال أقل من دقيقة، ليلاً ونهاراً"),
         ("تقييم ذكي للعملاء", "سبع إشارات تحدد من يستحق الاتصال أولاً"),
         ("مساعد صوتي", "يرد على المكالمات الفائتة ويحجز المعاينة"),
         ("الإجراء التالي الأفضل", "قائمة يومية لكل مستشار مرتبة حسب قيمة الفرصة"),
         ("متابعة لا تنسى", "رسائل في اليوم الأول والثالث والسابع حتى يرد العميل"),
         ("ليلة الإطلاق", "آلاف الاستفسارات في ساعة واحدة، دون أن يضيع أحد")]
tw, th, gx, gy, top = 360, 140, 30, 24, y + 36
for i, (t, desc) in enumerate(tiles):
    col, row = i % 3, i // 3
    x1 = R - col * (tw + gx)
    x0, y0 = x1 - tw, top + row * (th + gy)
    c = (f'<rect x="{x0}" y="{y0}" width="{tw}" height="{th}" rx="16" fill="#1B1813" stroke="{GOLD}" stroke-opacity="0.35" stroke-width="1"/>'
         f'<circle cx="{x1 - 34}" cy="{y0 + 38}" r="8" fill="{GOLD}"/>'
         + text(x1 - 56, y0 + 46, t, 22, IVORY, weight="bold")
         + text(x1 - 26, y0 + 86, wrap(desc, tw - 52, 17), 17, ONDARK2, lh=1.55))
    b += f'<g id="ai-{i + 1}" data-pptx-bounds="{x0} {y0} {tw} {th}">{c}</g>'
b += foot(True)
page("05_ai.svg", "content", OBS, b, defs)


# ---------------------------------------------------------------- screenshot pages
def screen_page(fname, eb, title, items, img, dark=False, ai=True, note=None, cap=None, tsize=44):
    defs = LIFT + clip("screen", 80, 150, 640, 400)
    h, y = header(96, eb, title, dark, width=420, tsize=tsize, ai=ai)
    b = f'<g id="header" data-pptx-bounds="770 66 430 {y - 66}">{h}</g>'
    p, y2 = points(y + 40, items, dark, width=430, gap=20)
    b += f'<g id="points" data-pptx-bounds="770 {y + 14} 430 {y2 - y - 30}">{p}</g>'
    if note:
        b += (f'<g id="note" data-pptx-bounds="770 {y2 - 6} 430 {700 - y2 + 6}"><rect x="{R - 430}" y="{y2}" width="430" height="1" fill="{GOLD}" fill-opacity="0.6"/>'
              + text(R, y2 + 30, wrap(note, 430, 15), 15, BRONZE if not dark else GOLD, lh=1.5) + '</g>')
    b += shot("screen", img, 80, 150, 640, 400, dark, cap)
    b += foot(dark)
    page(fname, "content", OBS if dark else IVORY, b, defs)


screen_page("06_whatsapp.svg", "واتساب", "يرد خلال دقيقة، وبلغة العميل", [
    ("يفهم الطلب", "الميزانية والحي ونوع الوحدة وموعد الانتقال، من رسالة واحدة"),
    ("يرسل الوحدات المطابقة", "من مخزونكم الفعلي، بالأسعار وخطط الدفع المعتمدة"),
    ("يحجز المعاينة", "ويُعلم المستشار المناسب بملخص كامل للمحادثة")],
    "ar_whatsapp.jpg", note="يعرّف بنفسه دائماً كمساعد ذكي، ولا يدّعي أنه إنسان")

screen_page("07_scoring.svg", "تقييم العملاء", "تقييم يستطيع فريقكم مراجعته", [
    ("سبع إشارات", "التفاعل، ملاءمة الميزانية، توقيت الشراء، سرعة الرد، الطلب على الحي، جودة المصدر، جاهزية التمويل"),
    ("أوزان تحددونها", "قيادة المبيعات تقرر ما يهم، والمستشار يعدّل التقييم مع حفظ السبب")],
    "ar_scoring.jpg", note="التقييم الذي لا يشرح نفسه لا يثق به أحد، وتقييمنا يُظهر أسبابه")

screen_page("08_voice.svg", "المساعد الصوتي", "مكالمة فائتة؟ المساعد يرد", [
    ("بالعربية والإنجليزية", "يجيب عن الأسعار المعتمدة ويطرح أسئلة التأهيل"),
    ("يحجز ويوثّق", "يسجل المعاينة في التقويم ويكتب ملخص المكالمة في ملف العميل"),
    ("يحوّل عند الحاجة", "كبار العملاء والطلبات الحساسة تذهب مباشرة إلى مستشار")],
    "ar_voice.jpg", dark=True)

screen_page("09_next_action.svg", "الإجراء التالي الأفضل", "كل صباح، قائمة واضحة لكل مستشار", [
    ("مرتبة حسب القيمة", "من يتصل به أولاً، ولماذا، وماذا يقول"),
    ("سياق جاهز", "آخر رسالة، والوحدات التي شاهدها، والاعتراض الذي ذكره"),
    ("قابلة للقياس", "يرى المدير ما أُنجز وما تأخر لكل مستشار")],
    "ar_nba.jpg")

# ---------------------------------------------------------------- 10 launch night (wide screen)
defs = LIFT + clip("launch", 80, 282, 1120, 350)
h, y = header(96, "ليلة الإطلاق", "حين يفتح البيع في التاسعة مساءً", True, width=700, tsize=54, ai=True)
b = f'<g id="header" data-pptx-bounds="500 66 700 {y - 66}">{h}</g>'
b += (f'<g id="lead" data-pptx-bounds="80 96 400 130">'
      + text(480, 120, ["آلاف الاستفسارات في الساعة الأولى", "يرد عليها الذكاء الاصطناعي فوراً", "ويرتّب أولوياتها، ويوزّع الجاهزين", "على الفريق"], 18, ONDARK2, lh=1.55) + '</g>')
b += shot("launch", "ar_launch.jpg", 80, 282, 1120, 350, True)
b += (f'<g id="caption" data-pptx-bounds="600 652 600 30">' + text(R, 672, "من العرض التوضيحي: إطلاق افتراضي لمشروع في الرياض", 14, ONDARK2) + '</g>')
b += f'<g id="footer" data-pptx-bounds="80 652 300 30"><text x="80" y="672" font-size="13" fill="{ONDARK2}" text-anchor="start" letter-spacing="2">OBSERVER AI</text></g>'
page("10_launch.svg", "content", OBS, b, defs)

screen_page("11_surge.svg", "حين يفوق الطلب طاقة الفريق", "الجميع يتلقى رداً، والأهم يصل إلى موظف", [
    ("الموظفون لأعلى التقييمات", "يتولى المستشارون العملاء فوق الحد الذي تحددونه"),
    ("الوسطاء ومواعيد الاتصال", "من لا يصله الفريق يذهب إلى الوسطاء أو يحصل على موعد اتصال مؤكد"),
    ("العربون وحدود واتساب", "العربون يحدد ترتيب الاختيار، والرسائل تبقى ضمن حدود واتساب اليومية")],
    "ar_controls.jpg", dark=True, cap="بيانات نموذجية")

screen_page("15_brokers.svg", "وكالات كثيرة ومشروع واحد", "لا خلاف على من جاء بالعميل", [
    ("أول من يسجّل يحتفظ به 30 يوماً", "تتجدد الحماية مع كل مكالمة أو معاينة أو عرض، ويُكتشف التكرار بالهاتف والبريد"),
    ("نزاعات تُحسم بالأدلة", "ترى إدارة المبيعات التسلسل الزمني كاملاً وتحسم بنقرة"),
    ("حجز واحد لكل وحدة", "حجز مؤقت يُلغى تلقائياً ما لم يصل العربون، والوكالة التالية في الطابور")],
    "ar_brokers.jpg", ai=False)

screen_page("16_noapi.svg", "مخزون دون واجهة برمجية", "لا واجهة برمجية؟ لا مشكلة", [
    ("ست طرق للربط", "مزامنة نظام العملاء، أو قائمة أسعار، أو بريد، أو بوابة المطور، أو جدول مشترك، أو يدوياً"),
    ("حداثة كل وحدة", "أقل من ست ساعات يذكر الذكاء الاصطناعي السعر، وحتى يوم يذكره مع التاريخ"),
    ("لا أسعار قديمة", "إذا تجاوز عمر البيانات يوماً يسأل إدارة المبيعات قبل أي إجابة")],
    "ar_sources.jpg")

screen_page("12_automations.svg", "الأتمتة", "مسارات عمل تعمل وحدها", [
    ("من الاستفسار إلى أول رد", "تحديد اللغة والتقييم والرد بالوحدات المطابقة، ثم المتابعة"),
    ("عناية بكبار العملاء", "إشعار الإدارة وتعيين مستشار أول خلال خمس دقائق، دون أسعار آلية"),
    ("متابعة المستندات والدفعات", "طلب الناقص، وتذكير المستشار، وتنبيه الإدارة بعد خمسة أيام")],
    "ar_auto.jpg", note="كل مسار يمكن تجربته بأمان، دون إرسال أي رسالة لعميل حقيقي")

screen_page("13_control.svg", "القرار لكم", "لا شيء مهم يحدث دون إنسان", [
    ("وافق أو عدّل أو ألغِ", "حجز الوحدات والخصومات تنتظر قراركم، مع مسودة جاهزة من الذكاء الاصطناعي"),
    ("استقلالية تحددونها", "تلقائي، أو بعد الموافقة، أو متوقف، لكل نوع من الإجراءات، وكل تغيير مسجّل"),
    ("شفافية مع العميل", "المساعد يعرّف بنفسه دائماً، والعميل يطلب مستشاراً في أي لحظة")],
    "ar_ai.jpg", dark=True, ai=True)

# ---------------------------------------------------------------- 13 platform / CRM
defs = LIFT + clip("board", 80, 96, 620, 388)
h, y = header(110, "منصة متكاملة", "رؤية كاملة، من الاستفسار إلى العمولة", False, width=440, tsize=46)
b = f'<g id="header" data-pptx-bounds="760 80 440 {y - 80}">{h}</g>'
b += shot("board", "ar_board.jpg", 80, 96, 620, 388, False)
mods = [("العملاء", "ملف واحد لكل عميل بالمحادثات والزيارات والمستندات"),
        ("الصفقات والعمولات", "من الحجز إلى التوقيع، مع عمولة كل طرف"),
        ("المشاريع والمخزون", "الوحدات المتاحة وقوائم الأسعار وخطط الدفع"),
        ("الوسطاء الشركاء", "تسجيل العملاء والعمولات لكل وسيط مع رقم رخصته")]
mw, top = 263, 530
for i, (t, desc) in enumerate(mods):
    x1 = R - i * (mw + 23)
    x0 = x1 - mw
    c = (f'<rect x="{x1 - 40}" y="{top}" width="40" height="3" fill="{GOLD}"/>'
         + text(x1, top + 38, t, 21, INK, weight="bold")
         + text(x1, top + 72, wrap(desc, mw - 10, 16), 16, MUTED, lh=1.55))
    b += f'<g id="module-{i + 1}" data-pptx-bounds="{x0} {top} {mw} 130">{c}</g>'
y_title_bottom = y
b += (f'<g id="lead" data-pptx-bounds="760 {y_title_bottom + 10} 440 120">'
      + text(R, y_title_bottom + 46, wrap("نظام إدارة علاقات العملاء مبني للعقار، يعمل فيه الذكاء الاصطناعي وفريقكم على السجل نفسه", 440, 20), 20, MUTED, lh=1.6) + '</g>')
b += foot(False)
page("14_platform.svg", "content", IVORY, b, defs)

screen_page("17_midnight.svg", "منتصف الليل في دبي", "العميل يلتزم ليلاً، والصفقة جاهزة صباحاً", [
    ("لا يذكر إلا ما هو متأكد منه", "تأكد 80% على الأقل ليلاً، وإلا يؤكد أولاً ويعرض بديلين مؤكدين"),
    ("المستندات وعربون المطور", "يقرأ الجواز وإثبات الأموال، ويذهب العربون المسترد إلى المطور مباشرة"),
    ("الأول في الطابور صباحاً", "يُدرج طلب الحجز لحظة فتح مكتب المطور")],
    "ar_overnight.jpg", dark=True)

screen_page("18_replydesk.svg", "دون واجهة برمجية من المطور", "يحدّث المطورون الوحدات كما يعملون اليوم", [
    ("رسالة واحدة تكفي", "عبر واتساب أو رابط خاص أو قائمة أسعار، بالعربية أو الإنجليزية"),
    ("كل الوكالات خلال دقيقة", "تتحدث الأسعار والتوفر للذكاء الاصطناعي والمستشارين والوسطاء"),
    ("ذكاء المطور ليلاً", "يجيب الوكالات من آخر تحديث، ويوافق موظف على كل حجز")],
    "ar_replydesk.jpg", ai=True)

screen_page("19_dealroom.svg", "غرفة الصفقة", "العميل والوسيط والمطور في محادثة واحدة", [
    ("تُفتح مع افتتاح المكتب", "ومعها مستندات العميل وعربونه وتاريخه كاملاً"),
    ("طلبات بين أنظمة الذكاء الاصطناعي", "الحجز والتحقق من التوفر بين الطرفين، مع ترتيب الطابور"),
    ("لا يكرر أحد شيئاً", "يحتفظ الوسيط بعميله، ويرى المطور مشترياً ملتزماً")],
    "ar_dealroom.jpg", ai=True)

screen_page("20_radar.svg", "رادار الطلب", "ما يريده المشترون قبل تسعير الإطلاق القادم", [
    ("طلب مجهّل الهوية", "حسب المنطقة والغرف والميزانية، من عملاء وافقوا، ودون مجموعات أقل من خمسة"),
    ("بيانات عامة لا واجهات برمجية", "بيانات دائرة الأراضي ومنصات التجميع ووحدات إعادة البيع ورسائل المطورين"),
    ("سبب للمشاركة", "مكالمات أقل، ومشترون ملتزمون صباحاً، ومؤشرات لتسعير الإطلاق")],
    "ar_radar.jpg", dark=True)

# ---------------------------------------------------------------- 14 made for KSA
b = f'<image id="najdi" data-pptx-role="background" href="../images/balcony.jpg" x="0" y="0" width="500" height="720" preserveAspectRatio="xMidYMid slice"/>\n'
h, y = header(100, "صُنع للمملكة", "مصمم لطريقة البيع في السوق السعودي", False, width=600, tsize=50)
b += f'<g id="header" data-pptx-bounds="580 70 620 {y - 70}">{h}</g>'
p, y2 = points(y + 44, [
    ("عربي أولاً", "واجهة عربية كاملة، وردود باللهجة السعودية أو الخليجية أو بالإنجليزية حسب العميل"),
    ("صلاحيات حسب الدور", "رئيس مجلس الإدارة والمدير والمستشار والوسيط، كلٌ يرى ما يخصه فقط"),
    ("خصوصية كبار العملاء", "وضع خاص يخفي أسماء العملاء على الشاشة، وسجل لكل إجراء"),
    ("حماية البيانات", "نراجع معكم متطلبات نظام حماية البيانات الشخصية قبل الإطلاق")], False, width=600, gap=20)
b += f'<g id="points" data-pptx-bounds="580 {y + 18} 620 {y2 - y - 30}">{p}</g>'
page("21_ksa.svg", "content", IVORY, b)

# ---------------------------------------------------------------- 15 how we start
h, y = header(110, "كيف نبدأ", "من أول لقاء إلى التشغيل، في أسابيع لا في أرباع سنة", False, width=1000, tsize=50)
b = f'<g id="header" data-pptx-bounds="200 80 1000 {y - 80}">{h}</g>'
steps = [("الخطوة الأولى", "عرض باستفساراتكم", "ثلاثون دقيقة، نحمّل فيها أسبوعاً من استفساراتكم ونريكم من كان يجب الاتصال به أولاً"),
         ("الخطوة الثانية", "واتساب للأعمال", "نجهّز معكم الحساب والقوالب المعتمدة من واتساب"),
         ("الخطوة الثالثة", "المصادر والمخزون", "ربط المنصات العقارية والإعلانات والموقع، وتحميل المشاريع والأسعار وخطط الدفع"),
         ("الخطوة الرابعة", "تشغيل بضوابط", "يطلب الموافقة على الحجوزات والأسعار وكبار العملاء حتى يثق به فريقكم")]
cw, top = 262, y + 50
for i, (k, t, desc) in enumerate(steps):
    x1 = R - i * (cw + 24)
    x0 = x1 - cw
    c = (f'<rect x="{x0}" y="{top}" width="{cw}" height="300" rx="18" fill="#FFFFFF" stroke="{LINE}" stroke-width="1"/>'
         f'<circle cx="{x1 - 46}" cy="{top + 52}" r="20" fill="{OBS}"/>'
         + text(x1 - 46, top + 60, str(i + 1), 20, GOLD, weight="bold", anchor="middle")
         + text(x1 - 28, top + 112, k, 15, BRONZE, weight="bold")
         + text(x1 - 28, top + 148, t, 23, INK, weight="bold")
         + text(x1 - 28, top + 188, wrap(desc, cw - 56, 17), 17, MUTED, lh=1.6))
    b += f'<g id="step-{i + 1}" data-pptx-bounds="{x0} {top} {cw} 300">{c}</g>'
b += foot(False)
page("22_start.svg", "content", IVORY, b)

# ---------------------------------------------------------------- 16 close
d, b = photo_bg("kingdom_dusk.jpg")
b += (f'<g id="title" data-pptx-bounds="440 120 760 270">' + eyebrow(150, "الخطوة التالية", True)
      + text(R, 250, ["أحضروا أسبوعاً", "من استفساراتكم"], 84, IVORY, lh=1.18, family=DISPLAY, weight="bold") + '</g>')
b += (f'<g id="lead" data-pptx-bounds="560 400 640 90">'
      + text(R, 432, ["نحمّلها في المنصة ونريكم من كنتم ستتصلون به أولاً،", "وكم كانت قيمة ذلك"], 23, ONDARK2, lh=1.6) + '</g>')
b += (f'<g id="contact" data-pptx-bounds="560 520 640 120">'
      + text(R, 548, "العرض التوضيحي", 16, GOLD, weight="bold")
      + text(R, 584, "observer-ai-sable.vercel.app/ar/demo", 22, IVORY)
      + f'<rect x="{R - 420}" y="600" width="420" height="40" rx="8" fill="none" stroke="{GOLD}" stroke-width="1" stroke-dasharray="4,4"/>'
      + text(R - 16, 627, "أضيفوا هنا: الاسم · البريد الإلكتروني · واتساب", 16, ONDARK2) + '</g>')
page("23_close.svg", "ending", OBS, b, d)
print("ok")
