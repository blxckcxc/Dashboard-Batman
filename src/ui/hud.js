// HUD Wayne Tech: barra superior, arquivo do multiverso, ficha em abas, dock de controles, detalhe de hotspot,
// monitor de ameaças, radar e instrumentos do cockpit.
import { VERSOES } from '../data/versoes.js';
import { ASSETS } from '../_gerado/assets.js';
import { Radar } from './radar.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ordinal = (n) => `${n}º`;

export class Hud {
  constructor(app) {
    this.app = app;
    this.aba = 'ficha';
    this.montarLista();
    this.montarAbas();
    this.montarDock();
    this.radar = new Radar($('#radar'));
    this.montarAmeacas();
    this.relogio();
    this.toastT = null;
    $('#btn-som').addEventListener('click', () => {
      const mudo = app.sfx.alternarMudo();
      $('#btn-som').classList.toggle('desligado', mudo);
      $('#btn-som').setAttribute('aria-pressed', String(!mudo));
      $('#btn-som .txt').textContent = mudo ? 'SOM OFF' : 'SOM ON';
    });
    $('#detalhe-fechar').addEventListener('click', () => this.fecharDetalhe());
    $('#cockpit-sair').addEventListener('click', () => app.sairCockpit());
  }

  montarLista() {
    const ul = $('#lista-versoes');
    ul.innerHTML = VERSOES.map((v) => {
      const thumb = ASSETS[`avatar_${v.id}`] || ASSETS[v.trajes[0].img];
      const top = v.ranking <= 5;
      return `<li><button type="button" class="item-versao${top ? ' top' : ''}" data-id="${v.id}" aria-label="${esc(v.nome)}">
        <span class="rank">${top ? ordinal(v.ranking) : String(v.ranking).padStart(2, '0')}</span>
        <img src="${thumb}" alt="" loading="lazy">
        <span class="txt"><strong>${esc(v.nome)}</strong><small>${esc(v.era)} · ${esc(v.universo)}</small></span>
        ${top ? '<span class="selo">TOP 5</span>' : ''}
      </button></li>`;
    }).join('');
    ul.addEventListener('click', (e) => {
      const b = e.target.closest('.item-versao');
      if (b) this.app.selecionarVersao(b.dataset.id);
    });
  }

  marcarVersao(id) {
    for (const b of document.querySelectorAll('.item-versao')) {
      const ativo = b.dataset.id === id;
      b.classList.toggle('ativo', ativo);
      b.setAttribute('aria-current', ativo ? 'true' : 'false');
      if (ativo && this.app.inicializado) b.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }
  }

  montarAbas() {
    $('#abas').addEventListener('click', (e) => {
      const b = e.target.closest('[data-aba]');
      if (!b) return;
      this.aba = b.dataset.aba;
      this.app.sfx.clique();
      this.renderFicha();
    });
    $('#conteudo-aba').addEventListener('click', (e) => {
      const t = e.target.closest('[data-traje]');
      if (t) this.app.selecionarTraje(Number(t.dataset.traje));
      const v = e.target.closest('[data-veiculo]');
      if (v) this.app.selecionarVeiculo(Number(v.dataset.veiculo));
    });
  }

  renderCabecalho(v) {
    $('#ficha-rank').textContent = v.ranking <= 5 ? `${ordinal(v.ranking)} LUGAR · RANKING CANÔNICO` : `ARQUIVO ${String(v.ranking).padStart(2, '0')} · MULTIVERSO`;
    $('#ficha-rank').classList.toggle('top', v.ranking <= 5);
    $('#ficha-nome').textContent = v.nome;
    $('#ficha-sub').textContent = v.subtitulo;
  }

