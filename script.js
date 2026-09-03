/* =====================================================================
   COMPETENCY INTELLIGENCE — APPLICATION SCRIPT
   Vanilla JS SPA: routing, mock data, assessment engine, RAG simulation,
   charts, AI assistant, notifications, search, modals.
===================================================================== */

/* ------------------------------------------------------------------ */
/* MOCK DATA                                                          */
/* ------------------------------------------------------------------ */

const ROLES = [
  { id:'collector', name:'Data Collector', icon:'clipboard-list',
    desc:'Field-level data collection for official surveys and censuses.',
    competencies:['Survey Methodology','Sampling','CAPI','Field Procedures'] },
  { id:'field', name:'Field Officer', icon:'map-pinned',
    desc:'Supervises field operations and ensures data quality on the ground.',
    competencies:['Survey Methodology','Sampling','CAPI','Field Protocols','Supervision'] },
  { id:'analyst', name:'Statistical Analyst', icon:'chart-spline',
    desc:'Processes and interprets statistical data for official releases.',
    competencies:['Statistical Analysis','Sampling Algorithms','Data Interpretation','Data Processing'] },
];

const COMPETENCY_LIB = {
  'Survey Methodology': { current:82, required:80, gap:'LOW', sub:[['Questionnaire Design',88],['Survey Design Principles',80],['Non-sampling Error',78]] },
  'Sampling': { current:48, required:75, gap:'HIGH', sub:[['Basic Concepts',90],['Sampling Methods',60],['Sampling Algorithms',40],['Advanced Application',30]] },
  'CAPI': { current:81, required:85, gap:'MEDIUM', sub:[['App Navigation',92],['Offline Sync',78],['Data Validation Rules',74]] },
  'Field Procedures': { current:88, required:90, gap:'LOW', sub:[['Respondent Protocol',91],['Quality Checks',86],['Escalation Process',87]] },
  'Field Protocols': { current:79, required:85, gap:'MEDIUM', sub:[['Route Planning',82],['Supervision Checklist',76]] },
  'Supervision': { current:74, required:82, gap:'MEDIUM', sub:[['Team Coordination',77],['Quality Audit',71]] },
  'Statistical Analysis': { current:83, required:85, gap:'LOW', sub:[['Descriptive Stats',88],['Inferential Stats',79]] },
  'Sampling Algorithms': { current:61, required:80, gap:'HIGH', sub:[['Stratified Sampling',68],['Cluster Sampling',55],['PPS Sampling',52]] },
  'Data Interpretation': { current:79, required:80, gap:'LOW', sub:[['Trend Analysis',81],['Cross-tabulation',77]] },
  'Data Processing': { current:69, required:80, gap:'MEDIUM', sub:[['Data Cleaning',74],['Imputation',64]] },
};

const LEARNING_PATH = [
  { n:1, title:'Sampling Fundamentals', tag:'Recommended', match:96, duration:'30 min', competency:'Sampling', locked:false,
    reason:'Recommended because Sampling is currently below the required competency level.' },
  { n:2, title:'Sampling Methods', tag:'Next', match:92, duration:'45 min', competency:'Sampling', locked:true,
    reason:'Builds directly on Sampling Fundamentals to close the identified gap.' },
  { n:3, title:'Sampling in Official Surveys', tag:'Next', match:89, duration:'40 min', competency:'Sampling', locked:true,
    reason:'Applies sampling theory to real official statistical survey design.' },
  { n:4, title:'CAPI Data Validation Deep-Dive', tag:'Suggested', match:74, duration:'25 min', competency:'CAPI', locked:true,
    reason:'CAPI sits at Medium gap and benefits from targeted reinforcement.' },
];

const IGOT_COURSES = [
  { title:'Sampling Fundamentals', competency:'Sampling', duration:'30 min', difficulty:'Beginner', match:96, provider:'iGOT Karmayogi · NSSO Academy' },
  { title:'Advanced Sampling Algorithms', competency:'Sampling', duration:'1h 10m', difficulty:'Advanced', match:91, provider:'iGOT Karmayogi · MoSPI' },
  { title:'CAPI Field Data Quality', competency:'CAPI', duration:'40 min', difficulty:'Intermediate', match:83, provider:'iGOT Karmayogi · NIC' },
  { title:'Survey Design Handbook Walkthrough', competency:'Survey Methodology', duration:'55 min', difficulty:'Intermediate', match:78, provider:'iGOT Karmayogi · IIPA' },
  { title:'Statistical Data Processing Essentials', competency:'Data Processing', duration:'50 min', difficulty:'Beginner', match:75, provider:'iGOT Karmayogi · MoSPI' },
  { title:'Field Supervision & Quality Audits', competency:'Supervision', duration:'35 min', difficulty:'Intermediate', match:70, provider:'iGOT Karmayogi · NSSO Academy' },
];

const KNOWLEDGE_BASE = [
  { name:'Sampling Methodology Manual', pages:120, uploaded:'12 Jul 2026', status:'Ready', indexed:true, questions:48 },
  { name:'Survey Design Handbook', pages:84, uploaded:'03 Jul 2026', status:'Indexed', indexed:true, questions:36 },
  { name:'CAPI Field Procedures', pages:64, uploaded:'28 Jun 2026', status:'Ready', indexed:true, questions:29 },
  { name:'Data Processing Guidelines', pages:97, uploaded:'19 Jun 2026', status:'Processing', indexed:false, questions:0 },
];

const OFFICERS = [
  { name:'Officer R. Sharma', id:'MOSPI-10234', role:'Data Collector', competency:82, gap:'Sampling', progress:64, last:'21 Aug 2026', status:'On Track' },
  { name:'Officer A. Verma', id:'MOSPI-10871', role:'Field Officer', competency:74, gap:'Supervision', progress:41, last:'18 Aug 2026', status:'Needs Attention' },
  { name:'Officer K. Iyer', id:'MOSPI-11190', role:'Statistical Analyst', competency:88, gap:'Data Processing', progress:82, last:'22 Aug 2026', status:'On Track' },
  { name:'Officer S. Nair', id:'MOSPI-10456', role:'Data Collector', competency:59, gap:'Sampling', progress:22, last:'10 Aug 2026', status:'Needs Attention' },
  { name:'Officer P. Das', id:'MOSPI-11302', role:'Field Officer', competency:79, gap:'Field Protocols', progress:58, last:'20 Aug 2026', status:'On Track' },
  { name:'Officer M. Khan', id:'MOSPI-10678', role:'Statistical Analyst', competency:91, gap:'Data Interpretation', progress:90, last:'23 Aug 2026', status:'Excellent' },
  { name:'Officer T. Reddy', id:'MOSPI-11045', role:'Data Collector', competency:66, gap:'CAPI', progress:37, last:'14 Aug 2026', status:'Needs Attention' },
  { name:'Officer J. Singh', id:'MOSPI-10923', role:'Field Officer', competency:85, gap:'Supervision', progress:71, last:'19 Aug 2026', status:'On Track' },
];

const NOTIFICATIONS = [
  { icon:'trending-up', text:'Your Sampling competency improved by 8%.', time:'2 hours ago' },
  { icon:'book-open', text:'New recommended course available: CAPI Field Data Quality.', time:'5 hours ago' },
  { icon:'sparkles', text:'Your AI assessment is ready for review.', time:'Yesterday' },
  { icon:'check-circle-2', text:'Diagnostic assessment completed.', time:'2 days ago' },
];

const REPORTS = [
  { icon:'target', title:'Competency Gap Report', desc:'Ranked competency gaps across roles and departments.' },
  { icon:'users', title:'Role Performance Report', desc:'Comparative performance benchmarking by role.' },
  { icon:'route', title:'Learning Progress Report', desc:'Learning path completion and engagement statistics.' },
  { icon:'clipboard-check', title:'Assessment Report', desc:'Diagnostic assessment outcomes and score distribution.' },
  { icon:'sparkles', title:'AI Assessment Report', desc:'RAG-generated question quality and approval statistics.' },
];

// Question bank used for diagnostic + AI assessments
const QUESTION_BANK = [
  { q:'Which sampling method is most appropriate when a population is naturally divided into distinct, non-overlapping subgroups?', comp:'Sampling', diff:'Medium',
    opts:['Simple Random Sampling','Stratified Sampling','Convenience Sampling','Snowball Sampling'], correct:1 },
  { q:'In CAPI-based surveys, what is the primary purpose of offline synchronization?', comp:'CAPI', diff:'Easy',
    opts:['To reduce respondent burden','To allow data capture without live connectivity, syncing later','To skip data validation','To auto-generate survey questions'], correct:1 },
  { q:'Which of the following best describes Probability Proportional to Size (PPS) sampling?', comp:'Sampling', diff:'Hard',
    opts:['Every unit has an equal chance of selection','Units are selected with probability proportional to a size measure','Units are selected purely by convenience','Sampling stops once quota is reached'], correct:1 },
  { q:'What is the main goal of a pilot survey in field procedures?', comp:'Field Procedures', diff:'Easy',
    opts:['To finalize publication tables','To test questionnaire design and field logistics before full rollout','To replace the main survey','To calculate final sampling weights'], correct:1 },
  { q:'Cluster sampling is most efficient when:', comp:'Sampling', diff:'Medium',
    opts:['Population units within clusters are homogeneous','Population units within clusters are heterogeneous and clusters are similar to each other','There is no travel cost consideration','Sample size is very small'], correct:1 },
  { q:'Which error type arises from respondents providing inaccurate answers, independent of the sampling method used?', comp:'Survey Methodology', diff:'Medium',
    opts:['Sampling error','Non-sampling error','Coverage error','Systematic error'], correct:1 },
  { q:'In a stratified sampling design, strata should ideally be formed such that:', comp:'Sampling', diff:'Hard',
    opts:['Strata are heterogeneous internally','Strata are homogeneous internally and heterogeneous between strata','Strata sizes are always equal','Strata are chosen randomly'], correct:1 },
  { q:'What does CAPI stand for in official survey operations?', comp:'CAPI', diff:'Easy',
    opts:['Computer Assisted Personal Interviewing','Central Administrative Public Index','Cluster Adaptive Probability Interview','Coded Automated Print Instrument'], correct:0 },
  { q:'A field officer notices inconsistent responses across enumerators. What is the appropriate first action?', comp:'Field Procedures', diff:'Medium',
    opts:['Discard all affected data immediately','Conduct a quality audit and re-training if needed','Ignore since sample size is large','Change the survey instrument mid-field'], correct:1 },
  { q:'Which technique is used to correct for non-response in survey estimates?', comp:'Sampling', diff:'Hard',
    opts:['Sampling weight adjustment / imputation','Removing all non-respondents','Reducing sample frame','Increasing questionnaire length'], correct:0 },
];

/* ------------------------------------------------------------------ */
/* APPLICATION STATE                                                  */
/* ------------------------------------------------------------------ */

