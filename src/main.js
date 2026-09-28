// O Panteão das Sombras · Wayne Tech Interactive Multiverse Supercomputer HUD & 3D Vault
import * as THREE from 'three';
import { Cena } from './core/cena.js';
import { registrar, aplicar } from './core/modos.js';
import { Hotspots } from './core/hotspots.js';
import { construirVeiculo } from './veiculos/catalogo.js';
import { PlantaCad } from './veiculos/cad.js';
import { Pod } from './trajes/pod.js';
import { Vault } from './trajes/vault.js';
import { CapuzVistas } from './trajes/capuz.js';
import { presetDo } from './trajes/presets.js';
import { renderEstudo } from './ui/estudo.js';
import { Sfx } from './audio/sfx.js';
import { VERSOES } from './data/versoes.js';
import { ASSETS } from './_gerado/assets.js';
import { MODELOS_GLB } from './_gerado/modelos.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Hud, ROTULO_VEIC } from './ui/hud.js';

const $ = (s) => document.querySelector(s);
const CHAVE = 'panteao.versao';

function webglOk() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) {
    return false;
  }
}

class App {
  constructor() {
    this.sfx = new Sfx();
    this.estado = { versao: VERSOES[0], estacao: 'trajes', trajeIdx: 0, veiculoIdx: 0, modo: 'real', etapaId: 0, modoArkham: 'perseguicao' };
    this.texturas = new Map();
    this.veiculos = new Map();
    this.veiculo = null;
    this.turbinaAcesa = false;
    this.emCockpit = false;
    this.inicializado = false;
    this.tem3d = webglOk();
    this.hud = new Hud(this);
    if (this.tem3d) this.iniciar3d();
    else document.body.classList.add('sem-webgl');
    let inicial = VERSOES[0].id;
    try {
      const salvo = localStorage.getItem(CHAVE);
      if (salvo && VERSOES.some((v) => v.id === salvo)) inicial = salvo;
    } catch (e) {
      /* armazenamento indisponível: segue com a versão 1 */
    }
    this.selecionarVersao(inicial, true);
    this.atalhos();
  }

  iniciar3d() {
    this.cena = new Cena($('#webgl'));
    this.hotspots = new Hotspots(this.cena, (d) => this.aoHotspot(d));
    this.vault = new Vault(this.cena);
    // cartão holográfico de identidade, ao lado da cabeça da figura central
    this.pod = new Pod(this.cena, { soHolograma: true });
    registrar(this.pod.grupo);
    this.pod.grupo.position.set(1.55, 1.18, 0.9);
    this.pod.grupo.scale.setScalar(0.62);
    this.pod.grupo.visible = false;
    this.cena.scene.add(this.pod.grupo);
    this.vistas = new CapuzVistas($('#capuz-vistas'));
    this.garagem = new THREE.Group();
    this.cena.scene.add(this.garagem);
    this.cad = new PlantaCad(this.cena);
    this.cena.atualizaveis.add((dt, t) => {
      this.pod.atualizar(dt, t);
      this.cad.atualizar(dt, t);
      this.vault.atualizar(dt, t);
      if (this.estado.estacao === 'trajes') this.vistas.render(t);
      if (this.veiculo) {
        for (const tb of this.veiculo.turbinas) tb.userData.atualizar(dt, t);
        if (this.veiculo.atualizar) this.veiculo.atualizar(dt, t);
      }
    });
    let acum = 0;
    let quadros = 0;
    this.cena.loop((dt) => {
      acum += dt;
      quadros += 1;
      if (acum >= 0.5) {
        this.hud.telemetria(quadros / acum);
        acum = 0;
        quadros = 0;
      }
    });
  }

  textura(chave) {
    if (this.texturas.has(chave)) return this.texturas.get(chave);
    const p = new Promise((ok) => {
      new THREE.TextureLoader().load(ASSETS[chave], (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        ok(tex);
      });
    });
    this.texturas.set(chave, p);
    return p;
  }

