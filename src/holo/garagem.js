// Garagem 2.5D: arte oficial do veículo em holograma com reflexo no piso, abas de vista (lateral, topo, 3/4,
// traseira e as extras do acervo), pontos de inspeção sobre a imagem, chama de ignição no bocal, zoom de
// cockpit, transformação por glitch e planta CAD com as pranchas técnicas ao redor do veículo.
import { HOLOS } from '../_gerado/holos.js';
import { PONTOS, TIPO_VEICULO } from '../data/perfis.js';
import { plantaVeiculo, ORDEM_FOLHAS_VEIC, TITULO_FOLHA_VEIC } from '../ui/plantas.js';

const $ = (s) => document.querySelector(s);
const VERDE = [0.3, 1.0, 0.78];
const CIANO = [0.36, 0.86, 1.0];
const VISTAS = [['lateral', 'LATERAL'], ['topo', 'TOPO'], ['34', '3/4'], ['traseira', 'TRASEIRA'], ['frontal', 'FRONTAL'], ['acervo', '3/4 B']];
const PADRAO = ['34', 'lateral', 'acervo', 'frontal', 'traseira'];

export class Garagem {
  constructor(app, motor, rotulos) {
    this.app = app;
    this.motor = motor;
    this.rotulos = rotulos;
    this.raiz = $('#garagem');
    this.slot = motor.slot($('#slot-veic'), { cor: CIANO, refl: true });
    this.hsCamada = $('#hs-veic');
    this.chama = $('#chama');
    this.esquema = $('#xray-esquema');
    this.folhas = $('#cad-folhas');
    this.guias = $('#guias');
    this.ativo = false;
    this.zoomAlvo = [0.5, 0.5, 1];
    this.troca = null;
    this.planta = [];
    this.aceso = false;
    this.cache = {};
    $('#vistas').addEventListener('click', (e) => {
      const b = e.target.closest('[data-vista]');
      if (b) this.trocarVista(b.dataset.vista);
    });
    this.hsCamada.addEventListener('click', (e) => {
      const b = e.target.closest('[data-hs]');
      if (!b) return;
      for (const x of this.hsCamada.children) x.classList.toggle('ativo', x === b);
      const k = b.dataset.hs;
      this.app.aoHotspot({ titulo: this.rotulos[k], texto: this.vd.textos[k], grupo: this.vd.nome.toUpperCase(), chave: k, folha: k });
    });
    this.folhas.addEventListener('click', (e) => {
      const f = e.target.closest('[data-folha]');
      if (f) this.app.ampliarFolha(f.querySelector('svg').outerHTML, f.querySelector('figcaption').textContent);
    });
    motor.tarefas.add((dt) => this.quadro(dt));
  }

  set visivel(v) {
    this.ativo = v;
    this.slot.ativo = v;
    if (!v) {
      this.fecharPlanta();
      this.ignicao(false);
    }
  }

  mostrar(v, vd) {
    this.v = v;
    this.vd = vd;
    this.h = HOLOS.veiculos[`${v.id}:${vd.id}`] || { vistas: [], fonte: '' };
    this.tipo = TIPO_VEICULO[vd.modelo] || 'carro';
    this.fecharPlanta();
    this.ignicao(false);
    this.zoomAlvo = [0.5, 0.5, 1];
    this.slot.zoom = [0.5, 0.5, 1];
    this.motor.preparar(this.h.vistas.map((x) => x.img));
    const ids = this.h.vistas.map((x) => x.id);
    this.vista = PADRAO.find((id) => ids.includes(id)) || null;
    this.renderVistas();
    this.aplicarVista(0.9);
    $('#fonte-palco').textContent = this.h.vistas.length ? `FONTE: ${this.h.fonte.toUpperCase()}` : '';
  }

  renderVistas() {
    const ids = this.h.vistas.map((x) => x.id);
    $('#vistas').innerHTML = VISTAS.filter(([id]) => ['lateral', 'topo', '34', 'traseira'].includes(id) || ids.includes(id)).map(([id, nome]) => {
      const tem = ids.includes(id);
      return `<button type="button" role="tab" data-vista="${id}" class="vista${id === this.vista ? ' ativo' : ''}${tem ? '' : ' sem'}" aria-selected="${id === this.vista}"
        title="${tem ? `Vista ${nome.toLowerCase()}` : 'Sem referência oficial para esta vista'}">${nome}</button>`;
    }).join('');
  }

  trocarVista(id) {
    if (id === this.vista) return;
    this.vista = id;
    this.fecharPlanta();
    this.renderVistas();
    this.aplicarVista(0.8);
    this.app.sfx.clique();
    if (this.aceso) this.ignicao(true, true);
  }

