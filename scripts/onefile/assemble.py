"""Assemble bundle.json into one self-contained HTML file (fonts and images inlined)."""
import base64, io, json, re, sys, urllib.request
from PIL import Image

O = sys.argv[1]; OUT = sys.argv[2]
b = json.load(open(f"{O}/bundle.json"))
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))

def fetch(path):
    return opener.open("http://localhost:3100" + path, timeout=30).read()

css = "\n".join(b["css"])
# inline fonts and any other /_next assets referenced from CSS
cache = {}
def inline(m):
    url = m.group(1).strip("'\"")
    if not url.startswith("/_next/"): return m.group(0)
    if url not in cache:
        data = fetch(url)
        mime = "font/woff2" if url.endswith(".woff2") else "font/woff" if url.endswith(".woff") else "image/png" if url.endswith(".png") else "application/octet-stream"
        cache[url] = f"data:{mime};base64,{base64.b64encode(data).decode()}"
    return f"url({cache[url]})"
css = re.sub(r"url\(([^)]+)\)", inline, css)

images = {}
for key, src in b["images"].items():
    try:
        im = Image.open(f"{O}/img/{key}").convert("RGB")
        im.thumbnail((1600, 1600))
        buf = io.BytesIO(); im.save(buf, "JPEG", quality=72, optimize=True)
        images[src] = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
    except Exception as e:
        print("skip image", key, e)

GROUPS = [
    ("Overview", "نظرة عامة", ["board", "dashboard"]),
    ("Marketplace", "السوق", ["overnight", "deal-room", "reply-desk", "demand-radar"]),
    ("Brokers and inventory", "الوسطاء والمخزون", ["inventory-sources", "brokers", "holds", "partner", "projects"]),
    ("Launch", "الإطلاق", ["launch", "launch-controls"]),
    ("Clients and sales", "العملاء والمبيعات", ["clients", "deals", "whatsapp", "next-best-action"]),
    ("AI", "الذكاء الاصطناعي", ["ai-activity", "automations", "voice", "scoring"]),
    ("Market data", "بيانات السوق", ["gcc-intel", "payment-plans"]),
]
SEAT = {"board": "Executive", "partner": "Broker partner", "next-best-action": "Consultant", "launch": "Executive", "voice": "Executive"}
SEAT_AR = {"Executive": "الإدارة التنفيذية", "Broker partner": "شريك وسيط", "Consultant": "مستشار", "Sales director": "مديرة المبيعات"}

import pathlib
navsrc = pathlib.Path("components/app/nav.ts").read_text()
labels = dict(re.findall(r'"?([a-z-]+)"?: \{ id: "[a-z-]+", label: "([^"]+)"', navsrc))
dicts = "".join(pathlib.Path(f"dictionaries/{f}.ts").read_text() for f in ["demo-ar", "desk-ar", "workspace-ar", "growth-ar", "app-ar"])
pairs = {}
for k, v in re.findall(r'"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"', dicts): pairs.setdefault(k, v)
for lg in b["langs"]:
    for sid in b["langs"][lg]["titles"]:
        en = labels.get(sid, sid)
        b["langs"][lg]["titles"][sid] = pairs.get(en, en) if lg == "ar" else en
data = {"langs": b["langs"], "images": images, "groups": GROUPS, "seat": SEAT, "seatAr": SEAT_AR}

