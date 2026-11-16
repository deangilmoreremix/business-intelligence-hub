const { chromium } = require('playwright');
const fs = require('fs');
const BASE = 'http://localhost:5111';
const ids = fs.readFileSync('/home/user/business-intelligence-hub/src/data/aiApps.ts', 'utf8').match(/id: '([a-z-]+)'/g).map(s => s.slice(5, -1));
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 960 } });
  await ctx.addInitScript(() => { localStorage.setItem('walkthrough_completed', 'true'); });
  await ctx.route('**/.netlify/functions/openai-proxy', r => r.request().method() === 'GET' ? r.fulfill({ json: { configured: true } }) : r.fulfill({ json: { output: [{ type: 'message', content: [{ type: 'output_text', text: '{}' }] }] } }));
  const page = await ctx.newPage(); const dead = {}; let errs = 0;
  page.on('pageerror', () => errs++); page.on('dialog', d => d.dismiss());
  const all = ['', ...ids.map(i => 'app/' + i)]; const SH = +(process.env.SHARD || 0), N = +(process.env.N || 1); const targets = all.filter((_, i) => i % N === SH);
  for (const t of targets) {
    if (ONLY && !ONLY.includes(t)) continue;
    await page.goto(`${BASE}/${t}`); await page.waitForSelector('h1', { timeout: 15000 }).catch(() => {}); await page.waitForTimeout(900);
    const n = await page.locator('main button:visible, #root button:visible').count();
    const labels = await page.locator('#root button:visible').evaluateAll(els => els.map((e, i) => ({ i, t: (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 40), dis: e.disabled })));
    for (const l of labels.slice(0, 15)) {
      if (l.dis) continue;
      await page.goto(`${BASE}/${t}`); await page.waitForSelector('h1', { timeout: 15000 }).catch(() => {}); await page.waitForTimeout(400);
      const btn = page.locator('#root button:visible').nth(l.i);
      if (!(await btn.count())) continue;
      const before = await page.evaluate(() => document.documentElement.outerHTML.length + '|' + document.documentElement.getAttribute('data-theme') + '|' + document.body.innerText.slice(0, 4000));
      const url0 = page.url(); let net = 0; const h = () => net++; page.on('request', h); page.on('download', h);
      await btn.click({ timeout: 2500, force: true }).catch(() => {}); await page.waitForTimeout(450); page.off('request', h); page.off('download', h);
      const after = await page.evaluate(() => document.documentElement.outerHTML.length + '|' + document.documentElement.getAttribute('data-theme') + '|' + document.body.innerText.slice(0, 4000));
      if (before === after && page.url() === url0 && net === 0) (dead[t || 'home'] ||= []).push(l.t || `(no label #${l.i})`);
    }
    console.log((t || 'home').padEnd(30), 'buttons', labels.length, 'dead', (dead[t || 'home'] || []).length);
  }
  fs.writeFileSync(`clicks-report-${process.env.SHARD || 0}.json`, JSON.stringify(dead, null, 1)); console.log('page errors', errs);
  await b.close();
})();
