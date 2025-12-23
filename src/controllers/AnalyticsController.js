/**
 * Analytics Controller
 * Handles analytics HTTP requests (Admin only)
 */
const analyticsService = require('../services/AnalyticsService');

class AnalyticsController {
  /**
   * Get dashboard statistics
   * GET /api/analytics/dashboard
   */
  async getDashboardStats(req, res, next) {
    try {
      const stats = await analyticsService.getDashboardStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get events statistics
   * GET /api/analytics/events
   */
  async getEventsStats(req, res, next) {
    try {
      const stats = await analyticsService.getEventsStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get participation statistics
   * GET /api/analytics/participation
   */
  async getParticipationStats(req, res, next) {
    try {
      const stats = await analyticsService.getParticipationStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();

