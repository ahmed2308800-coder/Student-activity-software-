/**
 * Backup Controller
 * Handles backup and recovery HTTP requests (Admin only)
 */
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const mysql = require('mysql2/promise');
const execAsync = promisify(exec);

class BackupController {
  /**
   * Create manual backup
   * POST /api/backup/create
   */
  async createBackup(req, res, next) {
    try {
      const backupDir = process.env.BACKUP_DIR || './backups';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `backup-${timestamp}.sql`);

      // Ensure backup directory exists
      await fs.mkdir(backupDir, { recursive: true });

      // Get MySQL configuration
      const host = process.env.MYSQL_HOST || 'localhost';
      const port = process.env.MYSQL_PORT || '3306';
      const user = process.env.MYSQL_USER || 'root';
      const password = process.env.MYSQL_PASSWORD || '';
      const database = process.env.MYSQL_DATABASE || 'sams_db';

      // Try mysqldump first; if unavailable, fall back to programmatic export
      const command = `mysqldump -h ${host} -P ${port} -u ${user} ${password ? `-p${password}` : ''} ${database} > "${backupPath}"`;
      try {
      await execAsync(command);
      } catch (dumpError) {
        // Fallback: build SQL dump via mysql2 without mysqldump
        await this.exportDatabaseViaSql({
          host,
          port,
          user,
          password,
          database,
          backupPath
        });
      }

      // Get file size
      const stats = await fs.stat(backupPath);
      const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);

