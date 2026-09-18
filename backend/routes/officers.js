/* =====================================================================
   OFFICER ROUTES
   GET /api/officers        (admin only) -> directory with computed competency/gap/status
   GET /api/officers/:id    (admin, or the officer viewing their own record)
===================================================================== */

const express = require('express');
const { db } = require('../database/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const assessmentService = require('../services/assessmentService');

const router = express.Router();

// ===== HELPER: BUILD ONE OFFICER'S SUMMARY ROW (used by both routes below) =====
function buildOfficerSummary(officer) {
  const scores = assessmentService.getLatestCompetencyScores(officer.id);
  const overall = scores.length ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length) : 0;
  const highestGap = scores.length
    ? scores.reduce((a, b) => (b.required_score - b.score) > (a.required_score - a.score) ? b : a).competency
    : '—';
  const lastAssessment = db.prepare(`
    SELECT completed_at FROM assessments WHERE officer_id = ? AND status = 'completed'
    ORDER BY completed_at DESC LIMIT 1
  `).get(officer.id);
  const roleName = (db.prepare('SELECT name FROM roles WHERE id = ?').get(officer.role_id) || {}).name;

  let status = 'On Track';
  if (scores.length === 0) status = 'Not Yet Assessed';
  else if (overall >= 88) status = 'Excellent';
  else if (overall < 65) status = 'Needs Attention';

  const completedResources = db.prepare(`
    SELECT COUNT(*) as c FROM learning_progress WHERE officer_id = ? AND status = 'completed'
  `).get(officer.id).c;
  const totalResources = db.prepare(`SELECT COUNT(*) as c FROM learning_resources`).get().c || 1;

  return {
    id: officer.id,
    name: officer.name,
    employeeId: officer.employee_id,
    role: roleName,
    competency: overall,
    gap: highestGap,
    progress: Math.round((completedResources / totalResources) * 100),
    lastAssessment: lastAssessment ? lastAssessment.completed_at : 'Not yet assessed',
    status,
  };
}

// ===== OFFICER DIRECTORY (admin only) =====
router.get('/', requireAuth, requireAdmin, (req, res) => {
  const officers = db.prepare('SELECT * FROM officers WHERE is_admin = 0').all();
  res.json({ officers: officers.map(buildOfficerSummary) });
});

// ===== ONE OFFICER'S DETAIL (admin, or the officer viewing their own record) =====
router.get('/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (id !== req.officer.id && !req.officer.isAdmin) {
    return res.status(403).json({ error: 'You can only view your own officer record.' });
  }
  const officer = db.prepare('SELECT * FROM officers WHERE id = ?').get(id);
  if (!officer) return res.status(404).json({ error: 'Officer not found.' });

  const summary = buildOfficerSummary(officer);
  const scores = assessmentService.getLatestCompetencyScores(officer.id);
  res.json({ ...summary, department: officer.department, competencyScores: scores });
});

module.exports = router;
