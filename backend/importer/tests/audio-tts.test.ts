/**
 * Automated Test Suite for SutraSparsh Sanskrit Audio Engine & TTS Subsystem
 *
 * Tests:
 * 1. Unicode NFC normalization & Devanagari validation
 * 2. Metric Danda & verse pause analysis
 * 3. SSML and capability-aware synthesis payload formulation
 * 4. Google candidate voice discovery and capability matrix
 * 5. Input hashing, deduplication & budget protection
 * 6. Automated audio validation & checksums
 * 7. Benchmark runner & QA scorecard evaluation
 */

import { describe, it, expect } from "vitest";
import {
  normalizeSanskritUnicode,
  validateDevanagari,
} from "../src/audio/preprocess/unicode.js";
import { analyzeVersePauses } from "../src/audio/preprocess/danda.js";
import { prepareSynthesisPayload } from "../src/audio/preprocess/ssml.js";
import { discoverGoogleVoices } from "../src/audio/providers/google/voices.js";
import { GOOGLE_HI_IN_CANDIDATE_VOICES } from "../src/audio/providers/google/client.js";
import { getAudioProfile } from "../src/audio/profiles/shloka.js";
import { SANSKRIT_BENCHMARK_CORPUS } from "../src/audio/benchmark/corpus.js";
import { evaluateCandidateVoice } from "../src/audio/qa/scoring.js";
import { validateSynthesizedAudio } from "../src/audio/qa/validator.js";
import { SanskritAudioGenerator } from "../src/audio/audio-generator.js";

