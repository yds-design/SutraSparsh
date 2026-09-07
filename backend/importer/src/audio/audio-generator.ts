/**
 * SutraSparsh Sanskrit Audio Generation Orchestrator
 *
 * Coordinates:
 * 1. Input hashing & deduplication
 * 2. Daily & monthly character budget guards
 * 3. Sanskrit Unicode preprocessing & Danda pause analysis
 * 4. Provider synthesis (Google Cloud TTS / Future Providers)
 * 5. Automated audio QA validation
 * 6. Deterministic Cloud Storage path creation
 * 7. Firestore Audio Metadata generation
 */

import crypto from "crypto";
import {
  FirestoreAudioMetadata,
  SanskritAudioProfile,
  TtsBudgetConfig,
  TtsProviderId,
} from "./types.js";
import { getTtsProvider } from "./providers/provider.js";
import { getAudioProfile } from "./profiles/shloka.js";
import { normalizeSanskritUnicode, validateDevanagari } from "./preprocess/unicode.js";
import { validateSynthesizedAudio } from "./qa/validator.js";

export interface GenerationRequest {
  contentId: string;
  canonicalText: string;
  profile: SanskritAudioProfile;
  providerId?: TtsProviderId;
  voiceId?: string;
  languageCode?: string;
  customPace?: number;
  bucketName?: string;
  version?: number;
}

export interface GenerationResult {
  metadata: FirestoreAudioMetadata;
  audioBuffer: Buffer;
  wasDeduplicated: boolean;
  characterCount: number;
}

export class SanskritAudioGenerator {
  private budget: TtsBudgetConfig;
  private existingHashStore: Map<string, FirestoreAudioMetadata> = new Map();

  constructor(
    dailyLimit = Number(process.env.TTS_DAILY_CHARACTER_LIMIT) || 100000,
    monthlyLimit = Number(process.env.TTS_MONTHLY_CHARACTER_LIMIT) || 2000000
  ) {
    this.budget = {
      dailyCharacterLimit: dailyLimit,
      monthlyCharacterLimit: monthlyLimit,
      currentDailyUsage: 0,
      currentMonthlyUsage: 0,
    };
  }

  getBudgetConfig(): TtsBudgetConfig {
    return { ...this.budget };
  }

  registerExistingAudioHash(metadata: FirestoreAudioMetadata): void {
    this.existingHashStore.set(metadata.inputHash, metadata);
  }

  /**
   * Generates production-ready audio and metadata for a sacred Sanskrit passage.
   */
  async generateAudio(request: GenerationRequest): Promise<GenerationResult> {
    const providerId: TtsProviderId = request.providerId || "google-cloud-tts";
    const provider = getTtsProvider(providerId);

    const profileConfig = getAudioProfile(request.profile);
    const voiceId = request.voiceId || profileConfig.preferredVoices[0] || "hi-IN-Chirp3-HD-Deva";
    const languageCode = request.languageCode || "hi-IN";
    const pace = request.customPace ?? profileConfig.recommendedPace;
    const version = request.version || 1;
    const bucket = request.bucketName || "sutrasparsh-sacred-audio";

    // 1. Unicode NFC Normalization & Validation
    const normalizedText = normalizeSanskritUnicode(request.canonicalText);
    const devanagariValidation = validateDevanagari(normalizedText);

    if (!devanagariValidation.isValid) {
      throw new Error(
        `Invalid Sanskrit input for contentId "${request.contentId}": Text must be authentic Devanagari (ratio: ${devanagariValidation.devanagariRatio}).`
      );
    }

    // 2. Compute Deduplication Hash: SHA256(canonicalText + provider + voice + profile + pace)
    const serializedForHash = [
      normalizedText,
      providerId,
      voiceId,
      request.profile,
      `pace=${pace.toFixed(2)}`,
    ].join("::");
    const inputHash = crypto.createHash("sha256").update(serializedForHash, "utf8").digest("hex");

    // Check deduplication cache
    const existing = this.existingHashStore.get(inputHash);
    if (existing && existing.status === "approved") {
      return {
        metadata: existing,
        audioBuffer: Buffer.alloc(0),
        wasDeduplicated: true,
        characterCount: normalizedText.length,
      };
    }

    // 3. Cost & Character Budget Protection Check
    const charCount = normalizedText.length;
    if (this.budget.currentDailyUsage + charCount > this.budget.dailyCharacterLimit) {
      throw new Error(
        `TTS Daily character budget exceeded! Attempted: ${charCount}, Used: ${this.budget.currentDailyUsage}, Limit: ${this.budget.dailyCharacterLimit}. Generation HALTED to prevent cloud billing overrun.`
      );
    }
    if (this.budget.currentMonthlyUsage + charCount > this.budget.monthlyCharacterLimit) {
      throw new Error(
        `TTS Monthly character budget exceeded! Attempted: ${charCount}, Used: ${this.budget.currentMonthlyUsage}, Limit: ${this.budget.monthlyCharacterLimit}. Generation HALTED to prevent cloud billing overrun.`
      );
    }

    // 4. Synthesize via Provider
    const synthesisResponse = await provider.synthesize({
      canonicalText: normalizedText,
      profile: request.profile,
      voiceId,
      languageCode,
      pace,
    });

    // Increment budget counters
    this.budget.currentDailyUsage += charCount;
    this.budget.currentMonthlyUsage += charCount;

    // 5. Automated Technical QA Gate
    const validation = validateSynthesizedAudio(synthesisResponse);
    if (!validation.isValid) {
      throw new Error(
        `Automated Audio QA Validation Failed: ${validation.errors.join("; ")}`
      );
    }

    // 6. Formulate Deterministic Storage Path
    // Naming convention: contentId/profile/provider/voice/version/audio.mp3
    const sanitizedVoice = voiceId.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    const storagePath = `audio/${request.contentId}/${request.profile}/${providerId}/${sanitizedVoice}/v${version}/audio.mp3`;

    // 7. Formulate Firestore Audio Metadata
    const audioMetadata: FirestoreAudioMetadata = {
      status: "automated_qa_passed",
      provider: providerId,
      languageCode,
      voiceId,
      profile: request.profile,
      model: voiceId.includes("Chirp") ? "chirp-3-hd" : "neural2",

      inputHash,
      audioHash: synthesisResponse.audioHash,

      format: "mp3",
      sampleRate: synthesisResponse.sampleRate,
      durationMs: synthesisResponse.durationMs,
      fileSizeBytes: synthesisResponse.audioBuffer.length,

      storage: {
        bucket,
        path: storagePath,
        publicUrl: `https://storage.googleapis.com/${bucket}/${storagePath}`,
      },

      tts: {
        inputMode: voiceId.includes("Chirp") ? "pace_pause_controls" : "ssml",
        pauseStrategy: profileConfig.pauseStrategy,
        pace,
      },

      qa: {
        status: "automated_passed",
        notes: "Automated QA checksum, container header, and duration tests passed. Awaiting human phonetic sign-off.",
      },

      generatedAt: new Date().toISOString(),
      version,
    };

    // Cache locally
    this.existingHashStore.set(inputHash, audioMetadata);

    return {
      metadata: audioMetadata,
      audioBuffer: synthesisResponse.audioBuffer,
      wasDeduplicated: false,
      characterCount: charCount,
    };
  }
}

export const defaultAudioGenerator = new SanskritAudioGenerator();
