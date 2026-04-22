# MART2500 Electron Conversion: Detailed Implementation Roadmap

**Status:** Ready to implement  
**Estimated Timeline:** 2-3 weeks  
**Target Date:** End of April 2026  
**Main Contact:** Development Team

---

## PHASE 1: Foundation & Setup (Days 1-5)

### 1.1 Project Structure & Dependencies Setup

**Objective:** Prepare development environment with Electron and required dependencies.

#### Tasks:

- [ ] **Create Electron directory structure** ✅ DONE
  - `electron/main.js` - Main process ✅
  - `electron/preload.js` - IPC bridge ✅
  - `electron/menu.js` - Application menu ✅
  - `electron/utils/php-server.js` - PHP spawning ✅
  - `electron/utils/database.js` - Database management ✅

- [ ] **Update package.json** ✅ DONE
  - Added electron dev scripts ✅
  - Added electron dependencies ✅
  - Added fs-extra for file operations ✅
  - Scripts: dev, dev:web, dev:electron, build, build:electron ✅

- [ ] **Configure electron-builder** ✅ DONE
  - Created electron-builder.config.js ✅
  - Set up NSIS installer (Windows) ✅
  - Configured portable EXE ✅
  - Set file inclusion patterns ✅

#### Deliverables:
```
✓ Electron project structure ready
✓ package.json updated with electron scripts
✓ electron-builder.config.js configured
✓ Main process file (main.js) ready
✓ IPC bridge (preload.js) ready
✓ PHP spawning utility ready
✓ Database management utility ready
```

---

### 1.2 Install Dependencies

**Objective:** Install all npm packages and verify installation.

#### Command:
```bash
cd e:\promgramming\mart2500
npm install
```

#### Expected Packages to Install:
- electron (latest)
- electron-builder (latest)
- electron-is-dev (latest)
- fs-extra (11.1.0)
- All existing packages

#### Verification:
```bash
npm list electron
npm list electron-builder
node electron/main.js --version  # Should show Electron version
```

**Estimated Time:** 5-10 minutes

---

### 1.3 Configure .env for Desktop

**Objective:** Set up environment variables specific to Electron environment.

#### Review/Update `.env`:
```env
# Database will be auto-set to userData directory by electron/utils/database.js
DB_CONNECTION=sqlite
# DB_DATABASE will be set dynamically

# Ensure these are correct
APP_ENV=production  # Change to 'local' for development
APP_DEBUG=false     # Set to true for debugging

# Queue should be sync (inline execution, no workers)
QUEUE_CONNECTION=sync

# Session driver (file-based)
SESSION_DRIVER=file

# Cache driver (file-based)  
CACHE_DRIVER=file

# Mail driver (log - not used)
MAIL_DRIVER=log
```

---

### 1.4 Test Development Environment

**Objective:** Verify Electron can spawn and connect to Laravel.

#### Manual Testing Checklist:
- [ ] Start Laravel dev server: `npm run dev:web`
- [ ] Open second terminal and start Electron: `npm run dev:electron`
- [ ] Verify Electron window opens with React app loading
- [ ] Check DevTools console for errors
- [ ] Verify axios calls work to http://localhost:8000
- [ ] Login should work with existing Laravel auth

**Expected Result:**
- Electron window shows MART2500 login page
- No errors in console
- Can interact with React components

**Troubleshooting:**
| Issue | Cause | Fix |
|-------|-------|-----|
| Electron won't start | PHP server not running | Start `npm run dev:web` first |
| Blank window | Vite build output issue | Run `vite build` then start Electron |
| CORS errors | localhost mismatch | Check PHP_PORT in php-server.js |
| React not loading | Vite assets missing | Run `npm run dev:watch` in 3rd terminal |

---

## PHASE 2: Integration & Adaptation (Days 6-10)

### 2.1 Database Initialization on App Start

**Objective:** Automatically initialize SQLite database when app launches.

#### Implementation:
The database.js utility already handles:
```javascript
1. Get database path from app.getPath('userData')
2. Ensure directory exists
3. Run Laravel migrations
4. Optional: seed sample data
5. Return database stats
```

#### Manual Testing:
```bash
# Clear previous database
rm $env:APPDATA\MART2500\database.sqlite  # On Windows

# Start Electron
npm run dev:electron

# Should see in console:
# [Database] Initializing database...
# [Database] Running migrations...
# [Database] Migrations completed
```

