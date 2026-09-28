// Loft de seções transversais: superfícies suaves geradas a partir de curvas de perfil.
// Convenção: comprimento em X (u = 0 na traseira, u = 1 na frente), altura em Y, largura em Z.
// Cada seção é uma superelipse com metade superior e inferior independentes, o que permite
// capôs arredondados, fundos planos, laterais que recolhem (tumblehome) e vincos centrais.
import * as THREE from 'three';

// Curva 1D por Hermite cúbico (Catmull-Rom não uniforme) sobre pontos [u, valor] ordenados em u.
export function curva(pontos) {
  const n = pontos.length;
  if (n === 1) return () => pontos[0][1];
  return (u) => {
    if (u <= pontos[0][0]) return pontos[0][1];
    if (u >= pontos[n - 1][0]) return pontos[n - 1][1];
    let i = 0;
    while (u > pontos[i + 1][0]) i += 1;
    const p0 = pontos[Math.max(0, i - 1)];
    const p1 = pontos[i];
    const p2 = pontos[i + 1];
    const p3 = pontos[Math.min(n - 1, i + 2)];
    const dx = p2[0] - p1[0];
    const t = (u - p1[0]) / dx;
    const m1 = ((p2[1] - p0[1]) / (p2[0] - p0[0] || 1)) * dx;
    const m2 = ((p3[1] - p1[1]) / (p3[0] - p1[0] || 1)) * dx;
    const t2 = t * t;
    const t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * p1[1] + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2[1] + (t3 - t2) * m2;
  };
}

// Aceita número, lista de pontos [u, valor] ou função de u.
export function f(v) {
  if (typeof v === 'function') return v;
  if (Array.isArray(v)) return curva(v);
  return () => v;
}

const pot = (v, n) => Math.sign(v) * Math.pow(Math.abs(v), 2 / n);

// Parâmetros resolvidos da seção em u, compartilhados pelo loft e pela consulta de superfície.
function secaoEm(p, u) {
  const yb = p.base(u);
  const yt = p.topo(u);
  const yc = yb + (yt - yb) * p.ombro(u);
  return {
    x: p.x0 + (p.x1 - p.x0) * u,
    yc,
    hTopo: Math.max(1e-4, yt - yc),
    hBase: Math.max(1e-4, yc - yb),
    w: Math.max(1e-4, p.largura(u)),
    wBase: Math.max(1e-4, p.larguraBase ? p.larguraBase(u) : p.largura(u)),
    nTopo: p.nTopo(u),
    nBase: p.nBase(u),
    vinco: p.vinco(u),
    inclinar: p.inclinar(u),
    dz: p.deslocZ(u),
  };
}

function pontoDaSecao(s, theta, larguraVinco) {
  const c = Math.cos(theta);
  const sn = Math.sin(theta);
  let y;
  let z;
  if (sn >= 0) {
    const ey = pot(sn, s.nTopo);
    y = s.yc + s.hTopo * ey;
    z = s.w * pot(c, s.nTopo) * (1 - s.inclinar * ey);
    if (s.vinco) y += s.vinco * Math.exp(-((z / (s.w * larguraVinco)) ** 2)) * ey;
  } else {
    const ey = pot(sn, s.nBase);
    y = s.yc + s.hBase * ey;
    // a lateral inferior recolhe da largura do ombro até a largura da base
    const k = Math.pow(Math.abs(sn), 0.8);
    z = (s.w + (s.wBase - s.w) * k) * pot(c, s.nBase);
  }
  return [y, z + s.dz];
}

/**
 * Gera a malha do loft.
 * x0, x1: início (traseira) e fim (frente) no eixo X.
 * topo, base: alturas do topo e da base. largura: meia largura no ombro. larguraBase: meia largura da base.
 * ombro: fração entre base e topo onde fica a largura máxima. nTopo, nBase: expoentes da superelipse.
 * vinco: altura do vinco central no topo; larguraVinco: largura relativa do vinco.
 * inclinar: recolhimento das laterais em direção ao topo. deslocZ: deslocamento lateral da seção.
 */