  aplicarVista(glitch) {
    const vis = this.h.vistas.find((x) => x.id === this.vista);
    const vazio = !vis;
    const sr = $('#veic-semref');
    sr.hidden = !vazio;
    if (vazio) {
      sr.querySelector('small').textContent = this.h.vistas.length
        ? `vista ${(VISTAS.find(([k]) => k === this.vista) || ['', ''])[1].toLowerCase()} não registrada no acervo`
        : 'nenhuma imagem oficial deste veículo no acervo';
      this.slot.definir(null);
    } else {
      const antes = this.slot.a;
      const nova = { chave: vis.img, painel: !!this.h.painel, alinhar: 'base' };
      if (antes && antes.chave !== nova.chave) {
        this.slot.definir(antes, nova);
        this.troca = { t: 0, dur: 0.45 };
      } else this.slot.definir(nova);
    }
    this.slot.glitch = glitch;
    this.feixeT = 0;
    this.pontos = (vis && PONTOS[`${this.v.id}:${this.vd.id}:${vis.id}`]) || {};
    this.montarHotspots();
    this.cache = {};
  }

  montarHotspots() {
    const ks = Object.keys(this.vd.textos).filter((k) => this.pontos[k]);
    this.hsCamada.innerHTML = ks.map((k) => `<button type="button" class="hotspot" data-hs="${k}" aria-label="${this.rotulos[k]}">
      <span class="hs-anel"></span><span class="hs-ponto"></span><span class="hs-rotulo">${this.rotulos[k]}</span></button>`).join('');
  }

  limparHotspot() {
    for (const x of this.hsCamada.children) x.classList.remove('ativo');
  }

  definirModo(m) {
    this.slot.modo = m;
    this.slot.cor = m === 'wire' ? VERDE : CIANO;
    this.slot.glitch = 0.6;
    this.feixeT = 0;
    this.cache.esquema = null;
  }

  // chama no bocal da turbina quando há ponto de turbina nesta vista; sem ele, o motor vibra em marcha lenta
  ignicao(on, silencioso = false) {
    this.aceso = on;
    const p = this.pontos && this.pontos.turbina;
    const temChama = on && p && this.pontos.jato !== undefined && this.vd.textos.turbina;
    this.chama.hidden = !temChama;
    if (temChama) this.chama.style.transform = `rotate(${this.pontos.jato}deg)`;
    this.slot.tremor = on ? 1 : 0;
    if (on && !silencioso) this.slot.glitch = 0.4;
    return !!temChama;
  }

  cockpit(on) {
    const p = this.pontos.cockpit;
    if (!on || !p) {
      this.zoomAlvo = [0.5, 0.5, 1];
      return;
    }
    // centro do zoom em coordenadas do slot (origem embaixo)
    const q = this.slot.pontoNaImagem(p[0], p[1]);
    this.zoomAlvo = q ? [q.x / 100, 1 - q.y / 100, 2.3] : [0.5, 0.5, 2];
  }

  transformar(vdNovo) {
    this.vd = vdNovo;
    this.h = HOLOS.veiculos[`${this.v.id}:${vdNovo.id}`] || { vistas: [], fonte: '' };
    const ids = this.h.vistas.map((x) => x.id);
    if (!ids.includes(this.vista)) this.vista = PADRAO.find((id) => ids.includes(id)) || null;
    this.renderVistas();
    this.aplicarVista(1);
    if (this.troca) this.troca.dur = 1.1;
    $('#fonte-palco').textContent = `FONTE: ${this.h.fonte.toUpperCase()}`;
  }

  chavesPlanta() {
    return ORDEM_FOLHAS_VEIC.filter((k) => this.vd.textos[k]);
  }

  folhaHtml(k, i, total) {
    return `<figure class="cad-folha p${i}" data-folha="${k}" tabindex="0"><figcaption>${TITULO_FOLHA_VEIC[k]}</figcaption>
      ${plantaVeiculo(k, this.tipo, this.vd.modelo, this.v.id, i + 1, total)}</figure>`;
  }

  abrirPlanta() {
    const ks = this.chavesPlanta();
    this.planta = ks;
    this.folhas.innerHTML = ks.map((k, i) => this.folhaHtml(k, i, ks.length)).join('');
    this.folhas.classList.toggle('cinco', ks.length > 4);
    this.raiz.classList.add('planta');
    document.body.classList.add('em-planta');
    this.folhas.classList.add('visivel');
    this.cache.guias = null;
  }

