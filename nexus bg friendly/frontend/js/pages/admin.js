/* =====================================================================
   ADMIN PAGES — all data is real, aggregated from the database via
   /api/officers and /api/reports. No invented workforce-scale numbers.
===================================================================== */

import { state } from '../state.js';
import * as api from '../api.js';
import { $, $all, el, icons, toast, animateCount, destroyChart, gapClass, friendlyError, formatDate, officerStatusChipClass } from '../utils.js';
import { navigate } from '../router.js';

// =====================================================================
// ===== ADMIN DASHBOARD =====
// Workforce-wide numbers: total officers, average competency, gap
// breakdown chart, role-performance chart. Comes from GET /api/officers
// and GET /api/reports/*.
// =====================================================================
export async function renderAdminDashboard() {
  $('#v-admin-dashboard').innerHTML = `<div class="page-head"><div><h1>Loading workforce data…</h1></div></div>`;
  let officers, rolePerf;
  try {
    ({ officers } = await api.getOfficers());
    rolePerf = (await api.getReportSummary('role-performance')).rows;
  } catch (err) { $('#v-admin-dashboard').innerHTML = `<p class="muted">${friendlyError(err)}</p>`; return; }

  const totalOfficers = officers.length;
  const avgCompetency = totalOfficers ? Math.round(officers.reduce((a, o) => a + o.competency, 0) / totalOfficers) : 0;
  const needsAttention = officers.filter(o => o.status === 'Needs Attention').length;
  const excellent = officers.filter(o => o.status === 'Excellent').length;

  $('#v-admin-dashboard').innerHTML = `
  <div class="page-head"><div><h1>Workforce Competency Intelligence</h1><p>Organization-wide view of competency and learning progress — real data from the database.</p></div></div>
  <div class="grid-4" style="margin-bottom:14px;">
    <div class="kpi-card"><div class="kpi-label">Total Officers</div><div class="kpi-value" id="akpi1">0</div><div class="kpi-icon"><i data-lucide="users"></i></div></div>
    <div class="kpi-card"><div class="kpi-label">Average Competency</div><div class="kpi-value" id="akpi2">0%</div><div class="kpi-icon"><i data-lucide="target"></i></div></div>
    <div class="kpi-card"><div class="kpi-label">Needs Attention</div><div class="kpi-value" id="akpi3">0</div><div class="kpi-icon"><i data-lucide="alert-triangle"></i></div></div>
    <div class="kpi-card"><div class="kpi-label">Excellent</div><div class="kpi-value" id="akpi4">0</div><div class="kpi-icon"><i data-lucide="trending-up"></i></div></div>
  </div>

  <div class="grid-2" style="margin-bottom:24px;">
    <div class="card"><div class="section-title">Average Score by Competency</div><div class="chart-wrap short"><canvas id="chart-comp-perf"></canvas></div></div>
    <div class="card"><div class="section-title">Average Score by Role</div><div class="chart-wrap short"><canvas id="chart-role-perf"></canvas></div></div>
  </div>

  <div class="section-title">Officer Directory <button class="btn btn-outline btn-sm" id="goto-officers-full" style="font-weight:600;">Open Full Directory</button></div>
  <div class="table-wrap"><table class="data-table"><thead><tr><th>Officer</th><th>Role</th><th>Competency</th><th>Top Gap</th><th>Status</th></tr></thead><tbody id="admin-mini-officers"></tbody></table></div>
  `;
  icons();

  animateCount($('#akpi1'), totalOfficers);
  animateCount($('#akpi2'), avgCompetency, '%');
  animateCount($('#akpi3'), needsAttention);
  animateCount($('#akpi4'), excellent);

  const byCompetency = {};
  rolePerf.forEach(r => { if (!byCompetency[r.competency]) byCompetency[r.competency] = []; byCompetency[r.competency].push(r.avgScore); });
  const compLabels = Object.keys(byCompetency);
  const compValues = compLabels.map(c => Math.round(byCompetency[c].reduce((a, b) => a + b, 0) / byCompetency[c].length));

  const byRole = {};
  rolePerf.forEach(r => { if (!byRole[r.role]) byRole[r.role] = []; byRole[r.role].push(r.avgScore); });
  const roleLabels = Object.keys(byRole);
  const roleValues = roleLabels.map(r => Math.round(byRole[r].reduce((a, b) => a + b, 0) / byRole[r].length));

  destroyChart('compPerf');
  state.chartRegistry.compPerf = new Chart(document.getElementById('chart-comp-perf'), {
    type: 'bar',
    data: { labels: compLabels, datasets: [{ data: compValues, backgroundColor: compValues.map(v => v < 60 ? '#c2422d' : v < 80 ? '#b8720f' : '#0f8f8a'), borderRadius: 6 }] },
    options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', scales: { x: { max: 100, grid: { color: '#eef1f5' } }, y: { grid: { display: false } } }, plugins: { legend: { display: false } } },
  });
  destroyChart('rolePerf');
  state.chartRegistry.rolePerf = new Chart(document.getElementById('chart-role-perf'), {
    type: 'doughnut',
    data: { labels: roleLabels, datasets: [{ data: roleValues, backgroundColor: ['#2743a3', '#0f8f8a', '#b8720f'] }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } } },
  });

  const tbody = $('#admin-mini-officers');
  officers.slice(0, 6).forEach(o => {
    const row = el(`<tr style="cursor:pointer;">
      <td><b>${o.name}</b></td><td>${o.role}</td><td class="mono">${o.competency}%</td><td>${o.gap}</td>
      <td><span class="status-chip ${officerStatusChipClass(o.status)}">${o.status}</span></td>
    </tr>`);
    row.addEventListener('click', () => navigate('admin-officer-detail', o.id));
    tbody.appendChild(row);
  });
  $('#goto-officers-full').addEventListener('click', () => navigate('admin-officers'));
}

