const { chromium } = require('playwright');
const { Pool } = require('pg');
const db = new Pool({ host: '127.0.0.1', user: 'postgres', password: 'pw', database: 'biztest' });
(async () => {
  await db.query("TRUNCATE contacts, companies, contact_notes, contact_activities CASCADE");
  await db.query("insert into contacts (first_name,last_name,email,status) values ('Ann','Lee','ann@x.com','lead'),('Bob','Ray','bob@x.com','customer'),('Cy','Lead','cy@x.com','lead')");
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => localStorage.setItem('walkthrough_completed', 'true'));
  const page = await ctx.newPage(); let ok = true;
  const names = async () => (await page.locator('tbody tr td:nth-child(2)').allTextContents()).join('|');
  await page.goto('http://localhost:5111/app/contacts-hub?status=lead'); await page.waitForSelector('td:has-text("Ann")'); 
  let t = await page.locator('tbody').innerText(); console.log('status=lead  ->', /Ann/.test(t), /Cy/.test(t), !/Bob/.test(t)); ok = ok && /Ann/.test(t) && /Cy/.test(t) && !/Bob/.test(t);
  await page.goto('http://localhost:5111/app/contacts-hub?status=lead&q=cy'); await page.waitForSelector('td:has-text("Cy")');
  t = await page.locator('tbody').innerText(); console.log('status+q     ->', /Cy/.test(t), !/Ann/.test(t)); ok = ok && /Cy/.test(t) && !/Ann/.test(t);
  console.log(ok ? 'PASS' : 'FAIL'); await b.close(); await db.end(); process.exit(ok ? 0 : 1);
})().catch(e => { console.error(e.message.split('\n')[0]); process.exit(2); });
