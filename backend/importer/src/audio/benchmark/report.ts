/**
 * SutraSparsh Sanskrit TTS Benchmark Report Generator
 *
 * Generates an executive comparison report and human QA scorecard table.
 *
 * CLI Execution: npm run tts:benchmark:report
 */

import { executeBenchmark, BenchmarkRunSummary } from "./runner.js";

export function generateConsoleReport(summary: BenchmarkRunSummary): void {
  console.log("\n==========================================================================================");
  console.log("                       SutraSparsh Sanskrit TTS Benchmark Report                          ");
  console.log("==========================================================================================");
  console.log(`Generated: ${summary.timestamp}`);
  console.log(`Total Voice Candidates Evaluated: ${summary.totalVoicesTested}`);
  console.log(`Total Corpus Samples Tested:      ${summary.totalCasesTested}`);
  console.log(`Automated Technical Pass:         ${summary.automatedValidCount}/${summary.totalAudioFilesGenerated}\n`);

  console.log(
    "Candidate Voice ID".padEnd(26) +
      "Family".padEnd(12) +
      "Pronun.".padEnd(9) +
      "Visarga".padEnd(9) +
      "Conjunct".padEnd(9) +
      "Pause".padEnd(8) +
      "Devotional".padEnd(12) +
      "Overall".padEnd(9) +
      "Status"
  );
  console.log("-".repeat(102));

  for (const score of summary.scorecards) {
    const isWinner = score.voiceId === summary.winningCandidate.voiceId ? "🏆 " : "   ";
    const voiceCol = `${isWinner}${score.voiceId}`.padEnd(26);
    const familyCol = score.modelFamily.padEnd(12);
    const pronCol = score.pronunciation.toFixed(1).padEnd(9);
    const visCol = score.visarga.toFixed(1).padEnd(9);
    const conjCol = score.conjuncts.toFixed(1).padEnd(9);
    const pauseCol = score.pausePlacement.toFixed(1).padEnd(8);
    const devCol = score.devotionalSuitability.toFixed(1).padEnd(12);
    const overCol = score.overall.toFixed(1).padEnd(9);
    const statusCol = score.status;

    console.log(
      `${voiceCol}${familyCol}${pronCol}${visCol}${conjCol}${pauseCol}${devCol}${overCol}${statusCol}`
    );
  }

  console.log("-".repeat(102));
  console.log("\nDECISION & SIGN-OFF:");
  console.log(`  Winning Candidate:  ${summary.winningCandidate.voiceId}`);
  console.log(`  Language Code:      ${summary.winningCandidate.languageCode}`);
  console.log(`  Model Family:       ${summary.winningCandidate.modelFamily.toUpperCase()}`);
  console.log(`  Linguistic Score:   ${summary.winningCandidate.pronunciation} / 5.0 (Min Required: 4.0)`);
  console.log(`  Overall Score:      ${summary.winningCandidate.overall} / 5.0 (Min Required: 4.0)`);
  console.log(`  Certified Status:   ${summary.winningCandidate.status}`);
  console.log(`  Linguistic Notes:   "${summary.winningCandidate.notes}"\n`);
}

// Auto-run if executed directly
if (process.argv[1]?.includes("report.ts") || process.argv[1]?.includes("report.js")) {
  executeBenchmark({ verbose: false })
    .then((summary) => {
      generateConsoleReport(summary);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Report generation failed:", err);
      process.exit(1);
    });
}
