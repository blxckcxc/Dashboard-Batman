// Motor holográfico 2.5D: um único canvas WebGL cobre o palco e desenha cada holograma no retângulo
// do seu elemento de ancoragem (slot), que o CSS posiciona. Shader: arte oficial com contorno de luz,
// linhas de varredura, cintilação e feixe de escaneamento; modos realista, wireframe (bordas Sobel) e
// raio-x (luminância invertida); glitch de transição, mistura entre ângulos e dissolução por ruído.
import { ASSETS } from '../_gerado/assets.js';

const VS = `attribute vec2 p;
uniform vec4 uRet;
varying vec2 vUv;
void main() {
  vUv = p;
  gl_Position = vec4((uRet.xy + p * uRet.zw) * 2.0 - 1.0, 0.0, 1.0);
}`;

const FS = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vUv;
uniform sampler2D uA;
uniform sampler2D uB;
uniform vec4 uFitA;
uniform vec4 uFitB;
uniform vec4 uSubA;
uniform vec4 uSubB;
uniform float uPainelA;
uniform float uPainelB;
uniform float uMix;
uniform float uDiss;
uniform float uGlitch;
uniform float uModo;
uniform float uT;
uniform float uFeixe;
uniform float uRefl;
uniform float uAlfa;
uniform float uSemente;
uniform float uTremor;
uniform vec3 uCor;
uniform vec2 uRes;
uniform vec3 uZoom;

