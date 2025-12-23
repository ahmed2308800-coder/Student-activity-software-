/**
 * Abstract Base Model Class
 * Provides common database operations using MySQL
 */
const database = require('../config/database');

class BaseModel {
  constructor(tableName) {
    if (this.constructor === BaseModel) {
      throw new Error('BaseModel is abstract and cannot be instantiated directly');
    }
    this.tableName = tableName;
  }

  /**
   * Get database connection pool
   * @returns {Object} MySQL connection pool
   */
  getPool() {
    return database.getPool();
  }

  /**
   * Find document by ID
   * @param {number|string} id - Document ID
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    if (!this.isValidId(id)) {
      return null;
    }
    const sql = `SELECT * FROM ?? WHERE id = ? LIMIT 1`;
    const result = await database.query(sql, [this.tableName, parseInt(id)]);
    return result.length > 0 ? this.mapRowToObject(result[0]) : null;
  }

  /**
   * Find documents by query
   * @param {object} query - Query conditions (field: value pairs)
   * @param {object} options - Query options (sort, limit, skip)
   * @returns {Promise<Array>}
   */
  async find(query = {}, options = {}) {
    let sql = `SELECT * FROM ??`;
    const params = [this.tableName];
    const conditions = [];

    // Handle top-level $or operator
    if (query.$or && Array.isArray(query.$or)) {
      const orConditions = [];
      for (const orQuery of query.$or) {
        const orClause = this.buildWhereClause(orQuery, params);
        if (orClause) {
          orConditions.push(`(${orClause})`);
        }
      }
      if (orConditions.length > 0) {
        conditions.push(`(${orConditions.join(' OR ')})`);
      }
      
      // Remove $or from query for remaining conditions
      const { $or, ...restQuery } = query;
      query = restQuery;
    }

    // Build WHERE clause for remaining conditions
    if (Object.keys(query).length > 0) {
      const whereClause = this.buildWhereClause(query, params);
      if (whereClause) {
        conditions.push(whereClause);
      }
    }

    // Combine all conditions
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

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
    return results.map(row => this.mapRowToObject(row));
  }

