const { BASE, check, eq, truthy, state, me, login, giveConsent, playRun, go } = require('./lib.cjs');

module.exports = async function p2(page) {
  console.log('\n== PHASE 2: diagnostic (picker, run, scoring, gaps, prerequisites) ==');

  await check('dashboard CTA opens the subject/concept picker', async () => {
    await login(page, 'arun@demo.edu');
    await giveConsent(page);
    await page.getByRole('button', { name: /Start Diagnostic/ }).first().click();
    const dlg = page.getByRole('dialog');
    await dlg.waitFor();
    truthy((await dlg.textContent()).includes('Start your diagnostic'));
  });

  await check('picker lists every configured subject', async () => {
    const dlg = page.getByRole('dialog');
    for (const s of [
      'Programming Fundamentals',
      'Data Structures & Algorithms',
      'Object-Oriented Programming',
      'Database Management Systems',
      'Operating Systems',
      'Computer Networks',
    ]) {
      truthy((await dlg.textContent()).includes(s), `missing subject: ${s}`);
    }
  });

  await check('picker caps the whole-subject run at 14 questions', async () => {
    const dlg = page.getByRole('dialog');
    const whole = dlg.locator('label.pick-row').first();
    truthy((await whole.textContent()).includes('Whole subject'));
    truthy((await whole.textContent()).includes('14'), await whole.textContent());
  });

  await check('picker scopes to a single concept', async () => {
    const dlg = page.getByRole('dialog');
    await dlg.locator('label.pick-row', { hasText: 'Loops' }).first().click();
    const status = await dlg.locator('[role="status"]').textContent();
    truthy(/^2 questions in this run\./.test(status.trim()), `read: ${status}`);
    await dlg.getByRole('button', { name: 'Start Diagnostic' }).click();
    await page.waitForTimeout(250);
    const sub = await page.locator('.hd .mu').first().textContent();
    truthy(sub.includes('Question 1 of 2'), `run header: ${sub}`);
    truthy(sub.includes('Loops'), `concept shown: ${sub}`);
    // abandon the run without recording a result
    await go(page, '/diag');
    await page.waitForTimeout(250);
    const s = await me(page);
    eq(s.pre, null, 'abandoned run must not record a result:');
  });

  await check('Escape cancels the picker without starting a run', async () => {
    await go(page, '/diag');
    await page.getByRole('button', { name: /Start Diagnostic/ }).first().click();
    await page.getByRole('dialog').waitFor();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    eq(await page.getByRole('dialog').count(), 0, 'picker closed:');
  });

  await check('full diagnostic: answer all correct except Recursion', async () => {
    await go(page, '/diag');
    await page.getByRole('button', { name: /Start Diagnostic/ }).first().click();
    await page.getByRole('dialog').getByRole('button', { name: 'Start Diagnostic' }).click();
    await page.waitForTimeout(250);
    const sub = await page.locator('.hd .mu').first().textContent();
    truthy(sub.includes('Question 1 of 14'), `run length: ${sub}`);

    const seen = await playRun(page, 'x', { shouldFail: (i) => i.concept === 'rec' });
    eq(seen.length, 14, 'answered all questions:');
    await page.waitForTimeout(400);
  });

  await check('diagnostic stores per-concept scores and a timestamp', async () => {
    const s = await me(page);
    truthy(s.pre, 'pre record exists');
    eq(Object.keys(s.pre.scores).length, 14, 'concepts scored:');
    eq(s.pre.scores.rec, 0, 'Recursion was answered wrong:');
    truthy(s.pre.at, 'timestamp recorded');
    const others = Object.entries(s.pre.scores).filter(([k]) => k !== 'rec');
    truthy(
      others.every(([, v]) => v === 100),
      `every other concept answered correct: ${JSON.stringify(others)}`,
    );
  });

  await check('wrong answers land in the mistake bank with their concept', async () => {
    const s = await me(page);
    eq(s.mist.length, 1, `one mistake saved: ${JSON.stringify(s.mist)}`);
    const st = await state(page);
    const q = st.qs.find((x) => x.id === s.mist[0].id);
    eq(q.c, 'rec', 'mistake attached to Recursion:');
    truthy(s.mist[0].ch != null, 'student answer recorded');
  });

  await check('results page ranks the weakest concept first', async () => {
    await page.waitForTimeout(300);
    eq(await page.locator('h1').first().textContent(), 'Your Learning Gaps');
    const h3 = await page.locator('.card h3').first().textContent();
    truthy(h3.includes('Recursion'), `summary said: ${h3}`);
    const s = await me(page);
    eq(s.post, null, 'no reassessment yet:');
  });

  await check('diagnostic cannot be re-taken once a result exists', async () => {
    await go(page, '/diag');
    truthy((await page.locator('body').textContent()).includes('View results'));
  });

  await check('recovery plan targets Recursion when its prerequisite is strong', async () => {
    await go(page, '/recovery');
    const sub = await page.locator('.hd .mu').first().textContent();
    eq(sub, 'Recursion', 'recovery target:');
    const body = await page.locator('.card').first().textContent();
    truthy(!/is also a gap/.test(body), 'no prerequisite tip when Functions is strong');
  });

  await check('prerequisite rule: when Functions is also weak, the gap moves to it', async () => {
    // wipe the student record so a second run can be scripted
    await page.evaluate(() => {
      const k = 'pathforge_v4';
      const s = JSON.parse(localStorage.getItem(k));
      s.mes['arun@demo.edu'] = {
        consent: true, pre: null, post: null, und: {}, ex: {}, prac: {}, mist: [], act: [],
      };
      localStorage.setItem(k, JSON.stringify(s));
    });
    await page.reload({ waitUntil: 'load' });
    await login(page, 'arun@demo.edu');
    await giveConsent(page);
    await go(page, '/diag');
    await page.getByRole('button', { name: /Start Diagnostic/ }).first().click();
    await page.getByRole('dialog').getByRole('button', { name: 'Start Diagnostic' }).click();
    await page.waitForTimeout(250);
    await playRun(page, 'x', { shouldFail: (i) => i.concept === 'rec' || i.concept === 'fn' });
    await page.waitForTimeout(400);

    const s = await me(page);
    eq(s.pre.scores.fn, 0, 'Functions scored 0:');
    eq(s.pre.scores.rec, 0, 'Recursion scored 0:');

    await go(page, '/recovery');
    const sub = await page.locator('.hd .mu').first().textContent();
    eq(sub, 'Functions', 'gap walked down to the weak prerequisite:');
    const body = await page.locator('.card').first().textContent();
    truthy(body.includes('Prerequisite: Variables & Types'), `names the prerequisite: ${body}`);
    truthy(body.includes('(100%)'), 'and its strong score');
    // The "is also a gap" tip can never render: gap() walks the chain down
    // until the prerequisite is strong, so ps < 70 is unreachable. Recorded
    // here as dead UI, not a functional failure.
    truthy(!body.includes('is also a gap'), 'tip is unreachable dead UI (documented)');
  });

  await check('the prerequisite path reports Apply as not required (no task)', async () => {
    const body = await page.locator('.stp').textContent();
    truthy(body.includes('Not required for this concept'), 'Apply marked not applicable');
    truthy(body.includes('Applied task') || body.includes('Apply'), 'Apply step still listed');
  });

  await check('reassessment is offered for a gap that has no applied task', async () => {
    await go(page, '/recovery');
    const body = await page.locator('.stp').textContent();
    truthy(!/Unlocks after faculty verifies/.test(body), 'not locked when no task exists');
    await go(page, '/diag');
    truthy(
      (await page.locator('body').textContent()).includes('Start Reassessment'),
      'reassessment available without an applied task',
    );
  });
};