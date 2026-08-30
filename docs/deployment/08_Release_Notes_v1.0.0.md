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
