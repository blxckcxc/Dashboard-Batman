# -*- coding: utf-8 -*-
"""Gera os 12 avatares biométricos do painel lateral (retrato 1:1 do busto, fundo chumbo e rim light).

Cada avatar parte de uma fonte do acervo, tem o fundo removido pelo rembg (modelo isnet-general-use),
é recortado num quadrado do peito até a ponta das orelhas e recomposto sobre o fundo tático padrão.
Saída: assets/avatar_vXX.webp (512x512) e assets/avatares.json, lido pelo build.
Uso: python tools/processar_avatares.py   (requer: pip install "rembg[cpu]")
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter
from scipy import ndimage

sys.stdout.reconfigure(encoding="utf-8")
RAIZ = Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "assets"
LADO = 512
AMBAR = (245, 158, 11)
CIANO = (56, 189, 248)

# (versão, origem, centro x do quadrado, topo do quadrado, lado do quadrado, opções) em frações da imagem de origem.
# O lado é fração da largura; o que passar da borda vira fundo. Opções:
#   apagar: retângulos (l, t, r, b) removidos da máscara, para restos de interface da fonte;
#   alfa_original: usa o canal alfa do próprio render em vez do rembg;
#   elipse: (cx, cy, rx, ry) no quadro final, limita a figura quando a arte tem fundo carregado.
AVATARES = [
    ("v01", "novas/av_v01.webp", 0.50, 0.00, 0.52, {}),
    ("v02", "novas/av_v02.webp", 0.56, 0.02, 0.66, {}),
    ("v03", "novas/av_v03.webp", 0.50, 0.00, 0.64, {}),
    ("v04", "novas/av_v04.webp", 0.47, 0.00, 0.56, {}),
    ("v05", "novas/av_v05.webp", 0.52, 0.00, 0.46, {"alfa_original": True}),
    ("v06", "AbsoBatmanRender2.webp", 0.50, 0.04, 0.52, {}),
    ("v07", "novas/av_v07.webp", 0.50, 0.30, 1.00, {}),
    ("v08", "novas/av_v08.webp", 0.51, 0.03, 0.36, {"apagar": [(0.08, 0.06, 0.46, 0.17)], "alfa_original": True}),
    ("v09", "baixadas/justice_lord_batman.png", 0.58, 0.06, 0.74, {}),
    ("v10", "novas/av_v10.webp", 0.50, 0.07, 0.49, {}),
    ("v11", "novas/v11_traje_azbat2.webp", 0.44, 0.13, 0.42, {"elipse": (0.5, 0.58, 0.5, 0.66)}),
    ("v12", "baixadas/lego_batman_rosto.png", 0.72, 0.12, 0.74, {}),
]


def elipse_suave(cx, cy, rx, ry):
    yy, xx = np.mgrid[0:LADO, 0:LADO].astype(np.float32) / LADO
    d = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)
    return np.clip((1.0 - d) / 0.45, 0, 1) ** 1.5


def mascara_robusta(alfa):
    """Fecha buracos internos e reforça áreas semitransparentes (traje escuro sobre fundo escuro)."""
    a = np.asarray(alfa, dtype=np.float32) / 255.0
    solido = a > 0.12
    solido = ndimage.binary_closing(solido, iterations=4)
    solido = ndimage.binary_fill_holes(solido)
    reforco = np.clip(a * 1.8, 0, 1)
    a = np.where(solido, np.maximum(reforco, 0.92), reforco * 0.5)
    return Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))


def recortar(img, cx, topo, lado):
    w, h = img.size
    s = int(lado * w)
    x0 = int(cx * w - s / 2)
    y0 = int(topo * h)
    tela = Image.new(img.mode, (s, s), (0, 0, 0, 0))
    tela.paste(img.crop((max(0, x0), max(0, y0), min(w, x0 + s), min(h, y0 + s))), (max(0, -x0), max(0, -y0)))
    return tela


def fundo_tatico():
    """Gradiente radial chumbo com grade hexagonal sutil e vinheta."""
    yy, xx = np.mgrid[0:LADO, 0:LADO].astype(np.float32)
    d = np.sqrt((xx - LADO * 0.5) ** 2 + (yy - LADO * 0.38) ** 2) / (LADO * 0.75)
    t = np.clip(d, 0, 1)[..., None]
    centro = np.array([26, 31, 39], np.float32)
    borda = np.array([7, 9, 13], np.float32)
    fundo = Image.fromarray((centro * (1 - t) + borda * t).astype(np.uint8), "RGB")
    grade = Image.new("RGBA", (LADO, LADO), (0, 0, 0, 0))
    g = ImageDraw.Draw(grade)
    r = 18
    for linha in range(-1, int(LADO / (r * 1.5)) + 2):
        for col in range(-1, int(LADO / (r * 1.732)) + 2):
            cx = col * r * 1.732 + (linha % 2) * r * 0.866
            cy = linha * r * 1.5
            pts = [(cx + r * np.cos(np.pi / 6 + k * np.pi / 3), cy + r * np.sin(np.pi / 6 + k * np.pi / 3)) for k in range(6)]
            g.polygon(pts, outline=(56, 189, 248, 14))
    fundo = fundo.convert("RGBA")
    fundo.alpha_composite(grade)
    return fundo


def rim_light(mascara, cor, forca):
    """Luz de contorno vinda do alto à direita, mais um halo externo discreto."""
    borda = ImageChops.subtract(mascara, ImageChops.offset(mascara, -7, 6)).filter(ImageFilter.GaussianBlur(3))
    halo = ImageChops.subtract(mascara.filter(ImageFilter.MaxFilter(5)), mascara).filter(ImageFilter.GaussianBlur(5))
    luz = np.clip(np.asarray(borda, np.float32) * forca + np.asarray(halo, np.float32) * 0.3, 0, 255)
    camada = Image.new("RGBA", mascara.size, cor + (0,))
    camada.putalpha(Image.fromarray(luz.astype(np.uint8)))
    return camada


def vinheta(img):
    yy, xx = np.mgrid[0:LADO, 0:LADO].astype(np.float32)
    d = np.sqrt((xx - LADO / 2) ** 2 + (yy - LADO / 2) ** 2) / (LADO * 0.72)
    fator = np.clip(1.08 - d ** 2 * 0.55, 0.35, 1)[..., None]
    arr = np.asarray(img.convert("RGB"), np.float32) * fator
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))


def main():
    from rembg import new_session, remove

    sessao = new_session("isnet-general-use")
    fundo = fundo_tatico()
    saidas = []
    for versao, origem, cx, topo, lado, op in AVATARES:
        src = Image.open(RAIZ / origem).convert("RGBA")
        if op.get("alfa_original"):
            mascara = src.getchannel("A").filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.GaussianBlur(1.4))
        else:
            mascara = mascara_robusta(remove(src, session=sessao, only_mask=True))
        for (l, t, r, b) in op.get("apagar", []):
            ImageDraw.Draw(mascara).rectangle((l * src.width, t * src.height, r * src.width, b * src.height), fill=0)
        src.putalpha(mascara)
        quadro = recortar(src, cx, topo, lado).resize((LADO, LADO), Image.LANCZOS)
        if "elipse" in op:
            a = np.asarray(quadro.getchannel("A"), np.float32) * elipse_suave(*op["elipse"])
            quadro.putalpha(Image.fromarray(a.astype(np.uint8)))
        rgb = quadro.convert("RGB")
        rgb = ImageEnhance.Contrast(rgb).enhance(1.14)
        rgb = ImageEnhance.Color(rgb).enhance(0.92)
        rgb = rgb.filter(ImageFilter.UnsharpMask(radius=2, percent=110, threshold=2))
        mascara = quadro.getchannel("A")
        figura = rgb.convert("RGBA")
        figura.putalpha(mascara)
        top5 = int(versao[1:]) <= 5
        comp = fundo.copy()
        comp.alpha_composite(rim_light(mascara, AMBAR if top5 else CIANO, 0.7)
                              .filter(ImageFilter.GaussianBlur(6)))
        comp.alpha_composite(figura)
        comp.alpha_composite(rim_light(mascara, AMBAR if top5 else CIANO, 0.85))
        final = vinheta(comp)
        destino = SAIDA / f"avatar_{versao}.webp"
        final.save(destino, "WEBP", quality=88, method=6)
        saidas.append({"chave": f"avatar_{versao}", "tipo": "avatar", "origem": origem, "bytes": destino.stat().st_size})
        print(f"avatar_{versao}  {destino.stat().st_size // 1024:>4} KB  {origem}")
    (SAIDA / "avatares.json").write_text(json.dumps(saidas, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
