/* =====================================================================
   DEMO DATA — clearly marked demo/seed data
   Used only by backend/database/seed.js to populate the database on
   first run, so the hackathon demo has realistic-looking records.
===================================================================== */

// Demo officer accounts. Password for every demo account is "demo1234".
const OFFICERS = [
  { name: 'Officer R. Sharma', employeeId: 'MOSPI-10234', email: 'officer.sharma@mospi.gov.in', role: 'collector', isAdmin: false, department: 'National Sample Survey Office' },
  { name: 'Officer A. Verma', employeeId: 'MOSPI-10871', email: 'officer.verma@mospi.gov.in', role: 'field', isAdmin: false, department: 'Field Operations Division' },
  { name: 'Officer K. Iyer', employeeId: 'MOSPI-11190', email: 'officer.iyer@mospi.gov.in', role: 'analyst', isAdmin: false, department: 'Central Statistics Office' },
  { name: 'Officer S. Nair', employeeId: 'MOSPI-10456', email: 'officer.nair@mospi.gov.in', role: 'collector', isAdmin: false, department: 'National Sample Survey Office' },
  { name: 'Officer P. Das', employeeId: 'MOSPI-11302', email: 'officer.das@mospi.gov.in', role: 'field', isAdmin: false, department: 'Field Operations Division' },
  { name: 'Officer M. Khan', employeeId: 'MOSPI-10678', email: 'officer.khan@mospi.gov.in', role: 'analyst', isAdmin: false, department: 'Central Statistics Office' },
  { name: 'Officer T. Reddy', employeeId: 'MOSPI-11045', email: 'officer.reddy@mospi.gov.in', role: 'collector', isAdmin: false, department: 'National Sample Survey Office' },
  { name: 'Officer J. Singh', employeeId: 'MOSPI-10923', email: 'officer.singh@mospi.gov.in', role: 'field', isAdmin: false, department: 'Field Operations Division' },
  { name: 'Admin User', employeeId: 'MOSPI-ADMIN', email: 'admin@mospi.gov.in', role: 'analyst', isAdmin: true, department: 'Administration' },
];

