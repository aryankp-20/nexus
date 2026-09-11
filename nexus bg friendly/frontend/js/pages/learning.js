/* =====================================================================
   LEARNING PATH + iGOT PAGES
===================================================================== */

import * as api from '../api.js';
import { $, el, icons, toast, openModal, closeModal, friendlyError } from '../utils.js';

// =====================================================================
// ===== LEARNING PATH PAGE =====
// The step-by-step list of recommended courses, ordered by the
// officer's biggest competency gap first. Comes from GET /api/learning-path.
// =====================================================================
export async function renderLearningPath() {
  $('#v-learning-path').innerHTML = `<div class="page-head"><div><h1>Loading your learning path…</h1></div></div>`;
  let path;
  try { ({ path } = await api.getLearningPath()); }
  catch (err) { $('#v-learning-path').innerHTML = `<p class="muted">${friendlyError(err)}</p>`; return; }

  $('#v-learning-path').innerHTML = `
  <div class="page-head"><div><h1>Your Personalized Learning Path</h1><p>Learning recommendations generated from your real competency gaps, weakest-first.</p></div></div>
  <div class="timeline" id="lp-timeline"></div>`;
  const tl = $('#lp-timeline');

  if (path.length === 0) {
    tl.innerHTML = `<p class="muted">No learning resources match your competencies yet — complete a Diagnostic Assessment first.</p>`;
  }

  path.forEach(item => {
    const locked = item.status === 'locked';
    const completed = item.status === 'completed';
    const node = el(`<div class="tl-item ${locked ? 'locked' : ''}">
      <div class="tl-dot">${locked ? '<i data-lucide="lock" style="width:13px;height:13px;"></i>' : (completed ? '<i data-lucide="check" style="width:13px;height:13px;"></i>' : item.n)}</div>
      <div class="tl-top"><h4>${item.title}</h4><span class="match-badge">${item.match}% Match</span></div>
      <div class="tl-meta"><span class="tag">${completed ? 'Completed' : (locked ? 'Locked' : 'Available')}</span><span><i data-lucide="clock" style="width:12px;height:12px;"></i> ${item.duration}</span><span><i data-lucide="target" style="width:12px;height:12px;"></i> ${item.competency}</span></div>
      <div class="tl-reason">${item.reason}</div>
      <button class="btn ${locked ? 'btn-outline' : (completed ? 'btn-outline' : 'btn-primary')} btn-sm" ${locked ? 'disabled' : ''}>${locked ? 'Locked' : (completed ? 'Completed' : 'Start Learning')}</button>
    </div>`);
    if (!locked && !completed) {
      node.querySelector('button').addEventListener('click', () => startLearningModule(item));
    }
    tl.appendChild(node);
  });
  icons();
}

// ===== LEARNING PATH: "MARK MODULE COMPLETE" POPUP =====
function startLearningModule(item) {
  openModal(`<div class="modal-head"><h2>${item.title}</h2></div>
    <p class="muted" style="margin-bottom:16px;">Competency: <b>${item.competency}</b> · Duration: <b>${item.duration}</b></p>
    <div class="card" style="margin-bottom:16px;"><p style="line-height:1.6; color:var(--text-700);">This module walks through core concepts for ${item.competency}, with worked examples drawn from official statistical survey practice. Completing it will unlock the next module in your path.</p></div>
    <button class="btn btn-primary btn-block" id="lp-complete-btn">Mark Module Complete</button>`);
  $('#lp-complete-btn').addEventListener('click', async () => {
    try {
      await api.completeLearningResource(item.id);
      closeModal();
      toast(`${item.title} marked complete. Next module unlocked.`, 'check-circle-2');
      renderLearningPath();
    } catch (err) {
      toast(friendlyError(err), 'alert-triangle');
    }
  });
}