  renderFicha() {
    const s = this.app.estado;
    const v = s.versao;
    for (const b of document.querySelectorAll('#abas [data-aba]')) {
      const ativo = b.dataset.aba === this.aba;
      b.classList.toggle('ativo', ativo);
      b.setAttribute('aria-selected', String(ativo));
    }
    const alvo = $('#conteudo-aba');
    if (this.aba === 'ficha') {
      alvo.innerHTML = `
        <dl class="ficha-dl">${v.ficha.map(([k, val]) => `<dt>${esc(k)}</dt><dd>${esc(val)}</dd>`).join('')}
          <dt>Universo</dt><dd>${esc(v.universo)}</dd><dt>Identidade</dt><dd>${esc(v.identidade.nome)}</dd></dl>
        <p class="bio">${esc(v.bio)}</p>
        ${v.frases.length ? v.frases.map((f) => `<blockquote class="frase">"${esc(f.texto)}"<cite>${esc(f.fonte)}</cite></blockquote>`).join('') : ''}`;
    } else if (this.aba === 'trajes') {
      alvo.innerHTML = `<p class="dica">Selecione a variante. Clique nos pontos do holograma para a análise de materiais.</p>
        <div class="grade-cards">${v.trajes.map((t, i) => `
          <button type="button" class="card-var${i === s.trajeIdx ? ' ativo' : ''}" data-traje="${i}">
            <img src="${ASSETS[t.img]}" alt="">
            <span>${esc(t.nome)}${t.semImagem ? '<em>sem registro visual</em>' : ''}</span>
          </button>`).join('')}</div>
        <h4 class="sub">Engenharia do traje</h4>
        <ul class="lista-hs">${v.trajes[s.trajeIdx].hotspots.map((h) => `<li><strong>${esc(h.titulo)}</strong>${esc(h.texto)}</li>`).join('')}</ul>
        <p class="nota">Análise de materiais: descrição do universo ficcional (dossiê Wayne Tech).</p>`;
    } else if (this.aba === 'veiculo') {
      const vc = v.veiculos[s.veiculoIdx];
      alvo.innerHTML = `
        <div class="grade-cards veic">${v.veiculos.map((x, i) => `
          <button type="button" class="card-var${i === s.veiculoIdx ? ' ativo' : ''}" data-veiculo="${i}">
            <img src="${ASSETS[x.img]}" alt=""><span>${esc(x.nome)}</span>
          </button>`).join('')}</div>
        ${vc.conceitual ? '<p class="alerta-conceito">MODELO CONCEITUAL · sem referência visual oficial no arquivo</p>' : ''}
        <dl class="ficha-dl">${vc.specs.map(([k, val]) => `<dt>${esc(k)}</dt><dd>${esc(val)}</dd>`).join('')}</dl>
        <h4 class="sub">Pontos de inspeção</h4>
        <ul class="lista-hs">${Object.entries(vc.textos).map(([k, txt]) => `<li><strong>${esc(ROTULO_VEIC[k] || k)}</strong>${esc(txt)}</li>`).join('')}</ul>`;
    } else {
      alvo.innerHTML = `<h4 class="sub">Feitos táticos</h4>
        <ol class="feitos">${v.feitos.map((f) => `<li>${esc(f)}</li>`).join('')}</ol>
        ${v.frases.length ? `<h4 class="sub">Frases marcantes</h4>${v.frases.map((f) => `<blockquote class="frase">"${esc(f.texto)}"<cite>${esc(f.fonte)}</cite></blockquote>`).join('')}` : ''}
        <h4 class="sub">Ameaça principal monitorada</h4><p class="ameaca-tag">${esc(v.ameaca)}</p>`;
    }
  }

