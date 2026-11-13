# SUTRASPARSH RELEASE NOTES

**Version:** `v1.0.0`  
**Release Date:** `2026-08-30`  
**Commit Hash:** `1bed6d6`  
**Release Status:** `PRODUCTION_RELEASED`  
**Target Platform:** Web / PWA / Cloud Run container  

---

## 1. Executive Summary

SutraSparsh v1.0.0 marks the official initial production release of the digital sacred Jain scriptures platform. The system is designed for absolute preservation of sacred texts, sub-millisecond search performance, offline contemplation, zero-trust security hardening, and resilient continuous operations.

---

## 2. Major Features Delivered

1. **Universal Multi-Script Sacred Corpus**
   - High-fidelity Devanagari script preservation with zero diacritic stripping.
   - Verse-by-verse English and Hindi translations with traditional commentary.
   - Audio chanting integration with synchronized playback controls.

2. **Inverted Index & Autocomplete Search Engine**
   - Sub-millisecond indexed query execution across Prakrit, Sanskrit, and English transliterations.
   - Prefix autocomplete and fuzzy matching heuristics.
   - Zero-dependency client & server in-memory search layer.

3. **Offline-First Progressive Web App (PWA)**
   - Service worker caching with cache-first / network-fallback strategies.
   - Local bookmarking and reading history persistence.
   - Full offline scripture reading support.

4. **Zero-Trust RBAC & Admin Operations Control Plane**
   - Constant-time cryptographic token verification.
   - Comprehensive mutation audit trails (`/api/audit`).
   - Rate limiting, sanitization, and security HTTP headers.

5. **Multi-Source Ingestion Pipeline**
   - Automated validator, schema normalizer, and batch processor.
   - Instant search index synchronization.
   - Duplicate prevention and data integrity enforcement.

---

## 3. Security & Bug Fixes

- `FIX-SEC-01`: Replaced standard string equality with constant-time buffer comparison to eliminate timing attacks.
- `FIX-SEC-02`: Hardened search tokenization regexes against ReDoS vulnerability patterns.
- `FIX-CORPUS-03`: Preserved Unicode virama and matra sequences during text normalization.
- `FIX-PERF-04`: Added bounded LRU eviction to inverted index cache to cap peak heap consumption.
- `FIX-PERF-05`: Scoped Express `rateLimiterMiddleware`, `sanitizeMiddleware`, and `timeoutMiddleware` strictly to `/api/*` endpoints, eliminating HTTP 429 throttling on Vite development modules.
- `FIX-UI-06`: Unified Parchment Dawn palette with pure white card surfaces (`#ffffff`), Night Indigo headers (`#1b1740`), Soft Ink typography (`#55526b`), and Diya Gold accents (`#b8801f`) across Explore, Search, Community Board, and Personal Sanctuary.
- `FIX-RESIL-07`: Integrated top-level React `ErrorBoundary` (`src/components/ErrorBoundary.tsx`) in `src/main.tsx` with one-tap reload and session cache reset controls.
- `FIX-SEC-08`: Configured `Content-Security-Policy` with `frame-ancestors *` and full `media-src` permissions to support seamless AI Studio preview iframe embedding and 432Hz audio playback.

---

## 4. Known Limitations

- In embedded AI Studio preview iframe sandbox, direct modal popups or external window.open calls may be restricted by sandbox policies.
- Running without GCP credentials defaults to high-fidelity in-memory storage.

---

## 5. Migration & Deployment Requirements

1. **Firestore Composite Indexes**: Run `firebase deploy --only firestore:indexes`.
2. **Environment Configuration**: Set `ADMIN_SECRET_KEY` in GCP Secret Manager.
3. **Corpus Seeding**: Execute initial ingestion via `POST /api/import/run`.

---

## 6. Operational Notes

- **Disaster Recovery**: Verified isolated restore drill with $\text{RPO} < 1.0\,\text{hr}$ and $\text{RTO} < 15\,\text{min}$.
- **Monitoring**: Live metrics at `/api/metrics`, `/api/health`, and `/api/tests/system-status`.
- **Rollback Readiness**: Previous container revision `cloud-run-rev-20260829-01` verified available for instant rollback.

