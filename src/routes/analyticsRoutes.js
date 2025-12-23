/**
 * Analytics Routes (Admin only)
 */
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/AnalyticsController');
const { authenticate } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/authorizationMiddleware');

// Get dashboard statistics
router.get(
  '/dashboard',
  authenticate,
  isAdmin,
  analyticsController.getDashboardStats.bind(analyticsController)
);

// Get events statistics
router.get(
  '/events',
  authenticate,
  isAdmin,
  analyticsController.getEventsStats.bind(analyticsController)
);

// Get participation statistics
router.get(
  '/participation',
  authenticate,
  isAdmin,
  analyticsController.getParticipationStats.bind(analyticsController)
);

module.exports = router;

