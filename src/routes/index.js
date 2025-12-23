/**
 * Main Routes
 */
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const eventRoutes = require('./eventRoutes');
const registrationRoutes = require('./registrationRoutes');
const notificationRoutes = require('./notificationRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const backupRoutes = require('./backupRoutes');
const feedbackRoutes = require('./feedbackRoutes');
const guestRoutes = require('./guestRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const userRoutes = require('./userRoutes');
const logRoutes = require('./logRoutes');
const menuRoutes = require('./menuRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/registrations', registrationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/backup', backupRoutes);
router.use('/feedbacks', feedbackRoutes);
router.use('/guests', guestRoutes);
router.use('/attendances', attendanceRoutes);
router.use('/users', userRoutes);
router.use('/logs', logRoutes);
router.use('/menu', menuRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SAMS API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

