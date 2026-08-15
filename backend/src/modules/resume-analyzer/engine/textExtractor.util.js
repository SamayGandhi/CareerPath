/**
 * textExtractor.util.js
 * -----------------------------------------
 * Extracts raw text from an uploaded resume file (PDF or DOC/DOCX).
 * This is I/O (file system read) but deliberately kept dependency-free
 * of any AI service — it's a deterministic parsing utility, not an
 * inference step. Isolated here so the skill-matching and ATS-scoring
 * rules downstream operate on plain text regardless of source format.
 */

const fs = require('fs/promises');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const ApiError = require('../../../shared/errors/ApiError');

/**
 * @param {string} filePath
 * @param {string} mimeType
 * @returns {Promise<string>} extracted plain text, lowercased-safe raw text
 */
async function extractText(filePath, mimeType) {
  const buffer = await fs.readFile(filePath);

  try {
    if (mimeType === 'application/pdf') {
      const parsed = await pdfParse(buffer);
      return parsed.text || '';
    }

    if (
      mimeType === 'application/msword' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || '';
    }

    throw ApiError.badRequest('Unsupported file type for text extraction', 'UNSUPPORTED_FILE_TYPE');
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.unprocessable(
      'Could not extract readable text from this resume file. Please ensure it is not corrupted or image-only.',
      'RESUME_UNREADABLE'
    );
  }
}

module.exports = { extractText };