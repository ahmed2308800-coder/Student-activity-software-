/**
 * User Management Routes (Admin only)
 */
const express = require('express');
const { param, body, query } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/UserController');
const { authenticate } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/authorizationMiddleware');
const { sanitizeInput, validate } = require('../middlewares/validationMiddleware');

// Get all users
router.get(
  '/',
  authenticate,
  isAdmin,
  [
    query('role').optional().isIn(['student', 'club_representative', 'admin', 'guest']),
    query('search').optional().trim(),
    query('limit').optional().isInt({ min: 1 }),
    query('skip').optional().isInt({ min: 0 })
  ],
  validate,
  userController.getUsers.bind(userController)
);

// Get user by ID
router.get(
  '/:id',
  authenticate,
  isAdmin,
  [param('id').isInt({ min: 1 })],
  validate,
  userController.getUserById.bind(userController)
);

// Update user
router.put(
  '/:id',
  authenticate,
  isAdmin,
  [param('id').isInt({ min: 1 })],
  sanitizeInput,
  [
    body('name').optional().trim(),
    body('role').optional().isIn(['student', 'club_representative', 'admin', 'guest'])
  ],
  validate,
  userController.updateUser.bind(userController)
);

// Delete user
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  [param('id').isInt({ min: 1 })],
  validate,
  userController.deleteUser.bind(userController)
);

module.exports = router;

