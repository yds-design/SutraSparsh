// Meditative audio engine using Web Audio API
// Synthesizes selectable ambient soundscapes ('Temple Bell', 'Himalayan Breeze', 'River Ganga')
// with optional 432Hz/136.1Hz Tanpura drone accompaniment (disabled by default)

export type AmbientSoundscape = "temple-bell" | "himalayan-breeze" | "river-ganga";

export interface SoundscapeInfo {
  id: AmbientSoundscape;
  name: string;
  devanagari: string;
  subtitle: string;
  description: string;
  icon: string;
  elements: string[];
}

export const SOUNDSCAPES: SoundscapeInfo[] = [
  {
    id: "temple-bell",
    name: "Temple Bell",
    devanagari: "घण्टानाद",
    subtitle: "Sacred Bronze Chimes & Singing Bowls",
    description: "Deep, reverberant temple bell & singing bowl chime resonance echoing through the sanctum at sacred intervals.",
    icon: "🔔",
    elements: ["216Hz Fundamental", "Harmonic Overtones", "Sanctum Reverb"],
  },
  {
    id: "himalayan-breeze",
    name: "Himalayan Breeze",
    devanagari: "हिमालय-पवन",
    subtitle: "High Altitude Mountain Whisper",
    description: "Gentle mountain wind whispers and organic pine gusts from the sacred peaks of Kedarnath and Kailash.",
    icon: "🏔️",
    elements: ["Pink Noise Textures", "Sweeping Bandpass", "Organic Gusts"],
  },
  {
    id: "river-ganga",
    name: "River Ganga",
    devanagari: "गङ्गा-प्रवाह",
    subtitle: "Sacred Flowing Waters & Ripples",
    description: "Tranquil, rhythmic water ripples and holy river flow along the ancient ghats of Varanasi and Rishikesh.",
    icon: "🌊",
    elements: ["Dual-Stage Filtering", "Gentle Ripples", "Flowing Current"],
  },
];

export const SOUNDSCAPE_STORAGE_KEY = "sutrasparsh_ambient_soundscape";
export const TANPURA_DRONE_ENABLED_STORAGE_KEY = "sutrasparsh_tanpura_drone_enabled";

class MeditativeSoundEngine {
  private ctx: AudioContext | null = null;
  private isPlayingAmbience = false;
  private ambientOscillators: OscillatorNode[] = [];
  private ambientGain: GainNode | null = null;

  // 432Hz / 136.1Hz Tanpura drone toggle: DISABLED BY DEFAULT
  private isTanpuraEnabled: boolean = false;

  // Soundscape management
  private currentSoundscape: AmbientSoundscape = "temple-bell";
  private soundscapeGain: GainNode | null = null;
  private soundscapeNodes: (AudioNode | number | NodeJS.Timeout)[] = [];
  private bellIntervalId: NodeJS.Timeout | null = null;
  private previewTimeoutId: NodeJS.Timeout | null = null;
  private isPreviewPlaying = false;

  constructor() {
    this.currentSoundscape = this.loadStoredSoundscape();
    this.isTanpuraEnabled = this.loadStoredTanpuraEnabled();
  }

