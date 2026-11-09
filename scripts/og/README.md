# La tarjeta que se ve al compartir la web

`public/og-image.png` es lo que enseñan WhatsApp, LinkedIn, Slack o X cuando
alguien pega un enlace de simpliaspain.com. Es una imagen, no la página, así
que no se actualiza sola: **si cambia la marca o el titular, hay que volver a
generarla aquí**. Es justo lo que pasó con la marca antigua, que siguió
viéndose en WhatsApp mucho después de haber cambiado el icono de pestaña.

`tarjeta.html` es la tarjeta, escrita con los mismos tokens que la web: Inter,
blanco, el azul de marca y la burbuja de la conversación de ejemplo. La marca
es **la misma S** que `public/favicon.svg`: la de «Spain» sacada de Inter
Bold, recortada a su propia mancha de tinta. Aquí va suelta y sin azulejo,
porque la tarjeta ya es blanca.

## Volver a generarla

    node scripts/og/render.cjs scripts/og public/og-image.png

Son 1200 × 630, que es lo que dicen `og:image:width` y `og:image:height` en
`index.html`. Si cambia el tamaño, hay que cambiar también esas dos etiquetas.

Hace falta un Chromium con Playwright; `render.cjs` lleva la ruta del que trae
el contenedor.

## Si se cambia el titular

El de la tarjeta y el de la portada dicen lo mismo a propósito («Tu centro
contesta a las 20:53»), y las dos horas salen del vídeo. Cambiar una sin la
otra deja a quien llega desde WhatsApp mirando dos promesas distintas.
