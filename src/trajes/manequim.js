// Manequim 3D procedural dos trajes. O corpo é montado por lofts verticais (pernas, pelve, tronco,
// braços e cabeça) e recebe peças por preset: capuz com orelhas paramétricas, lentes, emblema extrudado,
// placas de armadura, cinto modular, manoplas com aletas, botas e capa animada por vértice.
// Convenção: a figura fica em pé sobre a origem, de frente para +Z, com cerca de 2,9 unidades de altura.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { loft, lamina } from '../veiculos/loft.js';
import { relevo } from './texturas.js';

// loft ao longo do eixo X convertido para vertical: X vira altura, Z vira largura e Y vira profundidade
const PARA_VERTICAL = new THREE.Matrix4().set(0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1);
// loft convertido para horizontal na direção da frente (pés): X vira profundidade
const PARA_FRENTE = new THREE.Matrix4().set(0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1);

function escalar(v, k) {
  if (typeof v === 'number') return v * k;
  if (Array.isArray(v)) return v.map(([u, x]) => [u, x * k]);
  return (u) => v(u) * k;
}

// y0 e y1 são as alturas; largura é a meia largura em X; frente e tras são as extensões em +Z e -Z
function loftV({ y0, y1, largura, frente, tras, ombro = 0.5, nFrente = 2.3, nTras = 2.3, vinco = 0, segU = 48, segV = 40, dx = 0, porte = 1 }) {
  const { geo } = loft({
    x0: y0, x1: y1,
    topo: escalar(frente, porte), base: escalar(tras, porte), largura: escalar(largura, porte),
    ombro, nTopo: nFrente, nBase: nTras, vinco, deslocZ: dx, segU, segV,
  });
  geo.applyMatrix4(PARA_VERTICAL);
  return geo;
}

function malha(geo, mat, papel = 'traje') {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  m.userData.papel = papel;
  return m;
}

// ── materiais ──────────────────────────────────────────────────────────────
function materiais(p) {
  const c = p.cores;
  const tecido = new THREE.MeshPhysicalMaterial({
    color: c.traje, roughness: 0.62, metalness: 0.12, sheen: 0.35, sheenColor: new THREE.Color(c.brilho || 0x1e3a8a),
    bumpMap: relevo(p.textura || 'tecido', p.textura === 'hexagonal' ? [10, 14] : p.textura === 'carbono' ? [14, 20] : [8, 8]),
    bumpScale: p.textura === 'tecido' || !p.textura ? 0.3 : 1.1,
  });
  const armadura = new THREE.MeshPhysicalMaterial({
    color: c.armadura ?? c.traje, roughness: 0.34, metalness: 0.72, clearcoat: 0.6, clearcoatRoughness: 0.25,
    bumpMap: relevo('placas', [3, 4]), bumpScale: 0.5, envMapIntensity: 1.2,
  });
  const capuz = new THREE.MeshPhysicalMaterial({ color: c.capuz, roughness: 0.36, metalness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.2, envMapIntensity: 1.1 });
  const capa = new THREE.MeshPhysicalMaterial({
    color: c.capa, roughness: 0.72, metalness: 0.05, sheen: 1, sheenColor: new THREE.Color(c.capaBrilho || 0x334155),
    sheenRoughness: 0.6, side: THREE.DoubleSide,
  });
  const luva = new THREE.MeshPhysicalMaterial({ color: c.luvas ?? c.capuz, roughness: 0.4, metalness: 0.3, clearcoat: 0.5 });
  const bota = new THREE.MeshPhysicalMaterial({ color: c.botas ?? c.luvas ?? c.capuz, roughness: 0.42, metalness: 0.3, clearcoat: 0.5 });
  const cinto = new THREE.MeshPhysicalMaterial({ color: c.cinto, roughness: 0.35, metalness: 0.65, clearcoat: 0.6 });
  const emblema = new THREE.MeshPhysicalMaterial({
    color: c.emblema, roughness: 0.3, metalness: 0.4, clearcoat: 1,
    emissive: c.emblemaBrilho ? c.emblema : 0x000000, emissiveIntensity: c.emblemaBrilho || 0,
  });
  const fundoEmblema = new THREE.MeshPhysicalMaterial({ color: c.emblemaFundo ?? 0xfacc15, roughness: 0.35, metalness: 0.2, clearcoat: 1 });
  const lente = new THREE.MeshStandardMaterial({ color: c.lentes, emissive: c.lentes, emissiveIntensity: 2.6 });
  const pele = new THREE.MeshStandardMaterial({ color: c.pele ?? 0xc99a78, roughness: 0.62 });
  const interno = new THREE.MeshStandardMaterial({ color: 0x9a6b1f, bumpMap: relevo('hexagonal', [10, 14]), bumpScale: 1 });
  return { tecido, armadura, capuz, capa, luva, bota, cinto, emblema, fundoEmblema, lente, pele, interno };
}

