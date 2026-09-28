// Veículos de filmes, jogos e quadrinhos esculpidos por loft facetado e placas chanfradas:
// Tumbler, Batpod, tanque de O Cavaleiro das Trevas, Batmóvel de Arkham Knight e jato do Lorde Batman.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { MAT, peca, turbina, farol, internos } from '../kit.js';
import { lamina } from '../loft.js';
import { V, colocarRoda, espelhar, cascoLoft, canopyLoft, assento, friso, neon } from './base.js';

// material fosco com sombreamento plano: realça as facetas das placas
function facetado(cor, metal = 0.5, rug = 0.6) {
  const m = MAT.fosco(cor, metal, rug);
  m.flatShading = true;
  return m;
}

const LATAO = () => new THREE.MeshStandardMaterial({ color: 0xb08d57, metalness: 1, roughness: 0.3 });

// placa chanfrada a partir de um contorno 2D (x, y), com espessura em Z
function placa(contorno, espessura, mat, pos = [0, 0, 0], rot = [0, 0, 0], papel = 'casco') {
  const m = peca(lamina(contorno, espessura, Math.min(0.02, espessura * 0.3), false), mat, papel);
  m.position.set(...pos);
  m.rotation.set(...rot);
  return m;
}

// Tumbler (Batman Begins e O Cavaleiro das Trevas): casco facetado preto fosco, pneus traseiros enormes,
// rodas dianteiras em braços expostos com amortecedores de latão, abas no nariz e jato traseiro.
export function tumbler() {
  const g = new THREE.Group();
  const fosco = facetado(0x17191d, 0.45, 0.66);
  const escuro = facetado(0x0d0f12, 0.5, 0.55);
  const vidro = MAT.vidro(0x0b1320);
  g.add(cascoLoft({
    x0: -2.2, x1: 2.45,
    topo: [[0, 1.2], [0.2, 1.46], [0.5, 1.52], [0.72, 1.28], [0.88, 0.96], [1, 0.66]],
    base: [[0, 0.46], [0.5, 0.42], [1, 0.5]],
    largura: [[0, 0.7], [0.25, 0.82], [0.6, 0.78], [0.85, 0.62], [1, 0.42]],
    larguraBase: 0.62, ombro: 0.38, nTopo: 6, nBase: 6, inclinar: 0.34,
    segU: 20, segV: 10,
  }, fosco));
  // placas do teto e da cabine, com fendas de visão
  g.add(placa([[-0.9, 0], [0.6, 0], [0.9, 0.34], [-0.5, 0.42]], 0.07, escuro, [0, 1.46, 0.05], [Math.PI / 2, 0, 0]));
  espelhar(g, (lado) => placa([[0.2, 0], [1.2, 0], [1.05, 0.34], [0.35, 0.26]], 0.05, vidro, [0, 1.12, lado * 0.66], [0, 0, 0], 'vidro'));
  espelhar(g, (lado) => placa([[-2.0, 0], [-0.6, 0], [-0.9, 0.62], [-1.9, 0.5]], 0.08, fosco, [0, 1.28, lado * 0.9], [Math.PI / 2 - lado * 0.25, 0, 0]));
  // abas do nariz em degraus, cada uma mais inclinada que a anterior
  [[1.7, 1.2, 0.72, 1.3, -0.32], [2.12, 0.98, 0.62, 1.12, -0.5], [2.5, 0.74, 0.5, 0.9, -0.7]].forEach(([x, y, c, l, inc], i) => {
    const aba = peca(new RoundedBoxGeometry(c, 0.06, l, 1, 0.02), i % 2 ? escuro : fosco, 'casco');
    aba.position.set(x, y, 0);
    aba.rotation.z = inc;
    g.add(aba);
  });
  // pneus traseiros enormes e rodas dianteiras em braços expostos
  const cfgT = { raio: 0.74, largura: 0.72, aro: 0.46, matAro: MAT.fosco(0x1b1e22, 0.8, 0.4), raios: 6, sulcos: 11, freio: false };
  g.add(colocarRoda(cfgT, -1.35, 1.12), colocarRoda(cfgT, -1.35, -1.12));
  const cfgF = { raio: 0.48, largura: 0.38, aro: 0.52, matAro: MAT.fosco(0x1b1e22, 0.8, 0.4), raios: 5, sulcos: 14 };
  g.add(colocarRoda(cfgF, 1.85, 1.28), colocarRoda(cfgF, 1.85, -1.28));
  espelhar(g, (lado) => {
    const s = new THREE.Group();
    s.add(friso([[1.5, 0.62, lado * 0.5], [1.85, 0.5, lado * 1.1]], 0.05, MAT.fosco(0x2a2d33, 0.9, 0.35)));
    s.add(friso([[1.3, 0.36, lado * 0.5], [1.85, 0.42, lado * 1.1]], 0.04, MAT.fosco(0x2a2d33, 0.9, 0.35)));
    s.add(friso([[1.55, 0.95, lado * 0.62], [1.85, 0.52, lado * 1.02]], 0.035, LATAO()));
    s.add(friso([[1.2, 1.05, lado * 0.66], [1.62, 1.28, lado * 0.52]], 0.025, LATAO()));
    // aba sobre a roda dianteira
    s.add(placa([[1.5, 0], [2.3, 0], [2.2, 0.36], [1.6, 0.4]], 0.05, fosco, [0, 0.98, lado * 1.12], [Math.PI / 2 - lado * 0.2, 0, 0]));
    return s;
  });
  // canhões sob o nariz
  espelhar(g, (lado) => friso([[1.9, 0.62, lado * 0.26], [2.75, 0.62, lado * 0.26]], 0.045, MAT.fosco(0x222222, 0.9, 0.3)));
  const tb = turbina({ raio: 0.26, comp: 0.5, corChama: 0xf97316 });
  tb.position.set(-2.35, 1.02, 0);
  g.add(tb);
  g.add(internos({ comp: 3.6, larg: 1.2, motorX: -1.3, assentoX: 0.3, altura: 0.7 }));
  return {
    grupo: g, turbinas: [tb],
    ancoras: { cockpit: V(0.3, 1.62, 0), turbina: V(-2.65, 1.02, 0), blindagem: V(-1.3, 1.35, 1.0), rodas: V(-1.35, 0.74, 1.55), armas: V(2.7, 0.62, 0.26) },
    camCockpit: { pos: V(0.4, 1.35, 0), olhar: V(8, 1.2, 0) },
  };
}

