/**
 * Observer Pattern Implementation for Notification System
 * Implements Subject-Observer pattern for event-driven notifications
 */

const EventEmitter = require('events');
const database = require('../config/database');
const { NOTIFICATION_TYPES } = require('../config/constants');

/**
 * Abstract Observer Class
 */
class NotificationObserver {
  /**
   * Update method to be implemented by concrete observers
   * @param {object} notificationData - Notification data
   */
  update(notificationData) {
    throw new Error('update() method must be implemented');
  }
}

/**
 * Database Notification Observer
 * Saves notifications to MySQL
 */
class DatabaseNotificationObserver extends NotificationObserver {
  async update(notificationData) {
    try {
      const sql = `INSERT INTO notifications (user_id, type, title, message, related_event_id, \`read\`, created_at) 
                   VALUES (?, ?, ?, ?, ?, FALSE, NOW())`;
      const params = [
        notificationData.userId ? parseInt(notificationData.userId) : null,
        notificationData.type,
        notificationData.title,
        notificationData.message,
        notificationData.relatedEventId ? parseInt(notificationData.relatedEventId) : null
      ];
      await database.query(sql, params);
    } catch (error) {
      console.error('Error saving notification to database:', error);
    }
  }
}

/**
 * Email Notification Observer (Placeholder for future implementation)
 */
class EmailNotificationObserver extends NotificationObserver {
  async update(notificationData) {
    // In a real implementation, this would send an email
    console.log(`📧 Email notification: ${notificationData.title} - ${notificationData.message}`);
  }
}

/**
 * Notification Subject (EventEmitter-based)
 * Manages observers and notifies them of events
 */
class NotificationSubject extends EventEmitter {
  constructor() {
    super();
    this.observers = [];
    this.setupObservers();
  }

  /**
   * Setup default observers
   */
  setupObservers() {
    this.observers.push(new DatabaseNotificationObserver());
    this.observers.push(new EmailNotificationObserver());
  }

  /**
   * Attach an observer
   * @param {NotificationObserver} observer - Observer to attach
   */
  attach(observer) {
    if (!(observer instanceof NotificationObserver)) {
      throw new Error('Observer must be an instance of NotificationObserver');
    }
    this.observers.push(observer);
  }

  /**
   * Detach an observer
   * @param {NotificationObserver} observer - Observer to detach
   */
  detach(observer) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  /**
   * Notify all observers
   * @param {object} notificationData - Notification data
   */
  async notify(notificationData) {
    // Emit event for EventEmitter listeners
    this.emit('notification', notificationData);

    // Notify all observers
    const promises = this.observers.map(observer => {
      try {
        return observer.update(notificationData);
      } catch (error) {
        console.error('Error notifying observer:', error);
        return Promise.resolve();
      }
    });

    await Promise.all(promises);
  }

  /**
   * Notify about event submission
   * @param {object} event - Event data
   * @param {string} userId - User ID who created the event
   */
  async notifyEventSubmitted(event, userId) {
    await this.notify({
      userId: userId,
      type: NOTIFICATION_TYPES.EVENT_SUBMITTED,
      title: 'Event Submitted',
      message: `Your event "${event.title}" has been submitted for approval.`,
      relatedEventId: (event.id || event._id).toString()
    });
  }

  /**
   * Notify about event approval
   * @param {object} event - Event data
   * @param {string} userId - User ID who created the event
   */
  async notifyEventApproved(event, userId) {
    await this.notify({
      userId: userId,
      type: NOTIFICATION_TYPES.EVENT_APPROVED,
      title: 'Event Approved',
      message: `Your event "${event.title}" has been approved and is now live.`,
      relatedEventId: (event.id || event._id).toString()
    });
  }

  /**
   * Notify about event rejection
   * @param {object} event - Event data
   * @param {string} userId - User ID who created the event
   * @param {string} reason - Rejection reason
   */
  async notifyEventRejected(event, userId, reason) {
    await this.notify({
      userId: userId,
      type: NOTIFICATION_TYPES.EVENT_REJECTED,
      title: 'Event Rejected',
      message: `Your event "${event.title}" has been rejected. Reason: ${reason || 'No reason provided'}`,
      relatedEventId: (event.id || event._id).toString()
    });
  }

  /**
   * Notify about new registration
   * @param {object} registration - Registration data
   * @param {string} eventCreatorId - Event creator's user ID
   */
  async notifyNewRegistration(registration, eventCreatorId) {
    await this.notify({
      userId: eventCreatorId,
      type: NOTIFICATION_TYPES.NEW_REGISTRATION,
      title: 'New Registration',
      message: `A new student has registered for your event.`,
      relatedEventId: registration.eventId.toString()
    });
  }

  /**
   * Notify student about registration confirmation
   * @param {object} registration - Registration data
   * @param {string} studentId - Student's user ID
   */
  async notifyRegistrationConfirmed(registration, studentId) {
    await this.notify({
      userId: studentId,
      type: NOTIFICATION_TYPES.REGISTRATION_CONFIRMED,
      title: 'Registration Confirmed',
      message: `Your registration for the event has been confirmed.`,
      relatedEventId: registration.eventId.toString()
    });
  }

  /**
   * Notify about registration cancellation
   * @param {object} registration - Registration data
   * @param {string} userId - User ID
   */
  async notifyRegistrationCancelled(registration, userId) {
    await this.notify({
      userId: userId,
      type: NOTIFICATION_TYPES.REGISTRATION_CANCELLED,
      title: 'Registration Cancelled',
      message: `Your registration for the event has been cancelled.`,
      relatedEventId: registration.eventId.toString()
    });
  }

  /**
   * Notify about event reminder
   * @param {object} event - Event data
   * @param {string} userId - User ID
   */
  async notifyEventReminder(event, userId) {
    await this.notify({
      userId: userId,
      type: NOTIFICATION_TYPES.EVENT_REMINDER,
      title: 'Event Reminder',
      message: `Reminder: "${event.title}" is happening soon!`,
      relatedEventId: (event.id || event._id).toString()
    });
  }
}

// Export singleton instance and classes for testing
const notificationSubject = new NotificationSubject();
module.exports = notificationSubject;
module.exports.NotificationObserver = NotificationObserver;
module.exports.DatabaseNotificationObserver = DatabaseNotificationObserver;
module.exports.EmailNotificationObserver = EmailNotificationObserver;
module.exports.NotificationSubject = NotificationSubject;

