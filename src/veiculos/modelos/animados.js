// Batmóveis das séries e filmes animados, esculpidos por loft de seções a partir das imagens canônicas do acervo.
// Convenção do kit: frente em +X, altura em +Y, largura em Z; o chão está em y = 0.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { MAT, peca, turbina, farol, internos } from '../kit.js';
import { lamina, uDe } from '../loft.js';
import { V, rodas, espelhar, cascoLoft, respiro, canopyLoft, assento, farolRedondo, friso, neon } from './base.js';

// barbatana por lâmina, posicionada num lado e inclinada para fora
function barbatana(contorno, mat, lado, z, inclinacao, espessura = 0.05) {
  const m = peca(lamina(contorno, espessura, 0.018), mat, 'casco');
  m.position.z = lado * z;
  m.rotation.x = -lado * inclinacao;
  return m;
}

// Batmóvel de Batman: The Animated Series (1992). Capô longo art déco com vinco central,
// para-lamas dianteiros destacados, grade cromada em escudo, canopy de dois lugares,
// saias sobre as rodas traseiras, barbatanas de duas pontas e escape a jato central.
export function btas() {
  const g = new THREE.Group();
  const pintura = MAT.acetinado(0x090b12, 0x1e3a8a);
  const escuro = MAT.fosco(0x05070b, 0.4, 0.6);
  const X0 = -3.35;
  const X1 = 3.35;

  const casco = cascoLoft({
    x0: X0, x1: X1,
    topo: [[0, 0.62], [0.04, 0.8], [0.12, 0.88], [0.3, 0.9], [0.45, 0.9], [0.6, 0.84], [0.78, 0.78], [0.9, 0.72], [0.97, 0.64], [1, 0.56]],
    base: [[0, 0.36], [0.06, 0.26], [0.5, 0.23], [0.94, 0.26], [1, 0.34]],
    largura: [[0, 0.6], [0.05, 0.86], [0.12, 0.95], [0.3, 0.97], [0.46, 0.93], [0.6, 0.8], [0.75, 0.68], [0.9, 0.62], [0.97, 0.56], [1, 0.46]],
    larguraBase: [[0, 0.5], [0.1, 0.7], [0.5, 0.66], [0.8, 0.52], [1, 0.4]],
    ombro: 0.45, nTopo: [[0, 2.2], [0.6, 2.5], [1, 2.9]], nBase: 3.2, inclinar: 0.2,
    vinco: [[0, 0], [0.5, 0], [0.6, 0.06], [0.9, 0.075], [1, 0.04]], larguraVinco: 0.22,
  }, pintura);
  g.add(casco);
  const alturaCasco = (x, z) => casco.userData.consulta(uDe(X0, X1, x), z);

  // para-lamas dianteiros: gotas alongadas com arco sobre a roda
  const uRodaF = uDe(0.2, 3.3, 2.05);
  espelhar(g, (lado) => cascoLoft({
    x0: 0.2, x1: 3.3,
    topo: [[0, 0.8], [0.3, 0.86], [0.6, 0.84], [0.85, 0.76], [1, 0.62]],
    base: [[0, 0.5], [uRodaF - 0.2, 0.36], [uRodaF, 0.66], [uRodaF + 0.18, 0.36], [1, 0.38]],
    largura: [[0, 0.1], [0.12, 0.24], [0.5, 0.29], [0.85, 0.27], [1, 0.16]],
    larguraBase: [[0, 0.08], [0.5, 0.2], [1, 0.12]],
    ombro: 0.55, nTopo: 2.3, nBase: 2.6, inclinar: 0.1, deslocZ: lado * 0.78, segU: 90, segV: 40,
  }, pintura));

  // saias traseiras cobrindo as rodas de trás
  espelhar(g, (lado) => cascoLoft({
    x0: -3.25, x1: -0.7,
    topo: [[0, 0.74], [0.2, 0.84], [0.7, 0.84], [1, 0.72]],
    base: [[0, 0.4], [0.15, 0.3], [0.85, 0.3], [1, 0.46]],
    largura: [[0, 0.1], [0.15, 0.24], [0.8, 0.24], [1, 0.08]],
    larguraBase: 0.18, ombro: 0.55, nTopo: 2.4, nBase: 2.4, inclinar: 0.08, deslocZ: lado * 0.82, segU: 70, segV: 36,
  }, pintura));

  // carenagem atrás do canopy
  g.add(cascoLoft({
    x0: -3.15, x1: -1.2, topo: [[0, 0.9], [0.3, 1.02], [0.8, 1.02], [1, 0.9]], base: 0.78,
    largura: [[0, 0.2], [0.3, 0.36], [0.85, 0.36], [1, 0.26]], ombro: 0.3, nTopo: 2.4, nBase: 2, segU: 50, segV: 32,
  }, pintura));

  espelhar(g, (lado) => barbatana([[-1.0, 0.8], [-1.9, 0.9], [-2.55, 1.1], [-2.92, 1.34], [-3.02, 1.28], [-3.2, 1.58], [-3.33, 1.5], [-3.27, 0.82]], pintura, lado, 0.8, 0.22));

  g.add(canopyLoft({
    x0: -1.6, x1: 0.2, base: [[0, 0.86], [1, 0.84]],
    topo: [[0, 0.98], [0.25, 1.22], [0.6, 1.24], [0.9, 1.08], [1, 0.9]],
    largura: [[0, 0.36], [0.3, 0.56], [0.7, 0.56], [1, 0.3]],
  }));
  g.add(friso([[-1.62, 0.9, 0], [-1.3, 1.2, 0], [-0.6, 1.3, 0], [0.0, 1.14, 0], [0.22, 0.9, 0]], 0.014));
  espelhar(g, (lado) => friso([[-1.6, 0.88, lado * 0.34], [-0.9, 0.9, lado * 0.58], [-0.2, 0.88, lado * 0.54], [0.2, 0.86, lado * 0.3]]));
  espelhar(g, (lado) => assento(-0.95, 0.58, lado * 0.26, 0.95));

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
    grade.add(peca(new THREE.ShapeGeometry(esc, 24), escuro, 'casco'));
    grade.add(friso(esc.getPoints(80).map((p) => [p.x, p.y, 0.01]), 0.016));
    for (let i = 0; i < 6; i += 1) {
      const y = 0.14 - i * 0.056;
      const meia = 0.36 - Math.abs(y + 0.02) * 0.55;
      grade.add(friso([[-meia, y - 0.012, 0.02], [0, y + 0.012, 0.05], [meia, y - 0.012, 0.02]], 0.011));
    }
    grade.rotation.y = Math.PI / 2;
    grade.rotation.x = -0.35;
    grade.position.set(X1 + 0.01, 0.46, 0);
    g.add(grade);
  }

  for (let i = 0; i < 6; i += 1) {
    const x = 1.1 + i * 0.26;
    g.add(respiro(0.16, 0.06, [x, alturaCasco(x, 0) + 0.004, 0]));
  }
  for (const lado of [1, -1]) {
    for (let i = 0; i < 3; i += 1) {
      const x = 1.6 + i * 0.3;
      g.add(respiro(0.22, 0.07, [x, alturaCasco(x, lado * 0.4) + 0.01, lado * 0.4], -0.04));
    }
    g.add(farol(0.2, 0.035, 0xe0f2fe, [3.28, 0.64, lado * 0.8], [0, Math.PI / 2, 0]));
    g.add(farol(0.26, 0.04, 0xf59e0b, [3.27, 0.44, lado * 0.78], [0, Math.PI / 2, 0]));
    g.add(farol(0.42, 0.035, 0xf59e0b, [2.75, 0.4, lado * 1.02], [0, lado > 0 ? 0 : Math.PI, 0]));
    g.add(farol(0.3, 0.05, 0xdc2626, [-3.24, 0.56, lado * 0.8], [0, -Math.PI / 2, 0]));
    for (let i = 0; i < 4; i += 1) g.add(friso([[1.2 - i * 0.12, 0.42, lado * 1.0], [1.28 - i * 0.12, 0.58, lado * 1.01]], 0.01));
  }

  const tb = turbina({ raio: 0.2, comp: 0.46, corChama: 0x60a5fa, corNucleo: 0xf59e0b });
  tb.position.set(X0 - 0.12, 0.58, 0);
  g.add(tb);
  rodas(g, { raio: 0.44, largura: 0.32, aro: 0.6, matAro: MAT.fosco(0x2a3340, 0.9, 0.3), raios: 6, sulcos: 20 }, [[2.05, 0.8], [-2.1, 0.8]]);
  const fundo = peca(new THREE.PlaneGeometry(6.2, 1.5), escuro, 'casco');
  fundo.rotation.x = -Math.PI / 2;
  fundo.position.y = 0.24;
  g.add(fundo);
  g.add(internos({ comp: 5, larg: 1.3, motorX: -2.2, assentoX: -0.95, altura: 0.3 }));

  return {
    grupo: g,
    turbinas: [tb],
    ancoras: { cockpit: V(-0.7, 1.3, 0), turbina: V(X0 - 0.25, 0.58, 0), blindagem: V(-0.2, 0.7, 1.0), rodas: V(2.05, 0.44, 1.02) },
    camCockpit: { pos: V(-1.0, 1.08, 0.26), olhar: V(6, 0.8, 0.1) },
    cad: { turbina: V(X0, 0.58, 0), rodas: V(2.05, 0.44, 0.8), cockpit: V(-0.9, 0.9, 0), blindagem: V(0.4, 0.75, 0.9) },
  };
}

