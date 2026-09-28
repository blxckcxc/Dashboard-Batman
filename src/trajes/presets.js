// Parâmetros do manequim 3D por versão e por variante de traje. Cada preset define silhueta
// (porte, ombros, cintura), capuz (orelhas, boca, lentes), emblema, armadura, cinto, manoplas, capa e cores.
// É uma interpretação em 3D das referências oficiais do acervo, não uma réplica.

const CLARO = 0xe8f4ff;
const PELE = 0xc99a78;

const BASE = {
  porte: 1, ombros: 1, cintura: 1, textura: 'tecido', aletas: 3, aberturaBracos: 0.2,
  capuz: { orelhas: { altura: 0.18, largura: 0.07, abertura: 0.12 }, boca: true, lentes: 'padrao' },
  emblema: { forma: 'classico', largura: 0.36 },
  cinto: { bolsos: 8 },
  capa: { largura: 1.6, base: 0.32, recortes: 3, dobras: 3, curva: 0.3 },
};

function preset(base, extra = {}) {
  const r = { ...BASE, ...base, ...extra };
  r.capuz = { ...BASE.capuz, ...(base.capuz || {}), ...(extra.capuz || {}) };
  r.capuz.orelhas = r.capuz.orelhas === null ? null : { ...BASE.capuz.orelhas, ...(base.capuz?.orelhas || {}), ...(extra.capuz?.orelhas || {}) };
  r.cores = { pele: PELE, lentes: CLARO, ...(base.cores || {}), ...(extra.cores || {}) };
  for (const k of ['emblema', 'cinto', 'capa']) {
    if (extra[k] === null || base[k] === null) r[k] = extra[k] === undefined ? base[k] : extra[k];
    else r[k] = { ...BASE[k], ...(base[k] || {}), ...(extra[k] || {}) };
  }
  return r;
}

// DCAU: traje cinza, capuz e capa azul-escuros, oval amarelo, queixo quadrado
const DCAU = {
  porte: 1.12, ombros: 1.1, cintura: 0.9,
  capuz: { orelhas: { altura: 0.22, largura: 0.07, abertura: 0.1 }, boca: true },
  emblema: { forma: 'classico', oval: true, largura: 0.36 },
  cinto: { bolsos: 8 },
  cores: { traje: 0x7b8394, capuz: 0x1f2a44, capa: 0x1f2a44, luvas: 0x1f2a44, botas: 0x1f2a44, cinto: 0xe0b12b, emblema: 0x0a0a0c, emblemaFundo: 0xf2c230, brilho: 0x93c5fd, capaBrilho: 0x3b82f6 },
};

// Bale: kevlar preto trançado com placas segmentadas, orelhas curtas, morcego esculpido
const BALE = {
  porte: 1.05, ombros: 1.05, textura: 'carbono', placas: true, joelheiras: true,
  capuz: { orelhas: { altura: 0.12, largura: 0.06, abertura: 0.06 }, boca: true },
  emblema: { forma: 'angular', largura: 0.3 },
  cinto: { bolsos: 10, capsulas: true },
  cores: { traje: 0x1a1c20, armadura: 0x24272c, capuz: 0x131417, capa: 0x0c0d10, luvas: 0x16181b, botas: 0x16181b, cinto: 0x6b6f76, emblema: 0x0c0d10, brilho: 0x475569 },
};

// Beyond: esguio, capuz fechado sem boca, orelhas altas e finas, morcego vermelho, sem capa
const BEYOND = {
  porte: 0.86, ombros: 0.98, cintura: 0.86,
  capuz: { orelhas: { altura: 0.3, largura: 0.05, abertura: 0.06 }, boca: false, lentes: 'fenda' },
  emblema: { forma: 'beyond', largura: 0.44, altura: 2.1 },
  cinto: null, capa: null,
  cores: { traje: 0x0b0b0e, capuz: 0x0b0b0e, capa: 0x0b0b0e, luvas: 0x0b0b0e, botas: 0x0b0b0e, cinto: 0x111111, emblema: 0xdc2626, emblemaBrilho: 0.8, brilho: 0x7f1d1d },
};

