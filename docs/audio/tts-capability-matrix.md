# SutraSparsh — TTS Capability Matrix

This document is a living technical specification of Text-to-Speech voice families, language codes, control mechanisms, and their suitability for classical Sanskrit sacred literature.

---

## 1. Matrix Overview

| Capability | Chirp 3: HD (`hi-IN`) | Neural2 (`hi-IN`) | Journey (`hi-IN`) | Standard / Wavenet |
| :--- | :---: | :---: | :---: | :---: |
| **Language Support** | ✅ `hi-IN` Supported | ✅ `hi-IN` Supported | ⚠️ In preview / selected | ✅ `hi-IN` Supported |
| **Sanskrit Phonetic Accuracy** | 🟡 Benchmark Required | 🟡 Benchmark Required | 🟡 Benchmark Required | 🔴 Poor (flat cadence) |
| **Traditional SSML Support** | ⚠️ Restricted / Limited | ✅ Full SSML `<speak>` | ⚠️ Limited | ✅ Full SSML |
| **Danda Pause Strategy** | Dedicated Pause / Punctuation | SSML `<break time="..."/>` | Punctuation / Break | SSML `<break time="..."/>` |
| **Pace Control** | ✅ Dedicated Pace control | ✅ `speakingRate` (0.85–0.92) | ✅ `speakingRate` | ✅ `speakingRate` |
| **Pitch Tuning** | ⚠️ Native Model Controlled | ✅ Supported (semitones) | ⚠️ Automated | ✅ Supported |
| **Vedic / Devotional Cadence** | 🟢 High resonance potential | 🟡 Clear but synthetic | 🟢 Natural narrative flow | 🔴 Mechanical |
| **Shloka Suitability** | 🟢 Tier 1 Candidate | 🟡 Tier 2 Fallback | 🔴 Not recommended | 🔴 Inadmissible |
| **Mantra Suitability** | 🟢 Tier 1 Candidate | 🟡 Tier 2 Candidate | 🔴 Inadmissible | 🔴 Inadmissible |
| **Sutra Suitability** | 🟢 Tier 1 Candidate | 🟢 Highly intelligible | 🟡 Acceptable | 🔴 Inadmissible |
| **Scriptural Narration** | 🟢 Excellent | 🟡 Informational | 🟢 Ideal for storytelling | 🔴 Inadmissible |
| **Production Pilot Approval** | 🟡 Pending Benchmark QA | 🟡 Benchmark Control | 🟡 Narrative Only | 🔴 Disallowed |

---

## 2. Pause & Pacing Guidelines

### Classical Sanskrit Metric Pauses
1. **Single Danda (`।` - Ardha-shloka):**
   - *Neural2 / Standard:* `<break time="320ms"/>`
   - *Chirp 3: HD:* Punctuation marker with trailing whitespace + sentence pause control.
2. **Dvidanda (`॥` - Pūrṇa-shloka):**
   - *Neural2 / Standard:* `<break time="650ms"/>`
   - *Chirp 3: HD:* Paragraph break boundary with trailing contemplative pause.
3. **Avagraha (`ऽ` - Pluta / Sandhi elision):**
   - Must be preserved in Devanagari to inform vowel elongation and prevent unnatural glottal stops.

---

## 3. Human QA Acceptance Criteria

No voice configuration may be marked `APPROVED FOR PILOT` or `APPROVED FOR PRODUCTION` without satisfying:
- **Overall Score:** $\ge 4.0 / 5.0$
- **Pronunciation Score:** $\ge 4.0 / 5.0$
- **Zero Critical Phonetic Defects:**
  - Distinct aspiration on *Mahāprāṇa* consonants (`ख`, `घ`, `छ`, `झ`, `ठ`, `ढ`, `थ`, `ध`, `फ`, `भ`)
  - Strict distinction between dental (`त`, `थ`, `द`, `ध`, `न`) and retroflex (`ट`, `ठ`, `ड`, `ढ`, `ण`, `ष`)
  - Audibility and correct phonetic coloration of *Visarga* (`ः`)
  - Appropriate nasalization for *Anusvāra* (`ं`) before guttural/palatal/dental stops
