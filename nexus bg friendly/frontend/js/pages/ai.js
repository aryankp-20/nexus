/* =====================================================================
   AI ASSESSMENT (learner) — Dual Mode:
     1. PDF Upload Mode (RAG): Upload a PDF → questions generated from it
     2. "According to You": Competency-gap-targeted questions
   + AI ASSISTANT + NOTIFICATIONS + SEARCH
===================================================================== */

import { state } from '../state.js';
import * as api from '../api.js';
import { $, $all, el, icons, toast, friendlyError } from '../utils.js';
import { navigate, closeAllMenus } from '../router.js';
import { beginAssessmentFlow, startReassessmentFlow } from './assessment.js';

/* ─────────────────────────────────────────────────────────────────────
   MAIN: renderAiAssessment()
───────────────────────────────────────────────────────────────────── */
// =====================================================================
// ===== AI ASSESSMENT: MODE-PICKER MENU =====
// The screen where the officer chooses between the two AI assessment
// modes: "PDF Upload" (renderPdfMode, below) and "According to You /
// Personalized" (renderPersonalMode, further below).
// =====================================================================
export async function renderAiAssessment() {
  const wrap = $('#v-ai-assessment');
  wrap.innerHTML = `
  <div class="page-head">
    <div>
      <h1>AI Assessment</h1>
      <p>Choose how you want your assessment generated — from a document (RAG), or tailored to your competency profile.</p>
    </div>
  </div>
  <div class="ai-mode-grid" id="ai-mode-grid">
    <div class="ai-mode-card" id="mode-pdf">
      <div class="amc-icon" style="background:var(--signal-100);color:var(--signal);">
        <i data-lucide="file-text"></i>
      </div>
      <div class="amc-label">Upload PDF Document</div>
      <p class="amc-desc">Upload a PDF or select from the knowledge base. Questions are generated directly from the content using RAG — the core technology of this platform.</p>
      <div class="amc-tags">
        <span class="amc-tag">RAG</span><span class="amc-tag">Source-grounded</span><span class="amc-tag">Real AI</span>
      </div>
      <button class="btn btn-primary btn-block amc-btn" id="btn-pick-pdf">
        <i data-lucide="upload"></i> Start with a Document
      </button>
    </div>
    <div class="ai-mode-card" id="mode-personal">
      <div class="amc-icon" style="background:var(--indigo);color:#fff;">
        <i data-lucide="brain-circuit"></i>
      </div>
      <div class="amc-label">According to You</div>
      <p class="amc-desc">The system finds your competency gaps and generates targeted questions using the same RAG pipeline — personalised to where you need to improve most.</p>
      <div class="amc-tags">
        <span class="amc-tag">Gap-targeted</span><span class="amc-tag">Adaptive</span><span class="amc-tag">Personalised</span>
      </div>
      <button class="btn btn-primary btn-block amc-btn" id="btn-pick-personal" style="background:var(--indigo);border-color:var(--indigo);">
        <i data-lucide="sparkles"></i> Start Personalised Assessment
      </button>
    </div>
  </div>
  <div id="ai-sub-view" style="margin-top:28px;"></div>`;

  icons();
  $('#btn-pick-pdf').addEventListener('click', renderPdfMode);
  $('#btn-pick-personal').addEventListener('click', renderPersonalMode);
}

/* ─────────────────────────────────────────────────────────────────────
   PDF / RAG MODE
───────────────────────────────────────────────────────────────────── */
let selectedDocumentId = null;
let uploadedDocumentId = null;

// =====================================================================
// ===== AI QUIZ GENERATION: MODE 1 - PDF UPLOAD (RAG) =====
// Officer uploads/picks a PDF -> backend extracts text, chunks it, and
// finds the most relevant chunks (backend/services/embeddingService.js)
// -> those chunks are sent to the AI to write real questions
// (backend/services/llmService.js). If no AI key is configured, a
// local, non-AI question generator is used instead so the demo still
// works - see backend/services/nlpQuestionGenerator.js.
// =====================================================================

