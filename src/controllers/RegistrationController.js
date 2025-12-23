/**
 * Registration Controller
 * Handles event registration HTTP requests
 */
const registrationService = require('../services/RegistrationService');
const { getRequestInfo } = require('../middlewares/validationMiddleware');

class RegistrationController {
  /**
   * Register for an event
   * POST /api/registrations
   */
  async registerForEvent(req, res, next) {
    try {
      const reqInfo = getRequestInfo(req);
      const registration = await registrationService.registerForEvent(
        req.body.eventId,
        req.userId,
        reqInfo
      );
      res.status(201).json({
        success: true,
        message: 'Successfully registered for event',
        data: { registration }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel registration
   * DELETE /api/registrations/:eventId
   */
  async cancelRegistration(req, res, next) {
    try {
      const reqInfo = getRequestInfo(req);
      await registrationService.cancelRegistration(req.params.eventId, req.userId, reqInfo);
      res.json({
        success: true,
        message: 'Registration cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user registrations
   * GET /api/registrations/my-registrations
   */
  async getMyRegistrations(req, res, next) {
    try {
      const registrations = await registrationService.getUserRegistrations(req.userId);
      res.json({
        success: true,
        data: { registrations, count: registrations.length }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get event registrations (Club Rep or Admin)
   * GET /api/registrations/event/:eventId
   */
  async getEventRegistrations(req, res, next) {
    try {
      const registrations = await registrationService.getEventRegistrations(req.params.eventId);
      res.json({
        success: true,
        data: { registrations, count: registrations.length }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if user is registered
   * GET /api/registrations/check/:eventId
   */
  async checkRegistration(req, res, next) {
    try {
      const isRegistered = await registrationService.isRegistered(
        req.userId,
        req.params.eventId
      );
      res.json({
        success: true,
        data: { isRegistered }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RegistrationController();

