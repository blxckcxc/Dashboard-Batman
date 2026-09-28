// Kit de peças paramétricas para os veículos procedurais. Convenção: frente em +X, altura em +Y, largura em Z.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const MAT = {
  pintura: (cor = 0x0d1117, metal = 0.85, rug = 0.3) =>
    new THREE.MeshPhysicalMaterial({ color: cor, metalness: metal, roughness: rug, clearcoat: 1, clearcoatRoughness: 0.12 }),
  // preto acetinado com verniz e brilho azul-noite nas bordas, como a pintura dos Batmóveis animados
  acetinado: (cor = 0x0b0e16, brilho = 0x1e40af) =>
    new THREE.MeshPhysicalMaterial({
      color: cor, metalness: 0.45, roughness: 0.34, clearcoat: 1, clearcoatRoughness: 0.08,
      sheen: 0.45, sheenColor: new THREE.Color(brilho), sheenRoughness: 0.5, envMapIntensity: 1.15,
    }),
  fosco: (cor = 0x151a22, metal = 0.55, rug = 0.62) => new THREE.MeshStandardMaterial({ color: cor, metalness: metal, roughness: rug }),
  borracha: () => new THREE.MeshStandardMaterial({ color: 0x0b0b0d, metalness: 0, roughness: 0.93 }),
  cromo: () => new THREE.MeshStandardMaterial({ color: 0xb7c3d4, metalness: 1, roughness: 0.16 }),
  vidro: (cor = 0x0f223d) =>
    new THREE.MeshPhysicalMaterial({ color: cor, metalness: 0.2, roughness: 0.04, transparent: true, opacity: 0.55, clearcoat: 1 }),
  luz: (cor, forca = 3) => new THREE.MeshStandardMaterial({ color: cor, emissive: cor, emissiveIntensity: forca }),
  plastico: (cor) => new THREE.MeshStandardMaterial({ color: cor, metalness: 0.05, roughness: 0.35 }),
};

export function peca(geo, mat, papel = 'casco') {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  m.userData.papel = papel;
  return m;
}

export function caixa(w, h, d, mat, pos = [0, 0, 0], rot = [0, 0, 0], papel = 'casco') {
  const m = peca(new THREE.BoxGeometry(w, h, d), mat, papel);
  m.position.set(...pos);
  m.rotation.set(...rot);
  return m;
}

// Casco a partir de um perfil lateral (x = comprimento, y = altura), extrudado na largura e afunilado nas pontas.
export function casco({ pontos, largura, mat, bevel = 0.05, afunilar = null, papel = 'casco' }) {
  const forma = new THREE.Shape(pontos.map(([x, y]) => new THREE.Vector2(x, y)));
  const geo = new THREE.ExtrudeGeometry(forma, {
    depth: largura,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 12,
    steps: 1,
  });
  geo.translate(0, 0, -largura / 2);
  if (afunilar) {
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i += 1) {
      const u = (p.getX(i) - bb.min.x) / (bb.max.x - bb.min.x);
      const v = (p.getY(i) - bb.min.y) / (bb.max.y - bb.min.y);
      p.setZ(i, p.getZ(i) * afunilar(u, v));
    }
    p.needsUpdate = true;
  }
  geo.computeVertexNormals();
  return peca(geo, mat, papel);
}

