const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
  await ctx.addInitScript(() => localStorage.setItem('walkthrough_completed', 'true'));
  await ctx.route('**/.netlify/functions/openai-proxy', r => r.fulfill({ json: { configured: true } }));
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://localhost:5111/app/dashboard-builder'); await page.waitForSelector('[data-testid=widget]', { timeout: 120000 });
  const n0 = await page.locator('[data-testid=widget]').count();
  for (const label of ['KPI cards', 'AI analytics']) { await page.click('button:has-text("Add widget")'); await page.click(`[role=menuitem]:has-text("${label}")`); await page.waitForTimeout(1200); }
  const n1 = await page.locator('[data-testid=widget]').count();
  const kpi = await page.locator('[data-testid=widget]:has-text("KPI cards")').innerText();
  console.log('widgets', n0, '->', n1, '| kpi text has figures:', /\$|%|Deals|Pipeline|Win/i.test(kpi), '| errors', errs.length, errs.slice(0, 2));
  await page.screenshot({ path: '/tmp/new-widgets.png', fullPage: true });
  await b.close(); process.exit(n1 === n0 + 2 && !errs.length ? 0 : 1);
})().catch(e => { console.error(e.message.split('\n')[0]); process.exit(2); });
