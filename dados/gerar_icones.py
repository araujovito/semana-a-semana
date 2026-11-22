"""Gera os ícones do PWA (app/icone-*.png) a partir do mesmo desenho do ícone Android
(android/res/drawable/ic_launcher_frente.xml): folha de calendário com um "feito", fundo #0f766e.
Uso: python3 dados/gerar_icones.py"""
from PIL import Image, ImageDraw
import os
COR, BRANCO = (15, 118, 110), (255, 255, 255)
SAIDA = os.path.join(os.path.dirname(__file__), "..", "app")

def desenhar(tam, mascaravel):
    s = 4  # desenha maior e reduz, para suavizar as bordas
    T = tam * s
    im = Image.new("RGB", (T, T), COR)
    d = ImageDraw.Draw(im)
    # o desenho Android ocupa a área segura de 66 em 108; no ícone comum ele pode crescer um pouco
    k = T / (108 if mascaravel else 84)
    ox = oy = (T - 108 * k) / 2
    P = lambda x, y: (ox + x * k, oy + y * k)
    d.rounded_rectangle([P(30, 34), P(78, 78)], radius=6 * k, fill=BRANCO)
    d.rectangle([P(30, 44), P(78, 48)], fill=COR)
    d.line([P(43, 62), P(51, 70), P(66, 54)], fill=COR, width=round(5 * k), joint="curve")
    for x in (42, 66):
        d.line([P(x, 30), P(x, 38)], fill=BRANCO, width=round(4 * k))
        d.ellipse([P(x - 2, 28), P(x + 2, 32)], fill=BRANCO)
        d.ellipse([P(x - 2, 36), P(x + 2, 40)], fill=BRANCO)
    return im.resize((tam, tam), Image.LANCZOS)

for tam in (192, 512):
    desenhar(tam, False).save(os.path.join(SAIDA, "icone-%d.png" % tam), optimize=True)
desenhar(512, True).save(os.path.join(SAIDA, "icone-mascaravel-512.png"), optimize=True)
print("ícones gravados em app/")
