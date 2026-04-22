# MART2500 Electron: Quick Start Guide for Developers

## One-Time Setup (First Time)

```bash
cd e:\promgramming\mart2500

# 1. Install npm dependencies
npm install

# 2. Create .env if not exists
# Copy .env.example to .env and verify settings
```

---

## Daily Development Workflow

### Option 1: Full Development Stack (Recommended)

```bash
# Terminal 1: Start everything together
npm run dev

# This runs:
# - Vite dev server (http://localhost:5173)
# - Electron app
# - File watcher for rebuilds
```

### Option 2: Manual Control (If troubleshooting)

```bash
# Terminal 1: Laravel/PHP development server
npm run dev:web

# Terminal 2: Electron application
npm run dev:electron

# Terminal 3 (optional): Watch build changes
npm run dev:watch
```

---

## Testing the Complete Workflow

### 1. Fresh Database

```bash
# If database.sqlite exists in userData folder, delete it:
# Windows: Delete %APPDATA%\MART2500\database.sqlite

# Start app - database will auto-initialize
npm run dev
```

### 2. Test POS Checkout

1. Login (create account on Registration page)
2. Navigate to POS
3. Select items and add to cart
4. Create invoice
5. Verify data saved to database

### 3. Test Data Persistence

1. Close Electron app (not Vite)
2. Restart Electron: `npm run dev:electron`
3. Data should still be there

---

## Checking Database Status

### View Database Location

```bash
# Windows PowerShell
echo $env:APPDATA\MART2500\database.sqlite

# Or in Linux/Mac
echo ~/.config/MART2500/database.sqlite
```

### Inspect Database

```bash
# Using SQLite CLI (if installed)
sqlite3 $env:APPDATA\MART2500\database.sqlite ".tables"

# Or use any SQLite viewer application
```

---

## Common Issues & Fixes

### Issue: "Cannot find module 'electron'"

**Fix:**
```bash
npm install electron --save-dev
# OR
npm install
```

### Issue: Blank Electron window

**Fix:**
1. Make sure `npm run dev:web` is running first
2. Check PHP server is running (port 8000)
3. Open DevTools (Ctrl+Shift+I) and check console errors

### Issue: "PHP artisan not found"

**Fix:**
```bash
# Make sure you're in the right directory
cd e:\promgramming\mart2500

# Check PHP is installed
php --version

# Check artisan exists
ls artisan  # On Windows: dir artisan
```

### Issue: Database permission denied

**Fix:**
```bash
# Make sure $APPDATA\MART2500 folder permissions are correct
# Check database.sqlite file is readable/writable

# On Windows, verify NTFS permissions
# Right-click folder → Properties → Security
```

### Issue: Port 8000 already in use

**Fix:**
```bash
# Find process using port 8000
netstat -ano | findstr :8000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use different port in electron/utils/php-server.js
```

---

## Building for Distribution

### Build as Portable EXE

```bash
# This creates a standalone executable
npm run build:electron:win:portable

# Output: dist-electron/MART2500 POS-1.0.0-portable.exe
```

### Build as Installer

```bash
# This creates NSIS installer
npm run build:electron:win

# Output: dist-electron/MART2500 POS Setup 1.0.0.exe
```

### Build All Platforms (Future)

```bash
npm run build:electron:all  # Windows, Mac, Linux
```

---

## Development Tips

### 1. Using DevTools

```javascript
// In main.js, DevTools is enabled in development
if (isDev) {
    mainWindow.webContents.openDevTools();
}

// Or toggle manually: Ctrl+Shift+I
```

### 2. Debugging PHP

```javascript
// PHP server output is logged in console
// Check electron console for [PHP] messages

// Increase verbosity in electron/utils/php-server.js
phpProcess.stdout.on('data', (data) => {
    console.log(`[PHP] ${data.toString()}`);
});
```

### 3. Reloading App

```javascript
// Hard reload (clear cache)
Ctrl+Shift+R

// Soft reload
Ctrl+R

// Restart Electron app
Close window and run npm run dev:electron
```

---

## File Structure Reference

```
mart2500/
├── electron/                 ← Desktop app code
│   ├── main.js              ← Main process
│   ├── preload.js           ← IPC bridge
│   ├── menu.js              ← App menu
│   ├── handlers.js          ← IPC handlers (create this)
│   └── utils/
│       ├── php-server.js    ← Spawn PHP
│       └── database.js      ← Database init
├── resources/
│   ├── js/
│   │   ├── Pages/           ← React pages
│   │   ├── Components/      ← React components
│   │   └── hooks/           ← Custom hooks
│   └── css/                 ← Stylesheets
├── app/                      ← Laravel backend
├── config/                   ← Laravel config
├── database/
│   ├── migrations/          ← Schema
│   └── seeders/             ← Sample data
├── storage/
│   └── app/public/items/    ← Product images
├── package.json             ← NPM scripts
├── electron-builder.config.js
└── .env                     ← Environment vars
```

---

## Next Steps

### Phase 1 (This Week):
- [x] Create Electron configuration
- [ ] Install dependencies: `npm install`
- [ ] Test development environment: `npm run dev`
- [ ] Verify POS workflow works in Electron

### Phase 2 (Next Week):
- [ ] Add desktop status indicators
- [ ] Integrate file dialogs
- [ ] Add backup/restore UI
- [ ] Performance testing

### Phase 3 (Week 3):
- [ ] Final testing on clean machine
- [ ] Build release EXE
- [ ] Create user documentation
- [ ] Release v1.0.0

---

## Support & Documentation

- **Main Analysis:** [DESKTOP_CONVERSION_ANALYSIS.md](DESKTOP_CONVERSION_ANALYSIS.md)
- **Roadmap:** [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md)
- **Electron Docs:** https://www.electronjs.org/docs
- **Laravel Docs:** https://laravel.com/docs

---

## Questions?

**Missing dependencies?** → Run `npm install`
**App won't start?** → Check both terminals running (Vite + Electron)
**Database issues?** → Check `%APPDATA%\MART2500\database.sqlite` exists
**Need to reset?** → Delete database, restart app

