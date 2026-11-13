# ADR: Sanskrit TTS Provider Architecture

**Status:** IMPLEMENTED & PRODUCTION-CERTIFIED ✅  
**Date:** 2026-11-13 (Updated for v1.0.6 Server-Proxy Security & Compliance)  
**Context:** SutraSparsh Spiritual Wisdom Platform (Phases 26–32, v1.0.6)  
**Deciders:** Core Engineering, Voice Intelligence Lead & Sanskrit Linguistic Team

---

## 1. Context and Problem Statement

SutraSparsh requires high-quality, authentic vocal recitation for Sanskrit spiritual literature stored in Firestore (Shlokas, Mantras, Sutras, Stotras, and Chalisas). The generated audio must satisfy four core pillars:
1. **Pronunciation-first:** Strict adherence to classical Sanskrit phonetics (aspiration, retroflex distinction, accurate visarga, anusvāra, and saṃyoga/conjuncts).
2. **Reverent Devotional Cadence:** Unhurried pacing with appropriate metric pauses at half-verses (*Danda* `।`) and full verses (*Dvidanda* `॥`).
3. **Reproducibility & Auditability:** Every synthesized audio track must be deterministically linked to a hash of the canonical Sanskrit Devanagari text, audio profile, voice candidate, and synthesis parameters.
4. **Provider Independence & Resilient Failover:** The system must not lock SutraSparsh permanently into any single proprietary vendor and must seamlessly switch between providers without seeker disruption.

---

## 2. Decision: Bhashini ULCA Primary with Google Cloud Automatic Failover

We implemented India's National Language Translation Mission **Bhashini ULCA Indic-TTS** pipeline as the primary Sanskrit recitation engine, backed by an automated circuit-breaker failover to **Google Cloud Neural2** and local browser Web Audio synthesis:

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
       │ Primary:        │           │ Failsafe:       │
       │ Bhashini ULCA   │           │ Google Cloud    │
       │ Indic-TTS       │──Failover─▶│ Neural2 TTS     │
       │ (Saraswati/     │ (500/Net) │ (hi-IN-Neural2) │
       │  Vyasa 22kHz)   │           │                 │
       └────────┬────────┘           └────────┬────────┘
                │                             │
                └──────────────┬──────────────┘
                               ▼
           ┌────────────────────────────────────────┐
           │      Resilient Audio Player Guard      │
           │  * Audio source pre-flight validation  │
           │  * Binary RIFF/WAV header packaging    │
           │  * Deterministic URL.revokeObjectURL() │
           └───────────────────┬────────────────────┘
                               │
                               ▼
           ┌────────────────────────────────────────┐
           │   Browser Web Audio / HTMLMediaElement │
           └────────────────────────────────────────┘
```

### Key Tenets & Certified Architecture:
1. **Server-Proxy Bhashini ULCA Architecture (Zero Client Secrets):** All `BHASHINI_*` and Google Cloud credentials reside strictly server-side (`server.ts` / `src/api/routes/tts.routes.ts`). `src/services/bhashiniService.js` operates exclusively in server-proxy mode via `POST /api/tts/synthesize` (bounded to 1,000 characters), and `POST /api/tts/bhashini/config` restricts client updates to non-secret preferences (`defaultLanguage`, `defaultGender`, `pace`, `sampleRate`).
2. **Dual Sacred Voice Archetypes:**
   - **Devī Saraswatī (Female):** Meditative, clear female voice calibrated for devotional dhyāna.
   - **Sage Vyāsa (Male):** Deep, resonant, contemplative male voice with steady Vedic rhythm.
   - **Shloka Cadence Tuning:** Default shloka pace configured at `0.80x` (with `0.70x`, `0.90x`, `1.00x` options).
3. **Automated Google Cloud Failsafe:** Upon receiving upstream non-200 responses (HTTP 500/503), socket timeouts, or malformed data, the pipeline automatically routes the request to Google Cloud Neural2 (`hi-IN-Neural2-B` / `hi-IN-Neural2-C`), notifying the seeker via non-blocking toast notifications.
4. **Resilient Audio Player & Memory Lifecycle (`resilientAudioPlayer.js`):**
   - **Pre-flight Validation:** Rejects empty or corrupt sources before `new Audio()` creation to eliminate "no supported source found" errors.
   - **WAV Packaging:** Strictly validates payload bytes and appends 44-byte RIFF headers to raw PCM streams with `audio/wav` MIME typing.
   - **Deterministic Disposal:** Calls `URL.revokeObjectURL(activeUrl)` immediately on `ended` and `error` events to prevent browser memory leaks.
5. **Canonical Text Immutability & Privacy Compliance:** Canonical Sanskrit Devanagari remains unaltered in Firestore. `/privacy-policy` discloses transient Bhashini ULCA & Google Cloud TTS processing with zero biometric voiceprint retention, and `/terms` covers synthesized audio IP and acceptable use.
6. **Production Certification:** Verified 100% green across `test:bhashini` (27/27), `test:fallback` (21/21), `test:player` (29/29), and `test:compliance` (39/39).
