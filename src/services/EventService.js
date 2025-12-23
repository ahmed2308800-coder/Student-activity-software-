/**
 * Event Service
 * Handles event business logic
 */
const eventModel = require('../models/EventModel');
const registrationModel = require('../models/RegistrationModel');
const logModel = require('../models/LogModel');
const notificationSubject = require('../notifications/NotificationObserver');
const { ValidationError, NotFoundError, AuthorizationError, ConflictError } = require('../utils/errors');
const Validators = require('../utils/validators');
const { EVENT_STATUS } = require('../config/constants');

class EventService {
  /**
   * Create a new event
   * @param {object} eventData - Event data
   * @param {string} userId - Creator user ID
   * @param {object} reqInfo - Request information for logging
   * @returns {Promise<object>} Created event
   */
  async createEvent(eventData, userId, reqInfo = {}) {
    // Validate event data
    const validation = Validators.validateEventData(eventData);
    if (!validation.valid) {
      throw new ValidationError(validation.errors.join(', '));
    }

    // Check for duplicate title
    const titleExists = await eventModel.titleExists(eventData.title);
    if (titleExists) {
      throw new ConflictError('An event with this title already exists');
    }

    // Create event
    const event = await eventModel.create({
      title: eventData.title.trim(),
      description: eventData.description.trim(),
      date: new Date(eventData.date),
      location: {
        name: eventData.location.name.trim(),
        address: eventData.location.address || ''
      },
      maxSeats: parseInt(eventData.maxSeats),
      status: EVENT_STATUS.PENDING,
      createdBy: parseInt(userId),
      category: eventData.category || 'general'
    });

    // Log event creation
    await logModel.create({
      userId,
      action: 'event_created',
      resource: 'event',
      resourceId: (event.id || event._id).toString(),
      ipAddress: reqInfo.ip,
      userAgent: reqInfo.userAgent
    });

    // Notify about event submission
    await notificationSubject.notifyEventSubmitted(event, userId);

    return event;
  }

  /**
   * Update an event
   * @param {string} eventId - Event ID
   * @param {object} eventData - Updated event data
   * @param {string} userId - User ID making the request
   * @param {string} userRole - User role
   * @param {object} reqInfo - Request information for logging
   * @returns {Promise<object>} Updated event
   */
  async updateEvent(eventId, eventData, userId, userRole, reqInfo = {}) {
    const event = await eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }

    // Check authorization
    if (userRole !== 'admin' && event.createdBy !== parseInt(userId)) {
      throw new AuthorizationError('You can only update your own events');
    }

    // Validate if data is provided
    if (eventData.title || eventData.description || eventData.date || eventData.maxSeats) {
      const validation = Validators.validateEventData({
        title: eventData.title || event.title,
        description: eventData.description || event.description,
        date: eventData.date || event.date,
        location: eventData.location || event.location,
        maxSeats: eventData.maxSeats || event.maxSeats
      });

      if (!validation.valid) {
        throw new ValidationError(validation.errors.join(', '));
      }
    }

    // Check for duplicate title if title is being changed
    if (eventData.title && eventData.title !== event.title) {
      const titleExists = await eventModel.titleExists(eventData.title, eventId);
      if (titleExists) {
        throw new ConflictError('An event with this title already exists');
      }
    }

    // Prepare update data
    const updateData = {};
    if (eventData.title) updateData.title = eventData.title.trim();
    if (eventData.description) updateData.description = eventData.description.trim();
    if (eventData.date) updateData.date = new Date(eventData.date);
    if (eventData.location) updateData.location = eventData.location;
    if (eventData.maxSeats) updateData.maxSeats = parseInt(eventData.maxSeats);
    if (eventData.category) updateData.category = eventData.category;

    // If event is being updated after approval, set status back to pending
    if (event.status === EVENT_STATUS.APPROVED && userRole !== 'admin') {
      updateData.status = EVENT_STATUS.PENDING;
    }

    const updatedEvent = await eventModel.updateById(eventId, updateData);

    // Log event update
    await logModel.create({
      userId,
      action: 'event_updated',
      resource: 'event',
      resourceId: eventId,
      ipAddress: reqInfo.ip,
      userAgent: reqInfo.userAgent
    });

