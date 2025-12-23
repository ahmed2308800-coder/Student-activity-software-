/**
 * Test MySQL Connection
 * Run this script to verify MySQL connection is working
 */
require('dotenv').config();
const database = require('./src/config/database');

async function testConnection() {
  try {
    console.log('🔌 Testing MySQL connection...\n');
    
    // Check environment variables
    console.log('Environment variables:');
    console.log(`  MYSQL_HOST: ${process.env.MYSQL_HOST || 'localhost'}`);
    console.log(`  MYSQL_PORT: ${process.env.MYSQL_PORT || '3306'}`);
    console.log(`  MYSQL_USER: ${process.env.MYSQL_USER || 'root'}`);
    console.log(`  MYSQL_DATABASE: ${process.env.MYSQL_DATABASE || 'sams_db'}`);
    console.log('');

    // Connect to database
    await database.connect();
    console.log('✅ MySQL connection successful!\n');

    // Test query
    const pool = database.getPool();
    const [tables] = await pool.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `);

    console.log(`📊 Found ${tables.length} tables in database:`);
    tables.forEach(table => {
      console.log(`  - ${table.TABLE_NAME}`);
    });

    // Check required tables
    const requiredTables = ['users', 'events', 'registrations', 'notifications', 'logs', 'guests', 'attendances', 'feedbacks'];
    const existingTables = tables.map(t => t.TABLE_NAME);
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));

    if (missingTables.length > 0) {
      console.log(`\n⚠️  Missing tables: ${missingTables.join(', ')}`);
      console.log('   Please run database/schema.sql to create the tables.\n');
    } else {
      console.log('\n✅ All required tables exist!\n');
    }

    // Disconnect
    await database.disconnect();
    console.log('✅ Test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ MySQL connection failed!');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check if MySQL server is running');
    console.error('2. Verify .env file has correct MySQL credentials');
    console.error('3. Ensure database "sams_db" exists');
    console.error('4. Check user permissions\n');
    process.exit(1);
  }
}

testConnection();