const state = {
  loggedIn:false,
  role: ROLES[0],
  userName:'Officer Sharma',
  employeeId:'MOSPI-10234',
  isAdminView:false,
  currentView:'dashboard',
  sidebarCollapsed:false,
  assessment:{
    questions:[], index:0, answers:[], correctCount:0, difficulty:'Medium', answeredCurrent:false, selectedOpt:null,
  },
  aiAssessment:{ stage:-1, running:false, generated:null },
  activeCompetency:null,
  chartRegistry:{},
  aiChatHistory:[],
};

/* ------------------------------------------------------------------ */
/* UTILITIES                                                          */
/* ------------------------------------------------------------------ */

function $(sel, ctx){ return (ctx||document).querySelector(sel); }
function $all(sel, ctx){ return Array.from((ctx||document).querySelectorAll(sel)); }
function el(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstElementChild; }
function icons(){ if(window.lucide){ lucide.createIcons(); } }

function gapClass(gap){
  if(gap==='HIGH') return 'status-high';
  if(gap==='MEDIUM') return 'status-medium';
  return 'status-low';
}
function gapColor(gap){
  if(gap==='HIGH') return '#c2422d';
  if(gap==='MEDIUM') return '#b8720f';
  return '#0f8f8a';
}

function toast(msg, icon){
  icon = icon || 'check-circle-2';
  const stack = $('#toast-stack');
  const t = el(`<div class="toast"><i data-lucide="${icon}"></i><span>${msg}</span></div>`);
  stack.appendChild(t);
  icons();
  setTimeout(()=>{ t.classList.add('toast-out'); setTimeout(()=>t.remove(),300); }, 3400);
}

function openModal(html){
  $('#modal-inner').innerHTML = `<button class="modal-close" id="modal-close-btn"><i data-lucide="x"></i></button>` + html;
  $('#modal-backdrop').classList.add('show');
  $('#modal').classList.add('show');
  icons();
  $('#modal-close-btn').addEventListener('click', closeModal);
}
function closeModal(){
  $('#modal-backdrop').classList.remove('show');
  $('#modal').classList.remove('show');
}
$('#modal-backdrop') && $('#modal-backdrop').addEventListener('click', closeModal);

function animateCount(elm, target, suffix){
  suffix = suffix || '';
  let start = 0;
  const dur = 900;
  const t0 = performance.now();
  function step(t){
    const p = Math.min(1, (t-t0)/dur);
    const val = Math.round(start + (target-start) * (1-Math.pow(1-p,3)));
    elm.textContent = val + suffix;
    if(p<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function destroyChart(key){
  if(state.chartRegistry[key]){ state.chartRegistry[key].destroy(); delete state.chartRegistry[key]; }
}

/* ------------------------------------------------------------------ */
/* PUBLIC SITE INTERACTIONS                                           */
/* ------------------------------------------------------------------ */

function showRoute(routeId){
  $all('.route').forEach(r=>r.classList.remove('active'));
  $('#'+routeId).classList.add('active');
  window.scrollTo({top:0, behavior:'instant' in window ? 'instant' : 'auto'});
}

function initPublicSite(){
  $('#btn-login-nav').addEventListener('click', ()=>showRoute('view-login'));
  $('#btn-explore').addEventListener('click', ()=>{ document.getElementById('features').scrollIntoView({behavior:'smooth'}); });
  $('#btn-how').addEventListener('click', ()=>{ document.getElementById('how').scrollIntoView({behavior:'smooth'}); });
  $('#btn-enter-platform').addEventListener('click', ()=>showRoute('view-login'));
  $('#pub-hamburger').addEventListener('click', ()=>$('.pub-links').classList.toggle('show'));
  $all('.pub-links a').forEach(a=>a.addEventListener('click', ()=>$('.pub-links').classList.remove('show')));

  // Process rail scroll reveal
  const steps = $all('.process-step');
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{ if(en.isIntersecting) en.target.classList.add('in-view'); });
  }, {threshold:.25});
  steps.forEach(s=>obs.observe(s));

  // hero cycle ring animate
  const ring = document.getElementById('cycle-progress-ring');
  if(ring){
    const circumference = 2*Math.PI*164;
    ring.style.strokeDasharray = circumference;
    setTimeout(()=>{ ring.style.strokeDashoffset = circumference * (1-0.72); }, 400);
  }
}

/* ------------------------------------------------------------------ */
/* LOGIN & ROLE SELECTION                                             */
/* ------------------------------------------------------------------ */

function initLogin(){
  $('#login-back').addEventListener('click', ()=>showRoute('view-public'));
  $('#login-form').addEventListener('submit', (e)=>{
    e.preventDefault();
    const idVal = $('#login-id').value.trim();
    if(!idVal){ toast('Please enter your Official Email or Employee ID.', 'alert-triangle'); return; }
    doLogin();
  });
  $('#btn-govid').addEventListener('click', ()=>{
    toast('Redirecting to Government Identity provider (simulated)...', 'badge-check');
    setTimeout(doLogin, 900);
  });
  $('#forgot-link').addEventListener('click', (e)=>{
    e.preventDefault();
    openModal(`<div class="modal-head"><h2>Reset Password</h2></div>
      <p class="muted" style="margin-bottom:16px;">Enter your registered official email and we'll simulate sending a reset link (prototype only, no email is actually sent).</p>
      <label class="field"><span>Official Email</span><input type="text" placeholder="you@gov.in"></label>
      <button class="btn btn-primary btn-block" id="reset-send-btn">Send Reset Link</button>`);
    $('#reset-send-btn').addEventListener('click', ()=>{ closeModal(); toast('Password reset link sent (simulated).','mail-check'); });
  });
  $('#security-link').addEventListener('click', (e)=>{
    e.preventDefault();
    openModal(`<div class="modal-head"><h2>Security &amp; Privacy</h2></div>
      <p style="line-height:1.6; color:var(--text-700); margin-bottom:12px;">This platform is built for the Official Statistical System with role-based access control, encrypted credential handling, and audit-logged assessment activity.</p>
      <p style="line-height:1.6; color:var(--text-500);">This is a demo prototype. No real government credentials or personal data are transmitted or stored.</p>`);
  });
}

function doLogin(){
  state.loggedIn = true;
  toast('Signed in successfully.', 'check-circle-2');
  buildRoleGrid();
  showRoute('view-role');
}

function buildRoleGrid(){
  const grid = $('#role-grid');
  grid.innerHTML = '';
  ROLES.forEach(r=>{
    const card = el(`<div class="role-card">
      <div class="rc-icon"><i data-lucide="${r.icon}"></i></div>
      <h3>${r.name.toUpperCase()}</h3>
      <p class="rc-desc">${r.desc}</p>
      <ul class="rc-comps">${r.competencies.map(c=>`<li>${c}</li>`).join('')}</ul>
      <button class="btn btn-primary btn-block role-select-btn">Select Role</button>
    </div>`);
    card.querySelector('.role-select-btn').addEventListener('click', ()=>selectRole(r.id));
    grid.appendChild(card);
  });
  icons();
}

function selectRole(id){
  state.role = ROLES.find(r=>r.id===id);
  toast(`Role set to ${state.role.name}.`, 'user-check');
  enterApp();
}

function initRoleSelect(){
  $('#role-back').addEventListener('click', ()=>{ state.loggedIn=false; showRoute('view-login'); });
}

/* ------------------------------------------------------------------ */
/* APP SHELL / NAVIGATION                                             */
/* ------------------------------------------------------------------ */

function enterApp(){
  showRoute('view-app');
  $('#role-badge').textContent = state.role.name.toUpperCase();
  $('#sb-user-name').textContent = state.userName;
  $('#sb-user-role').textContent = state.role.name;
  $('#pm-toggle-label').textContent = state.isAdminView ? 'Switch to Learner View' : 'Switch to Admin View';
  navigate(state.isAdminView ? 'admin-dashboard' : 'dashboard');
}

function setActiveNav(view){
  $all('.nav-item[data-view]').forEach(n=>n.classList.toggle('active', n.dataset.view===view));
}

const BREADCRUMBS = {
  'dashboard':'Learner / Dashboard','competencies':'Learner / My Competencies','competency-detail':'Learner / My Competencies / Detail',
  'assessment-intro':'Learner / Diagnostic Assessment','assessment':'Learner / Diagnostic Assessment / In Progress','assessment-result':'Learner / Diagnostic Assessment / Result',
  'learning-path':'Learner / Learning Path','igot':'Learner / iGOT Recommendations','ai-assessment':'Learner / AI Assessments',
  'progress':'Learner / Progress','profile':'Profile',
  'admin-dashboard':'Administration / Workforce Analytics','admin-quiz':'Administration / AI Quiz Generator','admin-kb':'Administration / Knowledge Base',
  'admin-officers':'Administration / Officers','admin-officer-detail':'Administration / Officers / Profile','admin-reports':'Administration / Reports','admin-settings':'Administration / Settings',
};

function navigate(view, payload){
  state.currentView = view;
  $all('.view').forEach(v=>v.classList.remove('active'));
  const target = $(`.view[data-view="${view}"]`);
  if(target) target.classList.add('active');
  $('#breadcrumb').textContent = BREADCRUMBS[view] || 'Application';
  setActiveNav(view);
  closeMobileSidebar();
  document.getElementById('app-content').scrollTo({top:0,behavior:'auto'});

  const renderers = {
    'dashboard':renderDashboard, 'competencies':renderCompetencies, 'competency-detail':()=>renderCompetencyDetail(payload),
    'assessment-intro':renderAssessmentIntro, 'assessment':startAssessment, 'assessment-result':renderAssessmentResult,
    'learning-path':renderLearningPath, 'igot':renderIgot, 'ai-assessment':renderAiAssessment,
    'progress':renderProgress, 'profile':renderProfile,
    'admin-dashboard':renderAdminDashboard, 'admin-quiz':renderAdminQuiz, 'admin-kb':renderAdminKb,
    'admin-officers':renderAdminOfficers, 'admin-officer-detail':()=>renderOfficerDetail(payload),
    'admin-reports':renderAdminReports, 'admin-settings':renderAdminSettings,
  };
  if(renderers[view]) renderers[view]();
}

