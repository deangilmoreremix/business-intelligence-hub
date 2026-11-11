const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 960 }, colorScheme: 'light' });
  const p = await ctx.newPage(); const res = [];
  const check = (n, ok, x = '') => { res.push(ok); console.log(ok ? 'PASS' : 'FAIL', n, x); };
  await p.goto('http://localhost:5111/'); await p.waitForTimeout(2000);
  const sk = p.locator('button:has-text("Skip Tour")'); if (await sk.count()) await sk.first().click();
  check('starts light by default', await p.evaluate(() => document.documentElement.getAttribute('data-theme')) === 'light');
  await p.locator('button[aria-label^="Current theme"]').first().click();
  await p.locator('[role=menu][aria-label="Theme options"] [role=menuitem]').filter({ hasText: /dark/i }).first().click(); await p.waitForTimeout(700);
  check('toggle switches to dark', await p.evaluate(() => document.documentElement.getAttribute('data-theme')) === 'dark');
  await p.reload(); await p.waitForTimeout(1800); { const k = p.locator('button:has-text("Skip Tour")'); if (await k.count()) await k.first().click(); await p.waitForTimeout(500); }
  check('dark persists after reload', await p.evaluate(() => document.documentElement.getAttribute('data-theme')) === 'dark');
  await p.locator('button[aria-label^="Current theme"]').first().click({ force: true });
  await p.locator('[role=menu][aria-label="Theme options"] [role=menuitem]').filter({ hasText: /light/i }).first().click(); await p.waitForTimeout(700);
  await p.reload(); await p.waitForTimeout(1200);
  check('light persists after reload', await p.evaluate(() => document.documentElement.getAttribute('data-theme')) === 'light');
  await b.close(); process.exit(res.every(Boolean) ? 0 : 1);
})();
