const { BASE, check, eq, truthy, state, me, login, giveConsent, playRun, go } = require('./lib.cjs');

module.exports = async function p5(page) {
  console.log('\n== PHASE 5: reassessment, before/after, skill passport ==');

  await check('student returns to a signed-in dashboard', async () => {
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForTimeout(200);
    await login(page, 'arun@demo.edu');
    await giveConsent(page);
    await page.waitForTimeout(250);
    truthy((await page.locator('h1').first().textContent()).startsWith('Good '));
  });

  await check('verified task unlocks the reassessment button', async () => {
    await go(page, '/diag');
    const body = await page.locator('body').textContent();
    truthy(body.includes('Start Reassessment'), 'reassessment offered');
    truthy(body.includes('Your task is verified'), 'explains why');
  });

  await check('recovery plan no longer locks the reassessment step', async () => {
    await go(page, '/recovery');
    const body = await page.locator('.stp').textContent();
    truthy(body.includes('Start Reassessment'), 'unlocked action present');
  });

  await check('reassessment opens the picker scoped like a diagnostic', async () => {
    await page.getByRole('button', { name: 'Start Reassessment' }).first().click();
    const dlg = page.getByRole('dialog');
    await dlg.waitFor();
    truthy((await dlg.textContent()).includes('Start your reassessment'));
    await dlg.getByRole('button', { name: 'Start Reassessment' }).click();
    await page.waitForTimeout(250);
    const sub = await page.locator('.hd .mu').first().textContent();
    truthy(sub.includes('Question 1 of 14'), `reassessment length: ${sub}`);
  });

  await check('reassessment answers are recorded as a post result', async () => {
    await playRun(page, 'x', { shouldFail: (i) => i.concept === 'exc' });
    await page.waitForTimeout(500);
    const s = await me(page);
    truthy(s.post, 'post record written');
    eq(s.post.scores.rec, 100, 'recursion improved from 0 to 100:');
    eq(Object.keys(s.post.scores).length, 14, 'concepts scored:');
    truthy(s.post.at, 'timestamp written');
  });

  await check('reassessment navigates to the progress page', async () => {
    await page.waitForTimeout(400);
    eq(await page.locator('h1').first().textContent(), 'Your Progress');
  });

  await check('before/after comparison shows the real delta', async () => {
    const body = await page.locator('body').textContent();
    truthy(body.includes('BEFORE'), 'before shown');
    truthy(body.includes('AFTER'), 'after shown');
    truthy(body.includes('CHANGE'), 'change shown');
    const s = await me(page);
    truthy(s.post.scores.rec > s.pre.scores.rec, 'delta is positive for recursion');
  });

  await check('notifications tell the student about the verification', async () => {
    await go(page, '/notif');
    const body = await page.locator('body').textContent();
    truthy(/verified/i.test(body), `notifications: ${body.slice(0, 200)}`);
  });

  await check('skill passport counts only faculty-verified competencies', async () => {
    await go(page, '/pass');
    const s = await state(page);
    const expected = s.subs.filter((x) => x.uid === 'arun@demo.edu' && x.status === 'verified').length;
    const card = page.locator('.passport-summary > div').first();
    eq((await card.locator('.n').textContent()).trim(), String(expected), 'verified count:');
  });

  await check('skill passport never shows verification for unverified work', async () => {
    const body = await page.locator('body').textContent();
    // Functions has no task, so it must not claim a faculty verification
    const fnCard = page.locator('article.card').filter({ hasText: 'Functions' }).first();
    const fn = await fnCard.textContent();
    truthy(fn.includes('Faculty verification'), 'shows the evidence line');
    truthy(/Faculty verification ·/.test(fn) === false, 'no fabricated verifier line');
    truthy(fn.includes('–') || fn.includes('–'), 'score placeholder present');
  });

  await check('skill passport shows the rubric total and faculty name for verified work', async () => {
    const card = page.locator('article.card').filter({ hasText: 'Recursion' }).first();
    const body = await card.textContent();
    truthy(body.includes('rubric 12/16'), `rubric evidence: ${body}`);
    truthy(body.includes('Dr. Meena Rao'), 'names the reviewer');
    truthy(body.includes('Clear and correct') === false, 'does not invent feedback');
  });

  await check('improvement history shows before → after per concept', async () => {
    const card = page.locator('article.card').filter({ hasText: 'Recursion' }).first();
    const body = await card.textContent();
    truthy(body.includes('Before 0%'), `before value: ${body}`);
    truthy(body.includes('After 100%'), `after value: ${body}`);
  });

  await check('dashboard journey now shows Applied and Verified complete', async () => {
    await go(page, '/dash');
    const hero = await page.locator('.card.hero').textContent();
    truthy(hero.includes('Start Reassessment') === false, 'no longer offers reassessment:');
    truthy(hero.includes('See My Progress'), 'moves to progress:');
  });
};