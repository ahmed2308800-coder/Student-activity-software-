/**
 * Run MySQL Schema Migration
 * This script reads and executes the schema.sql file
 */
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runSchema() {
  let connection;
  
  try {
    console.log('🔌 Connecting to MySQL...\n');
    
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'sams_db',
      multipleStatements: true // Allow multiple SQL statements
    });

    console.log('✅ Connected to MySQL\n');

    // Read schema file
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ Schema file not found:', schemaPath);
      process.exit(1);
    }

    console.log('📖 Reading schema file...');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Remove CREATE DATABASE and USE statements (we're already connected)
    const cleanedSchema = schema
      .replace(/CREATE DATABASE.*?;/gi, '')
      .replace(/USE.*?;/gi, '')
      .trim();

    if (!cleanedSchema) {
      console.error('❌ Schema file is empty or invalid');
      process.exit(1);
    }

    console.log('🚀 Executing schema migration...\n');
    
    // Execute the entire schema at once (MySQL supports multiple statements)
    try {
      await connection.query(cleanedSchema);
      console.log('✅ All tables created successfully!\n');
    } catch (error) {
      // If that fails, try executing statement by statement
      console.log('Executing statements individually...\n');
      const statements = cleanedSchema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      let successCount = 0;
      for (const statement of statements) {
        if (statement.trim() && statement.length > 10) {
          try {
            await connection.query(statement + ';');
            if (statement.toUpperCase().includes('CREATE TABLE')) {
              successCount++;
              const tableMatch = statement.match(/CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+`?(\w+)`?/i) ||
                                statement.match(/CREATE\s+TABLE\s+`?(\w+)`?/i);
              if (tableMatch) {
                console.log(`   ✅ Created table: ${tableMatch[1]}`);
              }
            }
          } catch (error) {
            // Ignore "table already exists" errors
            if (error.message.includes('already exists')) {
              // Silent skip
            } else if (!error.message.includes('Unknown database')) {
              console.warn(`   ⚠️  Warning: ${error.message.substring(0, 80)}`);
            }
          }
        }
      }
      
      if (successCount > 0) {
        console.log(`\n✅ Successfully created ${successCount} tables\n`);
      }
    }

    console.log('✅ Schema migration completed!\n');

    // Verify tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📊 Created ${tables.length} tables:`);
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   ✅ ${tableName}`);
    });

    await connection.end();
    console.log('\n✅ Database setup complete!');
    console.log('You can now run: node test-mysql-connection.js');
    console.log('Or start the server: npm start\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error running schema!');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure database "sams_db" exists (run: node create-database.js)');
    console.error('2. Check MySQL credentials in .env file');
    console.error('3. Verify schema.sql file exists\n');
    
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

runSchema();

