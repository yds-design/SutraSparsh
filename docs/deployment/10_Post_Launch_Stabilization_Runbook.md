# POST-LAUNCH STABILIZATION RUNBOOK (PHASE 15 / M23)

**Document Reference:** `RUNBOOK-M23-STABILIZATION`  
**Phase:** `Phase 15 — Post-Launch Stabilization`  
**Objective:** Observe the real system under actual production load, resolve emergent issues, and establish a stable operating baseline.

---

## 1. M23.1 — Production Bug Triage & SLAs

All incoming production defects must be prioritized strictly according to impact:

| Priority | Definition | Acknowledge SLA | Resolution / Mitigation SLA | On-Call Response |
|---|---|---|---|---|
| **P0** | Outage, data corruption, or security vulnerability | $\le 15\text{ minutes}$ | $\le 1\text{ hour}$ | Immediate paging & bridge |
| **P1** | Major user workflow broken (e.g. search down, reader blank) | $\le 1\text{ hour}$ | $\le 4\text{ hours}$ | High-priority sprint interrupt |
| **P2** | Degraded non-critical feature (e.g. audio latency, history lag) | $\le 4\text{ hours}$ | $\le 24\text{ hours}$ | Next scheduled patch |
| **P3** | Cosmetic or minor UI/UX glitch | $\le 24\text{ hours}$ | Next release cycle | Backlog triage |

---

## 2. M23.2 — Performance Tuning via Actual Production Measurements

Never tune or optimize based purely on assumptions. Profile real production data:

- **Slow Screens**: Profile React component render times (Target: $< 30\text{ ms}$).
- **Slow Queries**: Profile Firestore queries and inverted index lookups (Target: $< 10\text{ ms}$).
- **Search Latency**: Enforce $P95 < 50\text{ ms}$ threshold across multi-script queries.
- **API Latency**: Enforce $P95 < 30\text{ ms}$ on `/api/content` and `/api/health`.
- **Import Throughput**: Maintain $> 500\text{ records/sec}$ ingestion capability.
- **Memory & Crash Rates**: Monitor Node.js heap leaks and browser unhandled rejections.

---

## 3. M23.3 — Controlled, Traceable Data Corrections Workflow

Direct, untracked modification of canonical scripture data in production is strictly forbidden.

```text
Issue Detected (Scholar feedback / Automated audit)
  ↓
Identify Affected Records (Exact document IDs and fields)
  ↓
Prepare Correction Diff (Before / After JSON snapshot)
  ↓
Peer / Scholar Review (Formal authorization sign-off)
  ↓
Execute Scripted Mutation (Atomic batch update)
  ↓
Verify Integrity & Search Parity (Devanagari check + index rebuild)
  ↓
Audit Trail Recording (Immutable entry written to audit service)
```

---

## 4. M23.4 — User Feedback Collection & Triage

User feedback is categorized and routed into 5 isolated streams:

1. **Bug**: Forwarded to SRE / Engineering defect tracker.
2. **Usability Problem**: Forwarded to Design / UX team for interaction refinement.
3. **Feature Request**: Categorized for product roadmap consideration.
4. **Content Correction**: Routed to the Sacred Scripture Scholar Review Board.
5. **Operational Problem**: Flagged for infrastructure and capacity planning.

---

## 5. M23.5 — Monitoring & Alert Refinement

Refine alerting thresholds following initial live traffic exposure:

- **Remove Noisy Alerts**: Suppress transient, non-actionable warnings (e.g. normal cold-start blips).
- **Add Missing Alerts**: Add alerts for edge conditions discovered in live operations.
- **Tune Thresholds**: Tighten SLAs from conservative staging defaults to measured production realities.
- **Enrich Log Fields**: Ensure all logs carry `request_id`, `user_session_hash`, and `execution_duration_ms`.
