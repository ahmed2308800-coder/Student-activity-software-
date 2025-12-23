/**
 * Feedback Service
 * Handles feedback business logic
 */
const feedbackModel = require('../models/FeedbackModel');
const eventModel = require('../models/EventModel');
const registrationModel = require('../models/RegistrationModel');
const logModel = require('../models/LogModel');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');

class FeedbackService {
  /**
   * Submit feedback for an event
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID
   * @param {object} feedbackData - Feedback data
   * @param {object} reqInfo - Request information for logging
   * @returns {Promise<object>} Created feedback
   */
  async submitFeedback(eventId, userId, feedbackData, reqInfo = {}) {
    // Check if event exists
    const event = await eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }

    // Check if user was registered for the event
    const wasRegistered = await registrationModel.isRegistered(userId, eventId);
    if (!wasRegistered) {
      throw new ValidationError('You can only provide feedback for events you registered for');
    }

    // Check if event date has passed
    const eventDate = new Date(event.date);
    if (eventDate > new Date()) {
      throw new ValidationError('You can only provide feedback after the event has occurred');
    }

    // Check if feedback already exists
    const existingFeedback = await feedbackModel.findByUserAndEvent(userId, eventId);
    if (existingFeedback) {
      throw new ConflictError('You have already submitted feedback for this event');
    }

    // Validate rating
    if (feedbackData.rating && (feedbackData.rating < 1 || feedbackData.rating > 5)) {
      throw new ValidationError('Rating must be between 1 and 5');
    }

    // Create feedback
    const feedback = await feedbackModel.create({
      userId: parseInt(userId),
      eventId: parseInt(eventId),
      rating: feedbackData.rating || null,
      comment: feedbackData.comment || '',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Log feedback submission
    await logModel.create({
      userId,
      action: 'feedback_submitted',
      resource: 'feedback',
      resourceId: (feedback.id || feedback._id).toString(),
      ipAddress: reqInfo.ip,
      userAgent: reqInfo.userAgent
    });

    return feedback;
  }

  /**
   * Get feedbacks for an event
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>}
   */
  async getEventFeedbacks(eventId) {
    const event = await eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }

    return await feedbackModel.findByEvent(eventId);
  }

  /**
   * Get user's feedbacks
   * @param {string} userId - User ID
   * @returns {Promise<Array>}
   */
  async getUserFeedbacks(userId) {
    return await feedbackModel.findByUser(userId);
  }

  /**
   * Get event feedback statistics
   * @param {string} eventId - Event ID
   * @returns {Promise<object>}
   */
  async getEventFeedbackStats(eventId) {
    const event = await eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }

    const feedbacks = await feedbackModel.findByEvent(eventId);
    const averageRating = await feedbackModel.getAverageRating(eventId);

    return {
      totalFeedbacks: feedbacks.length,
      averageRating: parseFloat(averageRating),
      ratingDistribution: this.calculateRatingDistribution(feedbacks)
    };
  }

  /**
   * Calculate rating distribution
   * @param {Array} feedbacks - Feedback array
   * @returns {object}
   */
  calculateRatingDistribution(feedbacks) {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbacks.forEach(fb => {
      if (fb.rating) {
        distribution[fb.rating] = (distribution[fb.rating] || 0) + 1;
      }
    });
    return distribution;
  }
}

module.exports = new FeedbackService();

