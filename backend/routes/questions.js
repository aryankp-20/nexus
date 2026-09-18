/* =====================================================================
   QUESTION ROUTES (admin only)
   POST /api/questions/generate     -> run RAG pipeline, create a pending question
   GET  /api/questions/pending      -> list questions awaiting review
   POST /api/questions/:id/approve  -> approve into the active bank
   POST /api/questions/:id/reject   -> reject (never used in assessments)
===================================================================== */

const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const questionGenerationService = require('../services/questionGenerationService');

const router = express.Router();

// ===== AI QUIZ GENERATION: GENERATE ONE QUESTION (calls the AI, prompt in llmService.js) =====
router.post('/generate', requireAuth, requireAdmin, async (req, res) => {
  const { competency, subCompetency, difficulty } = req.body || {};
  if (!competency || !difficulty) return res.status(400).json({ error: 'competency and difficulty are required.' });
  const result = await questionGenerationService.generateQuestion({ competency, subCompetency, difficulty });
  res.json(result);
});

// ===== AI QUIZ GENERATION: LIST QUESTIONS AWAITING REVIEW =====
router.get('/pending', requireAuth, requireAdmin, (req, res) => {
  res.json({ questions: questionGenerationService.listPendingQuestions() });
});

// ===== AI QUIZ GENERATION: APPROVE A PENDING QUESTION =====
router.post('/:id/approve', requireAuth, requireAdmin, (req, res) => {
  const ok = questionGenerationService.approveQuestion(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: 'Pending question not found.' });
  res.json({ success: true });
});

// ===== AI QUIZ GENERATION: REJECT A PENDING QUESTION =====
router.post('/:id/reject', requireAuth, requireAdmin, (req, res) => {
  const ok = questionGenerationService.rejectQuestion(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: 'Pending question not found.' });
  res.json({ success: true });
});

module.exports = router;