async function renderPdfMode() {
  const sub = $('#ai-sub-view');
  selectedDocumentId = null; uploadedDocumentId = null;
  sub.innerHTML = `
  <div class="section-title" style="margin-bottom:14px;display:flex;align-items:center;gap:8px;">
    <i data-lucide="file-text"></i> PDF-Based RAG Assessment
  </div>
  <div class="card" style="max-width:700px;">
    <div class="section-title" style="font-size:13px;margin-bottom:10px;">Step 1 — Choose a document</div>
    <div class="ai-doc-tabs">
      <button class="ai-tab active" id="tab-existing">Existing Knowledge Base</button>
      <button class="ai-tab" id="tab-upload">Upload New PDF</button>
    </div>
    <div id="panel-existing" style="margin-top:14px;">
      <div id="doc-list-wrap"><div class="muted" style="font-size:13px;">Loading documents…</div></div>
    </div>
    <div id="panel-upload" style="display:none;margin-top:14px;">
      <div class="upload-zone" id="upload-zone">
        <i data-lucide="upload-cloud" style="width:36px;height:36px;color:var(--signal);"></i>
        <div style="margin-top:8px;font-weight:600;color:var(--text-700);">Drag & drop a PDF here</div>
        <div class="muted" style="font-size:12.5px;margin-top:4px;">or click to browse</div>
        <input type="file" id="pdf-file-input" accept="application/pdf" style="display:none;">
      </div>
      <div id="upload-status" style="margin-top:12px;"></div>
    </div>
    <div style="margin-top:18px;border-top:1px solid var(--line);padding-top:16px;">
      <div class="section-title" style="font-size:13px;margin-bottom:10px;">Step 2 — Configure your assessment</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <div>
          <label class="form-label">Topic / focus (optional)</label>
          <input class="form-input" id="pdf-topic" placeholder="e.g. sampling methods…">
        </div>
        <div>
          <label class="form-label">Difficulty</label>
          <select class="form-input" id="pdf-difficulty">
            <option value="Easy">Easy</option><option value="Medium" selected>Medium</option><option value="Hard">Hard</option>
          </select>
        </div>
      </div>
      <div style="margin-top:10px;">
        <label class="form-label">Number of questions (1–15)</label>
        <input class="form-input" id="pdf-count" type="number" min="1" max="15" value="5" style="max-width:120px;">
      </div>
    </div>
    <button class="btn btn-primary btn-block" id="btn-start-pdf" style="margin-top:16px;" disabled>
      <i data-lucide="sparkles"></i> Generate Questions from Document
    </button>
    <div id="pdf-gen-status" style="margin-top:14px;"></div>
  </div>`;
  icons();
  sub.scrollIntoView({ behavior:'smooth', block:'start' });

  loadDocumentList();

  $('#tab-existing').addEventListener('click', () => {
    $('#tab-existing').classList.add('active'); $('#tab-upload').classList.remove('active');
    $('#panel-existing').style.display = ''; $('#panel-upload').style.display = 'none';
  });
  $('#tab-upload').addEventListener('click', () => {
    $('#tab-upload').classList.add('active'); $('#tab-existing').classList.remove('active');
    $('#panel-existing').style.display = 'none'; $('#panel-upload').style.display = '';
    setupUploadZone();
  });
  $('#btn-start-pdf').addEventListener('click', startPdfAssessment);
}

function setupUploadZone() {
  const zone = $('#upload-zone');
  const fileInput = $('#pdf-file-input');
  if (!zone || !fileInput) return;
  zone.addEventListener('click', () => fileInput.click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) handleFileSelected(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFileSelected(fileInput.files[0]); });
}

async function loadDocumentList() {
  const wrap = $('#doc-list-wrap');
  if (!wrap) return;
  try {
    const { documents } = await api.getAvailableDocuments();
    if (!documents || documents.length === 0) {
      wrap.innerHTML = `<div class="muted" style="font-size:13px;padding:12px 0;">No documents in the knowledge base yet. Upload one using the tab above.</div>`;
      return;
    }
    wrap.innerHTML = `<div class="doc-select-list" id="doc-select-list">` +
      documents.map(d => `<div class="doc-select-item" data-id="${d.id}">
        <i data-lucide="file-text" style="flex-shrink:0;"></i>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:13.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${d.name}</div>
          <div class="muted" style="font-size:12px;">${d.chunkCount} chunks indexed</div>
        </div>
        <div class="doc-check" style="display:none;"><i data-lucide="check-circle-2" style="color:var(--signal);"></i></div>
      </div>`).join('') + `</div>`;
    icons();
    $all('.doc-select-item', wrap).forEach(item => {
      item.addEventListener('click', () => {
        $all('.doc-select-item', wrap).forEach(i => { i.classList.remove('selected'); i.querySelector('.doc-check').style.display = 'none'; });
        item.classList.add('selected');
        item.querySelector('.doc-check').style.display = '';
        selectedDocumentId = Number(item.dataset.id);
        uploadedDocumentId = null;
        updateStartPdfBtn();
      });
    });
  } catch (err) {
    wrap.innerHTML = `<div class="muted" style="color:var(--red);font-size:13px;">${friendlyError(err)}</div>`;
  }
}

