# -*- coding: utf-8 -*-
"""Gera o acervo holográfico 2.5D: recortes sem fundo (rembg) de cada ângulo de traje, do rosto sem máscara,
dos closes de capuz e das vistas de cada veículo, com caixas de cabeça e hotspots calculados pela silhueta.

Fontes: turnarounds de figuras e estátuas licenciadas e artes oficiais em novas/turnaround/ (origem em
novas/_origem_downloads.json); o que não tiver turnaround usa a imagem canônica do acervo (processar_assets.py).
Saída: assets/holo_*.webp (RGBA) e assets/holos.json, lido pelo build.
Uso: python tools/processar_holos.py [--refazer]   (requer: pip install "rembg[cpu]")
"""
import importlib.util
import json
import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

sys.stdout.reconfigure(encoding="utf-8")
RAIZ = Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "assets"
T = "novas/turnaround/"

# Turnarounds por variante: (ângulo, origem, recorte l t r b ou None). A ordem é a do giro da figura.
TURN = {
    "v01:1992": {"fonte": "Figura Mondo 1/6 licenciada (Batman: The Animated Series)", "angulos": [
        ("frente", T + "v01_1992_frente.jpg", None), ("34", T + "v01_1992_34.jpg", None), ("perfil", T + "v01_1992_perfil.jpg", None),
        ("34costas", T + "v01_1992_34costas.jpg", None), ("costas", T + "v01_1992_costas.jpg", None),
        ("34costas2", T + "v01_1992_34costas2.jpg", None), ("perfil2", T + "v01_1992_perfil2.jpg", None), ("342", T + "v01_1992_342.jpg", None)],
        "capuz": (T + "v01_capuz.jpg", (0.22, 0.0, 0.78, 0.62)), "rosto": (T + "v01_rosto.jpg", (0.12, 0.0, 0.88, 0.7))},
    "v02:begins": {"fonte": "Figura Hot Toys 1/6 licenciada (Batman Begins)", "angulos": [
        ("frente", T + "v02_begins_frente.jpg", (0.1, 0.05, 0.9, 0.93)), ("34", T + "v02_begins_34.jpg", (0.0, 0.05, 1.0, 0.93)),
        ("perfil", T + "v02_begins_perfil.jpg", (0.1, 0.05, 0.9, 0.93))],
        "capuz": (T + "v02_capuz.jpg", (0.0, 0.3, 1.0, 0.72)), "rosto": (T + "v02_rosto.jpg", (0.05, 0.05, 0.95, 0.93))},
    "v02:tdk": {"fonte": "Figura McFarlane licenciada (Trilogia O Cavaleiro das Trevas)", "angulos": [
        ("frente", T + "v02_tdk_frente.jpg", (0.02, 0.08, 0.46, 0.92))], "rosto": (T + "v02_rosto.jpg", (0.05, 0.05, 0.95, 0.93))},
    "v03:nano": {"fonte": "Figura Mondo 1/6 licenciada (Batman Beyond)", "angulos": [
        ("frente", T + "v03_nano_frente.gif", None), ("34", T + "v03_nano_34.jpg", None), ("perfil", T + "v03_nano_perfil.jpg", None)],
        "rosto": (T + "v03_rosto.jpg", (0.3, 0.0, 0.72, 0.36))},
    "v04:cinza": {"fonte": "Figura McFarlane licenciada (The Dark Knight Returns)", "angulos": [
        ("frente", T + "v04_cinza_frente.jpg", None), ("34", T + "v04_cinza_34.jpg", None), ("costas", T + "v04_cinza_costas.jpg", None)],
        "capuz": (T + "v04_capuz.jpg", (0.3, 0.0, 0.7, 0.4))},
    "v05:knight": {"fonte": "Figura McFarlane licenciada (Batman: Arkham Knight)", "angulos": [
        ("frente", T + "v05_knight_frente.jpg", (0.0, 0.08, 0.55, 0.98)), ("34", T + "v05_knight_34.jpg", None), ("perfil", T + "v05_knight_perfil.jpg", None),
        ("costas", T + "v05_knight_costas.jpg", None), ("perfil2", T + "v05_knight_perfil2.jpg", None)],
        "capuz": (T + "v05_capuz.jpg", (0.28, 0.06, 0.72, 0.46))},
    "v06:padrao": {"fonte": "Estátua Iron Studios 1:10 licenciada (Absolute Batman)", "angulos": [
        ("frente", T + "v06_padrao_frente.jpg", (0.1, 0.02, 0.9, 0.84)), ("34", T + "v06_padrao_34.jpg", (0.05, 0.02, 0.95, 0.84)),
        ("costas", T + "v06_padrao_costas.jpg", (0.05, 0.02, 0.95, 0.84)), ("342", T + "v06_padrao_342.jpg", (0.05, 0.02, 0.95, 0.84))],
        "capuz": (T + "v06_capuz.jpg", (0.1, 0.0, 0.8, 0.65))},
    "v07:padrao": {"fonte": "Figura McFarlane licenciada (Os Novos 52)", "angulos": [
        ("frente", T + "v07_padrao_frente.jpg", None), ("34", T + "v07_padrao_34.jpg", None), ("costas", T + "v07_padrao_costas.jpg", None)],
        "capuz": (T + "v07_capuz.jpg", (0.28, 0.0, 0.72, 0.42))},
    "v10:flashpoint": {"fonte": "Ficha de design oficial de Andy Kubert (DC Comics, 2010)", "angulos": [
        ("frente", T + "v10_ficha_design.webp", (0.3, 0.1, 0.62, 0.6)), ("costas", T + "v10_ficha_design.webp", (0.58, 0.42, 0.93, 0.74))],
        "capuz": (T + "v10_ficha_design.webp", (0.76, 0.72, 0.99, 0.885)),
        "rosto": (T + "v10_rosto_figura.jpg", (0.3, 0.12, 0.62, 0.4))},
    "v11:azbat": {"fonte": "Figura McFarlane licenciada (Azrael com a armadura do Batman)", "angulos": [
        ("frente", T + "v11_azbat_frente.jpg", None), ("34", T + "v11_azbat_34.jpg", None), ("costas", T + "v11_azbat_costas.jpg", None)],
        "capuz": (T + "v11_capuz.jpg", (0.3, 0.0, 0.7, 0.42))},
}

