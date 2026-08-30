/**
 * Resilient Text-to-Speech Safety Wrapper for Sanskrit and Shloka Pronunciation
 * Provides silent graceful degradation if Web Speech API is unsupported, busy, or blocked.
 */

export interface SpeakOptions {
  lang?: "en" | "hi" | "sa";
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error?: unknown) => void;
}

class SpeechSafetyEngine {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  public isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return Boolean(
      window.speechSynthesis &&
      typeof SpeechSynthesisUtterance !== "undefined"
    );
  }

  private getSynth(): SpeechSynthesis | null {
    if (!this.isSupported()) return null;
    try {
      return window.speechSynthesis;
    } catch {
      return null;
    }
  }

  public cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    const synth = this.getSynth();
    if (!synth) return;
    try {
      synth.cancel();
    } catch {
      // Silent degradation
    }
  }

  public speak(text: string, options: SpeakOptions = {}): boolean {
    this.cancel();

    if (!text || !text.trim() || !this.isSupported()) {
      options.onError?.();
      return false;
    }

    const synth = this.getSynth();
    if (!synth) {
      options.onError?.();
      return false;
    }

    try {
      // Resume if browser suspended speech
      if (synth.paused) {
        try {
          synth.resume();
        } catch {
          // Ignore
        }
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const isHindi = options.lang === "hi";

      // Voice selection preference
      const voices = synth.getVoices ? synth.getVoices() || [] : [];
      const preferences = isHindi
        ? ["hi-IN", "hi", "en-IN"]
        : ["en-IN", "en-GB", "en-US"];

      let selectedVoice: SpeechSynthesisVoice | null = null;
      for (const prefix of preferences) {
        const found = voices.find((v) => v?.lang?.startsWith(prefix));
        if (found) {
          selectedVoice = found;
          break;
        }
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.lang = isHindi ? "hi-IN" : "en-IN";
      utterance.rate = options.rate ?? 0.88;
      utterance.pitch = options.pitch ?? 1.0;

      let finished = false;

      const cleanup = (isError = false, errObj?: unknown) => {
        if (finished) return;
        finished = true;
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
          this.timeoutId = null;
        }
        if (isError) {
          options.onError?.(errObj);
        } else {
          options.onEnd?.();
        }
      };

      utterance.onstart = () => {
        options.onStart?.();
      };

      utterance.onend = () => {
        cleanup(false);
      };

      utterance.onerror = (e) => {
        cleanup(true, e);
      };

      // Watchdog timer: safety cleanup in case WebView / browser hangs on speech
      const estimatedDurationMs = Math.max(2500, text.length * 200);
      this.timeoutId = setTimeout(() => {
        if (!finished) {
          this.cancel();
          cleanup(false);
        }
      }, estimatedDurationMs);

      // Trigger start callback proactively in case onstart is delayed
      options.onStart?.();

      synth.speak(utterance);
      return true;
    } catch (err) {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
      options.onError?.(err);
      return false;
    }
  }
}

export const speechSafetyEngine = new SpeechSafetyEngine();
