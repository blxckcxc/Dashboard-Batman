// Batmóveis das séries animadas, esculpidos por loft de seções a partir das imagens canônicas do acervo.
// Convenção do kit: frente em +X, altura em +Y, largura em Z; o chão está em y = 0.
import * as THREE from 'three';
import { MAT, peca, roda, turbina, farol } from '../kit.js';
import { loft, lamina, tubo, uDe } from '../loft.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);

function colocarRoda(cfg, x, z) {
  const r = roda(cfg);
  r.position.set(x, cfg.raio, z);
  if (z < 0) r.rotation.y = Math.PI;
  return r;
}

// par espelhado de uma peça gerada por uma função (lado = 1 ou -1)
function espelhar(g, criar) {
  for (const lado of [1, -1]) g.add(criar(lado));
}

// Aberturas ovais escuras com borda cromada, assentadas sobre a superfície do capô.
function respiro(comp, larg, pos, inclinacao = 0) {
  const g = new THREE.Group();
  const fundo = peca(new THREE.CapsuleGeometry(larg / 2, comp - larg, 6, 16), MAT.fosco(0x020305, 0.2, 0.9), 'casco');
  fundo.rotation.z = Math.PI / 2;
  fundo.scale.set(1, 1, 0.25);
  g.add(fundo);
  const borda = peca(tubo([[-comp / 2, 0, 0], [0, 0, larg / 2], [comp / 2, 0, 0], [0, 0, -larg / 2]], 0.008, 48, true), MAT.cromo(), 'metal');
  g.add(borda);
  g.position.set(...pos);
  g.rotation.z = inclinacao;
  return g;
}

// Canopy em bolha por loft, com moldura cromada e dois assentos visíveis por dentro.
function canopyLoft({ x0, x1, base, topo, largura, cor = 0x1e3a8a, opacidade = 0.5 }) {
  const g = new THREE.Group();
  const { geo } = loft({
    x0, x1, base, topo, largura, ombro: 0.02, nTopo: 2.1, nBase: 2, segU: 60, segV: 48,
  });
  const vidro = new THREE.MeshPhysicalMaterial({
    color: cor, metalness: 0.1, roughness: 0.03, transparent: true, opacity: opacidade,
    clearcoat: 1, side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 1.6,
  });
  const m = peca(geo, vidro, 'vidro');
  m.castShadow = false;
  g.add(m);
  return g;
}

// Assento de cockpit (concha com encosto e abas laterais).
function assento(x, z, escala = 1) {
  const g = new THREE.Group();
  const mat = MAT.fosco(0x1f242d, 0.1, 0.8);
  const concha = peca(new THREE.CapsuleGeometry(0.16, 0.34, 6, 12), mat, 'cabine');
  concha.rotation.z = Math.PI / 2 + 0.2;
  concha.scale.set(1, 1, 0.8);
  concha.position.set(0.05, 0.12, 0);
  const encosto = peca(new THREE.CapsuleGeometry(0.17, 0.42, 6, 12), mat, 'cabine');
  encosto.rotation.z = -0.35;
  encosto.scale.set(0.55, 1, 0.9);
  encosto.position.set(-0.2, 0.38, 0);
  g.add(concha, encosto);
  g.position.set(x, 0.58, z);
  g.scale.setScalar(escala);
  return g;
}

