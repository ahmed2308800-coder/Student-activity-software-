/**
 * Attendance Controller
 * Handles attendance tracking HTTP requests
 */
const attendanceService = require('../services/AttendanceService');
const { getRequestInfo } = require('../middlewares/validationMiddleware');

class AttendanceController {
  /**
   * Mark attendance for a user
   * POST /api/attendances
   */
  async markAttendance(req, res, next) {
    try {
      const reqInfo = getRequestInfo(req);
      const attendance = await attendanceService.markAttendance(
        req.body.eventId,
        req.body.userId,
        req.userId,
        req.body.status || 'present',
        reqInfo
      );
      res.status(201).json({
        success: true,
        message: 'Attendance marked successfully',
        data: { attendance }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark attendance for multiple users
   * POST /api/attendances/bulk
   */
  async markBulkAttendance(req, res, next) {
    try {
      const reqInfo = getRequestInfo(req);
      const result = await attendanceService.markBulkAttendance(
        req.body.eventId,
        req.body.userIds,
        req.userId,
        req.body.status || 'present',
        reqInfo
      );
      res.status(201).json({
        success: true,
        message: `Attendance marked for ${result.results.length} users`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get attendance for an event
   * GET /api/attendances/event/:eventId
   */
  async getEventAttendance(req, res, next) {
    try {
      const attendances = await attendanceService.getEventAttendance(req.params.eventId);
      res.json({
        success: true,
        data: { attendances, count: attendances.length }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get attendance statistics for an event
   * GET /api/attendances/event/:eventId/stats
   */
  async getEventAttendanceStats(req, res, next) {
    try {
      const stats = await attendanceService.getEventAttendanceStats(req.params.eventId);
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AttendanceController();

