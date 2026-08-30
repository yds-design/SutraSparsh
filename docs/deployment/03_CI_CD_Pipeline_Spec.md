# SutraSparsh — CI/CD Build & Test Pipeline Specification (Phase 13 / M20.2)

This specification defines the multi-phase Continuous Integration and Continuous Deployment (CI/CD) pipeline for SutraSparsh.

---

## 1. Build Pipeline Architecture

```text
┌──────────────┐
│  Git Commit  │
└──────┬───────┘
       ▼
┌──────────────┐
│   Install    │  (Deterministic npm clean install)
└──────┬───────┘
       ▼
┌──────────────┐
│     Lint     │  (ESLint syntax, import cleanliness, security rules)
└──────┬───────┘
       ▼
┌──────────────┐
│  Type Check  │  (TypeScript strict compiler verification - tsc --noEmit)
└──────┬───────┘
       ▼
┌──────────────┐
│  Unit Tests  │  (Schema validation, normalizers, math & audio synthesizer)
└──────┬───────┘
       ▼
┌──────────────┐
│  Prod Build  │  (Vite bundle + esbuild server.cjs with external packages)
└──────────────┘
```

---

## 2. Test Pipeline & Quality Gates

```text
┌─────────────────┐
│ Production Build│
└────────┬────────┘
         ▼
┌─────────────────┐
│   Unit Tests    │  (Content schemas, Sanitizers, Cache eviction logic)
└────────┬────────┘
         ▼
┌─────────────────┐
│Integration Tests│  (Content repository, Firestore fallback, Importer pipelines)
└────────┬────────┘
         ▼
┌─────────────────┐
│ Security Tests  │  (Dirty Dozen threat suite, timing-safe auth, ReDoS, XSS)
└────────┬────────┘
         ▼
┌─────────────────┐
│  E2E Test Matrix│  (Master 15-Workflow certification E2E-001 - E2E-015)
└────────┬────────┘
         ▼
┌─────────────────┐
│Performance Gates│  (P95 Search < 50ms, P95 Read < 30ms, Cache hit > 75%)
└────────┬────────┘
         ▼
┌─────────────────┐
│ Release Sign-Off│  (Phase 12 Exit Gate -> Ready for Production Deployment)
└─────────────────┘
```

---

## 3. Automated Stage Gates

| Stage | Command / Evaluator | Exit Criteria | Blocking Action |
| :--- | :--- | :--- | :--- |
| **Lint & Syntax** | `npm run lint` | 0 errors, 0 unresolved imports | Fails build |
| **Type Check** | `npx tsc --noEmit` | Clean typecheck against TS strict | Fails build |
| **Security Suite** | `POST /api/tests/security` | 10/10 threat vectors PASSED | Blocks deployment |
| **E2E Matrix** | `POST /api/tests/e2e` | 15/15 workflows PASSED | Blocks deployment |
| **Performance SLA** | `POST /api/tests/performance` | Search P95 < 50ms, Read P95 < 30ms | Blocks deployment |
| **Phase 12 Gate** | `npm run test:gate` | All 5 criteria certified green | Release blocked |
