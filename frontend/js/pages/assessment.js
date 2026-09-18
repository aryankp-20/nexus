/* =====================================================================
   ASSESSMENT PAGES
   Real backend-driven flow: questions come from the server (without
   correct answers), each answer is submitted and scored server-side,
   and the final score/competency results are computed by the backend
   — the frontend never invents or sends its own score.
===================================================================== */

import { state, resetAssessmentState } from '../state.js';
import * as api from '../api.js';
import { $, $all, el, icons, toast, gapClass, gapColor, animateCount, friendlyError } from '../utils.js';
import { navigate } from '../router.js';
import config from '../config.js';

// =====================================================================
// ===== ASSESSMENT: INTRO SCREEN =====
// The "Before you begin" screen shown before a diagnostic assessment
// starts. Clicking "Begin Assessment" calls the backend
// (api.startAssessment) to get real questions, then moves to the
// question screen below.
// =====================================================================
export function renderAssessmentIntro() {
  $('#v-assessment-intro').innerHTML = `
  <div class="page-head"><div><h1>Diagnostic Assessment</h1><p>A ${config.NUMBER_OF_ASSESSMENT_QUESTIONS}-question adaptive assessment covering your role's required competencies.</p></div></div>
  <div class="card" style="max-width:640px;">
    <div class="section-title">Before you begin</div>
    <ul style="padding-left:18px; color:var(--text-700); line-height:2; font-size:14.5px; list-style:disc;">
      <li>${config.NUMBER_OF_ASSESSMENT_QUESTIONS} questions across ${state.role.competencies.join(', ')}.</li>
      <li>Difficulty adapts rule-based on your performance in real time.</li>
      <li>Your score is calculated by the backend from your actual answers.</li>
      <li>Estimated time: 10–15 minutes.</li>
    </ul>
    <button class="btn btn-primary btn-block" id="begin-assessment-btn" style="margin-top:20px;">Begin Assessment <i data-lucide="arrow-right"></i></button>
  </div>`;
  icons();
  $('#begin-assessment-btn').addEventListener('click', async () => {
    $('#begin-assessment-btn').disabled = true;
    try {
      const data = await api.startAssessment();
      beginAssessmentFlow(data, 'diagnostic');
      navigate('assessment');
    } catch (err) {
      toast(friendlyError(err), 'alert-triangle');
      $('#begin-assessment-btn').disabled = false;
    }
  });
}

// ===== ASSESSMENT: SET UP LOCAL STATE FOR A NEW ATTEMPT =====
// Called whenever ANY assessment starts (diagnostic, AI, or
// reassessment) to reset the on-screen progress tracker.
function beginAssessmentFlow(data, type) {
  resetAssessmentState();
  state.assessment.id = data.assessmentId;
  // AI-generated attempts still arrive as a pre-built batch (data.questions);
  // diagnostic/reassessment attempts are truly adaptive and arrive one
  // question at a time (data.question), with more fetched live as the
  // officer answers — see selectOption() below.
  state.assessment.questions = data.questions || (data.question ? [data.question] : []);
  state.assessment.totalQuestions = data.totalQuestions || state.assessment.questions.length;
  state.assessment.difficulty = data.difficulty || 'Medium';
  state.assessment.type = type;
  state.assessment.focusCompetency = data.focusCompetency;
  state.assessment.sources = data.sources || [];
}

