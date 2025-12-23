/**
 * Notification Routes
 */
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const notificationController = require('../controllers/NotificationController');
const { authenticate } = require('../middlewares/authMiddleware');
const { isStudentOrHigher, isAdmin, isClubRepOrAdmin } = require('../middlewares/authorizationMiddleware');
const { sanitizeInput, validate } = require('../middlewares/validationMiddleware');

// Get user notifications
router.get(
  '/',
  authenticate,
  isStudentOrHigher,
  notificationController.getNotifications.bind(notificationController)
);

// Mark notification as read
router.put(
  '/:id/read',
  authenticate,
  isStudentOrHigher,
  notificationController.markAsRead.bind(notificationController)
);

// Mark all notifications as read
router.put(
  '/read-all',
  authenticate,
  isStudentOrHigher,
  notificationController.markAllAsRead.bind(notificationController)
);

// Get unread count
router.get(
  '/unread/count',
  authenticate,
  isStudentOrHigher,
  notificationController.getUnreadCount.bind(notificationController)
);

// Broadcast system-wide notification (Admin only)
router.post(
  '/broadcast',
  authenticate,
  isAdmin,
  sanitizeInput,
  [
    body('title').trim().isLength({ min: 3, max: 200 }),
    body('message').trim().isLength({ min: 10 }),
    body('type').optional().trim()
  ],
  validate,
  notificationController.broadcastNotification.bind(notificationController)
);

module.exports = router;

