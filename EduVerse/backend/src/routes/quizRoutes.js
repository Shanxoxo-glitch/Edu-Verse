const express = require('express');
const { body } = require('express-validator');
const {
  createQuiz,
  startQuiz,
  submitQuiz,
  getQuizResults,
  getMyBestAttempt,
  updateQuiz,
  deleteQuiz,
  issueCertificate
} = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Protected routes
router.post(
  '/create',
  protect,
  authorize('educator', 'admin'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('classroomId').notEmpty().withMessage('Classroom ID is required'),
    body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
    body('duration')
      .isInt({ min: 1 })
      .withMessage('Duration must be at least 1 minute'),
    body('passingScore')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Passing score must be between 0 and 100')
  ],
  validate,
  createQuiz
);

router.post('/:id/start', protect, startQuiz);

router.post(
  '/:id/submit',
  protect,
  [
    body('answers').isArray().withMessage('Answers must be an array'),
    body('startedAt').notEmpty().withMessage('Start time is required')
  ],
  validate,
  submitQuiz
);

router.get('/:id/results', protect, getQuizResults);

router.get('/:id/my-best', protect, getMyBestAttempt);

router.put(
  '/:id',
  protect,
  authorize('educator', 'admin'),
  updateQuiz
);

router.delete(
  '/:id',
  protect,
  authorize('educator', 'admin'),
  deleteQuiz
);

router.post('/:id/certificate', protect, issueCertificate);

module.exports = router;
