/* =====================================================================
   ROUTER
   Two levels of navigation:
   1) showRoute()  — top-level routes: public site / login / role select / app shell
   2) navigate()   — views inside the app shell (dashboard, competencies, etc.)
   Page render functions are registered from app.js via setRenderers()
   to avoid every page module importing every other page module.
===================================================================== */

import { state } from './state.js';
import { $, $all, icons } from './utils.js';

let renderers = {};
export function setRenderers(map) { renderers = map; }

// ===== TOP-LEVEL ROUTING =====
// Switches between the 4 big screens: public homepage / login / role
// select / the main app shell. Use this (not navigate()) when you need
// to jump between these big screens, e.g. showing the login page.
export function showRoute(routeId) {
  $all('.route').forEach(r => r.classList.remove('active'));
  $('#' + routeId).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

// ===== BREADCRUMB TEXT =====
// Beginner tip: the small "Learner / Dashboard" text shown at the top
// of each page comes from here. To change it, edit the text on the
// right of the matching 'view-name' line below.
const BREADCRUMBS = {
  'dashboard': 'Learner / Dashboard', 'competencies': 'Learner / My Competencies', 'competency-detail': 'Learner / My Competencies / Detail',
  'assessment-intro': 'Learner / Diagnostic Assessment', 'assessment': 'Learner / Diagnostic Assessment / In Progress', 'assessment-result': 'Learner / Diagnostic Assessment / Result',
  'learning-path': 'Learner / Learning Path', 'igot': 'Learner / iGOT Recommendations', 'ai-assessment': 'Learner / AI Assessments',
  'progress': 'Learner / Progress', 'profile': 'Profile',
  'admin-dashboard': 'Administration / Workforce Analytics', 'admin-quiz': 'Administration / AI Quiz Generator', 'admin-kb': 'Administration / Knowledge Base',
  'admin-officers': 'Administration / Officers', 'admin-officer-detail': 'Administration / Officers / Profile', 'admin-reports': 'Administration / Reports', 'admin-settings': 'Administration / Settings',
};

// Views that require a completed diagnostic assessment before they
// mean anything — see "Do not show unassessed scores" in
// HACKATHON_GUIDE.md. Admins are never gated (they browse data, they
// don't have a personal competency profile to protect).
const GATED_VIEWS = new Set(['dashboard', 'competencies', 'competency-detail', 'learning-path', 'igot', 'progress']);

function setActiveNav(view) {
  $all('.nav-item[data-view]').forEach(n => n.classList.toggle('active', n.dataset.view === view));
}
function closeMobileSidebar() { $('#sidebar').classList.remove('mobile-open'); }

// ===== IN-APP PAGE NAVIGATION =====
// This is the function every "go to this page" button in the app
// actually calls. It swaps which <section data-view="..."> is
// visible, updates the breadcrumb + sidebar highlight, and calls that
// page's render function (registered in app.js via setRenderers()).
export function navigate(view, payload) {
  if (GATED_VIEWS.has(view) && state.officer && !state.officer.isAdmin && !state.hasCompletedDiagnostic) {
    import('./utils.js').then(({ toast }) => toast('Complete your diagnostic assessment first — your competency profile isn\'t built yet.', 'lock'));
    view = 'assessment-intro';
  }
  state.currentView = view;
  $all('.view').forEach(v => v.classList.remove('active'));
  const target = $(`.view[data-view="${view}"]`);
  if (target) target.classList.add('active');
  $('#breadcrumb').textContent = BREADCRUMBS[view] || 'Application';
  setActiveNav(view);
  closeMobileSidebar();
  document.getElementById('app-content').scrollTo({ top: 0, behavior: 'auto' });

  if (renderers[view]) renderers[view](payload);
}

export function initShellNav({ onLogout, onSwitchRole, onToggleAdminView }) {
  $all('.nav-item[data-view]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.view));
  });
  $('#sidebar-brand').addEventListener('click', () => navigate(state.isAdminView ? 'admin-dashboard' : 'dashboard'));
  $('#sidebar-toggle').addEventListener('click', () => {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    $('#sidebar').classList.toggle('collapsed', state.sidebarCollapsed);
  });
  $('#app-hamburger').addEventListener('click', () => { $('#sidebar').classList.toggle('mobile-open'); });
  $('#btn-logout').addEventListener('click', onLogout);
  $('#pm-logout').addEventListener('click', onLogout);
  $('#pm-switch-role').addEventListener('click', () => { closeAllMenus(); onSwitchRole(); });
  $('#pm-toggle-app').addEventListener('click', onToggleAdminView);

  $('#btn-profile-menu').addEventListener('click', (e) => { e.stopPropagation(); toggleMenu('#profile-menu'); });
  $('#btn-notif').addEventListener('click', async (e) => {
    e.stopPropagation();
    toggleMenu('#notif-panel');
    const { renderNotifications } = await import('./pages/ai.js');
    renderNotifications();
  });
  document.addEventListener('click', closeAllMenus);
  $('#profile-menu').addEventListener('click', e => e.stopPropagation());
  $('#notif-panel').addEventListener('click', e => e.stopPropagation());
  $all('#profile-menu [data-view]').forEach(b => b.addEventListener('click', () => { navigate(b.dataset.view); closeAllMenus(); }));
}

function toggleMenu(sel) {
  const isOpen = $(sel).classList.contains('show');
  $('#profile-menu').classList.remove('show');
  $('#notif-panel').classList.remove('show');
  if (!isOpen) $(sel).classList.add('show');
}
export function closeAllMenus() {
  $('#profile-menu').classList.remove('show');
  $('#notif-panel').classList.remove('show');
}