  // sequência de identidades da versão: traje, rosto e, se houver, o traje civil
  etapas() {
    const v = this.estado.versao;
    const t = v.trajes[this.estado.trajeIdx];
    const lista = [{ chave: t.img, rotulo: 'traje' }, { chave: v.identidade.rosto, rotulo: 'rosto' }];
    if (v.identidade.civil) lista.push({ chave: v.identidade.civil, rotulo: 'civil' });
    if (v.identidade.mentor) lista.push({ chave: v.identidade.mentor, rotulo: 'mentor' });
    return lista;
  }

  rotuloRevelar() {
    const e = this.etapas();
    const prox = e[(this.estado.etapaId + 1) % e.length].rotulo;
    return { rosto: 'REMOVER MÁSCARA', civil: 'TRAJE CIVIL', mentor: 'MENTOR', traje: 'VESTIR TRAJE' }[prox];
  }

  selecionarVersao(id, inicial = false) {
    const v = VERSOES.find((x) => x.id === id);
    if (!v) return;
    const s = this.estado;
    s.versao = v;
    s.trajeIdx = 0;
    s.veiculoIdx = 0;
    s.etapaId = 0;
    s.modoArkham = v.veiculos[0].modo || 'perseguicao';
    try {
      localStorage.setItem(CHAVE, id);
    } catch (e) {
      /* sem persistência */
    }
    if (this.emCockpit) this.sairCockpit(true);
    this.hud.marcarVersao(id);
    this.hud.marcarAmeaca(id);
    this.hud.renderCabecalho(v);
    this.hud.fecharDetalhe();
    if (!inicial) this.sfx.transicao();
    this.mostrar();
  }

  trocarEstacao(est) {
    if (this.estado.estacao === est) return;
    if (this.emCockpit) this.sairCockpit(true);
    this.estado.estacao = est;
    this.hud.aba = est === 'trajes' ? 'trajes' : 'veiculo';
    this.sfx.transicao();
    this.mostrar();
  }

  selecionarTraje(i) {
    this.estado.trajeIdx = i;
    this.estado.etapaId = 0;
    if (this.estado.estacao !== 'trajes') this.estado.estacao = 'trajes';
    this.sfx.clique();
    this.mostrar();
  }

  selecionarVeiculo(i) {
    const v = this.estado.versao;
    const anterior = v.veiculos[this.estado.veiculoIdx];
    const novo = v.veiculos[i];
    this.estado.veiculoIdx = i;
    if (this.estado.estacao !== 'veiculo') {
      this.estado.estacao = 'veiculo';
      this.mostrar();
      return;
    }
    // mesma carroceria com modos diferentes: anima a transformação em vez de trocar o modelo
    if (this.veiculo && anterior.modelo === novo.modelo && this.veiculo.transformar && novo.modo) {
      this.transformar(novo.modo);
      return;
    }
    this.sfx.clique();
    this.mostrar();
  }

  mostrar() {
    const s = this.estado;
    this.hud.renderFicha();
    this.hud.renderDock();
    document.body.dataset.estacao = s.estacao;
    this.atualizarLink();
    const v = s.versao;
    if (!this.tem3d) {
      const img = s.estacao === 'trajes' ? v.trajes[s.trajeIdx].img : v.veiculos[s.veiculoIdx].img;
      $('#palco-2d').src = ASSETS[img];
      return;
    }
    this.hotspots.limpar();
    this.cad.limpar();
    if (s.estacao === 'trajes') this.mostrarTraje();
    else this.mostrarVeiculo();
    this.cena.escanear(s.estacao === 'trajes' ? 3.6 : 2.2);
    this.inicializado = true;
  }

