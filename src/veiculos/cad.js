// Plantas CAD holográficas: submontagens paramétricas desenhadas em arestas ciano e âmbar,
// que flutuam ao lado do veículo e se separam em vista explodida.
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { tubo } from './loft.js';

const CIANO = 0x38bdf8;
const AMBAR = 0xf59e0b;
const BRASA = 0xf97316;

const easeOut = (x) => 1 - Math.pow(1 - x, 3);

function holo(geo, cor = CIANO, preench = 0.05, limiar = 20) {
  const g = new THREE.Group();
  const fill = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
    color: cor, transparent: true, opacity: preench, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  }));
  const lin = new THREE.LineSegments(new THREE.EdgesGeometry(geo, limiar), new THREE.LineBasicMaterial({
    color: cor, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  g.add(fill, lin);
  return g;
}

function nucleo(geo, cor = BRASA) {
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
  m.userData.brasa = true;
  return m;
}

function rotulo(texto) {
  const div = document.createElement('div');
  div.className = 'cad-rotulo';
  div.textContent = texto;
  return new CSS2DObject(div);
}

// cada peça: objeto, direção da explosão (distância já embutida) e posição de repouso
function parte(obj, dir, pos = [0, 0, 0]) {
  obj.position.set(...pos);
  return { obj, base: obj.position.clone(), dir: new THREE.Vector3(...dir) };
}

// Turbina a jato em corte: fan, compressor, câmara em brasa, estágio de turbina e bocal. Eixo em X.
function turbinaCad() {
  const partes = [];
  const fan = new THREE.Group();
  fan.add(holo(new THREE.ConeGeometry(0.14, 0.26, 24).rotateZ(-Math.PI / 2), AMBAR, 0.08));
  for (let i = 0; i < 16; i += 1) {
    const pa = holo(new THREE.BoxGeometry(0.03, 0.34, 0.08), CIANO, 0.06, 1);
    pa.position.set(0, Math.cos((i / 16) * Math.PI * 2) * 0.27, Math.sin((i / 16) * Math.PI * 2) * 0.27);
    pa.rotation.x = (i / 16) * Math.PI * 2;
    pa.rotation.y = 0.45;
    fan.add(pa);
  }
  partes.push(parte(fan, [1.25, 0, 0], [0.62, 0, 0]));
  for (let e = 0; e < 3; e += 1) {
    const est = holo(new THREE.CylinderGeometry(0.34 - e * 0.04, 0.34 - e * 0.04, 0.05, 40).rotateZ(Math.PI / 2), CIANO, 0.04);
    partes.push(parte(est, [0.9 - e * 0.25, 0, 0], [0.42 - e * 0.1, 0, 0]));
  }
  const camara = new THREE.Group();
  camara.add(holo(new THREE.TorusGeometry(0.22, 0.07, 12, 40).rotateY(Math.PI / 2), AMBAR, 0.06));
  camara.add(nucleo(new THREE.CylinderGeometry(0.12, 0.16, 0.34, 24).rotateZ(Math.PI / 2)));
  partes.push(parte(camara, [0, 0, 0], [0, 0, 0]));
  const turb = holo(new THREE.CylinderGeometry(0.26, 0.26, 0.06, 36).rotateZ(Math.PI / 2), AMBAR, 0.05);
  partes.push(parte(turb, [-0.5, 0, 0], [-0.24, 0, 0]));
  const bocal = holo(new THREE.CylinderGeometry(0.2, 0.3, 0.42, 32, 1, true).rotateZ(Math.PI / 2), CIANO, 0.04);
  partes.push(parte(bocal, [-1.0, 0, 0], [-0.55, 0, 0]));
  // carenagem bipartida que se abre para cima e para baixo
  for (const s of [1, -1]) {
    const meia = holo(new THREE.CylinderGeometry(0.38, 0.38, 1.3, 40, 1, true, s > 0 ? 0 : Math.PI, Math.PI).rotateZ(Math.PI / 2), CIANO, 0.02);
    partes.push(parte(meia, [0, s * 0.32, 0], [0.04, 0, 0]));
  }
  return { partes, rotulos: [['FAN', [1.9, 0.35, 0]], ['CÂMARA DE COMBUSTÃO', [0, 0.5, 0]], ['BOCAL', [-1.6, 0.35, 0]]] };
}

// Suspensão e freio: mola helicoidal, amortecedor, bandejas, cubo, disco perfurado, pinça e aro.
function suspensaoCad() {
  const partes = [];
  const helice = [];
  for (let i = 0; i <= 120; i += 1) {
    const a = (i / 120) * Math.PI * 2 * 6;
    helice.push([Math.cos(a) * 0.1, -0.3 + (i / 120) * 0.6, Math.sin(a) * 0.1]);
  }
  partes.push(parte(holo(tubo(helice, 0.012, 240), AMBAR, 0.1, 1), [0, 0.45, 0], [0, 0.5, -0.35]));
  const amort = new THREE.Group();
  amort.add(holo(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 20), CIANO, 0.05));
  amort.add(holo(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 12).translate(0, 0.4, 0), CIANO, 0.05));
  partes.push(parte(amort, [0, 0, 0], [0, 0.45, -0.35]));
  for (const s of [1, -1]) {
    const bandeja = holo(tubo([[0, 0, -0.75], [0, 0, -0.1], [0.28, 0, -0.75]], 0.02, 32), CIANO, 0.08, 1);
    partes.push(parte(bandeja, [0, s * 0.35, -0.4], [-0.14, s * 0.18, 0]));
  }
  partes.push(parte(holo(new THREE.CylinderGeometry(0.1, 0.12, 0.2, 20).rotateX(Math.PI / 2), CIANO, 0.06), [0, 0, 0.35], [0, 0, 0.05]));
  const disco = new THREE.Group();
  disco.add(holo(new THREE.CylinderGeometry(0.34, 0.34, 0.035, 48).rotateX(Math.PI / 2), CIANO, 0.05));
  for (let i = 0; i < 18; i += 1) {
    const a = (i / 18) * Math.PI * 2;
    const furo = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, 0.018, 0.018).getPoints(10)), new THREE.LineBasicMaterial({ color: AMBAR, transparent: true, opacity: 0.9 }));
    furo.position.set(Math.cos(a) * 0.25, Math.sin(a) * 0.25, 0.02);
    disco.add(furo);
  }
  partes.push(parte(disco, [0, 0, 0.75], [0, 0, 0.18]));
  const pinca = holo(new THREE.BoxGeometry(0.14, 0.26, 0.12), AMBAR, 0.12);
  partes.push(parte(pinca, [0.25, 0.25, 1.05], [-0.28, 0.14, 0.18]));
  const aro = new THREE.Group();
  aro.add(holo(new THREE.TorusGeometry(0.44, 0.06, 10, 60), CIANO, 0.03));
  aro.add(holo(new THREE.TorusGeometry(0.62, 0.12, 12, 64), CIANO, 0.02, 25));
  partes.push(parte(aro, [0, 0, 1.45], [0, 0, 0.2]));
  return { partes, rotulos: [['MOLA E AMORTECEDOR', [0, 1.2, -0.35]], ['DISCO VENTILADO', [0, -0.55, 0.95]], ['PINÇA', [0.2, 0.55, 1.25]]] };
}

