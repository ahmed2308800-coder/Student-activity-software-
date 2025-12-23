/**
 * Attendance Routes
 */
const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const attendanceController = require('../controllers/AttendanceController');
const { authenticate } = require('../middlewares/authMiddleware');
const { isClubRepOrAdmin } = require('../middlewares/authorizationMiddleware');
const { sanitizeInput, validate } = require('../middlewares/validationMiddleware');

// Mark attendance
router.post(
  '/',
  authenticate,
  isClubRepOrAdmin,
  sanitizeInput,
  [
    body('eventId').isInt({ min: 1 }),
    body('userId').isInt({ min: 1 }),
    body('status').optional().isIn(['present', 'absent'])
  ],
  validate,
  attendanceController.markAttendance.bind(attendanceController)
);

// Mark bulk attendance
router.post(
  '/bulk',
  authenticate,
  isClubRepOrAdmin,
  sanitizeInput,
  [
    body('eventId').isInt({ min: 1 }),
    body('userIds').isArray().notEmpty(),
    body('userIds.*').isInt({ min: 1 }),
    body('status').optional().isIn(['present', 'absent'])
  ],
  validate,
  attendanceController.markBulkAttendance.bind(attendanceController)
);

// Get attendance for an event
router.get(
  '/event/:eventId',
  authenticate,
  isClubRepOrAdmin,
  [param('eventId').isInt({ min: 1 })],
  validate,
  attendanceController.getEventAttendance.bind(attendanceController)
);

// Get attendance statistics
router.get(
  '/event/:eventId/stats',
  authenticate,
  isClubRepOrAdmin,
  [param('eventId').isInt({ min: 1 })],
  validate,
  attendanceController.getEventAttendanceStats.bind(attendanceController)
);

module.exports = router;