// ── emblemas ───────────────────────────────────────────────────────────────
// Morcego simétrico a partir de uma lista de pontos da metade direita (x >= 0), largura total ~1.
function morcego(meia) {
  const s = new THREE.Shape();
  const pts = [...meia, ...meia.slice().reverse().map(([x, y]) => [-x, y])];
  pts.forEach(([x, y], i) => (i === 0 ? s.moveTo(x, y) : s.lineTo(x, y)));
  return s;
}

export const MORCEGOS = {
  classico: [[0, 0.14], [0.05, 0.2], [0.08, 0.12], [0.2, 0.18], [0.5, 0.2], [0.42, 0.06], [0.34, 0.02], [0.28, -0.08], [0.18, -0.04], [0.1, -0.16], [0, -0.1]],
  miller: [[0, 0.1], [0.05, 0.2], [0.08, 0.1], [0.24, 0.16], [0.5, 0.26], [0.46, 0.04], [0.34, -0.02], [0.3, -0.14], [0.2, -0.08], [0.12, -0.2], [0, -0.12]],
  beyond: [[0, 0.2], [0.04, 0.26], [0.07, 0.16], [0.24, 0.22], [0.5, 0.36], [0.38, 0.1], [0.26, 0.02], [0.14, -0.12], [0.08, -0.34], [0, -0.22]],
  angular: [[0, 0.12], [0.06, 0.22], [0.09, 0.1], [0.3, 0.2], [0.5, 0.18], [0.36, 0.04], [0.3, -0.06], [0.16, -0.02], [0.08, -0.18], [0, -0.1]],
  machado: [[0, 0.26], [0.06, 0.34], [0.1, 0.2], [0.3, 0.3], [0.5, 0.44], [0.46, 0.1], [0.3, -0.02], [0.16, -0.14], [0.08, -0.4], [0, -0.3]],
  lorde: [[0, 0.16], [0.07, 0.24], [0.1, 0.12], [0.32, 0.16], [0.5, 0.1], [0.3, -0.02], [0.16, -0.06], [0.06, -0.2], [0, -0.14]],
};

// ── peças ──────────────────────────────────────────────────────────────────
function orelha({ altura, largura, curva = 0 }, mat) {
  const c = [[-largura / 2, 0], [largura * 0.1 + curva * 0.5, altura * 0.55], [curva, altura], [largura / 2, 0]];
  const geo = lamina(c, 0.028, 0.008, curva !== 0);
  return malha(geo, mat, 'capuz');
}

function lenteForma(tipo) {
  const s = new THREE.Shape();
  if (tipo === 'fenda') {
    s.moveTo(-0.028, 0.004); s.lineTo(0.03, 0.012); s.lineTo(0.026, -0.004); s.lineTo(-0.024, -0.008);
  } else if (tipo === 'redonda') {
    s.absellipse(0, 0, 0.018, 0.014, 0, Math.PI * 2);
  } else {
    s.moveTo(-0.03, 0.006); s.lineTo(0.03, 0.02); s.lineTo(0.022, -0.012); s.lineTo(-0.024, -0.012);
  }
  return new THREE.ShapeGeometry(s);
}

// Capa: grade que cai dos ombros, alarga para baixo, tem dobras e barra recortada; balança com o tempo.
class Capa {
  constructor(p, mat) {
    this.p = p;
    this.nu = 36;
    this.nv = 30;
    const geo = new THREE.PlaneGeometry(1, 1, this.nu, this.nv);
    this.geo = geo;
    this.malha = malha(geo, mat, 'capa');
    this.malha.castShadow = true;
    this.atualizar(0);
  }