---

# SUTRASPARSH RELEASE NOTES — v1.8.0

**Version:** `v1.8.0`  
**Release Date:** `2026-11-04`  
**Release Tag:** `v1.8.0-parchment-dawn-bhashini`  
**Release Status:** `PRODUCTION_RELEASED` ✅  
**Target Platform:** Web / PWA / Cloud Run container  

---

## 1. Executive Summary

SutraSparsh v1.8.0 delivers the integration of India's National Bhashini ULCA Indic-TTS engine, providing sacred voice intelligence through Devī Saraswatī and Sage Vyāsa sacred archetypes. This release resolves the audio source format issue ("Failed to load because no supported source was found") through strict audio pre-validation, binary WAV/RIFF packaging, and deterministic `URL.revokeObjectURL()` memory lifecycle management. Furthermore, v1.8.0 establishes the Parchment Dawn (`theme === "light"`) WCAG 2.1 AAA contrast constitution and integrates `React.memo` / `useMemo` optimizations for sustained 60 FPS infinite scroll across thousands of sacred Sanskrit verses.

---

## 2. Major Features Delivered

1. **Bhashini ULCA Indic-TTS & Voice Intelligence Engine**
   - Direct integration with MeitY Bhashini ULCA pipeline compute service (`src/services/bhashiniService.js`).
   - Dual sacred voice archetypes: *Devī Saraswatī* (devotional clarity) and *Sage Vyāsa* (deep liturgical gravitas).
   - Shloka pacing calibration (0.70x, 0.80x default shloka pace, 0.90x, 1.00x).
   - Automatic dual-engine failover: seamless fallback to Google Cloud Neural2 on upstream 500/503 errors, socket timeouts, or malformed payloads with non-blocking toast notifications.

2. **Resilient Audio Player & Memory Leak Prevention (`resilientAudioPlayer.js`)**
   - Pre-flight audio source validation preventing browser `MEDIA_ERR_SRC_NOT_SUPPORTED` runtime errors.
   - 44-byte RIFF header packaging for raw PCM audio with explicit `audio/wav` MIME typing.
   - Deterministic disposal of Blob URLs via `URL.revokeObjectURL()` immediately on `ended` and `error` events.

3. **Parchment Dawn WCAG 2.1 AAA Design Constitution**
   - Unification of the light theme around luminous ivory parchment (`#FFFBF5` / `#FBF8EE`), deep sandalwood typography (`#261B12`, > 15:1 contrast), devotional ochre accents (`#C65507`), and warm borders (`#E8DCC2`).
   - Universal application across Header, Bottom Navigation, Search Tray, Journey View, Community Board, More View, and Modal Drawers.

4. **60 FPS Infinite Scroll Optimization**
   - `React.memo` custom equality comparator on `VerseCard` evaluating verse identity, text content, active playback state, bookmark state, and current theme token.
   - Pre-computed `bookmarkedIdsSet` and memoized verse card collections in `src/App.tsx`.

---

## 3. Bug Fixes & Hardening

- `FIX-AUDIO-01`: Resolved "Failed to load because no supported source was found" error by ensuring Bhashini audio byte reconstruction, RIFF/WAV header injection, and pre-flight validation before attaching to audio objects.
- `FIX-MEM-02`: Prevented client-side memory leaks by enforcing immediate `URL.revokeObjectURL()` on `ended`, `error`, and unmount events.
- `FIX-CONTRAST-03`: Replaced all low-contrast amber text tokens on light backgrounds with high-contrast sandalwood and ochre tokens meeting WCAG 2.1 AAA standards.
- `FIX-TYPES-04`: Expanded `SearchViewProps.theme` type to include `"golden-hour"` and `"prism-pulse"`, eliminating TypeScript compilation errors.

---

## 4. Test Suite & Verification Matrix

- **Total Assertions:** **509 / 509 passed (100% green)** across all 14 test suites.
  - Suite 11 (Bhashini Voice Intelligence): 33/33 passed
  - Suite 12 (Bhashini 500 Simulation & Google Failover): 21/21 passed
  - Suite 13 (Resilient Audio Player Memory Disposal): 29/29 passed
  - Suite 14 (Parchment Dawn Contrast & Infinite Scroll Memo): 45/45 passed
