# SutraSparsh — Production Deployment Runbook (Phase 13 / M20)

This runbook outlines standard operating procedures for provisioning, deploying, verifying, monitoring, and rolling back SutraSparsh in a production environment.

---

## 1. Pre-Deployment Checklist

Before triggering production deployment:
- [ ] Ensure **Phase 12 Release Gate** is 100% green (`npm run test:gate`).
- [ ] Confirm all P0 E2E workflows pass (`E2E-001` through `E2E-014`).
- [ ] Validate Firestore security rules syntax and compile test (`firebase-tools firestore:rules`).
- [ ] Verify compound index configurations in `firestore.indexes.json`.
- [ ] Audit all environment variables in Cloud Secret Manager.
- [ ] Verify zero unhandled critical defects and zero open security advisories.

---

## 2. Infrastructure Deployment Steps

### Step 2.1 — Firestore Security Rules & Indexes Deployment
```bash
# 1. Deploy Firestore Security Rules
firebase deploy --only firestore:rules --project sutrasparsh-prod

# 2. Deploy Compound Indexes
firebase deploy --only firestore:indexes --project sutrasparsh-prod
```

### Step 2.2 — Backend & Container Packaging
```bash
# 1. Execute deterministic production bundle
npm run build

# 2. Build and tag versioned container
docker build -t gcr.io/sutrasparsh-prod/sutrasparsh:v1.0.0 .

# 3. Push to Google Container Registry / Artifact Registry
docker push gcr.io/sutrasparsh-prod/sutrasparsh:v1.0.0
```

### Step 2.3 — Cloud Run Rolling Deployment
```bash
gcloud run deploy sutrasparsh-prod \
  --image gcr.io/sutrasparsh-prod/sutrasparsh:v1.0.0 \
  --region us-central1 \
  --platform managed \
  --port 3000 \
  --min-instances 2 \
  --max-instances 50 \
  --concurrency 80 \
  --cpu 2 \
  --memory 2Gi \
  --set-env-vars NODE_ENV=production,APP_ENV=production,LOG_LEVEL=info \
  --set-secrets ADMIN_SECRET_KEY=sutrasparsh-admin-secret:latest \
  --allow-unauthenticated
```

---

## 3. Post-Deployment Verification (Smoke Testing)

1. **Liveness & Readiness Probes**:
   ```bash
   curl -s -f https://sutrasparsh.app/api/health/ready || exit 1
   curl -s -f https://sutrasparsh.app/api/version
   ```
2. **Search Throughput & Autocomplete Verification**:
   ```bash
   curl -s "https://sutrasparsh.app/api/content?q=dharma&limit=5"
   curl -s "https://sutrasparsh.app/api/content/autocomplete?q=kar"
   ```
3. **Admin Telemetry & Hardening Status**:
   ```bash
   curl -s -H "x-admin-key: $ADMIN_SECRET_KEY" https://sutrasparsh.app/api/tests/system-status
   ```

---

## 4. Emergency Rollback Strategy

If any P0 anomaly occurs post-deployment (P95 latency > 100ms, error rate > 0.5%, or data inconsistency):

### Instant Traffic Rollback (Canary / Cloud Run)
```bash
# Roll back 100% traffic immediately to the previous healthy revision
gcloud run services update-traffic sutrasparsh-prod \
  --to-revisions=sutrasparsh-prod-PREV_STABLE_REVISION=100 \
  --region us-central1
```

### Database Safety Guarantee
- The Firestore schema is append-only for user reading histories and audit logs.
- Breaking migrations are strictly prohibited without backwards-compatible field deprecation cycles.
