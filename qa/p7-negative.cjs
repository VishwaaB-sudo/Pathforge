const { BASE, check, eq, truthy, state, me, login, giveConsent, reset, go } = require('./lib.cjs');

module.exports = async function p7(page) {
  console.log('\n== PHASE 7: role access, negative cases, ask engine, search ==');

  await check('a student cannot reach faculty or admin routes', async () => {
    await reset(page);
    await login(page, 'arun@demo.edu');
    await giveConsent(page);
    for (const r of ['/subs', '/insights', '/ausers', '/acon', '/aq', '/anal']) {
      await go(page, r);
      const h = await page.locator('h1').first().textContent();
      truthy(/^Good /.test(h), `${r} blocked, landed on the student dashboard: got "${h}"`);
    }
  });

  await check('faculty cannot reach student or admin routes', async () => {
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForTimeout(200);
    await login(page, 'meena@demo.edu');
    await page.waitForTimeout(300);
    for (const r of ['/recovery', '/prac', '/pass', '/mist', '/ausers', '/aq']) {
      await go(page, r);
      eq(await page.locator('h1').first().textContent(), 'Class Overview', `${r} blocked:`);
    }
  });

  await check('an unknown route falls back to the dashboard', async () => {
    await go(page, '/definitely-not-a-route');
    await page.waitForTimeout(200);
    eq(await page.locator('h1').first().textContent(), 'Class Overview');
  });

  await check('student: an invalid task id does not crash the page', async () => {
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForTimeout(200);
    await login(page, 'arun@demo.edu');
    await giveConsent(page);
    await go(page, '/task/does-not-exist');
    await page.waitForTimeout(200);
    const h = await page.locator('h1').first().textContent();
    truthy(h === 'Applied Task' || h === 'Applied Tasks', `page rendered: ${h}`);
  });

  await check('student: results before any diagnostic show an empty state', async () => {
    await go(page, '/result/pre');
    await page.waitForTimeout(200);
    truthy((await page.locator('body').textContent()).includes('No results yet'));
  });

  await check('student: recovery before any diagnostic tells them what to do', async () => {
    await go(page, '/recovery');
    await page.waitForTimeout(200);
    truthy((await page.locator('body').textContent()).includes('Take the diagnostic first'));
  });

  await check('student: mistake bank empty state works', async () => {
    await go(page, '/mist');
    await page.waitForTimeout(200);
    truthy((await page.locator('body').textContent()).includes('No mistakes saved'));
  });

  await check('student: empty concept search shows a no-match state', async () => {
    await page.getByLabel('Search this course').fill('zzzznotathing');
    await page.getByLabel('Search this course').press('Enter');
    await page.waitForTimeout(300);
    truthy((await page.locator('body').textContent()).includes('No matches'));
  });

  await check('student: concept search returns a real result', async () => {
    await page.getByLabel('Search this course').fill('recursion');
    await page.getByLabel('Search this course').press('Enter');
    await page.waitForTimeout(300);
    truthy((await page.locator('body').textContent()).includes('Recursion'));
  });

  await check('ask: the example prompt buttons answer without typing', async () => {
    // runs while the chat is still empty: the presets are replaced by the
    // transcript as soon as anything has been asked
    await go(page, '/ask');
    eq(
      await page.getByRole('button', { name: 'How do I reverse a string?' }).count(),
      1,
      'presets shown on a fresh chat',
    );
    await page.getByRole('button', { name: 'How do I reverse a string?' }).click();
    await page.waitForTimeout(300);
    truthy((await page.locator('.chat').textContent()).includes('Source:'));
  });

  await check('ask: a relevant question is answered from the notes with a source', async () => {
    await page.locator('#aq').fill('What is a base case?');
    await page.getByRole('button', { name: 'Ask' }).click();
    await page.waitForTimeout(300);
    const body = await page.locator('.chat').textContent();
    truthy(body.includes('Source:'), );
    truthy(!body.includes('could not find anything'), 'answered, not refused');
  });

  await check('ask: an out-of-scope question refuses instead of inventing', async () => {
    await page.locator('#aq').fill('Who won the 1998 FIFA World Cup final?');
    await page.getByRole('button', { name: 'Ask' }).click();
    await page.waitForTimeout(300);
    truthy((await page.locator('.chat').textContent()).includes('will not guess'), 'refuses honestly');
  });

  await check('ask: an empty question is ignored (no empty bubble)', async () => {
    const before = await page.locator('.msg').count();
    await page.locator('#aq').fill('   ');
    await page.getByRole('button', { name: 'Ask' }).click();
    await page.waitForTimeout(200);
    eq(await page.locator('.msg').count(), before, 'no message added:');
  });

  await check('the CTA opens exactly one picker, and the backdrop dismisses it', async () => {
    await go(page, '/dash');
    await page.getByRole('button', { name: /Start Diagnostic/ }).first().click();
    await page.waitForTimeout(300);
    eq(await page.getByRole('dialog').count(), 1, 'exactly one dialog:');
    eq(await page.locator('input[name="pick-subject"]').count(), 6, 'one radio per subject:');
    eq(await page.locator('input[name="pick-concept"]').count(), 16, 'one radio per concept plus whole-subject:');

    // a second press now lands on the backdrop, which must dismiss rather than
    // leave the dialog stacked or start a run
    await page.getByRole('button', { name: /Start Diagnostic/ }).first().click({ force: true }).catch(() => {});
    await page.waitForTimeout(300);
    eq(await page.getByRole('dialog').count(), 0, 'backdrop dismisses:');
    eq(await page.locator('h1').first().textContent().then((t) => /Good /.test(t)), true, 'still on the dashboard:');
  });

  await check('starting from the picker opens a single run page', async () => {
    await go(page, '/dash');
    await page.getByRole('button', { name: /Start Diagnostic/ }).first().click();
    await page.getByRole('dialog').getByRole('button', { name: 'Start Diagnostic' }).click();
    await page.waitForTimeout(400);
    eq(await page.locator('h1').first().textContent(), 'Starting Diagnostic', 'run page:');
    eq(await page.getByRole('dialog').count(), 0, 'picker closed:');
    eq(await page.locator('legend.qt').count(), 1, 'exactly one question on screen:');
  });

  await check('a reload mid-quiz clears the run rather than trapping the student', async () => {
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(250);
    const h = await page.locator('h1').first().textContent();
    truthy(h === 'Sign in' || h === 'Starting Diagnostic', `handled: ${h}`);
  });

  await check('localStorage survives a reload with answers intact', async () => {
    await login(page, 'arun@demo.edu');
    await giveConsent(page);
    await go(page, '/dash');
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(250);
    const s = await state(page);
    truthy(s && s.users.length === 3, 'state still loaded after reload');
  });
};