// =====================================================================
// ===== ASSESSMENT: QUESTION SCREEN =====
// Shows one question at a time with the answer options. Answering a
// question calls selectOption() below, which submits it to the
// backend immediately (the backend grades every answer, not the
// browser).
// =====================================================================
export function renderAssessmentQuestion() {
  const a = state.assessment;
  if (!a.id || !a.questions.length) { navigate('assessment-intro'); return; }
  const q = a.questions[a.index];
  const totalQ = a.totalQuestions || a.questions.length;
  const progressPct = Math.round((a.index / totalQ) * 100);
  const accuracy = a.answers.length ? Math.round((a.correctCount / a.answers.length) * 100) : 0;
  const isLikelyLast = a.done || a.index >= totalQ - 1;

  $('#v-assessment').innerHTML = `
  <div class="assess-top">
    <div><h1 style="font-size:20px;">${a.type === 'ai' ? 'Targeted AI Assessment' : a.type === 'reassessment' ? 'Gap-Focused Reassessment' : 'Diagnostic Assessment'}</h1></div>
    <div class="aq-meta">
      <span class="tag tag-accent">${a.index + 1} / ${totalQ}</span>
      <span class="tag">${q.competency}</span>
      <span class="tag">Difficulty: ${a.difficulty}</span>
    </div>
  </div>
  <div class="assess-progress-bar"><div class="assess-progress-fill" style="width:${progressPct}%;"></div></div>

  <div class="assess-shell">
    <div>
      <div id="assess-feedback"></div>
      <div class="question-card">
        <h3>${q.question}</h3>
        ${a.type === 'ai' && a.sources[a.index] ? `<div class="gen-source" style="margin-bottom:16px;"><b>Source: ${a.sources[a.index].document} — Page ~${a.sources[a.index].page}</b>Retrieved content: "${(a.sources[a.index].excerpt || '').slice(0, 160)}…"</div>` : ''}
        <div class="opt-list" id="opt-list">
          ${q.options.map((o, i) => `<div class="opt-item" data-i="${i}"><span class="opt-letter">${String.fromCharCode(65 + i)}</span><span>${o}</span></div>`).join('')}
        </div>
        <div class="assess-nav">
          <div></div>
          <div style="display:flex; gap:10px;">
            <button class="btn btn-primary" id="assess-next" disabled>${isLikelyLast ? 'Finish' : 'Next'} <i data-lucide="arrow-right"></i></button>
          </div>
        </div>
      </div>
    </div>
    <div class="intel-card">
      <div class="section-title" style="margin-bottom:14px;">ASSESSMENT INTELLIGENCE</div>
      <div class="intel-row"><span>Questions Answered</span><b>${a.answers.length}</b></div>
      <div class="intel-row"><span>Correct</span><b>${a.correctCount}</b></div>
      <div class="intel-row"><span>Accuracy</span><b>${accuracy}%</b></div>
      <div class="intel-row"><span>Current Difficulty</span><b>${a.difficulty}</b></div>
      <div class="intel-row" title="Rule-based adaptive assessment"><span>Adaptive Method</span><b>Rule-based</b></div>
    </div>
  </div>`;
  icons();

  $all('.opt-item', document.getElementById('opt-list')).forEach(opt => {
    opt.addEventListener('click', () => selectOption(parseInt(opt.dataset.i, 10)));
  });
  $('#assess-next').addEventListener('click', nextQuestion);

  // restore prior answer/feedback if navigating back (frontend keeps its own answers[] cache)
  if (a.answers[a.index] !== undefined) applyFeedback(a.feedback[a.index], a.answers[a.index], true);
}

// ===== ASSESSMENT: SUBMIT ONE ANSWER =====
// Sends the picked option to the backend (api.submitAnswer) and shows
// whether it was correct. This is also where the backend tells us the
// next question's difficulty (rule-based adaptive difficulty).
async function selectOption(i) {
  const a = state.assessment;
  const q = a.questions[a.index];
  if (a.answers[a.index] !== undefined) return; // already answered, locked

  const opts = $all('.opt-item');
  opts.forEach(o => o.style.pointerEvents = 'none');
  opts[i].classList.add('selected');

  try {
    const result = await api.submitAnswer(a.id, q.id, i);
    a.answers[a.index] = i;
    a.feedback[a.index] = result;
    if (result.isCorrect) a.correctCount++;
    a.difficulty = result.newDifficulty;
    // Adaptive engine: the NEXT question (chosen based on this exact
    // answer) arrives right away, or `done` tells us this was the last one.
    if (result.nextQuestion) a.questions.push(result.nextQuestion);
    if (result.done !== undefined) a.done = result.done;
    if (result.totalQuestions) a.totalQuestions = result.totalQuestions;
    applyFeedback(result, i, false);
  } catch (err) {
    toast(friendlyError(err), 'alert-triangle');
    opts.forEach(o => o.style.pointerEvents = 'auto');
    opts[i].classList.remove('selected');
  }
}

