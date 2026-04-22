#!/usr/bin/env node

console.log('[Debug] Starting Electron...');
console.log('[Debug] Node version:', process.version);
console.log('[Debug] Platform:', process.platform);
console.log('[Debug] CWD:', process.cwd());

try {
    console.log('[Debug] Importing electron...');
    await import('electron');
    console.log('[Debug] Electron loaded successfully');
} catch (error) {
    console.error('[Error] Failed to load electron:', error.message);
    process.exit(1);
}

try {
    console.log('[Debug] Importing main.js...');
    await import('./electron/main.js');
    console.log('[Debug] main.js loaded successfully');
} catch (error) {
    console.error('[Error] Failed to load main.js:', error.message);
    console.error('[Error] Stack:', error.stack);
    process.exit(1);
}

console.log('[Debug] Setup complete');