// Batpod (O Cavaleiro das Trevas): dois pneus largos iguais, chassi baixo entre eles, canhões
// dianteiros dos dois lados da roda, piloto deitado sobre o tanque.
export function batpod() {
  const g = new THREE.Group();
  const fosco = facetado(0x141619, 0.55, 0.55);
  const cfg = { raio: 0.56, largura: 0.52, aro: 0.5, matAro: MAT.fosco(0x1b1e22, 0.85, 0.35), raios: 6, sulcos: 14 };
  g.add(colocarRoda(cfg, 1.0, 0), colocarRoda(cfg, -1.0, 0));
  g.add(cascoLoft({
    x0: -0.95, x1: 0.95, topo: [[0, 0.62], [0.3, 0.78], [0.6, 0.8], [1, 0.62]], base: [[0, 0.4], [1, 0.36]],
    largura: [[0, 0.1], [0.4, 0.16], [0.8, 0.14], [1, 0.08]], ombro: 0.45, nTopo: 4, nBase: 4, inclinar: 0.2, segU: 16, segV: 10,
  }, fosco));
  // carenagens dos canhões, uma de cada lado da roda dianteira
  espelhar(g, (lado) => {
    const s = new THREE.Group();
    s.add(cascoLoft({
      x0: 0.2, x1: 1.25, topo: [[0, 0.66], [1, 0.6]], base: [[0, 0.4], [1, 0.42]], largura: 0.08,
      ombro: 0.5, nTopo: 4, nBase: 4, deslocZ: lado * 0.36, segU: 12, segV: 8,
    }, fosco));
    s.add(friso([[1.2, 0.52, lado * 0.36], [1.85, 0.52, lado * 0.36]], 0.035, MAT.fosco(0x222222, 0.9, 0.3)));
    s.add(friso([[1.2, 0.6, lado * 0.36], [1.7, 0.6, lado * 0.36]], 0.022, MAT.fosco(0x222222, 0.9, 0.3)));
    s.add(friso([[-0.2, 0.8, lado * 0.12], [0.95, 0.56, lado * 0.3]], 0.03, MAT.fosco(0x2a2d33, 0.9, 0.35)));
    return s;
  });
  // selim e apoio do piloto deitado
  g.add(cascoLoft({
    x0: -0.7, x1: 0.35, topo: [[0, 0.86], [0.5, 0.92], [1, 0.84]], base: 0.76, largura: [[0, 0.1], [0.5, 0.15], [1, 0.1]],
    ombro: 0.3, nTopo: 2.4, nBase: 2, segU: 20, segV: 16,
  }, MAT.fosco(0x0b0b0d, 0.2, 0.8)));
  g.add(farol(0.14, 0.06, 0xe0f2fe, [1.22, 0.46, 0], [0, Math.PI / 2, 0]));
  g.add(farol(0.12, 0.04, 0xdc2626, [-1.1, 0.72, 0], [0, -Math.PI / 2, 0]));
  g.add(internos({ comp: 1.6, larg: 0.3, motorX: -0.2, assentoX: -0.1, altura: 0.35 }));
  return {
    grupo: g, turbinas: [],
    ancoras: { cockpit: V(-0.1, 1.02, 0), rodas: V(1.0, 0.56, 0.4), armas: V(1.8, 0.52, 0.36), blindagem: V(-0.3, 0.7, 0.2) },
    camCockpit: { pos: V(-0.2, 1.15, 0), olhar: V(6, 0.6, 0) },
  };
}

