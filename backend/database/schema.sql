-- =====================================================================
-- DATABASE SCHEMA
-- Written for SQLite (see HACKATHON_GUIDE.md for why SQLite was used
-- instead of a separate PostgreSQL server). The table/column design is
-- plain relational SQL and maps directly onto PostgreSQL if you ever
-- want to switch: swap AUTOINCREMENT -> SERIAL, TEXT -> VARCHAR, etc.
--
-- RELATIONSHIP OVERVIEW (see README for the full picture):
--   OFFICER -> ASSESSMENT -> RESPONSE -> COMPETENCY_SCORE ->
--   COMPETENCY GAP -> LEARNING RECOMMENDATION -> REASSESSMENT -> UPDATED SCORE
-- =====================================================================

CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,             -- e.g. 'collector'
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS role_competencies (
  role_id TEXT NOT NULL REFERENCES roles(id),
  competency_name TEXT NOT NULL,
  PRIMARY KEY (role_id, competency_name)
);

CREATE TABLE IF NOT EXISTS competencies (
  name TEXT PRIMARY KEY,
  required_score INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sub_competencies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competency_name TEXT NOT NULL REFERENCES competencies(name),
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS officers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role_id TEXT NOT NULL REFERENCES roles(id),
  is_admin INTEGER NOT NULL DEFAULT 0,
  department TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Documents uploaded to the Knowledge Base (admin AI Quiz Generator)
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original_name TEXT NOT NULL,
  stored_filename TEXT NOT NULL,
  pages_estimate INTEGER,
  status TEXT NOT NULL DEFAULT 'processing', -- processing | ready | failed
  indexed INTEGER NOT NULL DEFAULT 0,
  uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Chunked, retrievable text from documents. tfidf_json stores a
-- {term: weight} vector for lightweight vector search (see
-- backend/services/embeddingService.js)
CREATE TABLE IF NOT EXISTS document_chunks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL REFERENCES documents(id),
  chunk_index INTEGER NOT NULL,
  page_estimate INTEGER,
  text TEXT NOT NULL,
  tfidf_json TEXT NOT NULL
);

-- Questions: covers BOTH the hand-authored bank AND AI/RAG-generated
-- questions. "status" distinguishes them.
--   bank      -> original hand-written diagnostic question bank
--   pending   -> freshly AI-generated, awaiting admin review
--   approved  -> AI-generated and approved, usable in assessments
--   rejected  -> AI-generated and rejected, never used
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competency TEXT NOT NULL,
  sub_competency TEXT,
  difficulty TEXT NOT NULL,
  question_text TEXT NOT NULL,
  options_json TEXT NOT NULL,   -- JSON array of option strings
  correct_index INTEGER NOT NULL,
  explanation TEXT,
  source_document TEXT,         -- filled only for RAG-generated questions
  source_page INTEGER,
  source_chunk_id INTEGER REFERENCES document_chunks(id),
  status TEXT NOT NULL DEFAULT 'bank',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- One row per assessment attempt (diagnostic, AI assessment, or
-- reassessment). Backend calculates and stores the score — the
-- frontend never gets to submit its own score.
CREATE TABLE IF NOT EXISTS assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  officer_id INTEGER NOT NULL REFERENCES officers(id),
  type TEXT NOT NULL,             -- 'diagnostic' | 'ai' | 'reassessment'
  competency_filter TEXT,         -- set for 'ai' and 'reassessment' types
  status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress | completed
  difficulty TEXT NOT NULL,
  score INTEGER,
  started_at TEXT DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS assessment_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id INTEGER NOT NULL REFERENCES assessments(id),
  question_id INTEGER NOT NULL REFERENCES questions(id),
  position INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id INTEGER NOT NULL REFERENCES assessments(id),
  question_id INTEGER NOT NULL REFERENCES questions(id),
  selected_index INTEGER NOT NULL,
  is_correct INTEGER NOT NULL,
  answered_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- One row per (officer, competency) every time a score is (re)computed.
-- Keeping history (rather than overwriting) is what powers the
-- Progress page's "before -> after" view.
CREATE TABLE IF NOT EXISTS competency_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  officer_id INTEGER NOT NULL REFERENCES officers(id),
  competency TEXT NOT NULL,
  score INTEGER NOT NULL,
  required_score INTEGER NOT NULL,
  gap_level TEXT NOT NULL,        -- HIGH | MEDIUM | LOW
  assessment_id INTEGER REFERENCES assessments(id),
  computed_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS learning_resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competency TEXT NOT NULL,
  title TEXT NOT NULL,
  duration TEXT,
  match_score INTEGER,
  reason TEXT
);

CREATE TABLE IF NOT EXISTS learning_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  officer_id INTEGER NOT NULL REFERENCES officers(id),
  resource_id INTEGER NOT NULL REFERENCES learning_resources(id),
  status TEXT NOT NULL DEFAULT 'locked', -- locked | available | completed
  completed_at TEXT
);
