/* =====================================================================
   DOCUMENT ROUTES (Knowledge Base — admin only)
   GET  /api/documents          -> list documents + status
   POST /api/documents/upload   -> upload a PDF, extract + chunk + index it
===================================================================== */

const express = require('express');
const { db } = require('../database/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const documentService = require('../services/documentService');

const router = express.Router();

// ===== LIST: KNOWLEDGE BASE DOCUMENTS =====
router.get('/', requireAuth, (req, res) => {
  const docs = db.prepare('SELECT * FROM documents ORDER BY uploaded_at DESC').all();
  const withCounts = docs.map(d => {
    const chunkCount = db.prepare('SELECT COUNT(*) as c FROM document_chunks WHERE document_id = ?').get(d.id).c;
    const questionCount = db.prepare('SELECT COUNT(*) as c FROM questions WHERE source_document = ?').get(d.original_name).c;
    return {
      id: d.id, name: d.original_name, pages: d.pages_estimate, status: d.status,
      indexed: !!d.indexed, uploaded: d.uploaded_at, chunkCount, questions: questionCount,
    };
  });
  res.json({ documents: withCounts });
});

// ===== UPLOAD + INDEX A NEW PDF (the file-processing pipeline starts here) =====
router.post('/upload', requireAuth, (req, res) => {
  upload.single('document')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const insert = db.prepare(`INSERT INTO documents (original_name, stored_filename, status) VALUES (?,?, 'processing')`);
    const result = insert.run(req.file.originalname, req.file.filename);
    const documentId = result.lastInsertRowid;

    const outcome = await documentService.processDocument(documentId, req.file.path);
    res.json({ documentId, ...outcome });
  });
});

module.exports = router;
