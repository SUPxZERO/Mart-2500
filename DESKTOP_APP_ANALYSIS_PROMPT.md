# Master Prompt: Convert Laravel System to Offline Desktop Application (EXE)

## Project Analysis & Desktop Application Conversion Strategy

You are an expert software architect specializing in converting web-based Laravel applications into standalone desktop applications for Windows. Your goal is to analyze this Laravel project comprehensively and create a detailed conversion strategy.

## PHASE 1: COMPREHENSIVE PROJECT ANALYSIS

### 1.1 Project Structure Investigation
**Analyze and document:**
- [ ] **Core Application Stack**: Identify the web framework (Laravel), frontend framework (appears to be Vue/Inertia), database engine (likely MySQL/SQLite)
- [ ] **Data Dependencies**: List all database tables and their relationships
- [ ] **External APIs & Services**: Identify any external services, APIs, payment gateways, or cloud dependencies
- [ ] **Authentication System**: Document how user authentication works (session-based, token-based, OAuth)
- [ ] **File Storage**: Identify where files are stored and retrieved (local storage, cloud storage, S3, etc.)

### 1.2 Technology Stack Audit
**Examine:**
- [ ] Laravel version and dependencies (from `composer.json`)
- [ ] Frontend framework (from `package.json` and `vite.config.js`)
- [ ] Node.js dependencies and versions
- [ ] Any system binaries or external tools required
- [ ] Database driver and version requirements
- [ ] PHP version requirements

### 1.3 Data & Business Logic Analysis
**Document:**
- [ ] **Models**: All Eloquent models and their relationships (app/Models/)
- [ ] **Business Logic**: Controllers, services, and business logic location (app/Http/Controllers/)
- [ ] **Database Migrations**: Schema and data structure (database/migrations/)
- [ ] **Exports & Imports**: Data export functionality (InvoicesExport.php indicates report generation)
- [ ] **Real-time Features**: Any WebSocket, real-time update systems, or event-driven features

### 1.4 Offline Capability Assessment
**Evaluate:**
- [ ] Current offline capabilities (if any)
- [ ] Dependence on real-time server connections
- [ ] API endpoints that need to work offline
- [ ] Data synchronization requirements
- [ ] User session management for offline scenarios

### 1.5 Integration Point Mapping
**Identify:**
- [ ] Payment gateway integrations (Stripe, PayPal, etc.) - need offline handling strategy
- [ ] Email sending services - queue and cache strategies needed
- [ ] File export/import operations - compatibility requirements
- [ ] External data sources or APIs

## PHASE 2: CONVERSION ARCHITECTURE DESIGN

### 2.1 Desktop Framework Selection
**Recommend and justify:**
- [ ] **Electron**: For cross-platform, web technologies (HTML/CSS/JS)
  - Pros: Reuse existing Vue/React code, large ecosystem
  - Cons: Larger app size, resource-intensive
- [ ] **Tauri**: Modern, lightweight alternative
  - Pros: Smaller footprint, better performance, Rust backend
  - Cons: Newer ecosystem, fewer examples
- [ ] **.NET + WPF/WinForms**: If Windows-only is acceptable
  - Pros: Native performance, fully offline
  - Cons: Complete rewrite needed

**RECOMMENDED FOR THIS PROJECT**: Electron (preserves existing web codebase)

### 2.2 Offline Database Strategy
**Design:**
- [ ] **Database Option**: SQLite (embedded) vs SQLite with Room/Realm for sync
- [ ] **Data Sync Architecture**: Define sync strategy (local-first, server-first, hybrid)
- [ ] **Conflict Resolution**: How to handle offline changes when reconnected
- [ ] **Storage Location**: Where to store local database files
- [ ] **Backup Strategy**: How to backup user data

### 2.3 Backend Architecture
**Plan:**
- [ ] **Local PHP/Laravel Runtime**: Options for embedding PHP in desktop app
  - Option A: Use existing Laravel API, embed Node.js to spawn PHP processes
  - Option B: Convert critical paths to Node.js/TypeScript
  - Option C: Use SQLite driver as drop-in replacement for web API calls
