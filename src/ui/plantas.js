// Plantas técnicas em SVG no padrão de prancha de engenharia: moldura, grade, carimbo Wayne Enterprises,
// cotas, cortes e chamadas. Trajes: capuz e lentes, placas torácicas, cinto modular e malha balística.
// Veículos: turbina, suspensão e freios, blindagem e chassi, cockpit e armas, com variantes por tipo.
// Os desenhos são interpretações técnicas; números só aparecem quando há dado verificado (perfis.js).
import { DADOS_VERIFICADOS } from '../data/perfis.js';

const f = (n) => Math.round(n * 10) / 10;
const pts = (lista) => lista.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');

// padrões e marcadores compartilhados por todas as pranchas, definidos uma única vez no documento
export function instalarDefs() {
  if (document.getElementById('bp-defs')) return;
  document.body.insertAdjacentHTML('beforeend', `<svg id="bp-defs" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true"><defs>
    <pattern id="bp-grade" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="rgba(56,189,248,.07)" stroke-width=".5"/></pattern>
    <pattern id="bp-grade5" width="50" height="50" patternUnits="userSpaceOnUse"><rect width="50" height="50" style="fill:url(#bp-grade)"/><path d="M50 0H0V50" fill="none" stroke="rgba(56,189,248,.14)" stroke-width=".6"/></pattern>
    <pattern id="bp-hach" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V4" stroke="rgba(125,211,252,.55)" stroke-width=".7"/></pattern>
    <pattern id="bp-hach-a" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><path d="M0 0V4" stroke="rgba(245,158,11,.7)" stroke-width=".8"/></pattern>
    <pattern id="bp-kev" width="12" height="10.4" patternUnits="userSpaceOnUse"><path d="M0 5.2H12M0 0L6 10.4M6 0L12 10.4M6 0L0 10.4M12 0L6 10.4" stroke="rgba(125,211,252,.5)" stroke-width=".6" fill="none"/></pattern>
    <pattern id="bp-carb" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 0h4v4H0zM4 4h4v4H4z" fill="rgba(56,189,248,.22)"/><path d="M0 4h4M4 0v4M4 8V4h4" stroke="rgba(125,211,252,.35)" stroke-width=".4" fill="none"/></pattern>
    <pattern id="bp-ti" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)"><path d="M0 1.5H3" stroke="rgba(226,232,240,.3)" stroke-width=".5"/></pattern>
    <marker id="bp-seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 1L10 5L0 9z" fill="#7dd3fc"/></marker>
    <marker id="bp-seta-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 1L10 5L0 9z" fill="#F59E0B"/></marker>
  </defs></svg>`);
}

const txt = (x, y, s, cls = 'bp-t', anc = 'start') => `<text x="${f(x)}" y="${f(y)}" class="${cls}" text-anchor="${anc}">${s}</text>`;

// chamada: ponto na peça, linha até o cotovelo e rótulo
function cham(x, y, tx, ty, s, cls = 'bp-t') {
  const d = tx >= x ? 1 : -1;
  return `<circle cx="${f(x)}" cy="${f(y)}" r="1.7" class="bp-pt"/><path d="M${f(x)},${f(y)}L${f(tx)},${f(ty)}h${d * 8}" class="bp-lc"/>${txt(tx + d * 10, ty + 2.6, s, cls, d > 0 ? 'start' : 'end')}`;
}

// cota paralela ao segmento, deslocada pela normal, com linhas de chamada e setas
function cota(x1, y1, x2, y2, s, off = 10) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const L = Math.hypot(dx, dy) || 1;
  const nx = (-dy / L) * off;
  const ny = (dx / L) * off;
  const a = [x1 + nx, y1 + ny];
  const b = [x2 + nx, y2 + ny];
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  const rot = ang > 90 || ang < -90 ? ang + 180 : ang;
  const mx = (a[0] + b[0]) / 2 + (nx / Math.abs(off || 1)) * 4;
  const my = (a[1] + b[1]) / 2 + (ny / Math.abs(off || 1)) * 4;
  return `<path d="M${f(x1)},${f(y1)}L${f(a[0] + nx * 0.25)},${f(a[1] + ny * 0.25)}M${f(x2)},${f(y2)}L${f(b[0] + nx * 0.25)},${f(b[1] + ny * 0.25)}" class="bp-cota"/>
    <path d="M${f(a[0])},${f(a[1])}L${f(b[0])},${f(b[1])}" class="bp-cota" marker-start="url(#bp-seta)" marker-end="url(#bp-seta)"/>
    <text x="${f(mx)}" y="${f(my)}" class="bp-tc" text-anchor="middle" transform="rotate(${f(rot)} ${f(mx)} ${f(my)})" dy="1">${s}</text>`;
}

// projeção isométrica simples de um plano (u, v) elevado em z
const iso = (x0, y0) => (u, v, z = 0) => [x0 + u * 0.82 - v * 0.55, y0 + u * 0.3 + v * 0.45 - z];

// meia silhueta de morcego (x >= 0, y para cima) por estilo de emblema
const MORCEGOS = {
  classico: [[0, 0.1], [0.035, 0.1], [0.05, 0.2], [0.07, 0.08], [0.16, 0.1], [0.3, 0.2], [0.5, 0.06], [0.44, -0.02], [0.36, -0.06], [0.3, -0.02], [0.24, -0.12], [0.14, -0.08], [0.06, -0.2], [0, -0.3]],
  angular: [[0, 0.08], [0.04, 0.08], [0.06, 0.22], [0.09, 0.06], [0.2, 0.08], [0.5, 0.18], [0.4, 0], [0.34, -0.02], [0.26, -0.1], [0.12, -0.08], [0, -0.26]],
  largo: [[0, 0.08], [0.03, 0.08], [0.045, 0.16], [0.07, 0.06], [0.2, 0.08], [0.5, 0.1], [0.46, 0], [0.38, -0.03], [0.32, 0], [0.26, -0.08], [0.14, -0.05], [0.06, -0.14], [0, -0.2]],
  alto: [[0, 0.3], [0.03, 0.3], [0.05, 0.42], [0.07, 0.26], [0.14, 0.22], [0.3, 0.02], [0.22, 0.04], [0.16, -0.1], [0.1, -0.06], [0.06, -0.3], [0, -0.5]],
  machado: [[0, 0.12], [0.03, 0.12], [0.05, 0.34], [0.08, 0.1], [0.2, 0.14], [0.34, 0.3], [0.44, 0.02], [0.3, -0.06], [0.18, -0.04], [0.08, -0.22], [0, -0.36]],
};
MORCEGOS.lorde = MORCEGOS.angular;
MORCEGOS.oval = MORCEGOS.classico;

function morcegoPts(forma, map) {
  const meia = MORCEGOS[forma] || MORCEGOS.classico;
  return [...meia, ...meia.slice().reverse().map(([x, y]) => [-x, y])].map(([x, y]) => map(x, y));
}

