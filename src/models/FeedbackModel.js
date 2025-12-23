/**
 * Feedback Model
 * Handles event feedback data operations
 */
const BaseModel = require('./BaseModel');

class FeedbackModel extends BaseModel {
  constructor() {
    super('feedbacks');
  }

  /**
   * Find feedbacks by event
   * @param {string|number} eventId - Event ID
   * @returns {Promise<Array>}
   */
  async findByEvent(eventId) {
    return await this.find({ eventId: parseInt(eventId) });
  }

  /**
   * Find feedbacks by user
   * @param {string|number} userId - User ID
   * @returns {Promise<Array>}
   */
  async findByUser(userId) {
    return await this.find({ userId: parseInt(userId) });
  }

  /**
   * Find feedback by user and event
   * @param {string|number} userId - User ID
   * @param {string|number} eventId - Event ID
   * @returns {Promise<object|null>}
   */
  async findByUserAndEvent(userId, eventId) {
    return await this.findOne({
      userId: parseInt(userId),
      eventId: parseInt(eventId)
    });
  }

  /**
   * Get average rating for an event
   * @param {string|number} eventId - Event ID
   * @returns {Promise<number>}
   */
  async getAverageRating(eventId) {
    const database = require('../config/database');
    const sql = `
      SELECT AVG(rating) as avg_rating
      FROM ??
      WHERE event_id = ? AND rating IS NOT NULL
    `;
    const result = await database.query(sql, [this.tableName, parseInt(eventId)]);
    const avg = result[0].avg_rating;
    return avg ? parseFloat(avg).toFixed(2) : '0.00';
  }

  /**
   * Create feedback
   * @param {object} feedbackData - Feedback data
   * @returns {Promise<object>}
   */
  async create(feedbackData) {
    const feedback = {
      userId: parseInt(feedbackData.userId),
      eventId: parseInt(feedbackData.eventId),
      rating: feedbackData.rating || null,
      comment: feedbackData.comment || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return await super.create(feedback);
  }
}

module.exports = new FeedbackModel();
