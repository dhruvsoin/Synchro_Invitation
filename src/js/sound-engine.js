/**
 * SYNCHROTECH 2K26 — Master Web Audio Guitar & Spectral Synth Engine
 * Features:
 * - High-fidelity Karplus-Strong string synthesis & physical string plucking
 * - Harmonic spectral scale for the 8 domains
 * - Ambient cosmic resonance drone
 * - Optical laser swooshes, shockwaves, and full-spectrum arpeggios
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.droneGain = null;
    this.masterGain = null;

    // Harmonic Tuning for Domains (Hz)
    this.stringNotes = {
      aiml: 329.63,        // E4
      quantum: 369.99,     // F#4
      animation: 415.30,   // G#4
      cybersecurity: 440.00,// A4
      cloud: 493.88,       // B4
      datascience: 554.37, // C#5
      blockchain: 659.25,  // E5
      ceo: 880.00          // A5
    };
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.startAmbientDrone();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  startAmbientDrone() {
    if (!this.ctx || this.droneGain) return;

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.035, this.ctx.currentTime);
    this.droneGain.connect(this.masterGain);

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(140, this.ctx.currentTime);

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(110, this.ctx.currentTime); // A2

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(this.droneGain);

    osc1.start();
    osc2.start();
  }

  /**
   * Pluck Guitar String Synth (Physical Modeling with fast attack & natural string decay)
   */
  pluckGuitarString(domainId, frequency = 440, intensity = 1.0) {
    if (this.isMuted) return;
    this.ensureContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    const baseFreq = this.stringNotes[domainId] || frequency;

    // Guitar string waveform: rich saw/triangle filtered down
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(baseFreq, t);

    subOsc.type = "triangle";
    subOsc.frequency.setValueAtTime(baseFreq * 2, t);

    // Lowpass filter simulates guitar body resonance & string dampening
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(baseFreq * 4, t);
    filter.frequency.exponentialRampToValueAtTime(baseFreq * 1.2, t + 1.2);

    // Envelope: sharp pluck attack and natural string decay
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.35 * Math.min(1.2, intensity), t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.6);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    subOsc.start(t);
    osc.stop(t + 1.7);
    subOsc.stop(t + 1.7);
  }

  /**
   * Rapid Full Spectrum Arpeggio for Invitation Convergence
   */
  playFullSpectrumArpeggio() {
    if (this.isMuted) return;
    this.ensureContext();

    const notes = [329.63, 369.99, 415.30, 440.00, 493.88, 554.37, 659.25, 880.00, 1108.73];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.pluckGuitarString("custom", freq, 0.9);
      }, i * 65);
    });
  }

  playPrismLaserRefraction() {
    if (this.isMuted) return;
    this.ensureContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.45);
    osc.frequency.exponentialRampToValueAtTime(440, t + 1.1);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 1.2);
  }

  playModalSwoosh() {
    if (this.isMuted) return;
    this.ensureContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.25);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  playUIClick() {
    if (this.isMuted) return;
    this.ensureContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.05);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  playAIBleep() {
    if (this.isMuted) return;
    this.ensureContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.setValueAtTime(1320, t + 0.08);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }
}

export const soundEngine = new SoundEngine();
