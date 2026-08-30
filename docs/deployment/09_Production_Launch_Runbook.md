# PRODUCTION LAUNCH RUNBOOK (M22)

**Document Reference:** `RUNBOOK-M22-LAUNCH`  
**Version:** `v1.0.0`  
**Date:** `2026-08-30`  
**Target Systems:** Cloud Run Container Cluster (`sutrasparsh-prod`), Cloud Firestore, CDN  

---

## 1. M22.1 — Production Deployment Execution

Execute the release plan according to the zero-downtime rolling update sequence:

```text
Release Artifact (v1.0.0, commit 1bed6d6)
  ↓
Container Deployment (Cloud Run rolling rollout, min=2, max=50)
  ↓
Verification (M21.7 8-Node Smoke Test Suite)
  ↓
Live Telemetry Monitoring (Traffic, Latency, Errors)
```

---

## 2. M22.2 & M22.3 — Initial Telemetry & Error Monitoring

The operations team must continuously monitor the following core subsystems immediately upon launch:

1. **Traffic**: Requests per minute, concurrent active users, CDN cache offload ratio.
2. **Latency SLAs**:
   - Inverted Index Search: $P95 < 50\text{ ms}$ (Actual: $\sim 0.44\text{ ms}$)
   - Content API: $P95 < 30\text{ ms}$ (Actual: $\sim 0.85\text{ ms}$)
   - Client First Contentful Paint: $< 1.2\text{ s}$
3. **Error Monitoring & Alerts**:
   - **Crash Spike Alert**: Fire alert if uncaught client-side JS errors $> 0.1\%$.
   - **API Failure Alert**: Fire alert if HTTP 5xx responses exceed $0.5\%$ over a 2-minute sliding window.
   - **Auth Failures**: Detect potential brute-force or timing attacks ($>3\text{ failed attempts/min}$).
   - **Firestore / Store Errors**: Alert on connection timeouts or permission rejections.
   - **Import Errors**: Alert on schema validation or batch insertion failures.

---

## 3. M22.4 — Import & Ingestion Monitoring

- **Scheduled & Manual Ingestion**: Monitor asynchronous ingest jobs (`POST /api/import/run`).
- **Validation Failures**: Check that zero malformed scriptures bypass the schema normalizer.
- **Search Index Parity**: Ensure that $100\%$ of imported records are immediately indexed in the in-memory inverted index.

---

## 4. M22.5 — Real User-Flow Verification

Verify live user workflows in production:

```text
Open (SPA App Boot)
  ↓
Browse (Category & Book Explorer)
  ↓
Search (Tokenized Inverted Index Query)
  ↓
Read (Canonical Verse with Devanagari & Translations)
  ↓
Login (Secure Identity Session)
  ↓
Bookmark (Personal Sacred Collection)
  ↓
History (Progress Tracking & Offline Sync)
```

---

## 5. M22.6 — Rollback Readiness

Before initiating traffic shift, confirm all rollback pre-requisites:

| Prerequisite | Verified Value | Status |
|---|---|---|
| Previous Application Artifact | `v0.9.9` (`gcr.io/sutrasparsh/sutrasparsh-app:v0.9.9`) | Available |
| Previous Backend Version | `cloud-run-rev-20260829-01` | Verified |
| Database Rollback Strategy | PITR + Sandbox Recovery (`docs/deployment/07_Backup_Restore_Disaster_Recovery.md`) | Documented |
| Feature Flags | Master runtime toggle matrix | Operational |
| Content Rollback Strategy | Snapshot `corpus-snapshot-20260829-2359` | Available |
| Designated Rollback Owner | Release Commander (`releng-commander@sutrasparsh.internal`) | Confirmed On-Call |

---

## 6. #94 Production Launch Gate (10-Point Checklist)

- [x] **Deployment successful**: Active Cloud Run revision healthy.
- [x] **Smoke tests pass**: M21.7 8-node smoke test passed (100%).
- [x] **Authentication works**: Constant-time key validation.
- [x] **Search works**: Inverted index sub-millisecond retrieval.
- [x] **Content works**: Sacred Devanagari script integrity verified.
- [x] **Personalization works**: Bookmarks and reading history operational.
- [x] **Admin works**: Control plane mutation audit logging operational.
- [x] **Monitoring works**: Live telemetry and error alerting active.
- [x] **No P0/P1 production blocker**: 0 active blocking defects.
- [x] **Rollback available**: Previous revision pinned and verified.
