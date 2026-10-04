const { BASE, check, eq, truthy, state, me, reset, login, giveConsent, playRun, go } = require('./lib.cjs');

module.exports = async function p3(page) {
  console.log('\n== PHASE 3: recovery steps, practice, mistakes, applied task, submission ==');

  // build the golden-path state from scratch: gap = Recursion, prerequisite strong
  await reset(page);
  await login(page, 'arun@demo.edu');
  await giveConsent(page);
  await go(page, '/diag');
  await page.getByRole('button', { name: /Start Diagnostic/ }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: 'Start Diagnostic' }).click();
  await page.waitForTimeout(250);
  await playRun(page, 'x', { shouldFail: (i) => i.concept === 'rec' });
  await page.waitForTimeout(400);

  await check('recovery step 1 marks understanding and advances the plan', async () => {
    await go(page, '/recovery');
    const before = (await me(page)).und;
    eq(Object.keys(before).length, 0, 'nothing studied yet:');
    await page.getByRole('button', { name: 'Mark as understood' }).click();
    await page.waitForTimeout(200);
    const after = await me(page);
    eq(after.und.rec, true, 'understood flag stored:');
    const body = await page.locator('.stp').textContent();
    truthy(!body.includes('Mark as understood'), 'current step moved on');
    truthy(body.includes('Study Example'), 'next step is the example');
  });

  await check('recovery step 2 records the worked example', async () => {
    await page.getByRole('button', { name: 'I have studied this' }).click();
    await page.waitForTimeout(200);
    const after = await me(page);
    eq(after.ex.rec, true, 'example flag stored:');
    truthy((await page.locator('.stp').textContent()).includes('Practice'));
  });

  await check('recovery step 3 practice run completes and marks the concept practised', async () => {
    await page.getByRole('button', { name: 'Start Practice' }).click();
    await page.waitForTimeout(250);
    const sub = await page.locator('.hd .mu').first().textContent();
    truthy(sub.includes('Recursion'), `practice is scoped to the gap: ${sub}`);
    const seen = await playRun(page, 'correct');
    truthy(seen.length > 0, 'answered the practice set');
    await page.waitForTimeout(400);
    const s = await me(page);
    eq(s.prac.rec, true, 'concept marked practised:');
  });

  await check('answering practice correctly clears the saved mistake', async () => {
    const s = await me(page);
    const st = await state(page);
    const recMist = s.mist.filter((m) => st.qs.find((q) => q.id === m.id)?.c === 'rec');
    eq(recMist.length, 0, `recursion mistakes resolved: ${JSON.stringify(s.mist)}`);
  });

  await check('practice run completion screen appears', async () => {
    const h1 = await page.locator('h1').first().textContent();
    eq(h1, 'Practice complete');
  });

  await check('applied task submission is gated until the concept is practised', async () => {
    await go(page, '/task/rec/sub');
    // prac.rec is true now, so the form should be reachable
    truthy((await page.locator('body').textContent()).includes('Submit for review'));
  });

  await check('a concept that was never practised cannot submit evidence', async () => {
    const s = await me(page);
    eq(s.prac.arr, undefined, 'Arrays was not practised:');
    await go(page, '/task/arr/sub');
    const body = await page.locator('body').textContent();
    truthy(body.includes('first'), `blocked by the practice gate: ${body.slice(0, 160)}`);
    eq(await page.locator('#code').count(), 0, 'no submission form offered');
  });

  await check('submission validates code length and shape', async () => {
    await go(page, '/task/rec/sub');
    const ta = page.locator('#code');
    await ta.fill('x = 1');
    await page.locator('#expl').fill('short');
    await page.getByRole('button', { name: 'Submit for review' }).click();
    await page.waitForTimeout(200);
    let s = await state(page);
    eq(s.subs.filter((x) => x.uid === 'arun@demo.edu').length, 0, 'nothing submitted yet:');
    const toast = await page.locator('.toast').textContent();
    truthy(toast.includes('function code'), `validation toast: ${toast}`);
  });

  await check('submission validates the explanation length', async () => {
    await page.locator('#code').fill('def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n - 1)');
    await page.locator('#expl').fill('too short');
    await page.getByRole('button', { name: 'Submit for review' }).click();
    await page.waitForTimeout(200);
    const toast = await page.locator('.toast').textContent();
    truthy(toast.includes('explanation'), `validation toast: ${toast}`);
    const s = await state(page);
    eq(s.subs.filter((x) => x.uid === 'arun@demo.edu').length, 0, 'still not submitted:');
  });

  await check('valid submission is stored as pending with the right task', async () => {
    await page.locator('#expl').fill('The base case stops the recursion when n reaches zero.');
    await page.getByRole('button', { name: 'Submit for review' }).click();
    await page.waitForTimeout(300);
    const s = await state(page);
    const sub = s.subs.find((x) => x.uid === 'arun@demo.edu');
    truthy(sub, 'submission stored');
    eq(sub.tid, 'rec', 'attached to the recursion task:');
    eq(sub.status, 'pending', 'status pending:');
    eq(sub.who, 'Arun Kumar', 'student name recorded:');
    truthy(sub.code.includes('def factorial'), 'code persisted');
  });

  await check('submitted work is read-only until a revision is requested', async () => {
    await go(page, '/task/rec/sub');
    const body = await page.locator('.card').textContent();
    truthy(body.includes('Your code'), 'shows the submitted code:');
    truthy(!body.includes('Submit for review'), 'form is not offered again');
  });

  await check('task overview reports pending status, not verified', async () => {
    await go(page, '/task/rec');
    const body = await page.locator('.card').textContent();
    truthy(body.includes('Submitted, awaiting review'), 'pending shown');
    truthy(!body.includes('Faculty Verified'), 'must not claim verification');
  });

  await check('reassessment stays locked while the task is unverified', async () => {
    await go(page, '/recovery');
    const body = await page.locator('.stp').textContent();
    truthy(/Unlocks after faculty verifies/.test(body), 'reassessment locked');
    await go(page, '/diag');
    truthy((await page.locator('body').textContent()).includes('Unlocks after faculty verifies'));
  });

  await check('submission survives a reload (persisted, and session re-entered)', async () => {
    await page.reload({ waitUntil: 'load' });
    eq(await page.locator('h1').first().textContent(), 'Sign in', 'login screen:');
    await login(page, 'arun@demo.edu');
    await giveConsent(page);
    await go(page, '/task/rec/sub');
    truthy((await page.locator('.card').textContent()).includes('Your code'));
  });

  await check('mistake bank lists grouped mistakes with a retry path', async () => {
    // deliberately answer one practice question wrong so the bank is non-empty
    await go(page, '/prac');
    await page.locator('.card .lr', { hasText: 'Loops' }).getByRole('button', { name: 'Practice' }).click();
    await page.waitForTimeout(250);
    await playRun(page, 'wrong');
    await page.waitForTimeout(400);
    const s = await me(page);
    truthy(s.mist.length > 0, 'mistakes recorded');

    await go(page, '/mist');
    const body = await page.locator('body').textContent();
    truthy(body.includes('recurring mistake'), 'grouped by concept');
    truthy(await page.getByRole('button', { name: 'Practice My Mistakes' }).count(), 'practice-all offered');
  });

  await check('mistake detail shows the student answer and the correct one', async () => {
    await page.locator('details summary').first().click();
    await page.waitForTimeout(150);
    const body = await page.locator('body').textContent();
    truthy(body.includes('Your answer:'), 'shows student answer');
    truthy(body.includes('Correct answer:'), 'shows correct answer');
  });

  await check('retry of a single mistake resolves it when answered correctly', async () => {
    const before = (await me(page)).mist.length;
    await page.getByRole('button', { name: 'Retry' }).first().click();
    await page.waitForTimeout(250);
    await playRun(page, 'correct');
    await page.waitForTimeout(400);
    const after = (await me(page)).mist.length;
    eq(after, before - 1, `mistake cleared: ${before} -> ${after}`);
  });
};