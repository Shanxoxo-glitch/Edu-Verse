const express = require('express');
const { body } = require('express-validator');
const {
  markAttendance,
  checkOut,
  getClassroomStats,
  getMyStats,
  getAttendanceHistory,
  updateAttendanceStatus,
  getLeaderboard,
  getDashboardAnalytics
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Protected routes
router.post(
  '/mark',
  protect,
  [
    body('classroomId').notEmpty().withMessage('Classroom ID is required'),
    body('session').notEmpty().withMessage('Session is required'),
    body('verificationMethod')
      .optional()
      .isIn(['wallet', 'session', 'manual', 'auto'])
      .withMessage('Invalid verification method')
  ],
  validate,
  markAttendance
);

router.put('/:id/checkout', protect, checkOut);

router.get('/stats/:classroomId', protect, getClassroomStats);

router.get('/my-stats', protect, getMyStats);

router.get('/history/:classroomId', protect, getAttendanceHistory);

router.put(
  '/:id/status',
  protect,
  authorize('educator', 'admin'),
  [
    body('status')
      .isIn(['present', 'late', 'absent', 'excused'])
      .withMessage('Invalid status')
  ],
  validate,
  updateAttendanceStatus
);

module.exports = router;
