# -*- coding: utf-8 -*-
"""Gera assets/ padronizados a partir do acervo local (padronizadas/, baixadas/, raiz) e dos downloads em novas/.

Cada slot define a origem, um recorte opcional (frações l, t, r, b da imagem de origem) e o formato de saída.
O recorte é encaixado no formato final sobre um fundo desfocado da própria imagem, sem cortar cabeças.
Slots sem imagem recebem um placeholder holográfico gerado aqui, e todos vão para assets/manifest.json.
Uso: python tools/processar_assets.py
"""
import json
import os
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

sys.stdout.reconfigure(encoding="utf-8")
RAIZ = Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "assets"
FORMATOS = {"traje": (900, 1200), "rosto": (720, 900), "civil": (720, 900), "veiculo": (1280, 720)}
CIANO = (34, 211, 238)
QUALIDADE = 80

# (chave, tipo, origem relativa à raiz ou None, recorte (l, t, r, b) ou None, rótulo)
SLOTS = [
    ("v01_traje_1992", "traje", "images.jpg", (0.18, 0.0, 0.82, 1.0), "Clássico BTAS 1992"),
    ("v01_traje_tnba", "traje", "novas/v01_traje_tnba_wiki.webp", (0.22, 0.0, 0.78, 1.0), "The New Batman Adventures 1997"),
    ("v01_traje_fogo", "traje", "novas/v01_traje_fogo.webp", (0.0, 0.0, 1.0, 0.72), "Traje à prova de fogo"),
    ("v01_rosto", "rosto", "which-version-of-bruce-wayne-from-the-animated-series-do-v0-8b8za9bnyijb1.webp", (0.0, 0.0, 1.0, 0.86), "Bruce Wayne (DCAU)"),
    ("v01_veiculo_btas", "veiculo", "novas/v01_veiculo_btas.webp", None, "Batmóvel BTAS 1992"),
    ("v01_veiculo_tnba", "veiculo", "novas/v01_veiculo_tnba.webp", None, "Batmóvel TNBA 1997"),

    ("v02_traje_tdk", "traje", "bale-batman.jpg", (0.0, 0.0, 0.62, 1.0), "Traje modular O Cavaleiro das Trevas"),
    ("v02_traje_begins", "traje", "novas/v02_traje_begins.webp", None, "Traje Batman Begins"),
    ("v02_rosto", "rosto", "bale-batman.jpg", (0.56, 0.0, 1.0, 1.0), "Bruce Wayne (Christian Bale)"),
    ("v02_veiculo_tumbler", "veiculo", "novas/v02_veiculo_tumbler.webp", None, "Tumbler"),
    ("v02_veiculo_batpod", "veiculo", "novas/v02_veiculo_batpod.webp", None, "Batpod"),

    ("v03_traje_nano", "traje", "batman-beyond-139636-1-1200x676_uwgh.jpg", (0.2, 0.0, 0.8, 1.0), "Traje de nanopolímeros"),
    ("v03_traje_exo", "traje", "novas/v03_traje_exo.webp", (0.18, 0.0, 0.82, 1.0), "Exoesqueleto de Bruce Wayne"),
    ("v03_rosto", "rosto", "novas/v03_rosto_terry.webp", (0.1, 0.0, 0.75, 1.0), "Terry McGinnis"),
    ("v03_civil", "civil", "5d81da97b0d6054d46701daa87771131.jpg", (0.0, 0.0, 1.0, 0.86), "Terry McGinnis (civil)"),
    ("v03_mentor", "rosto", "novas/v03_mentor_bruce.webp", (0.15, 0.0, 0.85, 1.0), "Bruce Wayne idoso (mentor)"),
    ("v03_veiculo", "veiculo", "novas/v03_veiculo.webp", None, "Batmóvel voador 2039"),

    ("v04_traje_cinza", "traje", "novas/v04_traje_filme.webp", (0.3, 0.0, 0.7, 1.0), "Traje cinza pesado"),
    ("v04_traje_armadura", "traje", "novas/v04_traje_armadura_hq.webp", None, "Armadura mecânica anti-Superman"),
    ("v04_rosto", "rosto", None, None, "Bruce Wayne, 55 anos"),
    ("v04_veiculo_tanque", "veiculo", "novas/v04_veiculo_tanque.webp", (0.0, 0.08, 0.7, 1.0), "Batmóvel tanque"),

    ("v05_traje_city", "traje", "novas/v05_traje_city.webp", (0.0, 0.0, 0.52, 1.0), "Batsuit Arkham City"),
    ("v05_traje_knight", "traje", "novas/v05_traje_knight.webp", None, "Batsuit v8.03 Arkham Knight"),
    ("v05_traje_xe", "traje", "novas/v05_traje_xe.webp", None, "Traje XE criogênico"),
    ("v05_rosto", "rosto", "novas/v05_rosto_bruce.webp", (0.6, 0.12, 0.98, 1.0), "Bruce Wayne (Arkhamverse)"),
    ("v05_veiculo_perseguicao", "veiculo", "novas/v05_veiculo_perseguicao.webp", None, "Batmóvel modo perseguição"),
    ("v05_veiculo_tanque", "veiculo", "padronizadas/v05_veiculo.webp", "moldura", "Batmóvel modo tanque"),

    ("v06_traje_padrao", "traje", "AbsoBatmanRender2.webp", None, "Traje Absoluto"),
    ("v06_traje_capa", "traje", "novas/v06_traje_capa_textless.webp", None, "Traje Absoluto com capa de combate"),
    ("v06_traje_machado", "traje", "padronizadas/v06_traje.webp", "moldura", "Traje Absoluto com machado"),
    ("v06_rosto", "rosto", None, None, "Bruce Wayne (Absoluto)"),
    ("v06_veiculo", "veiculo", None, None, "Veículo tático Absoluto"),

    ("v07_traje_padrao", "traje", "novas/v07_traje_dcamu.webp", (0.3, 0.0, 0.72, 1.0), "Traje padrão Novos 52"),
    ("v07_traje_hush", "traje", "novas/v07_traje_novo.webp", (0.3, 0.0, 0.72, 1.0), "Traje Batman: Silêncio"),
    ("v07_traje_thrasher", "traje", None, None, "Armadura Thrasher"),
    ("v07_traje_buster", "traje", None, None, "Justice Buster"),
    ("v07_rosto", "rosto", None, None, "Bruce Wayne (Novos 52)"),
    ("v07_veiculo", "veiculo", "novas/v07_veiculo.webp", None, "Batmóvel DCAMU"),

    ("v08_traje_padrao", "traje", "baixadas/batman_2004.png", None, "Traje The Batman 2004"),
    ("v08_traje_noturno", "traje", "baixadas/bruce_2004_civil2.jpg", None, "Traje The Batman (patrulha noturna)"),
    ("v08_rosto", "rosto", None, None, "Bruce Wayne (The Batman 2004)"),
    ("v08_veiculo_esportivo", "veiculo", "baixadas/batmobile_2004.jpg", None, "Batmóvel esportivo"),
    ("v08_veiculo_pesado", "veiculo", None, None, "Veículo pesado"),

    ("v09_traje", "traje", "baixadas/justice_lord_batman.png", (0.15, 0.0, 0.85, 1.0), "Traje Lorde Batman"),
    ("v09_traje_duelo", "traje", "novas/v09_dois_batmen.webp", None, "Lorde Batman diante de Batman"),
    ("v09_rosto", "rosto", "8ibrw8bnyijb1.jpg", (0.0, 0.0, 1.0, 0.86), "Bruce Wayne (Justice Lords)"),
    ("v09_veiculo", "veiculo", None, None, "Jato dos Lordes da Justiça"),

    ("v10_traje_flashpoint", "traje", "baixadas/thomas_wayne_rosto.jpg", None, "Batman Flashpoint"),
    ("v10_traje_queda", "traje", "baixadas/thomas_wayne_traje.jpg", None, "Batman Flashpoint (capa)"),
    ("v10_traje_duelo", "traje", "novas/v10_traje_fp5.webp", None, "Batman Flashpoint em combate"),
    ("v10_rosto", "rosto", "novas/v10_rosto_filme.webp", (0.22, 0.0, 0.78, 1.0), "Thomas Wayne"),
    ("v10_civil", "civil", "baixadas/thomas_wayne_civil.jpg", (0.0, 0.0, 1.0, 0.62), "Thomas Wayne (civil)"),
    ("v10_veiculo", "veiculo", None, None, "Batmóvel Flashpoint"),

    ("v11_traje_azrael", "traje", "baixadas/azrael_traje_alt.jpg", None, "Azrael"),
    ("v11_traje_azbat", "traje", "novas/v11_traje_azbat2.webp", None, "AzBat (A Queda do Morcego)"),
    ("v11_traje_azbat_garras", "traje", "novas/v11_traje_azbat.webp", None, "AzBat com garras"),
    ("v11_rosto", "rosto", "baixadas/azrael_traje.jpg", (0.0, 0.0, 1.0, 0.7), "Jean-Paul Valley"),
    ("v11_veiculo", "veiculo", None, None, "Batmóvel da era Knightfall"),

    ("v12_traje", "traje", "baixadas/lego_batman_rosto.png", None, "Batman Lego"),
    ("v12_traje_notebook", "traje", "baixadas/lego_batmobile_real.jpg", None, "Batman Lego no Batcomputador"),
    ("v12_rosto", "rosto", "baixadas/lego_batmobile.png", (0.22, 0.0, 0.78, 1.0), "Bruce Wayne Lego"),
    ("v12_veiculo_34", "veiculo", "novas/v12_veiculo_34.webp", (0.0, 0.12, 1.0, 0.88), "Batmóvel Lego (70905)"),
    ("v12_veiculo_lateral", "veiculo", "novas/v12_veiculo_lateral.webp", (0.0, 0.14, 1.0, 0.86), "Batmóvel Lego, vista lateral"),
]


