/**
 * Electron Builder Configuration
 * 
 * This configuration is used to build and package the Electron app
 * into platform-specific installers (.exe for Windows)
 */

module.exports = {
    appId: 'com.mart2500.pos',
    productName: 'MART2500 POS',
    asarUnpack: [
        "artisan",
        "vendor/**/*",
        "app/**/*",
        "bootstrap/**/*",
        "config/**/*",
        "database/**/*",
        "routes/**/*",
        "storage/**/*",
        ".env"
    ],
    
    // Build directory
    directories: {
        buildResources: 'resources',
        output: 'dist',
    },
    
    // Files to include in the build
    files: [
        'package.json',
        'electron/**/*',
        'public/**/*',
        'storage/**/*',  // Database and file storage
        'vendor/**/*',   // PHP vendor files
        'database/**/*',  // Database migrations and seeders
        'bootstrap/**/*',
        'config/**/*',
        'routes/**/*',
        'app/**/*',
        'resources/**/*',
        '.env',
        'artisan',
        'node_modules/**/*',
    ],
    
    // Windows-specific configuration
    win: {
        target: [
            {
                target: 'portable',
                arch: ['x64'],
            },
        ],
        certificateFile: process.env.WIN_CERTIFICATE_FILE || undefined,
        certificatePassword: process.env.WIN_CERTIFICATE_PASSWORD || undefined,
        signingHashAlgorithms: ['sha256'],
        sign: process.env.WIN_CERTIFICATE_FILE ? './customSign.js' : undefined,
    },
    
    // NSIS Installer configuration (Windows)
    nsis: {
        oneClick: false,
        allowToChangeInstallationDirectory: true,
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        shortcutName: 'MART2500 POS',
        // installerIcon: 'resources/icons/icon.ico',
        // uninstallerIcon: 'resources/icons/icon.ico',
        // installerHeaderIcon: 'resources/icons/icon.ico',
    },
    
    // Portable executable configuration
    portable: {
        artifactName: '${productName}-${version}-portable.exe',
    },
    
    // macOS configuration (for future)
    mac: {
        target: ['dmg', 'zip'],
        category: 'public.app-category.business',
    },
    
    // Linux configuration (for future)
    linux: {
        target: ['AppImage', 'deb'],
        category: 'Office',
    },
    
    // Build metadata
    extraMetadata: {
        main: 'electron/main.js',
    },
};
