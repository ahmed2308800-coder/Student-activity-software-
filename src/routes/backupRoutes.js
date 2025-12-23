/**
 * Backup Routes (Admin only)
 */
const express = require('express');
const router = express.Router();
const backupController = require('../controllers/BackupController');
const { authenticate } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/authorizationMiddleware');

// Create manual backup
router.post(
  '/create',
  authenticate,
  isAdmin,
  backupController.createBackup.bind(backupController)
);

// List backups
router.get(
  '/list',
  authenticate,
  isAdmin,
  backupController.listBackups.bind(backupController)
);

// Restore from backup
router.post(
  '/restore',
  authenticate,
  isAdmin,
  backupController.restoreBackup.bind(backupController)
);

module.exports = router;

