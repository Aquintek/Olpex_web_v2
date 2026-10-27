# Sitio web OLPEX Engineering Solutions

Sitio de una página en HTML, CSS y JavaScript, sin dependencias ni compilación.

```
index.html        Página
css/styles.css    Estilos (colores al inicio del archivo, en :root)
js/main.js        Menú, selector de servicios y envío del formulario
contacto.php      Envía el formulario por correo (solo hosting con PHP)
assets/img/       Logo, favicon y fotos (ver assets/img/README.md)
```

## Ver el sitio en su computadora
Abra `index.html` con doble clic. El formulario no envía desde el disco local: muestra el mensaje de error con el correo alternativo, que es lo esperado.

## Publicar en HostGator (con PHP)
1. Suba todo el contenido de esta carpeta a `public_html` (Administrador de archivos de cPanel o FTP).
2. En cPanel cree la cuenta de correo `no-reply@olpex.net` (o cambie `CORREO_ORIGEN` en `contacto.php` por una cuenta que ya exista en el dominio). Si el remitente no es del mismo dominio, el correo suele terminar en spam o no llega.
3. Abra `contacto.php` y ajuste al inicio:
   - `CORREO_DESTINO`: a quién llegan los mensajes (hoy `asesortecnico1@olpex.net`).
   - `COPIA_A`: un segundo correo opcional, por ejemplo `compras@olpex.net`.
4. Envíe un mensaje de prueba desde el sitio publicado y confirme que llega.

## Publicar en Amazon (S3, Amplify o Lightsail estático, sin PHP)
`contacto.php` no funciona allí; use un servicio de formularios gratuito:
1. Cree una cuenta en https://formspree.io con el correo que recibirá los mensajes y cree un formulario.
2. Copie la dirección que le da (algo como `https://formspree.io/f/abcdwxyz`).
3. En `index.html` busque `action="contacto.php"` y reemplácelo por esa dirección.
4. Suba los archivos (puede omitir `contacto.php`) y envíe un mensaje de prueba. La primera vez Formspree pide confirmar el correo.

Web3Forms (https://web3forms.com) funciona igual: `action="https://api.web3forms.com/submit"` y agregue dentro del formulario
`<input type="hidden" name="access_key" value="SU-CLAVE">`.

## WhatsApp
El botón flotante y el de la sección Contacto abren un chat con **+502 3741 9090**. Para cambiar el número, en `index.html` busque `wa.me/50237419090` (aparece 2 veces) y reemplace el número: código de país + número, sin espacios ni signos.

## Al publicar una actualización
En `index.html` suba el número `?v=` de `css/styles.css?v=5` y `js/main.js?v=5` (por ejemplo a `?v=6`). Así los teléfonos y navegadores descargan los archivos nuevos en lugar de mostrar la versión que tenían guardada.

## Cambios frecuentes
- **Textos**: todos están en `index.html`.
- **Correos y teléfonos**: sección `<!-- CONTACTO -->` de `index.html`.
- **Colores**: variables al inicio de `css/styles.css`.