// Blindagem em camadas: cerâmica com malha hexagonal, kevlar trançado, titânio e compósito interno.
function blindagemCad() {
  const partes = [];
  const camadas = [['CERÂMICA', AMBAR], ['KEVLAR', CIANO], ['TITÂNIO', CIANO], ['COMPÓSITO', CIANO]];
  camadas.forEach(([nome, cor], i) => {
    const geo = new THREE.BoxGeometry(1.2, 0.7, 0.035, 12, 6, 1);
    const p = geo.attributes.position;
    for (let k = 0; k < p.count; k += 1) p.setZ(k, p.getZ(k) - Math.pow(p.getX(k) / 0.6, 2) * 0.08);
    geo.computeVertexNormals();
    const placa = holo(geo, cor, 0.05);
    if (i === 0) {
      // malha hexagonal na face externa
      const pts = [];
      const r = 0.06;
      for (let lx = -5; lx <= 5; lx += 1) {
        for (let ly = -3; ly <= 3; ly += 1) {
          const cx = lx * r * 1.73 + (ly % 2 ? r * 0.87 : 0);
          const cy = ly * r * 1.5;
          if (Math.abs(cx) > 0.56 || Math.abs(cy) > 0.3) continue;
          for (let k = 0; k < 6; k += 1) {
            const a1 = Math.PI / 6 + (k * Math.PI) / 3;
            const a2 = a1 + Math.PI / 3;
            const z = 0.03 - Math.pow(cx / 0.6, 2) * 0.08;
            pts.push(new THREE.Vector3(cx + Math.cos(a1) * r * 0.9, cy + Math.sin(a1) * r * 0.9, z));
            pts.push(new THREE.Vector3(cx + Math.cos(a2) * r * 0.9, cy + Math.sin(a2) * r * 0.9, z));
          }
        }
      }
      placa.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: AMBAR, transparent: true, opacity: 0.55 })));
    }
    if (i === 1) {
      const pts = [];
      for (let k = -8; k <= 8; k += 1) {
        pts.push(new THREE.Vector3(k * 0.07 - 0.3, -0.34, 0.02), new THREE.Vector3(k * 0.07 + 0.3, 0.34, 0.02));
        pts.push(new THREE.Vector3(k * 0.07 + 0.3, -0.34, 0.02), new THREE.Vector3(k * 0.07 - 0.3, 0.34, 0.02));
      }
      placa.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts.filter((q) => Math.abs(q.x) <= 0.62)), new THREE.LineBasicMaterial({ color: CIANO, transparent: true, opacity: 0.35 })));
    }
    const rot = rotulo(nome);
    rot.position.set(0.7, 0.3, 0);
    placa.add(rot);
    partes.push(parte(placa, [0, 0, 0.42 * (camadas.length - 1 - i)], [0, 0, -0.06 * i]));
  });
  return { partes, rotulos: [] };
}