// Esteira com garras, reaproveitada pelo tanque de Miller: bloco arredondado com placas de apoio.
function esteira(comp, alt, larg, mat, pos) {
  const g = new THREE.Group();
  g.add(peca(new RoundedBoxGeometry(comp, alt, larg, 4, alt * 0.45), mat, 'pneu'));
  const garra = new RoundedBoxGeometry(0.14, 0.08, larg + 0.04, 1, 0.02);
  const n = Math.round(comp / 0.2);
  for (let i = 0; i < n; i += 1) {
    const x = -comp / 2 + alt * 0.4 + (i / (n - 1)) * (comp - alt * 0.8);
    for (const y of [alt / 2, -alt / 2]) {
      const m = peca(garra, mat, 'pneu');
      m.position.set(x, y, 0);
      g.add(m);
    }
  }
  g.position.set(...pos);
  return g;
}

// Batmóvel tanque de The Dark Knight Returns (1986): quatro módulos de esteira nos cantos,
// casco blindado entre eles e torre com canhão de balas de borracha.
export function tanque() {
  const g = new THREE.Group();
  const chapa = facetado(0x4b4a46, 0.55, 0.6);
  const escuro = facetado(0x25262a, 0.5, 0.7);
  g.add(cascoLoft({
    x0: -2.3, x1: 2.4,
    topo: [[0, 1.15], [0.12, 1.42], [0.8, 1.42], [1, 1.02]], base: [[0, 0.42], [1, 0.42]],
    largura: [[0, 0.72], [0.1, 0.82], [0.9, 0.82], [1, 0.66]], ombro: 0.4, nTopo: 5, nBase: 6, inclinar: 0.28, segU: 16, segV: 10,
  }, chapa));
  for (const [x, z] of [[1.55, 1.05], [1.55, -1.05], [-1.55, 1.05], [-1.55, -1.05]]) {
    g.add(esteira(1.5, 1.0, 0.62, escuro, [x, 0.52, z]));
  }
  espelhar(g, (lado) => placa([[-2.2, 0], [2.2, 0], [2.0, 0.3], [-2.0, 0.3]], 0.06, chapa, [0, 1.12, lado * 0.86], [Math.PI / 2 - lado * 0.35, 0, 0]));
  const torre = new THREE.Group();
  torre.add(cascoLoft({
    x0: -0.8, x1: 0.8, topo: [[0, 0.3], [0.5, 0.42], [1, 0.26]], base: 0, largura: [[0, 0.6], [0.5, 0.7], [1, 0.5]],
    ombro: 0.1, nTopo: 4, nBase: 4, segU: 12, segV: 10,
  }, chapa));
  torre.add(friso([[0.6, 0.22, 0], [2.4, 0.22, 0]], 0.1, MAT.fosco(0x1b2027, 0.9, 0.3)));
  torre.add(friso([[2.3, 0.22, 0], [2.55, 0.22, 0]], 0.13, MAT.fosco(0x1b2027, 0.9, 0.3)));
  torre.position.set(-0.2, 1.42, 0);
  g.add(torre);
  for (const lado of [1, -1]) g.add(farol(0.3, 0.08, 0xe0f2fe, [2.42, 0.9, lado * 0.45], [0, Math.PI / 2, 0]));
  const tb = turbina({ raio: 0.17, comp: 0.4, corChama: 0xf97316 });
  tb.position.set(-2.45, 1.0, 0.45);
  g.add(tb);
  g.add(internos({ comp: 3.8, larg: 1.4, motorX: -1.4, assentoX: 0.3, altura: 0.7 }));
  return {
    grupo: g, turbinas: [tb],
    ancoras: { cockpit: V(-0.2, 1.95, 0), turbina: V(-2.7, 1.0, 0.45), blindagem: V(0.2, 1.2, 0.95), rodas: V(1.55, 0.52, 1.4), armas: V(2.3, 1.64, 0) },
    camCockpit: { pos: V(0.2, 1.95, 0), olhar: V(8, 1.6, 0) },
  };
}