  /**
   * Find one document by query
   * @param {object} query - Query conditions
   * @returns {Promise<object|null>}
   */
  async findOne(query) {
    const results = await this.find(query, { limit: 1 });
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Create a new document
   * @param {object} data - Document data
   * @returns {Promise<object>}
   */
  async create(data) {
    // Remove id if present (auto-increment)
    const cleanData = { ...data };
    delete cleanData.id;
    delete cleanData._id;

    // Add timestamps if not present
    if (!cleanData.created_at && !cleanData.createdAt) {
      cleanData.created_at = new Date();
    }
    if (!cleanData.updated_at && !cleanData.updatedAt) {
      cleanData.updated_at = new Date();
    }

    // Convert camelCase to snake_case for database
    const dbData = this.toSnakeCase(cleanData);

    const columns = Object.keys(dbData);
    const placeholders = columns.map(() => '?').join(', ');
    const values = columns.map(col => dbData[col]);

    const sql = `INSERT INTO ?? (${columns.map(() => '??').join(', ')}) VALUES (${placeholders})`;
    const params = [this.tableName, ...columns, ...values];

    const result = await database.query(sql, params);
    return await this.findById(result.insertId);
  }

  /**
   * Update document by ID
   * @param {number|string} id - Document ID
   * @param {object} data - Update data
   * @returns {Promise<object|null>}
   */
  async updateById(id, data) {
    if (!this.isValidId(id)) {
      return null;
    }

    // Remove id from update data
    const cleanData = { ...data };
    delete cleanData.id;
    delete cleanData._id;

    // Add updated_at timestamp
    cleanData.updated_at = new Date();

    // Convert camelCase to snake_case
    const dbData = this.toSnakeCase(cleanData);

    const columns = Object.keys(dbData);
    if (columns.length === 0) {
      return await this.findById(id);
    }

    const setClause = columns.map(() => '?? = ?').join(', ');
    const values = columns.flatMap(col => [col, dbData[col]]);

    const sql = `UPDATE ?? SET ${setClause} WHERE id = ?`;
    const params = [this.tableName, ...values, parseInt(id)];

    const result = await database.query(sql, params);
    
    if (result.affectedRows === 0) {
      return null;
    }

    return await this.findById(id);
  }

  /**
   * Delete document by ID
   * @param {number|string} id - Document ID
   * @returns {Promise<boolean>}
   */
  async deleteById(id) {
    if (!this.isValidId(id)) {
      return false;
    }

    const sql = `DELETE FROM ?? WHERE id = ?`;
    const result = await database.query(sql, [this.tableName, parseInt(id)]);
    return result.affectedRows > 0;
  }

  /**
   * Count documents
   * @param {object} query - Query conditions
   * @returns {Promise<number>}
   */
  async count(query = {}) {
    let sql = `SELECT COUNT(*) as count FROM ??`;
    const params = [this.tableName];
    const conditions = [];

    // Handle top-level $or operator
    if (query.$or && Array.isArray(query.$or)) {
      const orConditions = [];
      for (const orQuery of query.$or) {
        const orClause = this.buildWhereClause(orQuery, params);
        if (orClause) {
          orConditions.push(`(${orClause})`);
        }
      }
      if (orConditions.length > 0) {
        conditions.push(`(${orConditions.join(' OR ')})`);
      }
      
      // Remove $or from query for remaining conditions
      const { $or, ...restQuery } = query;
      query = restQuery;
    }

    // Build WHERE clause for remaining conditions
    if (Object.keys(query).length > 0) {
      const whereClause = this.buildWhereClause(query, params);
      if (whereClause) {
        conditions.push(whereClause);
      }
    }

    // Combine all conditions
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    const result = await database.query(sql, params);
    return result[0].count;
  }

  /**
   * Build WHERE clause from query object
   * @param {object} query - Query conditions
   * @param {Array} params - Parameters array (modified in place)
   * @returns {string} WHERE clause
   */
  buildWhereClause(query, params) {
    const conditions = [];

    for (const [key, value] of Object.entries(query)) {
      const dbKey = this.toSnakeCaseKey(key);

      if (value === null) {
        conditions.push(`?? IS NULL`);
        params.push(dbKey);
      } else if (value === undefined) {
        continue; // Skip undefined values
      } else if (Array.isArray(value)) {
        // Handle $in operator: { field: [1, 2, 3] }
        const placeholders = value.map(() => '?').join(', ');
        conditions.push(`?? IN (${placeholders})`);
        params.push(dbKey, ...value);
      } else if (typeof value === 'object' && value !== null) {
        // Handle MongoDB-style operators
        if (value.$ne !== undefined) {
          conditions.push(`?? != ?`);
          params.push(dbKey, value.$ne);
        } else if (value.$gte !== undefined) {
          conditions.push(`?? >= ?`);
          params.push(dbKey, value.$gte);
        } else if (value.$lte !== undefined) {
          conditions.push(`?? <= ?`);
          params.push(dbKey, value.$lte);
        } else if (value.$gt !== undefined) {
          conditions.push(`?? > ?`);
          params.push(dbKey, value.$gt);
        } else if (value.$lt !== undefined) {
          conditions.push(`?? < ?`);
          params.push(dbKey, value.$lt);
        } else if (value.$regex !== undefined) {
          // Convert regex to LIKE
          const pattern = value.$regex.replace(/[%_]/g, '\\$&'); // Escape special chars
          const likePattern = value.$options === 'i' 
            ? `LOWER(??) LIKE LOWER(?)` 
            : `?? LIKE ?`;
          conditions.push(likePattern);
          params.push(dbKey, `%${pattern}%`);
        } else if (value.$or) {
          // Handle $or operator
          const orConditions = [];
          for (const orQuery of value.$or) {
            const orClause = this.buildWhereClause(orQuery, params);
            if (orClause) {
              orConditions.push(`(${orClause})`);
            }
          }
          if (orConditions.length > 0) {
            conditions.push(`(${orConditions.join(' OR ')})`);
          }
        } else {
          // Nested object - treat as equals for now
          conditions.push(`?? = ?`);
          params.push(dbKey, JSON.stringify(value));
        }
      } else {
        // Simple equality
        conditions.push(`?? = ?`);
        params.push(dbKey, value);
      }
    }

    return conditions.length > 0 ? conditions.join(' AND ') : null;
  }

  /**
   * Build ORDER BY clause
   * @param {object} sort - Sort object { field: 1/-1 }
   * @returns {string} ORDER BY clause
   */
  buildSortClause(sort) {
    const clauses = [];
    const params = [];
    for (const [key, direction] of Object.entries(sort)) {
      const dbKey = this.toSnakeCaseKey(key);
      const dir = direction === -1 ? 'DESC' : 'ASC';
      clauses.push(`?? ${dir}`);
      params.push(dbKey);
    }
    // For ORDER BY, we need to use the column names directly since pool.query handles ?? differently
    // We'll build the clause with actual column names
    const columnNames = [];
    for (const [key, direction] of Object.entries(sort)) {
      const dbKey = this.toSnakeCaseKey(key);
      const dir = direction === -1 ? 'DESC' : 'ASC';
      // Escape column name to prevent SQL injection
      columnNames.push(`\`${dbKey}\` ${dir}`);
    }
    return columnNames.length > 0 ? `ORDER BY ${columnNames.join(', ')}` : null;
  }

  /**
   * Convert camelCase object keys to snake_case
   * @param {object} obj - Object with camelCase keys
   * @returns {object} Object with snake_case keys
   */
  toSnakeCase(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[this.toSnakeCaseKey(key)] = value;
    }
    return result;
  }

