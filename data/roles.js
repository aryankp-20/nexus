/* =====================================================================
   ROLES — static reference data
   ADD NEW ROLES HERE. "competencies" lists which competency names
   (see competencies.js) apply to officers in that role.
===================================================================== */

const ROLES = [
  {
    id: 'collector',
    name: 'Data Collector',
    icon: 'clipboard-list',
    desc: 'Field-level data collection for official surveys and censuses.',
    competencies: ['Survey Methodology', 'Sampling', 'CAPI', 'Field Procedures'],
  },
  {
    id: 'field',
    name: 'Field Officer',
    icon: 'map-pinned',
    desc: 'Supervises field operations and ensures data quality on the ground.',
    competencies: ['Survey Methodology', 'Sampling', 'CAPI', 'Field Protocols', 'Supervision'],
  },
  {
    id: 'analyst',
    name: 'Statistical Analyst',
    icon: 'chart-spline',
    desc: 'Processes and interprets statistical data for official releases.',
    competencies: ['Statistical Analysis', 'Sampling Algorithms', 'Data Interpretation', 'Data Processing'],
  },
  {
    id: 'aryan',
    name: 'secompB Analyst',
    icon: 'chart-spline',
    desc: 'Processes and interprets statistical data for official releases.',
    competencies: ['Maths Analysis', 'graphics', 'Data Progamming', 'wed dev'],
  },
];

module.exports = ROLES;