// ===== ASSESSMENT: SHOW RIGHT/WRONG FEEDBACK =====
function applyFeedback(result, selectedIndex, isRestore) {
  const opts = $all('.opt-item');
  opts.forEach(o => o.style.pointerEvents = 'none');
  opts[selectedIndex].classList.add('selected');
  opts[result.correctIndex].classList.add('correct');
  if (selectedIndex !== result.correctIndex) opts[selectedIndex].classList.add('incorrect');

  const fb = document.getElementById('assess-feedback');
  if (result.isCorrect) {
    fb.innerHTML = `<div class="feedback-banner correct"><i data-lucide="check-circle-2"></i><div>Correct<small>${result.explanation || 'Difficulty adjusted for the next question.'}</small></div></div>`;
  } else {
    fb.innerHTML = `<div class="feedback-banner incorrect"><i data-lucide="x-circle"></i><div>Incorrect<small>${result.explanation || 'Rule-based adaptive assessment will adjust the next question.'}</small></div></div>`;
  }
  icons();
  const nextBtn = document.getElementById('assess-next');
  nextBtn.disabled = false;

  const a = state.assessment;
  // Now that we know whether the adaptive engine produced another
  // question, correct the button label if our earlier guess was wrong.
  const isActuallyLast = a.done || a.index >= a.questions.length - 1;
  nextBtn.innerHTML = `${isActuallyLast ? 'Finish' : 'Next'} <i data-lucide="arrow-right"></i>`;
  icons();

  const accuracy = a.answers.length ? Math.round((a.correctCount / a.answers.length) * 100) : 0;
  const rows = $all('.intel-row b');
  rows[0].textContent = a.answers.length;
  rows[1].textContent = a.correctCount;
  rows[2].textContent = accuracy + '%';
  rows[3].textContent = a.difficulty;
}

// ===== ASSESSMENT: MOVE TO NEXT QUESTION (OR FINISH) =====
async function nextQuestion() {
  const a = state.assessment;
  if (a.index < a.questions.length - 1) {
    a.index++;
    renderAssessmentQuestion();
  } else {
    try {
      const result = await api.finishAssessment(a.id);
      result.type = a.type;
      state.lastAssessmentResult = result;
      // The moment a diagnostic assessment is finalized, the officer's
      // competency profile genuinely exists — unlock the gated views
      // immediately instead of waiting for a fresh login.
      if (a.type === 'diagnostic') state.hasCompletedDiagnostic = true;
      navigate('assessment-result');
    } catch (err) {
      toast(friendlyError(err), 'alert-triangle');
    }
  }
}

