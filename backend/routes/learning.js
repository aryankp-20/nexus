/* =====================================================================
   LEARNING ROUTES
   GET  /api/learning-path            -> personalized path for current officer
   POST /api/learning-path/:id/complete -> mark a module complete, unlock next
   GET  /api/igot                     -> iGOT Karmayogi recommendations (DEMO)
===================================================================== */

const express = require('express');
const { db } = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const assessmentService = require('../services/assessmentService');
const igotService = require('../services/igotService');

const router = express.Router();

// ===== LEARNING PATH: GAP-RANKED RECOMMENDED COURSES =====
// Personalized learning path: recommend resources for the officer's
// weakest competencies first (real gap-driven ordering, not random).
router.get('/learning-path', requireAuth, (req, res) => {
  const scores = assessmentService.getLatestCompetencyScores(req.officer.id);
  const gapRank = {};
  scores.forEach(s => { gapRank[s.competency] = s.required_score - s.score; });

  const resources = db.prepare('SELECT * FROM learning_resources').all();
  const progressRows = db.prepare('SELECT * FROM learning_progress WHERE officer_id = ?').all(req.officer.id);

  const relevant = resources
    .filter(r => gapRank[r.competency] !== undefined)
    .sort((a, b) => (gapRank[b.competency] || 0) - (gapRank[a.competency] || 0) || b.match_score - a.match_score);

  const path = relevant.map((r, i) => {
    const progress = progressRows.find(p => p.resource_id === r.id);
    return {
      id: r.id,
      n: i + 1,
      title: r.title,
      competency: r.competency,
      duration: r.duration,
      match: r.match_score,
      reason: r.reason,
      status: progress ? progress.status : (i === 0 ? 'available' : 'locked'),
    };
  });

  res.json({ path });
});

// ===== LEARNING PATH: MARK A MODULE COMPLETE (unlocks the next one) =====
router.post('/learning-path/:id/complete', requireAuth, (req, res) => {
  const resourceId = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM learning_progress WHERE officer_id = ? AND resource_id = ?').get(req.officer.id, resourceId);
  if (existing) {
    db.prepare(`UPDATE learning_progress SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?`).run(existing.id);
  } else {
    db.prepare(`INSERT INTO learning_progress (officer_id, resource_id, status, completed_at) VALUES (?,?,'completed', CURRENT_TIMESTAMP)`).run(req.officer.id, resourceId);
  }

  // Unlock the next resource in the path for this competency.
  const resource = db.prepare('SELECT * FROM learning_resources WHERE id = ?').get(resourceId);
  const siblings = db.prepare('SELECT * FROM learning_resources WHERE competency = ? ORDER BY id').all(resource.competency);
  const idx = siblings.findIndex(s => s.id === resourceId);
  const next = siblings[idx + 1];
  if (next) {
    const nextProgress = db.prepare('SELECT * FROM learning_progress WHERE officer_id = ? AND resource_id = ?').get(req.officer.id, next.id);
    if (!nextProgress) db.prepare(`INSERT INTO learning_progress (officer_id, resource_id, status) VALUES (?,?,'available')`).run(req.officer.id, next.id);
  }

  res.json({ success: true });
});

// ===== iGOT: BROWSE ALL COURSES FOR THIS OFFICER'S ROLE =====
router.get('/igot', requireAuth, (req, res) => {
  const roleComps = db.prepare('SELECT competency_name FROM role_competencies WHERE role_id = ?')
    .all(req.officer.roleId).map(r => r.competency_name);
  res.json(igotService.getRecommendedCourses(roleComps));
});

// ===== iGOT: RECOMMENDATIONS TIED TO THE OFFICER'S ACTUAL WEAKEST GAP =====
// Gap-specific: recommends iGOT resources tied to the officer's actual
// weakest competency + sub-competency (from their real assessment
// results) — this is the real "competency gap -> iGOT resource" link.
router.get('/igot/recommendations', requireAuth, (req, res) => {
  const focus = assessmentService.findWeakestFocus(req.officer.id);
  if (!focus) return res.json({ hasFocus: false });
  res.json({ hasFocus: true, ...igotService.getRecommendationsForFocus(focus.competency, focus.subCompetency), gap: focus.gap });
});

module.exports = router;