// Batmóvel de The New Batman Adventures (1997): todo preto, capô em ponta com painéis cinzentos em V,
// para-brisa em fenda azulada, orelhas pontudas na traseira e lanternas vermelhas.
export function tnba() {
  const g = new THREE.Group();
  const pintura = MAT.acetinado(0x06070b, 0x334155);
  const cinza = MAT.pintura(0x2b3342, 0.6, 0.4);
  const X0 = -3.0;
  const X1 = 3.05;
  const casco = cascoLoft({
    x0: X0, x1: X1,
    topo: [[0, 0.66], [0.05, 0.8], [0.2, 0.86], [0.45, 0.85], [0.7, 0.77], [0.9, 0.64], [1, 0.48]],
    base: [[0, 0.34], [0.06, 0.26], [0.5, 0.22], [0.95, 0.26], [1, 0.34]],
    largura: [[0, 0.7], [0.06, 0.92], [0.3, 0.98], [0.7, 0.98], [0.9, 0.86], [0.97, 0.64], [1, 0.3]],
    larguraBase: [[0, 0.6], [0.5, 0.74], [1, 0.3]],
    ombro: 0.42, nTopo: [[0, 2.6], [1, 2.2]], nBase: 3.4, inclinar: 0.25,
    vinco: [[0, 0], [0.55, 0], [0.7, 0.05], [0.95, 0.06], [1, 0.02]], larguraVinco: 0.3,
  }, pintura);
  g.add(casco);
  const alt = (x, z) => casco.userData.consulta(uDe(X0, X1, x), z) + 0.008;
  // painéis cinzentos em V sobre o capô
  espelhar(g, (lado) => {
    const pts = [];
    for (let i = 0; i <= 12; i += 1) {
      const x = 0.7 + i * 0.18;
      const z = lado * (0.12 + i * 0.04);
      pts.push([x, alt(x, z), z]);
    }
    return friso(pts, 0.03, cinza, 'casco');
  });
  espelhar(g, (lado) => {
    const pts = [];
    for (let i = 0; i <= 10; i += 1) {
      const x = 1.0 + i * 0.17;
      const z = lado * (0.55 + i * 0.02);
      pts.push([x, alt(x, z), z]);
    }
    return friso(pts, 0.025, cinza, 'casco');
  });
  // orelhas pontudas da traseira
  espelhar(g, (lado) => barbatana([[-1.9, 0.82], [-2.5, 0.9], [-2.85, 1.12], [-3.02, 1.42], [-3.12, 1.2], [-3.05, 0.84]], pintura, lado, 0.72, 0.2));
  g.add(canopyLoft({
    x0: -1.25, x1: 0.55, base: 0.83,
    topo: [[0, 0.9], [0.35, 1.08], [0.75, 1.04], [1, 0.86]],
    largura: [[0, 0.3], [0.4, 0.5], [1, 0.26]], cor: 0x0e7490, opacidade: 0.72,
  }));
  espelhar(g, (lado) => assento(-0.55, 0.56, lado * 0.24, 0.85));
  for (const lado of [1, -1]) {
    g.add(farol(0.26, 0.03, 0xe0f2fe, [2.95, 0.6, lado * 0.62], [0, Math.PI / 2 - lado * 0.4, 0]));
    g.add(farol(0.34, 0.045, 0xdc2626, [-3.02, 0.62, lado * 0.62], [0, -Math.PI / 2, 0]));
  }
  const tb = turbina({ raio: 0.2, comp: 0.44, corChama: 0x60a5fa });
  tb.position.set(X0 - 0.1, 0.56, 0);
  g.add(tb);
  rodas(g, { raio: 0.42, largura: 0.3, aro: 0.58, matAro: MAT.fosco(0x1f2530, 0.9, 0.3), raios: 5 }, [[1.9, 0.8], [-1.95, 0.8]]);
  g.add(internos({ comp: 4.6, larg: 1.3, motorX: -2.0, assentoX: -0.55, altura: 0.3 }));
  return {
    grupo: g, turbinas: [tb],
    ancoras: { cockpit: V(-0.3, 1.12, 0), turbina: V(X0 - 0.25, 0.56, 0), blindagem: V(0.2, 0.7, 1.02), rodas: V(1.9, 0.42, 1.0) },
    camCockpit: { pos: V(-0.65, 1.02, 0.24), olhar: V(6, 0.8, 0.1) },
  };
}

