# Fotografías

Deja aquí los archivos y aparecen solos: `src/components/Photo.tsx` los
recoge por nombre con `import.meta.glob`. No hay que importar nada ni tocar
código, y mientras el archivo no exista **no se dibuja un hueco vacío**: el
componente devuelve `null` y quien lo usa se maqueta sin foto.

## Cómo nombrarlas

    <nombre>.jpg          la imagen
    <nombre>@2x.jpg       la misma al doble de tamaño (opcional, para retina)

Si existen varias extensiones con el mismo nombre se prefiere, por este
orden: `.avif`, `.webp`, `.jpg`, `.png`. Lo normal es dejar `.webp` y `.jpg`.

## La foto de los fundadores va en dos versiones

| Archivo | Qué es |
|---|---|
| `equipo.webp` | **El original**, tal como lo mandasteis. No se usa en la web; se guarda. |
| `equipo-recorte.webp` | La que sale en Contacto y en el segundo paso de Cómo trabajamos: **sin la pared del estudio** y en una sola tinta azul. |

La segunda se hace con `recorte.py`, que está en esta misma carpeta:

    python src/assets/photos/recorte.py src/assets/photos/equipo.webp src/assets/photos/equipo-recorte.webp
    python src/assets/photos/recorte.py src/assets/photos/equipo@2x.webp "src/assets/photos/equipo-recorte@2x.webp"

Quita la pared por relleno desde los bordes de arriba (nunca desde abajo, que
es donde está la mesa) y pasa la foto a `#102C47` con `screen`, que es la
mezcla que lleva el negro al color y deja el blanco en blanco. **El azul va
dentro del archivo**: si se cambia el de la web, hay que volver a generarla.

Lo único que hace el CSS es apagar la mesa hacia abajo; ver `.tinta` en
`src/index.css`.

## Las que faltan ahora mismo

| Nombre | Qué es | Tamaño mínimo |
|---|---|---|
| `retrato-roberto.jpg` | Retrato de Roberto Zúñiga. Vertical 4:5. | 1600 × 2000 |
| `retrato-sergio.jpg` | Retrato de Sergio Zúñiga. Vertical 4:5. | 1600 × 2000 |
| `esradio.jpg` | Foto de la entrevista en esRadio. Horizontal 16:9. | 1280 × 720 |
| `ieavanzado.jpg` | Foto del Instituto de Empresa Avanzado. Horizontal 16:9. | 1280 × 720 |

Ya están: `madridnorte24h.jpg` (el fotograma de Onda Cero Madrid Norte) y
`despacho-8.webp` (el despacho del chat de ejemplo, recortado cuadrado de la
foto que mandó el cliente el 7/11; la ficha lo dibuja a 72 × 72 con `cover`,
así que **si se cambia, que venga ya recortada en cuadrado**).

## Antes de dejarlas aquí

- Exporta a **WebP con calidad 80** además del JPG. Una foto de 1600 px de
  ancho debería pesar menos de 250 kB.
- No subas el original de la cámara: 4 MB por foto se notan en la portada.
- Recorta tú el encuadre. El componente usa `object-fit: cover`, así que si
  la foto no está recortada se recortará sola por el centro.
