/**
 * Guest Controller
 * Handles guest invitation HTTP requests
 */
const guestService = require('../services/GuestService');
const { getRequestInfo } = require('../middlewares/validationMiddleware');

class GuestController {
  /**
   * Invite a guest to an event
   * POST /api/guests
   */
  async inviteGuest(req, res, next) {
    try {
      const reqInfo = getRequestInfo(req);
      const guest = await guestService.inviteGuest(
        req.body.eventId,
        req.userId,
        req.body,
        reqInfo
      );
      res.status(201).json({
        success: true,
        message: 'Guest invited successfully',
        data: { guest }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Accept invitation
   * POST /api/guests/:id/accept
   */
  async acceptInvitation(req, res, next) {
    try {
      const reqInfo = getRequestInfo(req);
      const guest = await guestService.acceptInvitation(req.params.id, reqInfo);
      res.json({
        success: true,
        message: 'Invitation accepted',
        data: { guest }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Decline invitation
   * POST /api/guests/:id/decline
   */
  async declineInvitation(req, res, next) {
    try {
      const reqInfo = getRequestInfo(req);
      const guest = await guestService.declineInvitation(req.params.id, reqInfo);
      res.json({
        success: true,
        message: 'Invitation declined',
        data: { guest }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get guests for an event
   * GET /api/guests/event/:eventId
   */
  async getEventGuests(req, res, next) {
    try {
      const guests = await guestService.getEventGuests(req.params.eventId);
      res.json({
        success: true,
        data: { guests, count: guests.length }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get guest by ID
   * GET /api/guests/:id
   */
  async getGuestById(req, res, next) {
    try {
      const guest = await guestService.getGuestById(req.params.id);
      res.json({
        success: true,
        data: { guest }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GuestController();


