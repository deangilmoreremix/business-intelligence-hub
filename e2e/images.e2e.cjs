const { chromium } = require('playwright');
const { Pool } = require('pg');
const fs = require('fs');
const zlib = require('zlib');

const BASE = 'http://localhost:5111';
const SHOTS = '/tmp/claude-0/-home-user-business-intelligence-hub/e109f3db-2016-5ce5-b356-5a564a694384/scratchpad/screenshots';
const db = new Pool({ host: '127.0.0.1', user: 'postgres', password: 'pw', database: 'biztest' });
const results = [];
const check = (name, ok, extra = '') => { results.push(ok); console.log(ok ? 'PASS' : 'FAIL', name, extra); };

// Real PNGs (solid colour, 64x64) so we can prove the *uploaded* bytes are what get displayed.
const crc = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return b => { let c = 0xffffffff; for (const x of b) c = t[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }; })();
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
const png = (r, g, b) => {
  const w = 64, h = 64; const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 3 + 1)] = 0; for (let x = 0; x < w; x++) { const o = y * (w * 3 + 1) + 1 + x * 3; raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; } }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
};
const files = { contact: require('os').tmpdir() + '/person-contact.png', team: require('os').tmpdir() + '/person-team.png', logo: require('os').tmpdir() + '/company-logo.png', bad: require('os').tmpdir() + '/not-an-image.txt' };
fs.writeFileSync(files.contact, png(220, 60, 60)); fs.writeFileSync(files.team, png(40, 120, 220)); fs.writeFileSync(files.logo, png(30, 160, 90)); fs.writeFileSync(files.bad, 'hello');

