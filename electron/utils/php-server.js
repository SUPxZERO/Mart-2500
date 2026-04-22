/**
 * PHP Server Spawning Utility
 * 
 * Spawns PHP built-in server (php artisan serve) on localhost:8000
 * Handles startup, health checks, and graceful shutdown
 */

import { spawn, execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import fs from 'fs';
import { createConnection } from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PHP_HOST = '127.0.0.1';
const PHP_PORT = 8000;
const PHP_URL = `http://${PHP_HOST}:${PHP_PORT}`;
const MAX_RETRIES = 30;
const RETRY_DELAY = 500; // ms

let phpProcess = null;

/**
 * Find PHP executable
 */
function findPhpExecutable() {
    // On Windows, check specific paths first (most reliable for Herd)
    if (process.platform === 'win32') {
        const possiblePaths = [
            // Herd PHP installations (most common approach for Laravel devs)
            `C:\\Users\\${process.env.USERNAME}\\.config\\herd\\bin\\php.bat`,
            `C:\\Users\\${process.env.USERNAME}\\.config\\herd\\bin\\php84\\php.exe`,
            `C:\\Users\\${process.env.USERNAME}\\.config\\herd\\bin\\php83\\php.exe`,
            `C:\\Users\\${process.env.USERNAME}\\.config\\herd\\bin\\php82\\php.exe`,
            // Other common PHP installations
            'C:\\php\\php.exe',
            'C:\\Program Files\\PHP\\php.exe',
            'C:\\Program Files (x86)\\PHP\\php.exe',
            // Environment variable
            process.env.PHP_PATH,
        ].filter(Boolean);
        
        // Try each path
        for (const phpPath of possiblePaths) {
            try {
                if (fs.existsSync(phpPath)) {
                    console.log(`[PHP Server] Found PHP at: ${phpPath}`);
                    return phpPath;
                }
            } catch (e) {
                // Continue to next
            }
        }
        
        console.warn('[PHP Server] No PHP found in common Windows paths');
    }
    
    // Last resort: try system PATH
    console.log('[PHP Server] Attempting php from system PATH...');
    return 'php';
}

/**
 * Check if a port is in use
 */
function checkPortInUse(port) {
    return new Promise((resolve) => {
        const server = createConnection({
            host: PHP_HOST,
            port: port,
            timeout: 1000
        });

        server.on('connect', () => {
            server.destroy();
            resolve(true);
        });

        server.on('error', () => {
            resolve(false);
        });

        server.on('timeout', () => {
            server.destroy();
            resolve(false);
        });
    });
}

/**
 * Wait for PHP server to be ready with better diagnostics
 */
async function waitForPhpServer(retries = MAX_RETRIES) {
    let lastError;
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`[PHP Server] Attempt ${i + 1}/${retries}: Checking http://${PHP_HOST}:${PHP_PORT}`);
            const response = await axios.get(`${PHP_URL}/`, { 
                timeout: 2000,
                validateStatus: () => true  // Accept any status code
            });
            console.log(`[PHP Server] ✓ Server responded with status ${response.status}`);
            if (response.status < 500) {
                console.log('[PHP Server] ✓ Ready!');
                return true;
            }
        } catch (err) {
            lastError = err.message;
            if (i < retries - 1) {
                const waitTime = (i + 1) * 200;  // Progressive backoff
                console.log(`[PHP Server] Waiting ${waitTime}ms before retry... (Error: ${lastError})`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }
    console.error(`[PHP Server] ✗ Failed to connect after ${retries} attempts`);
    console.error(`[PHP Server] ✗ Last error: ${lastError}`);
    console.error(`[PHP Server] ✗ Port ${PHP_PORT}: ${(await checkPortInUse(PHP_PORT)) ? 'IN USE' : 'NOT RESPONDING'}`);
    throw new Error(`PHP server did not respond on http://${PHP_HOST}:${PHP_PORT}: ${lastError}`);
}

/**
 * Spawn PHP development server
 */
async function spawnPhpServer() {
    return new Promise((resolve, reject) => {
        let projectRoot = path.join(__dirname, '../../');
        if (projectRoot.includes('app.asar')) {
            projectRoot = projectRoot.replace('app.asar', 'app.asar.unpacked');
        }
        const phpCommand = findPhpExecutable();
        const artisanPath = path.join(projectRoot, 'artisan');
        
        console.log(`[PHP Server] ========== PHP SERVER STARTUP ==========`);
        console.log(`[PHP Server] Project root: ${projectRoot}`);
        console.log(`[PHP Server] Artisan path: ${artisanPath}`);
        console.log(`[PHP Server] PHP command: ${phpCommand}`);
        console.log(`[PHP Server] Target: http://${PHP_HOST}:${PHP_PORT}`);
        
        // Verify artisan exists
        if (!fs.existsSync(artisanPath)) {
            const error = `Artisan file not found at: ${artisanPath}`;
            console.error(`[PHP Server] ✗ ${error}`);
            return reject(new Error(error));
        }
        console.log(`[PHP Server] ✓ Artisan file found`);

        // Prepare environment for subprocess (inherit system PATH)
        const env = Object.assign({}, process.env);
        
        console.log(`[PHP Server] Spawning PHP server...`);

        try {
            // Use execFile with the resolved PHP command
            // execFile avoids shell interpretation and PATH issues
            phpProcess = execFile(phpCommand, [
                artisanPath,
                'serve',
                `--host=${PHP_HOST}`,
                `--port=${PHP_PORT}`,
            ], {
                cwd: projectRoot,
                stdio: ['ignore', 'pipe', 'pipe'],
                env: env,
                windowsHide: true, // Hide window on Windows
                timeout: 30000, // 30 second timeout
            });
            
            console.log(`[PHP Server] Process spawned with PID: ${phpProcess.pid}`);
        } catch (err) {
            const error = `[PHP Server] Failed to spawn: ${err.message}`;
            console.error(error);
            return reject(err);
        }

        // Capture stdout
        if (phpProcess.stdout) {
            phpProcess.stdout.on('data', (data) => {
                const message = data.toString().trim();
                console.log(`[PHP] ${message}`);
                if (message.includes('started')) {
                    console.log('[PHP Server] ✓ Server appears to have started');
                }
            });
        }

        // Capture stderr
        if (phpProcess.stderr) {
            phpProcess.stderr.on('data', (data) => {
                const message = data.toString().trim();
                if (message) {
                    console.log(`[PHP STDERR] ${message}`);
                    if (message.includes('error') || message.includes('Error') || message.includes('failed')) {
                        console.error('[PHP Server] ⚠️ PHP Error:', message);
                    }
                }
            });
        }

        // Handle process error
        phpProcess.on('error', (err) => {
            console.error('[PHP Server] ✗ Process Error:', err.code || err.message);
            if (err.code === 'ENOENT') {
                console.error('[PHP Server] ✗ PHP executable not found at:', phpCommand);
                console.error('[PHP Server] ✗ Check PATH or verify PHP installation');
            }
            reject(err);
        });

        // Handle process exit
        phpProcess.on('exit', (code, signal) => {
            if (code !== null && code !== 0) {
                console.error(`[PHP Server] ✗ Process exited with code: ${code}`);
            }
            if (signal) {
                console.error(`[PHP Server] ✗ Process killed by signal: ${signal}`);
            }
        });

        // Wait for PHP to be ready
        waitForPhpServer()
            .then(() => {
                console.log(`[PHP Server] ========== STARTUP SUCCESSFUL ==========`);
                resolve(phpProcess);
            })
            .catch((err) => {
                console.error(`[PHP Server] ========== STARTUP FAILED ==========`);
                reject(err);
            });
    });
}

/**
 * Check if PHP server is running
 */
async function checkPhpServer() {
    try {
        await axios.get(`${PHP_URL}/`, { timeout: 2000 });
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Kill PHP server gracefully
 */
async function killPhpServer(process) {
    return new Promise((resolve) => {
        if (!process) {
            resolve();
            return;
        }

        console.log('[PHP Server] Shutting down...');
        process.kill('SIGTERM');

        // Force kill after 5 seconds
        const timeout = setTimeout(() => {
            console.warn('[PHP Server] Force killing...');
            process.kill('SIGKILL');
        }, 5000);

        process.on('exit', () => {
            clearTimeout(timeout);
            resolve();
        });
    });
}

/**
 * Restart PHP server
 */
async function restartPhpServer() {
    console.log('[PHP Server] Restarting...');
    if (phpProcess) {
        await killPhpServer(phpProcess);
    }
    return spawnPhpServer();
}

export {
    spawnPhpServer,
    killPhpServer,
    checkPhpServer,
    restartPhpServer,
    PHP_URL,
    PHP_HOST,
    PHP_PORT,
};
