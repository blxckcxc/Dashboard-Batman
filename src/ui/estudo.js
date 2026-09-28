// Painéis de estudo técnico do vault em SVG, gerados a partir do preset do manequim:
// capuz (orelhas e lentes), placas torácicas explodidas, cinto modular e malha balística.
import { MORCEGOS } from '../trajes/manequim.js';

const CIANO = '#38BDF8';
const AMBAR = '#F59E0B';
const VERMELHO = '#EF4444';

const hex = (n) => `#${n.toString(16).padStart(6, '0')}`;

function caminhoMorcego(forma, cx, cy, escala) {
  const meia = MORCEGOS[forma] || MORCEGOS.classico;
  const pts = [...meia, ...meia.slice().reverse().map(([x, y]) => [-x, y])];
  return `M${pts.map(([x, y]) => `${(cx + x * escala).toFixed(1)},${(cy - y * escala).toFixed(1)}`).join(' L')} Z`;
}

function painel(titulo, corpo) {
  return `<figure class="estudo-painel"><figcaption>${titulo}</figcaption><svg viewBox="0 0 240 140" aria-hidden="true">${corpo}</svg></figure>`;
}

function capuz(p) {
  const c = p.capuz;
  const cor = c.boca === false ? CIANO : VERMELHO;
  const o = c.orelhas;
  const orelha = (lado) => {
    if (!o) return '';
    const bx = 60 + lado * 16;
    const alt = o.altura * 170;
    const larg = (o.largura ?? 0.07) * 150;
    const topoX = bx + lado * (o.abertura ?? 0.1) * 60 + (o.curva ?? 0) * 200 * lado;
    return `<path d="M${bx - larg / 2},46 Q${bx + lado * 2},${46 - alt * 0.6} ${topoX},${46 - alt} L${bx + larg / 2},48" fill="none" stroke="${cor}" stroke-width="1.4"/>`;
  };
  const lente = (lado) => {
    if (c.lentes === 'redonda') return `<ellipse cx="${60 + lado * 11}" cy="62" rx="5" ry="3.5" fill="${hex(p.cores.lentes)}" opacity=".85"/>`;
    const fina = c.lentes === 'fenda';
    return `<path d="M${60 + lado * 4},${fina ? 63 : 62} L${60 + lado * 18},${fina ? 60 : 58} L${60 + lado * 17},${fina ? 64 : 65} Z" fill="${hex(p.cores.lentes)}" opacity=".85"/>`;
  };
  const boca = c.boca === false ? '' : `<path d="M47,78 Q60,96 73,78" fill="none" stroke="${AMBAR}" stroke-width="1" stroke-dasharray="3 2"/>`;
  const frente = `<ellipse cx="60" cy="68" rx="26" ry="31" fill="none" stroke="${cor}" stroke-width="1.4"/>${orelha(1)}${orelha(-1)}${lente(1)}${lente(-1)}${boca}`;
  const perfil = `<path d="M150,42 Q182,40 186,70 L182,82 Q176,98 160,100 Q142,98 138,74 Q138,48 150,42 Z" fill="none" stroke="${CIANO}" stroke-width="1.4"/>
    ${o ? `<path d="M152,44 L${150 - (o.abertura ?? 0.1) * 30},${44 - o.altura * 150} L162,42" fill="none" stroke="${CIANO}" stroke-width="1.2"/>` : ''}
    <path d="M178,64 L186,62" stroke="${hex(p.cores.lentes)}" stroke-width="2"/>`;
  const legenda = `<text x="60" y="126" class="leg">FRENTE</text><text x="162" y="126" class="leg">PERFIL</text>
    <text x="206" y="30" class="leg dir">${o ? 'ORELHAS' : 'SEM ORELHAS'}</text><text x="206" y="42" class="leg dir">${c.boca === false ? 'MÁSCARA FECHADA' : 'BOCA ABERTA'}</text>`;
  return painel('CAPUZ · ORELHAS E LENTES', frente + perfil + legenda);
}

function placas(p) {
  const e = p.emblema;
  const corEmb = e && p.cores.emblemaBrilho ? VERMELHO : AMBAR;
  let s = '';
  if (e && e.oval) s += `<ellipse cx="62" cy="62" rx="40" ry="24" fill="none" stroke="${AMBAR}" stroke-width="1.2"/>`;
  if (e) s += `<path d="${caminhoMorcego(e.forma, 62, 62, e.oval ? 70 : 84)}" fill="none" stroke="${corEmb}" stroke-width="1.4"/>`;
  else s += `<path d="M62,40 L72,62 L62,86 L52,62 Z" fill="none" stroke="${AMBAR}" stroke-width="1.4"/><text x="62" y="104" class="leg">INSÍGNIA DA ORDEM</text>`;
  if (p.placas) {
    for (const [dx, dy] of [[0, 0], [8, 7], [16, 14]]) {
      s += `<path d="M${140 + dx},${34 + dy} l38,-6 l6,26 l-40,6 Z M${188 + dx},${28 + dy} l38,6 l-4,26 l-40,-6 Z" fill="none" stroke="${dx ? CIANO : AMBAR}" stroke-width="1" opacity="${1 - dx / 30}"/>`;
    }
    for (let i = 0; i < 3; i += 1) s += `<rect x="${166}" y="${82 + i * 13}" width="16" height="10" fill="none" stroke="${CIANO}"/><rect x="${188}" y="${82 + i * 13}" width="16" height="10" fill="none" stroke="${CIANO}"/>`;
    s += `<text x="185" y="132" class="leg">PLACAS SEGMENTADAS</text>`;
  } else {
    s += `<path d="M150,40 Q185,30 222,40 L218,110 Q185,120 154,110 Z" fill="none" stroke="${CIANO}" stroke-width="1.2"/><path d="M156,48 Q185,38 214,48" fill="none" stroke="${CIANO}" stroke-dasharray="3 3"/><text x="185" y="132" class="leg">MALHA CONTÍNUA</text>`;
  }
  s += `<text x="62" y="128" class="leg">EMBLEMA</text>`;
  return painel('PLACAS TORÁCICAS', s);
}

