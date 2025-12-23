/**
 * Feedback Routes
 */
const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const feedbackController = require('../controllers/FeedbackController');
const { authenticate } = require('../middlewares/authMiddleware');
const { isStudentOrHigher, isClubRepOrAdmin } = require('../middlewares/authorizationMiddleware');
const { sanitizeInput, validate } = require('../middlewares/validationMiddleware');

// Submit feedback
router.post(
  '/',
  authenticate,
  isStudentOrHigher,
  sanitizeInput,
  [
    body('eventId').isInt({ min: 1 }),
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('comment').optional().trim()
  ],
  validate,
  feedbackController.submitFeedback.bind(feedbackController)
);

// Get feedbacks for an event
router.get(
  '/event/:eventId',
  authenticate,
  [param('eventId').isInt({ min: 1 })],
  validate,
  feedbackController.getEventFeedbacks.bind(feedbackController)
);

// Get my feedbacks
router.get(
  '/my-feedbacks',
  authenticate,
  isStudentOrHigher,
  feedbackController.getMyFeedbacks.bind(feedbackController)
);

// Get event feedback statistics (Club Rep or Admin)
router.get(
  '/event/:eventId/stats',
  authenticate,
  isClubRepOrAdmin,
  [param('eventId').isInt({ min: 1 })],
  validate,
  feedbackController.getEventFeedbackStats.bind(feedbackController)
);

module.exports = router;

