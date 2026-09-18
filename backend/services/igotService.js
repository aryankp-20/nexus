/* =====================================================================
   iGOT KARMAYOGI SERVICE
   =====================================================================
   HONEST STATUS: no real iGOT Karmayogi API credentials/documentation
   are available for this hackathon build. This service intentionally
   returns matches from the static resource mapping (data/courses.js)
   rather than pretending to call a live API — it is an iGOT RESOURCE
   MAPPING / INTEGRATION LAYER, not a live integration.

   The important part is the MATCHING LOGIC: a recommendation is tied
   to the officer's actual diagnosed gap (competency + sub-competency),
   not just "any course tagged with a competency the role happens to
   need". See getRecommendationsForFocus().

   CHANGE iGOT CONFIGURATION: backend/config/appConfig.js -> IGOT_INTEGRATION_MODE
   To wire up a real integration later: replace the data source below
   with an authenticated fetch() to the real iGOT API, keeping the same
   return shape so nothing else in the app needs to change.
===================================================================== */

const config = require('../config/appConfig');
const IGOT_COURSES = require('../../data/courses');

// General browse list — all courses relevant to a role's competencies,
// used by the "browse iGOT" page. No gap-specific ranking here.
function getRecommendedCourses(competencyList) {
  const courses = competencyList
    ? IGOT_COURSES.filter(c => competencyList.includes(c.competency))
    : IGOT_COURSES;

  return { mode: config.IGOT_INTEGRATION_MODE, connected: false, courses };
}

// Gap-specific recommendation: given the officer's actual weakest
// competency + sub-competency (from assessmentService.findWeakestFocus),
// return the best-matching resource(s) first. An exact sub-competency
// match ranks above a competency-only match — this is the real
// "competency gap -> weak sub-competency -> matched iGOT resource" link.
function getRecommendationsForFocus(competency, subCompetency) {
  const scored = IGOT_COURSES
    .filter(c => c.competency === competency)
    .map(c => ({
      ...c,
      matchReason: (subCompetency && c.subCompetency === subCompetency)
        ? `Directly matches your weak sub-competency: ${subCompetency}`
        : `Matches your weak competency: ${competency}`,
      exactSubMatch: subCompetency ? c.subCompetency === subCompetency : false,
    }))
    .sort((a, b) => (b.exactSubMatch - a.exactSubMatch) || (b.match - a.match));

  return { mode: config.IGOT_INTEGRATION_MODE, connected: false, competency, subCompetency, courses: scored };
}

module.exports = { getRecommendedCourses, getRecommendationsForFocus };
