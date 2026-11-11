const { chromium } = require('playwright');
const { Pool } = require('pg');

const BASE = 'http://localhost:5111';
const db = new Pool({ host: '127.0.0.1', user: 'postgres', password: 'pw', database: 'biztest' });
const results = [];
const check = (name, ok, extra = '') => { results.push(ok); console.log(ok ? 'PASS' : 'FAIL', name, extra); };
const rpcCalls = [];

(async () => {
  await db.query('TRUNCATE dashboard_layouts, saved_filters, app_settings, contacts, deals, companies CASCADE');
  const co = (await db.query("insert into companies (name, industry) values ('Acme','SaaS'),('Initech','Finance') returning id,name")).rows;
  const acme = co.find(c => c.name === 'Acme').id;
  const contacts = (await db.query(`insert into contacts (first_name,last_name,email,company,company_id,status,lead_score,created_at) values
    ('Ann','Lee','ann@acme.com','Acme','${acme}','lead',20,'2026-01-10'),
    ('Bob','Ray',null,'Acme','${acme}','lead',40,'2026-02-10'),
    ('Cy','Doe','cy@i.com','Initech',null,'customer',90,'2026-02-20'),
    ('Di','Poe','di@i.com','Initech',null,'prospect',60,'2026-03-05'),
    ('Ed','Fox','ed@i.com','Initech',null,'customer',80,'2026-03-15') returning id,first_name`)).rows;
  const ann = contacts.find(c => c.first_name === 'Ann').id;
  await db.query(`insert into deals (title,value,stage_id,contact_id) values ('D1',1000,'open','${ann}'),('D2',3000,'won','${ann}'),('D3',500,'open',null)`);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('request', r => { if (r.url().includes('/rpc/dashboard_aggregate')) { try { rpcCalls.push(JSON.parse(r.postData())); } catch { /* ignore */ } } });
  page.on('dialog', d => d.accept(d.type() === 'prompt' ? (d.message().includes('filter') ? 'Leads only' : 'Sales view') : undefined));

  await page.goto(BASE + '/app/dashboard-builder');
  await page.waitForSelector('[data-testid=widget]', { timeout: 120000 });
  await page.waitForTimeout(3000);

  /* 1. starter dashboard renders real charts from the database */
  check('starter dashboard has 6 widgets', (await page.locator('[data-testid=widget]').count()) === 6);
  check('charts rendered as svg (pie, line, bar)', (await page.locator('[data-testid=widget] svg').count()) >= 3);
  const aggText = await page.locator('[data-widget-id]').first().innerText();
  check('aggregate "Total contacts" shows 5', /\b5\b/.test(aggText), aggText.replace(/\n/g, ' | ').slice(0, 80));
  const pipeline = await page.locator('[data-widget-id]').nth(1).innerText();
  check('aggregate "Pipeline value" sums deals (4500)', /4[,.\s]?500|4\.5k|4,5/i.test(pipeline), pipeline.replace(/\n/g, ' | ').slice(0, 80));
  check('record list shows contacts', (await page.locator('[data-testid=record-row]').count()) === 5);
  check('pie legend uses select option labels', /Lead/.test(await page.locator('[data-widget-id]').nth(2).innerText()));
  check('RPC called with group by status', rpcCalls.some(c => c.p_group1 === 'status' && c.p_table === 'contacts' && c.p_metric === 'count'));
  check('sum of deal value by stage RPC', rpcCalls.some(c => c.p_table === 'deals' && c.p_metric === 'sum' && c.p_field === 'value' && c.p_group1 === 'stageId'));
  await page.screenshot({ path: require('os').tmpdir() + '/builder-1-view.png' });

  /* 2. drag + resize + persist */
  await page.click('button:has-text("Edit layout")');
  const w0 = page.locator('[data-testid=widget]').first();
  const before = await w0.boundingBox();
  const handle = w0.locator('.widget-drag-handle');
  const hb = await handle.boundingBox();
  await page.mouse.move(hb.x + 20, hb.y + 10);
  await page.mouse.down();
  await page.mouse.move(hb.x + 120, hb.y + 120, { steps: 10 });
  await page.mouse.move(hb.x + 330, hb.y + 140, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(500);
  const after = await w0.boundingBox();
  check('widget can be dragged to a new position', Math.abs(after.x - before.x) > 40 || Math.abs(after.y - before.y) > 40, `${Math.round(before.x)},${Math.round(before.y)} -> ${Math.round(after.x)},${Math.round(after.y)}`);
  const resizeHandle = page.locator('[data-testid=widget]').nth(2).locator('.react-resizable-handle').first();
  const rb = await resizeHandle.boundingBox();
  const sizeBefore = await page.locator('[data-testid=widget]').nth(2).boundingBox();
  await page.mouse.move(rb.x + 5, rb.y + 5);
  await page.mouse.down();
  await page.mouse.move(rb.x + 60, rb.y + 90, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(500);
  const sizeAfter = await page.locator('[data-testid=widget]').nth(2).boundingBox();
  check('widget can be resized', sizeAfter.width > sizeBefore.width + 20 || sizeAfter.height > sizeBefore.height + 20, `${Math.round(sizeBefore.width)}x${Math.round(sizeBefore.height)} -> ${Math.round(sizeAfter.width)}x${Math.round(sizeAfter.height)}`);
  await page.screenshot({ path: require('os').tmpdir() + '/builder-2-edit.png' });
  await page.click('button:has-text("Save")');
  await page.waitForSelector('text=Dashboard saved');
  const saved = (await db.query('select layout from dashboard_layouts')).rows[0].layout;
  check('layout persisted to Supabase with moved widget', saved.widgets.length === 6 && (saved.widgets[0].grid.x !== 0 || saved.widgets[0].grid.y !== 0));
  await page.reload();
  await page.waitForSelector('[data-testid=widget]');
  await page.waitForTimeout(1500);
  const reloaded = await page.locator('[data-testid=widget]').first().boundingBox();
  check('reload restores the saved position', Math.abs(reloaded.x - after.x) < 30 && Math.abs(reloaded.y - after.y) < 30, `${Math.round(reloaded.x)},${Math.round(reloaded.y)}`);

  /* 3. add + configure a bar chart */
  await page.click('button:has-text("Add widget")');
  await page.click('[role=menuitem]:has-text("Bar chart")');
  await page.waitForSelector('aside[aria-label="Widget settings"]');
  await page.selectOption('select[aria-label="Metric"]', 'SUM');
  await page.selectOption('select[aria-label="Metric field"]', 'leadScore');
  await page.selectOption('select[aria-label="Group by"]', 'company');
  await page.fill('input[aria-label="Title"]', 'Score by company');
  await page.waitForTimeout(2500);
  check('configured bar chart queries SUM(leadScore) grouped by company', rpcCalls.some(c => c.p_metric === 'sum' && c.p_field === 'leadScore' && c.p_group1 === 'company'));
  /* filter */
  await page.click('button:has-text("Add filter")');
  await page.selectOption('select[aria-label="Filter field"]', 'status');
  await page.locator('[aria-label="Filter values"] label:has-text("Lead") input').check();
  await page.waitForTimeout(2500);
  check('filter status is Lead reaches the RPC', rpcCalls.some(c => c.p_group1 === 'company' && JSON.stringify(c.p_filter).includes('lead')));
  /* saved filter */
  await page.click('button:has-text("Save for me")');
  await page.waitForSelector('button:has-text("Leads only")');
  check('saved filter stored', (await db.query("select count(*) c from saved_filters where name='Leads only'")).rows[0].c === '1');
  await page.screenshot({ path: require('os').tmpdir() + '/builder-3-config.png' });
  await page.click('button[aria-label="Close settings"]');

  /* 4. record context */
  await page.click('button:has-text("Record context")');
  await page.fill('input[aria-label="Search records"]', 'Ann');
  await page.click('li button:has-text("Ann Lee")');
  // make the aggregate deal widget depend on context
  await page.locator('[data-testid=widget]:has-text("Pipeline value") button[aria-label^="Configure"]').click();
  await page.locator('label:has-text("selected record") input').check();
  await page.waitForTimeout(2500);
  const ctxText = await page.locator('[data-testid=widget]:has-text("Pipeline value")').innerText();
  check('widget filtered by selected contact (deals of Ann = 4000)', /4[,.\s]?000|4k/i.test(ctxText), ctxText.replace(/\n/g, ' | ').slice(0, 80));
  check('context filter sent as contactId to RPC', rpcCalls.some(c => c.p_table === 'deals' && JSON.stringify(c.p_filter).includes('contactId')));
  await page.click('button[aria-label="Close settings"]');
  await page.click('button[aria-label="Clear context"]');

  /* 5. iframe + approved embeds */
  await page.click('button:has-text("Add widget")');
  await page.click('[role=menuitem]:has-text("Embedded page")');
  await page.fill('input[aria-label="URL"]', 'https://example.com/report');
  check('unapproved site is rejected', (await page.locator('[role=alert]:has-text("not in the approved")').count()) === 1);
  await page.click('button[aria-label="Close settings"]');
  await page.click('button:has-text("Approved embeds")');
  await page.fill('textarea[aria-label="Approved embed hosts"]', 'example.com');
  await page.locator('div:has(> textarea[aria-label="Approved embed hosts"]) button:has-text("Save")').click();
  await page.waitForSelector('text=Approved embeds updated');
  check('allowlist persisted', JSON.stringify((await db.query("select setting_value from app_settings where setting_key='dashboard_iframe_allowlist'")).rows[0]?.setting_value) === '["example.com"]');
  await page.waitForSelector('[data-testid=widget-iframe] iframe', { timeout: 20000 }).then(() => check('approved site renders in an iframe', true)).catch(() => check('approved site renders in an iframe', false));

  /* 6. drill-down: click a pie slice */
  await page.click('button:has-text("View")');
  const slice = page.locator('[data-testid=widget]:has-text("Contacts by status") svg path[fill]:not([fill="transparent"]):not([fill="none"])').first();
  await slice.waitFor({ timeout: 20000 });
  await slice.dispatchEvent('click');
  await page.waitForURL(/\/objects\/contacts\?/, { timeout: 15000 }).then(() => check('clicking a slice navigates to the filtered records route', true)).catch(() => check('clicking a slice navigates to the filtered records route', false, page.url()));
  if (/\/objects\/contacts/.test(page.url())) {
    await page.waitForSelector('[data-testid=record-row]', { timeout: 20000 });
    const n = await page.locator('[data-testid=record-row]').count();
    check('drill-down lists only the matching records', n >= 1 && n < 5, `${n} rows, ${decodeURIComponent(page.url()).slice(-60)}`);
    await page.screenshot({ path: require('os').tmpdir() + '/builder-4-drilldown.png' });
  }

  /* 7. team scope */
  await page.goto(BASE + '/app/dashboard-builder');
  await page.waitForSelector('[data-testid=widget]');
  await page.click('button:has-text("Copy to team")');
  await page.waitForSelector('text=Copied to team');
  await page.click('[role=tab]:has-text("Team")');
  await page.waitForFunction(() => [...document.querySelectorAll('select[aria-label=Dashboard] option')].some(o => o.textContent.includes('(copy)')), null, { timeout: 15000 });
  const teamRows = (await db.query("select scope, owner_id from dashboard_layouts where scope='team'")).rows;
  check('dashboard copied to team scope', teamRows.length === 1 && teamRows[0].owner_id === 'team');
  check('team tab lists the shared dashboard', (await page.locator('select[aria-label=Dashboard] option').count()) === 1);

  /* 8. dark mode */
  await page.evaluate(() => document.body.classList.add('dark-mode'));
  await page.screenshot({ path: require('os').tmpdir() + '/builder-5-team.png' });

  check('no uncaught page errors', errs.length === 0, errs.slice(0, 3).join(' ; '));
  console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
  await browser.close();
  await db.end();
  process.exit(results.every(Boolean) ? 0 : 1);
})().catch(e => { console.error('E2E crashed:', e.message.split('\n').slice(0, 6).join('\n')); process.exit(2); });
