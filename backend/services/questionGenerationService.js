/* =====================================================================
   QUESTION GENERATION SERVICE
   The core of "RAG-based MCQ generation":
     competency + difficulty + retrieved content -> LLM -> structured MCQ
   Every generated question is stored with the exact source chunk it
   came from, so the UI can show a real, verifiable source — never a
   fabricated "Page 42" reference.
===================================================================== */

const { db } = require('../database/db');
const { retrieveTopChunks } = require('./embeddingService');
const { getAllIndexedChunks } = require('./documentService');
const llmService = require('./llmService');
const nlpQuestionGenerator = require('./nlpQuestionGenerator');
const assessmentService = require('./assessmentService');
const config = require('../config/appConfig');

// ===== GENERATE ONE QUESTION (used by the admin "AI Quiz Generator" page) =====
// Full pipeline: find relevant source chunks -> ask the AI (or the
// local fallback generator) to write a question -> save it as
// "pending" for an admin to approve/reject.
async function generateQuestion({ competency, subCompetency, difficulty }) {
  const allChunks = getAllIndexedChunks();
  const query = [competency, subCompetency].filter(Boolean).join(' ');
  const topChunks = retrieveTopChunks(query, allChunks, config.RETRIEVAL_TOP_K);

  if (topChunks.length === 0) {
    return {
      success: false,
      status: 'REQUIRES INDEXED DOCUMENTS',
      reason: 'No indexed knowledge base chunks match this competency yet. Upload and process a document first.',
    };
  }

  let generated;
  if (llmService.isConfigured()) {
    try {
      generated = await llmService.generateQuestionFromChunks({ competency, subCompetency, difficulty, chunks: topChunks });
    } catch (err) {
      // Fall through to local generator if LLM call fails
    }
  }

  if (!generated || !generated.usedLlm || generated.error) {
    const local = nlpQuestionGenerator.generateQuestionsFromChunksLocally(topChunks, 1, difficulty);
    if (local.length > 0) {
      const q = local[0];
      const bestChunk = topChunks[0];
      const insert = db.prepare(`
        INSERT INTO questions
          (competency, sub_competency, difficulty, question_text, options_json, correct_index, explanation,
           source_document, source_page, source_chunk_id, status)
        VALUES (?,?,?,?,?,?,?,?,?,?, 'pending')
      `);
      const result = insert.run(
        competency, subCompetency || null, difficulty,
        q.question, JSON.stringify(q.options), q.correctIndex, q.explanation,
        bestChunk.document_name, q.sourcePage, bestChunk.id
      );
      return {
        success: true,
        status: 'GENERATED — PENDING REVIEW',
        question: {
          id: result.lastInsertRowid,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          competency, subCompetency, difficulty,
          sourceDocument: bestChunk.document_name,
          sourcePage: q.sourcePage,
          sourceExcerpt: bestChunk.text.slice(0, 220),
        },
      };
    }
  }

  // Ground the question in the single best-matching chunk for source display.
  const bestChunk = topChunks[0];

  const insert = db.prepare(`
    INSERT INTO questions
      (competency, sub_competency, difficulty, question_text, options_json, correct_index, explanation,
       source_document, source_page, source_chunk_id, status)
    VALUES (?,?,?,?,?,?,?,?,?,?, 'pending')
  `);
  const result = insert.run(
    competency, subCompetency || null, difficulty,
    generated.question, JSON.stringify(generated.options), generated.correctIndex, generated.explanation,
    bestChunk.document_name, bestChunk.page_estimate, bestChunk.id
  );

  return {
    success: true,
    status: 'GENERATED — PENDING REVIEW',
    question: {
      id: result.lastInsertRowid,
      question: generated.question,
      options: generated.options,
      correctIndex: generated.correctIndex,
      explanation: generated.explanation,
      competency, subCompetency, difficulty,
      sourceDocument: bestChunk.document_name,
      sourcePage: bestChunk.page_estimate,
      sourceExcerpt: bestChunk.text.slice(0, 220),
    },
  };
}

