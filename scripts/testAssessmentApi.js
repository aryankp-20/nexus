const http = require('http');

function postJson(path, payload, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runTest() {
  console.log('1. Logging in as Officer Sharma...');
  const loginRes = await postJson('/api/auth/login', { email: 'officer.sharma@mospi.gov.in', password: 'demo1234' });
  if (loginRes.status !== 200) {
    console.error('Login failed:', loginRes);
    return;
  }
  const token = loginRes.data.token;
  console.log('Login successful! Officer:', loginRes.data.officer.name);

  console.log('\n2. Starting Diagnostic Assessment...');
  const assessRes = await postJson('/api/assessments', {}, token);
  if (assessRes.status !== 200) {
    console.error('Assessment start failed:', assessRes);
    return;
  }
  const assessmentId = assessRes.data.assessmentId;
  const q1 = assessRes.data.question;
  console.log(`Assessment ID: ${assessmentId}`);
  console.log(`Q1 Competency: ${q1.competency} | Difficulty: ${q1.difficulty}`);
  console.log(`Q1 Text: "${q1.question}"`);
  console.log('Q1 Options:');
  q1.options.forEach((opt, idx) => {
    console.log(`  [${String.fromCharCode(65 + idx)}] ${opt}`);
  });

  let currentQ = q1;
  for (let step = 1; step <= 5; step++) {
    console.log(`\n--- Question ${step} ---`);
    console.log(`Text: "${currentQ.question}"`);
    currentQ.options.forEach((opt, idx) => {
      console.log(`  [${String.fromCharCode(65 + idx)}] ${opt}`);
    });
    
    // Submit answer 0
    const ansRes = await postJson(`/api/assessments/${assessmentId}/responses`, {
      questionId: currentQ.id,
      selectedIndex: 0
    }, token);

    const corrLetter = String.fromCharCode(65 + ansRes.data.correctIndex);
    console.log(`-> Correct answer is [${corrLetter}] (Index ${ansRes.data.correctIndex}) | You guessed: [A] => ${ansRes.data.isCorrect ? 'CORRECT' : 'INCORRECT'}`);
    
    if (ansRes.data.done || !ansRes.data.nextQuestion) {
      console.log('Assessment reached target count or completed.');
      break;
    }
    currentQ = ansRes.data.nextQuestion;
  }
}

runTest().catch(console.error);
