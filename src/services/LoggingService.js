/**
 * Logging Service
 * Handles application logging and auditing
 */
const logModel = require('../models/LogModel');

class LoggingService {
  /**
   * Create a log entry
   * @param {object} logData - Log data
   * @returns {Promise<object>}
   */
  async createLog(logData) {
    return await logModel.create(logData);
  }

  /**
   * Get logs with filters
   * @param {object} filters - Filter options
   * @returns {Promise<Array>}
   */
  async getLogs(filters = {}) {
    const query = {};

    if (filters.userId) {
      query.userId = filters.userId;
    }

    if (filters.action) {
      query.action = filters.action;
    }

    const options = {
      sort: { timestamp: -1 },
      limit: filters.limit ? parseInt(filters.limit) : 100,
      skip: filters.skip ? parseInt(filters.skip) : 0
    };

    return await logModel.find(query, options);
  }

  /**
   * Get logs by user
   * @param {string} userId - User ID
   * @param {object} options - Query options
   * @returns {Promise<Array>}
   */
  async getLogsByUser(userId, options = {}) {
    return await logModel.findByUser(userId, options);
  }

  /**
   * Get logs by action
   * @param {string} action - Action type
   * @param {object} options - Query options
   * @returns {Promise<Array>}
   */
  async getLogsByAction(action, options = {}) {
    return await logModel.findByAction(action, options);
  }
}

module.exports = new LoggingService();

