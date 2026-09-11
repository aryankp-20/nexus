/* =====================================================================
   AUTH ROUTES
   DEMO LOGIN, not real Government Identity Provider integration.
   POST /api/auth/login   { email, password } -> { token, officer }
   GET  /api/auth/me      (requires Bearer token) -> officer
===================================================================== */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database/db');
const config = require('../config/appConfig');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function toPublicOfficer(row) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    name: row.name,
    email: row.email,
    roleId: row.role_id,
    isAdmin: !!row.is_admin,
    department: row.department,
  };
}

// ===== LOGIN =====
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  const identifier = email.trim();
  const officer = db.prepare('SELECT * FROM officers WHERE LOWER(email) = LOWER(?) OR LOWER(employee_id) = LOWER(?)').get(identifier, identifier);
  if (!officer || !bcrypt.compareSync(password, officer.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password. (Demo login: all demo accounts use password "demo1234")' });
  }

  const payload = { id: officer.id, employeeId: officer.employee_id, name: officer.name, roleId: officer.role_id, isAdmin: !!officer.is_admin };
  const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });

  const diagnosticCount = db.prepare(`
    SELECT COUNT(*) as c FROM assessments WHERE officer_id = ? AND type = 'diagnostic' AND status = 'completed'
  `).get(officer.id).c;

  res.json({ token, officer: toPublicOfficer(officer), authMode: 'DEMO_LOGIN', hasCompletedDiagnostic: diagnosticCount > 0 });
});

// ===== CURRENT LOGGED-IN OFFICER (used on every page load) =====
router.get('/me', requireAuth, (req, res) => {
  const officer = db.prepare('SELECT * FROM officers WHERE id = ?').get(req.officer.id);
  if (!officer) return res.status(404).json({ error: 'Officer not found.' });

  // Has this officer ever completed a real diagnostic assessment? This
  // drives the "don't show competency scores before assessment" rule
  // (see HACKATHON_GUIDE.md) — the frontend uses this flag to decide
  // whether to show the dashboard/competencies/learning path or send
  // the officer to the diagnostic assessment first.
  const diagnosticCount = db.prepare(`
    SELECT COUNT(*) as c FROM assessments WHERE officer_id = ? AND type = 'diagnostic' AND status = 'completed'
  `).get(officer.id).c;

  res.json({ officer: toPublicOfficer(officer), hasCompletedDiagnostic: diagnosticCount > 0 });
});

module.exports = router;