async function handleFileSelected(file) {
  const zone = $('#upload-zone');
  const statusDiv = $('#upload-status');
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    if (statusDiv) statusDiv.innerHTML = `<div class="ai-status-box error"><i data-lucide="alert-triangle"></i> Only PDF files are supported.</div>`;
    icons(); return;
  }
  if (zone) zone.innerHTML = `<i data-lucide="loader-2" style="width:32px;height:32px;color:var(--signal);animation:spin 1s linear infinite;"></i>
    <div style="margin-top:8px;font-weight:600;color:var(--text-700);">Uploading & indexing ${file.name}…</div>`;
  icons();
  try {
    const formData = new FormData();
    formData.append('document', file);
    const res = await fetch('/api/documents/upload', {
      method: 'POST', headers: { 'Authorization': `Bearer ${state.token}` }, body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
    uploadedDocumentId = data.documentId; selectedDocumentId = null;
    if (zone) zone.innerHTML = `<i data-lucide="check-circle-2" style="width:36px;height:36px;color:var(--green);"></i>
      <div style="margin-top:8px;font-weight:600;color:var(--green);">${file.name} uploaded & indexed!</div>
      <div class="muted" style="font-size:12.5px;margin-top:4px;">Document ID: ${data.documentId} · ${data.chunkCount ?? data.chunks ?? '?'} chunks</div>`;
    icons();
    updateStartPdfBtn();
  } catch (err) {
    if (statusDiv) statusDiv.innerHTML = `<div class="ai-status-box error"><i data-lucide="alert-triangle"></i> ${err.message}</div>`;
    icons();
    if (zone) { zone.innerHTML = `<i data-lucide="upload-cloud" style="width:36px;height:36px;color:var(--signal);"></i>
      <div style="margin-top:8px;font-weight:600;color:var(--text-700);">Drag & drop a PDF here</div>
      <div class="muted" style="font-size:12.5px;margin-top:4px;">or click to browse</div>
      <input type="file" id="pdf-file-input" accept="application/pdf" style="display:none;">`; setupUploadZone(); }
    icons();
  }
}

function updateStartPdfBtn() {
  const btn = $('#btn-start-pdf');
  if (btn) btn.disabled = !(selectedDocumentId || uploadedDocumentId);
}

// ===== PDF MODE: GENERATE + START THE QUIZ (calls the AI) =====
async function startPdfAssessment() {
  const btn = $('#btn-start-pdf');
  const statusDiv = $('#pdf-gen-status');
  const docId = selectedDocumentId || uploadedDocumentId;
  if (!docId) { toast('Select or upload a document first.', 'error'); return; }
  const topic = ($('#pdf-topic') || {}).value?.trim() || '';
  const difficulty = ($('#pdf-difficulty') || {}).value || 'Medium';
  const count = Math.min(Math.max(Number(($('#pdf-count') || {}).value) || 5, 1), 15);

  btn.disabled = true;
  btn.innerHTML = '<i data-lucide="loader-2" style="animation:spin 1s linear infinite;"></i> Generating via RAG…';
  icons();
  if (statusDiv) statusDiv.innerHTML = `<div class="ai-status-box info"><i data-lucide="zap"></i> Retrieving document chunks and generating questions…</div>`;
  icons();

  try {
    const data = await api.startAiFromDocument(docId, count, difficulty, topic);
    if (!data || !data.questions || data.questions.length === 0) throw new Error('No questions were generated from this document.');
    if (statusDiv) statusDiv.innerHTML = `<div class="ai-status-box success"><i data-lucide="check-circle-2"></i>
      Generated ${data.totalQuestions} questions from <b>${data.documentName}</b> using ${data.method}.
      ${data.topic ? `<br>Topic: <b>${data.topic}</b>` : ''}
    </div>`;
    icons();
    setTimeout(() => { beginAssessmentFlow(data, 'ai'); navigate('assessment'); }, 1200);
  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="sparkles"></i> Generate Questions from Document';
    icons();
    if (statusDiv) statusDiv.innerHTML = `<div class="ai-status-box error"><i data-lucide="alert-triangle"></i> ${friendlyError(err)}</div>`;
    icons();
  }
}

/* ─────────────────────────────────────────────────────────────────────
   PERSONALISED / "ACCORDING TO YOU" MODE
───────────────────────────────────────────────────────────────────── */
// =====================================================================
// ===== AI QUIZ GENERATION: MODE 2 - "ACCORDING TO YOU" / PERSONALIZED =====
// Generates a quiz targeted at the officer's actual weakest
// competency (or a competency they pick), using whatever knowledge-
// base documents are relevant - no PDF picking required from the officer.
// =====================================================================
async function renderPersonalMode() {
  const sub = $('#ai-sub-view');
  sub.innerHTML = `<div class="section-title" style="margin-bottom:14px;display:flex;align-items:center;gap:8px;">
    <i data-lucide="brain-circuit"></i> Personalised Assessment — According to You
  </div>
  <div id="personal-focus-wrap"><div class="muted" style="font-size:13px;">Loading your profile…</div></div>`;
  icons();
  sub.scrollIntoView({ behavior:'smooth', block:'start' });

  let focus = null;
  try { focus = await api.getGapFocus(); } catch (e) {}
  const pw = $('#personal-focus-wrap');
  if (!pw) return;

  const focusBanner = focus?.hasFocus
    ? `<div class="ai-insight" style="margin-bottom:14px;">
        <div class="aii-icon"><i data-lucide="crosshair"></i></div>
        <div><div class="aii-label">YOUR BIGGEST GAP</div>
          <p>Targeting <b>${focus.competency}</b>${focus.subCompetency ? ` → <b>${focus.subCompetency}</b>` : ''} (<b>${focus.gap} pt gap</b>). Questions sourced from indexed documents.</p>
        </div>
      </div>`
    : `<div class="ai-insight" style="margin-bottom:14px;border-color:var(--amber);background:var(--amber-100);">
        <div class="aii-icon" style="background:var(--amber-100);color:var(--amber);"><i data-lucide="info"></i></div>
        <div><div class="aii-label" style="color:var(--amber);">NO DIAGNOSTIC YET</div>
          <p>Complete a diagnostic first for gap-targeted generation. Using role competency framework for now.</p>
        </div>
      </div>`;

  pw.innerHTML = `${focusBanner}
  <div class="card" style="max-width:700px;">
    <div class="section-title" style="font-size:13px;margin-bottom:10px;">Configure your personalised assessment</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      <div>
        <label class="form-label">Focus mode</label>
        <select class="form-input" id="pers-mode">
          <option value="weakest_gap">My Weakest Competency Gap (Recommended)</option>
          <option value="custom">Choose a Specific Competency</option>
        </select>
      </div>
      <div>
        <label class="form-label">Difficulty</label>
        <select class="form-input" id="pers-difficulty">
          <option value="Easy">Easy</option><option value="Medium" selected>Medium</option><option value="Hard">Hard</option>
        </select>
      </div>
    </div>
    <div id="pers-custom-comp" style="margin-top:10px;display:none;">
      <label class="form-label">Competency name</label>
      <input class="form-input" id="pers-comp-input" placeholder="e.g. Survey Methodology, Data Quality…">
    </div>
    <div style="margin-top:10px;">
      <label class="form-label">Number of questions (1–15)</label>
      <input class="form-input" id="pers-count" type="number" min="1" max="15" value="5" style="max-width:120px;">
    </div>
    <button class="btn btn-primary btn-block" id="btn-start-personal" style="margin-top:16px;background:var(--indigo);border-color:var(--indigo);">
      <i data-lucide="sparkles"></i> Generate My Personalised Assessment
    </button>
    <div id="pers-gen-status" style="margin-top:14px;"></div>
  </div>`;
  icons();

  $('#pers-mode').addEventListener('change', () => {
    $('#pers-custom-comp').style.display = $('#pers-mode').value === 'custom' ? '' : 'none';
  });
  $('#btn-start-personal').addEventListener('click', startPersonalAssessment);
}

// ===== PERSONALIZED MODE: GENERATE + START THE QUIZ (calls the AI) =====
async function startPersonalAssessment() {
  const btn = $('#btn-start-personal');
  const statusDiv = $('#pers-gen-status');
  const mode = ($('#pers-mode') || {}).value || 'weakest_gap';
  const difficulty = ($('#pers-difficulty') || {}).value || 'Medium';
  const count = Math.min(Math.max(Number(($('#pers-count') || {}).value) || 5, 1), 15);
  const customComp = mode === 'custom' ? (($('#pers-comp-input') || {}).value?.trim() || '') : '';
  if (mode === 'custom' && !customComp) { toast('Enter a competency name.', 'error'); return; }

  btn.disabled = true;
  btn.innerHTML = '<i data-lucide="loader-2" style="animation:spin 1s linear infinite;"></i> Generating personalised questions…';
  icons();
  if (statusDiv) statusDiv.innerHTML = `<div class="ai-status-box info"><i data-lucide="zap"></i> Analysing your profile and generating questions…</div>`;
  icons();

  try {
    const data = await api.startAiPersonalized(mode, customComp || undefined, difficulty, count);
    if (!data || !data.questions || data.questions.length === 0) throw new Error('No questions were generated.');
    const comp = data.focusCompetency || customComp || 'your competency';
    if (statusDiv) statusDiv.innerHTML = `<div class="ai-status-box success"><i data-lucide="check-circle-2"></i>
      Generated ${data.totalQuestions} questions targeting <b>${comp}</b>${data.focusSubCompetency ? ` → <b>${data.focusSubCompetency}</b>` : ''} using ${data.method}.
    </div>`;
    icons();
    setTimeout(() => { beginAssessmentFlow(data, 'ai'); navigate('assessment'); }, 1200);
  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="sparkles"></i> Generate My Personalised Assessment';
    icons();
    if (statusDiv) statusDiv.innerHTML = `<div class="ai-status-box error"><i data-lucide="alert-triangle"></i> ${friendlyError(err)}
      <br><button class="btn btn-outline btn-sm" id="pers-fallback-btn" style="margin-top:10px;">Use Bank-Based Reassessment Instead</button></div>`;
    icons();
    const fb = $('#pers-fallback-btn');
    if (fb) fb.addEventListener('click', startReassessmentFlow);
  }
}



/* ---- FLOATING AI ASSISTANT ---- */
// =====================================================================
// ===== FLOATING AI CHAT ASSISTANT =====
// Powers the chat bubble in the bottom-right corner. Every message
// typed here is sent to POST /api/ai/chat along with the officer's
// real competency data, so the AI's reply is grounded in their actual
// scores - see backend/services/llmService.js -> chatWithContext().
// =====================================================================
export function initAiAssistant() {
  $('#ai-fab').addEventListener('click', () => toggleAiPanel(true));
  $('#ai-panel-close').addEventListener('click', () => toggleAiPanel(false));
  $('#btn-ai-header').addEventListener('click', () => toggleAiPanel(true));
  $('#ai-panel-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = $('#ai-panel-text');
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    appendChatBubble('user', msg);
    lastBubble = appendChatBubble('bot', '<div class="typing-dots"><span></span><span></span><span></span></div>');
    try {
      const result = await api.sendAiChat(msg);
      replaceLastBubble(result.reply);
    } catch (err) {
      replaceLastBubble(friendlyError(err));
    }
  });
  renderSuggestedPrompts();
}

