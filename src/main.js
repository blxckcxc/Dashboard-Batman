// O Panteão das Sombras · Wayne Tech Interactive Multiverse Supercomputer HUD
// Interface holográfica 2.5D: arte oficial e fotos de figuras licenciadas projetadas por um shader WebGL
// (vault de trajes em turnaround e garagem com planta CAD), sem malhas procedurais.
import { Motor } from './holo/motor.js';
import { Vault } from './holo/vault.js';
import { Garagem } from './holo/garagem.js';
import { instalarDefs, plantaTraje, FOLHAS_TRAJE } from './ui/plantas.js';
import { perfilTraje } from './data/perfis.js';
import { Sfx } from './audio/sfx.js';
import { VERSOES } from './data/versoes.js';
import { Hud, ROTULO_VEIC } from './ui/hud.js';

const $ = (s) => document.querySelector(s);
const CHAVE = 'panteao.versao';

class App {
  constructor() {
    this.sfx = new Sfx();
    this.estado = { versao: VERSOES[0], estacao: 'trajes', trajeIdx: 0, veiculoIdx: 0, modo: 'real', modoArkham: 'perseguicao' };
    this.turbinaAcesa = false;
    this.emCockpit = false;
    this.inicializado = false;
    instalarDefs();
    this.motor = new Motor($('#holo'));
    this.tem3d = !!this.motor.gl;
    if (!this.tem3d) document.body.classList.add('sem-webgl');
    this.hud = new Hud(this);
    this.vault = new Vault(this, this.motor);
    this.garagem = new Garagem(this, this.motor, ROTULO_VEIC);
    this.motor.iniciar((fps) => this.hud.telemetria(fps));
    for (const id of ['#estudo-esq', '#estudo-dir']) {
      $(id).addEventListener('click', (e) => {
        const fo = e.target.closest('[data-folha]');
        if (fo) this.ampliarFolha(fo.querySelector('svg').outerHTML, fo.querySelector('figcaption').textContent);
      });
    }
    $('#prancheta-fechar').addEventListener('click', () => this.fecharPrancheta());
    $('#prancheta').addEventListener('click', (e) => {
      if (e.target.id === 'prancheta') this.fecharPrancheta();
    });
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

  get veiculo() {
    return this.estado.versao.veiculos[this.estado.veiculoIdx];
  }

  rotuloRevelar() {
    return this.vault.rotuloRevelar();
  }

  selecionarVersao(id, inicial = false) {
    const v = VERSOES.find((x) => x.id === id);
    if (!v) return;
    const s = this.estado;
    s.versao = v;
    s.trajeIdx = 0;
    s.veiculoIdx = 0;
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
    this.hud.fecharDetalhe();
    this.sfx.transicao();
    this.mostrar();
  }

  selecionarTraje(i) {
    this.estado.trajeIdx = i;
    this.estado.estacao = 'trajes';
    this.hud.fecharDetalhe();
    this.sfx.clique();
    this.mostrar();
  }

  selecionarVeiculo(i) {
    const s = this.estado;
    const anterior = this.veiculo;
    const novo = s.versao.veiculos[i];
    s.veiculoIdx = i;
    if (s.estacao !== 'veiculo') {
      s.estacao = 'veiculo';
      this.mostrar();
      return;
    }
    // mesma carroceria em outro modo (Arkham): transição por glitch em vez de troca seca
    if (anterior.modelo === novo.modelo && novo.modo && anterior !== novo) {
      this.transformar(novo.modo);
      return;
    }
    this.sfx.clique();
    this.mostrar();
  }

  mostrar() {
    const s = this.estado;
    this.hud.renderFicha();
    document.body.dataset.estacao = s.estacao;
    this.atualizarLink();
    const trajes = s.estacao === 'trajes';
    this.vault.visivel = trajes;
    this.garagem.visivel = !trajes;
    this.turbinaAcesa = false;
    if (trajes) this.mostrarTraje();
    else this.mostrarVeiculo();
    this.hud.renderDock();
    this.inicializado = true;
  }

  mostrarTraje() {
    const s = this.estado;
    const v = s.versao;
    const t = v.trajes[s.trajeIdx];
    this.vault.mostrar(v, t);
    this.vault.definirModo(s.modo);
    const p = perfilTraje(v.id, t.id);
    const fig = (fo) => `<figure class="estudo-painel" data-folha="${fo.chave}" tabindex="0" title="Clique para ampliar"><figcaption>${fo.titulo}</figcaption>${plantaTraje(fo.chave, p, v.id)}</figure>`;
    $('#estudo-esq').innerHTML = fig(FOLHAS_TRAJE[0]) + fig(FOLHAS_TRAJE[1]);
    $('#estudo-dir').innerHTML = fig(FOLHAS_TRAJE[2]) + fig(FOLHAS_TRAJE[3]);
    this.hud.status(`VAULT DE TRAJES · ${t.nome.toUpperCase()} · HOLOGRAMA 2.5D`);
  }

  mostrarVeiculo() {
    const s = this.estado;
    const vd = this.veiculo;
    if (vd.modo) s.modoArkham = vd.modo;
    this.garagem.mostrar(s.versao, vd);
    this.garagem.definirModo(s.modo);
    this.hud.status(`GARAGEM · ${vd.nome.toUpperCase()}${vd.conceitual ? ' · SEM REFERÊNCIA OFICIAL' : ''}`);
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

  aoHotspot(d) {
    this.sfx.clique();
    this.hud.detalhe(d);
    if (this.estado.estacao === 'trajes') {
      for (const fo of document.querySelectorAll('.estudo-painel')) fo.classList.toggle('foco', fo.dataset.folha === d.folha);
      this.sfx.scan();
      return;
    }
    if (!this.emCockpit && !this.veiculo.conceitual && this.garagem.folhaUnica(d.chave)) this.sfx.scan();
    this.hud.renderDock();
  }

  ampliarFolha(svg, titulo) {
    $('#prancheta-titulo').textContent = titulo;
    $('#prancheta-corpo').innerHTML = svg;
    $('#prancheta').hidden = false;
    this.sfx.scan();
  }

  fecharPrancheta() {
    $('#prancheta').hidden = true;
    $('#prancheta-corpo').innerHTML = '';
  }

  // todas as pranchas técnicas do veículo ao redor dele, com linhas-guia até os pontos da imagem
  planta() {
    if (this.estado.estacao !== 'veiculo') return;
    if (this.garagem.plantaAberta) {
      this.garagem.fecharPlanta();
      this.hud.renderDock();
      return;
    }
    if (this.veiculo.conceitual) {
      this.hud.toast('SEM REFERÊNCIA OFICIAL · PLANTA INDISPONÍVEL');
      return;
    }
    if (this.emCockpit) this.sairCockpit(true);
    this.hud.fecharDetalhe();
    this.garagem.abrirPlanta();
    this.sfx.scan();
    this.hud.toast('PLANTA CAD · PRANCHAS TÉCNICAS DO VEÍCULO');
    this.hud.renderDock();
  }

  definirModo(m) {
    const s = this.estado;
    if (s.modo === m) return;
    s.modo = m;
    this.vault.definirModo(m);
    this.garagem.definirModo(m);
    document.body.dataset.modo = m;
    this.atualizarLink();
    if (m === 'xray') this.sfx.scan();
    else this.sfx.clique();
    this.hud.toast({ real: 'MODO RENDER REALISTA', wire: 'MODO WIREFRAME HOLOGRÁFICO', xray: 'MODO RAIO-X · VARREDURA INTERNA' }[m]);
    this.hud.renderDock();
  }

  revelar() {
    if (this.estado.estacao !== 'trajes') return;
    const etapa = this.vault.revelar();
    this.hud.fecharDetalhe();
    this.sfx.pneumatico();
    const v = this.estado.versao;
    const msgs = {
      rosto: `IDENTIDADE CONFIRMADA · ${v.identidade.nome.toUpperCase()}`,
      civil: `TRAJE CIVIL · ${v.identidade.nome.toUpperCase()}`,
      mentor: 'MENTOR · BRUCE WAYNE',
      traje: 'PROTOCOLO DE TRAJE RESTAURADO',
    };
    this.hud.toast(msgs[etapa]);
    this.hud.renderDock();
  }

  entrarCockpit() {
    if (this.estado.estacao !== 'veiculo' || this.emCockpit) return;
    this.garagem.fecharPlanta();
    this.hud.fecharDetalhe();
    this.emCockpit = true;
    this.garagem.cockpit(true);
    this.sfx.transicao();
    this.hud.cockpit(true, this.veiculo);
    this.hud.renderDock();
  }

  sairCockpit() {
    if (!this.emCockpit) return;
    this.emCockpit = false;
    this.garagem.cockpit(false);
    this.hud.cockpit(false);
    this.hud.renderDock();
  }

  ignicao() {
    if (this.estado.estacao !== 'veiculo') return;
    this.turbinaAcesa = !this.turbinaAcesa;
    const chama = this.garagem.ignicao(this.turbinaAcesa);
    if (this.turbinaAcesa) {
      this.sfx.ignicao();
      this.hud.toast(chama ? 'IGNIÇÃO · PÓS-COMBUSTÃO ATIVA' : 'IGNIÇÃO · MOTOR EM MARCHA LENTA');
    } else {
      this.sfx.desligar();
      this.hud.toast('MOTOR DESLIGADO');
    }
    this.hud.renderDock();
  }

  blindagem() {
    const vd = this.veiculo;
    if (this.estado.modo !== 'xray') this.definirModo('xray');
    const txt = vd.textos.blindagem || 'Sem dados de blindagem.';
    this.hud.detalhe({ titulo: 'Blindagem balística', texto: `${txt} Estrutura interna no raio-x e prancha de blindagem ao lado.`, grupo: vd.nome.toUpperCase() });
    if (!this.emCockpit && !vd.conceitual) this.garagem.folhaUnica('blindagem');
    this.hud.renderDock();
  }

  transformar(para) {
    const s = this.estado;
    if (!this.veiculo.modo) return;
    const destino = para || (s.modoArkham === 'tanque' ? 'perseguicao' : 'tanque');
    const idx = s.versao.veiculos.findIndex((x) => x.modo === destino);
    if (idx < 0) return;
    s.modoArkham = destino;
    s.veiculoIdx = idx;
    if (this.emCockpit) this.sairCockpit();
    this.sfx.transformar();
    this.garagem.transformar(this.veiculo);
    this.hud.toast(destino === 'tanque' ? 'TRANSFORMAÇÃO · MODO TANQUE DE COMBATE' : 'TRANSFORMAÇÃO · MODO PERSEGUIÇÃO');
    this.hud.renderFicha();
    this.hud.renderDock();
    this.hud.status(`GARAGEM · ${this.veiculo.nome.toUpperCase()}`);
    this.atualizarLink();
  }

  atalhos() {
    document.addEventListener('keydown', (e) => {
      if (e.target.closest && e.target.closest('input, textarea')) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const idx = VERSOES.indexOf(this.estado.versao);
      const k = e.key.toLowerCase();
      const trajes = this.estado.estacao === 'trajes';
      if (k === 'arrowdown') this.selecionarVersao(VERSOES[(idx + 1) % VERSOES.length].id);
      else if (k === 'arrowup') this.selecionarVersao(VERSOES[(idx + VERSOES.length - 1) % VERSOES.length].id);
      else if ((k === 'arrowright' || k === 'arrowleft') && trajes) this.vault.girar(k === 'arrowright' ? 1 : -1);
      else if (k === 'arrowright') this.selecionarVersao(VERSOES[(idx + 1) % VERSOES.length].id);
      else if (k === 'arrowleft') this.selecionarVersao(VERSOES[(idx + VERSOES.length - 1) % VERSOES.length].id);
      else if (k === '1') this.definirModo('real');
      else if (k === '2') this.definirModo('wire');
      else if (k === '3') this.definirModo('xray');
      else if (k === 't') this.trocarEstacao('trajes');
      else if (k === 'v') this.trocarEstacao('veiculo');
      else if (k === 'r' && trajes) this.revelar();
      else if (k === 'i' && !trajes) this.ignicao();
      else if (k === 'c' && !trajes) (this.emCockpit ? this.sairCockpit() : this.entrarCockpit());
      else if (k === 'p' && !trajes) this.planta();
      else if (k === 'escape') {
        if (!$('#prancheta').hidden) this.fecharPrancheta();
        else {
          this.sairCockpit();
          this.hud.fecharDetalhe();
          this.garagem.fecharPlanta();
          this.hud.renderDock();
        }
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
  app.selecionarVersao(l.versao, true);
  if (l.estacao === 'veiculo' || l.estacao === 'trajes') app.trocarEstacao(l.estacao);
  if (l.variante) (app.estado.estacao === 'trajes' ? app.selecionarTraje(l.variante) : app.selecionarVeiculo(l.variante));
  if (['real', 'wire', 'xray'].includes(l.modo)) app.definirModo(l.modo);
  if (l.acao === 'revelar') app.revelar();
  else if (l.acao === 'ignicao') app.ignicao();
  else if (l.acao === 'transformar') app.transformar();
  else if (l.acao === 'cockpit') app.entrarCockpit();
  else if (l.acao === 'planta') app.planta();
}

function boot() {
  const tela = $('#boot');
  const linhas = $('#boot-log');
  const passos = [
    'WAYNE TECH OS 12.7 · INICIALIZANDO NÚCLEO',
    'SINCRONIZANDO ARQUIVO DO MULTIVERSO · 12 REGISTROS',
    'CALIBRANDO PROJETORES HOLOGRÁFICOS',
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