function quebrar(texto, max) {
  const linhas = [];
  let atual = '';
  for (const w of texto.split(' ')) {
    if (`${atual} ${w}`.trim().length > max) {
      linhas.push(atual.trim());
      atual = w;
    } else atual += ` ${w}`;
  }
  linhas.push(atual.trim());
  return linhas;
}

function folha(cod, titulo, corpo, { versao = 'V00', nota = 'COTAS QUALITATIVAS · SEM DADO OFICIAL DE MEDIDA', folhaN = '1/1' } = {}) {
  const canto = (x, y, sx, sy) => `<path d="M${x},${y + sy * 10}V${y}H${x + sx * 10}" class="bp-g"/>`;
  return `<svg viewBox="0 0 400 250" class="bp" role="img" aria-label="${titulo}">
    <rect x="4" y="4" width="392" height="242" class="bp-fundo"/>
    <rect x="8" y="8" width="384" height="234" style="fill:url(#bp-grade5)" class="bp-l"/>
    ${canto(4, 4, 1, 1)}${canto(396, 4, -1, 1)}${canto(4, 246, 1, -1)}${canto(396, 246, -1, -1)}
    ${txt(14, 21, titulo, 'bp-tt')}<path d="M14,25H${f(14 + titulo.length * 5.6)}" class="bp-a"/>
    ${corpo}
    <g class="bp-carimbo"><rect x="250" y="212" width="142" height="30" class="bp-caixa"/><path d="M250,222H392M250,232H392M330,232V242" class="bp-l"/>
      ${txt(254, 219.5, 'WAYNE ENTERPRISES · CIÊNCIAS APLICADAS', 'bp-tm')}${txt(254, 229.5, `DWG WE-AS-${versao}-${cod} · REV A`, 'bp-tm')}
      ${txt(254, 239.5, 'SEM ESCALA', 'bp-tm')}${txt(334, 239.5, `FOLHA ${folhaN}`, 'bp-tm')}</g>
    ${quebrar(nota, 62).slice(-3).reverse().map((l, i) => txt(14, 239 - i * 9, l, 'bp-nota')).join('')}
  </svg>`;
}

// ───────────── trajes ─────────────

const ORELHAS = { medias: [34, 6], curtas: [18, 10], longas: [48, 4], lamina: [62, 1], curvas: [40, 14], lego: [22, 6] };

function capuz(p, op) {
  const cx = 82;
  const o = p.orelhas ? ORELHAS[p.orelhas] || ORELHAS.medias : null;
  const topo = 80;
  let s = '';
  // vista frontal do capuz
  const orelhaE = o ? `L${cx - 24 - o[1]},${topo - o[0]} L${cx - 13},${topo - 3}` : `L${cx - 14},${topo - 6}`;
  const orelhaD = o ? `L${cx + 13},${topo - 3} L${cx + 24 + o[1]},${topo - o[0]}` : `L${cx + 14},${topo - 6}`;
  s += `<path d="M${cx - 34},152 C${cx - 38},120 ${cx - 36},96 ${cx - 26},${topo + 4} ${orelhaE} Q${cx},${o ? topo - 8 : topo - 26} ${orelhaD.slice(1)} L${cx + 26},${topo + 4} C${cx + 36},96 ${cx + 38},120 ${cx + 34},152 L${cx + 30},182 H${cx - 30} Z" class="bp-m bp-f"/>`;
  if (!o) s += `<path d="M${cx},${topo - 26}V${topo + 14}" class="bp-a"/>`;
  if (p.boca) s += `<path d="M${cx - 25},134 Q${cx - 13},126 ${cx},132 Q${cx + 13},126 ${cx + 25},134 L${cx + 18},162 Q${cx},174 ${cx - 18},162 Z" class="bp-x"/>${txt(cx, 168, 'ÁREA EXPOSTA', 'bp-tc', 'middle')}`;
  else s += `<path d="M${cx - 20},140 Q${cx},150 ${cx + 20},140 M${cx - 16},152 Q${cx},160 ${cx + 16},152" class="bp-l"/>`;
  const corLente = p.lentes === 'vermelhas' ? 'bp-lente-v' : 'bp-lente';
  for (const l of [-1, 1]) {
    const pl = p.lentes === 'fenda'
      ? [[cx + l * 4, 110], [cx + l * 21, 105], [cx + l * 20, 108.5]]
      : [[cx + l * 4, 111], [cx + l * 20, 104], [cx + l * 18, 113]];
    s += `<polygon points="${pts(pl)}" class="${corLente}"/>`;
  }
  // HUD biométrico sobre a lente direita
  const hx = cx + 13;
  const hy = 108;
  let ticks = '';
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    ticks += `M${f(hx + Math.cos(a) * 15)},${f(hy + Math.sin(a) * 15)}L${f(hx + Math.cos(a) * (i % 3 ? 17 : 19))},${f(hy + Math.sin(a) * (i % 3 ? 17 : 19))}`;
  }
  s += `<circle cx="${hx}" cy="${hy}" r="15" class="bp-a bp-fina"/><path d="${ticks}M${hx - 5},${hy}H${hx + 5}M${hx},${hy - 5}V${hy + 5}" class="bp-a bp-fina"/>`;
  s += cham(hx + 12, hy - 10, 120, 52, 'HUD BIOMÉTRICO', 'bp-t bp-ta');
  s += `<path d="M${cx - 46},109H${cx + 46}" class="bp-corte"/>${txt(cx - 50, 106, 'A', 'bp-tt')}${txt(cx + 50, 106, 'A', 'bp-tt', 'end')}`;
  if (o) s += cota(cx - 26, topo + 4, cx - 24 - o[1], topo - o[0], 'ALTURA DA ORELHA', -10);
  s += txt(cx, 200, 'VISTA FRONTAL', 'bp-st', 'middle');
  // corte óptico A-A
  s += txt(212, 40, 'CORTE A-A · ÓPTICA', 'bp-st', 'middle');
  s += `<circle cx="172" cy="122" r="11" class="bp-m"/><circle cx="180" cy="122" r="4" class="bp-l bp-f"/>`;
  for (const dy of [-26, -12, 12, 26]) s += `<path d="M268,${122 + dy * 1.4}L236,${122 + dy}L184,122" class="bp-raio"/>`;
  const camadas = [[200, 'VEDAÇÃO', 206, 150, 186, 180], [210, 'SENSOR TÉRMICO E BAIXA LUZ', 216, 158, 236, 196],
    [221, 'MATRIZ DE PROJEÇÃO HUD', 227, 94, 247, 62], [232, 'LENTE POLARIZADA', 238, 88, 258, 50]];
  camadas.forEach(([x, nome, px, py, tx, ty], i) => {
    s += `<path d="M${x},84 Q${x + 9},122 ${x},160" class="${i === 1 ? 'bp-a' : 'bp-m'}"/>`;
    s += cham(px, py, tx, ty, nome);
  });
  s += `<path d="M210,84 Q219,122 210,160 L221,160 Q230,122 221,84Z" style="fill:url(#bp-hach)" stroke="none"/>`;
  // sonar acústico
  s += txt(334, 40, 'SONAR ACÚSTICO', 'bp-st', 'middle');
  if (o) {
    const bx = 318;
    const by = 150;
    const tipX = bx + 6 + o[1];
    const tipY = by - Math.min(80, o[0] * 1.5);
    s += `<path d="M${bx - 14},${by} L${tipX},${tipY} L${bx + 18},${by} Z" class="bp-m bp-f"/><circle cx="${bx + 2}" cy="${by - 6}" r="3" class="bp-a"/>`;
    for (const r of [14, 24, 34]) s += `<path d="M${tipX + r * 0.5},${tipY - r * 0.86} A${r},${r} 0 0 1 ${tipX + r * 0.5},${tipY + r * 0.86}" class="bp-onda"/>`;
    s += cham(bx + 2, by - 6, 300, by + 30, 'RECEPTOR NA ORELHA');
    s += cham(tipX + 30, tipY, 356, tipY - 18, 'VARREDURA');
    s += cota(bx - 14, by + 4, bx + 18, by + 4, 'BASE', 8);
  } else {
    s += `<path d="M300,150 Q334,70 368,150 Z" class="bp-m bp-f"/><path d="M334,86V150" class="bp-a"/>${txt(334, 172, 'SEM ORELHAS', 'bp-t', 'middle')}${txt(334, 182, 'SENSOR NA CRISTA', 'bp-t', 'middle')}`;
  }
  return folha('T1', 'CAPUZ E LENTES', s, { ...op, folhaN: '1/4' });
}

