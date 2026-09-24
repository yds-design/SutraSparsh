/**
 * Client-Side Text-to-Speech Service
 *
 * Supports Bhashini ULCA Indic-TTS (Government of India / MeitY - Sanskrit & Hindi)
 * and Google Cloud Text-to-Speech (Neural2 / Devanagari SSML).
 *
 * Implements client-side persistent audio caching (localStorage/memory),
 * automatic base64-to-blob audio URL generation, and export/download support.
 */

export type TtsProviderType = "bhashini" | "google";

export interface SynthesizeAudioResult {
  audioUrl: string;
  durationMs: number;
  voiceName: string;
  ssml?: string;
  characterCount: number;
  cached: boolean;
  provider: string;
  mimeType: "audio/wav" | "audio/mp3";
  failsafeActive?: boolean;
  failsafeFrom?: string;
  failsafeTo?: string;
  failsafeReason?: string;
}

export interface TtsVoiceOption {
  id: string;
  name: string;
  provider: TtsProviderType;
  gender: "MALE" | "FEMALE";
  languageCode: string;
  chantingTone: string;
  description: string;
  isRecommended: boolean;
}

export interface ProviderAvailabilityInfo {
  providerId: "bhashini" | "google";
  name: string;
  displayName: string;
  status: "operational" | "degraded" | "offline";
  statusLabel: string;
  statusDescription: string;
  color: "emerald" | "amber" | "rose";
  avgLatencyMs: number;
  successRate: number; // 0 - 100
  totalRequests: number;
  consecutiveSuccesses: number;
  consecutiveFailures: number;
  lastChecked: number;
  lastResponseStatus: number;
  recentPatterns: Array<{
    timestamp: number;
    success: boolean;
    latencyMs: number;
    isFallback: boolean;
  }>;
}

export interface TtsAvailabilityData {
  timestamp: number;
  overallStatus: "operational" | "degraded" | "offline";
  providers: {
    bhashini: ProviderAvailabilityInfo;
    google: ProviderAvailabilityInfo;
  };
}

const STORAGE_CACHE_PREFIX = "sutrasparsh_tts_audio_v2_";
const ACTIVE_PROVIDER_STORAGE_KEY = "sutrasparsh_active_tts_provider";
const ACTIVE_VOICE_STORAGE_KEY = "sutrasparsh_active_neural2_voice";
const BHASHINI_LANGUAGE_KEY = "sutrasparsh_bhashini_language";
const BHASHINI_GENDER_KEY = "sutrasparsh_bhashini_gender";
const BHASHINI_PACE_KEY = "sutrasparsh_bhashini_pace";
const BHASHINI_USER_ID_KEY = "sutrasparsh_bhashini_user_id";
const BHASHINI_API_KEY = "sutrasparsh_bhashini_api_key";
const BHASHINI_INFERENCE_KEY = "sutrasparsh_bhashini_inference_key";
const BHASHINI_PIPELINE_ID_KEY = "sutrasparsh_bhashini_pipeline_id";

export class TtsService {
  private static instance: TtsService;
  private blobUrlCache: Map<string, string> = new Map();

  public static getInstance(): TtsService {
    if (!TtsService.instance) {
      TtsService.instance = new TtsService();
    }
    return TtsService.instance;
  }

  /**
   * Gets the active TTS provider.
   * Default: "bhashini" as requested, or user's saved preference.
   */
  public getActiveProvider(): TtsProviderType {
    if (typeof window === "undefined") return "bhashini";
    try {
      const stored = localStorage.getItem(ACTIVE_PROVIDER_STORAGE_KEY);
      if (stored === "google" || stored === "bhashini") {
        return stored;
      }
      return "bhashini";
    } catch {
      return "bhashini";
    }
  }

  /**
   * Sets the active TTS provider.
   */
  public setActiveProvider(provider: TtsProviderType): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(ACTIVE_PROVIDER_STORAGE_KEY, provider);
      window.dispatchEvent(new CustomEvent("sutrasparsh:tts_provider_changed", { detail: provider }));
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Gets user's preferred Neural2 voice for Google Cloud TTS.
   */
  public getPreferredVoice(): string {
    if (typeof window === "undefined") return "hi-IN-Neural2-B";
    try {
      return localStorage.getItem(ACTIVE_VOICE_STORAGE_KEY) || "hi-IN-Neural2-B";
    } catch {
      return "hi-IN-Neural2-B";
    }
  }

