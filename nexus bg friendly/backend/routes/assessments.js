/* =====================================================================
   ASSESSMENT ROUTES
   POST /api/assessments                 -> start a diagnostic assessment
   POST /api/assessments/:id/responses   -> submit one answer, get feedback
   POST /api/assessments/:id/submit      -> finalize, backend computes score
   GET  /api/assessments/:id/result      -> full result breakdown
   GET  /api/assessments/focus           -> officer's current weakest gap
   POST /api/assessments/ai-targeted     -> LIVE RAG+LLM targeted assessment
   POST /api/assessments/reassessment    -> bank-based fallback reassessment
===================================================================== */

const express = require('express');
const { db } = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const assessmentService = require('../services/assessmentService');
const questionGenerationService = require('../services/questionGenerationService');
const config = require('../config/appConfig');

const router = express.Router();

function questionForClient(q) {
  // Never send the correct answer to the client before it's answered.
  return { id: q.id, competency: q.competency, subCompetency: q.sub_competency, difficulty: q.difficulty, question: q.question_text, options: JSON.parse(q.options_json) };
}

// ===== START DIAGNOSTIC ASSESSMENT =====
router.post('/', requireAuth, (req, res) => {
  const roleComps = db.prepare('SELECT competency_name FROM role_competencies WHERE role_id = ?')
    .all(req.officer.roleId).map(r => r.competency_name);

  const questions = assessmentService.selectQuestions(roleComps, config.NUMBER_OF_ASSESSMENT_QUESTIONS, config.DEFAULT_DIFFICULTY);
  if (questions.length === 0) return res.status(400).json({ error: 'No questions available for your role yet.' });

  const insertAssessment = db.prepare(`INSERT INTO assessments (officer_id, type, difficulty, status) VALUES (?, 'diagnostic', ?, 'in_progress')`);
  const result = insertAssessment.run(req.officer.id, config.DEFAULT_DIFFICULTY);
  const assessmentId = result.lastInsertRowid;

  const insertAQ = db.prepare('INSERT INTO assessment_questions (assessment_id, question_id, position) VALUES (?,?,?)');
  questions.forEach((q, i) => insertAQ.run(assessmentId, q.id, i));

  res.json({
    assessmentId,
    difficulty: config.DEFAULT_DIFFICULTY,
    totalQuestions: questions.length,
    questions: questions.map(questionForClient),
  });
});

// ===== SUBMIT ONE ANSWER (adaptive difficulty feedback) =====
router.post('/:id/responses', requireAuth, (req, res) => {
  const assessmentId = Number(req.params.id);
  const { questionId, selectedIndex } = req.body || {};
  const assessment = db.prepare('SELECT * FROM assessments WHERE id = ? AND officer_id = ?').get(assessmentId, req.officer.id);
  if (!assessment) return res.status(404).json({ error: 'Assessment not found.' });

  const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(questionId);
  if (!question) return res.status(404).json({ error: 'Question not found.' });

  const isCorrect = Number(selectedIndex) === question.correct_index;
  db.prepare('INSERT INTO responses (assessment_id, question_id, selected_index, is_correct) VALUES (?,?,?,?)')
    .run(assessmentId, questionId, selectedIndex, isCorrect ? 1 : 0);

  const newDifficulty = assessmentService.nextDifficulty(assessment.difficulty, isCorrect);
  db.prepare('UPDATE assessments SET difficulty = ? WHERE id = ?').run(newDifficulty, assessmentId);

  res.json({
    isCorrect,
    correctIndex: question.correct_index,
    explanation: question.explanation,
    newDifficulty,
    adaptiveMethod: 'RULE-BASED ADAPTIVE ASSESSMENT', // never call this an AI model — it isn't one
  });
});