function toggleAiPanel(force) {
  const panel = $('#ai-panel');
  const open = force !== undefined ? force : !panel.classList.contains('open');
  panel.classList.toggle('open', open);
  if (open && $('#ai-panel-body').children.length === 0) {
    appendChatBubble('bot', `Hi ${state.officer.name.split(' ')[1] || ''}, I'm Competency AI. Ask me anything about your competencies, learning path, or progress.`);
    renderSuggestedPrompts();
  }
}
function appendChatBubble(who, text) {
  const bubble = el(`<div class="ai-msg ${who}">${text}</div>`);
  $('#ai-panel-body').appendChild(bubble);
  $('#ai-panel-body').scrollTop = $('#ai-panel-body').scrollHeight;
  return bubble;
}
let lastBubble = null;
function replaceLastBubble(text) {
  if (lastBubble) lastBubble.textContent = text;
}
function renderSuggestedPrompts() {
  const prompts = ['What is my highest priority competency?', 'What should I learn next?', 'How is my progress?'];
  $('#ai-suggested').innerHTML = prompts.map(p => `<button class="ai-chip">${p}</button>`).join('');
  $all('.ai-chip', $('#ai-suggested')).forEach(b => b.addEventListener('click', () => {
    $('#ai-panel-text').value = b.textContent;
    $('#ai-panel-form').dispatchEvent(new Event('submit'));
  }));
}

