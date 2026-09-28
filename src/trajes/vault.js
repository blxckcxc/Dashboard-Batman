// Vault de trajes em turnaround: três pedestais (costas, frente e perfil) com o manequim 3D da variante,
// giro da figura central por arraste, dissolução do capuz com borda âmbar e estudo explodido das peças.
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { construirManequim } from './manequim.js';
import { registrar } from '../core/modos.js';

const CIANO = 0x38bdf8;
const AMBAR = 0xf59e0b;
const easeOut = (x) => 1 - Math.pow(1 - x, 3);

function rotulo(texto, classe = 'cad-rotulo') {
  const div = document.createElement('div');
  div.className = classe;
  div.textContent = texto;
  return new CSS2DObject(div);
}

function pedestal(raio, forte) {
  const g = new THREE.Group();
  const corpo = new THREE.Mesh(
    new THREE.CylinderGeometry(raio, raio * 1.08, 0.28, 72),
    new THREE.MeshStandardMaterial({ color: 0x0c1119, metalness: 0.92, roughness: 0.28 }),
  );
  corpo.position.y = 0.14;
  corpo.receiveShadow = true;
  g.add(corpo);
  const topo = new THREE.Mesh(new THREE.CylinderGeometry(raio * 0.96, raio * 0.96, 0.02, 72), new THREE.MeshStandardMaterial({ color: 0x070a0e, metalness: 0.6, roughness: 0.4 }));
  topo.position.y = 0.29;
  topo.receiveShadow = true;
  g.add(topo);
  const aneis = [];
  for (const [r, y, cor, op] of [[raio * 0.98, 0.3, CIANO, forte ? 1 : 0.8], [raio * 1.07, 0.02, AMBAR, 0.75], [raio * 0.72, 0.305, CIANO, 0.45]]) {
    const a = new THREE.Mesh(new THREE.TorusGeometry(r, forte ? 0.018 : 0.012, 8, 128), new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: op, blending: THREE.AdditiveBlending }));
    a.rotation.x = Math.PI / 2;
    a.position.y = y;
    g.add(a);
    aneis.push(a);
  }
  // halo vertical suave saindo do pedestal
  const halo = new THREE.Mesh(
    new THREE.CylinderGeometry(raio * 0.95, raio * 0.95, 0.9, 64, 1, true),
    new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
      uniforms: { cor: { value: new THREE.Color(CIANO) } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform vec3 cor; varying vec2 vUv; void main(){ gl_FragColor = vec4(cor, pow(1.0 - vUv.y, 3.0) * 0.18); }',
    }),
  );
  halo.position.y = 0.75;
  g.add(halo);
  g.userData.aneis = aneis;
  return g;
}

// dissolução por ruído em espaço de objeto, com borda âmbar incandescente
function comDissolucao(material) {
  const mat = material.clone();
  mat.userData.dissolver = { value: 0 };
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uDissolver = mat.userData.dissolver;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vPosD;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPosD = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec3 vPosD; uniform float uDissolver;
        float hD(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
        float nD(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(mix(hD(i), hD(i + vec3(1,0,0)), f.x), mix(hD(i + vec3(0,1,0)), hD(i + vec3(1,1,0)), f.x), f.y),
                     mix(mix(hD(i + vec3(0,0,1)), hD(i + vec3(1,0,1)), f.x), mix(hD(i + vec3(0,1,1)), hD(i + vec3(1,1,1)), f.x), f.y), f.z); }`)
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
        float ruidoD = nD(vPosD * 38.0) * 0.7 + nD(vPosD * 90.0) * 0.3;
        float corteD = uDissolver * 1.15 - 0.08;
        if (ruidoD < corteD) discard;`)
      .replace('#include <dithering_fragment>', `#include <dithering_fragment>
        float bordaD = (1.0 - smoothstep(0.0, 0.06, ruidoD - corteD)) * step(0.001, uDissolver);
        gl_FragColor.rgb += vec3(1.0, 0.55, 0.08) * bordaD * 3.0;`);
  };
  return mat;
}

