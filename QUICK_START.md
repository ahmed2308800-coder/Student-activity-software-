# Quick Start Guide - MySQL Setup

Follow these steps to get your MySQL backend running:

## 🚀 Quick Setup (5 Steps)

### Step 1: Install MySQL

**Windows:**
- Download from: https://dev.mysql.com/downloads/mysql/
- Install MySQL Server
- Remember your root password!

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Linux:**
```bash
sudo apt-get install mysql-server
sudo systemctl start mysql
```

---

### Step 2: Create Database

**Option A: Automated (Windows PowerShell)**
```powershell
.\setup-mysql.ps1
```

**Option B: Manual**
```bash
mysql -u root -p
```

Then in MySQL:
```sql
CREATE DATABASE sams_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

---

### Step 3: Run Schema

```bash
# Windows
mysql -u root -p sams_db < database\schema.sql

# macOS/Linux
mysql -u root -p sams_db < database/schema.sql
```

---

### Step 4: Configure Environment

1. **Create .env file:**
   ```bash
   # Windows
   Copy-Item .env.example .env
   
   # macOS/Linux
   cp .env.example .env
   ```

2. **Edit .env** and add your MySQL credentials:
   ```env
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password_here
   MYSQL_DATABASE=sams_db
   ```

---

### Step 5: Install & Start

```bash
# Install dependencies
npm install

# Test connection
node test-mysql-connection.js

# Start server
npm start
```

---

## ✅ Verify Setup

### Test Database Connection
```bash
node test-mysql-connection.js
```

**Expected output:**
```
✅ MySQL connection successful!
✅ All required tables exist!
```

### Test API
```bash
curl http://localhost:3000/api/health
```

**Expected response:**
```json
{
  "success": true,
  "message": "SAMS API is running"
}
```

---

## 🐛 Troubleshooting

### "Access denied"
- Check username/password in `.env`
- Verify MySQL is running

### "Unknown database"
- Run: `mysql -u root -p < database/schema.sql`

### "Table already exists"
- Drop database: `DROP DATABASE sams_db;`
- Recreate and run schema again

---

## 📚 More Help

- **Detailed Setup:** See `SETUP_MYSQL.md`
- **Migration Guide:** See `MIGRATION_GUIDE.md`
- **Schema Docs:** See `MYSQL_SCHEMA.md`

---

## 🎉 You're Done!

Your MySQL backend is now ready. Start building! 🚀

