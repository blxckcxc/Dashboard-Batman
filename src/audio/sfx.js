// Design sonoro do Batcomputador, 100% sintetizado com Web Audio API (sem arquivos de áudio).
export class Sfx {
  constructor() {
    this.ctx = null;
    this.mudo = false;
    this.zumbido = null;
  }

  iniciar() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.mestre = this.ctx.createGain();
    this.mestre.gain.value = 0.55;
    const comp = this.ctx.createDynamicsCompressor();
    this.mestre.connect(comp).connect(this.ctx.destination);
    // ruído branco reutilizável
    const n = this.ctx.sampleRate * 2;
    this.ruido = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const d = this.ruido.getChannelData(0);
    for (let i = 0; i < n; i += 1) d[i] = Math.random() * 2 - 1;
  }

  alternarMudo() {
    this.mudo = !this.mudo;
    if (this.mestre) this.mestre.gain.setTargetAtTime(this.mudo ? 0 : 0.55, this.ctx.currentTime, 0.05);
    return this.mudo;
  }

  ok() {
    return this.ctx && !this.mudo;
  }

  tom(freq, ini, dur, { tipo = 'sine', vol = 0.2, ataque = 0.005, freqFim = null } = {}) {
    const c = this.ctx;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = tipo;
    o.frequency.setValueAtTime(freq, ini);
    if (freqFim) o.frequency.exponentialRampToValueAtTime(freqFim, ini + dur);
    g.gain.setValueAtTime(0.0001, ini);
    g.gain.exponentialRampToValueAtTime(vol, ini + ataque);
    g.gain.exponentialRampToValueAtTime(0.0001, ini + dur);
    o.connect(g).connect(this.mestre);
    o.start(ini);
    o.stop(ini + dur + 0.05);
  }

  sopro(ini, dur, { vol = 0.3, filtro = 'bandpass', f0 = 800, f1 = 3000, q = 1 } = {}) {
    const c = this.ctx;
    const s = c.createBufferSource();
    s.buffer = this.ruido;
    s.loop = true;
    const f = c.createBiquadFilter();
    f.type = filtro;
    f.Q.value = q;
    f.frequency.setValueAtTime(f0, ini);
    f.frequency.exponentialRampToValueAtTime(f1, ini + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, ini);
    g.gain.exponentialRampToValueAtTime(vol, ini + dur * 0.15);
    g.gain.exponentialRampToValueAtTime(0.0001, ini + dur);
    s.connect(f).connect(g).connect(this.mestre);
    s.start(ini);
    s.stop(ini + dur + 0.05);
  }

  // bipes de inicialização do supercomputador
  boot() {
    if (!this.ok()) return;
    const t = this.ctx.currentTime;
    [523, 659, 784, 1046, 1318].forEach((f, i) => this.tom(f, t + i * 0.09, 0.14, { tipo: 'square', vol: 0.06 }));
    this.tom(80, t, 1.4, { tipo: 'sawtooth', vol: 0.08, freqFim: 55 });
    this.sopro(t + 0.1, 1.2, { vol: 0.05, f0: 200, f1: 6000, q: 0.7 });
    this.tom(1568, t + 0.6, 0.5, { tipo: 'sine', vol: 0.08 });
  }

  clique() {
    if (!this.ok()) return;
    const t = this.ctx.currentTime;
    this.tom(1800, t, 0.05, { tipo: 'square', vol: 0.05 });
    this.tom(2400, t + 0.03, 0.04, { tipo: 'square', vol: 0.03 });
  }

  transicao() {
    if (!this.ok()) return;
    const t = this.ctx.currentTime;
    this.sopro(t, 0.55, { vol: 0.12, f0: 300, f1: 5000, q: 2 });
    this.tom(220, t, 0.4, { tipo: 'triangle', vol: 0.1, freqFim: 880 });
  }

  // som pneumático de abertura da máscara
  pneumatico() {
    if (!this.ok()) return;
    const t = this.ctx.currentTime;
    this.tom(140, t, 0.12, { tipo: 'square', vol: 0.12, freqFim: 60 });
    this.sopro(t + 0.05, 0.9, { vol: 0.35, filtro: 'highpass', f0: 1200, f1: 400, q: 0.5 });
    this.tom(900, t + 0.7, 0.3, { tipo: 'sine', vol: 0.06, freqFim: 1400 });
  }

  // zumbido do escaneamento de raio-X
  scan() {
    if (!this.ok()) return;
    const c = this.ctx;
    const t = c.currentTime;
    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = 110;
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.Q.value = 8;
    f.frequency.value = 600;
    const lfo = c.createOscillator();
    lfo.frequency.value = 6;
    const lg = c.createGain();
    lg.gain.value = 500;
    lfo.connect(lg).connect(f.frequency);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.1, t + 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    o.connect(f).connect(g).connect(this.mestre);
    o.start(t);
    lfo.start(t);
    o.stop(t + 1.7);
    lfo.stop(t + 1.7);
    this.tom(2200, t + 1.5, 0.12, { tipo: 'sine', vol: 0.05 });
  }

  // ignição da pós-combustão do Batmóvel
  ignicao() {
    if (!this.ok()) return;
    const t = this.ctx.currentTime;
    this.tom(1200, t, 0.06, { tipo: 'square', vol: 0.05 });
    this.sopro(t + 0.08, 0.35, { vol: 0.4, filtro: 'lowpass', f0: 3000, f1: 200, q: 0.8 });
    this.tom(55, t + 0.1, 2.2, { tipo: 'sawtooth', vol: 0.22, freqFim: 38 });
    this.tom(110, t + 0.1, 1.6, { tipo: 'triangle', vol: 0.12, freqFim: 70 });
    this.sopro(t + 0.2, 2.4, { vol: 0.28, filtro: 'bandpass', f0: 400, f1: 1500, q: 0.6 });
  }

  desligar() {
    if (!this.ok()) return;
    const t = this.ctx.currentTime;
    this.tom(300, t, 0.5, { tipo: 'triangle', vol: 0.08, freqFim: 90 });
  }

  transformar() {
    if (!this.ok()) return;
    const t = this.ctx.currentTime;
    for (let i = 0; i < 6; i += 1) this.tom(180 + i * 40, t + i * 0.15, 0.12, { tipo: 'square', vol: 0.06 });
    this.sopro(t, 1.3, { vol: 0.15, filtro: 'bandpass', f0: 200, f1: 900, q: 3 });
  }

  alerta() {
    if (!this.ok()) return;
    const t = this.ctx.currentTime;
    this.tom(880, t, 0.15, { tipo: 'square', vol: 0.05 });
    this.tom(660, t + 0.18, 0.15, { tipo: 'square', vol: 0.05 });
  }
}