- [ ] **API Bridge**: How Electron frontend communicates with backend logic
- [ ] **File System Access**: Reading/writing files locally vs. through API

### 2.4 Frontend Adaptation
**Identify:**
- [ ] Current frontend framework (Vue via Inertia)
- [ ] Components needing offline adaptation
- [ ] State management changes (Vuex/Pinia for offline state)
- [ ] Network availability detection and UI updates
- [ ] Local storage/caching strategies for offline data

### 2.5 Data Synchronization
**Plan:**
- [ ] **Sync Triggers**: When to sync (on connect, batch syncs, real-time)
- [ ] **Conflict Resolution Algorithm**: How to merge local and server changes
- [ ] **Queue System**: Store offline actions for later sync
- [ ] **Network Status Detection**: Detect when connection is available
- [ ] **Rollback Strategy**: How to handle sync failures

## PHASE 3: TECHNICAL REQUIREMENTS & DEPENDENCIES

### 3.1 New Dependencies to Add
**Frontend Stack:**
```
- electron: Desktop framework
- electron-builder: Packaging and signing
- electron-updater: Auto-update system
- better-sqlite3 or sql.js: Client-side database
- axios or fetch: HTTP client with offline queue support
- vuex-persist or pinia-plugin-persistedstate: State persistence
- idb: IndexedDB wrapper for offline storage
```

**Backend Options:**
```
Option A (Keep PHP/Laravel):
- electron-spawn-php: Spawn PHP in Electron
- Better alternative: Run PHP-CLI in separate process

Option B (Node.js Bridge):
- Express.js: Create local API server in Electron main process
- Knex or Sequelize: Query builder for SQLite

Option C (Direct SQLite):
- sqlite3 or better-sqlite3: Direct database access
- No backend needed
```

### 3.2 Build & Packaging Requirements
**Tools needed:**
- [ ] Electron-builder for creating installer
- [ ] Code signing certificates (Microsoft Authenticode for EXE)
- [ ] Version management system
- [ ] CI/CD pipeline for building (GitHub Actions, AppVeyor, or local build script)

### 3.3 Database Migration Strategy
**Plan:**
- [ ] Extract Laravel migrations to work with desktop SQLite
- [ ] Create database initialization scripts
- [ ] Seed default data for offline use
- [ ] Plan for version upgrades and schema migrations

## PHASE 4: IMPLEMENTATION ROADMAP

### Phase 4.1: Foundation Setup (Week 1)
- [ ] Choose final backend approach (Embedded PHP, Express.js, or Direct SQLite)
- [ ] Set up Electron project structure
- [ ] Create basic Electron window with Vue component
- [ ] Verify current Vue components render in Electron

### Phase 4.2: Offline Database Layer (Week 2-3)
- [ ] Implement local SQLite database
- [ ] Create database initialization from Laravel migrations
- [ ] Build database query layer (abstraction for API vs local DB)
- [ ] Implement basic CRUD operations

### Phase 4.3: Sync Engine (Week 3-4)
- [ ] Implement offline queue system
- [ ] Create sync conflict resolution logic
- [ ] Build network status detection
- [ ] Implement data sync triggers and handlers

### Phase 4.4: Feature Adaptation (Week 4-5)
- [ ] Adapt authentication for offline (local user, optional server login)
- [ ] Adapt file operations (export/import to local file system)
- [ ] Implement offline-aware UI (disable unavailable features)
- [ ] Test all critical user workflows offline

### Phase 4.5: Integration & Testing (Week 5-6)
- [ ] Integration testing: online + offline scenarios
- [ ] Performance testing and optimization
- [ ] Security audit (local data storage, encryption)
- [ ] User acceptance testing

### Phase 4.6: Packaging & Distribution (Week 6-7)
- [ ] Set up code signing
- [ ] Configure electron-builder for EXE generation
- [ ] Create installer with auto-updater
- [ ] Build distribution pipeline
- [ ] Create installer and test on clean Windows machine

