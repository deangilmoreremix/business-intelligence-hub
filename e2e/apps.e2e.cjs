const { chromium } = require('playwright');
const fs = require('fs');

const BASE = 'http://localhost:5111';
const ids = fs.readFileSync(require('path').join(__dirname, '../src/data/aiApps.ts'), 'utf8').match(/id: '([a-z-]+)'/g).map(s => s.slice(5, -1));
const textMsg = text => ({ output: [{ type: 'message', content: [{ type: 'output_text', text }] }] });
const insights = { insights: [{ title: 'Pipeline risk', description: 'Deals stalling', type: 'risk', priority: 'high', confidence: 90, impact: 'high', effort: 'low', actionable: true, suggestedActions: ['Follow up'] }], summary: 'Healthy overall', confidence: 90, recommendations: ['Do X'], nextActions: ['Do Y'], businessImpact: { revenue: '+5%', efficiency: '', riskReduction: '' } };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  let configured = true;
  const requests = [];
  await ctx.route('**/.netlify/functions/openai-proxy', route => {
    const req = route.request();
    if (req.method() === 'GET') return route.fulfill({ json: { configured } });
    const { body } = JSON.parse(req.postData());
    requests.push(body);
    if (body.text?.format?.name === 'business_insights') return route.fulfill({ json: textMsg(JSON.stringify(insights)) });
    return route.fulfill({ json: textMsg('Hello from the assistant') });
  });

  const failures = [];
  let withAI = 0;
  const noAI = [];
  for (const id of ids) {
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.goto(`${BASE}/app/${id}`);
    await page.waitForSelector('h1', { timeout: 5000 }).catch(() => errs.push('no h1'));
    const btn = page.locator('button:has-text("AI Analysis")').first();
    if (await btn.count()) {
      withAI++;
      await btn.click({ timeout: 5000 }).catch(e => errs.push('click: ' + e.message.split('\n')[0]));
      const ok = await page.waitForSelector('text=Healthy overall', { timeout: 4000 }).then(() => true).catch(() => false);
      if (!ok) errs.push('analysis result not displayed');
    } else noAI.push(id);
    console.log('app', id, errs.length ? 'FAIL ' + errs.join('; ') : 'ok');
    if (errs.length) failures.push([id, errs.join('; ')]);
    await page.close();
  }
  console.log(`apps: ${ids.length}, with AI analysis: ${withAI}, failures: ${failures.length}`);
  failures.forEach(f => console.log('FAIL', f[0], f[1]));
  console.log('apps without AI analysis button:', noAI.join(', ') || 'none');
  console.log('analysis requests used model(s):', [...new Set(requests.map(r => r.model))].join(', '), '| response_format used:', requests.some(r => r.response_format));

  // Page-level buttons that used to be fake setTimeout demos must now run the real analysis
  for (const [id, label] of [['win-rate-intelligence', 'Analyze Win Rates'], ['smart-allocation', 'Optimize Allocation'], ['pipeline-health', 'Run'], ['trend-intelligence', 'Analysis']]) {
    const pg = await ctx.newPage();
    await pg.goto(`${BASE}/app/${id}`);
    await pg.waitForSelector('h1');
    const before = requests.length;
    const hb = pg.locator(`button:has-text("${label}")`).filter({ hasNotText: 'AI ' }).first();
    if (!(await hb.count())) { console.log('header button not found for', id, label); await pg.close(); continue; }
    await hb.click({ timeout: 5000 }).catch(e => console.log('click failed', id, e.message.split('\n')[0]));
    const shown = await pg.waitForSelector('text=Healthy overall', { timeout: 4000 }).then(() => true).catch(() => false);
    console.log(`header button on ${id} ran real analysis:`, shown && requests.length === before + 1);
    await pg.close();
  }

  // Chatbot
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto(BASE + '/');
  await page.waitForTimeout(1000);
  const chatBtn = page.locator('button[title="Open AI Assistant"]').first();
  let chatOk = false;
  if (await chatBtn.count()) {
    await chatBtn.click();
    await page.fill('input[placeholder="Ask me anything..."]', 'How do I use the pipeline app?');
    await page.keyboard.press('Enter');
    chatOk = await page.waitForSelector('text=Hello from the assistant', { timeout: 10000 }).then(() => true).catch(() => false);
    const last = requests[requests.length - 1];
    console.log('chatbot reply shown:', chatOk, '| model:', last?.model, '| instructions set:', !!last?.instructions, '| input roles:', (last?.input || []).map(m => m.role).join(','));
  } else console.log('chat button not found');

  // No-key behaviour: proxy reports not configured
  configured = false;
  const p3 = await ctx.newPage();
  await p3.addInitScript(() => sessionStorage.clear());
  await p3.goto(BASE + '/app/pipeline-intelligence');
  await p3.waitForSelector('h1');
  await p3.click('button:has-text("AI Analysis")');
  const msg = await p3.waitForSelector('text=AI is not configured', { timeout: 4000 }).then(() => true).catch(() => false);
  console.log('no-key message shown in analysis section:', msg);
  console.log('page errors on chat page:', errs.length);
  await browser.close();
  process.exit(failures.length || !chatOk || !msg ? 1 : 0);
})().catch(e => { console.error('crashed', e.message.split('\n')[0]); process.exit(2); });
