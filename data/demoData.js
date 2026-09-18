/* =====================================================================
   DEMO DATA — clearly marked demo/seed data
   Used only by backend/database/seed.js to populate the database on
   first run, so the hackathon demo has realistic-looking records.
===================================================================== */

// Demo officer accounts. Password for every demo account is "demo1234".
const OFFICERS = [
  {
    "name": "Officer R. Sharma",
    "employeeId": "MOSPI-10234",
    "email": "officer.sharma@mospi.gov.in",
    "role": "collector",
    "isAdmin": false,
    "department": "National Sample Survey Office"
  },
  {
    "name": "Officer A. Verma",
    "employeeId": "MOSPI-10871",
    "email": "officer.verma@mospi.gov.in",
    "role": "field",
    "isAdmin": false,
    "department": "Field Operations Division"
  },
  {
    "name": "Officer K. Iyer",
    "employeeId": "MOSPI-11190",
    "email": "officer.iyer@mospi.gov.in",
    "role": "analyst",
    "isAdmin": false,
    "department": "Central Statistics Office"
  },
  {
    "name": "Officer S. Nair",
    "employeeId": "MOSPI-10456",
    "email": "officer.nair@mospi.gov.in",
    "role": "collector",
    "isAdmin": false,
    "department": "National Sample Survey Office"
  },
  {
    "name": "Officer P. Das",
    "employeeId": "MOSPI-11302",
    "email": "officer.das@mospi.gov.in",
    "role": "field",
    "isAdmin": false,
    "department": "Field Operations Division"
  },
  {
    "name": "Officer M. Khan",
    "employeeId": "MOSPI-10678",
    "email": "officer.khan@mospi.gov.in",
    "role": "analyst",
    "isAdmin": false,
    "department": "Central Statistics Office"
  },
  {
    "name": "Officer T. Reddy",
    "employeeId": "MOSPI-11045",
    "email": "officer.reddy@mospi.gov.in",
    "role": "collector",
    "isAdmin": false,
    "department": "National Sample Survey Office"
  },
  {
    "name": "Officer J. Singh",
    "employeeId": "MOSPI-10923",
    "email": "officer.singh@mospi.gov.in",
    "role": "field",
    "isAdmin": false,
    "department": "Field Operations Division"
  },
  {
    "name": "Admin User",
    "employeeId": "MOSPI-ADMIN",
    "email": "admin@mospi.gov.in",
    "role": "analyst",
    "isAdmin": true,
    "department": "Administration"
  }
];

