// Catálogo de veículos. Cada construtor devolve:
// { grupo, ancoras: { cockpit, turbina, blindagem, rodas, armas }, turbinas: [], camCockpit: { pos, olhar }, cad?, atualizar?, transformar? }
// Os modelos esculpidos por loft ficam em ./modelos; aqui restam a Batmoto e o Batmóvel LEGO.
import * as THREE from 'three';
import { MAT, peca, caixa, casco, turbina, aleta, farol, internos } from './kit.js';
import { colocarRoda as rodaEm } from './modelos/base.js';
import * as animados from './modelos/animados.js';
import * as outros from './modelos/outros.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);

function base(grupo, rodas) {
  for (const r of rodas) grupo.add(r);
}

function colocarRoda(cfg, x, z) {
  return rodaEm(cfg, x, z);
}

const MODELOS = {
  // Batmoto de Thomas Wayne (Batman #75, 2019): motocicleta de estrada com farol vermelho
  batmoto() {
    const g = new THREE.Group();
    const pintura = MAT.pintura(0x1a1d24, 0.75, 0.35);
    const escuro = MAT.fosco(0x0f1115, 0.7, 0.5);
    const barra = (a, b, r, mat) => {
      const va = V(...a);
      const vb = V(...b);
      const m = peca(new THREE.CylinderGeometry(r, r, va.distanceTo(vb), 10), mat, 'metal');
      m.position.copy(va).add(vb).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(V(0, 1, 0), vb.clone().sub(va).normalize());
      return m;
    };
    const rodaCfg = { raio: 0.42, largura: 0.2, aro: 0.62, matAro: MAT.fosco(0x2a2d33, 0.85, 0.35), sulcos: 16 };
    base(g, [colocarRoda(rodaCfg, 0.95, 0), colocarRoda({ ...rodaCfg, largura: 0.26 }, -0.9, 0)]);
    // tanque, assento e rabeta
    g.add(casco({ pontos: [[-0.2, 0.72], [0.1, 0.95], [0.55, 0.98], [0.75, 0.85], [0.6, 0.7]], largura: 0.36, mat: pintura, bevel: 0.04 }));
    g.add(caixa(0.7, 0.08, 0.3, MAT.fosco(0x0b0b0d, 0.2, 0.8), [-0.45, 0.82, 0], [0, 0, 0.05]));
    g.add(casco({ pontos: [[-1.15, 0.8], [-0.8, 0.9], [-0.2, 0.78], [-0.3, 0.66], [-0.9, 0.7]], largura: 0.26, mat: pintura, bevel: 0.03 }));
    // motor, garfo, guidão, balança e escapamento
    g.add(caixa(0.55, 0.35, 0.3, escuro, [0.1, 0.5, 0], [0, 0, 0], 'metal'));
    for (const s of [1, -1]) {
      g.add(barra([0.95, 0.42, s * 0.13], [0.7, 1.05, s * 0.13], 0.035, MAT.cromo()));
      g.add(barra([-0.9, 0.42, s * 0.16], [-0.1, 0.5, s * 0.16], 0.03, escuro));
    }
    g.add(barra([0.68, 1.1, -0.38], [0.68, 1.1, 0.38], 0.025, MAT.cromo()));
    g.add(barra([-0.2, 0.35, 0.22], [-1.0, 0.5, 0.22], 0.05, MAT.cromo()));
    g.add(caixa(0.5, 0.03, 0.22, pintura, [0.95, 0.9, 0], [0, 0, -0.2]));
    g.add(farol(0.16, 0.06, 0xef4444, [0.86, 0.98, 0], [0, Math.PI / 2, 0]));
    g.add(farol(0.12, 0.04, 0xdc2626, [-1.17, 0.82, 0], [0, -Math.PI / 2, 0]));
    g.add(internos({ comp: 1.4, larg: 0.3, motorX: 0.1, assentoX: -0.45, altura: 0.35 }));
    return {
      grupo: g, turbinas: [],
      ancoras: { cockpit: V(-0.4, 1.0, 0), turbina: V(0.1, 0.5, 0.3), rodas: V(0.95, 0.42, 0.25), blindagem: V(0.3, 0.98, 0.22) },
      camCockpit: { pos: V(-0.35, 1.45, 0), olhar: V(6, 0.9, 0) },
    };
  },

  lego() {
    const g = new THREE.Group();
    const preto = MAT.plastico(0x111114);
    const cinza = MAT.plastico(0x5b6570);
    const pinoGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.045, 16);
    const bloco = (w, h, d, mat, x, y, z, pinos = true) => {
      g.add(caixa(w, h, d, mat, [x, y, z]));
      if (!pinos) return;
      const nx = Math.round(w / 0.2);
      const nz = Math.round(d / 0.2);
      for (let i = 0; i < nx; i += 1) {
        for (let k = 0; k < nz; k += 1) {
          const p = peca(pinoGeo, mat);
          p.position.set(x - w / 2 + 0.1 + i * 0.2, y + h / 2 + 0.022, z - d / 2 + 0.1 + k * 0.2);
          g.add(p);
        }
      }
    };
    bloco(4.0, 0.24, 1.2, preto, 0, 0.72, 0, false);
    bloco(1.2, 0.36, 1.2, preto, -1.4, 1.02, 0);
    bloco(1.0, 0.24, 1.0, cinza, -1.4, 1.32, 0);
    bloco(1.6, 0.24, 0.8, preto, 1.1, 0.96, 0);
    bloco(0.6, 0.24, 1.2, preto, 1.9, 0.84, 0);
    for (const s of [1, -1]) {
      bloco(1.2, 0.2, 0.4, cinza, 0.2, 0.94, s * 0.6);
      // asas de morcego traseiras
      const a = aleta({ pontos: [[-2.2, 1.1], [-1.2, 1.1], [-1.4, 1.5], [-1.7, 1.35], [-1.9, 1.7], [-2.1, 1.45], [-2.4, 1.8]], espessura: 0.08, mat: preto });
      a.position.z = s * 0.52;
      g.add(a);
      // escapamentos cromados
      const esc = peca(new THREE.CylinderGeometry(0.07, 0.07, 0.8, 16), MAT.cromo(), 'metal');
      esc.rotation.z = Math.PI / 2;
      esc.position.set(-0.5, 1.02, s * 0.72);
      g.add(esc);
    }
    const cp = peca(new THREE.BoxGeometry(0.9, 0.42, 0.8), new THREE.MeshPhysicalMaterial({ color: 0xfacc15, transparent: true, opacity: 0.62, roughness: 0.08, clearcoat: 1 }), 'vidro');
    cp.position.set(0.2, 1.3, 0);
    g.add(cp);
    const rodas = [];
    const matAro = MAT.plastico(0xdc2626);
    for (const [x, z] of [[1.55, 0.95], [1.55, -0.95], [-1.45, 1.0], [-1.45, -1.0]]) rodas.push(colocarRoda({ raio: 0.56, largura: 0.46, aro: 0.55, matAro, sulcos: 10 }, x, z, z < 0));
    base(g, rodas);
    const tb = turbina({ raio: 0.2, comp: 0.4, corChama: 0xf59e0b });
    tb.position.set(-2.1, 1.02, 0);
    g.add(tb);
    g.add(farol(0.3, 0.1, 0xfde68a, [2.21, 0.86, 0.35], [0, Math.PI / 2, 0]));
    g.add(farol(0.3, 0.1, 0xfde68a, [2.21, 0.86, -0.35], [0, Math.PI / 2, 0]));
    g.add(internos({ comp: 3.2, larg: 1.0, motorX: -1.2, assentoX: 0.2, altura: 0.7 }));
    return {
      grupo: g, turbinas: [tb],
      ancoras: { cockpit: V(0.2, 1.62, 0), turbina: V(-2.4, 1.02, 0), blindagem: V(-1.4, 1.5, 0.7), rodas: V(1.55, 0.56, 1.3) },
      camCockpit: { pos: V(0.3, 1.55, 0), olhar: V(8, 1.2, 0) },
    };
  },
};

// modelos esculpidos por loft
Object.assign(MODELOS, animados, outros);

export function construirVeiculo(modelo, modo) {
  const f = MODELOS[modelo];
  if (!f) throw new Error(`Modelo desconhecido: ${modelo}`);
  const v = f.call(MODELOS, modo);
  v.grupo.position.y = 0.13;
  return v;
}
