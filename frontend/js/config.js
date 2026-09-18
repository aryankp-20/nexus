/* =====================================================================
   FRONTEND CONFIG
   Small display-relevant numbers (question count, passing score, gap
   thresholds) fetched once from GET /api/config, so the UI text always
   matches backend/config/appConfig.js — nothing is duplicated by hand.
   Sensible defaults are used until the fetch completes.
===================================================================== */

const config = {
  numberOfAssessmentQuestions: 10,
  passingScore: 70,
  reassessmentQuestionCount: 5,
  highGapThreshold: 20,
  mediumGapThreshold: 10,
  // convenience alias used in a few UI strings
  get NUMBER_OF_ASSESSMENT_QUESTIONS() { return this.numberOfAssessmentQuestions; },
};

export async function loadConfig() {
  try {
    const res = await fetch('/api/config');
    const data = await res.json();
    Object.assign(config, data);
  } catch (e) {
    console.warn('Could not load /api/config, using defaults.', e);
  }
}

export default config;