// Batmóvel de Batman: Arkham Knight: casco musculoso cinza-metálico, para-lamas volumosos,
// motor exposto na lateral, barbatana e jato traseiros; alterna para o modo tanque com torre.
export function arkham(modo = 'perseguicao') {
  const g = new THREE.Group();
  const pintura = MAT.pintura(0x3a4048, 0.88, 0.32);
  const escuro = facetado(0x1c2026, 0.8, 0.4);
  const corpo = new THREE.Group();
  corpo.add(cascoLoft({
    x0: -2.8, x1: 2.95,
    topo: [[0, 0.95], [0.2, 1.18], [0.45, 1.32], [0.7, 1.12], [0.9, 0.9], [1, 0.72]],
    base: [[0, 0.46], [1, 0.44]],
    largura: [[0, 0.72], [0.2, 0.86], [0.8, 0.84], [1, 0.56]],
    larguraBase: 0.66, ombro: 0.42, nTopo: 3.2, nBase: 4, inclinar: 0.3,
    vinco: [[0, 0.02], [0.6, 0.06], [1, 0.04]], larguraVinco: 0.25, segU: 36, segV: 18,
  }, pintura));
  // para-lamas musculosos sobre as quatro rodas
  for (const [x0, x1] of [[1.05, 2.75], [-2.7, -0.85]]) {
    espelhar(corpo, (lado) => cascoLoft({
      x0, x1, topo: [[0, 0.95], [0.3, 1.2], [0.7, 1.2], [1, 0.9]], base: [[0, 0.8], [0.5, 1.02], [1, 0.8]],
      largura: [[0, 0.12], [0.3, 0.3], [0.7, 0.3], [1, 0.12]], ombro: 0.35, nTopo: 3, nBase: 2.2, deslocZ: lado * 1.08, segU: 24, segV: 14,
    }, pintura));
  }
  // motor exposto e placas laterais
  espelhar(corpo, (lado) => {
    const s = new THREE.Group();
    for (let i = 0; i < 3; i += 1) {
      const cil = peca(new THREE.CylinderGeometry(0.09, 0.09, 0.3, 16), MAT.fosco(0x8b949e, 1, 0.25), 'metal');
      cil.rotation.x = Math.PI / 2;
      cil.position.set(-0.4 + i * 0.26, 0.72, lado * 0.86);
      s.add(cil);
    }
    s.add(placa([[-0.8, 0], [0.9, 0], [0.7, 0.26], [-0.6, 0.3]], 0.05, escuro, [0, 0.5, lado * 0.95], [0, 0, 0]));
    s.add(farol(0.5, 0.05, 0x38bdf8, [2.9, 0.66, lado * 0.46], [0, Math.PI / 2, 0]));
    s.add(farol(0.4, 0.05, 0xdc2626, [-2.8, 0.86, lado * 0.52], [0, -Math.PI / 2, 0]));
    return s;
  });
  corpo.add(canopyLoft({
    x0: -1.1, x1: 0.6, base: 1.24, topo: [[0, 1.3], [0.4, 1.46], [1, 1.28]], largura: [[0, 0.4], [0.5, 0.52], [1, 0.3]], cor: 0x0a1a2f, opacidade: 0.8, nTopo: 3,
  }));
  corpo.add(peca(lamina([[-1.4, 1.3], [-2.3, 1.36], [-2.8, 1.7], [-2.95, 1.62], [-2.7, 1.26]], 0.05, 0.015), pintura, 'casco'));
  const tb = turbina({ raio: 0.34, comp: 0.55, corChama: 0x93c5fd });
  tb.position.set(-2.9, 0.84, 0);
  corpo.add(tb);
  // torre de armas (recolhida no modo perseguição)
  const torre = new THREE.Group();
  torre.add(peca(new RoundedBoxGeometry(0.9, 0.3, 0.9, 2, 0.06), pintura, 'casco'));
  const canhao = peca(new THREE.CylinderGeometry(0.08, 0.1, 1.6, 16), MAT.fosco(0x15181c, 0.9, 0.3), 'metal');
  canhao.rotation.z = Math.PI / 2;
  canhao.position.set(0.95, 0.05, 0);
  torre.add(canhao);
  for (let i = 0; i < 6; i += 1) {
    const b = peca(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 8), MAT.fosco(0x15181c, 0.9, 0.3), 'metal');
    b.rotation.z = Math.PI / 2;
    const a = (i / 6) * Math.PI * 2;
    b.position.set(0.55, -0.02 + Math.cos(a) * 0.07, 0.38 + Math.sin(a) * 0.07);
    torre.add(b);
  }
  torre.position.set(-1.3, 1.0, 0);
  torre.scale.setScalar(0.001);
  corpo.add(torre);
  corpo.add(internos({ comp: 4, larg: 1.4, motorX: -1.7, assentoX: -0.3, altura: 0.6 }));
  g.add(corpo);

  const pivos = [];
  for (const [x, z] of [[1.9, 1.15], [1.9, -1.15], [-1.75, 1.15], [-1.75, -1.15]]) {
    const p = new THREE.Group();
    p.position.set(x, 0, z);
    const r = colocarRoda({ raio: 0.62, largura: 0.52, aro: 0.6, matAro: MAT.fosco(0x5b636e, 0.95, 0.28), raios: 8, sulcos: 16 }, 0, 0);
    if (z < 0) r.rotation.y = Math.PI;
    p.add(r);
    g.add(p);
    pivos.push(p);
  }
  let estado = modo;
  const aplicarModo = (k, para) => {
    const alvo = para === 'tanque' ? 1 : 0;
    const de = 1 - alvo;
    const v = de + (alvo - de) * k;
    corpo.position.y = v * 0.28;
    for (const p of pivos) p.rotation.y = v * (Math.PI / 2);
    torre.scale.setScalar(Math.max(0.001, v));
    torre.position.y = 1.0 + v * 0.55;
  };
  aplicarModo(1, modo);
  return {
    grupo: g, turbinas: [tb],
    ancoras: { cockpit: V(-0.3, 1.6, 0), turbina: V(-3.2, 0.84, 0), blindagem: V(1.2, 1.1, 1.0), rodas: V(1.9, 0.62, 1.5), armas: V(-0.3, 1.9, 0) },
    camCockpit: { pos: V(-0.2, 1.52, 0), olhar: V(8, 1.3, 0) },
    transformar: (cena, para, aoFim) => {
      if (para === estado) return;
      estado = para;
      cena.animar(1.3, (k) => aplicarModo(k, para), aoFim);
    },
  };
}

