/* Shared helpers for the PathForge QA suites. */
const { chromium } = require('playwright');

const BASE = process.env.TARGET_URL || 'http://localhost:5200';
const KEY = 'pathforge_v4';

const results = { pass: [], fail: [] };

function ok(name, detail = '') {
  results.pass.push(name);
  console.log(`  PASS  ${name}${detail ? ' :: ' + detail : ''}`);
}
function bad(name, detail = '') {
  results.fail.push({ name, detail });
  console.log(`  FAIL  ${name}${detail ? ' :: ' + detail : ''}`);
}
async function check(name, fn) {
  try {
    const d = await fn();
    ok(name, typeof d === 'string' ? d : '');
  } catch (e) {
    bad(name, e.message.split('\n')[0]);
  }
}
function eq(actual, expected, msg) {
  if (actual !== expected)
    throw new Error(`${msg || ''} expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  return true;
}
function truthy(v, msg) {
  if (!v) throw new Error(msg || `expected truthy, got ${JSON.stringify(v)}`);
  return true;
}

const errors = [];
function watch(page, label) {
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${label}] console.error: ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`[${label}] pageerror: ${e.message}`));
  page.on('requestfailed', (r) => {
    const u = r.url();
    if (!u.startsWith('data:')) errors.push(`[${label}] requestfailed: ${u}`);
  });
  return page;
}

/** Wipe all persisted state so a suite starts from the seed. */
async function reset(page) {
  await page.goto(BASE, { waitUntil: 'load' });
  await page.evaluate((k) => localStorage.removeItem(k), KEY);
}

const state = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), KEY);
const me = async (page, email = 'arun@demo.edu') => {
  const s = await state(page);
  return s && s.mes ? s.mes[email] : null;
};

async function login(page, email, password = 'demo123') {
  await page.goto(BASE, { waitUntil: 'load' });
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

async function giveConsent(page) {
  const btn = page.getByRole('button', { name: 'Continue' });
  if (await btn.count()) {
    await page.getByRole('checkbox').check();
    await btn.click();
    await page.waitForTimeout(150);
  }
}

/** Read the current quiz question text and the correct option index. */
async function questionInfo(page) {
  const text = await page.locator('legend.qt').textContent();
  const s = await state(page);
  const q = s.qs.find((x) => x.t === text);
  return { text, correct: q ? q.a : null, concept: q ? q.c : null };
}

async function answer(page, mode, opts = {}) {
  const { text, correct } = await questionInfo(page);
  const labels = page.locator('label.op');
  const n = await labels.count();
  let idx;
  if (mode === 'correct') idx = correct;
  else if (mode === 'first') idx = 0;
  else if (mode === 'wrong') idx = (correct + 1) % n;
  else if (mode === 'concept') idx = opts.correctOn === text ? correct : (correct + 1) % n;
  await labels.nth(idx).click();
  return { text, correct, concept: opts.concept || null };
}

/** Walk a whole diagnostic/practice run, answering each question. */
async function playRun(page, mode, opts = {}) {
  const seen = [];
  for (let guard = 0; guard < 60; guard += 1) {
    const nextBtn = page.getByRole('button', { name: /^(Next|Submit|Finish)$/ });
    if (!(await nextBtn.count())) break;
    const info = await questionInfo(page);
    if (opts.onQuestion) await opts.onQuestion(info);
    const labels = page.locator('label.op');
    const n = await labels.count();
    let idx;
    if (mode === 'correct') idx = info.correct;
    else if (mode === 'first') idx = 0;
    else if (mode === 'wrong') idx = (info.correct + 1) % n;
    else idx = opts.shouldFail(info) ? (info.correct + 1) % n : info.correct;
    await labels.nth(idx).click();
    seen.push(info);
    if (await nextBtn.isDisabled()) break;
    await nextBtn.click();
    await page.waitForTimeout(60);
  }
  return seen;
}

/**
 * Navigate inside the hash router and wait for the new page to render.
 * A hash change fires no `load` event, so `goto` alone returns before the
 * route has painted — every assertion after it would race the router.
 */
async function go(page, hash, settle = 350) {
  await page.goto(BASE + '/#' + hash, { waitUntil: 'load' });
  await page.waitForTimeout(settle);
  return page;
}

async function launch(viewport = { width: 1440, height: 900 }) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport });
  return { browser, context, page: watch(await context.newPage(), 'app') };
}

module.exports = {
  BASE, KEY, results, errors, ok, bad, check, eq, truthy,
  reset, state, me, login, giveConsent, questionInfo, answer, playRun, launch, watch, go,
};