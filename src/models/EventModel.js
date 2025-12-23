/**
 * Event Model
 * Handles event data operations
 */
const BaseModel = require('./BaseModel');
const database = require('../config/database');
const { EVENT_STATUS } = require('../config/constants');

class EventModel extends BaseModel {
  constructor() {
    super('events');
  }

  /**
   * Find events by creator
   * @param {string|number} userId - User ID
   * @returns {Promise<Array>}
   */
  async findByCreator(userId) {
    return await this.find({ createdBy: parseInt(userId) });
  }

  /**
   * Find events by status
   * @param {string} status - Event status
   * @returns {Promise<Array>}
   */
  async findByStatus(status) {
    return await this.find({ status });
  }

  /**
   * Find approved events
   * @param {object} options - Query options
   * @returns {Promise<Array>}
   */
  async findApprovedEvents(options = {}) {
    return await this.find(
      { status: EVENT_STATUS.APPROVED },
      { sort: { date: 1 }, ...options }
    );
  }

  /**
   * Find pending events
   * @returns {Promise<Array>}
   */
  async findPendingEvents() {
    return await this.find(
      { status: EVENT_STATUS.PENDING },
      { sort: { createdAt: -1 } }
    );
  }

  /**
   * Check if event title exists (for duplicate detection)
   * @param {string} title - Event title
   * @param {string|number} excludeId - Event ID to exclude from check
   * @returns {Promise<boolean>}
   */
  async titleExists(title, excludeId = null) {
    const query = { title: title.trim() };
    if (excludeId) {
      query.id = { $ne: parseInt(excludeId) };
    }
    const event = await this.findOne(query);
    return event !== null;
  }

  /**
   * Get events with registration count
   * @param {object} query - Query conditions
   * @param {object} options - Query options
   * @returns {Promise<Array>}
   */
  async findWithRegistrationCount(query = {}, options = {}) {
    // Build base query
    let sql = `
      SELECT e.*, 
             COUNT(r.id) as registration_count,
             (e.max_seats - COUNT(r.id)) as available_seats
      FROM ?? e
      LEFT JOIN registrations r ON e.id = r.event_id
    `;
    const params = [this.tableName];

    // Build WHERE clause for basic filters
    const conditions = [];
    const whereClause = this.buildWhereClause(query, params);
    if (whereClause) {
      conditions.push(whereClause);
    }

    // Add search condition (title/description) if provided
    if (options.search) {
      const searchValue = `%${options.search}%`;
      conditions.push(`(e.title LIKE ? OR e.description LIKE ?)`);
      params.push(searchValue, searchValue);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Group by event id
    sql += ` GROUP BY e.id`;

    // Add ORDER BY
    if (options.sort) {
      const sortClause = this.buildSortClause(options.sort);
      if (sortClause) {
        sql += ` ${sortClause}`;
      }
    }

    // Add LIMIT and OFFSET
    if (options.limit) {
      sql += ` LIMIT ?`;
      params.push(parseInt(options.limit));
      
      if (options.skip) {
        sql += ` OFFSET ?`;
        params.push(parseInt(options.skip));
      }
    }

    const results = await database.query(sql, params);
    return results.map(row => {
      const event = this.mapRowToObject(row);
      event.registrationCount = parseInt(row.registration_count) || 0;
      event.availableSeats = parseInt(row.available_seats) || 0;
      // Map location columns back to object
      if (row.location_name) {
        event.location = {
          name: row.location_name,
          address: row.location_address || ''
        };
      }
      return event;
    });
  }

  /**
   * Create event with location handling
   * @param {object} eventData - Event data
   * @returns {Promise<object>}
   */
  async create(eventData) {
    // Convert location object to columns
    const dbData = { ...eventData };
    if (eventData.location) {
      dbData.location_name = eventData.location.name;
      dbData.location_address = eventData.location.address || '';
      delete dbData.location;
    }
    if (eventData.createdBy) {
      dbData.created_by = parseInt(eventData.createdBy);
      delete dbData.createdBy;
    }
    return await super.create(dbData);
  }

  /**
   * Update event with location handling
   * @param {string|number} id - Event ID
   * @param {object} data - Update data
   * @returns {Promise<object|null>}
   */
  async updateById(id, data) {
    const dbData = { ...data };
    if (data.location) {
      dbData.location_name = data.location.name;
      dbData.location_address = data.location.address || '';
      delete dbData.location;
    }
    if (data.createdBy) {
      dbData.created_by = parseInt(data.createdBy);
      delete dbData.createdBy;
    }
    return await super.updateById(id, dbData);
  }

  /**
   * Map row to object with location
   * @param {object} row - Database row
   * @returns {object} Mapped object
   */
  mapRowToObject(row) {
    const obj = super.mapRowToObject(row);
    if (row.location_name) {
      obj.location = {
        name: row.location_name,
        address: row.location_address || ''
      };
    }
    if (row.created_by) {
      obj.createdBy = row.created_by;
    }
    return obj;
  }
}

module.exports = new EventModel();