// =====================================================================
// ===== iGOT KARMAYOGI RECOMMENDATIONS PAGE =====
// Demo/prototype course catalogue (data/courses.js) matched to the
// officer's real weakest competency. See backend/services/igotService.js.
// =====================================================================
export async function renderIgot() {
  $('#v-igot').innerHTML = `<div class="page-head"><div><h1>Loading…</h1></div></div>`;
  let data, recs;
  try {
    data = await api.getIgotCourses();
    recs = await api.getIgotRecommendations();
  } catch (err) { $('#v-igot').innerHTML = `<p class="muted">${friendlyError(err)}</p>`; return; }

  $('#v-igot').innerHTML = `
  <div class="page-head"><div><h1>iGOT Karmayogi Recommendations</h1><p>Relevant learning resources mapped to your competency gaps.</p></div>
    <span class="igot-connected"><i data-lucide="link-2" style="width:12px;height:12px;"></i> iGOT Resource Mapping: ${data.mode === 'demo' ? 'Demo / Prototype' : 'Connected'}</span>
  </div>
  <p class="igot-note" style="display:block; margin-bottom:20px;">HONEST STATUS: no real iGOT Karmayogi API credentials are available for this hackathon build. This is an iGOT RESOURCE MAPPING LAYER — a static catalogue (data/courses.js) tagged by competency and sub-competency, matched against your real diagnosed gap — not a live API integration.</p>
  <div id="igot-focus"></div>
  <div class="section-title">Browse All Resources for Your Role</div>
  <div class="grid-3" id="igot-grid"></div>`;

  const focusBox = $('#igot-focus');
  if (recs.hasFocus && recs.courses.length) {
    focusBox.innerHTML = `
    <div class="ai-insight" style="margin-bottom:24px;">
      <div class="aii-icon"><i data-lucide="crosshair"></i></div>
      <div><div class="aii-label">RECOMMENDED FOR YOUR GAP</div>
        <p>Because you have a ${recs.gap}-point gap in <b>${recs.competency}</b>${recs.subCompetency ? ` (specifically <b>${recs.subCompetency}</b>)` : ''}, here is the best-matched resource:</p>
      </div>
    </div>
    <div class="course-card" style="max-width:420px; margin-bottom:24px; border:1.5px solid var(--accent-teal, #0f8f8a);">
      <div class="course-card-top"><h4>${recs.courses[0].title}</h4><span class="match-badge">${recs.courses[0].match}% Match</span></div>
      <div class="course-meta"><span><i data-lucide="target"></i>${recs.courses[0].matchReason}</span></div>
      <div class="course-meta"><span><i data-lucide="clock"></i>${recs.courses[0].duration}</span><span><i data-lucide="bar-chart-2"></i>${recs.courses[0].difficulty}</span></div>
      <button class="btn btn-primary btn-sm btn-block">Open iGOT</button>
    </div>`;
    icons();
    focusBox.querySelector('button').addEventListener('click', () => toast(`Opening "${recs.courses[0].title}" — demo mapping, no live redirect configured.`, 'external-link'));
  } else if (recs.hasFocus === false) {
    focusBox.innerHTML = `<p class="muted" style="margin-bottom:20px;">Complete a diagnostic assessment to get a resource recommended for your actual gap.</p>`;
  }

  const grid = $('#igot-grid');
  data.courses.forEach(c => {
    const card = el(`<div class="course-card">
      <div class="course-card-top"><h4>${c.title}</h4><span class="match-badge">${c.match}% Match</span></div>
      <div class="course-meta">
        <span><i data-lucide="target"></i>${c.competency}</span>
        <span><i data-lucide="clock"></i>${c.duration}</span>
        <span><i data-lucide="bar-chart-2"></i>${c.difficulty}</span>
      </div>
      <div class="course-meta"><span><i data-lucide="building-2"></i>${c.provider}</span></div>
      <button class="btn btn-primary btn-sm btn-block">Open iGOT</button>
    </div>`);
    card.querySelector('button').addEventListener('click', () => {
      toast(`Opening "${c.title}" on iGOT Karmayogi — demo data, no live redirect configured.`, 'external-link');
    });
    grid.appendChild(card);
  });
  icons();
}
