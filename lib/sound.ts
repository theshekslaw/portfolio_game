// Sound effects synthesised with the Web Audio API (no audio files). Off until the visitor turns them on; browsers only allow audio after a user
// gesture, so the context is created / resumed from a click (see unlock()).

type Wave = OscillatorType;

// Per-form flavour for the god-mode awakening: the chord stabbed on impact, its voice, and the tail.
interface GodFlavor { root: number; chord: number[]; voice: 'choir' | 'brass' | 'bells' | 'glitch'; taiko: boolean; gong: boolean; sparkle: boolean }
const GOD: Record<string, GodFlavor> = {
  home: { root: 50, chord: [0, 7, 12, 15], voice: 'choir', taiko: false, gong: true, sparkle: false }, // Shrine: choir + gong
  software: { root: 57, chord: [0, 4, 7, 12], voice: 'brass', taiko: true, gong: false, sparkle: false }, // Straw Hat: brass + taiko
  ml: { root: 54, chord: [0, 3, 7, 14], voice: 'bells', taiko: false, gong: false, sparkle: true }, // Arcane: magic sparkle
  cloud: { root: 52, chord: [0, 4, 7, 11], voice: 'bells', taiko: false, gong: true, sparkle: true }, // Solar Seal: bright bells
  llmops: { root: 49, chord: [0, 1, 7, 12], voice: 'glitch', taiko: false, gong: false, sparkle: false }, // Ember: distorted glitch
};
const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

class Sound {
  sfx = false;
  private ctx: AudioContext | null = null;
  private out: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private verb: GainNode | null = null;

  // Called when something loud plays (the god boom) so the music can duck under it.
  onDuck: ((seconds: number) => void) | null = null;

  // Shared AudioContext (also used by the music engine).
  context(): AudioContext | null {
    return this.audio();
  }

  private audio(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
      this.out = this.ctx.createGain();
      this.out.gain.value = 0.45;
      const limiter = this.ctx.createDynamicsCompressor(); // stacked god-mode layers never clip
      limiter.threshold.value = -6;
      limiter.knee.value = 0;
      limiter.ratio.value = 12;
      limiter.attack.value = 0.002;
      limiter.release.value = 0.15;
      this.out.connect(limiter).connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  // Call from a user gesture so later, timer-driven sounds (god mode) are allowed to play.
  unlock() {
    if (this.sfx) this.audio();
  }

  private env(g: GainNode, t: number, peak: number, attack: number, decay: number) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  }