// Batmóvel de Batman: The Animated Series (1992). Capô longo art déco com vinco central,
// para-lamas dianteiros destacados, grade cromada em escudo, canopy de dois lugares,
// saias sobre as rodas traseiras, barbatanas altas e escape a jato central.
export function btas() {
  const g = new THREE.Group();
  const pintura = MAT.acetinado(0x090b12, 0x1e3a8a);
  const escuro = MAT.fosco(0x05070b, 0.4, 0.6);
  const X0 = -3.35;
  const X1 = 3.35;

  // casco central
  const casco = loft({
    x0: X0, x1: X1,
    topo: [[0, 0.62], [0.04, 0.8], [0.12, 0.88], [0.3, 0.9], [0.45, 0.9], [0.6, 0.84], [0.78, 0.78], [0.9, 0.72], [0.97, 0.64], [1, 0.56]],
    base: [[0, 0.36], [0.06, 0.26], [0.5, 0.23], [0.94, 0.26], [1, 0.34]],
    largura: [[0, 0.6], [0.05, 0.86], [0.12, 0.95], [0.3, 0.97], [0.46, 0.93], [0.6, 0.8], [0.75, 0.68], [0.9, 0.62], [0.97, 0.56], [1, 0.46]],
    larguraBase: [[0, 0.5], [0.1, 0.7], [0.5, 0.66], [0.8, 0.52], [1, 0.4]],
    ombro: 0.45, nTopo: [[0, 2.2], [0.6, 2.5], [1, 2.9]], nBase: 3.2, inclinar: 0.2,
    vinco: [[0, 0], [0.5, 0], [0.6, 0.06], [0.9, 0.075], [1, 0.04]], larguraVinco: 0.22,
  });
  g.add(peca(casco.geo, pintura, 'casco'));
  const alturaCasco = (x, z) => casco.consulta(uDe(X0, X1, x), z);

  // para-lamas dianteiros: gotas alongadas com arco sobre a roda
  const XF0 = 0.2;
  const XF1 = 3.3;
  const uRodaF = uDe(XF0, XF1, 2.05);
  espelhar(g, (lado) => {
    const { geo } = loft({
      x0: XF0, x1: XF1,
      topo: [[0, 0.8], [0.3, 0.86], [0.6, 0.84], [0.85, 0.76], [1, 0.62]],
      base: [[0, 0.5], [uRodaF - 0.2, 0.36], [uRodaF, 0.66], [uRodaF + 0.18, 0.36], [1, 0.38]],
      largura: [[0, 0.1], [0.12, 0.24], [0.5, 0.29], [0.85, 0.27], [1, 0.16]],
      larguraBase: [[0, 0.08], [0.5, 0.2], [1, 0.12]],
      ombro: 0.55, nTopo: 2.3, nBase: 2.6, inclinar: 0.1, deslocZ: lado * 0.78,
      segU: 90, segV: 40,
    });
    return peca(geo, pintura, 'casco');
  });

  // saias traseiras cobrindo as rodas de trás
  espelhar(g, (lado) => {
    const { geo } = loft({
      x0: -3.25, x1: -0.7,
      topo: [[0, 0.74], [0.2, 0.84], [0.7, 0.84], [1, 0.72]],
      base: [[0, 0.4], [0.15, 0.3], [0.85, 0.3], [1, 0.46]],
      largura: [[0, 0.1], [0.15, 0.24], [0.8, 0.24], [1, 0.08]],
      larguraBase: 0.18, ombro: 0.55, nTopo: 2.4, nBase: 2.4, inclinar: 0.08, deslocZ: lado * 0.82,
      segU: 70, segV: 36,
    });
    return peca(geo, pintura, 'casco');
  });

  // carenagem atrás do canopy, entre as barbatanas
  {
    const { geo } = loft({
      x0: -3.15, x1: -1.2,
      topo: [[0, 0.9], [0.3, 1.02], [0.8, 1.02], [1, 0.9]],
      base: 0.78, largura: [[0, 0.2], [0.3, 0.36], [0.85, 0.36], [1, 0.26]],
      ombro: 0.3, nTopo: 2.4, nBase: 2, segU: 50, segV: 32,
    });
    g.add(peca(geo, pintura, 'casco'));
  }

  // barbatanas traseiras com duas pontas, inclinadas para fora
  espelhar(g, (lado) => {
    const geo = lamina([[-1.0, 0.8], [-1.9, 0.9], [-2.55, 1.1], [-2.92, 1.34], [-3.02, 1.28], [-3.2, 1.58], [-3.33, 1.5], [-3.27, 0.82]], 0.05, 0.018);
    const m = peca(geo, pintura, 'casco');
    m.position.z = lado * 0.8;
    m.rotation.x = -lado * 0.22;
    return m;
  });

  // canopy de dois lugares com moldura
  const canopy = canopyLoft({
    x0: -1.6, x1: 0.2,
    base: [[0, 0.86], [1, 0.84]],
    topo: [[0, 0.98], [0.25, 1.22], [0.6, 1.24], [0.9, 1.08], [1, 0.9]],
    largura: [[0, 0.36], [0.3, 0.56], [0.7, 0.56], [1, 0.3]],
  });
  g.add(canopy);
  g.add(peca(tubo([[-1.62, 0.9, 0], [-1.3, 1.2, 0], [-0.6, 1.3, 0], [0.0, 1.14, 0], [0.22, 0.9, 0]], 0.014), MAT.cromo(), 'metal'));
  espelhar(g, (lado) => peca(tubo([[-1.6, 0.88, lado * 0.34], [-0.9, 0.9, lado * 0.58], [-0.2, 0.88, lado * 0.54], [0.2, 0.86, lado * 0.3]], 0.012), MAT.cromo(), 'metal'));
  espelhar(g, (lado) => assento(-0.95, lado * 0.26, 0.95));

  // grade frontal: escudo cromado com lâminas horizontais curvas
  {
    const grade = new THREE.Group();
    const esc = new THREE.Shape();
    esc.moveTo(0, 0.2);
    esc.bezierCurveTo(0.22, 0.2, 0.38, 0.16, 0.42, 0.06);
    esc.bezierCurveTo(0.44, -0.04, 0.3, -0.16, 0.12, -0.2);
    esc.lineTo(0, -0.14);
    esc.lineTo(-0.12, -0.2);
    esc.bezierCurveTo(-0.3, -0.16, -0.44, -0.04, -0.42, 0.06);
    esc.bezierCurveTo(-0.38, 0.16, -0.22, 0.2, 0, 0.2);
    const fundoGrade = peca(new THREE.ShapeGeometry(esc, 24), escuro, 'casco');
    grade.add(fundoGrade);
    const contorno = esc.getPoints(80).map((p) => [p.x, p.y, 0.01]);
    grade.add(peca(tubo(contorno, 0.016, 160, true), MAT.cromo(), 'metal'));
    for (let i = 0; i < 6; i += 1) {
      const y = 0.14 - i * 0.056;
      const meia = 0.36 - Math.abs(y + 0.02) * 0.55;
      grade.add(peca(tubo([[-meia, y - 0.012, 0.02], [0, y + 0.012, 0.05], [meia, y - 0.012, 0.02]], 0.011), MAT.cromo(), 'metal'));
    }
    grade.rotation.y = Math.PI / 2;
    grade.rotation.x = -0.35;
    grade.position.set(X1 + 0.01, 0.46, 0);
    g.add(grade);
  }

  // respiros do capô: fileira central e três de cada lado
  for (let i = 0; i < 6; i += 1) {
    const x = 1.1 + i * 0.26;
    g.add(respiro(0.16, 0.06, [x, alturaCasco(x, 0) + 0.004, 0]));
  }
  for (const lado of [1, -1]) {
    for (let i = 0; i < 3; i += 1) {
      const x = 1.6 + i * 0.3;
      const z = lado * 0.4;
      g.add(respiro(0.22, 0.07, [x, alturaCasco(x, z) + 0.01, z], -0.04));
    }
  }

  // luzes: faróis em fenda, luzes âmbar baixas, lanternas vermelhas
  for (const lado of [1, -1]) {
    g.add(farol(0.2, 0.035, 0xe0f2fe, [3.28, 0.64, lado * 0.8], [0, Math.PI / 2, 0]));
    g.add(farol(0.26, 0.04, 0xf59e0b, [3.27, 0.44, lado * 0.78], [0, Math.PI / 2, 0]));
    g.add(farol(0.42, 0.035, 0xf59e0b, [2.75, 0.4, lado * 1.02], [0, lado > 0 ? 0 : Math.PI, 0]));
    g.add(farol(0.3, 0.05, 0xdc2626, [-3.24, 0.56, lado * 0.8], [0, -Math.PI / 2, 0]));
    // guelras cromadas atrás da roda dianteira
    for (let i = 0; i < 4; i += 1) {
      g.add(peca(tubo([[1.2 - i * 0.12, 0.42, lado * 1.0], [1.28 - i * 0.12, 0.58, lado * 1.01]], 0.01, 8), MAT.cromo(), 'metal'));
    }
  }

  // escape a jato central
  const tb = turbina({ raio: 0.2, comp: 0.46, corChama: 0x60a5fa, corNucleo: 0xf59e0b });
  tb.position.set(X0 - 0.12, 0.58, 0);
  g.add(tb);

  // rodas
  const cfg = { raio: 0.44, largura: 0.32, aro: 0.6, matAro: MAT.fosco(0x2a3340, 0.9, 0.3), raios: 6, sulcos: 20 };
  const rodas = [colocarRoda(cfg, 2.05, 0.8), colocarRoda(cfg, 2.05, -0.8), colocarRoda(cfg, -2.1, 0.8), colocarRoda(cfg, -2.1, -0.8)];
  for (const r of rodas) g.add(r);

  // fundo escuro sob o carro
  const fundo = peca(new THREE.PlaneGeometry(6.2, 1.5), escuro, 'casco');
  fundo.rotation.x = -Math.PI / 2;
  fundo.position.y = 0.24;
  g.add(fundo);

  return {
    grupo: g,
    turbinas: [tb],
    ancoras: {
      cockpit: V(-0.7, 1.3, 0),
      turbina: V(X0 - 0.25, 0.58, 0),
      blindagem: V(-0.2, 0.7, 1.0),
      rodas: V(2.05, 0.44, 1.02),
    },
    camCockpit: { pos: V(-1.0, 1.08, 0.26), olhar: V(6, 0.8, 0.1) },
    cad: { turbina: V(X0, 0.58, 0), rodas: V(2.05, 0.44, 0.8), cockpit: V(-0.9, 0.9, 0), blindagem: V(0.4, 0.75, 0.9) },
  };
}
