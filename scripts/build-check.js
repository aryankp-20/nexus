/* =====================================================================
   BUILD CHECK
   This project has no bundler/compiler step (plain Express backend +
   vanilla ES-module frontend), so "npm run build" is a fast sanity
   check instead of a real compile: it syntax-checks every backend and
   frontend JS file, confirms the reference data modules load without
   throwing, and confirms the DB schema file is present. It never binds
   a port or touches the database file, so it's safe to run in any CI /
   Vercel build environment.
===================================================================== */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let failed = false;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.js')) out.push(full);
  }
  return out;
}

console.log('[build] Syntax-checking all backend + frontend JS files...');
const jsFiles = [
  ...walk(path.join(ROOT, 'backend')),
  ...walk(path.join(ROOT, 'frontend', 'js')),
  ...walk(path.join(ROOT, 'data')),
  ...walk(path.join(ROOT, 'api')),
];

for (const file of jsFiles) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (err) {
    failed = true;
    console.error(`[build] SYNTAX ERROR in ${path.relative(ROOT, file)}:`);
    console.error(err.stderr ? err.stderr.toString() : err.message);
  }
}
console.log(`[build] Checked ${jsFiles.length} JS files.`);

console.log('[build] Loading reference data modules...');
try {
  require(path.join(ROOT, 'data', 'roles.js'));
  require(path.join(ROOT, 'data', 'competencies.js'));
  require(path.join(ROOT, 'data', 'courses.js'));
  require(path.join(ROOT, 'data', 'demoData.js'));
  console.log('[build] Reference data modules loaded OK.');
} catch (err) {
  failed = true;
  console.error('[build] FAILED to load reference data modules:', err.message);
}

console.log('[build] Checking required files exist...');
const requiredFiles = [
  'backend/database/schema.sql',
  'backend/server.js',
  'api/index.js',
  'frontend/index.html',
];
for (const rel of requiredFiles) {
  if (!fs.existsSync(path.join(ROOT, rel))) {
    failed = true;
    console.error(`[build] MISSING required file: ${rel}`);
  }
}

if (failed) {
  console.error('\n[build] BUILD CHECK FAILED.');
  process.exit(1);
}
console.log('\n[build] Build check passed.');