// Miller: colosso cinza, orelhas curtas, morcego largo, capa enorme
const MILLER = {
  porte: 1.3, ombros: 1.16, cintura: 1.05,
  capuz: { orelhas: { altura: 0.1, largura: 0.075, abertura: 0.18 }, boca: true, escala: 1.08 },
  emblema: { forma: 'miller', largura: 0.44 },
  cinto: { bolsos: 8 },
  capa: { largura: 2.0, base: 0.2, recortes: 4, dobras: 4 },
  cores: { traje: 0x6f7480, capuz: 0x121316, capa: 0x121316, luvas: 0x121316, botas: 0x121316, cinto: 0xd4a52a, emblema: 0x0a0a0b, brilho: 0x64748b },
};

// Arkham: armadura tática militar em placas de titânio, morcego angular esculpido
const ARKHAM = {
  porte: 1.15, ombros: 1.12, textura: 'placas', placas: true, ombreiras: true, joelheiras: true,
  capuz: { orelhas: { altura: 0.17, largura: 0.075, abertura: 0.1 }, boca: true, angular: true },
  emblema: { forma: 'angular', largura: 0.36 },
  cinto: { bolsos: 10 },
  cores: { traje: 0x2a2d33, armadura: 0x3a3e45, capuz: 0x26292e, capa: 0x121315, luvas: 0x1e2024, botas: 0x1e2024, cinto: 0x8a8f96, emblema: 0x0e0f11, brilho: 0x94a3b8 },
};

// Absoluto: colosso de peito muralha, orelhas em lâmina, morcego-machado, manoplas com lâminas
const ABSOLUTO = {
  porte: 1.42, ombros: 1.22, cintura: 1.08, placas: true, ombreiras: true, laminas: true, joelheiras: true, textura: 'placas',
  capuz: { orelhas: { altura: 0.36, largura: 0.05, abertura: 0.04 }, boca: true, escala: 1.05 },
  emblema: { forma: 'machado', largura: 0.5 },
  cinto: { bolsos: 6 },
  capa: { largura: 1.9, base: 0.25, recortes: 5, dobras: 5, curva: 0.4 },
  cores: { traje: 0x16181c, armadura: 0x3b3f46, capuz: 0x121316, capa: 0x0e0f11, luvas: 0x2a2d33, botas: 0x1a1c20, cinto: 0x5b6068, emblema: 0x8b9099, brilho: 0x64748b },
};

// Novos 52: blindagem elegante com costuras, capuz anatômico de Capullo
const N52 = {
  porte: 1.1, ombros: 1.08, textura: 'placas', placas: true, joelheiras: true,
  capuz: { orelhas: { altura: 0.2, largura: 0.065, abertura: 0.08 }, boca: true },
  emblema: { forma: 'classico', largura: 0.4 },
  cinto: { bolsos: 8 },
  cores: { traje: 0x2b3038, armadura: 0x353b45, capuz: 0x15171b, capa: 0x15171b, luvas: 0x15171b, botas: 0x15171b, cinto: 0x3b414b, emblema: 0x0b0c0e, brilho: 0x60a5fa },
};

// The Batman 2004: esguio e alongado, orelhas curvas, oval amarelo, capa com forro azul
const TB04 = {
  porte: 0.95, ombros: 1.08, cintura: 0.84,
  capuz: { orelhas: { altura: 0.22, largura: 0.08, abertura: 0.34, curva: 0.07 }, boca: true },
  emblema: { forma: 'classico', oval: true, largura: 0.32 },
  cinto: { bolsos: 6 },
  capa: { largura: 1.8, base: 0.38, recortes: 4, dobras: 3, curva: 0.35 },
  cores: { traje: 0x8a93a3, capuz: 0x0d0f14, capa: 0x0d0f14, luvas: 0x0d0f14, botas: 0x0d0f14, cinto: 0xf2c230, emblema: 0x0a0a0c, emblemaFundo: 0xf2c230, brilho: 0x60a5fa, capaBrilho: 0x2563eb },
};

// Lorde Batman: traje militar cinza e preto, morcego prateado estilizado
const LORDE = {
  porte: 1.12, ombros: 1.1, cintura: 0.9,
  capuz: { orelhas: { altura: 0.2, largura: 0.07, abertura: 0.12 }, boca: true },
  emblema: { forma: 'lorde', largura: 0.5, altura: 2.12 },
  cinto: { bolsos: 6 },
  cores: { traje: 0x16181d, capuz: 0x101216, capa: 0x101216, luvas: 0x101216, botas: 0x101216, cinto: 0x4b5563, emblema: 0xb8c2cf, brilho: 0x94a3b8 },
};

