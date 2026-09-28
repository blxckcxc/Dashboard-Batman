// Vistas do capuz em três ângulos (frente, 3/4 e perfil), num canvas próprio do HUD.
// Usa um segundo renderer com viewports por scissor sobre uma cópia da cabeça do manequim central.
import * as THREE from 'three';

const ANGULOS = [0, Math.PI / 4, Math.PI / 2];

export class CapuzVistas {
  constructor(container) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.setScissorTest(true);
    container.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.HemisphereLight(0x93c5fd, 0x05070b, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(1.5, 2, 3);
    const rimC = new THREE.DirectionalLight(0x38bdf8, 3);
    rimC.position.set(-3, 1, -2);
    const rimA = new THREE.DirectionalLight(0xf59e0b, 2.2);
    rimA.position.set(3, 0.5, -2);
    this.scene.add(key, rimC, rimA);
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.01, 20);
    this.cabeca = null;
    this.centro = new THREE.Vector3();
    this.raio = 0.3;
  }

  // env: mapa de ambiente da cena principal, para o mesmo reflexo PBR
  definir(cabeca, env) {
    if (this.cabeca) this.scene.remove(this.cabeca);
    this.scene.environment = env || null;
    this.cabeca = cabeca.clone();
    this.cabeca.traverse((o) => {
      if (o.element) o.element.remove();
    });
    const caixa = new THREE.Box3().setFromObject(this.cabeca);
    caixa.getCenter(this.centro);
    this.raio = caixa.getSize(new THREE.Vector3()).length() * 0.5;
    this.cabeca.position.sub(this.centro);
    const pivo = new THREE.Group();
    pivo.add(this.cabeca);
    this.scene.add(pivo);
    this.pivo = pivo;
    if (this.pivoAnterior) this.scene.remove(this.pivoAnterior);
    this.pivoAnterior = pivo;
  }

  render(t = 0) {
    if (!this.cabeca || !this.container.offsetParent) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w < 10 || h < 10) return;
    const r = this.renderer;
    if (r.domElement.width !== Math.floor(w * r.getPixelRatio()) || r.domElement.height !== Math.floor(h * r.getPixelRatio())) r.setSize(w, h, false);
    r.domElement.style.width = `${w}px`;
    r.domElement.style.height = `${h}px`;
    const cw = w / 3;
    this.camera.aspect = cw / h;
    this.camera.updateProjectionMatrix();
    const d = this.raio / Math.tan((this.camera.fov * Math.PI) / 360) * 1.05;
    ANGULOS.forEach((a, i) => {
      r.setViewport(i * cw, 0, cw, h);
      r.setScissor(i * cw, 0, cw, h);
      this.pivo.rotation.y = -a + Math.sin(t * 0.6 + i) * 0.05;
      this.camera.position.set(0, this.raio * 0.08, d);
      this.camera.lookAt(0, 0, 0);
      r.render(this.scene, this.camera);
    });
  }
}
