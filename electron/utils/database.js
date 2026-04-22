/**
 * Database Initialization Utility
 * 
 * Handles:
 * - Database location and creation
 * - Running migrations
 * - Seeding sample data (optional)
 * - Backup and restore operations
 */

import electronPkg from 'electron';
const { app } = electronPkg;

import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_FILE = 'database.sqlite';
const BACKUP_DIR = 'backups';

/**
 * Get database path in user data directory
 * - Windows: C:\Users\username\AppData\Local\MART2500\
 * - Mac: ~/Library/Application Support/MART2500/
 * - Linux: ~/.config/MART2500/
 */
function getDatabasePath() {
    try {
        const userDataPath = app.getPath('userData');
        const dbPath = path.join(userDataPath, DATABASE_FILE);
        return dbPath;
    } catch (error) {
        console.warn('[Database] app.getPath not ready, using fallback path');
        // Fallback: use AppData directly
        const appDataPath = process.env.APPDATA || path.join(process.env.HOME || process.env.HOMEPATH, 'AppData', 'Local');
        const dbPath = path.join(appDataPath, 'MART2500', DATABASE_FILE);
        return dbPath;
    }
}


/**
 * Get backup directory path
 */
function getBackupDir() {
    const userDataPath = app.getPath('userData');
    const backupPath = path.join(userDataPath, BACKUP_DIR);
    return backupPath;
}

/**
 * Check if database exists
 */
function databaseExists() {
    const dbPath = getDatabasePath();
    return fs.existsSync(dbPath);
}

/**
 * Get .env file path
 * For packaged apps: stores in userData directory
 * For dev: stores in project root
 */
function getEnvPath() {
    try {
        // Try to use app.getPath if available
        const userDataPath = app.getPath('userData');
        return path.join(userDataPath, '.env');
    } catch (error) {
        // Fallback for when app.getPath is not ready
        console.warn('[Database] app.getPath not available, using home directory');
        const homePath = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
        return path.join(homePath, 'MART2500', '.env');
    }
}

/**
 * Set up database environment for Laravel
 */
function setupDatabaseEnv() {
    const dbPath = getDatabasePath();
    const backupDir = getBackupDir();
    
    // Ensure directories exist
    fs.ensureDirSync(path.dirname(dbPath));
    fs.ensureDirSync(backupDir);
    
    // Get the .env file path (in userData, not project root)
    const envPath = getEnvPath();
    const envDir = path.dirname(envPath);
    fs.ensureDirSync(envDir);
    
    // Create or read .env file
    let envContent;
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
    } else {
        // Try to load from project .env.example first
        let templateContent = '';
        const examplePath = path.join(__dirname, '../../.env.example');
        if (fs.existsSync(examplePath)) {
            templateContent = fs.readFileSync(examplePath, 'utf-8');
        } else {
            // Create minimal .env template
            templateContent = `APP_NAME=MART2500
APP_ENV=production
APP_DEBUG=false
APP_URL=http://127.0.0.1:8000
LOG_CHANNEL=stack
DB_CONNECTION=sqlite
DB_DATABASE=database.sqlite
`;
        }
        envContent = templateContent;
    }
    
    // Update or add DB_DATABASE with full path
    if (envContent.includes('DB_DATABASE=')) {
        envContent = envContent.replace(
            /DB_DATABASE=.*/,
            `DB_DATABASE=${dbPath}`
        );
    } else {
        envContent += `\nDB_DATABASE=${dbPath}`;
    }
    
    // Ensure SQLite is the connection
    if (envContent.includes('DB_CONNECTION=')) {
        envContent = envContent.replace(
            /DB_CONNECTION=.*/,
            'DB_CONNECTION=sqlite'
        );
    } else {
        envContent += '\nDB_CONNECTION=sqlite';
    }
    
    // Ensure proper app environment
    if (!envContent.includes('APP_ENV=')) {
        envContent += '\nAPP_ENV=production';
    }
    
    // Write to writable location
    fs.writeFileSync(envPath, envContent);
    console.log(`[Database] Environment configured: ${dbPath}`);
    console.log(`[Database] .env file: ${envPath}`);
}

/**
 * Run Laravel migrations
 */
