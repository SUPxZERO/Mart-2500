/**
 * MART2500 Electron Main Process
 * 
 * Responsibilities:
 * - Manage app lifecycle
 * - Spawn PHP-CLI server
 * - Create and manage Electron windows
 * - Handle file dialogs
 * - Manage database initialization
 */

import electronPkg from 'electron';
const { app, BrowserWindow, Menu, ipcMain, dialog } = electronPkg;

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Check if running in development (Electron packaged apps set this)
const isDev = !app.isPackaged;
import { spawnPhpServer, killPhpServer } from './utils/php-server.js';
import { initializeDatabase, getDatabasePath } from './utils/database.js';
import { createMenu } from './menu.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let phpServerProcess;
let isAppReady = false;

// Create a simple log writer function (before app is ready)
function writeDebugLog(message) {
    try {
        // Write to a predictable location in appdata
        const baseDir = path.join(process.env.APPDATA || process.env.HOME, 'mart2500-pos');
        
        // Ensure directory exists first
        if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir, { recursive: true });
        }
        
        const logPath = path.join(baseDir, 'debug.log');
        const timestamp = new Date().toISOString();
        const logLine = `[${timestamp}] ${message}\n`;
        fs.appendFileSync(logPath, logLine);
    } catch (err) {
        // Can't write log - at least write to stderr
        process.stderr.write(`LOG ERROR: ${message} (${err.message})\n`);
    }
}

writeDebugLog('=== MART2500 Module Loading ===');

/**
 * Create the main application window
 */
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
        },
        // Icon is optional for development
        icon: process.platform === 'win32' ? path.join(__dirname, '../resources/icons/icon.ico') : undefined,
    });

    // Load the app
    // In both dev and production, we serve from a local server
    // Dev: Vite on 5173, Production: PHP artisan on 8000
    const startUrl = isDev
        ? 'http://localhost:5173' // Vite dev server
        : 'http://127.0.0.1:8000'; // PHP artisan serve in production

    mainWindow.loadURL(startUrl);
    writeDebugLog(`Loading URL: ${startUrl}`);
    console.log('[App] Loading URL:', startUrl);

    // Open DevTools in ALL modes to debug
    mainWindow.webContents.openDevTools();

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Prevent external navigation
    mainWindow.webContents.on('will-navigate', (event, url) => {
        const validHosts = ['localhost', '127.0.0.1'];
        const urlObj = new URL(url);
        if (!validHosts.includes(urlObj.hostname)) {
            event.preventDefault();
        }
    });
}

/**
 * App startup sequence
 */
async function startupSequence() {
    try {
        writeDebugLog('Starting MART2500 startup sequence...');
        console.log('[App] Starting MART2500 Electron app...');
        
        // 1. Initialize database (non-blocking - show window even if it fails)
        writeDebugLog('Initializing database...');
        console.log('[App] Initializing database...');
        try {
            await initializeDatabase();
            writeDebugLog('Database initialized successfully');
        } catch (dbError) {
            writeDebugLog(`Database init error: ${dbError.message}`);
            console.warn('[App] Database init warning:', dbError.message);
            // Continue anyway - user can still see the app
        }
        
        // 2. Start PHP server
        writeDebugLog('Starting PHP server...');
        console.log('[App] Starting PHP server...');
        try {
            phpServerProcess = await spawnPhpServer();
            writeDebugLog('PHP server started successfully');
        } catch (phpError) {
            writeDebugLog(`PHP server error: ${phpError.message}`);
            console.error('[App] PHP server error:', phpError.message);
            // Show window anyway so user can see what's happening
        }
        
        // 3. Create Electron window
        writeDebugLog('Creating main window...');
        console.log('[App] Creating main window...');
        createWindow();
        
        isAppReady = true;
        writeDebugLog('App ready!');
        console.log('[App] App ready!');
        
    } catch (error) {
        writeDebugLog(`Startup sequence failed: ${error.message}`);
        console.error('[App] Startup sequence failed:', error.message);
        console.error(error);
        // Show window anyway
        if (!mainWindow) {
            createWindow();
        }
    }
}

/**
 * Cleanup on app quit
 */
async function cleanupOnQuit() {
    console.log('Shutting down...');
    if (phpServerProcess) {
        await killPhpServer(phpServerProcess);
    }
}

// App event listeners
app.on('ready', () => {
    writeDebugLog('App ready event fired');
    startupSequence();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('quit', () => {
    cleanupOnQuit();
});

// Create menu
ipcMain.handle('app:get-version', () => app.getVersion());
ipcMain.handle('app:get-database-path', async () => getDatabasePath());

// Export for testing
export { createWindow, mainWindow };

// Global error handlers - catch anything that slips through
process.on('uncaughtException', (err) => {
    writeDebugLog(`UNCAUGHT EXCEPTION: ${err.message}`);
    writeDebugLog(err.stack || 'No stack trace');
});

process.on('unhandledRejection', (reason, promise) => {
    writeDebugLog(`UNHANDLED REJECTION: ${reason}`);
});

// Log when app actually initializes
if (typeof app !== 'undefined') {
    writeDebugLog('Electron app object available');
} else {
    writeDebugLog('ERROR: Electron app object is undefined');
}
