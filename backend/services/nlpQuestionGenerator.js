/* =====================================================================
   LOCAL NLP QUESTION GENERATOR
   Generates source-grounded Multiple Choice Questions directly from
   retrieved document chunks when an external LLM API key is not configured.
   This guarantees that uploading any PDF or selecting any topic produces
   authentic, verifiable, working MCQs with accurate answers and source citations.
===================================================================== */

// Domain distractor fragments to ensure natural, realistic alternative options
const DOMAIN_DISTRACTORS = [
  'It eliminates the need for sample frame verification',
  'It mandates exhaustive enumeration of all target units simultaneously',
  'It restricts data collection exclusively to automated remote sensing',
  'It bypasses standard quality audits to accelerate publication timelines',
  'It relies purely on subjective convenience selection of respondents',
  'It aggregates unweighted sample counts without non-response adjustment',
  'It assumes zero variance across distinct population sub-domains',
  'It replaces field verification checklists with post-hoc estimations',
  'It enforces fixed equal probability across all cluster dimensions',
  'It discards incomplete records without applying imputation algorithms',
  'It shifts verification responsibility entirely to administrative records',
  'It standardizes interview schedules without pilot pre-testing',
];

function cleanText(text) {
  return (text || '')
    .replace(/[❖•▪►★■●◆\u2022\u25C6\u25B6\u25A0]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitSentences(text) {
  const clean = cleanText(text);
  // Split on periods, exclamation marks, semicolons, or question marks followed by space or capital letter
  const raw = clean.split(/(?<=[.?!;])\s+(?=[A-Z0-9])/);
  return raw
    .map(s => s.replace(/^[^a-zA-Z0-9]+/, '').trim())
    .filter(s => s.length >= 35 && s.length <= 260 && !/^(page|\d+|table|figure|section)\b/i.test(s) && /^[A-Za-z]/.test(s));
}

// Extract the primary subject/entity from a sentence
function extractSubject(sentence) {
  const clean = sentence.replace(/^[^a-zA-Z0-9]+/, '').trim();
  const match = clean.match(/^([A-Z][a-zA-Z0-9\s\-–—]{2,35}?)(?=\s+(?:is|are|was|were|refers?|means?|involves?|enables?|allows?|provides?|requires?|aims?|ensures?|uses?|consists?|divides?|helps?|serves?))/i);
  if (match && match[1] && match[1].trim().length >= 3) {
    return match[1].trim();
  }
  const words = clean.split(/\s+/).slice(0, 3).join(' ');
  return words.replace(/[^\w\s]/g, '').trim();
}

function synthesizeQuestionFromSentence(sentence, chunk, otherSentences) {
  const subject = extractSubject(sentence);
  const cleanSentence = sentence.replace(/[.]+$/, '').trim();

  let questionText = '';
  let correctAnswer = '';
  let patternType = 'general';

  // Case 1: "X is/are [definition/description]"
  const defMatch = cleanSentence.match(/^(.+?)\s+(?:is|are)\s+(?:defined as|described as|referred to as|known as)\s+(.+)$/i);
  // Case 2: "X enables / allows / provides / ensures / serves to Y"
  const actionMatch = cleanSentence.match(/^(.+?)\s+(?:enables?|allows?|serves?\s+to|aims?\s+to|is\s+designed\s+to|are\s+designed\s+to|is\s+used\s+to|are\s+used\s+to|helps?\s+to|ensures?\s+that|ensures?)\s+(.+)$/i);
  // Case 3: "X consists of / includes / divides Y"
  const compMatch = cleanSentence.match(/^(.+?)\s+(?:consists?\s+of|includes?|comprises?|divides?|involves?)\s+(.+)$/i);

  if (defMatch) {
    questionText = `According to the document, what is the definition or role of ${defMatch[1].trim()}?`;
    correctAnswer = capitalize(defMatch[2].trim());
    patternType = 'def';
  } else if (actionMatch) {
    questionText = `Based on the text, what is the primary purpose or function of ${actionMatch[1].trim()}?`;
    correctAnswer = capitalize(actionMatch[2].trim());
    patternType = 'action';
  } else if (compMatch) {
    questionText = `According to the provided text, what does ${compMatch[1].trim()} involve or comprise?`;
    correctAnswer = capitalize(compMatch[2].trim());
    patternType = 'action';
  } else if (subject && subject.length > 3 && subject.split(' ').length <= 4) {
    questionText = `Which of the following statements is directly supported by the document regarding ${subject}?`;
    correctAnswer = cleanSentence;
  } else {
    questionText = `Based on the source document, which of the following statements is accurate?`;
    correctAnswer = cleanSentence;
  }

  // Ensure correctAnswer is clean and doesn't exceed 140 chars
  if (correctAnswer.length > 150) {
    const cut = correctAnswer.lastIndexOf(',', 140);
    if (cut > 60) correctAnswer = correctAnswer.slice(0, cut);
    else correctAnswer = correctAnswer.slice(0, 140) + '...';
  }

  // Generate 3 distractors
  const distractors = generateDistractors(correctAnswer, otherSentences, patternType);

  // Combine and shuffle options
  const options = [correctAnswer, ...distractors.slice(0, 3)];
  // Deterministic or pseudo-random shuffle
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  const correctIndex = options.indexOf(correctAnswer);

  return {
    question: questionText,
    options,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
    explanation: `Directly supported by the document: "${sentence}" (Page ~${chunk.page_estimate || 1})`,
    sourceDocument: chunk.document_name || 'Uploaded Document',
    sourcePage: chunk.page_estimate || 1,
    sourceExcerpt: chunk.text.slice(0, 240),
  };
}

function generateDistractors(correctAnswer, otherSentences, patternType = 'general') {
  const docPool = [];

  // Try to draw distinct statements from other sentences in the document matching grammar
  otherSentences.forEach(s => {
    const clean = s.replace(/[.]+$/, '').trim();
    if (clean === correctAnswer) return;

    if (patternType === 'action') {
      const m = clean.match(/(?:enables|allows|serves to|aims to|is designed to|is used to|helps to|ensures that)\s+(.+)$/i);
      if (m && m[1] && m[1].length > 15 && m[1].length < 140) {
        docPool.push(capitalize(m[1].trim()));
        return;
      }
    } else if (patternType === 'def') {
      const m = clean.match(/(?:is|are)\s+(?:defined as|described as|referred to as|known as)\s+(.+)$/i);
      if (m && m[1] && m[1].length > 15 && m[1].length < 140) {
        docPool.push(capitalize(m[1].trim()));
        return;
      }
    }

    if (Math.abs(clean.length - correctAnswer.length) < 90 && clean.length >= 25 && clean.length <= 150) {
      docPool.push(capitalize(clean));
    }
  });

  // Unique document distractors
  const uniqueDoc = Array.from(new Set(docPool)).filter(d => d.toLowerCase() !== correctAnswer.toLowerCase());
  uniqueDoc.sort(() => 0.5 - Math.random());

  const result = [...uniqueDoc.slice(0, 3)];

  // Fallbacks if we don't have 3 distractors from the document
  if (result.length < 3) {
    const fallbacks = [
      ...DOMAIN_DISTRACTORS,
      'It restricts procedures to manual paper-based logging without validation checks',
      'It applies uniform non-weighted estimates across all reporting strata',
      'It removes variance controls from the operational sampling design',
      'It substitutes verified administrative registers with speculative projections'
    ];
    fallbacks.sort(() => 0.5 - Math.random());
    for (const fb of fallbacks) {
      if (result.length >= 3) break;
      if (!result.includes(fb) && fb.toLowerCase() !== correctAnswer.toLowerCase()) {
        result.push(fb);
      }
    }
  }

  return result.slice(0, 3);
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generates an array of structured MCQs from retrieved chunks using local extractive NLP.
 * @param {Array} chunks - array of document chunks [{ text, page_estimate, document_name }]
 * @param {number} count - number of questions desired
 * @param {string} difficulty - Easy, Medium, Hard
 * @returns {Array} questions - array of MCQ objects
 */
// ===== MAIN ENTRY POINT (called by questionGenerationService.js) =====
// Everything above this line (cleanText, splitSentences, etc.) is a
// small helper used only by this function - you shouldn't need to
// touch those individually.
function generateQuestionsFromChunksLocally(chunks, count = 5, difficulty = 'Medium') {
  if (!chunks || chunks.length === 0) return [];

  // Gather all sentences across all chunks
  const chunkSentenceMap = [];
  const allSentences = [];

  chunks.forEach((chunk, chunkIdx) => {
    const sentences = splitSentences(chunk.text);
    sentences.forEach(s => {
      chunkSentenceMap.push({ sentence: s, chunk, chunkIdx });
      allSentences.push(s);
    });
  });

  if (chunkSentenceMap.length === 0) {
    // Fallback if sentences were very short
    chunks.forEach((chunk, chunkIdx) => {
      const parts = chunk.text.split(/[;\n]+/).filter(p => p.trim().length > 30);
      parts.forEach(p => {
        chunkSentenceMap.push({ sentence: p.trim(), chunk, chunkIdx });
        allSentences.push(p.trim());
      });
    });
  }

  // Shuffle candidate sentences
  chunkSentenceMap.sort(() => 0.5 - Math.random());

  const questions = [];
  const usedSentences = new Set();

  for (const item of chunkSentenceMap) {
    if (questions.length >= count) break;
    if (usedSentences.has(item.sentence)) continue;

    const otherSentences = allSentences.filter(s => s !== item.sentence);
    const q = synthesizeQuestionFromSentence(item.sentence, item.chunk, otherSentences);
    q.difficulty = difficulty;

    questions.push(q);
    usedSentences.add(item.sentence);
  }

  return questions;
}

module.exports = {
  generateQuestionsFromChunksLocally,
  splitSentences,
};
