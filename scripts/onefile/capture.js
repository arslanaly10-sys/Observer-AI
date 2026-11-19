// Capture key demo screens (EN + AR) into one JSON bundle for a single-file HTML build.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.argv[2];
const BASE = 'http://localhost:3100';
const screens = [
  ['board', 'chairman'], ['dashboard', 'director'], ['overnight', 'director'], ['deal-room', 'director'], ['reply-desk', 'director'],
  ['demand-radar', 'director'], ['inventory-sources', 'director'], ['brokers', 'director'], ['holds', 'director'], ['partner', 'broker'],
  ['launch', 'chairman'], ['launch-controls', 'director'], ['projects', 'director'], ['clients', 'director'], ['deals', 'director'],
  ['whatsapp', 'director'], ['next-best-action', 'agent'], ['ai-activity', 'director'], ['automations', 'director'], ['voice', 'chairman'],
  ['scoring', 'director'], ['gcc-intel', 'director'], ['payment-plans', 'director'],
];
(async () => {
  const b = await chromium.launch();
  const bundle = { css: new Set(), langs: {}, images: {} };
  let imgN = 0; const imgKey = new Map();
  for (const loc of ['en', 'ar']) {
    bundle.langs[loc] = { screens: {}, titles: {} };
    for (const [id, role] of screens) {
      const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
      await c.addCookies([{ name: 'obs-role', value: role, url: BASE }]);
      const p = await c.newPage();
      await p.goto(`${BASE}/${loc}/app/${id}`, { waitUntil: 'networkidle' });
      await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); } scrollTo(0, 0); });
      await p.waitForTimeout(900);
      const r = await p.evaluate(() => {
        const main = document.querySelector('#main');
        const col = main.parentElement;
        const imgs = [];
        const fix = (root) => {
          root.querySelectorAll('img').forEach((im) => {
            const src = im.currentSrc || im.src;
            if (src) { imgs.push(src); im.setAttribute('data-src-abs', src); }
            im.removeAttribute('src'); im.removeAttribute('srcset'); im.removeAttribute('sizes'); im.removeAttribute('loading');
          });
          root.querySelectorAll('script, [data-copilot]').forEach((e) => e.remove());
          // freeze scroll-reveal animations in their visible state
          root.querySelectorAll('*').forEach((e) => { if (e.style && e.style.opacity === '0') e.style.opacity = '1'; });
        };
        const mainClone = main.cloneNode(true); fix(mainClone);
        let header = null;
        if (!window.__h) { const colClone = col.cloneNode(true); colClone.querySelector('#main').innerHTML = ''; fix(colClone); header = colClone.outerHTML; }
        const h1 = main.querySelector('h1')?.innerText || document.title;
        const css = [];
        for (const s of document.styleSheets) { try { for (const rule of s.cssRules) css.push(rule.cssText); } catch {} }
        const wraps = []; let el = col.parentElement; while (el && el !== document.body) { wraps.unshift({ tag: el.tagName.toLowerCase(), cls: el.className || '', style: el.getAttribute('style') || '', dir: el.getAttribute('dir') || '', lang: el.getAttribute('lang') || '' }); el = el.parentElement; }
        return { wraps, main: mainClone.innerHTML, header, imgs, css: css.join('\n'), html: { cls: document.documentElement.className, dir: document.documentElement.dir, lang: document.documentElement.lang, style: document.documentElement.getAttribute('style') || '' }, body: document.body.className, h1 };
      });
      bundle.css.add(r.css);
      bundle.langs[loc].screens[id] = r.main;
      bundle.langs[loc].titles[id] = r.h1;
      if (!bundle.langs[loc].column && id === 'dashboard') bundle.langs[loc].column = r.header;
      bundle.langs[loc].html = r.html; bundle.langs[loc].wraps = r.wraps; bundle.langs[loc].body = r.body;
      for (const src of r.imgs) if (!imgKey.has(src)) imgKey.set(src, `i${imgN++}`);
      console.log(loc, id, Math.round(r.main.length / 1024) + 'KB', r.imgs.length, 'imgs');
      await c.close();
    }
  }
  // fetch every image once
  const ctx = await b.newContext();
  fs.mkdirSync(OUT + '/img', { recursive: true });
  for (const [src, key] of imgKey) {
    try { const res = await ctx.request.get(src); fs.writeFileSync(`${OUT}/img/${key}`, await res.body()); bundle.images[key] = src; } catch (e) { console.log('img fail', src); }
  }
  bundle.css = [...bundle.css];
  fs.writeFileSync(OUT + '/bundle.json', JSON.stringify(bundle));
  console.log('images', imgKey.size);
  await b.close();
})();