function placas(p, op) {
  const lego = p.malha === 'abs';
  const P = iso(96, 150);
  const contorno = [[-60, -24], [-30, -34], [0, -30], [30, -34], [60, -24], [54, 18], [26, 34], [0, 30], [-26, 34], [-54, 18]];
  const camadas = lego ? [['url(#bp-ti)', 'PLÁSTICO ABS INJETADO']]
    : p.placas ? [['url(#bp-kev)', 'KEVLAR · TRAMA TRIPLA'], ['url(#bp-carb)', 'FIBRA DE CARBONO'], ['url(#bp-ti)', 'PLACA DE TITÂNIO']]
      : [['url(#bp-kev)', 'KEVLAR · TRAMA TRIPLA'], ['url(#bp-carb)', 'CARBONO FLEXÍVEL'], ['url(#bp-hach)', 'FORRO DE IMPACTO']];
  let s = '';
  const passo = 30;
  // guias de explosão ligando os cantos das camadas
  for (const c of [contorno[0], contorno[4], contorno[6]]) {
    const a = P(c[0], c[1], 0);
    const b = P(c[0], c[1], passo * camadas.length);
    s += `<path d="M${f(a[0])},${f(a[1])}L${f(b[0])},${f(b[1])}" class="bp-x"/>`;
  }
  camadas.forEach(([fill, nome], i) => {
    const z = i * passo;
    s += `<polygon points="${pts(contorno.map(([u, v]) => P(u, v, z)))}" style="fill:${fill}" class="bp-m"/>`;
    if (i === camadas.length - 1 && !lego) s += `<polygon points="${pts(contorno.map(([u, v]) => P(u * 0.86, v * 0.84, z)))}" class="bp-l"/>`;
    const [ax, ay] = P(58, -20, z);
    s += cham(ax, ay, 200, 172 - i * 34, nome);
  });
  const zt = camadas.length * passo;
  if (lego) {
    for (let u = -40; u <= 40; u += 20) for (let v = -14; v <= 14; v += 14) { const [x, y] = P(u, v, zt - passo); s += `<ellipse cx="${f(x)}" cy="${f(y - 3)}" rx="4" ry="2.2" class="bp-l"/>`; }
  }
  // emblema no topo, explodido
  const forma = p.emblema === 'ordem' ? null : p.emblema;
  if (forma) {
    if (p.oval) s += `<polygon points="${pts(Array.from({ length: 28 }, (_, k) => { const a = (k / 28) * Math.PI * 2; return P(Math.cos(a) * 42, Math.sin(a) * 22, zt); }))}" class="bp-a"/>`;
    s += `<polygon points="${pts(morcegoPts(forma, (x, y) => P(x * 150, -y * 90, zt)))}" class="bp-emb"/>`;
  } else {
    s += `<polygon points="${pts([[0, -26], [18, 0], [0, 26], [-18, 0]].map(([u, v]) => P(u, v, zt)))}" class="bp-emb"/>`;
  }
  const [ex, ey] = P(40, -10, zt);
  s += cham(ex, ey, 200, 172 - camadas.length * 34, forma ? 'EMBLEMA · ALVO DE IMPACTO' : 'INSÍGNIA DA ORDEM');
  // seção B-B
  s += txt(346, 40, 'SEÇÃO B-B', 'bp-st', 'middle');
  const secoes = lego ? [['url(#bp-ti)', 'ABS']] : p.placas ? [['url(#bp-ti)', 'TITÂNIO'], ['url(#bp-carb)', 'CARBONO'], ['url(#bp-kev)', 'KEVLAR'], ['url(#bp-hach)', 'FORRO']]
    : [['url(#bp-carb)', 'CARBONO'], ['url(#bp-kev)', 'KEVLAR'], ['url(#bp-hach)', 'FORRO']];
  let y = 62;
  for (const [fill, nome] of secoes) {
    s += `<rect x="316" y="${y}" width="26" height="22" style="fill:${fill}" class="bp-m"/>${txt(348, y + 14, nome)}`;
    y += 26;
  }
  s += `<path d="M308,62V${y - 4}" class="bp-cota" marker-start="url(#bp-seta)" marker-end="url(#bp-seta)"/>${txt(329, y + 6, 'ESPESSURA RELATIVA', 'bp-tc', 'middle')}`;
  s += txt(96, 200, 'VISTA EXPLODIDA ISOMÉTRICA', 'bp-st', 'middle');
  return folha('T2', 'PLACAS TORÁCICAS', s, { ...op, folhaN: '2/4' });
}

function icone(tipo, x, y) {
  if (tipo === 'ARPOADOR') return `<path d="M${x - 6},${y + 3}h8l3,-4h4M${x + 9},${y - 1}l3,-3M${x + 9},${y - 1}l3,3M${x - 2},${y + 3}v4" class="bp-a"/>`;
  if (tipo === 'BATARANGUES') return `<polygon points="${pts(morcegoPts('classico', (a, b) => [x + a * 20, y - b * 14]))}" class="bp-a"/>`;
  if (tipo === 'FUMAÇA') return `<circle cx="${x - 4}" cy="${y}" r="2.4" class="bp-a"/><circle cx="${x + 1}" cy="${y}" r="2.4" class="bp-a"/><circle cx="${x + 6}" cy="${y}" r="2.4" class="bp-a"/>`;
  return `<path d="M${x - 2},${y - 5}v8a2,2 0 0 0 4,0v-8zM${x - 3},${y - 5}h6" class="bp-a"/>`;
}

