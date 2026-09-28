// Peças compartilhadas pelos veículos esculpidos: rodas, espelhamento, canopy em bolha, assentos,
// respiros, faróis redondos e casco por loft com material e papel já definidos.
import * as THREE from 'three';
import { MAT, peca, roda } from '../kit.js';
import { loft, tubo } from '../loft.js';

export const V = (x, y, z) => new THREE.Vector3(x, y, z);

export function colocarRoda(cfg, x, z) {
  const r = roda(cfg);
  r.position.set(x, cfg.raio, z);
  if (z < 0) r.rotation.y = Math.PI;
  return r;
}

// quatro rodas simétricas: [x, meia bitola] para cada eixo
export function rodas(g, cfg, eixos) {
  for (const [x, z, cfgEixo] of eixos) {
    const c = { ...cfg, ...(cfgEixo || {}) };
    g.add(colocarRoda(c, x, z), colocarRoda(c, x, -z));
  }
}

// par espelhado de uma peça gerada por uma função (lado = 1 ou -1)
export function espelhar(g, criar) {
  for (const lado of [1, -1]) {
    const o = criar(lado);
    if (o) g.add(o);
  }
}

// casco por loft já com material e papel; devolve a malha e a consulta de altura
export function cascoLoft(op, mat, papel = 'casco') {
  const { geo, consulta } = loft(op);
  const m = peca(geo, mat, papel);
  m.userData.consulta = consulta;
  return m;
}

// Aberturas ovais escuras com borda cromada, assentadas sobre uma superfície.
export function respiro(comp, larg, pos, inclinacao = 0) {
  const g = new THREE.Group();
  const fundo = peca(new THREE.CapsuleGeometry(larg / 2, comp - larg, 6, 16), MAT.fosco(0x020305, 0.2, 0.9), 'casco');
  fundo.rotation.z = Math.PI / 2;
  fundo.scale.set(1, 1, 0.25);
  g.add(fundo);
  g.add(peca(tubo([[-comp / 2, 0, 0], [0, 0, larg / 2], [comp / 2, 0, 0], [0, 0, -larg / 2]], 0.008, 48, true), MAT.cromo(), 'metal'));
  g.position.set(...pos);
  g.rotation.z = inclinacao;
  return g;
}

// Canopy em bolha por loft, com vidro fumê.
export function canopyLoft({ x0, x1, base, topo, largura, cor = 0x1e3a8a, opacidade = 0.5, nTopo = 2.1, deslocZ = 0 }) {
  const { geo } = loft({ x0, x1, base, topo, largura, ombro: 0.02, nTopo, nBase: 2, segU: 60, segV: 48, deslocZ });
  const vidro = new THREE.MeshPhysicalMaterial({
    color: cor, metalness: 0.1, roughness: 0.03, transparent: true, opacity: opacidade,
    clearcoat: 1, side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 1.6,
  });
  const m = peca(geo, vidro, 'vidro');
  m.castShadow = false;
  return m;
}

// Assento em concha com encosto; y é a altura do piso da cabine.
export function assento(x, y, z, escala = 1, cor = 0x1f242d) {
  const g = new THREE.Group();
  const mat = MAT.fosco(cor, 0.1, 0.8);
  const concha = peca(new THREE.CapsuleGeometry(0.16, 0.34, 6, 12), mat, 'cabine');
  concha.rotation.z = Math.PI / 2 + 0.2;
  concha.scale.set(1, 1, 0.8);
  concha.position.set(0.05, 0.12, 0);
  const encosto = peca(new THREE.CapsuleGeometry(0.17, 0.42, 6, 12), mat, 'cabine');
  encosto.rotation.z = -0.35;
  encosto.scale.set(0.55, 1, 0.9);
  encosto.position.set(-0.2, 0.38, 0);
  g.add(concha, encosto);
  g.position.set(x, y, z);
  g.scale.setScalar(escala);
  return g;
}

// Farol redondo com lente emissiva e aro cromado, voltado para +X.
export function farolRedondo(raio, cor, pos, forca = 3) {
  const g = new THREE.Group();
  const lente = peca(new THREE.SphereGeometry(raio, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), MAT.luz(cor, forca), 'luz');
  lente.rotation.z = -Math.PI / 2;
  lente.scale.set(1, 0.45, 1);
  lente.castShadow = false;
  g.add(lente);
  const aro = peca(new THREE.TorusGeometry(raio * 1.02, raio * 0.12, 8, 32), MAT.cromo(), 'metal');
  aro.rotation.y = Math.PI / 2;
  g.add(aro);
  g.position.set(...pos);
  return g;
}

// Friso ou tubo cromado por pontos.
export function friso(pontos, raio = 0.012, mat = MAT.cromo(), papel = 'metal') {
  return peca(tubo(pontos, raio, Math.max(16, pontos.length * 12)), mat, papel);
}

// Faixa emissiva fina ao longo de uma curva (neon de contorno).
export function neon(pontos, cor, raio = 0.01, forca = 3) {
  const m = peca(tubo(pontos, raio, Math.max(24, pontos.length * 16)), MAT.luz(cor, forca), 'luz');
  m.castShadow = false;
  return m;
}