#### Add IPC Handlers:

Create file: `electron/handlers.js`

```javascript
const { ipcMain, dialog } = require('electron');
const { 
    getDatabasePath, 
    getDatabaseStats, 
    backupDatabase, 
    restoreDatabase,
    resetDatabase 
} = require('./utils/database');
const { checkPhpServer } = require('./utils/php-server');

function setupHandlers() {
    // Database operations
    ipcMain.handle('database:get-path', getDatabasePath);
    
    ipcMain.handle('database:get-stats', async () => {
        return getDatabaseStats();
    });
    
    ipcMain.handle('database:backup', async () => {
        try {
            const backupPath = await backupDatabase();
            dialog.showMessageBox({
                type: 'info',
                title: 'Backup Complete',
                message: `Database backed up to: ${backupPath}`,
            });
            return backupPath;
        } catch (error) {
            dialog.showErrorBox('Backup Failed', error.message);
            throw error;
        }
    });
    
    ipcMain.handle('database:restore', async (event, filePath) => {
        try {
            await restoreDatabase(filePath);
            dialog.showMessageBox({
                type: 'info',
                title: 'Restore Complete',
                message: 'Database restored successfully',
            });
        } catch (error) {
            dialog.showErrorBox('Restore Failed', error.message);
            throw error;
        }
    });
    
    // App status
    ipcMain.handle('app:check-php', async () => {
        return checkPhpServer();
    });
}

module.exports = { setupHandlers };
```

Update `electron/main.js` to call `setupHandlers()` after window creation.

---

### 2.2 Frontend Adaptation: Add Desktop Status Indicator

**Objective:** React components should show app status and offline capability.

#### Create: `resources/js/hooks/useElectronAPI.js`

```javascript
import { useEffect, useState } from 'react';

export function useElectronAPI() {
    const [electronAPI, setElectronAPI] = useState(null);
    const [isElectron, setIsElectron] = useState(false);

    useEffect(() => {
        if (window.electronAPI) {
            setElectronAPI(window.electronAPI);
            setIsElectron(true);
        }
    }, []);

    return { electronAPI, isElectron };
}

export async function getAppVersion() {
    if (window.electronAPI) {
        return await window.electronAPI.getVersion();
    }
    return 'Web Version';
}

export async function getDatabaseStats() {
    if (window.electronAPI) {
        return await window.electronAPI.getDatabaseStats();
    }
    return null;
}
```

#### Create Component: `resources/js/Components/DesktopStatusBar.jsx`

```jsx
import { useElectronAPI } from '@/hooks/useElectronAPI';
import { useEffect, useState } from 'react';
import { Monitor } from 'lucide-react';

export default function DesktopStatusBar() {
    const { isElectron } = useElectronAPI();
    const [version, setVersion] = useState('');

    useEffect(() => {
        if (isElectron && window.electronAPI) {
            window.electronAPI.getVersion().then(setVersion);
        }
    }, [isElectron]);

    if (!isElectron) return null;

    return (
        <div className="bg-blue-100 border-b border-blue-300 px-4 py-2 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800">
                Desktop v{version} • Offline Mode Active
            </span>
        </div>
    );
}
```

#### Update: `resources/js/Layouts/AppLayout.jsx`

Add DesktopStatusBar to main layout:

```jsx
import DesktopStatusBar from '@/Components/DesktopStatusBar';

export default function AppLayout({ children }) {
    return (
        <div>
            <DesktopStatusBar />
            {/* Rest of layout */}
            {children}
        </div>
    );
}
```

---

### 2.3 API Endpoint Configuration

**Objective:** Ensure React app connects to localhost:8000 instead of relative paths.

#### Create: `resources/js/utils/api.js`

```javascript
import axios from 'axios';

// Determine API base URL
const getBaseURL = () => {
    if (window.electronAPI) {
        return 'http://127.0.0.1:8000';
    }
    return window.location.origin;
};

export const api = axios.create({
    baseURL: getBaseURL(),
    timeout: 10000,
    withCredentials: true,  // Include cookies for session
});

// Add response interceptor for offline detection
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 0 || error.message === 'Network Error') {
            console.warn('Offline mode - check PHP server status');
        }
        return Promise.reject(error);
    }
);

export default api;
```

