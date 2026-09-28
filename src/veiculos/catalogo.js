// Catálogo de veículos procedurais. Cada construtor devolve:
// { grupo, ancoras: { cockpit, turbina, blindagem, rodas, armas }, turbinas: [], camCockpit: { pos, olhar }, atualizar?, transformar? }
import * as THREE from 'three';
import { MAT, peca, caixa, casco, roda, turbina, canopy, aleta, farol, internos, morcegoFrontal } from './kit.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);

function asa(pontos, espessura, mat, corFriso = null) {
  // contorno em (x, z) deitado no plano horizontal
  const forma = new THREE.Shape(pontos.map(([x, z]) => new THREE.Vector2(x, z)));
  const geo = new THREE.ExtrudeGeometry(forma, { depth: espessura, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1 });
  geo.rotateX(Math.PI / 2);
  geo.computeVertexNormals();
  const m = peca(geo, mat);
  if (corFriso) {
    // friso neon no contorno da asa, visível em todos os modos
    const contorno = new THREE.BufferGeometry().setFromPoints([...pontos, pontos[0]].map(([x, z]) => new THREE.Vector3(x, 0.012, z)));
    const friso = new THREE.Line(contorno, new THREE.LineBasicMaterial({ color: corFriso, transparent: true, opacity: 0.95 }));
    friso.userData.ignorarModo = true;
    m.add(friso);
  }
  return m;
}

function base(grupo, rodas) {
  for (const r of rodas) grupo.add(r);
}

function colocarRoda(cfg, x, z, espelhar = false) {
  const r = roda(cfg);
  r.position.set(x, cfg.raio, z);
  if (espelhar) r.rotation.y = Math.PI;
  return r;
}

// Carro genérico de perfil extrudado (BTAS, TNBA, DCAMU, 2004 e o Batmóvel de 1994).
function carro(c) {
  const g = new THREE.Group();
  const pintura = MAT.pintura(c.cor, c.metal ?? 0.85, c.rug ?? 0.28);
  const corpo = casco({ pontos: c.perfil, largura: c.largura, mat: pintura, bevel: 0.06, afunilar: c.afunilar });
  g.add(corpo);

  const rodas = [];
  for (const [x, z] of c.rodas) {
    rodas.push(colocarRoda({ raio: c.raioRoda, largura: c.largRoda, matAro: c.matAro || MAT.cromo() }, x, z, z < 0));
  }
  base(g, rodas);

  for (const a of c.aletas || []) {
    const f = aleta({ pontos: a.pontos, espessura: 0.06, mat: pintura });
    f.position.z = a.z;
    f.rotation.x = a.inclinacao || 0;
    g.add(f);
  }

  const cp = canopy({ comp: c.canopy.comp, larg: c.canopy.larg, alt: c.canopy.alt, cor: c.canopy.cor || 0x0f223d });
  cp.position.set(c.canopy.x, c.canopy.y, 0);
  g.add(cp);
  if (c.antena) {
    const an = peca(new THREE.CylinderGeometry(0.012, 0.012, c.antena, 6), MAT.cromo(), 'metal');
    an.position.set(c.canopy.x + c.canopy.comp * 0.2, c.canopy.y + c.canopy.alt + c.antena / 2, 0);
    g.add(an);
  }

  const turbinas = [];
  for (const t of c.turbinas) {
    const tb = turbina({ raio: t.raio, comp: 0.5, corChama: c.corChama || 0x38bdf8, corNucleo: c.corNucleo || 0xf59e0b });
    tb.position.set(t.x, t.y, t.z || 0);
    g.add(tb);
    turbinas.push(tb);
  }

  // faróis, lanternas e frisos
  const xf = c.perfil.reduce((m, p) => Math.max(m, p[0]), -99);
  const xt = c.perfil.reduce((m, p) => Math.min(m, p[0]), 99);
  for (const z of [-c.largura * 0.32, c.largura * 0.32]) {
    g.add(farol(0.22, 0.07, c.corFarol || 0xe0f2fe, [xf + 0.06, c.alturaFarol || 0.45, z], [0, Math.PI / 2, 0]));
    g.add(farol(0.24, 0.06, c.corLanterna || 0xdc2626, [xt - 0.06, c.alturaLanterna || 0.55, z], [0, -Math.PI / 2, 0]));
  }
  if (c.friso) {
    for (const z of [-(c.largura / 2 + 0.065), c.largura / 2 + 0.065]) {
      g.add(caixa(c.friso.comp, 0.025, 0.01, MAT.luz(c.friso.cor, 3), [c.friso.x, c.friso.y, z], [0, 0, c.friso.inclinacao || 0], 'luz'));
    }
  }
  if (c.morcego) g.add(morcegoFrontal(c.morcego.escala, c.morcego.cor, [xf + 0.07, c.morcego.y, 0]));

  g.add(internos({ comp: (xf - xt) * 0.8, larg: c.largura, motorX: xt + (xf - xt) * 0.25, assentoX: c.canopy.x, altura: 0.35 }));

  return {
    grupo: g,
    turbinas,
    ancoras: {
      cockpit: V(c.canopy.x, c.canopy.y + c.canopy.alt * 0.8, 0),
      turbina: V(c.turbinas[0].x - 0.3, c.turbinas[0].y, 0),
      blindagem: V((xf + xt) / 2 + 0.6, 0.62, c.largura / 2 + 0.08),
      rodas: V(c.rodas[0][0], c.raioRoda, c.rodas[0][1] + Math.sign(c.rodas[0][1]) * 0.25),
    },
    camCockpit: { pos: V(c.canopy.x - 0.1, c.canopy.y + 0.38, 0), olhar: V(c.canopy.x + 6, c.canopy.y + 0.2, 0) },
  };
}