// Jato do Lorde Batman (modelo conceitual): fuselagem em lâmina, asas de morcego recortadas
// com bordas ciano, cabine monoposto e dois motores.
export function jato() {
  const g = new THREE.Group();
  const pintura = MAT.acetinado(0x15181f, 0x475569);
  const corpo = new THREE.Group();
  corpo.add(cascoLoft({
    x0: -3.0, x1: 3.3,
    topo: [[0, 0.3], [0.2, 0.48], [0.55, 0.56], [0.85, 0.4], [1, 0.16]], base: [[0, 0.04], [0.5, -0.02], [1, 0.12]],
    largura: [[0, 0.3], [0.2, 0.46], [0.6, 0.46], [0.9, 0.24], [1, 0.02]], ombro: 0.45, nTopo: 2.2, nBase: 2.2,
  }, pintura));
  const contorno = [[0.8, 0], [-0.4, 0.9], [-1.0, 1.35], [-1.4, 2.3], [-1.75, 1.8], [-2.1, 2.2], [-2.45, 1.4], [-2.8, 0.7], [-2.6, 0]];
  espelhar(corpo, (lado) => {
    const asa = new THREE.Group();
    asa.add(peca(lamina(contorno, 0.06, 0.015), pintura, 'casco'));
    asa.add(neon(contorno.slice(0, 7).map(([x, y]) => [x, y, 0.04]), 0x38bdf8, 0.012, 2.5));
    asa.position.set(0, 0.22, lado * 0.35);
    asa.rotation.x = lado * (Math.PI / 2 - 0.12);
    return asa;
  });
  corpo.add(peca(lamina([[-1.8, 0.4], [-2.8, 0.45], [-3.0, 1.2], [-2.6, 1.1]], 0.05, 0.015), pintura, 'casco'));
  corpo.add(canopyLoft({ x0: 0.6, x1: 2.1, base: 0.44, topo: [[0, 0.5], [0.4, 0.74], [1, 0.46]], largura: [[0, 0.2], [0.4, 0.3], [1, 0.12]], cor: 0x1e3a8a, opacidade: 0.7 }));
  corpo.add(assento(1.1, 0.2, 0, 0.7));
  const turbinas = [];
  for (const lado of [1, -1]) {
    const tb = turbina({ raio: 0.18, comp: 0.5, corChama: 0x60a5fa });
    tb.position.set(-3.05, 0.26, lado * 0.26);
    corpo.add(tb);
    turbinas.push(tb);
  }
  corpo.add(internos({ comp: 4, larg: 0.8, motorX: -1.8, assentoX: 1.1, altura: 0.2 }));
  corpo.position.y = 0.9;
  g.add(corpo);
  for (const [x, z] of [[2.0, 0], [-1.2, 0.6], [-1.2, -0.6]]) {
    g.add(friso([[x, 0.95, z], [x, 0.2, z]], 0.035));
    g.add(colocarRoda({ raio: 0.18, largura: 0.12, aro: 0.6, freio: false }, x, z));
  }
  return {
    grupo: g, turbinas,
    ancoras: { cockpit: V(1.3, 1.72, 0), turbina: V(-3.4, 1.16, 0.26), blindagem: V(-1.2, 1.25, 1.6), armas: V(-0.6, 1.02, 1.3) },
    camCockpit: { pos: V(1.2, 1.55, 0), olhar: V(10, 1.4, 0) },
  };
}