export class Vault {
  constructor(cena) {
    this.cena = cena;
    this.grupo = new THREE.Group();
    this.grupo.name = 'vault';
    cena.scene.add(this.grupo);
    this.pedestais = [
      { g: pedestal(1.05, true), pos: [0, 0, 0], rot: 0, escala: 1, nome: 'FRENTE' },
      { g: pedestal(0.8, false), pos: [-2.7, 0, -0.9], rot: Math.PI, escala: 0.8, nome: 'COSTAS' },
      { g: pedestal(0.8, false), pos: [2.7, 0, -0.9], rot: -Math.PI / 2, escala: 0.8, nome: 'PERFIL' },
    ];
    for (const p of this.pedestais) {
      p.g.position.set(...p.pos);
      this.grupo.add(p.g);
      // rótulo acima da cabeça da figura, longe dos painéis inferiores
      const r = rotulo(p.nome, 'cad-rotulo titulo');
      r.position.set(0, p.escala === 1 ? 3.72 : 3.15, 0);
      p.g.add(r);
    }
    // luzes de contorno próprias do vault (ciano à esquerda, âmbar à direita)
    this.luzes = [];
    for (const [cor, x, forca] of [[CIANO, -3.5, 50], [AMBAR, 3.5, 36]]) {
      const l = new THREE.SpotLight(cor, forca, 14, Math.PI / 6, 0.7, 1.4);
      l.position.set(x, 4.6, -3.2);
      l.target.position.set(0, 1.8, 0);
      this.grupo.add(l, l.target);
      this.luzes.push(l);
    }
    this.cache = new Map();
    this.figuras = [];
    this.central = null;
    this.giro = 0;
    this.giroAlvo = 0;
    this.ocioso = 0;
    this.dissolver = 0;
    this.dissolverAlvo = 0;
    this.estudo = null;
    this.arrastar();
  }

  get visivel() {
    return this.grupo.visible;
  }

  set visivel(v) {
    this.grupo.visible = v;
  }

  // giro da figura central por arraste horizontal (a órbita da câmera fica desligada no vault)
  arrastar() {
    const el = this.cena.renderer.domElement;
    let x0 = null;
    el.addEventListener('pointerdown', (e) => {
      if (!this.grupo.visible) return;
      x0 = e.clientX;
    });
    window.addEventListener('pointermove', (e) => {
      if (x0 === null || !this.grupo.visible) return;
      this.giroAlvo += (e.clientX - x0) * 0.012;
      x0 = e.clientX;
      this.ocioso = 0;
    });
    window.addEventListener('pointerup', () => { x0 = null; });
  }