// Cockpit: dois assentos em concha, volante, painel analógico com três mostradores e pedais.
function cockpitCad() {
  const partes = [];
  for (const s of [1, -1]) {
    const banco = new THREE.Group();
    banco.add(holo(new THREE.CapsuleGeometry(0.15, 0.3, 4, 12).rotateZ(Math.PI / 2 + 0.2).scale(1, 1, 0.85), CIANO, 0.05));
    const encosto = holo(new THREE.CapsuleGeometry(0.16, 0.4, 4, 12).scale(0.55, 1, 0.9), CIANO, 0.05);
    encosto.position.set(-0.22, 0.3, 0);
    encosto.rotation.z = -0.35;
    banco.add(encosto);
    partes.push(parte(banco, [0, 0.25, s * 0.38], [0, 0, s * 0.27]));
  }
  const volante = new THREE.Group();
  volante.add(holo(new THREE.TorusGeometry(0.14, 0.015, 8, 40).rotateY(Math.PI / 2), AMBAR, 0.1));
  volante.add(holo(new THREE.CylinderGeometry(0.012, 0.012, 0.26, 6), AMBAR, 0.1));
  partes.push(parte(volante, [0.5, 0.2, 0], [0.42, 0.34, 0.27]));
  const painel = new THREE.Group();
  painel.add(holo(new THREE.BoxGeometry(0.12, 0.2, 0.9), CIANO, 0.05));
  for (let i = 0; i < 3; i += 1) {
    const mostrador = new THREE.Group();
    mostrador.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, 0.07, 0.07).getPoints(32).map((q) => new THREE.Vector3(0, q.y, q.x))), new THREE.LineBasicMaterial({ color: AMBAR })));
    const ponteiro = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.05, 0.03)]), new THREE.LineBasicMaterial({ color: BRASA }));
    ponteiro.userData.ponteiro = i;
    mostrador.add(ponteiro);
    mostrador.position.set(-0.065, 0.02, -0.26 + i * 0.26);
    painel.add(mostrador);
  }
  partes.push(parte(painel, [0.85, 0.45, 0], [0.62, 0.42, 0]));
  for (const s of [1, -1]) partes.push(parte(holo(new THREE.BoxGeometry(0.03, 0.1, 0.06), CIANO, 0.1), [0.3, -0.15, 0], [0.7, 0.05, 0.27 + s * 0.06]));
  return { partes, rotulos: [['ASSENTOS', [0, 0.9, 0.9]], ['PAINEL ANALÓGICO', [1.5, 1.0, 0]]] };
}

