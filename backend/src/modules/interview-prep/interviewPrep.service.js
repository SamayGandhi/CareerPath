/**
 * interviewPrep.service.js
 * -----------------------------------------
 * Business orchestration for the Interview Preparation module.
 * UPDATED (Batch 5.4): submitMockTest() now triggers a real
 * "interviewCompleted" notification after grading. All prior logic
 * (deterministic MCQ grading, honest ungraded handling for free-text
 * types, recency-weighted readiness score) is unchanged.
 */

const ApiError = require('../../shared/errors/ApiError');
const interviewQuestionRepository = require('./interviewQuestion.repository');
const interviewAttemptRepository = require('./interviewAttempt.repository');
const { gradeAnswer, computeAttemptScore, computeReadinessScore } = require('./engine/readinessScore.calculator');
const notificationService = require('../notification/notification.service');
const { PAGINATION_DEFAULTS } = require('../../config/constants');

class InterviewPrepService {
  async getPracticeQuestions(query) {
    const questions = await interviewQuestionRepository.findForPractice(query);
    return questions;
  }

  async startMockTest(userId, { careerPathId, difficulty, questionCount }) {
    const questions = await interviewQuestionRepository.findRandomForMockTest({
      careerPathId,
      difficulty,
      questionCount,
    });

    if (questions.length === 0) {
      throw ApiError.notFound(
        'No questions are currently available matching your criteria. Please try different filters.',
        'NO_QUESTIONS_FOUND'
      );
    }

    const questionsAttempted = questions.map((q) => ({
      questionId: q._id,
      userAnswer: null,
      isCorrect: null,
      timeTakenSeconds: null,
    }));

    const attempt = await interviewAttemptRepository.create({
      userId,
      careerPathId,
      questionsAttempted,
      status: 'inProgress',
      startedAt: new Date(),
    });

    const sanitizedQuestions = questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options,
      difficultyLevel: q.difficultyLevel,
    }));

    return { attemptId: attempt._id, questions: sanitizedQuestions };
  }

  async submitMockTest(attemptId, userId, { answers }) {
    const attempt = await interviewAttemptRepository.findRawById(attemptId);
    if (!attempt) {
      throw ApiError.notFound('Mock test attempt not found', 'ATTEMPT_NOT_FOUND');
    }
    if (attempt.userId.toString() !== userId) {
      throw ApiError.forbidden('This attempt does not belong to you', 'FORBIDDEN');
    }
    if (attempt.status === 'submitted') {
      throw ApiError.conflict('This attempt has already been submitted', 'ATTEMPT_ALREADY_SUBMITTED');
    }

    const questionIds = attempt.questionsAttempted.map((qa) => qa.questionId);
    const questionsWithAnswers = await interviewQuestionRepository.findByIdsWithAnswers(questionIds);
    const questionMap = new Map(questionsWithAnswers.map((q) => [q._id.toString(), q]));

    const answerMap = new Map(answers.map((a) => [a.questionId, a]));

    const gradedQuestions = attempt.questionsAttempted.map((qa) => {
      const questionIdStr = qa.questionId.toString();
      const submittedAnswer = answerMap.get(questionIdStr);
      const question = questionMap.get(questionIdStr);

      const userAnswer = submittedAnswer ? submittedAnswer.userAnswer : null;
      const timeTakenSeconds = submittedAnswer ? submittedAnswer.timeTakenSeconds : null;
      const isCorrect = question ? gradeAnswer(question, userAnswer) : null;

      return {
        questionId: qa.questionId,
        userAnswer,
        isCorrect,
        timeTakenSeconds,
      };
    });

    const { score, correctCount } = computeAttemptScore(gradedQuestions);

    attempt.questionsAttempted = gradedQuestions;
    attempt.status = 'submitted';
    attempt.score = score;
    attempt.correctCount = correctCount;
    attempt.completedAt = new Date();

    const priorAttempts = await interviewAttemptRepository.findRecentSubmittedByUserAndCareerPath(
      userId,
      attempt.careerPathId,
      10
    );
    const priorReadiness = computeReadinessScore(priorAttempts);
    attempt.readinessScoreImpact =
      score !== null && priorReadiness !== null ? score - priorReadiness : 0;

    await interviewAttemptRepository.save(attempt);

    const breakdown = gradedQuestions.map((gq) => {
      const question = questionMap.get(gq.questionId.toString());
      return {
        questionId: gq.questionId,
        questionText: question?.questionText,
        userAnswer: gq.userAnswer,
        correctAnswer: question?.correctAnswer ?? null,
        isCorrect: gq.isCorrect,
        explanation: question?.explanation,
      };
    });

    await notificationService.notifyUser({
      userId,
      type: 'interviewCompleted',
      title: 'Mock interview completed',
      message:
        score !== null
          ? `You scored ${score}/100 on your mock test (${correctCount} correct answers).`
          : 'Your mock test has been submitted for review.',
      relatedEntityType: 'interviewAttempt',
      relatedEntityId: attempt._id,
    });

    return {
      score,
      correctCount,
      gradableCount: gradedQuestions.filter((q) => q.isCorrect !== null).length,
      totalQuestions: gradedQuestions.length,
      breakdown,
      readinessScoreImpact: attempt.readinessScoreImpact,
    };
  }

  async getAttemptHistory(userId, query) {
    const { page, limit } = query;
    const { items, totalItems } = await interviewAttemptRepository.findAllByUser(userId, {
      page: page || PAGINATION_DEFAULTS.DEFAULT_PAGE,
      limit: limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    });
    return { items, pagination: this._buildPagination(page, limit, totalItems) };
  }

  async getReadinessScore(userId, careerPathId) {
    const recentAttempts = await interviewAttemptRepository.findRecentSubmittedByUserAndCareerPath(
      userId,
      careerPathId,
      10
    );

    const readinessScore = computeReadinessScore(recentAttempts);

    return {
      readinessScore,
      basedOnAttemptCount: recentAttempts.filter((a) => a.score !== null).length,
    };
  }

  async createQuestion(data) {
    return interviewQuestionRepository.create(data);
  }

  async updateQuestion(id, updateData) {
    const question = await interviewQuestionRepository.updateById(id, updateData);
    if (!question) {
      throw ApiError.notFound('Question not found', 'QUESTION_NOT_FOUND');
    }
    return question;
  }

  async deactivateQuestion(id) {
    const question = await interviewQuestionRepository.findById(id);
    if (!question) {
      throw ApiError.notFound('Question not found', 'QUESTION_NOT_FOUND');
    }
    return interviewQuestionRepository.deactivateById(id);
  }

  _buildPagination(page, limit, totalItems) {
    return { page, limit, totalPages: Math.ceil(totalItems / limit), totalItems };
  }
}

module.exports = new InterviewPrepService();