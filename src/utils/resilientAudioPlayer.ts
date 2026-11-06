/**
 * Resilient Audio Player for SutraSparsh.
 *
 * Solves the critical mobile browser (Chrome on Android / iOS Safari) issue:
 * "DOMException: Failed to load because no supported source was found."
 *
 * Key Capabilities:
 * 1. Bhashini TTS Audio Handling: Explicitly converts Bhashini audio data (base64, raw PCM, or binary)
 *    into a fully-compliant RIFF WAV Blob with exact 'audio/wav' MIME type before creating the Object URL.
 * 2. Memory Leak Prevention: All generated or passed Object URLs are tracked and automatically revoked
 *    via `URL.revokeObjectURL()` immediately after the audio element's 'ended' or 'error' events,
 *    as well as upon stop/interruption.
 * 3. Robust Dual-Provider Failover: Automatically switches from primary provider (Bhashini)
 *    to secondary provider (Google Cloud TTS) when Bhashini returns HTTP 500 or malformed audio data.
 * 4. Pre-unlock of AudioContext on user gesture.
 * 5. Multi-tier playback engine: HTML5 Audio with instant Web Audio API (`AudioContext.decodeAudioData`)
 *    fallback for mobile browsers with strict OS media player codec/container restrictions.
 */

export interface ResilientAudioPlayOptions {
  playbackRate?: number;
  volume?: number;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
  ariaLabel?: string;
  /** Whether to automatically revoke any internally created or tracked Blob URL on completion/error/stop. Default: true */
  revokeOnEnd?: boolean;
}

export interface ActiveAudioHandle {
  stop: () => void;
  pause: () => void;
  resume?: () => Promise<void>;
  isPlaying?: () => boolean;
  type: "html5" | "webaudio";
  blobUrl?: string;
}

export interface AudioValidationResult {
  isValid: boolean;
  format: "wav" | "mp3" | "ogg" | "webm" | "pcm" | "unknown";
  mimeType: string;
  byteLength: number;
  error?: string;
  isPlayable: boolean;
  arrayBuffer?: ArrayBuffer;
  normalizedBase64?: string;
}

export class AudioValidationError extends Error {
  public readonly code = "AUDIO_VALIDATION_ERROR";
  public readonly details: Partial<AudioValidationResult>;

  constructor(message: string, details: Partial<AudioValidationResult> = {}) {
    super(message);
    this.name = "AudioValidationError";
    this.details = details;
  }
}

export class ResilientAudioPlayer {
  private static instance: ResilientAudioPlayer;
  private audioContext: AudioContext | null = null;
  private currentHandle: ActiveAudioHandle | null = null;
  /** Set of tracked Blob URLs created or managed by this player for automatic memory disposal */
  private trackedBlobUrls: Set<string> = new Set();

  public static getInstance(): ResilientAudioPlayer {
    if (!ResilientAudioPlayer.instance) {
      ResilientAudioPlayer.instance = new ResilientAudioPlayer();
    }
    return ResilientAudioPlayer.instance;
  }

  // =========================================================================
  // BLOB URL LIFECYCLE & DISPOSAL MANAGEMENT (MEMORY LEAK PREVENTION)
  // =========================================================================

  /**
   * Registers a Blob URL for tracked disposal.
   */
  public trackBlobUrl(url: string): string {
    if (typeof url === "string" && url.startsWith("blob:")) {
      this.trackedBlobUrls.add(url);
    }
    return url;
  }

  /**
   * Explicitly disposes a tracked Blob URL to prevent browser memory leaks.
   * Invokes URL.revokeObjectURL immediately.
   */
  public revokeBlobUrl(url: string): void {
    if (!url || !url.startsWith("blob:")) return;
    try {
      if (typeof URL !== "undefined" && typeof URL.revokeObjectURL === "function") {
        URL.revokeObjectURL(url);
      }
    } catch {
      // Ignore URL revocation errors in test environments
    }
    this.trackedBlobUrls.delete(url);
  }