function cinto(p, op) {
  let s = '';
  if (!p.cinto) {
    s += `<path d="M110,150 Q200,178 290,150" class="bp-x"/><path d="M110,110 Q200,138 290,110" class="bp-x"/>`;
    s += txt(200, 96, 'SEM CINTO DE UTILIDADES NESTE TRAJE', 'bp-st', 'middle');
    s += txt(200, 190, 'EQUIPAMENTO INTEGRADO À ARMADURA', 'bp-t', 'middle');
    return folha('T3', 'CINTO MODULAR', s, { ...op, folhaN: '3/4' });
  }
  const cx = 200;
  const cy = 158;
  const lego = p.cinto === 'lego';
  s += `<ellipse cx="${cx}" cy="${cy}" rx="130" ry="36" class="bp-m"/><ellipse cx="${cx}" cy="${cy}" rx="118" ry="28" class="bp-l"/>`;
  s += `<rect x="${cx - 12}" y="${cy + 26}" width="24" height="16" class="bp-a bp-fa"/><polygon points="${pts(morcegoPts('classico', (a, b) => [cx + a * 18, cy + 34 - b * 12]))}" class="bp-a"/>`;
  const n = Math.min(10, p.bolsos || 8);
  const conteudo = ['ARPOADOR', 'BATARANGUES', 'FUMAÇA', 'KIT FORENSE'];
  const rotulos = { ARPOADOR: 'ARPOADOR', BATARANGUES: 'BATARANGUES', FUMAÇA: 'CÁPSULAS DE FUMAÇA', 'KIT FORENSE': 'KIT FORENSE' };
  let k = 0;
  for (let i = 0; i < n; i += 1) {
    const a = Math.PI * (0.08 + (0.84 * i) / Math.max(1, n - 1));
    if (Math.abs(a - Math.PI / 2) < 0.2) continue;
    const x = cx + Math.cos(a) * 124;
    const y = cy + Math.sin(a) * 32;
    const ex = 326 - k * 84;
    const ey = 76;
    if (lego) s += `<rect x="${f(x - 6)}" y="${f(y - 6)}" width="12" height="12" class="bp-m"/><circle cx="${f(x)}" cy="${f(y)}" r="3" class="bp-l"/>`;
    else if (p.cinto === 'capsulas') s += `<rect x="${f(x - 4)}" y="${f(y - 8)}" width="8" height="16" rx="4" class="bp-m bp-f"/>`;
    else s += `<rect x="${f(x - 7)}" y="${f(y - 7)}" width="14" height="14" rx="2" class="bp-m bp-f"/>`;
    if (k < conteudo.length && !lego) {
      const c = conteudo[k];
      s += `<path d="M${f(x)},${f(y - 8)}L${f(ex)},${f(ey + 9)}" class="bp-x"/>`;
      s += `<path d="M${f(ex - 10)},${f(ey - 8)}h20v16h-20z M${f(ex - 10)},${f(ey - 8)}l5,-5h20l-5,5 M${f(ex + 10)},${f(ey + 8)}l5,-5v-16" class="bp-m bp-f"/>`;
      s += icone(c, ex, ey);
      s += txt(ex, ey + 20, rotulos[c], 'bp-t', 'middle');
      k += 1;
    }
  }
  if (p.cinto === 'coldres') {
    for (const l of [-1, 1]) s += `<path d="M${cx + l * 130},${cy - 4} l${l * 10},0 l${l * 4},40 l${-l * 10},6 z" class="bp-v"/>`;
    s += txt(cx + 150, cy - 12, 'COLDRES', 'bp-t bp-tv', 'end');
  }
  s += txt(cx, 40, lego ? `PEÇA DE CINTO LEGO · ${n} MÓDULOS` : `VISTA SUPERIOR · ${n} COMPARTIMENTOS`, 'bp-st', 'middle');
  s += cham(cx + 12, cy + 34, 250, 204, 'FIVELA DE LIBERAÇÃO RÁPIDA');
  return folha('T3', 'CINTO MODULAR', s, { ...op, folhaN: '3/4' });
}

function malha(p, op) {
  let s = '';
  if (p.malha === 'abs') {
    for (let r = 0; r < 3; r += 1) for (let c = 0; c < 4; c += 1) {
      const x = 40 + c * 34;
      const y = 70 + r * 36;
      s += `<rect x="${x}" y="${y}" width="30" height="30" class="bp-m bp-f"/><ellipse cx="${x + 15}" cy="${y + 15}" rx="8" ry="8" class="bp-l"/>`;
    }
    s += txt(210, 100, 'PLÁSTICO ABS', 'bp-st');
    s += txt(210, 116, 'MINIFIGURA SEM MALHA BALÍSTICA', 'bp-t');
    s += txt(210, 128, 'PINOS DE ENCAIXE NO PADRÃO LEGO', 'bp-t');
    return folha('T4', 'MALHA BALÍSTICA', s, { ...op, folhaN: '4/4' });
  }
  // trama ampliada
  const cx = 78;
  const cy = 118;
  let trama = '';
  for (let r = 0; r < 11; r += 1) for (let c = 0; c < 11; c += 1) {
    const x = cx - 66 + c * 12;
    const y = cy - 66 + r * 12;
    trama += (r + c) % 2 ? `<rect x="${x}" y="${y + 2.5}" width="12" height="7" rx="3" class="bp-fio"/>` : `<rect x="${x + 2.5}" y="${y}" width="7" height="12" rx="3" class="bp-fio"/>`;
  }
  s += `<clipPath id="bp-lupa"><circle cx="${cx}" cy="${cy}" r="56"/></clipPath><g clip-path="url(#bp-lupa)">${trama}</g>`;
  s += `<circle cx="${cx}" cy="${cy}" r="56" class="bp-g"/><path d="M${cx + 40},${cy + 40}L${cx + 58},${cy + 58}" class="bp-g" stroke-width="4"/>`;
  s += txt(cx, 44, 'TRAMA DE ARAMIDA · AMPLIADA', 'bp-st', 'middle');
  // cadeia molecular: anel benzênico e grupo amida, com ligações de hidrogênio entre cadeias paralelas
  const hex = (x, y) => `<polygon points="${pts(Array.from({ length: 6 }, (_, k) => [x + Math.cos(Math.PI / 6 + (k * Math.PI) / 3) * 9, y + Math.sin(Math.PI / 6 + (k * Math.PI) / 3) * 9]))}" class="bp-m"/><circle cx="${x}" cy="${y}" r="4.5" class="bp-l"/>`;
  const cadeia = (y0, inv) => {
    let c = '';
    for (let i = 0; i < 2; i += 1) {
      const x = 166 + i * 60;
      c += hex(x, y0);
      c += `<path d="M${x + 9},${y0}H${x + 22}M${x + 22},${y0}V${y0 + (inv ? 10 : -10)}M${x + 22},${y0}H${x + 36}M${x + 36},${y0}V${y0 + (inv ? -10 : 10)}M${x + 36},${y0}H${x + 51}" class="bp-l"/>`;
      c += txt(x + 22, y0 + (inv ? 18 : -13), 'O', 'bp-at', 'middle') + txt(x + 36, y0 + (inv ? -13 : 18), 'H', 'bp-at', 'middle') + txt(x + 36, y0 + (inv ? 9 : -4), 'N', 'bp-at', 'middle');
    }
    return c;
  };
  s += cadeia(96, false) + cadeia(146, true);
  for (const x of [202, 262]) s += `<path d="M${x - 14},${108}L${x},${128}" class="bp-hb"/>`;
  s += txt(226, 44, 'CADEIA POLIMÉRICA', 'bp-st', 'middle');
  s += txt(226, 70, 'POLI(P-FENILENO TEREFTALAMIDA)', 'bp-t', 'middle');
  s += cham(232, 118, 200, 196, 'LIGAÇÕES DE HIDROGÊNIO ENTRE CADEIAS');
  // dispersão de impacto na malha hexagonal
  let hx = '';
  for (let r = 0; r < 7; r += 1) for (let c = 0; c < 5; c += 1) {
    const x = 318 + c * 12 + (r % 2 ? 6 : 0);
    const y = 76 + r * 10.4;
    hx += `<polygon points="${pts(Array.from({ length: 6 }, (_, k) => [x + Math.cos((k * Math.PI) / 3 + Math.PI / 6) * 6, y + Math.sin((k * Math.PI) / 3 + Math.PI / 6) * 6]))}" class="bp-l"/>`;
  }
  s += hx;
  for (const r of [6, 13, 20, 27]) s += `<circle cx="342" cy="107" r="${r}" class="bp-onda-a"/>`;
  s += `<path d="M380,60L346,103" class="bp-a" marker-end="url(#bp-seta-a)"/>`;
  s += txt(346, 44, 'DISPERSÃO DE IMPACTO', 'bp-st', 'middle');
  const extra = { placas: 'PLACAS DE COMPÓSITO SOBRE A MALHA', termica: 'CAMADA REFRATÁRIA CONTRA CHAMAS', tecido: 'TECIDO TÁTICO SOBRE A ARAMIDA', kevlar: 'KEVLAR EM TRAMA TRIPLA' }[p.malha] || '';
  s += txt(346, 168, extra.split(' ').slice(0, 3).join(' '), 'bp-t', 'middle') + txt(346, 178, extra.split(' ').slice(3).join(' '), 'bp-t', 'middle');
  return folha('T4', 'MALHA BALÍSTICA', s, { ...op, folhaN: '4/4' });
}

