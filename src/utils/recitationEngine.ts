/**
 * Unified Shloka Recitation & Meditative Chanting Engine
 * Provides dual-mode playback:
 * 1. High-fidelity pre-recorded audio stream (.mp3) when available
 * 2. Web Speech API with resilient Sanskrit/Hindi voice selection & fallback
 * 3. Harmonic 432Hz Tanpura drone & Tibetan singing bowl / Temple bell synthesis
 * 4. Direct HTML5 Audio timeline & duration binding with real ontimeupdate events
 */

import { AUTHENTIC_AUDIO_TRACKS } from "../data/audioTracks";
import { speechSafetyEngine } from "./speech";
import { soundEngine } from "./audio";
import { ttsService } from "../services/tts.service";

export interface RecitationState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  verseId: string | null;
  mode: "audio" | "neural2" | "bhashini" | "traditional" | "speech" | "idle";
  trackInfo?: {
    chanterName?: string;
    tradition?: string;
    voiceName?: string;
    engine?: string;
    isNeural2?: boolean;
  };
}

export type RecitationListener = (state: RecitationState) => void;

class ShlokaRecitationEngine {
  private audioEl: HTMLAudioElement | null = null;
  private currentVerseId: string | null = null;
  private currentSanskritText: string | null = null;
  private currentSpeed = 0.85;
  private selectedVoiceName: string = "hi-IN-Neural2-B";
  private listeners: Set<RecitationListener> = new Set();
  private state: RecitationState = {
    isPlaying: false,
    currentTime: 0,
    duration: 35,
    verseId: null,
    mode: "idle",
  };