  mostrarTraje() {
    const s = this.estado;
    const v = s.versao;
    const t = v.trajes[s.trajeIdx];
    this.garagem.visible = false;
    this.vault.visivel = true;
    this.pod.grupo.visible = false;
    this.cena.controls.enableRotate = false;
    this.hud.status(`VAULT DE TRAJES · ${t.nome.toUpperCase()} · MODELO 3D WAYNE TECH`);
    const preset = presetDo(v.id, t.id);
    const m = this.vault.mostrar(`${v.id}:${t.id}`, preset);
    aplicar(this.vault.grupo, s.modo);
    this.vistas.definir(m.cabeca, this.cena.envMap);
    renderEstudo(preset, $('#estudo-esq'), $('#estudo-dir'));
    // pontos de inspeção ancorados no manequim central; clicar na peça abre o mesmo estudo
    const fig = this.vault.figuras[0];
    for (const h of t.hotspots) {
      const pos = m.ancoras[h.id];
      if (!pos) continue;
      const dados = { titulo: h.titulo, texto: h.texto, grupo: `TRAJE · ${t.nome.toUpperCase()}`, chave: h.id };
      this.hotspots.adicionar(fig, pos, dados);
      for (const o of m.pecas[h.id] || []) o.traverse((q) => { if (q.isMesh) this.hotspots.alvo(q, dados); });
    }
    // distância que enquadra os três pedestais na largura e a figura central na altura
    this.cena.redimensionar();
    const cam = this.cena.camera;
    const tg = Math.tan((cam.fov * Math.PI) / 360);
    const d = Math.max(3.7 / tg, 4.05 / (tg * cam.aspect));
    this.cena.voarPara(new THREE.Vector3(0, 2.25, d), new THREE.Vector3(0, 1.82, 0), 1.3);
  }

  mostrarVeiculo() {
    const s = this.estado;
    const vd = s.versao.veiculos[s.veiculoIdx];
    this.pod.grupo.visible = false;
    this.vault.visivel = false;
    this.vault.limparEstudo();
    this.cena.controls.enableRotate = true;
    this.garagem.visible = true;
    this.turbinaAcesa = false;
    const chave = `${s.versao.id}:${vd.modelo}`;
    let v = this.veiculos.get(chave);
    if (!v) {
      v = construirVeiculo(vd.modelo, vd.modo);
      if (MODELOS_GLB[vd.modelo]) this.substituirPorGlb(v, MODELOS_GLB[vd.modelo]);
      registrar(v.grupo);
      this.veiculos.set(chave, v);
    }
    for (const tb of v.turbinas) tb.userData.acender(false);
    if (v.transformar && vd.modo) {
      s.modoArkham = vd.modo;
      v.transformar(this.cena, vd.modo);
    }
    this.garagem.clear();
    this.garagem.add(v.grupo);
    this.veiculo = v;
    aplicar(v.grupo, s.modo);
    this.hud.status(`GARAGEM · ${vd.nome.toUpperCase()}${vd.conceitual ? ' · MODELO CONCEITUAL' : ''}`);
    this.hud.renderDock();

    // marcadores nos pontos de inspeção
    const dados = {};
    for (const [k, pos] of Object.entries(v.ancoras)) {
      if (!vd.textos[k]) continue;
      dados[k] = { titulo: ROTULO_VEIC[k], texto: vd.textos[k], grupo: vd.nome.toUpperCase(), chave: k };
      this.hotspots.adicionar(v.grupo, pos, dados[k]);
    }
    // clique direto nas peças: pneus, vidros, turbina e carroceria
    v.grupo.traverse((o) => {
      if (!o.isMesh) return;
      let alvo = 'blindagem';
      let p = o;
      while (p && p !== v.grupo) {
        if (p.userData.acender) alvo = 'turbina';
        p = p.parent;
      }
      if (o.userData.papel === 'pneu') alvo = 'rodas';
      if (o.userData.papel === 'vidro') alvo = 'cockpit';
      if (dados[alvo]) this.hotspots.alvo(o, dados[alvo]);
    });
    // enquadramento proporcional ao tamanho do veículo
    const caixa = new THREE.Box3().setFromObject(v.grupo, true);
    const tam = caixa.getSize(new THREE.Vector3());
    const centro = caixa.getCenter(new THREE.Vector3());
    const d = (Math.max(tam.x, tam.z, tam.y * 1.6) * 1.2 + 3.6) * this.fatorTela();
    this.cena.voarPara(new THREE.Vector3(centro.x + d * 0.62, centro.y + 1.2 + d * 0.12, d * 0.74), new THREE.Vector3(centro.x, centro.y * 0.85, 0), 1.3);
  }