function cinto(p) {
  if (!p.cinto) return painel('CINTO MODULAR', `<text x="120" y="74" class="leg">SEM CINTO DE UTILIDADES</text>`);
  const n = p.cinto.bolsos ?? 8;
  let s = `<ellipse cx="120" cy="66" rx="92" ry="32" fill="none" stroke="${hex(p.cores.cinto)}" stroke-width="1.6"/>
    <ellipse cx="120" cy="66" rx="80" ry="24" fill="none" stroke="${CIANO}" stroke-width=".8" stroke-dasharray="4 3"/>`;
  for (let i = 0; i < n; i += 1) {
    const a = -Math.PI * 0.85 + (i / (n - 1)) * Math.PI * 1.7;
    if (Math.abs(a) < 0.25) continue;
    const x = 120 + Math.sin(a) * 104;
    const y = 66 + Math.cos(a) * 40;
    s += p.cinto.capsulas
      ? `<rect x="${x - 4}" y="${y - 8}" width="8" height="16" rx="4" fill="none" stroke="${AMBAR}"/>`
      : `<rect x="${x - 7}" y="${y - 7}" width="14" height="14" rx="2" fill="none" stroke="${AMBAR}"/>`;
    s += `<line x1="${120 + Math.sin(a) * 92}" y1="${66 + Math.cos(a) * 32}" x2="${x}" y2="${y}" stroke="${CIANO}" stroke-width=".6"/>`;
  }
  s += `<rect x="110" y="94" width="20" height="12" fill="none" stroke="${AMBAR}" stroke-width="1.4"/>`;
  if (p.cinto.coldres) s += `<rect x="18" y="86" width="12" height="30" fill="none" stroke="${VERMELHO}"/><rect x="210" y="86" width="12" height="30" fill="none" stroke="${VERMELHO}"/>`;
  s += `<text x="120" y="130" class="leg">${n} MÓDULOS${p.cinto.coldres ? ' · COLDRES' : ''}</text>`;
  return painel('CINTO MODULAR', s);
}

function malha(p) {
  const camadas = p.tipo === 'lego'
    ? ['PLÁSTICO ABS', 'PINOS DE ENCAIXE']
    : [p.textura === 'carbono' ? 'KEVLAR TRANÇADO' : p.textura === 'hexagonal' ? 'MALHA TÉRMICA' : 'TECIDO TÁTICO', 'MALHA BALÍSTICA HEXAGONAL', p.placas ? 'PLACAS DE COMPÓSITO' : 'FORRO DE IMPACTO'];
  let s = '<defs><clipPath id="clipHex"><rect x="10" y="12" width="110" height="112" rx="4"/></clipPath></defs><g clip-path="url(#clipHex)">';
  const r = 9;
  for (let l = 0; l < 10; l += 1) {
    for (let c = 0; c < 9; c += 1) {
      const cx = 10 + c * r * 1.73 + (l % 2 ? r * 0.87 : 0);
      const cy = 12 + l * r * 1.5;
      const pts = [];
      for (let k = 0; k < 6; k += 1) pts.push(`${(cx + Math.cos(Math.PI / 6 + (k * Math.PI) / 3) * r).toFixed(1)},${(cy + Math.sin(Math.PI / 6 + (k * Math.PI) / 3) * r).toFixed(1)}`);
      s += `<polygon points="${pts.join(' ')}" fill="none" stroke="${(l + c) % 5 ? CIANO : AMBAR}" stroke-width=".8" opacity=".8"/>`;
    }
  }
  s += '</g>';
  camadas.forEach((nome, i) => {
    const y = 30 + i * 30;
    s += `<rect x="134" y="${y - 12}" width="96" height="20" fill="none" stroke="${i === 1 ? AMBAR : CIANO}"/><text x="182" y="${y + 2}" class="leg">${nome}</text>`;
  });
  return painel('MALHA BALÍSTICA', s);
}

export function renderEstudo(p, esq, dir) {
  esq.innerHTML = capuz(p) + placas(p);
  dir.innerHTML = cinto(p) + malha(p);
}
