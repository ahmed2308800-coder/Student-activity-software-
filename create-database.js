/**
 * Create MySQL Database
 * This script creates the sams_db database if it doesn't exist
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function createDatabase() {
  let connection;
  
  try {
    console.log('🔌 Connecting to MySQL...\n');
    
    // Connect without specifying database (to create it)
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || ''
    });

    console.log('✅ Connected to MySQL server\n');

    // Create database
    console.log('📦 Creating database "sams_db"...');
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS sams_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log('✅ Database "sams_db" created successfully!\n');

    // Switch to the database
    await connection.execute('USE sams_db');

    // Check if tables exist
    const [tables] = await connection.query('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('⚠️  Database is empty. No tables found.');
      console.log('   Run the schema migration next:');
      console.log('   mysql -u root -p sams_db < database\\schema.sql\n');
    } else {
      console.log(`✅ Found ${tables.length} tables in database:`);
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`   - ${tableName}`);
      });
      console.log('');
    }

    await connection.end();
    console.log('✅ Database setup complete!\n');
    console.log('Next step: Run the schema migration to create tables.');
    console.log('You can use: node run-schema.js (if available)');
    console.log('Or manually: mysql -u root -p sams_db < database\\schema.sql');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating database!');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check if MySQL server is running');
    console.error('2. Verify MySQL credentials in .env file');
    console.error('3. Check if MySQL user has CREATE DATABASE permission');
    console.error('4. Make sure MYSQL_PASSWORD is set in .env file\n');
    
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

createDatabase();

