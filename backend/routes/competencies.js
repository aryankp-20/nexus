/* =====================================================================
   COMPETENCY ROUTES
   GET /api/competencies          -> current officer's competencies + gap
   GET /api/competencies/:name    -> detail incl. sub-competencies
===================================================================== */

const express = require('express');
const { db } = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const assessmentService = require('../services/assessmentService');

const router = express.Router();

// ===== LIST: ALL OF THIS OFFICER'S COMPETENCIES + GAP =====
router.get('/', requireAuth, (req, res) => {
  const roleComps = db.prepare('SELECT competency_name FROM role_competencies WHERE role_id = ?')
    .all(req.officer.roleId).map(r => r.competency_name);
  const latest = assessmentService.getLatestCompetencyScores(req.officer.id);

  const result = roleComps.map(name => {
    const found = latest.find(l => l.competency === name);
    if (found) return { name, current: found.score, required: found.required_score, gap: found.gap_level };
    // No score recorded yet for this competency at all
    const reqRow = db.prepare('SELECT required_score FROM competencies WHERE name = ?').get(name);
    return { name, current: 0, required: reqRow ? reqRow.required_score : 80, gap: 'HIGH' };
  });
  res.json({ competencies: result });
});

// ===== DETAIL: ONE COMPETENCY, WITH SUB-COMPETENCIES + HISTORY =====
router.get('/:name', requireAuth, (req, res) => {
  const name = req.params.name;
  const subRows = db.prepare('SELECT name FROM sub_competencies WHERE competency_name = ?').all(name);
  const latest = assessmentService.getLatestCompetencyScores(req.officer.id).find(l => l.competency === name);
  const history = assessmentService.getCompetencyHistory(req.officer.id, name);

  if (!latest) {
    const reqRow = db.prepare('SELECT required_score FROM competencies WHERE name = ?').get(name);
    if (!reqRow) return res.status(404).json({ error: 'Unknown competency.' });
    return res.json({
      name, current: 0, required: reqRow.required_score, gap: 'HIGH',
      subCompetencies: subRows.map(s => s.name), history: [],
    });
  }

  res.json({
    name, current: latest.score, required: latest.required_score, gap: latest.gap_level,
    subCompetencies: subRows.map(s => s.name), history,
  });
});

module.exports = router;
