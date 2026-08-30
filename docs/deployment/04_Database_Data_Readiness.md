# 04. Database & Data Readiness Specification (M20.3 & # 77)

## 1. Objective
Before promoting any release to production, the database infrastructure, security boundaries, and sacred scripture collections must be verified for 100% data readiness and zero discrepancy.

---

## 2. Pre-Deployment Checklist
```text
[x] Firestore Composite Indexes deployed (`firebase.json`)
[x] Zero-Trust Security Rules deployed (`firestore.rules`)
[x] Collections validated: `scriptures`, `user_bookmarks`, `audit_logs`, `import_jobs`
[x] Initial content imported with zero loss
[x] Content counts verified via reconciliation funnel
[x] Search inverted index memory structures verified
[x] Data integrity and Devanagari UTF-8 encoding verified
```

---

## 3. Initial Content Reconciliation Funnel (# 77)
Every content ingestion lifecycle must follow the deterministic 6-tier reconciliation funnel:

```text
Source Corpus
   │
   ▼
[1] Validated (Schema and Devanagari UTF-8 check)
   │
   ▼
[2] Imported (Firestore batch persistence)
   │
   ▼
[3] Search Indexed (Inverted token indexing)
   │
   ▼
[4] Published (Public visibility flag)
   │
   ▼
[5] UI Visible (Client cache & rendered queries)
```

### Reconciliation Invariants:
1. `Source Count` must equal `Validated Count + Rejected Count`.
2. Any `Rejected Count` must be accompanied by an explicit rejection audit log (e.g. malformed metadata, missing translations).
3. `Imported Count` must equal `Search Indexed Count`.
4. `UI Visible Count` must equal `Published Count`.
