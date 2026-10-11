# Bella Nails Studio — Demo de salón de uñas (Binary Dev)

Página de demostración para ofrecer sitios web a salones de uñas y pestañas. El nombre, los precios, las reseñas y la dirección son **de ejemplo**; la barra de arriba lo aclara.

## Qué incluye

- Portada con una rueda de 12 tonos de esmalte: al tocar uno, toda la página cambia a ese color
- Botones de reservar y WhatsApp
- Promo del mes
- Servicios con precios (manos, pies, diseño, pestañas)
- Diseños de la casa (en la versión real van las fotos del negocio)
- Reserva en forma de ticket: la clienta elige servicio, día y hora (y el tono de la rueda), y se arma el mensaje de WhatsApp
- Reseñas de ejemplo y el cartelito con código QR para dejar reseña en Google
- Horario y ubicación
- Botón flotante de WhatsApp
- Español e inglés (botón EN/ES)

## Estructura

```
index.html        Página (texto en español)
404.html          Página de error
css/styles.css    Estilos
js/i18n.js        Traducciones al inglés
js/main.js        Reservas, WhatsApp, idioma y configuración
assets/           Fuentes, favicon y QR
robots.txt        Bloquea la indexación (es una demo)
```

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo `bella-nails-demo`).
2. Sube **el contenido** de esta carpeta a la raíz del repositorio (que `index.html` quede en la raíz).
3. En el repositorio: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.
4. En uno o dos minutos queda en `https://TU-USUARIO.github.io/bella-nails-demo/`.

Para probarla en tu computadora sin subirla: `python -m http.server` dentro de la carpeta y abre `http://localhost:8000`.

## Convertirla en la página de un cliente real

En `js/main.js`, arriba de todo:

- `whatsappNumber`: el número del salón con código de país, solo dígitos (EE. UU.: `1` + 10 dígitos). Vacío = modo demo (muestra un aviso en vez de abrir WhatsApp).
- `reviewUrl`: el enlace directo de reseña del perfil de Google del negocio. Vacío = modo demo.
- `times` y `closedDays`: horarios de cita y días cerrados.

Después:

- Cambia nombre, textos y precios en `index.html` (y su traducción en `js/i18n.js`). Los tonos de la rueda están en los botones `.tip` de `index.html` (`data-fill` = color de la uña, `data-deep` = versión oscura para botones y textos).
- Pon las fotos reales en la galería y genera el QR con el enlace de reseña real.
- Quita la barra de demo, `robots.txt` y la etiqueta `noindex` para que Google la indexe.
- Revisa el `JSON-LD` del `<head>` con los datos reales del negocio.