# Vistas extras de veículos: (vista, origem, recorte). A vista da imagem do acervo entra como 3/4 quando não houver outra.
VEIC = {
    "v05:perseguicao": {"fonte": "Capturas de Batman: Arkham Knight (Arkham Wiki)", "vistas": [
        ("lateral", T + "v05_veic_lateral.webp", None), ("frontal", T + "v05_veic_frente.webp", None)]},
    "v05:batalha": {"fonte": "Capturas de Batman: Arkham Knight (Arkham Wiki)", "vistas": [
        ("traseira", T + "v05_veic_tanque_traseira.webp", (0.0, 0.25, 1.0, 1.0))]},
    "v02:tumbler": {"fonte": "Figura Hot Toys 1/6 licenciada (O Cavaleiro das Trevas)", "vistas": [
        ("34", T + "v02_tumbler_34.jpg", (0.0, 0.22, 1.0, 0.72))]},
    "v01:btas": {"fonte": "Batman: The Animated Series (DCAU Wiki e Batman Wiki)", "vistas": [
        ("traseira", "novas/ref_btas_lateral.webp", None)]},
}

# Imagens de quadrinho ou de cena com fundo carregado: o recorte automático quebra a figura, então elas entram
# inteiras como painel holográfico retangular (borda esfumada), sem remoção de fundo.
PAINEL = {"v01_tnba", "v03_exo", "v04_armadura", "v07_hush", "v07_thrasher", "v07_buster", "v09_duelo", "v10_queda",
          "v10_duelo", "v11_garras", "v01_tnba_veic", "v03_beyond_veic", "v04_tanque_veic", "v06_absoluto_veic",
          "v08_pesado_veic", "v10_batmoto_veic"}

