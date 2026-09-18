/* =====================================================================
   UTILITIES — small shared helpers used across every page module.
   Beginner tip: $ and $all are shortcuts for document.querySelector /
   querySelectorAll. toast() shows the small pop-up message in the
   corner (e.g. "Signed in successfully."). openModal()/closeModal()
   control the popup box used for things like "Reset Password".
===================================================================== */

import { state } from './state.js';

export function $(sel, ctx) { return (ctx || document).querySelector(sel); }
export function $all(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }
export function el(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
export function icons() { if (window.lucide) lucide.createIcons(); }

export function gapClass(gap) {
  if (gap === 'HIGH') return 'status-high';
  if (gap === 'MEDIUM') return 'status-medium';
  return 'status-low';
}
export function gapColor(gap) {
  if (gap === 'HIGH') return '#c2422d';
  if (gap === 'MEDIUM') return '#b8720f';
  return '#0f8f8a';
}

export function officerStatusChipClass(status) {
  if (status === 'Needs Attention') return 'status-high';
  if (status === 'Excellent') return 'status-low';
  if (status === 'Not Yet Assessed') return 'status-neutral';
  return 'status-medium';
}

export function toast(msg, icon) {
  icon = icon || 'check-circle-2';
  const stack = $('#toast-stack');
  const t = el(`<div class="toast"><i data-lucide="${icon}"></i><span>${msg}</span></div>`);
  stack.appendChild(t);
  icons();
  setTimeout(() => { t.classList.add('toast-out'); setTimeout(() => t.remove(), 300); }, 3400);
}

export function openModal(html) {
  $('#modal-inner').innerHTML = `<button class="modal-close" id="modal-close-btn"><i data-lucide="x"></i></button>` + html;
  $('#modal-backdrop').classList.add('show');
  $('#modal').classList.add('show');
  icons();
  $('#modal-close-btn').addEventListener('click', closeModal);
}
export function closeModal() {
  $('#modal-backdrop').classList.remove('show');
  $('#modal').classList.remove('show');
}

export function animateCount(elm, target, suffix) {
  suffix = suffix || '';
  const start = 0;
  const dur = 900;
  const t0 = performance.now();
  function step(t) {
    const p = Math.min(1, (t - t0) / dur);
    const val = Math.round(start + (target - start) * (1 - Math.pow(1 - p, 3)));
    elm.textContent = val + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

export function destroyChart(key) {
  if (state.chartRegistry[key]) { state.chartRegistry[key].destroy(); delete state.chartRegistry[key]; }
}

export function formatDate(iso) {
  if (!iso || iso === 'Not yet assessed') return iso || '—';
  try { return new Date(iso.replace(' ', 'T')).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch (e) { return iso; }
}

export function friendlyError(err) {
  return (err && err.message) ? err.message : 'Something went wrong. Please try again.';
}

// ===== TIME-BASED GREETING (reusable everywhere instead of a fixed string) =====
// 5:00–11:59 -> Good Morning · 12:00–16:59 -> Good Afternoon · 17:00+ -> Good Evening
// Uses the OFFICER'S OWN DEVICE clock (new Date() is always local time in
// the browser), so it reflects their actual local time-of-day, and it is
// re-evaluated every time this is called — so a dashboard left open across
// a boundary (e.g. refreshed after 5pm) picks up the new greeting.
export function timeBasedGreeting(hour) {
  const h = (hour !== undefined) ? hour : new Date().getHours();
  if (h >= 5 && h < 12) return 'Good Morning';
  if (h >= 12 && h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// Convenience wrapper for the common "Good Morning, Aryan" pattern used
// across dashboard/profile headers.
export function greetingWithName(name) {
  return `${timeBasedGreeting()}, ${name}`;
}