  atualizar(t) {
    const { larguraTopo, larguraBase, topo, base, recortes, dobras, curva } = this.p;
    const pos = this.geo.attributes.position;
    for (let j = 0; j <= this.nv; j += 1) {
      const v = j / this.nv;
      for (let i = 0; i <= this.nu; i += 1) {
        const u = i / this.nu;
        const s = u * 2 - 1;
        const larg = larguraTopo + (larguraBase - larguraTopo) * Math.pow(v, 0.8);
        const x = s * larg / 2;
        // barra recortada: pontas entre os recortes descem mais
        const recorte = recortes ? Math.abs(Math.sin(u * recortes * Math.PI)) * 0.16 * v * v : 0;
        const y = topo + (base - topo) * v - recorte;
        let z = -0.16 - curva * v - 0.1 * Math.pow(v, 2) + (0.14 * s * s) * (1 - v) * 1.4;
        z += Math.sin(u * dobras * Math.PI * 2) * 0.035 * v;
        z += Math.sin(t * 1.3 + v * 3 + u * 2) * 0.025 * v * v;
        pos.setXYZ(j * (this.nu + 1) + i, x, y, z);
      }
    }
    pos.needsUpdate = true;
    this.geo.computeVertexNormals();
  }
}

// ── manequim humano ────────────────────────────────────────────────────────
function humano(p, m) {
  const g = new THREE.Group();
  const k = p.porte ?? 1;
  const ko = (p.ombros ?? 1) * k;
  const pecas = { lentes: [], peitoral: [], cinto: [], luvas: [], capa: [] };
  const ancoras = {};

  // pernas e botas
  for (const lado of [1, -1]) {
    const perna = loftV({
      y0: 0.08, y1: 1.42, porte: k,
      largura: [[0, 0.065], [0.1, 0.075], [0.25, 0.11], [0.45, 0.08], [0.55, 0.1], [0.8, 0.145], [1, 0.15]],
      frente: [[0, 0.07], [0.25, 0.1], [0.45, 0.095], [0.8, 0.13], [1, 0.12]],
      tras: [[0, -0.06], [0.25, -0.12], [0.45, -0.07], [0.8, -0.12], [1, -0.14]],
    });
    const mp = malha(perna, m.tecido);
    mp.position.x = lado * 0.17 * k;
    mp.rotation.z = lado * 0.05;
    g.add(mp);
    const cano = loftV({
      y0: 0.02, y1: 0.66, porte: k,
      largura: [[0, 0.085], [0.4, 0.125], [0.85, 0.105], [1, 0.1]],
      frente: [[0, 0.1], [0.4, 0.12], [1, 0.11]], tras: [[0, -0.08], [0.4, -0.135], [1, -0.1]],
    });
    const mc = malha(cano, m.bota, 'bota');
    mc.position.x = lado * 0.2 * k;
    g.add(mc);
    const { geo: pe } = loft({
      x0: -0.1, x1: 0.3, topo: [[0, 0.16], [0.4, 0.14], [0.8, 0.08], [1, 0.05]], base: 0,
      largura: [[0, 0.07], [0.5, 0.085], [0.9, 0.065], [1, 0.03]], ombro: 0.1, nTopo: 2.2, nBase: 6, segU: 24, segV: 24,
    });
    pe.applyMatrix4(PARA_FRENTE);
    const mpe = malha(pe, m.bota, 'bota');
    mpe.position.set(lado * 0.2 * k, 0, 0.02);
    mpe.scale.setScalar(k);
    g.add(mpe);
    if (p.joelheiras) {
      const j = malha(new RoundedBoxGeometry(0.15, 0.17, 0.06, 3, 0.025), m.armadura, 'armadura');
      j.scale.setScalar(k);
      j.rotation.x = -0.1;
      j.position.set(lado * 0.185 * k, 0.72, 0.085 * k);
      g.add(j);
    }
  }

  // pelve e tronco
  g.add(malha(loftV({
    y0: 1.3, y1: 1.64, porte: k * (p.cintura ?? 1),
    largura: [[0, 0.25], [0.5, 0.27], [1, 0.24]], frente: [[0, 0.13], [1, 0.14]], tras: [[0, -0.15], [0.5, -0.17], [1, -0.14]],
  }), m.tecido));
  const troncoGeo = loftV({
    y0: 1.55, y1: 2.5, porte: 1,
    largura: [[0, 0.24 * k * (p.cintura ?? 1)], [0.3, 0.27 * k], [0.55, 0.33 * ko], [0.7, 0.36 * ko], [0.85, 0.38 * ko], [0.95, 0.26 * ko], [1, 0.12 * k]],
    frente: [[0, 0.14 * k], [0.3, 0.15 * k], [0.6, 0.2 * k], [0.75, 0.21 * k], [0.88, 0.16 * k], [1, 0.09 * k]],
    tras: [[0, -0.14 * k], [0.4, -0.15 * k], [0.7, -0.17 * k], [0.88, -0.15 * k], [1, -0.08 * k]],
    ombro: 0.45, nFrente: 2.3, nTras: 2.2, segU: 60, segV: 48,
    // sulco do esterno e separação dos peitorais
    vinco: [[0, 0], [0.4, -0.006], [0.62, -0.02], [0.8, -0.018], [0.95, 0]],
  });
  g.add(malha(troncoGeo, m.tecido));
  // camada balística interna, visível só no raio-X
  const malhaInt = malha(troncoGeo.clone(), m.interno, 'interno');
  malhaInt.scale.set(0.94, 0.98, 0.9);
  malhaInt.position.y = 0.03;
  g.add(malhaInt);
  const frenteTorax = 0.21 * k;
  ancoras.peitoral = new THREE.Vector3(0.12 * k, 2.18, frenteTorax + 0.06);

  // ombros
  for (const lado of [1, -1]) {
    const d = malha(new THREE.SphereGeometry(0.135, 24, 16), m.tecido);
    d.scale.setScalar(ko);
    d.position.set(lado * 0.4 * ko, 2.3, -0.01);
    g.add(d);
    if (p.ombreiras) {
      // ombreira em calota, achatada e inclinada para fora
      const o = malha(new THREE.SphereGeometry(0.17, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.5), m.armadura, 'armadura');
      o.material.side = THREE.DoubleSide;
      o.scale.set(ko * 1.15, ko * 0.7, ko * 1.05);
      o.position.set(lado * 0.42 * ko, 2.33, -0.01);
      o.rotation.z = -lado * 0.45;
      g.add(o);
      pecas.peitoral.push(o);
      const aba = malha(new THREE.SphereGeometry(0.19, 28, 8, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.12), m.armadura, 'armadura');
      aba.material.side = THREE.DoubleSide;
      aba.scale.set(ko * 1.1, ko * 0.9, ko * 1.0);
      aba.position.copy(o.position).add(new THREE.Vector3(lado * 0.02, -0.02, 0));
      aba.rotation.z = -lado * 0.45;
      g.add(aba);
    }
  }

  // braços: ombro, braço, cotovelo, antebraço, manopla e punho
  for (const lado of [1, -1]) {
    const ombro = new THREE.Group();
    ombro.position.set(lado * 0.42 * ko, 2.32, 0);
    ombro.rotation.z = lado * (p.aberturaBracos ?? 0.2);
    const braco = malha(loftV({
      y0: -0.58, y1: 0.02, porte: k,
      largura: [[0, 0.065], [0.35, 0.085], [0.6, 0.095], [1, 0.1]], frente: [[0, 0.06], [0.55, 0.1], [1, 0.09]], tras: [[0, -0.065], [0.5, -0.09], [1, -0.08]],
    }), m.tecido);
    ombro.add(braco);
    const cotovelo = new THREE.Group();
    cotovelo.position.y = -0.56;
    cotovelo.rotation.x = -0.18;
    cotovelo.rotation.z = lado * 0.05;
    cotovelo.add(malha(loftV({
      y0: -0.5, y1: 0.02, porte: k,
      largura: [[0, 0.05], [0.6, 0.078], [1, 0.066]], frente: [[0, 0.045], [0.6, 0.07], [1, 0.06]], tras: [[0, -0.045], [0.6, -0.07], [1, -0.065]],
    }), m.tecido));
    const manopla = malha(loftV({
      y0: -0.47, y1: -0.1, porte: k * 1.12,
      largura: [[0, 0.052], [0.6, 0.078], [1, 0.07]], frente: [[0, 0.05], [0.6, 0.072], [1, 0.066]], tras: [[0, -0.05], [0.6, -0.072], [1, -0.068]],
    }), m.luva, 'luva');
    cotovelo.add(manopla);
    pecas.luvas.push(manopla);
    // aletas da manopla, do lado de fora
    const nAletas = p.aletas ?? 3;
    for (let i = 0; i < nAletas; i += 1) {
      const comp = p.laminas ? 0.2 : 0.11;
      const al = malha(lamina([[0, 0], [0.09, 0], [0.02, comp]], 0.012, 0.004, false), m.luva, 'luva');
      al.rotation.z = -lado * Math.PI / 2 - lado * 0.5;
      al.rotation.y = lado * Math.PI / 2;
      al.position.set(lado * 0.075 * k, -0.2 - i * 0.075, -0.02);
      cotovelo.add(al);
      pecas.luvas.push(al);
    }
    const punho = malha(new RoundedBoxGeometry(0.1, 0.13, 0.11, 3, 0.035), m.luva, 'luva');
    punho.scale.setScalar(k);
    punho.position.set(0, -0.56, 0.01);
    cotovelo.add(punho);
    if (p.garras) {
      for (let i = 0; i < 3; i += 1) {
        const gr = malha(new THREE.ConeGeometry(0.012, 0.22, 6), m.armadura, 'armadura');
        gr.position.set(-0.03 + i * 0.03, -0.7, 0.04);
        gr.rotation.x = Math.PI;
        cotovelo.add(gr);
      }
    }
    ombro.add(cotovelo);
    g.add(ombro);
    if (lado === 1) ancoras.luvas = new THREE.Vector3(0.62 * ko, 1.3, 0.12);
  }

  // armadura: placas peitorais e abdominais
  if (p.placas) {
    for (const lado of [1, -1]) {
      const peit = malha(new RoundedBoxGeometry(0.28 * ko, 0.22, 0.05, 3, 0.03), m.armadura, 'armadura');
      peit.position.set(lado * 0.15 * ko, 2.16, frenteTorax + 0.005);
      peit.rotation.y = lado * 0.28;
      peit.rotation.x = -0.12;
      g.add(peit);
      pecas.peitoral.push(peit);
      for (let i = 0; i < 3; i += 1) {
        const ab = malha(new RoundedBoxGeometry(0.1 * k, 0.09, 0.035, 3, 0.017), m.armadura, 'armadura');
        ab.position.set(lado * 0.065 * k, 1.9 - i * 0.12, 0.15 * k);
        g.add(ab);
        pecas.peitoral.push(ab);
      }
    }
  }

  // emblema no peito
  if (p.emblema) {
    const e = p.emblema;
    const larg = (e.largura ?? 0.36) * ko;
    const grupo = new THREE.Group();
    if (e.oval) {
      const oval = new THREE.Shape();
      oval.absellipse(0, 0, larg * 0.62, larg * 0.38, 0, Math.PI * 2);
      const mo = malha(new THREE.ExtrudeGeometry(oval, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2 }), m.fundoEmblema, 'emblema');
      grupo.add(mo);
    }
    const bat = morcego(MORCEGOS[e.forma || 'classico']);
    const mb = malha(new THREE.ExtrudeGeometry(bat, { depth: 0.014, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.004, bevelSegments: 2 }), m.emblema, 'emblema');
    mb.scale.set(larg * (e.oval ? 0.95 : 1), larg * (e.oval ? 0.95 : 1), 1);
    mb.position.z = e.oval ? 0.014 : 0;
    grupo.add(mb);
    grupo.position.set(0, e.altura ?? 2.16, frenteTorax + (p.placas ? 0.03 : 0.004));
    grupo.rotation.x = -0.12;
    g.add(grupo);
    pecas.peitoral.push(grupo);
  }

  // cinto de utilidades
  if (p.cinto) {
    const faixa = malha(loftV({
      y0: 1.5, y1: 1.6, porte: k * (p.cintura ?? 1) * 1.07,
      largura: 0.255, frente: 0.15, tras: -0.155, segU: 6, segV: 48,
    }), m.cinto, 'cinto');
    g.add(faixa);
    pecas.cinto.push(faixa);
    const n = p.cinto.bolsos ?? 8;
    for (let i = 0; i < n; i += 1) {
      const a = -Math.PI * 0.85 + (i / (n - 1)) * Math.PI * 1.7;
      if (Math.abs(a) < 0.25) continue;
      const bolso = p.cinto.capsulas
        ? malha(new THREE.CapsuleGeometry(0.028, 0.06, 4, 10), m.cinto, 'cinto')
        : malha(new RoundedBoxGeometry(0.075, 0.085, 0.05, 2, 0.015), m.cinto, 'cinto');
      const rx = 0.28 * k * (p.cintura ?? 1);
      const rz = 0.17 * k;
      bolso.position.set(Math.sin(a) * rx, 1.55, Math.cos(a) * rz);
      bolso.rotation.y = a;
      g.add(bolso);
      pecas.cinto.push(bolso);
    }
    if (p.cinto.coldres) {
      for (const lado of [1, -1]) {
        const coldre = malha(new RoundedBoxGeometry(0.08, 0.22, 0.06, 2, 0.02), m.cinto, 'cinto');
        coldre.position.set(lado * 0.27 * k, 1.36, 0.02);
        g.add(coldre);
        pecas.cinto.push(coldre);
      }
    }
    const fivela = malha(new RoundedBoxGeometry(0.1, 0.075, 0.03, 2, 0.012), p.cinto.fivelaEmblema ? m.emblema : m.cinto, 'cinto');
    fivela.position.set(0, 1.55, 0.16 * k * (p.cintura ?? 1) * 1.07);
    g.add(fivela);
    pecas.cinto.push(fivela);
    ancoras.cinto = new THREE.Vector3(0.14, 1.55, 0.2 * k);
  }

  // pescoço e cabeça (capuz)
  g.add(malha(loftV({ y0: 2.42, y1: 2.66, largura: 0.1, frente: 0.09, tras: -0.085, porte: k * 0.95 }), m.capuz, 'capuz'));
  const cabeca = new THREE.Group();
  const cap = p.capuz;
  const kc = (cap.escala ?? 1) * 1.18;
  const capuzGeo = loftV({
    y0: 2.56, y1: 2.56 + 0.42 * kc,
    largura: [[0, 0.075], [0.25, 0.108], [0.55, 0.124], [0.8, 0.115], [0.95, 0.07], [1, 0.02]].map(([u, x]) => [u, x * kc]),
    frente: [[0, 0.095], [0.3, 0.128], [0.55, 0.138], [0.8, 0.12], [0.95, 0.07], [1, 0.02]].map(([u, x]) => [u, x * kc]),
    tras: [[0, -0.06], [0.3, -0.11], [0.6, -0.128], [0.9, -0.08], [1, -0.02]].map(([u, x]) => [u, x * kc]),
    nFrente: cap.angular ? 4 : 2.3, nTras: 2.3, segU: 40, segV: 40,
  });
  const capuzMalha = malha(capuzGeo, m.capuz, 'capuz');
  cabeca.add(capuzMalha);
  pecas.lentes.push(capuzMalha);
  if (cap.boca) {
    const rosto = malha(loftV({
      y0: 2.555, y1: 2.555 + 0.145 * kc, largura: [[0, 0.072], [0.5, 0.086], [1, 0.084]], frente: [[0, 0.112], [0.5, 0.134], [1, 0.13]], tras: -0.02, ombro: 0.6, nFrente: 3,
    }), m.pele, 'pele');
    rosto.scale.set(kc, 1, kc);
    cabeca.add(rosto);
  }
  if (cap.orelhas) {
    for (const lado of [1, -1]) {
      const o = orelha({ altura: cap.orelhas.altura * kc, largura: (cap.orelhas.largura ?? 0.07) * 1.5 * kc, curva: lado * (cap.orelhas.curva ?? 0) }, m.capuz);
      o.position.set(lado * 0.075 * kc, 2.56 + 0.34 * kc, -0.005);
      o.rotation.z = -lado * (cap.orelhas.abertura ?? 0.12);
      cabeca.add(o);
      pecas.lentes.push(o);
    }
  }
  if (cap.crista) {
    const cr = malha(lamina([[0, 0], [0.16, 0.05], [0.02, 0.24], [-0.16, 0.05]], 0.03, 0.01), m.capuz, 'capuz');
    cr.rotation.y = Math.PI / 2;
    cr.position.set(0, 2.9, -0.02);
    cabeca.add(cr);
  }
  for (const lado of [1, -1]) {
    const l = malha(lenteForma(cap.lentes || 'padrao'), m.lente, 'luz');
    l.position.set(lado * 0.046 * kc, 2.56 + 0.24 * kc, 0.128 * kc + 0.004);
    l.scale.set(lado * kc, kc, 1);
    l.rotation.y = lado * 0.4;
    cabeca.add(l);
    pecas.lentes.push(l);
  }
  g.add(cabeca);
  ancoras.lentes = new THREE.Vector3(0.05, 2.82, 0.2);

  // capa
  let capa = null;
  if (p.capa) {
    capa = new Capa({
      larguraTopo: 0.72 * ko, larguraBase: (p.capa.largura ?? 1.6) * ko, topo: 2.42, base: p.capa.base ?? 0.32,
      recortes: p.capa.recortes ?? 3, dobras: p.capa.dobras ?? 3, curva: p.capa.curva ?? 0.3,
    }, m.capa);
    g.add(capa.malha);
    pecas.capa.push(capa.malha);
    ancoras.capa = new THREE.Vector3(-0.45 * ko, 1.5, -0.4);
  }
  return { grupo: g, cabeca, capuzMalha, capa, pecas, ancoras };
}

