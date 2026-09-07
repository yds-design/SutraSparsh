/**
 * SutraSparsh Sanskrit Audio Engine & TTS Subsystem - Core Types
 */

export type SanskritAudioProfile =
  | "shloka_recitation"
  | "mantra_recitation"
  | "sutra_recitation"
  | "stotra_recitation"
  | "chalisa_recitation"
  | "scripture_narration"
  | "meaning_narration"
  | "introduction";

export type AudioFormat = "mp3" | "wav" | "ogg";

export type AudioPublishStatus =
  | "draft"
  | "generated"
  | "automated_qa_passed"
  | "approved"
  | "rejected"
  | "published";

export type TtsProviderId =
  | "google-cloud-tts"
  | "aws-polly"
  | "azure-tts"
  | "elevenlabs"
  | "human_recording";

export type VoiceModelFamily =
  | "chirp-3-hd"
  | "neural2"
  | "journey"
  | "standard";

export interface TtsVoiceMetadata {
  id: string;
  name: string;
  languageCode: string;
  modelFamily: VoiceModelFamily;
  gender: "FEMALE" | "MALE" | "NEUTRAL";
  naturalSampleRateHertz: number;
  supportsSsml: boolean;
  supportsPaceControl: boolean;
  supportsPitchControl: boolean;
  supportedProfiles: SanskritAudioProfile[];
  isRecommended: boolean;
  description?: string;
}

export interface AudioProfileConfig {
  id: SanskritAudioProfile;
  name: string;
  description: string;
  recommendedPace: number;
  pauseStrategy: "danda" | "ssml_break" | "punctuation";
  dandaPauseMs: number;
  dvidandaPauseMs: number;
  preferredVoices: string[];
}

export interface TtsSynthesisRequest {
  canonicalText: string;
  profile: SanskritAudioProfile;
  voiceId: string;
  languageCode: string;
  pace?: number;
  pitch?: number;
  sampleRate?: number;
  format?: AudioFormat;
  pauseStrategy?: "danda" | "ssml_break" | "punctuation";
}

export interface TtsSynthesisResponse {
  audioBuffer: Buffer;
  durationMs: number;
  format: AudioFormat;
  sampleRate: number;
  inputHash: string;
  audioHash: string;
  characterCount: number;
  voiceId: string;
  provider: TtsProviderId;
  metadata: Record<string, unknown>;
}

export interface FirestoreAudioMetadata {
  status: AudioPublishStatus;
  provider: TtsProviderId;
  languageCode: string;
  voiceId: string;
  profile: SanskritAudioProfile;
  model: VoiceModelFamily;

  inputHash: string;
  audioHash: string;

  format: AudioFormat;
  sampleRate: number;
  durationMs: number;
  fileSizeBytes: number;

  storage: {
    bucket: string;
    path: string;
    publicUrl?: string;
  };

  tts: {
    inputMode: "text" | "ssml" | "pace_pause_controls";
    pauseStrategy: "danda" | "ssml_break" | "punctuation" | "none";
    speakingRate?: number;
    pace?: number;
    pitch?: number;
  };

  qa: {
    status: "pending" | "automated_passed" | "approved" | "rejected";
    pronunciationScore?: number;
    consonantsScore?: number;
    vowelLengthScore?: number;
    visargaScore?: number;
    anusvaraScore?: number;
    conjunctsScore?: number;
    pausePlacementScore?: number;
    naturalnessScore?: number;
    devotionalSuitabilityScore?: number;
    overallScore?: number;
    reviewedBy?: string;
    reviewedAt?: string;
    notes?: string;
  };

  generatedAt: string;
  version: number;
}

export interface TtsBenchmarkCase {
  id: string;
  category:
    | "basic"
    | "aspirated"
    | "retroflex"
    | "conjuncts"
    | "visarga"
    | "anusvara"
    | "long-compounds"
    | "verse-pauses"
    | "canonical-verse"
    | "devotional-passage";
  title: string;
  text: string;
  expectedFeatures: string[];
  description?: string;
}

export interface TtsBenchmarkResult {
  caseId: string;
  category: string;
  voiceId: string;
  modelFamily: VoiceModelFamily;
  durationMs: number;
  fileSizeBytes: number;
  audioHash: string;
  inputHash: string;
  automatedValid: boolean;
  validationErrors: string[];
  synthesizedAt: string;
}

export interface TtsCandidateScorecard {
  voiceId: string;
  languageCode: string;
  modelFamily: VoiceModelFamily;
  totalCasesTested: number;
  pronunciation: number;
  consonants: number;
  vowelLength: number;
  visarga: number;
  anusvara: number;
  conjuncts: number;
  compounds: number;
  pausePlacement: number;
  naturalness: number;
  devotionalSuitability: number;
  overall: number;
  passed: boolean;
  status: "APPROVED FOR PILOT" | "REJECTED" | "BENCHMARK_CONTROL";
  notes: string;
}

export interface TtsBudgetConfig {
  dailyCharacterLimit: number;
  monthlyCharacterLimit: number;
  currentDailyUsage: number;
  currentMonthlyUsage: number;
}
