# Fotos del sitio

Coloque aquí las fotos con **estos nombres exactos**. Mientras una foto no exista, la página muestra un marco gris con el ícono de OLPEX.

| Archivo | Dónde aparece | Sugerencia (de la presentación) | Proporción |
|---|---|---|---|
| `nosotros.jpg` | Sobre nosotros | Variadores Danfoss VLT en tablero | 4:3 horizontal |
| `servicio-electrico.jpg` | Servicios eléctricos | Técnico frente a tablero eléctrico | 4:5 vertical |
| `servicio-automatizacion.jpg` | Automatización industrial | PLC Siemens SIMATIC S7-400 | 4:5 vertical |
| `servicio-mecanico.jpg` | Servicios mecánicos | Técnico con válvulas y tuberías | 4:5 vertical |
| `servicio-neumatico.jpg` | Servicios neumáticos | Máquina con componentes neumáticos | 4:5 vertical |
| `servicio-estructuras.jpg` | Ensamblajes y estructuras | Cintas transportadoras fabricadas | 4:5 vertical |
| `suministro-equipos.jpg` | Suministro de equipos | Gabinete con componentes | 4:5 vertical |

Recomendaciones: JPG de 1200 px en el lado largo y menos de 300 KB cada una. Si una foto no tiene la proporción indicada, se recorta automáticamente al centro.

## Logos de clientes (tira en movimiento)
Los logos están en `clientes/`, descargados de los sitios oficiales de cada empresa (Colgate-Palmolive y Krones, de Wikimedia Commons).

Estos clientes aún aparecen con su nombre porque no se encontró un logo oficial en internet:
EEGSA, BMC, Quilubrisa, Gourmet, Imperial Textile, MPI S.A., Ompro Electric y Prosain.

Para agregar uno: guarde el archivo en `clientes/` (SVG o PNG con fondo transparente, o con fondo blanco) y en `index.html`, dentro de `marquee-track`, cambie la línea del cliente:

```html
<!-- antes -->
<li class="logo-text">Prosain</li>
<!-- después -->
<li><img src="assets/img/clientes/prosain.png" alt="Prosain" style="--h:48px"></li>
```

`--h` es la altura del logo en la tira: súbala (56–60px) si se ve pequeño o bájela (32–40px) si se ve pesado. La copia para el bucle se genera sola.
