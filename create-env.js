/**
 * Create .env file for MySQL configuration
 * Run: node create-env.js
 */
const fs = require('fs');
const path = require('path');

const envContent = `# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=sams_db

# Alternative: Use connection string format
# MYSQL_URI=mysql://user:password@localhost:3306/sams_db

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Backup Configuration
BACKUP_DIR=./backups
BACKUP_SCHEDULE=0 0 * * 0

# Event Reminder Schedule (cron format)
REMINDER_SCHEDULE=0 9 * * *
`;

const envPath = path.join(__dirname, '.env');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  console.log('   If you want to recreate it, delete it first and run this script again.');
  process.exit(0);
}

// Create .env file
try {
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✅ .env file created successfully!');
  console.log('');
  console.log('📝 Next steps:');
  console.log('1. Edit .env file and add your MySQL password:');
  console.log('   MYSQL_PASSWORD=your_actual_password');
  console.log('');
  console.log('2. Update JWT_SECRET for production:');
  console.log('   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production');
  console.log('');
  console.log('3. Test connection:');
  console.log('   node test-mysql-connection.js');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
}

