/**
 * Attendance Model
 * Handles event attendance tracking data operations
 */
const BaseModel = require('./BaseModel');

class AttendanceModel extends BaseModel {
  constructor() {
    super('attendances');
  }

  /**
   * Find attendance by event
   * @param {string|number} eventId - Event ID
   * @returns {Promise<Array>}
   */
  async findByEvent(eventId) {
    return await this.find({ eventId: parseInt(eventId) });
  }

  /**
   * Find attendance by user and event
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
   * Mark attendance
   * @param {object} attendanceData - Attendance data
   * @returns {Promise<object>}
   */
  async markAttendance(attendanceData) {
    const attendance = {
      userId: parseInt(attendanceData.userId),
      eventId: parseInt(attendanceData.eventId),
      status: attendanceData.status || 'present',
      markedBy: parseInt(attendanceData.markedBy),
      markedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return await super.create(attendance);
  }

  /**
   * Get attendance statistics for an event
   * @param {string|number} eventId - Event ID
   * @returns {Promise<object>}
   */
  async getEventAttendanceStats(eventId) {
    const database = require('../config/database');
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent
      FROM ??
      WHERE event_id = ?
    `;
    const result = await database.query(sql, [this.tableName, parseInt(eventId)]);
    const stats = result[0];
    
    const total = parseInt(stats.total) || 0;
    const present = parseInt(stats.present) || 0;
    const absent = parseInt(stats.absent) || 0;
    const attendanceRate = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

    return {
      total,
      present,
      absent,
      attendanceRate: parseFloat(attendanceRate)
    };
  }
}

module.exports = new AttendanceModel();