// Thomas Wayne: morcego vermelho, lentes vermelhas acesas, coldres e lâminas nas manoplas
const THOMAS = {
  porte: 1.1, ombros: 1.06, laminas: true, joelheiras: true,
  capuz: { orelhas: { altura: 0.15, largura: 0.07, abertura: 0.14 }, boca: true, lentes: 'fenda' },
  emblema: { forma: 'classico', largura: 0.38 },
  cinto: { bolsos: 4, coldres: true },
  capa: { largura: 1.9, base: 0.26, recortes: 5, dobras: 4, curva: 0.4 },
  cores: { traje: 0x2a2c31, capuz: 0x141518, capa: 0x0f1012, luvas: 0x141518, botas: 0x141518, cinto: 0x5a2a22, emblema: 0xb91c1c, emblemaBrilho: 0.5, lentes: 0xef4444, brilho: 0x7f1d1d },
};

// Azrael: armadura vermelha e dourada da Ordem de São Dumas, capuz sem orelhas com crista
const AZRAEL = {
  porte: 1.08, ombros: 1.1, placas: true, ombreiras: true, textura: 'placas',
  capuz: { orelhas: null, boca: false, lentes: 'fenda', crista: true },
  emblema: null,
  cinto: { bolsos: 4 },
  capa: { largura: 1.7, base: 0.3, recortes: 0, dobras: 4, curva: 0.3 },
  cores: { traje: 0xe5e0d4, armadura: 0xc9982f, capuz: 0xa3161a, capa: 0xa3161a, luvas: 0xc9982f, botas: 0xa3161a, cinto: 0xc9982f, emblema: 0xc9982f, lentes: 0xf8fafc, brilho: 0xfca5a5, capaBrilho: 0xf87171 },
};

// AzBat: armadura azul e dourada, elmo angular, manoplas pesadas
const AZBAT = {
  porte: 1.2, ombros: 1.18, placas: true, ombreiras: true, joelheiras: true, laminas: true, textura: 'placas',
  capuz: { orelhas: { altura: 0.16, largura: 0.09, abertura: 0.2 }, boca: false, lentes: 'fenda', angular: true },
  emblema: { forma: 'angular', largura: 0.44 },
  cinto: { bolsos: 6 },
  capa: { largura: 2.0, base: 0.28, recortes: 5, dobras: 4, curva: 0.45 },
  cores: { traje: 0x1d3f8f, armadura: 0xc9982f, capuz: 0x1d3f8f, capa: 0x1e3a8a, luvas: 0xc9982f, botas: 0x1d3f8f, cinto: 0x8a5a24, emblema: 0xc9982f, lentes: 0xef4444, brilho: 0x93c5fd, capaBrilho: 0x60a5fa },
};