  private loadStoredSoundscape(): AmbientSoundscape {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(SOUNDSCAPE_STORAGE_KEY) as AmbientSoundscape;
        if (stored === "temple-bell" || stored === "himalayan-breeze" || stored === "river-ganga") {
          return stored;
        }
      } catch {
        // ignore
      }
    }
    return "temple-bell";
  }

  // Tanpura drone is disabled (false) by default
  private loadStoredTanpuraEnabled(): boolean {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(TANPURA_DRONE_ENABLED_STORAGE_KEY);
        // Strictly false by default unless user explicitly saved 'true'
        return stored === "true";
      } catch {
        return false;
      }
    }
    return false;
  }

  private initContext() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  // Play Tibetan singing bowl / temple bell sound - SILENCED for UI button clicks
  // All chime sound effects ("ding-dong" / bell tones) have been globally eliminated per requirements.
  public playTempleBell(_pitch = 220) {
    // Zero audio output - no-op to completely eliminate all chime and ding-dong sound effects globally
    return;
  }

  /**
   * Returns whether the 432Hz/136.1Hz Tanpura drone layer is enabled.
   * Disabled (false) by default.
   */
  public getIsTanpuraEnabled(): boolean {
    return this.isTanpuraEnabled;
  }

  /**
   * Enables or disables the 432Hz/136.1Hz Tanpura drone layer.
   * Persists to localStorage and transitions live oscillators if ambience is playing.
   */
  public setTanpuraEnabled(enabled: boolean): void {
    if (this.isTanpuraEnabled === enabled) return;
    this.isTanpuraEnabled = enabled;

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(TANPURA_DRONE_ENABLED_STORAGE_KEY, enabled ? "true" : "false");
      } catch {}
      window.dispatchEvent(
        new CustomEvent("sutrasparsh:tanpura_enabled_changed", { detail: enabled })
      );
    }

    // If currently playing ambient soundscape, live toggle Tanpura drone oscillators
    if (this.isPlayingAmbience && this.ctx) {
      if (enabled) {
        this.startTanpuraOscillators();
      } else {
        this.stopTanpuraOscillators();
      }
    }
  }

  /**
   * Returns the currently configured soundscape ('Temple Bell' | 'Himalayan Breeze' | 'River Ganga').
   */
  public getSoundscape(): AmbientSoundscape {
    return this.currentSoundscape;
  }

  /**
   * Sets the active soundscape. Persists to localStorage and transitions
   * audio in real-time if ambience is currently playing.
   */
  public setSoundscape(soundscape: AmbientSoundscape): void {
    if (this.currentSoundscape === soundscape) return;
    this.currentSoundscape = soundscape;

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(SOUNDSCAPE_STORAGE_KEY, soundscape);
      } catch {
        // ignore
      }
      window.dispatchEvent(
        new CustomEvent("sutrasparsh:soundscape_changed", { detail: soundscape })
      );
    }

    // If currently playing ambient audio, crossfade to the new soundscape seamlessly
    if (this.isPlayingAmbience && this.ctx) {
      this.stopSoundscape();
      this.startSoundscape(soundscape);
    }
  }

  /**
   * Synthesizes and starts the selected background ambient soundscape.
   */
  private startSoundscape(soundscape: AmbientSoundscape) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Dedicated soundscape master gain
    this.soundscapeGain = this.ctx.createGain();
    this.soundscapeGain.gain.setValueAtTime(0.001, now);
    this.soundscapeGain.gain.exponentialRampToValueAtTime(0.065, now + 1.5);
    this.soundscapeGain.connect(this.ctx.destination);

    if (soundscape === "temple-bell") {
      this.startTempleBellSoundscape();
    } else if (soundscape === "himalayan-breeze") {
      this.startHimalayanBreezeSoundscape();
    } else if (soundscape === "river-ganga") {
      this.startRiverGangaSoundscape();
    }
  }

  /**
   * Soundscape 1: Temple Bell & Singing Bowl Resonance
   * Strikes a sacred bronze chime with rich harmonic overtones periodically.
   */
  private startTempleBellSoundscape() {
    this.triggerTempleBellStrike();

    this.bellIntervalId = setInterval(() => {
      if (this.isPlayingAmbience || this.isPreviewPlaying) {
        this.triggerTempleBellStrike();
      }
    }, 8500);

    this.soundscapeNodes.push(this.bellIntervalId);
  }

  private triggerTempleBellStrike() {
    if (!this.ctx || !this.soundscapeGain) return;
    const now = this.ctx.currentTime;
    const fundamental = 216; // Meditative Sacred frequency

    const partials = [
      { ratio: 1.0, gain: 0.55, decay: 6.2 },
      { ratio: 1.52, gain: 0.32, decay: 5.0 },
      { ratio: 2.15, gain: 0.22, decay: 4.0 },
      { ratio: 3.14, gain: 0.12, decay: 2.8 },
    ];

    partials.forEach(({ ratio, gain, decay }) => {
      try {
        const osc = this.ctx!.createOscillator();
        const oscGain = this.ctx!.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(fundamental * ratio, now);

        oscGain.gain.setValueAtTime(gain * 0.14, now);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

        osc.connect(oscGain);
        oscGain.connect(this.soundscapeGain!);
        osc.start(now);
        osc.stop(now + decay);
      } catch {
        // Audio node lifecycle safety
      }
    });
  }

  /**
   * Soundscape 2: Himalayan Breeze
   * Synthesizes mountain winds using filtered noise modulated by a gentle organic LFO.
   */
  private startHimalayanBreezeSoundscape() {
    if (!this.ctx || !this.soundscapeGain) return;
    const now = this.ctx.currentTime;

    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0,
        b1 = 0,
        b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.099046;
        b1 = 0.963 * b1 + white * 0.2965164;
        b2 = 0.57 * b2 + white * 1.0526913;
        data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.045;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.value = 2.0;
      filter.frequency.setValueAtTime(440, now);

      const lfo = this.ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(0.18, now);

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(260, now);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      const breezeGain = this.ctx.createGain();
      breezeGain.gain.setValueAtTime(0.38, now);

      noiseSource.connect(filter);
      filter.connect(breezeGain);
      breezeGain.connect(this.soundscapeGain);

      noiseSource.start(now);
      lfo.start(now);

      this.soundscapeNodes.push(noiseSource, lfo, filter, breezeGain);
    } catch {
      // Audio safety
    }
  }

  /**
   * Soundscape 3: River Ganga
   * Synthesizes gentle river water ripples and flowing current.
   */
  private startRiverGangaSoundscape() {
    if (!this.ctx || !this.soundscapeGain) return;
    const now = this.ctx.currentTime;

    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.075;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.setValueAtTime(700, now);

      const rippleFilter = this.ctx.createBiquadFilter();
      rippleFilter.type = "bandpass";
      rippleFilter.Q.value = 1.8;
      rippleFilter.frequency.setValueAtTime(360, now);

      const lfo = this.ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(0.42, now);

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(120, now);

      lfo.connect(lfoGain);
      lfoGain.connect(rippleFilter.frequency);

      const riverGain = this.ctx.createGain();
      riverGain.gain.setValueAtTime(0.42, now);

      noiseSource.connect(lowpass);
      lowpass.connect(rippleFilter);
      rippleFilter.connect(riverGain);
      riverGain.connect(this.soundscapeGain);

      noiseSource.start(now);
      lfo.start(now);

      this.soundscapeNodes.push(noiseSource, lfo, lowpass, rippleFilter, riverGain);
    } catch {
      // Audio safety
    }
  }

  /**
   * Stops all active soundscape nodes and intervals.
   */
  private stopSoundscape() {
    if (this.bellIntervalId) {
      clearInterval(this.bellIntervalId);
      this.bellIntervalId = null;
    }

    if (this.soundscapeGain && this.ctx) {
      const now = this.ctx.currentTime;
      try {
        this.soundscapeGain.gain.setValueAtTime(this.soundscapeGain.gain.value, now);
        this.soundscapeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      } catch {}
    }

    setTimeout(() => {
      this.soundscapeNodes.forEach((node) => {
        if (typeof node === "object" && node !== null) {
          try {
            if ("stop" in node && typeof (node as AudioScheduledSourceNode).stop === "function") {
              (node as AudioScheduledSourceNode).stop();
            }
            if ("disconnect" in node && typeof (node as AudioNode).disconnect === "function") {
              (node as AudioNode).disconnect();
            }
          } catch {}
        }
      });
      this.soundscapeNodes = [];
    }, 850);
  }

  /**
   * Previews a soundscape for 4 seconds so user can sample it from preferences.
   */
  public previewSoundscape(soundscape: AmbientSoundscape): void {
    this.initContext();
    if (!this.ctx) return;

    if (this.previewTimeoutId) {
      clearTimeout(this.previewTimeoutId);
      this.previewTimeoutId = null;
    }

    // If ambience is already playing, simply switch the soundscape
    if (this.isPlayingAmbience) {
      this.setSoundscape(soundscape);
      return;
    }

    // Standalone preview
    this.stopSoundscape();
    this.isPreviewPlaying = true;
    this.startSoundscape(soundscape);

    this.previewTimeoutId = setTimeout(() => {
      this.stopSoundscape();
      this.isPreviewPlaying = false;
      this.previewTimeoutId = null;
    }, 4000);
  }

  /**
   * Starts 432Hz / 136.1Hz Cosmic Om Tanpura drone synthesis oscillators.
   * Only called when user has explicitly enabled Tanpura drone (disabled by default).
   */
  private startTanpuraOscillators() {
    if (!this.ctx || this.ambientOscillators.length > 0) return;
    const now = this.ctx.currentTime;

    if (!this.ambientGain) {
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.08, now + 2.0);
      this.ambientGain.connect(this.ctx.destination);
    } else {
      try {
        this.ambientGain.gain.cancelScheduledValues(now);
        this.ambientGain.gain.setValueAtTime(0.001, now);
        this.ambientGain.gain.exponentialRampToValueAtTime(0.08, now + 1.2);
      } catch {}
    }

    // Fundamental 136.1 Hz (Cosmic Om Frequency) & 432Hz harmonic overtones
    const freqs = [136.1, 204.15, 272.2, 408.3];
    this.ambientOscillators = freqs.map((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      osc.type = idx % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, now);

      const subGain = this.ctx!.createGain();
      subGain.gain.setValueAtTime(1 / (idx + 1.5), now);

      osc.connect(subGain);
      subGain.connect(this.ambientGain!);
      osc.start(now);
      return osc;
    });
  }

  /**
   * Fades out and stops Tanpura drone oscillators while keeping ambient soundscape running.
   */
  private stopTanpuraOscillators() {
    if (this.ambientGain && this.ctx) {
      const now = this.ctx.currentTime;
      try {
        this.ambientGain.gain.cancelScheduledValues(now);
        this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
        this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      } catch {}
    }

    setTimeout(() => {
      this.ambientOscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {}
      });
      this.ambientOscillators = [];
    }, 850);
  }

  /**
   * Start or toggle peaceful ambient audio (Soundscapes + optional Tanpura drone).
   * Note: The 432Hz/136.1Hz Tanpura drone layer is DISABLED by default.
   */
  public toggleTanpuraDrone(): boolean {
    this.initContext();
    if (!this.ctx) return false;

    if (this.isPlayingAmbience) {
      this.stopTanpuraDrone();
      return false;
    }

    // 1. Start selected background ambient soundscape ('Temple Bell', 'Himalayan Breeze', or 'River Ganga')
    this.startSoundscape(this.currentSoundscape);

    // 2. Only start Tanpura drone oscillators IF user has explicitly enabled it (disabled by default!)
    if (this.isTanpuraEnabled) {
      this.startTanpuraOscillators();
    }

    this.isPlayingAmbience = true;
    return true;
  }

  public stopTanpuraDrone() {
    this.stopSoundscape();
    this.stopTanpuraOscillators();
    this.isPlayingAmbience = false;
  }

  public getIsPlayingDrone(): boolean {
    return this.isPlayingAmbience;
  }
}

export const soundEngine = new MeditativeSoundEngine();