---

### 2.4 Test Login & POS Workflow

**Objective:** Verify complete workflow works in Electron.

#### Manual Testing Workflow:

1. **Start app:**
   ```bash
   npm run dev  # Runs web, electron, and watch in parallel
   ```

2. **Login:**
   - Enter credentials (or register new user)
   - Verify session persists

3. **Create Invoice:**
   - Go to POS page
   - Add items to cart
   - Select customer (optional)
   - Process payment
   - Print receipt

4. **Check Storage:**
   - Images should load from storage/app/public/items/
   - No 404 errors

5. **Verify Data Offline:**
   - Stop Laravel server (Ctrl+C)
   - Try navigating within app (should still see cached data)
   - Creating new invoice should fail gracefully

**Expected Result:**
- App fully functional
- All features work in Electron
- Data persists between sessions
- Graceful handling of offline

---

## PHASE 3: Desktop Features & Optimization (Days 11-15)

### 3.1 File Dialog Integration

**Objective:** Add native file dialogs for export, backup, import.

#### Create: `electron/handlers.js` (File Operations):

```javascript
const { ipcMain, dialog } = require('electron');
const fs = require('fs-extra');

// File selection for import
ipcMain.handle('file:select-file', async (event, filters) => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: filters || [
            { name: 'All Files', extensions: ['*'] },
        ],
    });
    return result.filePaths[0] || null;
});

// Directory selection
ipcMain.handle('file:select-directory', async (event) => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
    });
    return result.filePaths[0] || null;
});

// Save file dialog
ipcMain.handle('file:save-file', async (event, defaultName, filters) => {
    const result = await dialog.showSaveDialog({
        defaultPath: defaultName,
        filters: filters || [
            { name: 'All Files', extensions: ['*'] },
        ],
    });
    return result.filePath || null;
});
```

#### Update: `resources/js/Pages/Settings/Index.jsx`

Add backup/restore UI with Electron file dialogs.

---

### 3.2 Print to PDF Integration

**Objective:** Add native print functionality.

#### Create: `electron/handlers.js` (Print):

```javascript
ipcMain.handle('print:to-pdf', async (event, html) => {
    const pdfPath = path.join(getBackupDir(), `receipt-${Date.now()}.pdf`);
    
    // Create a new window to render HTML
    const printWindow = new BrowserWindow({
        show: false,
        webPreferences: { nodeIntegration: false },
    });

    await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    
    // Print to PDF
    const pdfData = await printWindow.webContents.printToPDF({
        landscape: false,
        path: pdfPath,
        pageSize: 'A4',
    });

    printWindow.close();
    
    return pdfPath;
});
```

---

### 3.3 Performance Optimization

**Objective:** Ensure app launches quickly and performs well.

#### Optimizations:

1. **App Launch Time:**
   - Show splash screen while loading
   - Lazy-load React components
   - Pre-warm PHP server in background

2. **Database Performance:**
   - Index frequently queried columns
   - Paginate invoice list (50 items at a time)
   - Cache exchange rate in memory

3. **Memory Usage:**
   - Limit image cache
   - Unload non-critical data
   - Monitor process memory

#### Create: `electron/splash-screen.js`

```javascript
let splashWindow;

function createSplashScreen() {
    splashWindow = new BrowserWindow({
        width: 400,
        height: 300,
        show: false,
        frame: false,
        alwaysOnTop: true,
        transparent: true,
    });

    const splashHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                }
                .content { text-align: center; color: white; }
                .spinner { 
                    border: 4px solid rgba(255,255,255,0.3);
                    border-top: 4px solid white;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin: 20px auto;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                h1 { margin: 0; font-size: 28px; }
                p { margin: 0; opacity: 0.9; }
            </style>
        </head>
        <body>
            <div class="content">
                <h1>MART2500 POS</h1>
                <div class="spinner"></div>
                <p>Starting up...</p>
            </div>
        </body>
        </html>
    `;

    splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHTML)}`);
    splashWindow.show();
}

function closeSplashScreen() {
    if (splashWindow) {
        splashWindow.close();
        splashWindow = null;
    }
}

module.exports = { createSplashScreen, closeSplashScreen };
```

---

