/**
 * Feedback Controller
 * Handles feedback HTTP requests
 */
const feedbackService = require('../services/FeedbackService');
const { getRequestInfo } = require('../middlewares/validationMiddleware');

class FeedbackController {
  /**
   * Submit feedback for an event
   * POST /api/feedbacks
   */
  async submitFeedback(req, res, next) {
    try {
      const reqInfo = getRequestInfo(req);
      const feedback = await feedbackService.submitFeedback(
        req.body.eventId,
        req.userId,
        req.body,
        reqInfo
      );
      res.status(201).json({
        success: true,
        message: 'Feedback submitted successfully',
        data: { feedback }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get feedbacks for an event
   * GET /api/feedbacks/event/:eventId
   */
  async getEventFeedbacks(req, res, next) {
    try {
      const feedbacks = await feedbackService.getEventFeedbacks(req.params.eventId);
      res.json({
        success: true,
        data: { feedbacks, count: feedbacks.length }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's feedbacks
   * GET /api/feedbacks/my-feedbacks
   */
  async getMyFeedbacks(req, res, next) {
    try {
      const feedbacks = await feedbackService.getUserFeedbacks(req.userId);
      res.json({
        success: true,
        data: { feedbacks, count: feedbacks.length }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get event feedback statistics
   * GET /api/feedbacks/event/:eventId/stats
   */
  async getEventFeedbackStats(req, res, next) {
    try {
      const stats = await feedbackService.getEventFeedbackStats(req.params.eventId);
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FeedbackController();


