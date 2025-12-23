/**
 * Notification Model
 * Handles notification data operations
 */
const BaseModel = require('./BaseModel');

class NotificationModel extends BaseModel {
  constructor() {
    super('notifications');
  }

  /**
   * Find notifications by user
   * @param {string|number} userId - User ID
   * @param {object} options - Query options
   * @returns {Promise<Array>}
   */
  async findByUser(userId, options = {}) {
    return await this.find(
      { userId: parseInt(userId) },
      { sort: { createdAt: -1 }, ...options }
    );
  }

  /**
   * Mark notification as read
   * @param {string|number} id - Notification ID
   * @returns {Promise<object|null>}
   */
  async markAsRead(id) {
    return await this.updateById(id, { read: true });
  }

  /**
   * Mark all user notifications as read
   * @param {string|number} userId - User ID
   * @returns {Promise<number>} Number of updated notifications
   */
  async markAllAsRead(userId) {
    const database = require('../config/database');
    // notifications table does not have updated_at; only set read flag
    const sql = `UPDATE ?? SET \`read\` = TRUE WHERE user_id = ? AND \`read\` = FALSE`;
    const result = await database.query(sql, [this.tableName, parseInt(userId)]);
    return result.affectedRows;
  }

  /**
   * Count unread notifications for user
   * @param {string|number} userId - User ID
   * @returns {Promise<number>}
   */
  async countUnread(userId) {
    return await this.count({
      userId: parseInt(userId),
      read: false
    });
  }

  /**
   * Create notification
   * @param {object} notificationData - Notification data
   * @returns {Promise<object>}
   */
  async create(notificationData) {
    const notification = {
      ...notificationData,
      userId: notificationData.userId ? parseInt(notificationData.userId) : null,
      relatedEventId: notificationData.relatedEventId ? parseInt(notificationData.relatedEventId) : null,
      read: notificationData.read || false,
      createdAt: new Date()
    };
    return await super.create(notification);
  }
}

module.exports = new NotificationModel();