# Vista real da imagem do acervo, quando não for 3/4.
VISTA_ACERVO = {"v01:tnba": "frontal"}

ROTULOS_ANG = {"frente": "FRENTE", "34": "3/4", "perfil": "PERFIL", "34costas": "3/4 COSTAS", "costas": "COSTAS",
               "34costas2": "3/4 COSTAS", "perfil2": "PERFIL", "342": "3/4"}


def carregar_slots():
    spec = importlib.util.spec_from_file_location("pa", RAIZ / "tools" / "processar_assets.py")
    pa = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(pa)
    return {s[0]: s for s in pa.SLOTS}


def ler_versoes():
    src = (RAIZ / "src" / "data" / "versoes.js").read_text(encoding="utf-8")
    blocos = re.split(r"\n  \{\n    id: '", src)[1:]
    out = []
    for b in blocos:
        vid = b[:3]
        trajes = re.findall(r"traje\('(\w+)', '[^']*', '(\w+)'", b)
        veics = re.findall(r"\{ id: '(\w+)', nome: '([^']*)', img: '(\w+)'", b)
        rosto = re.search(r"rosto: '(\w+)'", b)
        out.append({"id": vid, "trajes": trajes, "veiculos": veics, "rosto": rosto.group(1) if rosto else None})
    return out


def abrir(origem, recorte):
    im = Image.open(RAIZ / origem)
    im.seek(0)
    im = im.convert("RGBA")
    if isinstance(recorte, tuple) and len(recorte) == 4:
        w, h = im.size
        l, t, r, b = recorte
        im = im.crop((int(l * w), int(t * h), int(r * w), int(b * h)))
    return im


def mascara(sessao, im, remove):
    a = np.asarray(remove(im, session=sessao, only_mask=True), dtype=np.float32) / 255.0
    solido = ndimage.binary_fill_holes(ndimage.binary_closing(a > 0.35, iterations=2))
    rot, n = ndimage.label(solido)
    if n > 1:
        tamanhos = ndimage.sum(solido, rot, range(1, n + 1))
        maior = tamanhos.max()
        manter = [i + 1 for i, s in enumerate(tamanhos) if s >= maior * 0.08]
        solido = np.isin(rot, manter)
    a = np.where(solido, np.maximum(a, 0.9), 0)
    return Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))


def aparar(rgba, margem=0.015):
    a = np.asarray(rgba.getchannel("A"))
    ys, xs = np.where(a > 40)
    if not len(xs):
        return rgba
    w, h = rgba.size
    m = int(max(w, h) * margem)
    return rgba.crop((max(0, xs.min() - m), max(0, ys.min() - m), min(w, xs.max() + m + 1), min(h, ys.max() + m + 1)))


def ajustar(rgba, alvo_h=None, alvo_w=None):
    w, h = rgba.size
    k = (alvo_h / h) if alvo_h else (alvo_w / w)
    k = min(k, 1.6)
    return rgba.resize((max(1, int(w * k)), max(1, int(h * k))), Image.LANCZOS)


def painel(im):
    """Painel retangular com alfa esfumado nas bordas (4% do menor lado) e cantos arredondados."""
    w, h = im.size
    b = max(4, int(min(w, h) * 0.04))
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    dx = np.minimum(xx, w - 1 - xx)
    dy = np.minimum(yy, h - 1 - yy)
    a = np.clip(np.minimum(dx, dy) / b, 0, 1)
    rgba = im.convert("RGBA")
    rgba.putalpha(Image.fromarray((a * 255).astype(np.uint8)))
    return rgba


