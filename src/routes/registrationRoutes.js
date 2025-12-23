/**
 * Registration Routes
 */
const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const registrationController = require('../controllers/RegistrationController');
const { authenticate } = require('../middlewares/authMiddleware');
const { isStudentOrHigher, isClubRepOrAdmin } = require('../middlewares/authorizationMiddleware');
const { sanitizeInput, validate } = require('../middlewares/validationMiddleware');

// Register for event
router.post(
  '/',
  authenticate,
  isStudentOrHigher,
  sanitizeInput,
  [
    body('eventId').isInt({ min: 1 })
  ],
  validate,
  registrationController.registerForEvent.bind(registrationController)
);

// Cancel registration
router.delete(
  '/:eventId',
  authenticate,
  isStudentOrHigher,
  [param('eventId').isInt({ min: 1 })],
  validate,
  registrationController.cancelRegistration.bind(registrationController)
);

// Get my registrations
router.get(
  '/my-registrations',
  authenticate,
  isStudentOrHigher,
  registrationController.getMyRegistrations.bind(registrationController)
);

// Get event registrations (Club Rep or Admin)
router.get(
  '/event/:eventId',
  authenticate,
  isClubRepOrAdmin,
  [param('eventId').isInt({ min: 1 })],
  validate,
  registrationController.getEventRegistrations.bind(registrationController)
);

// Check if registered
router.get(
  '/check/:eventId',
  authenticate,
  isStudentOrHigher,
  [param('eventId').isInt({ min: 1 })],
  validate,
  registrationController.checkRegistration.bind(registrationController)
);

module.exports = router;