## PHASE 4: Testing & Quality Assurance (Days 16-18)

### 4.1 Functional Testing Checklist

#### Authentication:
- [ ] Login with existing user works
- [ ] Register new user works  
- [ ] Password reset works
- [ ] Session persists after restart
- [ ] Logout works correctly

#### POS Workflow:
- [ ] Add items to cart
- [ ] Remove items from cart
- [ ] Apply discount (if applicable)
- [ ] Select payment method
- [ ] Create invoice successfully
- [ ] Invoice saved to database
- [ ] Receipt prints/exports to PDF

#### Inventory:
- [ ] List items with pagination
- [ ] Search items by name/barcode
- [ ] Add new item with image
- [ ] Edit item details
- [ ] Delete item (soft delete)
- [ ] Images display correctly

#### Customers:
- [ ] List customers
- [ ] Create new customer
- [ ] View customer detail
- [ ] See transaction history
- [ ] Record payment
- [ ] View debt balance

#### Reports & Export:
- [ ] Export invoices to Excel
- [ ] Filter by date range
- [ ] Export contains correct data
- [ ] Dashboard analytics calculate correctly

#### Offline Functionality:
- [ ] App works without internet connection
- [ ] Stop PHP server and app degrades gracefully
- [ ] Resume PHP server and app recovers
- [ ] No data loss during outage

#### Settings:
- [ ] Show app version
- [ ] Show database stats
- [ ] Backup database to file
- [ ] Restore database from backup
- [ ] Update exchange rate

### 4.2 Performance Testing

#### Metrics to Measure:
- [ ] App startup time: **Target < 10 seconds**
- [ ] Login response time: **Target < 2 seconds**
- [ ] Add to cart response: **Target < 500ms**
- [ ] Create invoice response: **Target < 1 second**  
- [ ] Search invoices with 1000 records: **Target < 2 seconds**
- [ ] Memory usage: **Target < 500MB**

#### Load Testing:
```bash
# Create test data with 1000+ invoices
php artisan db:seed --class=TestDataSeeder

# Measure search performance
# Measure reporting performance
# Measure export performance
```

### 4.3 Security Testing

- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS prevention (React auto-escapes)
- [ ] CSRF protection (session-based)
- [ ] File upload validation
- [ ] Database file permissions (read/write by app only)
- [ ] No sensitive data in logs

### 4.4 Cross-Platform Testing (Future)

Windows 10/11:
- [ ] App installs without admin
- [ ] Database initializes correctly
- [ ] All features work
- [ ] No dependency issues

---

## PHASE 5: Packaging & Release (Days 19-21)

### 5.1 Build Production Release

**Objective:** Create distributable EXE installer.

#### Commands:

```bash
# Full build process
npm run build  # Build React app
npm run build:electron:win  # Build Windows EXE

# Output files in dist-electron/:
# - MART2500 POS Setup 1.0.0.exe  (NSIS installer)
# - MART2500 POS-1.0.0-portable.exe  (Portable)
```

#### Build Configuration Verification:
- [ ] electron-builder.config.js has correct productName
- [ ] Version in package.json matches release version
- [ ] All files included (database/, vendor/, storage/)
- [ ] App icon configured
- [ ] No debug files included

### 5.2 Code Signing (Optional but Recommended)

**Purpose:** Prevent Windows Defender/SmartScreen warnings

#### Steps:

1. **Obtain Certificate** (or self-sign for testing)
   ```bash
   # Self-signed (for testing only)
   New-SelfSignedCertificate -CertStoreLocation Cert:\CurrentUser\My `
     -Subject "CN=MART2500" -KeyAlgorithm RSA -KeyLength 2048 `
     -Type CodeSigningCert
   ```

2. **Export Certificate**
   ```powershell
   $cert = Get-ChildItem -Path Cert:\CurrentUser\My -CodeSigningCert
   Export-PfxCertificate -Cert $cert -FilePath cert.pfx -Password (ConvertTo-SecureString -String "password" -AsPlainText -Force)
   ```

3. **Configure Signing in electron-builder.config.js**
   ```javascript
   win: {
       certificateFile: 'cert.pfx',
       certificatePassword: process.env.CERT_PASSWORD,
   }
   ```

4. **Build with Signing**
   ```bash
   $env:CERT_PASSWORD = "your-password"
   npm run build:electron:win
   ```

