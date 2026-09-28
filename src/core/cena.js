// Cena 3D da Batcaverna: renderer, câmera, controles orbitais, iluminação de estúdio, piso reflexivo, névoa,
// poeira em partículas e feixe de escaneamento.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

export const MOBILE = matchMedia('(max-width: 900px)').matches || /Mobi|Android/i.test(navigator.userAgent);

const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export class Cena {
  constructor(container) {
    this.container = container;
    this.relogio = new THREE.Timer();
    this.animacoes = [];
    this.atualizaveis = new Set();

    const r = new THREE.WebGLRenderer({ antialias: !MOBILE, alpha: false, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(window.devicePixelRatio, MOBILE ? 1.5 : 2));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.05;
    r.shadowMap.enabled = !MOBILE;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(r.domElement);
    this.renderer = r;

    this.rotulos = new CSS2DRenderer();
    this.rotulos.domElement.className = 'camada-rotulos';
    container.appendChild(this.rotulos.domElement);

    this.scene = new THREE.Scene();
    this.corFundo = new THREE.Color('#070A0E');
    this.scene.background = this.corFundo.clone();
    this.scene.fog = new THREE.FogExp2(0x070a0e, 0.045);

    const pmrem = new THREE.PMREMGenerator(r);
    this.envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = this.envMap;
    this.scene.environmentIntensity = 0.55;

    this.camera = new THREE.PerspectiveCamera(38, 1, 0.05, 200);
    this.camera.position.set(6.5, 3.2, 8.5);

    const c = new OrbitControls(this.camera, r.domElement);
    c.enableDamping = true;
    c.dampingFactor = 0.07;
    c.minDistance = 2.2;
    c.maxDistance = 22;
    c.maxPolarAngle = Math.PI * 0.495;
    c.zoomSpeed = 0.6;
    c.rotateSpeed = 0.7;
    c.panSpeed = 0.6;
    c.screenSpacePanning = true;
    c.target.set(0, 1.1, 0);
    this.controls = c;

    this.criarLuzes();
    this.criarPiso();
    this.criarParticulas();
    this.criarFeixe();
    this.criarAneis();

    this.redimensionar();
    window.addEventListener('resize', () => this.redimensionar());
  }

  criarLuzes() {
    const s = this.scene;
    s.add(new THREE.HemisphereLight(0x38bdf8, 0x070a0e, 0.35));

    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(6, 9, 5);
    key.castShadow = !MOBILE;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -7;
    key.shadow.camera.right = 7;
    key.shadow.camera.top = 7;
    key.shadow.camera.bottom = -7;
    key.shadow.bias = -0.0005;
    s.add(key);

    const fill = new THREE.DirectionalLight(0x93c5fd, 0.7);
    fill.position.set(-7, 4, 4);
    s.add(fill);

    const rim = new THREE.DirectionalLight(0x06b6d4, 2.4);
    rim.position.set(-3, 5, -8);
    s.add(rim);

    this.holoAzul = new THREE.SpotLight(0x38bdf8, 60, 30, Math.PI / 7, 0.6, 1.6);
    this.holoAzul.position.set(-5, 8, 3);
    this.holoAmbar = new THREE.SpotLight(0xf59e0b, 45, 30, Math.PI / 8, 0.6, 1.6);
    this.holoAmbar.position.set(5, 8, -3);
    for (const l of [this.holoAzul, this.holoAmbar]) {
      l.target.position.set(0, 0.5, 0);
      s.add(l, l.target);
    }
    this.luzes = { key, fill, rim };
  }

  criarPiso() {
    if (!MOBILE) {
      const ref = new Reflector(new THREE.CircleGeometry(40, 64), {
        textureWidth: Math.floor(innerWidth * 0.5),
        textureHeight: Math.floor(innerHeight * 0.5),
        color: 0x3a4a60,
        clipBias: 0.003,
      });
      ref.rotation.x = -Math.PI / 2;
      ref.position.y = -0.002;
      this.scene.add(ref);
      this.refletor = ref;
    }
    // véu escuro sobre o refletor: controla a intensidade do reflexo e recebe sombra
    const veu = new THREE.Mesh(
      new THREE.CircleGeometry(40, 64),
      new THREE.MeshStandardMaterial({ color: 0x05080d, roughness: 0.35, metalness: 0.2, transparent: true, opacity: MOBILE ? 1 : 0.8 }),
    );
    veu.rotation.x = -Math.PI / 2;
    veu.receiveShadow = true;
    this.scene.add(veu);
    this.veu = veu;

    // grade holográfica
    this.grade = new THREE.GridHelper(40, 80, 0x06b6d4, 0x0f223d);
    this.grade.material.transparent = true;
    this.grade.material.opacity = 0.35;
    this.grade.position.y = 0.004;
    this.scene.add(this.grade);
  }

  criarAneis() {
    // plataforma giratória Wayne Tech
    const g = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(3.6, 3.8, 0.12, 96),
      new THREE.MeshStandardMaterial({ color: 0x0b0f17, metalness: 0.9, roughness: 0.3 }),
    );
    base.position.y = 0.06;
    base.receiveShadow = true;
    g.add(base);
    const anelMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.85 });
    const anel = new THREE.Mesh(new THREE.TorusGeometry(3.7, 0.02, 8, 160), anelMat);
    anel.rotation.x = Math.PI / 2;
    anel.position.y = 0.125;
    g.add(anel);
    const anel2 = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.012, 8, 160), new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.6 }));
    anel2.rotation.x = Math.PI / 2;
    anel2.position.y = 0.125;
    g.add(anel2);
    // marcadores angulares
    const marc = new THREE.BoxGeometry(0.02, 0.01, 0.22);
    for (let i = 0; i < 48; i += 1) {
      const m = new THREE.Mesh(marc, anelMat);
      const a = (i / 48) * Math.PI * 2;
      m.position.set(Math.cos(a) * 3.45, 0.126, Math.sin(a) * 3.45);
      m.rotation.y = -a;
      g.add(m);
    }
    this.plataforma = g;
    this.scene.add(g);
  }

  criarParticulas() {
    const n = MOBILE ? 500 : 1400;
    const pos = new Float32Array(n * 3);
    const fase = new Float32Array(n);
    for (let i = 0; i < n; i += 1) {
      const r = 1.5 + Math.random() * 11;
      const a = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.random() * 7;
      pos[i * 3 + 2] = Math.sin(a) * r;
      fase[i] = Math.random() * Math.PI * 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('fase', new THREE.BufferAttribute(fase, 1));
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { tempo: { value: 0 }, cor: { value: new THREE.Color(0x38bdf8) }, escala: { value: this.renderer.getPixelRatio() } },
      vertexShader: `
        attribute float fase; uniform float tempo; uniform float escala; varying float vAlfa;
        void main(){
          vec3 p = position;
          float a = tempo * 0.05 + fase;
          p.x += sin(a * 1.3) * 0.35; p.z += cos(a) * 0.35; p.y = mod(p.y + tempo * 0.08 + fase, 7.0);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (2.2 + sin(tempo + fase * 3.0)) * escala * (8.0 / -mv.z);
          vAlfa = 0.35 + 0.35 * sin(tempo * 1.7 + fase);
        }`,
      fragmentShader: `
        uniform vec3 cor; varying float vAlfa;
        void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard; gl_FragColor = vec4(cor, vAlfa * (1.0 - d * 2.0)); }`,
    });
    this.particulas = new THREE.Points(geo, mat);
    this.scene.add(this.particulas);
  }

  criarFeixe() {
    // plano de laser horizontal que sobe e desce varrendo o objeto
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: { tempo: { value: 0 }, cor: { value: new THREE.Color(0x06b6d4) }, forca: { value: 0.0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `
        uniform float tempo; uniform vec3 cor; uniform float forca; varying vec2 vUv;
        void main(){
          float r = length(vUv - 0.5) * 2.0;
          float borda = smoothstep(1.0, 0.92, r) * smoothstep(0.0, 0.9, r);
          float linhas = 0.6 + 0.4 * sin((vUv.x + vUv.y) * 180.0 + tempo * 6.0);
          gl_FragColor = vec4(cor, borda * linhas * 0.5 * forca);
        }`,
    });
    const feixe = new THREE.Mesh(new THREE.CircleGeometry(3.6, 96), mat);
    feixe.rotation.x = -Math.PI / 2;
    feixe.visible = false;
    this.scene.add(feixe);
    this.feixe = feixe;
    this.feixeInfo = { ativo: false, t: 0, dur: 1.6, altura: 3 };
  }

  escanear(altura = 3, dur = 1.6) {
    this.feixeInfo = { ativo: true, t: 0, dur, altura };
    this.feixe.visible = true;
  }

  redimensionar() {
    const w = this.container.clientWidth || innerWidth;
    const h = this.container.clientHeight || innerHeight;
    this.renderer.setSize(w, h);
    this.rotulos.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  // anima câmera e alvo até a posição desejada
  voarPara(posicao, alvo, dur = 1.4, aoFim) {
    if (this.instantaneo) {
      this.camera.position.copy(posicao);
      this.controls.target.copy(alvo);
      if (aoFim) aoFim();
      return;
    }
    const p0 = this.camera.position.clone();
    const a0 = this.controls.target.clone();
    this.animar(dur, (k) => {
      const e = easeInOut(k);
      this.camera.position.lerpVectors(p0, posicao, e);
      this.controls.target.lerpVectors(a0, alvo, e);
    }, aoFim);
  }

  animar(dur, passo, aoFim) {
    this.animacoes.push({ t: 0, dur, passo, aoFim });
  }

  tema(tipo) {
    // tipo: 'real' | 'wire' | 'xray'
    const fundo = { real: 0x070a0e, wire: 0x04070b, xray: 0x0b1f3f }[tipo];
    this.scene.background = new THREE.Color(fundo);
    this.scene.fog.color = new THREE.Color(fundo);
    this.scene.fog.density = tipo === 'xray' ? 0.03 : 0.045;
    const [c1, c2] = tipo === 'xray' ? [0xe0f2fe, 0x3b82f6] : tipo === 'wire' ? [0x06b6d4, 0x0e3a5c] : [0x06b6d4, 0x0f223d];
    this.scene.remove(this.grade);
    this.grade.geometry.dispose();
    this.grade.material.dispose();
    this.grade = new THREE.GridHelper(40, 80, c1, c2);
    this.grade.material.transparent = true;
    this.grade.material.opacity = tipo === 'real' ? 0.35 : 0.75;
    this.grade.position.y = 0.004;
    this.scene.add(this.grade);
    this.veu.material.color = new THREE.Color(tipo === 'xray' ? 0x0b1f3f : 0x05080d);
    if (this.refletor) this.refletor.visible = tipo === 'real';
    this.veu.material.opacity = tipo === 'real' ? (MOBILE ? 1 : 0.8) : 1;
    this.scene.environmentIntensity = tipo === 'real' ? 0.55 : 0.0;
  }

  loop(aoQuadro) {
    const tick = (agora) => {
      this.relogio.update(agora);
      const dt = Math.min(this.relogio.getDelta(), 0.05);
      const t = this.relogio.getElapsed();
      this.particulas.material.uniforms.tempo.value = t;
      this.feixe.material.uniforms.tempo.value = t;
      this.plataforma.rotation.y += dt * 0.05;

      // holofotes dinâmicos
      this.holoAzul.position.x = Math.sin(t * 0.3) * 6;
      this.holoAzul.position.z = Math.cos(t * 0.3) * 6;
      this.holoAmbar.position.x = Math.sin(t * 0.23 + 2) * 6;
      this.holoAmbar.position.z = Math.cos(t * 0.23 + 2) * 6;

      const f = this.feixeInfo;
      if (f.ativo) {
        f.t += dt;
        const k = f.t / f.dur;
        const y = k < 0.5 ? k * 2 * f.altura : (1 - (k - 0.5) * 2) * f.altura;
        this.feixe.position.y = 0.15 + y;
        this.feixe.material.uniforms.forca.value = Math.sin(Math.min(k, 1) * Math.PI);
        if (k >= 1) {
          f.ativo = false;
          this.feixe.visible = false;
        }
      }

      for (let i = this.animacoes.length - 1; i >= 0; i -= 1) {
        const a = this.animacoes[i];
        a.t += dt;
        const k = Math.min(a.t / a.dur, 1);
        a.passo(k);
        if (k >= 1) {
          this.animacoes.splice(i, 1);
          if (a.aoFim) a.aoFim();
        }
      }
      for (const u of this.atualizaveis) u(dt, t);
      if (aoQuadro) aoQuadro(dt, t);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      this.rotulos.render(this.scene, this.camera);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
