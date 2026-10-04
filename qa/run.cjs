const { launch, results, errors } = require('./lib.cjs');
const p1 = require('./p1-auth.cjs');
const p2 = require('./p2-diagnostic.cjs');
const p3 = require('./p3-recovery.cjs');
const p4 = require('./p4-faculty.cjs');
const p5 = require('./p5-reassess.cjs');
const p6 = require('./p6-admin.cjs');
const p7 = require('./p7-negative.cjs');
const p8 = require('./p8-responsive.cjs');
const p9 = require('./p9-a11y.cjs');

const PHASES = { p1, p2, p3, p4, p5, p6, p7, p8, p9 };

(async () => {
  // `node run.cjs` runs every phase in order; `node run.cjs p3,p4` runs a chain,
  // which matters because later phases depend on the state earlier ones build.
  const only = process.argv[2] ? process.argv[2].split(',').map((s) => s.trim()) : null;
  const { browser, page } = await launch();
  try {
    for (const [name, fn] of Object.entries(PHASES)) {
      if (only && !only.some((o) => name.includes(o))) continue;
      await fn(page);
    }
  } catch (e) {
    console.log(`\n!! PHASE ABORTED: ${e.message}`);
    results.fail.push({ name: 'phase aborted', detail: e.message });
  } finally {
    console.log('\n== CONSOLE / PAGE ERRORS ==');
    if (!errors.length) console.log('  none');
    [...new Set(errors)].forEach((e) => console.log('  ' + e));

    console.log('\n== SUMMARY ==');
    console.log(`  passed: ${results.pass.length}`);
    console.log(`  failed: ${results.fail.length}`);
    results.fail.forEach((f) => console.log(`   - ${f.name} :: ${f.detail}`));
    await browser.close();
    process.exit(results.fail.length ? 1 : 0);
  }
})();