// ===== FINALIZE ASSESSMENT (backend computes the real score) =====
router.post('/:id/submit', requireAuth, (req, res) => {
  const assessmentId = Number(req.params.id);
  const assessment = db.prepare('SELECT * FROM assessments WHERE id = ? AND officer_id = ?').get(assessmentId, req.officer.id);
  if (!assessment) return res.status(404).json({ error: 'Assessment not found.' });

  // Capture each affected competency's most recent PRIOR score before we
  // write the new one, so reassessment/AI attempts can show a real
  // before -> after comparison (never invented).
  const affectedCompetencies = [...new Set(
    db.prepare(`SELECT q.competency FROM responses r JOIN questions q ON q.id = r.question_id WHERE r.assessment_id = ?`).all(assessmentId).map(r => r.competency)
  )];
  const previousScores = {};
  affectedCompetencies.forEach(comp => {
    const prior = db.prepare(`SELECT score FROM competency_scores WHERE officer_id = ? AND competency = ? ORDER BY computed_at DESC LIMIT 1`).get(req.officer.id, comp);
    if (prior) previousScores[comp] = prior.score;
  });

  const score = assessmentService.calculateScore(assessmentId);
  const competencyResults = assessmentService.calculateCompetencyScores(assessmentId, req.officer.id);

  db.prepare(`UPDATE assessments SET status = 'completed', score = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .run(score, assessmentId);

  const resultsWithComparison = competencyResults.map(c => ({
    ...c,
    previousScore: previousScores[c.competency] !== undefined ? previousScores[c.competency] : null,
    improvement: previousScores[c.competency] !== undefined ? c.score - previousScores[c.competency] : null,
  }));

  res.json({
    assessmentId, type: assessment.type, score, passed: score >= config.PASSING_SCORE, passingScore: config.PASSING_SCORE,
    competencyResults: resultsWithComparison,
  });
});

// ===== RESULT =====
router.get('/:id/result', requireAuth, (req, res) => {
  const assessmentId = Number(req.params.id);
  const assessment = db.prepare('SELECT * FROM assessments WHERE id = ? AND officer_id = ?').get(assessmentId, req.officer.id);
  if (!assessment) return res.status(404).json({ error: 'Assessment not found.' });

  const results = db.prepare(`
    SELECT competency, score, required_score, gap_level FROM competency_scores
    WHERE assessment_id = ?
  `).all(assessmentId);

  res.json({ assessmentId, type: assessment.type, score: assessment.score, competencyResults: results });
});

// ===== HISTORY (for Profile / Progress pages) =====
router.get('/', requireAuth, (req, res) => {
  const history = db.prepare(`
    SELECT id, type, competency_filter, score, started_at, completed_at, status
    FROM assessments WHERE officer_id = ? ORDER BY started_at DESC
  `).all(req.officer.id);
  res.json({ history });
});

// ===== CURRENT GAP FOCUS (what a targeted AI assessment would target, and why) =====
router.get('/focus', requireAuth, (req, res) => {
  const focus = assessmentService.findWeakestFocus(req.officer.id);
  if (!focus) return res.json({ hasFocus: false });
  res.json({ hasFocus: true, ...focus });
});

// ===== TARGETED AI ASSESSMENT (learner-facing, LIVE RAG + LLM generation) =====
// This is the real "AI assessment": it finds the officer's own weakest
// competency/sub-competency from their actual diagnostic results, then
// runs the live RAG pipeline (retrieval + LLM) to generate a small set
// of source-grounded questions for exactly that gap. If retrieval finds
// nothing indexed, or no LLM key is configured, it returns an honest
// status instead of silently substituting bank/random questions.
router.post('/ai-targeted', requireAuth, async (req, res) => {
  const focus = assessmentService.findWeakestFocus(req.officer.id);
  if (!focus) return res.status(400).json({ error: 'Complete a diagnostic assessment first — there is no competency data to target yet.' });

  const difficulty = (req.body && req.body.difficulty) || config.DEFAULT_DIFFICULTY;
  const result = await questionGenerationService.generateLiveQuestionSet({
    competency: focus.competency, subCompetency: focus.subCompetency, difficulty, count: config.REASSESSMENT_QUESTION_COUNT,
  });

  if (!result.success) {
    return res.status(400).json({
      error: result.reason, status: result.status,
      focusCompetency: focus.competency, focusSubCompetency: focus.subCompetency, gap: focus.gap,
      retrievedChunks: result.retrievedChunks,
    });
  }

  const insertAssessment = db.prepare(`INSERT INTO assessments (officer_id, type, competency_filter, difficulty, status) VALUES (?, 'ai', ?, ?, 'in_progress')`);
  const assessmentId = insertAssessment.run(req.officer.id, focus.competency, difficulty).lastInsertRowid;
  const insertAQ = db.prepare('INSERT INTO assessment_questions (assessment_id, question_id, position) VALUES (?,?,?)');
  const questionRows = result.questions.map((q, i) => {
    insertAQ.run(assessmentId, q.id, i);
    return db.prepare('SELECT * FROM questions WHERE id = ?').get(q.id);
  });

  res.json({
    assessmentId, difficulty, totalQuestions: questionRows.length,
    method: 'RAG + LLM (live generation, grounded in indexed documents)',
    focusCompetency: focus.competency, focusSubCompetency: focus.subCompetency, gap: focus.gap,
    questions: questionRows.map(questionForClient),
    sources: result.questions.map(q => ({ document: q.sourceDocument, page: q.sourcePage, excerpt: q.sourceExcerpt })),
  });
});

// ===== GAP-FOCUSED REASSESSMENT (bank-based fallback — used when no
// document is indexed for the gap competency, or no LLM key is set) =====
router.post('/reassessment', requireAuth, (req, res) => {
  const focus = assessmentService.findWeakestFocus(req.officer.id);
  if (!focus) return res.status(400).json({ error: 'No prior assessment found — complete a diagnostic assessment first.' });
  if (focus.gap < config.REASSESSMENT_GAP_THRESHOLD) {
    return res.status(400).json({ error: `Your largest gap (${focus.competency}, ${focus.gap} pts) is below the reassessment threshold of ${config.REASSESSMENT_GAP_THRESHOLD} pts.` });
  }

  const questions = assessmentService.selectReassessmentQuestions(focus.competency, focus.subCompetency, config.REASSESSMENT_QUESTION_COUNT);
  if (questions.length === 0) return res.status(400).json({ error: `No questions available for ${focus.competency} yet.` });

  const insertAssessment = db.prepare(`INSERT INTO assessments (officer_id, type, competency_filter, difficulty, status) VALUES (?, 'reassessment', ?, ?, 'in_progress')`);
  const result = insertAssessment.run(req.officer.id, focus.competency, config.DEFAULT_DIFFICULTY);
  const assessmentId = result.lastInsertRowid;
  const insertAQ = db.prepare('INSERT INTO assessment_questions (assessment_id, question_id, position) VALUES (?,?,?)');
  questions.forEach((q, i) => insertAQ.run(assessmentId, q.id, i));

  res.json({
    assessmentId,
    method: 'BANK-BASED (hand-authored question bank, not live LLM generation)',
    focusCompetency: focus.competency,
    focusSubCompetency: focus.subCompetency,
    gap: focus.gap,
    difficulty: config.DEFAULT_DIFFICULTY,
    totalQuestions: questions.length,
    questions: questions.map(questionForClient),
  });
});

// ===== AVAILABLE DOCUMENTS FOR ASSESSMENT =====
router.get('/available-documents', requireAuth, (req, res) => {
  const docs = db.prepare(`
    SELECT d.id, d.original_name as name, d.pages_estimate as pages, d.uploaded_at,
      (SELECT COUNT(*) FROM document_chunks WHERE document_id = d.id) as chunkCount
    FROM documents d
    WHERE d.status = 'ready'
    ORDER BY d.uploaded_at DESC
  `).all();
  res.json({ documents: docs });
});

// ===== AI ASSESSMENT FROM SPECIFIC DOCUMENT (RAG) =====
router.post('/ai-from-document', requireAuth, async (req, res) => {
  try {
    const { documentId, count = 5, difficulty = 'Medium', topic = '' } = req.body || {};
    if (!documentId) return res.status(400).json({ error: 'Please select or upload a document.' });

    const qCount = Math.min(Math.max(Number(count) || 5, 1), 15);
    const result = await questionGenerationService.generateQuestionsFromDocument({
      documentId: Number(documentId),
      count: qCount,
      difficulty,
      topic,
    });

    const docName = result.document.name;
    const competencyName = topic ? `${docName} (${topic})` : docName;

    const insertAssessment = db.prepare(`INSERT INTO assessments (officer_id, type, competency_filter, difficulty, status) VALUES (?, 'ai', ?, ?, 'in_progress')`);
    const assessmentId = insertAssessment.run(req.officer.id, competencyName, difficulty).lastInsertRowid;

    const insertAQ = db.prepare('INSERT INTO assessment_questions (assessment_id, question_id, position) VALUES (?,?,?)');
    const questionRows = result.questions.map((q, i) => {
      insertAQ.run(assessmentId, q.id, i);
      return db.prepare('SELECT * FROM questions WHERE id = ?').get(q.id);
    });

    res.json({
      assessmentId,
      difficulty,
      totalQuestions: questionRows.length,
      method: result.method,
      documentName: docName,
      topic,
      questions: questionRows.map(questionForClient),
      sources: result.questions.map(q => ({
        document: q.sourceDocument,
        page: q.sourcePage,
        excerpt: q.sourceExcerpt
      })),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ===== "ACCORDING TO YOU" (Personalized / Competency Assessment) =====
router.post('/ai-personalized', requireAuth, async (req, res) => {
  try {
    const { mode = 'weakest_gap', competency: customComp, difficulty = 'Medium', count = 5 } = req.body || {};
    let targetCompetency = customComp;
    let targetSub = null;
    let gap = 0;

    if (mode === 'weakest_gap' || !targetCompetency) {
      const focus = assessmentService.findWeakestFocus(req.officer.id);
      if (focus) {
        targetCompetency = focus.competency;
        targetSub = focus.subCompetency;
        gap = focus.gap;
      } else {
        // If officer hasn't taken diagnostic yet, use the first competency of their role
        const roleComps = db.prepare('SELECT competency_name FROM role_competencies WHERE role_id = ?').all(req.officer.roleId);
        targetCompetency = (roleComps[0] && roleComps[0].competency_name) || 'Survey Methodology';
      }
    }

    const qCount = Math.min(Math.max(Number(count) || 5, 1), 15);
    const result = await questionGenerationService.generateLiveQuestionSet({
      competency: targetCompetency,
      subCompetency: targetSub,
      difficulty,
      count: qCount,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.reason || 'Failed to generate assessment questions.' });
    }

    const insertAssessment = db.prepare(`INSERT INTO assessments (officer_id, type, competency_filter, difficulty, status) VALUES (?, 'ai', ?, ?, 'in_progress')`);
    const assessmentId = insertAssessment.run(req.officer.id, targetCompetency, difficulty).lastInsertRowid;

    const insertAQ = db.prepare('INSERT INTO assessment_questions (assessment_id, question_id, position) VALUES (?,?,?)');
    const questionRows = result.questions.map((q, i) => {
      insertAQ.run(assessmentId, q.id, i);
      return db.prepare('SELECT * FROM questions WHERE id = ?').get(q.id);
    });

    res.json({
      assessmentId,
      difficulty,
      totalQuestions: questionRows.length,
      method: result.method,
      focusCompetency: targetCompetency,
      focusSubCompetency: targetSub,
      gap,
      questions: questionRows.map(questionForClient),
      sources: result.questions.map(q => ({
        document: q.sourceDocument,
        page: q.sourcePage,
        excerpt: q.sourceExcerpt
      })),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