  // uma prancha só, aberta pelo ponto de inspeção
  folhaUnica(k) {
    if (!this.vd.textos[k] || !ORDEM_FOLHAS_VEIC.includes(k)) return false;
    this.planta = [k];
    this.folhas.innerHTML = this.folhaHtml(k, 0, 1).replace('cad-folha p0', `cad-folha unica ${this.lado(k)}`);
    this.raiz.classList.remove('planta');
    document.body.classList.remove('em-planta');
    this.folhas.classList.add('visivel');
    this.cache.guias = null;
    return true;
  }

  lado(k) {
    const p = this.pontos[k];
    return p && p[0] > 0.5 ? 'esq' : 'dir';
  }

  fecharPlanta() {
    this.planta = [];
    this.folhas.innerHTML = '';
    this.folhas.classList.remove('visivel');
    this.raiz.classList.remove('planta');
    document.body.classList.remove('em-planta');
    if (this.guiasHtml) {
      this.guiasHtml = '';
      this.guias.innerHTML = '';
    }
  }

  get plantaAberta() {
    return this.planta.length > 1;
  }

  quadro(dt) {
    if (!this.ativo) return;
    const s = this.slot;
    s.glitch *= 0.9;
    if (this.troca) {
      this.troca.t += dt / this.troca.dur;
      const k = Math.min(1, this.troca.t);
      s.mix = k * k * (3 - 2 * k);
      s.glitch = Math.max(s.glitch, Math.sin(k * Math.PI) * (this.troca.dur > 1 ? 1 : 0.6));
      if (k >= 1) {
        s.definir(s.b);
        s.mix = 0;
        this.troca = null;
      }
    }
    if (this.feixeT >= 0) {
      this.feixeT += dt * 1.4;
      s.feixe = 1.1 - this.feixeT * 1.3;
      if (s.feixe < -0.05) {
        s.feixe = -1;
        this.feixeT = -1;
      }
    }
    for (let i = 0; i < 3; i += 1) s.zoom[i] += (this.zoomAlvo[i] - s.zoom[i]) * Math.min(1, dt * 4);
    this.posicionar();
  }

  posicionar() {
    const pontos = {};
    for (const [k, p] of Object.entries(this.pontos || {})) {
      if (Array.isArray(p)) {
        const q = this.slot.pontoNaImagem(p[0], p[1]);
        if (q) pontos[k] = q;
      }
    }
    const zoom = this.slot.zoom[2] > 1.05;
    this.hsCamada.classList.toggle('oculto', zoom || !!this.troca);
    for (const b of this.hsCamada.children) {
      const q = pontos[b.dataset.hs];
      if (!q) continue;
      const pos = `${q.x.toFixed(2)},${q.y.toFixed(2)}`;
      if (b.dataset.pos !== pos) {
        b.dataset.pos = pos;
        b.style.left = `${q.x}%`;
        b.style.top = `${q.y}%`;
      }
    }
    if (!this.chama.hidden && pontos.turbina) {
      const pos = `${pontos.turbina.x.toFixed(2)},${pontos.turbina.y.toFixed(2)}`;
      if (this.chama.dataset.pos !== pos) {
        this.chama.dataset.pos = pos;
        this.chama.style.left = `${pontos.turbina.x}%`;
        this.chama.style.top = `${pontos.turbina.y}%`;
      }
    }
    this.desenharEsquema(pontos);
    this.desenharGuias(pontos);
  }

