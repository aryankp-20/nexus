/* =====================================================================
   EMBEDDING / RETRIEVAL SERVICE
   =====================================================================
   HONEST STATUS: this performs REAL vector search — it builds a real
   numeric vector per chunk (TF-IDF) and retrieves by real cosine
   similarity. It is NOT a hardcoded lookup table and NOT a fake
   simulation. What it is NOT is neural embeddings from a hosted
   embeddings API (OpenAI/Cohere/etc.) — no such API key is configured
   for this project. TF-IDF is a legitimate, classic vector-retrieval
   technique and is a reasonable, explainable choice for a hackathon:
   you can open this file and explain every line to a judge.

   Upgrade path (documented in HACKATHON_GUIDE.md): swap buildVector()
   for a call to a real embeddings API and store the resulting float
   array instead of a term->weight map — the rest of the pipeline
   (storage, cosine similarity, top-K retrieval) stays the same.
===================================================================== */

const STOPWORDS = new Set(['the', 'is', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with',
  'that', 'this', 'it', 'as', 'are', 'was', 'were', 'be', 'by', 'at', 'from', 'which', 'these', 'those']);

// Splits raw text into lowercase words, dropping short/common words.
function tokenize(text) {
  return (text.toLowerCase().match(/[a-z0-9]+/g) || []).filter(t => !STOPWORDS.has(t) && t.length > 2);
}

// Simple chunker: splits document text into overlapping character
// windows, trying to break on sentence/paragraph boundaries where possible.
function chunkText(text, chunkSize, overlap) {
  const clean = text.replace(/\s+/g, ' ').trim();
  const chunks = [];
  let start = 0;
  while (start < clean.length) {
    let end = Math.min(start + chunkSize, clean.length);
    if (end < clean.length) {
      const lastPeriod = clean.lastIndexOf('. ', end);
      if (lastPeriod > start + chunkSize * 0.5) end = lastPeriod + 1;
    }
    chunks.push(clean.slice(start, end).trim());
    if (end >= clean.length) break;
    start = end - overlap;
  }
  return chunks.filter(c => c.length > 20);
}

// Builds a term-frequency vector for one chunk of text, weighted by
// inverse document frequency across all chunks passed in `allTexts`.
function buildTfidfVectors(texts) {
  const docTokens = texts.map(tokenize);
  const df = {}; // document frequency per term
  docTokens.forEach(tokens => {
    new Set(tokens).forEach(t => { df[t] = (df[t] || 0) + 1; });
  });
  const N = texts.length;

  return docTokens.map(tokens => {
    const tf = {};
    tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
    const vec = {};
    Object.entries(tf).forEach(([term, count]) => {
      const idf = Math.log((N + 1) / (df[term] + 1)) + 1;
      vec[term] = (count / tokens.length) * idf;
    });
    return vec;
  });
}

// Vectorizes a single query string using the same scheme (query terms
// not seen in the corpus just get weight 1 — fine for retrieval).
function buildQueryVector(query, corpusDf, corpusN) {
  const tokens = tokenize(query);
  const tf = {};
  tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
  const vec = {};
  Object.entries(tf).forEach(([term, count]) => {
    const idf = corpusDf[term] ? Math.log((corpusN + 1) / (corpusDf[term] + 1)) + 1 : 1;
    vec[term] = (count / tokens.length) * idf;
  });
  return vec;
}

// Standard cosine-similarity: how "close" two chunks are, 0 (unrelated) to 1 (identical direction).
function cosineSimilarity(vecA, vecB) {
  let dot = 0, magA = 0, magB = 0;
  Object.entries(vecA).forEach(([k, v]) => {
    magA += v * v;
    if (vecB[k]) dot += v * vecB[k];
  });
  Object.values(vecB).forEach(v => { magB += v * v; });
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// Given a competency/topic query and a list of {id, text, tfidf_json}
// chunk rows, returns the top-K most relevant chunks with scores.
function retrieveTopChunks(query, chunkRows, topK) {
  if (chunkRows.length === 0) return [];

  // Rebuild a rough document-frequency table across the candidate
  // chunks so the query vector uses comparable IDF weights.
  const df = {};
  chunkRows.forEach(row => {
    const vec = JSON.parse(row.tfidf_json);
    Object.keys(vec).forEach(t => { df[t] = (df[t] || 0) + 1; });
  });
  const queryVec = buildQueryVector(query, df, chunkRows.length);

  const scored = chunkRows.map(row => ({
    ...row,
    score: cosineSimilarity(queryVec, JSON.parse(row.tfidf_json)),
  }));

  return scored.sort((a, b) => b.score - a.score).slice(0, topK).filter(c => c.score > 0);
}

module.exports = { tokenize, chunkText, buildTfidfVectors, retrieveTopChunks };
