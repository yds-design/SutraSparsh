# 05. Production Smoke Test Specification (M20.4)

## 1. Overview
Production Smoke Tests execute immediately after container deployment and CDN cache warming to verify that all live infrastructure components respond accurately.

---

## 2. Test Matrix

| Subsystem | Target Endpoint / Action | Success Criteria | Threshold |
| :--- | :--- | :--- | :--- |
| **API** | `GET /api/health/ready` & `/api/version` | Returns `200 OK`, pinned version `v1.0.0`, zero downtime | < 50ms |
| **Authentication** | Timing-Safe Secret Key Validation | Valid key accepted, bad key returns 401 in constant time | < 10ms |
| **Search** | `GET /api/content/search?q=dharma` | Inverted index match with autocomplete prefix support | < 50ms (P95) |
| **Content** | `GET /api/content/BG_02_47` | 100% Devanagari Unicode preservation & audio metadata | < 30ms (P95) |
| **Importer** | Ingestion pipeline dry-run probe | Schema normalizers active; batch workers ready | < 100ms |
| **Admin** | `GET /api/admin/audit-logs` | Immutable audit trail queryable; operational telemetry 200 OK | < 50ms |