      res.json({
        success: true,
        message: 'Backup created successfully',
        data: {
          backupPath,
          fileName: path.basename(backupPath),
          size: `${fileSizeMB} MB`,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      // If mysqldump is not found, provide alternative
        return res.status(500).json({
          success: false,
        message: error.message || 'Failed to create backup'
        });
    }
  }

  /**
   * List available backups
   * GET /api/backup/list
   */
  async listBackups(req, res, next) {
    try {
      const backupDir = process.env.BACKUP_DIR || './backups';
      
      try {
        const files = await fs.readdir(backupDir);
        const backups = [];

        for (const file of files) {
          const filePath = path.join(backupDir, file);
          const webPath = filePath.replace(/\\/g, '/'); // Convert backslashes to forward slashes for web
          const stats = await fs.stat(filePath);
          if (stats.isFile() && file.endsWith('.sql')) {
            backups.push({
              name: file,
              path: webPath, // Use forward slashes for web compatibility
              filePath: filePath, // Keep original path for internal use
              createdAt: stats.birthtime,
              size: stats.size,
              sizeMB: (stats.size / 1024 / 1024).toFixed(2)
            });
          }
        }

        backups.sort((a, b) => b.createdAt - a.createdAt);

        res.json({
          success: true,
          data: { backups, count: backups.length }
        });
      } catch (error) {
        if (error.code === 'ENOENT') {
          res.json({
            success: true,
            data: { backups: [], count: 0 }
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restore from backup
   * POST /api/backup/restore
   */
  async restoreBackup(req, res, next) {
    try {
      const { backupPath } = req.body;
      console.log('Restore backup request received. Path:', backupPath);

      if (!backupPath) {
        return res.status(400).json({
          success: false,
          message: 'Backup path is required'
        });
      }

      // Get backup directory and ensure path is within it
      const backupDir = process.env.BACKUP_DIR || './backups';
      const backupDirResolved = path.resolve(backupDir);
      let resolvedPath;

      // Handle different path formats
      if (backupPath.includes('backups') && (backupPath.includes('/') || backupPath.includes('\\'))) {
        // Path includes backups directory, extract just the filename and convert to system path
        const pathParts = backupPath.split(/[/\\]/);
        const fileName = pathParts[pathParts.length - 1];
        resolvedPath = path.resolve(backupDir, fileName);
      } else if (path.isAbsolute(backupPath)) {
        // If absolute path, check if it's within backup directory
        const relativeToBackup = path.relative(backupDirResolved, backupPath);
        if (!relativeToBackup.startsWith('..')) {
          resolvedPath = backupPath;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Invalid backup path'
          });
        }
      } else {
        // Just filename, assume it's within backup directory
        resolvedPath = path.resolve(backupDir, backupPath);
      }

      console.log('Backup dir:', backupDirResolved);
      console.log('Resolved path:', resolvedPath);

      // Verify backup file exists
      try {
        await fs.access(resolvedPath);
        console.log('File access successful for:', resolvedPath);
      } catch (error) {
        console.log('File access failed for:', resolvedPath, 'Error:', error.message);
        return res.status(404).json({
          success: false,
          message: 'Backup file not found',
          requestedPath: backupPath,
          resolvedPath: resolvedPath,
          backupDir: backupDirResolved
        });
      }

      // Get MySQL configuration
      const host = process.env.MYSQL_HOST || 'localhost';
      const port = process.env.MYSQL_PORT || '3306';
      const user = process.env.MYSQL_USER || 'root';
      const password = process.env.MYSQL_PASSWORD || '';
      const database = process.env.MYSQL_DATABASE || 'sams_db';

      // Try mysql command first, fallback to programmatic restore
      try {
        const command = `mysql -h ${host} -P ${port} -u ${user} ${password ? `-p${password}` : ''} ${database} < "${resolvedPath}"`;
        console.log('Executing restore command:', command.replace(password || '', '***'));

        await execAsync(command);

        res.json({
          success: true,
          message: 'Backup restored successfully',
          data: {
            backupPath: resolvedPath,
            timestamp: new Date().toISOString(),
            method: 'mysql_command'
          }
        });
      } catch (mysqlError) {
        console.log('MySQL command failed, trying programmatic restore:', mysqlError.message);

        // Fallback: programmatic restore using mysql2
        try {
          await this.restoreDatabaseFromSql({
            host,
            port,
            user,
            password,
            database,
            backupPath: resolvedPath
          });

          res.json({
            success: true,
            message: 'Backup restored successfully using programmatic method',
            data: {
              backupPath: resolvedPath,
              timestamp: new Date().toISOString(),
              method: 'programmatic'
            }
          });
        } catch (programmaticError) {
          console.error('Programmatic restore also failed:', programmaticError);
          throw new Error('Failed to restore backup. Both mysql command and programmatic methods failed.');
        }
      }
    } catch (error) {
      if (error.message.includes('mysql') || error.message.includes('not found')) {
        return res.status(500).json({
          success: false,
          message: 'MySQL client not found. Please install MySQL client tools.',
          error: 'mysql command not available'
        });
      }
      next(error);
    }
  }
}

module.exports = new BackupController();

/**
 * Restore database from SQL file using mysql2
 * @param {object} config - Database configuration
 */
BackupController.prototype.restoreDatabaseFromSql = async function(config) {
  const { host, port, user, password, database, backupPath } = config;

  console.log(`Starting programmatic restore from: ${backupPath}`);

  // Read the SQL file
  const sqlContent = await fs.readFile(backupPath, 'utf8');

  // Create connection
  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true
  });

  try {
    console.log('Executing SQL restore with foreign key handling...');

    // First, disable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('Foreign key checks disabled');

    try {
      // Clean up the SQL content
      let cleanSql = sqlContent
        // Remove comments
        .replace(/--.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove CREATE DATABASE and USE statements (since we're already connected to the target database)
        .replace(/CREATE DATABASE IF NOT EXISTS\s+`[^`]+`;/gi, '')
        .replace(/USE\s+`[^`]+`;/gi, '')
        .replace(/CREATE DATABASE\s+`[^`]+`;/gi, '')
        // Remove empty lines and extra whitespace
        .replace(/^\s*$/gm, '')
        .replace(/\n\s*\n/g, '\n')
        // Trim whitespace
        .trim();

      // Remove leading/trailing semicolons and normalize
      cleanSql = cleanSql.replace(/^;+|;+$/g, '').trim();

      if (cleanSql) {
        console.log(`SQL content length: ${cleanSql.length} characters`);

        // Execute the entire SQL content
        await connection.query(cleanSql);

        console.log('Programmatic restore completed successfully');
      } else {
        throw new Error('SQL file appears to be empty after cleaning');
      }
    } catch (restoreError) {
      console.error('Error during restore:', restoreError);
      throw restoreError;
    } finally {
      // Always re-enable foreign key checks, even if restore failed
      try {
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Foreign key checks re-enabled');
      } catch (fkError) {
        console.error('Failed to re-enable foreign key checks:', fkError);
      }
    }
  } finally {
    await connection.end();
  }
};

/**
 * Fallback export when mysqldump is not available.
 * Generates a basic SQL dump (schema + data) using mysql2.
 */
BackupController.prototype.exportDatabaseViaSql = async function(config) {
  const { host, port, user, password, database, backupPath } = config;

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true
  });

  const escape = connection.escape.bind(connection);

  const lines = [];
  lines.push(`-- Backup generated without mysqldump`);
  lines.push(`-- Database: ${database}`);
  lines.push('');
  lines.push(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
  lines.push(`USE \`${database}\`;`);
  lines.push('');

  // Get tables
  const [tables] = await connection.query(`SHOW TABLES`);
  const tableKey = `Tables_in_${database}`;

  for (const row of tables) {
    const tableName = row[tableKey];
    // Schema
    const [createRows] = await connection.query(`SHOW CREATE TABLE \`${tableName}\``);
    const createSql = createRows[0]['Create Table'];
    lines.push(`DROP TABLE IF EXISTS \`${tableName}\`;`);
    lines.push(createSql + ';');
    lines.push('');

    // Data
    const [dataRows] = await connection.query(`SELECT * FROM \`${tableName}\``);
    if (dataRows.length > 0) {
      const columns = Object.keys(dataRows[0]).map(col => `\`${col}\``).join(', ');
      const valueLines = dataRows.map(row => {
        const values = Object.values(row).map(val => escape(val)).join(', ');
        return `(${values})`;
      });
      lines.push(`INSERT INTO \`${tableName}\` (${columns}) VALUES`);
      lines.push(valueLines.join(',\n') + ';');
      lines.push('');
    }
  }

  await fs.writeFile(backupPath, lines.join('\n'), 'utf8');
  await connection.end();
};