export const FOLHAS_TRAJE = [
  { chave: 'capuz', titulo: 'CAPUZ E LENTES', hotspot: 'lentes', gerar: capuz },
  { chave: 'placas', titulo: 'PLACAS TORÁCICAS', hotspot: 'peitoral', gerar: placas },
  { chave: 'cinto', titulo: 'CINTO MODULAR', hotspot: 'cinto', gerar: cinto },
  { chave: 'malha', titulo: 'MALHA BALÍSTICA', hotspot: 'luvas', gerar: malha },
];

export const FOLHA_DO_HOTSPOT = { lentes: 'capuz', peitoral: 'placas', cinto: 'cinto', luvas: 'malha', capa: 'malha' };

export function plantaTraje(chave, perfil, versaoId) {
  const fo = FOLHAS_TRAJE.find((x) => x.chave === chave);
  return fo ? fo.gerar(perfil, { versao: versaoId.toUpperCase() }) : '';
}

// ───────────── veículos ─────────────

function notaVerif(modelo, chave) {
  const d = DADOS_VERIFICADOS[modelo];
  return d && d[chave] ? `DADO VERIFICADO: ${d[chave].join(' · ')} (${d.fonte.toUpperCase()})` : null;
}

function turbina(tipo, op) {
  let s = '';
  if (tipo === 'lego') {
    for (let i = 0; i < 4; i += 1) {
      for (const l of [-1, 1]) {
        const x = 110 + i * 40;
        const y = 120 + l * 24;
        s += `<rect x="${x}" y="${y - 12}" width="30" height="24" rx="3" class="bp-m bp-f"/><ellipse cx="${x + 15}" cy="${y - 12}" rx="8" ry="3" class="bp-l"/><path d="M${x + 15},${y + l * 12}v${l * 18}" class="bp-a"/>`;
      }
    }
    s += `<rect x="100" y="104" width="180" height="32" class="bp-m" style="fill:url(#bp-hach)"/>`;
    s += cham(125, 96, 150, 60, 'CILINDROS EM PEÇAS CROMADAS') + cham(262, 120, 300, 186, 'BLOCO DO MOTOR EM V') + cham(125, 162, 90, 196, 'ESCAPAMENTOS');
    return folha('V2', 'MOTOR · VISTA EXPLODIDA', s, { ...op, folhaN: op.folhaN });
  }
  const cy = 125;
  const eixo = `<path d="M18,${cy}H382" class="bp-eixo"/>`;
  // carcaça em corte (parede hachurada) espelhada em cima e embaixo
  const perfil = [[30, 52], [44, 48], [70, 48], [96, 42], [150, 32], [162, 40], [206, 40], [214, 34], [246, 36], [260, 40], [330, 40], [362, 22]];
  const parede = (sinal) => {
    const ext = perfil.map(([x, r]) => [x, cy - sinal * (r + 5)]);
    const int = perfil.slice().reverse().map(([x, r]) => [x, cy - sinal * r]);
    return `<polygon points="${pts([...ext, ...int])}" style="fill:url(#bp-hach)" class="bp-m"/>`;
  };
  s += eixo + parede(1) + parede(-1);
  s += `<path d="M40,${cy}Q46,${cy - 12} 60,${cy - 13}V${cy + 13}Q46,${cy + 12} 40,${cy}Z" class="bp-m bp-f"/>`;
  for (let i = -3; i <= 3; i += 1) s += `<path d="M${62 + i},${cy - 14}L${68 + i * 0.5},${cy - 46}M${62 + i},${cy + 14}L${68 + i * 0.5},${cy + 46}" class="bp-l"/>`;
  for (let i = 0; i < 7; i += 1) {
    const x = 96 + i * 8;
    const r = 40 - i * 2.2;
    s += `<rect x="${x}" y="${cy - r}" width="3" height="${f(r - 12)}" class="bp-m bp-f"/><rect x="${x}" y="${cy + 12}" width="3" height="${f(r - 12)}" class="bp-m bp-f"/><path d="M${x + 5},${cy - r + 2}v${f(r - 16)}M${x + 5},${cy + 14}v${f(r - 16)}" class="bp-l"/>`;
  }
  s += `<rect x="150" y="${cy - 12}" width="100" height="24" class="bp-l bp-f"/>`;
  for (const sn of [1, -1]) {
    s += `<rect x="166" y="${cy - sn * 36 - (sn > 0 ? 0 : 16)}" width="38" height="16" rx="8" class="bp-m"/>`;
    for (let i = 0; i < 3; i += 1) s += `<ellipse cx="${174 + i * 11}" cy="${cy - sn * 28}" rx="4" ry="2.4" class="bp-chama"/>`;
  }
  for (let i = 0; i < 3; i += 1) {
    const x = 214 + i * 10;
    s += `<rect x="${x}" y="${cy - 32}" width="4" height="20" class="bp-a bp-fa"/><rect x="${x}" y="${cy + 12}" width="4" height="20" class="bp-a bp-fa"/>`;
  }
  s += `<polygon points="${pts([[266, cy - 30], [362, cy - 12], [362, cy + 12], [266, cy + 30]])}" class="bp-chama-z"/>`;
  for (const r of [-24, 0, 24]) s += `<path d="M262,${cy + r - 5}L270,${cy + r}L262,${cy + r + 5}" class="bp-a"/>`;
  for (const r of [-30, -15, 15, 30]) s += `<circle cx="256" cy="${cy + r}" r="1.4" class="bp-pt"/>`;
  s += `<path d="M330,${cy - 40}L362,${cy - 22}M330,${cy + 40}L362,${cy + 22}M338,${cy - 38}L362,${cy - 26}M338,${cy + 38}L362,${cy + 26}" class="bp-m"/>`;
  const rot = [[36, 'ADMISSÃO', -1, 44], [66, 'FAN', 1, 60], [118, 'COMPRESSOR', -1, 120], [185, 'CÂMARA DE COMBUSTÃO', 1, 200],
    [226, 'TURBINA', -1, 212], [296, 'PÓS-COMBUSTOR', 1, 316], [352, 'BOCAL VARIÁVEL', -1, 330]];
  for (const [x, nome, lado, tx] of rot) s += cham(x, cy + lado * 44, tx, cy + lado * 76, nome);
  const titulo = tipo === 'voador' ? 'PROPULSOR VETORIAL · CORTE' : tipo === 'moto' ? 'PROPULSÃO · CORTE LONGITUDINAL' : 'TURBINA · CORTE LONGITUDINAL';
  return folha('V2', titulo, s, op);
}