const PRESETS = {
  v01: {
    1992: preset(DCAU),
    tnba: preset(DCAU, {
      capuz: { orelhas: { altura: 0.28, largura: 0.06, abertura: 0.08 } },
      emblema: { forma: 'classico', oval: false, largura: 0.42 },
      cores: { traje: 0x6b7280, capuz: 0x0b0c0f, capa: 0x0b0c0f, luvas: 0x0b0c0f, botas: 0x0b0c0f, cinto: 0xd9a92a, emblema: 0x0a0a0c, capaBrilho: 0x475569 },
    }),
    fogo: preset(DCAU, {
      textura: 'hexagonal', capa: null,
      cores: { traje: 0xb9c0c9, capuz: 0x8a939e, luvas: 0x8a939e, botas: 0x8a939e, cinto: 0x6b7280, emblema: 0x111317, emblemaFundo: 0xb9c0c9, brilho: 0xe2e8f0 },
      emblema: { forma: 'classico', oval: false, largura: 0.36 },
    }),
  },
  v02: { tdk: preset(BALE), begins: preset(BALE, { placas: false, textura: 'carbono', capuz: { orelhas: { altura: 0.14 } } }) },
  v03: {
    nano: preset(BEYOND),
    exo: preset(BEYOND, { porte: 1.25, ombros: 1.2, placas: true, ombreiras: true, textura: 'placas', cores: { armadura: 0x2a2d33 } }),
  },
  v04: {
    cinza: preset(MILLER),
    armadura: preset(MILLER, {
      porte: 1.55, ombros: 1.3, placas: true, ombreiras: true, joelheiras: true, textura: 'placas',
      capuz: { orelhas: { altura: 0.08, largura: 0.09 }, boca: false, lentes: 'fenda', angular: true, escala: 1.12 },
      capa: null, cinto: null,
      cores: { traje: 0x4a4f58, armadura: 0x5c626c, capuz: 0x3a3f47, luvas: 0x5c626c, botas: 0x5c626c, emblema: 0x0a0a0b, lentes: 0xfbbf24 },
    }),
  },
  v05: {
    city: preset(ARKHAM, { ombreiras: false, placas: false, textura: 'carbono', cores: { traje: 0x3a3e45, capuz: 0x121315, luvas: 0x121315, botas: 0x121315 } }),
    knight: preset(ARKHAM),
    xe: preset(ARKHAM, { porte: 1.22, cores: { traje: 0x2f3a46, armadura: 0x4a5a6a, lentes: 0x7dd3fc, emblema: 0x38bdf8, emblemaBrilho: 1.2, brilho: 0x38bdf8 } }),
  },
  v06: {
    padrao: preset(ABSOLUTO),
    capa: preset(ABSOLUTO, { capa: { largura: 2.3, base: 0.12, recortes: 6, dobras: 6, curva: 0.55 } }),
    machado: preset(ABSOLUTO),
  },
  v07: {
    padrao: preset(N52),
    hush: preset(N52, { placas: false, textura: 'tecido', emblema: { forma: 'classico', largura: 0.42 }, cores: { traje: 0x5d6573, cinto: 0xd9a92a, brilho: 0x93c5fd } }),
    thrasher: preset(N52, {
      porte: 1.4, ombros: 1.25, ombreiras: true, capuz: { lentes: 'fenda', boca: false, angular: true, orelhas: { altura: 0.14, largura: 0.08 } },
      cores: { traje: 0x1a1c20, armadura: 0x2a2d33, lentes: 0xef4444 }, capa: { largura: 1.8, base: 0.4 },
    }),
    buster: preset(N52, {
      porte: 1.75, ombros: 1.45, cintura: 1.3, ombreiras: true, laminas: true, capa: null, cinto: null,
      capuz: { lentes: 'fenda', boca: false, angular: true, escala: 0.9, orelhas: { altura: 0.1, largura: 0.08 } },
      cores: { traje: 0x3b3f46, armadura: 0x6b7280, capuz: 0x4b5563, luvas: 0x6b7280, botas: 0x4b5563, lentes: 0x38bdf8, emblema: 0x111317 },
    }),
  },
  v08: { padrao: preset(TB04), noturno: preset(TB04, { cores: { traje: 0x6b7384 } }) },
  v09: { lorde: preset(LORDE), duelo: preset(LORDE) },
  v10: {
    flashpoint: preset(THOMAS),
    queda: preset(THOMAS, { capa: { largura: 2.2, base: 0.18, curva: 0.6, recortes: 6, dobras: 5 } }),
    duelo: preset(THOMAS),
  },
  v11: { azrael: preset(AZRAEL), azbat: preset(AZBAT), garras: preset(AZBAT, { garras: true }) },
  v12: {
    lego: preset({ tipo: 'lego', cores: { traje: 0x1c1d21, capuz: 0x121316, capa: 0x121316, luvas: 0x121316, botas: 0x1c1d21, cinto: 0xf2c230, emblema: 0x0a0a0c, emblemaFundo: 0xf2c230, pele: 0xf2cf9a } }),
    notebook: preset({ tipo: 'lego', cores: { traje: 0x1c1d21, capuz: 0x121316, capa: 0x121316, luvas: 0x121316, botas: 0x1c1d21, cinto: 0xf2c230, emblema: 0x0a0a0c, emblemaFundo: 0xf2c230, pele: 0xf2cf9a } }),
  },
};

export function presetDo(versao, trajeId) {
  const grupo = PRESETS[versao] || PRESETS.v01;
  return grupo[trajeId] || Object.values(grupo)[0];
}