  montarDock() {
    const d = $('#dock');
    d.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-acao]');
      if (!b || b.disabled) return;
      const a = b.dataset.acao;
      const app = this.app;
      if (a === 'estacao') app.trocarEstacao(b.dataset.valor);
      else if (a === 'modo') app.definirModo(b.dataset.valor);
      else if (a === 'revelar') app.revelar();
      else if (a === 'cockpit') app.entrarCockpit();
      else if (a === 'turbina') app.ignicao();
      else if (a === 'blindagem') app.blindagem();
      else if (a === 'transformar') app.transformar();
      else if (a === 'planta') app.planta();
      else if (a === 'variante') {
        if (app.estado.estacao === 'trajes') app.selecionarTraje(Number(b.dataset.valor));
        else app.selecionarVeiculo(Number(b.dataset.valor));
      }
    });
  }

  renderDock() {
    const s = this.app.estado;
    const v = s.versao;
    for (const b of document.querySelectorAll('[data-acao="estacao"]')) b.classList.toggle('ativo', b.dataset.valor === s.estacao);
    for (const b of document.querySelectorAll('[data-acao="modo"]')) b.classList.toggle('ativo', b.dataset.valor === s.modo);
    const trajes = s.estacao === 'trajes';
    const lista = trajes ? v.trajes : v.veiculos;
    const idx = trajes ? s.trajeIdx : s.veiculoIdx;
    $('#dock-variantes').innerHTML = lista.map((x, i) => `<button type="button" data-acao="variante" data-valor="${i}" class="chip${i === idx ? ' ativo' : ''}">${esc(x.nome)}</button>`).join('');
    const acoes = trajes
      ? `<button type="button" data-acao="revelar" class="acao ambar">${esc(this.app.rotuloRevelar())}</button>`
      : `<button type="button" data-acao="cockpit" class="acao">COCKPIT</button>
         <button type="button" data-acao="turbina" class="acao ambar">${this.app.turbinaAcesa ? 'DESLIGAR MOTOR' : 'IGNIÇÃO'}</button>
         <button type="button" data-acao="blindagem" class="acao">BLINDAGEM</button>
         <button type="button" data-acao="planta" class="acao ciano${this.app.cad && this.app.cad.ativas.length > 1 ? ' ativo' : ''}">PLANTA CAD</button>
         ${this.app.veiculo && this.app.veiculo.transformar ? `<button type="button" data-acao="transformar" class="acao ciano">${s.modoArkham === 'tanque' ? 'MODO PERSEGUIÇÃO' : 'MODO TANQUE'}</button>` : ''}`;
    $('#dock-acoes').innerHTML = acoes;
  }

  detalhe({ titulo, texto, grupo }) {
    const el = $('#detalhe');
    $('#detalhe-grupo').textContent = grupo || 'ANÁLISE WAYNE TECH';
    $('#detalhe-titulo').textContent = titulo;
    $('#detalhe-texto').textContent = texto;
    el.hidden = false;
    el.classList.remove('entra');
    void el.offsetWidth;
    el.classList.add('entra');
  }

  fecharDetalhe() {
    $('#detalhe').hidden = true;
    if (this.app.cad && this.app.cad.ativas.length === 1) this.app.cad.limpar();
    if (this.app.vault) this.app.vault.limparEstudo();
  }

  toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('visivel');
    clearTimeout(this.toastT);
    this.toastT = setTimeout(() => el.classList.remove('visivel'), 2600);
  }

  status(txt) {
    $('#status-palco').textContent = txt;
  }

  montarAmeacas() {
    const ul = $('#ameacas');
    ul.innerHTML = VERSOES.map((v) => `<li data-id="${v.id}"><span class="u">${esc(v.universo)}</span><span class="a">${esc(v.ameaca)}</span><span class="n"></span></li>`).join('');
    const niveis = ['BAIXO', 'MODERADO', 'ELEVADO', 'CRÍTICO'];
    const atualizar = () => {
      for (const li of ul.children) {
        const k = Math.floor(Math.random() * 4);
        const n = li.querySelector('.n');
        n.textContent = niveis[k];
        n.className = `n nv${k}`;
      }
    };
    atualizar();
    setInterval(atualizar, 4200);
  }

  marcarAmeaca(id) {
    for (const li of document.querySelectorAll('#ameacas li')) li.classList.toggle('ativo', li.dataset.id === id);
  }

  relogio() {
    const r = $('#relogio');
    const tick = () => {
      const d = new Date();
      r.textContent = d.toLocaleTimeString('pt-BR', { hour12: false });
    };
    tick();
    setInterval(tick, 1000);
  }

  telemetria(fps) {
    $('#fps').textContent = String(Math.round(fps)).padStart(2, '0');
    const cpu = 38 + Math.round(Math.sin(performance.now() / 1300) * 9 + Math.random() * 4);
    $('#cpu').textContent = `${cpu}%`;
  }

  cockpit(ativo, v) {
    const el = $('#cockpit');
    el.hidden = !ativo;
    document.body.classList.toggle('em-cockpit', ativo);
    if (!ativo) {
      cancelAnimationFrame(this.cockpitRaf);
      return;
    }
    $('#cockpit-nome').textContent = v.nome;
    const vel = $('#g-vel');
    const temp = $('#g-temp');
    const blind = $('#g-blind');
    const barra = $('#g-barra');
    let t0 = performance.now();
    const loop = () => {
      const t = (performance.now() - t0) / 1000;
      const aceso = this.app.turbinaAcesa;
      const alvoVel = aceso ? 180 + Math.sin(t * 0.7) * 40 : 0;
      const velAtual = Number(vel.dataset.v || 0) + (alvoVel - Number(vel.dataset.v || 0)) * 0.03;
      vel.dataset.v = velAtual;
      vel.textContent = String(Math.round(velAtual)).padStart(3, '0');
      temp.textContent = `${Math.round(90 + (aceso ? 520 : 0) + Math.sin(t * 3) * 6)}°C`;
      blind.textContent = `${(98.6 + Math.sin(t * 0.4) * 0.8).toFixed(1)}%`;
      barra.style.width = `${Math.min(100, (velAtual / 260) * 100)}%`;
      this.cockpitRaf = requestAnimationFrame(loop);
    };
    loop();
  }
}

export const ROTULO_VEIC = {
  cockpit: 'Cockpit e instrumentação',
  turbina: 'Motor e turbina',
  blindagem: 'Blindagem balística',
  rodas: 'Rodas e tração',
  armas: 'Sistemas de armas',
};
