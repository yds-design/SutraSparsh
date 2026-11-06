# SutraSparsh (सूत्रस्पर्श) — Feature Catalog

**Platform Version:** v1.8.0 (Bhashini Indic-TTS Voice Intelligence, Dual-Engine Failover, Parchment Dawn WCAG AAA Design Constitution & Infinite Scroll Optimization)  
**Corpus Domain:** Sacred Sanskrit Scriptures & Classical Vedic Wisdom  
**Architecture:** React 19, TypeScript 6, Vite, Tailwind CSS 4, Express 5, Firebase Firestore, Bhashini ULCA Indic-TTS, Google Cloud Neural2 TTS, Web Audio API  
**Operational Governance:** Phase 1 Sanctuary Mode (Free seeker sanctuary on client devices) with dynamic Phase 2 Monetization & Seva controls in Admin Console.

---

## Table of Contents
1. [Overview & Platform Architecture](#1-overview--platform-architecture)
2. [Major Features](#2-major-features)
   - [2.1 Sacred Canonical Scripture Reader & Multi-Tradition Library](#21-sacred-canonical-scripture-reader--multi-tradition-library)
   - [2.2 Dynamic Pāṇinian Morphological Engine & "Look Closer" Studio](#22-dynamic-pāṇinian-morphological-engine--look-closer-studio)
   - [2.3 Sacred Vedic Audio Engine & Chants Player](#23-sacred-vedic-audio-engine--chants-player)
   - [2.4 Instant Sanskrit Search & Transliteration Discovery Engine](#24-instant-sanskrit-search--transliteration-discovery-engine)
   - [2.5 Seeker Identity, Sādhana Tracking & Personalization](#25-seeker-identity-sādhana-tracking--personalization)
   - [2.6 Enterprise Content Ingestion & Normalization Pipeline](#26-enterprise-content-ingestion--normalization-pipeline)
   - [2.7 Dedicated Administration & SRE Operations Console](#27-dedicated-administration--sre-operations-console)
   - [2.8 Ethical Monetization, Sādhaka Access & 80G Seva Portal](#28-ethical-monetization-sādhaka-access--80g-seva-portal)
   - [2.9 Official Brand Identity & Native PWA Asset Pipeline](#29-official-brand-identity--native-pwa-asset-pipeline)
   - [2.10 Complete SEO Compliance & Search Engine Discovery Architecture](#210-complete-seo-compliance--search-engine-discovery-architecture)
   - [2.11 Universal App-Wide Theme System & High-Contrast Readability Engine](#211-universal-app-wide-theme-system--high-contrast-readability-engine)
   - [2.12 Vedic Purohit Services & Click-to-WhatsApp Booking Architecture](#212-vedic-purohit-services--click-to-whatsapp-booking-architecture)
   - [2.13 Consolidated Seeker Journey, Community Board & 15-Min Milestone Engine](#213-consolidated-seeker-journey-community-board--15-min-milestone-engine)
   - [2.14 Bhashini ULCA Indic-TTS & Voice Intelligence Module](#214-bhashini-ulca-indic-tts--voice-intelligence-module)
   - [2.15 Parchment Dawn WCAG 2.1 AAA Design Constitution & Infinite Scroll Optimization](#215-parchment-dawn-wcag-21-aaa-design-constitution--infinite-scroll-optimization)
3. [Minor Features & Supporting Capabilities](#3-minor-features--supporting-capabilities)
   - [3.1 Sacred UI & Visual Ambience](#31-sacred-ui--visual-ambience)
   - [3.2 Audio & Acoustic Nuances](#32-audio--acoustic-nuances)
   - [3.3 Linguistic & Exegetical Utilities](#33-linguistic--exegetical-utilities)
   - [3.4 Security & Data Hardening](#34-security--data-hardening)
   - [3.5 Operational & Administrative Utilities](#35-operational--administrative-utilities)
4. [Master Milestone Mapping (M0 – M54)](#4-master-milestone-mapping-m0--m54)

---

## 1. Overview & Platform Architecture

SutraSparsh is a digital sanctuary engineered for the study, contemplation, and sadhana of sacred Sanskrit literature. It unites authentic canonical texts (Bhagavad Gita, Patanjali Yoga Sutras, Upanishads, Vedic Chants) with modern linguistic computational tools, high-fidelity neural audio synthesis, and structured spiritual habit tracking.

The application follows an architectural separation between:
- **Seeker Sanctuary (`sutrasparsh.com`)**: Distraction-free, responsive sanctuary interface for daily contemplation, shloka recitation, deep word dissection, and sadhana tracking.
- **Operations Console (`admin.sutrasparsh.com`)**: Comprehensive administrative suite with role-based access control (RBAC), ingestion management, SRE observability, and feature governance.

---

## 2. Major Features

### 2.1 Sacred Canonical Scripture Reader & Multi-Tradition Library
*Milestones: M10.1, M11.1, M11.2, M21.5*

- **Multi-Tradition Corpus**: Categorized navigation across 4 foundational streams of Indian philosophy:
  - *Bhagavad Gita* (Prasthanatrayi, 18 Chapters)
  - *Patanjali Yoga Sutras* (Samadhi, Sadhana, Vibhuti, Kaivalya Padas)
  - *Upanishads* (Isha, Kena, Katha, Mandukya, Chandogya, etc.)
  - *Vedic Chants* (Rigveda, Suktas, Shanti Mantras)
- **Four Paths of Sadhana Taxonomy**: Categorization by spiritual orientation:
  - *Karma Yoga* (Path of Action & Duty)
  - *Raja Yoga* (Path of Meditation & Mind Control)
  - *Jnana Yoga* (Path of Discernment & Self-Inquiry)
  - *Bhakti Yoga & Chants* (Path of Devotion & Sound Resonance)
- **High-Fidelity Typographic Reader**:
  - Crisp, large-scale Devanagari rendering using bespoke Google Fonts (`Noto Serif Devanagari`, `Tiro Devanagari Sanskrit`, `Cinzel`).
  - Standard International Alphabet of Sanskrit Transliteration (IAST) diacritics with phonetically aligned accents.
  - Fluent modern English translations preserving philosophical nuance without colloquial distortion.
- **Comparative Lineage Commentaries**: Multi-commentary drawer comparing classical traditions (Advaita Vedanta / Adi Shankara, Vishishtadvaita / Ramanuja, Dvaita / Madhvacharya, and contemporary modern commentary).
- **Difficulty Grading & Context Badges**: Canonical classification into Beginner (*Prārambhik*), Intermediate (*Madhyama*), and Advanced (*Praudha*) tiers.

---

### 2.2 Dynamic Pāṇinian Morphological Engine & "Look Closer" Studio
*Milestones: M11.2, M21.5, Release v1.6.0*

- **Dynamic Grammatical Decomposition**: Replaced static placeholders with a real-time Paninian etymology engine (`src/features/wordExplorer/services/paninianEngine.ts`).
- **Aṣṭādhyāyī Sūtra Root Tracing**: Identifies primary Sanskrit verbal roots (*Dhātu*) with class markers (*Gaṇa*), semantic glosses (*Artha*), and classical grammatical rule citations.
- **Morphological Suffix & Prefix Isolation**: Analyzes verbal and nominal affixes (*Pratyaya*: Kṛt, Taddhita, Sup, Tiṅ), case (*Vibhakti*), number (*Vacana*), tense/mood (*Lakāra*), and voice (*Prayoga*).
- **Compound Word Dissection (*Samāsa-Vigraha*)**: Breaks compound Sanskrit words into components, classifying compounds as Tatpuruṣa, Karmadhāraya, Bahuvrīhi, or Dvandva.
- **Phonetic Junction Resolution (*Sandhi-Viccheda*)**: Explains internal and external euphonic sound combinations according to Paninian rules.
- **Multi-Verse "Look Closer" Modal**: Interactive modal decomposing the selected verse into 5 contemplative stages:
  1. *Verse Architecture & Metre* (Chhandas, syllables, rhythm)
  2. *Etymological Anatomy* (Word-by-word Paninian roots)
  3. *Philosophical Essence* (Core spiritual takeaway)
  4. *Lineage Perspectives* (Comparative commentary insights)
  5. *Contemplative Application* (Practical daily sadhana integration)
- **Interactive Word Explorer**: Click any individual word within a verse to open an instantaneous etymological breakdown panel with related occurrences across the corpus.

---

### 2.3 Sacred Vedic Audio Engine & Chants Player
*Milestones: M11.3, M18.3, M21.5*

- **Sanskrit Neural Text-to-Speech (TTS)**: Integration with Google Cloud Neural TTS models configured specifically for Sanskrit and Hindi (`hi-IN-Neural2-B`, `hi-IN-Neural2-C`, `hi-IN-Wavenet-A`) with SSML phonetic tuning.
- **Browser SpeechSynthesis Fallback**: Graceful offline fallback providing speech synthesis when cloud services are unavailable.
- **432Hz Ambient Resonance Engine**: Integrated Web Audio API synthesizer tuned to the sacred 432 Hz frequency for deep meditative listening.
- **Temple Acoustic Drone**: Continuous Tanpura and sacred *Om* acoustic loops creating an immersive temple atmosphere.
- **Responsive Shloka Action Bar**: 3-column action controls on mobile and desktop:
  - *Read / Study*: Instant access to detailed verse exposition.
  - *Look Closer*: Opens the 5-stage Paninian word and contemplative breakdown.
  - *Listen*: One-tap audio playback with play/pause, volume control, and progress scrubber.
- **Synchronized Recitation Highlighting**: Active verse highlighting during audio playback for guided chanting practice.

---

### 2.4 Instant Sanskrit Search & Transliteration Discovery Engine
*Milestones: M12.1 – M12.6, M18.4*

- **Multi-Script Inverted Index**: Sub-15ms search across Devanagari script, IAST transliteration, and English semantic translations.
- **Phonetic Matching Engine**: Handles common phonetic spelling variations (e.g., *karma* vs *karman*, *dhyana* vs *dhyāna*, *moksha* vs *mokṣa*).
- **Facet Filtering**: Instant narrowing by tradition, chapter, sadhana path, tags, and difficulty tier.
- **Weighted Relevance Scoring**: Title (4x), Devanagari match (3x), IAST match (2.5x), Keyword tags (2x), and Commentary body (1x).
- **Search Snippet Highlighting**: Contextual snippet view highlighting matching terms in both Devanagari and English.
- **Recent Queries & Popular Inquiries**: One-tap access to frequent search concepts (*dharma*, *abhyasa*, *vairagya*, *sthitaprajna*).

---

### 2.5 Seeker Identity, Sādhana Tracking & Personalization
*Milestones: M13.1 – M14.6*

- **Seeker Profiles & Guest Mode**: Frictionless guest access with optional persistent account creation and custom spiritual seeker avatars.
- **Dynamic Streak Fire Counter**: Real-time sadhana practice streak tracking with visual fire animations, milestone achievements, and spiritual progression tiers:
  - *Prārambhik* (Day 1–6: The Awakening)
  - *Daily Abhyāsi* (Day 7–29: The Flame of Consistency)
  - *Sādhana Seeker* (Day 30–89: Deepening Resonance)
  - *Siddha Sādhaka* (Day 90+: Unshakable Sanctuary)
- **Sacred Wisdom Journal**: Personal reflective notebook linked to specific verses, allowing seekers to capture meditations, realizations, and spiritual notes with export capabilities.
- **Scripture Bookmarks & Reading Progress**: One-tap bookmarking, automated chapter completion calculation, and cross-session reading position recall.
- **Brahma Muhurta Dawn Calculator**: Astrological dawn calculation based on local time and coordinates, with configurable notifications for optimal pre-dawn meditation.
- **Vedic Panchang Calendar (Tithis & Parv)**: Moon phase tracking, Ekadashi alerts, Purnima, Amavasya, and major sacred spiritual festivals.

---

### 2.6 Enterprise Content Ingestion & Normalization Pipeline
*Milestones: M1.1 – M8.8, M15.3 – M15.5*

- **Multi-Format Source Collectors**: Streaming and batch collectors for structured JSON, markdown, and raw manuscript data.
- **Canonical Schema Normalization**: Standardizes disparate source data into unified `ContentDocument` models with strict UTF-8 validation.
- **Cryptographic Document Hashing**: Sha-256 fingerprinting for idempotency, ensuring zero duplicate records upon re-ingestion.
- **Automated Retry & Exponential Backoff**: Resilient retry engine with random jitter protecting against database throttle.
- **Point-in-Time Resumption**: Interrupted ingestion jobs resume from the exact last successful verse offset without re-processing completed records.
- **Ingestion Audit Ledger**: Comprehensive logging of total verses processed, skipped, failed, latency metrics, and error stack traces.

---

### 2.7 Dedicated Administration & SRE Operations Console
*Milestones: M15.1 – M16.6, M38.1 – M46.2*

- **Physical & Architectural Separation**: Complete structural decoupling between seeker sanctuary views and administrative operations (`src/admin/SutraSparshAdminApp.tsx`).
- **Role-Based Access Control (RBAC)**: Fine-grained roles:
  - `SUPER_ADMIN`: Complete platform governance, key rotation, database rules.
  - `CONTENT_EDITOR`: Scripture publishing, verse translation curation, commentary management.
  - `INGESTION_OPERATOR`: Ingestion pipeline execution, recovery, and audit inspection.
  - `FINANCE_ADMIN`: Seva donations, 80G tax certificate audit, subscription reports.
  - `SRE_SUPPORT`: Telemetry monitoring, latency tracking, error diagnostics.
- **Scripture Publisher Studio**: Visual administrative editor for authoring, editing, tagging, and publishing new verses and commentaries.
- **SRE Health Matrix & Telemetry**: Live metrics covering heap usage, Firestore read/write operations, cache hit ratios, and API response percentiles (P50, P95, P99).
- **Dynamic Feature Gateway Controls**: Real-time admin toggles for enabling/disabling consumer features without redeployment.

---

### 2.8 Ethical Monetization, Sādhaka Access & 80G Seva Portal
*Milestones: M25.1 – M37.2, M47.1 – M48.5*

- **Ethical Membership Architecture (Sādhaka Access)**:
  - Free Seeker Tier (Unrestricted core sanctuary, daily shloka, audio chanting, search).
  - Sādhaka Patron Tier (Extended offline packs, comparative commentary archives, advanced Paninian tools).
  - Rishi Patron Tier (Sponsorship of manuscript digitizations, ashram seva).
- **Ashram Scholarship & Hardship Waiver**: Built-in fee waiver mechanism granting free premium access to students, monastics, and seekers in financial need.
- **Sacred Gurudakshina & Seva Portal**:
  - Voluntary contribution portal supporting traditional sacred Vedic amounts (₹501, ₹1001, ₹2100, ₹5100) or custom donations.
  - Dedicated allocation targets: *Ancient Manuscript Digitization*, *Sanskrit Scholar Stipends*, and *Free App Access for All*.
- **Automated 80G Tax Exemption Engine**:
  - Validates Indian Income Tax PAN card format with algorithmic checksums.
  - Generates verifiable 80G donation receipts with unique cryptographic hash identifiers.
  - Generates downloadable, printable 80G certificates.
- **Multi-Gateway Payment Abstraction**: Unified billing service supporting Razorpay and Stripe with webhook signature verification and idempotent order settlement.
- **Phase 1 Sanctuary Lockdown**: Strict client-side gating ensuring that all monetization and donation portals remain completely dormant and hidden by default in Phase 1, activated only upon deliberate administrative unlock.

---

### 2.9 Official Brand Identity & Native PWA Asset Pipeline
*Milestones: M0.1, M20.1, Release v1.7.0*

- **Official Brand Mark**: Geometric saffron sunrise crest (`#FF6E14`) representing the dawn of wisdom, paired with stacked architectural typography (`#1F242D`) on clean neutral canvas (`#ECECEC`).
- **Vectorized SVG Assets**: Scale-invariant geometric SVG definitions (`public/logo.svg`, `public/assets/logo.svg`) guaranteeing pixel-perfect rendering across any resolution.
- **Automated Resvg Asset Generator**: Command-line generator (`scripts/generate-brand-icons.ts`) using `@resvg/resvg-js` to produce:
  - `public/icon-1024.png` (1024×1024 App Store submission master)
  - `public/icon.png` (512×512 web application & PWA icon)
  - `public/favicon.png` and `public/favicon.ico` (High-contrast emblem for browser tabs)
  - `assets/icon.png`, `assets/splash-icon.png` (Expo mobile app icons)
  - `assets/android-icon-*` (Foreground, background, and monochrome adaptive icon layers)
- **Progressive Web App (PWA) Offline Engine**: Web App Manifest (`public/manifest.webmanifest`), home-screen installability, offline asset caching, and standalone full-screen presentation.

---

### 2.10 Complete SEO Compliance & Search Engine Discovery Architecture
*Milestones: M20.2, Release v1.7.0*

- **Dynamic Head Metadata Injection (`DynamicMetadata.tsx`)**:
  - Context-aware updates of document title (`<title>`), meta description, keywords, canonical URLs, and crawler directives for every scripture, verse, chapter, and tool screen.
  - Automatically handles route state changes in SPA architecture without requiring server restarts.
- **Search Engine Crawler Directives (`public/robots.txt`)**:
  - Directs major web crawlers (Googlebot, Bingbot, Slurp, DuckDuckBot, Baiduspider, Yandex).
  - Explicitly grants index access to public scripture library, search, and glossary while protecting administrative consoles (`/admin`, `/api/admin`, `/ops`) and backend telemetry endpoints.
  - Points directly to the XML sitemap index.
- **Hierarchical XML Sitemap (`public/sitemap.xml`)**:
  - Comprehensive index of all canonical scripture endpoints (Bhagavad Gita, Patanjali Yoga Sutras, Principal Upanishads, Vedic Chants), philosophical glossary, sadhana tracking, and legal compliance pages.
  - Formatted with ISO-8601 timestamps, change frequencies (`daily` for home/verse-of-the-day, `weekly` for corpus chapters), and priority weightings (1.0 for Sanctuary, 0.9 for Scriptures, 0.8 for search and glossary).
- **Full Open Graph Protocol & Social Rich Previews**:
  - High-fidelity tags (`og:title`, `og:description`, `og:image`, `og:image:secure_url`, `og:type`, `og:url`, `og:site_name`, `og:locale`).
  - High-resolution preview image (`public/icon-1024.png`) guaranteeing rich unfurls on WhatsApp, iMessage, Twitter/X, Facebook, LinkedIn, Telegram, and Discord.
  - Multilingual locale alternates (`en_US`, `sa_IN`, `hi_IN`).
- **Twitter / X Card Integration**:
  - Formatted with `summary_large_image` presentation, `@SutraSparsh` authorship attribution, and descriptive alt text for accessibility.
- **Comprehensive Schema.org JSON-LD Structured Data**:
  - Embedded `@graph` structured entities:
    - `WebSite`: SearchAction with query template targeting in-app Sanskrit search engine.
    - `Organization`: SutraSparsh publisher details, official logo URI, and spiritual wisdom mission statement.
    - `SoftwareApplication`: Categorized as EducationalApplication with free offer and master feature list.
    - `BreadcrumbList`: Hierarchical navigational hierarchy (Sanctuary Home → Scriptures Library → Sanskrit Search).
    - `Article` & `Book`: Rich metadata attached to individual verses and canonical scriptures with Devanagari text excerpts and philosophical subjects.
- **Crawlable Semantic Noscript Fallback**:
  - Accessible `<noscript>` block inside `index.html` presenting crawlable semantic hyperlinks to core canonical scriptures and legal notices for JavaScript-restricted web indexers.
- **Dedicated Express Cache-Controlled SEO Endpoints**:
  - `server.ts` provides explicit GET routes for `/robots.txt` and `/sitemap.xml` with appropriate MIME types (`text/plain` and `application/xml`) and caching headers (`Cache-Control: public, max-age=86400`).

---

### 2.11 Universal App-Wide Theme System & High-Contrast Readability Engine
*Milestones: v1.7.1, v1.7.2*

- **Six Contemplative Sacred Themes**:
  1. *Sandstone Temple (Default)*: Classical warm temple ochre, rich amber accents (`#E8921A`), gold leaf highlights, and deep espresso sanctum ground.
  2. *Amethyst Twilight*: Meditative deep violet dusk (`#0F0A1A`), celestial purple aura (`#4A2264`), radiant amber, and moonlit cream typography.
  3. *Parchment Dawn (Light Mode)*: Clean daylight readability on soft manuscript parchment (`#FFFBF5`), deep sandalwood text (`#3A2818`), and warm golden accents.
  4. *Festival Gold & Maroon*: Royal temple vermilion, kumkum maroon (`#4B0E17`), blazing deep saffron glow, and ceremonial gold ornamentation.
  5. *Golden Hour Atmosphere*: Butter cream (`#F6DFA6`), soft vanilla (`#FFF4D8`), burnt honey (`#C9822B`), ink black sanctum (`#171717`), and warm gray accents.
  6. *Prism Pulse (Vivid Neo-Dash)*: Electric Purple (`#936BFA`), Vivid Orange (`#FF9D2C`), Dash Pink (`#FA6BA7`), Cyan Blue (`#2CA6FF`), and Emerald (`#2BBF7D`) with Paytone One display styling and crisp light canvas foundation.
- **Dynamic ModalPortal Theme Synchronization**:
  - `ModalPortal.tsx` embeds an active `MutationObserver` on `document.documentElement`, propagating `data-theme` and theme CSS classes directly into detached DOM portal sub-trees (`#verse-detail-modal`, `#look-closer-experience`, `#word-explorer-drawer`).
  - Guarantees zero theme leakage or contrast inversion when modals, drawers, or dialogs are opened.
- **High-Specificity CSS Contrast Guards (`src/styles/prism-pulse.css`)**:
  - Hardened contrast rules with `!important` fallbacks specifically defending Sanskrit Devanagari headers, IAST transliterations, English meanings, Hindi translations, and morphological badges.
  - Multi-layer dark container protections ensuring text remains bright, sharp, and readable across all nested sub-panels.
- **Unified Light Canvas Pattern (`isLightCanvas`)**:
  - Replaced fragmented, brittle `is[Theme]` boolean checks across `VerseCard.tsx`, `MyJourneyView.tsx`, `MoreView.tsx`, and `SutraSparshTempleApp.tsx` with a single unified `isLightCanvas = isLight || isPrismPulse` model.
  - Ensures clean dark text (`#1C1917`, `#292524`) on light backdrops and luminous text (`#FFFBEB`, `#F5F5F4`) on dark sanctuary backdrops.

---

### 2.12 Vedic Purohit Services & Click-to-WhatsApp Booking Architecture
*Milestones: Phase 24, M49.1 – M49.6*

- **Authentic Purohit Verification**: Direct seeker access to authentic Vedic Purohits (`src/data/purohits.ts`) with documented Veda Shakha lineage (Rigveda Shakala, Shukla Yajurveda Madhyandina, Krishna Yajurveda Taittiriya, Samaveda Kauthuma), educational credentials (*Vedalankar*, *Acharya*), and 10–25+ years of ritual experience.
- **Comprehensive Vedic Ritual Catalog**:
  - *Griha Pravesh Mahapuja* (Vastu Shanti, Navagraha Homa, Lakshmi Pravesh)
  - *Maha Rudrabhishek* (Ekadasha Rudra Patha, Panchamrit Abhishek)
  - *Satyanarayan Vrat Katha* (Panch Adhyaya Parayana, Prasadam Puja)
  - *Navagraha & Shanti Homas* (Graha dosha pacification, Nakshatra Shanti)
  - *Vivah Samskara* (Saptapadi, Kanyadaan, Laja Homa)
  - *Shradh & Pitru Tarpan* (Tila Tarpan, Pinda Daan, Brahmin Bhojan)
- **Transparent Dakshina Guidelines**: Clear separation of Purohit Dakshina and Samagri requirements, eliminating opaque pricing and hidden commissions.
- **Deep-Link WhatsApp Booking Protocol**: One-tap booking generating pre-formatted WhatsApp consultation messages adhering to international E.164 phone formats (`https://wa.me/{phone}?text=...`) encoding seeker name, ritual type, preferred date, and location.
- **Multi-Lingual Ritual Guidance**: Search and filter purohits by languages spoken (Sanskrit, Hindi, Tamil, Telugu, Kannada, Marathi) and geographic service zones.

---

### 2.13 Consolidated Seeker Journey, Community Board & 15-Min Milestone Engine
*Milestones: Phase 25, M50.1 – M50.6*

- **Sanctuary Journey Consolidation**: Relocated and consolidated seeker spiritual tracking directly inside `MyJourneyView.tsx` within the primary sanctuary shell, eliminating isolated legacy views and architectural fragmentation.
- **React Hook Lifecycle Hardening**: Audited and refactored all custom hooks (`useAuth`, `useProgress`, `useTheme`, `useAudio`) to enforce top-level execution without conditional returns, resolving previous "Rendered fewer hooks than expected" exceptions.
- **15-Minute Daily Sadhana Milestone Engine**:
  - Dynamic progress ring tracking cumulative scripture recitation and reading time.
  - Reaching the 15-minute mark triggers a celebratory modal with the sacred Sanskrit benediction *अभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते* (Gita 6.35).
  - Physics-driven celebratory confetti canvas burst that gracefully unmounts after completion.
- **Community Board Satsang (`CommunityBoardView.tsx`)**:
  - Spiritual discussion forum categorized by the four sadhana paths (*Karma*, *Raja*, *Jnana*, *Bhakti*).
  - Seekers can post contemplation questions, cite specific shlokas, reply in threaded dialogues, and offer *Anumodana* (spiritual affirmations).
- **Theme Whitelist Restrictions**: Strict theme confinement ensuring all interactive components remain visually grounded within the 6 canonical themes, protecting against arbitrary class mutations.

---

### 2.14 Bhashini ULCA Indic-TTS & Voice Intelligence Module
*Milestones: Phase 26, M51.1 – M52.5, Release v1.8.0*

- **Bhashini ULCA Pipeline Integration**: Dedicated service integration (`src/services/bhashiniService.js`) interfacing with India's National Language Translation Mission (NLTM / MeitY Bhashini ULCA ecosystem).
- **Dual Sacred Voice Archetypes**:
  - *Devī Saraswatī (Female)*: Calibrated for meditative, crystalline devotional clarity with delicate articulation of subtle *visarga* and *anusvāra*.
  - *Sage Vyāsa (Male)*: Calibrated for deep, resonant, contemplative liturgical recitation with steady Vedic rhythm and solemn gravitas.
- **Shloka Cadence Calibration & Pace Controls**:
  - Configurable pacing options: `0.70x`, `0.80x` (Recommended default *Shloka* cadence), `0.90x`, and `1.00x`.
  - Pacing dynamically adjusts punctuation pause weightings and vocal prosody without pitch distortion.
- **Resilient Audio Lifecycle & Memory Disposal (`resilientAudioPlayer.js`)**:
  - **Pre-validation Guard**: Rigorous pre-flight inspection of audio sources before attaching to `new Audio()`, eliminating browser "Failed to load because no supported source was found" errors.
  - **Binary & WAV Packaging**: Strict verification of audio data byte lengths, RIFF/WAVE header validation, and explicit `audio/wav` MIME type assignment.
  - **Deterministic Blob Disposal**: Immediate `URL.revokeObjectURL()` invocations bound to `ended` and `error` events, completely preventing client memory leaks during long study and recitation sessions.
- **Automatic Dual-Engine Failover Architecture**:
  - Transparent fallback from Bhashini ULCA to Google Cloud Neural2 (`hi-IN-Neural2-B` / `hi-IN-Neural2-C`) upon any network timeout, non-200 HTTP status, or malformed audio data payload.
  - Informative, non-intrusive UI toast notification notifying the seeker when automatic failsafe transition occurs.
  - Interactive Engine Verification & Failsafe Tester drawer in Seeker Settings for real-time diagnostic synthesis.

---

### 2.15 Parchment Dawn WCAG 2.1 AAA Design Constitution & Infinite Scroll Optimization
*Milestones: Phase 27, M53.1 – M54.6, Release v1.8.0*

- **Parchment Dawn (`theme === "light"`) Design Constitution**:
  - **Luminous Manuscript Canvas**: Soft daylight ivory background (`#FFFBF5` / `#FBF8EE`) evocative of ancient birch bark and sacred palm-leaf manuscripts.
  - **Sandalwood Typographic Hierarchy**: Deep, warm espresso and sandalwood text tokens (`#261B12` primary, `#5C4838` / `#6E5C4E` secondary) providing superior WCAG 2.1 AAA contrast ratios (> 11:1).
  - **Sacred Ochre & Terracotta Accents**: Radiant devotional ochre (`#C65507` / `#D96500`) and warm gilded borders (`#E8DCC2`) replacing harsh amber or washed-out yellow tones.
  - **Universal Component Consistency**: Exhaustive token alignment across Header, Bottom Navigation, Search Tray, Journey View, Community Board, More View, Audio Action Bars, and Modal Drawers.
- **High-Performance Infinite Scroll Optimization**:
  - **`React.memo` Custom Equality Comparator**: Wrapped `VerseCard` in an equality comparator evaluating verse identifier, text content, active playback state, bookmark state, and current theme token to prevent redundant re-renders.
  - **`useMemo` Derived Collections**: Pre-computed `bookmarkedIdsSet` and memoized verse card elements in `src/App.tsx`, maintaining a rock-solid 60 FPS frame rate during high-velocity infinite scrolling across thousands of verses.

---

## 3. Minor Features & Supporting Capabilities

### 3.1 Sacred UI & Visual Ambience
- **Six Classical Sanctuary Themes**: Fully configurable in Seeker Settings with real-time reactive cross-fade transitions across all consumer viewports.
- **Atmospheric Golden Hour Lighting**: Time-of-day contextual backdrop gradients shifting between dawn (*Brahma Muhurta*), midday, sunset (*Sandhya*), and night.
- **Morning Contemplative Promo Modal**: Elegant daily pop-up presenting the featured morning shloka with contemplative artwork and quick-read navigation.
- **Sacred Verse Share Card Generator**: One-tap creation of high-resolution graphic cards formatted for WhatsApp, Instagram, and Twitter, featuring Devanagari text, English meaning, and SutraSparsh attribution.
- **Responsive Mobile Navigation**: Haptic-optimized bottom tab bar (`MobileBottomNav.tsx`) ensuring one-thumb reachability across *Today*, *Search*, *Explore*, *Journey*, and *More*.
- **Portal-Rendered Modals with Theme Observer**: All modals (`VerseModal`, `LookCloserModal`, `WordExplorer`, `AuthModal`, `PricingModal`) render into isolated DOM portals with theme mutation listeners to eliminate z-index clipping and styling desynchronization.
- **Adaptive Theme Selector Cards**: Interactive theme palette preview cards in Settings featuring active badges, color swatch dots, Devanagari labels, and dynamic contrast adapting cleanly to light and dark canvases.

---

### 3.2 Audio & Acoustic Nuances
- **Acoustic Drone Volume Fader**: Independent slider for adjusting Tanpura and temple chime background levels relative to Sanskrit recitation.
- **Continuous Recitation Loop Mode**: Toggle for looping sacred verses during japa or meditation sessions.
- **Phonetic Pronunciation Guides**: Clickable audio snippets for unfamiliar Sanskrit compound words.
- **TTS Diagnostics & Sanitize Layer**: Automated sanitization of internal API credentials and detailed diagnostic reporting during speech generation failures.
- **Voice Provider Health Benchmarking**: Internal benchmarking tool (`backend/importer/src/audio/benchmark/`) testing provider latency and synthesis clarity.

---

### 3.3 Linguistic & Exegetical Utilities
- **Sanskrit Sandhi Splitting Visualization**: Visual connective brackets illustrating vowel and consonant euphonic combinations.
- **Metre & Scansion Analysis (*Chhandas*)**: Identification of classical poetic metres (Anuṣṭubh, Triṣṭubh, Gāyatrī, Jagatī) with syllable count breakdown.
- **Contextual Verse Cross-References**: Direct links between related verses across distinct traditions (e.g., Gita 2.47 linked to Isha Upanishad verse 1.2).
- **Devanagari Copy to Clipboard**: Clean clipboard export of pure Sanskrit text without formatting artifacts.
- **Wisdom Notes JSON & Text Export**: Allows seekers to backup their personal spiritual journal entries to local storage or downloadable text files.

---

### 3.4 Security & Data Hardening
- **Constant-Time Token Validation**: Cryptographic comparison of admin authentication headers to prevent timing side-channel attacks.
- **Granular Firestore Security Rules**: Strict role-based write authorization preventing unauthorized modifications to sacred canonical documents.
- **HTTP Security Headers**: Automated injection of Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), X-Content-Type-Options (`nosniff`), and X-Frame-Options (`DENY`).
- **In-Memory Rate Limiting**: Token-bucket rate limiter safeguarding both public content APIs and sensitive administrative endpoints.
- **Automated CI/CD 10-Stage Pipeline**: Verification script (`scripts/ci-verify.ts`) executing 10 validation gates including strict TypeScript checking, security vulnerability audits, and latency SLAs.
- **Disaster Recovery Procedures**: Documented runbooks for zero-loss database restore and rollback target checkpoints.

---

### 3.5 Operational & Administrative Utilities
- **Reactive Feature Flags Service**: Centralized client service (`src/services/feature-flags.service.ts`) reacting dynamically to feature state toggles across browser tabs.
- **One-Click Phase 1 / Phase 2 Switcher**: Fast emergency rollback and activation controls in Admin Settings for instant governance transitions.
- **System Health Endpoints**: Public `/api/health` and privileged `/api/health/detailed` endpoints providing uptime, memory usage, and database connectivity metrics.
- **Inverted Search Memory Profiler**: In-memory search index monitoring ensuring memory overhead remains under 50MB for up to 10,000 verses.
- **Store Assets Viewer**: In-app inspector (`StoreAssetsViewer.tsx`) showcasing official 1024×1024 App Store submission icons, device mockup screenshots, and app store copy.

---

## 4. Master Milestone Mapping (M0 – M48)

| Milestone | Category | Classification | Description | Status |
| :--- | :--- | :--- | :--- | :---: |
| **M0** | Foundation | **Major** | Modern React 19, TypeScript 6, Vite, Express 5, Firebase baseline | **COMPLETE ✅** |
| **M1** | Ingestion | **Major** | Scripture source collection framework and JSON file loader | **COMPLETE ✅** |
| **M2** | Ingestion | **Major** | Canonical content normalization to unified `ContentDocument` models | **COMPLETE ✅** |
| **M3** | Ingestion | **Minor** | Field validation, Devanagari UTF-8 verification, error reporting | **COMPLETE ✅** |
| **M4** | Persistence | **Major** | Firestore persistence, collection partitioning, document CRUD | **COMPLETE ✅** |
| **M5** | Reliability | **Minor** | Import job lifecycle state machine and audit persistence | **COMPLETE ✅** |
| **M6** | Reliability | **Minor** | Configurable exponential backoff and jitter retry system | **COMPLETE ✅** |
| **M7** | Reliability | **Major** | Point-in-time failure recovery and resumed ingestion from verse offset | **COMPLETE ✅** |
| **M8** | Ingestion | **Major** | Production-hardened pipeline with idempotency and 104+ test specs | **COMPLETE ✅** |
| **M9** | Backend API | **Major** | Express 5 REST API gateway, security middleware, rate limiting | **COMPLETE ✅** |
| **M10** | Frontend | **Major** | Application shell, responsive typography, 4 sacred themes | **COMPLETE ✅** |
| **M11** | Reader & Audio| **Major** | Devanagari reader, Web Audio 432Hz synthesizer, Tanpura/Om drone | **COMPLETE ✅** |
| **M12** | Search | **Major** | Sub-15ms multi-script inverted search (Devanagari, IAST, English) | **COMPLETE ✅** |
| **M13** | Personalization| **Major** | Seeker authentication, profiles, guest mode, avatar customizer | **COMPLETE ✅** |
| **M14** | Personalization| **Major** | Streak Fire counter, Wisdom Journal, Brahma Muhurta timer, bookmarks | **COMPLETE ✅** |
| **M15** | Administration | **Major** | Scripture Publisher Studio, data import manager, audit ledger | **COMPLETE ✅** |
| **M16** | Observability | **Major** | Structured telemetry logging, SRE metrics, health alerts | **COMPLETE ✅** |
| **M17** | Security | **Major** | Firestore security rules, CSP headers, XSS sanitization, RBAC | **COMPLETE ✅** |
| **M18** | Optimization | **Minor** | Virtualized shloka rendering, query caching, audio pooling | **COMPLETE ✅** |
| **M19** | QA & Gates | **Major** | End-to-end 15-workflow test matrix, Phase 12 Launch Gate evaluator | **COMPLETE ✅** |
| **M20** | Deployment | **Major** | Multi-environment separation (Dev/Staging/Prod), automated CI/CD | **COMPLETE ✅** |
| **M21** | Release | **Major** | Feature freeze, data parity certification, Release Notes v1.0.0 | **COMPLETE ✅** |
| **M22** | Launch | **Major** | Production deployment orchestrator, rollback readiness plan | **COMPLETE ✅** |
| **M23** | Post-Launch | **Minor** | Automated telemetry anomaly detection and cache policy tuning | **COMPLETE ✅** |
| **M24** | Completion | **Major** | Complete architectural documentation, operational runbooks | **COMPLETE ✅** |
| **M25** | Monetization | **Major** | Ethical pricing matrix (Free Seeker, Sādhaka, Rishi), ashram waivers | **COMPLETE ✅** |
| **M26** | Billing | **Major** | Unified billing abstraction with Razorpay & Stripe adapters | **COMPLETE ✅** |
| **M27** | Billing API | **Minor** | Webhook receiver with HMAC signature validation and receipt archive | **COMPLETE ✅** |
| **M28** | Entitlements | **Major** | Dynamic entitlement rule engine and contextual paywall modal | **COMPLETE ✅** |
| **M29** | Monetization UI| **Major** | Sacred Pricing Modal, membership tiers, subscription panel | **COMPLETE ✅** |
| **M30** | Seva Portal | **Major** | Gurudakshina seva portal with preset amounts and cause selector | **COMPLETE ✅** |
| **M31** | Tax Compliance| **Major** | Automated 80G tax certificate generator with PAN checksum check | **COMPLETE ✅** |
| **M32** | Reliability | **Minor** | Idempotent payment handling and webhook retry runner | **COMPLETE ✅** |
| **M33** | QA Testing | **Minor** | Monetization E2E test matrix (Purchase, Seva, 80G receipt delivery) | **COMPLETE ✅** |
| **M34** | Analytics | **Minor** | Monetization telemetry (MRR, ARR, active patrons, churn) | **COMPLETE ✅** |
| **M35** | Operations | **Major** | Monetization Operations Console and 80G audit export (CSV/JSON) | **COMPLETE ✅** |
| **M36** | Configuration | **Minor** | Live/Test gateway toggle and credential verification in admin | **COMPLETE ✅** |
| **M37** | Release | **Major** | Zero-discrepancy financial release certification | **COMPLETE ✅** |
| **M38** | Architecture | **Major** | Platform architectural split: Consumer app vs Admin console | **COMPLETE ✅** |
| **M39** | Admin Console | **Major** | Executive Dashboard and real-time subsystem health matrix | **COMPLETE ✅** |
| **M40** | Admin Console | **Major** | Scripture Publisher and content management studio | **COMPLETE ✅** |
| **M41** | Admin Console | **Major** | Ingestion pipelines and data import manager | **COMPLETE ✅** |
| **M42** | Admin Console | **Major** | Seeker profiles, Sādhaka tiers, and ashram scholarships | **COMPLETE ✅** |
| **M43** | Admin Console | **Major** | Monetization, billing, and 80G seva console | **COMPLETE ✅** |
| **M44** | Admin Console | **Major** | SRE observability, threat detection matrices, and telemetry | **COMPLETE ✅** |
| **M45** | Admin Console | **Minor** | Platform settings, environment variables, system toggles | **COMPLETE ✅** |
| **M46** | Admin Console | **Major** | Dedicated admin shell (`SutraSparshAdminApp.tsx`) with zero UI bleed | **COMPLETE ✅** |
| **M47** | Governance | **Major** | Phase 1 client-side lockdown (Free sanctuary mode active by default) | **COMPLETE ✅** |
| **M48** | Governance | **Major** | Phase 2 dynamic feature gateways with one-click admin toggles | **COMPLETE ✅** |
| **v1.6.0** | Morphology | **Major** | Dynamic Paninian morphological engine & 5-stage Look Closer modal | **COMPLETE ✅** |
| **v1.7.0** | Branding | **Major** | Official geometric sunrise emblem, wordmark & automated resvg pipeline | **COMPLETE ✅** |
| **v1.7.1** | SEO Architecture| **Major** | Complete SEO Compliance: Dynamic Metadata, Open Graph, Twitter Cards, Schema.org JSON-LD, sitemap.xml, robots.txt, canonical URLs, and crawler fallbacks | **COMPLETE ✅** |
| **v1.7.2** | Theme & Contrast | **Major** | Universal App-Wide Theme System, High-Specificity Contrast Guards, Light Canvas Normalization, and ModalPortal MutationObserver Synchronization | **COMPLETE ✅** |
| **M49 (Phase 24)** | Purohit Services | **Major** | Vedic Purohit Directory, Veda Shakha verification, and Click-to-WhatsApp booking protocol | **COMPLETE ✅** |
| **M50 (Phase 25)** | Journey & Safety | **Major** | Sanctuary Journey Relocation, Hook Lifecycle Hardening, 15-Min Daily Goal Celebration, and 10-Suite System Testing Matrix | **COMPLETE ✅** |
| **M51 (Phase 26)** | Voice Intelligence | **Major** | Bhashini ULCA Indic-TTS pipeline, Devī Saraswatī & Sage Vyāsa sacred voice archetypes | **COMPLETE ✅** |
| **M52 (Phase 26)** | Audio Lifecycle | **Major** | ResilientAudioPlayer pre-validation, RIFF/WAV packaging, and deterministic URL.revokeObjectURL disposal | **COMPLETE ✅** |
| **M53 (Phase 27)** | Design Constitution | **Major** | Parchment Dawn WCAG 2.1 AAA contrast unification across all sanctuary views, tabs, cards, and navigation | **COMPLETE ✅** |
| **M54 (Phase 27)** | Performance | **Major** | React.memo custom equality comparator and useMemo collection memoization for 60fps infinite scroll | **COMPLETE ✅** |

---

*Document compiled and certified against production codebase v1.8.0 (Production Launch Certified).*
