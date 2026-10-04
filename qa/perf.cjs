const { BASE, reset, login, giveConsent } = require('./lib.cjs');

async function metrics(page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Performance.enable');
  const grab = async () => {
    const { metrics } = await cdp.send('Performance.getMetrics');
    return Object.fromEntries(metrics.map((x) => [x.name, x.value]));
  };
  const b = await grab();
  return async () => {
    const a = await grab();
    await cdp.detach();
    return {
      main: (a.TaskDuration - b.TaskDuration) * 1000,
      script: (a.ScriptDuration - b.ScriptDuration) * 1000,
      style: (a.RecalcStyleDuration - b.RecalcStyleDuration) * 1000,
      layout: (a.LayoutDuration - b.LayoutDuration) * 1000,
    };
  };
}
const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];

async function measure(page, route, rounds = 5) {
  const out = [];
  for (let i = 0; i < rounds; i += 1) {
    await page.evaluate(() => {
      location.hash = '#/dash';
    });
    await page.waitForTimeout(600);
    const stop = await metrics(page);
    await page.evaluate((r) => {
      location.hash = '#' + r;
    }, route);
    await page.waitForTimeout(1100);
    out.push(await stop());
  }
  return {
    main: median(out.map((o) => o.main)),
    script: median(out.map((o) => o.script)),
    style: median(out.map((o) => o.style)),
    layout: median(out.map((o) => o.layout)),
  };
}

(async () => {
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await reset(page);

  // warm up: every route once, so JIT and fonts are not charged to the first sample
  await login(page, 'arun@demo.edu');
  await giveConsent(page);
  const routes = [
    ['/dash', 'student dashboard'],
    ['/learn', 'student my learning'],
    ['/res', 'student resources'],
    ['/recovery', 'student recovery'],
    ['/prac', 'student practice'],
    ['/mist', 'student mistakes'],
    ['/pass', 'student skill passport'],
    ['/ask', 'student ask'],
    ['/task/rec', 'student applied task'],
    ['/diag', 'student diagnostics'],
    ['/notif', 'notifications'],
    ['/prof', 'profile'],
  ];
  console.log('== STUDENT routes (median of 5 warm navigations, 4x CPU) ==');
  for (const [r, label] of routes) {
    for (const x of routes) await page.evaluate((h) => { location.hash = h; }, x[0]);
    await page.waitForTimeout(300);
    const m = await measure(page, r);
    console.log(
      `  ${label.padEnd(24)} main ${m.main.toFixed(0).padStart(4)}ms  script ${m.script.toFixed(0).padStart(3)}  style ${m.style.toFixed(0).padStart(3)}  layout ${m.layout.toFixed(0).padStart(3)}`,
    );
  }

  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.waitForTimeout(300);
  await login(page, 'meena@demo.edu');
  await page.waitForTimeout(400);
  const froutes = [
    ['/insights', 'faculty insights heatmap'],
    ['/comp', 'faculty competencies'],
    ['/anal', 'faculty analytics'],
    ['/subs', 'faculty submissions'],
    ['/ftasks', 'faculty tasks'],
    ['/search?q=loop', 'faculty search'],
  ];
  console.log('\n== FACULTY routes ==');
  for (const [r, label] of froutes) {
    const m = await measure(page, r);
    console.log(
      `  ${label.padEnd(24)} main ${m.main.toFixed(0).padStart(4)}ms  script ${m.script.toFixed(0).padStart(3)}  style ${m.style.toFixed(0).padStart(3)}  layout ${m.layout.toFixed(0).padStart(3)}`,
    );
  }

  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.waitForTimeout(300);
  await login(page, 'admin@demo.edu');
  await page.waitForTimeout(400);
  const aroutes = [
    ['/acon', 'admin concepts'],
    ['/aq', 'admin questions'],
    ['/ares', 'admin resources'],
    ['/atask', 'admin task'],
    ['/ausers', 'admin users'],
  ];
  console.log('\n== ADMIN routes ==');
  for (const [r, label] of aroutes) {
    const m = await measure(page, r);
    console.log(
      `  ${label.padEnd(24)} main ${m.main.toFixed(0).padStart(4)}ms  script ${m.script.toFixed(0).padStart(3)}  style ${m.style.toFixed(0).padStart(3)}  layout ${m.layout.toFixed(0).padStart(3)}`,
    );
  }

  await browser.close();
})();