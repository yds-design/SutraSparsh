# Phase 22: SutraSparsh Admin Console Separation Architecture
**Milestones: M38 – M46**  
**Classification:** Core Platform Infrastructure & Security  
**Status:** Completed & Production-Ready

---

## 1. Executive Summary & Core Principle (M38)
As the SutraSparsh platform matures to production readiness, the administrative interface has been separated from the sacred consumer experience:

> **The Sacred Split:**
> - **User Application (`sutrasparsh.com`):** Answers *"How do I experience SutraSparsh?"* (Devotion, Daily Shlokas, Meditations, Chants, and Journaling).
> - **Admin Console (`admin.sutrasparsh.com`):** Answers *"How do I operate SutraSparsh?"* (Corpus ingestion, Sanskrit verification, subscriptions, 80G seva receipts, SRE telemetry, and threat matrices).

### Target Multi-App Topography
```
                     SUTRASPARSH PLATFORM
                              │
               ┌──────────────┴──────────────┐
               │                             │
               ▼                             ▼
      ┌─────────────────┐           ┌──────────────────┐
      │ SutraSparsh Web │           │ SutraSparsh      │
      │     App         │           │ Admin Console    │
      │ (sutrasparsh.com│           │(admin.sutrasparsh│
      │   port 5173)    │           │ .com, port 5174) │
      └────────┬────────┘           └────────┬─────────┘
               │                             │
               └──────────────┬──────────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │ Shared Backend   │
                     │ Express API &    │
                     │ Firestore Core   │
                     └──────────────────┘
```

---

## 2. Role-Based Access Control (RBAC) Matrix (M38.5)

| Role | Dashboard | Content Studio | Importer & Data | Users & Scholarships | Monetization & Seva | Operations & SRE | Settings & Flags |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **SUPER_ADMIN** | Full | Full | Full | Full | Full | Full | Full |
| **CONTENT_ADMIN** | Read | Full | Read | Read | Restricted | Read | Restricted |
| **IMPORT_ADMIN** | Read | Read | Full | Restricted | Restricted | Read | Restricted |
| **OPERATIONS_ADMIN**| Full | Read | Execute | Read | Read | Full | Edit |
| **MONETIZATION_ADMIN**| Full | Read | Restricted | Support/Edit| Full | Read | Restricted |
| **SUPPORT_ADMIN** | Read | Read | Restricted | Support/Scholar| Read | Read | Restricted |

---

## 3. Seven Operational Domains (M39 – M45)

### Domain 1: Executive Dashboard & Health Center (M39)
- **KPI Summary Matrix:** Live counters for Total Corpus, Published Verses, Active Seekers, Sādhaka/Rishi Subscribers, and Month-to-Date Seva collections.
- **Subsystem Health Matrix:** Real-time polling of API Gateway, Firestore Corpus, Importer Pipelines, Inverted Search Index, Billing & Webhooks, and CDN Storage.
- **Recent Event Stream:** Live event ticker showing administrative actions and audit records.

### Domain 2: Sacred Content Studio (M40)
- **Corpus Catalog:** Complete scripture library with multi-faceted filtering by Tradition (*Bhagavad Gita, Yoga Sutras, Upanishads, Vedas*) and Category (*Karma Yoga, Raja Yoga, Mind & Meditation, Jnana*).
- **Phonetic & Sanskrit Editor:** Direct editing of Devanagari Unicode, IAST Romanized diacritics, word-by-word etymology, and philosophical commentaries.
- **Bulk Operations:** Multi-select publishing, status overrides, and category tags.

### Domain 3: Import & Data Pipelines (M41)
- **Collector Framework:** One-click ingestion pipelines for canonical scripture collections.
- **Data Reconciliation Engine:** Automated verification of Unicode normalization, diacritic integrity, and audio bucket links.
- **Disaster Recovery:** Instant creation and inspection of AES-256 encrypted database snapshots.

### Domain 4: User Administration & Scholarships (M42)
- **Seeker Directory:** Complete user listing with tier status (`FREE`, `SADHAKA`, `RISHI`), joined date, chant progress, and scholarship flags.
- **Vedic Scholar Pass System:** Grant complimentary Rishi tier passes to Sanskrit academics, ashrams, and students.

### Domain 5: Monetization & Seva Administration (M43)
- **Revenue Telemetry:** Real-time MRR, ARR, and average donation metrics.
- **Tier Configuration:** Management of Sādhaka (Monthly/Annual) and Rishi (Patron) pricing parameters.
- **80G Tax Exemption Receipts:** Cryptographically verified receipt generation for Indian donors.

### Domain 6: Operations, SRE & Observability (M44)
- **Automated Smoke Test Runner:** One-click execution of the comprehensive 21-Milestone E2E validation suite.
- **Structured System Logs:** High-throughput JSON log inspector with severity filters.
- **Threat Defense Matrix:** Rate limiter sliding window monitors and security posture inspection.

### Domain 7: Platform Settings & Feature Flags (M45)
- **Feature Flags Engine:** Real-time toggling of runtime capabilities (e.g. Sanskrit TTS safety engine, offline audio caching, advanced etymology lens).
- **Security & Secret Rotation:** Admin security key management (`X-Admin-Key`) with audit logging.

---

## 4. Independent Deployment & DNS Configuration (M46)

```nginx
# User Application Routing
server {
    server_name sutrasparsh.com www.sutrasparsh.com;
    root /var/www/sutrasparsh/dist-user;
    index index.html;
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
    }
}

# Dedicated Admin Console Routing
server {
    server_name admin.sutrasparsh.com;
    root /var/www/sutrasparsh/dist-admin;
    index index.html;
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

---
*Verified & Approved by SutraSparsh Core Engineering Team.*