// =====================================================================
// ===== OFFICER DIRECTORY PAGE (admin) =====
// =====================================================================
export async function renderAdminOfficers() {
  $('#v-admin-officers').innerHTML = `<div class="page-head"><div><h1>Loading…</h1></div></div>`;
  let officers;
  try { ({ officers } = await api.getOfficers()); }
  catch (err) { $('#v-admin-officers').innerHTML = `<p class="muted">${friendlyError(err)}</p>`; return; }

  $('#v-admin-officers').innerHTML = `
  <div class="page-head"><div><h1>Officer Directory</h1><p>${officers.length} officers.</p></div></div>
  <div class="table-toolbar"><input type="text" id="off-search" placeholder="Search officers..."></div>
  <div class="table-wrap"><table class="data-table"><thead><tr><th>Officer</th><th>Employee ID</th><th>Role</th><th>Competency</th><th>Top Gap</th><th>Progress</th><th>Last Assessment</th><th>Status</th></tr></thead><tbody id="off-table-body"></tbody></table></div>`;
  icons();

  function renderRows(list) {
    $('#off-table-body').innerHTML = '';
    list.forEach(o => {
      const row = el(`<tr style="cursor:pointer;">
        <td><b>${o.name}</b></td><td class="mono">${o.employeeId}</td><td>${o.role}</td><td class="mono">${o.competency}%</td>
        <td>${o.gap}</td><td class="mono">${o.progress}%</td><td>${formatDate(o.lastAssessment)}</td>
        <td><span class="status-chip ${officerStatusChipClass(o.status)}">${o.status}</span></td>
      </tr>`);
      row.addEventListener('click', () => navigate('admin-officer-detail', o.id));
      $('#off-table-body').appendChild(row);
    });
  }
  renderRows(officers);
  $('#off-search').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    renderRows(officers.filter(o => o.name.toLowerCase().includes(q) || o.employeeId.toLowerCase().includes(q)));
  });
}

