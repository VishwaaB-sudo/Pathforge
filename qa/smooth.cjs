const { BASE, reset, login, giveConsent, playRun } = require('./lib.cjs');

const installProbe = () => {
  window.__cls = 0;
  window.__shifts = [];
  new PerformanceObserver((l) => {
    l.getEntries().forEach((e) => {
      if (!e.hadRecentInput) {
        window.__cls += e.value;
        if (e.value > 0.005) window.__shifts.push({ v: +e.value.toFixed(4), nodes: e.sources.length });
      }
    });
  }).observe({ type: 'layout-shift', buffered: true });
  window.__lt = [];
  new PerformanceObserver((l) => {
    l.getEntries().forEach((e) => window.__lt.push(Math.round(e.duration)));
  }).observe({ entryTypes: ['longtask'] });
};
const readProbe = () => ({
  cls: +window.__cls.toFixed(4),
  shifts: window.__shifts.slice(0, 6),
  longTasks: window.__lt.length,
  worstLongTask: window.__lt.length ? Math.max(...window.__lt) : 0,
});

(async () => {
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await reset(page);
  await login(page, 'arun@demo.edu');
  await giveConsent(page);
  await page.evaluate(installProbe);

  console.log('== whole student flow: dashboard -> diagnostic -> results -> recovery -> passport ==');
  const probe = () => page.evaluate(readProbe);

  await page.getByRole('button', { name: /Start Diagnostic/ }).first().click();
  await page.waitForTimeout(400);
  console.log('  after opening the picker :', JSON.stringify(await probe()));

  await page.getByRole('dialog').getByRole('button', { name: 'Start Diagnostic' }).click();
  await page.waitForTimeout(500);
  console.log('  after the run starts    :', JSON.stringify(await probe()));

  await playRun(page, 'x', { shouldFail: (i) => i.concept === 'rec' });
  await page.waitForTimeout(600);
  console.log('  after 14 answers + save :', JSON.stringify(await probe()));

  await page.evaluate(() => { location.hash = '#/recovery'; });
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Mark as understood' }).click();
  await page.waitForTimeout(400);
  console.log('  recovery step advance   :', JSON.stringify(await probe()));

  await page.evaluate(() => { location.hash = '#/pass'; });
  await page.waitForTimeout(900);
  console.log('  skill passport          :', JSON.stringify(await probe()));

  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.waitForTimeout(300);
  await login(page, 'meena@demo.edu');
  await page.waitForTimeout(400);
  await page.evaluate(installProbe);
  await page.evaluate(() => { location.hash = '#/insights'; });
  await page.waitForTimeout(1200);
  console.log('  faculty heatmap         :', JSON.stringify(await probe()));

  await browser.close();
})();