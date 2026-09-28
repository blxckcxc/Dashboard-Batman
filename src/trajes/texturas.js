// Texturas procedurais em canvas para os trajes: malha hexagonal balística, fibra de carbono trançada
// e costuras de placas. São mapas de relevo (bumpMap) em tons de cinza, repetidos sobre as UVs do loft.
import * as THREE from 'three';

const cache = new Map();

function tela(lado = 256) {
  const c = document.createElement('canvas');
  c.width = lado;
  c.height = lado;
  return c;
}

function textura(canvas, repeticao) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeticao[0], repeticao[1]);
  tex.anisotropy = 4;
  return tex;
}

// hexágonos em relevo: bordas escuras (baixo) e miolo claro (alto)
function hexagonal() {
  const c = tela(256);
  const g = c.getContext('2d');
  g.fillStyle = '#9a9a9a';
  g.fillRect(0, 0, 256, 256);
  const r = 16;
  const w = r * Math.sqrt(3);
  g.strokeStyle = '#1a1a1a';
  g.lineWidth = 3;
  for (let linha = -1; linha < 256 / (r * 1.5) + 1; linha += 1) {
    for (let col = -1; col < 256 / w + 1; col += 1) {
      const cx = col * w + (linha % 2 ? w / 2 : 0);
      const cy = linha * r * 1.5;
      g.beginPath();
      for (let k = 0; k < 6; k += 1) {
        const a = Math.PI / 6 + (k * Math.PI) / 3;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (k === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.closePath();
      g.stroke();
    }
  }
  return c;
}

// fibra de carbono: sarja 2x2 com faixas alternadas
function carbono() {
  const c = tela(128);
  const g = c.getContext('2d');
  const n = 8;
  const s = 128 / n;
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) {
      const vert = (Math.floor((i + j) / 2) % 2) === 0;
      const grad = vert ? g.createLinearGradient(i * s, 0, i * s + s, 0) : g.createLinearGradient(0, j * s, 0, j * s + s);
      grad.addColorStop(0, '#3a3a3a');
      grad.addColorStop(0.5, '#c8c8c8');
      grad.addColorStop(1, '#3a3a3a');
      g.fillStyle = grad;
      g.fillRect(i * s, j * s, s, s);
    }
  }
  return c;
}

// placas segmentadas: costuras horizontais e verticais, com rebites
function placas() {
  const c = tela(256);
  const g = c.getContext('2d');
  g.fillStyle = '#b0b0b0';
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = '#202020';
  g.lineWidth = 4;
  for (let y = 0; y <= 256; y += 64) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(256, y);
    g.stroke();
  }
  for (let y = 0; y < 256; y += 64) {
    const desloc = (y / 64) % 2 ? 64 : 0;
    for (let x = desloc; x <= 256; x += 128) {
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x, y + 64);
      g.stroke();
    }
  }
  g.fillStyle = '#e8e8e8';
  for (let y = 10; y < 256; y += 64) for (let x = 10; x < 256; x += 32) g.fillRect(x, y, 3, 3);
  return c;
}

// tecido elástico: ruído fino, quase liso
function tecido() {
  const c = tela(128);
  const g = c.getContext('2d');
  const img = g.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 150 + Math.random() * 40;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}

const GERADORES = { hexagonal, carbono, placas, tecido };

export function relevo(tipo, repeticao = [6, 6]) {
  const chave = `${tipo}:${repeticao.join('x')}`;
  if (cache.has(chave)) return cache.get(chave);
  const tex = textura((GERADORES[tipo] || tecido)(), repeticao);
  cache.set(chave, tex);
  return tex;
}
