/**
 * readinessScore.calculator.js
 * -----------------------------------------
 * Pure computation layer: scores a single submitted mock test attempt
 * (comparing user answers to correct answers, deterministically —
 * MCQ exact-match; descriptive/coding/behavioral questions are marked
 * ungraded here since free-text grading requires either manual review
 * or an AI grader, deferred to the AI Enhancement Layer — see note
 * below), and computes an overall interview readiness score from
 * recent attempt history using a recency-weighted average.
 */

/**
 * Grades a single question attempt. For 'mcq' questions this is a
 * deterministic exact-match against the stored correct answer. For
 * 'descriptive', 'coding', and 'behavioral' types, automated exact-match
 * grading isn't meaningful — these are left ungraded (isCorrect: null)
 * by the rule-based core. This is an honest, explicit boundary: the
 * platform does NOT fabricate a grade for free-text answers without
 * either human review or (in a future, explicitly-approved phase) an
 * AI grader — silently guessing right/wrong here would be worse than
 * transparently not scoring it.
 *
 * @param {{ questionType: string, correctAnswer: any }} question
 * @param {any} userAnswer
 * @returns {boolean|null}
 */
function gradeAnswer(question, userAnswer) {
  if (question.questionType === 'mcq') {
    if (userAnswer === undefined || userAnswer === null) return false;
    // Normalize both sides to string for comparison (handles index vs
    // label answer submissions consistently).
    return String(userAnswer).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();
  }

  // Not automatically gradable by the rule-based core.
  return null;
}

/**
 * Computes the overall percentage score for a submitted attempt, based
 * only on the gradable (non-null isCorrect) questions. If NO questions
 * in the attempt were gradable (e.g., an all-descriptive test), returns
 * null rather than fabricating a 0 or 100.
 *
 * @param {Array<{ isCorrect: boolean|null }>} gradedQuestions
 * @returns {{ score: number|null, correctCount: number, gradableCount: number }}
 */
function computeAttemptScore(gradedQuestions) {
  const gradable = gradedQuestions.filter((q) => q.isCorrect !== null);
  const correctCount = gradable.filter((q) => q.isCorrect === true).length;

  const score = gradable.length > 0 ? Math.round((correctCount / gradable.length) * 100) : null;

  return { score, correctCount, gradableCount: gradable.length };
}

/**
 * Computes an overall interview readiness score (0-100) from recent
 * submitted attempts, using a simple recency-weighted average: more
 * recent attempts count more, reflecting current, not historical,
 * readiness. Deterministic, explainable — no AI.
 *
 * @param {Array<{ score: number|null, createdAt: Date }>} recentAttempts - most-recent-first
 * @returns {number|null}
 */
function computeReadinessScore(recentAttempts) {
  const scored = recentAttempts.filter((a) => a.score !== null && a.score !== undefined);
  if (scored.length === 0) return null;

  // Weight: most recent attempt gets weight N, next gets N-1, etc.
  let weightedSum = 0;
  let totalWeight = 0;

  scored.forEach((attempt, index) => {
    const weight = scored.length - index;
    weightedSum += attempt.score * weight;
    totalWeight += weight;
  });

  return Math.round(weightedSum / totalWeight);
}

module.exports = { gradeAnswer, computeAttemptScore, computeReadinessScore };