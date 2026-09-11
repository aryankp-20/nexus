/* =====================================================================
   iGOT KARMAYOGI RESOURCE MAPPING — DEMO / PROTOTYPE DATA
   =====================================================================
   HONEST STATUS: no real iGOT Karmayogi API credentials are available
   for this hackathon build. This is NOT a live integration — it is an
   iGOT RESOURCE MAPPING LAYER: a static catalogue of course metadata,
   each tagged with the exact competency (and, where relevant, the
   exact sub-competency) it addresses. backend/services/igotService.js
   uses this tagging to recommend the resource that actually matches an
   officer's real, diagnosed gap — not just "any course for this role".
   See HACKATHON_GUIDE.md for how to wire in a real iGOT API later.
===================================================================== */

const IGOT_COURSES = [
  { title: 'Sampling Fundamentals', competency: 'Sampling', subCompetency: 'Basic Concepts', duration: '30 min', difficulty: 'Beginner', match: 96, provider: 'iGOT Karmayogi · NSSO Academy', url: 'https://igotkarmayogi.gov.in/' },
  { title: 'Sampling Methods in Official Surveys', competency: 'Sampling', subCompetency: 'Sampling Methods', duration: '45 min', difficulty: 'Intermediate', match: 93, provider: 'iGOT Karmayogi · MoSPI', url: 'https://igotkarmayogi.gov.in/' },
  { title: 'Advanced Sampling Algorithms', competency: 'Sampling Algorithms', subCompetency: 'Stratified Sampling', duration: '1h 10m', difficulty: 'Advanced', match: 94, provider: 'iGOT Karmayogi · MoSPI', url: 'https://igotkarmayogi.gov.in/' },
  { title: 'Cluster & PPS Sampling Deep Dive', competency: 'Sampling Algorithms', subCompetency: 'Cluster Sampling', duration: '1h', difficulty: 'Advanced', match: 90, provider: 'iGOT Karmayogi · MoSPI', url: 'https://igotkarmayogi.gov.in/' },
  { title: 'CAPI Field Data Quality', competency: 'CAPI', subCompetency: 'Data Validation Rules', duration: '40 min', difficulty: 'Intermediate', match: 89, provider: 'iGOT Karmayogi · NIC', url: 'https://igotkarmayogi.gov.in/' },
  { title: 'CAPI App Navigation for Enumerators', competency: 'CAPI', subCompetency: 'App Navigation', duration: '25 min', difficulty: 'Beginner', match: 85, provider: 'iGOT Karmayogi · NIC', url: 'https://igotkarmayogi.gov.in/' },
  { title: 'Survey Design Handbook Walkthrough', competency: 'Survey Methodology', subCompetency: 'Survey Design Principles', duration: '55 min', difficulty: 'Intermediate', match: 87, provider: 'iGOT Karmayogi · IIPA', url: 'https://igotkarmayogi.gov.in/' },
  { title: 'Understanding Non-Sampling Error', competency: 'Survey Methodology', subCompetency: 'Non-sampling Error', duration: '35 min', difficulty: 'Intermediate', match: 84, provider: 'iGOT Karmayogi · IIPA', url: 'https://igotkarmayogi.gov.in/' },
  { title: 'Statistical Data Processing Essentials', competency: 'Data Processing', subCompetency: 'Data Cleaning', duration: '50 min', difficulty: 'Beginner', match: 82, provider: 'iGOT Karmayogi · MoSPI', url: 'https://igotkarmayogi.gov.in/' },
  { title: 'Imputation Techniques for Survey Data', competency: 'Data Processing', subCompetency: 'Imputation', duration: '1h', difficulty: 'Advanced', match: 88, provider: 'iGOT Karmayogi · MoSPI', url: 'https://igotkarmayogi.gov.in/' },
  { title: 'Field Supervision & Quality Audits', competency: 'Supervision', subCompetency: 'Quality Audit', duration: '35 min', difficulty: 'Intermediate', match: 86, provider: 'iGOT Karmayogi · NSSO Academy', url: 'https://igotkarmayogi.gov.in/' },
  { title: 'Team Coordination for Field Officers', competency: 'Supervision', subCompetency: 'Team Coordination', duration: '30 min', difficulty: 'Beginner', match: 80, provider: 'iGOT Karmayogi · NSSO Academy', url: 'https://igotkarmayogi.gov.in/' },
  { title: 'Respondent Protocol & Field Procedures', competency: 'Field Procedures', subCompetency: 'Respondent Protocol', duration: '40 min', difficulty: 'Beginner', match: 85, provider: 'iGOT Karmayogi · NSSO Academy', url: 'https://igotkarmayogi.gov.in/' },
  { title: 'Field Quality Checks & Escalation', competency: 'Field Procedures', subCompetency: 'Quality Checks', duration: '30 min', difficulty: 'Intermediate', match: 83, provider: 'iGOT Karmayogi · NSSO Academy', url: 'https://igotkarmayogi.gov.in/' },
  { title: 'Route Planning for Field Surveys', competency: 'Field Protocols', subCompetency: 'Route Planning', duration: '25 min', difficulty: 'Beginner', match: 81, provider: 'iGOT Karmayogi · NSSO Academy', url: 'https://igotkarmayogi.gov.in/' },
  { title: 'Descriptive Statistics Refresher', competency: 'Statistical Analysis', subCompetency: 'Descriptive Stats', duration: '45 min', difficulty: 'Beginner', match: 84, provider: 'iGOT Karmayogi · CSO', url: 'https://igotkarmayogi.gov.in/' },
  { title: 'Inferential Statistics for Official Data', competency: 'Statistical Analysis', subCompetency: 'Inferential Stats', duration: '1h 15m', difficulty: 'Advanced', match: 90, provider: 'iGOT Karmayogi · CSO', url: 'https://igotkarmayogi.gov.in/' },
  { title: 'Trend Analysis in Survey Reporting', competency: 'Data Interpretation', subCompetency: 'Trend Analysis', duration: '40 min', difficulty: 'Intermediate', match: 82, provider: 'iGOT Karmayogi · CSO', url: 'https://igotkarmayogi.gov.in/' },
  { title: 'Cross-tabulation & Reporting Techniques', competency: 'Data Interpretation', subCompetency: 'Cross-tabulation', duration: '35 min', difficulty: 'Intermediate', match: 79, provider: 'iGOT Karmayogi · CSO', url: 'https://igotkarmayogi.gov.in/' },
];

module.exports = IGOT_COURSES;
