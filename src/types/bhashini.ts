/**
 * Bhashini NLTM / ULCA Localization & Voice Intelligence Type Definitions
 * Specification: Government of India / MeitY Bhashini Open Language Collection Architecture (ULCA)
 */

export type IndicLanguageCode =
  | "sa" // Sanskrit (संस्कृतम्)
  | "hi" // Hindi (हिन्दी)
  | "mr" // Marathi (मराठी)
  | "ta" // Tamil (தமிழ்)
  | "te" // Telugu (తెలుగు)
  | "kn" // Kannada (ಕನ್ನಡ)
  | "bn" // Bengali (বাংলা)
  | "gu" // Gujarati (ગુજરાતી)
  | "pa" // Punjabi (ਪੰਜਾਬੀ)
  | "ml" // Malayalam (മലയാളം)
  | "or" // Odia (ଓଡ଼ିଆ)
  | "as" // Assamese (অসমীয়া)
  | "ur" // Urdu (اردو)
  | "en"; // English

export type VoiceGender = "female" | "male";

export interface BhashiniCredentials {
  userId: string;
  udyatKey: string;
  inferenceKey: string;
  pipelineId?: string;
}

export interface BhashiniTTSRequest {
  /** The sacred text, shloka, or phrase to synthesize */
  text: string;
  /** Target Indic language code (ISO 639-1 / Bhashini standard). Default: 'sa' */
  sourceLanguage?: IndicLanguageCode | string;
  /** Desired voice gender. Default: 'female' */
  gender?: VoiceGender;
  /** Sampling rate in Hz. Default: 22050 (Indic-TTS standard) */
  samplingRate?: number;
  /** Recitation tempo / speed multiplier (0.50x to 1.50x). Default: 0.80x */
  pace?: number;
  /** Explicit model/service ID if known */
  serviceId?: string;
  /** Request timeout in milliseconds. Default: 15000 */
  timeoutMs?: number;
  /** Maximum retry attempts for transient 502/504 errors. Default: 3 */
  maxRetries?: number;
  /** Enable in-memory and browser caching. Default: true */
  enableCache?: boolean;
  /** Enable automatic fallback to backend or browser speech if unavailable. Default: true */
  failsafeFallback?: boolean;
  /** Unique verse or content identifier for cache indexing */
  verseId?: string;
}

export interface BhashiniTTSResponse {
  /** Base64-encoded audio byte string (RIFF WAV format) */
  audioContent: string;
  /** Browser Object URL (blob:...) ready for HTML5 <audio> / Web Audio API */
  audioUrl: string;
  /** Standard MIME type: audio/wav */
  mimeType: "audio/wav";
  /** Language synthesized */
  sourceLanguage: string;
  /** Gender chosen */
  gender: VoiceGender;
  /** Estimated or measured audio duration in milliseconds */
  durationMs: number;
  /** Character length of processed text */
  characterCount: number;
  /** Whether the audio result was served from cache */
  cached: boolean;
  /** Provider identifier: 'bhashini-live' | 'bhashini-cached' | 'bhashini-fallback' | 'browser-speech-fallback' */
  provider: "bhashini-live" | "bhashini-cached" | "bhashini-fallback" | "browser-speech-fallback";
  /** End-to-end request latency in milliseconds */
  latencyMs: number;
  /** Optional warning or fallback details */
  notice?: string;
}

export interface BhashiniErrorPayload {
  name: string;
  code: string | number;
  status?: number;
  message: string;
  details?: unknown;
  isRetryable: boolean;
  timestamp: number;
}

export interface UlcaPipelineTaskConfig {
  serviceId?: string;
  language: {
    sourceLanguage: string;
    targetLanguage?: string;
  };
  gender?: VoiceGender;
  samplingRate?: number;
  audioFormat?: "wav" | "mp3";
}

export interface UlcaPipelineTask {
  taskType: "tts" | "translation" | "asr";
  config: UlcaPipelineTaskConfig;
}

export interface UlcaPipelineComputePayload {
  pipelineTasks: UlcaPipelineTask[];
  inputData: {
    input: Array<{ source: string }>;
  };
}

export interface UlcaPipelineDiscoveryRequest {
  pipelineTasks: Array<{
    taskType: string;
    config: {
      language: {
        sourceLanguage: string;
        targetLanguage?: string;
      };
    };
  }>;
  pipelineRequestConfig?: {
    pipelineId: string;
  };
}

export interface UlcaPipelineDiscoveryResponse {
  pipelineResponseConfig?: Array<{
    taskType: string;
    config?: Array<{
      serviceId?: string;
      modelId?: string;
      name?: string;
    }>;
  }>;
  pipelineInferenceAPIEndPoint?: {
    callbackUrl?: string;
    inferenceApiKey?: {
      name?: string;
      value?: string;
    };
  };
}
