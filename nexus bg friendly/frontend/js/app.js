/* =====================================================================
   APP ENTRY POINT
   Imports every page module, registers them with the router, and wires
   up the shell (nav, AI assistant, search). This file is intentionally
   short — it should be readable top-to-bottom to see the whole app.
===================================================================== */

import { state } from './state.js';
import { icons, closeModal } from './utils.js';
import { showRoute, navigate, initShellNav, setRenderers } from './router.js';
import { initPublicSite, initLogin, initRoleSelect, buildRoleGrid, logout } from './auth.js';
import { loadConfig } from './config.js';

import { renderDashboard, renderCompetencies, renderCompetencyDetail, renderProgress, renderProfile } from './pages/learner.js';
import { renderAssessmentIntro, renderAssessmentQuestion, renderAssessmentResult } from './pages/assessment.js';
import { renderLearningPath, renderIgot } from './pages/learning.js';
import { renderAiAssessment, initAiAssistant, initGlobalSearch } from './pages/ai.js';
import { renderAdminDashboard, renderAdminOfficers, renderOfficerDetail, renderAdminReports, renderAdminSettings } from './pages/admin.js';
import { renderAdminKb, renderAdminQuiz } from './pages/adminQuiz.js';

// =====================================================================
// ===== NAVIGATION: PAGE REGISTRATION =====
// This map tells the router which function to call for each page name.
// To ADD A NEW PAGE: import your render function above, then add a new
// 'view-name': yourRenderFunction line below. The 'view-name' string
// must match the data-view="..." attribute used in frontend/index.html.
// =====================================================================
setRenderers({
  'dashboard': renderDashboard,
  'competencies': renderCompetencies,
  'competency-detail': (payload) => renderCompetencyDetail(payload),
  'assessment-intro': renderAssessmentIntro,
  'assessment': renderAssessmentQuestion,
  'assessment-result': renderAssessmentResult,
  'learning-path': renderLearningPath,
  'igot': renderIgot,
  'ai-assessment': renderAiAssessment,
  'progress': renderProgress,
  'profile': renderProfile,
  'admin-dashboard': renderAdminDashboard,
  'admin-quiz': renderAdminQuiz,
  'admin-kb': renderAdminKb,
  'admin-officers': renderAdminOfficers,
  'admin-officer-detail': (payload) => renderOfficerDetail(payload),
  'admin-reports': renderAdminReports,
  'admin-settings': renderAdminSettings,
});

// =====================================================================
// ===== DASHBOARD / "ENTER APP" LOGIC =====
// Runs right after login or after picking a role. Decides which page
// to show first: a brand-new officer (no completed assessment yet)
// goes straight to the Diagnostic Assessment intro instead of an
// empty dashboard. Everyone else goes to their normal dashboard.
// =====================================================================
export function enterApp() {
  showRoute('view-app');
  document.getElementById('role-badge').textContent = state.role.name.toUpperCase();
  document.getElementById('sb-user-name').textContent = state.officer.name;
  document.getElementById('sb-user-role').textContent = state.role.name;
  const initials = state.officer.name.split(' ').map(p => p[0]).slice(-2).join('').toUpperCase();
  document.querySelectorAll('.avatar.sm').forEach(a => a.textContent = initials);
  document.getElementById('pm-toggle-label').textContent = state.isAdminView ? 'Switch to Learner View' : 'Switch to Admin View';
  // Backend enforces role-based authorization on every admin API (a
  // learner's JWT is never marked isAdmin), so the UI only offers the
  // Admin View toggle and the Administration nav section to real admins.
  document.getElementById('pm-toggle-app').style.display = state.officer.isAdmin ? '' : 'none';
  document.getElementById('admin-nav').style.display = state.officer.isAdmin ? '' : 'none';

  // Do NOT show competency scores before the officer has ever been
  // assessed (see HACKATHON_GUIDE.md, "Do not show unassessed scores").
  // A brand-new officer lands on the diagnostic assessment intro
  // instead of a dashboard full of numbers that don't exist yet.
  if (!state.officer.isAdmin && !state.hasCompletedDiagnostic) {
    navigate('assessment-intro');
    return;
  }
  navigate(state.isAdminView ? 'admin-dashboard' : 'dashboard');
}

// =====================================================================
// ===== APP STARTUP =====
// Runs once, as soon as the page finishes loading (see the
// DOMContentLoaded listener at the bottom of this file). Wires up
// every button/panel that exists outside of a specific page (login
// form, sidebar nav, AI chat, global search), then shows the homepage.
// =====================================================================
function init() {
  icons();
  document.getElementById('modal-backdrop').addEventListener('click', closeModal);
  initPublicSite();
  initLogin();
  initRoleSelect();
  initShellNav({
    onLogout: logout,
    onSwitchRole: () => { buildRoleGrid(); showRoute('view-role'); },
    onToggleAdminView: () => {
      state.isAdminView = !state.isAdminView;
      document.getElementById('pm-toggle-label').textContent = state.isAdminView ? 'Switch to Learner View' : 'Switch to Admin View';
      navigate(state.isAdminView ? 'admin-dashboard' : 'dashboard');
    },
  });
  initAiAssistant();
  initGlobalSearch();
  loadConfig();
  showRoute('view-public');
}

document.addEventListener('DOMContentLoaded', init);
