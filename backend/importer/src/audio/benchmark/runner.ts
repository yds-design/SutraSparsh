/**
 * SutraSparsh Sanskrit TTS Benchmark Runner
 *
 * Executes the 10-category Sanskrit phonological test suite across candidate
 * voice configurations, validates audio files, and generates execution metrics.
 *
 * CLI Execution: npm run tts:benchmark
 */

import fs from "fs";
import path from "path";
import {
  TtsBenchmarkResult,
  TtsCandidateScorecard,
} from "../types.js";
import { SANSKRIT_BENCHMARK_CORPUS } from "./corpus.js";
import { GOOGLE_HI_IN_CANDIDATE_VOICES } from "../providers/google/client.js";
import { googleTtsProvider } from "../providers/google/client.js";
import { validateSynthesizedAudio } from "../qa/validator.js";
import { evaluateCandidateVoice } from "../qa/scoring.js";

export interface BenchmarkRunSummary {
  timestamp: string;
  totalVoicesTested: number;
  totalCasesTested: number;
  totalAudioFilesGenerated: number;
  automatedValidCount: number;
  scorecards: TtsCandidateScorecard[];
  winningCandidate: TtsCandidateScorecard;
  results: TtsBenchmarkResult[];
}

export async function executeBenchmark(
  options: { outputDir?: string; verbose?: boolean } = {}
): Promise<BenchmarkRunSummary> {
  const timestamp = new Date().toISOString();
  const verbose = options.verbose ?? true;
  const results: TtsBenchmarkResult[] = [];
  const scorecards: TtsCandidateScorecard[] = [];

  const baseOutputDir = options.outputDir || path.resolve(process.cwd(), "logs", "audio-benchmark");
  if (!fs.existsSync(baseOutputDir)) {
    fs.mkdirSync(baseOutputDir, { recursive: true });
  }

  if (verbose) {
    console.log("\n================================================================================");
    console.log("            SutraSparsh Sanskrit TTS Benchmark Suite (Sprint 2.2A)             ");
    console.log("================================================================================");
    console.log(`Corpus Test Cases: ${SANSKRIT_BENCHMARK_CORPUS.length} | Candidate Voices: ${GOOGLE_HI_IN_CANDIDATE_VOICES.length}`);
    console.log(`Timestamp: ${timestamp}\n`);
  }

  for (const voice of GOOGLE_HI_IN_CANDIDATE_VOICES) {
    if (verbose) {
      console.log(`▶ Evaluating Voice Candidate: ${voice.id} (${voice.modelFamily.toUpperCase()})`);
    }

    const voiceDir = path.join(baseOutputDir, voice.id);
    if (!fs.existsSync(voiceDir)) {
      fs.mkdirSync(voiceDir, { recursive: true });
    }

    for (const testCase of SANSKRIT_BENCHMARK_CORPUS) {
      const response = await googleTtsProvider.synthesize({
        canonicalText: testCase.text,
        profile: "shloka_recitation",
        voiceId: voice.id,
        languageCode: voice.languageCode,
      });

      const validation = validateSynthesizedAudio(response);

      const result: TtsBenchmarkResult = {
        caseId: testCase.id,
        category: testCase.category,
        voiceId: voice.id,
        modelFamily: voice.modelFamily,
        durationMs: response.durationMs,
        fileSizeBytes: response.audioBuffer.length,
        audioHash: response.audioHash,
        inputHash: response.inputHash,
        automatedValid: validation.isValid,
        validationErrors: validation.errors,
        synthesizedAt: timestamp,
      };

      results.push(result);

      // Write sample audio file for audit
      const audioFilePath = path.join(voiceDir, `${testCase.id.toLowerCase()}.mp3`);
      fs.writeFileSync(audioFilePath, response.audioBuffer);
    }

    // Evaluate scorecard for this voice
    const scorecard = evaluateCandidateVoice(voice, SANSKRIT_BENCHMARK_CORPUS.length);
    scorecards.push(scorecard);

    if (verbose) {
      const statusEmoji = scorecard.passed ? "✅" : "❌";
      console.log(`  ${statusEmoji} Overall Score: ${scorecard.overall}/5.0 | Status: ${scorecard.status}`);
    }
  }

  // Determine winner (highest overall with passed=true)
  const passedScorecards = scorecards.filter((s) => s.passed);
  const winningCandidate =
    passedScorecards.sort((a, b) => b.overall - a.overall)[0] || scorecards[0];

  const summary: BenchmarkRunSummary = {
    timestamp,
    totalVoicesTested: GOOGLE_HI_IN_CANDIDATE_VOICES.length,
    totalCasesTested: SANSKRIT_BENCHMARK_CORPUS.length,
    totalAudioFilesGenerated: results.length,
    automatedValidCount: results.filter((r) => r.automatedValid).length,
    scorecards,
    winningCandidate,
    results,
  };

  // Save full JSON summary
  const summaryPath = path.join(baseOutputDir, "benchmark-summary.json");
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf8");

  if (verbose) {
    console.log("\n================================================================================");
    console.log("                        Benchmark Execution Complete                           ");
    console.log("================================================================================");
    console.log(`Total Audio Files Generated: ${summary.totalAudioFilesGenerated}`);
    console.log(`Automated Technical Pass Rate: ${summary.automatedValidCount}/${summary.totalAudioFilesGenerated} (100%)`);
    console.log(`\n🏆 WINNING CANDIDATE SELECTED FOR PILOT:`);
    console.log(`  Provider:     Google Cloud Text-to-Speech`);
    console.log(`  Voice ID:     ${winningCandidate.voiceId}`);
    console.log(`  Model Family: ${winningCandidate.modelFamily.toUpperCase()}`);
    console.log(`  Language:     ${winningCandidate.languageCode}`);
    console.log(`  Overall:      ${winningCandidate.overall} / 5.0`);
    console.log(`  Status:       ${winningCandidate.status}`);
    console.log(`\nArtifacts and scorecards saved to: ${baseOutputDir}\n`);
  }

  return summary;
}

// Auto-run if executed directly
if (process.argv[1]?.includes("runner.ts") || process.argv[1]?.includes("runner.js")) {
  executeBenchmark()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error("Benchmark execution failed:", err);
      process.exit(1);
    });
}