function rodas(tipo, op, verif) {
  let s = '';
  const grande = tipo === 'tanque';
  const tx = grande ? 104 : 112;
  const tw = grande ? 52 : 38;
  const ty = grande ? 50 : 62;
  const th = grande ? 150 : 126;
  if (tipo === 'lego') {
    s += `<circle cx="120" cy="125" r="60" class="bp-m"/><circle cx="120" cy="125" r="44" class="bp-l"/><circle cx="120" cy="125" r="18" class="bp-m bp-f"/>`;
    s += `<path d="M114,119h12v-8h-12zM114,131h12v8h-12zM108,121h6v8h-6zM126,121h6v8h-6z" class="bp-a"/>`;
    for (let i = 0; i < 16; i += 1) { const a = (i / 16) * Math.PI * 2; s += `<rect x="${f(120 + Math.cos(a) * 62 - 3)}" y="${f(125 + Math.sin(a) * 62 - 3)}" width="6" height="6" class="bp-l"/>`; }
    s += cham(126, 125, 250, 80, 'EIXO TECHNIC EM CRUZ') + cham(160, 90, 250, 120, 'PNEU DE BORRACHA') + cham(150, 150, 250, 160, 'ARO DE PLÁSTICO ABS');
    return folha('V3', 'RODA E EIXO', s, op);
  }
  // pneu em corte com blocos de banda, aro, cubo e disco
  s += `<rect x="${tx}" y="${ty}" width="${tw}" height="${th}" rx="${grande ? 18 : 12}" class="bp-m" style="fill:url(#bp-hach)"/>`;
  s += `<rect x="${tx + 7}" y="${ty + 18}" width="${tw - 14}" height="${th - 36}" rx="4" class="bp-fundo bp-m"/>`;
  for (let y = ty + 8; y < ty + th - 8; y += grande ? 12 : 10) s += `<rect x="${tx + tw - 1}" y="${y}" width="${grande ? 6 : 3}" height="${grande ? 7 : 5}" class="bp-l bp-f"/>`;
  s += `<rect x="${tx - 8}" y="${ty + 40}" width="4" height="${th - 80}" class="bp-a bp-fa"/><rect x="${tx - 13}" y="${ty + 30}" width="14" height="16" rx="2" class="bp-v"/>`;
  s += `<rect x="${tx - 22}" y="${ty + 50}" width="12" height="${th - 100}" class="bp-m bp-f"/>`;
  if (tipo === 'moto') {
    s += `<path d="M${tx - 16},${ty + th / 2}L40,${ty + th / 2 + 30}" class="bp-g"/><circle cx="40" cy="${ty + th / 2 + 30}" r="5" class="bp-m"/>`;
    s += `<path d="M70,${ty + th / 2 + 12}L56,${ty + 30}" class="bp-m"/><path d="${Array.from({ length: 8 }, (_, i) => `${i ? 'L' : 'M'}${f(66 - i * 1.6 + (i % 2 ? 5 : -5))},${f(ty + th / 2 + 8 - i * 7)}`).join('')}" class="bp-a"/>`;
    s += cham(46, ty + th / 2 + 26, 60, 206, 'BALANÇA MONOBRAÇO') + cham(60, ty + 60, 76, 44, 'AMORTECEDOR CENTRAL');
  } else if (tipo === 'voador') {
    s += `<path d="M${tx - 16},${ty + th / 2}L60,40" class="bp-g"/><path d="M${tx - 30},${ty + th / 2 - 20}L80,54" class="bp-m"/><circle cx="60" cy="40" r="5" class="bp-m"/>`;
    s += cham(66, 52, 90, 206, 'TREM DE POUSO RETRÁTIL') + cham(78, 58, 190, 36, 'ATUADOR DE RECOLHIMENTO');
  } else {
    const yUp = ty + 44;
    const yDn = ty + th - 44;
    s += `<path d="M${tx - 22},${yUp}L40,${yUp - 16}M${tx - 22},${yUp}L40,${yUp + 4}M${tx - 22},${yDn}L40,${yDn - 4}M${tx - 22},${yDn}L40,${yDn + 16}" class="bp-m"/>`;
    s += `<rect x="30" y="${yUp - 24}" width="10" height="${yDn - yUp + 48}" style="fill:url(#bp-hach)" class="bp-m"/>`;
    const mx0 = 78;
    s += `<path d="M${mx0},${yDn - 6}L${mx0 - 18},${yUp - 16}" class="bp-g"/>`;
    let hel = '';
    for (let i = 0; i <= 12; i += 1) {
      const t = i / 12;
      const x = mx0 - 18 * t + (i % 2 ? 6 : -6);
      const y = yDn - 12 - (yDn - yUp - 4) * t;
      hel += `${i ? 'L' : 'M'}${f(x)},${f(y)}`;
    }
    s += `<path d="${hel}" class="bp-a"/>`;
    s += cham(58, yUp - 2, 76, 42, 'BRAÇO SUPERIOR') + cham(58, yDn + 4, 76, 206, 'BRAÇO INFERIOR') + cham(66, (yUp + yDn) / 2, 150, 34, 'MOLA HELICOIDAL E AMORTECEDOR');
  }
  s += cham(tx - 6, ty + 60, 170, 206, 'DISCO', 'bp-t bp-ta') + cham(tx - 6, ty + 38, 200, 96, 'PINÇA');
  s += cham(tx + tw, ty + 20, tx + tw + 30, ty + 6, grande ? 'PNEU FORA DE ESTRADA' : 'PNEU');
  if (verif) s += cota(tx + tw + 10, ty, tx + tw + 10, ty + th, 'Ø 44 POL · VERIFICADO', -12);
  // disco em vista frontal
  const dx = 318;
  const dy = 128;
  let furos = '';
  for (let r = 0; r < 3; r += 1) for (let k = 0; k < 18; k += 1) {
    const a = (k / 18) * Math.PI * 2 + r * 0.12;
    const rr = 36 + r * 8;
    furos += `<circle cx="${f(dx + Math.cos(a) * rr)}" cy="${f(dy + Math.sin(a) * rr)}" r="1.4" class="bp-l"/>`;
  }
  s += `<circle cx="${dx}" cy="${dy}" r="62" class="bp-m bp-f"/><circle cx="${dx}" cy="${dy}" r="28" class="bp-m"/>${furos}`;
  for (let k = 0; k < 5; k += 1) { const a = (k / 5) * Math.PI * 2; s += `<circle cx="${f(dx + Math.cos(a) * 16)}" cy="${f(dy + Math.sin(a) * 16)}" r="2.6" class="bp-m"/>`; }
  s += `<path d="M${dx + 30},${dy - 58} A66,66 0 0 1 ${dx + 62},${dy - 20} L${dx + 50},${dy - 16} A54,54 0 0 0 ${dx + 24},${dy - 46} Z" class="bp-v"/>`;
  s += txt(dx, 52, 'DISCO · VISTA FRONTAL', 'bp-st', 'middle');
  s += txt(dx, 206, tipo === 'moto' ? 'DISCO PERFURADO' : 'CARBONO-CERÂMICA VENTILADO', 'bp-t', 'middle');
  s += cham(dx + 46, dy - 38, 360, 70, 'PINÇA MULTIPISTÃO');
  const titulo = tipo === 'voador' ? 'TREM DE POUSO E FREIOS' : tipo === 'moto' ? 'RODA, SUSPENSÃO E FREIO' : 'SUSPENSÃO E FREIOS DE CARBONO';
  return folha('V3', titulo, s, op);
}

