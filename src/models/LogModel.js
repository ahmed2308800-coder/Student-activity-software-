/**
 * Log Model
 * Handles logging and auditing operations
 */
const BaseModel = require('./BaseModel');
const database = require('../config/database');

class LogModel extends BaseModel {
  constructor() {
    super('logs');
  }

  /**
   * Create a log entry
   * @param {object} logData - Log data
   * @returns {Promise<object>}
   */
  async create(logData) {
    // Logs table uses 'timestamp' instead of 'created_at'
    const log = {
      user_id: logData.userId ? parseInt(logData.userId) : null,
      action: logData.action,
      resource: logData.resource || null,
      resource_id: logData.resourceId ? parseInt(logData.resourceId) : null,
      details: logData.details ? JSON.stringify(logData.details) : null,
      ip_address: logData.ipAddress || null,
      user_agent: logData.userAgent || null,
      timestamp: new Date()
    };
    
    // Use direct SQL insert since logs table doesn't have created_at/updated_at
    const columns = Object.keys(log).filter(key => log[key] !== null && log[key] !== undefined);
    const placeholders = columns.map(() => '?').join(', ');
    const values = columns.map(col => log[col]);
    
    const sql = `INSERT INTO ?? (${columns.map(() => '??').join(', ')}) VALUES (${placeholders})`;
    const params = [this.tableName, ...columns, ...values];
    
    const result = await database.query(sql, params);
    return await this.findById(result.insertId);
  }

  /**
   * Find logs by user
   * @param {string|number} userId - User ID
   * @param {object} options - Query options
   * @returns {Promise<Array>}
   */
  async findByUser(userId, options = {}) {
    return await this.find(
      { userId: parseInt(userId) },
      { sort: { timestamp: -1 }, ...options }
    );
  }

  /**
   * Find logs by action
   * @param {string} action - Action type
   * @param {object} options - Query options
   * @returns {Promise<Array>}
   */
  async findByAction(action, options = {}) {
    return await this.find(
      { action },
      { sort: { timestamp: -1 }, ...options }
    );
  }

  /**
   * Map row to object with parsed JSON details
   * @param {object} row - Database row
   * @returns {object} Mapped object
   */
  mapRowToObject(row) {
    const obj = super.mapRowToObject(row);
    if (row.details && typeof row.details === 'string') {
      try {
        obj.details = JSON.parse(row.details);
      } catch (e) {
        obj.details = {};
      }
    }
    return obj;
  }
}

module.exports = new LogModel();
