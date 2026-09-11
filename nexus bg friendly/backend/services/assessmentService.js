/* =====================================================================
   ASSESSMENT SERVICE
   All scoring math lives here. The frontend NEVER sends a score to the
   backend — it only sends which option the officer picked. This file
   is what you open to answer "where is the assessment scoring?".
===================================================================== */

const { db } = require('../database/db');
const config = require('../config/appConfig');

// gap = requiredScore - currentScore, classified using the thresholds
// in appConfig.js. This function is the ONLY place gap level is decided.
function classifyGap(currentScore, requiredScore) {
  const gap = requiredScore - currentScore;
  let level;
  if (gap >= config.HIGH_GAP_THRESHOLD) level = 'HIGH';
  else if (gap >= config.MEDIUM_GAP_THRESHOLD) level = 'MEDIUM';
  else level = 'LOW';
  return { gap, level };
}

// This function calculates the overall score for one finished
// assessment, based purely on stored responses (never trusts the client).
function calculateScore(assessmentId) {
  const responses = db.prepare('SELECT is_correct FROM responses WHERE assessment_id = ?').all(assessmentId);
  if (responses.length === 0) return 0;
  const correct = responses.filter(r => r.is_correct).length;
  return Math.round((correct / responses.length) * 100);
}

// Groups an assessment's responses by competency and computes a score
// per competency, then stores a new competency_scores row for each
// (so Progress can show real before/after history over time).
function calculateCompetencyScores(assessmentId, officerId) {
  const rows = db.prepare(`
    SELECT q.competency, r.is_correct
    FROM responses r
    JOIN questions q ON q.id = r.question_id
    WHERE r.assessment_id = ?
  `).all(assessmentId);

  const byCompetency = {};
  rows.forEach(r => {
    if (!byCompetency[r.competency]) byCompetency[r.competency] = { correct: 0, total: 0 };
    byCompetency[r.competency].total += 1;
    if (r.is_correct) byCompetency[r.competency].correct += 1;
  });

  const insertScore = db.prepare(`
    INSERT INTO competency_scores (officer_id, competency, score, required_score, gap_level, assessment_id)
    VALUES (?,?,?,?,?,?)
  `);
  const getRequired = db.prepare('SELECT required_score FROM competencies WHERE name = ?');

  const results = [];
  Object.entries(byCompetency).forEach(([competency, stat]) => {
    const score = Math.round((stat.correct / stat.total) * 100);
    const requiredRow = getRequired.get(competency);
    const required = requiredRow ? requiredRow.required_score : 80;
    const { gap, level } = classifyGap(score, required);
    insertScore.run(officerId, competency, score, required, level, assessmentId);
    results.push({ competency, score, required, gap, gapLevel: level });
  });
  return results;
}

// Returns the officer's latest known score per competency (most recent
// competency_scores row for each competency name).
function getLatestCompetencyScores(officerId) {
  return db.prepare(`
    SELECT cs.competency, cs.score, cs.required_score, cs.gap_level, cs.computed_at
    FROM competency_scores cs
    INNER JOIN (
      SELECT competency, MAX(computed_at) as maxDate
      FROM competency_scores WHERE officer_id = ?
      GROUP BY competency
    ) latest ON latest.competency = cs.competency AND latest.maxDate = cs.computed_at
    WHERE cs.officer_id = ?
  `).all(officerId, officerId);
}

// Full competency + gap history for the Progress page (before -> after).
function getCompetencyHistory(officerId, competency) {
  return db.prepare(`
    SELECT score, computed_at FROM competency_scores
    WHERE officer_id = ? AND competency = ?
    ORDER BY computed_at ASC
  `).all(officerId, competency);
}