html = """<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Observer AI · Demo app</title>
<style>__CSS__</style>
<style>
  html, body { margin: 0; }
  body { background: #f6f1e9; }
  #obs-side { position: fixed; inset-block: 0; inset-inline-start: 0; width: 260px; background: #0d0c0a; color: #efe9df; overflow-y: auto; z-index: 40; font-size: 14px; padding: 18px 14px 80px; box-sizing: border-box; }
  #obs-side .brand { display: flex; align-items: center; gap: 10px; padding: 4px 6px 18px; }
  #obs-side .mono { width: 34px; height: 34px; border: 1px solid #5a5040; display: grid; place-items: center; font-family: Georgia, serif; font-size: 17px; }
  #obs-side .bn { font-size: 13px; line-height: 1.2; } #obs-side .bn small { display: block; color: #cdb284; font-size: 10px; letter-spacing: .18em; text-transform: uppercase; }
  #obs-side h6 { margin: 16px 6px 6px; color: #cdb284; font-size: 10.5px; letter-spacing: .2em; text-transform: uppercase; font-weight: 500; }
  #obs-side a { display: block; padding: 7px 10px; color: #efe9df; text-decoration: none; border-radius: 8px; opacity: .85; }
  #obs-side a:hover { background: #1b1813; opacity: 1; }
  #obs-side a[aria-current="page"] { background: #22201b; opacity: 1; box-shadow: inset 3px 0 0 #cdb284; }
  [dir=rtl] #obs-side a[aria-current="page"] { box-shadow: inset -3px 0 0 #cdb284; }
  #obs-side .seat { display: block; font-size: 11px; color: #9c9282; }
  #obs-side .lang { margin: 18px 6px 0; display: flex; gap: 6px; }
  #obs-side .lang button { flex: 1; height: 34px; border: 1px solid #3a342b; background: transparent; color: #efe9df; border-radius: 999px; cursor: pointer; font: inherit; }
  #obs-side .lang button[aria-pressed=true] { background: #cdb284; color: #15120e; border-color: #cdb284; }
  #obs-side .note { margin: 18px 6px 0; font-size: 11.5px; line-height: 1.5; color: #9c9282; }
  #obs-col { margin: 0; }
  #obs-menu { display: none; }
  @media (max-width: 1023px) {
    #obs-side { transform: translateX(-100%); transition: transform .2s; } [dir=rtl] #obs-side { transform: translateX(100%); }
    body.menu-open #obs-side { transform: none; }
    #obs-menu { display: block; position: fixed; bottom: 16px; inset-inline-end: 16px; z-index: 50; height: 44px; padding: 0 18px; border-radius: 999px; border: 0; background: #0d0c0a; color: #efe9df; font: inherit; }
  }
</style>
</head>
<body>
<nav id="obs-side" aria-label="Screens"></nav>
<div id="obs-col"></div>
<button id="obs-menu" type="button">Screens</button>
<script>
const D = __DATA__;
let lang = "en", view = "board";
const side = document.getElementById("obs-side"), col = document.getElementById("obs-col");
function title(l, id) { return (D.langs[l].titles[id] || id).trim(); }
function renderSide() {
  const ar = lang === "ar";
  let h = '<div class="brand"><span class="mono">E</span><span class="bn">' + (ar ? "إعمار العقارية" : "Emaar Properties") + '<small>' + (ar ? "منصة المبيعات" : "Sales platform") + '</small></span></div>';
  for (const [en, a, ids] of D.groups) {
    h += "<h6>" + (ar ? a : en) + "</h6>";
    for (const id of ids) {
      const seat = D.seat[id] || "Sales director";
      h += '<a href="#' + lang + "/" + id + '" data-view="' + id + '"' + (id === view ? ' aria-current="page"' : "") + ">" + title(lang, id) + '<span class="seat">' + (ar ? D.seatAr[seat] : seat) + "</span></a>";
    }
  }
  h += '<div class="lang"><button data-lang="en" aria-pressed="' + (!ar) + '">English</button><button data-lang="ar" aria-pressed="' + ar + '">العربية</button></div>';
  h += '<p class="note">' + (ar ? "نسخة في ملف واحد من العرض التوضيحي: لقطات حقيقية لكل شاشة. التنقل بين الشاشات واللغة يعمل دون إنترنت، أما الأزرار داخل الشاشات فهي للعرض فقط. بيانات نموذجية." : "Single-file copy of the demo: faithful snapshots of each screen. Moving between screens and languages works offline; buttons inside screens are for display. Sample data.") + "</p>";
  side.innerHTML = h;
}
function renderMain() {
  const L = D.langs[lang];
  document.documentElement.lang = lang; document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  if (L.html.cls) document.documentElement.className = L.html.cls;
  document.body.className = (L.body || "") + (document.body.classList.contains("menu-open") ? " menu-open" : "");
  let shell = col; shell.innerHTML = "";
  for (const w of (L.wraps || [])) { const el = document.createElement(w.tag === "body" ? "div" : w.tag); if (w.cls) el.className = w.cls; if (w.style) el.setAttribute("style", w.style); if (w.dir) el.dir = w.dir; shell.appendChild(el); shell = el; }
  shell.insertAdjacentHTML("beforeend", L.column);
  col.querySelector("#main").innerHTML = L.screens[view] || "";
  col.querySelectorAll("img[data-src-abs]").forEach((im) => { const s = D.images[im.getAttribute("data-src-abs")]; if (s) im.src = s; });
  document.title = title(lang, view) + " · Observer AI";
  scrollTo(0, 0);
}
function go(l, v, push) { lang = l; view = v; renderSide(); renderMain(); if (push !== false) history.replaceState(null, "", "#" + l + "/" + v); document.body.classList.remove("menu-open"); }
side.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-view]"); if (a) { e.preventDefault(); go(lang, a.dataset.view); return; }
  const btn = e.target.closest("button[data-lang]"); if (btn) go(btn.dataset.lang, view);
});
col.addEventListener("click", (e) => {
  const a = e.target.closest("a"); if (!a) { if (e.target.closest("button, input, select, textarea, label")) e.preventDefault(); return; }
  const href = a.getAttribute("href") || "";
  const m = href.match(/\\/(en|ar)\\/app\\/([a-z-]+)/);
  e.preventDefault();
  if (m && D.langs[lang].screens[m[2]]) go(lang, m[2]);
  else if (/\\/(en|ar)\\/app/.test(href) && href.startsWith("/" + (lang === "en" ? "ar" : "en"))) go(lang === "en" ? "ar" : "en", view);
  else if (/^https?:/.test(href)) window.open(href, "_blank", "noopener");
});
col.addEventListener("submit", (e) => e.preventDefault());
document.getElementById("obs-menu").addEventListener("click", () => document.body.classList.toggle("menu-open"));
const h = location.hash.slice(1).split("/");
go(h[0] === "ar" ? "ar" : "en", D.langs.en.screens[h[1]] ? h[1] : "board", false);
</script>
</body>
</html>
"""
html = html.replace("__CSS__", css.replace("</style", "<\\/style")).replace("__DATA__", json.dumps(data, ensure_ascii=False).replace("</", "<\\/"))
open(OUT, "w", encoding="utf-8").write(html)
print("written", round(len(html.encode()) / 1e6, 2), "MB")