/* ---- NOTIFICATIONS (derived from real assessment history) ---- */
// =====================================================================
// ===== NOTIFICATIONS PANEL =====
// =====================================================================
export async function renderNotifications() {
  const panel = $('#notif-panel');
  panel.innerHTML = `<div class="notif-panel-head">Notifications</div><div class="muted" style="padding:12px 16px; font-size:13px;">Loading…</div>`;
  try {
    const { history } = await api.getAssessmentHistory();
    const completed = history.filter(h => h.status === 'completed').slice(0, 5);
    if (completed.length === 0) {
      panel.innerHTML = `<div class="notif-panel-head">Notifications</div><div class="muted" style="padding:12px 16px; font-size:13px;">No activity yet — complete an assessment to see updates here.</div>`;
    } else {
      panel.innerHTML = `<div class="notif-panel-head">Notifications</div>` + completed.map(h =>
        `<div class="notif-item"><i data-lucide="check-circle-2"></i><div><div>${h.type === 'diagnostic' ? 'Diagnostic assessment' : h.type} completed — scored ${h.score}%.</div><div class="ni-time">${new Date(h.completed_at.replace(' ', 'T')).toLocaleString()}</div></div></div>`
      ).join('');
    }
  } catch (err) {
    panel.innerHTML = `<div class="notif-panel-head">Notifications</div><div class="muted" style="padding:12px 16px; font-size:13px;">${friendlyError(err)}</div>`;
  }
  icons();
  $('#notif-dot').style.display = 'none';
}