// ===== GENERATE A LIVE QUIZ (targeted AI assessment, officer-facing) =====
// Same idea as generateQuestion() above, but generates a whole SET of
// questions in one go and skips the pending/approval step — used when
// an officer clicks "Start Targeted AI Assessment".
async function generateLiveQuestionSet({ competency, subCompetency, difficulty, count = 5 }) {
  const allChunks = getAllIndexedChunks();
  const query = [competency, subCompetency].filter(Boolean).join(' ');
  const topChunks = retrieveTopChunks(query, allChunks, Math.max(config.RETRIEVAL_TOP_K, count * 2));

  const insert = db.prepare(`
    INSERT INTO questions
      (competency, sub_competency, difficulty, question_text, options_json, correct_index, explanation,
       source_document, source_page, source_chunk_id, status)
    VALUES (?,?,?,?,?,?,?,?,?,?, 'approved')
  `);

  // If no chunks matched the specific query, see if we have ANY chunks at all
  let candidateChunks = topChunks;
  if (candidateChunks.length === 0 && allChunks.length > 0) {
    candidateChunks = allChunks.slice(0, count * 3);
  }

  // If documents exist, generate from document chunks (RAG)
  if (candidateChunks.length > 0) {
    const questions = [];

    if (llmService.isConfigured()) {
      const maxAttempts = count + 2;
      let attempts = 0;
      while (questions.length < count && attempts < maxAttempts) {
        attempts++;
        const chunkWindow = [
          candidateChunks[(questions.length + attempts) % candidateChunks.length],
          ...candidateChunks.filter((_, i) => i !== (questions.length + attempts) % candidateChunks.length)
        ].slice(0, config.RETRIEVAL_TOP_K);

        let generated;
        try {
          generated = await llmService.generateQuestionFromChunks({ competency, subCompetency, difficulty, chunks: chunkWindow });
        } catch (err) {
          continue;
        }
        if (!generated.usedLlm || generated.error) continue;

        const bestChunk = chunkWindow[0];
        const result = insert.run(
          competency, subCompetency || null, difficulty,
          generated.question, JSON.stringify(generated.options), generated.correctIndex, generated.explanation,
          bestChunk.document_name, bestChunk.page_estimate, bestChunk.id
        );
        questions.push({
          id: result.lastInsertRowid,
          question: generated.question, options: generated.options,
          competency, subCompetency, difficulty,
          sourceDocument: bestChunk.document_name, sourcePage: bestChunk.page_estimate,
          sourceExcerpt: bestChunk.text.slice(0, 220),
        });
      }
    }

    // Fill remaining with local NLP generator
    if (questions.length < count) {
      const needed = count - questions.length;
      const local = nlpQuestionGenerator.generateQuestionsFromChunksLocally(candidateChunks, needed, difficulty);
      local.forEach(q => {
        const bestChunk = candidateChunks.find(c => c.page_estimate === q.sourcePage) || candidateChunks[0];
        const result = insert.run(
          competency, subCompetency || null, difficulty,
          q.question, JSON.stringify(q.options), q.correctIndex, q.explanation,
          bestChunk.document_name, q.sourcePage, bestChunk.id
        );
        questions.push({
          id: result.lastInsertRowid,
          question: q.question, options: q.options,
          competency, subCompetency, difficulty,
          sourceDocument: bestChunk.document_name, sourcePage: q.sourcePage,
          sourceExcerpt: q.sourceExcerpt,
        });
      });
    }

    if (questions.length > 0) {
      return {
        success: true,
        method: llmService.isConfigured() ? 'RAG + Claude LLM' : 'RAG + Local Semantic Extractor',
        questions,
      };
    }
  }

  // Fallback to verified question bank if no document chunks exist yet
  const bankQuestions = assessmentService.selectReassessmentQuestions(competency, subCompetency, count);
  if (bankQuestions.length > 0) {
    return {
      success: true,
      method: 'Question Bank (Role Competency Framework)',
      questions: bankQuestions.map(q => ({
        id: q.id,
        question: q.question_text,
        options: JSON.parse(q.options_json),
        competency: q.competency,
        subCompetency: q.sub_competency,
        difficulty: q.difficulty,
        sourceDocument: 'Official Competency Framework',
        sourcePage: 1,
        sourceExcerpt: q.explanation || 'Question selected from the official statistical question bank.',
      })),
    };
  }

  return {
    success: false,
    status: 'NO QUESTIONS AVAILABLE',
    reason: `No questions or source documents available for ${competency} yet.`,
  };
}

