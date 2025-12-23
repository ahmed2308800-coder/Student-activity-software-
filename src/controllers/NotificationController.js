/**
 * Notification Controller
 * Handles notification HTTP requests
 */
const notificationModel = require('../models/NotificationModel');

class NotificationController {
  /**
   * Get user notifications
   * GET /api/notifications
   */
  async getNotifications(req, res, next) {
    try {
      const notifications = await notificationModel.findByUser(req.userId, {
        limit: parseInt(req.query.limit) || 50,
        skip: parseInt(req.query.skip) || 0
      });
      const unreadCount = await notificationModel.countUnread(req.userId);
      res.json({
        success: true,
        data: {
          notifications,
          unreadCount,
          count: notifications.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark notification as read
   * PUT /api/notifications/:id/read
   */
  async markAsRead(req, res, next) {
    try {
      const notification = await notificationModel.markAsRead(req.params.id);
      res.json({
        success: true,
        message: 'Notification marked as read',
        data: { notification }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read
   * PUT /api/notifications/read-all
   */
  async markAllAsRead(req, res, next) {
    try {
      const count = await notificationModel.markAllAsRead(req.userId);
      res.json({
        success: true,
        message: `${count} notifications marked as read`,
        data: { count }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread notification count
   * GET /api/notifications/unread/count
   */
  async getUnreadCount(req, res, next) {
    try {
      const count = await notificationModel.countUnread(req.userId);
      res.json({
        success: true,
        data: { unreadCount: count }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send system-wide notification (Admin only)
   * POST /api/notifications/broadcast
   */
  async broadcastNotification(req, res, next) {
    try {
      const { title, message, type } = req.body;

      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message: 'Title and message are required'
        });
      }

      const userModel = require('../models/UserModel');
      const notificationSubject = require('../notifications/NotificationObserver');
      const { NOTIFICATION_TYPES } = require('../config/constants');

      // Get all users
      const users = await userModel.find({});
      
      // Send notification to each user
      let sentCount = 0;
      for (const user of users) {
        try {
          await notificationSubject.notify({
            userId: (user.id || user._id).toString(),
            type: type || NOTIFICATION_TYPES.EVENT_UPDATED,
            title,
            message,
            relatedEventId: null
          });
          sentCount++;
        } catch (error) {
          console.error(`Error sending notification to user ${user.id}:`, error);
        }
      }

      res.json({
        success: true,
        message: `System-wide notification sent to ${sentCount} users`,
        data: { sentCount, totalUsers: users.length }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();