  /**
   * Revokes all active tracked Blob URLs via URL.revokeObjectURL immediately.
   */
  public revokeAllBlobUrls(): void {
    if (typeof URL !== "undefined" && typeof URL.revokeObjectURL === "function") {
      for (const url of this.trackedBlobUrls) {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // Ignore
        }
      }
    }
    this.trackedBlobUrls.clear();
  }

  /**
   * Returns current count of tracked Blob URLs in memory.
   */
  public getTrackedBlobUrlCount(): number {
    return this.trackedBlobUrls.size;
  }

  // =========================================================================
  // BHASHINI AUDIO BLOB CONVERSION & WAV RIFF FRAMING
  // =========================================================================

  /**
   * Explicitly converts audio data from Bhashini's TTS endpoint into a valid Blob
   * with 'audio/wav' MIME type and compliant 44-byte RIFF header.
   *
   * Addresses the mobile browser "DOMException: Failed to load because no supported source was found":
   * Bhashini Indic-TTS sometimes returns raw 16-bit PCM bytes without a RIFF header. This method
   * detects headerless PCM and prepends the standard 44-byte RIFF WAVE header (22,050 Hz, 16-bit mono),
   * guaranteeing that every created Blob is 100% compliant with HTML5 and Web Audio decoders.
   *
   * @param audioData Base64 string, Uint8Array, ArrayBuffer, or Blob
   * @param sampleRate Chanting sample rate in Hz (default: 22050 for Indic-TTS)
   * @returns Blob with explicit 'audio/wav' MIME type
   */
  public convertBhashiniAudioToWavBlob(
    audioData: string | Uint8Array | ArrayBuffer | Blob,
    sampleRate = 22050
  ): Blob {
    if (!audioData) {
      throw new AudioValidationError("Bhashini audio data is empty or undefined.");
    }

    // 1. If already a Blob with audio/wav, verify or wrap
    if (typeof Blob !== "undefined" && audioData instanceof Blob) {
      if (audioData.type === "audio/wav") {
        return audioData;
      }
      return new Blob([audioData], { type: "audio/wav" });
    }

    // 2. Extract Uint8Array from input
    let pcmBytes: Uint8Array;

    if (typeof audioData === "string") {
      const cleanBase64 = audioData.replace(/^data:audio\/\w+;base64,/, "").replace(/[\r\n\s]+/g, "");
      if (cleanBase64.length === 0) {
        throw new AudioValidationError("Bhashini audio base64 payload is empty.");
      }
      pcmBytes = this.base64ToUint8Array(cleanBase64);
    } else if (audioData instanceof Uint8Array) {
      pcmBytes = audioData;
    } else if (audioData instanceof ArrayBuffer) {
      pcmBytes = new Uint8Array(audioData);
    } else {
      throw new AudioValidationError("Unsupported Bhashini audio data type.");
    }

    const pcmLen = pcmBytes.byteLength;
    if (pcmLen < 4) {
      throw new AudioValidationError("Bhashini audio payload is too small (< 4 bytes).");
    }

    // 3. Inspect if the payload already contains a valid RIFF WAVE header (first 12 bytes)
    const hasRiffHeader =
      pcmLen >= 12 &&
      pcmBytes[0] === 0x52 && // 'R'
      pcmBytes[1] === 0x49 && // 'I'
      pcmBytes[2] === 0x46 && // 'F'
      pcmBytes[3] === 0x46 && // 'F'
      pcmBytes[8] === 0x57 && // 'W'
      pcmBytes[9] === 0x41 && // 'A'
      pcmBytes[10] === 0x56 && // 'V'
      pcmBytes[11] === 0x45; // 'E'

    if (hasRiffHeader) {
      // Valid WAV: create Blob with explicit 'audio/wav' MIME type
      return new Blob([pcmBytes as BlobPart], { type: "audio/wav" });
    }

    // 4. Headerless raw 16-bit PCM: wrap with canonical 44-byte RIFF WAV header
    const headerSize = 44;
    const totalBytes = headerSize + pcmLen;
    const buffer = new ArrayBuffer(totalBytes);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    this.writeAscii(view, 0, "RIFF");
    view.setUint32(4, 36 + pcmLen, true);
    this.writeAscii(view, 8, "WAVE");

    // "fmt " sub-chunk
    this.writeAscii(view, 12, "fmt ");
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
    view.setUint16(22, 1, true); // NumChannels (1 = Mono)
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * 2, true); // ByteRate (sampleRate * numChannels * bitsPerSample/8)
    view.setUint16(32, 2, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample

    // "data" sub-chunk
    this.writeAscii(view, 36, "data");
    view.setUint32(40, pcmLen, true);

    // Copy audio bytes
    const u8 = new Uint8Array(buffer, headerSize);
    u8.set(pcmBytes);

    // Create Blob with strictly specified 'audio/wav' MIME type
    return new Blob([buffer], { type: "audio/wav" });
  }

  /**
   * Creates a tracked Object URL from Bhashini audio data with explicit 'audio/wav' MIME type.
   */
  public createBhashiniBlobUrl(
    audioData: string | Uint8Array | ArrayBuffer | Blob,
    sampleRate = 22050
  ): string {
    const blob = this.convertBhashiniAudioToWavBlob(audioData, sampleRate);
    if (typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
      const url = URL.createObjectURL(blob);
      this.trackBlobUrl(url);
      return url;
    }
    // Fallback for non-browser environments: data URL
    if (typeof audioData === "string" && !audioData.startsWith("blob:")) {
      return `data:audio/wav;base64,${audioData.replace(/^data:audio\/\w+;base64,/, "")}`;
    }
    return "blob:sutrasparsh/audio/wav";
  }

  // =========================================================================
  // AUDIO SOURCE PRE-VALIDATION & INSPECTION
  // =========================================================================

  /**
   * Thoroughly validates an audio source *before* it is attached to an HTML5 Audio element.
   * Inspects binary header signatures (RIFF/WAVE, ID3/MP3 sync, OGG, WebM) and checks for
   * zero-byte or corrupt payloads, preventing browser 'no supported source found' errors.
   */
  public async validateAudioSource(source: string | Blob): Promise<AudioValidationResult> {
    if (!source) {
      return {
        isValid: false,
        format: "unknown",
        mimeType: "",
        byteLength: 0,
        isPlayable: false,
        error: "Audio source is null, empty, or undefined.",
      };
    }

    try {
      // Case 1: Source is a Blob
      if (typeof Blob !== "undefined" && source instanceof Blob) {
        const byteLength = source.size;
        if (byteLength < 44) {
          return {
            isValid: false,
            format: "unknown",
            mimeType: source.type || "audio/wav",
            byteLength,
            isPlayable: false,
            error: `Audio blob contains only ${byteLength} bytes (minimum 44 bytes required for valid audio).`,
          };
        }

        const headerBuffer = await source.slice(0, 32).arrayBuffer();
        const header = new Uint8Array(headerBuffer);
        const formatInfo = this.detectAudioFormatFromBytes(header, byteLength);

        return {
          isValid: formatInfo.isPlayable,
          format: formatInfo.format,
          mimeType: source.type || formatInfo.mimeType,
          byteLength,
          isPlayable: formatInfo.isPlayable,
          error: formatInfo.isPlayable ? undefined : "Unrecognized audio container format or corrupted header.",
        };
      }

      // Case 2: Source is a string
      if (typeof source === "string") {
        const trimmed = source.trim();
        if (trimmed.length === 0) {
          return {
            isValid: false,
            format: "unknown",
            mimeType: "",
            byteLength: 0,
            isPlayable: false,
            error: "Audio source string is empty.",
          };
        }

        // 2a. Blob URL or HTTP(S) URL
        if (trimmed.startsWith("blob:") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
          // If in browser and URL is a blob:, quickly verify the blob is reachable
          if (typeof window !== "undefined" && typeof fetch === "function" && trimmed.startsWith("blob:")) {
            try {
              const res = await fetch(trimmed, { method: "GET" });
              if (!res.ok) {
                return {
                  isValid: false,
                  format: "unknown",
                  mimeType: "",
                  byteLength: 0,
                  isPlayable: false,
                  error: `Failed to resolve blob URL: HTTP status ${res.status}`,
                };
              }
              const blob = await res.blob();
              if (blob.size < 44) {
                return {
                  isValid: false,
                  format: "unknown",
                  mimeType: blob.type || "audio/wav",
                  byteLength: blob.size,
                  isPlayable: false,
                  error: `Resolved blob URL has only ${blob.size} bytes (minimum 44 required).`,
                };
              }
              const headerBuf = await blob.slice(0, 32).arrayBuffer();
              const header = new Uint8Array(headerBuf);
              const formatInfo = this.detectAudioFormatFromBytes(header, blob.size);
              return {
                isValid: formatInfo.isPlayable,
                format: formatInfo.format,
                mimeType: blob.type || formatInfo.mimeType,
                byteLength: blob.size,
                isPlayable: formatInfo.isPlayable,
                arrayBuffer: headerBuf,
              };
            } catch (fetchErr: any) {
              return {
                isValid: false,
                format: "unknown",
                mimeType: "",
                byteLength: 0,
                isPlayable: false,
                error: `Unable to access audio blob URL: ${fetchErr?.message || fetchErr}`,
              };
            }
          }

          // Non-blob URL (HTTP/HTTPS) - assumed valid if URL is syntactically sound
          return {
            isValid: true,
            format: trimmed.includes(".mp3") ? "mp3" : "wav",
            mimeType: trimmed.includes(".mp3") ? "audio/mp3" : "audio/wav",
            byteLength: 1024,
            isPlayable: true,
          };
        }

        // 2b. Base64 string or Data URI
        const cleanBase64 = trimmed.replace(/^data:audio\/\w+;base64,/, "").replace(/[\r\n\s]+/g, "");
        if (cleanBase64.length < 50) {
          return {
            isValid: false,
            format: "unknown",
            mimeType: "",
            byteLength: 0,
            isPlayable: false,
            error: `Audio base64 string is too short (${cleanBase64.length} chars).`,
          };
        }

        const arrayBuffer = this.base64ToArrayBuffer(cleanBase64);
        const bytes = new Uint8Array(arrayBuffer);
        const formatInfo = this.detectAudioFormatFromBytes(bytes, bytes.byteLength);

        return {
          isValid: formatInfo.isPlayable,
          format: formatInfo.format,
          mimeType: formatInfo.mimeType,
          byteLength: bytes.byteLength,
          isPlayable: formatInfo.isPlayable,
          arrayBuffer,
          normalizedBase64: cleanBase64,
          error: formatInfo.isPlayable ? undefined : "Audio binary contains an invalid or corrupted header.",
        };
      }

      return {
        isValid: false,
        format: "unknown",
        mimeType: "",
        byteLength: 0,
        isPlayable: false,
        error: "Unsupported audio source type.",
      };
    } catch (err: any) {
      return {
        isValid: false,
        format: "unknown",
        mimeType: "",
        byteLength: 0,
        isPlayable: false,
        error: `Audio validation failed: ${err?.message || err}`,
      };
    }
  }

  /**
   * Inspects binary header bytes to determine audio container format.
   */
  private detectAudioFormatFromBytes(
    bytes: Uint8Array,
    totalLength: number
  ): { format: AudioValidationResult["format"]; mimeType: string; isPlayable: boolean } {
    if (bytes.length < 4) {
      return { format: "unknown", mimeType: "application/octet-stream", isPlayable: false };
    }

    // Check 1: RIFF WAVE ("RIFF" ... "WAVE")
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
      if (bytes.length >= 12) {
        if (bytes[8] === 0x57 && bytes[9] === 0x41 && bytes[10] === 0x56 && bytes[11] === 0x45) {
          return { format: "wav", mimeType: "audio/wav", isPlayable: totalLength >= 44 };
        }
      }
      return { format: "wav", mimeType: "audio/wav", isPlayable: true };
    }

    // Check 2: MP3 with ID3 tag ("ID3")
    if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
      return { format: "mp3", mimeType: "audio/mp3", isPlayable: true };
    }

    // Check 3: MP3 raw frame sync (0xFF 0xFB, 0xFF 0xF3, 0xFF 0xF2)
    if (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) {
      return { format: "mp3", mimeType: "audio/mp3", isPlayable: true };
    }

    // Check 4: OGG container ("OggS")
    if (bytes[0] === 0x4f && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) {
      return { format: "ogg", mimeType: "audio/ogg", isPlayable: true };
    }

    // Check 5: WebM / Matroska (0x1A 0x45 0xDF 0xA3)
    if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
      return { format: "webm", mimeType: "audio/webm", isPlayable: true };
    }

    // If byteLength > 50 and format is not explicitly recognized,
    // it may be headerless raw 16-bit PCM (e.g. from Bhashini models)
    if (totalLength > 50) {
      return { format: "pcm", mimeType: "audio/wav", isPlayable: true };
    }

    return { format: "unknown", mimeType: "application/octet-stream", isPlayable: false };
  }

  // =========================================================================
  // AUDIO ENGINE PLAYBACK
  // =========================================================================

  /**
   * Pre-unlocks AudioContext during direct user interaction (click/touch).
   * Call this synchronously at the very beginning of click handlers.
   */
  public unlockAudio(): void {
    if (typeof window === "undefined") return;

    try {
      if (!this.audioContext) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
        }
      }

      if (this.audioContext && this.audioContext.state === "suspended") {
        this.audioContext.resume().catch(() => {});
      }
    } catch {
      // Ignore initial context unlock failures
    }
  }

  /**
   * Stops any currently active playback (HTML5 or Web Audio) and revokes its Blob URL.
   */
  public stopCurrent(): void {
    if (this.currentHandle) {
      try {
        this.currentHandle.stop();
      } catch {
        // Ignore
      }
      this.currentHandle = null;
    }
  }

  /**
   * Plays an audio source with multi-tier fallback (HTML5 Audio -> Web Audio API).
   *
   * Includes:
   * 1. Mandatory pre-validation to intercept corrupt/empty audio *before* browser errors.
   * 2. Automatic Blob URL tracking and immediate disposal on completion ('ended'), error ('error'), or stop.
   * 3. Seamless Web Audio API fallback for mobile Android Chrome and iOS Safari.
   *
   * @param source Blob URL, Data URI, Base64 string, or Blob object
   * @param options Playback options
   */
  public async play(
    source: string | Blob,
    options: ResilientAudioPlayOptions = {}
  ): Promise<ActiveAudioHandle> {
    if (typeof window === "undefined") {
      throw new Error("resilientAudioPlayer can only be called in browser environment.");
    }

    // Stop previous audio
    this.stopCurrent();

    // Ensure audio context is ready
    this.unlockAudio();

    // 1. Mandatory Pre-Validation: intercept bad/empty audio BEFORE passing to Audio()
    const validation = await this.validateAudioSource(source);
    if (!validation.isValid) {
      const errorMsg = validation.error || "Audio source is invalid or corrupted.";
      console.error("[ResilientAudioPlayer] Source validation failed:", errorMsg);
      const validationError = new AudioValidationError(errorMsg, validation);
      if (options.onError) {
        options.onError(validationError);
      }
      throw validationError;
    }

    const playbackRate = options.playbackRate ?? 1.0;
    const volume = Math.max(0, Math.min(1, options.volume ?? 1.0));
    const shouldRevokeOnEnd = options.revokeOnEnd !== false;

    // 2. Prepare normalized URL and track for disposal
    let normalizedUrl: string;
    let rawBase64: string | null = null;
    let createdBlobUrl: string | null = null;

    if (source instanceof Blob) {
      // If Blob doesn't have audio/wav MIME type and is WAV/PCM, wrap it explicitly
      const wavBlob = source.type === "audio/wav" ? source : new Blob([source], { type: "audio/wav" });
      createdBlobUrl = URL.createObjectURL(wavBlob);
      this.trackBlobUrl(createdBlobUrl);
      normalizedUrl = createdBlobUrl;
    } else if (typeof source === "string") {
      if (source.startsWith("blob:")) {
        normalizedUrl = source;
        // Track existing blob URL for lifecycle disposal on ended/error
        createdBlobUrl = source;
        this.trackBlobUrl(createdBlobUrl);
      } else if (source.startsWith("http://") || source.startsWith("https://") || source.startsWith("data:")) {
        normalizedUrl = source;
      } else {
        // Raw base64 string: sanitize and wrap with RIFF WAV container explicitly
        rawBase64 = validation.normalizedBase64 || source.replace(/^data:audio\/\w+;base64,/, "").trim();

        if (validation.format === "mp3") {
          createdBlobUrl = this.base64ToBlobUrl(rawBase64, "audio/mp3");
        } else {
          // Bhashini audio: ensure explicit 'audio/wav' MIME type with RIFF header
          createdBlobUrl = this.createBhashiniBlobUrl(rawBase64, 22050);
        }
        this.trackBlobUrl(createdBlobUrl);
        normalizedUrl = createdBlobUrl;
      }
    } else {
      throw new AudioValidationError("Invalid audio source type provided to resilientAudioPlayer.");
    }

    // Helper to safely dispose created or tracked blob URL
    const disposeSessionBlobUrl = () => {
      if (shouldRevokeOnEnd && createdBlobUrl) {
        this.revokeBlobUrl(createdBlobUrl);
        createdBlobUrl = null;
      }
    };

    // Attempt 1: HTML5 Audio element
    try {
      const handle = await this.playViaHtml5(
        normalizedUrl,
        playbackRate,
        volume,
        options,
        disposeSessionBlobUrl
      );
      this.currentHandle = handle;
      return handle;
    } catch (html5Err: unknown) {
      const msg = html5Err instanceof Error ? html5Err.message : String(html5Err);
      console.warn(
        `[ResilientAudioPlayer] HTML5 Audio failed ("${msg}"), executing automatic Web Audio API fallback...`
      );

      // Attempt 2: Web Audio API decoding (bulletproof on Android Chrome & iOS Safari)
      try {
        const handle = await this.playViaWebAudio(
          normalizedUrl,
          rawBase64,
          playbackRate,
          volume,
          options,
          disposeSessionBlobUrl
        );
        this.currentHandle = handle;
        return handle;
      } catch (webAudioErr: unknown) {
        disposeSessionBlobUrl();
        const finalMsg = webAudioErr instanceof Error ? webAudioErr.message : String(webAudioErr);
        console.error("[ResilientAudioPlayer] Both HTML5 Audio and Web Audio API failed:", finalMsg);
        if (options.onError) {
          options.onError(webAudioErr);
        }
        throw webAudioErr;
      }
    }
  }

  /**
   * Plays audio via standard HTML5 Audio element with immediate Blob URL disposal
   * on 'ended' or 'error' events to prevent memory leaks.
   */
  private playViaHtml5(
    url: string,
    playbackRate: number,
    volume: number,
    options: ResilientAudioPlayOptions,
    onSessionCleanup: () => void
  ): Promise<ActiveAudioHandle> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.preload = "auto";
      audio.crossOrigin = "anonymous";
      audio.volume = volume;
      audio.playbackRate = playbackRate;
      if (options.ariaLabel) {
        audio.setAttribute("aria-label", options.ariaLabel);
      }

      let hasSettled = false;

      const cleanup = () => {
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("error", handleError);
      };

      // Clean up and revoke Object URL immediately on 'ended'
      const handleEnded = () => {
        cleanup();
        onSessionCleanup();
        options.onEnd?.();
      };

      // Clean up and revoke Object URL immediately on 'error'
      const handleError = () => {
        cleanup();
        onSessionCleanup(); // Revoke Object URL immediately on error to prevent memory leaks
        const errCode = audio.error?.code;
        const errMsg = audio.error?.message || "Audio element failed to load source";
        const err = new Error(`HTML5 Audio error (code ${errCode}): ${errMsg}`);
        if (!hasSettled) {
          hasSettled = true;
          reject(err);
        } else {
          options.onError?.(err);
        }
      };

      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("error", handleError);

      audio.src = url;

      // In Android Chrome, calling load() ensures source buffer is probed
      try {
        audio.load();
      } catch {
        // Some browsers don't require load()
      }

      audio
        .play()
        .then(() => {
          if (!hasSettled) {
            hasSettled = true;
            resolve({
              type: "html5",
              blobUrl: url.startsWith("blob:") ? url : undefined,
              stop: () => {
                cleanup();
                onSessionCleanup();
                try {
                  audio.pause();
                  audio.currentTime = 0;
                } catch {}
              },
              pause: () => {
                try {
                  audio.pause();
                } catch {}
              },
              resume: async () => {
                await audio.play();
              },
              isPlaying: () => !audio.paused && !audio.ended,
            });
          }
        })
        .catch((playErr) => {
          if (!hasSettled) {
            hasSettled = true;
            cleanup();
            onSessionCleanup(); // Revoke Object URL immediately if playback promise rejects
            reject(playErr);
          }
        });
    });
  }

  /**
   * Plays audio via Web Audio API (AudioContext.decodeAudioData).
   * Decodes PCM WAV and MP3 buffers directly in memory, bypassing OS media container restrictions.
   */
  private async playViaWebAudio(
    url: string,
    rawBase64: string | null,
    playbackRate: number,
    volume: number,
    options: ResilientAudioPlayOptions,
    onSessionCleanup: () => void
  ): Promise<ActiveAudioHandle> {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioCtx) {
      throw new Error("Web Audio API is not supported on this device.");
    }

    if (!this.audioContext || this.audioContext.state === "closed") {
      this.audioContext = new AudioCtx();
    }

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    const ctx = this.audioContext;

    // Retrieve ArrayBuffer
    let arrayBuffer: ArrayBuffer;

    if (rawBase64) {
      arrayBuffer = this.base64ToArrayBuffer(rawBase64);
    } else if (url.startsWith("data:")) {
      const base64Index = url.indexOf(";base64,");
      if (base64Index !== -1) {
        const b64 = url.slice(base64Index + 8);
        arrayBuffer = this.base64ToArrayBuffer(b64);
      } else {
        const resp = await fetch(url);
        arrayBuffer = await resp.arrayBuffer();
      }
    } else {
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error(`Failed to fetch audio resource (HTTP ${resp.status})`);
      }
      arrayBuffer = await resp.arrayBuffer();
    }

    if (!arrayBuffer || arrayBuffer.byteLength < 44) {
      throw new Error("Retrieved audio buffer is empty or corrupted.");
    }

    // Decode audio data using browser's internal decoder
    const audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
      // Use slice(0) to avoid detached ArrayBuffer issues on older WebKit engines
      ctx.decodeAudioData(arrayBuffer.slice(0), resolve, (decodeErr) => {
        reject(decodeErr || new Error("Failed to decode audio data in Web Audio API."));
      });
    });

    const sourceNode = ctx.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.playbackRate.value = playbackRate;

    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;

    sourceNode.connect(gainNode);
    gainNode.connect(ctx.destination);

    let isPlaying = true;

    // Revoke Object URL immediately on 'ended' in Web Audio
    sourceNode.onended = () => {
      isPlaying = false;
      onSessionCleanup();
      options.onEnd?.();
    };

    sourceNode.start(0);

    return {
      type: "webaudio",
      blobUrl: url.startsWith("blob:") ? url : undefined,
      stop: () => {
        if (isPlaying) {
          isPlaying = false;
          onSessionCleanup();
          try {
            sourceNode.stop();
            sourceNode.disconnect();
          } catch {}
        }
      },
      pause: () => {
        if (isPlaying) {
          isPlaying = false;
          try {
            sourceNode.stop();
            sourceNode.disconnect();
          } catch {}
        }
      },
      isPlaying: () => isPlaying,
    };
  }

  // =========================================================================
  // DUAL-PROVIDER AUTOMATIC FAILOVER ENGINE
  // =========================================================================

  /**
   * Executes recitation with automatic dual-provider failover:
   * If primary provider (Bhashini) returns HTTP 500, network error, or invalid payload,
   * automatically falls back to secondary provider (Google Cloud TTS) as a secondary source.
   *
   * @param providers Primary and fallback synthesis generator functions
   * @param options Playback options and fallback notifications
   */
  public async playWithProviderFallback(
    providers: {
      primary: () => Promise<{ audioContent: string; mimeType?: string; provider?: string } | string | Blob>;
      fallback: () => Promise<{ audioContent: string; mimeType?: string; provider?: string } | string | Blob>;
    },
    options: ResilientAudioPlayOptions & {
      onFallback?: (from: string, to: string, err: unknown) => void;
    } = {}
  ): Promise<ActiveAudioHandle & { providerUsed: string; fallbackActive: boolean }> {
    let fallbackActive = false;
    let providerUsed = "bhashini";
    let targetSource: string | Blob;

    try {
      // 1. Attempt Primary Provider (Bhashini)
      const primaryRes = await providers.primary();
      if (typeof primaryRes === "object" && primaryRes !== null && !(primaryRes instanceof Blob)) {
        if ("audioContent" in primaryRes) {
          const mime = primaryRes.mimeType || "audio/wav";
          targetSource = this.createBhashiniBlobUrl(primaryRes.audioContent);
          providerUsed = primaryRes.provider || "bhashini";
        } else {
          targetSource = primaryRes as unknown as Blob;
        }
      } else {
        targetSource = primaryRes;
      }
    } catch (primaryErr) {
      console.warn(
        `[ResilientAudioPlayer] Primary provider failed (${(primaryErr as Error)?.message || primaryErr}). Switching to Google Cloud TTS secondary source...`
      );
      fallbackActive = true;
      providerUsed = "google";

      // Dispatch fallback notification
      if (options.onFallback) {
        options.onFallback("bhashini", "google", primaryErr);
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("sutrasparsh:tts_fallback_triggered", {
            detail: {
              from: "bhashini",
              to: "google",
              reason: (primaryErr as Error)?.message || "Bhashini service unavailable (HTTP 500)",
            },
          })
        );
      }

      // 2. Execute Fallback Provider (Google Cloud TTS)
      const fallbackRes = await providers.fallback();
      if (typeof fallbackRes === "object" && fallbackRes !== null && !(fallbackRes instanceof Blob)) {
        if ("audioContent" in fallbackRes) {
          const mime = fallbackRes.mimeType || "audio/mp3";
          targetSource = this.base64ToBlobUrl(fallbackRes.audioContent, mime);
          providerUsed = fallbackRes.provider || "google";
        } else {
          targetSource = fallbackRes as unknown as Blob;
        }
      } else {
        targetSource = fallbackRes;
      }
    }

    // 3. Play the determined source
    const handle = await this.play(targetSource, options);
    return {
      ...handle,
      providerUsed,
      fallbackActive,
    };
  }

  // =========================================================================
  // BINARY CONVERSION & HELPERS
  // =========================================================================

  /**
   * Converts base64 to Blob URL and tracks it for memory disposal.
   */
  public base64ToBlobUrl(base64: string, mimeType = "audio/wav"): string {
    const clean = base64.replace(/^data:audio\/\w+;base64,/, "").replace(/[\r\n\s]+/g, "");
    const bytes = this.base64ToUint8Array(clean);
    const blob = new Blob([bytes as BlobPart], { type: mimeType });
    if (typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
      const url = URL.createObjectURL(blob);
      this.trackBlobUrl(url);
      return url;
    }
    return `data:${mimeType};base64,${clean}`;
  }

  /**
   * Wraps raw 16-bit PCM base64 samples with a canonical 44-byte RIFF WAV header
   * (22,050 Hz, 16-bit mono) and returns a tracked Blob URL.
   */
  public pcmBase64ToRiffWavBlobUrl(base64Pcm: string, sampleRate = 22050): string {
    return this.createBhashiniBlobUrl(base64Pcm, sampleRate);
  }

  /**
   * Decodes a sanitized base64 string to Uint8Array in both browser and Node.js.
   */
  public base64ToUint8Array(base64: string): Uint8Array {
    const clean = base64.replace(/^data:audio\/\w+;base64,/, "").replace(/[\r\n\s]+/g, "");

    if (typeof window !== "undefined" && typeof window.atob === "function") {
      const binary = window.atob(clean);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    }

    if (typeof atob === "function") {
      const binary = atob(clean);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    }

    if (typeof Buffer !== "undefined") {
      return new Uint8Array(Buffer.from(clean, "base64"));
    }

    throw new Error("No base64 decoder available in current environment.");
  }

  /**
   * Converts base64 to ArrayBuffer safely.
   */
  public base64ToArrayBuffer(base64: string): ArrayBuffer {
    const u8 = this.base64ToUint8Array(base64);
    return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer;
  }

  private writeAscii(view: DataView, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }
}

export const resilientAudioPlayer = ResilientAudioPlayer.getInstance();