// Roda: pneu por torno (perfil arredondado com sulcos), aro vazado com raios, disco de freio e pinça
// visíveis por entre os raios. Eixo em Z; a face externa fica em +Z.
export function roda({ raio = 0.42, largura = 0.34, aro = 0.62, matAro = MAT.cromo(), raios = 5, sulcos = 18, freio = true, corPinca = 0x991b1b }) {
  const g = new THREE.Group();
  const perfil = [];
  const ri = raio * aro;
  const n = 28;
  perfil.push(new THREE.Vector2(ri, -largura / 2));
  perfil.push(new THREE.Vector2(ri + (raio - ri) * 0.35, -largura / 2 - largura * 0.03));
  for (let i = 0; i <= n; i += 1) {
    const a = -Math.PI / 2 + (i / n) * Math.PI;
    const bojo = 0.9 + 0.1 * Math.pow(Math.cos(a), 0.6);
    perfil.push(new THREE.Vector2(raio * bojo, Math.sin(a) * largura / 2));
  }
  perfil.push(new THREE.Vector2(ri + (raio - ri) * 0.35, largura / 2 + largura * 0.03));
  perfil.push(new THREE.Vector2(ri, largura / 2));
  const pneuGeo = new THREE.LatheGeometry(perfil, 64);
  // sulcos da banda de rodagem
  const p = pneuGeo.attributes.position;
  for (let i = 0; i < p.count; i += 1) {
    const x = p.getX(i);
    const z = p.getZ(i);
    const r = Math.hypot(x, z);
    if (r > raio * 0.97) {
      const ang = Math.atan2(z, x);
      const k = 1 - 0.025 * (Math.sin(ang * sulcos) > 0.3 ? 1 : 0);
      p.setX(i, x * k);
      p.setZ(i, z * k);
    }
  }
  pneuGeo.computeVertexNormals();
  const pneu = peca(pneuGeo, MAT.borracha(), 'pneu');
  pneu.rotation.x = Math.PI / 2;
  g.add(pneu);

  // tambor do aro, aberto, com o fundo escuro do lado de dentro
  const tambor = peca(new THREE.CylinderGeometry(ri, ri, largura * 0.84, 48, 1, true), MAT.fosco(0x10141b, 0.85, 0.4), 'metal');
  tambor.material.side = THREE.DoubleSide;
  tambor.rotation.x = Math.PI / 2;
  g.add(tambor);
  const fundo = peca(new THREE.CircleGeometry(ri, 48), MAT.fosco(0x07090d, 0.6, 0.7), 'metal');
  fundo.position.z = -largura * 0.3;
  g.add(fundo);
  const borda = peca(new THREE.TorusGeometry(ri * 0.985, largura * 0.045, 10, 64), matAro, 'metal');
  borda.position.z = largura * 0.4;
  g.add(borda);
  // raios em cunha, saindo do cubo até a borda
  const matRaio = matAro;
  for (let i = 0; i < raios; i += 1) {
    const a = (i / raios) * Math.PI * 2;
    const raioGeo = new THREE.BoxGeometry(ri * 0.82, ri * 0.13, largura * 0.08);
    const pos = raioGeo.attributes.position;
    for (let k = 0; k < pos.count; k += 1) {
      // afina em direção à borda
      const t = (pos.getX(k) + ri * 0.41) / (ri * 0.82);
      pos.setY(k, pos.getY(k) * (1.25 - 0.55 * t));
    }
    raioGeo.computeVertexNormals();
    const rr = peca(raioGeo, matRaio, 'metal');
    rr.position.set(Math.cos(a) * ri * 0.55, Math.sin(a) * ri * 0.55, largura * 0.36);
    rr.rotation.z = a;
    g.add(rr);
  }
  const cubo = peca(new THREE.CylinderGeometry(ri * 0.2, ri * 0.24, largura * 0.2, 24), matAro, 'metal');
  cubo.rotation.x = Math.PI / 2;
  cubo.position.z = largura * 0.36;
  g.add(cubo);
  if (freio) {
    // disco ventilado e pinça, visíveis por entre os raios
    const disco = peca(new THREE.CylinderGeometry(ri * 0.8, ri * 0.8, largura * 0.07, 48), MAT.fosco(0x5b6472, 0.95, 0.32), 'metal');
    disco.rotation.x = Math.PI / 2;
    disco.position.z = largura * 0.12;
    g.add(disco);
    const pinca = peca(new RoundedBoxGeometry(ri * 0.32, ri * 0.56, largura * 0.2, 2, ri * 0.06), MAT.pintura(corPinca, 0.3, 0.35), 'metal');
    pinca.position.set(-ri * 0.52, ri * 0.28, largura * 0.14);
    pinca.rotation.z = 0.5;
    g.add(pinca);
  }
  g.userData.raio = raio;
  return g;
}