// =====================================================================
// QUESTION BANK — verified correct answers distributed across A, B, C, D
// Covers all 10 competency areas: Survey Methodology, Sampling, CAPI,
// Field Procedures, Field Protocols, Supervision, Statistical Analysis,
// Sampling Algorithms, Data Interpretation, Data Processing.
// correct: 0-based index of the correct option in opts[] (0=A, 1=B, 2=C, 3=D)
// =====================================================================
const QUESTION_BANK = [

  // ─────────────────── SURVEY METHODOLOGY ───────────────────
  {
    comp: "Survey Methodology", sub: "Survey Design Principles", diff: "Easy",
    q: "What is the primary purpose of a survey questionnaire?",
    opts: ["To systematically collect standardized data from respondents on defined topics","To record field officer names and travel logs","To calculate sampling weights automatically","To store administrative payroll records"],
    correct: 0,
    explanation: "A survey questionnaire is a structured instrument designed to collect standardized information from respondents in a consistent way that supports valid analysis."
  },
  {
    comp: "Survey Methodology", sub: "Questionnaire Design", diff: "Easy",
    q: "Which question type allows respondents to answer in their own words without predefined choices?",
    opts: ["Closed-ended question","Open-ended question","Likert scale question","Dichotomous question"],
    correct: 1,
    explanation: "Open-ended questions do not restrict answers to fixed choices, allowing respondents to express answers freely — useful for capturing nuanced or unexpected information."
  },
  {
    comp: "Survey Methodology", sub: "Non-sampling Error", diff: "Medium",
    q: "Which error type arises from respondents providing inaccurate answers, independent of the sampling method used?",
    opts: ["Sampling error","Coverage error","Non-sampling error","Systematic bias"],
    correct: 2,
    explanation: "Non-sampling error covers inaccuracies such as respondent misreporting, interviewer bias, or data entry mistakes — errors unrelated to which sample was drawn."
  },
  {
    comp: "Survey Methodology", sub: "Questionnaire Design", diff: "Medium",
    q: "What is \"respondent burden\" in the context of survey design?",
    opts: ["The financial cost to the government of running the survey","The cost of training enumerators","The weight assigned to each respondent in analysis","The time, effort, and inconvenience placed on respondents to complete the survey"],
    correct: 3,
    explanation: "Respondent burden refers to the effort and time required from participants. High burden increases non-response and can reduce data quality."
  },
  {
    comp: "Survey Methodology", sub: "Survey Design Principles", diff: "Hard",
    q: "In survey design, \"mode effect\" refers to:",
    opts: ["Systematic differences in responses caused by using different data collection modes (e.g., phone vs. face-to-face)","The statistical mode of the response distribution","The impact of question ordering on responses","The effect of using multiple enumerators in one area"],
    correct: 0,
    explanation: "Mode effect is the systematic difference in survey responses attributable to the data collection mode used — due to factors like interviewer presence, social desirability, or response layout."
  },
  {
    comp: "Survey Methodology", sub: "Non-sampling Error", diff: "Hard",
    q: "Acquiescence bias in surveys occurs when respondents:",
    opts: ["Refuse to answer sensitive questions","Tend to agree with statements regardless of their true opinion","Select answers randomly to finish the survey faster","Provide different answers to the same question at different times"],
    correct: 1,
    explanation: "Acquiescence bias (yes-saying) is a systematic response style where respondents agree with statements irrespective of content, inflating agreement rates."
  },

  // ─────────────────── SAMPLING ───────────────────
  {
    comp: "Sampling", sub: "Basic Concepts", diff: "Easy",
    q: "What is a \"sampling frame\"?",
    opts: ["The physical boundary map of the survey area","The final set of questionnaire questions","A complete list of all population units from which the sample is actually drawn","The margin of error of the estimates"],
    correct: 2,
    explanation: "A sampling frame is the operational list of all units in the target population. The quality of the frame (coverage, currency) directly affects the validity of the sample."
  },
  {
    comp: "Sampling", sub: "Sampling Methods", diff: "Easy",
    q: "In Simple Random Sampling (SRS), every unit in the population has:",
    opts: ["Zero chance of being selected","A probability proportional to its size","A chance determined by the enumerator","An equal and independent chance of being selected"],
    correct: 3,
    explanation: "Simple Random Sampling gives every unit an equal and independent probability of selection, making it the most basic probability sampling method."
  },
  {
    comp: "Sampling", sub: "Sampling Methods", diff: "Medium",
    q: "Which sampling method is most appropriate when the population is naturally divided into distinct non-overlapping subgroups?",
    opts: ["Stratified Sampling","Simple Random Sampling","Convenience Sampling","Snowball Sampling"],
    correct: 0,
    explanation: "Stratified sampling divides the population into homogeneous strata before drawing samples within each, exploiting natural divisions to increase precision."
  },
  {
    comp: "Sampling", sub: "Sampling Methods", diff: "Medium",
    q: "Systematic sampling selects units by:",
    opts: ["Choosing every unit in the population","Choosing a random start then selecting every k-th unit thereafter","Randomly selecting entire clusters","Selecting units based on researcher judgment"],
    correct: 1,
    explanation: "In systematic sampling, a random start is chosen from 1 to k (sampling interval), then every k-th unit is selected. It is efficient and easy to implement in the field."
  },
  {
    comp: "Sampling", sub: "Advanced Application", diff: "Hard",
    q: "In stratified sampling, strata should ideally be formed such that:",
    opts: ["Units within strata are heterogeneous","Units across all strata are identical","Units within each stratum are homogeneous and strata differ from each other","All strata have equal sample sizes"],
    correct: 2,
    explanation: "Good strata are internally homogeneous (similar units within) and differ from other strata. This maximizes precision by reducing within-stratum variance."
  },
  {
    comp: "Sampling", sub: "Basic Concepts", diff: "Hard",
    q: "Non-response bias in a sample survey is best described as:",
    opts: ["Errors made by respondents while answering questions","The difference between sample mean and population mean due to chance alone","The fraction of questionnaires returned incomplete","The systematic difference between respondents and non-respondents on the survey variable"],
    correct: 3,
    explanation: "Non-response bias occurs when those who respond systematically differ from those who do not on the survey variable, causing estimates to be biased even with a properly designed sample."
  },

  // ─────────────────── CAPI ───────────────────
  {
    comp: "CAPI", sub: "App Navigation", diff: "Easy",
    q: "What does CAPI stand for in official survey operations?",
    opts: ["Computer Assisted Personal Interviewing","Central Administrative Public Index","Cluster Adaptive Probability Interview","Coded Automated Print Instrument"],
    correct: 0,
    explanation: "CAPI stands for Computer Assisted Personal Interviewing — enumerators use a device or app to conduct and record interviews in digital form."
  },
  {
    comp: "CAPI", sub: "Offline Sync", diff: "Easy",
    q: "In CAPI-based surveys, what is the primary purpose of offline synchronization?",
    opts: ["To reduce respondent burden","To allow data capture without live connectivity and upload later","To skip data validation checks in the field","To auto-generate survey questions from the server"],
    correct: 1,
    explanation: "Offline sync allows enumerators to collect data in areas with poor connectivity, storing responses locally and uploading them once a connection is available."
  },
  {
    comp: "CAPI", sub: "Data Validation Rules", diff: "Medium",
    q: "Which is a key advantage of built-in validation rules in CAPI over paper-based surveys?",
    opts: ["They increase interviewer bias","They allow respondents to skip all questions","They catch logically impossible or out-of-range answers in real time before submission","They eliminate the need for a sampling frame entirely"],
    correct: 2,
    explanation: "CAPI validation rules catch errors such as impossible values and skip logic violations at the point of entry, preventing them from entering the dataset and reducing post-collection editing work."
  },
  {
    comp: "CAPI", sub: "Data Validation Rules", diff: "Medium",
    q: "Skip logic in a CAPI questionnaire is used to:",
    opts: ["Skip the interview if the respondent is unavailable","Send completed data to headquarters automatically","Delete invalid records from the dataset","Automatically route the enumerator to the next relevant question based on a prior answer"],
    correct: 3,
    explanation: "Skip logic (conditional branching) directs the enumerator to appropriate follow-up questions based on previous responses, reducing irrelevant questions and respondent burden."
  },
  {
    comp: "CAPI", sub: "Offline Sync", diff: "Hard",
    q: "A CAPI application flags a \"sync conflict\" during upload. What is the most likely cause?",
    opts: ["The same record was edited on two offline devices independently","The device battery is critically low","The survey server is temporarily offline","The enumerator submitted the same form twice online"],
    correct: 0,
    explanation: "Sync conflicts arise when the same record has been independently modified on more than one offline device. Resolution requires a defined merge or override policy to maintain data integrity."
  },

  // ─────────────────── FIELD PROCEDURES ───────────────────
  {
    comp: "Field Procedures", sub: "Quality Checks", diff: "Easy",
    q: "What is the main goal of a pilot survey?",
    opts: ["To finalize publication tables","To test questionnaire design and field logistics before full rollout","To replace the main survey entirely","To calculate final sampling weights"],
    correct: 1,
    explanation: "A pilot survey is a small-scale trial run to identify and fix problems in the questionnaire, training, and logistics before committing to full-scale data collection."
  },
  {
    comp: "Field Procedures", sub: "Respondent Protocol", diff: "Easy",
    q: "If a selected household is absent at the first visit, the enumerator should:",
    opts: ["Replace them immediately with a neighboring household","Record a refusal and close the case","Schedule a callback visit on a different day as per protocol","Leave a blank questionnaire for self-completion"],
    correct: 2,
    explanation: "Standard field procedure requires callback visits (typically at least 3 attempts at different times) before a household can be treated as non-contact and potentially substituted."
  },
  {
    comp: "Field Procedures", sub: "Quality Checks", diff: "Medium",
    q: "A field officer notices inconsistent responses across enumerators for the same question. The most appropriate first action is:",
    opts: ["Discard all affected data immediately","Change the survey instrument immediately","Ignore it since sample size is large enough to absorb errors","Conduct a quality audit and arrange re-training if needed"],
    correct: 3,
    explanation: "Inconsistent inter-enumerator responses usually indicate a training or protocol issue, best addressed by a quality audit to identify the cause followed by targeted re-training."
  },
  {
    comp: "Field Procedures", sub: "Escalation Process", diff: "Medium",
    q: "When should a field enumerator escalate an issue to their supervisor?",
    opts: ["When they encounter situations outside standard procedure that they cannot resolve independently","Only at the end of the entire survey period","Whenever any respondent refuses to answer any question","When they have completed exactly 50% of their assigned workload"],
    correct: 0,
    explanation: "Escalation to a supervisor is required for exceptional situations — access barriers, respondent safety concerns, data anomalies, or any case outside standard procedure."
  },
  {
    comp: "Field Procedures", sub: "Escalation Process", diff: "Hard",
    q: "In large-scale official surveys, back-checking (re-verification) of interviews is used primarily to:",
    opts: ["Re-interview every respondent to obtain a second dataset","Detect fabricated or falsified responses by re-contacting a random subsample","Replace all incomplete questionnaires with imputed values","Calculate the confidence interval of the final estimates"],
    correct: 1,
    explanation: "Back-checking re-contacts a random subset of completed interviews to verify they actually occurred and responses are genuine — a key fraud-deterrence and quality-control mechanism."
  },

  // ─────────────────── FIELD PROTOCOLS ───────────────────
  {
    comp: "Field Protocols", sub: "Supervision Checklist", diff: "Easy",
    q: "Which document guides a field supervisor's daily quality control activities?",
    opts: ["The published survey report","The national sampling frame","The supervision checklist","The enumerator training schedule"],
    correct: 2,
    explanation: "The supervision checklist is the operational guide for supervisors to perform daily checks — verifying completeness, consistency, and protocol adherence across their team's work."
  },
  {
    comp: "Field Protocols", sub: "Route Planning", diff: "Medium",
    q: "Effective field route planning for enumerators primarily aims to:",
    opts: ["Minimize the number of questionnaires collected","Reduce the number of supervisors required","Ensure each enumerator covers only urban areas","Maximize geographic coverage while minimizing travel time and cost"],
    correct: 3,
    explanation: "Efficient route planning optimizes coverage of all assigned sampling units against travel constraints, improving both productivity and respondent contact rates."
  },
  {
    comp: "Field Protocols", sub: "Supervision Checklist", diff: "Hard",
    q: "What is the purpose of a \"field edit\" check in official surveys?",
    opts: ["To review completed questionnaires for obvious errors while the enumerator is still near the respondent","To delete invalid records from the central database","To apply statistical imputation to missing values","To verify the sampling frame is current and complete"],
    correct: 0,
    explanation: "Field edits are on-the-spot reviews of questionnaires while the enumerator is still in the area, enabling immediate correction of errors before leaving — far less costly than post-hoc correction."
  },

  // ─────────────────── SUPERVISION ───────────────────
  {
    comp: "Supervision", sub: "Team Coordination", diff: "Easy",
    q: "What is a key responsibility of a field supervisor during data collection?",
    opts: ["Completing questionnaires on behalf of absent enumerators","Monitoring enumerator performance and ensuring protocol compliance","Drafting and publishing the survey results","Defining the national sampling frame"],
    correct: 1,
    explanation: "Field supervisors oversee their team of enumerators, monitor performance, resolve field issues, and ensure data quality through compliance checks and back-checking."
  },
  {
    comp: "Supervision", sub: "Quality Audit", diff: "Medium",
    q: "Quality audits of field data should ideally be conducted:",
    opts: ["Only at the end of the entire data collection phase","Only after data has been entered into the central database","Continuously throughout the field period to catch errors early","Once per month regardless of field progress"],
    correct: 2,
    explanation: "Continuous auditing during the field period enables early detection and correction of systematic errors, preventing accumulation of quality problems that are costly to correct later."
  },
  {
    comp: "Supervision", sub: "Quality Audit", diff: "Hard",
    q: "An unusually low refusal rate from one enumerator during a quality audit is best interpreted as:",
    opts: ["Evidence the enumerator is performing exceptionally well","A statistical outlier of no practical significance","Proof that respondents in that area are highly cooperative","A potential indicator of data fabrication requiring investigation"],
    correct: 3,
    explanation: "An anomalously low refusal rate can signal an enumerator is fabricating interviews rather than conducting them. This must be investigated through immediate back-checking."
  },

  // ─────────────────── STATISTICAL ANALYSIS ───────────────────
  {
    comp: "Statistical Analysis", sub: "Descriptive Stats", diff: "Easy",
    q: "Which measure of central tendency is most affected by extreme outliers?",
    opts: ["Mean","Mode","Median","Range"],
    correct: 0,
    explanation: "The arithmetic mean incorporates every data value, so extreme outliers pull it disproportionately in their direction. The median is resistant to outliers."
  },
  {
    comp: "Statistical Analysis", sub: "Descriptive Stats", diff: "Easy",
    q: "Standard deviation measures:",
    opts: ["The most frequent value in the dataset","The average distance of data points from the mean","The middle value when data is sorted in order","The difference between the maximum and minimum values"],
    correct: 1,
    explanation: "Standard deviation quantifies the average spread of observations around the mean. A larger standard deviation indicates greater variability in the data."
  },
  {
    comp: "Statistical Analysis", sub: "Inferential Stats", diff: "Medium",
    q: "A p-value of 0.03 in a hypothesis test (α = 0.05) means:",
    opts: ["There is a 3% probability that the null hypothesis is true","The result is not statistically significant at the 5% level","We reject the null hypothesis because p < α","The effect size is necessarily large"],
    correct: 2,
    explanation: "When p < α, the evidence against the null hypothesis is sufficiently strong that we reject it. Here p = 0.03 < 0.05, so we reject H₀ at the 5% significance level."
  },
  {
    comp: "Statistical Analysis", sub: "Inferential Stats", diff: "Medium",
    q: "A 95% confidence interval means:",
    opts: ["There is a 95% probability the true parameter is in this specific interval","95% of respondents agree with the estimate","Only 5% of data points fall outside the interval","If sampling were repeated many times, 95% of such intervals would contain the true parameter"],
    correct: 3,
    explanation: "A 95% CI is a frequentist concept: if the study were repeated many times under identical conditions, approximately 95% of the resulting intervals would contain the true population parameter."
  },
  {
    comp: "Statistical Analysis", sub: "Inferential Stats", diff: "Hard",
    q: "Which test is most appropriate for comparing proportions across more than two independent groups?",
    opts: ["Chi-square test of independence","Paired t-test","Pearson correlation coefficient","One-sample z-test"],
    correct: 0,
    explanation: "The Chi-square test of independence tests for associations between categorical variables across multiple groups, making it appropriate for comparing proportions in a contingency table."
  },
  {
    comp: "Statistical Analysis", sub: "Descriptive Stats", diff: "Hard",
    q: "Positive skewness in a dataset indicates:",
    opts: ["Most values are above the mean with a long left tail","A long right tail — a few very high values pull the mean above the median","The mean, median, and mode are equal","Uniform distribution with no outliers"],
    correct: 1,
    explanation: "Positive (right) skewness means a few very high values create a long right tail. The mean is pulled higher than the median, which is higher than the mode: Mean > Median > Mode."
  },

  // ─────────────────── SAMPLING ALGORITHMS ───────────────────
  {
    comp: "Sampling Algorithms", sub: "Cluster Sampling", diff: "Easy",
    q: "What is a \"cluster\" in cluster sampling?",
    opts: ["A single randomly drawn respondent","A computer algorithm for generating random numbers","A naturally occurring group of population units selected as a whole sampling unit","A stratum defined by income level"],
    correct: 2,
    explanation: "A cluster is a pre-existing group of population units (e.g., a village, school, or city block) selected as a whole, after which all or sampled units within chosen clusters are surveyed."
  },
  {
    comp: "Sampling Algorithms", sub: "Cluster Sampling", diff: "Medium",
    q: "Cluster sampling is most efficient when:",
    opts: ["Population units within clusters are homogeneous","The sample size required is very small","There is no travel cost in reaching different areas","Clusters are internally heterogeneous and similar to each other"],
    correct: 3,
    explanation: "Cluster sampling minimizes design effect when each cluster mirrors the diversity of the whole population (internally heterogeneous) and clusters resemble one another."
  },
  {
    comp: "Sampling Algorithms", sub: "PPS Sampling", diff: "Medium",
    q: "Which best describes Probability Proportional to Size (PPS) sampling?",
    opts: ["Units are selected with probability proportional to a defined size measure (e.g., population count)","Every unit has an equal chance of selection","Units are selected by geographic proximity to a central point","Sampling stops once a predetermined quota is reached"],
    correct: 0,
    explanation: "PPS sampling assigns selection probabilities proportional to a size measure, giving larger units a greater selection probability. When a size measure correlates with the survey variable, this greatly improves efficiency."
  },
  {
    comp: "Sampling Algorithms", sub: "Stratified Sampling", diff: "Medium",
    q: "In proportional stratified sampling, the sample allocation from each stratum is determined by:",
    opts: ["Equal allocation — the same fixed number from every stratum","Each stratum's proportion of the total population size","The researcher's personal judgment","The within-stratum sampling variance"],
    correct: 1,
    explanation: "Proportional allocation draws a sample from each stratum proportional to that stratum's share of the total population, ensuring the sample mirrors the population structure."
  },
  {
    comp: "Sampling Algorithms", sub: "PPS Sampling", diff: "Hard",
    q: "The main advantage of PPS over equal-probability sampling is:",
    opts: ["It always produces a larger sample size","It eliminates the need for a sampling frame","It can substantially reduce variance of estimates when size measure correlates with the survey variable","It is always easier to explain to enumerators"],
    correct: 2,
    explanation: "PPS reduces variance when the size measure is correlated with the outcome variable by giving appropriately higher weight to larger, more variable units in the selection process."
  },

  // ─────────────────── DATA INTERPRETATION ───────────────────
  {
    comp: "Data Interpretation", sub: "Cross-tabulation", diff: "Easy",
    q: "A cross-tabulation (contingency table) is used to:",
    opts: ["Calculate the mean of a single continuous variable","Measure the spread of a single distribution","Plot individual data points on a scatter graph","Display the joint frequency distribution of two or more categorical variables simultaneously"],
    correct: 3,
    explanation: "A cross-tabulation shows the joint frequency distribution of two or more categorical variables in a matrix form, enabling analysis of associations and patterns between them."
  },
  {
    comp: "Data Interpretation", sub: "Trend Analysis", diff: "Easy",
    q: "A bar chart is most appropriate for:",
    opts: ["Comparing quantities across distinct categories","Showing the change in a continuous variable over time","Displaying the relationship between two continuous variables","Showing the proportion of parts within a whole as wedges"],
    correct: 0,
    explanation: "Bar charts are designed for comparing discrete quantities across categories. For time trends, line charts are preferred; for part-to-whole proportions, pie or stacked charts are used."
  },
  {
    comp: "Data Interpretation", sub: "Trend Analysis", diff: "Medium",
    q: "GDP grew from ₹100 crore in 2020 to ₹121 crore in 2022. What is the approximate CAGR over 2 years?",
    opts: ["21%","10%","10.5%","5%"],
    correct: 1,
    explanation: "CAGR = (121/100)^(1/2) – 1 = 1.10 – 1 = 10%. A 10% annual growth rate compounded over 2 years produces 21% total growth, so CAGR = 10%."
  },
  {
    comp: "Data Interpretation", sub: "Cross-tabulation", diff: "Medium",
    q: "In a two-way contingency table, \"marginal totals\" refer to:",
    opts: ["The diagonal cells of the table","The smallest and largest observed cell frequencies","The row totals and column totals representing the marginal distribution of each variable","The residuals from a chi-square test"],
    correct: 2,
    explanation: "Marginal totals are the row and column totals in a contingency table, showing the overall (marginal) distribution of each variable independently of the other."
  },
  {
    comp: "Data Interpretation", sub: "Trend Analysis", diff: "Hard",
    q: "A sudden structural break in a time series most likely indicates:",
    opts: ["Normal seasonal variation in the data","Statistical imputation applied to an isolated group of missing values","A sampling error confined to one data collection period","A policy change, external shock, or change in measurement methodology affecting the series"],
    correct: 3,
    explanation: "A structural break — an abrupt, sustained change in a time series' level or trend — usually signals a real-world event (policy intervention, economic shock) or a change in measurement methodology."
  },

  // ─────────────────── DATA PROCESSING ───────────────────
  {
    comp: "Data Processing", sub: "Data Cleaning", diff: "Easy",
    q: "What is the first step in data cleaning after receiving raw survey data?",
    opts: ["Identify and handle missing values, duplicate records, and out-of-range values","Run regression analysis immediately","Publish preliminary estimates","Apply final sampling weights"],
    correct: 0,
    explanation: "The initial step in data cleaning is identifying quality issues — missing data, duplicates, impossible values — before any analysis, to ensure the data is fit for use."
  },
  {
    comp: "Data Processing", sub: "Data Cleaning", diff: "Easy",
    q: "A record showing Age = -5 is an example of:",
    opts: ["A valid rare observation that should be retained","An out-of-range / impossible value requiring correction or treatment as missing","A correctly coded value for unknown age","A statistical outlier that should be retained without review"],
    correct: 1,
    explanation: "A negative age is logically impossible and represents a data entry error. Such values must be investigated and corrected or marked as missing before any analysis."
  },
  {
    comp: "Data Processing", sub: "Imputation", diff: "Medium",
    q: "Which technique is standard for correcting non-response in survey estimates?",
    opts: ["Reducing the size of the sampling frame","Removing all non-responding units from the dataset","Sampling weight adjustment or imputation of missing values","Increasing questionnaire length to force responses"],
    correct: 2,
    explanation: "Weight adjustment (reweighting respondents to compensate for non-respondents) and imputation (filling plausible values for missing data) are the standard methods for addressing non-response bias."
  },
  {
    comp: "Data Processing", sub: "Imputation", diff: "Medium",
    q: "Mean imputation — replacing missing values with the variable mean — is problematic because:",
    opts: ["It artificially increases the sample size","It requires an AI model to implement correctly","It is computationally too expensive for large datasets","It reduces the variance of the imputed variable, distorting distributional estimates and standard errors"],
    correct: 3,
    explanation: "Mean imputation compresses values toward the mean, artificially reducing variance below its true level. This distorts frequency distributions, correlations, and standard errors in subsequent analyses."
  },
  {
    comp: "Data Processing", sub: "Data Cleaning", diff: "Hard",
    q: "In official statistics, \"deduplication\" of a dataset means:",
    opts: ["Identifying and removing duplicate records that represent the same real-world unit","Creating multiple backup copies of data files","Splitting one dataset into two equal halves for analysis","Normalizing all variable scales to a common range"],
    correct: 0,
    explanation: "Deduplication identifies records representing the same entity (e.g., a household surveyed twice) and retains only one, preventing inflated counts or biased estimates."
  },
  {
    comp: "Data Processing", sub: "Imputation", diff: "Hard",
    q: "Multiple Imputation (MI) differs from single imputation primarily because MI:",
    opts: ["Deletes all records with any missing values before analysis","Generates multiple completed datasets and pools results, properly accounting for uncertainty in imputed values","Replaces every missing value with the variable mean automatically","Applies imputation only after the final analysis is complete"],
    correct: 1,
    explanation: "Multiple Imputation generates M completed datasets by drawing from the predictive distribution of missing values, analyzes each, and pools results using Rubin's rules to correctly reflect imputation uncertainty in standard errors."
  },

  // ─────────────────── SURVEY METHODOLOGY ───────────────────
  {
    comp: "Survey Methodology", sub: "Questionnaire Design", diff: "Easy",
    q: "Closed-ended questions are best suited for:",
    opts: ["Exploring open-ended opinions in depth","Recording free-text respondent narratives","Collecting standardized, easily-tabulated responses from predefined categories","Avoiding the need for a codebook"],
    correct: 2,
    explanation: "Closed-ended questions restrict answers to predefined categories, making responses standardized and easy to code and tabulate."
  },
  {
    comp: "Survey Methodology", sub: "Survey Design Principles", diff: "Easy",
    q: "A pilot/pre-test of a questionnaire is conducted to:",
    opts: ["Finalize the sample size after data collection","Replace the need for enumerator training","Reduce the survey budget","Identify unclear wording, flow issues, and problems before the full survey"],
    correct: 3,
    explanation: "Pre-testing on a small group surfaces wording, sequencing and comprehension problems before the instrument is used at scale."
  },
  {
    comp: "Survey Methodology", sub: "Non-sampling Error", diff: "Easy",
    q: "Non-sampling errors can occur:",
    opts: ["Even in a complete census","Only when sample size is small","Only in probability samples","Only during data entry"],
    correct: 0,
    explanation: "Non-sampling errors (coverage, response, processing, non-response) can occur even in a full census, since they arise from measurement and operational issues, not from the act of sampling."
  },
  {
    comp: "Survey Methodology", sub: "Questionnaire Design", diff: "Medium",
    q: "Leading questions are problematic mainly because they:",
    opts: ["Take longer for respondents to answer","Push respondents toward a particular answer, reducing validity","Are harder to code into a database","Cannot be translated into other languages"],
    correct: 1,
    explanation: "A leading question is phrased to suggest a particular answer, biasing responses away from the respondent's true opinion."
  },
  {
    comp: "Survey Methodology", sub: "Survey Design Principles", diff: "Medium",
    q: "Question order effects occur when:",
    opts: ["Two questions use different fonts","The survey has more than 20 questions","An earlier question influences how a respondent answers a later one","Interviewers ask questions out of numerical order by mistake"],
    correct: 2,
    explanation: "Order effects arise when the context created by earlier questions shapes how respondents interpret and answer subsequent questions."
  },
  {
    comp: "Survey Methodology", sub: "Non-sampling Error", diff: "Medium",
    q: "Interviewer effect (interviewer bias) refers to:",
    opts: ["Random variation in answers unrelated to the interviewer","The rounding error in tabulated statistics","The error from using the wrong sampling frame","Systematic differences in responses caused by the interviewer's characteristics or behavior"],
    correct: 3,
    explanation: "Interviewer effect is a form of non-sampling error where the interviewer's presence, tone, or characteristics systematically influence respondent answers."
  },
  {
    comp: "Survey Methodology", sub: "Questionnaire Design", diff: "Medium",
    q: "Double-barreled questions are a design flaw because they:",
    opts: ["Ask about two distinct issues in a single question, making the response ambiguous","Take up two lines of space on the form","Require two enumerators to administer","Have exactly two answer options"],
    correct: 0,
    explanation: "A double-barreled question combines two separate issues into one, so a single answer cannot be unambiguously attributed to either issue."
  },
  {
    comp: "Survey Methodology", sub: "Survey Design Principles", diff: "Medium",
    q: "Face validity of a questionnaire refers to:",
    opts: ["Statistical proof that the instrument predicts future outcomes","Whether the questions appear, on the surface, to measure what they are intended to measure","The physical layout and font used on the form","The interviewer's facial expression while asking questions"],
    correct: 1,
    explanation: "Face validity is a subjective judgment of whether an instrument appears to measure its intended construct, based on its content at face value."
  },
  {
    comp: "Survey Methodology", sub: "Non-sampling Error", diff: "Hard",
    q: "The Total Survey Error (TSE) framework treats accuracy as arising from:",
    opts: ["Sampling error alone","Only the errors introduced during data entry","Sampling error plus a range of non-sampling errors such as coverage, measurement, non-response and processing error","Only the bias caused by the choice of estimator"],
    correct: 2,
    explanation: "The Total Survey Error framework decomposes overall survey error into sampling error and multiple sources of non-sampling error, all of which affect accuracy."
  },
  {
    comp: "Survey Methodology", sub: "Survey Design Principles", diff: "Hard",
    q: "Social desirability bias is most likely to distort responses on questions about:",
    opts: ["Age and date of birth","The name of the village or district","The number of household members","Sensitive behaviors such as income under-reporting or illegal activity"],
    correct: 3,
    explanation: "Social desirability bias occurs when respondents answer in a way they believe is more socially acceptable, which is most pronounced for sensitive or stigmatized topics."
  },
  {
    comp: "Survey Methodology", sub: "Questionnaire Design", diff: "Hard",
    q: "Telescoping error in recall-based survey questions refers to respondents:",
    opts: ["Misplacing the timing of an event, reporting it as happening more recently or further back than it actually did","Refusing to answer questions about the past","Answering questions faster than expected","Confusing two different survey modules"],
    correct: 0,
    explanation: "Telescoping is a recall error where respondents shift the perceived timing of an event, commonly reporting past events as more recent."
  },
  {
    comp: "Survey Methodology", sub: "Non-sampling Error", diff: "Hard",
    q: "Measurement error in survey data is best defined as:",
    opts: ["The difference between the sample estimate and the true population value due to only some units being sampled","The difference between a respondent's recorded answer and the true value of the characteristic being measured","The rounding applied during data tabulation","The variance introduced by using unequal selection probabilities"],
    correct: 1,
    explanation: "Measurement error is the discrepancy between the recorded response and the respondent's true value, arising from question wording, recall, or instrument issues rather than the sampling process."
  },
  {
    comp: "Survey Methodology", sub: "Survey Design Principles", diff: "Hard",
    q: "A well-designed questionnaire generally places sensitive questions:",
    opts: ["At the very start, before rapport is built","In a separate survey conducted by a different agency","Later in the interview, after rapport has been established with the respondent","Only in the offline paper version"],
    correct: 2,
    explanation: "Sensitive questions are typically placed later in the questionnaire once the interviewer has built rapport, which tends to improve response rates and honesty."
  },

  // ─────────────────── SAMPLING ───────────────────
  {
    comp: "Sampling", sub: "Basic Concepts", diff: "Easy",
    q: "The 'population' in a statistical survey refers to:",
    opts: ["Only the people who respond to the survey","The geographic area covered by one district","The number of enumerators employed","The complete set of units about which conclusions are to be drawn"],
    correct: 3,
    explanation: "The population is the entire, well-defined set of units that the survey aims to describe or draw conclusions about."
  },
  {
    comp: "Sampling", sub: "Basic Concepts", diff: "Easy",
    q: "A 'sampling unit' is:",
    opts: ["The individual element or group selected at a given stage of sampling","The final published statistical report","The organization conducting the survey","The software used for randomization"],
    correct: 0,
    explanation: "A sampling unit is the entity (an individual, household, village, etc.) selected during any given stage of the sampling process."
  },
  {
    comp: "Sampling", sub: "Sampling Methods", diff: "Easy",
    q: "Convenience sampling is generally avoided in official statistics because it:",
    opts: ["Is too expensive to implement","Does not give every population unit a known probability of selection, leading to potential bias","Requires a sampling frame","Takes longer than probability sampling"],
    correct: 1,
    explanation: "Convenience sampling selects units based on ease of access rather than known selection probabilities, so it cannot support statistically valid inference and is prone to bias."
  },
  {
    comp: "Sampling", sub: "Basic Concepts", diff: "Medium",
    q: "Sampling error is best described as:",
    opts: ["A mistake made by the enumerator while asking questions","An error caused by faulty survey equipment","The natural variation between a sample estimate and the true population value that arises because only part of the population is observed","The bias caused by non-response"],
    correct: 2,
    explanation: "Sampling error is the inherent difference between a sample-based estimate and the population parameter, arising purely from observing a subset rather than the whole population."
  },
  {
    comp: "Sampling", sub: "Sampling Methods", diff: "Medium",
    q: "Multi-stage sampling is typically used in large official surveys mainly to:",
    opts: ["Guarantee a zero sampling error","Ensure every household is surveyed exactly once nationwide","Eliminate the need for a sampling frame at any stage","Reduce fieldwork cost and logistical complexity by progressively selecting smaller units within larger ones"],
    correct: 3,
    explanation: "Multi-stage sampling reduces travel and listing costs compared to sampling scattered individual units directly from the full population."
  },
  {
    comp: "Sampling", sub: "Sampling Algorithms", diff: "Medium",
    q: "In quota sampling, interviewers:",
    opts: ["Fill predetermined quotas for subgroups (e.g., age, gender) using non-random selection within each quota","Randomly select respondents using a random number table","Select every 10th person on a list","Sample only from a computer-generated frame"],
    correct: 0,
    explanation: "Quota sampling sets target numbers for subgroups but leaves the actual selection of individuals within each quota to the interviewer's judgment, making it non-probabilistic."
  },
  {
    comp: "Sampling", sub: "Advanced Application", diff: "Medium",
    q: "Design effect (deff) in complex sample surveys measures:",
    opts: ["The visual layout quality of the questionnaire","The ratio of the variance under the actual (complex) sample design to the variance of a simple random sample of the same size","The percentage of missing data in the sample","The number of sampling stages used"],
    correct: 1,
    explanation: "The design effect quantifies how much more (or less) variance a complex design produces compared to a simple random sample of equal size."
  },
  {
    comp: "Sampling", sub: "Basic Concepts", diff: "Medium",
    q: "Sampling with replacement means:",
    opts: ["A selected unit is removed from the population before the next draw","Only replacement households are surveyed if the original refuses","A selected unit is returned to the population and can be selected again","Sample units are replaced by administrative records"],
    correct: 2,
    explanation: "In sampling with replacement, each selected unit is returned to the population pool, so it remains eligible for selection again in later draws."
  },
  {
    comp: "Sampling", sub: "Sampling Algorithms", diff: "Hard",
    q: "A key drawback of quota sampling compared to stratified random sampling is:",
    opts: ["It cannot use subgroup categories such as age or gender","It cannot be used for face-to-face interviews","It always requires a larger sample size","It does not allow calculation of valid standard errors because selection is not probability-based"],
    correct: 3,
    explanation: "Because quota sampling does not use random selection within quotas, classical probability-based measures of sampling error cannot be validly computed from it."
  },
  {
    comp: "Sampling", sub: "Advanced Application", diff: "Hard",
    q: "In two-stage sampling with unequal-sized primary sampling units (PSUs), selecting PSUs with probability proportional to size and a fixed number of units per PSU chiefly helps to:",
    opts: ["Guarantee a self-weighting sample with roughly equal overall selection probabilities across units","Eliminate the need for a second-stage sampling frame","Remove all non-sampling error","Increase the total sample size automatically"],
    correct: 0,
    explanation: "Combining PPS selection of PSUs with a fixed sub-sample size per PSU produces approximately equal overall selection probabilities for every final-stage unit, a self-weighting design."
  },
  {
    comp: "Sampling", sub: "Sampling Methods", diff: "Hard",
    q: "Replicated (interpenetrating) sub-sampling is primarily used to:",
    opts: ["Reduce the total cost of the survey to zero","Provide an independent, practical way to estimate sampling variance from the sample itself","Avoid the need for a sampling frame altogether","Guarantee a 100% response rate"],
    correct: 1,
    explanation: "By dividing the sample into random, independent replicates that estimate the same parameter, replicated sub-sampling allows sampling variance to be estimated directly from the spread across replicates."
  },
  {
    comp: "Sampling", sub: "Basic Concepts", diff: "Hard",
    q: "A sampling frame that omits certain eligible population units (undercoverage) leads to:",
    opts: ["Higher sampling error only, no bias","Only an increase in the cost of the survey","A coverage bias, since the omitted units have zero chance of selection regardless of the sampling method used","An automatic reduction in non-response"],
    correct: 2,
    explanation: "Undercoverage of the frame is a form of non-sampling (coverage) bias — omitted units can never be selected, independent of how good the sampling method itself is."
  },
  {
    comp: "Sampling", sub: "Advanced Application", diff: "Hard",
    q: "Optimal (Neyman) allocation in stratified sampling assigns larger sample sizes to strata that have:",
    opts: ["Smaller population size and smaller variance","The lowest data collection cost regardless of variance or size","Only larger population size, regardless of variance","Larger population size and/or larger internal variance"],
    correct: 3,
    explanation: "Neyman allocation allocates sample size to each stratum in proportion to both its population size and its internal standard deviation, minimizing overall variance for a given total sample size."
  },

  // ─────────────────── CAPI ───────────────────
  {
    comp: "CAPI", sub: "App Navigation", diff: "Easy",
    q: "In a CAPI application, the 'case list' typically shows:",
    opts: ["The assigned households/units and their current interview status","The list of enumerators assigned to a project","The software version history","The list of survey questions in order"],
    correct: 0,
    explanation: "The case list is the enumerator's worklist, showing each assigned unit and whether it is pending, in-progress, or completed."
  },
  {
    comp: "CAPI", sub: "Offline Sync", diff: "Easy",
    q: "CAPI applications are typically designed to work offline mainly because:",
    opts: ["Internet is never available anywhere","Field areas often have poor or no network connectivity, so data must be captured locally and synced later","Offline mode is required by law in all countries","It removes the need for any data validation"],
    correct: 1,
    explanation: "Rural and remote field locations frequently lack reliable connectivity, so CAPI apps capture data on the device and upload it once a connection is available."
  },
  {
    comp: "CAPI", sub: "Data Validation Rules", diff: "Easy",
    q: "A range check in a CAPI form (e.g., age must be between 0 and 120) is an example of:",
    opts: ["A skip pattern","A sampling rule","A built-in data validation rule that flags implausible entries at the point of entry","A translation setting"],
    correct: 2,
    explanation: "Range checks are validation rules that constrain acceptable values, catching clearly implausible entries as soon as they are typed."
  },
  {
    comp: "CAPI", sub: "App Navigation", diff: "Easy",
    q: "The main purpose of a 'progress indicator' in a CAPI questionnaire is to show:",
    opts: ["The enumerator's salary details","The name of the survey supervisor","The GPS coordinates of the household","How much of the interview has been completed"],
    correct: 3,
    explanation: "A progress indicator gives the enumerator a visual sense of how far along the interview is, useful for managing interview length and respondent expectations."
  },
  {
    comp: "CAPI", sub: "App Navigation", diff: "Medium",
    q: "If an enumerator needs to pause an interview partway through and resume later, the CAPI app should:",
    opts: ["Save the partial responses locally and allow the interview to be resumed from where it left off","Discard all entered answers automatically","Force the household to be marked as a refusal","Require the enumerator to restart the entire questionnaire from question 1"],
    correct: 0,
    explanation: "Well-designed CAPI apps preserve partially completed interviews locally so fieldwork can be paused and resumed without losing already-collected data."
  },
  {
    comp: "CAPI", sub: "Offline Sync", diff: "Medium",
    q: "A 'conflict' during CAPI data synchronization most commonly arises when:",
    opts: ["The device battery is fully charged","The same case has been modified on two different devices or sessions before syncing","The enumerator uses a strong Wi-Fi connection","The survey has fewer than 10 questions"],
    correct: 1,
    explanation: "Sync conflicts typically occur when the same case record is edited in more than one place before the changes are reconciled centrally."
  },
  {
    comp: "CAPI", sub: "Data Validation Rules", diff: "Medium",
    q: "Consistency checks across multiple questions in a CAPI form (e.g., 'age at marriage' cannot exceed 'current age') serve mainly to:",
    opts: ["Speed up data entry time","Reduce the number of questions asked","Catch logically contradictory responses that a single-field range check would miss","Automatically translate the questionnaire"],
    correct: 2,
    explanation: "Consistency (logical) checks compare related answers to catch contradictions that a check on any single field, in isolation, would not detect."
  },
  {
    comp: "CAPI", sub: "App Navigation", diff: "Medium",
    q: "Skip/routing logic embedded in a CAPI questionnaire mainly helps by:",
    opts: ["Automatically calculating the final survey weights","Increasing the sample size needed","Randomizing the order of all questions","Showing or hiding subsequent questions based on earlier answers, so respondents are not asked irrelevant questions"],
    correct: 3,
    explanation: "Skip logic routes respondents past questions that do not apply to them based on prior answers, improving efficiency and respondent experience."
  },
  {
    comp: "CAPI", sub: "Offline Sync", diff: "Medium",
    q: "Best practice for CAPI data security while working offline includes:",
    opts: ["Encrypting locally stored data on the device so it remains protected before synchronization","Leaving all collected data unencrypted on the device until it is convenient to sync","Sharing the device password with respondents","Disabling all passcodes to speed up data entry"],
    correct: 0,
    explanation: "Because offline devices may hold sensitive respondent data for extended periods before syncing, encrypting local storage protects that data if a device is lost or stolen."
  },
  {
    comp: "CAPI", sub: "Data Validation Rules", diff: "Hard",
    q: "A soft (warning) validation versus a hard (blocking) validation in CAPI forms differ in that:",
    opts: ["A soft validation permanently deletes the response, while a hard validation saves it","A soft validation warns the enumerator but allows the entry to proceed if confirmed, while a hard validation prevents proceeding until corrected","Hard validations are only used for offline forms","Soft validations apply only to numeric fields"],
    correct: 1,
    explanation: "Soft/warning checks flag a value as unusual but let the enumerator confirm and continue, while hard checks block progress entirely until the entry is corrected."
  },
  {
    comp: "CAPI", sub: "Offline Sync", diff: "Hard",
    q: "When two edits to the same case conflict during sync, a robust CAPI system typically resolves this by:",
    opts: ["Silently discarding both versions","Always keeping the version with more missing values","Applying a defined conflict-resolution rule (e.g., most recent timestamp or supervisor review) rather than guessing","Blocking all future syncs for that enumerator permanently"],
    correct: 2,
    explanation: "Robust systems use an explicit, auditable rule rather than silently overwriting or guessing which version is correct."
  },
  {
    comp: "CAPI", sub: "App Navigation", diff: "Hard",
    q: "Version control of a CAPI questionnaire (tracking which form version was used for each case) matters most because:",
    opts: ["It looks good in project documentation","It is only relevant for paper-based surveys","It reduces the app's file size","Using mismatched form versions across devices can make responses incomparable or corrupt the data structure during analysis"],
    correct: 3,
    explanation: "If enumerators use different versions of the questionnaire, the resulting data may be structurally inconsistent, so tracking form version per case is essential for correct processing."
  },
  {
    comp: "CAPI", sub: "Data Validation Rules", diff: "Hard",
    q: "Cross-question validation that flags 'number of employed household members' exceeding 'total household members' is an example of:",
    opts: ["A logical consistency check between related fields","A skip pattern","A range check","A duplicate-record check"],
    correct: 0,
    explanation: "This compares two related fields against each other for logical plausibility, the defining feature of a consistency (relational) check rather than a simple single-field range check."
  },
  {
    comp: "CAPI", sub: "Offline Sync", diff: "Hard",
    q: "GPS/geo-coordinate capture combined with offline sync in CAPI surveys is primarily used to:",
    opts: ["Automatically calculate the sample size","Verify that interviews were actually conducted at the assigned location, supporting quality control","Replace the need for a questionnaire","Encrypt the collected data"],
    correct: 1,
    explanation: "Capturing geo-coordinates lets supervisors verify, after sync, that an enumerator was physically present at the assigned sample location."
  },

  // ─────────────────── FIELD PROCEDURES ───────────────────
  {
    comp: "Field Procedures", sub: "Respondent Protocol", diff: "Easy",
    q: "Before beginning an interview, an enumerator should first:",
    opts: ["Ask the most sensitive question to save time","Skip the introduction if the respondent looks busy","Introduce themselves, explain the survey's purpose, and obtain informed consent","Record the interview without informing the respondent"],
    correct: 2,
    explanation: "Standard field protocol requires a proper introduction, explanation of the survey's purpose, and informed consent before data collection begins."
  },
  {
    comp: "Field Procedures", sub: "Quality Checks", diff: "Easy",
    q: "A 'field edit' is best described as a check performed:",
    opts: ["Only after the survey round is fully over","By an external audit agency only","At the office years later","By the enumerator or supervisor shortly after data collection, on the spot or same-day"],
    correct: 3,
    explanation: "Field edits are quick, on-the-spot or same-day reviews of just-collected data, allowing errors to be caught and corrected while the household can still be revisited if needed."
  },
  {
    comp: "Field Procedures", sub: "Escalation Process", diff: "Easy",
    q: "An enumerator encountering a hostile or unsafe situation at a sample household should:",
    opts: ["Prioritize personal safety and report the situation to their supervisor rather than persisting alone","Continue the interview regardless of personal safety","Interview a neighboring household instead without reporting it","Complete the questionnaire using guessed answers"],
    correct: 0,
    explanation: "Field protocol prioritizes enumerator safety; unsafe situations must be reported to a supervisor for guidance rather than handled unilaterally."
  },
  {
    comp: "Field Procedures", sub: "Respondent Protocol", diff: "Easy",
    q: "If a respondent asks how their data will be used, the enumerator should:",
    opts: ["Refuse to answer the question","Truthfully explain the survey's official statistical purpose and confidentiality protections","Make up a convenient answer to save time","End the interview immediately"],
    correct: 1,
    explanation: "Respondents are entitled to a truthful explanation of the survey's purpose and how their confidentiality is protected."
  },
  {
    comp: "Field Procedures", sub: "Respondent Protocol", diff: "Medium",
    q: "If a designated respondent is unavailable at a sampled household, standard protocol requires the enumerator to:",
    opts: ["Immediately substitute the nearest neighboring household","Interview any adult present regardless of eligibility criteria","Attempt scheduled revisits according to the survey's callback protocol before treating the case as non-response","Mark the household as ineligible and move on"],
    correct: 2,
    explanation: "Standard protocol calls for a defined number of scheduled revisit attempts before a case is classified as non-response, avoiding unnecessary loss of sample and substitution bias."
  },
  {
    comp: "Field Procedures", sub: "Quality Checks", diff: "Medium",
    q: "Re-interviewing a small, randomly selected subset of completed cases by a supervisor or independent team is known as:",
    opts: ["Pilot testing","Sampling frame updating","Skip logic","Back-checking"],
    correct: 3,
    explanation: "Back-checking involves independently re-visiting or re-contacting a sample of already-interviewed cases to verify that the original data was collected accurately."
  },
  {
    comp: "Field Procedures", sub: "Escalation Process", diff: "Medium",
    q: "Repeated inconsistent answers from the same enumerator across multiple households, detected during monitoring, should be escalated because it may indicate:",
    opts: ["Possible data fabrication or systematic misunderstanding of the questionnaire that needs investigation","Normal random variation that requires no action","A hardware fault only","A sampling frame error"],
    correct: 0,
    explanation: "A consistent pattern of anomalies tied to one enumerator is a red flag for fabrication or misunderstanding of instructions, warranting supervisory investigation."
  },
  {
    comp: "Field Procedures", sub: "Respondent Protocol", diff: "Medium",
    q: "Obtaining informed consent in an official survey means the respondent:",
    opts: ["Has signed a legally binding employment contract","Understands the survey's purpose, what participation involves, and voluntarily agrees to take part","Has paid a participation fee","Has been guaranteed a specific benefit from the government"],
    correct: 1,
    explanation: "Informed consent means the respondent has been given enough information to understand what participating involves and agrees to it voluntarily."
  },
  {
    comp: "Field Procedures", sub: "Quality Checks", diff: "Medium",
    q: "Spot-checking a sample of completed CAPI interviews for illogical answer patterns (e.g., completing a 60-question interview in 2 minutes) is a way to detect:",
    opts: ["Sampling frame errors","Coverage errors in the population list","Possible fabricated or rushed ('curbstoning') interviews","Errors in the published statistical tables"],
    correct: 2,
    explanation: "Interviews completed implausibly fast relative to their length are a classic red flag for curbstoning — fabricating responses without actually conducting the interview."
  },
  {
    comp: "Field Procedures", sub: "Quality Checks", diff: "Hard",
    q: "In back-checking, a discrepancy rate that exceeds a pre-set tolerance threshold for a specific enumerator should trigger:",
    opts: ["Immediate dismissal without further review","Automatic exclusion of the enumerator's entire dataset with no review","No action, since some discrepancy is always expected","A defined corrective process — such as retraining, a larger back-check sample, or supervisor review — before any final decision"],
    correct: 3,
    explanation: "Quality control protocols generally require investigating root causes through a structured escalation process rather than jumping to an extreme response without review."
  },
  {
    comp: "Field Procedures", sub: "Escalation Process", diff: "Hard",
    q: "A clearly defined escalation matrix in fieldwork primarily serves to:",
    opts: ["Specify who should be notified, and within what timeframe, for different categories of field issues, so responses are consistent and timely","Replace the need for a supervisor entirely","Increase the total number of interviews required","Eliminate the need for informed consent"],
    correct: 0,
    explanation: "An escalation matrix defines clear channels and timeframes for reporting different issue types, ensuring a consistent, predictable response."
  },
  {
    comp: "Field Procedures", sub: "Respondent Protocol", diff: "Hard",
    q: "Confidentiality assurances given to respondents in official statistics mean that:",
    opts: ["Individual responses may be shared with any government department on request","Individual, identifiable responses are protected and only aggregated/anonymized statistics are released publicly","Respondents' names are published alongside survey results for transparency","Confidentiality only applies to sensitive topics, not general demographic data"],
    correct: 1,
    explanation: "Statistical confidentiality means individual respondent data is protected from disclosure; only aggregated or anonymized results are released."
  },
  {
    comp: "Field Procedures", sub: "Quality Checks", diff: "Hard",
    q: "Comparing an enumerator's average interview duration to the survey-wide median duration is a quality-control technique mainly used to detect:",
    opts: ["Sampling frame coverage errors","Errors in questionnaire translation only","Enumerators who may be rushing through or padding interviews relative to typical patterns","GPS malfunction"],
    correct: 2,
    explanation: "Duration-based monitoring flags enumerators whose interview times deviate sharply from the norm, indicating rushing or unusually long interviews worth investigating."
  },
  {
    comp: "Field Procedures", sub: "Escalation Process", diff: "Hard",
    q: "When a field issue is escalated and resolved, best practice requires that the resolution be:",
    opts: ["Kept verbal only, with no written record","Ignored once the immediate issue is closed","Shared publicly with respondents' identities included","Documented, so similar future issues can be handled consistently and the resolution is auditable"],
    correct: 3,
    explanation: "Documenting the resolution creates an auditable record that supports consistent handling of similar future issues and accountability."
  },

  // ─────────────────── FIELD PROTOCOLS ───────────────────
  {
    comp: "Field Protocols", sub: "Route Planning", diff: "Easy",
    q: "The primary goal of planning an enumerator's daily field route in advance is to:",
    opts: ["Minimize unnecessary travel time and ensure all assigned households can realistically be covered","Maximize fuel usage regardless of cost","Avoid visiting any rural areas","Guarantee that no household will refuse to participate"],
    correct: 0,
    explanation: "Route planning aims to sequence visits efficiently so the assigned workload is realistically achievable within the available time, minimizing wasted travel."
  },
  {
    comp: "Field Protocols", sub: "Supervision Checklist", diff: "Easy",
    q: "A field supervision checklist typically includes items to verify:",
    opts: ["The enumerator's personal bank details","That interviews are being conducted correctly and per protocol, such as consent, coverage and question administration","The national GDP figures for the current year","The supervisor's own travel expenses only"],
    correct: 1,
    explanation: "Supervision checklists are process-quality tools focused on verifying that enumerators correctly follow protocol, not unrelated administrative details."
  },
  {
    comp: "Field Protocols", sub: "Route Planning", diff: "Easy",
    q: "Clustering nearby sample households into the same day's route mainly helps to:",
    opts: ["Increase the total distance traveled","Ensure every household is visited on the same day of the week nationwide","Reduce travel time between interviews and make better use of the workday","Avoid the need for a sampling frame"],
    correct: 2,
    explanation: "Grouping geographically close households into the same visit day reduces travel between locations, improving productive interview time."
  },
  {
    comp: "Field Protocols", sub: "Route Planning", diff: "Easy",
    q: "A realistic daily interview target for an enumerator is typically set based on:",
    opts: ["An arbitrary round number with no basis","The total national sample size divided by one","The enumerator's personal preference alone","Average interview duration, travel time between sample points, and available working hours"],
    correct: 3,
    explanation: "Realistic daily targets are derived from operational factors — expected interview length, travel time, and available working hours — rather than being set arbitrarily."
  },
  {
    comp: "Field Protocols", sub: "Supervision Checklist", diff: "Easy",
    q: "'Checking that consent was properly obtained' on a supervision checklist protects:",
    opts: ["The respondent's rights and the ethical integrity of the data collection process","The supervisor's personal data only","The enumerator's salary","The survey's IT infrastructure"],
    correct: 0,
    explanation: "Verifying proper consent safeguards respondents' rights and ensures the survey is conducted ethically."
  },
  {
    comp: "Field Protocols", sub: "Route Planning", diff: "Medium",
    q: "If a sampled household relocates before the survey visit, standard field protocol is to:",
    opts: ["Automatically drop that unit from the sample with no further action","Follow the survey's defined tracing/replacement rule rather than improvising","Substitute any convenient nearby household without documentation","Cancel the entire day's route"],
    correct: 1,
    explanation: "Surveys define explicit rules for handling relocated or untraceable sampled units; enumerators should follow these rather than making ad hoc substitutions."
  },
  {
    comp: "Field Protocols", sub: "Supervision Checklist", diff: "Medium",
    q: "During a field visit, a supervisor observing an enumerator's interview technique (rather than only reviewing completed forms) is primarily checking for:",
    opts: ["The enumerator's typing speed","The battery life of the CAPI device","How well the enumerator follows question wording, probing technique, and rapport-building in real time","The color scheme of the questionnaire app"],
    correct: 2,
    explanation: "Direct observation lets a supervisor assess real-time interviewing behavior that cannot be fully judged from the completed data alone."
  },
  {
    comp: "Field Protocols", sub: "Route Planning", diff: "Medium",
    q: "Seasonal or weather-related route adjustments (e.g., avoiding flood-prone areas during monsoon) are made primarily to:",
    opts: ["Reduce the sample size permanently for that region","Change the competencies required for the role","Increase the survey's cost with no operational benefit","Maintain enumerator safety and access feasibility without compromising the survey's coverage objectives"],
    correct: 3,
    explanation: "Adjusting routes around seasonal hazards keeps fieldwork safe and feasible while still working to achieve planned coverage, often through rescheduling."
  },
  {
    comp: "Field Protocols", sub: "Supervision Checklist", diff: "Medium",
    q: "A supervision checklist item confirming 'GPS location matches the assigned sample address' is designed to guard against:",
    opts: ["Interviews being conducted at the wrong location or fabricated away from the actual sample point","Translation errors in the questionnaire","Low battery on the CAPI device","Incorrect stratification of the sample"],
    correct: 0,
    explanation: "Matching GPS coordinates to the assigned address is a specific control against enumerators conducting or fabricating interviews away from the true sample point."
  },
  {
    comp: "Field Protocols", sub: "Route Planning", diff: "Medium",
    q: "When a sample point is genuinely inaccessible for an extended period (e.g., due to a natural disaster), field protocol generally requires:",
    opts: ["Silently dropping the point with no documentation","Documenting the inaccessibility and following the survey's defined non-response/substitution procedure rather than an ad hoc decision","Fabricating plausible responses to keep the sample count complete","Reassigning the point to a different survey entirely"],
    correct: 1,
    explanation: "Genuine inaccessibility must be documented and handled per the survey's predefined procedures — never resolved by fabricating data."
  },
  {
    comp: "Field Protocols", sub: "Supervision Checklist", diff: "Medium",
    q: "Reviewing a sample of audio recordings (where consent for recording was given) as part of supervision helps mainly to:",
    opts: ["Replace the CAPI application entirely","Calculate the survey's sampling error","Verify that questions were asked as worded and that the interaction matched what was recorded in the data","Eliminate the need for a questionnaire"],
    correct: 2,
    explanation: "Audio review lets supervisors confirm the interview was actually conducted and conducted correctly, independently of what the enumerator recorded."
  },
  {
    comp: "Field Protocols", sub: "Route Planning", diff: "Hard",
    q: "In large-area surveys, sequencing visits to minimize total travel distance across many scattered sample points is fundamentally an example of:",
    opts: ["A stratified sampling problem","A data imputation problem","A hypothesis-testing problem","A route/logistics optimization problem similar to the traveling-salesman class of problems"],
    correct: 3,
    explanation: "Efficiently ordering visits to many scattered points to minimize total travel is structurally the same class of optimization challenge as the traveling-salesman problem, applied to field logistics."
  },
  {
    comp: "Field Protocols", sub: "Supervision Checklist", diff: "Hard",
    q: "A well-designed supervision checklist balances thoroughness against:",
    opts: ["The time and cost burden of supervision itself, so checks remain practical to apply consistently across the whole field force","The color of the supervisor's uniform","The number of competencies in the officer's role","The required score threshold in the competency framework"],
    correct: 0,
    explanation: "An overly long checklist may be too costly or time-consuming to apply consistently, so effective checklists focus on the highest-value quality indicators."
  },
  {
    comp: "Field Protocols", sub: "Route Planning", diff: "Hard",
    q: "Rotating which enumerator covers which cluster over the course of a multi-round panel survey primarily helps guard against:",
    opts: ["Higher fuel costs only","An individual enumerator's persistent bias or rapport-driven measurement effects accumulating across rounds for the same households","The need for any supervision at all","Sampling frame errors"],
    correct: 1,
    explanation: "If the same enumerator repeatedly visits the same households, their individual biases or familiarity effects can systematically affect responses across rounds; rotation helps mitigate this."
  },
  {
    comp: "Field Protocols", sub: "Supervision Checklist", diff: "Hard",
    q: "Combining back-checks, direct observation, and CAPI paradata (e.g., timestamps, GPS, keystroke patterns) into supervision practice reflects the principle that:",
    opts: ["Any single quality-control method is normally sufficient on its own","Paradata is never useful for quality control","Triangulating multiple independent quality signals gives a more reliable picture of data quality than relying on one method alone","Direct observation should always replace back-checking entirely"],
    correct: 2,
    explanation: "No single quality-control method catches every issue; combining independent signals provides more reliable, cross-validated detection of problems."
  },
  {
    comp: "Field Protocols", sub: "Route Planning", diff: "Hard",
    q: "If travel-time data shows one enumerator consistently completing routes far faster than the estimated minimum feasible time, this should prompt:",
    opts: ["Praise and no further review, since speed is always positive","Reduction of that enumerator's target for future rounds with no explanation","Automatic promotion of the enumerator","A quality investigation, since implausibly fast completion may indicate skipped visits or fabricated interviews"],
    correct: 3,
    explanation: "Completion times below what is operationally feasible are a red flag for skipped or fabricated interviews and warrant investigation."
  },

  // ─────────────────── SUPERVISION ───────────────────
  {
    comp: "Supervision", sub: "Team Coordination", diff: "Easy",
    q: "A daily team briefing before fieldwork begins mainly serves to:",
    opts: ["Align enumerators on the day's targets, any protocol updates, and address questions before they start work","Replace the need for a questionnaire","Record individual salaries","Finalize the survey's sample design"],
    correct: 0,
    explanation: "Daily briefings synchronize the field team on the day's plan and any changes, catching misunderstandings before they affect data collection."
  },
  {
    comp: "Supervision", sub: "Quality Audit", diff: "Easy",
    q: "The main purpose of a quality audit in a field survey is to:",
    opts: ["Increase the total sample size","Independently verify that data collection and processing met the required quality standards","Reduce the number of competencies required for officers","Replace the need for enumerator training"],
    correct: 1,
    explanation: "A quality audit is an independent check confirming that the survey's data collection and processing genuinely met the defined quality standards."
  },
  {
    comp: "Supervision", sub: "Team Coordination", diff: "Easy",
    q: "If two enumerators are assigned overlapping sample areas by mistake, a supervisor should:",
    opts: ["Let both complete duplicate work with no correction","Cancel the survey round","Reassign the areas to eliminate the overlap and prevent duplicate or missed coverage","Ignore the issue since it self-corrects"],
    correct: 2,
    explanation: "Overlapping assignments risk duplicate interviews in one area and missed coverage elsewhere; a supervisor should reassign areas promptly."
  },
  {
    comp: "Supervision", sub: "Team Coordination", diff: "Easy",
    q: "Maintaining an up-to-date team contact list and reporting hierarchy mainly supports:",
    opts: ["Faster payroll processing only","Automating data entry","Reducing the sample size","Quick, reliable communication when field issues need to be escalated"],
    correct: 3,
    explanation: "A current contact list and clear reporting hierarchy ensure issues can be communicated and escalated quickly to the right person."
  },
  {
    comp: "Supervision", sub: "Quality Audit", diff: "Easy",
    q: "'Re-verification' in a quality audit context generally means:",
    opts: ["Independently re-checking a sample of already-collected data or interviews for accuracy","Re-designing the entire questionnaire","Re-training all enumerators regardless of performance","Recomputing the national budget"],
    correct: 0,
    explanation: "Re-verification is the independent re-checking of a sample of completed work to confirm its accuracy, a core quality-audit activity."
  },
  {
    comp: "Supervision", sub: "Team Coordination", diff: "Medium",
    q: "Clear task allocation among field team members primarily helps prevent:",
    opts: ["Higher survey costs only","Gaps or duplication in coverage caused by ambiguity over who is responsible for which sample units","The need for a sampling frame","Non-sampling error in data processing"],
    correct: 1,
    explanation: "Well-defined task allocation ensures every sample unit has exactly one clearly responsible enumerator, preventing coverage gaps and duplication."
  },
  {
    comp: "Supervision", sub: "Quality Audit", diff: "Medium",
    q: "A quality audit finding a high rate of missing values concentrated in a specific question across many enumerators most likely points to:",
    opts: ["Random chance with no underlying cause","A sampling frame issue","A possible problem with how that specific question is worded, sequenced, or trained on, rather than isolated enumerator error","Data entry hardware failure"],
    correct: 2,
    explanation: "A pattern of missingness concentrated on one question across many enumerators points to a systemic issue with the question itself rather than random or isolated error."
  },
  {
    comp: "Supervision", sub: "Team Coordination", diff: "Medium",
    q: "Regular check-in calls between a supervisor and field team during a multi-day survey round mainly help by:",
    opts: ["Increasing the sample size","Replacing the final data quality audit","Eliminating the need for back-checks","Allowing early detection and resolution of logistical or data issues before they affect a large share of the data"],
    correct: 3,
    explanation: "Frequent check-ins catch emerging problems early, while they can still be corrected, rather than only discovering them after a large volume of data has been collected."
  },
  {
    comp: "Supervision", sub: "Quality Audit", diff: "Medium",
    q: "Comparing key indicators (e.g., household size distribution) against results from a previous, comparable survey round is a quality audit technique used to:",
    opts: ["Detect implausible shifts that may indicate data quality problems rather than genuine change","Determine the survey's budget","Replace the need for back-checking entirely","Set the required competency score"],
    correct: 0,
    explanation: "Benchmarking against prior, comparable results helps auditors flag implausible jumps that more likely reflect data quality issues than genuine underlying change."
  },
  {
    comp: "Supervision", sub: "Team Coordination", diff: "Medium",
    q: "When a new enumerator joins a field team mid-survey, effective coordination requires the supervisor to:",
    opts: ["Assign them the most difficult cases immediately with no orientation","Provide orientation/training and initially pair or closely monitor them before assigning a full independent caseload","Skip introducing them to the reporting hierarchy","Assume they already know all local protocols"],
    correct: 1,
    explanation: "New team members need orientation and close initial monitoring to ensure they understand protocol correctly before being trusted with a full caseload."
  },
  {
    comp: "Supervision", sub: "Quality Audit", diff: "Medium",
    q: "If a quality audit is conducted only at the very end of a long survey round, the main disadvantage is that:",
    opts: ["It becomes more accurate than an audit done during the round","It costs less than a mid-round audit","Any systemic issues found cannot be corrected for the data already collected, limiting the audit's practical value","It eliminates the need for back-checks"],
    correct: 2,
    explanation: "An audit conducted only after fieldwork is complete can identify problems, but the flawed data collection cannot be corrected retroactively."
  },
  {
    comp: "Supervision", sub: "Quality Audit", diff: "Hard",
    q: "A quality audit that only reviews final aggregated statistics, without examining unit-level data or process indicators, risks:",
    opts: ["Being more accurate than a full audit","Requiring more sample than the original survey","Taking too little time to be useful","Missing unit-level problems (e.g., fabrication, systematic bias) that can average out and stay hidden at the aggregate level"],
    correct: 3,
    explanation: "Certain unit-level problems can partially offset in aggregate statistics; effective audits need to examine unit-level and process data, not just published aggregates."
  },
  {
    comp: "Supervision", sub: "Team Coordination", diff: "Hard",
    q: "Distributing workload evenly across a field team, accounting for terrain and travel difficulty rather than simply dividing the sample count equally, reflects the principle that:",
    opts: ["Effective coordination should balance actual workload/effort, not just nominal case counts, across the team","Equal case counts always mean equal effort","Terrain has no effect on fieldwork productivity","Supervisors should assign all difficult cases to the newest enumerators"],
    correct: 0,
    explanation: "Equal numbers of assigned cases can represent very different amounts of actual effort depending on terrain and travel time; fair coordination accounts for this."
  },
  {
    comp: "Supervision", sub: "Quality Audit", diff: "Hard",
    q: "Root-cause analysis following a quality audit finding is important because:",
    opts: ["It is a formality with no practical use","Identifying the underlying cause (training gap, question design, fabrication, etc.) allows the right corrective action to be targeted rather than a generic response","It replaces the need for the audit itself","It guarantees the issue will never recur regardless of the fix applied"],
    correct: 1,
    explanation: "Different root causes require different corrective actions; root-cause analysis ensures the fix actually addresses what went wrong."
  },
  {
    comp: "Supervision", sub: "Team Coordination", diff: "Hard",
    q: "A supervisor rotating enumerators across different clusters mid-survey should weigh the coordination benefit of reducing individual bias accumulation against:",
    opts: ["No real trade-off exists","The impossibility of ever rotating staff","The learning-curve cost and potential loss of local knowledge/rapport built up by the original enumerator in that cluster","The fact that rotation always improves data quality with no downside"],
    correct: 2,
    explanation: "While rotation can reduce individual bias effects, it has a real cost in lost local rapport and familiarity, so supervisors must balance these considerations."
  },
  {
    comp: "Supervision", sub: "Quality Audit", diff: "Hard",
    q: "Using statistical process control (e.g., tracking an enumerator's error rate over time against a control limit) as part of ongoing quality audit is valuable mainly because it:",
    opts: ["Removes the need for any human judgment","Guarantees zero errors going forward","Applies only to manufacturing, not survey work","Distinguishes normal random variation in error rates from a genuine, actionable shift in performance that needs intervention"],
    correct: 3,
    explanation: "Statistical process control helps distinguish ordinary random fluctuation from a real, statistically significant shift that warrants supervisory intervention."
  },

  // ─────────────────── STATISTICAL ANALYSIS ───────────────────
  {
    comp: "Statistical Analysis", sub: "Descriptive Stats", diff: "Easy",
    q: "The median of a dataset is:",
    opts: ["The middle value when data is arranged in order","The most frequently occurring value","The sum of all values divided by their count","The difference between the highest and lowest values"],
    correct: 0,
    explanation: "The median is the middle value of an ordered dataset, unlike the mean (average) or mode (most frequent value)."
  },
  {
    comp: "Statistical Analysis", sub: "Descriptive Stats", diff: "Easy",
    q: "Which of the following is a measure of dispersion, not central tendency?",
    opts: ["Mean","Range","Mode","Median"],
    correct: 1,
    explanation: "Range (the difference between the maximum and minimum values) measures how spread out the data is, while mean, median, and mode all describe the data's central value."
  },
  {
    comp: "Statistical Analysis", sub: "Inferential Stats", diff: "Easy",
    q: "A 'population parameter' (e.g., the true population mean) differs from a 'sample statistic' in that the parameter:",
    opts: ["Is always known exactly without any survey","Is calculated only from the sample data","Describes the entire population and is typically estimated using a sample statistic","Never has a true, fixed value"],
    correct: 2,
    explanation: "A parameter is a fixed, generally unknown characteristic of the whole population, which we estimate using a statistic computed from sample data."
  },
  {
    comp: "Statistical Analysis", sub: "Descriptive Stats", diff: "Medium",
    q: "The interquartile range (IQR) is calculated as:",
    opts: ["Q3 + Q1","The standard deviation divided by the mean","The maximum value minus the mean","Q3 minus Q1"],
    correct: 3,
    explanation: "The IQR is the difference between the third quartile (Q3) and the first quartile (Q1), capturing the spread of the middle 50% of the data."
  },
  {
    comp: "Statistical Analysis", sub: "Descriptive Stats", diff: "Medium",
    q: "The coefficient of variation is useful mainly because it:",
    opts: ["Allows comparison of relative variability between datasets with different units or very different means","Removes the need to calculate a mean","Is always equal to the standard deviation","Only applies to categorical data"],
    correct: 0,
    explanation: "The coefficient of variation is a unit-free relative measure of spread, making it possible to fairly compare variability across datasets with different scales."
  },
  {
    comp: "Statistical Analysis", sub: "Inferential Stats", diff: "Medium",
    q: "A Type I error in hypothesis testing occurs when:",
    opts: ["A false null hypothesis is incorrectly accepted","A true null hypothesis is incorrectly rejected","The sample size is too small","The confidence interval is too wide"],
    correct: 1,
    explanation: "A Type I error is a 'false positive' — rejecting a null hypothesis that is actually true. A Type II error is failing to reject a false null hypothesis."
  },
  {
    comp: "Statistical Analysis", sub: "Inferential Stats", diff: "Medium",
    q: "Increasing the sample size, all else equal, generally causes the width of a confidence interval to:",
    opts: ["Increase","Stay exactly the same","Decrease","Become undefined"],
    correct: 2,
    explanation: "Larger sample sizes reduce the standard error of an estimate, which narrows confidence intervals, all else being equal."
  },
  {
    comp: "Statistical Analysis", sub: "Descriptive Stats", diff: "Medium",
    q: "In a right-skewed (positively skewed) distribution, the typical ordering of central tendency measures is:",
    opts: ["Mean < Median < Mode","Median < Mode < Mean","Mean = Median = Mode","Mode < Median < Mean"],
    correct: 3,
    explanation: "In a right-skewed distribution, the long tail on the high end pulls the mean upward more than the median, giving the typical order Mode < Median < Mean."
  },
  {
    comp: "Statistical Analysis", sub: "Descriptive Stats", diff: "Medium",
    q: "The mode of a dataset is best used when:",
    opts: ["Identifying the most frequently occurring category, especially useful for categorical/nominal data","The data is continuous and normally distributed","Calculating the total variability in the data","Comparing two datasets with different sample sizes"],
    correct: 0,
    explanation: "The mode identifies the most common value or category and is particularly useful for categorical/nominal data where mean and median may not be meaningful."
  },
  {
    comp: "Statistical Analysis", sub: "Inferential Stats", diff: "Hard",
    q: "A statistically significant result (e.g., p < 0.05) in a large-sample survey:",
    opts: ["Always implies the effect is practically/substantively important","Indicates the result is unlikely under the null hypothesis, but does not by itself establish practical importance or effect size","Guarantees the finding will replicate exactly in future surveys","Proves the null hypothesis is false with certainty"],
    correct: 1,
    explanation: "Statistical significance only indicates the observed result is unlikely if the null hypothesis were true; significance and practical importance must be assessed separately."
  },
  {
    comp: "Statistical Analysis", sub: "Inferential Stats", diff: "Hard",
    q: "When survey data is collected using a complex sample design (stratification, clustering, weighting), computing standard errors as if it were a simple random sample typically:",
    opts: ["Gives exactly correct standard errors regardless of design","Always overstates the standard errors","Understates the true standard errors for clustered designs, leading to overly narrow confidence intervals","Has no effect on inference"],
    correct: 2,
    explanation: "Clustering tends to increase true variance relative to an SRS of the same size, so ignoring the design typically understates standard errors and overstates precision."
  },
  {
    comp: "Statistical Analysis", sub: "Descriptive Stats", diff: "Hard",
    q: "Comparing the standard deviation of two datasets with very different means is potentially misleading because:",
    opts: ["Standard deviation cannot be computed for datasets with different means","Mean and standard deviation must always be equal","Standard deviation is always proportional to the mean","A larger mean does not necessarily imply variability should be compared in absolute rather than relative terms"],
    correct: 3,
    explanation: "Absolute standard deviation can be misleading when means differ greatly; the coefficient of variation is often more appropriate for such comparisons."
  },
  {
    comp: "Statistical Analysis", sub: "Inferential Stats", diff: "Hard",
    q: "In official statistics, using design-based (rather than model-based) variance estimation for a complex survey is preferred mainly because it:",
    opts: ["Directly accounts for the actual sample design (stratification, clustering, weighting) used to collect the data, producing valid inference for that design","Ignores the sampling design entirely for simplicity","Requires no software","Only works for simple random samples"],
    correct: 0,
    explanation: "Design-based variance estimation explicitly incorporates the actual complex sample design used, producing statistically valid standard errors and inference."
  },

  // ─────────────────── SAMPLING ALGORITHMS ───────────────────
  {
    comp: "Sampling Algorithms", sub: "Stratified Sampling", diff: "Easy",
    q: "Stratified sampling first divides the population into:",
    opts: ["Random, arbitrary groups with no shared characteristic","Homogeneous subgroups (strata) based on a relevant characteristic, before sampling within each","A single group containing the entire population","Groups based solely on geographic distance from the capital city"],
    correct: 1,
    explanation: "Stratified sampling divides the population into strata that are internally homogeneous with respect to a relevant characteristic, then samples independently within each stratum."
  },
  {
    comp: "Sampling Algorithms", sub: "Cluster Sampling", diff: "Easy",
    q: "In cluster sampling, the primary sampling units selected are typically:",
    opts: ["Individual respondents chosen one at a time from the whole population list","Strata defined by income level","Naturally occurring groups (e.g., villages, city blocks) that are then sampled as whole units or sub-sampled within","Survey questions grouped by topic"],
    correct: 2,
    explanation: "Cluster sampling selects naturally occurring groups such as villages or blocks, then studies all or a sub-sample of units within each selected cluster."
  },
  {
    comp: "Sampling Algorithms", sub: "PPS Sampling", diff: "Easy",
    q: "PPS sampling assigns selection probability to a unit primarily based on:",
    opts: ["Alphabetical order of the unit's name","The unit's distance from the state capital","Random chance with no relation to any characteristic","A measure of the unit's size (e.g., population, number of households)"],
    correct: 3,
    explanation: "In PPS (probability proportional to size) sampling, larger units have a proportionally higher chance of selection, reflecting their relative size."
  },
  {
    comp: "Sampling Algorithms", sub: "Stratified Sampling", diff: "Easy",
    q: "A common stratification variable used in official household surveys is:",
    opts: ["Urban/rural location or administrative region","The respondent's favorite color","The day of the week the interview occurs","The enumerator's assigned employee ID"],
    correct: 0,
    explanation: "Urban/rural classification or administrative/geographic region are commonly used stratification variables because they relate meaningfully to many survey outcomes."
  },
  {
    comp: "Sampling Algorithms", sub: "Stratified Sampling", diff: "Medium",
    q: "Proportional allocation in stratified sampling means each stratum's sample size is:",
    opts: ["Equal across all strata regardless of population size","Proportional to that stratum's share of the total population","Determined only by cost per interview","Fixed at exactly 100 units per stratum"],
    correct: 1,
    explanation: "Under proportional allocation, the sample drawn from each stratum is proportional to that stratum's share of the total population."
  },
  {
    comp: "Sampling Algorithms", sub: "Cluster Sampling", diff: "Medium",
    q: "Compared to stratified sampling of the same total sample size, cluster sampling typically has:",
    opts: ["Lower sampling error because clusters are more homogeneous","Exactly the same sampling error in every case","Higher sampling error because units within the same cluster tend to be similar to each other (intra-cluster correlation)","No relationship to intra-cluster correlation"],
    correct: 2,
    explanation: "Because units within a cluster tend to be more similar to each other than to units elsewhere, cluster sampling generally has higher sampling variance due to intra-cluster correlation."
  },
  {
    comp: "Sampling Algorithms", sub: "PPS Sampling", diff: "Medium",
    q: "PPS sampling combined with a fixed number of secondary units selected per primary unit in a multi-stage design helps to:",
    opts: ["Guarantee that only the largest PSUs are ever selected","Ensure all PSUs have exactly equal population","Eliminate the need to define a measure of size","Produce roughly self-weighting samples where every final-stage unit has a similar overall selection probability"],
    correct: 3,
    explanation: "Combining PPS selection of PSUs with a fixed number of units drawn per selected PSU tends to equalize the overall probability of selection for every final-stage unit."
  },
  {
    comp: "Sampling Algorithms", sub: "Stratified Sampling", diff: "Medium",
    q: "A key precondition for stratified sampling to reduce variance effectively is that:",
    opts: ["Strata should be internally homogeneous, with meaningful differences between strata on the variable of interest","Strata should be as heterogeneous internally as possible","All strata must be exactly equal in size","No auxiliary information about the population is needed"],
    correct: 0,
    explanation: "Stratification reduces variance most effectively when each stratum is internally homogeneous while strata differ meaningfully from one another."
  },
  {
    comp: "Sampling Algorithms", sub: "Cluster Sampling", diff: "Medium",
    q: "The 'rate of homogeneity' (roh) in cluster sampling measures:",
    opts: ["The proportion of clusters that are urban","The degree of similarity among units within the same cluster relative to the overall population variance","The total number of clusters sampled","The average cluster size"],
    correct: 1,
    explanation: "Roh (intra-class correlation) quantifies how similar units within the same cluster are to each other relative to the population as a whole; higher roh increases the design effect."
  },
  {
    comp: "Sampling Algorithms", sub: "PPS Sampling", diff: "Medium",
    q: "'Systematic PPS sampling' combines probability-proportional-to-size selection with:",
    opts: ["Simple random sampling of clusters with equal probability","Quota sampling within each cluster","A systematic (fixed-interval) selection procedure applied to a cumulative size listing of units","Convenience sampling of the largest units only"],
    correct: 2,
    explanation: "Systematic PPS sampling cumulates the size measure across units, then selects units at a fixed sampling interval along that cumulative listing."
  },
  {
    comp: "Sampling Algorithms", sub: "PPS Sampling", diff: "Hard",
    q: "If the measure of size used for PPS selection is outdated (e.g., using old census population figures for currently growing areas), the main consequence is:",
    opts: ["No consequence, since PPS does not depend on the measure of size being current","PPS sampling becomes equivalent to simple random sampling","The sample automatically self-corrects during data collection","Selection probabilities become distorted relative to current reality, potentially biasing which areas are over- or under-represented"],
    correct: 3,
    explanation: "PPS relies on the measure of size to set selection probabilities; if that measure is outdated, areas that have grown or shrunk will have selection probabilities that no longer reflect current reality."
  },
  {
    comp: "Sampling Algorithms", sub: "Stratified Sampling", diff: "Hard",
    q: "When cost per unit varies substantially across strata, optimum (cost-adjusted Neyman-type) allocation assigns more sample to strata that have:",
    opts: ["Higher variance and/or lower cost per unit, relative to other strata","Lower variance and higher cost per unit","Only larger population size regardless of cost or variance","Exactly equal variance to all other strata"],
    correct: 0,
    explanation: "Cost-adjusted optimum allocation favors strata where an additional unit yields more information per rupee spent — higher variance and/or lower cost per unit."
  },
  {
    comp: "Sampling Algorithms", sub: "Cluster Sampling", diff: "Hard",
    q: "Increasing the number of clusters selected while keeping the total sample size fixed (by reducing units per cluster) generally:",
    opts: ["Always increases sampling variance","Tends to reduce sampling variance, since more, smaller clusters better capture between-cluster variation than fewer, larger ones","Has no effect on variance under any circumstances","Only affects the survey budget, not the variance"],
    correct: 1,
    explanation: "For a fixed total sample size, spreading the sample across more clusters generally captures more between-cluster variation and reduces the design effect."
  },
  {
    comp: "Sampling Algorithms", sub: "PPS Sampling", diff: "Hard",
    q: "The Horvitz-Thompson estimator is important in PPS and other unequal-probability sampling designs because it:",
    opts: ["Only works when all units have equal selection probability","Requires that the measure of size be identical for every unit","Provides an unbiased estimate of the population total by weighting each sampled unit's value by the inverse of its known selection probability","Eliminates the need for a sampling frame"],
    correct: 2,
    explanation: "The Horvitz-Thompson estimator weights each observed unit by the inverse of its known selection probability, yielding an unbiased estimator of the population total even under unequal-probability designs."
  },

  // ─────────────────── DATA INTERPRETATION ───────────────────
  {
    comp: "Data Interpretation", sub: "Trend Analysis", diff: "Easy",
    q: "A time series showing values recorded at regular intervals (e.g., monthly inflation) is primarily analyzed to identify:",
    opts: ["The correct sample size for the next survey","The respondent's confidentiality rights","The correct sampling frame","Patterns such as trend, seasonality, and irregular fluctuations over time"],
    correct: 3,
    explanation: "Time series analysis focuses on identifying systematic patterns — long-term trend, recurring seasonal effects, and irregular fluctuations — in data ordered over time."
  },
  {
    comp: "Data Interpretation", sub: "Cross-tabulation", diff: "Easy",
    q: "A two-way cross-tabulation (contingency table) displays:",
    opts: ["The joint frequency distribution of two categorical variables","The trend of a single variable over time","A scatter plot of two continuous variables","The standard deviation of a single variable"],
    correct: 0,
    explanation: "A cross-tabulation shows how many observations fall into each combination of categories from two categorical variables."
  },
  {
    comp: "Data Interpretation", sub: "Trend Analysis", diff: "Easy",
    q: "A line chart is generally the most appropriate visualization for:",
    opts: ["Comparing proportions of a whole at a single point in time","Showing how a numeric variable changes over a continuous time period","Displaying the joint distribution of two categorical variables","Showing the geographic distribution of a variable"],
    correct: 1,
    explanation: "Line charts connect data points across an ordered axis (typically time), making them well-suited for showing how a value changes over a continuous period."
  },
  {
    comp: "Data Interpretation", sub: "Cross-tabulation", diff: "Easy",
    q: "'Column totals' in a cross-tabulation represent:",
    opts: ["The sum of all cells in the entire table","The average of the row percentages","The sum of all cell values within a single column","The chi-square statistic for the table"],
    correct: 2,
    explanation: "A column total is the sum of the cell values down a single column, representing the total count for that column's category across all rows."
  },
  {
    comp: "Data Interpretation", sub: "Trend Analysis", diff: "Medium",
    q: "A moving average is commonly applied to a time series primarily to:",
    opts: ["Increase the volatility of the series for easier viewing","Replace the need for a sampling frame","Convert a continuous variable into a categorical one","Smooth out short-term fluctuations and highlight the underlying trend"],
    correct: 3,
    explanation: "Moving averages smooth short-term noise by averaging over a rolling window, making the underlying longer-term trend easier to see."
  },
  {
    comp: "Data Interpretation", sub: "Cross-tabulation", diff: "Medium",
    q: "In a cross-tabulation, 'row percentages' show each cell's value as a percentage of:",
    opts: ["That row's total","The grand total of the entire table","That column's total","The largest cell in the table"],
    correct: 0,
    explanation: "Row percentages express each cell as a share of its own row total, useful for comparing the distribution of the column variable within each row category."
  },
  {
    comp: "Data Interpretation", sub: "Trend Analysis", diff: "Medium",
    q: "Seasonally adjusting a time series (e.g., for monthly retail sales) is done primarily to:",
    opts: ["Remove genuine long-term trend from the data","Remove predictable, recurring within-year patterns so underlying trend and irregular movements are easier to interpret","Increase the apparent volatility of the series","Convert the series into a cross-tabulation"],
    correct: 1,
    explanation: "Seasonal adjustment removes predictable, recurring calendar-related patterns so remaining trend and irregular movements can be assessed without seasonal distortion."
  },
  {
    comp: "Data Interpretation", sub: "Cross-tabulation", diff: "Medium",
    q: "A chi-square test applied to a contingency table is used to assess:",
    opts: ["The exact numeric difference between two means","The correlation coefficient between two continuous variables","Whether there is a statistically significant association between the two categorical variables","The trend direction of a time series"],
    correct: 2,
    explanation: "The chi-square test of independence evaluates whether the observed joint distribution in a contingency table differs significantly from what would be expected if the two variables were independent."
  },
  {
    comp: "Data Interpretation", sub: "Trend Analysis", diff: "Medium",
    q: "CAGR (Compound Annual Growth Rate) is preferred over a simple average of yearly growth rates because it:",
    opts: ["Ignores the effect of compounding over multiple periods","Cannot be calculated from start and end values","Only applies to a single year of data","Correctly accounts for compounding, giving the constant annual rate that would produce the observed total growth over the period"],
    correct: 3,
    explanation: "CAGR is derived from the start and end values over the full period and correctly reflects compounding, unlike a simple arithmetic average of year-over-year rates."
  },
  {
    comp: "Data Interpretation", sub: "Trend Analysis", diff: "Medium",
    q: "A 'base year' in an index number series (e.g., a price index) is used to:",
    opts: ["Serve as the reference point (typically set to 100) against which all other periods are measured","Represent the most recent period of data","Determine the sample size of the underlying survey","Eliminate the need for seasonal adjustment"],
    correct: 0,
    explanation: "The base year is the reference period, conventionally set to an index value of 100, against which the index values of all other periods are compared."
  },
  {
    comp: "Data Interpretation", sub: "Trend Analysis", diff: "Hard",
    q: "A structural break in a time series (a sudden, sustained shift in level or trend) should generally be interpreted with caution because:",
    opts: ["It always indicates a data entry error and nothing else","It may reflect a genuine underlying event, a measurement/methodology change, or an error — each requiring different follow-up","It can never be distinguished from normal fluctuation","Structural breaks only occur in survey data, never in administrative data"],
    correct: 1,
    explanation: "A structural break can stem from several different causes — genuine real-world events, changes in survey methodology, or data errors — and analysts must investigate rather than assume a single cause."
  },
  {
    comp: "Data Interpretation", sub: "Cross-tabulation", diff: "Hard",
    q: "Simpson's paradox in cross-tabulated data refers to a situation where:",
    opts: ["Two categorical variables are always independent","The chi-square statistic is always zero","An association seen in the aggregated table reverses or disappears when the data is broken down by a third (confounding) variable","Row and column percentages always sum to 100%"],
    correct: 2,
    explanation: "Simpson's paradox occurs when a trend present in combined data reverses or vanishes once the data is disaggregated by a lurking/confounding variable."
  },
  {
    comp: "Data Interpretation", sub: "Trend Analysis", diff: "Hard",
    q: "When comparing growth rates across two time series with very different base-year values, analysts should be cautious because:",
    opts: ["Time series with different base years cannot be compared under any circumstances","Percentage changes are never affected by the base value","Absolute change is always more informative than percentage change","Base effects can make a large percentage change appear more or less dramatic than the underlying absolute change warrants"],
    correct: 3,
    explanation: "A 'base effect' means the same absolute change translates into a very different percentage change depending on the starting value, so percentage comparisons across very different bases can be misleading."
  },
  {
    comp: "Data Interpretation", sub: "Cross-tabulation", diff: "Hard",
    q: "A statistically significant chi-square result for a large contingency table with many observations:",
    opts: ["Indicates a significant association exists, but a measure of association strength (e.g., Cramer's V) is needed to judge its practical magnitude","Automatically implies the association is strong and substantively important","Proves that one variable causes the other","Means row and column percentages should not be reported"],
    correct: 0,
    explanation: "With large sample sizes, even weak associations can be statistically significant; a separate measure of association strength is needed to judge practical importance, and significance never establishes causation."
  },

  // ─────────────────── DATA PROCESSING ───────────────────
  {
    comp: "Data Processing", sub: "Data Cleaning", diff: "Easy",
    q: "'Range validation' during data cleaning checks whether:",
    opts: ["Two different variables are correlated","A value falls within a logically or physically plausible range for that variable","The dataset has duplicate records","The sample was drawn using PPS"],
    correct: 1,
    explanation: "Range validation flags values that fall outside a plausible range for the variable, which are logically implausible and likely errors."
  },
  {
    comp: "Data Processing", sub: "Data Cleaning", diff: "Easy",
    q: "Standardizing formats (e.g., ensuring all dates use the same DD-MM-YYYY format) during data cleaning is important mainly to:",
    opts: ["Increase the file size","Change the actual values being measured","Prevent processing errors and ensure consistent, comparable values across all records","Eliminate the need for a codebook"],
    correct: 2,
    explanation: "Inconsistent formats can cause software to misinterpret or fail to process values correctly; standardizing formats ensures records are comparable."
  },
  {
    comp: "Data Processing", sub: "Imputation", diff: "Easy",
    q: "'Missing completely at random' (MCAR) describes a situation where the probability that a value is missing:",
    opts: ["Depends on the value that is missing itself","Is always zero","Depends only on other observed variables","Is unrelated to both observed and unobserved data"],
    correct: 3,
    explanation: "Under MCAR, missingness is unrelated to any data — it occurs purely by chance, the least problematic missingness pattern for analysis."
  },
  {
    comp: "Data Processing", sub: "Imputation", diff: "Easy",
    q: "Before deciding on an imputation method, it is important to first understand:",
    opts: ["The pattern and mechanism of missingness (e.g., MCAR, MAR, MNAR) in the dataset","The color scheme of the data collection app","The name of the survey supervisor","The font used in the questionnaire"],
    correct: 0,
    explanation: "The appropriate imputation approach depends heavily on why and how data are missing, so diagnosing this pattern is an essential first step before choosing a method."
  },
  {
    comp: "Data Processing", sub: "Data Cleaning", diff: "Medium",
    q: "A duplicate-record check comparing key identifying fields (e.g., name, address, date of birth) across records is used mainly to:",
    opts: ["Detect implausible numeric values","Identify records that may represent the same real-world unit counted more than once","Adjust for non-response bias","Calculate the design effect"],
    correct: 1,
    explanation: "Duplicate checks compare identifying information to catch cases where the same real-world unit has been recorded more than once, which would inflate counts."
  },
  {
    comp: "Data Processing", sub: "Imputation", diff: "Medium",
    q: "Hot-deck imputation fills a missing value by:",
    opts: ["Always using the overall variable mean","Deleting the record entirely","Copying a plausible value from a similar ('donor') record in the same dataset","Using a value generated completely at random with no relation to other data"],
    correct: 2,
    explanation: "Hot-deck imputation borrows a value from a similar, complete donor record within the same dataset, rather than using a single overall statistic or deleting the case."
  },
  {
    comp: "Data Processing", sub: "Data Cleaning", diff: "Medium",
    q: "Outlier detection during data cleaning aims to identify values that are:",
    opts: ["Missing entirely","Recorded in the wrong file format","Duplicated across records","Unusually extreme compared to the rest of the distribution, which may be genuine but unusual, or may indicate an error"],
    correct: 3,
    explanation: "Outlier detection flags extreme values for review; they are not automatically deleted, since some outliers are genuine but require checking to rule out errors."
  },
  {
    comp: "Data Processing", sub: "Imputation", diff: "Medium",
    q: "A key disadvantage of listwise deletion (dropping any record with a missing value) is that it:",
    opts: ["Can reduce sample size substantially and introduce bias if the data is not missing completely at random","Always increases the sample size","Automatically corrects for measurement error","Requires more computation than any imputation method"],
    correct: 0,
    explanation: "Listwise deletion discards entire records with any missing value, which can shrink the usable sample considerably and bias results if missingness is not MCAR."
  },
  {
    comp: "Data Processing", sub: "Data Cleaning", diff: "Medium",
    q: "Logical/consistency edits applied during data cleaning (e.g., flagging a 'married' respondent recorded as age 5) primarily catch:",
    opts: ["Random sampling error","Internally contradictory combinations of responses that a single-variable check would not detect","Coverage errors in the sampling frame","Interviewer travel time issues"],
    correct: 1,
    explanation: "Consistency edits compare related variables to catch logically impossible combinations that would not be flagged by checking any single variable's range alone."
  },
  {
    comp: "Data Processing", sub: "Imputation", diff: "Hard",
    q: "Regression imputation, which predicts a missing value from other correlated variables, has the drawback of:",
    opts: ["Always increasing the variance of the imputed variable beyond the true level","Being impossible to implement with real survey data","Artificially reducing the variability of the imputed variable if the prediction's uncertainty is not accounted for","Requiring no auxiliary variables at all"],
    correct: 2,
    explanation: "Simple regression imputation replaces missing values with predicted values, which lie closer to the regression line than real observations would, understating true variability unless residual uncertainty is added back."
  },
  {
    comp: "Data Processing", sub: "Data Cleaning", diff: "Hard",
    q: "Automated (machine) edits and manual (analyst) review are typically combined in large-scale official data cleaning because:",
    opts: ["Automated edits alone can resolve every type of data problem","Combining them doubles the error rate","Manual review is always faster than automated edits","Automated rules efficiently flag likely issues at scale, but some flagged cases need human judgment to resolve correctly"],
    correct: 3,
    explanation: "Automated edit rules can efficiently scan large datasets for likely problems, but distinguishing a genuine unusual value from a true error often requires human judgment."
  },
  {
    comp: "Data Processing", sub: "Imputation", diff: "Hard",
    q: "Multiple Imputation's advantage over a single 'best guess' imputed value is that it:",
    opts: ["Generates several plausible completed datasets that reflect imputation uncertainty, allowing that uncertainty to be properly incorporated into standard errors","Produces exactly one dataset with no missing values, like single imputation","Eliminates the need for any statistical model","Always produces identical imputed values across all iterations"],
    correct: 0,
    explanation: "By creating multiple plausible imputed datasets and pooling results, Multiple Imputation captures genuine uncertainty about the missing values, reflected in appropriately wider standard errors."
  },
  {
    comp: "Data Processing", sub: "Data Cleaning", diff: "Hard",
    q: "When correcting an implausible value identified during data cleaning, the recommended practice is to:",
    opts: ["Delete the entire record automatically without documentation","Investigate the source where possible (e.g., re-contact, check paradata) and document any correction made, rather than silently altering the value","Always replace it with the sample mean without review","Ignore it if the survey deadline is close"],
    correct: 1,
    explanation: "Good editing practice requires investigating and documenting corrections so changes are transparent and auditable, rather than making silent, undocumented alterations."
  },
];

// Report definitions shown on the Reports page.
const REPORTS = [
  {
    "key": "competency-gap",
    "icon": "target",
    "title": "Competency Gap Report",
    "desc": "Ranked competency gaps across roles and departments."
  },
  {
    "key": "role-performance",
    "icon": "users",
    "title": "Role Performance Report",
    "desc": "Comparative performance benchmarking by role."
  },
  {
    "key": "learning-progress",
    "icon": "route",
    "title": "Learning Progress Report",
    "desc": "Learning path completion and engagement statistics."
  },
  {
    "key": "assessment",
    "icon": "clipboard-check",
    "title": "Assessment Report",
    "desc": "Diagnostic assessment outcomes and score distribution."
  }
];

module.exports = { OFFICERS, QUESTION_BANK, REPORTS };
