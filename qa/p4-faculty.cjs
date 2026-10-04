const { BASE, check, eq, truthy, state, login, giveConsent, go } = require('./lib.cjs');

module.exports = async function p4(page) {
  console.log('\n== PHASE 4: faculty workflow ==');

  await check('logout from student then faculty login reaches Class Overview', async () => {
    const out = page.getByRole('button', { name: 'Sign out' });
    if (await out.count()) await out.click();
    else await page.goto(BASE, { waitUntil: 'load' });
    await page.waitForTimeout(200);
    await login(page, 'meena@demo.edu');
    await page.waitForTimeout(300);
    eq(await page.locator('h1').first().textContent(), 'Class Overview');
  });

  await check('faculty dashboard counts the student submission as pending', async () => {
    const s = await state(page);
    const pending = s.subs.filter((x) => x.status === 'pending').length;
    const metric = await page.locator('.mets .met', { hasText: 'Pending Reviews' }).textContent();
    truthy(metric.includes(String(pending)), `expected ${pending} pending, read: ${metric}`);
  });

  await check('faculty cannot start a student diagnostic (no student CTA on their nav)', async () => {
    const nav = await page.locator('aside').textContent();
    truthy(!nav.includes('Recovery Plans'), 'student-only nav absent');
    truthy(nav.includes('Submissions'), 'faculty nav present');
  });

  await check('submissions list shows both demo and live student work', async () => {
    await go(page, '/subs');
    const body = await page.locator('.tw').textContent();
    truthy(body.includes('Arun Kumar'), 'live student listed');
    truthy(body.includes('Divya Nair'), 'demo student listed');
  });

  await check('opening a review shows the student code and the rubric', async () => {
    await go(page, '/subs');
    const row = page.locator('tr', { hasText: 'Arun Kumar' });
    await row.getByRole('button').click();
    await page.waitForTimeout(300);
    const body = await page.locator('body').textContent();
    truthy(body.includes('def factorial'), 'student code shown');
    truthy(body.includes('Rubric total'), 'rubric total shown');
    eq(await page.locator('.total-line b').textContent(), '0', 'starts at zero:');
  });

  await check('verification below the 9/16 threshold is rejected', async () => {
    for (const i of [0, 1]) await page.locator('#r' + i).selectOption('2');
    await page.waitForTimeout(100);
    eq(await page.locator('.total-line b').textContent(), '4', 'total updates:');
    await page.getByRole('button', { name: 'Verify competency' }).click();
    await page.waitForTimeout(250);
    const toast = await page.locator('.toast').textContent();
    truthy(toast.includes('below 9/16'), `threshold toast: ${toast}`);
    const s = await state(page);
    eq(s.subs.find((x) => x.uid === 'arun@demo.edu').status, 'pending', 'still pending:');
  });

  await check('a valid rubric verifies the submission and notifies the student', async () => {
    for (const i of [0, 1, 2, 3]) await page.locator('#r' + i).selectOption('3');
    await page.locator('#fb').fill('Correct base case and a clear trace.');
    eq(await page.locator('.total-line b').textContent(), '12', 'total recalculates:');
    await page.getByRole('button', { name: 'Verify competency' }).click();
    await page.waitForTimeout(350);
    const s = await state(page);
    const sub = s.subs.find((x) => x.uid === 'arun@demo.edu');
    eq(sub.status, 'verified', 'status verified:');
    eq(sub.by, 'Dr. Meena Rao', 'reviewer recorded:');
    truthy(sub.at, 'verification timestamp recorded');
    const note = s.notes.find((n) => n.to === 'arun@demo.edu' && /verified/i.test(n.t));
    truthy(note, 'student notification created');
  });

  await check('a verified submission is locked from further edits', async () => {
    await go(page, '/subs');
    await page.locator('tr', { hasText: 'Arun Kumar' }).getByRole('button').click();
    await page.waitForTimeout(250);
    const body = await page.locator('body').textContent();
    truthy(body.includes('Verified by Dr. Meena Rao'), 'shows who verified');
    eq(await page.getByRole('button', { name: 'Verify competency' }).count(), 0, 'no verify button:');
    eq(await page.getByRole('button', { name: 'Request revision' }).count(), 0, 'no revision button:');
    eq(await page.locator('#fb').isDisabled(), true, 'feedback locked:');
  });

  await check('requesting a revision requires feedback', async () => {
    await go(page, '/subs');
    await page.locator('tr', { hasText: 'Harini Iyer' }).getByRole('button').click();
    await page.waitForTimeout(250);
    await page.getByRole('button', { name: 'Request revision' }).click();
    await page.waitForTimeout(250);
    const toast = await page.locator('.toast').textContent();
    truthy(toast.includes('Add feedback'), `validation toast: ${toast}`);
    const s = await state(page);
    eq(s.subs.find((x) => x.who === 'Harini Iyer').status, 'pending', 'unchanged:');
  });

  await check('revision with feedback moves the submission to revise', async () => {
    await page.locator('#fb').fill('Your base case is missing — add the n == 0 check.');
    await page.getByRole('button', { name: 'Request revision' }).click();
    await page.waitForTimeout(350);
    const s = await state(page);
    eq(s.subs.find((x) => x.who === 'Harini Iyer').status, 'revise', 'status revise:');
  });

  await check('class insights heatmap renders assessed students', async () => {
    await go(page, '/insights');
    eq(await page.locator('h1').first().textContent(), 'Class Insights');
    truthy((await page.locator('table').textContent()).includes('Arun Kumar'), 'live student in heatmap');
  });

  await check('student detail deep link resolves the live student', async () => {
    await go(page, '/stu/' + encodeURIComponent('Arun Kumar'));
    eq(await page.locator('h1').first().textContent(), 'Arun Kumar');
    const body = await page.locator('body').textContent();
    truthy(body.includes('What this learner needs next'), 'next-step section present');
  });

  await check('unknown student deep link shows an empty state, not a crash', async () => {
    await go(page, '/stu/Nobody%20Here');
    truthy((await page.locator('body').textContent()).includes('Student not found'));
  });

  await check('competencies band counts match the underlying score maps', async () => {
    await go(page, '/comp');
    const rows = page.locator('tbody tr');
    truthy((await rows.count()) >= 15, 'one row per concept');

    const s = await state(page);
    const live = s.mes['arun@demo.edu'];
    // roster rows carry flat score maps; a live student's record nests them
    // under .scores, which is exactly what rost() flattens for the app.
    const all = s.roster.map((r) => ({ pre: r.pre, post: r.post }));
    if (live.pre) all.push({ pre: live.pre.scores, post: live.post && live.post.scores });
    const recRow = rows.filter({ hasText: 'Recursion' }).first();
    const cells = (await recRow.locator('td').allTextContents()).map((t) => t.trim());
    const scores = all.map((r) => (r.post || r.pre).rec).filter((v) => v != null);
    const need = scores.filter((v) => v < 60).length;
    const learning = scores.filter((v) => v >= 60 && v < 80).length;
    const practiced = scores.filter((v) => v >= 80).length;
    eq(cells[1], String(need), `Needs Practice column: ${JSON.stringify(cells.slice(0, 5))}`);
    eq(cells[2], String(learning), 'Learning column:');
    eq(cells[3], String(practiced), 'Practiced+ column:');
    truthy(need + learning + practiced > 0, 'bands are populated, not all zero');
  });

  await check('analytics renders before/after for reassessed students', async () => {
    await go(page, '/anal');
    const body = await page.locator('body').textContent();
    truthy(body.includes('Improvement by concept'), 'analytics section rendered');
  });

  await check('faculty task list shows rubrics', async () => {
    await go(page, '/ftasks');
    const body = await page.locator('body').textContent();
    truthy(body.includes('Implement Recursive Factorial'));
    truthy(body.includes('Array Statistics Analyzer'));
  });
};