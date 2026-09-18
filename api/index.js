/* =====================================================================
   VERCEL SERVERLESS ENTRY POINT
   Vercel auto-detects any file under /api as a serverless function.
   This one just re-exports the existing Express app from
   backend/server.js unchanged — vercel.json routes every request
   (API + static frontend + the SPA's single index.html) here, so the
   app behaves in production exactly like it does when you run
   `npm start` locally with that same file.
===================================================================== */
module.exports = require('../backend/server');