def caixa_cabeca(rgba):
    """Caixa quadrada normalizada da cabeça: faixa superior da silhueta."""
    a = np.asarray(rgba.getchannel("A")) > 60
    h, w = a.shape
    ys = np.where(a.any(axis=1))[0]
    if not len(ys):
        return [0.3, 0, 0.4, 0.2]
    y0, y1 = ys.min(), ys.max()
    alt = y1 - y0
    faixa = a[y0 + int(alt * 0.03): y0 + int(alt * 0.11)]
    cols = np.where(faixa.any(axis=0))[0]
    cx = (cols.min() + cols.max()) / 2 if len(cols) else w / 2
    lado = alt * 0.17
    x = (cx - lado / 2) / w
    y = (y0 - alt * 0.01) / h
    return [round(max(0, x), 4), round(max(0, y), 4), round(lado / w, 4), round(lado / h, 4)]


def hotspots_traje(rgba):
    """Posições normalizadas dos pontos de inspeção, estimadas pela silhueta frontal."""
    a = np.asarray(rgba.getchannel("A")) > 60
    h, w = a.shape
    ys = np.where(a.any(axis=1))[0]
    y0, y1 = ys.min(), ys.max()
    alt = y1 - y0

    def faixa(fr):
        y = int(y0 + alt * fr)
        xs = np.where(a[y])[0]
        return y, (xs.min(), xs.max()) if len(xs) else (w * 0.3, w * 0.7)

    y, (xa, xb) = faixa(0.075)
    out = {"lentes": [(xa + xb) / 2 / w, y / h]}
    y, (xa, xb) = faixa(0.25)
    out["peitoral"] = [((xa + xb) / 2 + (xb - xa) * 0.12) / w, y / h]
    y, (xa, xb) = faixa(0.45)
    out["cinto"] = [(xa + xb) / 2 / w, y / h]
    y, (xa, xb) = faixa(0.5)
    out["luvas"] = [(xa + (xb - xa) * 0.06) / w, y / h]
    y, (xa, xb) = faixa(0.62)
    out["capa"] = [(xb - (xb - xa) * 0.06) / w, y / h]
    return {k: [round(float(v[0]), 4), round(float(v[1]), 4)] for k, v in out.items()}


