const { db } = require('../backend/database/db');

const rows = db.prepare("SELECT id, competency, question_text, correct_index, options_json FROM questions WHERE status = 'bank' LIMIT 12").all();

console.log('Sample 12 questions from SQLite:');
const letters = ['A', 'B', 'C', 'D'];
rows.forEach((q, i) => {
  const opts = JSON.parse(q.options_json);
  const letter = letters[q.correct_index];
  const ans = opts[q.correct_index] || '';
  console.log(`Q${i+1} [${letter}] (${q.correct_index}): "${ans.slice(0, 50)}..."`);
});

const counts = db.prepare("SELECT correct_index, COUNT(*) as c FROM questions WHERE status = 'bank' GROUP BY correct_index").all();
console.log('\nOverall Question Bank Distribution in DB:');
counts.forEach(row => {
  console.log(`Option ${letters[row.correct_index]} (index ${row.correct_index}): ${row.c} questions`);
});
