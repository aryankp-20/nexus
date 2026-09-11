# AI Competency Intelligence Platform

A full-stack competency-gap assessment platform for official statistical system officers: diagnostic assessments, competency gap analysis, personalized learning paths, and a RAG-based AI quiz generator grounded in real uploaded documents.

Built for a college hackathon. Optimized for **simple, understandable, modifiable, honest, working** — not for the most advanced architecture. See `HACKATHON_GUIDE.md` for a live-demo cheat sheet.

---

## 1. Project Overview

Officers in roles like Data Collector, Field Officer, and Statistical Analyst need specific competencies (survey methodology, sampling, CAPI, statistical analysis, etc.). This platform:

1. Diagnoses an officer's current competency level with an adaptive assessment
2. Calculates real competency gaps against required levels
3. Recommends a personalized learning path targeting the biggest gaps
4. Lets admins upload official documents and generate source-grounded assessment questions from them (RAG)
5. Closes the loop with gap-focused reassessment and tracks real improvement over time

## 2. Problem Being Solved

Manual competency assessment for a large statistical workforce doesn't scale, and generic training doesn't target the specific gaps that hold officers back. This platform automates diagnosis, targets learning to the actual gap, and lets administrators generate new, source-verified assessment content directly from official documents instead of only hand-authoring every question.

## 3. Features

- Role-based learner and admin experiences
- Diagnostic assessment with rule-based adaptive difficulty
- Real, backend-computed competency scoring and gap classification (HIGH/MEDIUM/LOW)
- Personalized learning path, ordered by real gap size
- iGOT Karmayogi-style course recommendations (clearly labeled demo data)
- Gap-focused reassessment targeting an officer's single weakest sub-competency
- RAG pipeline: PDF upload → text extraction → chunking → vector retrieval → LLM question generation → admin review/approve/reject
- AI Assistant chat grounded in the officer's own real competency data
- Admin workforce analytics, officer directory, and CSV reports built from live database data
- JWT-based demo authentication with backend-enforced role authorization

## 4. Architecture

```
Browser (frontend/) ──HTTP/JSON──> Express API (backend/) ──SQL──> SQLite (backend/database/data.sqlite)
                                          │
                                          └──HTTPS──> Anthropic API (only if ANTHROPIC_API_KEY is set)
```

The backend serves the frontend as static files too, so `npm start` runs the whole app from one process.

## 5. Technology Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Vanilla JavaScript (ES modules), Chart.js, Lucide icons | Preserves your original design; no build step, easy to defend to judges |
| Backend | Node.js + Express | Simple, widely understood, minimal boilerplate |
| Database | SQLite (via `better-sqlite3`) | Real relational DB, zero external setup — see HACKATHON_GUIDE.md for the Postgres tradeoff discussion |
| Auth | JWT + bcrypt | Industry-standard, simple to explain, clearly labeled as demo login |
| PDF extraction | `pdfjs-dist` | Actively maintained, handles modern PDFs reliably |
| Retrieval | Hand-written TF-IDF + cosine similarity | Real vector search, no external embeddings API required |
| LLM | Anthropic API (`claude-sonnet-4-6`) | Real question generation + AI chat when a key is configured |

## 6. Folder Structure

```
project/
├── frontend/
│   ├── index.html
│   ├── css/style.css                  (unchanged from your original design)
│   └── js/
│       ├── app.js                     entry point — wires everything together
│       ├── state.js                   shared in-memory app state
│       ├── api.js                     THE only file that calls the backend
│       ├── router.js                  view switching + shell nav
│       ├── auth.js                    login / role select / logout
│       ├── config.js                  display config fetched from backend
│       ├── utils.js                   DOM helpers, toast, modal
│       └── pages/
│           ├── learner.js             dashboard, competencies, progress, profile
│           ├── assessment.js          diagnostic / reassessment / AI assessment flow
│           ├── learning.js            learning path + iGOT
│           ├── ai.js                  AI assistant chat, notifications, search
│           ├── admin.js               workforce dashboard, officers, reports, settings
│           └── adminQuiz.js           knowledge base + RAG quiz generator
│
├── backend/
│   ├── server.js                      Express entry point
│   ├── config/appConfig.js            ← the ONE place to change frequently-tuned values
│   ├── routes/                        one file per resource (auth, assessments, documents, ...)
│   ├── services/                      business logic (assessment scoring, RAG, LLM calls, iGOT)
│   ├── middleware/                    auth (JWT) and file upload validation
│   └── database/
│       ├── schema.sql                 full relational schema
│       ├── db.js                      connection
│       └── seed.js                    populates demo data on first run
│
├── data/                              static reference + demo data (roles, competencies, seed officers)
├── .env.example
├── package.json
├── README.md                          (this file)
└── HACKATHON_GUIDE.md                 live-demo cheat sheet + judge Q&A
```

