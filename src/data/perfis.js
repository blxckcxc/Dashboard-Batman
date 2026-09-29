// Parâmetros qualitativos usados pelas plantas técnicas e pelo visualizador 2.5D.
// Traços dos trajes (orelhas, lentes, emblema, cinto, malha) observados nas referências do acervo.
// Números só entram com fonte verificada (DADOS_VERIFICADOS); o resto é descrição qualitativa.

const P = (o = {}) => ({ orelhas: 'medias', boca: true, lentes: 'brancas', emblema: 'classico', oval: false, placas: false, cinto: 'bolsos', bolsos: 8, malha: 'kevlar', ...o });

const DCAU = P({ oval: true });
const BALE = P({ orelhas: 'curtas', emblema: 'angular', placas: true, cinto: 'capsulas', bolsos: 10 });
const BEYOND = P({ orelhas: 'longas', boca: false, lentes: 'fenda', emblema: 'alto', cinto: null, malha: 'tecido' });
const MILLER = P({ orelhas: 'curtas', emblema: 'largo' });
const ARKHAM = P({ emblema: 'angular', placas: true, bolsos: 10, malha: 'placas' });
const ABSOLUTO = P({ orelhas: 'lamina', emblema: 'machado', placas: true, bolsos: 6, malha: 'placas' });
const N52 = P({ placas: true, malha: 'placas' });
const TB04 = P({ orelhas: 'curvas', oval: true, bolsos: 6, malha: 'tecido' });
const LORDE = P({ emblema: 'lorde', bolsos: 6 });
const THOMAS = P({ lentes: 'vermelhas', cinto: 'coldres', bolsos: 4 });
const AZBAT = P({ orelhas: 'curtas', boca: false, lentes: 'vermelhas', emblema: 'angular', placas: true, bolsos: 6, malha: 'placas' });
const LEGO = P({ orelhas: 'lego', emblema: 'oval', oval: true, cinto: 'lego', malha: 'abs' });

const PERFIS = {
  v01: { 1992: DCAU, tnba: P({ orelhas: 'longas' }), fogo: P({ malha: 'termica', emblema: 'classico' }) },
  v02: { tdk: BALE, begins: { ...BALE, placas: false } },
  v03: { nano: BEYOND, exo: { ...BEYOND, placas: true, malha: 'placas' } },
  v04: { cinza: MILLER, armadura: { ...MILLER, boca: false, lentes: 'fenda', placas: true, cinto: null, malha: 'placas' } },
  v05: { city: { ...ARKHAM, placas: false, malha: 'kevlar' }, knight: ARKHAM, xe: ARKHAM },
  v06: { padrao: ABSOLUTO, capa: ABSOLUTO, machado: ABSOLUTO },
  v07: { padrao: N52, hush: P({ malha: 'tecido' }), thrasher: { ...N52, boca: false, lentes: 'fenda' }, buster: { ...N52, boca: false, lentes: 'fenda', cinto: null } },
  v08: { padrao: TB04, noturno: TB04 },
  v09: { lorde: LORDE, duelo: LORDE },
  v10: { flashpoint: THOMAS, queda: THOMAS, duelo: THOMAS },
  v11: { azrael: P({ orelhas: null, boca: false, lentes: 'fenda', emblema: 'ordem', placas: true, bolsos: 4, malha: 'placas' }), azbat: AZBAT, garras: AZBAT },
  v12: { lego: LEGO, notebook: LEGO },
};

export function perfilTraje(versao, traje) {
  const g = PERFIS[versao] || {};
  return g[traje] || Object.values(g)[0] || P();
}

// Família de desenho técnico de cada veículo
export const TIPO_VEICULO = {
  btas: 'carro', tnba: 'carro', n52: 'carro', tb04: 'carro', knightfall: 'carro',
  tumbler: 'tanque', tanque: 'tanque', arkham: 'tanque', absoluto: 'tanque', tb04pesado: 'tanque',
  batpod: 'moto', batmoto: 'moto', beyond: 'voador', jato: 'voador', lego: 'lego',
};

// Dados de produção conferidos em duas fontes (Batman Wiki "Black Tumbler" e Dark Knight Wiki "Tumbler", 28/09/2026).
// Comprimento e largura divergem entre as fontes e ficaram de fora.
export const DADOS_VERIFICADOS = {
  tumbler: {
    fonte: 'Batman Wiki e Dark Knight Wiki',
    turbina: ['MOTOR V8 GM DE 5,7 L (VEÍCULO DE FILMAGEM)'],
    rodas: ['PNEUS TRASEIROS INTERCO SUPER SWAMPER DE 44 POL'],
    blindagem: ['MASSA: 2,5 TONELADAS CURTAS (2,3 t)'],
  },
};

