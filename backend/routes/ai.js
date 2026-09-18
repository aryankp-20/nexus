/* =====================================================================
   AI ASSISTANT ROUTE
   POST /api/ai/chat -> answers questions using the officer's own real
   competency/progress data as context. Real LLM call if ANTHROPIC_API_KEY
   is set; otherwise a clearly-labeled fallback (see llmService.js).
   The API key never touches the frontend — it only lives in .env here.
===================================================================== */

const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { db } = require('../database/db');
const assessmentService = require('../services/assessmentService');
const llmService = require('../services/llmService');

const router = express.Router();

router.post('/chat', requireAuth, async (req, res) => {
  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'message is required.' });

  const scores = assessmentService.getLatestCompetencyScores(req.officer.id);
  const contextSummary = scores.length
    ? scores.map(s => `${s.competency}: current ${s.score}%, required ${s.required_score}%, gap ${s.gap_level}`).join('\n')
    : 'No assessment data yet.';

  try {
    const result = await llmService.chatWithContext({ userMessage: message, contextSummary });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'AI service error.', detail: err.message });
  }
});

module.exports = router;