export function loft(op) {
  const p = {
    x0: op.x0,
    x1: op.x1,
    topo: f(op.topo),
    base: f(op.base),
    largura: f(op.largura),
    larguraBase: op.larguraBase !== undefined ? f(op.larguraBase) : null,
    ombro: f(op.ombro ?? 0.5),
    nTopo: f(op.nTopo ?? 2.4),
    nBase: f(op.nBase ?? 3),
    vinco: f(op.vinco ?? 0),
    inclinar: f(op.inclinar ?? 0),
    deslocZ: f(op.deslocZ ?? 0),
  };
  const larguraVinco = op.larguraVinco ?? 0.25;
  const segU = op.segU ?? 120;
  const segV = op.segV ?? 64;
  const tampar = op.tampar ?? true;
  // distribuição com mais seções nas pontas, onde a forma muda mais rápido
  const us = [];
  for (let i = 0; i <= segU; i += 1) us.push((1 - Math.cos((Math.PI * i) / segU)) / 2);

  const pos = [];
  const uv = [];
  const idx = [];
  for (let i = 0; i <= segU; i += 1) {
    const s = secaoEm(p, us[i]);
    for (let j = 0; j <= segV; j += 1) {
      const theta = (j / segV) * Math.PI * 2;
      const [y, z] = pontoDaSecao(s, theta, larguraVinco);
      pos.push(s.x, y, z);
      uv.push(us[i], j / segV);
    }
  }
  const linha = segV + 1;
  for (let i = 0; i < segU; i += 1) {
    for (let j = 0; j < segV; j += 1) {
      const a = i * linha + j;
      const b = a + linha;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  // costura em theta = 0: média das normais das duas colunas coincidentes
  const n = geo.attributes.normal;
  for (let i = 0; i <= segU; i += 1) {
    const a = i * linha;
    const b = a + segV;
    const nx = n.getX(a) + n.getX(b);
    const ny = n.getY(a) + n.getY(b);
    const nz = n.getZ(a) + n.getZ(b);
    const l = Math.hypot(nx, ny, nz) || 1;
    n.setXYZ(a, nx / l, ny / l, nz / l);
    n.setXYZ(b, nx / l, ny / l, nz / l);
  }
  if (!tampar) return { geo, consulta: (u, z) => alturaTopo(p, larguraVinco, u, z) };

  // tampas nas pontas, com vértices próprios para manter a aresta nítida
  const tampa = (u, sentido) => {
    const s = secaoEm(p, u);
    const base = pos.length / 3;
    const centro = [s.x, s.yc, s.dz];
    const tpos = [...centro];
    for (let j = 0; j <= segV; j += 1) {
      const [y, z] = pontoDaSecao(s, (j / segV) * Math.PI * 2, larguraVinco);
      tpos.push(s.x, y, z);
    }
    return { base, tpos, s, sentido };
  };
  const extras = [tampa(0, -1), tampa(1, 1)];
  const todos = geo.attributes.position.array.length / 3;
  const novaPos = Array.from(geo.attributes.position.array);
  const novaNorm = Array.from(geo.attributes.normal.array);
  const novaUv = Array.from(geo.attributes.uv.array);
  const novoIdx = Array.from(geo.index.array);
  let offset = todos;
  for (const t of extras) {
    const cnt = t.tpos.length / 3;
    novaPos.push(...t.tpos);
    for (let k = 0; k < cnt; k += 1) {
      novaNorm.push(t.sentido, 0, 0);
      novaUv.push(0.5, 0.5);
    }
    for (let j = 0; j < segV; j += 1) {
      const c0 = offset;
      const a = offset + 1 + j;
      const b = offset + 2 + j;
      // vista de +X, theta cresce no sentido horário: a tampa da frente inverte a ordem
      if (t.sentido > 0) novoIdx.push(c0, b, a);
      else novoIdx.push(c0, a, b);
    }
    offset += cnt;
  }
  const g2 = new THREE.BufferGeometry();
  g2.setAttribute('position', new THREE.Float32BufferAttribute(novaPos, 3));
  g2.setAttribute('normal', new THREE.Float32BufferAttribute(novaNorm, 3));
  g2.setAttribute('uv', new THREE.Float32BufferAttribute(novaUv, 2));
  g2.setIndex(novoIdx);
  geo.dispose();
  return { geo: g2, consulta: (u, z) => alturaTopo(p, larguraVinco, u, z) };
}

// Altura aproximada da superfície superior do loft em (u, z): usada para assentar peças sobre a carroceria.
function alturaTopo(p, larguraVinco, u, z) {
  const s = secaoEm(p, u);
  const rel = Math.min(0.999, Math.abs(z - s.dz) / s.w);
  const c = Math.pow(rel, s.nTopo / 2);
  const sn = Math.sqrt(Math.max(0, 1 - c * c));
  const ey = pot(sn, s.nTopo);
  let y = s.yc + s.hTopo * ey;
  if (s.vinco) y += s.vinco * Math.exp(-(((z - s.dz) / (s.w * larguraVinco)) ** 2)) * ey;
  return y;
}

// Converte uma posição X do loft em u.
export const uDe = (x0, x1, x) => (x - x0) / (x1 - x0);

// Tubo suave por uma sequência de pontos (frisos cromados, molduras, braços de suspensão).
export function tubo(pontos, raio, segmentos = 64, fechado = false) {
  const c = new THREE.CatmullRomCurve3(pontos.map((q) => new THREE.Vector3(...q)), fechado, 'centripetal');
  return new THREE.TubeGeometry(c, segmentos, raio, 12, fechado);
}

// Lâmina com contorno 2D em (x, y), espessura em Z e bordas arredondadas (barbatanas e aletas).
export function lamina(contorno, espessura, bevel = 0.02, suave = true) {
  const forma = new THREE.Shape();
  if (suave) {
    const c = new THREE.SplineCurve(contorno.map(([x, y]) => new THREE.Vector2(x, y)));
    const pts = c.getPoints(contorno.length * 10);
    forma.setFromPoints(pts);
  } else {
    contorno.forEach(([x, y], i) => (i === 0 ? forma.moveTo(x, y) : forma.lineTo(x, y)));
  }
  const geo = new THREE.ExtrudeGeometry(forma, {
    depth: espessura,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 24,
  });
  geo.translate(0, 0, -espessura / 2);
  geo.computeVertexNormals();
  return geo;
}