  // troca a malha procedural por um GLB embutido no build, mantendo âncoras, turbinas e câmera de cockpit
  substituirPorGlb(v, base64) {
    const bin = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const falhou = (erro) => console.warn('GLB inválido, mantido o modelo procedural', erro);
    try {
      new GLTFLoader().parse(bin.buffer, '', (gltf) => this.aplicarGlb(v, gltf), falhou);
    } catch (erro) {
      falhou(erro);
    }
  }

  aplicarGlb(v, gltf) {
    const caixaProc = new THREE.Box3().setFromObject(v.grupo);
    const modelo = gltf.scene;
    const caixa = new THREE.Box3().setFromObject(modelo);
    const escala = caixaProc.getSize(new THREE.Vector3()).x / Math.max(1e-3, caixa.getSize(new THREE.Vector3()).x);
    modelo.scale.setScalar(escala);
    const c2 = new THREE.Box3().setFromObject(modelo);
    modelo.position.x -= (c2.min.x + c2.max.x) / 2;
    modelo.position.z -= (c2.min.z + c2.max.z) / 2;
    modelo.position.y -= c2.min.y;
    const turbinas = new Set(v.turbinas);
    for (const filho of [...v.grupo.children]) if (!turbinas.has(filho)) v.grupo.remove(filho);
    modelo.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.userData.papel = 'casco';
      }
    });
    v.grupo.add(modelo);
    registrar(v.grupo);
    aplicar(v.grupo, this.estado.modo);
  }

  atualizarLink() {
    if (!this.linkAtivo) return;
    const s = this.estado;
    const idx = s.estacao === 'trajes' ? s.trajeIdx : s.veiculoIdx;
    try {
      history.replaceState(null, '', `#${s.versao.id}/${s.estacao}/${s.modo}/${idx}`);
    } catch (e) {
      /* alguns navegadores bloqueiam replaceState em file:// */
    }
  }

  // telas em retrato pedem a câmera mais afastada para caber o objeto inteiro
  fatorTela() {
    return Math.max(1, 1.1 / this.cena.camera.aspect);
  }

  aoHotspot(d) {
    this.sfx.clique();
    this.hud.detalhe(d);
    // no vault, o ponto de inspeção abre o estudo explodido da peça
    if (d.chave && this.tem3d && this.estado.estacao === 'trajes') {
      if (this.vault.estudar(d.chave, d.titulo)) this.sfx.scan();
      return;
    }
    // no veículo, o ponto de inspeção abre a planta CAD explodida da submontagem
    if (d.chave && this.tem3d && this.veiculo && this.estado.estacao === 'veiculo' && !this.emCockpit) {
      this.veiculo.grupo.updateMatrixWorld(true);
      if (this.cad.mostrar(this.veiculo, [d.chave])) this.sfx.scan();
    }
  }

  // todas as plantas CAD do veículo ao redor dele, com a câmera recuada
  planta() {
    if (!this.tem3d || !this.veiculo || this.estado.estacao !== 'veiculo') return;
    if (this.cad.ativas.length > 1) {
      this.cad.limpar();
      this.hud.renderDock();
      return;
    }
    if (this.emCockpit) this.sairCockpit(true);
    const vd = this.estado.versao.veiculos[this.estado.veiculoIdx];
    const chaves = Object.keys(this.veiculo.ancoras).filter((k) => vd.textos[k]);
    this.veiculo.grupo.updateMatrixWorld(true);
    // distância que enquadra o arco de plantas na largura e na altura do palco
    this.cena.redimensionar();
    const cam = this.cena.camera;
    const tg = Math.tan((cam.fov * Math.PI) / 360);
    const d = Math.max(4.6 / tg, 6.4 / (tg * cam.aspect));
    const dir = new THREE.Vector3(0.5, 0.32, 0.8).normalize();
    const vista = { pos: dir.multiplyScalar(d).add(new THREE.Vector3(0, 2.0, 0)), alvo: new THREE.Vector3(0, 2.0, 0) };
    this.cad.mostrar(this.veiculo, chaves, vista);
    this.sfx.scan();
    this.hud.toast('PLANTA CAD · VISTA EXPLODIDA DAS SUBMONTAGENS');
    this.cena.voarPara(vista.pos, vista.alvo, 1.4);
    this.hud.renderDock();
  }

  definirModo(m) {
    const s = this.estado;
    if (s.modo === m) return;
    s.modo = m;
    if (this.tem3d) {
      aplicar(this.pod.grupo, m);
      aplicar(this.vault.grupo, m);
      this.pod.modo(m);
      if (this.veiculo) aplicar(this.veiculo.grupo, m);
      this.cena.tema(m);
      this.cena.escanear(s.estacao === 'trajes' ? 3.6 : 2.2, 1.8);
    }
    document.body.dataset.modo = m;
    this.atualizarLink();
    if (m === 'xray') this.sfx.scan();
    else this.sfx.clique();
    this.hud.toast({ real: 'MODO RENDER REALISTA', wire: 'MODO WIREFRAME HOLOGRÁFICO', xray: 'MODO RAIO-X · BLUEPRINT' }[m]);
    this.hud.renderDock();
  }

  revelar() {
    if (!this.tem3d) return;
    const e = this.etapas();
    const s = this.estado;
    const prox = (s.etapaId + 1) % e.length;
    s.etapaId = prox;
    // o capuz 3D se dissolve e o cartão holográfico mostra o rosto, o traje civil e o mentor do acervo
    const rotulo = e[prox].rotulo;
    this.vault.definirDissolucao(rotulo === 'traje' ? 0 : 1);
    if (rotulo === 'traje') {
      this.pod.grupo.visible = false;
    } else {
      this.textura(e[prox].chave).then((tex) => {
        if (s.etapaId !== prox) return;
        this.pod.grupo.visible = true;
        this.pod.definir(tex, rotulo !== 'rosto');
        this.pod.materializar();
      });
    }
    this.hotspots.visivel(rotulo === 'traje');
    this.sfx.pneumatico();
    const v = s.versao;
    const msgs = {
      rosto: `IDENTIDADE CONFIRMADA · ${v.identidade.nome.toUpperCase()}`,
      civil: `TRAJE CIVIL · ${v.identidade.nome.toUpperCase()}`,
      mentor: 'MENTOR · BRUCE WAYNE',
      traje: 'PROTOCOLO DE TRAJE RESTAURADO',
    };
    this.hud.toast(msgs[e[prox].rotulo]);
    this.hud.renderDock();
  }

  entrarCockpit() {
    if (!this.tem3d || !this.veiculo || this.emCockpit) return;
    const vd = this.estado.versao.veiculos[this.estado.veiculoIdx];
    const cam = this.veiculo.camCockpit;
    const g = this.veiculo.grupo;
    const pos = cam.pos.clone().add(g.position);
    const olhar = cam.olhar.clone().add(g.position);
    this.camSalva = { p: this.cena.camera.position.clone(), a: this.cena.controls.target.clone() };
    this.emCockpit = true;
    this.cena.controls.enabled = false;
    this.hotspots.visivel(false);
    this.sfx.transicao();
    this.cena.voarPara(pos, olhar, 1.6, () => {
      this.cena.controls.enabled = true;
      this.cena.controls.minDistance = 0.01;
      this.cena.controls.enablePan = false;
    });
    this.hud.cockpit(true, vd);
  }

  sairCockpit(imediato = false) {
    if (!this.emCockpit) return;
    this.emCockpit = false;
    this.hud.cockpit(false);
    this.cena.controls.minDistance = 2.2;
    this.cena.controls.enablePan = true;
    this.hotspots.visivel(true);
    if (!imediato && this.camSalva) this.cena.voarPara(this.camSalva.p, this.camSalva.a, 1.2);
  }

  ignicao() {
    if (!this.tem3d || !this.veiculo) return;
    this.turbinaAcesa = !this.turbinaAcesa;
    const tbs = this.veiculo.turbinas;
    for (const tb of tbs) tb.userData.acender(this.turbinaAcesa);
    if (this.turbinaAcesa) {
      this.sfx.ignicao();
      this.hud.toast(tbs.length ? 'IGNIÇÃO · PÓS-COMBUSTÃO ATIVA' : 'IGNIÇÃO · MOTOR EM MARCHA LENTA');
      if (tbs.length && !this.emCockpit) {
        const g = this.veiculo.grupo;
        const ancora = this.veiculo.ancoras.turbina.clone().add(g.position);
        this.cena.voarPara(new THREE.Vector3(ancora.x - 4.2, 1.9, ancora.z + 4.4), new THREE.Vector3(ancora.x, ancora.y, ancora.z), 1.2);
      }
    } else {
      this.sfx.desligar();
      this.hud.toast('MOTOR DESLIGADO');
    }
    aplicar(this.veiculo.grupo, this.estado.modo);
    this.hud.renderDock();
  }

  blindagem() {
    if (!this.veiculo) return;
    const vd = this.estado.versao.veiculos[this.estado.veiculoIdx];
    if (this.estado.modo !== 'xray') this.definirModo('xray');
    const txt = vd.textos.blindagem || 'Sem dados de blindagem.';
    this.hud.detalhe({ titulo: 'Blindagem balística', texto: `${txt} Camadas internas destacadas em âmbar no modo raio-X.`, grupo: vd.nome.toUpperCase() });
    if (this.tem3d) {
      this.veiculo.grupo.updateMatrixWorld(true);
      this.cad.mostrar(this.veiculo, ['blindagem']);
    }
  }

  transformar(para) {
    if (!this.veiculo || !this.veiculo.transformar) return;
    const s = this.estado;
    const destino = para || (s.modoArkham === 'tanque' ? 'perseguicao' : 'tanque');
    s.modoArkham = destino;
    const idx = s.versao.veiculos.findIndex((x) => x.modo === destino);
    if (idx >= 0) s.veiculoIdx = idx;
    this.sfx.transformar();
    this.veiculo.transformar(this.cena, destino);
    this.hud.toast(destino === 'tanque' ? 'TRANSFORMAÇÃO · MODO TANQUE DE COMBATE' : 'TRANSFORMAÇÃO · MODO PERSEGUIÇÃO');
    this.cena.escanear(2.4, 1.3);
    this.hud.renderFicha();
    this.hud.renderDock();
    this.hud.status(`GARAGEM · ${s.versao.veiculos[s.veiculoIdx].nome.toUpperCase()}`);
  }

  atalhos() {
    document.addEventListener('keydown', (e) => {
      if (e.target.closest && e.target.closest('input, textarea')) return;
      const idx = VERSOES.indexOf(this.estado.versao);
      const k = e.key.toLowerCase();
      if (k === 'arrowdown' || k === 'arrowright') this.selecionarVersao(VERSOES[(idx + 1) % VERSOES.length].id);
      else if (k === 'arrowup' || k === 'arrowleft') this.selecionarVersao(VERSOES[(idx + VERSOES.length - 1) % VERSOES.length].id);
      else if (k === '1') this.definirModo('real');
      else if (k === '2') this.definirModo('wire');
      else if (k === '3') this.definirModo('xray');
      else if (k === 't') this.trocarEstacao('trajes');
      else if (k === 'v') this.trocarEstacao('veiculo');
      else if (k === 'r' && this.estado.estacao === 'trajes') this.revelar();
      else if (k === 'i' && this.estado.estacao === 'veiculo') this.ignicao();
      else if (k === 'c' && this.estado.estacao === 'veiculo') (this.emCockpit ? this.sairCockpit() : this.entrarCockpit());
      else if (k === 'p' && this.estado.estacao === 'veiculo') this.planta();
      else if (k === 'escape') {
        this.sairCockpit();
        this.hud.fecharDetalhe();
      } else return;
      e.preventDefault();
    });
  }
}

