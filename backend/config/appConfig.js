/* =====================================================================
   APP CONFIG — THE ONE PLACE TO CHANGE FREQUENTLY-TUNED VALUES
   =====================================================================
   If a judge asks you to change the passing score, question count,
   gap thresholds, etc. — this is the file to open. Nothing else in the
   backend hardcodes these numbers; they all read from here.
===================================================================== */

require('dotenv').config();

module.exports = {

  // ===== SERVER =====
  PORT: process.env.PORT || 4000,
  JWT_SECRET: process.env.JWT_SECRET || 'hackathon-demo-secret-change-me',
  JWT_EXPIRES_IN: '12h',

  // ===== ASSESSMENT ENGINE =====
  // CHANGE NUMBER OF QUESTIONS HERE (diagnostic assessment)
  NUMBER_OF_ASSESSMENT_QUESTIONS: 10,

  // CHANGE THIS VALUE TO MODIFY THE PASSING SCORE (percent)
  PASSING_SCORE: 70,

  // CHANGE REASSESSMENT QUESTION COUNT HERE
  REASSESSMENT_QUESTION_COUNT: 5,

  // CHANGE REASSESSMENT THRESHOLD HERE — an officer is eligible for
  // reassessment on a competency once their gap is at least this many points
  REASSESSMENT_GAP_THRESHOLD: 10,

  // CHANGE ASSESSMENT DIFFICULTY DEFAULT HERE
  DEFAULT_DIFFICULTY: 'Medium',

  // ===== COMPETENCY GAP THRESHOLDS =====
  // gap = requiredScore - currentScore
  // CHANGE GAP THRESHOLDS HERE
  HIGH_GAP_THRESHOLD: 20,   // gap >= 20            -> HIGH
  MEDIUM_GAP_THRESHOLD: 10, // 10 <= gap < 20        -> MEDIUM
  // (gap < 10 is always LOW)

  // ===== DOCUMENT UPLOAD / RAG =====
  MAX_FILE_SIZE_MB: 10,
  SUPPORTED_FILE_TYPES: ['.pdf'],
  CHUNK_SIZE_CHARS: 900,       // characters per retrieval chunk
  CHUNK_OVERLAP_CHARS: 150,
  RETRIEVAL_TOP_K: 4,          // how many chunks to retrieve per question-gen call

  // ===== AI / RAG MODEL (AI PROMPTS LIVE IN backend/services/llmService.js) =====
  // CHANGE THE RAG / LLM MODEL HERE
  LLM_MODEL: 'claude-sonnet-4-6',
  LLM_TEMPERATURE: 0.4, // lower = more consistent/predictable question generation
  LLM_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  LLM_API_URL: 'https://api.anthropic.com/v1/messages',

  // ===== iGOT KARMAYOGI =====
  // No real iGOT API credentials are configured for this hackathon build.
  // This stays honestly labeled as DEMO/PROTOTYPE data everywhere it is used.
  IGOT_INTEGRATION_MODE: 'demo', // 'demo' | 'live' (never set to 'live' without real credentials)
};
