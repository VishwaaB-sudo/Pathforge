const { BASE, check, eq, truthy, reset, state, me, login, giveConsent, go } = require('./lib.cjs');

module.exports = async function p1(page) {
  console.log('\n== PHASE 1: auth, consent, dashboard ==');

  await check('fresh visit shows the login screen', async () => {
    await reset(page);
    eq(await page.locator('h1').first().textContent(), 'Sign in');
  });

  await check('invalid password is rejected with a visible error', async () => {
    await page.getByLabel('Email').fill('arun@demo.edu');
    await page.getByLabel('Password').fill('wrongpass');
    await page.getByRole('button', { name: 'Sign in' }).click();
    const err = page.locator('.er');
    await err.waitFor();
    const t = await err.textContent();
    truthy(t.includes('incorrect'), `error text was: ${t}`);
    eq(await page.locator('h1').first().textContent(), 'Sign in', 'still on login:');
  });

  await check('unknown email is rejected', async () => {
    await login(page, 'nobody@demo.edu');
    await page.locator('.er').waitFor();
    truthy((await page.locator('.er').textContent()).includes('incorrect'));
  });

  await check('student login lands on the consent gate, not the dashboard', async () => {
    await login(page, 'arun@demo.edu');
    await page.waitForTimeout(200);
    eq(await page.locator('h1').first().textContent(), 'Before you start');
  });

  await check('consent cannot be skipped without ticking the box', async () => {
    eq(await page.getByRole('button', { name: 'Continue' }).isDisabled(), true);
  });

  await check('consent stores the flag and reveals the dashboard', async () => {
    await giveConsent(page);
    await page.waitForTimeout(200);
    truthy((await page.locator('h1').first().textContent()).startsWith('Good '));
    const s = await state(page);
    eq(s.mes['arun@demo.edu'].consent, true, 'consent persisted:');
  });

  await check('dashboard starts empty and recommends the diagnostic', async () => {
    const h2 = await page.locator('.card.hero h2').textContent();
    eq(h2, 'Take your diagnostic');
    const s = await me(page);
    eq(s.pre, null, 'no diagnostic stored:');
    eq(s.mist.length, 0, 'no mistakes:');
    const progress = await page.locator('.mets.strip .met').first().textContent();
    truthy(progress.includes('0%'), `progress read: ${progress}`);
  });

  await check('student dashboard reports 0 of 15 competencies before any test', async () => {
    const comp = await page.locator('.mets.strip .met').nth(1).textContent();
    truthy(comp.includes('0/15'), `read: ${comp}`);
  });

  await check('a reload returns to the login screen (session is not persisted)', async () => {
    await page.reload({ waitUntil: 'load' });
    eq(await page.locator('h1').first().textContent(), 'Sign in');
  });

  await check('re-login keeps the consent flag and skips the gate', async () => {
    await login(page, 'arun@demo.edu');
    await page.waitForTimeout(250);
    truthy((await page.locator('h1').first().textContent()).startsWith('Good '));
  });

  await check('logout clears the session', async () => {
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForTimeout(200);
    eq(await page.locator('h1').first().textContent(), 'Sign in');
  });
};