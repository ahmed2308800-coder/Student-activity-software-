/**
 * Event Routes
 */
const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const eventController = require('../controllers/EventController');
const { authenticate, optionalAuthenticate } = require('../middlewares/authMiddleware');
const { hasPermission, isAdmin, isClubRepOrAdmin } = require('../middlewares/authorizationMiddleware');
const { sanitizeInput, validate } = require('../middlewares/validationMiddleware');

// Get all events (public, but authenticated users see more info)
router.get(
  '/',
  optionalAuthenticate,
  eventController.getEvents.bind(eventController)
);

// Get event by ID
router.get(
  '/:id',
  [param('id').isInt({ min: 1 })],
  validate,
  optionalAuthenticate,
  eventController.getEventById.bind(eventController)
);

// Create event (Club Rep or Admin)
router.post(
  '/',
  authenticate,
  isClubRepOrAdmin,
  sanitizeInput,
  [
    body('title').trim().isLength({ min: 3, max: 200 }),
    body('description').trim().isLength({ min: 10 }),
    body('date').isISO8601().toDate(),
    body('location.name').trim().notEmpty(),
    body('location.address').optional().trim(),
    body('maxSeats').isInt({ min: 1 }),
    body('category').optional().trim()
  ],
  validate,
  eventController.createEvent.bind(eventController)
);

// Update event
router.put(
  '/:id',
  authenticate,
  [param('id').isInt({ min: 1 })],
  validate,
  sanitizeInput,
  [
    body('title').optional().trim().isLength({ min: 3, max: 200 }),
    body('description').optional().trim().isLength({ min: 10 }),
    body('date').optional().isISO8601().toDate(),
    body('maxSeats').optional().isInt({ min: 1 }),
    body('category').optional().trim()
  ],
  validate,
  eventController.updateEvent.bind(eventController)
);

// Delete event
router.delete(
  '/:id',
  authenticate,
  [param('id').isInt({ min: 1 })],
  validate,
  eventController.deleteEvent.bind(eventController)
);

// Approve event (Admin only)
router.post(
  '/:id/approve',
  authenticate,
  isAdmin,
  [param('id').isInt({ min: 1 })],
  validate,
  eventController.approveEvent.bind(eventController)
);

// Reject event (Admin only)
router.post(
  '/:id/reject',
  authenticate,
  isAdmin,
  [param('id').isInt({ min: 1 })],
  validate,
  [
    body('reason').optional().trim()
  ],
  validate,
  eventController.rejectEvent.bind(eventController)
);

// Get pending events (Admin only)
router.get(
  '/pending/list',
  authenticate,
  isAdmin,
  eventController.getPendingEvents.bind(eventController)
);

// Notify all registered participants (Club Rep or Admin)
router.post(
  '/:id/notify-participants',
  authenticate,
  isClubRepOrAdmin,
  [param('id').isInt({ min: 1 })],
  validate,
  sanitizeInput,
  [
    body('message').trim().isLength({ min: 10 }),
    body('title').optional().trim().isLength({ min: 3, max: 200 })
  ],
  validate,
  eventController.notifyParticipants.bind(eventController)
);

module.exports = router;

