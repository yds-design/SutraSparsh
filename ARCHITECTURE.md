# SutraSparsh (सूत्रस्पर्श) — System Architecture Specification

**Platform Version:** v1.0.6 (Web Production Compliance & Runtime Hardened)  
**Corpus Domain:** Sacred Sanskrit Scriptures & Classical Vedic Wisdom  
**Stack:** React 19, TypeScript 6.0, Tailwind CSS 4.3, Vite 8.2, Express 5.2, Firebase Firestore, Bhashini ULCA Indic-TTS, Google Cloud Neural2 TTS, Web Audio API  

---

## 1. Architectural Philosophy & Core Tenets

SutraSparsh is built on four architectural pillars:

1. **Sacred Sanctuary Purity**: The seeker's devotional experience is completely insulated from commercial distraction and administrative complexity. Client devices default to **Phase 1 Sanctuary Mode**, ensuring a pure spiritual study environment.
2. **Computational Linguistic Rigor**: Rather than static text storage, Sanskrit scriptures are decomposed dynamically using Paninian grammatical rules (*Aṣṭādhyāyī* root tracing, *Sandhi-Viccheda*, and *Samāsa-Vigraha*).
3. **Resilient Multi-Engine Audio Architecture**: The voice recitation layer utilizes India's National Bhashini ULCA Indic-TTS pipeline as the primary engine (with Devī Saraswatī and Sage Vyāsa sacred archetypes), backed by automatic seamless failover to Google Cloud Neural2 and browser Web Audio APIs, with deterministic `URL.revokeObjectURL()` memory lifecycle guarantees.
4. **Architectural Decoupling**: Complete physical and logical separation between the public Seeker Sanctuary (`sutrasparsh.com`) and the Admin Operations Console (`admin.sutrasparsh.com`), with zero administrative code bleeding into consumer viewports.

---

## 2. High-Level System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|                                                                                   |
|  +-------------------------------------+  +------------------------------------+  |
|  |     Seeker Sanctuary (SPA)          |  |    Admin Operations Console (SPA)  |  |
|  |     (src/SutraSparshTempleApp.tsx)  |  |    (src/admin/SutraSparshAdminApp) |  |
|  |                                     |  |                                    |  |
|  |  * Sacred Scripture Reader          |  |  * Executive Health Matrix         |  |
|  |  * Paninian "Look Closer" Studio    |  |  * Scripture Publisher CMS         |  |
|  |  * 432Hz Vedic Audio Engine         |  |  * Data Ingestion Manager          |  |
|  |  * Vedic Purohit Directory          |  |  * Seeker Profiles & Seva Tiers    |  |
|  |  * Sadhana Journey & 15-Min Goal    |  |  * SRE Observability & Telemetry   |  |
|  |  * Community Board Satsang          |  |  * Phase 1/Phase 2 Feature Gates   |  |
|  +------------------+------------------+  +-----------------+------------------+  |
|                     |                                       |                     |
+---------------------|---------------------------------------|---------------------+
                      |                                       |
                      v                                       v
