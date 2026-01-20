const express = require('express');
const {
  getLeaderboard,
  getDashboardAnalytics
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public route
router.get('/leaderboard', getLeaderboard);

// Protected routes
router.get(
  '/dashboard',
  protect,
  authorize('educator', 'admin'),
  getDashboardAnalytics
);

module.exports = router;
