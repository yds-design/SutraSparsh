# SutraSparsh (सूत्रस्पर्श) — Sacred Sanskrit Wisdom Platform

> *तमेव शरणं गच्छ सर्वभावेन भारत।*  
> *"Take refuge in Him alone with all your being."* — Bhagavad Gita 18.62

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.6--web--compliant-gold.svg)](package.json)
[![Status](https://img.shields.io/badge/status-PRODUCTION_LAUNCH_CERTIFIED-success.svg)](TEST_RESULTS.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)](tsconfig.json)
[![React](https://img.shields.io/badge/React-19.2-cyan.svg)](package.json)
[![Express](https://img.shields.io/badge/Express-5.2-lightgrey.svg)](server.ts)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple.svg)](vite.config.ts)

SutraSparsh is a digital sanctuary engineered for the study, contemplation, and sadhana of sacred Sanskrit literature. It unites authentic canonical texts (Bhagavad Gita, Patanjali Yoga Sutras, Principal Upanishads, and Vedic Chants) with modern Paninian linguistic tools, high-fidelity neural audio synthesis, structured spiritual habit tracking, community satsang, verified Vedic Purohit services, and a unified Parchment Dawn design system.

---

## 🌟 Key Features

### 1. Sacred Canonical Scripture Reader & Multi-Tradition Library
- **Four Foundational Streams**: Full canonical texts for *Bhagavad Gita* (18 Chapters), *Patanjali Yoga Sutras* (4 Padas), *Principal Upanishads* (Isha, Kena, Katha, Mandukya, etc.), and *Vedic Chants*.
- **Four Paths of Sadhana Taxonomy**: Organization across *Karma Yoga* (Action), *Raja Yoga* (Meditation), *Jnana Yoga* (Wisdom), and *Bhakti Yoga* (Devotion).
- **High-Fidelity Sanskrit Typography**: Bespoke Devanagari typography (`Noto Serif Devanagari`, `Tiro Devanagari Sanskrit`, `Cinzel`), IAST Roman transliteration with diacritics, and modern English translations.
- **Comparative Lineage Commentaries**: Multi-commentary drawer comparing classical traditions (*Advaita Vedanta* / Adi Shankara, *Vishishtadvaita* / Ramanuja, and contemporary modern commentary).

### 2. Dynamic Pāṇinian Morphological Engine & "Look Closer" Studio
- **Aṣṭādhyāyī Root Tracing**: Identifies primary Sanskrit verbal roots (*Dhātu*) with class markers (*Gaṇa*), semantic glosses (*Artha*), and classical grammatical citations.
- **Morphological Dissection**: Analyzes verbal and nominal affixes (*Pratyaya*), grammatical case (*Vibhakti*), number (*Vacana*), tense/mood (*Lakāra*), and voice (*Prayoga*).
- **Compound Decomposition (*Samāsa-Vigraha*)**: Breaks compound Sanskrit words into components (*Tatpuruṣa*, *Karmadhāraya*, *Bahuvrīhi*, *Dvandva*).
- **Phonetic Junction Resolution (*Sandhi-Viccheda*)**: Explains euphonic sound combinations.
- **5-Stage "Look Closer" Contemplative Modal**:
  1. *Verse Architecture & Metre* (Chhandas, rhythm)
  2. *Etymological Anatomy* (Word-by-word Paninian roots)
  3. *Philosophical Essence* (Core spiritual takeaway)
  4. *Lineage Perspectives* (Comparative commentary insights)
  5. *Contemplative Application* (Practical daily sadhana integration)

### 3. Sacred Vedic Audio Engine, Bhashini ULCA & Chants Player
- **Bhashini ULCA Dual-Engine Integration**: Government of India MeitY Bhashini Indic-TTS pipeline (`bhashiniService.js`) providing sacred Sanskrit (`sa`) and Hindi (`hi`) voice synthesis with archetypes: *Devī Saraswatī (Female)* and *Sage Vyāsa (Male)*.
- **Automatic Multi-Tier Failsafe**: Seamless automated retry mechanism falling back to Google Cloud Neural2 (`hi-IN-Neural2-A/B`) upon Bhashini 500 error or network outage, with browser `SpeechSynthesis` offline contingency.
- **Resilient Audio Lifecycle & Memory Disposal**: Deterministic byte-level pre-validation (`validateAudioSource`), RIFF/WAV header packaging, and automatic `URL.revokeObjectURL()` upon playback completion or error to eliminate memory leaks during long contemplative sessions.
- **432Hz Ambient Synthesizer**: Continuous 432 Hz frequency resonance engine tuned for deep meditative listening.
- **Temple Acoustic Drone**: Continuous Tanpura and sacred *Om* acoustic loops creating an immersive sanctum atmosphere.
- **Recitation Highlighting & Controls**: Synchronized verse highlighting, repetition loops, playback speed scaling (0.70x–1.00x with 0.80x default shloka pace), and independent drone volume faders.

### 4. Instant Sanskrit Search & Transliteration Discovery Engine
- **Multi-Script Inverted Index**: Sub-15ms search across Devanagari script (e.g. `कर्म`), IAST transliteration (`karma`), and English semantic meanings (`duty`).
- **Phonetic Matching**: Tolerates common phonetic spelling variations (`moksha` vs `mokṣa`, `dhyana` vs `dhyāna`).
- **Faceted Filtering**: Narrow by tradition, chapter, sadhana path, tags, and difficulty tier.

### 5. Seeker Identity, Sādhana Tracking & 15-Minute Daily Goal
- **Seeker Profiles & Guest Mode**: Zero-friction guest access with local storage persistence and optional authenticated cloud synchronization.
- **Streak Fire Counter & Tiers**: Dynamic streak tracking with spiritual progression tiers (*Prārambhik*, *Daily Abhyāsi*, *Sādhana Seeker*, *Siddha Sādhaka*).
- **15-Minute Daily Sadhana Goal**: Dedicated progress ring tracking daily recitation and reading time; triggers a celebratory milestone with Sanskrit blessings (*अभ्यासेन तु कौन्तेय*) and confetti animation upon completion.
- **Wisdom Journal & Bookmarks**: Contemplative reflections notebook with JSON/text export capabilities and one-tap scripture bookmarks.
- **Brahma Muhurta Dawn Calculator**: Astrological dawn calculation based on local time and coordinates with meditation notifications.

### 6. Vedic Purohit Directory & Click-to-WhatsApp Booking
- **Verified Vedic Purohits**: Authentic profiles detailing Veda Shakha lineage, certifications, experience (10+ to 25+ years), and languages spoken.
- **Ceremonial Catalog**: Complete ritual breakdowns for *Griha Pravesh*, *Maha Rudrabhishek*, *Satyanarayan Katha*, *Navagraha Shanti*, *Vivah Samskara*, and *Shradh Pitru Tarpan*.
- **Transparent Dakshina**: Clear pricing guidance differentiating Purohit Dakshina from Samagri requirements without hidden fees.
- **One-Tap WhatsApp Booking**: Deep link protocol (`https://wa.me/...`) pre-populating seeker details, ritual choice, preferred date, and location.

### 7. Community Board Satsang
- **Satsang Contemplation Topics**: Community discussions organized by sadhana paths (*Karma Yoga*, *Raja Yoga*, *Jnana Yoga*, *Bhakti*).
- **Verse-Linked Dialogues**: Seekers can anchor contemplative insights directly to specific shlokas.
- **Anumodana (Spiritual Upvoting)**: Uplifting community feedback mechanism supporting respectful discussion.

### 8. Universal Theme Sanctuary & Parchment Dawn Constitution
- **Parchment Dawn (Light Mode)**: 100% unified manuscript aesthetic featuring pure white Restro-style card surfaces (`#ffffff`, border `#cfcbe0`) over a subtle ash canvas (`#f7f6fb`). Typography strictly adheres to Night Indigo titles (`#1b1740`), Soft Ink body copy (`#55526b`), and sacred Diya Gold eyebrow badges (`#b8801f`). Fully unified across:
  - **Today**: *Daily Shloka Rotation* featured card and contemplation controls.
  - **Explore**: *Timeless Sanskrit Wisdom & Philosophical Heritage* hero and scripture browser.
  - **Search**: *Intent-Driven Discovery • ज्ञान खोज* hero and inverted index query console.
  - **Community**: *Satsang Mandali • सत्संग मण्डली* community board and philosophical discussion threads.
  - **Personal Sanctuary**: *Personal Sanctuary • मेरी साधना* daily streak and study goal tracker.
- **Golden Hour Atmosphere**: Warm monastic earth, butter cream, burnt honey, and deep ink accents.
- **Unified ThemeObserver Pattern**: Guarantees theme classes (`parchment-dawn`, `theme-light`, `golden-hour`) are applied globally to `<html>` and `<body>` on any navigation event (`pushState`, `replaceState`, `popstate`, `hashchange`).
- **ModalPortal Theme Observer**: Active `MutationObserver` synchronizing theme tokens into detached DOM portals, guaranteeing zero theme leakage or contrast inversion.
- **Fail-Safe React ErrorBoundary**: Top-level error boundary in `src/main.tsx` providing a soothing SutraSparsh recovery interface with one-tap reload and session cache reset.

### 9. High-Performance Infinite Scroll & Memoization
- **React.memo Custom Comparison**: `VerseCard` memoization with custom predicate evaluating `id`, `isBookmarked`, and active recitation state, preventing unnecessary re-renders.
- **O(1) Bookmark Lookups & useMemo Architecture**: Instant lookup via `bookmarkedIdsSet` and memoized verse list collections, guaranteeing smooth 60fps rendering during infinite scroll operations.

### 10. Operational Governance: Phase 1 Sanctuary & Phase 2 Gateways
- **Phase 1 Sanctuary Mode (Active by Default)**: Client devices operate in a pure, distraction-free spiritual sanctuary with all monetization and donation features hidden.
- **Phase 2 Dynamic Admin Controls**: Centralized feature flags service in Admin Console (`/admin`) allowing instant one-click activation of Sādhaka Patrons, Gurudakshina, and 80G tax receipt issuance.

### 11. Progressive Web App (PWA) & Complete SEO Architecture
- **PWA Ready**: Web App Manifest (`manifest.webmanifest`), standalone display mode, home screen installability, and offline caching.
- **Complete SEO**: Dynamic head metadata injection, canonical URLs, multilingual hreflang (`en`, `sa`, `hi`), OpenGraph social cards, Twitter cards, Schema.org JSON-LD `@graph`, `/robots.txt`, and `/sitemap.xml`.

### 12. Dynamic Rolling Tithi Calendar & Panchang (महत्वपूर्ण तिथियाँ एवं पर्व)
- **Dynamic 30-Day Sliding Window**: Computes all sacred tithis from day 1 of the current calendar month and rolls forward through the next 30 days based on `new Date()`.
- **Astronomical Synodic Moon Calculations**: Deterministic calculation of lunar phase, Paksha (*Shukla* / *Krishna*), and Tithi index ($1$ to $15$) using astronomical epoch JD $2451550.26$.
- **Vedic Festival Catalog (2025–2027)**: Complete coverage of Ekadashis, Purnimas, Amavasyas, Pradosh Vrats, and major festivals (Diwali, Chhath Puja, Devuthani, Dev Deepawali).
- **Interactive Reminders & Today Badge**: Sound-engine integrated bell reminder with persistent storage, and an animated "Today • अद्य" indicator for the current date.

### 13. Subtle Glow Selected Chips, Shloka State Synchrony & Web Production Compliance (v1.0.6)
- **Chip Selected Subtle Glow (`<Chip />`)**: Global design tokens (`--chip-glow-active`, `--chip-transition: 180ms cubic-bezier(0.4, 0, 0.2, 1)`) applying soft multi-layer luminescence across light and dark modes, with `@media (prefers-reduced-motion: reduce)`, `@media (prefers-contrast: more)`, and overflow-safe horizontal scroll buffers (`py-1 px-0.5`).
- **Single Source of Truth Shloka Synchrony**: `DailyWisdomService` + `/api/v1/wisdom/*` synchronize daily shlokas across Today, Explore banner, and Look Closer studio, while keeping top-toolbar `Look Closer` hidden (`showLookCloserInToolbar={false}`) and safeguarding all `.split()` string operations against null/undefined fields.
- **19-Point Web Production Launch & Compliance**:
  - **Zero Client Secrets**: Bhashini ULCA & Google Cloud TTS credentials remain strictly server-side behind `/api/tts/synthesize` (1,000-character limit) and non-secret voice preference endpoints.
  - **Legal, Privacy & Consent**: Clean pathname routes `/privacy-policy`, `/terms`, `/verse/:id`, and a `noindex` 404 page; DPDP Act 2023 & GDPR disclosures for transient TTS processing; explicit opt-in Cookie Consent banner gating Google Analytics telemetry.
  - **SEO, Accessibility & Performance**: `1200x630` `og-image.png`, `apple-touch-icon.png`, `favicon.svg`, `site.webmanifest`, pinch-to-zoom viewport, `aria-hidden="true"` decorative SVGs, `role="alert"` validation with anti-spam honeypot/rate-limiting, `React.lazy` code splitting, and Workbox precache exclusions.

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT VIEWPORT                                │
│                                                                             │
│  ┌─────────────────────────┐             ┌───────────────────────────────┐  │
│  │   Seeker Sanctuary      │             │   Admin Operations Console    │  │
│  │   (sutrasparsh.com)     │             │   (admin.sutrasparsh.com)     │  │
│  │                         │             │                               │  │
│  │  • Scripture Reader     │             │  • Executive Dashboard        │  │
│  │  • Paninian Look Closer │             │  • Scripture Publisher CMS    │  │
│  │  • 432Hz Audio Engine   │             │  • Ingestion Pipelines        │  │
│  │  • Purohit Directory    │             │  • Seeker Profiles & Seva     │  │
│  │  • Sadhana Journey      │             │  • SRE Observability Matrix   │  │
│  │  • Community Board      │             │  • Phase 1/Phase 2 Gateways   │  │
│  └───────────┬─────────────┘             └───────────────┬───────────────┘  │
│              │                                           │                  │
└──────────────┼───────────────────────────────────────────┼──────────────────┘
               │                                           │
               ▼                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXPRESS 5 BACKEND PROXY                            │
│                                                                             │
│  • REST API Gateway (/api/content, /api/health, /api/metrics)               │
│  • Security Middleware (CSP, HSTS, Rate Limiting, XSS Sanitization)         │
│  • Inverted Search Index (Sub-15ms Devanagari/IAST Lookups)                │
│  • Google Cloud TTS Integration & Phonetic SSML Proxy                       │
│  • Robots.txt & Sitemap.xml SEO Cache Handlers                              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PERSISTENCE & INFRASTRUCTURE                           │
│                                                                             │
│  • Google Cloud Firestore (Canonical scriptures, seekers, audit trails)     │
│  • Resilient In-Memory Fallback Repository (Zero-credential local mode)     │
│  • Web Audio API Synthesizer (432Hz carrier wave, Tanpura/Om drone)        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Repository Directory Layout

```
/
├── backend/
│   └── importer/                  # Ingestion pipeline, collectors, and TTS benchmark
│       ├── src/audio/             # Google TTS providers and latency runners
│       ├── src/collectors/        # Source scripture collectors
│       └── src/normalizers/       # Paninian and Devanagari normalizers
├── docs/                          # Architectural specifications and phase reports
│   ├── architecture/              # Separation specifications
│   ├── deployment/                # Environment matrices, release notes, runbooks
│   └── PHASE_STATUS_REPORT.md     # Phase-by-phase deliverables matrix
├── public/                        # Static assets, PWA manifest, and brand marks
│   ├── logo.svg                   # Official sunrise brand crest
│   ├── icon-1024.png              # High-resolution 1024x1024 master icon
│   ├── manifest.webmanifest       # PWA configuration
│   ├── robots.txt                 # Search crawler rules
│   └── sitemap.xml                # Canonical URL XML index
├── scripts/
│   ├── ci-verify.ts               # CI/CD 10-Stage verification pipeline runner
│   └── generate-brand-icons.ts    # Resvg-powered automated asset generator
├── src/
│   ├── admin/                     # Admin Operations Console application shell
│   ├── components/                # Reusable UI components (Modals, Headers, Nav)
│   ├── config/                    # Environment, versioning, and feature configurations
│   ├── data/                      # Canonical scriptures, purohits, and commentaries
│   ├── db/                        # Database repository and fallback layers
│   ├── features/                  # Domain modules (WordExplorer, Audio, Journey)
│   ├── routes/                    # Express backend REST route handlers
│   ├── services/                  # Business logic (Auth, Audio, Search, Billing)
│   ├── styles/                    # Global CSS and high-contrast theme overrides
│   ├── testing/                   # Automated test suites and release gates
│   │   ├── system-testing-matrix.test.ts  # System Testing Matrix (TC-SYS-01 to 09)
│   │   ├── api-endpoints.test.ts          # Express API route verification
│   │   ├── pandit-services.test.ts        # Purohit directory & WhatsApp tests
│   │   ├── journey-relocation.test.ts     # Sanctuary consolidation tests
│   │   ├── theme-restriction-and-community.test.ts # Theme and community tests
│   │   ├── daily-goal-celebration.test.ts # 15-min daily goal & confetti tests
│   │   ├── seo-compliance.test.ts         # Dynamic head tags & schema tests
│   │   └── phase12-release-gate.ts        # 5 Mandatory exit criteria
│   ├── App.tsx                    # Root routing shell & modal providers
│   ├── main.tsx                   # React 19 entry point
│   └── SutraSparshTempleApp.tsx   # Sanctuary primary shell
├── index.html                     # HTML5 entry with SEO tags and noscript fallback
├── package.json                   # Dependencies, build scripts, and test triggers
├── server.ts                      # Express 5 backend server entry point
├── TEST_RESULTS.md                # Full test results documentation (381 assertions)
└── tsconfig.json                  # Strict TypeScript 6 configuration
```

---

## 🚀 Complete Guide: GitHub Pull, Push, Build & Run Commands

### 1. Prerequisites
- **Node.js**: v20.x or v22.x LTS (`node -v`)
- **npm**: v10.x or higher (`npm -v`)
- **Git**: v2.30+ (`git --version`)

---

### 2. GitHub Repository Setup & Remote Commands

#### Check Existing Remote Configuration
```bash
git remote -v
```

#### Set Up or Update Remote Origin
```bash
# Using HTTPS
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# Or if origin already exists, update URL:
git remote set-url origin https://github.com/<your-username>/<your-repo-name>.git

# Using SSH (recommended if SSH keys configured)
git remote set-url origin git@github.com:<your-username>/<your-repo-name>.git
```

#### Configure Git Identity
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

### 3. Pulling Changes from GitHub

#### Standard Pull (Main Branch)
```bash
# Fetch latest remote references and tags
git fetch origin --tags

# Pull with rebase to keep clean, linear commit history
git pull origin main --rebase
```

#### Pulling with Uncommitted Local Work (Stash & Restore)
```bash
# 1. Stash uncommitted changes
git stash save "wip-local-changes"

# 2. Pull latest upstream commits
git pull origin main --rebase

# 3. Re-apply stashed changes
git stash pop
```

#### Discard Local Working Directory & Match Remote Exactly (Hard Reset)
```bash
# CAUTION: Permanently discards local uncommitted changes
git fetch origin
git reset --hard origin/main
```

---

### 4. Committing Changes & Applying Release Labels / Tags

#### Stage & Commit Code
```bash
# Check working tree status
git status

# Stage all modified, created, and deleted files
git add .

# Create semantic commit with release labels
git commit -m "feat(sutrasparsh): v1.0.6 web compliance, chip glow, shloka synchrony & null safety

- Implement subtle glow selected chip design system (<Chip />) across Explore, Search, Modal & Soundscape filters with WCAG 2.2 AA/AAA contrast and reduced-motion/high-contrast overrides
- Harden null-safety around .split() string operations across WordExplorer, SearchEngine, Tithi calendar, SharingService & Header
- Unify DailyWisdomService SSOT & /api/v1/wisdom/* endpoints across Today, Explore & LookCloser flows; hide Look Closer from top toolbar (showLookCloserInToolbar={false})
- Complete 19-point Web Production Compliance audit: server-only Bhashini/TTS secrets, HTTPS/HSTS/CSP/Permissions-Policy headers, honeypot & rate-limited forms, /privacy-policy & /terms pages, opt-in Cookie Consent & gated GA4 analytics, 1200x630 og-image.png, clean routes (/verse/:id, 404), React.lazy splitting & accessible aria/role='alert' validation

Labels:
- release:v1.0.6
- compliance:19-point-web-launch
- ui:chip-selected-glow
- ui:toolbar-cleanup
- bugfix:split-null-safety
- sync:shloka-ssot
- security:server-proxy-tts
- status:production-ready"
```

#### Apply Semantic Git Tags & Labels
```bash
# Create annotated release tag
git tag -a v1.0.6-web-compliant -m "Release v1.0.6: 19-Point Web Compliance, Chip Glow UI, Shloka SSOT & Null-Safety"

# Create categorized component/infrastructure labels
git tag -a label/web-compliance-19pt -m "Label: 19-point web production security, legal, SEO, A11y & telemetry compliance"
git tag -a label/ui-chip-glow -m "Label: Subtle glow design tokens & <Chip /> primitive across all themes"
git tag -a label/shloka-synchrony -m "Label: DailyWisdomService SSOT & toolbar Look Closer visibility=false"
git tag -a label/release-ready -m "Label: 100% npm test (18 suites), lint & production build verified"

# Verify all tags and labels
git tag -l -n2
```

---

### 5. Pushing Changes & Labels to GitHub

```bash
# Push commits to main branch
git push origin main

# Push all tags and labels to remote
git push origin --tags

# Push both branch and tags in a single operation
git push origin main --follow-tags
```

---

### 6. Installing Dependencies

```bash
# Standard dependency installation
npm install

# Or clean, deterministic install from package-lock.json (CI environments)
npm ci
```

---

### 7. Building the Application

```bash
# 1. Typecheck & Lint analysis (Zero TypeScript errors)
npm run lint

# 2. Compile full-stack production bundle:
#    - Builds Vite client assets to dist/
#    - Bundles Express backend into self-contained dist/server.cjs
npm run build
```

---

### 8. Running the Application

#### Development Mode (Express 5 + Vite Dev Middleware)
```bash
# Starts the full-stack server on http://localhost:3000
# (Rate limiting is bypassed in development mode to allow rapid local testing)
npm run dev
```

#### Production Mode
```bash
# Starts the compiled production bundle from dist/server.cjs on port 3000
npm start
```

---

### 9. Testing & Quality Assurance Verification

SutraSparsh features a comprehensive automated test suite covering **18 core suites in `npm test`** plus dedicated audio, UI, and fallback suites running headlessly in Node.js via `tsx`.

```bash
# Execute master test verification suite (18 suites + CI/CD release gate)
npm test

# Run individual test suites
npm run test:system             # System Testing Matrix (TC-SYS-01 to TC-SYS-09)
npm run test:api                # Live Express 5 REST API Endpoints
npm run test:compliance         # 19-Point Web Production Launch & Compliance Audit
npm run test:chip-glow          # Selected Chip Subtle Glow Tokens & A11y Audit
npm run test:shloka-sync        # Shloka State Synchrony SSOT & /api/v1/wisdom/*
npm run test:split-safety       # Null-Safe .split() Regression Suite
npm run test:toolbar-visibility # Top Toolbar Look Closer Visibility (= false) Check
npm run test:bhashini           # Bhashini Server-Proxy & Indic-TTS Unit Tests
npm run test:soundscape         # Ambient Soundscape Selector & Tanpura Drone
npm run test:theme-observer     # Unified ThemeObserver Root Synchronization
npm run test:relocation         # Sanctuary Journey Consolidation & Hook Safety
npm run test:services           # Vedic Purohit Directory & WhatsApp Integration
npm run test:themes             # Theme Whitelist & Contrast Guards
npm run test:community          # Community Board Satsang Discussions
npm run test:goal               # 15-Minute Daily Sadhana Goal & Celebrations
npm run test:seo                # Dynamic Head Metadata & Schema.org JSON-LD
npm run test:gate               # Phase 12 Production Release Gate (5 Criteria)
npm run ci:verify               # 10-Stage Pipeline, Smoke Tests & Launch Gate
```

---

## 🔒 Security & Data Integrity

- **Strict Role-Based Access Control (RBAC)**: Fine-grained permissions isolating administrative endpoints (`/admin`) from the public sanctuary.
- **Zero Client Secrets**: Bhashini ULCA and Google Cloud TTS API credentials remain strictly server-side behind `/api/tts/synthesize` (bounded to 1,000 characters), with zero `VITE_BHASHINI_*` exposure in client bundles.
- **Timing-Safe Token Verification**: Cryptographic constant-time comparison on administrative headers to defend against side-channel timing attacks.
- **HTTP Security Headers & HTTPS Enforcement**: Express `trust proxy` HTTPS redirect in production plus automated injection of Content Security Policy (`CSP` with `frame-ancestors *` and opt-in GA4 `googletagmanager.com`), `Strict-Transport-Security` (HSTS), `Permissions-Policy`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy`.
- **Anti-Spam & Rate Limiting**: Token-bucket rate limiting on API routes alongside client/server honeypots, sliding-window throttling, and URL-spam guards on interactive forms.
- **Consent-Gated Privacy & Sanitized Inputs**: DPDP Act 2023 & GDPR opt-in cookie consent gating analytics scripts, paired with input sanitization preserving sacred Sanskrit diacritics while neutralizing XSS vectors.

---

## 📄 License & Attribution

This project is licensed under the [MIT License](LICENSE).  
Canonical Sanskrit scriptures are preserved in the public domain for universal seeker contemplation.

*Dedicated to the timeless wisdom of the Rishis and the seeker within every human heart.*