  /**
   * Saves user's preferred Neural2 voice.
   */
  public setPreferredVoice(voiceId: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(ACTIVE_VOICE_STORAGE_KEY, voiceId);
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Gets Bhashini configuration preferences.
   */
  public getBhashiniPreferences() {
    if (typeof window === "undefined") {
      return {
        language: "sa" as "sa" | "hi",
        gender: "female" as "female" | "male",
        pace: 0.80,
        userId: "89125c11d7c54f38b3428cce7114effe",
        apiKey: "",
        inferenceKey: "",
        pipelineId: "64392f96daac500b55c543d6",
      };
    }

    try {
      return {
        language: (localStorage.getItem(BHASHINI_LANGUAGE_KEY) as "sa" | "hi") || "sa",
        gender: (localStorage.getItem(BHASHINI_GENDER_KEY) as "female" | "male") || "female",
        pace: parseFloat(localStorage.getItem(BHASHINI_PACE_KEY) || "0.80"),
        userId: localStorage.getItem(BHASHINI_USER_ID_KEY) || (import.meta as any).env?.VITE_BHASHINI_USER_ID || "89125c11d7c54f38b3428cce7114effe",
        apiKey: localStorage.getItem(BHASHINI_API_KEY) || (import.meta as any).env?.VITE_BHASHINI_API_KEY || "",
        inferenceKey: localStorage.getItem(BHASHINI_INFERENCE_KEY) || (import.meta as any).env?.VITE_BHASHINI_INFERENCE_KEY || "",
        pipelineId: localStorage.getItem(BHASHINI_PIPELINE_ID_KEY) || (import.meta as any).env?.VITE_BHASHINI_PIPELINE_ID || "64392f96daac500b55c543d6",
      };
    } catch {
      return {
        language: "sa" as "sa" | "hi",
        gender: "female" as "female" | "male",
        pace: 0.80,
        userId: "89125c11d7c54f38b3428cce7114effe",
        apiKey: "",
        inferenceKey: "",
        pipelineId: "64392f96daac500b55c543d6",
      };
    }
  }

  /**
   * Sets Bhashini configuration preferences.
   */
  public setBhashiniPreferences(prefs: {
    language?: "sa" | "hi";
    gender?: "female" | "male";
    pace?: number;
    userId?: string;
    apiKey?: string;
    inferenceKey?: string;
    pipelineId?: string;
  }): void {
    if (typeof window === "undefined") return;
    try {
      if (prefs.language) localStorage.setItem(BHASHINI_LANGUAGE_KEY, prefs.language);
      if (prefs.gender) localStorage.setItem(BHASHINI_GENDER_KEY, prefs.gender);
      if (typeof prefs.pace === "number") localStorage.setItem(BHASHINI_PACE_KEY, prefs.pace.toString());
      if (prefs.userId !== undefined) localStorage.setItem(BHASHINI_USER_ID_KEY, prefs.userId);
      if (prefs.apiKey !== undefined) localStorage.setItem(BHASHINI_API_KEY, prefs.apiKey);
      if (prefs.inferenceKey !== undefined) localStorage.setItem(BHASHINI_INFERENCE_KEY, prefs.inferenceKey);
      if (prefs.pipelineId !== undefined) localStorage.setItem(BHASHINI_PIPELINE_ID_KEY, prefs.pipelineId);

      window.dispatchEvent(new CustomEvent("sutrasparsh:bhashini_prefs_changed"));
    } catch {
      // Ignore
    }
  }

  /**
   * Fetches synthesized audio for a Sanskrit verse via the active provider.
   * Leverages client-side storage cache to eliminate duplicate API requests.
   */
  public async synthesizeVerse(
    verseId: string,
    sanskritText: string,
    options: {
      provider?: TtsProviderType;
      voiceName?: string;
      speed?: number;
      pitch?: string;
      language?: "sa" | "hi";
      gender?: "female" | "male";
    } = {}
  ): Promise<SynthesizeAudioResult> {
    const activeProvider = options.provider || this.getActiveProvider();
    const bhashiniPrefs = this.getBhashiniPreferences();

    const speed = options.speed ?? (activeProvider === "bhashini" ? bhashiniPrefs.pace : 0.85);
    const language = options.language || bhashiniPrefs.language;
    const gender = options.gender || bhashiniPrefs.gender;
    const voiceName = options.voiceName || (
      activeProvider === "bhashini"
        ? `${language}-IN-Bhashini-${gender === "female" ? "Female" : "Male"}`
        : this.getPreferredVoice()
    );

    const cacheKey = `${STORAGE_CACHE_PREFIX}${activeProvider}_${verseId}_${voiceName}_${speed.toFixed(2)}`;

    // Check memory blob cache first
    const existingBlobUrl = this.blobUrlCache.get(cacheKey);
    if (existingBlobUrl) {
      return {
        audioUrl: existingBlobUrl,
        durationMs: 15000,
        voiceName,
        characterCount: sanskritText.length,
        cached: true,
        provider: `${activeProvider}-blob-cache`,
        mimeType: activeProvider === "bhashini" ? "audio/wav" : "audio/mp3",
      };
    }

    // Check localStorage cache
    if (typeof window !== "undefined") {
      try {
        const cachedRaw = localStorage.getItem(cacheKey);
        if (cachedRaw) {
          const parsed = JSON.parse(cachedRaw);
          if (parsed.audioBase64) {
            const blobUrl = this.base64ToBlobUrl(parsed.audioBase64, parsed.mimeType || (activeProvider === "bhashini" ? "audio/wav" : "audio/mp3"));
            this.blobUrlCache.set(cacheKey, blobUrl);
            return {
              audioUrl: blobUrl,
              durationMs: parsed.durationMs || 15000,
              voiceName: parsed.voiceName || voiceName,
              ssml: parsed.ssml,
              characterCount: parsed.characterCount || sanskritText.length,
              cached: true,
              provider: parsed.provider || `${activeProvider}-cache`,
              mimeType: parsed.mimeType || (activeProvider === "bhashini" ? "audio/wav" : "audio/mp3"),
            };
          }
        }
      } catch {
        // Fall through to API
      }
    }

    // Call backend API /api/tts/synthesize with automatic client-side failsafe
    let payload: any = null;

    try {
      const response = await fetch("/api/tts/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sanskritText,
          verseId,
          provider: activeProvider,
          voiceName,
          speed,
          pitch: options.pitch,
          language,
          gender,
        }),
      });