/* ---- GLOBAL SEARCH (competencies + admin officer directory) ---- */
let officerCache = null;
// =====================================================================
// ===== GLOBAL SEARCH (top header search box) =====
// =====================================================================
export function initGlobalSearch() {
  $('#global-search').addEventListener('input', handleGlobalSearch);
  $('#global-search').addEventListener('focus', handleGlobalSearch);
  document.addEventListener('click', (e) => {
    if (!$('.header-search').contains(e.target)) $('#search-results').classList.remove('show');
  });
}

async function handleGlobalSearch() {
  const q = $('#global-search').value.trim().toLowerCase();
  const box = $('#search-results');
  if (!q) { box.classList.remove('show'); return; }

  const pool = state.role.competencies.map(c => ({ label: c, cat: 'Competency', action: () => navigate('competency-detail', c) }));
  if (state.officer.isAdmin) {
    if (!officerCache) { try { officerCache = (await api.getOfficers()).officers; } catch (e) { officerCache = []; } }
    officerCache.forEach(o => pool.push({ label: o.name, cat: 'Officer', action: () => navigate('admin-officer-detail', o.id) }));
  }

  const matches = pool.filter(p => p.label.toLowerCase().includes(q)).slice(0, 8);
  box.innerHTML = matches.length ? matches.map((m, i) => `<div class="sr-item" data-i="${i}"><span>${m.label}</span><span class="sr-cat">${m.cat}</span></div>`).join('')
    : `<div class="sr-empty">No results for "${q}"</div>`;
  box.classList.add('show');
  $all('.sr-item', box).forEach((it, i) => it.addEventListener('click', () => { matches[i].action(); box.classList.remove('show'); $('#global-search').value = ''; }));
}