function initShellNav(){
  $all('.nav-item[data-view]').forEach(btn=>{
    btn.addEventListener('click', ()=>navigate(btn.dataset.view));
  });
  $('#sidebar-brand').addEventListener('click', ()=>navigate(state.isAdminView?'admin-dashboard':'dashboard'));
  $('#sidebar-toggle').addEventListener('click', ()=>{
    state.sidebarCollapsed = !state.sidebarCollapsed;
    $('#sidebar').classList.toggle('collapsed', state.sidebarCollapsed);
  });
  $('#app-hamburger').addEventListener('click', ()=>{
    $('#sidebar').classList.toggle('mobile-open');
  });
  $('#btn-logout').addEventListener('click', logout);
  $('#pm-logout').addEventListener('click', logout);
  $('#pm-switch-role').addEventListener('click', ()=>{ closeAllMenus(); buildRoleGrid(); showRoute('view-role'); });
  $('#pm-toggle-app').addEventListener('click', ()=>{
    state.isAdminView = !state.isAdminView;
    $('#pm-toggle-label').textContent = state.isAdminView ? 'Switch to Learner View' : 'Switch to Admin View';
    closeAllMenus();
    navigate(state.isAdminView ? 'admin-dashboard' : 'dashboard');
    toast(state.isAdminView ? 'Switched to Administrator view.' : 'Switched to Learner view.', 'repeat');
  });

  $('#btn-profile-menu').addEventListener('click', (e)=>{ e.stopPropagation(); toggleMenu('#profile-menu'); });
  $('#btn-notif').addEventListener('click', (e)=>{ e.stopPropagation(); toggleMenu('#notif-panel'); renderNotifications(); });
  $('#btn-ai-header').addEventListener('click', ()=>toggleAiPanel(true));
  document.addEventListener('click', closeAllMenus);
  $('#profile-menu').addEventListener('click', e=>e.stopPropagation());
  $('#notif-panel').addEventListener('click', e=>e.stopPropagation());

  $all('#profile-menu [data-view]').forEach(b=>b.addEventListener('click', ()=>{ navigate(b.dataset.view); closeAllMenus(); }));

  // global search
  $('#global-search').addEventListener('input', handleGlobalSearch);
  $('#global-search').addEventListener('focus', handleGlobalSearch);
  document.addEventListener('click', (e)=>{
    if(!$('.header-search').contains(e.target)) $('#search-results').classList.remove('show');
  });
}

function closeMobileSidebar(){ $('#sidebar').classList.remove('mobile-open'); }
function toggleMenu(sel){
  const isOpen = $(sel).classList.contains('show');
  $('#profile-menu').classList.remove('show');
  $('#notif-panel').classList.remove('show');
  if(!isOpen) $(sel).classList.add('show');
}
function closeAllMenus(){ $('#profile-menu').classList.remove('show'); $('#notif-panel').classList.remove('show'); }

function logout(){
  state.loggedIn = false;
  closeAllMenus();
  toast('You have been signed out.', 'log-out');
  showRoute('view-public');
}

function renderNotifications(){
  const panel = $('#notif-panel');
  panel.innerHTML = `<div class="notif-panel-head">Notifications</div>` +
    NOTIFICATIONS.map(n=>`<div class="notif-item"><i data-lucide="${n.icon}"></i><div><div>${n.text}</div><div class="ni-time">${n.time}</div></div></div>`).join('');
  icons();
  $('#notif-dot').style.display = 'none';
}

function handleGlobalSearch(){
  const q = $('#global-search').value.trim().toLowerCase();
  const box = $('#search-results');
  if(!q){ box.classList.remove('show'); return; }
  const pool = [
    ...Object.keys(COMPETENCY_LIB).map(k=>({label:k, cat:'Competency', action:()=>navigate('competency-detail',k)})),
    ...IGOT_COURSES.map(c=>({label:c.title, cat:'iGOT Course', action:()=>navigate('igot')})),
    ...OFFICERS.map(o=>({label:o.name, cat:'Officer', action:()=>navigate('admin-officer-detail',o)})),
    ...KNOWLEDGE_BASE.map(d=>({label:d.name, cat:'Document', action:()=>navigate('admin-kb')})),
  ];
  const matches = pool.filter(p=>p.label.toLowerCase().includes(q)).slice(0,8);
  box.innerHTML = matches.length ? matches.map((m,i)=>`<div class="sr-item" data-i="${i}"><span>${m.label}</span><span class="sr-cat">${m.cat}</span></div>`).join('')
    : `<div class="sr-empty">No results for "${q}"</div>`;
  box.classList.add('show');
  $all('.sr-item', box).forEach((it,i)=>it.addEventListener('click', ()=>{ matches[i].action(); box.classList.remove('show'); $('#global-search').value=''; }));
}

/* ------------------------------------------------------------------ */
/* LEARNER: DASHBOARD                                                 */
/* ------------------------------------------------------------------ */

function renderDashboard(){
  const comps = state.role.competencies;
  const overall = Math.round(comps.reduce((a,c)=>a+COMPETENCY_LIB[c].current,0)/comps.length);
  const required = Math.round(comps.reduce((a,c)=>a+COMPETENCY_LIB[c].required,0)/comps.length);
  const gap = required - overall;
  const highest = comps.map(c=>({name:c,...COMPETENCY_LIB[c]})).sort((a,b)=>(b.required-b.current)-(a.required-a.current))[0];
  const strongest = comps.map(c=>({name:c,...COMPETENCY_LIB[c]})).sort((a,b)=>b.current-a.current)[0];

  const html = `
  <div class="page-head"><div><h1>Good morning, ${state.userName.split(' ')[1]||state.userName}.</h1><p>Here is your current competency intelligence. Role: <b>${state.role.name.toUpperCase()}</b></p></div>
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
      <div class="hc-stat"><b class="mono" style="color:#ff9d7a;">${gap}%</b><span>Gap</span></div>
    </div>
  </div>

  <div class="grid-4" style="margin-bottom:24px;">
    <div class="kpi-card"><div class="kpi-label">Overall Competency</div><div class="kpi-value" id="kpi1">0%</div><div class="kpi-icon"><i data-lucide="target"></i></div></div>
    <div class="kpi-card"><div class="kpi-label">Assessments Completed</div><div class="kpi-value" id="kpi2">0</div><div class="kpi-icon"><i data-lucide="clipboard-check"></i></div></div>
    <div class="kpi-card"><div class="kpi-label">Learning Paths</div><div class="kpi-value" id="kpi3">0</div><div class="kpi-icon"><i data-lucide="route"></i></div></div>
    <div class="kpi-card"><div class="kpi-label">Competencies Improved</div><div class="kpi-value" id="kpi4">0</div><div class="kpi-icon"><i data-lucide="trending-up"></i></div></div>
  </div>

  <div class="ai-insight">
    <div class="aii-icon"><i data-lucide="brain-circuit"></i></div>
    <div>
      <div class="aii-label">AI INSIGHT</div>
      <p>Your strongest area is ${strongest.name}. ${highest.name} is currently your highest-priority development area.</p>
      <button class="btn btn-accent btn-sm" id="dash-view-analysis">View Analysis</button>
    </div>
  </div>

  <div class="section-title">Competency Overview</div>
  <div class="grid-2" id="dash-comp-grid"></div>
  `;
  $('#v-dashboard').innerHTML = html;
  icons();

  animateCount($('#kpi1'), overall, '%');
  animateCount($('#kpi2'), 4);
  animateCount($('#kpi3'), 3);
  animateCount($('#kpi4'), 6);

  const circle = $('#hc-progress-circle');
  const c = 2*Math.PI*62;
  circle.setAttribute('stroke-dasharray', c);
  setTimeout(()=>{ circle.style.strokeDashoffset = c*(1-overall/100); }, 200);

  const grid = $('#dash-comp-grid');
  comps.forEach(name=>{
    const d = COMPETENCY_LIB[name];
    const card = el(`<div class="comp-card">
      <div class="comp-card-top"><h4>${name}</h4><span class="comp-pct">${d.current}%</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:0%; background:${gapColor(d.gap)};"></div></div>
      <span class="status-chip ${gapClass(d.gap)}">${d.gap} GAP</span>
    </div>`);
    card.addEventListener('click', ()=>navigate('competency-detail', name));
    grid.appendChild(card);
    setTimeout(()=>{ card.querySelector('.progress-fill').style.width = d.current+'%'; }, 150);
  });

  $('#dash-start-assess').addEventListener('click', ()=>navigate('assessment-intro'));
  $('#dash-view-analysis').addEventListener('click', ()=>navigate('competency-detail', highest.name));
}

/* ------------------------------------------------------------------ */
/* LEARNER: MY COMPETENCIES                                           */
/* ------------------------------------------------------------------ */

