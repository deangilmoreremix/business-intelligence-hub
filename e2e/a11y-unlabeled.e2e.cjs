const { chromium } = require('playwright');
const fs = require('fs');
const ids = fs.readFileSync('/home/user/business-intelligence-hub/src/data/aiApps.ts', 'utf8').match(/id: '([a-z-]+)'/g).map(s => s.slice(5, -1));
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => localStorage.setItem('walkthrough_completed', 'true'));
  await ctx.route('**/.netlify/functions/openai-proxy', r => r.fulfill({ json: { configured: true } }));
  const page = await ctx.newPage();
  for (const p of ['', ...ids.map(i => 'app/' + i), 'app/contacts-hub', 'app/dashboard-builder']) {
    await page.goto('http://localhost:5111/' + p); await page.waitForSelector('h1', { timeout: 15000 }).catch(() => {}); await page.waitForTimeout(500);
    const bad = await page.evaluate(() => [...document.querySelectorAll('button, [role=button], a, input:not([type=hidden]), select')].filter(e => {
      const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
      const name = (e.getAttribute('aria-label') || e.getAttribute('aria-labelledby') || e.getAttribute('title') || e.textContent || e.getAttribute('placeholder') || e.labels?.[0]?.textContent || '').trim();
      return !name;
    }).map(e => e.outerHTML.slice(0, 400)));
    if (bad.length) console.log('/' + p, bad.length, '\n  ' + [...new Set(bad)].slice(0, 3).join('\n  '));
  }
  await b.close();
})();
