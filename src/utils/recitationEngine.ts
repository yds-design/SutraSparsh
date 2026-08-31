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

export interface RecitationState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  verseId: string | null;
  mode: "audio" | "speech" | "idle";
  trackInfo?: {
    chanterName?: string;
    tradition?: string;
  };
}

export type RecitationListener = (state: RecitationState) => void;

class ShlokaRecitationEngine {
  private audioEl: HTMLAudioElement | null = null;
  private currentVerseId: string | null = null;
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
      this.initAudioElement();
    }
  }

  private initAudioElement() {
    if (this.audioEl) return;
    this.audioEl = new Audio();
    this.audioEl.preload = "auto";
    this.audioEl.crossOrigin = "anonymous";

    this.audioEl.addEventListener("timeupdate", () => {
      if (this.state.mode === "audio" && this.audioEl) {
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
      soundEngine.playTempleBell(220); // Gentle closing bell chime
    });

    this.audioEl.addEventListener("error", () => {
      // If network audio stream fails, gracefully fallback to speech engine
      if (this.state.mode === "audio" && this.currentVerseId) {
        console.warn("Audio stream unavailable, falling back to resonant Speech engine.");
        this.playWithSpeechFallback();
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

  /**
   * Play Shloka recitation:
   * Prioritizes high-fidelity pre-recorded audio stream if available.
   * If not available or playback fails, uses resilient Sanskrit Web Speech.
   */
  public play(
    verseId: string,
    sanskritText: string,
    speed = 1.0,
    options?: { onProgressUpdate?: (time: number, duration: number) => void }
  ): void {
    this.initAudioElement();
    this.stop();

    this.currentVerseId = verseId;
    const track = AUTHENTIC_AUDIO_TRACKS[verseId];

    if (track && track.audioUrl && this.audioEl) {
      try {
        this.audioEl.src = track.audioUrl;
        this.audioEl.playbackRate = speed;
        this.audioEl.currentTime = 0;

        const playPromise = this.audioEl.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.updateState({
                isPlaying: true,
                currentTime: 0,
                duration: track.durationSeconds || 35,
                verseId,
                mode: "audio",
                trackInfo: {
                  chanterName: track.chanterName,
                  tradition: track.tradition,
                },
              });
            })
            .catch(() => {
              // Auto-play was prevented by browser policy or network issue, fallback to speech
              this.playWithSpeechFallback(sanskritText, speed, track?.durationSeconds);
            });
          return;
        }
      } catch (err) {
        // Fallback
      }
    }

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
        soundEngine.playTempleBell(220);
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
        soundEngine.playTempleBell(220);
      },
      onError: () => {
        this.stop();
      },
    });
  }

  public pause(): void {
    if (this.state.mode === "audio" && this.audioEl) {
      this.audioEl.pause();
    }
    if (this.state.mode === "speech") {
      speechSafetyEngine.cancel();
      this.stopSpeechTimer();
    }
    this.updateState({ isPlaying: false });
  }

  public resume(sanskritText?: string, speed = 1.0): void {
    if (this.state.mode === "audio" && this.audioEl) {
      this.audioEl.play().catch(() => {
        if (sanskritText) this.playWithSpeechFallback(sanskritText, speed);
      });
      this.updateState({ isPlaying: true });
    } else if (this.currentVerseId && sanskritText) {
      this.play(this.currentVerseId, sanskritText, speed);
    }
  }

  public toggle(verseId: string, sanskritText: string, speed = 1.0): void {
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
    if (this.state.mode === "audio" && this.audioEl) {
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