const CHAMA_VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const CHAMA_FS = `
  uniform float tempo; uniform float forca; uniform vec3 corA; uniform vec3 corB; varying vec2 vUv;
  float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y); }
  void main(){
    float y = vUv.y;
    float t = n(vec2(vUv.x * 8.0, y * 6.0 + tempo * 14.0)) * 0.6 + n(vec2(vUv.x * 20.0, y * 14.0 + tempo * 22.0)) * 0.4;
    float corpo = smoothstep(0.0, 0.35, y) * (0.55 + 0.45 * t);
    vec3 cor = mix(corB, corA, smoothstep(0.35, 1.0, y));
    gl_FragColor = vec4(cor * (1.3 + t), corpo * forca);
  }`;

// Turbina com bocal, anel incandescente e chama de pós-combustão animada. Aponta para -X.
export function turbina({ raio = 0.28, comp = 0.5, corChama = 0x38bdf8, corNucleo = 0xf59e0b }) {
  const g = new THREE.Group();
  const bocal = peca(new THREE.CylinderGeometry(raio, raio * 1.12, comp, 32, 1, true), MAT.fosco(0x1f2937, 0.95, 0.35), 'metal');
  bocal.material.side = THREE.DoubleSide;
  bocal.rotation.z = Math.PI / 2;
  g.add(bocal);
  const anel = peca(new THREE.TorusGeometry(raio * 1.02, raio * 0.09, 12, 40), MAT.luz(corNucleo, 1.2), 'luz');
  anel.rotation.y = Math.PI / 2;
  anel.position.x = -comp / 2;
  g.add(anel);
  const nucleoMat = MAT.luz(corNucleo, 0.4);
  const nucleo = peca(new THREE.CircleGeometry(raio * 0.85, 32), nucleoMat, 'luz');
  nucleo.rotation.y = -Math.PI / 2;
  nucleo.position.x = -comp / 2 + 0.06;
  g.add(nucleo);

  const chamaMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { tempo: { value: 0 }, forca: { value: 0 }, corA: { value: new THREE.Color(corChama) }, corB: { value: new THREE.Color(0xffffff) } },
    vertexShader: CHAMA_VS,
    fragmentShader: CHAMA_FS,
  });
  const chama = peca(new THREE.ConeGeometry(raio * 0.85, 1.6, 24, 1, true), chamaMat, 'chama');
  chama.castShadow = false;
  chama.rotation.z = -Math.PI / 2;
  chama.position.x = -comp / 2 - 0.8;
  chama.visible = false;
  g.add(chama);

  const luz = new THREE.PointLight(corChama, 0, 6, 2);
  luz.position.x = -comp / 2 - 0.5;
  g.add(luz);

  let alvo = 0;
  let atual = 0;
  g.userData.acender = (sim) => {
    alvo = sim ? 1 : 0;
    if (sim) {
      chama.userData.acesa = true;
      chama.visible = true;
    }
  };
  g.userData.acesa = () => alvo > 0;
  g.userData.atualizar = (dt, t) => {
    atual += (alvo - atual) * Math.min(1, dt * 4);
    chamaMat.uniforms.tempo.value = t;
    const tremor = 0.85 + 0.15 * Math.sin(t * 40) * Math.sin(t * 23);
    chamaMat.uniforms.forca.value = atual * tremor;
    chama.scale.set(1, 0.6 + atual * 0.6 * tremor, 1);
    chama.position.x = -comp / 2 - 0.8 * chama.scale.y;
    luz.intensity = atual * 18 * tremor;
    nucleoMat.emissiveIntensity = 0.4 + atual * 5;
    if (atual < 0.02 && alvo === 0) {
      chama.userData.acesa = false;
      chama.visible = false;
    }
  };
  return g;
}