function renderCompetencies(){
  const comps = state.role.competencies;
  const html = `
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
  $('#v-competencies').innerHTML = html;
  icons();

  const tbody = $('#comp-table-body');
  comps.forEach(name=>{
    const d = COMPETENCY_LIB[name];
    const row = el(`<tr style="cursor:pointer;">
      <td><b>${name}</b></td>
      <td class="mono">${d.current}%</td>
      <td class="mono">${d.required}%</td>
      <td class="mono">${Math.max(0,d.required-d.current)}%</td>
      <td><span class="status-chip ${gapClass(d.gap)}">${d.gap}</span></td>
      <td><button class="btn btn-outline btn-sm">View</button></td>
    </tr>`);
    row.addEventListener('click', ()=>navigate('competency-detail', name));
    tbody.appendChild(row);
  });

  destroyChart('reqCurrent');
  const ctx = document.getElementById('chart-req-current');
  state.chartRegistry.reqCurrent = new Chart(ctx, {
    type:'bar',
    data:{ labels:comps,
      datasets:[
        { label:'Required', data:comps.map(c=>COMPETENCY_LIB[c].required), backgroundColor:'#cdd6e3', borderRadius:6, maxBarThickness:36 },
        { label:'Current', data:comps.map(c=>COMPETENCY_LIB[c].current), backgroundColor:'#0f8f8a', borderRadius:6, maxBarThickness:36 },
      ]},
    options:{ responsive:true, maintainAspectRatio:false,
      scales:{ y:{ beginAtZero:true, max:100, grid:{color:'#eef1f5'} }, x:{ grid:{display:false} } },
      plugins:{ legend:{ position:'bottom', labels:{ usePointStyle:true, boxWidth:8 } } } }
  });
}

/* ------------------------------------------------------------------ */
/* LEARNER: COMPETENCY DETAIL                                         */
/* ------------------------------------------------------------------ */

function renderCompetencyDetail(name){
  if(!name) name = state.role.competencies[0];
  state.activeCompetency = name;
  const d = COMPETENCY_LIB[name];
  const gapVal = Math.max(0, d.required-d.current);
  const priority = d.gap;

  const html = `
  <button class="btn btn-outline btn-sm" id="cd-back" style="margin-bottom:18px;"><i data-lucide="arrow-left"></i> Back to Competencies</button>
  <div class="page-head"><div><h1>${name.toUpperCase()}</h1><p>Detailed diagnostic breakdown for this competency.</p></div>
    <span class="status-chip ${gapClass(priority)}" style="font-size:12.5px; padding:8px 16px;">${priority} PRIORITY</span>
  </div>
  <div class="grid-3" style="margin-bottom:24px;">
    <div class="kpi-card"><div class="kpi-label">Current</div><div class="kpi-value">${d.current}%</div></div>
    <div class="kpi-card"><div class="kpi-label">Required</div><div class="kpi-value">${d.required}%</div></div>
    <div class="kpi-card"><div class="kpi-label">Gap</div><div class="kpi-value" style="color:${gapColor(priority)};">${gapVal}%</div></div>
  </div>

  <div class="card" style="margin-bottom:24px;">
    <div class="section-title">Competency Breakdown</div>
    ${d.sub.map(([sub,pct])=>`
      <div style="margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; font-size:13.5px; margin-bottom:6px;"><span>${sub}</span><b class="mono">${pct}%</b></div>
        <div class="progress-track"><div class="progress-fill" data-pct="${pct}" style="width:0%; background:${pct<50?'#c2422d':pct<75?'#b8720f':'#0f8f8a'};"></div></div>
      </div>`).join('')}
  </div>

  <div class="ai-insight">
    <div class="aii-icon"><i data-lucide="brain-circuit"></i></div>
    <div>
      <div class="aii-label">AI DIAGNOSIS</div>
      <p>Your results indicate strong understanding of basic concepts but ${d.current<60?'significant difficulty with advanced application areas of this competency.':'room to strengthen advanced application areas of this competency.'}</p>
      <button class="btn btn-accent btn-sm" id="cd-start-learning">Start Recommended Learning</button>
    </div>
  </div>`;
  $('#v-competency-detail').innerHTML = html;
  icons();
  $all('#v-competency-detail .progress-fill').forEach(f=>{ setTimeout(()=>{ f.style.width=f.dataset.pct+'%'; }, 150); });
  $('#cd-back').addEventListener('click', ()=>navigate('competencies'));
  $('#cd-start-learning').addEventListener('click', ()=>navigate('learning-path'));
}

/* ------------------------------------------------------------------ */
/* LEARNER: DIAGNOSTIC ASSESSMENT                                     */
/* ------------------------------------------------------------------ */

function renderAssessmentIntro(){
  const html = `
  <div class="page-head"><div><h1>Diagnostic Assessment</h1><p>A 25-question adaptive assessment covering your role's required competencies.</p></div></div>
  <div class="card" style="max-width:640px;">
    <div class="section-title">Before you begin</div>
    <ul style="padding-left:18px; color:var(--text-700); line-height:2; font-size:14.5px; list-style:disc;">
      <li>25 questions across ${state.role.competencies.join(', ')}.</li>
      <li>Difficulty adapts based on your performance in real time.</li>
      <li>You can navigate between answered questions using Previous / Next.</li>
      <li>Estimated time: 20–25 minutes.</li>
    </ul>
    <button class="btn btn-primary btn-block" id="begin-assessment-btn" style="margin-top:20px;">Begin Assessment <i data-lucide="arrow-right"></i></button>
  </div>`;
  $('#v-assessment-intro').innerHTML = html;
  icons();
  $('#begin-assessment-btn').addEventListener('click', ()=>navigate('assessment'));
}

function buildAssessmentQuestions(){
  // 25 questions cycling through the question bank, tagged to role competencies where possible
  const qs = [];
  for(let i=0;i<25;i++){
    const base = QUESTION_BANK[i % QUESTION_BANK.length];
    qs.push({ ...base, num:i+1 });
  }
  return qs;
}

function startAssessment(){
  state.assessment = { questions:buildAssessmentQuestions(), index:0, answers:[], correctCount:0, difficulty:'Medium', answeredCurrent:false, selectedOpt:null };
  renderAssessmentQuestion();
}

function renderAssessmentQuestion(){
  const a = state.assessment;
  const q = a.questions[a.index];
  const progressPct = Math.round(((a.index)/a.questions.length)*100);
  const accuracy = a.answers.length ? Math.round((a.correctCount/a.answers.length)*100) : 0;

  const html = `
  <div class="assess-top">
    <div><h1 style="font-size:20px;">Diagnostic Assessment</h1></div>
    <div class="aq-meta">
      <span class="tag tag-accent">${a.index+1} / ${a.questions.length}</span>
      <span class="tag">${q.comp}</span>
      <span class="tag">Difficulty: ${a.difficulty}</span>
    </div>
  </div>
  <div class="assess-progress-bar"><div class="assess-progress-fill" style="width:${progressPct}%;"></div></div>

  <div class="assess-shell">
    <div>
      <div id="assess-feedback"></div>
      <div class="question-card">
        <h3>${q.q}</h3>
        <div class="opt-list" id="opt-list">
          ${q.opts.map((o,i)=>`<div class="opt-item" data-i="${i}"><span class="opt-letter">${String.fromCharCode(65+i)}</span><span>${o}</span></div>`).join('')}
        </div>
        <div class="assess-nav">
          <button class="btn btn-outline" id="assess-prev" ${a.index===0?'disabled':''}><i data-lucide="arrow-left"></i> Previous</button>
          <div style="display:flex; gap:10px;">
            <button class="btn btn-outline" id="assess-save">Save &amp; Continue</button>
            <button class="btn btn-primary" id="assess-next" disabled>${a.index===a.questions.length-1?'Finish':'Next'} <i data-lucide="arrow-right"></i></button>
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
      <div class="intel-row"><span>Competency Confidence</span><b>${Math.min(96, 40+accuracy*0.5)|0}%</b></div>
    </div>
  </div>`;
  $('#v-assessment').innerHTML = html;
  icons();

  $all('.opt-item', document.getElementById('opt-list')).forEach(opt=>{
    opt.addEventListener('click', ()=>selectOption(parseInt(opt.dataset.i)));
  });
  $('#assess-prev').addEventListener('click', ()=>{ if(a.index>0){ a.index--; renderAssessmentQuestion(); } });
  $('#assess-save').addEventListener('click', ()=>toast('Progress saved.', 'save'));
  $('#assess-next').addEventListener('click', nextQuestion);

  // restore prior answer if navigating back
  const prior = a.answers[a.index];
  if(prior !== undefined){ selectOption(prior, true); }
}

function selectOption(i, silent){
  const a = state.assessment;
  const q = a.questions[a.index];
  if(a.answers[a.index] !== undefined && !silent) return; // already answered, locked
  const opts = $all('.opt-item');
  opts.forEach(o=>o.classList.remove('selected'));
  opts[i].classList.add('selected');

  if(a.answers[a.index] === undefined){
    a.answers[a.index] = i;
    const correct = i === q.correct;
    if(correct) a.correctCount++;
    // reveal correctness
    opts[q.correct].classList.add('correct');
    if(!correct) opts[i].classList.add('incorrect');
    opts.forEach(o=>o.style.pointerEvents='none');

    const fb = document.getElementById('assess-feedback');
    if(correct){
      a.difficulty = a.difficulty==='Easy' ? 'Medium' : 'Hard';
      fb.innerHTML = `<div class="feedback-banner correct"><i data-lucide="check-circle-2"></i><div>Correct<small>Difficulty increased for the next question.</small></div></div>`;
    } else {
      a.difficulty = a.difficulty==='Hard' ? 'Medium' : 'Easy';
      fb.innerHTML = `<div class="feedback-banner incorrect"><i data-lucide="x-circle"></i><div>Incorrect<small>Another question will evaluate this competency. (Prototype adaptive behavior — simulated, not a live model.)</small></div></div>`;
    }
    icons();
    document.getElementById('assess-next').disabled = false;
    // update intel card live
    const accuracy = Math.round((a.correctCount/a.answers.length)*100);
    $all('.intel-row b')[0].textContent = a.answers.length;
    $all('.intel-row b')[1].textContent = a.correctCount;
    $all('.intel-row b')[2].textContent = accuracy+'%';
    $all('.intel-row b')[3].textContent = a.difficulty;
    $all('.intel-row b')[4].textContent = Math.min(96, 40+accuracy*0.5)|0;
    $all('.intel-row b')[4].textContent = (Math.min(96, 40+accuracy*0.5)|0)+'%';
  } else if(silent){
    opts[q.correct].classList.add('correct');
    if(a.answers[a.index]!==q.correct) opts[a.answers[a.index]].classList.add('incorrect');
    opts.forEach(o=>o.style.pointerEvents='none');
    document.getElementById('assess-next').disabled = false;
  }
}

function nextQuestion(){
  const a = state.assessment;
  if(a.index < a.questions.length-1){
    a.index++;
    renderAssessmentQuestion();
  } else {
    navigate('assessment-result');
  }
}

function renderAssessmentResult(){
  const a = state.assessment;
  const score = a.answers.length ? Math.round((a.correctCount/a.answers.length)*100) : 68;
  const comps = state.role.competencies;

  const high = comps.filter(c=>COMPETENCY_LIB[c].gap==='HIGH');
  const med = comps.filter(c=>COMPETENCY_LIB[c].gap==='MEDIUM');
  const low = comps.filter(c=>COMPETENCY_LIB[c].gap==='LOW');

  const html = `
  <div class="page-head"><div><h1>Assessment Complete</h1><p>Your diagnostic assessment has been analyzed by the competency intelligence engine.</p></div></div>
  <div class="result-score"><div class="rs-big mono" id="rs-score">0%</div><p>Overall Diagnostic Score</p></div>

  <div class="grid-2" style="margin-bottom:24px;">
    <div class="card"><div class="section-title">Competency Results</div>
      ${comps.map(c=>`<div style="margin-bottom:14px;"><div style="display:flex; justify-content:space-between; font-size:13.5px; margin-bottom:6px;"><span>${c}</span><b class="mono">${COMPETENCY_LIB[c].current}%</b></div><div class="progress-track"><div class="progress-fill" data-pct="${COMPETENCY_LIB[c].current}" style="width:0%; background:${gapColor(COMPETENCY_LIB[c].gap)};"></div></div></div>`).join('')}
    </div>
    <div>
      <div class="priority-col" style="margin-bottom:14px;"><h4><span class="status-chip status-high">HIGH PRIORITY</span></h4>${high.map(c=>`<div class="priority-item">${c}</div>`).join('') || '<p class="muted" style="font-size:13px;">None</p>'}</div>
      <div class="priority-col" style="margin-bottom:14px;"><h4><span class="status-chip status-medium">MEDIUM</span></h4>${med.map(c=>`<div class="priority-item">${c}</div>`).join('') || '<p class="muted" style="font-size:13px;">None</p>'}</div>
      <div class="priority-col"><h4><span class="status-chip status-low">LOW / NO GAP</span></h4>${low.map(c=>`<div class="priority-item">${c}</div>`).join('') || '<p class="muted" style="font-size:13px;">None</p>'}</div>
    </div>
  </div>

  <div class="ai-insight">
    <div class="aii-icon"><i data-lucide="brain-circuit"></i></div>
    <div><div class="aii-label">AI SUMMARY</div>
      <p>Your strongest competencies are ${low.join(' and ') || 'well balanced'}. Your primary development opportunity is ${high[0] || med[0] || 'currently minor'}.</p>
      <button class="btn btn-accent btn-sm" id="result-view-learning">View Personalized Learning</button>
    </div>
  </div>`;
  $('#v-assessment-result').innerHTML = html;
  icons();
  animateCount($('#rs-score'), score, '%');
  $all('#v-assessment-result .progress-fill').forEach(f=>{ setTimeout(()=>{ f.style.width = f.dataset.pct+'%'; }, 200); });
  $('#result-view-learning').addEventListener('click', ()=>navigate('learning-path'));
}

/* ------------------------------------------------------------------ */
/* LEARNER: LEARNING PATH                                             */
/* ------------------------------------------------------------------ */

function renderLearningPath(){
  const html = `
  <div class="page-head"><div><h1>Your Personalized Learning Path</h1><p>Learning recommendations generated from your competency gaps.</p></div></div>
  <div class="timeline" id="lp-timeline"></div>`;
  $('#v-learning-path').innerHTML = html;
  const tl = $('#lp-timeline');
  LEARNING_PATH.forEach(item=>{
    const node = el(`<div class="tl-item ${item.locked?'locked':''}">
      <div class="tl-dot">${item.locked?'<i data-lucide="lock" style="width:13px;height:13px;"></i>':item.n}</div>
      <div class="tl-top"><h4>${item.title}</h4><span class="match-badge">${item.match}% Match</span></div>
      <div class="tl-meta"><span class="tag">${item.tag}</span><span><i data-lucide="clock" style="width:12px;height:12px;"></i> ${item.duration}</span><span><i data-lucide="target" style="width:12px;height:12px;"></i> ${item.competency}</span></div>
      <div class="tl-reason">${item.reason}</div>
      <button class="btn ${item.locked?'btn-outline':'btn-primary'} btn-sm" ${item.locked?'disabled':''}>${item.locked?'Locked':'Start Learning'}</button>
    </div>`);
    if(!item.locked){
      node.querySelector('button').addEventListener('click', ()=>startLearningModule(item));
    }
    tl.appendChild(node);
  });
  icons();
}

function startLearningModule(item){
  openModal(`<div class="modal-head"><h2>${item.title}</h2></div>
    <p class="muted" style="margin-bottom:16px;">Competency: <b>${item.competency}</b> · Duration: <b>${item.duration}</b></p>
    <div class="card" style="margin-bottom:16px;"><p style="line-height:1.6; color:var(--text-700);">This module walks through core concepts for ${item.competency}, with worked examples drawn from official statistical survey practice. Completing it will unlock the next module in your path.</p></div>
    <button class="btn btn-primary btn-block" id="lp-complete-btn">Mark Module Complete</button>`);
  $('#lp-complete-btn').addEventListener('click', ()=>{
    closeModal();
    const idx = LEARNING_PATH.findIndex(i=>i.n===item.n);
    if(LEARNING_PATH[idx+1]) LEARNING_PATH[idx+1].locked = false;
    toast(`${item.title} marked complete. Next module unlocked.`, 'check-circle-2');
    renderLearningPath();
  });
}

/* ------------------------------------------------------------------ */
/* LEARNER: iGOT RECOMMENDATIONS                                      */
/* ------------------------------------------------------------------ */

function renderIgot(){
  const html = `
  <div class="page-head"><div><h1>iGOT Karmayogi Recommendations</h1><p>Relevant learning resources mapped to your competency gaps.</p></div>
    <span class="igot-connected"><i data-lucide="link-2" style="width:12px;height:12px;"></i> iGOT Connection: Connected (Simulated)</span>
  </div>
  <p class="igot-note" style="display:block; margin-bottom:20px;">For this prototype, iGOT integration is mock/simulated. Real integration would require iGOT Karmayogi API endpoints and authentication details confirmed from official integration documentation.</p>
  <div class="grid-3" id="igot-grid"></div>`;
  $('#v-igot').innerHTML = html;
  const grid = $('#igot-grid');
  IGOT_COURSES.forEach(c=>{
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
    card.querySelector('button').addEventListener('click', ()=>{
      toast(`Opening "${c.title}" on iGOT Karmayogi (simulated redirect).`, 'external-link');
    });
    grid.appendChild(card);
  });
  icons();
}

/* ------------------------------------------------------------------ */
/* LEARNER: AI ASSESSMENT + RAG PIPELINE                              */
/* ------------------------------------------------------------------ */

const PIPELINE_STAGES = [
  { key:'retrieve', title:'Retrieving Source', desc:'Locating relevant sections in the knowledge base.', icon:'file-search' },
  { key:'analyze', title:'Analyzing Content', desc:'Parsing retrieved passages for key concepts.', icon:'scan-text' },
  { key:'generate', title:'Generating Questions', desc:'LLM drafts grounded MCQs from retrieved content.', icon:'wand-2' },
  { key:'validate', title:'Validating', desc:'Checking answer correctness and distractor quality.', icon:'shield-check' },
  { key:'ready', title:'Ready', desc:'Assessment prepared for review.', icon:'check-circle-2' },
];

function renderAiAssessment(){
  const comps = state.role.competencies;
  const html = `
  <div class="page-head"><div><h1>AI Assessment</h1><p>Generate a grounded assessment from approved statistical documents using RAG.</p></div></div>
  <div class="card" style="margin-bottom:24px; max-width:720px;">
    <div class="section-title">Configuration</div>
    <div class="config-grid">
      <label class="field"><span>Competency</span><select id="cfg-comp">${comps.map(c=>`<option>${c}</option>`).join('')}</select></label>
      <label class="field"><span>Difficulty</span><select id="cfg-diff"><option>Easy</option><option selected>Medium</option><option>Hard</option></select></label>
      <label class="field"><span>Number of Questions</span><select id="cfg-num"><option>5</option><option selected>10</option><option>15</option></select></label>
      <label class="field"><span>Question Type</span><select id="cfg-type"><option>MCQ</option><option>Conceptual</option><option>Scenario</option><option>Application</option></select></label>
    </div>
    <button class="btn btn-primary btn-block" id="gen-assess-btn"><i data-lucide="sparkles"></i> Generate Assessment</button>
  </div>
  <div id="pipeline-container"></div>
  <div id="gen-question-container"></div>`;
  $('#v-ai-assessment').innerHTML = html;
  icons();
  $('#gen-assess-btn').addEventListener('click', runRagPipeline);
}

function runRagPipeline(){
  if(state.aiAssessment.running) return;
  state.aiAssessment.running = true;
  state.aiAssessment.stage = -1;
  const container = $('#pipeline-container');
  $('#gen-question-container').innerHTML = '';
  container.innerHTML = `<div class="card"><div class="section-title">RAG Processing Pipeline</div><div class="pipeline" id="pipeline"></div></div>`;
  const pipeline = $('#pipeline');
  PIPELINE_STAGES.forEach((s,i)=>{
    pipeline.appendChild(el(`<div class="pipe-stage" id="stage-${s.key}">
      <div class="pipe-icon"><i data-lucide="${s.icon}"></i></div>
      <div><h4>${s.title}</h4><span>${s.desc}</span></div>
      <div class="pipe-status" id="status-${s.key}">Pending</div>
    </div>`));
    if(i<PIPELINE_STAGES.length-1) pipeline.appendChild(el(`<div class="pipe-connector"></div>`));
  });
  icons();

  let i = 0;
  function advance(){
    if(i>0){
      const prev = PIPELINE_STAGES[i-1];
      document.getElementById(`stage-${prev.key}`).classList.remove('active');
      document.getElementById(`stage-${prev.key}`).classList.add('done');
      document.getElementById(`status-${prev.key}`).textContent = 'Done';
      document.getElementById(`status-${prev.key}`).style.color = '#1f8a4c';
    }
    if(i < PIPELINE_STAGES.length){
      const cur = PIPELINE_STAGES[i];
      document.getElementById(`stage-${cur.key}`).classList.add('active');
      document.getElementById(`status-${cur.key}`).textContent = 'Processing...';
      document.getElementById(`status-${cur.key}`).style.color = '#0f8f8a';
      i++;
      setTimeout(advance, 750);
    } else {
      state.aiAssessment.running = false;
      showGeneratedQuestion();
      toast('AI assessment generated successfully.', 'sparkles');
    }
  }
  advance();
}

function showGeneratedQuestion(){
  const comp = $('#cfg-comp') ? $('#cfg-comp').value : state.role.competencies[0];
  const diff = $('#cfg-diff') ? $('#cfg-diff').value : 'Medium';
  const pool = QUESTION_BANK.filter(q=>q.comp===comp);
  const q = pool.length ? pool[Math.floor(Math.random()*pool.length)] : QUESTION_BANK[0];

  const html = `
  <div class="gen-question">
    <div class="section-title">AI-Generated Question</div>
    <h3 style="font-size:16.5px; margin-bottom:16px;">${q.q}</h3>
    <div class="opt-list" style="margin-bottom:16px;">
      ${q.opts.map((o,i)=>`<div class="opt-item ${i===q.correct?'correct':''}"><span class="opt-letter">${String.fromCharCode(65+i)}</span><span>${o}</span></div>`).join('')}
    </div>
    <p style="font-size:13.5px; color:var(--text-700); margin-bottom:14px;"><b>Correct Answer:</b> ${String.fromCharCode(65+q.correct)}. ${q.opts[q.correct]}</p>
    <p style="font-size:13.5px; color:var(--text-500); margin-bottom:16px;"><b>Explanation:</b> This option correctly reflects standard official statistical practice for ${comp.toLowerCase()}, as distinguished from the plausible but incorrect distractors.</p>
    <div style="display:flex; gap:14px; flex-wrap:wrap; margin-bottom:16px;">
      <span class="tag">Difficulty: ${diff}</span><span class="tag">Competency: ${comp}</span>
    </div>
    <div class="gen-source">
      <b>Source: Sampling Methodology Manual — Page 42</b>
      Retrieved supporting content: "...selection of the sampling frame should account for coverage error prior to method selection..."
    </div>
    <div style="display:flex; gap:10px; flex-wrap:wrap;">
      <button class="btn btn-primary btn-sm" id="q-approve"><i data-lucide="check"></i> Approve</button>
      <button class="btn btn-outline btn-sm" id="q-regen"><i data-lucide="refresh-cw"></i> Regenerate</button>
      <button class="btn btn-danger-outline btn-sm" id="q-reject"><i data-lucide="x"></i> Reject</button>
    </div>
  </div>`;
  $('#gen-question-container').innerHTML = html;
  icons();
  $('#q-approve').addEventListener('click', ()=>toast('Question approved and added to assessment bank.', 'check-circle-2'));
  $('#q-regen').addEventListener('click', ()=>{ toast('Regenerating question...', 'refresh-cw'); showGeneratedQuestion(); });
  $('#q-reject').addEventListener('click', ()=>{ $('#gen-question-container').innerHTML=''; toast('Question rejected.', 'x-circle'); });
}

/* ------------------------------------------------------------------ */
/* LEARNER: PROGRESS                                                  */
/* ------------------------------------------------------------------ */

function renderProgress(){
  const items = [
    { comp:'Sampling', before:52, after:81 },
    { comp:'CAPI', before:64, after:81 },
    { comp:'Survey Methodology', before:70, after:82 },
  ];
  const html = `
  <div class="page-head"><div><h1>My Progress</h1><p>Competency improvement over time.</p></div></div>
  <div id="progress-list"></div>
  <div class="card" style="margin:24px 0;"><div class="section-title">Competency Improvement Trend</div><div class="chart-wrap"><canvas id="chart-progress"></canvas></div></div>
  <div class="grid-2">
    <div class="card"><div class="section-title">Assessment History</div><div class="hist-list">
      <div class="hist-item"><div class="hi-left"><b>Diagnostic Assessment</b><small>21 Aug 2026</small></div><span class="mono">68%</span></div>
      <div class="hist-item"><div class="hi-left"><b>AI Assessment — Sampling</b><small>22 Aug 2026</small></div><span class="mono">74%</span></div>
      <div class="hist-item"><div class="hi-left"><b>Reassessment — Sampling</b><small>23 Aug 2026</small></div><span class="mono">81%</span></div>
    </div></div>
    <div class="card"><div class="section-title">Learning History</div><div class="hist-list">
      <div class="hist-item"><div class="hi-left"><b>Sampling Fundamentals</b><small>Completed</small></div><span class="status-chip status-low">Done</span></div>
      <div class="hist-item"><div class="hi-left"><b>Sampling Methods</b><small>In Progress</small></div><span class="status-chip status-inprogress">In Progress</span></div>
      <div class="hist-item"><div class="hi-left"><b>Sampling in Official Surveys</b><small>Locked</small></div><span class="status-chip status-locked">Locked</span></div>
    </div></div>
  </div>`;
  $('#v-progress').innerHTML = html;
  const list = $('#progress-list');
  items.forEach(it=>{
    list.appendChild(el(`<div class="progress-item">
      <b style="min-width:170px;">${it.comp}</b>
      <div class="progress-bars">
        <div class="pb-block"><b class="mono">${it.before}%</b><span>Before</span></div>
        <div class="pb-arrow"><i data-lucide="arrow-right"></i></div>
        <div class="pb-block"><b class="mono">${it.after}%</b><span>After</span></div>
      </div>
      <span class="improve-chip">+${it.after-it.before}%</span>
    </div>`));
  });
  icons();

  destroyChart('progressChart');
  const ctx = document.getElementById('chart-progress');
  state.chartRegistry.progressChart = new Chart(ctx, {
    type:'line',
    data:{ labels:['Week 1','Week 2','Week 3','Week 4','Week 5','Week 6'],
      datasets:[{ label:'Sampling Competency', data:[52,58,64,71,77,81], borderColor:'#0f8f8a', backgroundColor:'rgba(15,143,138,.12)', fill:true, tension:.35, pointRadius:4, pointBackgroundColor:'#0f8f8a' }]},
    options:{ responsive:true, maintainAspectRatio:false, scales:{ y:{ min:0, max:100, grid:{color:'#eef1f5'} }, x:{ grid:{display:false} } }, plugins:{ legend:{ display:false } } }
  });
}

/* ------------------------------------------------------------------ */
/* LEARNER: PROFILE                                                   */
/* ------------------------------------------------------------------ */

function renderProfile(){
  const html = `
  <div class="page-head"><div><h1>Profile</h1><p>Manage your account and view your history.</p></div></div>
  <div class="card" style="margin-bottom:24px;">
    <div class="profile-head">
      <span class="avatar">RS</span>
      <div><h2 style="font-size:20px;">${state.userName}</h2><p class="muted">${state.role.name} · ${state.employeeId}</p></div>
    </div>
    <div class="profile-fields">
      <div class="pf-item"><label>Employee ID</label><b>${state.employeeId}</b></div>
      <div class="pf-item"><label>Role</label><b>${state.role.name}</b></div>
      <div class="pf-item"><label>Department</label><b>National Sample Survey Office</b></div>
      <div class="pf-item"><label>Competency Framework</label><b>${state.role.name} Framework v2.1</b></div>
    </div>
  </div>
  <div class="grid-2">
    <div class="card"><div class="section-title">Assessment History</div><div class="hist-list">
      <div class="hist-item"><div class="hi-left"><b>Diagnostic Assessment</b><small>21 Aug 2026</small></div><span class="mono">68%</span></div>
      <div class="hist-item"><div class="hi-left"><b>Reassessment — Sampling</b><small>23 Aug 2026</small></div><span class="mono">81%</span></div>
    </div></div>
    <div class="card"><div class="section-title">Security</div>
      <div class="settings-row"><div><h4>Two-Factor Authentication</h4><p>Adds an extra layer of protection to your account.</p></div><button class="switch on" id="prof-2fa"></button></div>
      <div class="settings-row"><div><h4>Login Alerts</h4><p>Get notified of new sign-ins.</p></div><button class="switch on" id="prof-alerts"></button></div>
    </div>
  </div>`;
  $('#v-profile').innerHTML = html;
  icons();
  $all('.switch', $('#v-profile')).forEach(s=>s.addEventListener('click', ()=>{ s.classList.toggle('on'); toast('Preference updated.', 'check'); }));
}

/* ------------------------------------------------------------------ */
/* ADMIN: DASHBOARD                                                   */
/* ------------------------------------------------------------------ */

function renderAdminDashboard(){
  const html = `
  <div class="page-head"><div><h1>Workforce Competency Intelligence</h1><p>Organization-wide view of competency and learning progress.</p></div></div>
  <div class="grid-4" style="margin-bottom:14px;">
    <div class="kpi-card"><div class="kpi-label">Total Officers</div><div class="kpi-value" id="akpi1">0</div><div class="kpi-icon"><i data-lucide="users"></i></div><div class="kpi-demo">Demo value</div></div>
    <div class="kpi-card"><div class="kpi-label">Assessments Completed</div><div class="kpi-value" id="akpi2">0</div><div class="kpi-icon"><i data-lucide="clipboard-check"></i></div><div class="kpi-demo">Demo value</div></div>
    <div class="kpi-card"><div class="kpi-label">Learning Paths Started</div><div class="kpi-value" id="akpi3">0</div><div class="kpi-icon"><i data-lucide="route"></i></div><div class="kpi-demo">Demo value</div></div>
    <div class="kpi-card"><div class="kpi-label">Courses Completed</div><div class="kpi-value" id="akpi4">0</div><div class="kpi-icon"><i data-lucide="book-check"></i></div><div class="kpi-demo">Demo value</div></div>
  </div>
  <div class="kpi-card" style="max-width:280px; margin-bottom:24px;"><div class="kpi-label">Average Competency</div><div class="kpi-value" id="akpi5">0%</div><div class="kpi-icon"><i data-lucide="target"></i></div><div class="kpi-demo">Demo value</div></div>

  <div class="table-toolbar">
    <select id="wa-role-filter"><option value="">All Roles</option><option>Data Collector</option><option>Field Officer</option><option>Statistical Analyst</option></select>
    <select id="wa-comp-filter"><option value="">All Competencies</option><option>Survey Methodology</option><option>Sampling</option><option>CAPI</option><option>Data Analysis</option></select>
    <select><option>All Departments</option><option>NSSO</option><option>CSO</option><option>Field Operations Division</option></select>
    <select><option>Last 90 days</option><option>Last 30 days</option><option>Last 6 months</option></select>
  </div>

  <div class="grid-2" style="margin-bottom:24px;">
    <div class="card"><div class="section-title">Competency Performance</div><div class="chart-wrap short"><canvas id="chart-comp-perf"></canvas></div></div>
    <div class="card"><div class="section-title">Role Performance</div><div class="chart-wrap short"><canvas id="chart-role-perf"></canvas></div></div>
  </div>
  <div class="card" style="margin-bottom:24px;"><div class="section-title">Learning Progress Over Time</div><div class="chart-wrap"><canvas id="chart-learning-progress"></canvas></div></div>

  <div class="section-title">Competency Heatmap <button class="btn btn-outline btn-sm" id="goto-heatmap-full" style="font-weight:600;">Open Full View</button></div>
  <div class="card"><div class="heatmap" id="admin-heatmap"></div></div>
  `;
  $('#v-admin-dashboard').innerHTML = html;
  icons();

  animateCount($('#akpi1'), 12450);
  animateCount($('#akpi2'), 9840);
  animateCount($('#akpi3'), 8210);
  animateCount($('#akpi4'), 7320);
  animateCount($('#akpi5'), 72, '%');

  destroyChart('compPerf');
  state.chartRegistry.compPerf = new Chart(document.getElementById('chart-comp-perf'), {
    type:'bar',
    data:{ labels:['Survey Methodology','Sampling','CAPI','Data Analysis'], datasets:[{ data:[78,61,82,69], backgroundColor:['#0f8f8a','#c2422d','#0f8f8a','#b8720f'], borderRadius:6 }] },
    options:{ responsive:true, maintainAspectRatio:false, indexAxis:'y', scales:{ x:{ max:100, grid:{color:'#eef1f5'} }, y:{ grid:{display:false} } }, plugins:{ legend:{ display:false } } }
  });
  destroyChart('rolePerf');
  state.chartRegistry.rolePerf = new Chart(document.getElementById('chart-role-perf'), {
    type:'doughnut',
    data:{ labels:['Data Collectors','Field Officers','Statistical Analysts'], datasets:[{ data:[74,79,83], backgroundColor:['#2743a3','#0f8f8a','#b8720f'] }] },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom', labels:{usePointStyle:true, boxWidth:8} } } }
  });
  destroyChart('learnProgress');
  state.chartRegistry.learnProgress = new Chart(document.getElementById('chart-learning-progress'), {
    type:'line',
    data:{ labels:['Mar','Apr','May','Jun','Jul','Aug'], datasets:[{ label:'Avg Competency', data:[61,64,66,68,70,72], borderColor:'#2743a3', backgroundColor:'rgba(39,67,163,.1)', fill:true, tension:.35, pointRadius:3 }] },
    options:{ responsive:true, maintainAspectRatio:false, scales:{ y:{ min:0,max:100, grid:{color:'#eef1f5'} }, x:{grid:{display:false}} }, plugins:{ legend:{display:false} } }
  });

  buildHeatmap('#admin-heatmap');
  $('#goto-heatmap-full').addEventListener('click', ()=>{
    document.getElementById('admin-heatmap').scrollIntoView({behavior:'smooth'});
  });
  $('#wa-role-filter').addEventListener('change', ()=>toast('Filter applied (demo data unchanged).', 'filter'));
  $('#wa-comp-filter').addEventListener('change', ()=>toast('Filter applied (demo data unchanged).', 'filter'));
}

function buildHeatmap(sel){
  const cols = ['Survey Methodology','Sampling','CAPI','Data Analysis'];
  const rows = [
    { role:'Data Collectors', vals:[82,51,78,61] },
    { role:'Field Officers', vals:[79,65,81,67] },
    { role:'Analysts', vals:[84,73,85,89] },
  ];
  function cellColor(v){
    if(v<55) return '#fbe4de';
    if(v<70) return '#fbedd6';
    if(v<85) return '#dcf0ee';
    return '#c8ece7';
  }
  function textColor(v){
    if(v<55) return '#c2422d';
    if(v<70) return '#b8720f';
    return '#0b706c';
  }
  const wrap = $(sel);
  wrap.innerHTML = `<table class="hm-table"><thead><tr><th></th>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r=>`<tr><td>${r.role}</td>${r.vals.map((v,i)=>`<td><div class="hm-cell" style="background:${cellColor(v)}; color:${textColor(v)};" data-role="${r.role}" data-comp="${cols[i]}" data-val="${v}">${v}</div></td>`).join('')}</tr>`).join('')}</tbody></table>`;
  $all('.hm-cell', wrap).forEach(c=>c.addEventListener('click', ()=>{
    openModal(`<div class="modal-head"><h2>${c.dataset.role} — ${c.dataset.comp}</h2></div>
      <div class="kpi-card" style="margin-bottom:16px;"><div class="kpi-label">Average Competency</div><div class="kpi-value">${c.dataset.val}%</div></div>
      <p style="color:var(--text-700); line-height:1.6;">This reflects the average measured competency for ${c.dataset.role} on ${c.dataset.comp}, based on diagnostic and AI-generated assessment results across the group.</p>`);
  }));
}

/* ------------------------------------------------------------------ */
/* ADMIN: AI QUIZ GENERATOR                                           */
/* ------------------------------------------------------------------ */

function renderAdminQuiz(){
  const html = `
  <div class="page-head"><div><h1>AI Quiz Generator</h1><p>Upload an official statistical document to generate grounded assessment questions.</p></div></div>
  <div class="card" style="margin-bottom:24px; max-width:760px;">
    <div class="upload-zone" id="quiz-upload-zone">
      <i data-lucide="upload-cloud"></i>
      <h4>Upload Official Statistical Document</h4>
      <p>Supported: PDF, Manual, Dataset, Document — drag &amp; drop or click to browse</p>
      <input type="file" id="quiz-file-input" style="display:none;" accept=".pdf,.doc,.docx,.csv,.xlsx">
    </div>
    <div id="quiz-upload-info"></div>
  </div>
  <div id="quiz-pipeline-wrap"></div>`;
  $('#v-admin-quiz').innerHTML = html;
  icons();

  const zone = $('#quiz-upload-zone');
  const input = $('#quiz-file-input');
  zone.addEventListener('click', ()=>input.click());
  zone.addEventListener('dragover', e=>{ e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', ()=>zone.classList.remove('dragover'));
  zone.addEventListener('drop', e=>{ e.preventDefault(); zone.classList.remove('dragover'); handleQuizUpload(e.dataTransfer.files[0]); });
  input.addEventListener('change', ()=>handleQuizUpload(input.files[0]));
}

function handleQuizUpload(file){
  const name = file ? file.name : 'Sampling_Methodology_Manual.pdf';
  const sizeKb = file ? Math.round(file.size/1024) : 4820;
  $('#quiz-upload-info').innerHTML = `
    <div class="file-chip"><i data-lucide="file-text" style="width:13px;height:13px;"></i>${name}</div>
    <div class="grid-3" style="margin-top:16px;">
      <div class="kpi-card"><div class="kpi-label">Document</div><div class="kpi-value" style="font-size:15px;">${name.length>18?name.slice(0,18)+'…':name}</div></div>
      <div class="kpi-card"><div class="kpi-label">Estimated Pages</div><div class="kpi-value">${Math.max(12, Math.round(sizeKb/40))}</div></div>
      <div class="kpi-card"><div class="kpi-label">Size</div><div class="kpi-value">${(sizeKb/1024).toFixed(1)} MB</div></div>
    </div>
    <button class="btn btn-primary" id="quiz-process-btn" style="margin-top:16px;"><i data-lucide="sparkles"></i> Process &amp; Generate Questions</button>`;
  icons();
  toast('Document uploaded successfully.', 'upload-cloud');
  $('#quiz-process-btn').addEventListener('click', runQuizPipeline);
}

function runQuizPipeline(){
  const wrap = $('#quiz-pipeline-wrap');
  wrap.innerHTML = `<div class="card"><div class="section-title">RAG Processing Pipeline</div><div class="pipeline" id="quiz-pipeline"></div></div>`;
  const pipe = $('#quiz-pipeline');
  PIPELINE_STAGES.forEach((s,i)=>{
    pipe.appendChild(el(`<div class="pipe-stage" id="qstage-${s.key}"><div class="pipe-icon"><i data-lucide="${s.icon}"></i></div><div><h4>${s.title}</h4><span>${s.desc}</span></div><div class="pipe-status" id="qstatus-${s.key}">Pending</div></div>`));
    if(i<PIPELINE_STAGES.length-1) pipe.appendChild(el(`<div class="pipe-connector"></div>`));
  });
  icons();
  let i=0;
  function step(){
    if(i>0){
      const p = PIPELINE_STAGES[i-1];
      document.getElementById(`qstage-${p.key}`).classList.remove('active'); document.getElementById(`qstage-${p.key}`).classList.add('done');
      document.getElementById(`qstatus-${p.key}`).textContent='Done'; document.getElementById(`qstatus-${p.key}`).style.color='#1f8a4c';
    }
    if(i<PIPELINE_STAGES.length){
      const cur = PIPELINE_STAGES[i];
      document.getElementById(`qstage-${cur.key}`).classList.add('active');
      document.getElementById(`qstatus-${cur.key}`).textContent='Processing...'; document.getElementById(`qstatus-${cur.key}`).style.color='#0f8f8a';
      i++; setTimeout(step, 700);
    } else {
      toast('12 questions generated and added to the review queue.', 'sparkles');
      wrap.innerHTML += `<div class="card" style="margin-top:20px;"><div class="section-title">Generated Questions Ready for Review</div>
        <div class="hist-list">
        ${QUESTION_BANK.slice(0,4).map(q=>`<div class="hist-item"><div class="hi-left"><b>${q.q.slice(0,60)}...</b><small>${q.comp} · ${q.diff}</small></div><button class="btn btn-outline btn-sm">Review</button></div>`).join('')}
        </div></div>`;
    }
  }
  step();
}

/* ------------------------------------------------------------------ */
/* ADMIN: KNOWLEDGE BASE                                              */
/* ------------------------------------------------------------------ */

function renderAdminKb(){
  const html = `
  <div class="page-head"><div><h1>Official Knowledge Base</h1><p>Documents indexed for RAG-based AI assessment generation.</p></div>
    <button class="btn btn-primary" id="kb-upload-btn"><i data-lucide="upload"></i> Upload Document</button></div>
  <div class="table-toolbar"><input type="text" id="kb-search" placeholder="Search documents..."><select id="kb-filter"><option value="">All Status</option><option>Ready</option><option>Indexed</option><option>Processing</option></select></div>
  <div class="table-wrap"><table class="data-table"><thead><tr><th>Document</th><th>Pages</th><th>Uploaded</th><th>Status</th><th>Indexed</th><th>Questions Generated</th><th>Actions</th></tr></thead><tbody id="kb-table-body"></tbody></table></div>`;
  $('#v-admin-kb').innerHTML = html;
  icons();
  renderKbRows(KNOWLEDGE_BASE);
  $('#kb-search').addEventListener('input', filterKb);
  $('#kb-filter').addEventListener('change', filterKb);
  $('#kb-upload-btn').addEventListener('click', ()=>navigate('admin-quiz'));
}
function filterKb(){
  const q = $('#kb-search').value.toLowerCase();
  const f = $('#kb-filter').value;
  renderKbRows(KNOWLEDGE_BASE.filter(d=> d.name.toLowerCase().includes(q) && (!f || d.status===f)));
}
function renderKbRows(list){
  const tbody = $('#kb-table-body');
  tbody.innerHTML = list.length ? '' : `<tr><td colspan="7"><div class="empty-state"><i data-lucide="inbox"></i><h4>No documents found</h4><p>Try a different search or filter.</p></div></td></tr>`;
  list.forEach(d=>{
    const statusClass = d.status==='Ready'?'status-ready':d.status==='Indexed'?'status-indexed':'status-processing';
    const row = el(`<tr>
      <td class="name-cell"><i data-lucide="file-text" style="width:15px;height:15px;color:var(--indigo);"></i><b>${d.name}</b></td>
      <td class="mono">${d.pages}</td><td>${d.uploaded}</td>
      <td><span class="status-chip ${statusClass}">${d.status}</span></td>
      <td>${d.indexed?'<i data-lucide="check" style="width:15px;height:15px;color:#1f8a4c;"></i>':'<i data-lucide="minus" style="width:15px;height:15px;color:var(--text-400);"></i>'}</td>
      <td class="mono">${d.questions}</td>
      <td><button class="btn btn-outline btn-sm">View</button></td>
    </tr>`);
    row.querySelector('button').addEventListener('click', ()=>openModal(`<div class="modal-head"><h2>${d.name}</h2></div>
      <div class="grid-2"><div class="pf-item"><label>Pages</label><b>${d.pages}</b></div><div class="pf-item"><label>Status</label><b>${d.status}</b></div><div class="pf-item"><label>Uploaded</label><b>${d.uploaded}</b></div><div class="pf-item"><label>Questions Generated</label><b>${d.questions}</b></div></div>`));
    tbody.appendChild(row);
  });
  icons();
}

/* ------------------------------------------------------------------ */
/* ADMIN: OFFICER DIRECTORY                                           */
/* ------------------------------------------------------------------ */

function renderAdminOfficers(){
  const html = `
  <div class="page-head"><div><h1>Officer Directory</h1><p>Search and review officer-level competency profiles.</p></div></div>
  <div class="table-toolbar">
    <input type="text" id="off-search" placeholder="Search officers or employee ID...">
    <select id="off-role-filter"><option value="">All Roles</option><option>Data Collector</option><option>Field Officer</option><option>Statistical Analyst</option></select>
    <select id="off-status-filter"><option value="">All Status</option><option>On Track</option><option>Needs Attention</option><option>Excellent</option></select>
  </div>
  <div class="table-wrap"><table class="data-table"><thead><tr><th>Officer</th><th>Employee ID</th><th>Role</th><th>Overall Competency</th><th>Highest Gap</th><th>Learning Progress</th><th>Last Assessment</th><th>Status</th></tr></thead><tbody id="off-table-body"></tbody></table></div>`;
  $('#v-admin-officers').innerHTML = html;
  icons();
  renderOfficerRows(OFFICERS);
  $('#off-search').addEventListener('input', filterOfficers);
  $('#off-role-filter').addEventListener('change', filterOfficers);
  $('#off-status-filter').addEventListener('change', filterOfficers);
}
function filterOfficers(){
  const q = $('#off-search').value.toLowerCase();
  const role = $('#off-role-filter').value;
  const status = $('#off-status-filter').value;
  renderOfficerRows(OFFICERS.filter(o=>(o.name.toLowerCase().includes(q)||o.id.toLowerCase().includes(q)) && (!role||o.role===role) && (!status||o.status===status)));
}
function renderOfficerRows(list){
  const tbody = $('#off-table-body');
  tbody.innerHTML = list.length ? '' : `<tr><td colspan="8"><div class="empty-state"><i data-lucide="user-x"></i><h4>No officers found</h4><p>Try adjusting your search or filters.</p></div></td></tr>`;
  list.forEach(o=>{
    const statusClass = o.status==='Excellent'?'status-low':o.status==='On Track'?'status-indexed':'status-high';
    const initials = o.name.split(' ').slice(-1)[0].slice(0,2).toUpperCase();
    const row = el(`<tr style="cursor:pointer;">
      <td class="name-cell"><span class="avatar sm">${initials}</span>${o.name}</td>
      <td class="mono">${o.id}</td><td>${o.role}</td><td class="mono">${o.competency}%</td><td>${o.gap}</td>
      <td><div class="progress-track" style="width:90px; margin:0;"><div class="progress-fill" style="width:${o.progress}%;"></div></div></td>
      <td>${o.last}</td><td><span class="status-chip ${statusClass}">${o.status}</span></td>
    </tr>`);
    row.addEventListener('click', ()=>navigate('admin-officer-detail', o));
    tbody.appendChild(row);
  });
}

function renderOfficerDetail(o){
  if(!o) o = OFFICERS[0];
  const initials = o.name.split(' ').slice(-1)[0].slice(0,2).toUpperCase();
  const html = `
  <button class="btn btn-outline btn-sm" id="od-back" style="margin-bottom:18px;"><i data-lucide="arrow-left"></i> Back to Officers</button>
  <div class="card" style="margin-bottom:24px;">
    <div class="profile-head">
      <span class="avatar">${initials}</span>
      <div><h2 style="font-size:20px;">${o.name}</h2><p class="muted">${o.role} · ${o.id}</p></div>
      <span class="status-chip ${o.status==='Excellent'?'status-low':o.status==='On Track'?'status-indexed':'status-high'}" style="margin-left:auto;">${o.status}</span>
    </div>
    <div class="grid-4">
      <div class="pf-item"><label>Overall Competency</label><b>${o.competency}%</b></div>
      <div class="pf-item"><label>Highest Gap</label><b>${o.gap}</b></div>
      <div class="pf-item"><label>Learning Progress</label><b>${o.progress}%</b></div>
      <div class="pf-item"><label>Last Assessment</label><b>${o.last}</b></div>
    </div>
  </div>
  <div class="grid-2">
    <div class="card"><div class="section-title">Competency Snapshot</div><div class="chart-wrap short"><canvas id="chart-officer"></canvas></div></div>
    <div class="card"><div class="section-title">Recommended Interventions</div>
      <div class="priority-item">Assign: ${o.gap} Fundamentals Course</div>
      <div class="priority-item">Schedule reassessment in 30 days</div>
      <div class="priority-item">Flag for supervisor review</div>
      <button class="btn btn-primary btn-sm" style="margin-top:10px;" id="od-notify-btn">Send Learning Nudge</button>
    </div>
  </div>`;
  $('#v-admin-officer-detail').innerHTML = html;
  icons();
  $('#od-back').addEventListener('click', ()=>navigate('admin-officers'));
  $('#od-notify-btn').addEventListener('click', ()=>toast(`Learning nudge sent to ${o.name}.`, 'send'));
  destroyChart('officerChart');
  state.chartRegistry.officerChart = new Chart(document.getElementById('chart-officer'), {
    type:'radar',
    data:{ labels:['Survey Methodology','Sampling','CAPI','Field Procedures'], datasets:[{ label:o.name, data:[80,o.competency-10,78,85], backgroundColor:'rgba(39,67,163,.15)', borderColor:'#2743a3', pointBackgroundColor:'#2743a3' }] },
    options:{ responsive:true, maintainAspectRatio:false, scales:{ r:{ min:0, max:100, ticks:{display:false} } }, plugins:{legend:{display:false}} }
  });
}

/* ------------------------------------------------------------------ */
/* ADMIN: REPORTS                                                     */
/* ------------------------------------------------------------------ */

function renderAdminReports(){
  const html = `
  <div class="page-head"><div><h1>Reports</h1><p>Generate and export competency intelligence reports.</p></div></div>
  <div class="grid-3" id="reports-grid"></div>`;
  $('#v-admin-reports').innerHTML = html;
  const grid = $('#reports-grid');
  REPORTS.forEach(r=>{
    const card = el(`<div class="report-card">
      <div class="rc-top"><div class="rc-icon"><i data-lucide="${r.icon}"></i></div><div><h4>${r.title}</h4><p>${r.desc}</p></div></div>
      <div class="report-actions">
        <button class="btn btn-outline btn-sm rep-view">View Report</button>
        <button class="btn btn-outline btn-sm rep-pdf">Export PDF</button>
        <button class="btn btn-outline btn-sm rep-csv">Export CSV</button>
      </div>
    </div>`);
    card.querySelector('.rep-view').addEventListener('click', ()=>openModal(`<div class="modal-head"><h2>${r.title}</h2></div><p style="color:var(--text-700); line-height:1.6; margin-bottom:16px;">${r.desc}</p><div class="hist-list"><div class="hist-item"><div class="hi-left"><b>Generated</b><small>23 Aug 2026</small></div></div><div class="hist-item"><div class="hi-left"><b>Records</b><small>12,450 officers</small></div></div></div>`));
    card.querySelector('.rep-pdf').addEventListener('click', ()=>downloadDemoFile(r.title.replace(/\s+/g,'_')+'.txt', r.title+' — demo export (prototype).'));
    card.querySelector('.rep-csv').addEventListener('click', ()=>downloadDemoFile(r.title.replace(/\s+/g,'_')+'.csv', 'metric,value\ncoverage,demo\n'));
    grid.appendChild(card);
  });
  icons();
}
function downloadDemoFile(filename, content){
  const blob = new Blob([content], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  toast(`${filename} exported (demo file).`, 'download');
}

/* ------------------------------------------------------------------ */
/* ADMIN: SETTINGS                                                    */
/* ------------------------------------------------------------------ */

function renderAdminSettings(){
  const html = `
  <div class="page-head"><div><h1>Settings</h1><p>Platform configuration for administrators.</p></div></div>
  <div class="card" style="margin-bottom:20px;">
    <div class="section-title">Platform</div>
    <div class="settings-row"><div><h4>Adaptive Assessment Engine</h4><p>Enable difficulty adjustment during diagnostic assessments.</p></div><button class="switch on"></button></div>
    <div class="settings-row"><div><h4>RAG-Based AI Assessments</h4><p>Allow AI-generated MCQs from the knowledge base.</p></div><button class="switch on"></button></div>
    <div class="settings-row"><div><h4>iGOT Karmayogi Sync</h4><p>Simulated sync with iGOT course catalogue.</p></div><button class="switch on"></button></div>
  </div>
  <div class="card">
    <div class="section-title">Notifications</div>
    <div class="settings-row"><div><h4>Workforce Alerts</h4><p>Notify admins when officers fall below required competency thresholds.</p></div><button class="switch on"></button></div>
    <div class="settings-row"><div><h4>Weekly Digest</h4><p>Send a weekly workforce competency summary.</p></div><button class="switch"></button></div>
  </div>`;
  $('#v-admin-settings').innerHTML = html;
  icons();
  $all('.switch', $('#v-admin-settings')).forEach(s=>s.addEventListener('click', ()=>{ s.classList.toggle('on'); toast('Setting updated.', 'check'); }));
}

/* ------------------------------------------------------------------ */
/* AI ASSISTANT (FLOATING)                                            */
/* ------------------------------------------------------------------ */

const AI_PROMPTS = [
  'Why is Sampling my highest priority?',
  'What should I learn next?',
  'Explain my competency score.',
  'Show my progress.',
  'Recommend resources for CAPI.',
];

function aiReplyFor(msg){
  const m = msg.toLowerCase();
  if(m.includes('sampling') && m.includes('priority')) return 'Sampling shows the largest gap between your current score (48%) and the required level (75%) for your role — a 27-point gap, the largest of any competency in your profile. That is why it is flagged as your highest priority.';
  if(m.includes('what should i learn') || m.includes('learn next')) return 'Based on your competency gaps, "Sampling Fundamentals" is recommended next (96% match), followed by "Sampling Methods". You can start it from your Learning Path.';
  if(m.includes('explain') && m.includes('score')) return 'Your overall competency score is a weighted average of your diagnostic assessment performance across all required competencies for your role, compared against the required proficiency level.';
  if(m.includes('progress')) return 'Your Sampling competency has improved from 52% to 81% (+29%) after completing your personalized learning path. You can see the full trend on the Progress page.';
  if(m.includes('capi')) return 'For CAPI, I would recommend "CAPI Field Data Quality" on iGOT Karmayogi (83% match) — it directly targets data validation rules, where your score is currently lowest within CAPI.';
  return "That's a great question. Based on your current competency profile, I'd suggest reviewing your Competency Details page for a full breakdown, or asking me something like \"What should I learn next?\"";
}

function toggleAiPanel(force){
  const panel = $('#ai-panel');
  const open = force !== undefined ? force : !panel.classList.contains('open');
  panel.classList.toggle('open', open);
  if(open && state.aiChatHistory.length===0){
    pushAiMessage('bot', `Hi ${state.userName.split(' ')[1]||''}, I'm Competency AI. Ask me anything about your competencies, learning path, or progress.`);
    renderAiSuggested();
  }
}