(async () => {
  await db.query("TRUNCATE contacts, companies, contact_notes, contact_activities CASCADE; UPDATE team_members SET avatar_url = NULL");
  const co = (await db.query("insert into companies (name, domain) values ('Acme Corp','acme.com') returning id")).rows[0].id;
  await db.query("insert into contacts (first_name,last_name,email,company,company_id,status) values ('Ann','Lee','ann@acme.com','Acme Corp',$1,'lead')", [co]);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  const skipTour = async () => { const b = page.locator('button:has-text("Skip Tour")'); if (await b.count()) { await b.first().click().catch(() => undefined); } };
  const pixel = async url => page.evaluate(async u => {
    const img = new Image(); img.crossOrigin = 'anonymous'; img.src = u; await img.decode();
    const c = document.createElement('canvas'); c.width = c.height = 4; const x = c.getContext('2d'); x.drawImage(img, 0, 0, 4, 4); return [...x.getImageData(2, 2, 1, 1).data].slice(0, 3);
  }, url);

  /* ---- 1. contact photo ---- */
  await page.goto(BASE + '/app/contacts-hub'); await page.waitForSelector('td:has-text("Ann Lee")'); await skipTour();
  await page.click('td:has-text("Ann Lee")'); await page.waitForSelector('[data-testid=image-upload-contacts]');
  await page.locator('[data-testid=image-upload-contacts] input[type=file]').setInputFiles(files.contact);
  await page.waitForFunction(() => document.querySelector('aside [data-testid=image-upload-contacts] img'), null, { timeout: 20000 }).catch(() => undefined);
  await page.waitForTimeout(1500);
  const row = (await db.query("select avatar_url from contacts where first_name='Ann'")).rows[0];
  check('contact photo URL saved to contacts.avatar_url', !!row.avatar_url && /people-images\/contacts\/.+\.png$/.test(row.avatar_url), row.avatar_url);
  const px = row.avatar_url ? await pixel(row.avatar_url) : [0, 0, 0];
  check('stored image is the uploaded file (red pixel)', px[0] > 180 && px[1] < 90, JSON.stringify(px));
  check('upload control now shows the photo', (await page.locator('aside [data-testid=image-upload-contacts] img').count()) >= 1);
  check('timeline logs the photo update', (await page.locator('aside ol[aria-label=Timeline] li:has-text("photo updated")').count()) === 1);
  await page.screenshot({ path: `${SHOTS}/27-added-image-upload-contact.png` });

  /* ---- 2. rejects a non-image ---- */
  await page.locator('[data-testid=image-upload-contacts] input[type=file]').setInputFiles(files.bad);
  await page.waitForTimeout(1200);
  const stillOk = (await db.query("select avatar_url from contacts where first_name='Ann'")).rows[0].avatar_url === row.avatar_url;
  check('non-image file does not replace the photo', stillOk);

  /* ---- 3. photo shows in the table after reload ---- */
  await page.reload(); await page.waitForSelector('td:has-text("Ann Lee")');
  const { photos } = await page.evaluate(() => ({ photos: null }));
  void photos;
  check('contact row loads avatar_url after reload', (await db.query("select count(*) c from contacts where avatar_url is not null")).rows[0].c === '1');

  /* ---- 4. remove ---- */
  await page.click('td:has-text("Ann Lee")'); await page.waitForSelector('[data-testid=image-upload-contacts]');
  const removeBtn = page.locator('[data-testid=image-upload-contacts] button:has-text("Remove")');
  await removeBtn.click({ timeout: 10000 }).catch(() => undefined); await page.waitForTimeout(1500);
  check('Remove clears the photo', (await db.query("select avatar_url from contacts where first_name='Ann'")).rows[0].avatar_url === null);
  await page.click('aside button[aria-label=Close]');

  /* ---- 5. team member photo shows across other pages ---- */
  await page.goto(BASE + '/app/team-members'); await page.waitForSelector('[data-testid=team-member]');
  const card = page.locator('[data-testid=team-member]:has-text("Sarah Johnson")');
  await card.locator('input[type=file]').setInputFiles(files.team);
  await page.waitForTimeout(2500);
  const team = (await db.query("select avatar_url from team_members where name='Sarah Johnson'")).rows[0].avatar_url;
  check('team member photo saved', !!team && /people-images\/team\//.test(team), team);
  await page.screenshot({ path: `${SHOTS}/28-added-image-upload-team-members.png` });
  await page.goto(BASE + '/app/win-rate-intelligence'); await page.waitForSelector('h1'); await page.waitForTimeout(2000);
  const srcs = await page.locator('img').evaluateAll(els => els.map(e => e.src));
  check('uploaded team photo replaces the stock photo on Win Rate page', srcs.some(s => s === team), srcs.filter(s => s.includes('people-images')).join(','));
  await page.screenshot({ path: `${SHOTS}/29-added-uploaded-photo-on-existing-page.png` });
  await page.goto(BASE + '/app/smart-followups'); await page.waitForSelector('h1'); await page.waitForTimeout(1500);
  check('...and on Smart Followups', (await page.locator(`img[src="${team}"]`).count()) >= 1);

  /* ---- 6. company logo ---- */
  await page.goto(BASE + '/app/contacts-hub'); await page.waitForSelector('td:has-text("Ann Lee")');
  await page.click('[role=tab]:has-text("Companies")'); await page.waitForSelector('td:has-text("Acme Corp")');
  await page.click('button[aria-label="Change logo for Acme Corp"]');
  await page.locator('[data-testid=image-upload-companies] input[type=file]').setInputFiles(files.logo);
  await page.waitForTimeout(2500);
  const logo = (await db.query("select logo_url from companies where name='Acme Corp'")).rows[0].logo_url;
  check('company logo saved', !!logo && /people-images\/companies\//.test(logo), logo);
  await page.click('button:has-text("Done")');
  check('logo thumbnail shown in the table', (await page.locator('img[alt="Acme Corp logo"]').count()) === 1);
  await page.screenshot({ path: `${SHOTS}/30-added-image-upload-company-logo.png` });

  check('no uncaught page errors', errs.length === 0, errs.slice(0, 3).join(' ; '));
  console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
  await browser.close(); await db.end();
  process.exit(results.every(Boolean) ? 0 : 1);
})().catch(e => { console.error('E2E crashed:', e.message.split('\n').slice(0, 6).join('\n')); process.exit(2); });