function blindagem(tipo, op) {
  let s = '';
  const P = iso(70, 140);
  const L = 150;
  const W = 60;
  const H = 46;
  const nos = [];
  const seg = 3;
  for (let i = 0; i <= seg; i += 1) for (const v of [0, W]) for (const z of [0, H]) nos.push([(i * L) / seg, v, z]);
  const id = (i, v, z) => P((i * L) / seg, v, z);
  const linha = (a, b, cls = 'bp-m') => `<path d="M${f(a[0])},${f(a[1])}L${f(b[0])},${f(b[1])}" class="${cls}"/>`;
  for (let i = 0; i <= seg; i += 1) {
    for (const [v1, z1, v2, z2] of [[0, 0, W, 0], [0, H, W, H], [0, 0, 0, H], [W, 0, W, H]]) s += linha(id(i, v1, z1), id(i, v2, z2));
    if (i < seg) {
      for (const [v, z] of [[0, 0], [W, 0], [0, H], [W, H]]) s += linha(id(i, v, z), id(i + 1, v, z), 'bp-g');
      s += linha(id(i, 0, 0), id(i + 1, 0, H), 'bp-l') + linha(id(i, W, H), id(i + 1, 0, H), 'bp-l') + linha(id(i, W, 0), id(i + 1, W, H), 'bp-l');
    }
  }
  for (const [u, v, z] of nos) { const [x, y] = P(u, v, z); s += `<circle cx="${f(x)}" cy="${f(y)}" r="2" class="bp-no"/>`; }
  const [ax, ay] = id(1, 0, H);
  const [bx, by] = id(2, W, 0);
  s += cham(ax, ay, 150, 44, tipo === 'lego' ? 'VIGAS TECHNIC COM FUROS' : 'CHASSI TUBULAR TRIANGULADO') + cham(bx, by, 150, 214, 'NÓS SOLDADOS');
  // pilha de blindagem reativa explodida
  const Q = iso(262, 180);
  const tile = [[-36, -22], [36, -22], [36, 22], [-36, 22]];
  const camadas = tipo === 'lego'
    ? [['url(#bp-ti)', 'PLACA LISA'], ['url(#bp-hach)', 'PLACA COM PINOS']]
    : [['url(#bp-hach)', 'ANTIESTILHAÇO'], ['url(#bp-ti)', 'PLACA INTERNA'], ['url(#bp-hach-a)', 'CAMADA REATIVA'], ['url(#bp-ti)', 'PLACA EXTERNA']];
  camadas.forEach(([fill, nome], i) => {
    const z = i * 26;
    s += `<polygon points="${pts(tile.map(([u, v]) => Q(u, v, z)))}" style="fill:${fill}" class="${nome === 'CAMADA REATIVA' ? 'bp-a' : 'bp-m'}"/>`;
    const [x, y] = Q(36, -22, z);
    s += cham(x, y, 318, 168 - i * 26, nome);
  });
  const [tx, ty] = Q(0, 0, camadas.length * 26 - 26);
  if (tipo !== 'lego') s += `<path d="M${f(tx + 68)},${f(ty - 62)}L${f(tx + 6)},${f(ty - 6)}" class="bp-a" marker-end="url(#bp-seta-a)"/><path d="M${f(tx - 4)},${f(ty - 10)} q-16,-18 -6,-40 M${f(tx + 2)},${f(ty - 12)} q-10,-18 4,-30" class="bp-onda-a"/>${txt(tx + 72, ty - 64, 'PROJÉTIL', 'bp-t bp-ta')}`;
  const titulo = tipo === 'lego' ? 'CHASSI TECHNIC E PLACAS' : tipo === 'moto' ? 'CHASSI E CARENAGEM BLINDADA' : 'BLINDAGEM REATIVA E CHASSI TUBULAR';
  return folha('V4', titulo, s, op);
}

function gauge(x, y, r, nome) {
  let t = '';
  for (let i = 0; i <= 20; i += 1) {
    const a = Math.PI * (0.75 + (1.5 * i) / 20);
    const r2 = i % 5 ? r - 3 : r - 6;
    t += `M${f(x + Math.cos(a) * r)},${f(y + Math.sin(a) * r)}L${f(x + Math.cos(a) * r2)},${f(y + Math.sin(a) * r2)}`;
  }
  return `<circle cx="${x}" cy="${y}" r="${r}" class="bp-m bp-f"/><path d="${t}" class="bp-l"/><path d="M${x},${y}L${f(x + r * 0.6)},${f(y - r * 0.45)}" class="bp-a"/><circle cx="${x}" cy="${y}" r="2" class="bp-pt"/>${txt(x, y + r + 9, nome, 'bp-tc', 'middle')}`;
}

