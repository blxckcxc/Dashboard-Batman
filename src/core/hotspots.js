// Hotspots 3D: marcadores CSS2D pulsantes ancorados na malha e seleção por raycasting nas peças marcadas.
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

export class Hotspots {
  constructor(cena, aoSelecionar) {
    this.cena = cena;
    this.aoSelecionar = aoSelecionar;
    this.marcadores = [];
    this.alvos = [];
    this.raycaster = new THREE.Raycaster();
    this.ponteiro = new THREE.Vector2();
    const el = cena.renderer.domElement;
    let inicio = null;
    el.addEventListener('pointerdown', (e) => { inicio = { x: e.clientX, y: e.clientY }; });
    el.addEventListener('pointerup', (e) => {
      if (!inicio) return;
      const mov = Math.hypot(e.clientX - inicio.x, e.clientY - inicio.y);
      inicio = null;
      if (mov < 6) this.raycast(e);
    });
  }

  adicionar(pai, posicao, dados) {
    const div = document.createElement('button');
    div.type = 'button';
    div.className = 'hotspot';
    div.innerHTML = `<span class="hs-anel"></span><span class="hs-ponto"></span><span class="hs-rotulo">${dados.titulo}</span>`;
    div.addEventListener('pointerdown', (e) => e.stopPropagation());
    div.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selecionar(dados, div);
    });
    const obj = new CSS2DObject(div);
    obj.position.copy(posicao);
    pai.add(obj);
    this.marcadores.push({ obj, div, dados });
    return obj;
  }

  // registra malhas clicáveis: clicar numa peça abre o hotspot associado
  alvo(mesh, dados) {
    mesh.userData.hotspot = dados;
    this.alvos.push(mesh);
  }

  selecionar(dados, div) {
    for (const m of this.marcadores) m.div.classList.toggle('ativo', m.div === div || m.dados === dados);
    this.aoSelecionar(dados);
  }

  raycast(e) {
    if (!this.alvos.length) return;
    const r = this.cena.renderer.domElement.getBoundingClientRect();
    this.ponteiro.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(this.ponteiro, this.cena.camera);
    const visiveis = this.alvos.filter((m) => {
      let o = m;
      while (o) {
        if (!o.visible) return false;
        o = o.parent;
      }
      return true;
    });
    const hit = this.raycaster.intersectObjects(visiveis, false)[0];
    if (hit) this.selecionar(hit.object.userData.hotspot, null);
  }

  visivel(sim) {
    for (const m of this.marcadores) m.obj.visible = sim;
  }

  limpar() {
    for (const m of this.marcadores) {
      m.obj.removeFromParent();
      m.div.remove();
    }
    this.marcadores = [];
    for (const a of this.alvos) delete a.userData.hotspot;
    this.alvos = [];
  }
}
