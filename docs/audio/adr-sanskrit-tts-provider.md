# ADR: Sanskrit TTS Provider Architecture

**Status:** APPROVED FOR PILOT  
**Date:** 2026-09-07  
**Context:** SutraSparsh Spiritual Wisdom Platform (Sprint 2.2 / 2.2A)  
**Deciders:** Core Engineering & Sanskrit Linguistic Team

---

## 1. Context and Problem Statement

SutraSparsh requires high-quality, authentic vocal recitation for Sanskrit spiritual literature stored in Firestore (Shlokas, Mantras, Sutras, Stotras, and Chalisas). The generated audio must satisfy four core pillars:
1. **Pronunciation-first:** Strict adherence to classical Sanskrit phonetics (aspiration, retroflex distinction, accurate visarga, anusvāra, and saṃyoga/conjuncts).
2. **Reverent Devotional Cadence:** Unhurried pacing with appropriate metric pauses at half-verses (*Danda* `।`) and full verses (*Dvidanda* `॥`).
3. **Reproducibility & Auditability:** Every synthesized audio track must be deterministically linked to a hash of the canonical Sanskrit Devanagari text, audio profile, voice candidate, and synthesis parameters.
4. **Provider Independence:** The system must not lock SutraSparsh permanently into any single proprietary cloud vendor.

---

## 2. Decision: Benchmark-First Provider Abstraction

We will not hard-code Google Cloud Text-to-Speech or any single voice ID (such as `hi-IN-Chirp3-HD`) as permanently authoritative for Sanskrit. Instead, we establish a **Benchmark-First Architecture**:

```
           ┌────────────────────────────────────────┐
           │ Firestore Canonical Sanskrit Devanagari│
           └───────────────────┬────────────────────┘
                               │
                               ▼
           ┌────────────────────────────────────────┐
           │   Sanskrit Audio Preparation Engine    │
           │ (NFC Normalization, Danda Pauses, SSML)│
           └───────────────────┬────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
       ┌─────────────────┐           ┌─────────────────┐
       │ Google TTS      │           │ Future Providers│
       │ (Chirp3/Neural2)│           │ (Polly/Azure/11)│
       └────────┬────────┘           └────────┬────────┘
                │                             │
                └──────────────┬──────────────┘
                               ▼
           ┌────────────────────────────────────────┐
           │      Automated QA & Checksum Gate      │
           └───────────────────┬────────────────────┘
                               │
                               ▼
           ┌────────────────────────────────────────┐
           │      Human Sanskrit Linguistic QA      │
           └───────────────────┬────────────────────┘
                               │
                               ▼
           ┌────────────────────────────────────────┐
           │ Google Cloud Storage / Firebase Bucket │
           └───────────────────┬────────────────────┘
                               │
                               ▼
           ┌────────────────────────────────────────┐
           │ Firestore Audio Metadata & Content Link│
           └────────────────────────────────────────┘
```

### Key Tenets:
1. **Google Cloud TTS as Initial Provider:** We use Google Cloud Text-to-Speech using `hi-IN` voices as candidate starting points, treating Hindi-to-Sanskrit phonetic accuracy as a hypothesis to validate through controlled empirical benchmarks rather than an assumed guarantee.
2. **Candidate Voice Tiers:**
   - **Tier 1 (Chirp 3: HD):** Primary candidate for high-definition naturalness. Dedicated pace and pause controls are used instead of assuming traditional SSML support.
   - **Tier 2 (Neural2):** Fallback and benchmark control candidates with full standard SSML break and speaking-rate parameter paths.
   - **Tier 3 (Journey):** Evaluated for narrative and philosophical discourse (*Katha* / scripture commentary), but excluded from sacred mantra recitation.
3. **Canonical Text Immutability:** Canonical Sanskrit Devanagari remains unaltered in Firestore. Preprocessing generates synthesis payloads dynamically without corrupting sacred source scripture.
4. **Deduplication & Budget Guard:** A SHA-256 hash of `(canonicalText + provider + voice + profile + ttsParams)` acts as an idempotent cache key. If approved audio exists, no TTS API calls are made. Strict daily and monthly character limits prevent runaway cloud costs.
5. **No Blind Publishing:** API success merely proves audio was returned; it does not prove Sanskrit pronunciation is correct. Audio moves through `GENERATED` → `AUTOMATED_QA` → `HUMAN_QA` → `APPROVED` → `PUBLISHED`.