// Batmóvel do DC Animated Movie Universe: para-lamas dianteiros bojudos com coberturas vermelhas
// sobre faróis redondos, canopy vermelho, aerofólio traseiro e rodas de cinco raios expostas.
export function n52() {
  const g = new THREE.Group();
  const pintura = MAT.acetinado(0x07080c, 0x3b0a0a);
  const vermelho = new THREE.MeshPhysicalMaterial({ color: 0x991b1b, roughness: 0.08, transparent: true, opacity: 0.78, clearcoat: 1, emissive: 0x450a0a, emissiveIntensity: 0.6 });
  const X0 = -3.1;
  const X1 = 3.2;
  g.add(cascoLoft({
    x0: X0, x1: X1,
    topo: [[0, 0.66], [0.08, 0.84], [0.35, 0.9], [0.55, 0.88], [0.75, 0.74], [0.92, 0.6], [1, 0.48]],
    base: [[0, 0.34], [0.08, 0.26], [0.5, 0.24], [1, 0.3]],
    largura: [[0, 0.6], [0.1, 0.74], [0.4, 0.78], [0.7, 0.6], [0.9, 0.5], [1, 0.3]],
    larguraBase: 0.5, ombro: 0.45, nTopo: 2.4, nBase: 3, inclinar: 0.2,
    vinco: [[0, 0], [0.6, 0], [0.8, 0.05], [1, 0.03]], larguraVinco: 0.25,
  }, pintura));
  const uF = uDe(0.4, 3.3, 2.0);
  espelhar(g, (lado) => cascoLoft({
    x0: 0.4, x1: 3.3,
    topo: [[0, 0.7], [0.3, 0.95], [0.55, 0.98], [0.85, 0.8], [1, 0.55]],
    base: [[0, 0.5], [uF - 0.2, 0.4], [uF, 0.82], [uF + 0.17, 0.4], [1, 0.36]],
    largura: [[0, 0.1], [0.3, 0.32], [0.6, 0.36], [0.9, 0.3], [1, 0.12]],
    larguraBase: [[0, 0.08], [0.5, 0.24], [1, 0.1]],
    ombro: 0.55, nTopo: 2.2, nBase: 2.4, inclinar: 0.1, deslocZ: lado * 0.86, segU: 90, segV: 40,
  }, pintura));
  // coberturas vermelhas translúcidas sobre os faróis, na ponta dos para-lamas
  espelhar(g, (lado) => {
    const grupo = new THREE.Group();
    grupo.add(cascoLoft({
      x0: 2.35, x1: 3.28, topo: [[0, 0.9], [0.5, 0.86], [1, 0.6]], base: [[0, 0.7], [1, 0.46]],
      largura: [[0, 0.2], [0.4, 0.3], [1, 0.14]], ombro: 0.4, nTopo: 2.2, nBase: 2.2, deslocZ: lado * 0.86, segU: 40, segV: 32,
    }, vermelho, 'vidro'));
    grupo.add(farolRedondo(0.1, 0xfde68a, [2.95, 0.68, lado * 0.8], 2.5));
    grupo.add(farolRedondo(0.08, 0xfde68a, [2.75, 0.74, lado * 0.95], 2.5));
    return grupo;
  });
  const uT = uDe(-3.0, -0.6, -1.9);
  espelhar(g, (lado) => cascoLoft({
    x0: -3.0, x1: -0.6,
    topo: [[0, 0.72], [0.3, 0.98], [0.7, 0.98], [1, 0.7]],
    base: [[0, 0.4], [uT - 0.18, 0.36], [uT, 0.9], [uT + 0.16, 0.36], [1, 0.5]],
    largura: [[0, 0.12], [0.25, 0.34], [0.7, 0.36], [1, 0.1]],
    larguraBase: 0.24, ombro: 0.5, nTopo: 2.3, nBase: 2.4, inclinar: 0.1, deslocZ: lado * 0.86, segU: 80, segV: 40,
  }, pintura));
  g.add(canopyLoft({
    x0: -1.4, x1: 0.4, base: 0.86, topo: [[0, 0.96], [0.3, 1.2], [0.7, 1.18], [1, 0.9]],
    largura: [[0, 0.3], [0.4, 0.5], [1, 0.26]], cor: 0x7f1d1d, opacidade: 0.6,
  }));
  espelhar(g, (lado) => assento(-0.6, 0.6, lado * 0.24, 0.9, 0x7f1d1d));
  // aerofólio traseiro sobre dois suportes
  espelhar(g, (lado) => {
    const s = peca(lamina([[-2.6, 0.9], [-2.75, 1.36], [-2.95, 1.36], [-2.85, 0.9]], 0.04, 0.01), pintura, 'casco');
    s.position.z = lado * 0.45;
    return s;
  });
  {
    const asa = peca(new RoundedBoxGeometry(0.6, 0.05, 1.3, 2, 0.02), pintura, 'casco');
    asa.position.set(-2.85, 1.38, 0);
    asa.rotation.z = 0.08;
    g.add(asa);
  }
  // V vermelho no nariz e frisos laterais
  g.add(neon([[3.1, 0.55, -0.22], [3.25, 0.44, 0], [3.1, 0.55, 0.22]], 0xdc2626, 0.018, 3));
  espelhar(g, (lado) => neon([[0.6, 0.62, lado * 1.08], [1.4, 0.7, lado * 1.14], [2.3, 0.72, lado * 1.12]], 0xb91c1c, 0.01, 2.5));
  for (const lado of [1, -1]) g.add(farol(0.3, 0.05, 0xdc2626, [-3.02, 0.72, lado * 0.8], [0, -Math.PI / 2, 0]));
  const tb = turbina({ raio: 0.2, comp: 0.44, corChama: 0xef4444, corNucleo: 0xef4444 });
  tb.position.set(X0 - 0.1, 0.56, 0);
  g.add(tb);
  rodas(g, { raio: 0.46, largura: 0.36, aro: 0.62, matAro: MAT.fosco(0x9aa3ad, 1, 0.22), raios: 5 }, [[2.0, 0.86], [-1.9, 0.86]]);
  g.add(internos({ comp: 4.6, larg: 1.2, motorX: -2.0, assentoX: -0.6, altura: 0.3 }));
  return {
    grupo: g, turbinas: [tb],
    ancoras: { cockpit: V(-0.4, 1.24, 0), turbina: V(X0 - 0.25, 0.56, 0), blindagem: V(-1.8, 0.95, 1.2), rodas: V(2.0, 0.46, 1.1) },
    camCockpit: { pos: V(-0.65, 1.08, 0.24), olhar: V(6, 0.8, 0.1) },
  };
}

