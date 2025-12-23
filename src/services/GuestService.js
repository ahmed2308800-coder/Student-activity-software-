/**
 * Guest Service
 * Handles guest invitation business logic
 */
const guestModel = require('../models/GuestModel');
const eventModel = require('../models/EventModel');
const logModel = require('../models/LogModel');
const notificationSubject = require('../notifications/NotificationObserver');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');
const Validators = require('../utils/validators');
const { EVENT_STATUS } = require('../config/constants');

class GuestService {
  /**
   * Invite a guest to an event
   * @param {string} eventId - Event ID
   * @param {string} inviterId - User ID who is inviting
   * @param {object} guestData - Guest data
   * @param {object} reqInfo - Request information for logging
   * @returns {Promise<object>} Created guest invitation
   */
  async inviteGuest(eventId, inviterId, guestData, reqInfo = {}) {
    // Check if event exists
    const event = await eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }

    // Check if event is approved
    if (event.status !== EVENT_STATUS.APPROVED) {
      throw new ValidationError('You can only invite guests to approved events');
    }

    // Validate email
    if (!guestData.email || !Validators.isValidEmail(guestData.email)) {
      throw new ValidationError('Valid email is required');
    }

    // Check if guest already invited
    const existingGuest = await guestModel.findByEmailAndEvent(guestData.email, eventId);
    if (existingGuest) {
      throw new ConflictError('This guest has already been invited to this event');
    }

    // Create guest invitation
    const guest = await guestModel.create({
      name: guestData.name || '',
      email: guestData.email.toLowerCase(),
      eventId: parseInt(eventId),
      invitedBy: parseInt(inviterId),
      status: 'invited',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Log invitation
    await logModel.create({
      userId: inviterId,
      action: 'guest_invited',
      resource: 'guest',
      resourceId: guest.id || guest._id,
      details: { eventId, guestEmail: guestData.email },
      ipAddress: reqInfo.ip,
      userAgent: reqInfo.userAgent
    });

    // Notify guest (placeholder - would send email in production)
    await notificationSubject.notify({
      userId: null, // Guest doesn't have user account
      type: 'guest_invited',
      title: 'Event Invitation',
      message: `You have been invited to "${event.title}"`,
      relatedEventId: eventId
    });

    return guest;
  }

  /**
   * Accept invitation
   * @param {string} guestId - Guest ID
   * @param {object} reqInfo - Request information for logging
   * @returns {Promise<object>} Updated guest
   */
  async acceptInvitation(guestId, reqInfo = {}) {
    const guest = await guestModel.findById(guestId);
    if (!guest) {
      throw new NotFoundError('Guest invitation');
    }

    if (guest.status !== 'invited') {
      throw new ValidationError('Invitation has already been processed');
    }

    const updatedGuest = await guestModel.updateStatus(guestId, 'confirmed');

    // Get event details
    const event = await eventModel.findById(guest.eventId);

    // Notify organizer
    await notificationSubject.notify({
      userId: guest.invitedBy.toString(),
      type: 'guest_invited',
      title: 'Guest Confirmed',
      message: `${guest.name || guest.email} has confirmed attendance for "${event.title}"`,
      relatedEventId: guest.eventId
    });

    return updatedGuest;
  }

  /**
   * Decline invitation
   * @param {string} guestId - Guest ID
   * @param {object} reqInfo - Request information for logging
   * @returns {Promise<object>} Updated guest
   */
  async declineInvitation(guestId, reqInfo = {}) {
    const guest = await guestModel.findById(guestId);
    if (!guest) {
      throw new NotFoundError('Guest invitation');
    }

    if (guest.status !== 'invited') {
      throw new ValidationError('Invitation has already been processed');
    }

    const updatedGuest = await guestModel.updateStatus(guestId, 'cancelled');

    // Get event details
    const event = await eventModel.findById(guest.eventId);

    // Notify organizer
    await notificationSubject.notify({
      userId: guest.invitedBy.toString(),
      type: 'guest_invited',
      title: 'Guest Declined',
      message: `${guest.name || guest.email} has declined the invitation for "${event.title}"`,
      relatedEventId: guest.eventId
    });

    return updatedGuest;
  }

  /**
   * Get guests for an event
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>}
   */
  async getEventGuests(eventId) {
    const event = await eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }

    return await guestModel.findByEvent(eventId);
  }

  /**
   * Get guest by ID
   * @param {string} guestId - Guest ID
   * @returns {Promise<object>}
   */
  async getGuestById(guestId) {
    const guest = await guestModel.findById(guestId);
    if (!guest) {
      throw new NotFoundError('Guest');
    }
    return guest;
  }
}

module.exports = new GuestService();