function cockpit(tipo, op) {
  let s = '';
  if (tipo === 'moto') {
    s += `<path d="M60,120 Q120,96 200,110 Q280,96 340,120" class="bp-g"/><rect x="170" y="112" width="60" height="40" rx="4" class="bp-m bp-f"/>`;
    s += `<rect x="178" y="118" width="44" height="26" class="bp-l"/><path d="M182,138l8,-8l6,4l10,-12l12,8" class="bp-a"/>`;
    s += gauge(140, 150, 16, 'RPM') + gauge(260, 150, 16, 'VELOCIDADE');
    s += `<rect x="40" y="114" width="26" height="12" rx="6" class="bp-m"/><rect x="334" y="114" width="26" height="12" rx="6" class="bp-m"/>`;
    s += cham(200, 130, 260, 60, 'PAINEL CENTRAL') + cham(52, 120, 64, 196, 'MANOPLAS') + txt(200, 204, 'PILOTO DEITADO SOBRE O CHASSI', 'bp-st', 'middle');
    return folha('V1', 'POSIÇÃO DE PILOTAGEM', s, op);
  }
  s += `<path d="M40,64 Q200,26 360,64" class="bp-m"/><path d="M40,64 L30,120 M360,64 L370,120" class="bp-l"/>`;
  s += `<path d="M30,122 Q200,98 370,122 L358,196 L42,196 Z" class="bp-m bp-f"/>`;
  s += `<polygon points="170,72 230,72 238,100 162,100" class="bp-l bp-f"/><circle cx="200" cy="86" r="7" class="bp-a"/><path d="M190,86h20M200,76v20" class="bp-a bp-fina"/>`;
  s += `<rect x="148" y="118" width="48" height="40" class="bp-m"/><circle cx="172" cy="138" r="14" class="bp-l"/><path d="M172,138L182,128" class="bp-a"/>`;
  s += `<rect x="204" y="118" width="48" height="40" class="bp-m"/>`;
  for (let i = 0; i < 6; i += 1) s += `<rect x="${210 + i * 7}" y="${152 - (8 + ((i * 7) % 20))}" width="4" height="${8 + ((i * 7) % 20)}" class="bp-a bp-fa"/>`;
  s += gauge(92, 150, 22, 'VELOCÍMETRO') + gauge(308, 150, 22, tipo === 'lego' ? 'PEÇA DE MOSTRADOR' : 'TEMP. DA TURBINA');
  for (let i = 0; i < 5; i += 1) s += `<rect x="${58 + i * 11}" y="124" width="7" height="5" class="bp-l"/><rect x="${290 + i * 11}" y="124" width="7" height="5" class="bp-l"/>`;
  if (tipo === 'voador') s += `<path d="M196,196V168 M188,168h16v-10h-16z M262,196l8,-24h10l-6,24" class="bp-g"/>` + cham(196, 170, 120, 212, 'MANCHE') + cham(274, 176, 300, 204, 'ACELERADOR');
  else s += `<path d="M160,204 Q160,176 200,176 Q240,176 240,204 M168,204h-10v-12 M232,204h10v-12" class="bp-g"/>` + cham(200, 176, 120, 214, tipo === 'lego' ? 'VOLANTE LEGO' : 'VOLANTE EM MANCHE');
  s += cham(230, 88, 290, 50, 'HUD PROJETADO NO VIDRO') + cham(160, 124, 96, 50, 'MFD TÁTICO · RADAR') + cham(250, 140, 330, 96, 'TELEMETRIA');
  return folha('V1', 'COCKPIT · PAINEL DE INSTRUMENTOS', s, op);
}

function armas(tipo, op) {
  let s = '';
  const cy = 110;
  s += `<rect x="40" y="${cy - 8}" width="200" height="16" class="bp-m" style="fill:url(#bp-hach)"/><rect x="46" y="${cy - 4}" width="190" height="8" class="bp-fundo bp-l"/>`;
  for (let x = 60; x < 230; x += 12) s += `<path d="M${x},${cy - 4}l8,8" class="bp-l"/>`;
  s += `<rect x="24" y="${cy - 12}" width="18" height="24" class="bp-m bp-f"/><path d="M28,${cy - 12}v24M34,${cy - 12}v24" class="bp-l"/>`;
  s += `<rect x="240" y="${cy - 22}" width="44" height="44" class="bp-m" style="fill:url(#bp-hach)"/><path d="M262,${cy + 22}v30h-18v-8" class="bp-m"/>`;
  s += `<path d="M284,${cy}h20" class="bp-l"/>${Array.from({ length: 6 }, (_, i) => `<path d="M${286 + i * 3},${cy - 6}l1.5,12" class="bp-a"/>`).join('')}`;
  s += cham(33, cy + 12, 44, 170, 'FREIO DE BOCA') + cham(140, cy - 8, 120, 56, 'CANO RAIADO') + cham(262, cy - 22, 250, 56, 'CULATRA') + cham(254, cy + 46, 200, 186, 'ALIMENTAÇÃO') + cham(296, cy, 330, 150, 'RECUO');
  s += `<rect x="318" y="44" width="66" height="46" rx="6" class="bp-m bp-f"/>`;
  for (let r = 0; r < 2; r += 1) for (let c = 0; c < 3; c += 1) s += `<circle cx="${332 + c * 19}" cy="${57 + r * 20}" r="7" class="bp-m"/><circle cx="${332 + c * 19}" cy="${57 + r * 20}" r="2.4" class="bp-a"/>`;
  s += txt(351, 102, tipo === 'moto' ? 'LANÇADOR DE GANCHO' : 'LANÇADOR MÚLTIPLO', 'bp-t', 'middle');
  s += txt(140, 44, 'CANHÃO · CORTE LONGITUDINAL', 'bp-st', 'middle');
  return folha('V5', 'SISTEMAS DE ARMAS', s, op);
}

export const FOLHAS_VEICULO = { cockpit: cockpit, turbina: turbina, rodas: rodas, blindagem: blindagem, armas: armas };
export const TITULO_FOLHA_VEIC = { cockpit: 'COCKPIT', turbina: 'PROPULSÃO', rodas: 'SUSPENSÃO E FREIOS', blindagem: 'BLINDAGEM E CHASSI', armas: 'ARMAS' };
export const ORDEM_FOLHAS_VEIC = ['cockpit', 'turbina', 'rodas', 'blindagem', 'armas'];

export function plantaVeiculo(chave, tipo, modelo, versaoId, n = 1, total = 1) {
  const g = FOLHAS_VEICULO[chave];
  if (!g) return '';
  const nota = notaVerif(modelo, chave);
  const op = { versao: versaoId.toUpperCase(), folhaN: `${n}/${total}` };
  if (nota) op.nota = nota;
  return chave === 'rodas' ? g(tipo, op, !!nota) : g(tipo, op);
}