def fonte(tam):
    for nome in ("arialbd.ttf", "arial.ttf", "segoeuib.ttf"):
        try:
            return ImageFont.truetype(nome, tam)
        except OSError:
            continue
    return ImageFont.load_default()


def moldura(img):
    """Cantos ciano no mesmo estilo das padronizadas originais."""
    d = ImageDraw.Draw(img)
    w, h = img.size
    t = max(3, w // 300)
    c = int(min(w, h) * 0.06)
    m = int(min(w, h) * 0.012)
    for (x, y, dx, dy) in ((m, m, 1, 1), (w - m, m, -1, 1), (m, h - m, 1, -1), (w - m, h - m, -1, -1)):
        d.line([(x, y), (x + dx * c, y)], fill=CIANO, width=t)
        d.line([(x, y), (x, y + dy * c)], fill=CIANO, width=t)
    return img


def encaixar(src, alvo):
    """Encaixa src inteiro no alvo, sobre o próprio src desfocado e escurecido."""
    W, H = alvo
    fundo = src.copy()
    esc = max(W / fundo.width, H / fundo.height)
    fundo = fundo.resize((int(fundo.width * esc) + 1, int(fundo.height * esc) + 1), Image.LANCZOS)
    l = (fundo.width - W) // 2
    t = (fundo.height - H) // 2
    fundo = fundo.crop((l, t, l + W, t + H)).filter(ImageFilter.GaussianBlur(28))
    fundo = Image.blend(fundo, Image.new("RGB", (W, H), (7, 10, 14)), 0.55)
    esc2 = min(W / src.width, H / src.height)
    fr = src.resize((max(1, int(src.width * esc2)), max(1, int(src.height * esc2))), Image.LANCZOS)
    fundo.paste(fr, ((W - fr.width) // 2, (H - fr.height) // 2))
    return fundo


def placeholder(alvo, rotulo):
    W, H = alvo
    img = Image.new("RGB", (W, H), (7, 10, 14))
    d = ImageDraw.Draw(img)
    for x in range(0, W, 24):
        d.line([(x, 0), (x, H)], fill=(12, 26, 44), width=1)
    for y in range(0, H, 24):
        d.line([(0, y), (W, y)], fill=(12, 26, 44), width=1)
    cx, cy, s = W / 2, H * 0.42, min(W, H) * 0.34
    # silhueta de capuz com orelhas
    pts = [(-0.5, 0.55), (-0.52, -0.1), (-0.42, -0.62), (-0.3, -0.18), (-0.12, -0.24), (0.12, -0.24), (0.3, -0.18),
           (0.42, -0.62), (0.52, -0.1), (0.5, 0.55), (0.22, 0.75), (-0.22, 0.75)]
    d.polygon([(cx + x * s, cy + y * s) for x, y in pts], outline=CIANO, fill=(10, 34, 52), width=3)
    d.polygon([(cx - 0.3 * s, cy + 0.05 * s), (cx - 0.08 * s, cy + 0.02 * s), (cx - 0.1 * s, cy + 0.12 * s)], fill=CIANO)
    d.polygon([(cx + 0.3 * s, cy + 0.05 * s), (cx + 0.08 * s, cy + 0.02 * s), (cx + 0.1 * s, cy + 0.12 * s)], fill=CIANO)
    f1, f2 = fonte(max(18, W // 26)), fonte(max(14, W // 40))
    d.text((W / 2, H * 0.74), "SINAL PERDIDO", fill=(245, 158, 11), font=f1, anchor="mm")
    d.text((W / 2, H * 0.80), "SEM REGISTRO VISUAL NO ARQUIVO", fill=(56, 189, 248), font=f2, anchor="mm")
    d.text((W / 2, H * 0.86), rotulo.upper(), fill=(148, 163, 184), font=f2, anchor="mm")
    return img


def main():
    SAIDA.mkdir(exist_ok=True)
    origem_dl = {}
    p = RAIZ / "novas" / "_origem_downloads.json"
    if p.exists():
        for x in json.loads(p.read_text(encoding="utf-8")):
            origem_dl[x["arquivo"]] = x["url"]
    manifest = []
    for chave, tipo, origem, recorte, rotulo in SLOTS:
        alvo = FORMATOS[tipo]
        if origem is None:
            img = placeholder(alvo, rotulo)
            status = "placeholder"
        else:
            src = Image.open(RAIZ / origem)
            if src.mode in ("RGBA", "LA", "P"):
                src = src.convert("RGBA")
                base = Image.new("RGBA", src.size, (7, 10, 14, 255))
                base.alpha_composite(src)
                src = base.convert("RGB")
            else:
                src = src.convert("RGB")
            if recorte == "moldura":
                bw, bh = int(src.width * 0.03), int(src.height * 0.03)
                src = src.crop((bw, bh, src.width - bw, src.height - bh))
            elif recorte:
                l, t, r, b = recorte
                src = src.crop((int(l * src.width), int(t * src.height), int(r * src.width), int(b * src.height)))
            img = encaixar(src, alvo)
            status = "imagem"
        img = moldura(img)
        destino = SAIDA / f"{chave}.webp"
        img.save(destino, "WEBP", quality=QUALIDADE, method=6)
        manifest.append({"chave": chave, "tipo": tipo, "rotulo": rotulo, "status": status, "origem": origem,
                         "url": origem_dl.get(origem), "bytes": destino.stat().st_size})
        print(f"{status:11} {chave:26} {destino.stat().st_size // 1024:4} KB  {origem or ''}")
    (SAIDA / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
    total = sum(m["bytes"] for m in manifest)
    print(len(manifest), "slots,", sum(m["status"] == "placeholder" for m in manifest), "placeholders,", total // 1024, "KB")


if __name__ == "__main__":
    main()
