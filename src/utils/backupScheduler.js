/**
 * Backup Scheduler
 * Automated backup using node-cron
 */
const cron = require('node-cron');
const backupController = require('../controllers/BackupController');

class BackupScheduler {
  constructor() {
    this.jobs = [];
  }

  /**
   * Schedule automated backups
   * @param {string} schedule - Cron schedule (default: weekly on Sundays)
   */
  scheduleBackups(schedule = '0 0 * * 0') {
    const job = cron.schedule(schedule, async () => {
      console.log('🔄 Running automated backup...');
      try {
        // Create a mock request object for the controller
        const req = {
          user: { role: 'admin' },
          body: {}
        };
        const res = {
          json: (data) => {
            console.log('✅ Backup completed:', data);
          },
          status: () => res
        };
        const next = () => {};

        await backupController.createBackup(req, res, next);
      } catch (error) {
        console.error('❌ Automated backup failed:', error);
      }
    });

    this.jobs.push(job);
    console.log(`📅 Automated backup scheduled: ${schedule}`);
    return job;
  }

  /**
   * Stop all scheduled backups
   */
  stopAll() {
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
  }
}

module.exports = new BackupScheduler();

