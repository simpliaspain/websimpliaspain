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

## Las que faltan ahora mismo

| Nombre | Qué es | Tamaño mínimo |
|---|---|---|
| `despacho-8.jpg` | El despacho del chat de ejemplo. Horizontal. | 1200 × 900 |
| `retrato-roberto.jpg` | Retrato de Roberto Zúñiga. Vertical 4:5. | 1600 × 2000 |
| `retrato-sergio.jpg` | Retrato de Sergio Zúñiga. Vertical 4:5. | 1600 × 2000 |
| `esradio.jpg` | Foto de la entrevista en esRadio. Horizontal 16:9. | 1280 × 720 |
| `ieavanzado.jpg` | Foto del Instituto de Empresa Avanzado. Horizontal 16:9. | 1280 × 720 |

`madridnorte24h.jpg` ya está: es el fotograma de Onda Cero Madrid Norte.

## Antes de dejarlas aquí

- Exporta a **WebP con calidad 80** además del JPG. Una foto de 1600 px de
  ancho debería pesar menos de 250 kB.
- No subas el original de la cámara: 4 MB por foto se notan en la portada.
- Recorta tú el encuadre. El componente usa `object-fit: cover`, así que si
  la foto no está recortada se recortará sola por el centro.
