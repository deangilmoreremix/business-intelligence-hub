const { chromium } = require('playwright');
const fs = require('fs');
const ids = fs.readFileSync('/home/user/business-intelligence-hub/src/data/aiApps.ts', 'utf8').match(/id: '([a-z-]+)'/g).map(s => s.slice(5, -1));
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 960 } });
  await ctx.addInitScript(() => { localStorage.setItem('walkthrough_completed', 'true'); });
  await ctx.route('**/.netlify/functions/openai-proxy', r => r.fulfill({ json: { configured: false } }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(page.url() + ' ' + e.message));
  page.on('dialog', d => d.accept());
  await page.goto('http://localhost:5111/'); await page.waitForSelector('[data-testid=mock-data-toggle]');
  console.log('label on:', await page.textContent('[data-testid=mock-data-toggle]'));
  await Promise.all([page.waitForNavigation(), page.click('[data-testid=mock-data-toggle]')]);
  await page.waitForSelector('[data-testid=mock-data-toggle]');
  console.log('label off:', await page.textContent('[data-testid=mock-data-toggle]'));
  let leaks = 0;
  for (const id of ids) {
    await page.goto('http://localhost:5111/app/' + id); await page.waitForSelector('h1', { timeout: 15000 }).catch(() => console.log('NO H1', id)); await page.waitForTimeout(700);
    const t = await page.evaluate(() => document.body.innerText);
    if (/67\.3%|\$1\.2M|\$890K/.test(t)) { leaks++; console.log('leak', id); }
  }
  console.log('pages', ids.length, 'leaks', leaks, 'errors', errs.length); errs.slice(0, 8).forEach(e => console.log(e));
  await page.goto('http://localhost:5111/'); await page.waitForSelector('[data-testid=mock-data-toggle]');
  await Promise.all([page.waitForNavigation(), page.click('[data-testid=mock-data-toggle]')]);
  await page.goto('http://localhost:5111/app/win-rate-intelligence'); await page.waitForTimeout(1500);
  console.log('restored shows 67.3%:', /67\.3%/.test(await page.evaluate(() => document.body.innerText)));
  await b.close();
})().catch(e => { console.error(e.message.split('\n')[0]); process.exit(2); });
