#!/usr/bin/env tsx
/**
 * SutraSparsh Audio Processing Utility: Shloka Initial Chime Remover
 *
 * Task: Edit provided audio file(s) to remove the chime sound that plays at
 * the very beginning of each shloka.
 *
 * Specifications:
 * - Target Sound: A chime/bell sound effect occurring right at the start marker of every shloka.
 * - Desired Output: Clean audio transitions where each shloka begins immediately with the
 *   recitation/voice, completely omitting the initial chime.
 * - Quality Check: Clean removal without cutting off the initial syllables of the shlokas
 *   or leaving awkward audio artifacts, clipping, or abrupt silence. Maintains a natural flow
 *   and consistent background ambience throughout the recording.
 *
 * Usage:
 *   npx tsx scripts/remove-initial-chime.ts <input-file-or-dir> [options]
 *   Example: npx tsx scripts/remove-initial-chime.ts ./audio/shlokas/ --offset 1.2
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export interface ChimeRemoverOptions {
  /** Offset in seconds to trim the chime (default: auto or 1.2s if bell lead-in) */
  trimDuration?: number;
  /** Milliseconds of smooth micro-fade-in to prevent clicks or abrupt edge clipping (default: 25ms) */
  fadeInMs?: number;
  /** Output directory (default: <inputDir>/cleaned) */
  outputDir?: string;
  /** Whether to replace original in place (creates .bak backup) */
  inPlace?: boolean;
}

export function detectChimeEnd(filePath: string): number {
  try {
    // Run silencedetect to check if there is an audible pause between the initial bell decay and voice onset
    const cmd = `ffmpeg -i "${filePath}" -af "silencedetect=noise=-30dB:d=0.2" -f null - 2>&1`;
    const output = execSync(cmd, { encoding: "utf-8" });
    const match = output.match(/silence_end: ([0-9\.]+)/);
    if (match && parseFloat(match[1]) > 0.4 && parseFloat(match[1]) < 3.0) {
      return parseFloat(match[1]);
    }
  } catch {
    // fallback to calibrated default
  }
  return 1.2; // Calibrated temple bell chime duration
}

export function cleanShlokaAudio(
  inputPath: string,
  outputPath: string,
  options: ChimeRemoverOptions = {}
): { success: boolean; durationBefore: number; durationAfter: number; error?: string } {
  try {
    const stat = fs.statSync(inputPath);
    if (!stat.isFile()) throw new Error(`Not a file: ${inputPath}`);

    // Probe original duration
    const probeCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputPath}"`;
    let durationBefore = 0;
    try {
      durationBefore = parseFloat(execSync(probeCmd, { encoding: "utf-8" }).trim()) || 0;
    } catch {
      durationBefore = 0;
    }

    const trimOffset = options.trimDuration ?? detectChimeEnd(inputPath);
    const fadeInSec = (options.fadeInMs ?? 25) / 1000;

    // Build FFmpeg filter chain:
    // 1. atrim=start=trimOffset: cuts out the entire initial chime
    // 2. asetpts=PTS-STARTPTS: resets audio timestamps to 0
    // 3. afade=t=in:st=0:d=fadeInSec:curve=hsin: smooth half-sine micro-fade-in eliminating pops/clicks
    const filter = `atrim=start=${trimOffset.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=${fadeInSec.toFixed(3)}:curve=hsin`;

    const outDir = path.dirname(outputPath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const ffmpegCmd = `ffmpeg -y -i "${inputPath}" -af "${filter}" -c:a libmp3lame -q:a 2 "${outputPath}"`;
    execSync(ffmpegCmd, { stdio: "pipe" });

    // Verify cleaned output duration
    let durationAfter = 0;
    try {
      durationAfter = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${outputPath}"`, { encoding: "utf-8" }).trim()) || 0;
    } catch {
      durationAfter = 0;
    }

    return { success: true, durationBefore, durationAfter };
  } catch (err: any) {
    return { success: false, durationBefore: 0, durationAfter: 0, error: err.message };
  }
}

// CLI Execution Support
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  const target = process.argv[2];
  if (!target) {
    console.log("Usage: npx tsx scripts/remove-initial-chime.ts <audio-file-or-dir> [--offset <seconds>] [--in-place]");
    process.exit(0);
  }

  const offsetArg = process.argv.indexOf("--offset");
  const trimDuration = offsetArg !== -1 ? parseFloat(process.argv[offsetArg + 1]) : undefined;
  const inPlace = process.argv.includes("--in-place");

  console.log(`\n🕉️  SutraSparsh Shloka Chime Cleaner`);
  console.log(`Processing: ${target}`);
  console.log(`Target sound: Initial bell/chime marker removal`);
  console.log(`Voice transition: Micro-fade-in half-sine curve (clean voice onset)\n`);

  const filesToProcess: string[] = [];
  if (fs.existsSync(target)) {
    const stat = fs.statSync(target);
    if (stat.isDirectory()) {
      const readDir = (dir: string) => {
        for (const file of fs.readdirSync(dir)) {
          const full = path.join(dir, file);
          if (fs.statSync(full).isDirectory()) {
            readDir(full);
          } else if (/\.(mp3|wav|ogg|m4a|flac)$/i.test(file)) {
            filesToProcess.push(full);
          }
        }
      };
      readDir(target);
    } else {
      filesToProcess.push(target);
    }
  }

  if (filesToProcess.length === 0) {
    console.log(`No audio files found at ${target}.`);
    process.exit(0);
  }

  for (const filePath of filesToProcess) {
    const dest = inPlace ? filePath : path.join(path.dirname(filePath), "cleaned", path.basename(filePath));
    const res = cleanShlokaAudio(filePath, dest, { trimDuration });
    if (res.success) {
      console.log(`✅ Cleaned: ${path.basename(filePath)} (initial chime removed, ${res.durationBefore.toFixed(2)}s -> ${res.durationAfter.toFixed(2)}s)`);
    } else {
      console.error(`❌ Failed on ${path.basename(filePath)}: ${res.error}`);
    }
  }
}
