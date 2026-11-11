const { chromium } = require('playwright');
const fs = require('fs');

const BASE = 'http://localhost:5111';
const OUT = process.env.OUT || require('os').tmpdir() + '/theme-audit';
fs.mkdirSync(OUT, { recursive: true });
const ids = fs.readFileSync(require('path').join(__dirname, '../src/data/aiApps.ts'), 'utf8').match(/id: '([a-z-]+)'/g).map(s => s.slice(5, -1));
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const MODES = process.env.MODES ? process.env.MODES.split(',') : ['light', 'dark'];

// Runs in the page: finds large surfaces with the wrong luminance for the mode and low-contrast text.
const auditFn = mode => {
  const vw = innerWidth, vh = innerHeight;
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] }; };
  const lum = ({ r, g, b }) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const over = (top, bottom) => { const a = top.a + bottom.a * (1 - top.a); if (!a) return { r: 0, g: 0, b: 0, a: 0 }; return { r: (top.r * top.a + bottom.r * bottom.a * (1 - top.a)) / a, g: (top.g * top.a + bottom.g * bottom.a * (1 - top.a)) / a, b: (top.b * top.a + bottom.b * bottom.a * (1 - top.a)) / a, a }; };
  const root = { r: 255, g: 255, b: 255, a: 1 };
  const bodyBg = parse(getComputedStyle(document.body).backgroundColor);
  const htmlBg = parse(getComputedStyle(document.documentElement).backgroundColor);
  const base = (bodyBg && bodyBg.a > 0.99 ? bodyBg : (htmlBg && htmlBg.a > 0.99 ? htmlBg : root));
  const bgOf = el => {
    // effective opaque background by compositing ancestors; returns null if a gradient/image is involved
    const chain = []; for (let e = el; e && e.nodeType === 1; e = e.parentElement) chain.push(e);
    let acc = null; let unknown = false;
    for (const e of chain) {
      const cs = getComputedStyle(e);
      if (cs.backgroundImage && cs.backgroundImage !== 'none' && !cs.backgroundImage.startsWith('url(')) { unknown = true; }
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) { acc = acc ? over(acc, c) : c; if (acc.a > 0.99) break; }
    }
    if (!acc) acc = base; else if (acc.a < 0.99) acc = over(acc, base);
    return unknown ? null : acc;
  };
  const visible = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05 && r.bottom > 0 && r.top < vh * 3; };
  const desc = el => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${[...el.classList].slice(0, 4).join('.')}`;
  const wrongSurface = []; const lowContrast = [];
  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el)) continue;
    const cs = getComputedStyle(el); const own = parse(cs.backgroundColor);
    const r = el.getBoundingClientRect(); const area = (Math.min(r.right, vw) - Math.max(r.left, 0)) * (Math.min(r.bottom, vh * 3) - Math.max(r.top, 0));
    if (own && own.a > 0.6 && area > vw * vh * 0.015 && !el.closest('[aria-hidden=true]')) {
      const eff = bgOf(el); if (eff) {
        const L = lum(eff);
        if (mode === 'dark' && L > 0.6) wrongSurface.push(`${desc(el)} bg=rgb(${eff.r | 0},${eff.g | 0},${eff.b | 0}) ${Math.round(area / 100)}`);
        if (mode === 'light' && L < 0.1) wrongSurface.push(`${desc(el)} bg=rgb(${eff.r | 0},${eff.g | 0},${eff.b | 0}) ${Math.round(area / 100)}`);
      }
    }
    // text contrast on elements that directly own text
    const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (hasText && cs.color) {
      const fg = parse(cs.color); const bg = bgOf(el);
      if (fg && bg && fg.a > 0.3) {
        const f = over({ ...fg, a: Math.min(fg.a, 1) }, bg); const l1 = lum(f), l2 = lum(bg);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        const size = parseFloat(cs.fontSize);
        if (ratio < (size >= 18 ? 2.5 : 3)) lowContrast.push(`${desc(el)} "${el.textContent.trim().slice(0, 24)}" ratio=${ratio.toFixed(1)} fg=${cs.color} bg=rgb(${bg.r | 0},${bg.g | 0},${bg.b | 0})`);
      }
    }
  }
  const modeOk = document.documentElement.getAttribute('data-theme') === mode;
  return { modeOk, wrongSurface: [...new Set(wrongSurface)].slice(0, 12), lowContrast: [...new Set(lowContrast)].slice(0, 12), wrongCount: wrongSurface.length, contrastCount: lowContrast.length };
};

(async () => {
  const browser = await chromium.launch();
  const report = {};
  for (const mode of MODES) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1, colorScheme: mode === 'dark' ? 'light' : 'dark' }); // OS scheme deliberately opposite to prove the app toggle wins
    await ctx.addInitScript(m => { try { localStorage.setItem('theme-preference', m); localStorage.setItem('walkthrough_completed', 'true'); } catch { /* ignore */ } }, mode);
    await ctx.route('**/.netlify/functions/openai-proxy', r => r.request().method() === 'GET' ? r.fulfill({ json: { configured: true } }) : r.fulfill({ json: { output: [{ type: 'message', content: [{ type: 'output_text', text: 'ok' }] }] } }));
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    const skipTour = async () => { const b = page.locator('button:has-text("Skip Tour")'); if (await b.count()) await b.first().click().catch(() => undefined); };
    const states = [
      { name: 'home-tour', path: '/', fresh: true, act: async () => { await page.waitForTimeout(1500); } },
      { name: 'chat-open', path: '/', act: async () => { await page.locator('button[title="Open AI Assistant"]').click({ force: true }); await page.waitForTimeout(800); } },
      { name: 'help-center', path: '/', act: async () => { const b = page.locator('button:has-text("Help")').first(); if (await b.count()) await b.click().catch(() => undefined); await page.waitForTimeout(800); } },
      { name: 'ai-results-panel', path: '/app/pipeline-intelligence', act: async () => { await page.click('button:has-text("AI Analysis")'); await page.waitForTimeout(2500); } },
      { name: 'ai-provider-menu', path: '/app/pipeline-intelligence', act: async () => { const c = page.locator('button:has(svg.lucide-chevron-down)').first(); if (await c.count()) await c.click(); await page.waitForTimeout(600); } },
      { name: 'contacts-table', path: '/app/contacts-hub', act: async () => { await page.waitForSelector('td'); } },
      { name: 'contacts-drawer', path: '/app/contacts-hub', act: async () => { await page.click('tbody tr:first-child td:nth-child(2)'); await page.waitForSelector('aside h2'); await page.waitForTimeout(800); } },
      { name: 'contacts-drawer-enrich', path: '/app/contacts-hub', act: async () => { await page.click('tbody tr:first-child td:nth-child(2)'); await page.waitForSelector('aside h2'); await page.click('button:has-text("AI score")'); await page.waitForTimeout(1500); } },
      { name: 'contacts-bulk', path: '/app/contacts-hub', act: async () => { await page.waitForSelector('td'); await page.click('input[aria-label="Select all"]'); await page.waitForTimeout(500); } },
      { name: 'contacts-companies', path: '/app/contacts-hub', act: async () => { await page.click('[role=tab]:has-text("Companies")'); await page.waitForTimeout(800); } },
      { name: 'team-members', path: '/app/team-members', act: async () => { await page.waitForSelector('[data-testid=team-member]'); } },
      { name: 'builder-view', path: '/app/dashboard-builder', act: async () => { await page.waitForSelector('[data-testid=widget]'); await page.waitForTimeout(3500); } },
      { name: 'builder-edit', path: '/app/dashboard-builder', act: async () => { await page.waitForSelector('[data-testid=widget]'); await page.click('button:has-text("Edit layout")'); await page.waitForTimeout(3500); } },
      { name: 'builder-gallery', path: '/app/dashboard-builder', act: async () => { await page.waitForSelector('[data-testid=widget]'); await page.click('button:has-text("Add widget")'); await page.waitForTimeout(800); } },
      { name: 'builder-settings', path: '/app/dashboard-builder', act: async () => { await page.waitForSelector('[data-testid=widget]'); await page.click('button:has-text("Add widget")'); await page.click('[role=menuitem]:has-text("Bar chart")'); await page.waitForSelector('aside[aria-label="Widget settings"]'); await page.click('button:has-text("Add filter")'); await page.waitForTimeout(1500); } },
      { name: 'builder-context', path: '/app/dashboard-builder', act: async () => { await page.waitForSelector('[data-testid=widget]'); await page.click('button:has-text("Record context")'); await page.waitForTimeout(800); } },
      { name: 'builder-embeds', path: '/app/dashboard-builder', act: async () => { await page.waitForSelector('[data-testid=widget]'); await page.click('button:has-text("Approved embeds")'); await page.waitForTimeout(600); } },
      { name: 'records-drilldown', path: '/objects/contacts?filter[status][is]=["lead"]', act: async () => { await page.waitForSelector('[data-testid=record-row]'); } },
    ];
    for (const t of states) {
      if (ONLY && !ONLY.includes(t.name)) continue;
      await page.goto(BASE + t.path);
      if (t.fresh) { await page.evaluate(() => { try { localStorage.removeItem('walkthrough_user_id'); } catch { /* ignore */ } }); await page.reload(); await page.waitForTimeout(2500); }
      await page.waitForSelector('h1', { timeout: 20000 }).catch(() => undefined);
      if (!t.fresh) await skipTour();
      await page.waitForTimeout(1200);
      try { await t.act(); } catch (e) { console.log(`${mode} ${t.name} action failed: ${e.message.split('\n')[0]}`); }
      const r = await page.evaluate(auditFn, mode);
      report[`${mode}:${t.name}`] = r;
      await page.screenshot({ path: `${OUT}/${mode}-${t.name}.png` });
      console.log(`${mode.padEnd(5)} ${t.name.padEnd(26)} modeOk=${r.modeOk} wrongSurfaces=${r.wrongCount} lowContrast=${r.contrastCount}`);
    }
    if (errs.length) console.log(mode, 'page errors:', errs.slice(0, 3));
    await ctx.close();
  }
  fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1));
  await browser.close();
})().catch(e => { console.error('audit crashed:', e.message.split('\n')[0]); process.exit(2); });
