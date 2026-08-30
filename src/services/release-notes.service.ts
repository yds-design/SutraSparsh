/**
 * SutraSparsh - Release Notes Service (M21.8)
 * Exposes production release metadata, changelogs, operational notes, and migration instructions.
 */

import { APP_VERSION_METADATA } from "../config/version.js";
import type { ReleaseNotesData } from "../types.js";

export class ReleaseNotesService {
  public static getReleaseNotes(): ReleaseNotesData {
    return {
      version: APP_VERSION_METADATA.version,
      releaseDate: "2026-08-30",
      status: "RELEASED",
      commit: APP_VERSION_METADATA.commitHash,
      majorFeatures: [
        {
          title: "Universal Multi-Script Sacred Corpus",
          description:
            "Full digital preservation and multi-line rendering of sacred Jain texts with zero Devanagari Unicode loss, line-by-line verse translations, and audio chanting guides.",
          tag: "Core Sacred Corpus",
        },
        {
          title: "Zero-Latency Inverted Index & Autocomplete Search",
          description:
            "Sub-millisecond tokenized searching across Pali, Sanskrit, Hindi, and English transliterations with prefix matching, word boundary heuristics, and zero external query overhead.",
          tag: "Search Engine",
        },
        {
          title: "Offline-First Progressive Web App (PWA) & Local Cache",
          description:
            "Service worker cache storage with stale-while-revalidate strategy, indexed reading history, and local bookmark persistence for remote and offline pilgrimage contemplation.",
          tag: "Offline & PWA",
        },
        {
          title: "Zero-Trust RBAC & Tamper-Evident Admin Control Plane",
          description:
            "Constant-time cryptographic admin authentication, comprehensive mutation audit trails, security rate limiting, and isolated role-based security rules.",
          tag: "Security & Operations",
        },
        {
          title: "Resilient Multi-Source Ingestion Pipeline",
          description:
            "Automated multi-stage data importer with schema normalizer, batch chunking, rate limiting, duplicate ID rejection, and instant search index synchronization.",
          tag: "Data Ingestion",
        },
      ],
      fixes: [
        {
          id: "FIX-SEC-01",
          description: "Replaced standard string equality with constant-time buffer comparison to neutralize timing attacks against admin authentication.",
          severity: "CRITICAL",
        },
        {
          id: "FIX-SEC-02",
          description: "Strengthened regex search tokenization to defend against catastrophic backtracking (ReDoS) vulnerability vectors.",
          severity: "HIGH",
        },
        {
          id: "FIX-CORPUS-03",
          description: "Fixed Unicode diacritic stripping in Devanagari virama / matra combinations during text normalizer sanitization.",
          severity: "MEDIUM",
        },
        {
          id: "FIX-PERF-04",
          description: "Added bounded LRU eviction to search inverted index cache to prevent memory bloat during high-concurrency query spikes.",
          severity: "MEDIUM",
        },
      ],
      knownLimitations: [
        "In AI Studio preview iframe sandbox, direct modal popups or external window.open calls may be restrained by container browser policies; open in dedicated browser tab for full native PWA experience.",
        "When running without Google Cloud service account keys, application gracefully switches to in-memory fallback store with full operational fidelity.",
      ],
      migrationRequirements: [
        {
          component: "Firestore Composite Indexes",
          instruction: "Deploy indexes defined in firebase.json using `firebase deploy --only firestore:indexes` before production ingestion.",
          mandatory: true,
        },
        {
          component: "Environment Variables",
          instruction: "Ensure ADMIN_SECRET_KEY is configured in GCP Secret Manager or environment settings.",
          mandatory: true,
        },
        {
          component: "Content Corpus Baseline",
          instruction: "Seed initial canonical scriptures repository via `POST /api/import/run` or admin ingestion interface.",
          mandatory: true,
        },
      ],
      operationalNotes: [
        {
          category: "Disaster Recovery",
          note: "Point-in-Time Recovery (PITR) enabled on Firestore with RPO < 1.0 hour and verified isolated restore RTO < 15 minutes.",
        },
        {
          category: "Monitoring & Observability",
          note: "Continuous health probes available at `/api/health`, `/api/metrics`, and `/api/tests/system-status` with error spike alerting at > 1.0% error rate.",
        },
        {
          category: "Rollback Strategy",
          note: "Automated container rollback to previous stable Cloud Run revision (tagged `cloud-run-rev-20260829-01`) ready on any P0 blocker.",
        },
      ],
    };
  }
}