float h1(float n) { return fract(sin(n) * 43758.5453); }
float h2(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float ruido(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h2(i), h2(i + vec2(1.0, 0.0)), f.x), mix(h2(i + vec2(0.0, 1.0)), h2(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) { s += a * ruido(p); p *= 2.03; a *= 0.5; }
  return s;
}
float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

// amostra a imagem encaixada no slot (fit: x0 y0 largura altura, origem embaixo) e recortada (sub)
vec4 tex(sampler2D s, vec2 uv, vec4 fit, vec4 sub, float painel) {
  vec2 t = (uv - fit.xy) / fit.zw;
  if (t.x < 0.0 || t.y < 0.0 || t.x > 1.0 || t.y > 1.0) return vec4(0.0);
  vec4 c = texture2D(s, vec2(sub.x + t.x * sub.z, sub.y + (1.0 - t.y) * sub.w));
  if (painel > 0.5) { vec2 b = min(t, 1.0 - t); c *= smoothstep(0.0, 0.05, min(b.x, b.y)); }
  return c;
}

vec4 camada(sampler2D s, vec2 uv, vec4 fit, vec4 sub, float painel) {
  vec2 o = 1.5 / uRes;
  vec4 c = tex(s, uv, fit, sub, painel);
  if (uGlitch > 0.02) {
    c.r = tex(s, uv + vec2(0.012 * uGlitch, 0.0), fit, sub, painel).r;
    c.b = tex(s, uv - vec2(0.012 * uGlitch, 0.0), fit, sub, painel).b;
  }
  vec4 n1 = tex(s, uv + vec2(-o.x, o.y), fit, sub, painel);
  vec4 n2 = tex(s, uv + vec2(0.0, o.y), fit, sub, painel);
  vec4 n3 = tex(s, uv + vec2(o.x, o.y), fit, sub, painel);
  vec4 n4 = tex(s, uv + vec2(-o.x, 0.0), fit, sub, painel);
  vec4 n5 = tex(s, uv + vec2(o.x, 0.0), fit, sub, painel);
  vec4 n6 = tex(s, uv + vec2(-o.x, -o.y), fit, sub, painel);
  vec4 n7 = tex(s, uv + vec2(0.0, -o.y), fit, sub, painel);
  vec4 n8 = tex(s, uv + vec2(o.x, -o.y), fit, sub, painel);
  float l1 = luma(n1.rgb) + n1.a * 0.35;
  float l2 = luma(n2.rgb) + n2.a * 0.35;
  float l3 = luma(n3.rgb) + n3.a * 0.35;
  float l4 = luma(n4.rgb) + n4.a * 0.35;
  float l5 = luma(n5.rgb) + n5.a * 0.35;
  float l6 = luma(n6.rgb) + n6.a * 0.35;
  float l7 = luma(n7.rgb) + n7.a * 0.35;
  float l8 = luma(n8.rgb) + n8.a * 0.35;
  float gx = (l3 + 2.0 * l5 + l8) - (l1 + 2.0 * l4 + l6);
  float gy = (l1 + 2.0 * l2 + l3) - (l6 + 2.0 * l7 + l8);
  float borda = sqrt(gx * gx + gy * gy);
  vec2 r = 5.0 / uRes;
  float aH = (tex(s, uv + vec2(r.x, 0.0), fit, sub, painel).a + tex(s, uv - vec2(r.x, 0.0), fit, sub, painel).a
    + tex(s, uv + vec2(0.0, r.y), fit, sub, painel).a + tex(s, uv - vec2(0.0, r.y), fit, sub, painel).a) * 0.25;
  float aro = clamp((c.a - aH) * 1.6, 0.0, 1.0);
  float halo = clamp(aH - c.a, 0.0, 1.0);
  vec3 base = c.a > 0.001 ? c.rgb / c.a : vec3(0.0);
  float l = luma(base);
  float ty = clamp((uv.y - fit.y) / fit.w, 0.0, 1.0);
  if (uModo < 0.5) {
    vec3 g = mix(vec3(l), base, 1.12);
    g = (g - 0.5) * 1.1 + 0.52;
    g = mix(g, g * vec3(0.78, 0.9, 1.12), 0.4 * (1.0 - l));
    g *= 0.74 + 0.42 * smoothstep(0.05, 1.0, ty);
    return vec4(clamp(g, 0.0, 1.2) * c.a + uCor * (aro * 0.5 * c.a + halo * 0.4), c.a + halo * 0.4);
  }
  if (uModo < 1.5) {
    float linha = smoothstep(0.22, 0.62, borda);
    float k = fract(l * 5.0);
    float iso = (1.0 - smoothstep(0.0, 0.06, min(k, 1.0 - k))) * c.a * 0.14;
    vec2 gp = fract(gl_FragCoord.xy / 18.0);
    float grade = (step(gp.x, 0.06) + step(gp.y, 0.06)) * 0.07 * c.a;
    float a = clamp(linha + iso + grade + c.a * 0.05 + halo * 0.3, 0.0, 1.0);
    return vec4(uCor * a * (1.0 + linha * 0.4), a);
  }
  float d = smoothstep(0.1, 0.95, 1.0 - l);
  vec3 p = mix(vec3(0.02, 0.09, 0.26), vec3(0.12, 0.52, 0.95), smoothstep(0.05, 0.5, d));
  p = mix(p, vec3(0.86, 0.97, 1.0), smoothstep(0.55, 1.0, d));
  float linha = smoothstep(0.12, 0.5, borda);
  p += vec3(0.7, 0.9, 1.0) * linha * 0.5;
  float a = clamp(c.a * (0.28 + 0.72 * d) + linha * 0.35 * c.a + halo * 0.3, 0.0, 1.0);
  return vec4(p * a, a);
}

void main() {
  vec2 uv = vUv;
  if (uRefl > 0.5) uv.y = 1.0 - uv.y;
  uv = uZoom.xy + (uv - uZoom.xy) / uZoom.z;
  uv.x += uTremor * (h1(floor(uT * 40.0)) - 0.5) * 0.006;
  if (uGlitch > 0.001) {
    float r = h1(floor(uv.y * 38.0) + floor(uT * 22.0) * 7.31);
    uv.x += (r - 0.5) * 0.14 * uGlitch * step(0.6, r);
  }
  vec4 a = camada(uA, uv, uFitA, uSubA, uPainelA);
  vec4 cor = a;
  if (uMix > 0.001 || uDiss > 0.001) {
    vec4 b = camada(uB, uv, uFitB, uSubB, uPainelB);
    if (uDiss > 0.001) {
      float n = fbm(vUv * vec2(7.0, 7.0 * uRes.y / uRes.x) + uSemente);
      cor = mix(b, a, smoothstep(uDiss - 0.035, uDiss + 0.035, n));
      float e = (1.0 - smoothstep(0.0, 0.05, abs(n - uDiss))) * step(uDiss, 0.999) * max(a.a, b.a);
      cor += vec4(vec3(1.0, 0.62, 0.1) * e * 1.4, e * 0.6);
    } else {
      cor = mix(a, b, uMix);
    }
  }
  float scan = (uModo < 0.5 ? 0.9 : 0.82) + (uModo < 0.5 ? 0.1 : 0.18) * sin(gl_FragCoord.y * 1.3 - uT * 5.0);
  float flick = 0.95 + 0.05 * h1(floor(uT * 16.0)) - 0.18 * step(0.992, h1(floor(uT * 7.0) + uSemente));
  cor *= scan * flick;
  float fy = uFeixe >= 0.0 ? uFeixe : fract(uT * 0.16 + uSemente * 0.37) * 1.3 - 0.15;
  float feixe = exp(-pow((vUv.y - fy) * uRes.y / 7.0, 2.0));
  cor.rgb += uCor * feixe * (cor.a * 0.9 + 0.05);
  cor.a += feixe * 0.05;
  if (uRefl > 0.5) cor *= 0.22 * smoothstep(0.5, 1.0, vUv.y);
  gl_FragColor = cor * uAlfa;
}`;

const UNIFORMES = ['uRet', 'uA', 'uB', 'uFitA', 'uFitB', 'uSubA', 'uSubB', 'uPainelA', 'uPainelB', 'uMix', 'uDiss', 'uGlitch', 'uModo',
  'uT', 'uFeixe', 'uRefl', 'uAlfa', 'uSemente', 'uTremor', 'uCor', 'uRes', 'uZoom'];
const MODOS = { real: 0, wire: 1, xray: 2 };
const INTEIRO = [0, 0, 1, 1];

// encaixe "contain" da imagem no slot, alinhada à base ou ao centro (frações do slot, origem embaixo)
function encaixe(asp, sw, sh, alinhar, escala) {
  const as = sw / sh;
  let w = 1;
  let h = 1;
  if (asp > as) h = as / asp;
  else w = asp / as;
  w *= escala;
  h *= escala;
  return [(1 - w) / 2, alinhar === 'base' ? 0 : (1 - h) / 2, w, h];
}

export class Slot {
  constructor(motor, el, op = {}) {
    this.motor = motor;
    this.el = el;
    Object.assign(this, {
      a: null, b: null, mix: 0, diss: 0, glitch: 0, feixe: -1, modo: 'real', cor: [0.36, 0.86, 1.0],
      alfa: 1, refl: false, zoom: [0.5, 0.5, 1], tremor: 0, semente: Math.random() * 40, ativo: true,
    }, op);
  }

  // camada: { chave, sub, painel, alinhar, escala }
  definir(a, b = null) {
    this.a = a;
    this.b = b;
    if (!this.motor.gl && this.el) {
      this.el.style.backgroundImage = a ? `url(${ASSETS[a.chave]})` : 'none';
    }
  }

  // posição de um ponto da imagem A (x e y de 0 a 1 a partir do topo) em porcentagem do slot
  pontoNaImagem(x, y) {
    const e = this.motor.entrada(this.a && this.a.chave);
    const r = this.el.getBoundingClientRect();
    if (!this.a || !e || !r.width) return null;
    const sub = this.a.sub || INTEIRO;
    const f = encaixe((e.w * sub[2]) / (e.h * sub[3]), r.width, r.height, this.a.alinhar || 'base', this.a.escala || 1);
    let u = f[0] + x * f[2];
    let v = f[1] + (1 - y) * f[3];
    const [cx, cy, s] = this.zoom;
    u = cx + (u - cx) * s;
    v = cy + (v - cy) * s;
    return { x: u * 100, y: (1 - v) * 100, px: r.left + u * r.width, py: r.top + (1 - v) * r.height };
  }
}

export class Motor {
  constructor(canvas) {
    this.canvas = canvas;
    this.slots = [];
    this.tarefas = new Set();
    this.cache = new Map();
    this.t = 0;
    let gl = null;
    const op = { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' };
    try {
      gl = canvas.getContext('webgl2', op);
      this.webgl2 = !!gl;
      if (!gl) gl = canvas.getContext('webgl', op);
    } catch (e) {
      gl = null;
    }
    this.gl = gl;
    if (!gl) return;
    const prog = gl.createProgram();
    for (const [tipo, src] of [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, FS]]) {
      const sh = gl.createShader(tipo);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(sh));
      gl.attachShader(prog, sh);
    }
    gl.linkProgram(prog);
    gl.useProgram(prog);
    this.u = {};
    for (const n of UNIFORMES) this.u[n] = gl.getUniformLocation(prog, n);
    gl.uniform1i(this.u.uA, 0);
    gl.uniform1i(this.u.uB, 1);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    this.vazia = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.vazia);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  }

  slot(el, op) {
    const s = new Slot(this, el, op);
    this.slots.push(s);
    return s;
  }

  entrada(chave) {
    const e = chave && this.cache.get(chave);
    return e && e.tex ? e : null;
  }

  // textura carregada sob demanda a partir do data URL embutido; as menos usadas saem do cache
  textura(chave) {
    let e = this.cache.get(chave);
    if (!e) {
      e = { tex: null, w: 1, h: 1, uso: this.t };
      this.cache.set(chave, e);
      const img = new Image();
      img.onload = () => {
        const gl = this.gl;
        e.tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, e.tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        if (this.webgl2) {
          gl.generateMipmap(gl.TEXTURE_2D);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        } else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        e.w = img.naturalWidth;
        e.h = img.naturalHeight;
        this.podar();
      };
      img.src = ASSETS[chave] || '';
    }
    e.uso = this.t;
    return e;
  }

  // pré-carrega as texturas de uma lista de chaves
  preparar(chaves) {
    if (!this.gl) return;
    for (const c of chaves) if (c) this.textura(c);
  }

  podar() {
    if (this.cache.size <= 56) return;
    const velhas = [...this.cache.entries()].filter(([, e]) => e.tex && e.uso < this.t - 4).sort((x, y) => x[1].uso - y[1].uso);
    for (const [k, e] of velhas.slice(0, this.cache.size - 48)) {
      this.gl.deleteTexture(e.tex);
      this.cache.delete(k);
    }
  }

  iniciar(aoFps) {
    let ant = performance.now();
    let acum = 0;
    let quadros = 0;
    const loop = (agora) => {
      const dt = Math.min(0.1, Math.max(0, (agora - ant) / 1000));
      ant = agora;
      this.t += dt;
      for (const f of this.tarefas) f(dt, this.t);
      if (this.gl) this.desenhar();
      acum += dt;
      quadros += 1;
      if (acum >= 0.5) {
        aoFps(quadros / acum);
        acum = 0;
        quadros = 0;
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  desenhar() {
    const gl = this.gl;
    const cr = this.canvas.getBoundingClientRect();
    if (cr.width < 2 || cr.height < 2) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const W = Math.round(cr.width * dpr);
    const H = Math.round(cr.height * dpr);
    if (this.canvas.width !== W || this.canvas.height !== H) {
      this.canvas.width = W;
      this.canvas.height = H;
    }
    gl.viewport(0, 0, W, H);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(this.u.uT, this.t);
    for (const s of this.slots) {
      if (!s.ativo || !s.a || !s.el.isConnected) continue;
      const r = s.el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      const x = (r.left - cr.left) / cr.width;
      const y = 1 - (r.bottom - cr.top) / cr.height;
      const w = r.width / cr.width;
      const h = r.height / cr.height;
      if (x > 1 || x + w < 0 || y > 1 || y + h < -h) continue;
      this.desenharSlot(s, [x, y, w, h], r.width * dpr, r.height * dpr, 0);
      if (s.refl) this.desenharSlot(s, [x, y - h, w, h], r.width * dpr, r.height * dpr, 1);
    }
  }

  camada(unidade, c, sw, sh, sufixo) {
    const gl = this.gl;
    const e = c ? this.textura(c.chave) : null;
    gl.activeTexture(unidade ? gl.TEXTURE1 : gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, e && e.tex ? e.tex : this.vazia);
    const sub = (c && c.sub) || INTEIRO;
    const asp = e && e.tex ? (e.w * sub[2]) / (e.h * sub[3]) : 1;
    gl.uniform4fv(this.u[`uFit${sufixo}`], encaixe(asp, sw, sh, (c && c.alinhar) || 'base', (c && c.escala) || 1));
    gl.uniform4fv(this.u[`uSub${sufixo}`], sub);
    gl.uniform1f(this.u[`uPainel${sufixo}`], c && c.painel ? 1 : 0);
  }

  desenharSlot(s, ret, sw, sh, refl) {
    const gl = this.gl;
    const u = this.u;
    gl.uniform4fv(u.uRet, ret);
    this.camada(0, s.a, sw, sh, 'A');
    const usaB = s.b && (s.mix > 0.001 || s.diss > 0.001);
    this.camada(1, usaB ? s.b : null, sw, sh, 'B');
    gl.uniform1f(u.uMix, usaB ? s.mix : 0);
    gl.uniform1f(u.uDiss, usaB ? s.diss : 0);
    gl.uniform1f(u.uGlitch, s.glitch);
    gl.uniform1f(u.uModo, MODOS[s.modo] || 0);
    gl.uniform1f(u.uFeixe, s.feixe);
    gl.uniform1f(u.uRefl, refl);
    gl.uniform1f(u.uAlfa, s.alfa);
    gl.uniform1f(u.uSemente, s.semente);
    gl.uniform1f(u.uTremor, s.tremor);
    gl.uniform3fv(u.uCor, s.cor);
    gl.uniform2f(u.uRes, sw, sh);
    gl.uniform3fv(u.uZoom, [s.zoom[0], s.zoom[1], s.zoom[2]]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
