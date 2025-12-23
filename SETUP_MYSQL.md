# MySQL Setup Guide - Step by Step

Follow these steps to complete the MySQL migration setup.

## Step 1: Install MySQL

### Windows

1. **Download MySQL:**
   - Go to: https://dev.mysql.com/downloads/mysql/
   - Download MySQL Installer for Windows
   - Choose "Full" installation

2. **Install MySQL:**
   - Run the installer
   - Choose "Developer Default" setup type
   - Complete the installation wizard
   - Set root password (remember this!)

3. **Verify Installation:**
   ```powershell
   mysql --version
   ```

### macOS

```bash
# Using Homebrew
brew install mysql
brew services start mysql

# Verify
mysql --version
```

### Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# Verify
mysql --version
```

---

## Step 2: Create Database and User

### Option A: Using MySQL Command Line

1. **Login to MySQL:**
   ```bash
   mysql -u root -p
   ```
   (Enter your root password when prompted)

2. **Create Database:**
   ```sql
   CREATE DATABASE sams_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **Create User (Optional but Recommended):**
   ```sql
   CREATE USER 'sams_user'@'localhost' IDENTIFIED BY 'your_secure_password';
   GRANT ALL PRIVILEGES ON sams_db.* TO 'sams_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

### Option B: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Click "Create a new schema" (database icon)
4. Name it `sams_db`
5. Set charset to `utf8mb4` and collation to `utf8mb4_unicode_ci`
6. Click "Apply"

---

## Step 3: Run Schema Migration

### Option A: Command Line

```bash
# Windows PowerShell
mysql -u root -p sams_db < database\schema.sql

# macOS/Linux
mysql -u root -p sams_db < database/schema.sql
```

**Or using the migration file:**
```bash
mysql -u root -p sams_db < database/migrations/001_initial_schema.sql
```

### Option B: MySQL Workbench

1. Open MySQL Workbench
2. Connect to your server
3. File → Open SQL Script
4. Select `database/schema.sql`
5. Click the execute button (⚡) or press `Ctrl+Shift+Enter`

### Option C: Copy-Paste in MySQL CLI

1. Open `database/schema.sql` in a text editor
2. Copy all contents
3. Login to MySQL: `mysql -u root -p`
4. Run: `USE sams_db;`
5. Paste the SQL and press Enter

### Verify Tables Created

```sql
USE sams_db;
SHOW TABLES;
```

You should see:
- users
- events
- registrations
- notifications
- logs
- guests
- attendances
- feedbacks

---

## Step 4: Create .env File

1. **Copy the example file:**
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env

   # macOS/Linux
   cp .env.example .env
   ```

2. **Edit .env file** and update MySQL credentials:
   ```env
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=your_actual_password_here
   MYSQL_DATABASE=sams_db
   ```

   **Or if you created a separate user:**
   ```env
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=sams_user
   MYSQL_PASSWORD=your_secure_password
   MYSQL_DATABASE=sams_db
   ```

---

## Step 5: Install Dependencies

```bash
npm install
```

This will install `mysql2` package (replacing `mongodb`).

---

## Step 6: Test Database Connection

Create a test script to verify connection:

```bash
# Create test file
node -e "require('dotenv').config(); const db = require('./src/config/database'); db.connect().then(() => { console.log('✅ Connection successful!'); process.exit(0); }).catch(err => { console.error('❌ Connection failed:', err.message); process.exit(1); });"
```

Or create `test-mysql-connection.js`:

```javascript
require('dotenv').config();
const database = require('./src/config/database');

async function test() {
  try {
    await database.connect();
    console.log('✅ MySQL connection successful!');
    await database.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    process.exit(1);
  }
}

test();
```

Run it:
```bash
node test-mysql-connection.js
```

---

## Step 7: Start the Server

```bash
npm start
```

**Expected output:**
```
✅ MySQL connected successfully
✅ Database schema verified
🚀 SAMS Backend Server running on port 3000
📊 Environment: development
🔗 API Base URL: http://localhost:3000/api
```

---

## Step 8: Test API Endpoints

### Health Check
```bash
curl http://localhost:3000/api/health
```

**Expected response:**
```json
{
  "success": true,
  "message": "SAMS API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "name": "Test User",
    "role": "student"
  }'
```

---

## Troubleshooting

### Error: "Access denied for user"

**Solution:**
- Check username and password in `.env`
- Verify user has privileges:
  ```sql
  GRANT ALL PRIVILEGES ON sams_db.* TO 'your_user'@'localhost';
  FLUSH PRIVILEGES;
  ```

### Error: "Unknown database 'sams_db'"

**Solution:**
- Create the database:
  ```sql
  CREATE DATABASE sams_db;
  ```
- Run schema migration again

### Error: "Table already exists"

**Solution:**
- Drop and recreate database:
  ```sql
  DROP DATABASE sams_db;
  CREATE DATABASE sams_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```
- Run schema migration again

### Error: "Can't connect to MySQL server"

**Solution:**
- Check if MySQL service is running:
  ```bash
  # Windows
  net start MySQL80
  
  # macOS
  brew services start mysql
  
  # Linux
  sudo systemctl start mysql
  ```

### Error: "Port 3306 is already in use"

**Solution:**
- Check what's using the port
- Change MySQL port in `.env`:
  ```env
  MYSQL_PORT=3307
  ```

---

## Quick Setup Script (Windows PowerShell)

Save as `setup-mysql.ps1`:

```powershell
# Setup MySQL for SAMS
Write-Host "Setting up MySQL for SAMS..." -ForegroundColor Cyan

# Check if MySQL is installed
$mysqlVersion = mysql --version 2>$null
if (-not $mysqlVersion) {
    Write-Host "❌ MySQL is not installed. Please install MySQL first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ MySQL is installed: $mysqlVersion" -ForegroundColor Green

# Prompt for MySQL root password
$mysqlPassword = Read-Host "Enter MySQL root password" -AsSecureString
$mysqlPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($mysqlPassword)
)

# Create database
Write-Host "Creating database..." -ForegroundColor Cyan
$createDb = "CREATE DATABASE IF NOT EXISTS sams_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo $createDb | mysql -u root -p$mysqlPasswordPlain

# Run schema
Write-Host "Running schema migration..." -ForegroundColor Cyan
mysql -u root -p$mysqlPasswordPlain sams_db < database\schema.sql

Write-Host "✅ Database setup complete!" -ForegroundColor Green
Write-Host "Now update your .env file with MySQL credentials." -ForegroundColor Yellow
```

Run it:
```powershell
.\setup-mysql.ps1
```

---

## Next Steps

After successful setup:

1. ✅ Test all API endpoints
2. ✅ Create test users
3. ✅ Create test events
4. ✅ Test registrations
5. ✅ Verify all features work

---

## Support

If you encounter issues:
1. Check server logs for error messages
2. Verify MySQL is running
3. Check database connection in `.env`
4. Review `MIGRATION_GUIDE.md` for detailed information