// Batmóvel Mk I de The Batman (2004): esportivo baixo, teto azul, painel azul sobre a roda traseira,
// escapamentos cromados laterais, faróis intensos e aletas azuis na traseira.
export function tb04() {
  const g = new THREE.Group();
  const pintura = MAT.acetinado(0x0a0c12, 0x1e3a8a);
  const azul = MAT.pintura(0x1d4ed8, 0.6, 0.28);
  const X0 = -3.1;
  const X1 = 3.2;
  g.add(cascoLoft({
    x0: X0, x1: X1,
    topo: [[0, 0.72], [0.1, 0.84], [0.35, 0.88], [0.55, 0.82], [0.8, 0.66], [0.95, 0.54], [1, 0.44]],
    base: [[0, 0.32], [0.08, 0.24], [0.9, 0.24], [1, 0.3]],
    largura: [[0, 0.72], [0.1, 0.9], [0.5, 0.92], [0.85, 0.85], [0.96, 0.7], [1, 0.46]],
    larguraBase: [[0, 0.62], [0.5, 0.72], [1, 0.42]],
    ombro: 0.45, nTopo: 2.8, nBase: 3.4, inclinar: 0.25,
  }, pintura));
  g.add(canopyLoft({
    x0: -1.7, x1: 0.6, base: 0.86, topo: [[0, 0.96], [0.3, 1.2], [0.7, 1.16], [1, 0.9]],
    largura: [[0, 0.46], [0.4, 0.62], [1, 0.4]], cor: 0x1e3a8a, opacidade: 0.82,
  }));
  espelhar(g, (lado) => assento(-0.7, 0.56, lado * 0.26, 0.9));
  const uT = uDe(-3.0, -0.8, -2.0);
  espelhar(g, (lado) => cascoLoft({
    x0: -3.0, x1: -0.8,
    topo: [[0, 0.7], [0.3, 0.82], [0.7, 0.8], [1, 0.62]],
    base: [[0, 0.4], [uT - 0.2, 0.34], [uT, 0.9], [uT + 0.2, 0.34], [1, 0.42]],
    largura: [[0, 0.08], [0.3, 0.2], [0.8, 0.18], [1, 0.06]],
    larguraBase: 0.14, ombro: 0.5, nTopo: 2.4, nBase: 2.4, deslocZ: lado * 0.92, segU: 70, segV: 32,
  }, azul));
  // escapamentos cromados na soleira
  espelhar(g, (lado) => {
    const grupo = new THREE.Group();
    for (let i = 0; i < 3; i += 1) grupo.add(friso([[-1.3, 0.32 + i * 0.06, lado * 0.98], [0.2, 0.32 + i * 0.06, lado * 1.0], [1.2, 0.34 + i * 0.06, lado * 0.97]], 0.028));
    return grupo;
  });
  espelhar(g, (lado) => barbatana([[-1.8, 0.84], [-2.5, 0.96], [-2.95, 1.3], [-3.1, 1.2], [-3.05, 0.86]], azul, lado, 0.5, 0.16));
  for (const lado of [1, -1]) {
    g.add(farol(0.34, 0.06, 0xf8fafc, [3.1, 0.5, lado * 0.6], [0, Math.PI / 2 - lado * 0.3, 0]));
    g.add(farol(0.3, 0.05, 0x3b82f6, [-3.08, 0.66, lado * 0.66], [0, -Math.PI / 2, 0]));
  }
  const tb = turbina({ raio: 0.22, comp: 0.46, corChama: 0x3b82f6, corNucleo: 0x60a5fa });
  tb.position.set(X0 - 0.1, 0.58, 0);
  g.add(tb);
  rodas(g, { raio: 0.46, largura: 0.34, aro: 0.64, matAro: MAT.fosco(0xa4adb8, 1, 0.2), raios: 5 }, [[1.95, 0.84], [-2.0, 0.84]]);
  g.add(internos({ comp: 4.6, larg: 1.3, motorX: -2.0, assentoX: -0.7, altura: 0.3 }));
  return {
    grupo: g, turbinas: [tb],
    ancoras: { cockpit: V(-0.5, 1.24, 0), turbina: V(X0 - 0.25, 0.58, 0), blindagem: V(0.5, 0.66, 0.98), rodas: V(-2.0, 0.46, 1.12) },
    camCockpit: { pos: V(-0.8, 1.06, 0.26), olhar: V(6, 0.8, 0.1) },
  };
}