// Armas: canhão rotativo de seis canos, carenagem, alimentador e suporte.
function armasCad() {
  const partes = [];
  const canos = new THREE.Group();
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2;
    const c = holo(new THREE.CylinderGeometry(0.022, 0.022, 0.9, 10).rotateZ(Math.PI / 2), CIANO, 0.06);
    c.position.set(0, Math.cos(a) * 0.07, Math.sin(a) * 0.07);
    canos.add(c);
  }
  canos.userData.girar = true;
  partes.push(parte(canos, [0.8, 0, 0], [0.45, 0, 0]));
  partes.push(parte(holo(new THREE.CylinderGeometry(0.13, 0.13, 0.4, 24).rotateZ(Math.PI / 2), AMBAR, 0.06), [0, 0, 0], [-0.1, 0, 0]));
  partes.push(parte(holo(new THREE.BoxGeometry(0.34, 0.24, 0.26), CIANO, 0.05), [0, 0, -0.6], [-0.2, 0, -0.3]));
  partes.push(parte(holo(new THREE.CylinderGeometry(0.06, 0.1, 0.3, 16), CIANO, 0.05), [0, -0.45, 0], [-0.1, -0.25, 0]));
  return { partes, rotulos: [['CANHÃO ROTATIVO', [1.3, 0.3, 0]]] };
}

const CONSTRUTORES = { turbina: turbinaCad, rodas: suspensaoCad, blindagem: blindagemCad, cockpit: cockpitCad, armas: armasCad };
const TITULOS = { turbina: 'PLANTA · MOTOR A JATO', rodas: 'PLANTA · SUSPENSÃO E FREIOS', blindagem: 'PLANTA · BLINDAGEM EM CAMADAS', cockpit: 'PLANTA · COCKPIT', armas: 'PLANTA · SISTEMA DE ARMAS' };

export class PlantaCad {
  constructor(cena) {
    this.cena = cena;
    this.grupo = new THREE.Group();
    this.grupo.name = 'plantas-cad';
    cena.scene.add(this.grupo);
    this.ativas = [];
  }

  limpar() {
    for (const a of this.ativas) {
      a.grupo.traverse((o) => {
        if (o.element) o.element.remove();
        if (o.geometry) o.geometry.dispose();
      });
    }
    this.grupo.clear();
    this.ativas = [];
  }