// Identifies the officer's single weakest competency, then within it,
// the weakest sub-competency (by accuracy on past responses) — this is
// the "gap-focused reassessment" targeting logic.
function findWeakestFocus(officerId) {
  const scores = getLatestCompetencyScores(officerId);
  if (scores.length === 0) return null;
  const weakest = scores.reduce((a, b) => (b.required_score - b.score) > (a.required_score - a.score) ? b : a);

  const subRows = db.prepare(`
    SELECT q.sub_competency as sub, r.is_correct
    FROM responses r
    JOIN questions q ON q.id = r.question_id
    JOIN assessments a ON a.id = r.assessment_id
    WHERE a.officer_id = ? AND q.competency = ? AND q.sub_competency IS NOT NULL
  `).all(officerId, weakest.competency);

  let weakestSub = null;
  if (subRows.length) {
    const bySub = {};
    subRows.forEach(r => {
      if (!bySub[r.sub]) bySub[r.sub] = { correct: 0, total: 0 };
      bySub[r.sub].total += 1;
      if (r.is_correct) bySub[r.sub].correct += 1;
    });
    weakestSub = Object.entries(bySub)
      .map(([sub, s]) => ({ sub, accuracy: s.correct / s.total }))
      .sort((a, b) => a.accuracy - b.accuracy)[0].sub;
  }

  return { competency: weakest.competency, gap: weakest.required_score - weakest.score, subCompetency: weakestSub };
}

/* =====================================================================
   RULE-BASED ADAPTIVE ASSESSMENT
   Explicitly rule-based, not machine learning — see section 12 of the
   original project brief: never call this "AI" in the UI.
   Correct answer -> increase difficulty. Incorrect -> decrease/hold.
===================================================================== */
function nextDifficulty(currentDifficulty, wasCorrect) {
  const order = ['Easy', 'Medium', 'Hard'];
  const idx = order.indexOf(currentDifficulty);
  if (wasCorrect) return order[Math.min(idx + 1, order.length - 1)];
  return order[Math.max(idx - 1, 0)];
}

// Selects N questions for a diagnostic assessment, from the approved
// bank + approved AI-generated questions, favoring the officer's role
// competencies. Returns as many UNIQUE questions as the bank actually
// has, up to `count` — it never pads a short bank by repeating the
// same question multiple times in one assessment.
function selectQuestions(competencyList, count, difficulty) {
  const placeholders = competencyList.map(() => '?').join(',');
  const pool = db.prepare(`
    SELECT * FROM questions
    WHERE competency IN (${placeholders}) AND status IN ('bank','approved')
  `).all(...competencyList);

  if (pool.length === 0) return [];

  // Prefer requested difficulty first, then fill from the rest.
  const preferred = shuffle(pool.filter(q => q.difficulty === difficulty));
  const rest = shuffle(pool.filter(q => q.difficulty !== difficulty));
  const ordered = [...preferred, ...rest];

  return ordered.slice(0, count);
}

// Selects a small, targeted set of questions for reassessment: only
// from the weak competency (and weak sub-competency when known).
// Prefers exact sub-competency matches, then fills any remaining slots
// from the wider competency pool — but never repeats the same question
// within one attempt just to hit the target count. If the bank
// genuinely doesn't have enough distinct questions for this gap, the
// attempt is honestly shorter rather than padded with duplicates.
function selectReassessmentQuestions(competency, subCompetency, count) {
  let subPool = [];
  if (subCompetency) {
    subPool = db.prepare(`SELECT * FROM questions WHERE competency = ? AND sub_competency = ? AND status IN ('bank','approved')`)
      .all(competency, subCompetency);
  }
  const compPool = db.prepare(`SELECT * FROM questions WHERE competency = ? AND status IN ('bank','approved')`).all(competency);

  const seen = new Set();
  const merged = [...shuffle(subPool), ...shuffle(compPool)].filter(q => {
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });

  return merged.slice(0, count);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

module.exports = {
  classifyGap,
  calculateScore,
  calculateCompetencyScores,
  getLatestCompetencyScores,
  getCompetencyHistory,
  findWeakestFocus,
  nextDifficulty,
  selectQuestions,
  selectReassessmentQuestions,
};
