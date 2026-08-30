# SutraSparsh — Environment Separation & Infrastructure Matrix (Phase 13 / M20)

This specification defines the strict multi-tier environment architecture for SutraSparsh, ensuring zero data leakage, reproducible deployments, and deterministic release promotion from Local development to Production.

---

## 1. Environment Separation Principle

**Cardinal Rule**: Never casually use production data for local development or staging verification. Every tier is logically and physically partitioned with dedicated credentials, schemas, rate limits, and monitoring endpoints.

```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      LOCAL      │  ───► │   DEVELOPMENT   │  ───► │     STAGING     │  ───► │   PRODUCTION    │
│  (Emulators)    │       │   (Sandbox)     │       │   (Pre-Release) │       │   (Live Users)  │
└─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
```

---

## 2. Master Environment Matrix

| Component | Local | Development | Staging | Production |
| :--- | :--- | :--- | :--- | :--- |
| **Firebase Project** | `sutrasparsh-local` (Emulator) | `sutrasparsh-dev` | `sutrasparsh-staging` | `sutrasparsh-prod` |
| **Firestore** | Local Emulator (`:8080`) | Cloud Firestore (Dev Instance) | Cloud Firestore (Staging Instance) | Cloud Firestore Multi-Region (`nam5`/`eur3`) |
| **Authentication** | Local Auth Emulator / Dev Tokens | Firebase Auth (Dev Tenant) | Firebase Auth (Staging Tenant) | Firebase Auth Production (Google + Email) |
| **Security Rules** | `firestore.rules` (Strict Deny) | `firestore.rules` | `firestore.rules` (Strict Deny) | `firestore.rules` (Production Certified) |
| **Indexes** | `firestore.indexes.json` (Local) | Auto-built & Managed | Pre-warmed Indexes | Production Compound Indexes |
| **Backend API** | Node/Express (`localhost:3000`) | Cloud Run Dev Service | Cloud Run Staging Service | Cloud Run Production (Autoscale 2–50 instances) |
| **Frontend** | Vite Dev Server (`localhost:3000`) | AI Studio Dev Preview | Staging CDN / Preview URL | Production Global CDN (`sutrasparsh.app`) |
| **Secrets Management** | Local `.env` / In-Memory | Secret Manager (Dev Keys) | Secret Manager (Staging Keys) | GCP Secret Manager (Zero-Trust Prod Keys) |
| **Rate Limiting** | 1000 req/min (Relaxed) | 240 req/min | 120 req/min (Prod Emulation) | 120 req/min (Search: 80, Write: 30) |
| **Telemetry & Logs** | Console Stdout (Debug) | Cloud Logging (Info) | Cloud Logging + Error Reporting | Cloud Logging + Datadog / OpenTelemetry |
| **Cache Strategy** | In-Memory LRU (5MB) | In-Memory LRU (20MB) | In-Memory LRU (50MB) | Edge CDN + Multi-Tier In-Memory LRU (200MB) |

---

## 3. Environment Variable Standards

| Variable | Purpose | Required | Secret | Scope | Example |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `NODE_ENV` | Runtime execution environment mode | ✓ | No | Global | `production` / `development` |
| `APP_ENV` | Application tier identifier | ✓ | No | Global | `production`, `staging`, `dev`, `local` |
| `APP_NAME` | Display application title | ✓ | No | Client/Server | `SutraSparsh` |
| `APP_VERSION` | Semantic release version | ✓ | No | Client/Server | `1.0.0` |
| `PORT` | API server listen port | ✓ | No | Server | `3000` |
| `API_PREFIX` | Base prefix for REST endpoints | ✓ | No | Client/Server | `/api` |
| `FIREBASE_PROJECT_ID` | GCP Project ID for Firebase | ✓ | No | Server | `sutrasparsh-prod` |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Path to JSON service account key | Depends | ✓ | Server Only | `./config/firebase-service-account.json` |
| `ADMIN_SECRET_KEY` | Admin authorization key for console operations | ✓ | ✓ | Server Only | `[SECURE_HASHED_SECRET]` |
| `RATE_LIMIT_MAX_REQUESTS` | Sliding-window request cap per IP | ✓ | No | Server | `120` |
| `RATE_LIMIT_WINDOW_MS` | Sliding window duration in milliseconds | ✓ | No | Server | `60000` |
| `LOG_LEVEL` | Minimum log severity to emit | ✓ | No | Server | `info`, `warn`, `error`, `debug` |
| `IMPORT_BATCH_SIZE` | Pipeline bulk ingest document chunk size | ✓ | No | Server | `50` |
| `CACHE_TTL_SECONDS` | In-memory LRU cache time-to-live | ✓ | No | Server | `300` |

---

## 4. Release Promotion Gate

Promotion from Staging to Production requires:
1. **Phase 12 Certification**: All 5 exit criteria passing (`All P0 E2E Pass`, `Zero Critical Defects`, `Zero Security Blockers`, `Zero Data Integrity Blockers`, `Zero Perf Regression`).
2. **Deterministic Artifact Build**: `npm run build` executed without warnings and sourcemaps generated.
3. **Database Migration Check**: `firestore.rules` and `firestore.indexes.json` deployed and pre-indexed prior to traffic migration.
4. **Smoke Verification**: Health probes (`/api/health`, `/api/health/ready`, `/api/version`) returning `200 OK` with production hashes.