  // esquema interno do raio-x (interpretação): cubos e eixos nas rodas, trem de força, motor e tanque
  desenharEsquema(pt) {
    if (document.body.dataset.modo !== 'xray' || this.troca || this.slot.zoom[2] > 1.05) {
      if (this.cache.esquema) {
        this.cache.esquema = '';
        this.esquema.innerHTML = '';
      }
      return;
    }
    const area = this.esquema.getBoundingClientRect();
    if (!area.width) return;
    const loc = (q) => (q ? [q.px - area.left, q.py - area.top] : null);
    const r = area.height * 0.07;
    const R = loc(pt.rodas);
    const R2 = loc(pt.rodas2);
    const C = loc(pt.cockpit);
    const T = loc(pt.turbina);
    const f = (n) => n.toFixed(1);
    let s = '';
    const rotulo = (x, y, t) => `<text x="${f(x)}" y="${f(y)}" class="xr-t">${t}</text>`;
    for (const w of [R, R2]) {
      if (!w) continue;
      s += `<circle cx="${f(w[0])}" cy="${f(w[1])}" r="${f(r)}" class="xr-l"/><circle cx="${f(w[0])}" cy="${f(w[1])}" r="${f(r * 0.35)}" class="xr-b"/>`;
      for (let i = 0; i < 6; i += 1) {
        const a = (i / 6) * Math.PI * 2;
        s += `<path d="M${f(w[0] + Math.cos(a) * r * 0.35)},${f(w[1] + Math.sin(a) * r * 0.35)}L${f(w[0] + Math.cos(a) * r)},${f(w[1] + Math.sin(a) * r)}" class="xr-l"/>`;
      }
    }
    if (R) s += rotulo(R[0] + r + 4, R[1] + r, 'CUBO E EIXO');
    if (R && R2) s += `<path d="M${f(R[0])},${f(R[1])}L${f(R2[0])},${f(R2[1])}" class="xr-d"/>${rotulo((R[0] + R2[0]) / 2, (R[1] + R2[1]) / 2 - 6, 'TREM DE FORÇA')}`;
    const mot = T || R2;
    if (mot && C) {
      const mx = C[0] + (mot[0] - C[0]) * 0.62;
      const my = C[1] + (mot[1] - C[1]) * 0.62 + r * 0.4;
      s += `<rect x="${f(mx - r * 1.1)}" y="${f(my - r * 0.6)}" width="${f(r * 2.2)}" height="${f(r * 1.2)}" rx="3" class="xr-b"/>${rotulo(mx - r * 1.1, my - r * 0.8, this.tipo === 'lego' ? 'MOTOR EM PEÇAS' : 'MOTOR')}`;
      const tx = C[0] + (mot[0] - C[0]) * 0.3;
      const ty = C[1] + (mot[1] - C[1]) * 0.3 + r * 0.9;
      s += `<rect x="${f(tx - r * 0.9)}" y="${f(ty - r * 0.32)}" width="${f(r * 1.8)}" height="${f(r * 0.64)}" rx="${f(r * 0.32)}" class="xr-l"/>${rotulo(tx - r * 0.9, ty + r * 0.9, 'TANQUE')}`;
      s += `<path d="M${f(mx)},${f(my)}L${f(mot[0])},${f(mot[1])}" class="xr-d"/>`;
    }
    if (C) s += `<circle cx="${f(C[0])}" cy="${f(C[1])}" r="${f(r * 0.6)}" class="xr-l"/>${rotulo(C[0] + r * 0.8, C[1] - r * 0.6, 'CÉLULA DO PILOTO')}`;
    if (s) s += `<text x="4" y="${f(area.height - 6)}" class="xr-cab">ESQUEMA INTERNO · INTERPRETAÇÃO WAYNE TECH, SEM PLANTA OFICIAL</text>`;
    if (s !== this.cache.esquema) {
      this.cache.esquema = s;
      this.esquema.innerHTML = s;
    }
  }

  desenharGuias(pt) {
    if (!this.planta.length) return;
    const pr = this.guias.getBoundingClientRect();
    const area = this.slot.el.getBoundingClientRect();
    let s = '';
    for (const fo of this.folhas.children) {
      const k = fo.dataset.folha;
      const r = fo.getBoundingClientRect();
      if (!r.width) continue;
      const q = pt[k] || pt.blindagem;
      const hx = (q ? q.px : area.left + area.width / 2) - pr.left;
      const hy = (q ? q.py : area.top + area.height / 2) - pr.top;
      const topo = r.top - pr.top;
      const base = r.bottom - pr.top;
      let d;
      if (base < hy || topo > hy) {
        // prancha acima ou abaixo do ponto: a guia sai da borda voltada para o veículo
        const acima = base < hy;
        const fx = Math.min(Math.max(hx, r.left - pr.left + 14), r.right - pr.left - 14);
        const fy = acima ? base : topo;
        d = `M${fx.toFixed(1)},${fy.toFixed(1)}V${(fy + (acima ? 12 : -12)).toFixed(1)}L${hx.toFixed(1)},${hy.toFixed(1)}`;
      } else {
        const esq = r.left + r.width / 2 - pr.left < hx;
        const fx = (esq ? r.right : r.left) - pr.left;
        const fy = Math.min(Math.max(hy, topo + 14), base - 14);
        d = `M${fx.toFixed(1)},${fy.toFixed(1)}H${(fx + (esq ? 16 : -16)).toFixed(1)}L${hx.toFixed(1)},${hy.toFixed(1)}`;
      }
      s += `<path d="${d}" class="guia ativa"/><circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="3" class="guia-no ativa"/>`;
    }
    if (s !== this.guiasHtml) {
      this.guiasHtml = s;
      this.guias.innerHTML = s;
    }
  }
}
