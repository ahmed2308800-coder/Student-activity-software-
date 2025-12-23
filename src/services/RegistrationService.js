/**
 * Registration Service
 * Handles event registration business logic
 */
const registrationModel = require('../models/RegistrationModel');
const eventModel = require('../models/EventModel');
const logModel = require('../models/LogModel');
const notificationSubject = require('../notifications/NotificationObserver');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');
const { EVENT_STATUS } = require('../config/constants');

// Fix missing import

class RegistrationService {
  /**
   * Register for an event
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID
   * @param {object} reqInfo - Request information for logging
   * @returns {Promise<object>} Registration data
   */
  async registerForEvent(eventId, userId, reqInfo = {}) {
    // Check if event exists
    const event = await eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }

    // Check if event is approved
    if (event.status !== EVENT_STATUS.APPROVED) {
      throw new ValidationError('You can only register for approved events');
    }

    // Check if event date is in the future
    const eventDate = new Date(event.date);
    if (eventDate < new Date()) {
      throw new ValidationError('Cannot register for past events');
    }

    // Check if already registered
    const existingRegistration = await registrationModel.findByUserAndEvent(userId, eventId);
    if (existingRegistration) {
      throw new ConflictError('You are already registered for this event');
    }

    // Check seat availability
    const registrationCount = await registrationModel.countByEvent(eventId);
    if (registrationCount >= event.maxSeats) {
      throw new ConflictError('Event is full. No seats available');
    }

    // Create registration
    const registration = await registrationModel.create({
      userId,
      eventId
    });

    // Log registration
    await logModel.create({
      userId,
      action: 'registration_created',
      resource: 'registration',
      resourceId: (registration.id || registration._id).toString(),
      ipAddress: reqInfo.ip,
      userAgent: reqInfo.userAgent
    });

    // Notify event creator
    await notificationSubject.notifyNewRegistration(registration, event.createdBy.toString());

    // Notify student
    await notificationSubject.notifyRegistrationConfirmed(registration, userId);

    return registration;
  }

  /**
   * Cancel event registration
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID
   * @param {object} reqInfo - Request information for logging
   * @returns {Promise<boolean>}
   */
  async cancelRegistration(eventId, userId, reqInfo = {}) {
    // Check if event exists
    const event = await eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }

    // Check if registered
    const registration = await registrationModel.findByUserAndEvent(userId, eventId);
    if (!registration) {
      throw new NotFoundError('Registration');
    }

    // Check if event date has passed
    const eventDate = new Date(event.date);
    if (eventDate < new Date()) {
      throw new ValidationError('Cannot cancel registration for past events');
    }

    // Delete registration
    const deleted = await registrationModel.deleteById(registration.id || registration._id);

    if (deleted) {
      // Log cancellation
      await logModel.create({
        userId,
        action: 'registration_cancelled',
        resource: 'registration',
        resourceId: (registration.id || registration._id).toString(),
        ipAddress: reqInfo.ip,
        userAgent: reqInfo.userAgent
      });

      // Notify user
      await notificationSubject.notifyRegistrationCancelled(registration, userId);
    }

    return deleted;
  }

  /**
   * Get user registrations
   * @param {string} userId - User ID
   * @returns {Promise<Array>}
   */
  async getUserRegistrations(userId) {
    const registrations = await registrationModel.findByUser(userId);
    
    // Populate event details
    for (const registration of registrations) {
      const event = await eventModel.findById(registration.eventId);
      registration.event = event;
    }

    return registrations;
  }

  /**
   * Get event registrations
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>}
   */
  async getEventRegistrations(eventId) {
    const event = await eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }

    return await registrationModel.findByEvent(eventId);
  }

  /**
   * Check if user is registered for event
   * @param {string} userId - User ID
   * @param {string} eventId - Event ID
   * @returns {Promise<boolean>}
   */
  async isRegistered(userId, eventId) {
    return await registrationModel.isRegistered(userId, eventId);
  }
}

module.exports = new RegistrationService();

