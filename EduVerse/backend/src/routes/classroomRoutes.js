const express = require('express');
const { body, query } = require('express-validator');
const {
  createClassroom,
  getClassrooms,
  getClassroom,
  joinClassroom,
  leaveClassroom,
  updateClassroom,
  deleteClassroom,
  addMaterial,
  getMyClassrooms
} = require('../controllers/classroomController');
const { protect, authorize } = require('../middleware/auth');
const { validate, validators } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', getClassrooms);
router.get('/:id', getClassroom);

// Protected routes
router.post(
  '/create',
  protect,
  authorize('educator', 'admin'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('subject')
      .notEmpty()
      .withMessage('Subject is required')
      .custom(validators.isValidSubject),
    body('maxStudents')
      .optional()
      .isInt({ min: 1, max: 500 })
      .withMessage('Max students must be between 1 and 500'),
    body('accessType')
      .optional()
      .isIn(['public', 'private', 'nft-gated'])
      .withMessage('Invalid access type')
  ],
  validate,
  createClassroom
);

router.post(
  '/:id/join',
  protect,
  [
    body('accessToken').optional().isString()
  ],
  validate,
  joinClassroom
);

router.post('/:id/leave', protect, leaveClassroom);

router.put(
  '/:id',
  protect,
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('maxStudents')
      .optional()
      .isInt({ min: 1, max: 500 })
  ],
  validate,
  updateClassroom
);

router.delete('/:id', protect, deleteClassroom);

router.post(
  '/:id/materials',
  protect,
  authorize('educator', 'admin'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('type')
      .isIn(['document', 'video', 'audio', 'link', 'ipfs'])
      .withMessage('Invalid material type'),
    body('url').optional().isURL().withMessage('Invalid URL')
  ],
  validate,
  addMaterial
);

router.get('/my/all', protect, getMyClassrooms);

module.exports = router;
