// Web Audio API Metronome and Note Synthesizer

class AudioEngine {
  private ctx: AudioContext | null = null;
  private activeOscillators: Map<number, { osc: OscillatorNode; gain: GainNode }> = new Map();

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Convert MIDI note number to frequency in Hertz
  public midiToFreq(midiNumber: number): number {
    return 440 * Math.pow(2, (midiNumber - 69) / 12);
  }

  // Plays an acoustic-like piano bell tone when a note is played
  public playNoteTone(midiNumber: number, velocity = 80, durationSeconds = 0.8) {
    try {
      const ctx = this.getContext();
      const freq = this.midiToFreq(midiNumber);
      const now = ctx.currentTime;

      // Primary tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Slightly rich waveform blending
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Overtones
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, now);

      const amp = (velocity / 127) * 0.25;

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(amp, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds);

      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.exponentialRampToValueAtTime(amp * 0.4, now + 0.008);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds * 0.6);

      osc.connect(gain);
      osc2.connect(gain2);
      gain.connect(ctx.destination);
      gain2.connect(ctx.destination);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + durationSeconds);
      osc2.stop(now + durationSeconds);
    } catch {}
  }

  // Play a metronome click (accented high click or regular wood click)
  public playMetronomeClick(isAccent: boolean) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // High pitch woodblock / clave for accent, lower for regular
      const freq = isAccent ? 1400 : 900;
      const duration = isAccent ? 0.045 : 0.035;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + duration);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(isAccent ? 0.35 : 0.18, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }

  // Play a short feedback chime for correct chord/note completion
  public playSuccessChime() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      [72, 76, 79].forEach((m, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(this.midiToFreq(m), now + idx * 0.06);
        gain.gain.setValueAtTime(0.001, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.08, now + idx * 0.06 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.3);
      });
    } catch {}
  }

  // Play subtle wrong buzzer
  public playWrongChime() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.15);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
      gain.gain.linearRampToValueAtTime(0.0001, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch {}
  }
}

export const audioEngine = new AudioEngine();