// =====================================================================
// ===== ASSESSMENT: RESULT SCREEN =====
// Shows the final score, HIGH/MEDIUM/LOW gap buckets, and (for
// AI/reassessment attempts) a before-vs-after comparison. All numbers
// come straight from the backend's response - nothing is calculated
// here in the browser.
// =====================================================================
export function renderAssessmentResult() {
  const result = state.lastAssessmentResult;
  if (!result) { navigate('dashboard'); return; }
  const score = result.score;
  const high = result.competencyResults.filter(c => c.gapLevel === 'HIGH');
  const med = result.competencyResults.filter(c => c.gapLevel === 'MEDIUM');
  const low = result.competencyResults.filter(c => c.gapLevel === 'LOW');
  const isFollowUp = result.type === 'ai' || result.type === 'reassessment';
  const worstGap = high[0] || med[0] || low[0];

  $('#v-assessment-result').innerHTML = `
  <div class="page-head"><div><h1>${isFollowUp ? 'Reassessment Complete' : 'Diagnostic Assessment Complete'}</h1><p>Your assessment has been scored by the backend competency engine — nothing here was calculated in the browser.</p></div></div>
  <div class="result-score"><div class="rs-big mono" id="rs-score">0%</div><p>Overall Score${result.passed !== undefined ? (result.passed ? ' · Passed' : ` · Below passing score of ${result.passingScore}%`) : ''}</p></div>

  ${isFollowUp ? `
  <div class="card" style="margin-bottom:24px;">
    <div class="section-title">Before vs After</div>
    ${result.competencyResults.map(c => `
      <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--border);">
        <span style="font-size:13.5px;">${c.competency}</span>
        <span style="display:flex; align-items:center; gap:10px; font-size:13.5px;">
          ${c.previousScore !== null ? `<span class="mono muted">${c.previousScore}%</span><i data-lucide="arrow-right" style="width:14px;height:14px;"></i>` : ''}
          <b class="mono" style="color:${gapColor(c.gapLevel)};">${c.score}%</b>
          ${c.improvement !== null ? `<span class="tag" style="color:${c.improvement >= 0 ? '#0f8f8a' : '#c2422d'};">${c.improvement >= 0 ? '+' : ''}${c.improvement} pts</span>` : ''}
        </span>
      </div>`).join('')}
  </div>` : ''}

  <div class="section-title">Required vs Your Score</div>
  <div class="grid-2" style="margin-bottom:24px;">
    <div class="card">
      ${result.competencyResults.map(c => `
        <div style="margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; font-size:13.5px; margin-bottom:6px;"><span>${c.competency}</span><span class="mono muted">Required: ${c.required}%</span></div>
          <div class="progress-track"><div class="progress-fill" data-pct="${c.score}" style="width:0%; background:${gapColor(c.gapLevel)};"></div></div>
          <div style="display:flex; justify-content:space-between; font-size:12px; margin-top:4px;"><span class="muted">Your Score: <b class="mono">${c.score}%</b></span><span class="muted">Gap: <b class="mono">${Math.max(0, c.required - c.score)}%</b></span></div>
        </div>`).join('') || '<p class="muted" style="font-size:13px;">No competency breakdown for this assessment type.</p>'}
    </div>
    <div>
      <div class="priority-col" style="margin-bottom:14px;"><h4><span class="status-chip status-high">HIGH PRIORITY</span></h4>${high.map(c => `<div class="priority-item">${c.competency}</div>`).join('') || '<p class="muted" style="font-size:13px;">None</p>'}</div>
      <div class="priority-col" style="margin-bottom:14px;"><h4><span class="status-chip status-medium">MEDIUM</span></h4>${med.map(c => `<div class="priority-item">${c.competency}</div>`).join('') || '<p class="muted" style="font-size:13px;">None</p>'}</div>
      <div class="priority-col"><h4><span class="status-chip status-low">LOW / NO GAP</span></h4>${low.map(c => `<div class="priority-item">${c.competency}</div>`).join('') || '<p class="muted" style="font-size:13px;">None</p>'}</div>
    </div>
  </div>

  <div class="ai-insight">
    <div class="aii-icon"><i data-lucide="brain-circuit"></i></div>
    <div><div class="aii-label">WHAT TO DO NEXT</div>
      <p>${worstGap && worstGap.gapLevel !== 'LOW' ? `Your biggest gap is <b>${worstGap.competency}</b> (${Math.max(0, worstGap.required - worstGap.score)} points below required). Here's the path to close it:` : 'No significant gaps right now — you\'re meeting the required level across your tracked competencies.'}</p>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        <button class="btn btn-accent btn-sm" id="result-view-gaps">1. View Competency Gaps</button>
        <button class="btn btn-outline btn-sm" id="result-view-igot">2. iGOT Learning Resources</button>
        ${high.length || med.length ? `<button class="btn btn-primary btn-sm" id="result-ai-assess">3. Start Targeted AI Assessment</button>` : ''}
      </div>
    </div>
  </div>`;
  icons();
  animateCount($('#rs-score'), score, '%');
  $all('#v-assessment-result .progress-fill').forEach(f => { setTimeout(() => { f.style.width = f.dataset.pct + '%'; }, 200); });
  $('#result-view-gaps').addEventListener('click', () => navigate('competencies'));
  $('#result-view-igot').addEventListener('click', () => navigate('igot'));
  const aiBtn = $('#result-ai-assess');
  if (aiBtn) aiBtn.addEventListener('click', () => navigate('ai-assessment'));
}

// =====================================================================
// ===== REASSESSMENT: START A GAP-FOCUSED RETRY =====
// =====================================================================
export async function startReassessmentFlow() {
  try {
    const data = await api.startReassessment();
    beginAssessmentFlow(data, 'reassessment');
    toast(`Targeting your weakest area: ${data.focusCompetency}${data.focusSubCompetency ? ' → ' + data.focusSubCompetency : ''}.`, 'target');
    if (data.shortSet) toast(`Only ${data.totalQuestions} distinct question(s) exist for this gap in the question bank — showing all of them rather than repeating one.`, 'info');
    navigate('assessment');
  } catch (err) {
    toast(friendlyError(err), 'alert-triangle');
  }
}

export { beginAssessmentFlow };