## PHASE 5: CRITICAL DECISIONS REQUIRED

### 5.1 Feature Scope for Offline
**Questions to answer:**
- [ ] Which features MUST work offline? (Core: invoices, items, customers; Optional: payments, reports)
- [ ] Is online sync mandatory or optional?
- [ ] Should app work completely standalone, or only partially offline?
- [ ] What happens when desktop version differs from server version?

### 5.2 Backend Processing
**Questions to answer:**
- [ ] Can PHP/Laravel processing be replicated or replaced?
- [ ] How to handle complex business logic (calculations, validations)?
- [ ] Export functionality - how to implement "print to PDF" offline?

### 5.3 Data Ownership
**Questions to answer:**
- [ ] Is local data authoritative, or is server data?
- [ ] How to handle data conflicts?
- [ ] What to do if user has offline data but server has different version?

### 5.4 Security & Access
**Questions to answer:**
- [ ] Should local database be encrypted?
- [ ] How to manage user credentials offline?
- [ ] Should app require initial server login before offline use?

## PHASE 6: SPECIFIC FILE CONVERSIONS NEEDED

Based on Laravel structure analysis:

### Backend Files to Review:
- [ ] `app/Models/*` - Core data models (need SQLite equivalents)
- [ ] `app/Http/Controllers/*` - Business logic (needs adaptation or rewrite)
- [ ] `app/Data/*` - Data transfer objects (InvoiceItemData.php, StoreInvoiceRequest)
- [ ] `app/Exports/*` - Export logic (InvoicesExport.php - needs PDF generation library)
- [ ] Database migrations in `database/migrations/` - Schema to port

### Frontend Files to Review:
- [ ] All Vue components in `resources/views/` - Verify Electron compatibility
- [ ] Inertia configuration - May need adjustment for SPA mode
- [ ] CSS and styling - Ensure responsive for desktop app

### Configuration Files to Update:
- [ ] `vite.config.js` - Add Electron build targets
- [ ] `tailwind.config.js` - Ensure desktop-friendly defaults
- [ ] `jsconfig.json` - Update path mapping for new structure

## PHASE 7: RISK & MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Losing web version compatibility | Low | Critical | Maintain web app in parallel; use abstraction layer |
| Complex backend logic difficult to replicate | Medium | High | Identify critical paths early; evaluate embedded PHP |
| Data sync conflicts causing data loss | Medium | High | Implement robust conflict resolution; comprehensive testing |
| Performance issues with data sync | Medium | Medium | Implement efficient sync algorithm; batch operations |
| Users confused by offline/online modes | Medium | Medium | Clear UI indicators; documentation |
| Payment processing offline impossible | High | High | Document limitation; skip in offline mode with warnings |

## PHASE 8: SUCCESS CRITERIA

- [ ] App launches and runs without errors
- [ ] All core features work in offline mode
- [ ] User data persists locally
- [ ] Online sync works correctly
- [ ] EXE installer <500MB
- [ ] App starts in <3 seconds
- [ ] Zero loss of data during sync
- [ ] User can export their data
- [ ] App can run on Windows 10 and later
- [ ] Auto-update system functional
- [ ] User documentation complete

## NEXT STEPS

1. **Run this analysis**: Use AI agent to analyze your project against this framework
2. **Make architectural decisions**: Work through Phase 5 critical decisions
3. **Create detailed spec**: Document chosen approach with specific implementation details
4. **Build prototype**: Start with Phase 4.1 foundation setup
5. **Iterate and refine**: Adapt based on learnings and blockers

---

## QUESTIONS TO ASK YOUR AGENT

When analyzing the project, ask:
1. "Analyze the Laravel structure and identify which features must work offline"
2. "What external dependencies will block offline functionality?"
3. "Map the database schema and recommend best offline database strategy"
4. "Identify the largest architectural refactoring needed"
5. "Should we keep Laravel backend or convert to Node.js?"
6. "What's the minimal viable offline feature set?"
7. "How should we handle existing user sessions/data migrating to desktop?"