- **CI/CD Gates:** All 10 CI stages and 15 E2E workflows passed.

---

# SUTRASPARSH RELEASE NOTES — v1.0.6

**Version:** `v1.0.6`  
**Release Date:** `2026-11-13`  
**Release Tag:** `v1.0.6-web-compliant`  
**Release Status:** `PRODUCTION_RELEASED` ✅  
**Target Platform:** Web / PWA / Express 5 Full-Stack Container  

---

## 1. Executive Summary

SutraSparsh v1.0.6 completes the **19-Point Web Production Launch & Compliance Audit**, introduces the global **Subtle Glow Selected Chip Design System**, stabilizes cross-flow **Shloka State Synchrony**, eliminates undefined `.split()` runtime errors in Explore and Search, and streamlines the top navigation toolbar by hiding the duplicate **Look Closer** trigger (`showLookCloserInToolbar={false}`).

---

## 2. Major Features & Remediation Delivered

1. **19-Point Web Production Compliance (`web-compliance-19pt.test.ts` — 39/39)**
   - **Security**: Removed all `VITE_BHASHINI_*` client references and redundant Firebase key literals; locked `POST /api/tts/bhashini/config` to non-secret preferences; added Express `trust proxy` production HTTPS redirects, `Strict-Transport-Security`, `Permissions-Policy`, `CSP`, `X-Content-Type-Options`, and `Referrer-Policy` headers; integrated `spamProtection.ts` honeypots and rate limiting across forms plus a 1,000-character synthesis limit.
   - **Legal, Privacy & Consent**: Added dedicated `/privacy-policy` and `/terms` views with DPDP Act 2023, GDPR, transient TTS, and audio IP disclosures; added DPDP/GDPR opt-in Cookie Consent banner gating Google Analytics telemetry (`consentService` + `analyticsService`).
   - **SEO, Routing, A11y & Performance**: Added `1200x630` `og-image.png`, `180x180` `apple-touch-icon.png`, `favicon.svg`, `site.webmanifest`, clean `/privacy-policy`, `/terms`, and `/verse/:id` routing, custom `noindex` 404 recovery page, zoomable viewport, `aria-hidden="true"` decorative SVGs, WCAG AA `<noscript>` contrast, `role="alert"` validation, `React.lazy` code splitting, and Workbox precache exclusions.

2. **Subtle Glow Selected Chip Design System (`chip-glow.test.ts` — 35/35)**
   - Standardized `<Chip />` primitive and CSS tokens (`--chip-glow-active`, `--chip-transition: 180ms cubic-bezier(0.4, 0, 0.2, 1)`) across Light, Dark, Sandstone, Golden Hour, Amethyst, and Festival themes, with `prefers-reduced-motion`, `prefers-contrast: more`, and overflow-safe horizontal scroll padding.

3. **Shloka State Synchrony, Null-Safety & Toolbar Decluttering**
   - Unified `DailyWisdomService` SSOT and `/api/v1/wisdom/*` across Today, Explore banner, and Look Closer modal (`shloka-state-synchrony.test.ts`).
   - Guarded `.split()` operations across WordExplorer, SearchEngine, Tithi calendar, SharingService, and Header (`split-null-safety.test.ts`).
   - Set `showLookCloserInToolbar={false}` by default in `Header.tsx` and `App.tsx` (`toolbar-look-closer-visibility.test.ts`).

---

## 3. Verification Matrix

- **Master Suite (`npm test`)**: **18/18 Suites Passed (100%)**.
- **Auxiliary Suites (`test:player`, `test:fallback`, `test:enhancements`, `test:pulse`)**: **All Passed (100%)**.
- **Compilation & Lint**: `vite build`, `esbuild server.ts`, and `tsc --noEmit` completed with **0 errors**.
- **Live Server Smoke Check**: Port `3000` verified returning HTTP `200` and enforced security headers across `/`, `/privacy-policy`, `/terms`, `/og-image.png`, `/favicon.svg`, `/site.webmanifest`, `/robots.txt`, and `/sitemap.xml`.


