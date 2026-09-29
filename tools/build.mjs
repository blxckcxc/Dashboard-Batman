// Build offline: gera os módulos de assets, hologramas e fontes, confere a regra do hífen duplo nos fontes próprios,
// empacota com esbuild (IIFE clássico, abre via file://) e escreve o HTML autocontido.
import { build, transform } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const r = (...p) => join(RAIZ, ...p);
const HIFEN_DUPLO = [String.fromCharCode(45, 45), String.fromCharCode(45, 32, 45)];

// 1. assets como data URL
const manifest = JSON.parse(readFileSync(r('assets', 'manifest.json'), 'utf8'));
for (const extra of ['avatares.json', 'holos_manifest.json']) {
  if (existsSync(r('assets', extra))) manifest.push(...JSON.parse(readFileSync(r('assets', extra), 'utf8')));
}
const assets = {};
for (const m of manifest) assets[m.chave] = `data:image/webp;base64,${readFileSync(r('assets', `${m.chave}.webp`)).toString('base64')}`;
mkdirSync(r('src', '_gerado'), { recursive: true });
writeFileSync(r('src', '_gerado', 'assets.js'), `export const ASSETS = ${JSON.stringify(assets)};\n`);

// 1b. dados do acervo holográfico 2.5D (ângulos, caixas de cabeça, pontos de inspeção e vistas)
const holos = existsSync(r('assets', 'holos.json')) ? JSON.parse(readFileSync(r('assets', 'holos.json'), 'utf8')) : { trajes: {}, veiculos: {} };
writeFileSync(r('src', '_gerado', 'holos.js'), `export const HOLOS = ${JSON.stringify(holos)};
`);

// 2. fontes locais (subconjunto latino, woff2) embutidas no CSS
const FONTES = [
  ['Orbitron', 'orbitron', [600, 700, 800]],
  ['Rajdhani', 'rajdhani', [500, 600, 700]],
  ['Inter', 'inter', [400, 600]],
];
let fontesCss = '';
for (const [familia, pasta, pesos] of FONTES) {
  for (const p of pesos) {
    const arq = r('node_modules', '@fontsource', pasta, 'files', `${pasta}-latin-${p}-normal.woff2`);
    const b64 = readFileSync(arq).toString('base64');
    fontesCss += `@font-face{font-family:'${familia}';font-style:normal;font-weight:${p};font-display:swap;src:url(data:font/woff2;base64,${b64}) format('woff2');}\n`;
  }
}

// 3. regra: nenhum hífen duplo nos fontes de autoria própria
function listar(dir, exts) {
  const out = [];
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) {
      if (n !== '_gerado') out.push(...listar(p, exts));
    } else if (exts.includes(extname(n))) out.push(p);
  }
  return out;
}
const proprios = [...listar(r('src'), ['.js', '.css']), r('index.html'), ...listar(r('tools'), ['.mjs', '.py'])];
for (const extra of ['README.md', 'LACUNAS.md']) if (existsSync(r(extra))) proprios.push(r(extra));
const falhas = [];
for (const arq of proprios) {
  const linhas = readFileSync(arq, 'utf8').split('\n');
  linhas.forEach((l, i) => {
    if (HIFEN_DUPLO.some((h) => l.includes(h))) falhas.push(`${arq.replace(RAIZ, '.')}:${i + 1}: ${l.trim().slice(0, 90)}`);
  });
}
if (falhas.length) {
  console.error('Regra do hífen duplo violada:\n' + falhas.join('\n'));
  process.exit(1);
}

// 4. empacotamento
mkdirSync(r('dist'), { recursive: true });
await build({
  entryPoints: [r('src', 'main.js')],
  bundle: true,
  format: 'iife',
  minify: true,
  target: ['es2020'],
  outfile: r('dist', 'app.js'),
  legalComments: 'eof',
  logLevel: 'warning',
});
const css = await transform(fontesCss + readFileSync(r('src', 'styles', 'main.css'), 'utf8'), { loader: 'css', minify: true });
writeFileSync(r('dist', 'app.css'), css.code);

// 5. HTML autocontido
const js = readFileSync(r('dist', 'app.js'), 'utf8').replace(/<\/script/gi, '<\\/script');
let html = readFileSync(r('index.html'), 'utf8');
html = html.replace('<link rel="stylesheet" href="dist/app.css">', () => `<style>${css.code}</style>`);
html = html.replace('<script src="dist/app.js"></script>', () => `<script>${js}</script>`);
writeFileSync(r('DASHBOARD_BATMAN_MULTIVERSO.html'), html);

const kb = (p) => `${(statSync(p).size / 1024).toFixed(0)} KB`;
console.log(`assets: ${manifest.length} imagens`);
console.log(`dist/app.js ${kb(r('dist', 'app.js'))} · dist/app.css ${kb(r('dist', 'app.css'))}`);
console.log(`DASHBOARD_BATMAN_MULTIVERSO.html ${kb(r('DASHBOARD_BATMAN_MULTIVERSO.html'))}`);
console.log(`hífen duplo: 0 ocorrências em ${proprios.length} arquivos próprios`);