// Batmóvel Mk III de The Batman (2004): blindado em estilo tanque do episódio "Artifacts" (2027),
// casco facetado, esteiras blindadas, fendas vermelhas e canhão sobre a cabine.
export function tb04pesado() {
  const g = new THREE.Group();
  const chapa = MAT.acetinado(0x0a0b0f, 0x3f0d0d);
  const borracha = MAT.fosco(0x121418, 0.2, 0.85);
  g.add(cascoLoft({
    x0: -2.8, x1: 2.95,
    topo: [[0, 1.1], [0.1, 1.36], [0.5, 1.46], [0.8, 1.3], [1, 0.86]],
    base: [[0, 0.5], [1, 0.52]],
    largura: [[0, 0.88], [0.1, 1.02], [0.9, 1.0], [1, 0.76]],
    larguraBase: 0.9, ombro: 0.35, nTopo: 4.5, nBase: 5, inclinar: 0.3,
    vinco: [[0, 0.04], [1, 0.1]], larguraVinco: 0.2,
  }, chapa));
  // esteiras laterais com garras
  const garra = new RoundedBoxGeometry(0.12, 0.06, 0.52, 1, 0.02);
  espelhar(g, (lado) => {
    const grupo = new THREE.Group();
    const esteira = peca(new RoundedBoxGeometry(5.2, 0.86, 0.5, 4, 0.36), borracha, 'pneu');
    esteira.position.set(0.05, 0.44, lado * 1.12);
    grupo.add(esteira);
    for (let i = 0; i < 26; i += 1) {
      const x = -2.3 + i * 0.19;
      for (const y of [0.88, 0.02]) {
        const gr = peca(garra, borracha, 'pneu');
        gr.position.set(x, y, lado * 1.12);
        grupo.add(gr);
      }
    }
    for (let i = 0; i < 6; i += 1) {
      const r = peca(new THREE.CylinderGeometry(0.26, 0.26, 0.54, 24), MAT.fosco(0x1f242c, 0.8, 0.4), 'metal');
      r.rotation.x = Math.PI / 2;
      r.position.set(-2.0 + i * 0.8, 0.44, lado * 1.12);
      grupo.add(r);
    }
    // saia blindada com fendas vermelhas
    const saia = peca(new RoundedBoxGeometry(4.7, 0.36, 0.08, 2, 0.03), chapa, 'casco');
    saia.position.set(0.1, 0.78, lado * 1.4);
    grupo.add(saia);
    for (const x of [-1.6, -0.3, 1.0, 2.0]) grupo.add(farol(0.36, 0.05, 0xef4444, [x, 0.84, lado * 1.45], [0, lado > 0 ? 0 : Math.PI, 0]));
    return grupo;
  });
  espelhar(g, (lado) => neon([[-2.6, 1.3, lado * 0.9], [-0.5, 1.42, lado * 0.95], [1.8, 1.36, lado * 0.92]], 0xdc2626, 0.012, 3));
  g.add(canopyLoft({
    x0: 0.9, x1: 2.1, base: 1.36, topo: [[0, 1.42], [0.5, 1.56], [1, 1.4]], largura: [[0, 0.5], [0.5, 0.62], [1, 0.4]], cor: 0x450a0a, opacidade: 0.85, nTopo: 3,
  }));
  const canhao = peca(new THREE.CylinderGeometry(0.1, 0.13, 1.5, 20), MAT.fosco(0x1e232b, 0.9, 0.3), 'metal');
  canhao.rotation.z = Math.PI / 2;
  canhao.position.set(0.9, 1.75, 0);
  g.add(canhao);
  const base = peca(new RoundedBoxGeometry(0.9, 0.3, 0.7, 2, 0.08), chapa, 'casco');
  base.position.set(0.1, 1.62, 0);
  g.add(base);
  g.add(farol(0.9, 0.06, 0xef4444, [2.96, 0.9, 0], [0, Math.PI / 2, 0]));
  const tb = turbina({ raio: 0.24, comp: 0.5, corChama: 0xef4444, corNucleo: 0xef4444 });
  tb.position.set(-2.9, 0.98, 0);
  g.add(tb);
  g.add(internos({ comp: 4.6, larg: 1.6, motorX: -1.5, assentoX: 1.2, altura: 0.8 }));
  return {
    grupo: g, turbinas: [tb],
    ancoras: { cockpit: V(1.5, 1.62, 0), turbina: V(-3.15, 0.98, 0), blindagem: V(-0.8, 1.1, 1.46), rodas: V(0.1, 0.44, 1.42), armas: V(1.6, 1.8, 0) },
    camCockpit: { pos: V(1.2, 1.64, 0), olhar: V(8, 1.4, 0) },
  };
}

