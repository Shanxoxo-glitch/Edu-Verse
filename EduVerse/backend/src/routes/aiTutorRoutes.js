const express = require('express');
const { body } = require('express-validator');
const {
  askAITutor,
  getHistory,
  getInteraction,
  submitFeedback,
  getStats,
  generateQuizQuestions,
  getStudySuggestions
} = require('../controllers/aiTutorController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { apiLimiter } = require('../middleware/security');

const router = express.Router();

// Protected routes
router.post(
  '/',
  protect,
  apiLimiter,
  [
    body('question')
      .trim()
      .notEmpty()
      .withMessage('Question is required')
      .isLength({ max: 2000 })
      .withMessage('Question too long (max 2000 characters)')
  ],
  validate,
  askAITutor
);

router.get('/history', protect, getHistory);

router.get('/stats', protect, getStats);

router.get('/:id', protect, getInteraction);

router.post(
  '/:id/feedback',
  protect,
  [
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('helpful').optional().isBoolean()
  ],
  validate,
  submitFeedback
);

router.post(
  '/generate-quiz',
  protect,
  authorize('educator', 'admin'),
  [
    body('topic').trim().notEmpty().withMessage('Topic is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('questionCount')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('Question count must be between 1 and 20')
  ],
  validate,
  generateQuizQuestions
);

router.post('/study-suggestions', protect, getStudySuggestions);

module.exports = router;
