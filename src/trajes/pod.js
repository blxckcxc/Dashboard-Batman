// Pod holográfico do vault de trajes: pedestal, tubo de vidro, anéis de scan e um plano com shader de holograma.
// O shader mistura duas texturas (traje e identidade) com dissolução por ruído e borda âmbar incandescente.
import * as THREE from 'three';
import { MAT, peca } from '../veiculos/kit.js';

const LARGURA = 1.95;
const ALTURA = 2.6;

const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const FS = `
  uniform sampler2D tA; uniform sampler2D tB; uniform vec2 escA; uniform vec2 escB;
  uniform float progresso; uniform float tempo; uniform float glitch; uniform float modo; uniform float surgir;
  varying vec2 vUv;
  float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y); }
  vec2 cobrir(vec2 uv, vec2 e){ return (uv - 0.5) * e + 0.5; }
  void main(){
    vec2 uv = vUv;
    float faixa = step(0.965, h(vec2(floor(uv.y * 38.0), floor(tempo * 14.0))));
    uv.x += (faixa * 0.05 + sin(uv.y * 140.0 + tempo * 40.0) * 0.003) * glitch;
    vec3 a = texture2D(tA, cobrir(uv, escA)).rgb;
    vec3 b = texture2D(tB, cobrir(uv, escB)).rgb;
    if (glitch > 0.01) { a.r = texture2D(tA, cobrir(uv + vec2(0.006 * glitch, 0.0), escA)).r; }
    float ru = n(uv * 7.0 + vec2(0.0, tempo * 0.15)) * 0.75 + n(uv * 29.0) * 0.25;
    float corte = progresso * 1.15 - 0.075;
    float m = smoothstep(corte - 0.015, corte + 0.015, ru);
    vec3 cor = mix(b, a, m);
    float borda = (1.0 - smoothstep(0.0, 0.05, abs(ru - corte))) * step(0.001, progresso) * step(progresso, 0.999);
    cor += vec3(1.0, 0.62, 0.05) * borda * 2.2;
    float scan = 0.93 + 0.07 * sin(uv.y * 950.0 - tempo * 9.0);
    float varredura = smoothstep(0.02, 0.0, abs(fract(uv.y - tempo * 0.12) - 0.5) - 0.48);
    cor = cor * scan * 1.15 + vec3(0.13, 0.83, 0.93) * varredura * 0.25;
    float luma = dot(cor, vec3(0.299, 0.587, 0.114));
    if (modo > 0.5 && modo < 1.5) {
      cor = vec3(0.13, 0.83, 0.93) * (luma * 1.5) + vec3(0.02, 0.1, 0.14);
    } else if (modo > 1.5) {
      cor = mix(vec3(0.05, 0.14, 0.3), vec3(0.9, 0.96, 1.0), smoothstep(0.1, 0.9, 1.0 - luma));
    }
    float vin = smoothstep(0.0, 0.03, uv.x) * smoothstep(1.0, 0.97, uv.x) * smoothstep(0.0, 0.02, uv.y) * smoothstep(1.0, 0.98, uv.y);
    float mat = step(1.0 - surgir, 1.0 - uv.y);
    gl_FragColor = vec4(cor, vin * 0.97 * mat);
  }`;

function escala(aspectoTex) {
  const aspectoPlano = LARGURA / ALTURA;
  return aspectoTex > aspectoPlano ? new THREE.Vector2(aspectoPlano / aspectoTex, 1) : new THREE.Vector2(1, aspectoTex / aspectoPlano);
}