  // monta (ou reaproveita) o manequim da variante nos três pedestais
  mostrar(chave, preset) {
    this.limparEstudo();
    for (const f of this.figuras) f.removeFromParent();
    this.figuras = [];
    let m = this.cache.get(chave);
    if (!m) {
      m = construirManequim(preset);
      // capuz com material próprio para dissolver sem afetar o pescoço
      const matCapuz = comDissolucao(m.materiais.capuz);
      m.cabeca.traverse((o) => {
        if (o.isMesh && o.material === m.materiais.capuz) o.material = matCapuz;
      });
      m.matCapuz = matCapuz;
      // cabeça sem capuz: pele e cabelo, revelada pela dissolução
      const k = m.capuzMalha.geometry;
      k.computeBoundingBox();
      const bb = k.boundingBox;
      const nua = new THREE.Group();
      const pele = new THREE.Mesh(k.clone(), m.materiais.pele);
      pele.scale.set(0.96, 0.97, 0.96);
      pele.position.y = bb.min.y * 0.03;
      pele.userData.papel = 'pele';
      nua.add(pele);
      const cabelo = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), new THREE.MeshStandardMaterial({ color: 0x14100d, roughness: 0.8 }));
      const alt = bb.max.y - bb.min.y;
      cabelo.scale.set((bb.max.x - bb.min.x) * 0.55, alt * 0.62, (bb.max.z - bb.min.z) * 0.56);
      cabelo.position.set(0, bb.max.y - alt * 0.6, (bb.max.z + bb.min.z) * 0.5 - 0.03);
      cabelo.userData.papel = 'pele';
      nua.add(cabelo);
      nua.visible = false;
      nua.name = 'cabecaNua';
      m.cabeca.add(nua);
      // cópias para os pedestais de costas e de perfil, feitas antes do registro dos materiais
      m.copias = [m.grupo.clone(), m.grupo.clone()];
      for (const f of [m.grupo, ...m.copias]) {
        registrar(f);
        f.userData.nua = f.getObjectByName('cabecaNua');
        f.userData.lentes = [];
        f.traverse((o) => {
          if (o.isMesh && o.userData.papel === 'luz') f.userData.lentes.push(o);
        });
      }
      this.cache.set(chave, m);
    }
    this.central = m;
    this.pedestais.forEach((p, i) => {
      const f = i === 0 ? m.grupo : m.copias[i - 1];
      f.position.set(...p.pos).setY(0.3);
      f.rotation.y = p.rot;
      f.scale.setScalar(p.escala);
      this.grupo.add(f);
      this.figuras.push(f);
    });
    this.giro = 0;
    this.giroAlvo = 0;
    this.definirDissolucao(0, true);
    return m;
  }

  definirDissolucao(alvo, imediato = false) {
    this.dissolverAlvo = alvo;
    if (imediato) this.dissolver = alvo;
  }

  // estudo explodido: cópias holográficas das peças do grupo escolhido, separadas em camadas
  estudar(chave, titulo) {
    this.limparEstudo();
    const m = this.central;
    if (!m || !m.pecas[chave] || !m.pecas[chave].length) return false;
    const fig = this.figuras[0];
    fig.updateMatrixWorld(true);
    const g = new THREE.Group();
    const partes = [];
    const centro = new THREE.Vector3();
    const objetos = m.pecas[chave];
    const centros = objetos.map((o) => new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3()));
    centros.forEach((c) => centro.add(c));
    centro.divideScalar(centros.length);
    objetos.forEach((o, i) => {
      o.traverse((q) => {
        if (!q.isMesh || !q.geometry) return;
        const copia = new THREE.Group();
        const geo = q.geometry;
        copia.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: i % 2 ? AMBAR : CIANO, transparent: true, opacity: 0.06, depthWrite: false, blending: THREE.AdditiveBlending })));
        copia.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 24), new THREE.LineBasicMaterial({ color: i % 2 ? AMBAR : CIANO, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending })));
        q.updateMatrixWorld(true);
        copia.applyMatrix4(q.matrixWorld);
        const base = copia.position.clone().sub(centro);
        // camadas: um afastamento radial curto e um passo para a frente por peça
        const dir = centros[i].clone().sub(centro);
        if (dir.lengthSq() < 1e-4) dir.set(0, 0, 1);
        dir.normalize().multiplyScalar(0.08).add(new THREE.Vector3(0, 0, 0.05 * Math.min(i, 6)));
        copia.position.copy(base);
        g.add(copia);
        partes.push({ obj: copia, base, dir });
      });
    });
    // o estudo flutua à direita da figura, ampliado, com linha-guia até a peça
    const destino = new THREE.Vector3(1.3, Math.min(2.7, Math.max(1.35, centro.y + 0.1)), 2.3);
    g.position.copy(destino);
    g.scale.setScalar(1.0);
    g.rotation.x = chave === 'cinto' ? 0.7 : 0.25;
    this.estudoInclinacao = g.rotation.x;
    this.grupo.add(g);
    g.updateMatrixWorld(true);
    const tit = rotulo(`ESTUDO · ${titulo.toUpperCase()}`, 'cad-rotulo titulo');
    tit.position.set(0, 0.62, 0);
    g.add(tit);
    const guia = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([g.worldToLocal(centro.clone()), new THREE.Vector3()]),
      new THREE.LineDashedMaterial({ color: AMBAR, dashSize: 0.06, gapSize: 0.04, transparent: true, opacity: 0.85 }),
    );
    guia.computeLineDistances();
    g.add(guia);
    this.estudo = { grupo: g, partes, t: 0 };
    return true;
  }

  limparEstudo() {
    if (!this.estudo) return;
    this.estudo.grupo.traverse((o) => {
      if (o.element) o.element.remove();
    });
    this.estudo.grupo.removeFromParent();
    this.estudo = null;
  }

  atualizar(dt, t) {
    if (!this.grupo.visible || !this.central) return;
    const m = this.central;
    m.atualizar(dt, t);
    // quando ocioso, a figura central oscila de leve para mostrar o volume
    this.ocioso += dt;
    const osc = this.ocioso > 3 ? Math.sin((this.ocioso - 3) * 0.5) * 0.35 : 0;
    this.giro += (this.giroAlvo + osc - this.giro) * Math.min(1, dt * 5);
    if (this.figuras[0]) this.figuras[0].rotation.y = this.giro;
    // dissolução do capuz
    this.dissolver += (this.dissolverAlvo - this.dissolver) * Math.min(1, dt * 1.4);
    if (Math.abs(this.dissolverAlvo - this.dissolver) < 0.003) this.dissolver = this.dissolverAlvo;
    m.matCapuz.userData.dissolver.value = this.dissolver;
    for (const f of this.figuras) {
      f.userData.nua.visible = this.dissolver > 0.02;
      for (const l of f.userData.lentes) l.visible = this.dissolver < 0.4;
    }
    for (const p of this.pedestais) {
      const [a, , c] = p.g.userData.aneis;
      a.material.opacity = 0.7 + 0.3 * Math.sin(t * 2.2);
      c.rotation.z = t * 0.4;
    }
    if (this.estudo) {
      const e = this.estudo;
      e.t += dt;
      const k = easeOut(Math.min(1, e.t / 1.2));
      const resp = 0.9 + 0.1 * Math.sin(t * 1.5);
      for (const p of e.partes) p.obj.position.copy(p.base).addScaledVector(p.dir, k * resp * 2.2);
      e.grupo.rotation.y = Math.sin(t * 0.4) * 0.3;
    }
  }
}