const afunilarPadrao = (frente = 0.55, tras = 0.85, topo = 0.82) => (u, v) => {
  let s = 1;
  if (u > 0.78) s *= 1 - ((u - 0.78) / 0.22) * (1 - frente);
  if (u < 0.12) s *= 1 - ((0.12 - u) / 0.12) * (1 - tras);
  if (v > 0.7) s *= 1 - ((v - 0.7) / 0.3) * (1 - topo);
  return s;
};

const MODELOS = {
  btas: () => carro({
    cor: 0x0a0d13, largura: 1.7, raioRoda: 0.42, largRoda: 0.32,
    perfil: [[-3.1, 0.28], [-3.15, 0.64], [-2.85, 0.82], [-1.15, 0.86], [-0.75, 0.96], [0.35, 0.92], [0.85, 0.78], [2.7, 0.64], [3.12, 0.5], [3.15, 0.32], [2.9, 0.2], [-2.9, 0.2]],
    afunilar: afunilarPadrao(0.45, 0.9, 0.8),
    rodas: [[2.05, 0.9], [2.05, -0.9], [-2.0, 0.9], [-2.0, -0.9]],
    aletas: [
      { z: 0.52, pontos: [[-3.1, 0.7], [-2.1, 0.8], [-2.95, 1.55]] },
      { z: -0.52, pontos: [[-3.1, 0.7], [-2.1, 0.8], [-2.95, 1.55]] },
    ],
    canopy: { x: -0.25, y: 0.86, comp: 1.55, larg: 0.95, alt: 0.3 },
    turbinas: [{ x: -3.2, y: 0.5, raio: 0.26 }],
    corChama: 0x60a5fa,
    morcego: { escala: 0.8, cor: 0x3b82f6, y: 0.4 },
    friso: { comp: 3.6, x: 0.4, y: 0.62, cor: 0x3b82f6 },
  }),
  tnba: () => carro({
    cor: 0x07090d, largura: 1.6, raioRoda: 0.4, largRoda: 0.3,
    perfil: [[-2.8, 0.25], [-2.85, 0.6], [-2.5, 0.72], [-0.9, 0.78], [-0.5, 0.92], [0.4, 0.88], [0.9, 0.7], [2.6, 0.55], [2.85, 0.4], [2.8, 0.22], [-2.6, 0.2]],
    afunilar: afunilarPadrao(0.5, 0.88, 0.8),
    rodas: [[1.85, 0.85], [1.85, -0.85], [-1.8, 0.85], [-1.8, -0.85]],
    aletas: [{ z: 0, pontos: [[-2.8, 0.66], [-1.9, 0.72], [-2.7, 1.35]] }],
    canopy: { x: -0.2, y: 0.78, comp: 1.4, larg: 0.9, alt: 0.28 },
    turbinas: [{ x: -2.9, y: 0.45, raio: 0.24 }],
    corChama: 0xf97316, corLanterna: 0xef4444,
    friso: { comp: 3.2, x: 0.3, y: 0.55, cor: 0xef4444 },
  }),
  n52: () => carro({
    cor: 0x0d0f14, largura: 1.9, raioRoda: 0.46, largRoda: 0.42, metal: 0.8, rug: 0.35,
    perfil: [[-2.5, 0.3], [-2.55, 0.72], [-1.6, 0.82], [-0.7, 1.1], [0.4, 1.08], [1.2, 0.78], [2.45, 0.62], [2.55, 0.35], [2.3, 0.22], [-2.3, 0.22]],
    afunilar: afunilarPadrao(0.6, 0.9, 0.85),
    rodas: [[1.65, 1.02], [1.65, -1.02], [-1.65, 1.02], [-1.65, -1.02]],
    aletas: [{ z: 0.6, pontos: [[-2.5, 0.72], [-2.0, 0.78], [-2.55, 1.02]] }, { z: -0.6, pontos: [[-2.5, 0.72], [-2.0, 0.78], [-2.55, 1.02]] }],
    canopy: { x: -0.15, y: 0.98, comp: 1.3, larg: 1.0, alt: 0.26, cor: 0x1a0505 },
    turbinas: [{ x: -2.6, y: 0.5, raio: 0.22 }],
    corChama: 0xef4444, corNucleo: 0xef4444, corLanterna: 0xef4444,
    friso: { comp: 3.8, x: 0.2, y: 0.6, cor: 0xdc2626 },
  }),
  tb04: () => carro({
    cor: 0x080b12, largura: 1.7, raioRoda: 0.44, largRoda: 0.36,
    perfil: [[-2.7, 0.3], [-2.75, 0.7], [-2.2, 0.8], [-0.8, 0.86], [-0.3, 1.02], [0.5, 0.98], [1.0, 0.78], [2.55, 0.6], [2.75, 0.42], [2.6, 0.22], [-2.5, 0.22]],
    afunilar: afunilarPadrao(0.5, 0.88, 0.8),
    rodas: [[1.85, 0.92], [1.85, -0.92], [-1.8, 0.95], [-1.8, -0.95]],
    aletas: [
      { z: 0.5, inclinacao: -0.25, pontos: [[-2.7, 0.66], [-1.8, 0.74], [-2.65, 1.4]] },
      { z: -0.5, inclinacao: 0.25, pontos: [[-2.7, 0.66], [-1.8, 0.74], [-2.65, 1.4]] },
    ],
    canopy: { x: 0.1, y: 0.9, comp: 1.4, larg: 0.9, alt: 0.3 },
    turbinas: [{ x: -2.8, y: 0.5, raio: 0.24 }],
    corChama: 0x3b82f6, corNucleo: 0x60a5fa, corLanterna: 0x3b82f6,
    friso: { comp: 3.6, x: 0.2, y: 0.58, cor: 0x3b82f6 },
    morcego: { escala: 0.7, cor: 0x60a5fa, y: 0.42 },
  }),
  // Batmóvel dos quadrinhos de 1994 (Robin #12): capô longo, faróis redondos amarelos e canopy em bolha
  knightfall: () => carro({
    cor: 0x0a0d16, largura: 1.7, raioRoda: 0.42, largRoda: 0.34,
    perfil: [[-2.7, 0.28], [-2.75, 0.8], [-1.4, 0.85], [-0.8, 1.02], [0.3, 0.95], [2.7, 0.45], [2.72, 0.3], [2.5, 0.22], [-2.5, 0.22]],
    afunilar: afunilarPadrao(0.55, 0.9, 0.82),
    rodas: [[1.8, 0.9], [1.8, -0.9], [-1.8, 0.9], [-1.8, -0.9]],
    aletas: [
      { z: 0.55, pontos: [[-2.75, 0.76], [-1.7, 0.82], [-2.7, 1.5]] },
      { z: -0.55, pontos: [[-2.75, 0.76], [-1.7, 0.82], [-2.7, 1.5]] },
    ],
    canopy: { x: -0.2, y: 0.92, comp: 1.3, larg: 0.95, alt: 0.4, cor: 0x1e3a8a },
    antena: 0.7,
    turbinas: [{ x: -2.85, y: 0.52, raio: 0.24 }],
    corChama: 0x60a5fa, corFarol: 0xfacc15,
    friso: { comp: 3.0, x: 0.4, y: 0.55, cor: 0x38bdf8, inclinacao: -0.08 },
    morcego: { escala: 0.75, cor: 0x38bdf8, y: 0.34 },
    alturaFarol: 0.36,
  }),

  tumbler() {
    const g = new THREE.Group();
    const fosco = MAT.fosco(0x14171b, 0.5, 0.7);
    const escuro = MAT.fosco(0x0b0d10, 0.6, 0.55);
    g.add(casco({ pontos: [[-1.9, 0.55], [-2.05, 1.25], [-1.2, 1.55], [0.2, 1.55], [1.4, 1.12], [2.35, 0.98], [2.5, 0.72], [1.9, 0.55]], largura: 1.3, mat: fosco, bevel: 0.03 }));
    // placas angulares sobre as rodas traseiras e laterais
    for (const s of [1, -1]) {
      g.add(caixa(1.9, 0.14, 0.72, fosco, [-1.35, 1.46, s * 0.95], [0, 0, 0.12]));
      g.add(caixa(1.2, 0.5, 0.12, fosco, [-1.3, 1.05, s * 1.3], [0.2 * s, 0, 0]));
      g.add(caixa(1.0, 0.1, 0.5, escuro, [0.9, 1.25, s * 0.55], [0.3 * s, 0, -0.35]));
      // braço exposto da roda dianteira
      const braco = peca(new THREE.CylinderGeometry(0.06, 0.06, 0.75, 10), MAT.cromo(), 'metal');
      braco.rotation.x = Math.PI / 2;
      braco.position.set(1.75, 0.5, s * 0.85);
      g.add(braco);
      // abas dianteiras
      g.add(caixa(0.7, 0.06, 0.55, fosco, [2.35, 0.95, s * 0.32], [0, 0, -0.5]));
    }
    // fendas de visão
    g.add(farol(0.6, 0.04, 0x1e3a8a, [1.1, 1.36, 0.55], [0.3, 0, -0.5]));
    g.add(farol(0.6, 0.04, 0x1e3a8a, [1.1, 1.36, -0.55], [-0.3, 0, -0.5]));
    const rodas = [
      colocarRoda({ raio: 0.72, largura: 0.62, aro: 0.52, matAro: MAT.fosco(0x1b1e22, 0.8, 0.4), sulcos: 12 }, -1.35, 1.12),
      colocarRoda({ raio: 0.72, largura: 0.62, aro: 0.52, matAro: MAT.fosco(0x1b1e22, 0.8, 0.4), sulcos: 12 }, -1.35, -1.12, true),
      colocarRoda({ raio: 0.48, largura: 0.36, aro: 0.55, matAro: MAT.fosco(0x1b1e22, 0.8, 0.4) }, 1.75, 1.22),
      colocarRoda({ raio: 0.48, largura: 0.36, aro: 0.55, matAro: MAT.fosco(0x1b1e22, 0.8, 0.4) }, 1.75, -1.22, true),
    ];
    base(g, rodas);
    const tb = turbina({ raio: 0.26, comp: 0.5, corChama: 0xf97316 });
    tb.position.set(-2.15, 1.02, 0);
    g.add(tb);
    // canhões sob o nariz
    for (const s of [1, -1]) {
      const c = peca(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 10), MAT.fosco(0x222222, 0.9, 0.3), 'metal');
      c.rotation.z = Math.PI / 2;
      c.position.set(2.3, 0.62, s * 0.3);
      g.add(c);
    }
    g.add(internos({ comp: 3.4, larg: 1.2, motorX: -1.3, assentoX: 0.2, altura: 0.7 }));
    return {
      grupo: g, turbinas: [tb],
      ancoras: { cockpit: V(0.3, 1.62, 0), turbina: V(-2.45, 1.02, 0), blindagem: V(-1.3, 1.25, 1.4), rodas: V(-1.35, 0.72, 1.5), armas: V(2.6, 0.62, 0.3) },
      camCockpit: { pos: V(0.4, 1.35, 0), olhar: V(8, 1.2, 0) },
    };
  },

  batpod() {
    const g = new THREE.Group();
    const fosco = MAT.fosco(0x121418, 0.6, 0.55);
    const rodaCfg = { raio: 0.55, largura: 0.5, aro: 0.5, matAro: MAT.fosco(0x1b1e22, 0.85, 0.35), sulcos: 14 };
    const r1 = colocarRoda(rodaCfg, 0.95, 0);
    const r2 = colocarRoda(rodaCfg, -0.95, 0);
    base(g, [r1, r2]);
    g.add(casco({ pontos: [[-0.85, 0.36], [-0.55, 0.62], [0.15, 0.66], [0.75, 0.52], [0.95, 0.36], [0.4, 0.28], [-0.4, 0.28]], largura: 0.34, mat: fosco, bevel: 0.03 }));
    for (const s of [1, -1]) {
      g.add(caixa(0.5, 0.06, 0.05, MAT.cromo(), [0.72, 0.62, s * 0.3], [0, 0, 0.3], 'metal'));
      const cano = peca(new THREE.CylinderGeometry(0.035, 0.035, 0.55, 10), MAT.fosco(0x222222, 0.9, 0.3), 'metal');
      cano.rotation.z = Math.PI / 2;
      cano.position.set(1.05, 0.46, s * 0.12);
      g.add(cano);
    }
    g.add(farol(0.14, 0.05, 0xe0f2fe, [1.12, 0.52, 0], [0, Math.PI / 2, 0]));
    g.add(farol(0.12, 0.04, 0xdc2626, [-1.08, 0.5, 0], [0, -Math.PI / 2, 0]));
    g.add(internos({ comp: 1.6, larg: 0.3, motorX: -0.2, assentoX: -0.1, altura: 0.3 }));
    return {
      grupo: g, turbinas: [],
      ancoras: { cockpit: V(0, 0.75, 0), rodas: V(0.95, 0.55, 0.35), armas: V(1.3, 0.46, 0.12), blindagem: V(-0.3, 0.55, 0.2) },
      camCockpit: { pos: V(-0.1, 0.95, 0), olhar: V(6, 0.6, 0) },
    };
  },

  // Batmoto de Thomas Wayne (Batman #75, 2019): motocicleta de estrada com farol vermelho
  batmoto() {
    const g = new THREE.Group();
    const pintura = MAT.pintura(0x1a1d24, 0.75, 0.35);
    const escuro = MAT.fosco(0x0f1115, 0.7, 0.5);
    const barra = (a, b, r, mat) => {
      const va = V(...a);
      const vb = V(...b);
      const m = peca(new THREE.CylinderGeometry(r, r, va.distanceTo(vb), 10), mat, 'metal');
      m.position.copy(va).add(vb).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(V(0, 1, 0), vb.clone().sub(va).normalize());
      return m;
    };
    const rodaCfg = { raio: 0.42, largura: 0.2, aro: 0.62, matAro: MAT.fosco(0x2a2d33, 0.85, 0.35), sulcos: 16 };
    base(g, [colocarRoda(rodaCfg, 0.95, 0), colocarRoda({ ...rodaCfg, largura: 0.26 }, -0.9, 0)]);
    // tanque, assento e rabeta
    g.add(casco({ pontos: [[-0.2, 0.72], [0.1, 0.95], [0.55, 0.98], [0.75, 0.85], [0.6, 0.7]], largura: 0.36, mat: pintura, bevel: 0.04 }));
    g.add(caixa(0.7, 0.08, 0.3, MAT.fosco(0x0b0b0d, 0.2, 0.8), [-0.45, 0.82, 0], [0, 0, 0.05]));
    g.add(casco({ pontos: [[-1.15, 0.8], [-0.8, 0.9], [-0.2, 0.78], [-0.3, 0.66], [-0.9, 0.7]], largura: 0.26, mat: pintura, bevel: 0.03 }));
    // motor, garfo, guidão, balança e escapamento
    g.add(caixa(0.55, 0.35, 0.3, escuro, [0.1, 0.5, 0], [0, 0, 0], 'metal'));
    for (const s of [1, -1]) {
      g.add(barra([0.95, 0.42, s * 0.13], [0.7, 1.05, s * 0.13], 0.035, MAT.cromo()));
      g.add(barra([-0.9, 0.42, s * 0.16], [-0.1, 0.5, s * 0.16], 0.03, escuro));
    }
    g.add(barra([0.68, 1.1, -0.38], [0.68, 1.1, 0.38], 0.025, MAT.cromo()));
    g.add(barra([-0.2, 0.35, 0.22], [-1.0, 0.5, 0.22], 0.05, MAT.cromo()));
    g.add(caixa(0.5, 0.03, 0.22, pintura, [0.95, 0.9, 0], [0, 0, -0.2]));
    g.add(farol(0.16, 0.06, 0xef4444, [0.86, 0.98, 0], [0, Math.PI / 2, 0]));
    g.add(farol(0.12, 0.04, 0xdc2626, [-1.17, 0.82, 0], [0, -Math.PI / 2, 0]));
    g.add(internos({ comp: 1.4, larg: 0.3, motorX: 0.1, assentoX: -0.45, altura: 0.35 }));
    return {
      grupo: g, turbinas: [],
      ancoras: { cockpit: V(-0.4, 1.0, 0), turbina: V(0.1, 0.5, 0.3), rodas: V(0.95, 0.42, 0.25), blindagem: V(0.3, 0.98, 0.22) },
      camCockpit: { pos: V(-0.35, 1.45, 0), olhar: V(6, 0.9, 0) },
    };
  },

  beyond() {
    const g = new THREE.Group();
    const casco1 = MAT.pintura(0x16161d, 0.8, 0.25);
    const corpo = new THREE.Group();
    corpo.add(casco({ pontos: [[-2.6, 0.55], [-2.2, 0.82], [-0.6, 0.95], [0.4, 1.0], [1.6, 0.8], [2.6, 0.6], [2.3, 0.48], [-2.3, 0.45]], largura: 1.1, mat: casco1, afunilar: afunilarPadrao(0.3, 0.8, 0.8) }));
    for (const s of [1, -1]) {
      const w = asa([[-2.7, 0], [-0.6, 0], [0.4, 0.2], [-0.4, 0.9], [-1.4, 1.2], [-2.2, 1.9], [-2.8, 1.3]], 0.05, casco1, 0xef4444);
      w.position.set(0, 0.72, s * 0.45);
      if (s < 0) w.scale.z = -1;
      corpo.add(w);
      corpo.add(farol(1.6, 0.03, 0xef4444, [-1.3, 0.7, s * 0.9], [-Math.PI / 2, 0, s * -0.5]));
    }
    const cp = canopy({ comp: 1.6, larg: 0.75, alt: 0.28, cor: 0x1a0505 });
    cp.position.set(0.1, 0.93, 0);
    corpo.add(cp);
    // repulsores ventrais
    for (const [x, z] of [[1.4, 0.3], [1.4, -0.3], [-1.6, 0.4], [-1.6, -0.4]]) {
      const rep = peca(new THREE.CircleGeometry(0.16, 24), MAT.luz(0xef4444, 3), 'luz');
      rep.rotation.x = Math.PI / 2;
      rep.position.set(x, 0.44, z);
      corpo.add(rep);
    }
    const turbinas = [];
    for (const s of [1, -1]) {
      const tb = turbina({ raio: 0.16, comp: 0.4, corChama: 0xef4444, corNucleo: 0xef4444 });
      tb.position.set(-2.7, 0.66, s * 0.32);
      corpo.add(tb);
      turbinas.push(tb);
    }
    corpo.add(internos({ comp: 3.4, larg: 0.9, motorX: -1.5, assentoX: 0.1, altura: 0.6 }));
    corpo.position.y = 0.55;
    g.add(corpo);
    const sombra = peca(new THREE.CircleGeometry(1.8, 48), new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.12 }), 'luz');
    sombra.rotation.x = -Math.PI / 2;
    sombra.position.y = 0.01;
    sombra.scale.set(1.6, 0.7, 1);
    g.add(sombra);
    return {
      grupo: g, turbinas,
      ancoras: { cockpit: V(0.1, 1.75, 0), turbina: V(-3.0, 1.2, 0.32), blindagem: V(-1.2, 1.35, 1.5), rodas: V(1.4, 0.95, 0.3) },
      camCockpit: { pos: V(0.0, 1.78, 0), olhar: V(8, 1.5, 0) },
      atualizar: (dt, t) => {
        corpo.position.y = 0.55 + Math.sin(t * 1.6) * 0.06;
        corpo.rotation.x = Math.sin(t * 1.1) * 0.015;
      },
    };
  },

  tanque() {
    const g = new THREE.Group();
    const chapa = MAT.fosco(0x27303b, 0.7, 0.5);
    const escuro = MAT.fosco(0x12161b, 0.5, 0.8);
    g.add(casco({ pontos: [[-2.4, 0.5], [-2.5, 1.0], [-1.8, 1.35], [1.4, 1.35], [2.4, 0.95], [2.5, 0.5], [2.1, 0.3], [-2.1, 0.3]], largura: 1.8, mat: chapa, bevel: 0.04 }));
    const rodas = [];
    for (const s of [1, -1]) {
      g.add(caixa(4.8, 0.62, 0.5, escuro, [0, 0.38, s * 1.12], [0, 0, 0], 'pneu'));
      for (let i = 0; i < 6; i += 1) {
        const r = peca(new THREE.CylinderGeometry(0.26, 0.26, 0.52, 20), MAT.fosco(0x1b2027, 0.8, 0.4), 'metal');
        r.rotation.x = Math.PI / 2;
        r.position.set(-1.9 + i * 0.76, 0.34, s * 1.12);
        g.add(r);
        rodas.push(r);
      }
      g.add(caixa(4.9, 0.08, 0.6, chapa, [0, 0.72, s * 1.12], [0, 0, 0]));
    }
    const torre = new THREE.Group();
    const tor = peca(new THREE.CylinderGeometry(0.72, 0.82, 0.4, 32), chapa);
    torre.add(tor);
    const canhao = peca(new THREE.CylinderGeometry(0.09, 0.11, 2.3, 16), MAT.fosco(0x1b2027, 0.9, 0.3), 'metal');
    canhao.rotation.z = Math.PI / 2;
    canhao.position.set(1.4, 0.05, 0);
    torre.add(canhao);
    for (const s of [1, -1]) {
      const m = peca(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 10), MAT.fosco(0x1b2027, 0.9, 0.3), 'metal');
      m.rotation.z = Math.PI / 2;
      m.position.set(0.7, 0.18, s * 0.45);
      torre.add(m);
    }
    torre.position.set(-0.3, 1.55, 0);
    g.add(torre);
    g.add(farol(0.3, 0.08, 0xe0f2fe, [2.45, 0.85, 0.5], [0, Math.PI / 2, 0]));
    g.add(farol(0.3, 0.08, 0xe0f2fe, [2.45, 0.85, -0.5], [0, Math.PI / 2, 0]));
    const tb = turbina({ raio: 0.17, comp: 0.4, corChama: 0xf97316 });
    tb.position.set(-2.55, 0.95, 0.5);
    g.add(tb);
    g.add(internos({ comp: 3.8, larg: 1.6, motorX: -1.4, assentoX: 0.3, altura: 0.7 }));
    return {
      grupo: g, turbinas: [tb],
      ancoras: { cockpit: V(-0.3, 1.9, 0), turbina: V(-2.8, 0.95, 0.5), blindagem: V(1.4, 1.2, 0.95), rodas: V(0.4, 0.38, 1.4), armas: V(1.9, 1.6, 0) },
      camCockpit: { pos: V(0.2, 1.95, 0), olhar: V(8, 1.6, 0) },
    };
  },

  arkham(modo = 'perseguicao') {
    const g = new THREE.Group();
    const pintura = MAT.pintura(0x2a2e35, 0.9, 0.33);
    const corpo = new THREE.Group();
    corpo.add(casco({ pontos: [[-2.6, 0.45], [-2.7, 0.95], [-1.8, 1.2], [-0.9, 1.35], [0.3, 1.3], [1.3, 1.0], [2.7, 0.85], [2.85, 0.5], [2.5, 0.3], [-2.4, 0.3]], largura: 1.6, mat: pintura, afunilar: afunilarPadrao(0.62, 0.9, 0.78) }));
    for (const s of [1, -1]) {
      corpo.add(caixa(1.5, 0.12, 0.55, pintura, [1.75, 0.95, s * 0.95], [s * 0.12, 0, -0.08]));
      corpo.add(caixa(1.6, 0.12, 0.6, pintura, [-1.75, 1.05, s * 0.95], [s * 0.12, 0, 0.06]));
      corpo.add(farol(0.5, 0.05, 0x38bdf8, [2.78, 0.62, s * 0.5], [0, Math.PI / 2, 0]));
      corpo.add(farol(0.4, 0.05, 0xdc2626, [-2.7, 0.8, s * 0.55], [0, -Math.PI / 2, 0]));
    }
    const cp = canopy({ comp: 1.4, larg: 0.95, alt: 0.24, cor: 0x0a1a2f });
    cp.position.set(-0.3, 1.28, 0);
    corpo.add(cp);
    const tb = turbina({ raio: 0.34, comp: 0.55, corChama: 0x93c5fd });
    tb.position.set(-2.8, 0.82, 0);
    corpo.add(tb);
    // torre de armas (recolhida no modo perseguição)
    const torre = new THREE.Group();
    torre.add(caixa(0.9, 0.3, 0.9, pintura, [0, 0, 0]));
    const canhao = peca(new THREE.CylinderGeometry(0.08, 0.1, 1.6, 16), MAT.fosco(0x15181c, 0.9, 0.3), 'metal');
    canhao.rotation.z = Math.PI / 2;
    canhao.position.set(0.95, 0.05, 0);
    torre.add(canhao);
    const vulcan = new THREE.Group();
    for (let i = 0; i < 6; i += 1) {
      const b = peca(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 8), MAT.fosco(0x15181c, 0.9, 0.3), 'metal');
      b.rotation.z = Math.PI / 2;
      const a = (i / 6) * Math.PI * 2;
      b.position.set(0.55, -0.02 + Math.cos(a) * 0.07, 0.38 + Math.sin(a) * 0.07);
      vulcan.add(b);
    }
    torre.add(vulcan);
    for (const s of [1, -1]) torre.add(caixa(0.4, 0.2, 0.25, pintura, [-0.1, 0.2, s * 0.55]));
    torre.position.set(-1.3, 1.0, 0);
    torre.scale.setScalar(0.001);
    corpo.add(torre);
    corpo.add(internos({ comp: 4, larg: 1.4, motorX: -1.7, assentoX: -0.3, altura: 0.6 }));
    g.add(corpo);

    const pivos = [];
    for (const [x, z] of [[1.75, 1.15], [1.75, -1.15], [-1.75, 1.15], [-1.75, -1.15]]) {
      const p = new THREE.Group();
      p.position.set(x, 0, z);
      const r = colocarRoda({ raio: 0.6, largura: 0.5, aro: 0.55, matAro: MAT.fosco(0x1b1e22, 0.85, 0.3), sulcos: 16 }, 0, 0, z < 0);
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
      const s = Math.max(0.001, v);
      torre.scale.setScalar(s);
      torre.position.y = 1.0 + v * 0.55;
    };
    aplicarModo(1, modo);
    return {
      grupo: g, turbinas: [tb],
      ancoras: { cockpit: V(-0.3, 1.6, 0), turbina: V(-3.1, 0.82, 0), blindagem: V(1.2, 1.1, 1.0), rodas: V(1.75, 0.6, 1.5), armas: V(-0.3, 1.9, 0) },
      camCockpit: { pos: V(-0.2, 1.52, 0), olhar: V(8, 1.3, 0) },
      transformar: (cena, para, aoFim) => {
        if (para === estado) return;
        estado = para;
        cena.animar(1.3, (k) => aplicarModo(k, para), aoFim);
      },
    };
  },

  // Batmóvel de Absolute Batman #2: blindado de engenheiro sobre rodas gigantes, com asas de morcego
  absoluto() {
    const g = new THREE.Group();
    const chapa = MAT.fosco(0x1c1f24, 0.75, 0.5);
    g.add(caixa(4.6, 0.55, 1.9, chapa, [0, 0.95, 0]));
    g.add(casco({ pontos: [[-0.4, 1.2], [-0.4, 2.1], [0.9, 2.1], [1.5, 1.6], [1.6, 1.2]], largura: 1.8, mat: chapa, bevel: 0.03 }));
    g.add(caixa(1.9, 0.35, 1.85, chapa, [-1.4, 1.38, 0]));
    const vid = MAT.vidro(0x0b1320);
    g.add(caixa(0.05, 0.4, 1.4, vid, [1.44, 1.82, 0], [0, 0, 0.45], 'vidro'));
    // grade frontal e espinhos
    for (let i = 0; i < 7; i += 1) g.add(caixa(0.06, 0.6, 0.06, MAT.cromo(), [2.38, 0.95, -0.8 + i * 0.27], [0, 0, 0], 'metal'));
    const espinho = new THREE.ConeGeometry(0.07, 0.35, 8);
    for (let i = 0; i < 9; i += 1) {
      for (const s of [1, -1]) {
        const e = peca(espinho, MAT.cromo(), 'metal');
        e.position.set(-2.1 + i * 0.5, 1.27, s * 0.98);
        e.rotation.x = s * 0.7;
        g.add(e);
      }
    }
    // rodas gigantes, como no Batmóvel de Absolute Batman #2
    const rodas = [];
    for (const [x, z] of [[1.55, 1.2], [1.55, -1.2], [-1.55, 1.2], [-1.55, -1.2]]) rodas.push(colocarRoda({ raio: 0.82, largura: 0.72, aro: 0.45, matAro: MAT.fosco(0x2a2a2a, 0.8, 0.4), sulcos: 12 }, x, z, z < 0));
    base(g, rodas);
    // asas de morcego recortadas sobre a carroceria
    for (const s of [1, -1]) {
      const w = asa([[-2.2, 0], [0.6, 0], [0.1, 0.55], [-0.4, 0.4], [-0.8, 0.95], [-1.3, 0.7], [-1.8, 1.25], [-2.3, 0.6]], 0.05, chapa, 0xf59e0b);
      w.position.set(0, 1.62, s * 0.9);
      w.rotation.x = s * 0.35;
      if (s < 0) w.scale.z = -1;
      g.add(w);
    }
    for (const s of [1, -1]) {
      g.add(farol(0.25, 0.1, 0xfacc15, [2.33, 1.15, s * 0.7], [0, Math.PI / 2, 0]));
      g.add(farol(0.2, 0.08, 0xdc2626, [-2.33, 1.05, s * 0.7], [0, -Math.PI / 2, 0]));
    }
    const tb = turbina({ raio: 0.16, comp: 0.4, corChama: 0xf97316 });
    tb.position.set(-2.4, 0.8, 0.6);
    g.add(tb);
    g.add(internos({ comp: 4, larg: 1.6, motorX: 1.4, assentoX: 0.3, altura: 0.8 }));
    return {
      grupo: g, turbinas: [tb],
      ancoras: { cockpit: V(0.4, 2.2, 0), turbina: V(-2.7, 0.8, 0.6), blindagem: V(-1.0, 1.5, 1.1), rodas: V(1.55, 0.82, 1.7) },
      camCockpit: { pos: V(0.6, 1.9, 0), olhar: V(8, 1.7, 0) },
    };
  },

  // Batmóvel Mk III de The Batman (2004), o blindado em estilo tanque do episódio "Artifacts" (2027)
  tb04pesado() {
    const g = new THREE.Group();
    const chapa = MAT.pintura(0x0b0d12, 0.8, 0.35);
    const esteira = MAT.fosco(0x15171c, 0.7, 0.6);
    g.add(casco({ pontos: [[-2.6, 0.55], [-2.7, 1.3], [-1.2, 1.55], [0.8, 1.55], [2.2, 1.2], [2.7, 0.8], [2.5, 0.5], [-2.4, 0.5]], largura: 1.9, mat: chapa, bevel: 0.05 }));
    const rodas = [];
    for (const x of [1.8, 0.1, -1.7]) {
      for (const z of [1.08, -1.08]) rodas.push(colocarRoda({ raio: 0.52, largura: 0.42, aro: 0.55, matAro: MAT.fosco(0x1e293b, 0.8, 0.4) }, x, z, z < 0));
    }
    base(g, rodas);
    // saias blindadas sobre as rodas, que dão o perfil de tanque
    for (const s of [1, -1]) {
      g.add(caixa(4.5, 0.42, 0.5, esteira, [0.05, 0.9, s * 1.1], [0, 0, 0]));
      g.add(caixa(4.8, 0.03, 0.01, MAT.luz(0xdc2626, 3), [0, 1.05, s * 1.36], [0, 0, 0], 'luz'));
      for (const x of [-1.6, -0.2, 1.2]) g.add(caixa(0.28, 0.05, 0.01, MAT.luz(0xef4444, 3), [x, 1.3, s * 0.96], [0, 0, 0.35], 'luz'));
    }
    const canhao = peca(new THREE.CylinderGeometry(0.1, 0.12, 1.4, 16), MAT.fosco(0x1e293b, 0.9, 0.3), 'metal');
    canhao.rotation.z = Math.PI / 2;
    canhao.position.set(1.4, 1.65, 0);
    g.add(canhao);
    const tb = turbina({ raio: 0.24, comp: 0.5, corChama: 0xef4444, corNucleo: 0xef4444 });
    tb.position.set(-2.75, 0.95, 0);
    g.add(tb);
    g.add(farol(0.6, 0.06, 0xef4444, [2.68, 0.85, 0], [0, Math.PI / 2, 0]));
    g.add(internos({ comp: 4, larg: 1.6, motorX: -1.5, assentoX: 0.6, altura: 0.8 }));
    return {
      grupo: g, turbinas: [tb],
      ancoras: { cockpit: V(0.5, 1.7, 0), turbina: V(-3.0, 0.95, 0), blindagem: V(-0.8, 1.05, 1.42), rodas: V(0.1, 0.4, 1.45), armas: V(2.1, 1.65, 0) },
      camCockpit: { pos: V(0.8, 1.72, 0), olhar: V(8, 1.5, 0) },
    };
  },

  jato() {
    const g = new THREE.Group();
    const pintura = MAT.pintura(0x1a1d26, 0.85, 0.3);
    const corpo = new THREE.Group();
    corpo.add(casco({ pontos: [[-3.0, 0.1], [-2.2, 0.42], [0.5, 0.55], [2.2, 0.35], [3.3, 0.18], [2.2, 0.02], [-2.4, 0.0]], largura: 0.95, mat: pintura, afunilar: afunilarPadrao(0.2, 0.75, 0.7) }));
    for (const s of [1, -1]) {
      const w = asa([[-2.6, 0], [0.8, 0], [0.2, 0.9], [-0.6, 1.3], [-1.2, 1.9], [-1.6, 2.9], [-2.1, 2.2], [-2.5, 2.5], [-2.8, 1.6]], 0.06, pintura, 0x38bdf8);
      w.position.set(0, 0.25, s * 0.42);
      if (s < 0) w.scale.z = -1;
      corpo.add(w);
      corpo.add(caixa(0.9, 0.1, 0.1, MAT.fosco(0x333333, 0.8, 0.4), [-0.6, 0.12, s * 1.6], [0, 0, 0], 'metal'));
    }
    corpo.add(aleta({ pontos: [[-2.9, 0.4], [-1.9, 0.45], [-2.8, 1.25]], espessura: 0.06, mat: pintura }));
    const cp = canopy({ comp: 1.4, larg: 0.6, alt: 0.25, cor: 0x1e3a8a });
    cp.position.set(1.1, 0.5, 0);
    corpo.add(cp);
    const turbinas = [];
    for (const s of [1, -1]) {
      const tb = turbina({ raio: 0.2, comp: 0.5, corChama: 0x60a5fa });
      tb.position.set(-3.05, 0.22, s * 0.28);
      corpo.add(tb);
      turbinas.push(tb);
    }
    corpo.add(internos({ comp: 4, larg: 0.8, motorX: -1.8, assentoX: 1.1, altura: 0.2 }));
    corpo.position.y = 0.9;
    g.add(corpo);
    // trem de pouso
    for (const [x, z] of [[2.0, 0], [-1.2, 0.6], [-1.2, -0.6]]) {
      const haste = peca(new THREE.CylinderGeometry(0.04, 0.04, 0.72, 8), MAT.cromo(), 'metal');
      haste.position.set(x, 0.55, z);
      g.add(haste);
      const r = colocarRoda({ raio: 0.18, largura: 0.12, aro: 0.6 }, x, z);
      g.add(r);
    }
    return {
      grupo: g, turbinas,
      ancoras: { cockpit: V(1.1, 1.75, 0), turbina: V(-3.4, 1.12, 0.28), blindagem: V(-1.2, 1.25, 2.2), armas: V(-0.6, 1.02, 1.6) },
      camCockpit: { pos: V(1.2, 1.62, 0), olhar: V(10, 1.4, 0) },
    };
  },

  lego() {
    const g = new THREE.Group();
    const preto = MAT.plastico(0x111114);
    const cinza = MAT.plastico(0x5b6570);
    const pinoGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.045, 16);
    const bloco = (w, h, d, mat, x, y, z, pinos = true) => {
      g.add(caixa(w, h, d, mat, [x, y, z]));
      if (!pinos) return;
      const nx = Math.round(w / 0.2);
      const nz = Math.round(d / 0.2);
      for (let i = 0; i < nx; i += 1) {
        for (let k = 0; k < nz; k += 1) {
          const p = peca(pinoGeo, mat);
          p.position.set(x - w / 2 + 0.1 + i * 0.2, y + h / 2 + 0.022, z - d / 2 + 0.1 + k * 0.2);
          g.add(p);
        }
      }
    };
    bloco(4.0, 0.24, 1.2, preto, 0, 0.72, 0, false);
    bloco(1.2, 0.36, 1.2, preto, -1.4, 1.02, 0);
    bloco(1.0, 0.24, 1.0, cinza, -1.4, 1.32, 0);
    bloco(1.6, 0.24, 0.8, preto, 1.1, 0.96, 0);
    bloco(0.6, 0.24, 1.2, preto, 1.9, 0.84, 0);
    for (const s of [1, -1]) {
      bloco(1.2, 0.2, 0.4, cinza, 0.2, 0.94, s * 0.6);
      // asas de morcego traseiras
      const a = aleta({ pontos: [[-2.2, 1.1], [-1.2, 1.1], [-1.4, 1.5], [-1.7, 1.35], [-1.9, 1.7], [-2.1, 1.45], [-2.4, 1.8]], espessura: 0.08, mat: preto });
      a.position.z = s * 0.52;
      g.add(a);
      // escapamentos cromados
      const esc = peca(new THREE.CylinderGeometry(0.07, 0.07, 0.8, 16), MAT.cromo(), 'metal');
      esc.rotation.z = Math.PI / 2;
      esc.position.set(-0.5, 1.02, s * 0.72);
      g.add(esc);
    }
    const cp = peca(new THREE.BoxGeometry(0.9, 0.42, 0.8), new THREE.MeshPhysicalMaterial({ color: 0xfacc15, transparent: true, opacity: 0.62, roughness: 0.08, clearcoat: 1 }), 'vidro');
    cp.position.set(0.2, 1.3, 0);
    g.add(cp);
    const rodas = [];
    const matAro = MAT.plastico(0xdc2626);
    for (const [x, z] of [[1.55, 0.95], [1.55, -0.95], [-1.45, 1.0], [-1.45, -1.0]]) rodas.push(colocarRoda({ raio: 0.56, largura: 0.46, aro: 0.55, matAro, sulcos: 10 }, x, z, z < 0));
    base(g, rodas);
    const tb = turbina({ raio: 0.2, comp: 0.4, corChama: 0xf59e0b });
    tb.position.set(-2.1, 1.02, 0);
    g.add(tb);
    g.add(farol(0.3, 0.1, 0xfde68a, [2.21, 0.86, 0.35], [0, Math.PI / 2, 0]));
    g.add(farol(0.3, 0.1, 0xfde68a, [2.21, 0.86, -0.35], [0, Math.PI / 2, 0]));
    g.add(internos({ comp: 3.2, larg: 1.0, motorX: -1.2, assentoX: 0.2, altura: 0.7 }));
    return {
      grupo: g, turbinas: [tb],
      ancoras: { cockpit: V(0.2, 1.62, 0), turbina: V(-2.4, 1.02, 0), blindagem: V(-1.4, 1.5, 0.7), rodas: V(1.55, 0.56, 1.3) },
      camCockpit: { pos: V(0.3, 1.55, 0), olhar: V(8, 1.2, 0) },
    };
  },
};

export function construirVeiculo(modelo, modo) {
  const f = MODELOS[modelo];
  if (!f) throw new Error(`Modelo desconhecido: ${modelo}`);
  const v = f.call(MODELOS, modo);
  v.grupo.position.y = 0.13;
  return v;
}
