const { chromium } = require('playwright');
const BASE = 'http://localhost:5111';
const textMsg = text => ({ output: [{ type: 'message', content: [{ type: 'output_text', text }] }] });

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  let configured = true;
  const requests = [];
  await ctx.route('**/.netlify/functions/openai-proxy', route => {
    const req = route.request();
    if (req.method() === 'GET') return route.fulfill({ json: { configured } });
    requests.push(JSON.parse(req.postData()).body);
    return route.fulfill({ json: textMsg('Hello from the assistant') });
  });
  const results = [];
  const check = (n, ok, x = '') => { results.push(ok); console.log(ok ? 'PASS' : 'FAIL', n, x); };

  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto(BASE + '/');
  await page.waitForSelector('button[title="Open AI Assistant"]');
  await page.click('button[title="Open AI Assistant"]');
  await page.fill('textarea[placeholder="Ask me anything..."]', 'How do I use the pipeline app?');
  await page.keyboard.press('Enter');
  const shown = await page.waitForSelector('text=Hello from the assistant', { timeout: 10000 }).then(() => true).catch(() => false);
  const last = requests[requests.length - 1] || {};
  check('chatbot reply rendered', shown);
  check('chatbot uses fast model + instructions + user/assistant input only', last.model === 'gpt-6.1-terra' && !!last.instructions && (last.input || []).every(m => m.role === 'user' || m.role === 'assistant'), `${last.model} ${(last.input || []).map(m => m.role)}`);
  check('chatbot reasoning effort low', last.reasoning?.effort === 'low');

  // not-configured state (fresh page so availability is re-checked)
  configured = false;
  const p2 = await ctx.newPage();
  await p2.goto(BASE + '/app/pipeline-intelligence');
  await p2.waitForSelector('h1');
  await p2.click('button:has-text("AI Analysis")');
  check('no-key message in analysis section', await p2.waitForSelector('text=AI is not configured', { timeout: 8000 }).then(() => true).catch(() => false));

  const p3 = await ctx.newPage();
  await p3.goto(BASE + '/');
  await p3.waitForSelector('button[title="Open AI Assistant"]');
  await p3.click('button[title="Open AI Assistant"]');
  await p3.fill('textarea[placeholder="Ask me anything..."]', 'hello');
  await p3.keyboard.press('Enter');
  check('no-key message in chatbot', await p3.waitForSelector("text=isn't configured yet", { timeout: 8000 }).then(() => true).catch(() => false));
  check('no page errors', errs.length === 0, errs.join(';'));
  await browser.close();
  process.exit(results.every(Boolean) ? 0 : 1);
})().catch(e => { console.error('crashed', e.message.split('\n')[0]); process.exit(2); });