  // chaves: lista de pontos de inspeção; veiculo: objeto do catálogo (grupo, ancoras, cad)
  // vista: posição e alvo da câmera para os quais as plantas são arranjadas (direita e alto da tela)
  mostrar(veiculo, chaves, vista = null) {
    this.limpar();
    const caixa = new THREE.Box3().setFromObject(veiculo.grupo, true);
    const tam = caixa.getSize(new THREE.Vector3());
    const centro = caixa.getCenter(new THREE.Vector3());
    const topo = caixa.max.y;
    const todas = chaves.length > 1;
    const cam = vista ? vista.pos : this.cena.camera.position;
    const alvo = vista ? vista.alvo : this.cena.controls.target;
    const frente = alvo.clone().sub(cam).setY(0).normalize();
    const direita = new THREE.Vector3().crossVectors(frente, new THREE.Vector3(0, 1, 0)).normalize();
    const raio = Math.max(tam.x, tam.z) * 0.5;
    // arranjo em arco atrás e acima do veículo, como numa prancha de engenharia
    const em = (lado, alto, fundo) => centro.clone().setY(0)
      .addScaledVector(direita, lado * (raio + 0.9))
      .addScaledVector(frente, fundo)
      .setY(topo + alto);
    const lugares = {
      turbina: em(-1.1, 1.7, 0.8),
      blindagem: em(-0.2, 2.5, 1.9),
      cockpit: em(0.7, 1.7, 0.8),
      rodas: em(-0.9, 0.3, -2.8),
      armas: em(0.55, 0.4, -2.8),
    };
    for (const chave of chaves) {
      const construir = CONSTRUTORES[chave];
      if (!construir) continue;
      const { partes, rotulos } = construir();
      const g = new THREE.Group();
      const corpo = new THREE.Group();
      g.add(corpo);
      for (const p of partes) corpo.add(p.obj);
      for (const [texto, pos] of rotulos) {
        const r = rotulo(texto);
        r.position.set(...pos);
        corpo.add(r);
      }
      const tit = rotulo(TITULOS[chave]);
      tit.element.classList.add('titulo');
      tit.position.set(0, 1.35, 0);
      g.add(tit);
      const ancLocal = (veiculo.cad && veiculo.cad[chave]) || veiculo.ancoras[chave] || new THREE.Vector3();
      const ancora = ancLocal.clone().applyMatrix4(veiculo.grupo.matrixWorld);
      const lado = ancora.clone().sub(centro).dot(direita) >= 0 ? 1 : -1;
      const destino = todas ? lugares[chave].clone() : ancora.clone().addScaledVector(direita, lado * 1.6).addScaledVector(frente, 0.8).setY(topo + 1.3);
      g.position.copy(destino);
      g.scale.setScalar(todas ? 1.25 : 1.3);
      // a planta se apresenta de frente para a câmera
      g.rotation.y = Math.atan2(-frente.x, -frente.z);
      // linha-guia tracejada da peça até a planta
      g.updateMatrixWorld(true);
      const ancoraLocal = g.worldToLocal(ancora.clone());
      const guia = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([ancoraLocal, new THREE.Vector3()]),
        new THREE.LineDashedMaterial({ color: AMBAR, dashSize: 0.08, gapSize: 0.05, transparent: true, opacity: 0.8 }),
      );
      guia.computeLineDistances();
      g.add(guia);
      const marca = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), new THREE.MeshBasicMaterial({ color: AMBAR }));
      marca.position.copy(ancoraLocal);
      g.add(marca);
      this.grupo.add(g);
      this.ativas.push({ grupo: g, corpo, partes, t: 0, fase: this.ativas.length });
    }
    return this.ativas.length;
  }

  get visivel() {
    return this.ativas.length > 0;
  }

  atualizar(dt, t) {
    for (const a of this.ativas) {
      a.t += dt;
      const k = easeOut(Math.min(1, a.t / 1.3));
      const respiro = 0.9 + 0.1 * Math.sin(t * 1.4);
      for (const p of a.partes) {
        p.obj.position.copy(p.base).addScaledVector(p.dir, k * respiro);
        if (p.obj.userData.girar) p.obj.rotation.x += dt * 6;
      }
      a.corpo.rotation.y = -0.6 + Math.sin(t * 0.35 + a.fase) * 0.3;
      a.grupo.traverse((o) => {
        if (o.userData.brasa) o.material.opacity = 0.55 + 0.35 * Math.sin(t * 9) * Math.sin(t * 5.3);
        if (o.userData.ponteiro !== undefined) o.rotation.x = Math.sin(t * (1.2 + o.userData.ponteiro * 0.7)) * 0.9;
      });
    }
  }
}
