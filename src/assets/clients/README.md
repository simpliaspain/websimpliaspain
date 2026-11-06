# Logotipos de clientes

Pon aquí el logotipo de cada cliente cuyo caso aparece en la web, con el
`slug` del tenant como nombre de archivo:

    oficinasya.svg   (o .png / .webp)

`src/components/ClientMark.tsx` los recoge solos con `import.meta.glob`: no
hay que importar nada ni tocar código. Mientras no exista el archivo, la
marca se dibuja con el nombre del cliente en texto.

Pide siempre el original en vector (SVG) o, si no lo hay, un PNG con fondo
transparente de al menos 600 px de ancho. Se muestra a 28 px de alto.
