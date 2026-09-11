/* =====================================================================
   ADMIN: KNOWLEDGE BASE + AI QUIZ GENERATOR
   This is the real RAG pipeline surface: upload a PDF -> it's really
   text-extracted, chunked, and vectorized (embeddingService.js) ->
   generate a question -> real retrieval + (if configured) a real LLM
   call -> review -> approve/reject into the real question bank.
===================================================================== */

import { state } from '../state.js';
import * as api from '../api.js';
import { $, $all, el, icons, toast, friendlyError } from '../utils.js';
import { navigate } from '../router.js';

// =====================================================================
// ===== KNOWLEDGE BASE PAGE (admin) =====
// Lists every uploaded PDF and its indexing status. This is the
// document library that AI Quiz Generation (below) and the officer-
// facing "PDF Upload" AI assessment mode both pull from.
// =====================================================================
export async function renderAdminKb() {
  $('#v-admin-kb').innerHTML = `
  <div class="page-head"><div><h1>Official Knowledge Base</h1><p>Documents indexed for RAG-based AI assessment generation.</p></div>
    <button class="btn btn-primary" id="kb-upload-btn"><i data-lucide="upload"></i> Upload Document</button></div>
  <div class="table-wrap"><table class="data-table"><thead><tr><th>Document</th><th>Pages</th><th>Uploaded</th><th>Status</th><th>Indexed Chunks</th><th>Questions Generated</th></tr></thead><tbody id="kb-table-body"></tbody></table></div>`;
  icons();
  $('#kb-upload-btn').addEventListener('click', () => navigate('admin-quiz'));
  await loadKbRows();
}

// ===== KNOWLEDGE BASE: LOAD + RENDER THE DOCUMENT TABLE =====
async function loadKbRows() {
  const tbody = $('#kb-table-body');
  tbody.innerHTML = `<tr><td colspan="6" class="muted">Loading…</td></tr>`;
  try {
    const { documents } = await api.getDocuments();
    if (documents.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="muted">No documents uploaded yet — go to AI Quiz Generator to upload a PDF.</td></tr>`;
      return;
    }
    tbody.innerHTML = documents.map(d => `<tr>
      <td><b>${d.name}</b></td>
      <td class="mono">${d.pages || '—'}</td>
      <td>${new Date(d.uploaded.replace(' ', 'T')).toLocaleDateString()}</td>
      <td><span class="status-chip ${d.status === 'ready' ? 'status-low' : d.status === 'failed' ? 'status-high' : 'status-medium'}">${d.status.toUpperCase()}</span></td>
      <td class="mono">${d.chunkCount}</td>
      <td class="mono">${d.questions}</td>
    </tr>`).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="muted">${friendlyError(err)}</td></tr>`;
  }
}

// =====================================================================
// ===== AI QUIZ GENERATION PAGE (admin) =====
// Lets an admin upload a document and generate MCQ questions from it
// with AI, then approve/reject each one before it becomes usable in
// real assessments. The AI prompt itself lives on the backend - see
// backend/services/llmService.js and questionGenerationService.js.
// =====================================================================
export async function renderAdminQuiz() {
  $('#v-admin-quiz').innerHTML = `
  <div class="page-head"><div><h1>AI Quiz Generator</h1><p>Upload an official statistical document (PDF), then generate grounded, source-cited questions from it.</p></div></div>
  <div class="card" style="margin-bottom:24px; max-width:760px;">
    <div class="upload-zone" id="quiz-upload-zone">
      <i data-lucide="upload-cloud"></i>
      <h4>Upload Official Statistical Document (PDF)</h4>
      <p>Real text extraction + chunking + vector indexing runs on upload — click to browse</p>
      <input type="file" id="quiz-file-input" style="display:none;" accept=".pdf">
    </div>
    <div id="quiz-upload-info"></div>
  </div>

  <div class="card" style="margin-bottom:24px; max-width:760px;">
    <div class="section-title">Generate a Question</div>
    <div class="config-grid">
      <label class="field"><span>Competency</span><select id="cfg-comp">${state.roles.flatMap(r => r.competencies).filter((v, i, a) => a.indexOf(v) === i).map(c => `<option>${c}</option>`).join('')}</select></label>
      <label class="field"><span>Difficulty</span><select id="cfg-diff"><option>Easy</option><option selected>Medium</option><option>Hard</option></select></label>
    </div>
    <button class="btn btn-primary btn-block" id="gen-assess-btn"><i data-lucide="sparkles"></i> Generate Question</button>
  </div>

  <div id="gen-question-container"></div>
  <div id="pending-container"></div>`;
  icons();

  const zone = $('#quiz-upload-zone');
  const input = $('#quiz-file-input');
  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('dragover'); handleQuizUpload(e.dataTransfer.files[0]); });
  input.addEventListener('change', () => handleQuizUpload(input.files[0]));

  $('#gen-assess-btn').addEventListener('click', generateQuestion);

  await loadPendingQuestions();
}

