/* =====================================================================
   APPLICATION STATE
   One shared object holding everything the UI needs to remember
   between renders. Nothing here is the "source of truth" for scores
   etc. — that's the backend/database. This is just the current
   session's view of it.
===================================================================== */

export const state = {
  token: null,
  officer: null,        // { id, employeeId, name, email, roleId, isAdmin, department }
  role: null,            // full role object { id, name, icon, desc, competencies }
  roles: [],              // all roles, loaded once at login for role-select screen
  isAdminView: false,
  currentView: 'dashboard',
  sidebarCollapsed: false,
  // Has this officer ever completed a real diagnostic assessment?
  // Drives the "don't show competency scores before assessment" rule —
  // see HACKATHON_GUIDE.md and backend/routes/auth.js.
  hasCompletedDiagnostic: false,

  assessment: {
    id: null,
    questions: [],        // grows one at a time as the adaptive engine picks each next question
    totalQuestions: 0,     // the TARGET length of this attempt (may end sooner if the bank runs short)
    index: 0,
    answers: [],          // selectedIndex per question index
    feedback: [],          // {isCorrect, correctIndex, explanation} per question index
    correctCount: 0,
    difficulty: 'Medium',
    done: false,           // true once the backend's adaptive engine has no more questions to give
  },

  aiAssessment: { running: false },
  activeCompetency: null,
  chartRegistry: {},
  aiChatHistory: [],
};

export function resetAssessmentState() {
  state.assessment = { id: null, questions: [], totalQuestions: 0, index: 0, answers: [], feedback: [], correctCount: 0, difficulty: 'Medium', done: false, sources: [] };
}