## 7. Database

SQLite, one file, real SQL (see `backend/database/schema.sql`). Relationship overview:

```
OFFICER → ASSESSMENT → RESPONSES → COMPETENCY_SCORE → COMPETENCY GAP
        → LEARNING RECOMMENDATION → REASSESSMENT → UPDATED SCORE
```

Key tables: `officers`, `roles`, `competencies`, `sub_competencies`, `assessments`, `assessment_questions`, `responses`, `competency_scores`, `questions` (bank + AI-generated), `documents`, `document_chunks`, `learning_resources`.

## 8. Backend

Express REST API. Every route file under `backend/routes/` maps to one resource and reads like a table of contents for the API — open any one file to see everything about that resource.

## 9. Frontend

Vanilla JS split into small, purpose-named modules (see folder structure above). No framework, no build step — open any file and its name tells you what it does.

## 10. RAG (Retrieval-Augmented Generation)

```
PDF upload → text extraction (pdfjs-dist) → chunking → TF-IDF vectors →
competency query → cosine-similarity retrieval → LLM (if configured) →
structured MCQ with source document + page → admin review → approve/reject
```

See `backend/services/documentService.js`, `embeddingService.js`, `questionGenerationService.js`, and `llmService.js`.

## 11. AI

The AI Assistant (`backend/routes/ai.js`) is grounded in the officer's real competency scores from the database. If `ANTHROPIC_API_KEY` is set, it calls the real Anthropic API; otherwise it returns a clearly labeled fallback reply instead of pretending to be AI-powered.

## 12. Assessment Engine

`backend/services/assessmentService.js` selects questions, scores responses, computes competency scores, classifies gaps, and drives rule-based adaptive difficulty. The frontend never computes or submits a score — it only submits which option was clicked.

## 13. Competency Gap Calculation

```
gap = requiredScore - currentScore
gap >= HIGH_GAP_THRESHOLD (default 20)   → HIGH
gap >= MEDIUM_GAP_THRESHOLD (default 10) → MEDIUM
otherwise                                 → LOW
```
Thresholds are configurable in one place: `backend/config/appConfig.js`.

## 14. Reassessment

`assessmentService.findWeakestFocus()` finds the officer's single weakest competency, then their weakest sub-competency within it (by response accuracy), and `selectReassessmentQuestions()` builds a small targeted question set from just that area — not a random general set.

## 15. Installation

```bash
git clone <your-repo>   # or unzip the project
cd project
npm install
cp .env.example .env    # then optionally add your ANTHROPIC_API_KEY
npm start
```

Open http://localhost:4000

## 16. Environment Setup

See `.env.example`. `JWT_SECRET` and `PORT` have sensible defaults. `ANTHROPIC_API_KEY` is optional — without it, AI features run in clearly-labeled fallback mode instead of crashing.

## 17. Database Setup

None needed — SQLite creates `backend/database/data.sqlite` automatically on first run and seeds it with demo data. To reset: delete that file and restart the server (or run `npm run seed`).

## 18. Running the Project

```bash
npm start        # production-style run
npm run dev      # auto-restarts on file changes (node --watch)
npm run seed     # re-seed manually (only affects an empty database)
```

Demo login: any email from `data/demoData.js` (e.g. `officer.sharma@mospi.gov.in`), password `demo1234`. Admin account: `admin@mospi.gov.in` / `demo1234`.

