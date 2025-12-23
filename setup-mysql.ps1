# MySQL Setup Script for SAMS
# Run this script to set up MySQL database

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SAMS MySQL Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is installed
Write-Host "Checking MySQL installation..." -ForegroundColor Yellow
$mysqlVersion = mysql --version 2>$null
if (-not $mysqlVersion) {
    Write-Host "❌ MySQL is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install MySQL first:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://dev.mysql.com/downloads/mysql/" -ForegroundColor White
    Write-Host "2. Install MySQL Server" -ForegroundColor White
    Write-Host "3. Run this script again" -ForegroundColor White
    exit 1
}

Write-Host "✅ MySQL is installed: $mysqlVersion" -ForegroundColor Green
Write-Host ""

# Get MySQL credentials
Write-Host "Enter MySQL credentials:" -ForegroundColor Yellow
$mysqlUser = Read-Host "MySQL Username (default: root)"
if ([string]::IsNullOrWhiteSpace($mysqlUser)) {
    $mysqlUser = "root"
}

$mysqlPassword = Read-Host "MySQL Password" -AsSecureString
$mysqlPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($mysqlPassword)
)

Write-Host ""
Write-Host "Creating database..." -ForegroundColor Yellow

# Create database
$createDbSQL = "CREATE DATABASE IF NOT EXISTS sams_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
try {
    echo $createDbSQL | mysql -u $mysqlUser -p$mysqlPasswordPlain 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database 'sams_db' created successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create database. Check your credentials." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error creating database: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Running schema migration..." -ForegroundColor Yellow

# Run schema
if (Test-Path "database\schema.sql") {
    try {
        mysql -u $mysqlUser -p$mysqlPasswordPlain sams_db < database\schema.sql 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Schema migration completed successfully" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Schema migration had warnings. Check manually." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Error running schema: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Schema file not found: database\schema.sql" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Verifying tables..." -ForegroundColor Yellow

# Verify tables
$tablesSQL = "USE sams_db; SHOW TABLES;"
$tables = echo $tablesSQL | mysql -u $mysqlUser -p$mysqlPasswordPlain -N 2>$null
$tableCount = ($tables | Measure-Object -Line).Lines

if ($tableCount -ge 8) {
    Write-Host "✅ Found $tableCount tables in database" -ForegroundColor Green
    Write-Host ""
    Write-Host "Tables created:" -ForegroundColor Cyan
    $tables | ForEach-Object { Write-Host "  - $_" -ForegroundColor White }
} else {
    Write-Host "⚠️  Expected 8 tables, found $tableCount" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Create .env file (copy from .env.example)" -ForegroundColor White
Write-Host "2. Update .env with MySQL credentials:" -ForegroundColor White
Write-Host "   MYSQL_USER=$mysqlUser" -ForegroundColor Gray
Write-Host "   MYSQL_PASSWORD=(your password)" -ForegroundColor Gray
Write-Host "   MYSQL_DATABASE=sams_db" -ForegroundColor Gray
Write-Host "3. Run: npm install" -ForegroundColor White
Write-Host "4. Run: node test-mysql-connection.js" -ForegroundColor White
Write-Host "5. Run: npm start" -ForegroundColor White
Write-Host ""