// ===== AI QUIZ GENERATION: FILE UPLOAD HANDLING =====
async function handleQuizUpload(file) {
  if (!file) return;
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    toast('Only PDF files are supported for this hackathon build.', 'alert-triangle');
    return;
  }
  $('#quiz-upload-info').innerHTML = `<div class="file-chip"><i data-lucide="file-text" style="width:13px;height:13px;"></i>${file.name} — uploading &amp; indexing…</div>`;
  try {
    const result = await api.uploadDocument(file);
    if (result.success) {
      toast(`Indexed ${result.chunkCount} real text chunks from ${result.pageCount} pages.`, 'upload-cloud');
      $('#quiz-upload-info').innerHTML = `<div class="file-chip"><i data-lucide="check-circle-2" style="width:13px;height:13px;"></i>${file.name} — ready (${result.chunkCount} chunks indexed)</div>`;
    } else {
      toast(result.reason || 'Processing failed.', 'alert-triangle');
      $('#quiz-upload-info').innerHTML = `<div class="file-chip"><i data-lucide="x-circle" style="width:13px;height:13px;"></i>${file.name} — ${result.reason || 'failed'}</div>`;
    }
  } catch (err) {
    toast(friendlyError(err), 'alert-triangle');
  }
}

// ===== AI QUIZ GENERATION: GENERATE ONE QUESTION (calls the AI) =====
async function generateQuestion() {
  const competency = $('#cfg-comp').value;
  const difficulty = $('#cfg-diff').value;
  const container = $('#gen-question-container');
  container.innerHTML = `<div class="card"><p class="muted">Retrieving relevant source chunks and generating a grounded question…</p></div>`;

  try {
    const result = await api.generateQuestion(competency, null, difficulty);

    if (!result.success) {
      container.innerHTML = `<div class="card"><div class="section-title" style="color:#b8720f;">${result.status}</div>
        <p class="muted" style="margin-bottom:10px;">${result.reason}</p>
        ${result.retrievedChunks ? `<div class="hist-list">${result.retrievedChunks.map(c => `<div class="hist-item"><div class="hi-left"><b>${c.documentName}</b><small>Page ~${c.page} · "${c.preview}…"</small></div></div>`).join('')}</div>` : ''}
      </div>`;
      icons();
      return;
    }

    const q = result.question;
    container.innerHTML = `<div class="gen-question">
      <div class="section-title">AI-Generated Question — Pending Review</div>
      <h3 style="font-size:16.5px; margin-bottom:16px;">${q.question}</h3>
      <div class="opt-list" style="margin-bottom:16px;">
        ${q.options.map((o, i) => `<div class="opt-item ${i === q.correctIndex ? 'correct' : ''}"><span class="opt-letter">${String.fromCharCode(65 + i)}</span><span>${o}</span></div>`).join('')}
      </div>
      <p style="font-size:13.5px; color:var(--text-700); margin-bottom:14px;"><b>Explanation:</b> ${q.explanation}</p>
      <div style="display:flex; gap:14px; flex-wrap:wrap; margin-bottom:16px;">
        <span class="tag">Difficulty: ${q.difficulty}</span><span class="tag">Competency: ${q.competency}</span>
      </div>
      <div class="gen-source">
        <b>Source: ${q.sourceDocument} — Page ~${q.sourcePage}</b>
        Retrieved supporting content: "${q.sourceExcerpt}…"
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:14px;">
        <button class="btn btn-primary btn-sm" id="q-approve" data-id="${q.id}"><i data-lucide="check"></i> Approve</button>
        <button class="btn btn-outline btn-sm" id="q-regen"><i data-lucide="refresh-cw"></i> Regenerate</button>
        <button class="btn btn-danger-outline btn-sm" id="q-reject" data-id="${q.id}"><i data-lucide="x"></i> Reject</button>
      </div>
    </div>`;
    icons();

    $('#q-approve').addEventListener('click', async () => {
      await api.approveQuestion(q.id);
      toast('Question approved and added to the active assessment bank.', 'check-circle-2');
      container.innerHTML = '';
      loadPendingQuestions();
    });
    $('#q-reject').addEventListener('click', async () => {
      await api.rejectQuestion(q.id);
      toast('Question rejected — it will never be used in an assessment.', 'x-circle');
      container.innerHTML = '';
      loadPendingQuestions();
    });
    $('#q-regen').addEventListener('click', () => { toast('Regenerating…', 'refresh-cw'); generateQuestion(); });
  } catch (err) {
    container.innerHTML = `<div class="card"><p class="muted">${friendlyError(err)}</p></div>`;
  }
}

// ===== AI QUIZ GENERATION: PENDING QUESTIONS REVIEW (approve/reject) =====
async function loadPendingQuestions() {
  const wrap = $('#pending-container');
  try {
    const { questions } = await api.getPendingQuestions();
    if (questions.length === 0) { wrap.innerHTML = ''; return; }
    wrap.innerHTML = `<div class="card" style="margin-top:20px;"><div class="section-title">Awaiting Review (${questions.length})</div>
      <div class="hist-list">${questions.map(q => `<div class="hist-item"><div class="hi-left"><b>${q.question_text.slice(0, 70)}${q.question_text.length > 70 ? '…' : ''}</b><small>${q.competency} · ${q.difficulty} · Source: ${q.source_document}, p.${q.source_page}</small></div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-primary btn-sm approve-pending" data-id="${q.id}">Approve</button>
          <button class="btn btn-danger-outline btn-sm reject-pending" data-id="${q.id}">Reject</button>
        </div></div>`).join('')}</div></div>`;
    icons();
    $all('.approve-pending', wrap).forEach(b => b.addEventListener('click', async () => { await api.approveQuestion(Number(b.dataset.id)); toast('Approved.', 'check-circle-2'); loadPendingQuestions(); }));
    $all('.reject-pending', wrap).forEach(b => b.addEventListener('click', async () => { await api.rejectQuestion(Number(b.dataset.id)); toast('Rejected.', 'x-circle'); loadPendingQuestions(); }));
  } catch (err) { /* non-fatal */ }
}