export class Pod {
  constructor(cena) {
    this.cena = cena;
    const g = new THREE.Group();
    const metal = MAT.fosco(0x10151d, 0.95, 0.28);
    const pedestal = peca(new THREE.CylinderGeometry(1.25, 1.45, 0.45, 64), metal, 'metal');
    pedestal.position.y = 0.35;
    g.add(pedestal);
    const topo = peca(new THREE.CylinderGeometry(1.18, 1.25, 0.06, 64), MAT.fosco(0x0b0f17, 1, 0.2), 'metal');
    topo.position.y = 0.6;
    g.add(topo);
    const anelLuz = peca(new THREE.TorusGeometry(1.2, 0.025, 8, 96), MAT.luz(0x06b6d4, 3), 'luz');
    anelLuz.rotation.x = Math.PI / 2;
    anelLuz.position.y = 0.63;
    g.add(anelLuz);

    const tubo = peca(new THREE.CylinderGeometry(1.15, 1.15, 3.1, 64, 1, true), new THREE.MeshPhysicalMaterial({
      color: 0x0e2a44, metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.16, side: THREE.DoubleSide, clearcoat: 1, depthWrite: false,
    }), 'vidro');
    tubo.castShadow = false;
    tubo.position.y = 2.2;
    g.add(tubo);
    const tampa = peca(new THREE.CylinderGeometry(1.25, 1.2, 0.18, 64), metal, 'metal');
    tampa.position.y = 3.82;
    g.add(tampa);
    const anelTopo = peca(new THREE.TorusGeometry(1.2, 0.02, 8, 96), MAT.luz(0xf59e0b, 2.5), 'luz');
    anelTopo.rotation.x = Math.PI / 2;
    anelTopo.position.y = 3.72;
    g.add(anelTopo);
    // colunas de sustentação
    for (let i = 0; i < 4; i += 1) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const col = peca(new THREE.BoxGeometry(0.08, 3.2, 0.08), metal, 'metal');
      col.position.set(Math.cos(a) * 1.2, 2.2, Math.sin(a) * 1.2);
      g.add(col);
    }
    // anéis de escaneamento que percorrem o tubo
    this.aneis = [];
    for (let i = 0; i < 2; i += 1) {
      const r = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.012, 6, 96), new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }));
      r.rotation.x = Math.PI / 2;
      r.userData.ignorarModo = true;
      g.add(r);
      this.aneis.push(r);
    }

    const vazio = new THREE.DataTexture(new Uint8Array([7, 10, 14, 255]), 1, 1);
    vazio.needsUpdate = true;
    this.mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        tA: { value: vazio }, tB: { value: vazio }, escA: { value: new THREE.Vector2(1, 1) }, escB: { value: new THREE.Vector2(1, 1) },
        progresso: { value: 0 }, tempo: { value: 0 }, glitch: { value: 0 }, modo: { value: 0 }, surgir: { value: 1 },
      },
      vertexShader: VS,
      fragmentShader: FS,
    });
    this.plano = new THREE.Mesh(new THREE.PlaneGeometry(LARGURA, ALTURA), this.mat);
    this.plano.position.y = 2.1;
    this.plano.userData.ignorarModo = true;
    g.add(this.plano);

    // halo atrás do holograma
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(LARGURA * 1.35, ALTURA * 1.2), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { cor: { value: new THREE.Color(0x06b6d4) } },
      vertexShader: VS,
      fragmentShader: 'uniform vec3 cor; varying vec2 vUv; void main(){ float d = length((vUv - 0.5) * vec2(1.0, 1.3)); gl_FragColor = vec4(cor, smoothstep(0.55, 0.0, d) * 0.22); }',
    }));
    halo.position.z = -0.05;
    halo.userData.ignorarModo = true;
    this.plano.add(halo);

    this.grupo = g;
    this.progressoAlvo = 0;
    this.glitchT = 0;
    this.surgirT = 1;
  }

  definir(tex, glitchar = true) {
    this.mat.uniforms.tA.value = tex;
    this.mat.uniforms.escA.value = escala(tex.image ? tex.image.width / tex.image.height : 0.75);
    this.mat.uniforms.progresso.value = 0;
    this.progressoAlvo = 0;
    if (glitchar) this.glitchT = 0.6;
  }

  identidade(tex) {
    this.mat.uniforms.tB.value = tex;
    this.mat.uniforms.escB.value = escala(tex.image ? tex.image.width / tex.image.height : 0.8);
  }

  revelar(sim) {
    this.progressoAlvo = sim ? 1 : 0;
  }

  materializar() {
    this.surgirT = 0;
  }

  modo(m) {
    this.mat.uniforms.modo.value = { real: 0, wire: 1, xray: 2 }[m];
  }

  atualizar(dt, t) {
    const u = this.mat.uniforms;
    u.tempo.value = t;
    u.progresso.value += (this.progressoAlvo - u.progresso.value) * Math.min(1, dt * 1.6);
    if (Math.abs(this.progressoAlvo - u.progresso.value) < 0.002) u.progresso.value = this.progressoAlvo;
    this.glitchT = Math.max(0, this.glitchT - dt);
    u.glitch.value = Math.min(1, this.glitchT * 2.5) + 0.04;
    this.surgirT = Math.min(1, this.surgirT + dt * 0.9);
    u.surgir.value = this.surgirT;
    this.aneis.forEach((r, i) => {
      r.position.y = 0.8 + ((t * 0.35 + i * 0.5) % 1) * 2.9;
      r.material.opacity = 0.25 + 0.55 * Math.sin(((t * 0.35 + i * 0.5) % 1) * Math.PI);
    });
    // o holograma sempre encara a câmera no eixo vertical
    const cam = this.cena.camera.position;
    const p = new THREE.Vector3();
    this.plano.getWorldPosition(p);
    this.plano.rotation.y = Math.atan2(cam.x - p.x, cam.z - p.z) - this.grupo.rotation.y;
  }

  // converte coordenadas relativas da imagem (x, y de -0.5 a 0.5) em posição local do plano
  pontoNoPlano(x, y) {
    return new THREE.Vector3(x * LARGURA, y * ALTURA, 0.03);
  }
}
