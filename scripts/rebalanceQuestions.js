const fs = require('fs');
const path = require('path');
const { db } = require('../backend/database/db');
const demoData = require('../data/demoData');

const officers = demoData.OFFICERS;
const questions = demoData.QUESTION_BANK;
const reports = demoData.REPORTS;

// 1. Rebalance options so correct answers are evenly spread across A (0), B (1), C (2), D (3)
const updatedQuestions = questions.map((q, idx) => {
  const target = idx % 4;
  const correctText = q.opts[q.correct];
  const newOpts = [...q.opts];
  const temp = newOpts[target];
  newOpts[target] = correctText;
  newOpts[q.correct] = temp;

  if (newOpts[target] !== correctText) {
    throw new Error(`Integrity check failed for question ${idx}: ${q.q}`);
  }

  return {
    comp: q.comp,
    sub: q.sub || '',
    diff: q.diff,
    q: q.q,
    opts: newOpts,
    correct: target,
    explanation: q.explanation || ''
  };
});

// Group by competency to write nicely formatted file
const codeLines = [];
codeLines.push('/* =====================================================================');
codeLines.push('   DEMO DATA — clearly marked demo/seed data');
codeLines.push('   Used only by backend/database/seed.js to populate the database on');
codeLines.push('   first run, so the hackathon demo has realistic-looking records.');
codeLines.push('===================================================================== */\n');

codeLines.push('// Demo officer accounts. Password for every demo account is "demo1234".');
codeLines.push('const OFFICERS = ' + JSON.stringify(officers, null, 2) + ';\n');

codeLines.push('// =====================================================================');
codeLines.push('// QUESTION BANK — verified correct answers distributed across A, B, C, D');
codeLines.push('// Covers all 10 competency areas: Survey Methodology, Sampling, CAPI,');
codeLines.push('// Field Procedures, Field Protocols, Supervision, Statistical Analysis,');
codeLines.push('// Sampling Algorithms, Data Interpretation, Data Processing.');
codeLines.push('// correct: 0-based index of the correct option in opts[] (0=A, 1=B, 2=C, 3=D)');
codeLines.push('// =====================================================================');
codeLines.push('const QUESTION_BANK = [');

let currentComp = '';
updatedQuestions.forEach((q, i) => {
  if (q.comp !== currentComp) {
    currentComp = q.comp;
    codeLines.push(`\n  // ─────────────────── ${currentComp.toUpperCase()} ───────────────────`);
  }
  codeLines.push('  {');
  codeLines.push(`    comp: ${JSON.stringify(q.comp)}, sub: ${JSON.stringify(q.sub)}, diff: ${JSON.stringify(q.diff)},`);
  codeLines.push(`    q: ${JSON.stringify(q.q)},`);
  codeLines.push(`    opts: ${JSON.stringify(q.opts)},`);
  codeLines.push(`    correct: ${q.correct},`);
  codeLines.push(`    explanation: ${JSON.stringify(q.explanation)}`);
  codeLines.push('  },');
});

codeLines.push('];\n');
codeLines.push('// Report definitions shown on the Reports page.');
codeLines.push('const REPORTS = ' + JSON.stringify(reports, null, 2) + ';\n');
codeLines.push('module.exports = { OFFICERS, QUESTION_BANK, REPORTS };\n');

const demoDataPath = path.join(__dirname, '..', 'data', 'demoData.js');
fs.writeFileSync(demoDataPath, codeLines.join('\n'), 'utf8');
console.log('Successfully updated data/demoData.js with balanced questions.');

// 2. Update database records in questions table
const updateStmt = db.prepare(`
  UPDATE questions
  SET options_json = ?, correct_index = ?
  WHERE question_text = ?
`);

const updateTx = db.transaction(() => {
  let updatedCount = 0;
  updatedQuestions.forEach(q => {
    const res = updateStmt.run(JSON.stringify(q.opts), q.correct, q.q);
    if (res.changes > 0) updatedCount++;
  });
  console.log(`Updated ${updatedCount} existing questions in data.sqlite.`);
});

updateTx();

// 3. Verify counts in SQLite
const dbCounts = db.prepare('SELECT correct_index, COUNT(*) as cnt FROM questions GROUP BY correct_index').all();
console.log('Database questions distribution:');
console.log(dbCounts);
