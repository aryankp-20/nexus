/* =====================================================================
   AUTH — public site interactions, login, role selection, logout.
   DEMO LOGIN against the real backend/database — not a real
   Government Identity Provider integration (see HACKATHON_GUIDE.md).
===================================================================== */

import { state } from './state.js';
import * as api from './api.js';
import { $, $all, el, icons, toast, openModal, friendlyError } from './utils.js';
import { showRoute, navigate, closeAllMenus } from './router.js';

// ===== HOMEPAGE (PUBLIC SITE) BUTTON WIRING =====
// Hooks up the "Login" / "Explore Platform" / "How It Works" buttons
// on the homepage. The homepage's actual TEXT lives in
// frontend/index.html — this function just makes the buttons work.
export function initPublicSite() {
  $('#btn-login-nav').addEventListener('click', () => showRoute('view-login'));
  $('#btn-explore').addEventListener('click', () => { document.getElementById('features').scrollIntoView({ behavior: 'smooth' }); });
  $('#btn-how').addEventListener('click', () => { document.getElementById('how').scrollIntoView({ behavior: 'smooth' }); });
  $('#btn-enter-platform').addEventListener('click', () => showRoute('view-login'));
  $('#pub-hamburger').addEventListener('click', () => $('.pub-links').classList.toggle('show'));
  $all('.pub-links a').forEach(a => a.addEventListener('click', () => $('.pub-links').classList.remove('show')));

  const steps = $all('.process-step');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) en.target.classList.add('in-view'); });
  }, { threshold: .25 });
  steps.forEach(s => obs.observe(s));

  const ring = document.getElementById('cycle-progress-ring');
  if (ring) {
    const circumference = 2 * Math.PI * 164;
    ring.style.strokeDasharray = circumference;
    setTimeout(() => { ring.style.strokeDashoffset = circumference * (1 - 0.72); }, 400);
  }
}

// ===== LOGIN =====
// Wires up the login form and the "Demo Quick Sign-in" buttons.
// Actually checking the email/password happens on the backend — see
// doLogin() below, which calls api.login().
export function initLogin() {
  $('#login-back').addEventListener('click', () => showRoute('view-public'));
  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#login-id').value.trim();
    const pass = $('#login-pass').value;
    if (!email) { toast('Please enter your Official Email or Employee ID.', 'alert-triangle'); return; }
    await doLogin(email, pass);
  });
  $('#btn-govid').addEventListener('click', () => {
    toast('Government Identity sign-in is not implemented for this prototype — using demo login instead.', 'badge-check');
    setTimeout(() => doLogin($('#login-id').value.trim() || 'officer.sharma@mospi.gov.in', $('#login-pass').value || 'demo1234'), 700);
  });
  $('#forgot-link').addEventListener('click', (e) => {
    e.preventDefault();
    openModal(`<div class="modal-head"><h2>Reset Password</h2></div>
      <p class="muted" style="margin-bottom:16px;">This is a hackathon prototype — password reset emails are not actually sent. Demo accounts all use the password "demo1234".</p>`);
  });
  $('#security-link').addEventListener('click', (e) => {
    e.preventDefault();
    openModal(`<div class="modal-head"><h2>Security &amp; Privacy</h2></div>
      <p style="line-height:1.6; color:var(--text-700); margin-bottom:12px;">This platform uses real backend authentication (JWT sessions, hashed passwords) and role-based API authorization for its hackathon build.</p>
      <p style="line-height:1.6; color:var(--text-500);">This is a demo prototype. No real government credentials or personal data are used — see HACKATHON_GUIDE.md for the honest implementation status.</p>`);
  });
  $all('.demo-pill').forEach(btn => {
    btn.addEventListener('click', async () => {
      const email = btn.getAttribute('data-email');
      $('#login-id').value = email;
      $('#login-pass').value = 'demo1234';
      await doLogin(email, 'demo1234');
    });
  });
}

// ===== LOGIN: API CALL =====
// Sends the email/password to the backend (api.login), stores the
// returned login token, then sends the officer to role-selection (or
// straight into the app for admins). This is the function that
// actually decides whether the login succeeded.
async function doLogin(email, password) {
  try {
    const { token, officer, hasCompletedDiagnostic } = await api.login(email, password);
    state.token = token;
    state.officer = officer;
    state.hasCompletedDiagnostic = hasCompletedDiagnostic;
    toast('Signed in successfully.', 'check-circle-2');

    const { roles } = await api.getRoles();
    state.roles = roles;
    state.role = roles.find(r => r.id === officer.roleId) || roles[0];

    if (officer.isAdmin) {
      state.isAdminView = true;
      const { enterApp } = await import('./app.js');
      enterApp();
    } else {
      buildRoleGrid();
      showRoute('view-role');
    }
  } catch (err) {
    toast(friendlyError(err), 'alert-triangle');
  }
}

// ===== ROLE SELECTION =====
// Builds the role-picker cards shown right after login (one card per
// role from data/roles.js, fetched via GET /api/roles).
export function buildRoleGrid() {
  const grid = $('#role-grid');
  grid.innerHTML = '';
  state.roles.forEach(r => {
    const card = el(`<div class="role-card">
      <div class="rc-icon"><i data-lucide="${r.icon}"></i></div>
      <h3>${r.name.toUpperCase()}</h3>
      <p class="rc-desc">${r.desc}</p>
      <ul class="rc-comps">${r.competencies.map(c => `<li>${c}</li>`).join('')}</ul>
      <button class="btn btn-primary btn-block role-select-btn">Select Role</button>
    </div>`);
    card.querySelector('.role-select-btn').addEventListener('click', async () => {
      state.role = r;
      toast(`Role set to ${r.name}.`, 'user-check');
      const { enterApp } = await import('./app.js');
      enterApp();
    });
    grid.appendChild(card);
  });
  icons();
}

export function initRoleSelect() {
  $('#role-back').addEventListener('click', () => { logout(false); showRoute('view-login'); });
}

// ===== LOGOUT =====
export function logout(showToast = true) {
  state.token = null;
  state.officer = null;
  state.role = null;
  state.isAdminView = false;
  closeAllMenus();
  if (showToast) toast('You have been signed out.', 'log-out');
  showRoute('view-public');
}