describe("SutraSparsh Sanskrit Audio Engine (Sprint 2.2 / 2.2A)", () => {
  describe("1. Unicode NFC Normalization & Devanagari Validation", () => {
    it("normalizes Sanskrit text with canonical NFC composition", () => {
      const input = "धर्म\u094D\u0930"; // decomposition
      const normalized = normalizeSanskritUnicode(input);
      expect(normalized).toBe(input.normalize("NFC"));
    });

    it("converts keyboard ASCII pipes (| and ||) to sacred Danda (। and ॥)", () => {
      const raw = "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन| मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि||";
      const cleaned = normalizeSanskritUnicode(raw);
      expect(cleaned).toContain("।");
      expect(cleaned).toContain("॥");
      expect(cleaned).not.toContain("|");
    });

    it("strips null bytes and control characters while preserving Sanskrit punctuation", () => {
      const raw = "रामः\u0000 नमः\u0008 हरिः।";
      const cleaned = normalizeSanskritUnicode(raw);
      expect(cleaned).toBe("रामः नमः हरिः।");
    });

    it("validates authentic Devanagari script accurately", () => {
      const gitaVerse = "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥";
      const result = validateDevanagari(gitaVerse);
      expect(result.isValid).toBe(true);
      expect(result.devanagariRatio).toBeGreaterThan(0.9);
      expect(result.invalidCharacters.length).toBe(0);
    });

    it("rejects non-Devanagari text", () => {
      const englishText = "This is an English sentence pretending to be Sanskrit.";
      const result = validateDevanagari(englishText);
      expect(result.isValid).toBe(false);
      expect(result.devanagariRatio).toBe(0);
    });
  });

  describe("2. Metric Danda & Verse Pause Preprocessing", () => {
    it("deconstructs verses around Single Danda and Double Danda with metric pauses", () => {
      const verse = "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत। अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥";
      const analysis = analyzeVersePauses(verse, 350, 700);

      expect(analysis.dandaCount).toBe(1);
      expect(analysis.dvidandaCount).toBe(1);
      expect(analysis.segments.length).toBe(2);

      // Half-verse ending in Danda
      expect(analysis.segments[0].marker).toBe("danda");
      expect(analysis.segments[0].pauseAfterMs).toBe(350);
      expect(analysis.segments[0].text).toContain("यदा यदा हि धर्मस्य ग्लानिर्भवति भारत");

      // Full-verse ending in Dvidanda
      expect(analysis.segments[1].marker).toBe("dvidanda");
      expect(analysis.segments[1].pauseAfterMs).toBe(700);
      expect(analysis.segments[1].text).toContain("अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्");
    });
  });

  describe("3. Capability-Aware Synthesis Payload Generation", () => {
    const shlokaProfile = getAudioProfile("shloka_recitation");

    it("generates SSML with <break> and prosody for Neural2 voices", () => {
      const neuralVoice = GOOGLE_HI_IN_CANDIDATE_VOICES.find((v) => v.modelFamily === "neural2")!;
      const text = "धर्मः कर्म। योगः ज्ञानम्॥";

      const result = prepareSynthesisPayload(text, neuralVoice, shlokaProfile);
      expect(result.inputMode).toBe("ssml");
      expect(result.payload).toContain("<speak>");
      expect(result.payload).toContain("<prosody rate=");
      expect(result.payload).toContain("<break time=");
      expect(result.payload).toContain("</speak>");
    });

    it("generates punctuated text with dedicated pace for Chirp 3: HD voices without SSML", () => {
      const chirpVoice = GOOGLE_HI_IN_CANDIDATE_VOICES.find((v) => v.modelFamily === "chirp-3-hd")!;
      const text = "धर्मः कर्म। योगः ज्ञानम्॥";

      const result = prepareSynthesisPayload(text, chirpVoice, shlokaProfile);
      expect(result.inputMode).toBe("pace_pause_controls");
      expect(result.payload).not.toContain("<speak>");
      expect(result.payload).not.toContain("<break");
      expect(result.appliedPace).toBe(0.88);
    });
  });

  describe("4. Google Candidate Voice Discovery & Profiles", () => {
    it("discovers all candidate voices in the hi-IN locale", async () => {
      const voices = await discoverGoogleVoices("hi-IN");
      expect(voices.length).toBeGreaterThanOrEqual(10);

      const chirpVoices = voices.filter((v) => v.modelFamily === "chirp-3-hd");
      const neuralVoices = voices.filter((v) => v.modelFamily === "neural2");
      const journeyVoices = voices.filter((v) => v.modelFamily === "journey");

      expect(chirpVoices.length).toBeGreaterThanOrEqual(3);
      expect(neuralVoices.length).toBeGreaterThanOrEqual(3);
      expect(journeyVoices.length).toBeGreaterThanOrEqual(2);
    });

    it("identifies supported audio profiles per voice", () => {
      const devaVoice = GOOGLE_HI_IN_CANDIDATE_VOICES.find((v) => v.id === "hi-IN-Chirp3-HD-Deva")!;
      expect(devaVoice.supportedProfiles).toContain("shloka_recitation");
      expect(devaVoice.supportedProfiles).toContain("mantra_recitation");
      expect(devaVoice.supportedProfiles).toContain("sutra_recitation");
    });
  });

  describe("5. Deduplication, Hashing & Budget Guards", () => {
    it("calculates deterministic SHA256 input hash", async () => {
      const generator = new SanskritAudioGenerator();
      const text = "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥";

      const res1 = await generator.generateAudio({
        contentId: "gita-2-47",
        canonicalText: text,
        profile: "shloka_recitation",
      });

      expect(res1.metadata.inputHash).toBeDefined();
      expect(res1.metadata.inputHash.length).toBe(64); // SHA256 hex string

      // Mark as approved in cache
      res1.metadata.status = "approved";
      generator.registerExistingAudioHash(res1.metadata);

      // Second call must be deduplicated
      const res2 = await generator.generateAudio({
        contentId: "gita-2-47",
        canonicalText: text,
        profile: "shloka_recitation",
      });

      expect(res2.wasDeduplicated).toBe(true);
      expect(res2.metadata.inputHash).toBe(res1.metadata.inputHash);
    });

    it("enforces daily character budget limits to prevent cloud overrun", async () => {
      // Create generator with tiny daily limit of 50 characters
      const restrictedGenerator = new SanskritAudioGenerator(50, 100000);
      const text = "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥"; // ~80 chars

      await expect(
        restrictedGenerator.generateAudio({
          contentId: "gita-2-47",
          canonicalText: text,
          profile: "shloka_recitation",
        })
      ).rejects.toThrow(/TTS Daily character budget exceeded/);
    });
  });

  describe("6. Automated QA Validation", () => {
    it("validates synthesized audio buffer, checksum, and container headers", async () => {
      const generator = new SanskritAudioGenerator();
      const text = "ॐ शान्तिः शान्तिः शान्तिः॥";

      const result = await generator.generateAudio({
        contentId: "shanti-mantra",
        canonicalText: text,
        profile: "mantra_recitation",
      });

      expect(result.audioBuffer.length).toBeGreaterThan(1000);
      expect(result.metadata.audioHash).toBeDefined();
      expect(result.metadata.status).toBe("automated_qa_passed");
      expect(result.metadata.storage.path).toContain("audio/shanti-mantra/mantra_recitation/");
    });

    it("rejects invalid audio payloads during automated QA", () => {
      const invalidResponse = {
        audioBuffer: Buffer.from("not an audio file"),
        durationMs: 100,
        format: "mp3" as const,
        sampleRate: 24000,
        inputHash: "dummy-input",
        audioHash: "dummy-hash",
        characterCount: 10,
        voiceId: "test-voice",
        provider: "google-cloud-tts" as const,
        metadata: {},
      };

      const report = validateSynthesizedAudio(invalidResponse);
      expect(report.isValid).toBe(false);
      expect(report.errors.length).toBeGreaterThan(0);
    });
  });

  describe("7. Sanskrit Benchmark Corpus & QA Scoring", () => {
    it("contains all 10 phonological and liturgical benchmark test cases", () => {
      expect(SANSKRIT_BENCHMARK_CORPUS.length).toBe(10);
      const categories = SANSKRIT_BENCHMARK_CORPUS.map((c) => c.category);
      expect(categories).toContain("basic");
      expect(categories).toContain("aspirated");
      expect(categories).toContain("retroflex");
      expect(categories).toContain("conjuncts");
      expect(categories).toContain("visarga");
      expect(categories).toContain("anusvara");
      expect(categories).toContain("long-compounds");
      expect(categories).toContain("verse-pauses");
      expect(categories).toContain("canonical-verse");
      expect(categories).toContain("devotional-passage");
    });

    it("evaluates candidate voice scorecard against minimum acceptance criteria (overall >= 4.0)", () => {
      const devaVoice = GOOGLE_HI_IN_CANDIDATE_VOICES.find((v) => v.id === "hi-IN-Chirp3-HD-Deva")!;
      const scorecard = evaluateCandidateVoice(devaVoice, 10);

      expect(scorecard.passed).toBe(true);
      expect(scorecard.overall).toBeGreaterThanOrEqual(4.0);
      expect(scorecard.pronunciation).toBeGreaterThanOrEqual(4.0);
      expect(scorecard.status).toBe("APPROVED FOR PILOT");
    });

    it("rejects voice candidates with sub-par Sanskrit pronunciation or critical defects", () => {
      const rejectedVoice = GOOGLE_HI_IN_CANDIDATE_VOICES.find((v) => v.id === "hi-IN-Neural2-C")!;
      const scorecard = evaluateCandidateVoice(rejectedVoice, 10);

      expect(scorecard.passed).toBe(false);
      expect(scorecard.pronunciation).toBeLessThan(4.0);
      expect(scorecard.status).toBe("REJECTED");
    });
  });
});
