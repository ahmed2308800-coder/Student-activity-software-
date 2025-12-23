/**
 * Test Setup
 * Global test configuration
 */
require('dotenv').config({ path: '.env.test' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
process.env.MYSQL_PORT = process.env.MYSQL_PORT || '3306';
process.env.MYSQL_USER = process.env.MYSQL_USER || 'root';
process.env.MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
process.env.MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'sams_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

// Increase timeout for async operations
jest.setTimeout(10000);

