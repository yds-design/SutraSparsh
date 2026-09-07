/**
 * Automated Audio Output Validator
 *
 * Enforces technical and syntactic validation on synthesized audio
 * before human phonetic listening.
 */

import crypto from "crypto";
import { TtsSynthesisResponse } from "../types.js";

export interface AudioValidationReport {
  isValid: boolean;
  fileSizeBytes: number;
  durationMs: number;
  audioChecksum: string;
  checks: {
    hasValidBuffer: boolean;
    exceedsMinimumSize: boolean;
    hasValidAudioHeader: boolean;
    hasDuration: boolean;
    checksumMatches: boolean;
  };
  errors: string[];
}

export const MIN_VALID_AUDIO_BYTES = 512;

export function validateSynthesizedAudio(
  response: TtsSynthesisResponse
): AudioValidationReport {
  const errors: string[] = [];
  const buffer = response.audioBuffer;

  const hasValidBuffer = Buffer.isBuffer(buffer) && buffer.length > 0;
  if (!hasValidBuffer) {
    errors.push("Synthesized audio buffer is empty or not a valid Buffer.");
  }

  const exceedsMinimumSize = buffer.length >= MIN_VALID_AUDIO_BYTES;
  if (!exceedsMinimumSize) {
    errors.push(`Audio buffer size (${buffer.length} bytes) is below minimum threshold (${MIN_VALID_AUDIO_BYTES} bytes).`);
  }

  // Check for ID3v2 tag ("ID3") or MP3 Sync word (0xFF, 0xFB/0xF3/0xF2)
  let hasValidAudioHeader = false;
  if (buffer.length >= 4) {
    const isId3 = buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33;
    const isMp3Sync = buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0;
    hasValidAudioHeader = isId3 || isMp3Sync;
  }

  if (!hasValidAudioHeader) {
    errors.push("Audio buffer lacks valid MP3 frame sync word or ID3v2 container header.");
  }

  const hasDuration = response.durationMs > 500;
  if (!hasDuration) {
    errors.push(`Calculated audio duration (${response.durationMs}ms) is unnaturally brief.`);
  }

  const calculatedChecksum = crypto.createHash("sha256").update(buffer).digest("hex");
  const checksumMatches = calculatedChecksum === response.audioHash;
  if (!checksumMatches) {
    errors.push("Audio buffer SHA256 checksum does not match response metadata.");
  }

  return {
    isValid: errors.length === 0,
    fileSizeBytes: buffer.length,
    durationMs: response.durationMs,
    audioChecksum: calculatedChecksum,
    checks: {
      hasValidBuffer,
      exceedsMinimumSize,
      hasValidAudioHeader,
      hasDuration,
      checksumMatches,
    },
    errors,
  };
}