  private tone(wave: Wave, f0: number, f1: number, start: number, dur: number, peak: number, attack = 0.01) {
    const ctx = this.ctx!, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = wave;
    o.frequency.setValueAtTime(f0, start);
    o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), start + dur);
    this.env(g, start, peak, attack, dur);
    o.connect(g).connect(this.out!);
    o.start(start);
    o.stop(start + attack + dur + 0.05);
  }

  private noise(start: number, dur: number, peak: number, filter: BiquadFilterType, f0: number, f1: number, attack = 0.01) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = this.makeNoise();
    f.type = filter;
    f.Q.value = 1.2;
    f.frequency.setValueAtTime(f0, start);
    f.frequency.exponentialRampToValueAtTime(f1, start + attack + dur);
    this.env(g, start, peak, attack, dur);
    src.connect(f).connect(g).connect(this.out!);
    src.start(start);
    src.stop(start + attack + dur + 0.05);
  }

  private makeNoise(): AudioBuffer {
    if (!this.noiseBuf) {
      const ctx = this.ctx!;
      this.noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    return this.noiseBuf;
  }

  private ready() {
    return this.sfx ? this.audio() : null;
  }

  strike() {
    const ctx = this.ready(); if (!ctx) return;
    const t = ctx.currentTime;
    this.tone('sine', 140, 38, t, 0.45, 0.9, 0.005);
    this.noise(t, 0.18, 0.35, 'lowpass', 3000, 200, 0.003);
  }

  don() {
    const ctx = this.ready(); if (!ctx) return;
    const t = ctx.currentTime;
    this.tone('sine', 95, 60, t, 0.35, 0.9, 0.004); // taiko body
    this.noise(t, 0.08, 0.25, 'bandpass', 1800, 600, 0.002); // stick
    this.tone('triangle', 260, 520, t + 0.05, 0.25, 0.18); // boing
  }

  // God-mode awakening: a reverse swell charges up for 0.9 s, then the impact (sub drop, hit, metallic ring and a
  // chord stab in the form's voice), then crackling sparks. Everything also feeds a short reverb.
  god(form: string) {
    const ctx = this.ready(); if (!ctx) return;
    const f = GOD[form] ?? GOD.home, t = ctx.currentTime, hit = t + 0.9, wet = this.room();
    this.onDuck?.(2.4);

    // 1. Charge-up: reverse-cymbal swell + a detuned chord rising into the hit.
    this.swell(t, 0.9, wet);
    for (const iv of [0, 7, 12]) for (const det of [-12, 12]) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sawtooth'; o.detune.value = det;
      o.frequency.setValueAtTime(hz(f.root - 12 + iv), t);
      o.frequency.exponentialRampToValueAtTime(hz(f.root + iv), hit);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.03, hit - 0.02); g.gain.exponentialRampToValueAtTime(0.0001, hit + 0.02);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(300, t); lp.frequency.exponentialRampToValueAtTime(4000, hit);
      o.connect(lp).connect(g); g.connect(this.out!); g.connect(wet);
      o.start(t); o.stop(hit + 0.05);
    }

    // 2. Impact.
    this.tone('sine', 70, 26, hit, 1.3, 1.0, 0.004); // sub drop
    this.tone('sine', 160, 45, hit, 0.25, 0.9, 0.002); // punch
    this.noise(hit, 0.35, 0.5, 'lowpass', 6000, 150, 0.002); // blast
    if (f.taiko) for (const d of [0, 0.16, 0.24]) this.tone('sine', 120, 55, hit + d, 0.4, 0.7, 0.003);
    if (f.gong) this.ring(hit, [hz(f.root - 12), hz(f.root - 12) * 2.76, hz(f.root - 12) * 5.4, hz(f.root - 12) * 8.9], 2.6, 0.12, wet);
    else this.ring(hit, [2960, 4410, 6230], 1.1, 0.05, wet); // sword clash
    this.stab(f, hit, wet);

    // 3. Tail: electric sparks crackling out, plus a shimmer.
    for (let k = 0; k < 18; k++) this.spark(hit + 0.05 + Math.random() * 0.9, wet);
    if (f.sparkle) for (let k = 0; k < 8; k++) this.tone('sine', hz(f.root + 24 + [0, 7, 12, 19][k % 4]), hz(f.root + 24 + [0, 7, 12, 19][k % 4]) * 1.01, hit + 0.1 + k * 0.06, 0.35, 0.05);
  }

  // Short room reverb shared by the god-mode layers.
  private room(): AudioNode {
    if (!this.verb) {
      const ctx = this.ctx!, len = Math.floor(ctx.sampleRate * 1.6), ir = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.5; }
      const conv = ctx.createConvolver(), g = ctx.createGain();
      conv.buffer = ir; g.gain.value = 0.45;
      g.connect(conv).connect(this.out!);
      this.verb = g;
    }
    return this.verb;
  }

  // Reverse cymbal: noise whose level and brightness grow exponentially, cut dead at the hit.
  private swell(t: number, dur: number, wet: AudioNode) {
    const ctx = this.ctx!, src = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = this.makeNoise();
    hp.type = 'highpass'; hp.frequency.setValueAtTime(800, t); hp.frequency.exponentialRampToValueAtTime(6000, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + dur - 0.01); g.gain.linearRampToValueAtTime(0, t + dur);
    src.connect(hp).connect(g); g.connect(this.out!); g.connect(wet);
    src.start(t); src.stop(t + dur + 0.02);
  }

  // Inharmonic metallic ring (gong or sword clash).
  private ring(t: number, freqs: number[], dur: number, vol: number, wet: AudioNode) {
    const ctx = this.ctx!;
    freqs.forEach((fr, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = fr;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol / (1 + i * 0.6), t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur / (1 + i * 0.4));
      o.connect(g); g.connect(this.out!); g.connect(wet);
      o.start(t); o.stop(t + dur + 0.1);
    });
  }

  // The chord stab on impact, voiced per form.
  private stab(f: GodFlavor, t: number, wet: AudioNode) {
    const ctx = this.ctx!, g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(f.voice === 'bells' ? 0.12 : 0.09, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + (f.voice === 'choir' ? 1.6 : 0.8));
    g.connect(this.out!); g.connect(wet);
    let dest: AudioNode = g;
    if (f.voice === 'choir') { // "aah" formants
      const a = ctx.createBiquadFilter(), b = ctx.createBiquadFilter();
      a.type = b.type = 'bandpass'; a.frequency.value = 750; b.frequency.value = 1150; a.Q.value = 3; b.Q.value = 4;
      a.connect(g); b.connect(g);
      const merge = ctx.createGain(); merge.connect(a); merge.connect(b); dest = merge;
    } else if (f.voice === 'brass') {
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(400, t); lp.frequency.exponentialRampToValueAtTime(3500, t + 0.06); lp.frequency.exponentialRampToValueAtTime(900, t + 0.6);
      lp.connect(g); dest = lp;
    } else if (f.voice === 'glitch') {
      const sh = ctx.createWaveShaper(), c = new Float32Array(512);
      for (let i = 0; i < c.length; i++) { const x = (i / 511) * 2 - 1; c[i] = Math.tanh(8 * x); }
      sh.curve = c; sh.connect(g); dest = sh;
    }
    for (const iv of f.chord) for (const det of [-8, 8]) {
      const o = ctx.createOscillator();
      o.type = f.voice === 'bells' ? 'sine' : f.voice === 'glitch' ? 'square' : 'sawtooth';
      o.frequency.value = hz(f.root + iv) * (f.voice === 'bells' ? 2 : 1); o.detune.value = det;
      o.connect(dest); o.start(t); o.stop(t + 1.8);
    }
  }

  // One electric crackle: a tiny bright noise click.
  private spark(t: number, wet: AudioNode) {
    const ctx = this.ctx!, src = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = this.makeNoise();
    hp.type = 'highpass'; hp.frequency.value = 3000 + Math.random() * 5000;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.08 + Math.random() * 0.1, t + 0.001); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.02 + Math.random() * 0.04);
    src.connect(hp).connect(g); g.connect(this.out!); g.connect(wet);
    src.start(t, Math.random()); src.stop(t + 0.08);
  }


}

export const sound = new Sound();
