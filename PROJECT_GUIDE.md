# PROJECT_GUIDE.md

Internal reference for making fast, safe changes to this project during SIH. Written after a full read of every file. See also `README.md` (architecture/DB detail) and `HACKATHON_GUIDE.md` (judge Q&A, "where do I change X" cheat sheet) — this file consolidates and extends both for quick lookup.

---

# Project Overview

**AI Competency Intelligence Platform** — a full-stack competency-gap assessment tool for officers in India's Official Statistical System (MoSPI-style roles: Data Collector, Field Officer, Statistical Analyst).

What it does:
1. Officer logs in, selects a role → gets a role-specific competency framework
2. Takes a diagnostic assessment (backend-selected questions, rule-based adaptive difficulty)
3. Backend scores it and computes per-competency gaps (`HIGH` / `MEDIUM` / `LOW`, based on `required − current`)
4. Officer gets a personalized learning path + iGOT Karmayogi-style course recommendations, ranked by gap size
5. Officer can take a **Targeted AI Assessment** — a real RAG pipeline (PDF → chunks → TF-IDF retrieval → LLM or local NLP question generation) grounded in admin-uploaded documents, focused on their weakest competency
6. Reassessment closes the loop with a real before/after score comparison
7. Admins get workforce analytics, an officer directory, a knowledge base (PDF upload/index), an AI quiz generator with approve/reject review, and CSV reports

**Honesty is a design principle of this codebase** — every feature that is mocked/demo (iGOT integration, government login, LLM fallback replies) is clearly labeled as such in both the UI and the code comments, rather than faked. Keep that pattern when adding new features.

---

# Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JavaScript (ES modules), **no build step** — open any `.js` file and run it as-is |
| Charts | Chart.js (loaded via CDN `<script>` in `index.html`) |
| Icons | Lucide (loaded via CDN, `lucide.createIcons()` called after every render) |
| Backend | Node.js + Express 4 |
| Database | SQLite via `better-sqlite3` — single file at `backend/database/data.sqlite` |
| Auth | JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`) |
| File upload | `multer` (PDF only, size-limited via config) |
| PDF text extraction | `pdfjs-dist` (legacy build) |
| Retrieval / RAG | Hand-written TF-IDF + cosine similarity (no external embeddings API) |
| LLM | Anthropic API, model `claude-sonnet-4-6`, called via raw `fetch()` — **optional**, everything degrades to an honest fallback if `ANTHROPIC_API_KEY` is unset |
| Config | `dotenv` |

No React/Vue/webpack/etc. — the whole frontend is plain JS modules served statically by Express.

---

# Folder Structure

```
project/
├── frontend/
│   ├── index.html          Single HTML file — every "page" is a hidden <section data-view="..."> toggled by JS
│   ├── css/style.css       Entire design system (CSS variables, all component styles)
│   └── js/
│       ├── app.js          Entry point — imports every page module, wires router + shell
│       ├── state.js        One shared in-memory object (session state, NOT source of truth)
│       ├── api.js          THE ONLY file that calls the backend (fetch wrapper)
│       ├── router.js       Two-level routing: showRoute() (public/login/role/app) + navigate() (views inside app shell)
│       ├── auth.js         Login, demo quick-sign-in, role selection, logout
│       ├── config.js       Fetches display config (question count, passing score, thresholds) from /api/config
│       ├── utils.js        $ / $all / el DOM helpers, toast, modal, formatters
│       └── pages/
│           ├── learner.js    dashboard, competencies list/detail, progress, profile
│           ├── assessment.js diagnostic/reassessment/AI assessment question flow + result screen
│           ├── learning.js   learning path timeline + iGOT browse/recommend
│           ├── ai.js         AI Assessment (PDF-RAG mode + "According to You" mode), floating AI chat assistant, notifications, global search
│           ├── admin.js      workforce dashboard, officer directory/detail, reports, settings
│           └── adminQuiz.js  Knowledge Base table + AI Quiz Generator (generate/approve/reject)
│
├── backend/
│   ├── server.js               Express entry point — mounts all routes, serves frontend as static files
│   ├── config/appConfig.js     ★ THE ONE PLACE for tunable values (passing score, gap thresholds, question counts, LLM model, chunk sizes)
│   ├── routes/                 One file per REST resource — each route file is a table of contents for that resource
│   ├── services/                Business logic (see "Important Files" below)
│   ├── middleware/
│   │   ├── auth.js             requireAuth (JWT check) + requireAdmin (role check)
│   │   └── upload.js           multer config — file type/size validation
│   ├── database/
│   │   ├── schema.sql           Full relational schema (SQLite, CREATE TABLE IF NOT EXISTS)
│   │   ├── db.js                Opens/creates the SQLite file, applies schema
│   │   └── seed.js              Populates roles/competencies/officers/questions/resources on first run
│   └── uploads/                 Where uploaded PDFs are stored on disk (multer destination)
│
├── data/                        Static reference + demo data, imported by seed.js
│   ├── roles.js                 ROLES array — role id, name, icon, description, competency list
│   ├── competencies.js          COMPETENCY_LIB — competency name → { required score, sub-competencies }
│   ├── demoData.js              OFFICERS (demo accounts) + QUESTION_BANK (50 hand-authored MCQs)
│   └── courses.js               IGOT_COURSES — static demo course catalogue tagged by competency/sub-competency
│
├── .env.example                 Template for JWT_SECRET / PORT / ANTHROPIC_API_KEY
├── package.json
├── README.md                    Full architecture writeup (read this for deep detail)
└── HACKATHON_GUIDE.md            Judge Q&A + "where do I change X" cheat sheet
```

---

# Important Files

**Frontend**
- `frontend/index.html` — every view is a static `<section data-view="...">` in the DOM (hidden/shown by `router.js`), plus the public landing page and login screen as separate top-level `.route` divs. No templating engine — all dynamic content is injected via `innerHTML` from the page modules.
- `frontend/js/api.js` — single source of all backend calls. If you need to find/add a network call, this is the only file that should contain `fetch()`.
- `frontend/js/router.js` — `GATED_VIEWS` (dashboard, competencies, learning-path, igot, progress) redirect to the diagnostic assessment if the officer hasn't completed one yet. `BREADCRUMBS` map controls the header text per view.
- `frontend/js/state.js` — session state only (token, officer, role, current assessment progress, chart registry). Never treat this as a database — always re-fetch from the backend.

**Backend**
- `backend/server.js` — route mounting + static frontend serving, all in one file.
- `backend/config/appConfig.js` — **open this first** for almost any "change a number" request (passing score, question counts, gap thresholds, chunk size, LLM model name).
- `backend/services/assessmentService.js` — all scoring math: `classifyGap()`, `calculateScore()`, `calculateCompetencyScores()`, `nextDifficulty()` (rule-based adaptive difficulty), `findWeakestFocus()` (drives targeted AI assessment + reassessment + iGOT gap recommendation).
- `backend/services/embeddingService.js` — TF-IDF chunking/vectorization/cosine-similarity retrieval (the "real vector search" part of RAG).
- `backend/services/documentService.js` — PDF → text (pdfjs-dist) → chunks → stored vectors, on upload.
- `backend/services/questionGenerationService.js` — orchestrates RAG: retrieve chunks → LLM (if configured) → fallback to local NLP generator → fallback to question bank. Three entry points: `generateQuestion` (admin single-question), `generateLiveQuestionSet` (targeted/personalized assessment), `generateQuestionsFromDocument` (PDF-picker mode).
- `backend/services/llmService.js` — the only file that calls the Anthropic API directly. `isConfigured()` gates every LLM feature; every function has an honest non-LLM fallback.
- `backend/services/nlpQuestionGenerator.js` — regex/pattern-based local MCQ generator used when no API key is set, so the demo works without one.
- `backend/services/igotService.js` — matches `data/courses.js` entries to an officer's actual weakest competency + sub-competency.
- `backend/database/schema.sql` — read this to understand every table and FK relationship.
- `backend/database/seed.js` — idempotent (checks row counts before seeding); use `node backend/database/seed.js --force` to reload after editing `data/*.js`.

---

# Backend Flow

```
Request → Express (server.js) → route file (backend/routes/*.js)
  → middleware (requireAuth / requireAdmin / upload) if needed
  → service file (business logic, DB reads/writes via better-sqlite3 prepared statements)
  → route sends JSON response
```

Key rule baked into the code: **the frontend never computes or sends a score.** It only sends which option index was clicked (`POST /api/assessments/:id/responses`); `assessmentService.calculateScore()` and `calculateCompetencyScores()` do all the math server-side from stored `responses` rows.

Errors: any thrown/passed error lands in the catch-all error handler in `server.js` and returns `{ error, detail }` with a 500 — routes mostly do their own validation and return 400/401/403/404 with a specific message before that.

---

# Frontend Flow

```
index.html loads → app.js `init()` runs on DOMContentLoaded
  → registers page render functions with router.js (setRenderers)
  → wires up public site, login, role select, shell nav, AI assistant, global search
  → shows the public landing page (view-public)

User logs in (auth.js doLogin) → api.login() → JWT stored in state.token
  → roles fetched → role-select screen (non-admin) or straight into app (admin)
  → enterApp() (app.js) decides: no completed diagnostic? → assessment-intro. Otherwise → dashboard.

Inside the app shell: router.js `navigate(view, payload)` swaps which
<section data-view="..."> is visible and calls the registered render
function for that view, which itself calls api.js functions and
injects HTML via innerHTML.
```

Nothing is server-rendered — every page module is responsible for its own `innerHTML` + event listener wiring on every navigation (no virtual DOM / diffing).

---

# Database Flow

SQLite, one file (`backend/database/data.sqlite`), created + seeded automatically on first `npm start`. Full relational schema in `backend/database/schema.sql`.

```
OFFICER → ASSESSMENT → ASSESSMENT_QUESTIONS/RESPONSES → COMPETENCY_SCORES
        → LEARNING_PROGRESS (against LEARNING_RESOURCES)
DOCUMENTS → DOCUMENT_CHUNKS → QUESTIONS (source_document/source_page/source_chunk_id
            link a RAG-generated question back to its exact source)
```

`competency_scores` is **append-only** (never overwritten) — every finished assessment inserts a new row per affected competency, which is what powers the Progress page's before/after view and the reassessment comparison. To reset all data: delete `backend/database/data.sqlite` and restart (or `npm run seed`).

---

# Authentication Flow

Demo auth, not a real government identity provider (explicitly labeled `DEMO_LOGIN` in the login response).

```
POST /api/auth/login { email, password }
  → bcrypt.compareSync against officers.password_hash
  → jwt.sign({ id, employeeId, name, roleId, isAdmin }, JWT_SECRET, 12h expiry)
  → frontend stores token in state.token (memory only, not localStorage)
  → every subsequent request: Authorization: Bearer <token> header (see api.js `request()`)
  → backend middleware/auth.js `requireAuth` verifies + attaches req.officer
  → `requireAdmin` additionally checks req.officer.isAdmin (trusts the signed JWT, not anything the frontend claims)
```

All demo accounts use password `demo1234` (see `data/demoData.js` for the account list; `admin@mospi.gov.in` is the only admin).

---

# API Flow

Every route is mounted in `backend/server.js`. Full list (all require `Authorization: Bearer <token>` unless noted):

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Login (no auth required) |
| GET | `/api/auth/me` | Current officer + `hasCompletedDiagnostic` flag |
| GET | `/api/roles` | List roles (no auth required) |
| GET | `/api/competencies` | Officer's competencies + current/required/gap |
| GET | `/api/competencies/:name` | Detail + sub-competencies + history |
| GET | `/api/officers` | Admin: full officer directory |
| GET | `/api/officers/:id` | Admin or self: officer detail |
| POST | `/api/assessments` | Start diagnostic assessment |
| POST | `/api/assessments/:id/responses` | Submit one answer, get correctness + adapted difficulty |
| POST | `/api/assessments/:id/submit` | Finalize — backend computes final score |
| GET | `/api/assessments/:id/result` | Full result breakdown |
| GET | `/api/assessments` | Officer's assessment history |
| GET | `/api/assessments/focus` | Officer's current weakest competency/sub-competency |
| POST | `/api/assessments/ai-targeted` | Live RAG+LLM assessment targeting weakest gap |
| POST | `/api/assessments/reassessment` | Bank-based fallback reassessment |
| GET | `/api/assessments/available-documents` | Documents ready for AI-from-document mode |
| POST | `/api/assessments/ai-from-document` | RAG assessment from a specific uploaded PDF |
| POST | `/api/assessments/ai-personalized` | "According to You" gap-targeted or custom-competency assessment |
| GET | `/api/learning-path` | Personalized path, gap-ranked |
| POST | `/api/learning-path/:id/complete` | Mark module complete, unlock next |
| GET | `/api/igot` | Browse all iGOT demo courses for role |
| GET | `/api/igot/recommendations` | Gap-specific top recommendation |
| GET | `/api/documents` | Admin: knowledge base list |
| POST | `/api/documents/upload` | Admin: upload + index a PDF |
| POST | `/api/questions/generate` | Admin: generate one RAG question (pending review) |
| GET | `/api/questions/pending` | Admin: questions awaiting review |
| POST | `/api/questions/:id/approve` \| `/reject` | Admin: review decision |
| POST | `/api/ai/chat` | AI Assistant chat, grounded in officer's real competency data |
| GET | `/api/reports/:key` | Admin: JSON report preview (`competency-gap`, `role-performance`, `learning-progress`, `assessment`) |
| GET | `/api/reports/:key/csv` | Admin: same report as CSV download |
| GET | `/api/health` | `{ status, llmConfigured }` |
| GET | `/api/config` | Public display config (question count, passing score, gap thresholds) |

---

# State Management

No framework state library — `frontend/js/state.js` exports one plain object (`state`) imported by every module that needs it. It holds the current session only (token, officer, role, in-progress assessment answers, Chart.js instance registry for cleanup, AI chat history). **The backend/database is always the source of truth** — `state` is just a cache for the current page render; every view re-fetches from `api.js` on navigation rather than trusting stale `state` data for anything score-related.

---

# Environment Variables

Defined in `.env` (copy from `.env.example`):

| Variable | Required? | Purpose |
|---|---|---|
| `JWT_SECRET` | No (has insecure default) | Signs login session tokens |
| `PORT` | No (defaults to 4000) | Backend listen port |
| `ANTHROPIC_API_KEY` | No | Enables real Claude LLM calls for RAG question generation + AI chat. Without it, both features run in a clearly-labeled fallback mode instead of crashing. |

All other tunable values (question counts, passing score, gap thresholds, chunk sizes, LLM model name) live in `backend/config/appConfig.js`, **not** in `.env` — that file is the single source of truth for "frequently tuned during a demo" numbers.

---

# Third Party Packages

| Package | Used for |
|---|---|
| `express` | HTTP server + routing |
| `better-sqlite3` | Synchronous SQLite driver |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT sign/verify |
| `cors` | CORS middleware (open, since frontend is same-origin anyway) |
| `multer` | Multipart file upload handling |
| `pdfjs-dist` | PDF text extraction (legacy build, used headless — no rendering) |
| `dotenv` | Loads `.env` into `process.env` |
| Chart.js (CDN) | All charts (bar, doughnut) — no npm install, loaded via `<script>` in `index.html` |
| Lucide (CDN) | All icons — `lucide.createIcons()` re-run after every DOM update that adds new icons |

No frontend package.json / npm packages at all — frontend is 100% hand-written ES modules + two CDN scripts.

---

# Build Commands

There is no build step. The frontend is served as-is. Only backend dependencies need installing:

```bash
npm install
```

---

# Run Commands

```bash
npm start        # production-style run: node backend/server.js
npm run dev       # auto-restart on file changes: node --watch backend/server.js
npm run seed      # manually re-run seed.js (only affects an empty database unless --force)
node backend/database/seed.js --force   # force-reload data/*.js into an EXISTING database
```

Then open `http://localhost:4000` (or whatever `PORT` is set to) — one process serves both API and frontend.

First run auto-creates and seeds `backend/database/data.sqlite`. To fully reset all data: delete that file and restart.

---

# Deployment Commands

No deployment tooling is configured in this project (no Dockerfile, no CI config, no cloud config) — it's built to run as a single `node backend/server.js` process, which is portable to any standard Node host (Render, Railway, a VM, etc.) as long as:
- `npm install && npm start` is the run command
- `.env` is configured on the host (`JWT_SECRET` at minimum for anything beyond a demo)
- The filesystem is writable and persistent (SQLite file + `backend/uploads/` both live on disk — an ephemeral filesystem host will lose data on redeploy)

If you need containerization or a specific host's deploy config during the hackathon, ask and it'll be added as a new, isolated file (e.g. `Dockerfile`) — nothing above needs to change for that.

---

# Things NOT to Modify

These are tightly coupled — changing them casually will break other parts of the app:

- **`data/competencies.js` competency **names**** — used as literal string keys/foreign-key-style references across `data/roles.js`, `data/courses.js`, `data/demoData.js` (QUESTION_BANK `comp` field), `backend/database/schema.sql` (`competencies.name` PRIMARY KEY), and everywhere `competency` is passed as a string in services/routes. Renaming a competency requires updating it **everywhere it's referenced**, not just in one file — otherwise gap lookups silently fall back to a default required score of 80 and matched courses/questions disappear.
- **`backend/config/appConfig.js` variable names** — many are read directly by name in `server.js`'s `/api/config` endpoint and throughout services. Renaming a variable (vs. changing its value) will break things; changing its *value* is exactly what this file is for.
- **`schema.sql` table/column names** — every service uses raw SQL string queries (`db.prepare('SELECT ... FROM ...')`), not an ORM, so there's no compile-time safety net if you rename a column. If a schema change is needed, grep the whole `backend/` tree for the old name first.
- **JWT payload shape** (`{ id, employeeId, name, roleId, isAdmin }` in `backend/routes/auth.js`) — `middleware/auth.js` and every route that reads `req.officer.*` assumes this exact shape.
- **`frontend/js/api.js` function signatures** — every page module imports named functions from here; renaming/reshaping one means finding and updating every call site.
- **`frontend/index.html` view section IDs** (`id="v-dashboard"` etc.) and `data-view` attributes — `router.js` and `app.js`'s `setRenderers()` map depend on these matching exactly between the HTML and the JS view-name strings.
- **`node_modules`** — this bundled copy was built on a different OS than a Linux deploy target (it ships prebuilt native `better-sqlite3` binaries). If the app ever fails to start with an "invalid ELF header" error, that's why — run `npm install` fresh on the target machine rather than trying to reuse the bundled folder cross-platform.

---

# If I Want To Change X

| Change | Where |
|---|---|
| **Homepage / landing page content** | `frontend/index.html` — `<div id="view-public">` section (hero, about, how-it-works, features, comparison). Styling: `frontend/css/style.css` (`.hero`, `.section`, `.feature-card` etc.) |
| **Login screen / demo accounts shown** | `frontend/index.html` `<div id="view-login">`; actual login logic in `frontend/js/auth.js`; which accounts exist in `data/demoData.js` (`OFFICERS`) |
| **Add a dashboard widget / KPI** | `frontend/js/pages/learner.js` → `renderDashboard()` |
| **Change the AI prompt (question generation)** | `backend/services/llmService.js` → `generateQuestionFromChunks()` (system/user prompt strings) |
| **Change the AI prompt (chat assistant)** | `backend/services/llmService.js` → `chatWithContext()` |
| **Change which LLM model is used** | `backend/config/appConfig.js` → `LLM_MODEL` |
| **Change color theme** | `frontend/css/style.css` → `:root` CSS variables at the top (`--signal`, `--indigo`, `--amber`, `--paper-*`, etc.) |
| **Add a new page/feature to the learner sidebar** | 1) Add `<button class="nav-item" data-view="...">` in `frontend/index.html` sidebar nav, 2) add `<section class="view" data-view="...">` in the same file's app-content area, 3) write a `renderX()` function in the right `frontend/js/pages/*.js` file, 4) register it in `setRenderers()` in `frontend/js/app.js`, 5) add a breadcrumb entry in `frontend/js/router.js` `BREADCRUMBS` |
| **Add a new backend API endpoint** | Add a route in the relevant `backend/routes/*.js` file (or a new file, then `app.use('/api/...', require('./routes/newfile'))` in `backend/server.js`); add business logic to a `backend/services/*.js` file if non-trivial; add the corresponding call in `frontend/js/api.js` |
| **Remove a feature** | Remove its nav button + `<section>` in `index.html`, its entry in `setRenderers()`, and its render function — leave the backend route alone unless asked to remove that too (removing backend routes risks breaking other flows that call the same service functions) |
| **Change the database (e.g. swap to Postgres)** | `backend/database/db.js` (swap `better-sqlite3` for a `pg` client) + `backend/database/schema.sql` (swap `AUTOINCREMENT`→`SERIAL` etc.) — every `db.prepare(...).run()/.get()/.all()` call across `backend/` would need a small adapter, but the schema itself transfers directly. Not recommended mid-hackathon. |
| **Change navigation / sidebar order** | `frontend/index.html` — reorder the `<button class="nav-item">` elements inside `<nav id="learner-nav">` or `<nav id="admin-nav">` |
| **Add/edit a competency** | `data/competencies.js` (`COMPETENCY_LIB`) — add `'Name': { required: N, sub: [...] }`, then map it to a role in `data/roles.js`, then `node backend/database/seed.js --force` to load it. Also add matching iGOT entries in `data/courses.js` if you want recommendations to work for it. |
| **Add/edit a role** | `data/roles.js` (`ROLES` array). ⚠️ Note: the existing `'aryan'` / "secompB Analyst" role references competencies (`Maths Analysis`, `graphics`, `Data Progamming`, `wed dev`) that are **not** defined in `data/competencies.js` — this looks like leftover test data. Selecting that role in the UI will show 0%/HIGH gap for all of its "competencies" since they don't exist in the `competencies` table. Worth removing or fixing before a live demo unless intentional. |
| **Change passing score / question counts / gap thresholds** | `backend/config/appConfig.js` (`PASSING_SCORE`, `NUMBER_OF_ASSESSMENT_QUESTIONS`, `REASSESSMENT_QUESTION_COUNT`, `HIGH_GAP_THRESHOLD`, `MEDIUM_GAP_THRESHOLD`) — the frontend picks these up automatically via `GET /api/config`, nothing to change on the frontend side |
| **Add/edit hand-authored question bank questions** | `data/demoData.js` (`QUESTION_BANK` array), then `node backend/database/seed.js --force` |
| **Change PDF upload limits / supported types** | `backend/config/appConfig.js` (`MAX_FILE_SIZE_MB`, `SUPPORTED_FILE_TYPES`) |
| **Change RAG chunking/retrieval behavior** | `backend/config/appConfig.js` (`CHUNK_SIZE_CHARS`, `CHUNK_OVERLAP_CHARS`, `RETRIEVAL_TOP_K`) for tuning; `backend/services/embeddingService.js` for the actual chunking/TF-IDF/cosine-similarity logic |
| **Change adaptive difficulty rule** | `backend/services/assessmentService.js` → `nextDifficulty()` |
| **Change gap calculation formula** | `backend/services/assessmentService.js` → `classifyGap()` (currently `gap = required − current`, thresholded by `appConfig.js` values) |
| **Add/edit an admin report** | `backend/routes/reports.js` → `REPORT_BUILDERS` object (add a new key with a SQL query + column list); add its metadata to `REPORT_META` in `frontend/js/pages/admin.js` → `renderAdminReports()` |
| **Change iGOT course catalogue** | `data/courses.js` (`IGOT_COURSES`) — each entry needs `competency` (must match a `data/competencies.js` name) and ideally `subCompetency` for exact-match recommendations |

---

# Beginner Editing Guide

Plain-language answers to "where do I click/type to change ___". Everything below assumes you're comfortable with basic HTML/CSS/JS — no advanced React/backend knowledge needed, because this project doesn't use any.

**1. Where I change the homepage** — Open `frontend/index.html`, find the `<!-- ===== HOMEPAGE ... ===== -->` banner near the top. Everything inside `<div id="view-public">` right after it is the homepage. Just edit the words.

**2. Where I change login** — Text/layout: `frontend/index.html`, the `<!-- ===== LOGIN PAGE ===== -->` section. What happens when someone clicks "Sign In": `frontend/js/auth.js`.

**3. Where I change the dashboard** — The dashboard is built by JavaScript, not hardcoded HTML. Open `frontend/js/pages/learner.js` and find `// ===== DASHBOARD =====`.

**4. Where I change navigation** — `frontend/index.html`, look for `<!-- ===== NAVIGATION ... ===== -->` above `<nav id="learner-nav">` (or `admin-nav`). Each `<button class="nav-item" data-view="...">` is one sidebar link.

**5. Where I change buttons** — Buttons that are always on screen (login, nav, header) live directly in `frontend/index.html`. Buttons inside a page (like "Start Assessment") are built inside that page's render function in `frontend/js/pages/*.js` — search for the button's visible text.

**6. Where I change displayed text** — Static text (homepage, login labels, nav labels): `frontend/index.html`. Dynamic text (scores, names, messages built from data): search for the exact words inside `frontend/js/pages/*.js` — it's almost always a plain JS template string.

**7. Where I change colors** — `frontend/css/style.css`, the `===== COLORS & THEME =====` block at the very top, inside `:root`. One value changes that color everywhere in the app.

**8. Where I change AI prompts** — `backend/services/llmService.js`. Look for `===== AI PROMPT: ... =====` banners — the actual text sent to the AI is the `system` and `user` string variables right below each banner.

**9. Where I change AI functionality (logic, not wording)** — `backend/services/questionGenerationService.js` (decides what happens when a quiz is generated) and `backend/services/llmService.js` (talks to the AI / falls back when no key is set).

**10. Where I change API calls** — Frontend side (what the browser sends): `frontend/js/api.js`, grouped under `===== API CALLS: X =====` banners. Backend side (what the server does with it): the matching file in `backend/routes/`.

**11. Where I change database-related code** — Table structure: `backend/database/schema.sql`. Reading/writing data: inside the relevant `backend/routes/*.js` or `backend/services/*.js` file (search for `db.prepare(`).

**12. Where I add a new page** — See the "Add a new page/feature to the learner sidebar" row in the Quick Change Map below — it's a 5-step recipe.

**13. Where I add a new button** — If it's on an existing page: open that page's file in `frontend/js/pages/`, add a `<button>` to the HTML template string, then `.addEventListener('click', ...)` right after (copy the pattern of a nearby button in the same file).

**14. Where I change existing functionality** — Find the visible text or behavior with your editor's search (Ctrl+F / Cmd+F) across `frontend/js/pages/` for frontend behavior, or across `backend/routes/` + `backend/services/` for backend behavior. The `===== SECTION =====` banners added throughout the code narrow this down fast.

**15. Which files I should NOT touch** — See "Things NOT to Modify" above. Short version: don't rename competency names, database column names, or `api.js` function names without updating every place that uses them.

---

# Quick Change Map

| If I want to change... | Open this file/folder | What to look for |
|---|---|---|
| Homepage | `frontend/index.html` | `<!-- ===== HOMEPAGE ... =====` banner |
| Login (text/layout) | `frontend/index.html` | `<!-- ===== LOGIN PAGE =====` banner |
| Login (behavior) | `frontend/js/auth.js` | `doLogin()` |
| Dashboard | `frontend/js/pages/learner.js` | `// ===== DASHBOARD =====` |
| Navigation / sidebar | `frontend/index.html` | `<!-- ===== NAVIGATION ... =====` banners above `<nav id="learner-nav">` / `admin-nav` |
| Button text | `frontend/index.html` (static) or the relevant `frontend/js/pages/*.js` file (dynamic) | Search for the button's visible words |
| Colors / theme | `frontend/css/style.css` | `===== COLORS & THEME =====` at the top, inside `:root` |
| AI prompt wording | `backend/services/llmService.js` | `===== AI PROMPT: ... =====` banners, then the `system`/`user` strings |
| AI quiz generation logic | `backend/services/questionGenerationService.js` | `===== GENERATE ... =====` banners |
| API call (frontend) | `frontend/js/api.js` | `===== API CALLS: X =====` banners |
| API endpoint (backend) | `backend/routes/*.js` | `===== ROUTE NAME =====` banner above each `router.get/post(...)` |
| Passing score / question counts / gap thresholds | `backend/config/appConfig.js` | Lines with `CHANGE ... HERE` comments |
| Competencies / roles | `data/competencies.js`, `data/roles.js` | The array/object literals — then run `node backend/database/seed.js --force` |
| iGOT course list | `data/courses.js` | `IGOT_COURSES` array |
| Question bank (non-AI questions) | `data/demoData.js` | `QUESTION_BANK` array — then re-seed |
| Database structure | `backend/database/schema.sql` | `CREATE TABLE` statements |
| Add a whole new page | `frontend/index.html` + `frontend/js/app.js` + a new/existing `frontend/js/pages/*.js` file | See "Add a new page/feature" row in "If I Want To Change X" above |

---

## Latest Changes

**2026-09-11 — Beginner-friendly readability pass**
- **Why:** Make the existing code easier to navigate/edit live during the SIH demo, without changing any behavior, UI, or output.
- **What changed:** Added consistent `===== SECTION =====` banner comments above every major page/function/route/service across the whole project (frontend HTML/CSS/JS and backend routes/services/config), so each piece of logic can be found with Ctrl+F. Standardized previously-inconsistent `----`/`====` comment dividers to one style. Made one safe, purely-cosmetic variable rename in `frontend/js/pages/learner.js` (the loop variable `d` → `comp` in three `.forEach()` callbacks) for readability — verified with a full diff that no other line changed.
- **Files touched:** `frontend/index.html`, `frontend/css/style.css`, `frontend/js/app.js`, `router.js`, `auth.js`, `api.js`, `utils.js`, all 6 files in `frontend/js/pages/`, `backend/server.js`, `backend/config/appConfig.js`, all 9 files in `backend/routes/`, and `backend/services/assessmentService.js`, `documentService.js`, `embeddingService.js`, `llmService.js`, `nlpQuestionGenerator.js`, `questionGenerationService.js`.
- **Dependency added:** None.
- **Command to run:** None — `npm install && npm start` still works exactly as before.
- **Manual step required:** None.
- **Verification performed:** Every JS file passed `node --check` after editing. A full `git diff` of every changed file was filtered down to non-comment lines — the only functional change across the entire project is the `d`→`comp` rename above. Did a full reinstall + server boot + end-to-end API smoke test (health, config, roles, login, start assessment, competencies) before and after the pass — identical results both times.
