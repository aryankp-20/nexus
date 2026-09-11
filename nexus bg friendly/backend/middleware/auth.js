/* =====================================================================
   AUTH MIDDLEWARE
   Demo authentication, clearly not a real Government Identity Provider
   integration (see section 22 of the project brief / HACKATHON_GUIDE.md).
   Verifies a JWT issued at login and attaches req.officer.
===================================================================== */

const jwt = require('jsonwebtoken');
const config = require('../config/appConfig');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated. Please log in.' });
  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    req.officer = payload; // { id, employeeId, name, roleId, isAdmin }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

// Backend authorization: prevents a learner from calling admin-only APIs.
function requireAdmin(req, res, next) {
  if (!req.officer || !req.officer.isAdmin) {
    return res.status(403).json({ error: 'Administrator access required.' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
