const { BASE, check, eq, truthy, login, giveConsent, reset, go } = require('./lib.cjs');

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844 },
];

/** Reports elements wider than the viewport, which is what causes sideways scroll. */
const overflow = () => {
  const vw = document.documentElement.clientWidth;
  const bad = [];
  document.querySelectorAll('body *').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed') return;
    if (r.right > vw + 1 || r.left < -1) {
      // a scroll container is allowed to be wider than the viewport
      let p = el.parentElement, clipped = false;
      while (p) {
        const pcs = getComputedStyle(p);
        if (['auto', 'scroll', 'hidden', 'clip'].includes(pcs.overflowX)) { clipped = true; break; }
        p = p.parentElement;
      }
      if (!clipped) bad.push(`${el.tagName}.${String(el.className).slice(0, 30)} right=${Math.round(r.right)}`);
    }
  });
  return { vw, docScrollW: document.documentElement.scrollWidth, bad: [...new Set(bad)].slice(0, 6) };
};

module.exports = async function p8(page) {
  console.log('\n== PHASE 8: responsive ==');

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });

    await check(`${vp.name}: login screen renders without sideways scroll`, async () => {
      await reset(page);
      const r = await page.evaluate(overflow);
      eq(r.docScrollW <= r.vw + 1, true, `scrollW ${r.docScrollW} > ${r.vw}: ${JSON.stringify(r.bad)}`);
    });

    await check(`${vp.name}: student dashboard renders without sideways scroll`, async () => {
      await login(page, 'arun@demo.edu');
      await giveConsent(page);
      await page.waitForTimeout(250);
      const r = await page.evaluate(overflow);
      eq(r.docScrollW <= r.vw + 1, true, `scrollW ${r.docScrollW} > ${r.vw}: ${JSON.stringify(r.bad)}`);
    });

    await check(`${vp.name}: diagnostic picker fits the viewport`, async () => {
      await go(page, '/diag');
      const cta = page.getByRole('button', { name: /Start Diagnostic/ }).first();
      if (!(await cta.count())) return 'diagnostic already taken, skipped';
      await cta.click();
      await page.getByRole('dialog').waitFor();
      const box = await page.getByRole('dialog').boundingBox();
      truthy(box.x >= -1, `dialog starts off-screen at ${box.x}`);
      truthy(box.x + box.width <= vp.width + 1, `dialog overflows right: ${box.x + box.width} > ${vp.width}`);
      await page.keyboard.press('Escape');
    });
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await check('mobile: the sidebar drawer opens and closes', async () => {
    await go(page, '/dash');
    await page.getByRole('button', { name: 'Toggle navigation' }).click();
    await page.waitForTimeout(300);
    const open = await page.locator('#app.open').count();
    truthy(open === 1, 'drawer opened');
    await page.locator('.scrim').click({ force: true });
    await page.waitForTimeout(300);
    eq(await page.locator('#app.open').count(), 0, 'drawer closed');
  });

  await check('mobile: tables stay scrollable rather than clipped', async () => {
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForTimeout(200);
    await login(page, 'meena@demo.edu');
    await page.waitForTimeout(250);
    await go(page, '/comp');
    const tw = await page.locator('.tw').first().boundingBox();
    truthy(tw.width <= 390, `table wrapper within viewport: ${tw.width}`);
    const r = await page.evaluate(overflow);
    eq(r.docScrollW <= r.vw + 1, true, `doc scroll ${r.docScrollW} > ${r.vw}: ${JSON.stringify(r.bad)}`);
  });

  await page.setViewportSize({ width: 1440, height: 900 });
};