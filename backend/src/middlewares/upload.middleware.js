/**
 * upload.middleware.js
 * -----------------------------------------
 * Multer-based file upload handling, local disk storage. Isolated
 * here so the storage backend (local -> S3/Cloudinary) can be swapped
 * later without touching module controller/service code.
 *
 * UPDATED (Phase 12): added a second uploader, `uploadResumeForAnalysis`,
 * used by the Resume Analyzer. Kept separate from the Profile module's
 * `handleResumeUpload` (which persists a user's canonical stored resume)
 * because analyzer uploads are transient analysis inputs, not
 * necessarily meant to replace the user's saved profile resume —
 * they're stored in their own directory and are not linked to
 * profiles.resumeUrl.
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('../shared/errors/ApiError');

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const RESUME_DIR = path.join(process.cwd(), UPLOAD_DIR, 'resumes');
const ANALYZER_RESUME_DIR = path.join(process.cwd(), UPLOAD_DIR, 'resume-analysis');
const MAX_RESUME_SIZE_MB = parseInt(process.env.MAX_RESUME_SIZE_MB, 10) || 5;

// Ensure upload directories exist at startup
for (const dir of [RESUME_DIR, ANALYZER_RESUME_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const ALLOWED_RESUME_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function buildResumeStorage(destinationDir) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destinationDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const safeName = `${req.user.id}-${Date.now()}${ext}`;
      cb(null, safeName);
    },
  });
}

const resumeFileFilter = (req, file, cb) => {
  if (!ALLOWED_RESUME_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      ApiError.badRequest(
        'Invalid file type. Only PDF, DOC, and DOCX files are allowed.',
        'INVALID_FILE_TYPE'
      )
    );
  }
  cb(null, true);
};

const uploadResume = multer({
  storage: buildResumeStorage(RESUME_DIR),
  fileFilter: resumeFileFilter,
  limits: { fileSize: MAX_RESUME_SIZE_MB * 1024 * 1024 },
}).single('resume');

const uploadResumeForAnalysis = multer({
  storage: buildResumeStorage(ANALYZER_RESUME_DIR),
  fileFilter: resumeFileFilter,
  limits: { fileSize: MAX_RESUME_SIZE_MB * 1024 * 1024 },
}).single('resume');

/**
 * Generic wrapper: converts multer's callback-style errors into the
 * standard global error-handling flow.
 */
function wrapUploadMiddleware(multerMiddleware) {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            ApiError.badRequest(
              `File too large. Maximum size is ${MAX_RESUME_SIZE_MB}MB.`,
              'FILE_TOO_LARGE'
            )
          );
        }
        return next(ApiError.badRequest(err.message, 'UPLOAD_ERROR'));
      }
      if (err) return next(err);
      next();
    });
  };
}

const handleResumeUpload = wrapUploadMiddleware(uploadResume);
const handleResumeAnalysisUpload = wrapUploadMiddleware(uploadResumeForAnalysis);

module.exports = {
  handleResumeUpload,
  handleResumeAnalysisUpload,
  RESUME_DIR,
  ANALYZER_RESUME_DIR,
};