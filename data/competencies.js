/* =====================================================================
   COMPETENCIES — configuration / reference data
   ADD NEW COMPETENCIES HERE.

   "required" = the score an officer needs to reach for that competency.
   "sub" = sub-competencies, each with a starting demo baseline score
           (real officer sub-scores are derived from assessment
           responses once real assessments have been taken).
===================================================================== */

const COMPETENCY_LIB = {
  'Survey Methodology': { required: 80, sub: ['Questionnaire Design', 'Survey Design Principles', 'Non-sampling Error'] },
  'Sampling': { required: 75, sub: ['Basic Concepts', 'Sampling Methods', 'Sampling Algorithms', 'Advanced Application'] },
  'CAPI': { required: 85, sub: ['App Navigation', 'Offline Sync', 'Data Validation Rules'] },
  'Field Procedures': { required: 90, sub: ['Respondent Protocol', 'Quality Checks', 'Escalation Process'] },
  'Field Protocols': { required: 85, sub: ['Route Planning', 'Supervision Checklist'] },
  'Supervision': { required: 82, sub: ['Team Coordination', 'Quality Audit'] },
  'Statistical Analysis': { required: 85, sub: ['Descriptive Stats', 'Inferential Stats'] },
  'Sampling Algorithms': { required: 80, sub: ['Stratified Sampling', 'Cluster Sampling', 'PPS Sampling'] },
  'Data Interpretation': { required: 80, sub: ['Trend Analysis', 'Cross-tabulation'] },
  'Data Processing': { required: 80, sub: ['Data Cleaning', 'Imputation'] },
};

module.exports = COMPETENCY_LIB;
