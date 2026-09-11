/* =====================================================================
   REPORTS ROUTES (admin only)
   GET /api/reports/:key/csv -> real CSV built from database data
   GET /api/reports/:key     -> JSON summary shown on the Reports page
   PDF export is intentionally NOT implemented for this hackathon build
   (see HACKATHON_GUIDE.md) — CSV is prioritized as the honest, working option.
===================================================================== */

const express = require('express');
const { db } = require('../database/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

function toCsv(rows, columns) {
  const header = columns.join(',');
  const body = rows.map(r => columns.map(c => JSON.stringify(r[c] ?? '')).join(',')).join('\n');
  return header + '\n' + body;
}

// ===== REPORT DEFINITIONS =====
// Beginner tip: to ADD A NEW REPORT, add one more key here (the SQL
// query + which columns to show), then add its label/description to
// REPORT_META in frontend/js/pages/admin.js so it shows up as a card
// on the Reports page.
const REPORT_BUILDERS = {
  'competency-gap': () => {
    const rows = db.prepare(`
      SELECT o.name as officer, o.employee_id as employeeId, cs.competency, cs.score, cs.required_score as required,
             (cs.required_score - cs.score) as gap, cs.gap_level as gapLevel
      FROM competency_scores cs
      JOIN officers o ON o.id = cs.officer_id
      WHERE cs.id IN (SELECT MAX(id) FROM competency_scores GROUP BY officer_id, competency)
      ORDER BY gap DESC
    `).all();
    return { columns: ['officer', 'employeeId', 'competency', 'score', 'required', 'gap', 'gapLevel'], rows };
  },
  'role-performance': () => {
    const rows = db.prepare(`
      SELECT r.name as role, cs.competency, ROUND(AVG(cs.score)) as avgScore, COUNT(DISTINCT cs.officer_id) as officerCount
      FROM competency_scores cs
      JOIN officers o ON o.id = cs.officer_id
      JOIN roles r ON r.id = o.role_id
      WHERE cs.id IN (SELECT MAX(id) FROM competency_scores GROUP BY officer_id, competency)
      GROUP BY r.name, cs.competency
      ORDER BY r.name, cs.competency
    `).all();
    return { columns: ['role', 'competency', 'avgScore', 'officerCount'], rows };
  },
  'learning-progress': () => {
    const rows = db.prepare(`
      SELECT o.name as officer, lr.title as resource, lr.competency, lp.status
      FROM learning_progress lp
      JOIN officers o ON o.id = lp.officer_id
      JOIN learning_resources lr ON lr.id = lp.resource_id
      ORDER BY o.name
    `).all();
    return { columns: ['officer', 'resource', 'competency', 'status'], rows };
  },
  'assessment': () => {
    const rows = db.prepare(`
      SELECT o.name as officer, a.type, a.score, a.status, a.started_at as startedAt, a.completed_at as completedAt
      FROM assessments a JOIN officers o ON o.id = a.officer_id
      ORDER BY a.started_at DESC
    `).all();
    return { columns: ['officer', 'type', 'score', 'status', 'startedAt', 'completedAt'], rows };
  },
};

// ===== REPORT: JSON PREVIEW (first 20 rows, shown on the Reports page) =====
router.get('/:key', requireAuth, requireAdmin, (req, res) => {
  const builder = REPORT_BUILDERS[req.params.key];
  if (!builder) return res.status(404).json({ error: 'Unknown report.' });
  const { rows } = builder();
  res.json({ key: req.params.key, recordCount: rows.length, rows: rows.slice(0, 20) });
});

// ===== REPORT: FULL CSV DOWNLOAD (all rows) =====
router.get('/:key/csv', requireAuth, requireAdmin, (req, res) => {
  const builder = REPORT_BUILDERS[req.params.key];
  if (!builder) return res.status(404).json({ error: 'Unknown report.' });
  const { columns, rows } = builder();
  const csv = toCsv(rows, columns);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${req.params.key}.csv"`);
  res.send(csv);
});

module.exports = router;
