const { chromium } = require('playwright');
const { Pool } = require('pg');
const fs = require('fs');

const BASE = 'http://localhost:5111';
const db = new Pool({ host: '127.0.0.1', user: 'postgres', password: 'pw', database: 'biztest' });
const results = [];
const check = (name, ok, extra = '') => { results.push([ok, name, extra]); console.log(ok ? 'PASS' : 'FAIL', name, extra); };
const proxyCalls = [];

const textMsg = text => ({ output: [{ type: 'message', content: [{ type: 'output_text', text }] }] });

(async () => {
  await db.query('TRUNCATE contacts, companies, app_settings, deals, ai_insights, ai_usage_logs CASCADE');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ acceptDownloads: true });
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  page.on('dialog', d => (d.type() === 'prompt' ? d.accept(d.message().includes('Tag') ? 'vip' : 'My view') : d.accept()));

  await ctx.route('**/.netlify/functions/openai-proxy', async route => {
    const req = route.request();
    if (req.method() === 'GET') return route.fulfill({ json: { configured: true } });
    const { endpoint, body } = JSON.parse(req.postData());
    proxyCalls.push({ endpoint, body });
    if (endpoint.startsWith('images')) return route.fulfill({ json: { data: [{ b64_json: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' }] } });
    const name = body.text?.format?.name;
    if (name === 'lead_score') return route.fulfill({ json: textMsg(JSON.stringify({ score: 87, tier: 'hot', reasons: ['Engaged'], nextAction: 'Book a call', summary: 'Strong lead' })) });
    if (name === 'email_draft') return route.fulfill({ json: textMsg(JSON.stringify({ subject: 'Quick follow up', body: 'Hi there' })) });
    if (name === 'duplicate_groups') {
      const input = JSON.parse(body.input);
      const smiths = input.filter(c => /smith/i.test(c.name)).map(c => c.id);
      return route.fulfill({ json: textMsg(JSON.stringify({ groups: smiths.length > 1 ? [{ ids: smiths, reason: 'Bob/Robert Smith at Initech' }] : [] })) });
    }
    if (body.tools?.some(t => t.type === 'web_search')) {
      return route.fulfill({ json: { output: [
        { type: 'web_search_call', action: { type: 'search', sources: [{ url: 'https://example.com/jane' }] } },
        { type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ found: true, confidence: 'high', jobTitle: 'VP Sales', company: 'Acme', companyWebsite: '', industry: 'SaaS', city: 'Austin', linkedinUrl: 'https://linkedin.com/in/jane', twitterUrl: '', website: '', bio: 'Sales leader.', notes: '' }), annotations: [{ type: 'url_citation', url: 'https://example.com/bio', title: 'Bio' }] }] },
      ] } });
    }
    if (name === 'business_insights') return route.fulfill({ json: textMsg(JSON.stringify({ insights: [{ title: 'Pipeline risk', description: 'Deals stalling', type: 'risk', priority: 'high', confidence: 90, impact: 'high', effort: 'low', actionable: true, suggestedActions: ['Follow up'] }], summary: 'Healthy overall', confidence: 90, recommendations: ['Do X'], nextActions: ['Do Y'], businessImpact: { revenue: '+5%', efficiency: '', riskReduction: '' } })) });
    return route.fulfill({ json: textMsg('Hello from the assistant') });
  });

  await page.goto(BASE + '/app/contacts-hub');
  await page.waitForSelector('text=Advanced Contacts');

  // 1. create via form
  await page.click('button:has-text("New")');
  await page.fill('input[placeholder=firstName]', 'Jane');
  await page.fill('input[placeholder=lastName]', 'Doe');
  await page.fill('input[placeholder=email]', 'jane@acme.com');
  await page.fill('input[placeholder=company]', 'Acme');
  await page.click('form button[type=submit]');
  await page.waitForSelector('td:has-text("Jane Doe")');
  check('create contact via form', (await db.query("select 1 from contacts where email='jane@acme.com'")).rowCount === 1);

  // 2. CSV import
  const csv = 'first_name,last_name,email,phone,company,status\n"Bob","Smith","bob@initech.com","","Initech","prospect"\n"Robert","Smith","","","Initech","lead"\n';
  fs.writeFileSync(require('os').tmpdir() + '/import.csv', csv);
  await page.setInputFiles('input[type=file]', require('os').tmpdir() + '/import.csv');
  await page.waitForSelector('td:has-text("Robert Smith")');
  check('CSV import creates rows', (await db.query("select count(*) c from contacts")).rows[0].c === '3');

  // 3. search / filter / sort
  await page.fill('input[placeholder="Search contacts…"]', 'smith');
  check('search filters rows', (await page.locator('tbody tr').count()) === 2);
  await page.selectOption('select >> nth=0', 'prospect');
  check('status filter', (await page.locator('tbody tr').count()) === 1);
  // 4. saved views
  await page.click('button:has-text("Save view")');
  await page.waitForSelector('[aria-label="Saved views"] button:has-text("My view")');
  check('saved view persisted in app_settings', (await db.query("select setting_value from app_settings where setting_key='contact_views'")).rows[0]?.setting_value?.[0]?.query === 'smith');
  await page.fill('input[placeholder="Search contacts…"]', '');
  await page.selectOption('select >> nth=0', 'all');
  check('cleared filters show all', (await page.locator('tbody tr').count()) === 3);
  await page.click('[aria-label="Saved views"] button:has-text("My view")');
  check('apply saved view restores filter', (await page.locator('tbody tr').count()) === 1);
  await page.fill('input[placeholder="Search contacts…"]', '');
  await page.selectOption('select >> nth=0', 'all');
  await page.click('th:has-text("Name")');
  const firstAsc = await page.locator('tbody tr td:nth-child(2)').first().innerText();
  check('sort by name ascending', firstAsc === 'Bob Smith', firstAsc);

  // 5. export
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('button:has-text("Export")')]);
  const exported = fs.readFileSync(await dl.path(), 'utf8');
  check('CSV export contains rows', exported.includes('jane@acme.com') && exported.split('\n').length === 4);

  // 6. drawer: score, email, enrich+save, note, company, avatar
  await page.click('td:has-text("Jane Doe")');
  await page.waitForSelector('h2:has-text("Jane Doe")');
  await page.click('button:has-text("AI score")');
  await page.waitForSelector('text=87/100');
  check('AI lead score shown + persisted', (await db.query("select lead_score,ai_next_action from contacts where email='jane@acme.com'")).rows[0].lead_score === 87);
  await page.click('button:has-text("Draft email")');
  await page.waitForSelector('text=Quick follow up');
  check('AI email draft shown', true);
  await page.click('button:has-text("Enrich from web")');
  await page.waitForSelector('text=Public info found');
  check('enrichment shows sources', (await page.locator('summary:has-text("Sources (2)")').count()) === 1);
  await page.click('button:has-text("Save selected")');
  await page.waitForSelector('text=Public info found', { state: 'detached' });
  const row = (await db.query("select job_title,city,linkedin_url,enriched_at from contacts where email='jane@acme.com'")).rows[0];
  check('enrichment saved to Supabase', row.job_title === 'VP Sales' && row.city === 'Austin' && row.linkedin_url === 'https://linkedin.com/in/jane' && !!row.enriched_at);
  const wsReq = proxyCalls.find(c => c.body.tools);
  check('web_search tool sent with tool_choice=required', wsReq?.body.tools[0].type === 'web_search' && wsReq.body.tool_choice === 'required');
  await page.fill('input[placeholder="Add a note"]', 'Met at conf');
  await page.click('button:has-text("Add"):not(:has-text("company"))');
  await page.waitForSelector('li:has-text("Met at conf")');
  check('note saved', (await db.query('select count(*) c from contact_notes')).rows[0].c === '1');
  await page.click('button:has-text("Avatar")');
  await page.waitForSelector('aside img');
  check('GPT Image avatar rendered', true);
  const tl = await page.locator('[aria-label=Timeline] li').allInnerTexts();
  check('timeline has scored/email/enriched/note', ['scored', 'email drafted', 'enriched', 'note'].every(k => tl.some(t => t.startsWith(k))), tl.map(t => t.split('\n')[0]).join(' | '));
  await page.click('aside button[aria-label=Close]');

  // 7. companies
  await page.click('[role=tab]:has-text("Companies")');
  await page.fill('input[aria-label="Company name"]', 'Acme Corp');
  await page.fill('input[aria-label="Domain"]', 'acme.com');
  await page.click('button:has-text("Add company")');
  await page.waitForSelector('td:has-text("Acme Corp")');
  check('company created', (await db.query("select 1 from companies where name='Acme Corp'")).rowCount === 1);
  await page.click('[role=tab]:has-text("Contacts")');
  await page.click('td:has-text("Jane Doe")');
  await page.selectOption('select[aria-label=Company]', { label: 'Acme Corp' });
  await page.waitForTimeout(500);
  check('contact linked to company', (await db.query("select company,company_id from contacts where email='jane@acme.com'")).rows[0].company === 'Acme Corp');
  await page.click('aside button[aria-label=Close]');
  await page.click('[role=tab]:has-text("Companies")');
  await page.waitForSelector('tr:has-text("Acme Corp") td:nth-child(4):has-text("1")');
  check('company shows contact count', true);
  await page.click('[role=tab]:has-text("Contacts")');

  // 8. duplicates (AI) + merge
  await page.click('button:has-text("Find duplicates")');
  await page.waitForSelector('[aria-label="Duplicate groups"]');
  check('AI duplicate group found', (await page.locator('[aria-label="Duplicate groups"] li').innerText()).includes('Bob/Robert Smith'));
  await page.click('button:has-text("Merge")');
  await page.waitForSelector('text=Merged');
  const smiths = (await db.query("select first_name,email,company from contacts where last_name='Smith'")).rows;
  check('merge leaves one contact and keeps donor fields', smiths.length === 1 && smiths[0].email === 'bob@initech.com', JSON.stringify(smiths));

  // 9. bulk
  await page.click('input[aria-label="Select all"]');
  await page.selectOption('select[aria-label="Set status"]', 'customer');
  await page.waitForSelector('text=Status set to customer');
  check('bulk set status', (await db.query("select count(*) c from contacts where status='customer'")).rows[0].c === '2');
  await page.click('input[aria-label="Select all"]');
  await page.click('button:has-text("Tag")');
  await page.waitForSelector('text=Tagged "vip"');
  check('bulk tag', (await db.query("select count(*) c from contacts where 'vip' = any(tags)")).rows[0].c === '2');
  await page.click('input[aria-label="Select all"]');
  const before = proxyCalls.filter(c => c.body.tools).length;
  await page.click('button:has-text("Enrich selected")');
  await page.waitForSelector('text=/Enriched \\d+ of 2/');
  check('bulk enrich ran one web search per contact', proxyCalls.filter(c => c.body.tools).length - before === 2);
  await page.click('input[aria-label="Select all"]');
  await page.click('[role=toolbar] button:has-text("Delete")');
  await page.waitForSelector('text=Deleted');
  check('bulk delete', (await db.query('select count(*) c from contacts')).rows[0].c === '0');

  check('no uncaught page errors', pageErrors.length === 0, pageErrors.join(' ; '));
  await page.screenshot({ path: '/tmp/contacts-final.png' });

  // 10. AI app + chatbot
  const p2 = await ctx.newPage();
  const errs2 = [];
  p2.on('pageerror', e => errs2.push(e.message));
  await p2.goto(BASE + '/app/pipeline-intelligence');
  await p2.waitForSelector('h1');
  const btn = p2.locator('button:has-text("AI Analysis"), button:has-text("Analyze"), button:has-text("Run AI")').first();
  if (await btn.count()) {
    await btn.click();
    await p2.waitForSelector('text=Healthy overall', { timeout: 8000 }).then(() => check('AI app analysis renders insights', true)).catch(() => check('AI app analysis renders insights', false));
  } else check('AI app analysis button found', false);
  check('AI app no page errors', errs2.length === 0, errs2.join(';'));

  console.log(`\n${results.filter(r => r[0]).length}/${results.length} passed`);
  await browser.close();
  await db.end();
  process.exit(results.every(r => r[0]) ? 0 : 1);
})().catch(e => { console.error('E2E crashed:', e.message.split('\n').slice(0, 6).join('\n')); process.exit(2); });
