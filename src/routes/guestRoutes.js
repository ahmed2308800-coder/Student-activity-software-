/**
 * Guest Routes
 */
const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const guestController = require('../controllers/GuestController');
const { authenticate, optionalAuthenticate } = require('../middlewares/authMiddleware');
const { isClubRepOrAdmin } = require('../middlewares/authorizationMiddleware');
const { sanitizeInput, validate } = require('../middlewares/validationMiddleware');

// Invite guest (Club Rep or Admin)
router.post(
  '/',
  authenticate,
  isClubRepOrAdmin,
  sanitizeInput,
  [
    body('eventId').isInt({ min: 1 }),
    body('email').isEmail().normalizeEmail(),
    body('name').optional().trim()
  ],
  validate,
  guestController.inviteGuest.bind(guestController)
);

// Accept invitation (Public - no auth required for guest)
router.post(
  '/:id/accept',
  optionalAuthenticate,
  [param('id').isInt({ min: 1 })],
  validate,
  guestController.acceptInvitation.bind(guestController)
);

// Decline invitation (Public - no auth required for guest)
router.post(
  '/:id/decline',
  optionalAuthenticate,
  [param('id').isInt({ min: 1 })],
  validate,
  guestController.declineInvitation.bind(guestController)
);

// Get guests for an event (Club Rep or Admin)
router.get(
  '/event/:eventId',
  authenticate,
  isClubRepOrAdmin,
  [param('eventId').isInt({ min: 1 })],
  validate,
  guestController.getEventGuests.bind(guestController)
);

// Get guest by ID
router.get(
  '/:id',
  optionalAuthenticate,
  [param('id').isInt({ min: 1 })],
  validate,
  guestController.getGuestById.bind(guestController)
);

module.exports = router;