// ── minifigura LEGO ────────────────────────────────────────────────────────
function minifig(p, m) {
  const g = new THREE.Group();
  const pecas = { lentes: [], peitoral: [], cinto: [], luvas: [], capa: [] };
  const s = 2.9 / 4.0;
  const bloco = (w, h, d, mat, pos, papel = 'traje') => {
    const b = malha(new RoundedBoxGeometry(w * s, h * s, d * s, 2, 0.04 * s), mat, papel);
    b.position.set(pos[0] * s, pos[1] * s, pos[2] * s);
    g.add(b);
    return b;
  };
  for (const lado of [1, -1]) {
    bloco(0.62, 1.1, 0.8, m.bota, [lado * 0.33, 0.55, 0.05], 'bota');
    bloco(0.62, 0.42, 0.75, m.tecido, [lado * 0.33, 1.3, 0]);
  }
  bloco(1.3, 0.28, 0.72, m.cinto, [0, 1.62, 0], 'cinto');
  pecas.cinto.push(g.children[g.children.length - 1]);
  // tronco trapezoidal
  const tr = new THREE.Shape();
  tr.moveTo(-0.66, 0); tr.lineTo(0.66, 0); tr.lineTo(0.5, 1.2); tr.lineTo(-0.5, 1.2); tr.lineTo(-0.66, 0);
  const troncoGeo = new THREE.ExtrudeGeometry(tr, { depth: 0.66, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2 });
  troncoGeo.translate(0, 0, -0.33);
  troncoGeo.scale(s, s, s);
  const tronco = malha(troncoGeo, m.tecido);
  tronco.position.y = 1.76 * s;
  g.add(tronco);
  // emblema oval com morcego
  const oval = new THREE.Shape();
  oval.absellipse(0, 0, 0.36 * s, 0.2 * s, 0, Math.PI * 2);
  const emb = new THREE.Group();
  emb.add(malha(new THREE.ExtrudeGeometry(oval, { depth: 0.01, bevelEnabled: false }), m.fundoEmblema, 'emblema'));
  const bat = malha(new THREE.ExtrudeGeometry(morcego(MORCEGOS.classico), { depth: 0.012, bevelEnabled: false }), m.emblema, 'emblema');
  bat.scale.set(0.6 * s, 0.6 * s, 1);
  bat.position.z = 0.012;
  emb.add(bat);
  emb.position.set(0, 2.4 * s, 0.38 * s);
  g.add(emb);
  pecas.peitoral.push(emb);
  // braços dobrados e mãos em garra
  for (const lado of [1, -1]) {
    const braco = malha(new THREE.CylinderGeometry(0.17 * s, 0.2 * s, 0.9 * s, 20), m.tecido);
    braco.position.set(lado * 0.78 * s, 2.45 * s, 0.05 * s);
    braco.rotation.z = lado * 0.25;
    braco.rotation.x = -0.3;
    g.add(braco);
    const mao = malha(new THREE.TorusGeometry(0.14 * s, 0.06 * s, 10, 20, Math.PI * 1.5), m.luva, 'luva');
    mao.position.set(lado * 0.92 * s, 1.96 * s, 0.22 * s);
    mao.rotation.set(Math.PI / 2, 0, lado * 0.8);
    g.add(mao);
    pecas.luvas.push(mao);
  }
  // cabeça cilíndrica com capuz de orelhas
  const cabeca = new THREE.Group();
  const face = malha(new THREE.CylinderGeometry(0.4 * s, 0.4 * s, 0.7 * s, 32), m.pele, 'pele');
  face.position.y = 3.3 * s;
  cabeca.add(face);
  const capuzMalha = malha(new THREE.CylinderGeometry(0.45 * s, 0.45 * s, 0.62 * s, 32, 1, false, Math.PI * 0.2, Math.PI * 1.6), m.capuz, 'capuz');
  capuzMalha.position.y = 3.45 * s;
  capuzMalha.rotation.y = Math.PI;
  cabeca.add(capuzMalha);
  const tampa = malha(new THREE.SphereGeometry(0.45 * s, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), m.capuz, 'capuz');
  tampa.position.y = 3.76 * s;
  tampa.scale.y = 0.4;
  cabeca.add(tampa);
  for (const lado of [1, -1]) {
    const o = malha(lamina([[-0.07, 0], [0.07, 0], [0.01, 0.42]], 0.05, 0.01, false), m.capuz, 'capuz');
    o.scale.setScalar(s);
    o.position.set(lado * 0.26 * s, 3.8 * s, 0);
    o.rotation.z = -lado * 0.1;
    cabeca.add(o);
    pecas.lentes.push(o);
    const l = malha(lenteForma('padrao'), m.lente, 'luz');
    l.scale.set(lado * 1.6, 1.6, 1);
    l.position.set(lado * 0.15 * s, 3.5 * s, 0.455 * s);
    cabeca.add(l);
    pecas.lentes.push(l);
  }
  pecas.lentes.push(capuzMalha);
  g.add(cabeca);
  // capa rígida
  const capa = new Capa({ larguraTopo: 1.2 * s, larguraBase: 1.6 * s, topo: 2.9 * s, base: 0.5 * s, recortes: 3, dobras: 0, curva: 0.05 }, m.capa);
  capa.malha.position.z = -0.12;
  g.add(capa.malha);
  pecas.capa.push(capa.malha);
  return {
    grupo: g, cabeca, capuzMalha, capa, pecas,
    ancoras: { lentes: new THREE.Vector3(0.1, 3.5 * s, 0.5 * s), peitoral: new THREE.Vector3(0.12, 2.4 * s, 0.5 * s), cinto: new THREE.Vector3(0.2, 1.62 * s, 0.35 * s), luvas: new THREE.Vector3(0.8 * s, 1.96 * s, 0.35 * s), capa: new THREE.Vector3(-0.5 * s, 1.6 * s, -0.35) },
  };
}

// ── entrada ────────────────────────────────────────────────────────────────
export function construirManequim(p) {
  const m = materiais(p);
  const r = p.tipo === 'lego' ? minifig(p, m) : humano(p, m);
  r.grupo.traverse((o) => {
    if (o.isMesh) o.userData.manequim = true;
  });
  r.materiais = m;
  r.atualizar = (dt, t) => {
    if (r.capa) r.capa.atualizar(t);
  };
  return r;
}
