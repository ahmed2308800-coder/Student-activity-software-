/**
 * Event Controller
 * Handles event-related HTTP requests
 */
const eventService = require('../services/EventService');
const { getRequestInfo } = require('../middlewares/validationMiddleware');

class EventController {
  /**
   * Create a new event
   * POST /api/events
   */
  async createEvent(req, res, next) {
    try {
      const reqInfo = getRequestInfo(req);
      const event = await eventService.createEvent(req.body, req.userId, reqInfo);
      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: { event }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all events
   * GET /api/events
   */
  async getEvents(req, res, next) {
    try {
      const events = await eventService.getEvents(req.query);
      res.json({
        success: true,
        data: { events, count: events.length }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get event by ID
   * GET /api/events/:id
   */
  async getEventById(req, res, next) {
    try {
      const event = await eventService.getEventById(req.params.id);
      res.json({
        success: true,
        data: { event }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update event
   * PUT /api/events/:id
   */
  async updateEvent(req, res, next) {
    try {
      const reqInfo = getRequestInfo(req);
      const event = await eventService.updateEvent(
        req.params.id,
        req.body,
        req.userId,
        req.userRole,
        reqInfo
      );
      res.json({
        success: true,
        message: 'Event updated successfully',
        data: { event }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete event
   * DELETE /api/events/:id
   */
  async deleteEvent(req, res, next) {
    try {
      const reqInfo = getRequestInfo(req);
      await eventService.deleteEvent(req.params.id, req.userId, req.userRole, reqInfo);
      res.json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Approve event (Admin only)
   * POST /api/events/:id/approve
   */
  async approveEvent(req, res, next) {
    try {
      const reqInfo = getRequestInfo(req);
      const event = await eventService.approveEvent(req.params.id, req.userId, reqInfo);
      res.json({
        success: true,
        message: 'Event approved successfully',
        data: { event }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject event (Admin only)
   * POST /api/events/:id/reject
   */
  async rejectEvent(req, res, next) {
    try {
      const reqInfo = getRequestInfo(req);
      const { reason } = req.body;
      const event = await eventService.rejectEvent(req.params.id, reason, req.userId, reqInfo);
      res.json({
        success: true,
        message: 'Event rejected successfully',
        data: { event }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get pending events (Admin only)
   * GET /api/events/pending
   */
  async getPendingEvents(req, res, next) {
    try {
      const events = await eventService.getPendingEvents();
      res.json({
        success: true,
        data: { events, count: events.length }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send notification to all registered participants (Club Rep or Admin)
   * POST /api/events/:id/notify-participants
   */
  async notifyParticipants(req, res, next) {
    try {
      const { message, title } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'Message is required'
        });
      }

      const registrationModel = require('../models/RegistrationModel');
      const notificationSubject = require('../notifications/NotificationObserver');
      const { NOTIFICATION_TYPES } = require('../config/constants');

      // Get event to verify it exists and user has permission
      const event = await eventService.getEventById(req.params.id);
      
      // Check if user is event creator or admin
      if (req.userRole !== 'admin' && event.createdBy.toString() !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only send notifications for your own events'
        });
      }

      // Get all registrations for this event
      const registrations = await registrationModel.findByEvent(req.params.id);
      
      // Send notification to each registered user
      let sentCount = 0;
      for (const registration of registrations) {
        try {
          await notificationSubject.notify({
            userId: registration.userId.toString(),
            type: NOTIFICATION_TYPES.EVENT_UPDATED,
            title: title || `Update: ${event.title}`,
            message,
            relatedEventId: req.params.id
          });
          sentCount++;
        } catch (error) {
          console.error(`Error sending notification to user ${registration.userId}:`, error);
        }
      }

      res.json({
        success: true,
        message: `Notification sent to ${sentCount} registered participants`,
        data: { sentCount, totalParticipants: registrations.length, eventId: req.params.id }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EventController();