// Batmóvel dos quadrinhos de 1994 (Robin #12): nariz de morcego, faróis redondos amarelos,
// para-choque cromado, canopy em bolha com antena e barbatanas altas.
export function knightfall() {
  const g = new THREE.Group();
  const pintura = MAT.acetinado(0x05060a, 0x1d4ed8);
  const X0 = -3.2;
  const X1 = 3.3;
  const casco = cascoLoft({
    x0: X0, x1: X1,
    topo: [[0, 0.7], [0.08, 0.86], [0.3, 0.9], [0.5, 0.88], [0.7, 0.8], [0.9, 0.7], [1, 0.54]],
    base: [[0, 0.34], [0.08, 0.26], [0.9, 0.26], [1, 0.32]],
    largura: [[0, 0.62], [0.1, 0.82], [0.45, 0.84], [0.7, 0.62], [0.9, 0.5], [1, 0.3]],
    larguraBase: 0.58, ombro: 0.45, nTopo: 2.3, nBase: 3, inclinar: 0.18,
    vinco: [[0, 0], [0.6, 0], [0.85, 0.09], [1, 0.06]], larguraVinco: 0.2,
  }, pintura);
  g.add(casco);
  const alt = (x, z) => casco.userData.consulta(uDe(X0, X1, x), z) + 0.01;
  const uF = uDe(0.6, 3.35, 2.1);
  espelhar(g, (lado) => cascoLoft({
    x0: 0.6, x1: 3.35,
    topo: [[0, 0.8], [0.5, 0.86], [0.9, 0.74], [1, 0.62]],
    base: [[0, 0.46], [uF - 0.2, 0.38], [uF, 0.66], [uF + 0.17, 0.38], [1, 0.4]],
    largura: [[0, 0.1], [0.2, 0.26], [0.8, 0.28], [1, 0.22]],
    larguraBase: [[0, 0.08], [1, 0.18]], ombro: 0.55, nTopo: 2.2, nBase: 2.4, deslocZ: lado * 0.74, segU: 80, segV: 36,
  }, pintura));
  espelhar(g, (lado) => cascoLoft({
    x0: -3.15, x1: -0.8,
    topo: [[0, 0.74], [0.2, 0.84], [0.7, 0.84], [1, 0.72]], base: [[0, 0.4], [0.15, 0.3], [0.85, 0.3], [1, 0.46]],
    largura: [[0, 0.1], [0.15, 0.24], [0.8, 0.24], [1, 0.08]], larguraBase: 0.18, ombro: 0.55, deslocZ: lado * 0.78, segU: 60, segV: 32,
  }, pintura));
  // faróis redondos amarelos, um grande e um pequeno por lado
  for (const lado of [1, -1]) {
    g.add(farolRedondo(0.14, 0xfacc15, [3.34, 0.64, lado * 0.74], 3.5));
    g.add(farolRedondo(0.06, 0xfacc15, [3.36, 0.44, lado * 0.7], 3.5));
  }
  // rosto de morcego no nariz, contornado em azul
  espelhar(g, (lado) => {
    const pts = [];
    for (let i = 0; i <= 10; i += 1) {
      const x = 3.3 - i * 0.16;
      const z = lado * (0.02 + Math.sin((i / 10) * Math.PI) * 0.22 + i * 0.01);
      pts.push([x, alt(x, z), z]);
    }
    return neon(pts, 0x60a5fa, 0.008, 1.6);
  });
  // para-choque cromado com duas garras
  g.add(friso([[3.2, 0.36, -0.95], [3.46, 0.36, -0.5], [3.5, 0.36, 0], [3.46, 0.36, 0.5], [3.2, 0.36, 0.95]], 0.03));
  for (const lado of [1, -1]) g.add(friso([[3.48, 0.3, lado * 0.32], [3.52, 0.52, lado * 0.3]], 0.035));
  g.add(canopyLoft({
    x0: -1.1, x1: 0.7, base: 0.86, topo: [[0, 0.98], [0.3, 1.3], [0.7, 1.3], [1, 0.92]],
    largura: [[0, 0.34], [0.4, 0.56], [1, 0.3]], cor: 0x93c5fd, opacidade: 0.32,
  }));
  g.add(friso([[-1.1, 0.9, 0], [-0.6, 1.3, 0], [0.2, 1.32, 0], [0.72, 0.92, 0]], 0.012));
  g.add(friso([[-0.2, 1.33, 0], [-0.25, 2.1, 0]], 0.008));
  espelhar(g, (lado) => assento(-0.45, 0.58, lado * 0.25, 0.9));
  espelhar(g, (lado) => barbatana([[-0.8, 0.84], [-1.8, 0.94], [-2.6, 1.25], [-3.1, 1.7], [-3.34, 1.6], [-3.24, 0.86]], pintura, lado, 0.62, 0.15));
  for (const lado of [1, -1]) g.add(farol(0.28, 0.05, 0xdc2626, [-3.16, 0.6, lado * 0.78], [0, -Math.PI / 2, 0]));
  const tb = turbina({ raio: 0.21, comp: 0.46, corChama: 0x60a5fa });
  tb.position.set(X0 - 0.1, 0.58, 0);
  g.add(tb);
  rodas(g, { raio: 0.42, largura: 0.3, aro: 0.58, matAro: MAT.cromo(), raios: 6 }, [[2.1, 0.74], [-2.0, 0.78]]);
  g.add(internos({ comp: 4.8, larg: 1.2, motorX: -2.0, assentoX: -0.45, altura: 0.3 }));
  return {
    grupo: g, turbinas: [tb],
    ancoras: { cockpit: V(-0.2, 1.38, 0), turbina: V(X0 - 0.25, 0.58, 0), blindagem: V(0.0, 0.7, 0.9), rodas: V(2.1, 0.42, 0.95) },
    camCockpit: { pos: V(-0.5, 1.1, 0.25), olhar: V(6, 0.9, 0.1) },
  };
}

