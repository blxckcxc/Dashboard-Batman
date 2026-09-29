// Vault 2.5D: turnaround em três pedestais com a arte oficial (costas, frente e perfil). Arrastar a figura
// central percorre os ângulos reais do acervo com cintilação e feixe de varredura; o capuz aparece em três
// vistas (frente, 3/4 e perfil) e "Remover máscara" dissolve o traje no rosto canônico.
import { HOLOS } from '../_gerado/holos.js';
import { ASSETS } from '../_gerado/assets.js';
import { FOLHA_DO_HOTSPOT } from '../ui/plantas.js';

const $ = (s) => document.querySelector(s);
const CIANO = [0.36, 0.86, 1.0];
const suave = (x) => x * x * (3 - 2 * x);

function caixa(c) {
  const [x, y, w, h] = c;
  const x0 = Math.max(0, x);
  const y0 = Math.max(0, y);
  return [x0, y0, Math.min(1 - x0, w), Math.min(1 - y0, h)];
}

export class Vault {
  constructor(app, motor) {
    this.app = app;
    this.motor = motor;
    this.raiz = $('#vault');
    // os pedestais laterais ficam atrás: são desenhados antes da figura central
    this.lados = {
      esq: { slot: motor.slot($('#ped-esq .ped-slot'), { cor: CIANO, alfa: 0.9 }), el: $('#ped-esq') },
      dir: { slot: motor.slot($('#ped-dir .ped-slot'), { cor: CIANO, alfa: 0.9 }), el: $('#ped-dir') },
    };
    this.central = motor.slot($('#slot-central'), { cor: CIANO });
    this.capuz = [...document.querySelectorAll('.capuz-v')].map((el) => ({ el, slot: motor.slot(el.querySelector('.capuz-slot'), { cor: CIANO }) }));
    this.hsCamada = $('#hs-traje');
    this.guias = $('#guias');
    this.pos = 0;
    this.alvo = 0;
    this.vel = 0;
    this.arrastando = false;
    this.feixeT = -1;
    this.diss = null;
    this.etapa = 'traje';
    this.ativo = false;
    this.rotuloAtual = '';
    this.arrastar();
    for (const b of document.querySelectorAll('[data-giro]')) b.addEventListener('click', () => this.girar(Number(b.dataset.giro)));
    $('#slot-central').addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.stopPropagation();
        e.preventDefault();
        this.girar(e.key === 'ArrowRight' ? 1 : -1);
      }
    });
    motor.tarefas.add((dt) => this.quadro(dt));
  }

  set visivel(v) {
    this.ativo = v;
    for (const s of [this.central, this.lados.esq.slot, this.lados.dir.slot, ...this.capuz.map((c) => c.slot)]) s.ativo = v;
    if (!v) {
      this.guiasHtml = '';
      this.guias.innerHTML = '';
    }
  }

  camada(ang) {
    return { chave: ang.img, painel: this.painel, alinhar: 'base' };
  }

  mostrar(v, t) {
    const h = HOLOS.trajes[`${v.id}:${t.id}`];
    this.v = v;
    this.t = t;
    this.h = h;
    this.painel = !!(h && h.painel);
    this.angs = h && h.angulos.length ? h.angulos : [{ id: 'frente', rotulo: 'FRENTE', img: t.img }];
    if (!h) this.painel = true;
    this.ciclico = this.angs.length >= 3 && this.angs.some((a) => a.id.includes('costas'));
    this.pos = 0;
    this.alvo = 0;
    this.etapa = 'traje';
    this.diss = null;
    const c = this.central;
    c.definir(this.camada(this.angs[0]));
    c.mix = 0;
    c.diss = 0;
    this.motor.preparar(this.angs.map((a) => a.img));
    this.lado(this.lados.esq, ['costas', '34costas', '34costas2'], 'costas');
    this.lado(this.lados.dir, ['perfil', 'perfil2', '34', '342'], 'perfil');
    this.vistasCapuz();
    this.montarHotspots();
    $('#fonte-palco').textContent = `FONTE: ${(h ? h.fonte : 'Imagem canônica do acervo').toUpperCase()}`;
    $('#slot-central').classList.toggle('unico', this.angs.length < 2);
    this.rotuloAtual = '';
    this.atualizarRotulo();
    this.transicao(0.8);
  }

  lado(l, ordem, nome) {
    const ang = ordem.map((id) => this.angs.find((a) => a.id === id)).find(Boolean);
    l.el.querySelector('.sem-ref').hidden = !!ang;
    l.el.querySelector('.ped-rot').textContent = ang ? ang.rotulo : nome.toUpperCase();
    l.el.querySelector('.sem-ref small').textContent = `ângulo de ${nome} não registrado no acervo`;
    l.slot.definir(ang ? { ...this.camada(ang), escala: 0.8 } : null);
    l.slot.glitch = 0.6;
    l.el.classList.toggle('vazio', !ang);
  }

  vistasCapuz() {
    const h = this.h || {};
    const achar = (ids) => ids.map((id) => this.angs.find((a) => a.id === id && a.cabeca)).find(Boolean);
    const recorte = (ang) => (ang ? { chave: ang.img, sub: caixa(ang.cabeca), alinhar: 'centro' } : null);
    const frente = h.capuz ? { chave: h.capuz.img, alinhar: 'centro' } : recorte(achar(['frente']));
    const tres = recorte(achar(['34', '342']));
    const perfil = h.capuzPerfil ? { chave: h.capuzPerfil.img, alinhar: 'centro' } : recorte(achar(['perfil', 'perfil2']));
    [frente, tres, perfil].forEach((cam, i) => {
      const v = this.capuz[i];
      v.slot.definir(cam);
      v.slot.mix = 0;
      v.slot.diss = 0;
      v.slot.glitch = 0.5;
      v.el.querySelector('.sem-ref').hidden = !!cam;
    });
    this.capuzFrente = frente;
  }

  pontosHotspot() {
    const frente = this.angs.find((a) => a.id === 'frente');
    if (frente && frente.hs) return frente.hs;
    // painéis e imagens sem silhueta: posições do layout da variante (x e y de -0.5 a 0.5)
    const out = {};
    for (const h of this.t.hotspots) out[h.id] = [0.5 + h.x, 0.5 - h.y];
    return out;
  }

  montarHotspots() {
    const pos = this.pontosHotspot();
    this.hs = this.t.hotspots.filter((h) => pos[h.id]).map((h) => ({ ...h, p: pos[h.id] }));
    this.hsCamada.innerHTML = this.hs.map((h) => `<button type="button" class="hotspot" data-hs="${h.id}" aria-label="${h.titulo}">
      <span class="hs-anel"></span><span class="hs-ponto"></span><span class="hs-rotulo">${h.titulo}</span></button>`).join('');
    this.hsCamada.onclick = (e) => {
      const b = e.target.closest('[data-hs]');
      if (!b) return;
      const h = this.hs.find((x) => x.id === b.dataset.hs);
      for (const x of this.hsCamada.children) x.classList.toggle('ativo', x === b);
      this.app.aoHotspot({ titulo: h.titulo, texto: h.texto, grupo: `TRAJE · ${this.t.nome.toUpperCase()}`, chave: h.id, folha: FOLHA_DO_HOTSPOT[h.id] });
    };
  }

  limparHotspot() {
    for (const x of this.hsCamada.children) x.classList.remove('ativo');
  }

  transicao(forca = 1) {
    this.feixeT = 0;
    this.central.glitch = Math.max(this.central.glitch, forca);
  }

  indice(p) {
    const n = this.angs.length;
    return ((Math.round(p) % n) + n) % n;
  }

  girar(d) {
    const n = this.angs.length;
    if (n < 2) {
      this.app.hud.toast('ÂNGULO ÚNICO NO ACERVO · SEM GIRO DISPONÍVEL');
      this.transicao(0.6);
      return;
    }
    if (this.etapa !== 'traje') return;
    let a = Math.round(this.alvo) + d;
    if (!this.ciclico) a = Math.max(0, Math.min(n - 1, a));
    this.alvo = a;
    this.app.sfx.clique();
  }

  arrastar() {
    const el = $('#slot-central');
    let x0 = 0;
    let p0 = 0;
    let ultimo = 0;
    el.addEventListener('pointerdown', (e) => {
      if (this.angs.length < 2 || this.etapa !== 'traje') return;
      this.arrastando = true;
      x0 = e.clientX;
      p0 = this.pos;
      ultimo = e.clientX;
      el.setPointerCapture(e.pointerId);
      el.classList.add('arrastando');
    });
    el.addEventListener('pointermove', (e) => {
      if (!this.arrastando) return;
      const n = this.angs.length;
      let p = p0 - (e.clientX - x0) / 120;
      if (!this.ciclico) {
        if (p < 0) p *= 0.25;
        if (p > n - 1) p = n - 1 + (p - (n - 1)) * 0.25;
      }
      this.vel = (ultimo - e.clientX) / 12;
      ultimo = e.clientX;
      this.pos = p;
    });
    const soltar = () => {
      if (!this.arrastando) return;
      this.arrastando = false;
      el.classList.remove('arrastando');
      const n = this.angs.length;
      let a = Math.round(this.pos + this.vel * 0.15);
      if (!this.ciclico) a = Math.max(0, Math.min(n - 1, a));
      this.alvo = a;
    };
    el.addEventListener('pointerup', soltar);
    el.addEventListener('pointercancel', soltar);
  }

  atualizarRotulo() {
    const ang = this.angs[this.indice(this.pos)];
    const r = this.etapa === 'traje' ? ang.rotulo : { rosto: 'IDENTIDADE', civil: 'TRAJE CIVIL', mentor: 'MENTOR' }[this.etapa];
    if (r === this.rotuloAtual) return;
    if (this.rotuloAtual && this.etapa === 'traje') this.transicao(0.5);
    this.rotuloAtual = r;
    $('#rot-central').textContent = r;
    $('#slot-central').setAttribute('aria-valuetext', r);
    const n = this.angs.length;
    $('#giro-marca').style.left = `${n > 1 ? (this.indice(this.pos) / (this.ciclico ? n : n - 1)) * 100 : 50}%`;
  }

  // sequência de identidades: traje, rosto, traje civil e mentor, conforme o acervo da versão
  etapas() {
    const id = this.v.identidade;
    const h = this.h || {};
    const lista = [{ rotulo: 'traje' }];
    if (h.rosto) lista.push({ rotulo: 'rosto', camada: { chave: h.rosto.img, alinhar: 'base', escala: 0.82 } });
    else if (id.rosto) lista.push({ rotulo: 'rosto', camada: { chave: id.rosto, painel: true, alinhar: 'base', escala: 0.82 } });
    if (id.civil) lista.push({ rotulo: 'civil', camada: { chave: id.civil, painel: true, alinhar: 'base' } });
    if (id.mentor) lista.push({ rotulo: 'mentor', camada: { chave: id.mentor, painel: true, alinhar: 'base' } });
    return lista;
  }

  proximaEtapa() {
    const e = this.etapas();
    const i = e.findIndex((x) => x.rotulo === this.etapa);
    return e[(i + 1) % e.length];
  }

  revelar() {
    const prox = this.proximaEtapa();
    const c = this.central;
    const atual = c.a;
    const alvo = prox.rotulo === 'traje' ? this.camada(this.angs[this.indice(this.pos)]) : prox.camada;
    if (!alvo) return prox.rotulo;
    this.motor.textura(alvo.chave);
    c.definir(atual, alvo);
    c.diss = 0.001;
    this.diss = { t: 0 };
    // a vista frontal do capuz acompanha a dissolução com o rosto
    const cf = this.capuz[0].slot;
    const rosto = this.etapas().find((x) => x.rotulo === 'rosto');
    if (rosto && this.capuzFrente) {
      const va = prox.rotulo === 'traje' ? { ...rosto.camada, alinhar: 'centro', escala: 1 } : this.capuzFrente;
      const vb = prox.rotulo === 'traje' ? this.capuzFrente : { ...rosto.camada, alinhar: 'centro', escala: 1 };
      if (prox.rotulo === 'traje' || this.etapa === 'traje') {
        cf.definir(va, vb);
        cf.diss = 0.001;
      }
    }
    this.etapa = prox.rotulo;
    this.hsCamada.classList.toggle('oculto', this.etapa !== 'traje');
    this.atualizarRotulo();
    return prox.rotulo;
  }

  rotuloRevelar() {
    const prox = this.proximaEtapa().rotulo;
    return { rosto: 'REMOVER MÁSCARA', civil: 'TRAJE CIVIL', mentor: 'MENTOR', traje: 'VESTIR TRAJE' }[prox];
  }

  definirModo(m) {
    for (const s of [this.central, this.lados.esq.slot, this.lados.dir.slot, ...this.capuz.map((x) => x.slot)]) {
      s.modo = m;
      s.glitch = Math.max(s.glitch, 0.5);
    }
    this.transicao(0.6);
  }

  quadro(dt) {
    if (!this.ativo) return;
    const c = this.central;
    const n = this.angs.length;
    // giro: posição contínua entre ângulos, com mola até o ângulo inteiro mais próximo
    if (!this.arrastando) {
      const d = this.alvo - this.pos;
      this.pos = Math.abs(d) < 0.002 ? this.alvo : this.pos + d * Math.min(1, dt * 9);
      this.vel *= 0.85;
    }
    if (n > 1 && this.etapa === 'traje' && !this.diss) {
      const i0 = Math.floor(this.pos);
      const fr = this.pos - i0;
      const idx = (i) => ((i % n) + n) % n;
      const a = this.angs[idx(i0)];
      const b = this.angs[idx(i0 + 1)];
      c.definir(this.camada(a), fr > 0.001 ? this.camada(b) : null);
      c.mix = suave(fr);
      c.glitch = Math.max(c.glitch * 0.9, Math.min(1, Math.abs(this.vel) * 0.3 + 4 * fr * (1 - fr) * 0.55));
      this.atualizarRotulo();
    } else {
      c.glitch *= 0.9;
    }
    // dissolução do traje para a identidade
    if (this.diss) {
      this.diss.t += dt / 1.2;
      const k = Math.min(1, this.diss.t);
      c.diss = Math.max(0.001, k);
      const cf = this.capuz[0].slot;
      if (cf.b) cf.diss = Math.max(0.001, k);
      if (k >= 1) {
        c.definir(c.b);
        c.diss = 0;
        if (cf.b) {
          cf.definir(cf.b);
          cf.diss = 0;
        }
        this.diss = null;
      }
    }
    // feixe rápido de varredura nas transições; depois volta ao feixe lento automático
    if (this.feixeT >= 0) {
      this.feixeT += dt * 1.6;
      c.feixe = 1.1 - this.feixeT * 1.3;
      if (c.feixe < -0.05) {
        c.feixe = -1;
        this.feixeT = -1;
      }
    }
    for (const s of [this.lados.esq.slot, this.lados.dir.slot, ...this.capuz.map((x) => x.slot)]) s.glitch *= 0.92;
    this.posicionarHotspots();
  }

  // hotspots e linhas-guia até as pranchas só com a figura parada de frente
  posicionarHotspots() {
    const frente = this.angs.findIndex((a) => a.id === 'frente');
    const parado = this.etapa === 'traje' && !this.diss && Math.abs(this.pos - Math.round(this.pos)) < 0.03 && this.indice(this.pos) === Math.max(0, frente);
    this.hsCamada.classList.toggle('oculto', !parado);
    if (!parado) {
      if (this.guiasHtml) {
        this.guiasHtml = '';
        this.guias.innerHTML = '';
      }
      return;
    }
    const pr = this.guias.getBoundingClientRect();
    let linhas = '';
    for (const b of this.hsCamada.children) {
      const h = this.hs.find((x) => x.id === b.dataset.hs);
      const p = h && this.central.pontoNaImagem(h.p[0], h.p[1]);
      if (!p) continue;
      const pos = `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
      if (b.dataset.pos !== pos) {
        b.dataset.pos = pos;
        b.style.left = `${p.x}%`;
        b.style.top = `${p.y}%`;
      }
      const folha = document.querySelector(`.estudo [data-folha="${FOLHA_DO_HOTSPOT[h.id]}"]`);
      if (!folha || folha.offsetParent === null || h.id === 'capa') continue;
      const r = folha.getBoundingClientRect();
      const esq = r.left < p.px;
      const fx = (esq ? r.right : r.left) - pr.left;
      const fy = r.top + r.height / 2 - pr.top;
      const hx = p.px - pr.left;
      const hy = p.py - pr.top;
      const cot = fx + (esq ? 18 : -18);
      const ativo = b.classList.contains('ativo') ? ' ativa' : '';
      linhas += `<path d="M${fx.toFixed(1)},${fy.toFixed(1)}H${cot.toFixed(1)}L${hx.toFixed(1)},${hy.toFixed(1)}" class="guia${ativo}"/><circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="2.5" class="guia-no${ativo}"/>`;
    }
    if (linhas !== this.guiasHtml) {
      this.guiasHtml = linhas;
      this.guias.innerHTML = linhas;
    }
  }
}
