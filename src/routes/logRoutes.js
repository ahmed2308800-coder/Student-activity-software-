/**
 * Log Viewing Routes (Admin only)
 */
const express = require('express');
const { query, param } = require('express-validator');
const router = express.Router();
const loggingService = require('../services/LoggingService');
const { authenticate } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/authorizationMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

// Get logs
router.get(
  '/',
  authenticate,
  isAdmin,
  [
    query('userId').optional().isInt({ min: 1 }),
    query('action').optional().trim(),
    query('limit').optional().isInt({ min: 1, max: 1000 }),
    query('skip').optional().isInt({ min: 0 })
  ],
  validate,
  async (req, res, next) => {
    try {
      const logs = await loggingService.getLogs(req.query);
      res.json({
        success: true,
        data: { logs, count: logs.length }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get logs by user
router.get(
  '/user/:userId',
  authenticate,
  isAdmin,
  [param('userId').isInt({ min: 1 })],
  validate,
  async (req, res, next) => {
    try {
      const logs = await loggingService.getLogsByUser(req.params.userId, {
        limit: parseInt(req.query.limit) || 100,
        skip: parseInt(req.query.skip) || 0
      });
      res.json({
        success: true,
        data: { logs, count: logs.length }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get logs by action
router.get(
  '/action/:action',
  authenticate,
  isAdmin,
  [param('action').trim()],
  validate,
  async (req, res, next) => {
    try {
      const logs = await loggingService.getLogsByAction(req.params.action, {
        limit: parseInt(req.query.limit) || 100,
        skip: parseInt(req.query.skip) || 0
      });
      res.json({
        success: true,
        data: { logs, count: logs.length }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

