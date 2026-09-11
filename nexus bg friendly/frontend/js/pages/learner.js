/* =====================================================================
   LEARNER PAGES — dashboard, competencies, competency detail, progress, profile
   All data comes from api.js (real backend), never from local mock arrays.
===================================================================== */

import { state } from '../state.js';
import * as api from '../api.js';
import { $, $all, el, icons, toast, gapClass, gapColor, animateCount, destroyChart, formatDate, friendlyError } from '../utils.js';
import { navigate } from '../router.js';

// =====================================================================
// ===== DASHBOARD =====
// The first page a returning officer sees. Shows the big "Overall
// Competency" ring, the 4 KPI number cards, and the competency cards
// grid. All numbers come from GET /api/competencies - nothing here is
// made up on the frontend.
// =====================================================================
export async function renderDashboard() {
  $('#v-dashboard').innerHTML = `<div class="page-head"><div><h1>Loading your dashboard…</h1></div></div>`;
  let competencies;
  try { ({ competencies } = await api.getCompetencies()); }
  catch (err) { $('#v-dashboard').innerHTML = `<p class="muted">${friendlyError(err)}</p>`; return; }

  const overall = competencies.length ? Math.round(competencies.reduce((a, c) => a + c.current, 0) / competencies.length) : 0;
  const required = competencies.length ? Math.round(competencies.reduce((a, c) => a + c.required, 0) / competencies.length) : 0;
  const gap = required - overall;
  const highest = [...competencies].sort((a, b) => (b.required - b.current) - (a.required - a.current))[0];
  const strongest = [...competencies].sort((a, b) => b.current - a.current)[0];

  let history = [];
  try { ({ history } = await api.getAssessmentHistory()); } catch (e) { /* non-fatal */ }
  const completedCount = history.filter(h => h.status === 'completed').length;

  const firstName = (state.officer.name.split(' ')[1] || state.officer.name);

  $('#v-dashboard').innerHTML = `
  <div class="page-head"><div><h1>Good morning, ${firstName}.</h1><p>Here is your current competency intelligence. Role: <b>${state.role.name.toUpperCase()}</b></p></div>
    <button class="btn btn-primary" id="dash-start-assess"><i data-lucide="pencil-line"></i> Start Diagnostic Assessment</button>
  </div>

  <div class="hero-competency">
    <div class="hc-ring">
      <svg viewBox="0 0 150 150">
        <circle cx="75" cy="75" r="62" class="hc-track"/>
        <circle cx="75" cy="75" r="62" class="hc-progress" id="hc-progress-circle" stroke-dasharray="389.6" stroke-dashoffset="389.6"/>
      </svg>
      <div class="hc-ring-label"><b class="mono">${overall}%</b><span>Overall Competency</span></div>
    </div>
    <div class="hc-stats">
      <div class="hc-stat"><b class="mono">${overall}%</b><span>Overall Competency</span></div>
      <div class="hc-stat"><b class="mono">${required}%</b><span>Required Level</span></div>
      <div class="hc-stat"><b class="mono" style="color:#ff9d7a;">${Math.max(0, gap)}%</b><span>Gap</span></div>
    </div>
  </div>

  <div class="grid-4" style="margin-bottom:24px;">
    <div class="kpi-card"><div class="kpi-label">Overall Competency</div><div class="kpi-value" id="kpi1">0%</div><div class="kpi-icon"><i data-lucide="target"></i></div></div>
    <div class="kpi-card"><div class="kpi-label">Assessments Completed</div><div class="kpi-value" id="kpi2">0</div><div class="kpi-icon"><i data-lucide="clipboard-check"></i></div></div>
    <div class="kpi-card"><div class="kpi-label">Competencies Tracked</div><div class="kpi-value" id="kpi3">0</div><div class="kpi-icon"><i data-lucide="route"></i></div></div>
    <div class="kpi-card"><div class="kpi-label">Competencies at LOW Gap</div><div class="kpi-value" id="kpi4">0</div><div class="kpi-icon"><i data-lucide="trending-up"></i></div></div>
  </div>

  <div class="ai-insight">
    <div class="aii-icon"><i data-lucide="brain-circuit"></i></div>
    <div>
      <div class="aii-label">COMPETENCY SUMMARY</div>
      <p>Your strongest area is ${strongest ? strongest.name : '—'}. ${highest ? highest.name : 'Nothing'} is currently your highest-priority development area.</p>
      ${highest ? `<button class="btn btn-accent btn-sm" id="dash-view-analysis">View Analysis</button>` : ''}
    </div>
  </div>

  <div class="section-title">Competency Overview</div>
  <div class="grid-2" id="dash-comp-grid"></div>
  `;
  icons();

  animateCount($('#kpi1'), overall, '%');
  animateCount($('#kpi2'), completedCount);
  animateCount($('#kpi3'), competencies.length);
  animateCount($('#kpi4'), competencies.filter(c => c.gap === 'LOW').length);

  const circle = $('#hc-progress-circle');
  const c = 2 * Math.PI * 62;
  circle.setAttribute('stroke-dasharray', c);
  setTimeout(() => { circle.style.strokeDashoffset = c * (1 - overall / 100); }, 200);

  const grid = $('#dash-comp-grid');
  competencies.forEach(comp => {
    const card = el(`<div class="comp-card">
      <div class="comp-card-top"><h4>${comp.name}</h4><span class="comp-pct">${comp.current}%</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:0%; background:${gapColor(comp.gap)};"></div></div>
      <span class="status-chip ${gapClass(comp.gap)}">${comp.gap} GAP</span>
    </div>`);
    card.addEventListener('click', () => navigate('competency-detail', comp.name));
    grid.appendChild(card);
    setTimeout(() => { card.querySelector('.progress-fill').style.width = comp.current + '%'; }, 150);
  });

  $('#dash-start-assess').addEventListener('click', () => navigate('assessment-intro'));
  if (highest) $('#dash-view-analysis').addEventListener('click', () => navigate('competency-detail', highest.name));
}