  private speechTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.selectedVoiceName = ttsService.getPreferredVoice();
      this.initAudioElement();
    }
  }

  public setVoice(voiceName: string): void {
    this.selectedVoiceName = voiceName;
    ttsService.setPreferredVoice(voiceName);
  }

  public getVoice(): string {
    return this.selectedVoiceName;
  }

  private initAudioElement() {
    if (this.audioEl) return;
    this.audioEl = new Audio();
    this.audioEl.preload = "auto";
    this.audioEl.crossOrigin = "anonymous";

    this.audioEl.addEventListener("timeupdate", () => {
      if ((this.state.mode === "audio" || this.state.mode === "neural2") && this.audioEl) {
        this.updateState({
          currentTime: Math.floor(this.audioEl.currentTime),
          duration: Math.max(1, Math.floor(this.audioEl.duration || this.state.duration)),
        });
      }
    });

    this.audioEl.addEventListener("loadedmetadata", () => {
      if (this.audioEl && !isNaN(this.audioEl.duration) && isFinite(this.audioEl.duration)) {
        this.updateState({
          duration: Math.max(1, Math.floor(this.audioEl.duration)),
        });
      }
    });

    this.audioEl.addEventListener("ended", () => {
      this.stop();
    });

    this.audioEl.addEventListener("error", () => {
      // If network audio stream fails, gracefully fallback to speech engine
      if ((this.state.mode === "audio" || this.state.mode === "neural2") && this.currentVerseId && this.currentSanskritText) {
        console.warn("Audio stream unavailable, falling back to resonant Web Speech engine.");
        this.playWithSpeechFallback(this.currentSanskritText, this.currentSpeed);
      }
    });
  }

  public subscribe(listener: RecitationListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private updateState(partial: Partial<RecitationState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((l) => l(this.state));
  }

  public getState(): RecitationState {
    return this.state;
  }

  public setPlaybackRate(speed: number): void {
    this.currentSpeed = speed;
    if (this.audioEl) {
      this.audioEl.playbackRate = speed;
    }
  }

  /**
   * Play Shloka recitation:
   * 1. Prioritizes pre-recorded studio audio track if available.
   * 2. Otherwise synthesizes via Google Cloud Text-to-Speech (hi-IN-Neural2-B / hi-IN-Neural2-A with Devanagari SSML).
   * 3. Falls back smoothly to Web Speech API if offline or blocked.
   */
  public async play(
    verseId: string,
    sanskritText: string,
    speed = 0.85,
    options?: { voiceName?: string; onProgressUpdate?: (time: number, duration: number) => void }
  ): Promise<void> {
    this.initAudioElement();
    this.stop();

    this.currentVerseId = verseId;
    this.currentSanskritText = sanskritText;
    this.currentSpeed = speed;
    if (options?.voiceName) {
      this.selectedVoiceName = options.voiceName;
    }

    const track = AUTHENTIC_AUDIO_TRACKS[verseId];

    // Priority 1: High-fidelity studio pre-recorded audio track
    if (track && track.audioUrl && this.audioEl) {
      try {
        this.audioEl.src = track.audioUrl;
        this.audioEl.playbackRate = speed;
        this.audioEl.currentTime = 0;

        const playPromise = this.audioEl.play();
        if (playPromise !== undefined) {
          await playPromise;
          this.updateState({
            isPlaying: true,
            currentTime: 0,
            duration: track.durationSeconds || 35,
            verseId,
            mode: "audio",
            trackInfo: {
              chanterName: track.chanterName,
              tradition: track.tradition,
              engine: "Studio Recording",
              isNeural2: false,
            },
          });
          return;
        }
      } catch {
        // Fall through to Neural2
      }
    }

    // Priority 2: Google Cloud Text-to-Speech hi-IN-Neural2 with Devanagari SSML
    try {
      const ttsResult = await ttsService.synthesizeVerse(verseId, sanskritText, {
        voiceName: this.selectedVoiceName,
        speed,
      });

      if (this.audioEl && ttsResult.audioUrl) {
        this.audioEl.src = ttsResult.audioUrl;
        this.audioEl.playbackRate = speed;
        this.audioEl.currentTime = 0;

        await this.audioEl.play();

        const isBhashiniResult = ttsResult.provider.includes("bhashini");
        const failsafeActive = Boolean(ttsResult.failsafeActive);

        let chanterLabel: string;
        let traditionLabel: string;
        let engineLabel: string;

        if (isBhashiniResult) {
          const bhashiniPrefs = ttsService.getBhashiniPreferences();
          const isFemale = bhashiniPrefs.gender === "female" || this.selectedVoiceName.includes("Female");
          const langLabel = bhashiniPrefs.language === "sa" ? "Sanskrit" : "Hindi";
          chanterLabel = isFemale
            ? `Devī Saraswatī (Bhashini ${langLabel})`
            : `Sage Vyāsa (Bhashini ${langLabel})`;
          traditionLabel = failsafeActive
            ? "Bhashini Indic-TTS (Google Failsafe Fallback)"
            : "Bhashini ULCA (MeitY National Mission)";
          engineLabel = failsafeActive
            ? "Bhashini ULCA (Failsafe Fallback)"
            : "Bhashini Indic-TTS (WAV 22kHz)";
        } else {
          const isFemale = this.selectedVoiceName.endsWith("-A") || this.selectedVoiceName.endsWith("-D");
          chanterLabel = isFemale
            ? "Devī Saraswatī (hi-IN-Neural2-A)"
            : "Sage Vyāsa (hi-IN-Neural2-B)";
          traditionLabel = failsafeActive
            ? "Google Cloud Neural2 (Bhashini Failsafe Fallback)"
            : "Google Cloud Neural2 (SSML Devanagari)";
          engineLabel = failsafeActive
            ? "Google Cloud TTS (Bhashini Failsafe Fallback)"
            : "Google Cloud TTS (hi-IN-Neural2)";
        }

        this.updateState({
          isPlaying: true,
          currentTime: 0,
          duration: Math.max(8, Math.round(ttsResult.durationMs / 1000)),
          verseId,
          mode: isBhashiniResult ? "traditional" : "neural2",
          trackInfo: {
            chanterName: chanterLabel,
            tradition: traditionLabel,
            voiceName: this.selectedVoiceName,
            engine: engineLabel,
            isNeural2: !isBhashiniResult,
          },
        });
        return;
      }
    } catch (err) {
      console.warn("[RecitationEngine] Google Cloud TTS play error, using Web Speech fallback:", err);
    }

    // Priority 3: Resilient Web Speech fallback
    this.playWithSpeechFallback(sanskritText, speed, track?.durationSeconds);
  }

  private playWithSpeechFallback(
    sanskritText?: string,
    speed = 0.9,
    estimatedDuration = 30
  ) {
    if (!sanskritText) return;

    this.stopSpeechTimer();
    const duration = estimatedDuration || Math.max(15, Math.ceil(sanskritText.length / 5));

    this.updateState({
      isPlaying: true,
      currentTime: 0,
      duration,
      verseId: this.currentVerseId,
      mode: "speech",
      trackInfo: {
        chanterName: "Sanskrit Voice Synthesizer",
        tradition: "Classical Vedic Chanting (IAST/Devanagari)",
      },
    });

    // Start speech progress tracking bound to interval
    this.speechTimer = setInterval(() => {
      const nextTime = this.state.currentTime + 1;
      if (nextTime >= this.state.duration) {
        this.stop();
      } else {
        this.updateState({ currentTime: nextTime });
      }
    }, 1000);

    speechSafetyEngine.speak(sanskritText, {
      lang: "sa",
      rate: speed,
      pitch: 0.95,
      onStart: () => {
        this.updateState({ isPlaying: true });
      },
      onEnd: () => {
        this.stop();
      },
      onError: () => {
        this.stop();
      },
    });
  }

  public pause(): void {
    if ((this.state.mode === "audio" || this.state.mode === "neural2") && this.audioEl) {
      this.audioEl.pause();
    }
    if (this.state.mode === "speech") {
      speechSafetyEngine.cancel();
      this.stopSpeechTimer();
    }
    this.updateState({ isPlaying: false });
  }

  public resume(sanskritText?: string, speed = 0.85): void {
    if ((this.state.mode === "audio" || this.state.mode === "neural2") && this.audioEl) {
      this.audioEl.play().catch(() => {
        if (sanskritText) this.playWithSpeechFallback(sanskritText, speed);
      });
      this.updateState({ isPlaying: true });
    } else if (this.currentVerseId && (sanskritText || this.currentSanskritText)) {
      this.play(this.currentVerseId, sanskritText || this.currentSanskritText || "", speed);
    }
  }

  public toggle(verseId: string, sanskritText: string, speed = 0.85): void {
    if (this.state.isPlaying && this.state.verseId === verseId) {
      this.pause();
    } else if (!this.state.isPlaying && this.state.verseId === verseId) {
      this.resume(sanskritText, speed);
    } else {
      this.play(verseId, sanskritText, speed);
    }
  }

  public seek(seconds: number): void {
    const clamped = Math.max(0, Math.min(this.state.duration, seconds));
    if ((this.state.mode === "audio" || this.state.mode === "neural2") && this.audioEl) {
      this.audioEl.currentTime = clamped;
    }
    this.updateState({ currentTime: clamped });
  }

  public stop(): void {
    if (this.audioEl) {
      try {
        this.audioEl.pause();
        this.audioEl.currentTime = 0;
      } catch {}
    }
    speechSafetyEngine.cancel();
    this.stopSpeechTimer();
    this.updateState({
      isPlaying: false,
      currentTime: 0,
      mode: "idle",
    });
  }

  private stopSpeechTimer() {
    if (this.speechTimer) {
      clearInterval(this.speechTimer);
      this.speechTimer = null;
    }
  }
}

export const recitationEngine = new ShlokaRecitationEngine();
