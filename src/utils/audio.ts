// Meditative audio engine using Web Audio API
class MeditativeSoundEngine {
  private ctx: AudioContext | null = null;
  private isPlayingAmbience = false;
  private ambientOscillators: OscillatorNode[] = [];
  private ambientGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Play Tibetan singing bowl / temple bell sound
  public playTempleBell(pitch = 220) {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(pitch, now);
    // Slight vibrato / harmonic shimmer
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.998, now + 3.5);

    // Overtone harmonic
    const harmonicOsc = this.ctx.createOscillator();
    const harmonicGain = this.ctx.createGain();
    harmonicOsc.type = "sine";
    harmonicOsc.frequency.setValueAtTime(pitch * 2.76, now);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.0);

    harmonicGain.gain.setValueAtTime(0.1, now);
    harmonicGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

    osc.connect(gain);
    harmonicOsc.connect(harmonicGain);
    gain.connect(this.ctx.destination);
    harmonicGain.connect(this.ctx.destination);

    osc.start(now);
    harmonicOsc.start(now);
    osc.stop(now + 4.0);
    harmonicOsc.stop(now + 2.5);
  }

  // Start or toggle peaceful Tanpura / Om resonant drone (136.1 Hz - OM frequency)
  public toggleTanpuraDrone(): boolean {
    this.initContext();
    if (!this.ctx) return false;

    if (this.isPlayingAmbience) {
      this.stopTanpuraDrone();
      return false;
    }

    const now = this.ctx.currentTime;
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.001, now);
    this.ambientGain.gain.exponentialRampToValueAtTime(0.08, now + 2.0);
    this.ambientGain.connect(this.ctx.destination);

    // Fundamental 136.1 Hz (Cosmic Om Frequency) & harmonics
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

    this.isPlayingAmbience = true;
    return true;
  }

  public stopTanpuraDrone() {
    if (this.ambientGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
      setTimeout(() => {
        this.ambientOscillators.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch (e) {}
        });
        this.ambientOscillators = [];
        this.isPlayingAmbience = false;
      }, 1000);
    }
  }

  public getIsPlayingDrone(): boolean {
    return this.isPlayingAmbience;
  }
}

export const soundEngine = new MeditativeSoundEngine();
