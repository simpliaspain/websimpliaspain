"""
La foto de los fundadores, recortada de su pared y pasada a una sola tinta.

Por qué en el archivo y no en CSS: la pared azul del estudio es lo que hacía
que la foto se leyera como una nube. Mientras siga ahí, cualquier tinte la
convierte en un rectángulo de color que luego hay que desvanecer por los
cuatro lados, y eso es exactamente una nube. Recortada, no hay rectángulo
que disimular: los dos salen directamente sobre el blanco de la página.

Y una vez hay transparencia, el duotono tiene que venir ya en el archivo. Una
capa de mezcla en CSS pintaría también donde la foto ya no está, porque
`screen` sobre nada da el color entero.

    python recorte.py <origen> <destino>
"""
import sys
from collections import deque
from PIL import Image, ImageFilter

TINTA = (0x10, 0x2C, 0x47)   # #102C47, el azul de marca llevado a la tinta de la web
CONTRASTE = 1.24             # `screen` aclara por definición; sin esto queda lavada
# Qué cuenta como pared. No una distancia a un color medio: la pared se
# oscurece hacia la derecha y con un color fijo el recorte se quedaba a medias
# y con el borde escalonado. Se mira lo que la pared tiene y la foto no: es
# más azul que roja, y es clara. Los trajes son azules pero oscuros; las
# camisas son claras pero neutras; la mesa es más roja que azul.
AZUL_MINIMO = 9              # b - r
LUZ_MINIMA = 136             # luminancia
SUELO_MESA = 0.62            # por debajo de esto no se busca pared: ahí empieza la mesa


def recortar(origen, destino):
    im = Image.open(origen).convert("RGB")
    w, h = im.size
    px = im.load()

    # El fondo se busca por relleno desde los bordes de arriba, y nunca desde
    # abajo: ahí está la mesa, que es del color que sea pero no es la pared.
    # Hacerlo por relleno y no por color suelto es lo que salva la corbata
    # celeste del de la izquierda, que es casi del color de la pared pero no
    # toca ningún borde.
    semillas = deque()
    for x in range(w):
        semillas.append((x, 0))
    for y in range(int(h * SUELO_MESA)):
        semillas.append((0, y))
        semillas.append((w - 1, y))


    fondo = bytearray(w * h)
    visto = bytearray(w * h)
    while semillas:
        x, y = semillas.popleft()
        if x < 0 or y < 0 or x >= w or y >= h:
            continue
        i = y * w + x
        if visto[i]:
            continue
        visto[i] = 1
        r, g, b = px[x, y]
        if b - r < AZUL_MINIMO or (r * 299 + g * 587 + b * 114) // 1000 < LUZ_MINIMA:
            continue
        fondo[i] = 255
        semillas.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))

    mascara = Image.frombytes("L", (w, h), bytes(fondo))
    # Un pelo de desenfoque en el borde: sin esto el recorte queda en dientes
    # de sierra y se nota más que la propia pared.
    mascara = mascara.filter(ImageFilter.GaussianBlur(1.1))
    alfa = mascara.point(lambda v: 255 - v)

    # Una sola tinta: gris, un punto más de contraste, y `screen` hacia el
    # azul, que es la mezcla que lleva el negro al color y deja el blanco en
    # blanco.
    gris = im.convert("L").point(
        lambda v: max(0, min(255, int((v - 128) * CONTRASTE + 128)))
    )
    tinte = Image.merge(
        "RGB",
        [gris.point(lambda v, c=c: 255 - (255 - v) * (255 - c) // 255) for c in TINTA],
    )
    tinte.putalpha(alfa)
    tinte.save(destino, "WEBP", quality=88, method=6)

    fuera = sum(1 for v in alfa.tobytes() if v < 20)
    print(f"{destino}  {w}x{h}  recortado {fuera * 100 // (w * h)}%")


if __name__ == "__main__":
    recortar(sys.argv[1], sys.argv[2])