// ===== GENERATE A QUIZ FROM ONE SPECIFIC DOCUMENT (PDF-picker mode) =====
// Used when an officer picks a specific uploaded PDF to be quizzed on,
// instead of letting the system pick relevant chunks automatically.
async function generateQuestionsFromDocument({ documentId, count = 5, difficulty = 'Medium', topic = '', competency = '' }) {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(documentId);
  if (!doc) throw new Error('Document not found in Knowledge Base.');

  const chunks = db.prepare(`
    SELECT dc.*, d.original_name as document_name
    FROM document_chunks dc
    JOIN documents d ON d.id = dc.document_id
    WHERE dc.document_id = ?
  `).all(documentId);

  if (!chunks || chunks.length === 0) {
    throw new Error('This document does not have extracted text or chunks yet. Please wait for indexing to finish.');
  }

  const effectiveCompetency = competency || doc.original_name.replace(/\.[^/.]+$/, '');
  let targetChunks = chunks;
  if (topic && topic.trim()) {
    const top = retrieveTopChunks(topic.trim(), chunks, Math.max(config.RETRIEVAL_TOP_K, count * 2));
    if (top.length > 0) targetChunks = top;
  }

  const insert = db.prepare(`
    INSERT INTO questions
      (competency, sub_competency, difficulty, question_text, options_json, correct_index, explanation,
       source_document, source_page, source_chunk_id, status)
    VALUES (?,?,?,?,?,?,?,?,?,?, 'approved')
  `);

  const questions = [];

  // 1. If LLM is configured, try generating via LLM first
  if (llmService.isConfigured()) {
    const maxAttempts = count + 2;
    let attempts = 0;
    while (questions.length < count && attempts < maxAttempts) {
      attempts++;
      const chunkWindow = [
        targetChunks[(questions.length + attempts) % targetChunks.length],
        ...targetChunks.filter((_, i) => i !== (questions.length + attempts) % targetChunks.length)
      ].slice(0, config.RETRIEVAL_TOP_K);

      let generated;
      try {
        generated = await llmService.generateQuestionFromChunks({
          competency: effectiveCompetency,
          subCompetency: topic || 'Document Analysis',
          difficulty,
          chunks: chunkWindow
        });
      } catch (err) {
        continue;
      }
      if (!generated || !generated.usedLlm || generated.error) continue;

      const bestChunk = chunkWindow[0];
      const result = insert.run(
        effectiveCompetency, topic || null, difficulty,
        generated.question, JSON.stringify(generated.options), generated.correctIndex, generated.explanation,
        doc.original_name, bestChunk.page_estimate, bestChunk.id
      );
      questions.push({
        id: result.lastInsertRowid,
        question: generated.question,
        options: generated.options,
        competency: effectiveCompetency,
        subCompetency: topic || 'Document Analysis',
        difficulty,
        sourceDocument: doc.original_name,
        sourcePage: bestChunk.page_estimate,
        sourceExcerpt: bestChunk.text.slice(0, 220),
      });
    }
  }

  // 2. Fill remaining questions using Local Extractive NLP
  if (questions.length < count) {
    const remaining = count - questions.length;
    const local = nlpQuestionGenerator.generateQuestionsFromChunksLocally(targetChunks, remaining, difficulty);
    local.forEach(q => {
      const bestChunk = targetChunks.find(c => c.page_estimate === q.sourcePage) || targetChunks[0];
      const result = insert.run(
        effectiveCompetency, topic || null, difficulty,
        q.question, JSON.stringify(q.options), q.correctIndex, q.explanation,
        doc.original_name, q.sourcePage, bestChunk ? bestChunk.id : null
      );
      questions.push({
        id: result.lastInsertRowid,
        question: q.question,
        options: q.options,
        competency: effectiveCompetency,
        subCompetency: topic || 'Document Analysis',
        difficulty,
        sourceDocument: doc.original_name,
        sourcePage: q.sourcePage,
        sourceExcerpt: q.sourceExcerpt,
      });
    });
  }

  if (questions.length === 0) {
    throw new Error('Unable to extract valid questions from the selected document text.');
  }

  return {
    success: true,
    document: { id: doc.id, name: doc.original_name, pages: doc.pages_estimate },
    method: llmService.isConfigured() ? 'RAG + Claude LLM' : 'RAG + Local Semantic Extractor',
    questions,
  };
}

// ===== APPROVE / REJECT / LIST PENDING QUESTIONS (admin review queue) =====
function approveQuestion(id) {
  return db.prepare(`UPDATE questions SET status = 'approved' WHERE id = ? AND status = 'pending'`).run(id).changes > 0;
}
function rejectQuestion(id) {
  return db.prepare(`UPDATE questions SET status = 'rejected' WHERE id = ? AND status = 'pending'`).run(id).changes > 0;
}
function listPendingQuestions() {
  return db.prepare(`SELECT * FROM questions WHERE status = 'pending' ORDER BY created_at DESC`).all();
}

module.exports = {
  generateQuestion,
  generateLiveQuestionSet,
  generateQuestionsFromDocument,
  approveQuestion,
  rejectQuestion,
  listPendingQuestions,
};

