/* =====================================================================
   LLM SERVICE
   =====================================================================
   HONEST STATUS: if LLM_API_KEY (ANTHROPIC_API_KEY in .env) is set,
   every function here makes a REAL network call to the Anthropic API
   and returns a REAL model response. If no key is configured, each
   function returns a clearly-labeled fallback instead of pretending to
   call an AI model — see the `usedLlm: false` flag on every response.

   CHANGE THE RAG / LLM MODEL: see LLM_MODEL in backend/config/appConfig.js
===================================================================== */

const config = require('../config/appConfig');

// ===== IS AN AI KEY CONFIGURED? (gates every LLM feature) =====
function isConfigured() {
  return Boolean(config.LLM_API_KEY);
}

// ===== THE ONLY FUNCTION THAT ACTUALLY CALLS THE ANTHROPIC API =====
async function callClaude(systemPrompt, userPrompt, maxTokens = 1024) {
  const res = await fetch(config.LLM_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.LLM_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.LLM_MODEL,
      max_tokens: maxTokens,
      temperature: config.LLM_TEMPERATURE,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LLM API error ${res.status}: ${text}`);
  }
  const data = await res.json();
  const textBlock = (data.content || []).find(b => b.type === 'text');
  return textBlock ? textBlock.text : '';
}

// ===== AI PROMPT: GENERATE ONE QUIZ QUESTION FROM SOURCE TEXT =====
// This is where the actual instructions sent to the AI live (the
// `system` and `user` strings below). Edit THESE STRINGS to change
// how the AI writes questions.
// Generates ONE grounded MCQ from retrieved source chunks. Returns
// { question, options[4], correctIndex, explanation, usedLlm }.
async function generateQuestionFromChunks({ competency, subCompetency, difficulty, chunks }) {
  if (!isConfigured()) {
    return { usedLlm: false, reason: 'LLM_API_KEY not configured' };
  }

  const context = chunks.map((c, i) => `[Chunk ${i + 1}, page ~${c.page_estimate}]\n${c.text}`).join('\n\n');
  const system = `You are an assessment-question writer for India's Official Statistical System.
You must generate exactly ONE multiple-choice question grounded ONLY in the provided source text.
Reply with STRICT JSON ONLY, no markdown fences, matching this shape:
{"question":"...","options":["...","...","...","..."],"correctIndex":0,"explanation":"..."}
Rules: exactly 4 options, exactly one correct option, vary the position of the correct option uniformly among A, B, C, and D (correctIndex 0, 1, 2, or 3) rather than always in the same slot, the question and explanation must be answerable using only the given context, difficulty should be ${difficulty}.`;
  const user = `Competency: ${competency}\nSub-competency: ${subCompetency || 'general'}\n\nSource content:\n${context}\n\nGenerate the question now.`;

  const raw = await callClaude(system, user, 700);
  let parsed;
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(clean);
  } catch (e) {
    return { usedLlm: true, error: 'Model response was not valid JSON', raw };
  }

  // Validate before returning — never trust the raw LLM output.
  if (!parsed.question || !Array.isArray(parsed.options) || parsed.options.length !== 4 ||
      typeof parsed.correctIndex !== 'number' || parsed.correctIndex < 0 || parsed.correctIndex > 3 || !parsed.explanation) {
    return { usedLlm: true, error: 'Model response failed validation', raw: parsed };
  }

  return { usedLlm: true, ...parsed };
}

// ===== AI PROMPT: CHAT ASSISTANT REPLY =====
// The instructions sent to the AI for the floating chat assistant live
// in the `system` string below. Edit it to change the assistant's tone/rules.
// AI Assistant chat — grounded in the officer's own competency data.
async function chatWithContext({ userMessage, contextSummary }) {
  if (!isConfigured()) {
    return { usedLlm: false, reply: fallbackChatReply(userMessage) };
  }
  const system = `You are Competency AI, an assistant inside a government workforce competency platform.
Answer briefly (2-4 sentences) and only using the officer context provided. Do not invent scores or courses that are not in the context.`;
  const user = `Officer context:\n${contextSummary}\n\nOfficer question: ${userMessage}`;
  const reply = await callClaude(system, user, 300);
  return { usedLlm: true, reply };
}

// ===== FALLBACK REPLY (used only when no AI key is configured) =====
// Same canned-style fallback behavior as the original frontend
// prototype, used only when no API key is configured, so the demo
// still works end-to-end without a key.
function fallbackChatReply(msg) {
  const m = msg.toLowerCase();
  if (m.includes('priority')) return "(Demo reply — LLM not configured) Your highest-priority competency is the one with the largest gap between current and required score. Check the Competencies page for the exact numbers.";
  if (m.includes('learn next') || m.includes('what should i learn')) return "(Demo reply — LLM not configured) Check your Learning Path page — it's ordered by match score against your current competency gaps.";
  if (m.includes('progress')) return "(Demo reply — LLM not configured) Your Progress page shows real before/after scores from your assessment history.";
  return "(Demo reply — LLM not configured) Set ANTHROPIC_API_KEY in your .env file to get real AI answers here. In the meantime, check your Competencies and Progress pages for your real data.";
}

module.exports = { isConfigured, generateQuestionFromChunks, chatWithContext };