    // Notify about event update
    await notificationSubject.notify({
      userId: event.createdBy.toString(),
      type: 'event_updated',
      title: 'Event Updated',
      message: `Your event "${updatedEvent.title}" has been updated.`,
      relatedEventId: parseInt(eventId)
    });

    return updatedEvent;
  }

  /**
   * Delete an event
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID making the request
   * @param {string} userRole - User role
   * @param {object} reqInfo - Request information for logging
   * @returns {Promise<boolean>}
   */
  async deleteEvent(eventId, userId, userRole, reqInfo = {}) {
    const event = await eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }

    // Check authorization
    if (userRole !== 'admin' && event.createdBy !== parseInt(userId)) {
      throw new AuthorizationError('You can only delete your own events');
    }

    // Check if there are registrations
    const registrationCount = await registrationModel.countByEvent(eventId);
    if (registrationCount > 0 && userRole !== 'admin') {
      throw new ConflictError('Cannot delete event with existing registrations');
    }

    // Delete event
    const deleted = await eventModel.deleteById(eventId);

    if (deleted) {
      // Log event deletion
      await logModel.create({
        userId,
        action: 'event_deleted',
        resource: 'event',
        resourceId: eventId,
        ipAddress: reqInfo.ip,
        userAgent: reqInfo.userAgent
      });
    }

    return deleted;
  }

  /**
   * Approve an event
   * @param {string} eventId - Event ID
   * @param {string} adminId - Admin user ID
   * @param {object} reqInfo - Request information for logging
   * @returns {Promise<object>} Approved event
   */
  async approveEvent(eventId, adminId, reqInfo = {}) {
    const event = await eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }

    if (event.status !== EVENT_STATUS.PENDING) {
      throw new ValidationError('Only pending events can be approved');
    }

    const updatedEvent = await eventModel.updateById(eventId, {
      status: EVENT_STATUS.APPROVED
    });

    // Log approval
    await logModel.create({
      userId: adminId,
      action: 'event_approved',
      resource: 'event',
      resourceId: eventId,
      ipAddress: reqInfo.ip,
      userAgent: reqInfo.userAgent
    });

    // Notify event creator
    await notificationSubject.notifyEventApproved(updatedEvent, event.createdBy.toString());

    return updatedEvent;
  }

  /**
   * Reject an event
   * @param {string} eventId - Event ID
   * @param {string} reason - Rejection reason
   * @param {string} adminId - Admin user ID
   * @param {object} reqInfo - Request information for logging
   * @returns {Promise<object>} Rejected event
   */
  async rejectEvent(eventId, reason, adminId, reqInfo = {}) {
    const event = await eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }

    if (event.status !== EVENT_STATUS.PENDING) {
      throw new ValidationError('Only pending events can be rejected');
    }

    const updatedEvent = await eventModel.updateById(eventId, {
      status: EVENT_STATUS.REJECTED,
      rejectionReason: reason || 'No reason provided'
    });

    // Log rejection
    await logModel.create({
      userId: adminId,
      action: 'event_rejected',
      resource: 'event',
      resourceId: eventId,
      details: { reason },
      ipAddress: reqInfo.ip,
      userAgent: reqInfo.userAgent
    });

    // Notify event creator
    await notificationSubject.notifyEventRejected(updatedEvent, event.createdBy.toString(), reason);

    return updatedEvent;
  }

  /**
   * Get all events with filters
   * @param {object} filters - Filter options
   * @returns {Promise<Array>}
   */
  async getEvents(filters = {}) {
    const query = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    const options = {
      sort: { date: 1 },
      limit: filters.limit ? parseInt(filters.limit) : undefined,
      skip: filters.skip ? parseInt(filters.skip) : undefined,
      search: filters.search || undefined
    };

    return await eventModel.findWithRegistrationCount(query, options);
  }

  /**
   * Get event by ID
   * @param {string} eventId - Event ID
   * @returns {Promise<object>}
   */
  async getEventById(eventId) {
    const event = await eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }

    // Add registration count
    const registrationCount = await registrationModel.countByEvent(eventId);
    event.registrationCount = registrationCount;
    event.availableSeats = event.maxSeats - registrationCount;

    return event;
  }

  /**
   * Get pending events
   * @returns {Promise<Array>}
   */
  async getPendingEvents() {
    return await eventModel.findPendingEvents();
  }
}

module.exports = new EventService();

