/* =====================================================================
   SEED SCRIPT
   Populates a freshly-created database with:
     - roles + role-competency mapping   (data/roles.js)
     - competencies + sub-competencies   (data/competencies.js)
     - demo officer accounts             (data/demoData.js)
     - the starter question bank         (data/demoData.js)
     - learning resources                (derived from data/courses.js)
   Runs automatically from server.js on first launch (when data.sqlite
   does not exist yet). Safe to re-run manually with:
       node backend/database/seed.js
===================================================================== */

const bcrypt = require('bcryptjs');
const { db } = require('./db');
const ROLES = require('../../data/roles');
const COMPETENCY_LIB = require('../../data/competencies');
const IGOT_COURSES = require('../../data/courses');
const { OFFICERS, QUESTION_BANK } = require('../../data/demoData');
const assessmentService = require('../services/assessmentService');

function seed(force = false) {
  const officerCount = db.prepare('SELECT COUNT(*) as c FROM officers').get().c;
  const roleCount = db.prepare('SELECT COUNT(*) as c FROM roles').get().c;
  const compCount = db.prepare('SELECT COUNT(*) as c FROM competencies').get().c;

  if (!force && officerCount > 0 && roleCount > 0 && compCount > 0) {
    console.log('[seed] Database already has data — skipping seed.');
    return;
  }

  console.log('[seed] Seeding database with reference + demo data...');

  const runSeed = db.transaction(() => {
    const insertRole = db.prepare(`
      INSERT INTO roles (id, name, icon, description) VALUES (?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET name=excluded.name, icon=excluded.icon, description=excluded.description
    `);
    const insertRoleComp = db.prepare('INSERT OR IGNORE INTO role_competencies (role_id, competency_name) VALUES (?,?)');
    ROLES.forEach(r => {
      insertRole.run(r.id, r.name, r.icon, r.desc);
      r.competencies.forEach(c => insertRoleComp.run(r.id, c));
    });

    const insertComp = db.prepare(`
      INSERT INTO competencies (name, required_score) VALUES (?,?)
      ON CONFLICT(name) DO UPDATE SET required_score=excluded.required_score
    `);
    const insertSub = db.prepare('INSERT OR IGNORE INTO sub_competencies (competency_name, name) VALUES (?,?)');
    Object.entries(COMPETENCY_LIB).forEach(([name, d]) => {
      insertComp.run(name, d.required);
      d.sub.forEach(s => insertSub.run(name, s));
    });

    const insertOfficer = db.prepare(`
      INSERT INTO officers (employee_id, name, email, password_hash, role_id, is_admin, department)
      VALUES (?,?,?,?,?,?,?)
      ON CONFLICT(employee_id) DO UPDATE SET
        name=excluded.name,
        email=excluded.email,
        password_hash=excluded.password_hash,
        role_id=excluded.role_id,
        is_admin=excluded.is_admin,
        department=excluded.department
    `);
    const demoPasswordHash = bcrypt.hashSync('demo1234', 10);
    OFFICERS.forEach(o => {
      insertOfficer.run(o.employeeId, o.name, o.email, demoPasswordHash, o.role, o.isAdmin ? 1 : 0, o.department);
    });

    // Upsert questions so existing FK references are preserved while new bank questions are loaded
    const existingQuestions = db.prepare("SELECT id, question_text FROM questions WHERE status = 'bank'").all();
    const questionByText = new Map(existingQuestions.map(q => [q.question_text, q.id]));

    const insertQuestion = db.prepare(`
      INSERT INTO questions (competency, sub_competency, difficulty, question_text, options_json, correct_index, explanation, status)
      VALUES (?,?,?,?,?,?,?, 'bank')
    `);
    const updateQuestion = db.prepare(`
      UPDATE questions
      SET competency = ?, sub_competency = ?, difficulty = ?, options_json = ?, correct_index = ?, explanation = ?
      WHERE id = ?
    `);

    QUESTION_BANK.forEach(q => {
      const existingId = questionByText.get(q.q);
      if (existingId) {
        updateQuestion.run(q.comp, q.sub || null, q.diff, JSON.stringify(q.opts), q.correct, q.explanation || null, existingId);
      } else {
        insertQuestion.run(q.comp, q.sub || null, q.diff, q.q, JSON.stringify(q.opts), q.correct, q.explanation || null);
      }
    });

    const existingResources = new Set(db.prepare('SELECT title FROM learning_resources').all().map(r => r.title));
    const insertResource = db.prepare(`
      INSERT INTO learning_resources (competency, title, duration, match_score, reason)
      VALUES (?,?,?,?,?)
    `);
    IGOT_COURSES.forEach(c => {
      if (!existingResources.has(c.title)) {
        insertResource.run(
          c.competency, c.title, c.duration, c.match,
          `Recommended because ${c.competency} is a tracked competency for your role.`
        );
      }
    });
  });

  runSeed();

  // NOTE: earlier versions of this seed script also inserted a "demo
  // baseline" competency_scores row per officer so dashboards weren't
  // empty on first run. That was removed — it made freshly-seeded
  // officers look like they'd already been assessed, which is exactly
  // the kind of misleading shortcut this project should not take. A
  // freshly seeded officer now genuinely has zero competency data
  // until they complete a real diagnostic assessment, matching the
  // intended "new user" flow.

  console.log('[seed] Done. Demo login: any seeded email (see data/demoData.js) with password "demo1234".');
}

module.exports = seed;

// Allow running directly: node backend/database/seed.js [--force]
if (require.main === module) {
  const force = process.argv.includes('--force');
  seed(force);
}
