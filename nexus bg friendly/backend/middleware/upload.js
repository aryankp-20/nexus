/* =====================================================================
   UPLOAD MIDDLEWARE
   Validates file size + type BEFORE saving to disk (section 23: file
   upload validation / file size limits).
===================================================================== */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/appConfig');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    cb(null, safeName);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!config.SUPPORTED_FILE_TYPES.includes(ext)) {
    return cb(new Error(`Unsupported file type "${ext}". Supported: ${config.SUPPORTED_FILE_TYPES.join(', ')}`));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.MAX_FILE_SIZE_MB * 1024 * 1024 },
});

module.exports = { upload, UPLOAD_DIR };
