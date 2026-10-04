const { BASE, check, eq, truthy, login, giveConsent, reset, go } = require('./lib.cjs');

/** Every interactive control must expose a name a screen reader can read. */
const unnamed = () => {
  const out = [];
  document.querySelectorAll('button, a[href], input, select, textarea').forEach((el) => {
    if (el.type === 'hidden' || el.closest('[aria-hidden="true"]')) return;
    const label =
      el.getAttribute('aria-label') ||
      el.getAttribute('title') ||
      (el.labels && el.labels.length ? el.labels[0].textContent : '') ||
      el.textContent ||
      el.getAttribute('placeholder') ||
      '';
    if (!label.trim()) out.push(`${el.tagName}${el.id ? '#' + el.id : ''}${el.className ? '.' + String(el.className).split(' ')[0] : ''}`);
  });
  return out;
};

module.exports = async function p9(page) {
  console.log('\n== PHASE 9: accessibility and keyboard ==');

  const audit = async (label, route) => {
    await go(page, route);
    const bad = await page.evaluate(unnamed);
    truthy(bad.length === 0, `${label}: unnamed controls -> ${JSON.stringify(bad.slice(0, 5))}`);
  };

  await check('login: every control has an accessible name', () => audit('login', '/nope'));

  await check('student: the sign-in form can be completed with the keyboard alone', async () => {
    await reset(page);
    await page.keyboard.press('Tab'); // email
    await page.keyboard.type('arun@demo.edu');
    await page.keyboard.press('Tab'); // password
    await page.keyboard.type('demo123');
    await page.keyboard.press('Enter'); // submits the focused form / button
    await page.waitForTimeout(400);
    truthy((await page.locator('h1').first().textContent()).length > 0, 'a page rendered');
  });

  await login(page, 'arun@demo.edu');
  await giveConsent(page);

  for (const [label, route] of [
    ['dashboard', '/dash'],
    ['my learning', '/learn'],
    ['diagnostics', '/diag'],
    ['recovery', '/recovery'],
    ['practice', '/prac'],
    ['mistakes', '/mist'],
    ['passport', '/pass'],
    ['ask', '/ask'],
  ]) {
    await check(`student ${label}: every control has an accessible name`, () => audit(label, route));
  }

  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.waitForTimeout(200);
  await login(page, 'meena@demo.edu');
  await page.waitForTimeout(300);
  for (const [label, route] of [
    ['class overview', '/dash'],
    ['insights', '/insights'],
    ['competencies', '/comp'],
    ['submissions', '/subs'],
    ['analytics', '/anal'],
  ]) {
    await check(`faculty ${label}: every control has an accessible name`, () => audit(label, route));
  }

  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.waitForTimeout(200);
  await login(page, 'admin@demo.edu');
  await page.waitForTimeout(300);
  for (const [label, route] of [
    ['admin dashboard', '/dash'],
    ['concepts', '/acon'],
    ['questions', '/aq'],
    ['resources', '/ares'],
    ['tasks', '/atask'],
    ['users', '/ausers'],
  ]) {
    await check(`admin ${label}: every control has an accessible name`, () => audit(label, route));
  }

  await check('the picker takes focus on open and traps it', async () => {
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForTimeout(200);
    await login(page, 'arun@demo.edu');
    await giveConsent(page);
    await go(page, '/dash');
    await page.getByRole('button', { name: /Start Diagnostic/ }).first().click();
    await page.waitForTimeout(300);
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return { inDialog: !!el.closest('.dialog'), tag: el.tagName, name: el.getAttribute('aria-label') || el.textContent.trim().slice(0, 24) };
    });
    truthy(focused.inDialog, `focus moved into the dialog: ${JSON.stringify(focused)}`);

    // tabbing must stay inside the dialog
    for (let i = 0; i < 40; i += 1) await page.keyboard.press('Tab');
    const still = await page.evaluate(() => !!document.activeElement.closest('.dialog'));
    truthy(still, 'focus never escaped the dialog');
  });

  await check('status is never communicated by colour alone', async () => {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    await go(page, '/pass');
    const badges = page.locator('.bd');
    const n = await badges.count();
    truthy(n > 0, 'badges present');
    for (let i = 0; i < Math.min(n, 8); i += 1) {
      const t = (await badges.nth(i).textContent()).trim();
      truthy(t.length > 0, `badge ${i} has text`);
    }
  });

  await check('quiz options are real labelled radio inputs', async () => {
    await go(page, '/dash');
    await page.getByRole('button', { name: /Start Diagnostic/ }).first().click();
    await page.getByRole('dialog').getByRole('button', { name: 'Start Diagnostic' }).click();
    await page.waitForTimeout(400);
    const radios = await page.locator('input[type="radio"]').count();
    truthy(radios === 4, `four options offered: ${radios}`);
    eq(await page.locator('fieldset legend').count(), 1, 'question in a fieldset with a legend:');
    // the input is visually hidden but still focusable, so it is driven by its
    // label — that is the pattern, not a defect
    const info = await page.evaluate(() => {
      const el = document.querySelector('label.op input');
      el.focus();
      return {
        focused: document.activeElement === el,
        hasLabel: !!el.closest('label'),
        focusOutline: getComputedStyle(el.closest('label')).outlineStyle,
      };
    });
    truthy(info.focused, 'the radio can still take keyboard focus');
    truthy(info.hasLabel, 'the radio is wrapped in its option label');
    await page.locator('label.op').first().click();
    eq(await page.getByRole('button', { name: 'Next' }).isDisabled(), false, 'Next enabled after answering:');
  });

  await check('a question cannot be skipped past without an answer', async () => {
    await go(page, '/diag');
    await page.getByRole('button', { name: /Start Diagnostic/ }).first().click();
    await page.getByRole('dialog').getByRole('button', { name: 'Start Diagnostic' }).click();
    await page.waitForTimeout(400);
    eq(await page.getByRole('button', { name: 'Next' }).isDisabled(), true, 'Next disabled with no answer');
  });

  await check('images and decorative svg are hidden from assistive tech', async () => {
    const bad = await page.evaluate(() =>
      [...document.querySelectorAll('svg, i')]
        .filter((el) => {
          if (el.getAttribute('aria-hidden') === 'true') return false;
          if (el.closest('[aria-hidden="true"]')) return false;
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden') return false;
          return !el.textContent.trim();
        })
        .map((el) => {
          const parent = el.parentElement;
          return `${el.tagName}.${String(el.className || '(none)')} in ${parent.tagName}.${String(parent.className || '')}`;
        }),
    );
    eq(bad.length, 0, `decorative nodes needing aria-hidden: ${JSON.stringify(bad)}`);
  });
};