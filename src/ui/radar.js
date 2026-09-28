// Radar da Batcaverna: varredura circular com contatos que surgem e esmaecem.
export class Radar {
  constructor(canvas) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.contatos = [];
    this.ang = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || 170;
    canvas.width = w * dpr;
    canvas.height = w * dpr;
    this.ctx.scale(dpr, dpr);
    this.w = w;
    let ult = performance.now();
    const loop = (agora) => {
      const dt = Math.min(0.05, (agora - ult) / 1000);
      ult = agora;
      this.desenhar(dt);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  desenhar(dt) {
    const { ctx, w } = this;
    const r = w / 2 - 4;
    const cx = w / 2;
    const cy = w / 2;
    this.ang = (this.ang + dt * 1.6) % (Math.PI * 2);
    ctx.clearRect(0, 0, w, w);
    ctx.fillStyle = 'rgba(7,10,14,0.85)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56,189,248,0.35)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i += 1) {
      ctx.beginPath();
      ctx.arc(cx, cy, (r * i) / 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx - r, cy);
    ctx.lineTo(cx + r, cy);
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx, cy + r);
    ctx.stroke();

    // feixe de varredura
    const grad = ctx.createConicGradient ? ctx.createConicGradient(this.ang - 0.9, cx, cy) : null;
    if (grad) {
      grad.addColorStop(0, 'rgba(6,182,212,0)');
      grad.addColorStop(0.14, 'rgba(6,182,212,0.45)');
      grad.addColorStop(0.1432, 'rgba(6,182,212,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(56,189,248,0.9)';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(this.ang) * r, cy + Math.sin(this.ang) * r);
    ctx.stroke();

    if (Math.random() < dt * 1.2) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * r * 0.9;
      this.contatos.push({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, vida: 1, ambar: Math.random() < 0.3 });
    }
    for (let i = this.contatos.length - 1; i >= 0; i -= 1) {
      const p = this.contatos[i];
      p.vida -= dt * 0.35;
      if (p.vida <= 0) {
        this.contatos.splice(i, 1);
        continue;
      }
      ctx.fillStyle = p.ambar ? `rgba(245,158,11,${p.vida})` : `rgba(56,189,248,${p.vida})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