def main():
    from rembg import new_session, remove

    sessao = new_session("isnet-general-use")
    slots = carregar_slots()
    versoes = ler_versoes()
    dados = {"trajes": {}, "veiculos": {}}
    gerados = []

    def gravar(chave, rgba):
        destino = SAIDA / f"holo_{chave}.webp"
        rgba.save(destino, "WEBP", quality=80, method=6)
        gerados.append({"chave": f"holo_{chave}", "tipo": "holo", "bytes": destino.stat().st_size})
        return f"holo_{chave}"

    def processar(origem, recorte, chave, alvo_h=None, alvo_w=None, como_painel=False):
        destino = SAIDA / f"holo_{chave}.webp"
        if como_painel:
            return gravar(chave, ajustar(painel(abrir(origem, recorte)), alvo_h, alvo_w)), None
        # recortes já gerados são reaproveitados; use --refazer para regenerar tudo
        if destino.exists() and "--refazer" not in sys.argv:
            im = Image.open(destino).convert("RGBA")
            gerados.append({"chave": f"holo_{chave}", "tipo": "holo", "bytes": destino.stat().st_size})
            return f"holo_{chave}", im
        im = abrir(origem, recorte)
        im.putalpha(mascara(sessao, im, remove))
        im = ajustar(aparar(im), alvo_h, alvo_w)
        return gravar(chave, im), im

    def origem_do_slot(img):
        s = slots.get(img)
        return (s[2], s[3]) if s and s[2] else (None, None)

    for v in versoes:
        vid = v["id"]
        rosto_padrao = origem_do_slot(v["rosto"]) if v["rosto"] else (None, None)
        for tid, img in v["trajes"]:
            chave = f"{vid}:{tid}"
            spec = TURN.get(chave)
            angulos = spec["angulos"] if spec else []
            if not angulos:
                o, r = origem_do_slot(img)
                if not o:
                    continue
                angulos = [("frente", o, r)]
            reg = {"fonte": spec["fonte"] if spec else "Imagem canônica do acervo", "angulos": []}
            e_painel = f"{vid}_{tid}" in PAINEL
            if e_painel:
                reg["painel"] = True
            for aid, o, r in angulos:
                nome, im = processar(o, r, f"{vid}_{tid}_{aid}", alvo_h=1000, como_painel=e_painel)
                if im is None:
                    im = Image.open(SAIDA / f"{nome}.webp")
                item = {"id": aid, "rotulo": ROTULOS_ANG.get(aid, aid.upper()), "img": nome, "asp": round(im.width / im.height, 4)}
                if not e_painel:
                    item["cabeca"] = caixa_cabeca(im)
                    if aid == "frente":
                        item["hs"] = hotspots_traje(im)
                reg["angulos"].append(item)
            for campo in ("capuz", "capuzPerfil"):
                if spec and spec.get(campo):
                    nome, im = processar(*spec[campo], f"{vid}_{tid}_{campo}", alvo_h=520)
                    reg[campo] = {"img": nome, "asp": round(im.width / im.height, 4)}
            fonte_rosto = spec.get("rosto") if spec else None
            if not fonte_rosto and rosto_padrao[0]:
                fonte_rosto = rosto_padrao
            if fonte_rosto:
                chave_r = f"{vid}_rosto" if not (spec and spec.get("rosto")) else f"{vid}_{tid}_rosto"
                if not any(g["chave"] == f"holo_{chave_r}" for g in gerados):
                    nome, im = processar(*fonte_rosto, chave_r, alvo_h=800)
                    asp = round(im.width / im.height, 4)
                else:
                    nome = f"holo_{chave_r}"
                    asp = next(x for t in dados["trajes"].values() for x in [t.get("rosto")] if x and x["img"] == nome)["asp"]
                reg["rosto"] = {"img": nome, "asp": asp}
            dados["trajes"][chave] = reg
            print(f"traje {chave:18} {len(reg['angulos'])} ângulo(s)")
        for veid, _nome, img in v["veiculos"]:
            chave = f"{vid}:{veid}"
            spec = VEIC.get(chave)
            vistas = []
            o, r = origem_do_slot(img)
            if o:
                vis = VISTA_ACERVO.get(chave, "34")
                vistas.append((vis if not spec or not any(x[0] == vis for x in spec["vistas"]) else "acervo", o, r))
            if spec:
                vistas += spec["vistas"]
            reg = {"fonte": spec["fonte"] if spec else "Imagem canônica do acervo", "vistas": []}
            e_painel = f"{vid}_{veid}_veic" in PAINEL
            if e_painel:
                reg["painel"] = True
            for vis, o2, r2 in vistas:
                nome, im = processar(o2, r2, f"{vid}_{veid}_{vis}", alvo_w=1400, como_painel=e_painel)
                if im is None:
                    im = Image.open(SAIDA / f"{nome}.webp")
                reg["vistas"].append({"id": vis, "img": nome, "asp": round(im.width / im.height, 4)})
            dados["veiculos"][chave] = reg
            print(f"veículo {chave:18} {len(reg['vistas'])} vista(s)")

    (SAIDA / "holos.json").write_text(json.dumps(dados, ensure_ascii=False, indent=1), encoding="utf-8")
    (SAIDA / "holos_manifest.json").write_text(json.dumps(gerados, ensure_ascii=False, indent=1), encoding="utf-8")
    print(len(gerados), "imagens,", sum(g["bytes"] for g in gerados) // 1024, "KB")


if __name__ == "__main__":
    main()