## 19. Common Errors

| Symptom | Fix |
|---|---|
| `EADDRINUSE` on start | Another process is using port 4000 — change `PORT` in `.env` |
| Login fails with correct password | Delete `backend/database/data.sqlite` and restart to reseed |
| "REQUIRES API CONFIGURATION" on question generation | Add `ANTHROPIC_API_KEY` to `.env` and restart |
| Upload rejected | Only `.pdf` files are supported, max size set by `MAX_FILE_SIZE_MB` in `appConfig.js` |

## 20. Hackathon Demo Flow

1. Log in as a **fresh** officer (or use the pre-filled demo credentials) → select a role → you land directly on the **Diagnostic Assessment** intro, not a dashboard — because there's nothing to show yet
2. Answer a few questions, watch difficulty adapt (rule-based) → Submit → **Result** page shows Required vs Your Score per competency, plus HIGH/MEDIUM/LOW priority buckets
3. Click through the chained CTAs: **View Competency Gaps → iGOT Learning Resources → Start Targeted AI Assessment**
4. On the iGOT page, note the top recommendation is matched to your *actual* weakest sub-competency, not just your role
5. Click **Start Targeted AI Assessment** — if no document/API key is configured yet, it shows the honest "requires configuration" message (with proof that retrieval ran) instead of faking a quiz
6. Log in as `admin@mospi.gov.in` → Knowledge Base → upload a PDF covering that same competency → AI Quiz Generator isn't required for this to work automatically — the learner's Targeted AI Assessment will now succeed with a live-generated, source-cited question
7. Back as the officer → Start Targeted AI Assessment again → answer it → **Result** page now shows a real Before → After comparison
8. As admin: Officer Directory → Reports → download a live CSV

## HONEST USER JOURNEY (what actually happens, in order)

```
LOGIN → ROLE IDENTIFIED → (no scores shown yet) → DIAGNOSTIC ASSESSMENT
  → ROLE-BASED QUESTIONS → BACKEND SCORES IT → REQUIRED VS CURRENT SHOWN
  → COMPETENCY GAPS (HIGH/MEDIUM/LOW) → WHY IT MATTERS
  → iGOT RESOURCE MATCHED TO WEAK SUB-COMPETENCY
  → TARGETED AI ASSESSMENT (live RAG retrieval + LLM generation, or honest failure)
  → REASSESSMENT SCORE → BEFORE vs AFTER COMPARISON → UPDATED COMPETENCY PROFILE
```
See `HACKATHON_GUIDE.md` for the full judge Q&A on every step of this loop.

---

## HONEST IMPLEMENTATION STATUS

| Feature | Status |
|---|---|
| Frontend | Implemented |
| Backend | Implemented |
| Database (SQLite, not PostgreSQL — see HACKATHON_GUIDE.md) | Implemented |
| Authentication | Demo (JWT + bcrypt against real DB; not a government identity provider) |
| Assessment engine | Implemented |
| Competency scoring | Implemented |
| Adaptive assessment | Implemented (rule-based, not ML — labeled as such in the UI) |
| Dashboard/competency gating before diagnostic | Implemented (no scores shown until a real assessment exists) |
| RAG retrieval (chunking + vector search) | Implemented (TF-IDF, not neural embeddings) |
| Targeted AI Assessment (live RAG + LLM, gap-specific) | Implemented / requires `ANTHROPIC_API_KEY` + an indexed document for that competency |
| Source grounding | Implemented |
| Gap-focused reassessment (bank-based fallback) | Implemented |
| Before/after score comparison | Implemented |
| iGOT Karmayogi resource mapping (gap + sub-competency matched) | Mock / demo catalogue (no real API credentials available) |
| AI Assistant | Implemented / requires `ANTHROPIC_API_KEY` for real answers (labeled fallback otherwise) |
| Reports | Implemented (CSV, real data) / PDF export not implemented |

Nothing above is marked "Implemented" unless it is genuinely backed by real code and real data — see `HACKATHON_GUIDE.md` for the reasoning behind each honest caveat.