function pushAiMessage(who, text){
  state.aiChatHistory.push({who,text});
  const body = $('#ai-panel-body');
  body.appendChild(el(`<div class="ai-msg ${who}">${text}</div>`));
  body.scrollTop = body.scrollHeight;
}

function renderAiSuggested(){
  const box = $('#ai-suggested');
  box.innerHTML = AI_PROMPTS.map(p=>`<button class="ai-chip">${p}</button>`).join('');
  $all('.ai-chip', box).forEach(c=>c.addEventListener('click', ()=>sendAiMessage(c.textContent)));
}

function sendAiMessage(text){
  if(!text) return;
  pushAiMessage('user', text);
  $('#ai-panel-text').value = '';
  const body = $('#ai-panel-body');
  const typing = el(`<div class="ai-msg bot"><div class="typing-dots"><span></span><span></span><span></span></div></div>`);
  body.appendChild(typing); body.scrollTop = body.scrollHeight;
  setTimeout(()=>{
    typing.remove();
    pushAiMessage('bot', aiReplyFor(text));
  }, 900);
}

function initAiAssistant(){
  $('#ai-fab').addEventListener('click', ()=>toggleAiPanel());
  $('#ai-panel-close').addEventListener('click', ()=>toggleAiPanel(false));
  $('#ai-panel-form').addEventListener('submit', (e)=>{ e.preventDefault(); sendAiMessage($('#ai-panel-text').value.trim()); });
}

/* ------------------------------------------------------------------ */
/* INIT                                                                */
/* ------------------------------------------------------------------ */

function init(){
  icons();
  initPublicSite();
  initLogin();
  initRoleSelect();
  initShellNav();
  initAiAssistant();
  showRoute('view-public');
}

document.addEventListener('DOMContentLoaded', init);