// link direto: #versao/estacao/modo/variante/acao, por exemplo #v05/veiculo/xray/1/ignicao
function lerLink() {
  const h = decodeURIComponent(location.hash.replace(/^#/, ''));
  if (!h) return null;
  const [versao, estacao, modo, variante, acao] = h.split('/');
  if (!VERSOES.some((v) => v.id === versao)) return null;
  return { versao, estacao, modo, variante: Number(variante) || 0, acao };
}

function aplicarLink(app, l) {
  if (app.cena) app.cena.instantaneo = true;
  app.selecionarVersao(l.versao, true);
  if (l.estacao === 'veiculo' || l.estacao === 'trajes') app.trocarEstacao(l.estacao);
  if (l.variante) (app.estado.estacao === 'trajes' ? app.selecionarTraje(l.variante) : app.selecionarVeiculo(l.variante));
  if (['real', 'wire', 'xray'].includes(l.modo)) app.definirModo(l.modo);
  if (l.acao === 'revelar') app.revelar();
  else if (l.acao === 'ignicao') app.ignicao();
  else if (l.acao === 'transformar') app.transformar();
  else if (l.acao === 'cockpit') app.entrarCockpit();
  else if (l.acao === 'planta') app.planta();
  if (app.cena) app.cena.instantaneo = false;
}

function boot() {
  const tela = $('#boot');
  const linhas = $('#boot-log');
  const passos = [
    'WAYNE TECH OS 12.7 · INICIALIZANDO NÚCLEO',
    'SINCRONIZANDO ARQUIVO DO MULTIVERSO · 12 REGISTROS',
    'CALIBRANDO PEDESTAL HOLOGRÁFICO',
    'GARAGEM DE VEÍCULOS · ONLINE',
    'PROTOCOLO BATCAVERNA · ACESSO CONCEDIDO',
  ];
  const app = new App();
  window.panteao = app;
  const link = lerLink();
  if (link) {
    // entrada direta por link: pula a tela de boot; o áudio liga no primeiro toque
    aplicarLink(app, link);
    app.linkAtivo = true;
    tela.remove();
    document.body.classList.add('pronto');
    const ligarSom = () => {
      app.sfx.iniciar();
      document.removeEventListener('pointerdown', ligarSom);
    };
    document.addEventListener('pointerdown', ligarSom);
    return;
  }
  $('#boot-iniciar').disabled = false;
  $('#boot-iniciar').addEventListener('click', () => {
    $('#boot-iniciar').disabled = true;
    app.linkAtivo = true;
    app.atualizarLink();
    app.sfx.iniciar();
    app.sfx.boot();
    passos.forEach((p, i) => setTimeout(() => {
      const li = document.createElement('li');
      li.textContent = p;
      linhas.appendChild(li);
    }, 120 + i * 190));
    setTimeout(() => {
      tela.classList.add('saindo');
      document.body.classList.add('pronto');
      setTimeout(() => tela.remove(), 700);
    }, 1350);
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