// =====================================================================
// ===== MY COMPETENCIES PAGE (list + chart) =====
// =====================================================================
export async function renderCompetencies() {
  $('#v-competencies').innerHTML = `<div class="page-head"><div><h1>Loading…</h1></div></div>`;
  let competencies;
  try { ({ competencies } = await api.getCompetencies()); }
  catch (err) { $('#v-competencies').innerHTML = `<p class="muted">${friendlyError(err)}</p>`; return; }

  $('#v-competencies').innerHTML = `
  <div class="page-head"><div><h1>My Competency Profile</h1><p>Understand your strengths, weaknesses and development priorities.</p></div></div>
  <div class="card" style="margin-bottom:24px;">
    <div class="section-title">Required vs Current Competency</div>
    <div class="chart-wrap"><canvas id="chart-req-current"></canvas></div>
  </div>
  <div class="section-title">Competency Breakdown</div>
  <div class="table-wrap">
    <table class="data-table">
      <thead><tr><th>Competency</th><th>Current</th><th>Required</th><th>Gap</th><th>Status</th><th></th></tr></thead>
      <tbody id="comp-table-body"></tbody>
    </table>
  </div>`;
  icons();

  const tbody = $('#comp-table-body');
  competencies.forEach(comp => {
    const row = el(`<tr style="cursor:pointer;">
      <td><b>${comp.name}</b></td>
      <td class="mono">${comp.current}%</td>
      <td class="mono">${comp.required}%</td>
      <td class="mono">${Math.max(0, comp.required - comp.current)}%</td>
      <td><span class="status-chip ${gapClass(comp.gap)}">${comp.gap}</span></td>
      <td><button class="btn btn-outline btn-sm">View</button></td>
    </tr>`);
    row.addEventListener('click', () => navigate('competency-detail', comp.name));
    tbody.appendChild(row);
  });

  destroyChart('reqCurrent');
  const ctx = document.getElementById('chart-req-current');
  state.chartRegistry.reqCurrent = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: competencies.map(c => c.name),
      datasets: [
        { label: 'Required', data: competencies.map(c => c.required), backgroundColor: '#cdd6e3', borderRadius: 6, maxBarThickness: 36 },
        { label: 'Current', data: competencies.map(c => c.current), backgroundColor: '#0f8f8a', borderRadius: 6, maxBarThickness: 36 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, max: 100, grid: { color: '#eef1f5' } }, x: { grid: { display: false } } },
      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } },
    },
  });
}