      if (response.ok) {
        payload = await response.json();
      } else {
        throw new Error(`Server returned status ${response.status}`);
      }
    } catch (primaryErr: any) {
      // If primary provider was Bhashini and request failed, trigger seamless client-side failsafe to Google TTS
      if (activeProvider === "bhashini") {
        console.warn(`[TtsService] Bhashini request failed (${primaryErr?.message || primaryErr}). Seamlessly switching to Google Cloud TTS failsafe.`);
        try {
          const fallbackResponse = await fetch("/api/tts/synthesize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: sanskritText,
              verseId,
              provider: "google",
              voiceName: "hi-IN-Neural2-B",
              speed,
            }),
          });

          if (fallbackResponse.ok) {
            payload = await fallbackResponse.json();
            if (payload?.data) {
              payload.data.failsafeActive = true;
              payload.data.failsafeFrom = "bhashini";
              payload.data.failsafeTo = "google";
              payload.data.failsafeReason = primaryErr?.message || "Bhashini connection issue";
            }
          }
        } catch (fallbackErr: any) {
          console.error("[TtsService] Both TTS endpoints failed:", fallbackErr);
        }
      }

      if (!payload) {
        throw primaryErr;
      }
    }

    if (!payload?.success || !payload?.data?.audioBase64) {
      throw new Error("Invalid TTS synthesis response from server.");
    }

    const data = payload.data;
    const mimeType = (data.mimeType as "audio/wav" | "audio/mp3") || (data.provider?.includes("bhashini") ? "audio/wav" : "audio/mp3");
    const blobUrl = this.base64ToBlobUrl(data.audioBase64, mimeType);
    this.blobUrlCache.set(cacheKey, blobUrl);

    // If failsafe was activated, dispatch notification event for UI
    if (data.failsafeActive && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("sutrasparsh:tts_fallback_triggered", {
          detail: {
            from: data.failsafeFrom || "bhashini",
            to: data.failsafeTo || "google",
            reason: data.failsafeReason || "Synthesis engine fallback",
            verseId,
          },
        })
      );
    }

    // Save to local storage cache if within storage limits
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            audioBase64: data.audioBase64,
            mimeType,
            durationMs: data.durationMs,
            voiceName: data.voiceName,
            ssml: data.ssml,
            characterCount: data.characterCount,
            provider: data.provider,
            failsafeActive: data.failsafeActive,
          })
        );
      } catch {
        // LocalStorage may be full; graceful fallback to memory blob cache
      }
    }

    return {
      audioUrl: blobUrl,
      durationMs: data.durationMs,
      voiceName: data.voiceName,
      ssml: data.ssml,
      characterCount: data.characterCount,
      cached: Boolean(data.cached),
      provider: data.provider,
      mimeType,
      failsafeActive: Boolean(data.failsafeActive),
      failsafeFrom: data.failsafeFrom,
      failsafeTo: data.failsafeTo,
      failsafeReason: data.failsafeReason,
    };
  }

  /**
   * Performs an end-to-end diagnostic test on the TTS service and failsafe fallback.
   */
  public async testTts(
    provider: TtsProviderType | "failsafe" = "bhashini",
    simulateFailure?: "bhashini" | "google"
  ): Promise<{
    success: boolean;
    message: string;
    data?: {
      latencyMs: number;
      audioSizeKB: number;
      mimeType: string;
      durationMs: number;
      provider: string;
      failsafeTriggered: boolean;
      fallbackInfo?: { from: string; to: string; reason: string };
      audioUrl?: string;
    };
  }> {
    const res = await fetch("/api/tts/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, simulateFailure }),
    });

    const json = await res.json();
    if (!json.success || !json.data?.audioBase64) {
      return {
        success: false,
        message: json.message || "TTS test failed",
      };
    }

    const audioUrl = this.base64ToBlobUrl(json.data.audioBase64, json.data.mimeType || "audio/wav");
    return {
      success: true,
      message: json.message,
      data: {
        ...json.data,
        audioUrl,
      },
    };
  }

  /**
   * Fetches real-time availability status for both Bhashini and Google Cloud TTS
   * based on recent API response patterns and latencies.
   */
  public async getAvailability(): Promise<TtsAvailabilityData | null> {
    try {
      const res = await fetch("/api/tts/availability");
      if (res.ok) {
        const json = await res.json();
        return json.data as TtsAvailabilityData;
      }
    } catch {
      // Fallback
    }
    return null;
  }

  /**
   * Triggers an active health probe on both TTS engines and notifies listeners.
   */
  public async probeProviders(): Promise<TtsAvailabilityData | null> {
    try {
      const res = await fetch("/api/tts/probe", { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        const availability = json.data?.availability as TtsAvailabilityData;
        if (availability) {
          window.dispatchEvent(
            new CustomEvent("sutrasparsh:tts_availability_updated", {
              detail: availability,
            })
          );
        }
        return availability;
      }
    } catch {
      // Ignore
    }
    return null;
  }

  /**
   * Fetches current health and configuration status of both TTS engines.
   */
  public async getHealth(): Promise<any> {
    try {
      const res = await fetch("/api/tts/health");
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Fallback
    }
    return {
      status: "degraded",
      activeProvider: this.getActiveProvider(),
      failsafeReady: true,
    };
  }

  /**
   * Triggers browser download of the synthesized Sanskrit audio buffer.
   */
  public async downloadVerseAudio(
    verseId: string,
    sanskritText: string,
    filename?: string,
    voiceName?: string
  ): Promise<void> {
    const result = await this.synthesizeVerse(verseId, sanskritText, { voiceName });
    const ext = result.mimeType === "audio/wav" ? "wav" : "mp3";
    const link = document.createElement("a");
    link.href = result.audioUrl;
    link.download = filename || `SutraSparsh_${verseId}_${result.voiceName}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Helper: converts base64 string to a persistent browser Blob Object URL.
   */
  private base64ToBlobUrl(base64: string, mimeType = "audio/wav"): string {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    return URL.createObjectURL(blob);
  }
}

export const ttsService = TtsService.getInstance();
