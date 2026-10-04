const { BASE, check, eq, truthy, state, login, giveConsent, go } = require('./lib.cjs');

module.exports = async function p6(page) {
  console.log('\n== PHASE 6: admin CRUD and propagation ==');

  await check('admin login reaches the Admin dashboard', async () => {
    const out = page.getByRole('button', { name: 'Sign out' });
    if (await out.count()) await out.click();
    await page.waitForTimeout(200);
    await login(page, 'admin@demo.edu');
    await page.waitForTimeout(300);
    eq(await page.locator('h1').first().textContent(), 'Admin');
  });

  await check('admin dashboard counts match the real data', async () => {
    const s = await state(page);
    const met = page.locator('.mets .met');
    eq((await met.nth(0).textContent()).match(/\d+/)[0], String(s.concepts.length), 'concepts:');
    eq((await met.nth(1).textContent()).match(/\d+/)[0], String(s.qs.length), 'questions:');
    eq((await met.nth(3).textContent()).match(/\d+/)[0], String(s.tasks.length), 'applied tasks:');
  });

  await check('admin has no course search box (student-only control)', async () => {
    eq(await page.getByLabel('Search this course').count(), 0, 'search hidden for admin:');
  });

  await check('concept create validates and adds a concept', async () => {
    await go(page, '/acon');
    await page.getByRole('button', { name: 'Add concept', exact: true }).click();
    await page.waitForTimeout(200);
    let s = await state(page);
    eq(s.concepts.length, 15, 'nothing added on empty submit:');
    truthy((await page.locator('.toast').textContent()).includes('Enter a concept name'));

    await page.locator('#cn1').fill('Bit Manipulation');
    await page.locator('#cu').selectOption('2');
    await page.locator('#cp').selectOption('op');
    await page.getByRole('button', { name: 'Add concept', exact: true }).click();
    await page.waitForTimeout(300);
    s = await state(page);
    eq(s.concepts.length, 16, 'concept added:');
    const added = s.concepts[s.concepts.length - 1];
    eq(added.name, 'Bit Manipulation');
    eq(added.pre, 'op', 'prerequisite stored:');
    truthy((await page.locator('body').textContent()).includes('Bit Manipulation'), 'listed in the table');
  });

  await check('a concept in use cannot be deleted', async () => {
    const before = (await state(page)).concepts.length;
    await page.locator('tr', { hasText: 'Recursion' }).getByRole('button', { name: 'Delete' }).click();
    await page.waitForTimeout(250);
    const toast = await page.locator('.toast').textContent();
    truthy(toast.includes('Remove its questions'), `guard toast: ${toast}`);
    eq((await state(page)).concepts.length, before, 'no deletion:');
  });

  await check('an unused concept can be deleted', async () => {
    const before = (await state(page)).concepts.length;
    await page.locator('tr', { hasText: 'Bit Manipulation' }).getByRole('button', { name: 'Delete' }).click();
    await page.waitForTimeout(300);
    const s = await state(page);
    eq(s.concepts.length, before - 1, 'deleted:');
    truthy(!s.concepts.some((c) => c.name === 'Bit Manipulation'));
  });

  await check('a new concept reaches the student learning page', async () => {
    await go(page, '/acon');
    await page.locator('#cn1').fill('Bit Manipulation');
    await page.locator('#cu').selectOption('2');
    await page.getByRole('button', { name: 'Add concept', exact: true }).click();
    await page.waitForTimeout(250);
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForTimeout(200);
    await login(page, 'arun@demo.edu');
    await giveConsent(page);
    await go(page, '/learn');
    truthy((await page.locator('body').textContent()).includes('Bit Manipulation'), 'visible to the student');
  });

  await check('question create validates every field', async () => {
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForTimeout(200);
    await login(page, 'admin@demo.edu');
    await go(page, '/aq');
    await page.getByRole('button', { name: 'Add question', exact: true }).click();
    await page.waitForTimeout(200);
    truthy((await page.locator('.toast').textContent()).includes('Fill every field'));
    eq((await state(page)).qs.length, 51, 'nothing added:');
  });

  await check('question create adds a practice question for the chosen concept', async () => {
    const before = (await state(page)).qs.length;
    await page.locator('#qc').selectOption('str');
    await page.locator('#qt').fill('Which method joins a list of strings?');
    for (let i = 0; i < 4; i += 1) await page.locator('#o' + i).fill('Option ' + (i + 1));
    await page.locator('#qa').selectOption({ value: '1' });
    await page.locator('#qe').fill('API misuse');
    await page.locator('#qx').fill('Use join() rather than concatenating in a loop.');
    await page.locator('#qs').selectOption('2');
    await page.getByRole('button', { name: 'Add question', exact: true }).click();
    await page.waitForTimeout(300);
    const s = await state(page);
    eq(s.qs.length, before + 1, 'question added:');
    const q = s.qs[s.qs.length - 1];
    eq(q.c, 'str', 'concept stored:');
    eq(q.o.length, 4, 'four options:');
    eq(q.a, 1, 'correct index stored:');
  });

  await check('the new question joins that concept practice set', async () => {
    const before = await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('pathforge_v4'));
      return s.qs.filter((q) => q.c === 'str').length;
    });
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForTimeout(200);
    await login(page, 'arun@demo.edu');
    await giveConsent(page);
    await go(page, '/prac');
    await page.locator('.card .lr', { hasText: 'Strings' }).getByRole('button', { name: 'Practice' }).click();
    await page.waitForTimeout(300);
    const sub = await page.locator('.hd .mu').first().textContent();
    const total = Number(sub.match(/of (\d+)/)[1]);
    eq(total, before, `practice set grew to ${total}:`);
  });

  await check('question delete asks for confirmation and then removes it', async () => {
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForTimeout(200);
    await login(page, 'admin@demo.edu');
    await go(page, '/aq');
    const before = (await state(page)).qs.length;
    await page.locator('tr', { hasText: 'Which method joins a list of strings?' }).getByRole('button', { name: 'Delete' }).click();
    await page.waitForTimeout(250);
    truthy((await page.getByRole('dialog').count()) === 1, 'confirm dialog shown');
    await page.getByRole('dialog').getByRole('button', { name: 'Delete question' }).click();
    await page.waitForTimeout(300);
    eq((await state(page)).qs.length, before - 1, 'question removed:');
  });

  await check('cancelling the confirm dialog keeps the record', async () => {
    const before = (await state(page)).qs.length;
    await page.locator('tbody tr').first().getByRole('button', { name: 'Delete' }).click();
    await page.waitForTimeout(200);
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
    await page.waitForTimeout(250);
    eq((await state(page)).qs.length, before, 'nothing deleted:');
  });

  await check('user create validates email and duplicates', async () => {
    await go(page, '/ausers');
    await page.locator('#un').fill('Test Student');
    await page.locator('#ue').fill('not-an-email');
    await page.getByRole('button', { name: 'Add user', exact: true }).click();
    await page.waitForTimeout(200);
    truthy((await page.locator('.toast').textContent()).includes('valid email'));

    await page.locator('#ue').fill('arun@demo.edu');
    await page.getByRole('button', { name: 'Add user', exact: true }).click();
    await page.waitForTimeout(200);
    truthy((await page.locator('.toast').textContent()).includes('already exists'));
  });

  await check('user create adds an account that can sign in', async () => {
    await page.locator('#un').fill('Kavya Menon');
    await page.locator('#ue').fill('kavya@demo.edu');
    await page.getByRole('button', { name: 'Add user', exact: true }).click();
    await page.waitForTimeout(300);
    const s = await state(page);
    truthy(s.users.some((u) => u.e === 'kavya@demo.edu'), 'user stored:');
    truthy(s.mes['kavya@demo.edu'], 'student record provisioned:');

    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForTimeout(200);
    await login(page, 'kavya@demo.edu');
    await page.waitForTimeout(300);
    await giveConsent(page);
    await page.waitForTimeout(250);
    truthy((await page.locator('h1').first().textContent()).startsWith('Good '), 'new student can sign in');
    eq((await page.locator('.card.hero h2').textContent()), 'Take your diagnostic', 'starts with no data:');
  });

  await check('resource edits reach My Learning and Ask PathForge', async () => {
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForTimeout(200);
    await login(page, 'admin@demo.edu');
    await go(page, '/ares');
    // scope by the card's own heading: hasText alone also matches any card whose
    // notes happen to contain the word "strings"
    const card = page.locator('.card').filter({ has: page.getByRole('heading', { name: 'Strings', exact: true }) }).first();
    await card.locator('textarea').first().fill('QA-PROBE-MARKER strings notes.');
    await card.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(300);
    const s = await state(page);
    truthy(s.res.str.notes.includes('QA-PROBE-MARKER'), 'resource saved:');

    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForTimeout(200);
    await login(page, 'arun@demo.edu');
    await giveConsent(page);
    await go(page, '/learn');
    await page.locator('details summary', { hasText: 'Strings' }).first().click();
    await page.waitForTimeout(200);
    truthy((await page.locator('body').textContent()).includes('QA-PROBE-MARKER'), 'visible in My Learning');
  });

  await check('task edits save and reach the student task page', async () => {
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForTimeout(200);
    await login(page, 'admin@demo.edu');
    await go(page, '/atask');
    await page.locator('#tt').fill('Implement Recursive Factorial (QA)');
    await page.getByRole('button', { name: 'Save task' }).click();
    await page.waitForTimeout(300);
    const s = await state(page);
    eq(s.tasks[0].title, 'Implement Recursive Factorial (QA)', 'task saved:');

    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForTimeout(200);
    await login(page, 'arun@demo.edu');
    await giveConsent(page);
    await go(page, '/task/rec');
    truthy((await page.locator('.hd .mu').first().textContent()).includes('(QA)'), 'student sees the edit');
  });

  await check('reset demo data restores the seed', async () => {
    await go(page, '/prof');
    await page.getByRole('button', { name: 'Reset demo data' }).click();
    await page.waitForTimeout(250);
    await page.getByRole('dialog').getByRole('button', { name: 'Reset demo data' }).click();
    await page.waitForTimeout(400);
    const s = await state(page);
    eq(s.concepts.length, 15, 'concepts reset:');
    eq(s.qs.length, 51, 'questions reset:');
    eq(s.users.length, 3, 'users reset:');
    eq(await page.locator('h1').first().textContent(), 'Sign in', 'signed out after reset:');
  });
};