  /**
   * Convert camelCase key to snake_case
   * @param {string} key - camelCase key
   * @returns {string} snake_case key
   */
  toSnakeCaseKey(key) {
    // Handle special cases
    if (key === '_id') return 'id';
    if (key === 'createdAt') return 'created_at';
    if (key === 'updatedAt') return 'updated_at';
    
    // Convert camelCase to snake_case
    return key.replace(/([A-Z])/g, '_$1').toLowerCase();
  }

  /**
   * Map database row to object (convert snake_case to camelCase)
   * @param {object} row - Database row
   * @returns {object} Mapped object
   */
  mapRowToObject(row) {
    if (!row) return null;

    const obj = {};
    for (const [key, value] of Object.entries(row)) {
      // Convert snake_case to camelCase
      const camelKey = this.toCamelCaseKey(key);
      obj[camelKey] = value;
      
      // Also add _id for compatibility
      if (key === 'id') {
        obj._id = value;
      }
    }
    return obj;
  }

  /**
   * Convert snake_case key to camelCase
   * @param {string} key - snake_case key
   * @returns {string} camelCase key
   */
  toCamelCaseKey(key) {
    // Handle special cases
    if (key === 'id') return 'id'; // Keep id as is, but also add _id
    if (key === 'created_at') return 'createdAt';
    if (key === 'updated_at') return 'updatedAt';
    
    // Convert snake_case to camelCase
    return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * Validate ID
   * @param {number|string} id - ID to validate
   * @returns {boolean}
   */
  isValidId(id) {
    if (id === null || id === undefined) return false;
    const numId = parseInt(id);
    return !isNaN(numId) && numId > 0;
  }

  /**
   * Convert string to integer ID
   * @param {string|number} id - ID
   * @returns {number}
   */
  toId(id) {
    return parseInt(id);
  }
}

module.exports = BaseModel;