// Batmóvel de Absolute Batman #2: blindado de engenheiro sobre rodas gigantes, cabine alta com grade,
// arado frontal com espinhos, caçamba blindada e asas de morcego recortadas sobre o teto.
export function absoluto() {
  const g = new THREE.Group();
  const chapa = facetado(0x1a1d22, 0.7, 0.48);
  const escuro = facetado(0x0f1114, 0.6, 0.6);
  // chassi e caçamba
  g.add(cascoLoft({
    x0: -2.4, x1: 2.45, topo: [[0, 1.3], [0.1, 1.42], [0.9, 1.4], [1, 1.2]], base: [[0, 0.72], [1, 0.72]],
    largura: [[0, 0.86], [0.1, 0.96], [0.9, 0.96], [1, 0.84]], ombro: 0.4, nTopo: 6, nBase: 6, inclinar: 0.12, segU: 14, segV: 10,
  }, chapa));
  // cabine alta com para-brisa em fenda
  g.add(cascoLoft({
    x0: -0.5, x1: 1.55, topo: [[0, 2.1], [0.7, 2.14], [1, 1.66]], base: 1.36,
    largura: [[0, 0.82], [0.8, 0.84], [1, 0.74]], ombro: 0.1, nTopo: 6, nBase: 6, inclinar: 0.16, segU: 12, segV: 10,
  }, chapa));
  g.add(placa([[0, 0], [0.62, 0], [0.62, 0.24], [0, 0.24]], 0.04, MAT.vidro(0x0b1320), [1.28, 1.78, -0.62], [0, Math.PI / 2, -0.62], 'vidro'));
  // arado frontal com dentes cromados e espinhos
  g.add(placa([[-0.95, 0], [0.95, 0], [0.8, 0.62], [-0.8, 0.62]], 0.1, escuro, [2.55, 0.52, 0], [0, Math.PI / 2, 0.35]));
  for (let i = 0; i < 7; i += 1) g.add(friso([[2.72, 0.62, -0.72 + i * 0.24], [2.9, 0.46, -0.72 + i * 0.24]], 0.035));
  const espinho = new THREE.ConeGeometry(0.07, 0.36, 8);
  for (let i = 0; i < 9; i += 1) {
    for (const lado of [1, -1]) {
      const e = peca(espinho, MAT.cromo(), 'metal');
      e.position.set(-2.1 + i * 0.5, 1.46, lado * 0.98);
      e.rotation.x = lado * 0.7;
      g.add(e);
    }
  }
  // asas de morcego recortadas sobre a cabine
  const contorno = [[-2.2, 0], [0.6, 0], [0.1, 0.55], [-0.4, 0.4], [-0.8, 0.95], [-1.3, 0.7], [-1.8, 1.25], [-2.3, 0.6]];
  espelhar(g, (lado) => {
    const asa = new THREE.Group();
    asa.add(peca(lamina(contorno, 0.05, 0.015, false), chapa, 'casco'));
    asa.add(neon(contorno.map(([x, y]) => [x, y, 0.035]), 0xf59e0b, 0.01, 2));
    asa.position.set(0, 2.08, lado * 0.72);
    asa.rotation.x = lado * (Math.PI / 2 - 0.35);
    return asa;
  });
  const cfg = { raio: 0.84, largura: 0.74, aro: 0.44, matAro: MAT.fosco(0x2a2a2a, 0.8, 0.4), raios: 6, sulcos: 12 };
  g.add(colocarRoda(cfg, 1.55, 1.22), colocarRoda(cfg, 1.55, -1.22), colocarRoda(cfg, -1.55, 1.22), colocarRoda(cfg, -1.55, -1.22));
  for (const lado of [1, -1]) {
    for (let i = 0; i < 3; i += 1) g.add(farol(0.14, 0.1, 0xfacc15, [2.47, 1.3, lado * (0.3 + i * 0.2)], [0, Math.PI / 2, 0]));
    g.add(farol(0.2, 0.08, 0xdc2626, [-2.42, 1.1, lado * 0.7], [0, -Math.PI / 2, 0]));
  }
  const tb = turbina({ raio: 0.16, comp: 0.4, corChama: 0xf97316 });
  tb.position.set(-2.5, 0.9, 0.6);
  g.add(tb);
  g.add(internos({ comp: 4, larg: 1.6, motorX: 1.4, assentoX: 0.3, altura: 0.9 }));
  return {
    grupo: g, turbinas: [tb],
    ancoras: { cockpit: V(0.4, 2.25, 0), turbina: V(-2.8, 0.9, 0.6), blindagem: V(-1.0, 1.55, 1.1), rodas: V(1.55, 0.84, 1.62) },
    camCockpit: { pos: V(0.7, 1.9, 0), olhar: V(8, 1.7, 0) },
  };
}
