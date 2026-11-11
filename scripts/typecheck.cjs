// Type-checks our code strictly. Vendored Twenty sources (src/vendor/twenty) are checked transitively
// because our adapter imports them, but they target a different toolchain (icon/typing versions), so
// diagnostics located INSIDE that folder are reported as a count and do not fail the build.
const { spawnSync } = require('node:child_process');
const r = spawnSync('npx', ['tsc', '-p', 'tsconfig.app.json', '--noEmit', '--pretty', 'false'], { encoding: 'utf8' });
const lines = (r.stdout + r.stderr).split('\n').filter(l => /error TS\d+/.test(l));
const vendor = lines.filter(l => l.startsWith('src/vendor/twenty/'));
const ours = lines.filter(l => !l.startsWith('src/vendor/twenty/'));
ours.forEach(l => console.error(l));
if (vendor.length) console.log(`(ignored ${vendor.length} type diagnostics inside vendored src/vendor/twenty)`);
if (ours.length) { console.error(`${ours.length} type error(s)`); process.exit(1); }
console.log('typecheck ok');