// =====================================================================
// ===== OFFICER DETAIL PAGE (admin - one officer, drilled into) =====
// =====================================================================
export async function renderOfficerDetail(officerId) {
  $('#v-admin-officer-detail').innerHTML = `<div class="page-head"><div><h1>Loading…</h1></div></div>`;
  let o;
  try { o = await api.getOfficer(officerId); }
  catch (err) { $('#v-admin-officer-detail').innerHTML = `<p class="muted">${friendlyError(err)}</p>`; return; }

  $('#v-admin-officer-detail').innerHTML = `
  <button class="btn btn-outline btn-sm" id="od-back" style="margin-bottom:18px;"><i data-lucide="arrow-left"></i> Back to Officers</button>
  <div class="page-head"><div><h1>${o.name}</h1><p>${o.role} · ${o.department || ''} · ${o.employeeId}</p></div>
    <span class="status-chip ${officerStatusChipClass(o.status)}">${o.status}</span></div>
  <div class="grid-3" style="margin-bottom:24px;">
    <div class="kpi-card"><div class="kpi-label">Overall Competency</div><div class="kpi-value">${o.competency}%</div></div>
    <div class="kpi-card"><div class="kpi-label">Learning Progress</div><div class="kpi-value">${o.progress}%</div></div>
    <div class="kpi-card"><div class="kpi-label">Last Assessment</div><div class="kpi-value" style="font-size:15px;">${formatDate(o.lastAssessment)}</div></div>
  </div>
  <div class="card"><div class="section-title">Competency Scores</div>
    ${o.competencyScores.map(c => `<div style="margin-bottom:14px;"><div style="display:flex; justify-content:space-between; font-size:13.5px; margin-bottom:6px;"><span>${c.competency}</span><b class="mono">${c.score}%</b></div><div class="progress-track"><div class="progress-fill" style="width:${c.score}%; background:${c.gap_level === 'HIGH' ? '#c2422d' : c.gap_level === 'MEDIUM' ? '#b8720f' : '#0f8f8a'};"></div></div></div>`).join('') || '<p class="muted">No assessments completed yet.</p>'}
  </div>`;
  icons();
  $('#od-back').addEventListener('click', () => navigate('admin-officers'));
}

// =====================================================================
// ===== REPORTS PAGE (admin) =====
// Report definitions/labels are in REPORT_META below; the actual data
// + CSV export is built on the backend - see backend/routes/reports.js.
// =====================================================================
export async function renderAdminReports() {
  const REPORT_META = [
    { key: 'competency-gap', icon: 'target', title: 'Competency Gap Report', desc: 'Ranked competency gaps across all officers.' },
    { key: 'role-performance', icon: 'users', title: 'Role Performance Report', desc: 'Comparative average score by role and competency.' },
    { key: 'learning-progress', icon: 'route', title: 'Learning Progress Report', desc: 'Learning resource completion by officer.' },
    { key: 'assessment', icon: 'clipboard-check', title: 'Assessment Report', desc: 'All assessment attempts, scores and status.' },
  ];
  $('#v-admin-reports').innerHTML = `
  <div class="page-head"><div><h1>Reports</h1><p>Generated live from the database. CSV export is fully implemented; PDF export is not (see HACKATHON_GUIDE.md).</p></div></div>
  <div class="grid-2" id="reports-grid"></div>`;
  const grid = $('#reports-grid');
  REPORT_META.forEach(r => {
    const card = el(`<div class="card">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:10px;"><i data-lucide="${r.icon}"></i><h4 style="margin:0;">${r.title}</h4></div>
      <p class="muted" style="font-size:13.5px; margin-bottom:14px;">${r.desc}</p>
      <div id="preview-${r.key}" class="muted" style="font-size:12.5px; margin-bottom:12px;">Loading preview…</div>
      <button class="btn btn-primary btn-sm" data-key="${r.key}">Download CSV</button>
    </div>`);
    card.querySelector('button').addEventListener('click', () => { api.downloadReportCsv(r.key); toast('CSV downloading…', 'download'); });
    grid.appendChild(card);
  });
  icons();

  REPORT_META.forEach(async r => {
    try {
      const summary = await api.getReportSummary(r.key);
      $(`#preview-${r.key}`).textContent = `${summary.recordCount} record(s) in this report.`;
    } catch (e) { $(`#preview-${r.key}`).textContent = 'Preview unavailable.'; }
  });
}

// =====================================================================
// ===== SETTINGS PAGE (admin) =====
// =====================================================================
export function renderAdminSettings() {
  $('#v-admin-settings').innerHTML = `
  <div class="page-head"><div><h1>Settings</h1><p>Frequently-changed configuration lives in backend/config/appConfig.js — see HACKATHON_GUIDE.md.</p></div></div>
  <div class="card" style="max-width:640px;">
    <div class="section-title">Where to change things</div>
    <div class="intel-row"><span>Passing score, question counts, gap thresholds</span><b>backend/config/appConfig.js</b></div>
    <div class="intel-row"><span>Competencies &amp; required scores</span><b>data/competencies.js</b></div>
    <div class="intel-row"><span>Roles</span><b>data/roles.js</b></div>
    <div class="intel-row"><span>LLM / RAG model</span><b>backend/config/appConfig.js (LLM_MODEL)</b></div>
    <div class="intel-row"><span>Anthropic API key</span><b>.env (ANTHROPIC_API_KEY)</b></div>
  </div>`;
  icons();
}