function runMigrations() {
    try {
        console.log('[Database] Running migrations...');
        let projectRoot = path.join(__dirname, '../../');
        if (projectRoot.includes('app.asar')) {
            projectRoot = projectRoot.replace('app.asar', 'app.asar.unpacked');
        }
        const envPath = getEnvPath();
        
        // Set environment variables for the subprocess
        const env = { ...process.env };
        env.DB_CONNECTION = 'sqlite';
        env.DB_DATABASE = getDatabasePath();
        env.APP_ENV = 'production';
        
        // Run migrations with force flag (no confirmation)
        execSync('php artisan migrate --force', {
            cwd: projectRoot,
            env: env,
            stdio: 'pipe',
            encoding: 'utf-8',
        });
        
        console.log('[Database] Migrations completed');
        return true;
    } catch (error) {
        console.error('[Database] Migration error:', error.message);
        throw error;
    }
}

/**
 * Seed database with sample data (optional)
 */
function seedDatabase() {
    try {
        console.log('[Database] Seeding database with sample data...');
        let projectRoot = path.join(__dirname, '../../');
        if (projectRoot.includes('app.asar')) {
            projectRoot = projectRoot.replace('app.asar', 'app.asar.unpacked');
        }
        
        execSync('php artisan db:seed --force', {
            cwd: projectRoot,
            stdio: 'pipe',
            encoding: 'utf-8',
        });
        
        console.log('[Database] Seeding completed');
        return true;
    } catch (error) {
        // Seeding is optional, so just warn
        console.warn('[Database] Seeding warning (this is optional):', error.message);
        return false;
    }
}

/**
 * Initialize or upgrade database
 */
async function initializeDatabase() {
    try {
        // Step 1: Set up environment
        setupDatabaseEnv();
        
        // Step 2: Check if database exists
        if (!databaseExists()) {
            console.log('[Database] Fresh database detected - creating schema...');
            try {
                runMigrations();
                console.log('[Database] Database initialized');
            } catch (err) {
                console.warn('[Database] Migration skipped in development:', err.message);
                console.log('[Database] Database file created - migrations will run on next restart');
            }
        } else {
            console.log('[Database] Existing database found - check for migrations...');
            try {
                runMigrations();
                console.log('[Database] Database upgraded');
            } catch (err) {
                console.warn('[Database] Optional migration skipped:', err.message);
            }
        }
        
        return true;
    } catch (error) {
        console.error('[Database] Initialization failed:', error);
        // Don't throw - allow app to continue
        return false;
    }
}

/**
 * Backup database
 */
async function backupDatabase() {
    try {
        const dbPath = getDatabasePath();
        const backupDir = getBackupDir();
        
        if (!fs.existsSync(dbPath)) {
            throw new Error('Database file not found');
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `database-${timestamp}.sqlite`);
        
        fs.copyFileSync(dbPath, backupPath);
        
        console.log(`[Database] Backup created: ${backupPath}`);
        return backupPath;
    } catch (error) {
        console.error('[Database] Backup failed:', error);
        throw error;
    }
}

/**
 * Restore database from backup
 */
async function restoreDatabase(backupPath) {
    try {
        const dbPath = getDatabasePath();
        
        if (!fs.existsSync(backupPath)) {
            throw new Error(`Backup file not found: ${backupPath}`);
        }
        
        // Create backup current first
        await backupDatabase();
        
        // Restore
        fs.copyFileSync(backupPath, dbPath);
        
        console.log(`[Database] Restored from backup: ${backupPath}`);
        return true;
    } catch (error) {
        console.error('[Database] Restore failed:', error);
        throw error;
    }
}

/**
 * Get database statistics
 */
async function getDatabaseStats() {
    try {
        const dbPath = getDatabasePath();
        const backupDir = getBackupDir();
        
        if (!fs.existsSync(dbPath)) {
            return null;
        }
        
        const dbStats = fs.statSync(dbPath);
        const backups = fs.readdirSync(backupDir).filter(f => f.endsWith('.sqlite'));
        
        return {
            path: dbPath,
            size: dbStats.size,
            sizeFormatted: formatBytes(dbStats.size),
            lastModified: dbStats.mtime,
            backupCount: backups.length,
            latestBackup: backups.length > 0 ? backups[backups.length - 1] : null,
        };
    } catch (error) {
        console.error('[Database] Failed to get stats:', error);
        return null;
    }
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Reset database (development only)
 */
async function resetDatabase() {
    try {
        const dbPath = getDatabasePath();
        
        if (fs.existsSync(dbPath)) {
            fs.removeFileSync(dbPath);
            console.log('[Database] Database reset');
        }
        
        return initializeDatabase();
    } catch (error) {
        console.error('[Database] Reset failed:', error);
        throw error;
    }
}

export {
    getDatabasePath,
    getBackupDir,
    databaseExists,
    initializeDatabase,
    backupDatabase,
    restoreDatabase,
    getDatabaseStats,
    resetDatabase,
    setupDatabaseEnv,
};
