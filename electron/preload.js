/**
 * Electron Preload Script
 * 
 * Provides safe IPC communication between Renderer and Main processes
 * Uses Context Isolation for security
 */

import electronPkg from 'electron';
const { contextBridge, ipcRenderer } = electronPkg;

// Expose IPC API to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // App information
    getVersion: () => ipcRenderer.invoke('app:get-version'),
    getDatabasePath: () => ipcRenderer.invoke('app:get-database-path'),
    
    // File operations
    selectFile: (options) => ipcRenderer.invoke('file:select-file', options),
    selectDirectory: (options) => ipcRenderer.invoke('file:select-directory', options),
    
    // Print and export
    print: (html) => ipcRenderer.invoke('print:to-pdf', html),
    exportToExcel: (data, fileName) => ipcRenderer.invoke('export:excel', data, fileName),
    
    // Database operations
    backupDatabase: () => ipcRenderer.invoke('database:backup'),
    restoreDatabase: (filePath) => ipcRenderer.invoke('database:restore', filePath),
    getDatabaseStats: () => ipcRenderer.invoke('database:stats'),
    
    // App status
    checkPhpServer: () => ipcRenderer.invoke('app:check-php-server'),
    getOfflineStatus: () => ipcRenderer.invoke('app:get-offline-status'),
    
    // Window operations
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
});

// Log preload loaded
console.log('[Preload] Context Isolation enabled');
