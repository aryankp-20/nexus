/* =====================================================================
   DOCUMENT SERVICE
   Handles the real part of the RAG pipeline that runs on upload:
   OFFICIAL DOCUMENT -> TEXT EXTRACTION -> CHUNKING -> VECTOR STORAGE
   PDF only for this hackathon build (see appConfig.SUPPORTED_FILE_TYPES).
===================================================================== */

const fs = require('fs');
const path = require('path');
const { db } = require('../database/db');
const config = require('../config/appConfig');
const { chunkText, buildTfidfVectors } = require('./embeddingService');

// Using pdfjs-dist (Mozilla's actively-maintained PDF library) instead
// of the older "pdf-parse" package, which failed on modern, perfectly
// valid PDFs (verified independently with `qpdf --check`). Canvas/font
// rendering warnings from pdfjs-dist are expected and harmless here —
// we only need text extraction, not rendering.
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

async function extractPdfText(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjsLib.getDocument({ data, isEvalSupported: false, verbosity: 0 }).promise;
  let text = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(it => it.str).join(' ') + '\n';
  }
  return { text, numPages: doc.numPages };
}

// ===== MAIN PIPELINE: PDF -> TEXT -> CHUNKS -> TF-IDF VECTORS -> SAVED =====
// Called right after a PDF is uploaded. Extracts the text, splits it
// into overlapping chunks, vectorizes each chunk, and saves everything
// so embeddingService.retrieveTopChunks() can search it later.
async function processDocument(documentId, filePath) {
  try {
    const { text: fullText, numPages: pageCount } = await extractPdfText(filePath);

    const chunks = chunkText(fullText, config.CHUNK_SIZE_CHARS, config.CHUNK_OVERLAP_CHARS);

    if (chunks.length === 0) {
      db.prepare('UPDATE documents SET status = ?, pages_estimate = ? WHERE id = ?')
        .run('failed', pageCount, documentId);
      return { success: false, reason: 'No extractable text found in PDF' };
    }

    const vectors = buildTfidfVectors(chunks);
    const insertChunk = db.prepare(`
      INSERT INTO document_chunks (document_id, chunk_index, page_estimate, text, tfidf_json)
      VALUES (?,?,?,?,?)
    `);
    // Rough page estimate per chunk, spread evenly across the document
    chunks.forEach((chunk, i) => {
      const pageEstimate = Math.max(1, Math.round(((i + 1) / chunks.length) * pageCount));
      insertChunk.run(documentId, i, pageEstimate, chunk, JSON.stringify(vectors[i]));
    });

    db.prepare('UPDATE documents SET status = ?, indexed = 1, pages_estimate = ? WHERE id = ?')
      .run('ready', pageCount, documentId);

    return { success: true, chunkCount: chunks.length, pageCount };
  } catch (err) {
    db.prepare('UPDATE documents SET status = ? WHERE id = ?').run('failed', documentId);
    return { success: false, reason: err.message };
  }
}

// All chunks belonging to one document (used by "PDF-picker" AI mode).
function getChunksForDocument(documentId) {
  return db.prepare('SELECT * FROM document_chunks WHERE document_id = ?').all(documentId);
}

// Every chunk from every READY (fully-indexed) document, across the
// whole knowledge base — this is what gets searched for the
// automatic/personalized AI assessment modes.
function getAllIndexedChunks() {
  return db.prepare(`
    SELECT dc.*, d.original_name as document_name
    FROM document_chunks dc
    JOIN documents d ON d.id = dc.document_id
    WHERE d.status = 'ready'
  `).all();
}

module.exports = { processDocument, getChunksForDocument, getAllIndexedChunks, extractPdfText };