export function canopy({ comp = 1.2, larg = 0.9, alt = 0.45, cor = 0x0f223d }) {
  const geo = new THREE.SphereGeometry(0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const m = peca(geo, MAT.vidro(cor), 'vidro');
  m.scale.set(comp, alt * 2, larg);
  m.castShadow = false;
  return m;
}

// Aleta vertical a partir de um contorno 2D (x, y), com espessura em Z.
export function aleta({ pontos, espessura = 0.05, mat, papel = 'casco' }) {
  const forma = new THREE.Shape(pontos.map(([x, y]) => new THREE.Vector2(x, y)));
  const geo = new THREE.ExtrudeGeometry(forma, { depth: espessura, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1 });
  geo.translate(0, 0, -espessura / 2);
  geo.computeVertexNormals();
  return peca(geo, mat, papel);
}

export function farol(w, h, cor, pos, rot = [0, 0, 0]) {
  const m = peca(new THREE.PlaneGeometry(w, h), MAT.luz(cor, 4), 'luz');
  m.material.side = THREE.DoubleSide;
  m.castShadow = false;
  m.position.set(...pos);
  m.rotation.set(...rot);
  return m;
}

// Componentes internos visíveis no raio-X: motor, chassi e assento.
export function internos({ comp = 4, larg = 1.4, motorX = -1.4, assentoX = 0, altura = 0.35 }) {
  const g = new THREE.Group();
  const mat = MAT.fosco(0x444444);
  const bloco = caixa(0.9, 0.45, larg * 0.5, mat, [motorX, altura + 0.2, 0], [0, 0, 0], 'interno');
  g.add(bloco);
  for (let i = 0; i < 4; i += 1) {
    g.add(caixa(0.12, 0.28, 0.12, mat, [motorX - 0.3 + i * 0.2, altura + 0.52, 0], [0, 0, 0], 'interno'));
  }
  const eixo = peca(new THREE.CylinderGeometry(0.05, 0.05, comp * 0.8, 8), mat, 'interno');
  eixo.rotation.z = Math.PI / 2;
  eixo.position.set(0, altura, 0);
  g.add(eixo);
  for (const z of [-larg * 0.38, larg * 0.38]) {
    const long = peca(new THREE.BoxGeometry(comp * 0.9, 0.06, 0.06), mat, 'interno');
    long.position.set(0, altura - 0.05, z);
    g.add(long);
  }
  g.add(caixa(0.45, 0.08, 0.5, mat, [assentoX, altura + 0.15, 0], [0, 0, 0], 'interno'));
  g.add(caixa(0.08, 0.5, 0.5, mat, [assentoX - 0.22, altura + 0.4, 0], [0, 0, 0.25], 'interno'));
  return g;
}

// Grade frontal com recorte de morcego (plano emissivo sobre uma placa escura).
export function morcegoFrontal(escala, cor, pos) {
  const s = new THREE.Shape();
  const pts = [[0, 0.18], [0.12, 0.1], [0.2, 0.2], [0.26, 0.06], [0.5, 0.12], [0.36, 0], [0.4, -0.08], [0.22, -0.04], [0.12, -0.14], [0, -0.06]];
  s.moveTo(-pts[0][0], pts[0][1]);
  const esq = pts.map(([x, y]) => [-x, y]).reverse();
  const todos = [...pts, ...esq];
  todos.forEach(([x, y], i) => (i === 0 ? s.moveTo(x, y) : s.lineTo(x, y)));
  const geo = new THREE.ShapeGeometry(s);
  const m = peca(geo, MAT.luz(cor, 2.5), 'luz');
  m.material.side = THREE.DoubleSide;
  m.castShadow = false;
  m.scale.setScalar(escala);
  m.rotation.y = Math.PI / 2;
  m.position.set(...pos);
  return m;
}