// Batmóvel voador de Batman Beyond (2039): casco baixo em lâmina, asas de morcego em V com bordas
// neon, cabine vermelha com luzes rosadas, repulsores ventrais e dois escapes traseiros.
export function beyond() {
  const g = new THREE.Group();
  const pintura = MAT.acetinado(0x07060b, 0x581c87);
  const corpo = new THREE.Group();
  corpo.add(cascoLoft({
    x0: -3.0, x1: 3.3,
    topo: [[0, 0.66], [0.1, 0.74], [0.4, 0.8], [0.7, 0.76], [0.9, 0.66], [1, 0.54]],
    base: [[0, 0.52], [0.5, 0.4], [1, 0.5]],
    largura: [[0, 0.4], [0.12, 0.62], [0.5, 0.7], [0.85, 0.5], [1, 0.1]],
    ombro: 0.4, nTopo: 2.2, nBase: 2.4, inclinar: 0.15,
  }, pintura));
  espelhar(corpo, (lado) => cascoLoft({
    x0: -2.4, x1: 1.8, topo: [[0, 0.56], [0.5, 0.62], [1, 0.52]], base: [[0, 0.42], [1, 0.44]],
    largura: [[0, 0.06], [0.3, 0.2], [0.8, 0.16], [1, 0.04]], ombro: 0.5, deslocZ: lado * 0.66, segU: 60, segV: 24,
  }, pintura));
  // asas de morcego em V com borda neon roxa
  const contorno = [[0.9, 0], [-0.6, 0.09], [-1.6, 0.34], [-2.4, 0.76], [-3.0, 1.32], [-3.35, 1.12], [-3.2, 0.56], [-2.9, 0.2], [-2.2, -0.04]];
  espelhar(corpo, (lado) => {
    const asa = new THREE.Group();
    asa.add(peca(lamina(contorno, 0.05, 0.015), pintura, 'casco'));
    asa.add(neon(contorno.slice(0, 6).map(([x, y]) => [x, y, 0.035]), 0xa855f7, 0.012, 3));
    // a lâmina é desenhada em (x, y); o giro leva o eixo y para fora e um pouco para cima (diedro)
    asa.position.set(0, 0.64, lado * 0.5);
    asa.rotation.x = lado * (Math.PI / 2 - 1.0);
    return asa;
  });
  corpo.add(canopyLoft({
    x0: -0.7, x1: 1.4, base: 0.76, topo: [[0, 0.82], [0.4, 1.02], [1, 0.8]], largura: [[0, 0.24], [0.4, 0.36], [1, 0.16]], cor: 0x450a0a, opacidade: 0.72,
  }));
  espelhar(corpo, (lado) => neon([[-0.8, 0.72, lado * 0.42], [0.2, 0.76, lado * 0.46], [1.2, 0.72, lado * 0.34]], 0xec4899, 0.012, 3.5));
  corpo.add(assento(0.1, 0.46, 0, 0.8, 0x3f0d12));
  for (const [x, z] of [[1.4, 0.3], [1.4, -0.3], [-1.6, 0.4], [-1.6, -0.4]]) {
    const rep = peca(new THREE.CircleGeometry(0.16, 24), MAT.luz(0xef4444, 3), 'luz');
    rep.rotation.x = Math.PI / 2;
    rep.position.set(x, 0.41, z);
    corpo.add(rep);
  }
  const turbinas = [];
  for (const lado of [1, -1]) {
    const tb = turbina({ raio: 0.15, comp: 0.4, corChama: 0xef4444, corNucleo: 0xef4444 });
    tb.position.set(-3.1, 0.6, lado * 0.26);
    corpo.add(tb);
    turbinas.push(tb);
  }
  corpo.add(internos({ comp: 4.2, larg: 0.9, motorX: -1.8, assentoX: 0.1, altura: 0.5 }));
  corpo.position.y = 0.55;
  g.add(corpo);
  const sombra = peca(new THREE.CircleGeometry(1.8, 48), new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.12 }), 'luz');
  sombra.rotation.x = -Math.PI / 2;
  sombra.position.y = 0.01;
  sombra.scale.set(1.8, 0.7, 1);
  g.add(sombra);
  return {
    grupo: g, turbinas,
    ancoras: { cockpit: V(0.3, 1.62, 0), turbina: V(-3.35, 1.15, 0.26), blindagem: V(-1.2, 1.2, 1.2), rodas: V(1.4, 0.95, 0.3) },
    camCockpit: { pos: V(0.1, 1.5, 0), olhar: V(8, 1.3, 0) },
    atualizar: (dt, t) => {
      corpo.position.y = 0.55 + Math.sin(t * 1.6) * 0.06;
      corpo.rotation.x = Math.sin(t * 1.1) * 0.015;
    },
  };
}