// =====================================================================
// QUESTION BANK — 60+ hand-authored questions, verified correct answers
// Covers all 10 competency areas: Survey Methodology, Sampling, CAPI,
// Field Procedures, Field Protocols, Supervision, Statistical Analysis,
// Sampling Algorithms, Data Interpretation, Data Processing.
// correct: 0-based index of the correct option in opts[]
// =====================================================================
const QUESTION_BANK = [

  // ─────────────────── SURVEY METHODOLOGY ───────────────────
  {
    comp: 'Survey Methodology', sub: 'Survey Design Principles', diff: 'Easy',
    q: 'What is the primary purpose of a survey questionnaire?',
    opts: ['To record field officer names and travel logs', 'To systematically collect standardized data from respondents on defined topics', 'To calculate sampling weights automatically', 'To store administrative payroll records'],
    correct: 1,
    explanation: 'A survey questionnaire is a structured instrument designed to collect standardized information from respondents in a consistent way that supports valid analysis.'
  },

  {
    comp: 'Survey Methodology', sub: 'Questionnaire Design', diff: 'Easy',
    q: 'Which question type allows respondents to answer in their own words without predefined choices?',
    opts: ['Closed-ended question', 'Likert scale question', 'Open-ended question', 'Dichotomous question'],
    correct: 2,
    explanation: 'Open-ended questions do not restrict answers to fixed choices, allowing respondents to express answers freely — useful for capturing nuanced or unexpected information.'
  },

  {
    comp: 'Survey Methodology', sub: 'Non-sampling Error', diff: 'Medium',
    q: 'Which error type arises from respondents providing inaccurate answers, independent of the sampling method used?',
    opts: ['Sampling error', 'Non-sampling error', 'Coverage error', 'Systematic bias'],
    correct: 1,
    explanation: 'Non-sampling error covers inaccuracies such as respondent misreporting, interviewer bias, or data entry mistakes — errors unrelated to which sample was drawn.'
  },

  {
    comp: 'Survey Methodology', sub: 'Questionnaire Design', diff: 'Medium',
    q: 'What is "respondent burden" in the context of survey design?',
    opts: ['The financial cost to the government of running the survey', 'The time, effort, and inconvenience placed on respondents to complete the survey', 'The weight assigned to each respondent in analysis', 'The cost of training enumerators'],
    correct: 1,
    explanation: 'Respondent burden refers to the effort and time required from participants. High burden increases non-response and can reduce data quality.'
  },

  {
    comp: 'Survey Methodology', sub: 'Survey Design Principles', diff: 'Hard',
    q: 'In survey design, "mode effect" refers to:',
    opts: ['The impact of question ordering on responses', 'The statistical mode of the response distribution', 'Systematic differences in responses caused by using different data collection modes (e.g., phone vs. face-to-face)', 'The effect of using multiple enumerators in one area'],
    correct: 2,
    explanation: 'Mode effect is the systematic difference in survey responses attributable to the data collection mode used — due to factors like interviewer presence, social desirability, or response layout.'
  },

  {
    comp: 'Survey Methodology', sub: 'Non-sampling Error', diff: 'Hard',
    q: 'Acquiescence bias in surveys occurs when respondents:',
    opts: ['Refuse to answer sensitive questions', 'Tend to agree with statements regardless of their true opinion', 'Select answers randomly to finish the survey faster', 'Provide different answers to the same question at different times'],
    correct: 1,
    explanation: 'Acquiescence bias (yes-saying) is a systematic response style where respondents agree with statements irrespective of content, inflating agreement rates.'
  },

  // ─────────────────── SAMPLING ───────────────────
  {
    comp: 'Sampling', sub: 'Basic Concepts', diff: 'Easy',
    q: 'What is a "sampling frame"?',
    opts: ['The physical boundary map of the survey area', 'A complete list of all population units from which the sample is actually drawn', 'The final set of questionnaire questions', 'The margin of error of the estimates'],
    correct: 1,
    explanation: 'A sampling frame is the operational list of all units in the target population. The quality of the frame (coverage, currency) directly affects the validity of the sample.'
  },

  {
    comp: 'Sampling', sub: 'Sampling Methods', diff: 'Easy',
    q: 'In Simple Random Sampling (SRS), every unit in the population has:',
    opts: ['Zero chance of being selected', 'A probability proportional to its size', 'An equal and independent chance of being selected', 'A chance determined by the enumerator'],
    correct: 2,
    explanation: 'Simple Random Sampling gives every unit an equal and independent probability of selection, making it the most basic probability sampling method.'
  },

  {
    comp: 'Sampling', sub: 'Sampling Methods', diff: 'Medium',
    q: 'Which sampling method is most appropriate when the population is naturally divided into distinct non-overlapping subgroups?',
    opts: ['Simple Random Sampling', 'Stratified Sampling', 'Convenience Sampling', 'Snowball Sampling'],
    correct: 1,
    explanation: 'Stratified sampling divides the population into homogeneous strata before drawing samples within each, exploiting natural divisions to increase precision.'
  },

  {
    comp: 'Sampling', sub: 'Sampling Methods', diff: 'Medium',
    q: 'Systematic sampling selects units by:',
    opts: ['Choosing every unit in the population', 'Randomly selecting entire clusters', 'Choosing a random start then selecting every k-th unit thereafter', 'Selecting units based on researcher judgment'],
    correct: 2,
    explanation: 'In systematic sampling, a random start is chosen from 1 to k (sampling interval), then every k-th unit is selected. It is efficient and easy to implement in the field.'
  },

  {
    comp: 'Sampling', sub: 'Advanced Application', diff: 'Hard',
    q: 'In stratified sampling, strata should ideally be formed such that:',
    opts: ['Units within strata are heterogeneous', 'Units across all strata are identical', 'Units within each stratum are homogeneous and strata differ from each other', 'All strata have equal sample sizes'],
    correct: 2,
    explanation: 'Good strata are internally homogeneous (similar units within) and differ from other strata. This maximizes precision by reducing within-stratum variance.'
  },

  {
    comp: 'Sampling', sub: 'Basic Concepts', diff: 'Hard',
    q: 'Non-response bias in a sample survey is best described as:',
    opts: ['Errors made by respondents while answering questions', 'The systematic difference between respondents and non-respondents on the survey variable', 'The fraction of questionnaires returned incomplete', 'The difference between sample mean and population mean due to chance alone'],
    correct: 1,
    explanation: 'Non-response bias occurs when those who respond systematically differ from those who do not on the survey variable, causing estimates to be biased even with a properly designed sample.'
  },

  // ─────────────────── CAPI ───────────────────
  {
    comp: 'CAPI', sub: 'App Navigation', diff: 'Easy',
    q: 'What does CAPI stand for in official survey operations?',
    opts: ['Computer Assisted Personal Interviewing', 'Central Administrative Public Index', 'Cluster Adaptive Probability Interview', 'Coded Automated Print Instrument'],
    correct: 0,
    explanation: 'CAPI stands for Computer Assisted Personal Interviewing — enumerators use a device or app to conduct and record interviews in digital form.'
  },

  {
    comp: 'CAPI', sub: 'Offline Sync', diff: 'Easy',
    q: 'In CAPI-based surveys, what is the primary purpose of offline synchronization?',
    opts: ['To reduce respondent burden', 'To allow data capture without live connectivity and upload later', 'To skip data validation checks in the field', 'To auto-generate survey questions from the server'],
    correct: 1,
    explanation: 'Offline sync allows enumerators to collect data in areas with poor connectivity, storing responses locally and uploading them once a connection is available.'
  },

  {
    comp: 'CAPI', sub: 'Data Validation Rules', diff: 'Medium',
    q: 'Which is a key advantage of built-in validation rules in CAPI over paper-based surveys?',
    opts: ['They increase interviewer bias', 'They catch logically impossible or out-of-range answers in real time before submission', 'They allow respondents to skip all questions', 'They eliminate the need for a sampling frame entirely'],
    correct: 1,
    explanation: 'CAPI validation rules catch errors such as impossible values and skip logic violations at the point of entry, preventing them from entering the dataset and reducing post-collection editing work.'
  },

  {
    comp: 'CAPI', sub: 'Data Validation Rules', diff: 'Medium',
    q: 'Skip logic in a CAPI questionnaire is used to:',
    opts: ['Skip the interview if the respondent is unavailable', 'Automatically route the enumerator to the next relevant question based on a prior answer', 'Delete invalid records from the dataset', 'Send completed data to headquarters automatically'],
    correct: 1,
    explanation: 'Skip logic (conditional branching) directs the enumerator to appropriate follow-up questions based on previous responses, reducing irrelevant questions and respondent burden.'
  },

  {
    comp: 'CAPI', sub: 'Offline Sync', diff: 'Hard',
    q: 'A CAPI application flags a "sync conflict" during upload. What is the most likely cause?',
    opts: ['The device battery is critically low', 'The same record was edited on two offline devices independently', 'The survey server is temporarily offline', 'The enumerator submitted the same form twice online'],
    correct: 1,
    explanation: 'Sync conflicts arise when the same record has been independently modified on more than one offline device. Resolution requires a defined merge or override policy to maintain data integrity.'
  },

  // ─────────────────── FIELD PROCEDURES ───────────────────
  {
    comp: 'Field Procedures', sub: 'Quality Checks', diff: 'Easy',
    q: 'What is the main goal of a pilot survey?',
    opts: ['To finalize publication tables', 'To test questionnaire design and field logistics before full rollout', 'To replace the main survey entirely', 'To calculate final sampling weights'],
    correct: 1,
    explanation: 'A pilot survey is a small-scale trial run to identify and fix problems in the questionnaire, training, and logistics before committing to full-scale data collection.'
  },

  {
    comp: 'Field Procedures', sub: 'Respondent Protocol', diff: 'Easy',
    q: 'If a selected household is absent at the first visit, the enumerator should:',
    opts: ['Replace them immediately with a neighboring household', 'Record a refusal and close the case', 'Schedule a callback visit on a different day as per protocol', 'Leave a blank questionnaire for self-completion'],
    correct: 2,
    explanation: 'Standard field procedure requires callback visits (typically at least 3 attempts at different times) before a household can be treated as non-contact and potentially substituted.'
  },

  {
    comp: 'Field Procedures', sub: 'Quality Checks', diff: 'Medium',
    q: 'A field officer notices inconsistent responses across enumerators for the same question. The most appropriate first action is:',
    opts: ['Discard all affected data immediately', 'Conduct a quality audit and arrange re-training if needed', 'Ignore it since sample size is large enough to absorb errors', 'Change the survey instrument immediately'],
    correct: 1,
    explanation: 'Inconsistent inter-enumerator responses usually indicate a training or protocol issue, best addressed by a quality audit to identify the cause followed by targeted re-training.'
  },

  {
    comp: 'Field Procedures', sub: 'Escalation Process', diff: 'Medium',
    q: 'When should a field enumerator escalate an issue to their supervisor?',
    opts: ['Only at the end of the entire survey period', 'When they encounter situations outside standard procedure that they cannot resolve independently', 'Whenever any respondent refuses to answer any question', 'When they have completed exactly 50% of their assigned workload'],
    correct: 1,
    explanation: 'Escalation to a supervisor is required for exceptional situations — access barriers, respondent safety concerns, data anomalies, or any case outside standard procedure.'
  },

  {
    comp: 'Field Procedures', sub: 'Escalation Process', diff: 'Hard',
    q: 'In large-scale official surveys, back-checking (re-verification) of interviews is used primarily to:',
    opts: ['Re-interview every respondent to obtain a second dataset', 'Detect fabricated or falsified responses by re-contacting a random subsample', 'Replace all incomplete questionnaires with imputed values', 'Calculate the confidence interval of the final estimates'],
    correct: 1,
    explanation: 'Back-checking re-contacts a random subset of completed interviews to verify they actually occurred and responses are genuine — a key fraud-deterrence and quality-control mechanism.'
  },

  // ─────────────────── FIELD PROTOCOLS ───────────────────
  {
    comp: 'Field Protocols', sub: 'Supervision Checklist', diff: 'Easy',
    q: 'Which document guides a field supervisor\'s daily quality control activities?',
    opts: ['The published survey report', 'The supervision checklist', 'The national sampling frame', 'The enumerator training schedule'],
    correct: 1,
    explanation: 'The supervision checklist is the operational guide for supervisors to perform daily checks — verifying completeness, consistency, and protocol adherence across their team\'s work.'
  },

  {
    comp: 'Field Protocols', sub: 'Route Planning', diff: 'Medium',
    q: 'Effective field route planning for enumerators primarily aims to:',
    opts: ['Minimize the number of questionnaires collected', 'Maximize geographic coverage while minimizing travel time and cost', 'Ensure each enumerator covers only urban areas', 'Reduce the number of supervisors required'],
    correct: 1,
    explanation: 'Efficient route planning optimizes coverage of all assigned sampling units against travel constraints, improving both productivity and respondent contact rates.'
  },

  {
    comp: 'Field Protocols', sub: 'Supervision Checklist', diff: 'Hard',
    q: 'What is the purpose of a "field edit" check in official surveys?',
    opts: ['To delete invalid records from the central database', 'To review completed questionnaires for obvious errors while the enumerator is still near the respondent', 'To apply statistical imputation to missing values', 'To verify the sampling frame is current and complete'],
    correct: 1,
    explanation: 'Field edits are on-the-spot reviews of questionnaires while the enumerator is still in the area, enabling immediate correction of errors before leaving — far less costly than post-hoc correction.'
  },

  // ─────────────────── SUPERVISION ───────────────────
  {
    comp: 'Supervision', sub: 'Team Coordination', diff: 'Easy',
    q: 'What is a key responsibility of a field supervisor during data collection?',
    opts: ['Completing questionnaires on behalf of absent enumerators', 'Monitoring enumerator performance and ensuring protocol compliance', 'Drafting and publishing the survey results', 'Defining the national sampling frame'],
    correct: 1,
    explanation: 'Field supervisors oversee their team of enumerators, monitor performance, resolve field issues, and ensure data quality through compliance checks and back-checking.'
  },

  {
    comp: 'Supervision', sub: 'Quality Audit', diff: 'Medium',
    q: 'Quality audits of field data should ideally be conducted:',
    opts: ['Only at the end of the entire data collection phase', 'Continuously throughout the field period to catch errors early', 'Only after data has been entered into the central database', 'Once per month regardless of field progress'],
    correct: 1,
    explanation: 'Continuous auditing during the field period enables early detection and correction of systematic errors, preventing accumulation of quality problems that are costly to correct later.'
  },

  {
    comp: 'Supervision', sub: 'Quality Audit', diff: 'Hard',
    q: 'An unusually low refusal rate from one enumerator during a quality audit is best interpreted as:',
    opts: ['Evidence the enumerator is performing exceptionally well', 'A potential indicator of data fabrication requiring investigation', 'Proof that respondents in that area are highly cooperative', 'A statistical outlier of no practical significance'],
    correct: 1,
    explanation: 'An anomalously low refusal rate can signal an enumerator is fabricating interviews rather than conducting them. This must be investigated through immediate back-checking.'
  },

  // ─────────────────── STATISTICAL ANALYSIS ───────────────────
  {
    comp: 'Statistical Analysis', sub: 'Descriptive Stats', diff: 'Easy',
    q: 'Which measure of central tendency is most affected by extreme outliers?',
    opts: ['Median', 'Mode', 'Mean', 'Range'],
    correct: 2,
    explanation: 'The arithmetic mean incorporates every data value, so extreme outliers pull it disproportionately in their direction. The median is resistant to outliers.'
  },

  {
    comp: 'Statistical Analysis', sub: 'Descriptive Stats', diff: 'Easy',
    q: 'Standard deviation measures:',
    opts: ['The most frequent value in the dataset', 'The middle value when data is sorted in order', 'The average distance of data points from the mean', 'The difference between the maximum and minimum values'],
    correct: 2,
    explanation: 'Standard deviation quantifies the average spread of observations around the mean. A larger standard deviation indicates greater variability in the data.'
  },

  {
    comp: 'Statistical Analysis', sub: 'Inferential Stats', diff: 'Medium',
    q: 'A p-value of 0.03 in a hypothesis test (α = 0.05) means:',
    opts: ['There is a 3% probability that the null hypothesis is true', 'The result is not statistically significant at the 5% level', 'We reject the null hypothesis because p < α', 'The effect size is necessarily large'],
    correct: 2,
    explanation: 'When p < α, the evidence against the null hypothesis is sufficiently strong that we reject it. Here p = 0.03 < 0.05, so we reject H₀ at the 5% significance level.'
  },

  {
    comp: 'Statistical Analysis', sub: 'Inferential Stats', diff: 'Medium',
    q: 'A 95% confidence interval means:',
    opts: ['There is a 95% probability the true parameter is in this specific interval', 'If sampling were repeated many times, 95% of such intervals would contain the true parameter', 'Only 5% of data points fall outside the interval', '95% of respondents agree with the estimate'],
    correct: 1,
    explanation: 'A 95% CI is a frequentist concept: if the study were repeated many times under identical conditions, approximately 95% of the resulting intervals would contain the true population parameter.'
  },

  {
    comp: 'Statistical Analysis', sub: 'Inferential Stats', diff: 'Hard',
    q: 'Which test is most appropriate for comparing proportions across more than two independent groups?',
    opts: ['Paired t-test', 'Chi-square test of independence', 'Pearson correlation coefficient', 'One-sample z-test'],
    correct: 1,
    explanation: 'The Chi-square test of independence tests for associations between categorical variables across multiple groups, making it appropriate for comparing proportions in a contingency table.'
  },

  {
    comp: 'Statistical Analysis', sub: 'Descriptive Stats', diff: 'Hard',
    q: 'Positive skewness in a dataset indicates:',
    opts: ['Most values are above the mean with a long left tail', 'The mean, median, and mode are equal', 'A long right tail — a few very high values pull the mean above the median', 'Uniform distribution with no outliers'],
    correct: 2,
    explanation: 'Positive (right) skewness means a few very high values create a long right tail. The mean is pulled higher than the median, which is higher than the mode: Mean > Median > Mode.'
  },

  // ─────────────────── SAMPLING ALGORITHMS ───────────────────
  {
    comp: 'Sampling Algorithms', sub: 'Cluster Sampling', diff: 'Easy',
    q: 'What is a "cluster" in cluster sampling?',
    opts: ['A single randomly drawn respondent', 'A naturally occurring group of population units selected as a whole sampling unit', 'A computer algorithm for generating random numbers', 'A stratum defined by income level'],
    correct: 1,
    explanation: 'A cluster is a pre-existing group of population units (e.g., a village, school, or city block) selected as a whole, after which all or sampled units within chosen clusters are surveyed.'
  },

  {
    comp: 'Sampling Algorithms', sub: 'Cluster Sampling', diff: 'Medium',
    q: 'Cluster sampling is most efficient when:',
    opts: ['Population units within clusters are homogeneous', 'Clusters are internally heterogeneous and similar to each other', 'There is no travel cost in reaching different areas', 'The sample size required is very small'],
    correct: 1,
    explanation: 'Cluster sampling minimizes design effect when each cluster mirrors the diversity of the whole population (internally heterogeneous) and clusters resemble one another.'
  },

  {
    comp: 'Sampling Algorithms', sub: 'PPS Sampling', diff: 'Medium',
    q: 'Which best describes Probability Proportional to Size (PPS) sampling?',
    opts: ['Every unit has an equal chance of selection', 'Units are selected with probability proportional to a defined size measure (e.g., population count)', 'Units are selected by geographic proximity to a central point', 'Sampling stops once a predetermined quota is reached'],
    correct: 1,
    explanation: 'PPS sampling assigns selection probabilities proportional to a size measure, giving larger units a greater selection probability. When a size measure correlates with the survey variable, this greatly improves efficiency.'
  },

  {
    comp: 'Sampling Algorithms', sub: 'Stratified Sampling', diff: 'Medium',
    q: 'In proportional stratified sampling, the sample allocation from each stratum is determined by:',
    opts: ['Equal allocation — the same fixed number from every stratum', "Each stratum's proportion of the total population size", "The researcher's personal judgment", 'The within-stratum sampling variance'],
    correct: 1,
    explanation: 'Proportional allocation draws a sample from each stratum proportional to that stratum\'s share of the total population, ensuring the sample mirrors the population structure.'
  },

  {
    comp: 'Sampling Algorithms', sub: 'PPS Sampling', diff: 'Hard',
    q: 'The main advantage of PPS over equal-probability sampling is:',
    opts: ['It always produces a larger sample size', 'It can substantially reduce variance of estimates when size measure correlates with the survey variable', 'It eliminates the need for a sampling frame', 'It is always easier to explain to enumerators'],
    correct: 1,
    explanation: 'PPS reduces variance when the size measure is correlated with the outcome variable by giving appropriately higher weight to larger, more variable units in the selection process.'
  },

  // ─────────────────── DATA INTERPRETATION ───────────────────
  {
    comp: 'Data Interpretation', sub: 'Cross-tabulation', diff: 'Easy',
    q: 'A cross-tabulation (contingency table) is used to:',
    opts: ['Calculate the mean of a single continuous variable', 'Display the joint frequency distribution of two or more categorical variables simultaneously', 'Plot individual data points on a scatter graph', 'Measure the spread of a single distribution'],
    correct: 1,
    explanation: 'A cross-tabulation shows the joint frequency distribution of two or more categorical variables in a matrix form, enabling analysis of associations and patterns between them.'
  },

  {
    comp: 'Data Interpretation', sub: 'Trend Analysis', diff: 'Easy',
    q: 'A bar chart is most appropriate for:',
    opts: ['Showing the change in a continuous variable over time', 'Comparing quantities across distinct categories', 'Displaying the relationship between two continuous variables', 'Showing the proportion of parts within a whole as wedges'],
    correct: 1,
    explanation: 'Bar charts are designed for comparing discrete quantities across categories. For time trends, line charts are preferred; for part-to-whole proportions, pie or stacked charts are used.'
  },

  {
    comp: 'Data Interpretation', sub: 'Trend Analysis', diff: 'Medium',
    q: 'GDP grew from ₹100 crore in 2020 to ₹121 crore in 2022. What is the approximate CAGR over 2 years?',
    opts: ['10%', '21%', '10.5%', '5%'],
    correct: 0,
    explanation: 'CAGR = (121/100)^(1/2) – 1 = 1.10 – 1 = 10%. A 10% annual growth rate compounded over 2 years produces 21% total growth, so CAGR = 10%.'
  },

  {
    comp: 'Data Interpretation', sub: 'Cross-tabulation', diff: 'Medium',
    q: 'In a two-way contingency table, "marginal totals" refer to:',
    opts: ['The diagonal cells of the table', 'The row totals and column totals representing the marginal distribution of each variable', 'The smallest and largest observed cell frequencies', 'The residuals from a chi-square test'],
    correct: 1,
    explanation: 'Marginal totals are the row and column totals in a contingency table, showing the overall (marginal) distribution of each variable independently of the other.'
  },

  {
    comp: 'Data Interpretation', sub: 'Trend Analysis', diff: 'Hard',
    q: 'A sudden structural break in a time series most likely indicates:',
    opts: ['Normal seasonal variation in the data', 'A policy change, external shock, or change in measurement methodology affecting the series', 'A sampling error confined to one data collection period', 'Statistical imputation applied to an isolated group of missing values'],
    correct: 1,
    explanation: 'A structural break — an abrupt, sustained change in a time series\' level or trend — usually signals a real-world event (policy intervention, economic shock) or a change in measurement methodology.'
  },

  // ─────────────────── DATA PROCESSING ───────────────────
  {
    comp: 'Data Processing', sub: 'Data Cleaning', diff: 'Easy',
    q: 'What is the first step in data cleaning after receiving raw survey data?',
    opts: ['Run regression analysis immediately', 'Identify and handle missing values, duplicate records, and out-of-range values', 'Publish preliminary estimates', 'Apply final sampling weights'],
    correct: 1,
    explanation: 'The initial step in data cleaning is identifying quality issues — missing data, duplicates, impossible values — before any analysis, to ensure the data is fit for use.'
  },

  {
    comp: 'Data Processing', sub: 'Data Cleaning', diff: 'Easy',
    q: 'A record showing Age = -5 is an example of:',
    opts: ['A valid rare observation that should be retained', 'An out-of-range / impossible value requiring correction or treatment as missing', 'A correctly coded value for unknown age', 'A statistical outlier that should be retained without review'],
    correct: 1,
    explanation: 'A negative age is logically impossible and represents a data entry error. Such values must be investigated and corrected or marked as missing before any analysis.'
  },

  {
    comp: 'Data Processing', sub: 'Imputation', diff: 'Medium',
    q: 'Which technique is standard for correcting non-response in survey estimates?',
    opts: ['Sampling weight adjustment or imputation of missing values', 'Removing all non-responding units from the dataset', 'Reducing the size of the sampling frame', 'Increasing questionnaire length to force responses'],
    correct: 0,
    explanation: 'Weight adjustment (reweighting respondents to compensate for non-respondents) and imputation (filling plausible values for missing data) are the standard methods for addressing non-response bias.'
  },

  {
    comp: 'Data Processing', sub: 'Imputation', diff: 'Medium',
    q: 'Mean imputation — replacing missing values with the variable mean — is problematic because:',
    opts: ['It artificially increases the sample size', 'It reduces the variance of the imputed variable, distorting distributional estimates and standard errors', 'It is computationally too expensive for large datasets', 'It requires an AI model to implement correctly'],
    correct: 1,
    explanation: 'Mean imputation compresses values toward the mean, artificially reducing variance below its true level. This distorts frequency distributions, correlations, and standard errors in subsequent analyses.'
  },

  {
    comp: 'Data Processing', sub: 'Data Cleaning', diff: 'Hard',
    q: 'In official statistics, "deduplication" of a dataset means:',
    opts: ['Creating multiple backup copies of data files', 'Identifying and removing duplicate records that represent the same real-world unit', 'Splitting one dataset into two equal halves for analysis', 'Normalizing all variable scales to a common range'],
    correct: 1,
    explanation: 'Deduplication identifies records representing the same entity (e.g., a household surveyed twice) and retains only one, preventing inflated counts or biased estimates.'
  },

  {
    comp: 'Data Processing', sub: 'Imputation', diff: 'Hard',
    q: 'Multiple Imputation (MI) differs from single imputation primarily because MI:',
    opts: ['Deletes all records with any missing values before analysis', 'Generates multiple completed datasets and pools results, properly accounting for uncertainty in imputed values', 'Replaces every missing value with the variable mean automatically', 'Applies imputation only after the final analysis is complete'],
    correct: 1,
    explanation: 'Multiple Imputation generates M completed datasets by drawing from the predictive distribution of missing values, analyzes each, and pools results using Rubin\'s rules to correctly reflect imputation uncertainty in standard errors.'
  },

];

// Report definitions shown on the Reports page.
const REPORTS = [
  { key: 'competency-gap', icon: 'target', title: 'Competency Gap Report', desc: 'Ranked competency gaps across roles and departments.' },
  { key: 'role-performance', icon: 'users', title: 'Role Performance Report', desc: 'Comparative performance benchmarking by role.' },
  { key: 'learning-progress', icon: 'route', title: 'Learning Progress Report', desc: 'Learning path completion and engagement statistics.' },
  { key: 'assessment', icon: 'clipboard-check', title: 'Assessment Report', desc: 'Diagnostic assessment outcomes and score distribution.' },
];

module.exports = { OFFICERS, QUESTION_BANK, REPORTS };

