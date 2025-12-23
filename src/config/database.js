/**
 * MySQL Connection Singleton Pattern
 * Ensures only one database connection pool exists throughout the application
 */
const mysql = require('mysql2/promise');

class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }

    this.pool = null;
    this.isConnected = false;
    Database.instance = this;
  }

  /**
   * Connect to MySQL
   * @returns {Promise<void>}
   */
  async connect() {
    if (this.isConnected && this.pool) {
      return;
    }

    try {
      // Parse MySQL connection string or use individual config
      const config = this.parseConnectionString();

      // Create connection pool
      this.pool = mysql.createPool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      });

      // Test connection
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();

      this.isConnected = true;

      // Create indexes (MySQL indexes are created in schema, but we can verify)
      await this.verifySchema();

      console.log('✅ MySQL connected successfully');
    } catch (error) {
      console.error('❌ MySQL connection error:', error);
      throw error;
    }
  }

  /**
   * Parse MySQL connection string or use environment variables
   * @returns {object} Connection config
   */
  parseConnectionString() {
    // Support MySQL connection string format: mysql://user:password@host:port/database
    const mysqlUri = process.env.MYSQL_URI || process.env.DATABASE_URL;
    
    if (mysqlUri && mysqlUri.startsWith('mysql://')) {
      const url = new URL(mysqlUri);
      return {
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1) // Remove leading /
      };
    }

    // Use individual environment variables
    return {
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'sams_db'
    };
  }

  /**
   * Verify database schema exists
   * @returns {Promise<void>}
   */
  async verifySchema() {
    try {
      const connection = await this.pool.getConnection();
      
      // Check if tables exist
      const [tables] = await connection.execute(`
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE()
      `);

      const tableNames = tables.map(t => t.TABLE_NAME);
      const requiredTables = ['users', 'events', 'registrations', 'notifications', 'logs', 'guests', 'attendances', 'feedbacks'];
      const missingTables = requiredTables.filter(t => !tableNames.includes(t));

      if (missingTables.length > 0) {
        console.warn(`⚠️  Missing tables: ${missingTables.join(', ')}`);
        console.warn('⚠️  Please run database/schema.sql to create the tables');
      } else {
        console.log('✅ Database schema verified');
      }

      connection.release();
    } catch (error) {
      console.error('❌ Error verifying schema:', error);
    }
  }

  /**
   * Get connection pool
   * @returns {Object} MySQL connection pool
   */
  getPool() {
    if (!this.isConnected || !this.pool) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.pool;
  }

  /**
   * Execute a query
   * @param {string} sql - SQL query with ?? placeholders for identifiers
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} Query results
   */
  async query(sql, params = []) {
    const pool = this.getPool();
    // Replace ?? with actual values for table/column names
    // mysql2's query() method supports ?? for identifiers
    const [results] = await pool.query(sql, params);
    return results;
  }

  /**
   * Execute a query and return first row
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<object|null>} First row or null
   */
  async queryOne(sql, params = []) {
    const results = await this.query(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Begin a transaction
   * @returns {Promise<object>} Transaction connection
   */
  async beginTransaction() {
    const pool = this.getPool();
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    return connection;
  }

  /**
   * Commit a transaction
   * @param {object} connection - Transaction connection
   * @returns {Promise<void>}
   */
  async commitTransaction(connection) {
    await connection.commit();
    connection.release();
  }

  /**
   * Rollback a transaction
   * @param {object} connection - Transaction connection
   * @returns {Promise<void>}
   */
  async rollbackTransaction(connection) {
    await connection.rollback();
    connection.release();
  }

  /**
   * Disconnect from MySQL
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
      this.pool = null;
      console.log('✅ MySQL disconnected');
    }
  }
}

// Export singleton instance
module.exports = new Database();
