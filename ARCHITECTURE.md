# SutraSparsh (सूत्रस्पर्श) — System Architecture Specification

**Platform Version:** v1.0.0 (Production Launch Certified)  
**Corpus Domain:** Sacred Sanskrit Scriptures & Classical Vedic Wisdom  
**Stack:** React 19, TypeScript 6.0, Tailwind CSS 4.3, Vite 8.2, Express 5.2, Firebase Firestore, Web Audio API  

---

## 1. Architectural Philosophy & Core Tenets

SutraSparsh is built on four architectural pillars:

1. **Sacred Sanctuary Purity**: The seeker's devotional experience is completely insulated from commercial distraction and administrative complexity. Client devices default to **Phase 1 Sanctuary Mode**, ensuring a pure spiritual study environment.
2. **Computational Linguistic Rigor**: Rather than static text storage, Sanskrit scriptures are decomposed dynamically using Paninian grammatical rules (*Aṣṭādhyāyī* root tracing, *Sandhi-Viccheda*, and *Samāsa-Vigraha*).
3. **Resilient Dual-Mode Operation**: The application functions seamlessly both in connected enterprise environments (with Firebase Firestore and Google Cloud Neural TTS) and in air-gapped or zero-credential environments (via in-memory fallback repositories and browser Web Audio APIs).
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
|  |  External Service Connectors:                                               |  |
|  |  * Google Cloud Neural TTS (Sanskrit phonetics SSML proxy)                 |  |
|  |  * Web Audio API Synthesizer (432Hz carrier tone & temple drone)            |  |
|  |  * Razorpay & Stripe Payment Adapters (Phase 2 dynamic gating)              |  |
+-----------------------------------------------------------------------------------+
```

---

## 3. Frontend Architecture (React 19 & Tailwind CSS 4)

### 3.1 Component Hierarchy & State Management
- **Root Entry Point (`src/main.tsx` & `src/App.tsx`)**:
  - Initializes global error boundaries, React Query client, and top-level modals.
  - Houses the dynamic application router rendering either the Seeker Sanctuary or Admin Console based on active route and RBAC permissions.
- **Seeker Sanctuary (`src/SutraSparshTempleApp.tsx`)**:
  - Coordinates header navigation, the featured Morning Shloka card, quick access tiles, the primary content view, and the mobile bottom navigation bar (`MobileBottomNav.tsx`).
- **State Management**:
  - Modular Zustand stores manage persistent client state:
    - `useAuthStore`: Seeker profile, guest identity, and authentication tokens.
    - `useThemeStore`: Active theme selection, high-contrast flags, and typography preferences.
    - `useAudioStore`: Active shloka audio, 432Hz drone volume, tempo scaling, and continuous loop state.
    - `useProgressStore`: Daily reading minutes, completed verses, bookmarks, and streak calculations.
    - `useFeatureFlags`: Phase 1 sanctuary lockdown vs Phase 2 dynamic monetization gates.

### 3.2 Universal 6-Theme Palette & Contrast Engine
SutraSparsh implements 6 contemplative themes:
1. `sandstone`: Warm monastic earth with gold leaf accents and dark espresso sanctum ground.
2. `amethyst`: Meditative deep violet dusk with radiant amber highlights.
3. `parchment`: Crisp daylight readability on soft manuscript parchment (`#FFFBF5`) with sandalwood typography (`#3A2818`).
4. `festival`: Royal temple vermilion, kumkum maroon (`#4B0E17`), and ceremonial gold.
5. `golden-hour`: Butter cream, burnt honey, and ink black sanctum.
6. `prism-pulse`: Electric purple, vivid orange, and emerald on crisp light canvas.

#### High-Specificity Contrast Guards & ModalPortal Synchronization
- Detached DOM dialogs (`VerseModal`, `LookCloserModal`, `WordExplorerDrawer`) render into an isolated DOM portal (`ModalPortal.tsx`).
- An active `MutationObserver` monitors `document.documentElement` for changes to `data-theme` or theme classes and synchronously propagates them to the portal subtree.
- `src/styles/prism-pulse.css` enforces high-specificity CSS rules with `!important` fallbacks defending Devanagari headers, IAST transliterations, and morphological badges against contrast inversion.

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

The test suite is structured into 10 decoupled validation suites:

1. **System Testing Matrix (`system-testing-matrix.test.ts`)**: 54 assertions testing visual design tokens, responsive layout, fault injection, fluid typography, WCAG accessibility, state persistence, Purohit signals, PWA standards, and React hook rules.
2. **API Endpoints Test (`api-endpoints.test.ts`)**: 27 assertions verifying live Express REST routes, security headers, and JSON responses.
3. **Journey Relocation Test (`journey-relocation.test.ts`)**: 23 assertions verifying consolidation of sadhana journey views.
4. **Pandit Services Test (`pandit-services.test.ts`)**: 56 assertions validating Purohit profiles, E.164 phone numbers, and WhatsApp booking link generation.
5. **Theme Restriction Test (`theme-restriction-and-community.test.ts`)**: 66 assertions ensuring theme whitelist compliance and contrast rules.
6. **Community Board Test (`community-board.test.ts`)**: 49 assertions validating spiritual satsang posts, replies, and anumodana votes.
7. **Daily Goal Celebration Test (`daily-goal-celebration.test.ts`)**: 32 assertions testing 15-minute sadhana thresholds and confetti particle states.
8. **SEO Compliance Test (`seo-compliance.test.ts`)**: 41 assertions validating OpenGraph, Twitter Cards, Schema.org JSON-LD, robots.txt, and sitemap.xml.
9. **Phase 12 Release Gate (`phase12-release-gate.ts`)**: Enforces 5 non-negotiable exit criteria.
10. **CI/CD Verification Runner (`scripts/ci-verify.ts`)**: 10-Stage compilation, security threat scan, and 8-node production smoke test.

---

## 8. Security Boundaries & Threat Defense

- **Timing-Safe Authentication**: Administrative headers are validated using cryptographic constant-time comparison algorithms to mitigate side-channel timing attacks.
- **Content Security Policy (CSP)**: Disallows unauthorized third-party scripts and framing (`X-Frame-Options: DENY`).
- **Strict Input Sanitization**: Strips script tags and malicious attributes while preserving Devanagari Unicode characters, Vedic accents (*Svaras*), and IAST diacritics.
- **In-Memory Rate Limiting**: Token-bucket algorithm protects public endpoints from distributed denial-of-service attempts.

---

*Certified against production codebase v1.0.0.*
