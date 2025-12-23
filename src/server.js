/**
 * Server Entry Point
 * Student Activities Management System (SAMS) Backend
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const database = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorMiddleware');
const cron = require('node-cron');
const backupController = require('./controllers/BackupController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    // Connect to MySQL
    await database.connect();

    // Setup automated weekly backup (Sundays at midnight)
    const backupSchedule = process.env.BACKUP_SCHEDULE || '0 0 * * 0';
    cron.schedule(backupSchedule, async () => {
      console.log('🔄 Running automated backup...');
      try {
        const req = { user: { role: 'admin' } };
        const res = {
          json: (data) => console.log('✅ Backup completed:', data),
          status: () => res
        };
        await backupController.createBackup(req, res, () => {});
      } catch (error) {
        console.error('❌ Backup failed:', error);
      }
    });
    console.log(`📅 Automated backup scheduled: ${backupSchedule}`);

    // Setup event reminder scheduler (runs daily at 9 AM)
    const reminderSchedule = process.env.REMINDER_SCHEDULE || '0 9 * * *';
    cron.schedule(reminderSchedule, async () => {
      console.log('📧 Checking for events to send reminders...');
      try {
        const eventModel = require('./models/EventModel');
        const registrationModel = require('./models/RegistrationModel');
        const notificationSubject = require('./notifications/NotificationObserver');
        const { EVENT_STATUS } = require('./config/constants');

        // Get events happening in the next 24 hours
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const now = new Date();

        const upcomingEvents = await eventModel.find({
          status: EVENT_STATUS.APPROVED,
          date: {
            $gte: now,
            $lte: tomorrow
          }
        });

        for (const event of upcomingEvents) {
          // Get all registered users
          const eventId = event.id || event._id;
          const registrations = await registrationModel.findByEvent(eventId);
          
          for (const registration of registrations) {
            await notificationSubject.notifyEventReminder(event, registration.userId.toString());
          }
        }

        console.log(`✅ Sent reminders for ${upcomingEvents.length} events`);
      } catch (error) {
        console.error('❌ Event reminder failed:', error);
      }
    });
    console.log(`📅 Event reminder scheduler: ${reminderSchedule}`);

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 SAMS Backend Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await database.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await database.disconnect();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;

