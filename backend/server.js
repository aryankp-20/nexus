/* =====================================================================
   SERVER ENTRY POINT
   Run with: npm start (from the project root) or `node backend/server.js`
===================================================================== */

const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/appConfig');
const { isFirstRun } = require('./database/db');

// Ensure the database is populated with reference and demo data
try {
  require('./database/seed')();
} catch (e) {
  console.error('[server] Seeding check failed:', e);
}

const app = express();
app.use(cors());
app.use(express.json());

// ===== API CALLS: ROUTE FILES =====
// Each line below plugs in one file from backend/routes/. Beginner
// tip: to add a brand-new group of API endpoints, create a new file
// in backend/routes/ and add one more app.use(...) line here.
app.use('/api/auth', require('./routes/auth'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/competencies', require('./routes/competencies'));
app.use('/api/officers', require('./routes/officers'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api', require('./routes/learning'));       // /api/learning-path, /api/igot
app.use('/api/documents', require('./routes/documents'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/reports', require('./routes/reports'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', llmConfigured: Boolean(config.LLM_API_KEY) });
});

// Exposes only the PUBLIC-SAFE, display-relevant config values (never
// secrets) so the frontend shows real numbers instead of a second,
// easy-to-forget hardcoded copy. Single source of truth stays here.
app.get('/api/config', (req, res) => {
  res.json({
    numberOfAssessmentQuestions: config.NUMBER_OF_ASSESSMENT_QUESTIONS,
    passingScore: config.PASSING_SCORE,
    reassessmentQuestionCount: config.REASSESSMENT_QUESTION_COUNT,
    highGapThreshold: config.HIGH_GAP_THRESHOLD,
    mediumGapThreshold: config.MEDIUM_GAP_THRESHOLD,
  });
});

// ===== SERVE THE FRONTEND =====
// So the whole app (frontend + backend) can be run with one command.
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
app.use(express.static(FRONTEND_DIR));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// ===== ERROR HANDLING =====
// Any error thrown/passed in a route ends up here instead of crashing the server.
app.use((err, req, res, next) => {
  console.error('[server error]', err);
  res.status(500).json({ error: 'Something went wrong on the server.', detail: err.message });
});

// ===== START LISTENING (local / traditional hosting only) =====
// On Vercel (and other serverless platforms), the platform imports this
// file's export and invokes it directly per-request — it must NOT also
// bind to a port itself. See api/index.js for the serverless entry point.
if (!process.env.VERCEL) {
  const server = app.listen(config.PORT, () => {
    console.log(`\nCompetency Intelligence backend running on http://localhost:${config.PORT}`);
    console.log(`LLM configured: ${Boolean(config.LLM_API_KEY)} (set ANTHROPIC_API_KEY in .env to enable real AI)\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n[ERROR] Port ${config.PORT} is already in use by another process.`);
      console.error(`A previous Node.js server instance is likely still running on port ${config.PORT}.\n`);
    } else {
      console.error('[server error]', err);
    }
    process.exit(1);
  });
}

module.exports = app;
