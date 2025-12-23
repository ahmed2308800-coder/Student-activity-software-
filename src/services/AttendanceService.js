/**
 * Attendance Service
 * Handles attendance tracking business logic
 */
const attendanceModel = require('../models/AttendanceModel');
const eventModel = require('../models/EventModel');
const registrationModel = require('../models/RegistrationModel');
const logModel = require('../models/LogModel');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');

class AttendanceService {
  /**
   * Mark attendance for a registered user
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID to mark attendance for
   * @param {string} markerId - User ID marking the attendance (Club Rep or Admin)
   * @param {string} status - Attendance status (present/absent)
   * @param {object} reqInfo - Request information for logging
   * @returns {Promise<object>} Attendance record
   */
  async markAttendance(eventId, userId, markerId, status = 'present', reqInfo = {}) {
    // Check if event exists
    const event = await eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }

    // Check if user was registered for the event
    const wasRegistered = await registrationModel.isRegistered(userId, eventId);
    if (!wasRegistered) {
      throw new ValidationError('User must be registered for the event to mark attendance');
    }

    // Check if attendance already marked
    const existingAttendance = await attendanceModel.findByUserAndEvent(userId, eventId);
    if (existingAttendance) {
      throw new ConflictError('Attendance has already been marked for this user');
    }

    // Validate status
    if (!['present', 'absent'].includes(status)) {
      throw new ValidationError('Status must be "present" or "absent"');
    }

    // Mark attendance
    const attendance = await attendanceModel.markAttendance({
      userId,
      eventId,
      status,
      markedBy: markerId
    });

    // Log attendance marking
    await logModel.create({
      userId: markerId,
      action: 'attendance_marked',
      resource: 'attendance',
      resourceId: (attendance.id || attendance._id).toString(),
      details: { eventId, userId, status },
      ipAddress: reqInfo.ip,
      userAgent: reqInfo.userAgent
    });

    return attendance;
  }

  /**
   * Mark attendance for multiple users
   * @param {string} eventId - Event ID
   * @param {Array} userIds - Array of user IDs
   * @param {string} markerId - User ID marking the attendance
   * @param {string} status - Attendance status
   * @param {object} reqInfo - Request information for logging
   * @returns {Promise<Array>} Attendance records
   */
  async markBulkAttendance(eventId, userIds, markerId, status = 'present', reqInfo = {}) {
    const results = [];
    const errors = [];

    for (const userId of userIds) {
      try {
        const attendance = await this.markAttendance(eventId, userId, markerId, status, reqInfo);
        results.push(attendance);
      } catch (error) {
        errors.push({ userId, error: error.message });
      }
    }

    return { results, errors };
  }

  /**
   * Get attendance for an event
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>}
   */
  async getEventAttendance(eventId) {
    const event = await eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }

    return await attendanceModel.findByEvent(eventId);
  }

  /**
   * Get attendance statistics for an event
   * @param {string} eventId - Event ID
   * @returns {Promise<object>}
   */
  async getEventAttendanceStats(eventId) {
    const event = await eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }

    const stats = await attendanceModel.getEventAttendanceStats(eventId);
    const totalRegistrations = await registrationModel.countByEvent(eventId);

    return {
      ...stats,
      totalRegistrations,
      notMarked: totalRegistrations - stats.total
    };
  }
}

module.exports = new AttendanceService();

