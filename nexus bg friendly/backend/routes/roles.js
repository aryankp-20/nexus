/* GET /api/roles -> list of roles with their competency names */
const express = require('express');
const { db } = require('../database/db');
const router = express.Router();

router.get('/', (req, res) => {
  const roles = db.prepare('SELECT * FROM roles').all();
  const comps = db.prepare('SELECT * FROM role_competencies').all();
  const result = roles.map(r => ({
    id: r.id,
    name: r.name,
    icon: r.icon,
    desc: r.description,
    competencies: comps.filter(c => c.role_id === r.id).map(c => c.competency_name),
  }));
  res.json({ roles: result });
});

module.exports = router;