### 5.3 Test on Clean Machine

**Objective:** Verify installer works on machine with no dependencies.

#### Testing Checklist:

1. **Pre-Install:**
   - [ ] Copy EXE to clean Windows 10/11 machine (USB drive)
   - [ ] No development tools installed
   - [ ] No PHP installed

2. **Install:**
   - [ ] Double-click EXE to start installer
   - [ ] Choose installation location
   - [ ] Create Start menu shortcuts
   - [ ] Create desktop shortcut

3. **First Run:**
   - [ ] App launches without errors
   - [ ] Database initializes
   - [ ] Can login/register
   - [ ] Can complete POS workflow

4. **Uninstall:**
   - [ ] Add/Remove Programs shows MART2500
   - [ ] Uninstall removes all files
   - [ ] No leftover registry entries

### 5.4 Create Release Notes

**File:** `RELEASE_NOTES.md`

```markdown
# MART2500 POS v1.0.0 - Desktop Release

## What's New
- Offline desktop application for Windows
- All features from web version
- Local SQLite database
- Excel export and PDF printing
- Automatic database backups
- Performance optimized

## System Requirements
- Windows 10 or Windows 11
- 200MB disk space
- No PHP or MySQL installation required

## Installation
1. Download MART2500-POS-Setup-1.0.0.exe
2. Double-click to run installer
3. Choose installation folder
4. Click "Install"
5. Launch from Start menu or desktop shortcut

## Known Limitations
- Single user per installation
- No multi-machine sync (MVP)
- No payment gateway integration

## Bug Fixes & Notes
- See CHANGELOG.md for detailed list

## Support
- Report bugs at: [support email]
- User guide: See Help menu
```

---

## PHASE 6: Post-Release & Improvements (Ongoing)

### 6.1 Monitoring & Bug Fixes

- [ ] Collect error logs from user installations
- [ ] Monitor crash reports
- [ ] Fix reported bugs
- [ ] Release patch updates (v1.0.1, v1.0.2, etc.)

### 6.2 Feature Requests for v1.1

**Potential Enhancements:**
- Multi-user with role-based access
- Invoice editing (with audit trail)
- Multi-machine sync to cloud
- Advanced reporting
- Barcode scanning integration
- Printer configuration UI
- Mobile app sync

### 6.3 Auto-Update Mechanism

Setup GitHub releases for automatic updates:

```javascript
import { autoUpdater } from 'electron-updater';

function setupAutoUpdater() {
    autoUpdater.checkForUpdatesAndNotify();
}
```

---

## Success Criteria Checklist

- [ ] App installs as single .exe file
- [ ] Initial launch initializes database automatically
- [ ] All POS features work offline
- [ ] Login/authentication works
- [ ] Can create, view, export invoices
- [ ] Images load and display correctly
- [ ] Printing to PDF works
- [ ] Excel export works correctly
- [ ] Settings panel shows version and status
- [ ] Database backup/restore works
- [ ] App performance is acceptable (<10s startup)
- [ ] No critical errors in logs
- [ ] User can uninstall cleanly
- [ ] Code is signed (optional)
- [ ] Release notes are clear
- [ ] Test on clean machine is successful

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| PHP server fails to start | Show error dialog with troubleshooting steps |
| Database corruption | Automatic backups on app exit |
| Windows permission issues | Run installer as admin; verify file permissions |
| Large database performance | Index queries; paginate UI; lazy load |
| User confusion | In-app help; user guide PDF; tooltips |
| External API calls fail | Gracefully disable features; show warning |

---

## Team Roles & Responsibilities

| Role | Responsibility |
|------|---|
| **Developer** | Implement Electron configuration, IPC handlers |
| **QA** | Test workflows, performance, security |
| **DevOps** | Configure build pipeline, code signing |
| **Product** | Release notes, user documentation, support |

---

## Communication & Escalation

- **Daily Standup:** 10:00 AM (if team size > 1)
- **Blocker Escalation:** Immediate to team lead
- **Release Decision:** Go/No-Go meeting on Day 18

---

## References & Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder](https://www.electron.build/)
- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev)

---

**Document Version:** 1.0  
**Last Updated:** April 8, 2026  
**Next Review:** After Phase 1 Completion

