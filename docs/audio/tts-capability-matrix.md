# SutraSparsh — TTS Capability Matrix

This document is a living technical specification of Text-to-Speech voice families, language codes, control mechanisms, and their suitability for classical Sanskrit sacred literature.

---

## 1. Matrix Overview

| Capability | Bhashini Indic-TTS (`sa` / `hi`) | Google Neural2 (`hi-IN`) | Google Chirp 3: HD (`hi-IN`) | Web Speech API Fallback |
| :--- | :---: | :---: | :---: | :---: |
| **Engine Role** | 🟢 **Primary Engine** | 🟡 **Automatic Failsafe** | ⚪ Benchmark Pilot | ⚪ Offline Baseline |
| **Language Support** | ✅ `sa` (Sanskrit) Native | ✅ `hi-IN` Supported | ✅ `hi-IN` Supported | ⚠️ Client OS Dependent |
| **Sanskrit Phonetic Accuracy** | 🟢 Exceptional (Indo-Aryan acoustic model) | 🟢 High (with phonetic SSML) | 🟡 Benchmark Required | 🔴 Variable / Flat |
| **Sacred Voice Archetypes** | ✅ Devī Saraswatī & Sage Vyāsa | ✅ hi-IN-Neural2-B / C | ⚠️ Generic Chirp voices | ⚠️ Default OS voices |
| **Traditional SSML Support** | ✅ Metric Danda Pauses & SSML | ✅ Full SSML `<speak>` | ⚠️ Restricted / Limited | 🔴 None |
| **Danda Pause Strategy** | Dynamic 320ms / 650ms pauses | SSML `<break time="..."/>` | Punctuation / Pause | Comma / Period pauses |
| **Pace Control** | ✅ 0.70x, 0.80x, 0.90x, 1.00x | ✅ `speakingRate` (0.80–0.92) | ✅ Dedicated Pace control | ✅ `rate` (0.8–1.0) |
| **Audio Format Packaging** | ✅ 22,050 Hz WAV (RIFF header) | ✅ MP3 / WAV 24,000 Hz | ✅ WAV 24,000 Hz | Native audio stream |
| **Memory Disposal** | ✅ Deterministic `revokeObjectURL` | ✅ Managed Blob disposal | ✅ Managed Blob disposal | Native GC |
| **Vedic / Devotional Cadence** | 🟢 Deeply resonant & devotional | 🟡 Clear but synthetic | 🟢 Natural narrative flow | 🔴 Mechanical |
| **Shloka Suitability** | 🟢 **Tier 1 (Certified)** | 🟢 **Tier 2 (Certified Failsafe)** | 🟡 Tier 3 Candidate | 🔴 Emergency Only |
| **Mantra Suitability** | 🟢 **Tier 1 (Certified)** | 🟢 **Tier 2 (Certified Failsafe)** | 🟡 Tier 3 Candidate | 🔴 Emergency Only |
| **Sutra Suitability** | 🟢 **Tier 1 (Certified)** | 🟢 Highly intelligible | 🟡 Acceptable | 🔴 Emergency Only |
| **Production Certification** | 🟢 **Certified Production** | 🟢 **Certified Failsafe** | 🟡 Benchmark Pilot | 🟢 Offline Fallback |

---

## 2. Pause & Pacing Guidelines

### Classical Sanskrit Metric Pauses
1. **Single Danda (`।` - Ardha-shloka):**
   - *Bhashini Indic-TTS:* Dynamic 320ms silence boundary.
   - *Neural2 / Standard:* `<break time="320ms"/>`
   - *Chirp 3: HD:* Punctuation marker with trailing whitespace + sentence pause control.
2. **Dvidanda (`॥` - Pūrṇa-shloka):**
   - *Bhashini Indic-TTS:* Dynamic 650ms full contemplative silence.
   - *Neural2 / Standard:* `<break time="650ms"/>`
   - *Chirp 3: HD:* Paragraph break boundary with trailing contemplative pause.
3. **Avagraha (`ऽ` - Pluta / Sandhi elision):**
   - Preserved in Devanagari to inform vowel elongation and prevent unnatural glottal stops.

---

## 3. Human & Automated QA Acceptance Criteria

No voice configuration may be marked `APPROVED FOR PRODUCTION` without satisfying:
- **Overall Score:** $\ge 4.5 / 5.0$
- **Pronunciation Score:** $\ge 4.5 / 5.0$
- **Zero Critical Phonetic Defects:**
  - Distinct aspiration on *Mahāprāṇa* consonants (`ख`, `घ`, `छ`, `झ`, `ठ`, `ढ`, `थ`, `ध`, `फ`, `भ`)
  - Strict distinction between dental (`त`, `थ`, `द`, `ध`, `न`) and retroflex (`ट`, `ठ`, `ड`, `ढ`, `ण`, `ष`)
  - Audibility and correct phonetic coloration of *Visarga* (`ः`)
  - Appropriate nasalization for *Anusvāra* (`ं`) before guttural/palatal/dental stops
- **Memory Safety:** Deterministic Blob URL revocation on `ended` and `error` events with zero memory leaks across 50 consecutive recitations.