// =====================================================================
// ===== COMPETENCY DETAIL PAGE (one competency, drilled into) =====
// =====================================================================
export async function renderCompetencyDetail(name) {
  if (!name) name = state.role.competencies[0];
  state.activeCompetency = name;
  $('#v-competency-detail').innerHTML = `<div class="page-head"><div><h1>Loading…</h1></div></div>`;

  let detail;
  try { detail = await api.getCompetencyDetail(name); }
  catch (err) { $('#v-competency-detail').innerHTML = `<p class="muted">${friendlyError(err)}</p>`; return; }

  const gapVal = Math.max(0, detail.required - detail.current);
  const priority = detail.gap;

  $('#v-competency-detail').innerHTML = `
  <button class="btn btn-outline btn-sm" id="cd-back" style="margin-bottom:18px;"><i data-lucide="arrow-left"></i> Back to Competencies</button>
  <div class="page-head"><div><h1>${name.toUpperCase()}</h1><p>Detailed diagnostic breakdown for this competency.</p></div>
    <span class="status-chip ${gapClass(priority)}" style="font-size:12.5px; padding:8px 16px;">${priority} PRIORITY</span>
  </div>
  <div class="grid-3" style="margin-bottom:24px;">
    <div class="kpi-card"><div class="kpi-label">Current</div><div class="kpi-value">${detail.current}%</div></div>
    <div class="kpi-card"><div class="kpi-label">Required</div><div class="kpi-value">${detail.required}%</div></div>
    <div class="kpi-card"><div class="kpi-label">Gap</div><div class="kpi-value" style="color:${gapColor(priority)};">${gapVal}%</div></div>
  </div>

  <div class="card" style="margin-bottom:24px;">
    <div class="section-title">Sub-Competencies</div>
    ${detail.subCompetencies.length
      ? detail.subCompetencies.map(sub => `
        <div style="margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; font-size:13.5px; margin-bottom:6px;"><span>${sub}</span></div>
        </div>`).join('')
      : `<p class="muted" style="font-size:13.5px;">No sub-competencies configured yet — see data/competencies.js.</p>`}
    <p class="muted" style="font-size:12.5px; margin-top:6px;">Per-sub-competency scores appear here once you have answered questions tagged with that sub-competency in an assessment.</p>
  </div>

  <div class="ai-insight">
    <div class="aii-icon"><i data-lucide="brain-circuit"></i></div>
    <div>
      <div class="aii-label">WHY THIS MATTERS</div>
      <p>${detail.current === 0 ? 'You have not yet completed an assessment covering this competency.' :
        gapVal >= 20 ? `Your score is ${gapVal} points below the level required for your role. This is currently your highest-priority development area.` :
        gapVal >= 10 ? `You're ${gapVal} points below the required level — a moderate gap worth closing with targeted learning.` :
        'You are meeting or close to the required level for this competency.'}</p>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        <button class="btn btn-accent btn-sm" id="cd-start-learning">View Learning Path</button>
        <button class="btn btn-outline btn-sm" id="cd-igot">iGOT Karmayogi Resources</button>
        ${gapVal >= 10 ? `<button class="btn btn-primary btn-sm" id="cd-ai-assess">Start Targeted AI Assessment</button>` : ''}
      </div>
    </div>
  </div>`;
  icons();
  $('#cd-back').addEventListener('click', () => navigate('competencies'));
  $('#cd-start-learning').addEventListener('click', () => navigate('learning-path'));
  $('#cd-igot').addEventListener('click', () => navigate('igot'));
  const aiBtn = $('#cd-ai-assess');
  if (aiBtn) aiBtn.addEventListener('click', () => navigate('ai-assessment'));
}

// =====================================================================
// ===== PROGRESS PAGE (before/after history) =====
// =====================================================================
export async function renderProgress() {
  $('#v-progress').innerHTML = `<div class="page-head"><div><h1>Loading…</h1></div></div>`;
  let competencies, history;
  try {
    ({ competencies } = await api.getCompetencies());
    ({ history } = await api.getAssessmentHistory());
  } catch (err) { $('#v-progress').innerHTML = `<p class="muted">${friendlyError(err)}</p>`; return; }

  const completed = history.filter(h => h.status === 'completed');

  $('#v-progress').innerHTML = `
  <div class="page-head"><div><h1>Your Progress</h1><p>Real before/after competency history from your assessments.</p></div></div>
  <div class="grid-2" style="margin-bottom:24px;">
    <div class="card"><div class="section-title">Current Competency Snapshot</div><div id="progress-comp-list"></div></div>
    <div class="card"><div class="section-title">Assessment History</div><div id="progress-history-list"></div></div>
  </div>`;
  icons();

  const compList = $('#progress-comp-list');
  competencies.forEach(comp => {
    compList.appendChild(el(`<div style="margin-bottom:14px;">
      <div style="display:flex; justify-content:space-between; font-size:13.5px; margin-bottom:6px;"><span>${comp.name}</span><b class="mono">${comp.current}%</b></div>
      <div class="progress-track"><div class="progress-fill" style="width:${comp.current}%; background:${gapColor(comp.gap)};"></div></div>
    </div>`));
  });

  const histList = $('#progress-history-list');
  if (completed.length === 0) {
    histList.innerHTML = `<p class="muted" style="font-size:13.5px;">No completed assessments yet. Take a Diagnostic Assessment to start building real progress history.</p>`;
  } else {
    completed.forEach(h => {
      histList.appendChild(el(`<div class="intel-row"><span>${h.type === 'diagnostic' ? 'Diagnostic' : h.type === 'reassessment' ? `Reassessment (${h.competency_filter})` : 'AI Assessment'} · ${formatDate(h.completed_at)}</span><b>${h.score}%</b></div>`));
    });
  }
}

// =====================================================================
// ===== PROFILE PAGE =====
// =====================================================================
export async function renderProfile() {
  const officer = state.officer;
  let competencies = [];
  try { ({ competencies } = await api.getCompetencies()); } catch (e) { /* non-fatal */ }
  const overall = competencies.length ? Math.round(competencies.reduce((a, c) => a + c.current, 0) / competencies.length) : 0;
  const initials = officer.name.split(' ').map(p => p[0]).slice(-2).join('').toUpperCase();

  $('#v-profile').innerHTML = `
  <div class="page-head"><div><h1>My Profile</h1></div></div>
  <div class="card" style="max-width:640px;">
    <div style="display:flex; align-items:center; gap:16px; margin-bottom:20px;">
      <span class="avatar" style="width:56px;height:56px;font-size:18px;">${initials}</span>
      <div><h3 style="margin:0;">${officer.name}</h3><p class="muted" style="margin:2px 0 0;">${state.role.name} · ${officer.department || ''}</p></div>
    </div>
    <div class="intel-row"><span>Employee ID</span><b>${officer.employeeId}</b></div>
    <div class="intel-row"><span>Official Email</span><b>${officer.email}</b></div>
    <div class="intel-row"><span>Role</span><b>${state.role.name}</b></div>
    <div class="intel-row"><span>Overall Competency</span><b>${overall}%</b></div>
    <div class="intel-row"><span>Account Type</span><b>${officer.isAdmin ? 'Administrator' : 'Learner (Demo Login)'}</b></div>
  </div>`;
  icons();
}