+-----------------------------------------------------------------------------------+
|                           EXPRESS 5 BACKEND PROXY (server.ts)                     |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |  Security Middleware: CSP, HSTS, X-Frame-Options, Rate Limiting, Sanitizer  |  |
|  +-----------------------------------------------------------------------------+  |
|  |  REST API Routes:                                                           |  |
|  |  * /api/health & /api/metrics (Uptime, heap, latency percentiles)           |  |
|  |  * /api/content/* (Scriptures, categories, search, traditions)              |  |
|  |  * /api/billing/* (Tiers, orders, checkout, webhooks)                       |  |
|  |  * /api/donations/* (Seva stats, 80G tax certificate generation)            |  |
|  |  * /robots.txt & /sitemap.xml (SEO crawler cache handlers)                 |  |
|  +-----------------------------------------------------------------------------+  |
|  |  Inverted Search Engine (Sub-15ms multi-script index: Devanagari/IAST/Eng)  |  |
|  +-----------------------------------------------------------------------------+  |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                       DATA PERSISTENCE & SERVICES LAYER                           |
|                                                                                   |
|  +------------------------------------+  +-------------------------------------+  |
|  |      Google Cloud Firestore        |  |     In-Memory Fallback Repository   |  |
|  |  * Canonical Scripture Corpus      |  |  * Standalone local dev mode        |  |
|  |  * Seeker Profiles & Bookmarks     |  |  * Zero external credentials needed |  |
|  |  * Ingestion Audit Ledger          |  |  * Deterministic test execution     |  |
|  +------------------------------------+  +-------------------------------------+  |
|  |  Sacred Voice & Payment Services:                                           |  |
|  |  * Primary: Bhashini ULCA Indic-TTS (Devī Saraswatī / Sage Vyāsa, 22kHz)    |  |
|  |  * Failsafe: Google Cloud Neural2 TTS (hi-IN-Neural2-B/C SSML failover)    |  |
|  |  * Web Audio API Synthesizer (432Hz carrier tone & temple drone)            |  |
|  |  * Razorpay & Stripe Payment Adapters (Phase 2 dynamic gating)              |  |
+-----------------------------------------------------------------------------------+
```

---

## 3. Frontend Architecture (React 19 & Tailwind CSS 4)

### 3.1 Component Hierarchy & State Management
- **Root Entry Point (`src/main.tsx` & `src/App.tsx`)**:
  - Initializes the top-level **React `ErrorBoundary`** (`src/components/ErrorBoundary.tsx`), providing an authentic SutraSparsh recovery interface with instant reload and session clear buttons.
  - Initial `index.html` markup pre-declares `data-theme="light"`, pinch-to-zoom viewport (`width=device-width, initial-scale=1.0`), `1200x630` OpenGraph card (`/og-image.png`), favicons (`/favicon.svg`, `/apple-touch-icon.png`, `/site.webmanifest`), and WCAG AA `<noscript>` fallback styling.
  - Houses clean pathname routing in `App.tsx` for `/`, `/privacy-policy`, `/terms`, `/verse/:id`, and `noindex` 404 recovery (`NotFoundPage.tsx`), with `React.lazy` + `<Suspense>` code splitting for secondary routes and modals.
- **Seeker Sanctuary (`src/SutraSparshTempleApp.tsx`)**:
  - Coordinates header navigation (with `showLookCloserInToolbar={false}` keeping the top toolbar streamlined), the `DailyWisdomService` SSOT Daily Shloka Rotation card, quick access tiles, the primary content view, and the mobile bottom navigation bar (`MobileBottomNav.tsx`).
- **State Management & Design System**:
  - Modular stores, services, & hooks manage persistent client state:
    - `authService`: Seeker profile, guest identity, and authentication tokens.
    - `dailyWisdomService` (`useDailyWisdom`): Single Source of Truth synchronizing daily shloka state across Home, Explore banner, Look Closer studio, and `/api/v1/wisdom/*`.
    - `themeConfigService` & `themeObserver`: Whitelisted theme lifecycle (`light` / `golden-hour` / etc.) with instant DOM root synchronization across browser navigation events.
    - `consentService` & `analyticsService`: Explicit DPDP/GDPR opt-in cookie consent gating GA4 script injection and custom telemetry (`page_view`, `tts_synthesize`, `tts_playback_complete`, `verse_view`, `search_query`).
    - `<Chip />` & CSS glow tokens (`--chip-glow-active`, `--chip-transition: 180ms cubic-bezier(0.4, 0, 0.2, 1)`): Subtle selected luminescence across light/dark modes with `prefers-reduced-motion` and `prefers-contrast: more` accessibility overrides.
    - `useAudioStore`: Active shloka audio, 432Hz drone volume, tempo scaling, and continuous loop state.
    - `progressService`: Daily reading minutes, completed verses, bookmarks, and streak calculations.
    - `useFeatureFlags`: Phase 1 sanctuary lockdown vs Phase 2 dynamic monetization gates.

### 3.2 Unified Parchment Dawn Design Constitution
SutraSparsh enforces a 100% unified Parchment Dawn manuscript aesthetic matching the **Daily Shloka Rotation** design across all main views:
1. **Explore View**: *Timeless Sanskrit Wisdom & Philosophical Heritage* hero card transformed to pure white surface (`#ffffff`, border `#cfcbe0`), Night Indigo title (`#1b1740`), Soft Ink body (`#55526b`), and Diya Gold eyebrow (`#b8801f`).
2. **Search View**: *Intent-Driven Discovery • ज्ञान खोज* hero card with pure white surface, sunken ash search input bar (`#f7f6fb`), and Night Indigo buttons.
3. **Community Board**: *Satsang Mandali • सत्संग मण्डली* hero card with pure white surface, Diya Gold badge, and high-contrast action toolbar.
4. **Personal Sanctuary**: *Personal Sanctuary • मेरी साधना* hero card with pure white surface, gold compass badge, Night Indigo title, and unified navigation tabs.

#### High-Specificity Contrast Guards & ModalPortal Synchronization
- Detached DOM dialogs (`VerseModal`, `LookCloserModal`, `WordExplorerDrawer`) render into an isolated DOM portal (`ModalPortal.tsx`).
- An active `MutationObserver` monitors `document.documentElement` for changes to `data-theme` or theme classes and synchronously propagates them to the portal subtree.
- Base tokens guarantee WCAG 2.1 AAA contrast (>16:1 ratio) on all body copy and liturgical Sanskrit verses.

### 3.3 High-Performance Infinite Scroll Architecture (`React.memo` & `useMemo`)
- **`React.memo` Custom Comparator**: `VerseCard` is wrapped in an equality function that inspects verse identity (`prev.verse.id === next.verse.id`), verse text stability, active playback flag (`isPlaying`), bookmark presence (`isBookmarked`), and active theme token. This prevents unneeded re-rendering of non-active cards when audio status or unrelated state changes.
- **`useMemo` Derived Collections**:
  - `bookmarkedIdsSet`: Set-based lookup generated via `useMemo` for instant O(1) membership checks during card iteration.
  - `memoizedVerseCards`: Pre-calculated list of memoized React nodes in `src/App.tsx`, maintaining a rock-solid 60 FPS frame rate across infinite scrolling over thousands of sacred verses.

---

## 4. Linguistic & Audio Engine Architecture

### 4.1 Paninian Morphological Decomposition Engine (`paninianEngine.ts`)
The linguistic engine parses sacred Sanskrit verses into constituent elements without requiring static pre-computed databases for every form:
- **Verbal Root Tracing (*Dhātu-Pāṭha*)**: Maps verbs to their primary Paninian verbal roots with class markers (*Gaṇa*), semantic meanings (*Artha*), and *Aṣṭādhyāyī* sutra references.
- **Affix Isolation (*Pratyaya*)**: Classifies affixes into *Kṛt* (primary verbal derivatives), *Taddhita* (secondary nominal derivatives), *Sup* (nominal case endings), and *Tiṅ* (verbal conjugations).
- **Compound Splitting (*Samāsa-Vigraha*)**: Analyzes compound words into their underlying analytical sentences (*Vigraha-Vākya*), identifying *Tatpuruṣa*, *Karmadhāraya*, *Bahuvrīhi*, and *Dvandva* types.
- **Phonetic Junction Resolution (*Sandhi-Viccheda*)**: Identifies internal and external euphonic combinations according to classical rules (e.g., *Guṇa*, *Vṛddhi*, *Yan*, *Visarga-Sandhi*).

### 4.2 Web Audio 432Hz Synthesizer & Neural TTS Engine
- **432Hz Harmonic Carrier**: Utilizes the browser Web Audio API `AudioContext` to generate a pure 432 Hz sinusoidal oscillation modulated by gentle harmonic overtone nodes.
- **Tanpura & Om Drone Engine**: Loops high-fidelity acoustic samples of traditional Indian acoustic instruments with independent fader gain nodes.
- **Neural Text-to-Speech Proxy**: Routes requests to Google Cloud Neural TTS (`hi-IN-Neural2-B`, `hi-IN-Neural2-C`) with tailored SSML:
  - `<phoneme>` tags for Sanskrit conjunct consonants.
  - `<prosody rate="0.9" pitch="-1st">` for deliberate, reverent chanting cadence.
- **Graceful Fallback**: Automatically invokes browser `window.speechSynthesis` when network connectivity is lost or cloud quotas are exceeded.

### 4.3 Bhashini ULCA Server-Proxy Voice Intelligence Module (`bhashiniService.js`)
- **Zero-Secret Server-Proxy Architecture**: Client synthesis calls route exclusively through Express `POST /api/tts/synthesize` (strictly capped at 1,000 characters), keeping all `BHASHINI_*` and Google Cloud TTS credentials exclusively server-side (`VITE_BHASHINI_*` completely removed from client bundles). `POST /api/tts/bhashini/config` accepts only non-secret voice preferences (`defaultLanguage`, `defaultGender`, `pace`, `sampleRate`).
- **Sacred Voice Archetypes**:
  - `female` (*Devī Saraswatī*): Devotional, clear, high-cadence meditation audio with delicate consonant articulation.
  - `male` (*Sage Vyāsa*): Deep, resonant, steady Vedic rhythm suitable for liturgical chanting.
- **Pacing Calibration**: Default shloka pacing scaled to `0.80x` for reverent metric contemplation, with support for `0.70x`, `0.90x`, and `1.00x`.
- **Automatic Dual-Engine Failover**: Intercepts upstream HTTP 500/503 errors, socket timeouts, and malformed payloads, instantly transferring recitation execution to Google Cloud Neural2 with non-blocking UI notifications. Transient audio processing with zero biometric voiceprint retention is disclosed in `/privacy-policy`.

### 4.4 Resilient Audio Player Lifecycle & Memory Management (`resilientAudioPlayer.js`)
- **Source Pre-validation Guard**: Validates audio source presence, string integrity, Blob MIME typing (`audio/wav`, `audio/mpeg`), and byte counts before instantiating or attaching to `new Audio()`. Prevents browser "Failed to load because no supported source was found" runtime exceptions.
- **Binary RIFF/WAVE Reconstruction**: Explicitly parses base64 audio responses, constructs 44-byte RIFF headers when raw PCM streams are returned, and enforces `audio/wav` blob wrapping.
- **Deterministic Memory Disposal (`URL.revokeObjectURL`)**: Actively manages the Blob URL lifecycle:
  - Immediately invokes `URL.revokeObjectURL(activeUrl)` upon audio `ended` event.
  - Immediately invokes `URL.revokeObjectURL(activeUrl)` upon playback `error` event.
  - Cleans up previously allocated object URLs when switching verses or unmounting player components.
  - Zero memory accumulation verified across extensive continuous study sessions (< 5MB heap delta across 50 recitations).

---

## 5. Backend API & Inverted Search Engine (Express 5)

### 5.1 Route Architecture (`server.ts` & `src/routes/`)
- `/api/health`: Provides uptime, timestamp, and version metadata.
- `/api/metrics`: Reports Node.js memory metrics (heap total, heap used, external), active connection pools, and cache hit ratios.
- `/api/content`: CRUD operations for canonical scriptures, categorized by tradition and sadhana path.
- `/api/content/search`: Query endpoint interfacing directly with the in-memory inverted index.
- `/api/billing/tiers` & `/api/donations/stats`: Public read endpoints for membership structures and collective seva accomplishments.
- `/robots.txt` & `/sitemap.xml`: Dedicated Express endpoints serving SEO indexing metadata with 24-hour cache-control headers.

### 5.2 Sub-15ms Inverted Search Index
- **Multi-Script Indexing**: Verses are indexed across Devanagari, IAST romanization, and English translation tokens.
- **Phonetic Normalization**: Strips diacritics and unifies variant transliteration conventions (e.g., *s/sh/ṣ/ś*, *m/ṃ*, *r/ṛ*).
- **Weighted Relevance Scoring**:
  - Title & Scripture Name: 4x
  - Devanagari Exact Match: 3x
  - IAST Transliteration Match: 2.5x
  - Keyword & Philosophical Tags: 2x
  - Commentary & Exegesis Body: 1x

---

## 6. Persistence & In-Memory Fallback Layer

```
                        +--------------------------------+
                        |   ContentRepository Interface   |
                        +---------------+----------------+
                                        |
                 +----------------------+----------------------+
                 |                                             |
                 v                                             v
+---------------------------------+           +---------------------------------+
|   FirestoreContentRepository    |           |   InMemoryContentRepository     |
|   (Production Cloud Mode)       |           |   (Offline & Standalone Mode)   |
|                                 |           |                                 |
| * Firebase Admin SDK            |           | * Canonical JSON Seed Corpus    |
| * Cloud Firestore Collections   |           | * In-memory Map data structures |
| * Index-backed queries          |           | * Deterministic mock operations |
| * Real-time Snapshot listeners  |           | * Zero external dependency      |
+---------------------------------+           +---------------------------------+
```

- When `firebase-service-account.json` is detected, the application connects to Cloud Firestore.
- In the absence of credentials (such as local testing, CI runner environments, or containerized sandboxes), the system automatically falls back to `InMemoryContentRepository`, ensuring zero application downtime or initialization failures.

---

## 7. Testing & Quality Assurance Architecture

The master test suite (`npm test`) executes 18 automated validation suites plus additional auxiliary audio, pulse, enhancement, and fallback suites:

1. **System Testing Matrix (`system-testing-matrix.test.ts`)**: 54 assertions testing visual design tokens, responsive layout, fault injection, fluid typography, WCAG accessibility, state persistence, Purohit signals, PWA standards, and React hook rules.
2. **API Endpoints Test (`api-endpoints.test.ts`)**: 27 assertions verifying live Express REST routes, security headers, and JSON responses.
3. **Journey Relocation Test (`journey-relocation.test.ts`)**: 23 assertions verifying consolidation of sadhana journey views.
4. **Pandit Services Test (`pandit-services.test.ts`)**: 56 assertions validating Purohit profiles, E.164 phone numbers, and WhatsApp booking link generation.
5. **Theme Restriction Test (`theme-restriction-and-community.test.ts`)**: 66 assertions ensuring theme whitelist compliance and contrast rules.
6. **Community Board Test (`community-board.test.ts`)**: 49 assertions validating spiritual satsang posts, replies, and anumodana votes.
7. **Daily Goal Celebration Test (`daily-goal-celebration.test.ts`)**: 32 assertions testing 15-minute sadhana thresholds and confetti particle states.
8. **SEO Compliance Test (`seo-compliance.test.ts`)**: 41 assertions validating OpenGraph (`1200x630` `og-image.png`), Twitter Cards, Schema.org JSON-LD, `robots.txt`, and `sitemap.xml`.
9. **Ambient Soundscape & Drone (`soundscape-selector.test.ts`)**: 52 assertions verifying Temple Bell, Himalayan Breeze, River Ganga, and Tanpura drone defaults.
10. **Unified ThemeObserver (`theme-observer.test.ts`)**: 68 assertions verifying DOM root theme class synchronization across navigation events.
11. **Chip Selected Glow Design System (`chip-glow.test.ts`)**: 35 assertions verifying CSS tokens, WCAG 2.2 AA/AAA contrast, reduced-motion/high-contrast overrides, `<Chip />` API, and overflow padding.
12. **Split Null-Safety Regression (`split-null-safety.test.ts`)**: 6 regression checks validating null/undefined `.split()` safety across WordExplorer, SearchEngine, Tithi calendar, SharingService, and Header.
13. **Shloka State Synchrony (`shloka-state-synchrony.test.ts`)**: 3 suites verifying `DailyWisdomService` SSOT and `/api/v1/wisdom/*` parity.
14. **Top Toolbar Look Closer Visibility (`toolbar-look-closer-visibility.test.ts`)**: 4 checks verifying `showLookCloserInToolbar={false}` while preserving modal/banner entry points.
15. **19-Point Web Production Compliance (`web-compliance-19pt.test.ts`)**: 39 assertions auditing zero client secrets, HTTPS/HSTS/CSP/Permissions-Policy, spam honeypot & throttling, `/privacy-policy`, `/terms`, Cookie Consent gating, clean routing, 404 `noindex`, zoomable viewport, `aria-hidden` SVGs, `role="alert"` validation, `React.lazy`, and Workbox precache exclusions.
16. **Bhashini Server-Proxy & Indic-TTS (`bhashini-service.test.ts`)**: 27 assertions validating `/api/tts/synthesize` server-proxy mode, zero client secrets, retries, and latency cache.
17. **Phase 12 Release Gate (`phase12-release-gate.ts`)**: Enforces 5 non-negotiable exit criteria.
18. **CI/CD Verification Runner (`scripts/ci-verify.ts`)**: 10-Stage compilation, security threat scan, and 8-node production smoke test.
19. **Auxiliary Suites (`test:player`, `test:fallback`, `test:enhancements`, `test:pulse`)**: Resilient audio Blob lifecycle (`URL.revokeObjectURL`), Bhashini 500 -> Google Cloud Neural2 failover, daily affirmations/sync enhancements (68 assertions), and first-time 15m goal streak pulse (21 assertions).

---

## 8. Security Boundaries & Threat Defense

- **Zero Client Secrets**: Server-only environment variables (`BHASHINI_*`, Google Cloud keys, `ADMIN_SECRET_KEY`) never leak into Vite client bundles.
- **Timing-Safe Authentication**: Administrative headers are validated using cryptographic constant-time comparison algorithms to mitigate side-channel timing attacks.
- **Production HTTPS & Security Headers (`security-headers.middleware.ts` & `firebase.json`)**: Enforces `trust proxy` HTTPS redirects in production plus `Strict-Transport-Security`, `Permissions-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and `Content-Security-Policy` (`frame-ancestors *` for embedded preview compatibility, `script-src` permitting consent-gated `googletagmanager.com`).
- **Anti-Spam & Rate Limiting (`spamProtection.ts` & `rate-limiter.middleware.ts`)**: Token-bucket API rate limiting paired with hidden `sr-only` honeypot fields, sliding-window submission throttling, URL-spam caps, and a 1,000-character synthesis limit.
- **Strict Input Sanitization**: Strips script tags and malicious attributes while preserving Devanagari Unicode characters, Vedic accents (*Svaras*), and IAST diacritics.

---

*Certified against production codebase v1.0.6 (Release Tag: v1.0.6-web-compliant).*
