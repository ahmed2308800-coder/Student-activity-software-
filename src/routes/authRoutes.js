/**
 * Authentication Routes
 */
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/AuthController');
const { authenticate } = require('../middlewares/authMiddleware');
const { sanitizeInput, validate } = require('../middlewares/validationMiddleware');

// Register
router.post(
  '/register',
  sanitizeInput,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').optional().trim().isLength({ min: 2 }),
    body('role').optional().isIn(['student', 'club_representative', 'admin', 'guest'])
  ],
  validate,
  authController.register.bind(authController)
);

// Login
router.post(
  '/login',
  sanitizeInput,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  validate,
  authController.login.bind(authController)
);

// Get current user
router.get(
  '/me',
  authenticate,
  authController.getMe.bind(authController)
);

module.exports = router;