// Pontos de inspeção sobre cada vista (x e y de 0 a 1 a partir do canto superior esquerdo da imagem).
// rodas2 marca a segunda roda para o esquema interno do raio-x; jato é a direção da chama em graus (0 = direita).
export const PONTOS = {
  'v01:btas:34': { cockpit: [0.56, 0.3], turbina: [0.95, 0.14], blindagem: [0.3, 0.5], rodas: [0.57, 0.8], rodas2: [0.93, 0.37], jato: -25 },
  'v01:btas:lateral': { cockpit: [0.3, 0.2], turbina: [0.03, 0.55], blindagem: [0.78, 0.55], rodas: [0.63, 0.65], rodas2: [0.22, 0.68], jato: 180 },
  'v01:tnba:frontal': { cockpit: [0.36, 0.24], blindagem: [0.5, 0.55] },
  'v02:tumbler:acervo': { cockpit: [0.33, 0.42], turbina: [0.9, 0.3], blindagem: [0.5, 0.3], rodas: [0.72, 0.62], rodas2: [0.07, 0.75], armas: [0.14, 0.52], jato: -15 },
  'v02:tumbler:34': { cockpit: [0.5, 0.45], turbina: [0.9, 0.45], blindagem: [0.35, 0.42], rodas: [0.63, 0.8], rodas2: [0.07, 0.6], armas: [0.22, 0.2], jato: 0 },
  'v02:batpod:34': { cockpit: [0.5, 0.28], rodas: [0.35, 0.55], rodas2: [0.73, 0.62], armas: [0.1, 0.55], blindagem: [0.56, 0.48] },
  'v03:beyond:34': { cockpit: [0.38, 0.52], turbina: [0.8, 0.55], blindagem: [0.58, 0.5], jato: 0 },
  'v04:tanque:34': { blindagem: [0.55, 0.4], rodas: [0.18, 0.32], armas: [0.72, 0.25] },
  'v05:perseguicao:lateral': { cockpit: [0.55, 0.3], turbina: [0.04, 0.42], blindagem: [0.38, 0.4], rodas: [0.87, 0.65], rodas2: [0.14, 0.65], armas: [0.72, 0.4], jato: 180 },
  'v05:perseguicao:frontal': { cockpit: [0.5, 0.32], blindagem: [0.5, 0.62], rodas: [0.15, 0.6], rodas2: [0.85, 0.6] },
  'v05:batalha:34': { armas: [0.72, 0.12], cockpit: [0.6, 0.4], blindagem: [0.42, 0.55], rodas: [0.55, 0.82], rodas2: [0.12, 0.82], turbina: [0.95, 0.45], jato: 0 },
  'v05:batalha:traseira': { armas: [0.52, 0.12], cockpit: [0.52, 0.3], blindagem: [0.5, 0.45], rodas: [0.08, 0.55], rodas2: [0.92, 0.55], turbina: [0.47, 0.62], jato: 90 },
  'v06:absoluto:34': { cockpit: [0.55, 0.3], blindagem: [0.62, 0.45], rodas: [0.38, 0.55] },
  'v07:n52:34': { cockpit: [0.45, 0.38], turbina: [0.12, 0.15], blindagem: [0.7, 0.55], rodas: [0.27, 0.57], jato: 200 },
  'v08:esportivo:34': { cockpit: [0.55, 0.25], turbina: [0.04, 0.42], blindagem: [0.35, 0.45], rodas: [0.52, 0.62], rodas2: [0.93, 0.62], jato: 180 },
  'v08:pesado:34': { cockpit: [0.55, 0.3], blindagem: [0.45, 0.5] },
  'v10:batmoto:34': { cockpit: [0.45, 0.22], rodas: [0.35, 0.85], blindagem: [0.5, 0.55] },
  'v11:knightfall:34': { cockpit: [0.5, 0.28], blindagem: [0.5, 0.62], rodas: [0.12, 0.72], rodas2: [0.88, 0.72] },
  'v12:lego:34': { cockpit: [0.6, 0.1], turbina: [0.5, 0.45], blindagem: [0.22, 0.58], rodas: [0.55, 0.85], rodas2: [0.92, 0.6] },
};
