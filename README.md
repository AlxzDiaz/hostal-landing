# Landing de hostal · plantilla

Página para hostales y hoteles pequeños que reciben reservas por WhatsApp. Es la tercera de la serie: toma la base del restaurante ([GUIA-LANDINGS.md](../restaurante-landing/GUIA-LANDINGS.md)) y de la tienda de ropa ([README](../tienda-ropa-landing/README.md)), y la adapta al hospedaje.

Usa HTML, CSS y JavaScript, sin build. Solo hay que subir la carpeta.

```
hostal-landing/
├── index.html          estructura + SEO + fotos de portada y de "Nuestra historia"
├── css/styles.css      estilos (paleta en :root, arriba del archivo)
├── js/config.js        ← DATOS DEL HOSTAL: casi todo se cambia aquí
├── js/main.js          lógica (no hace falta tocarlo)
└── images/
    ├── logo.svg        emblema (árbol de lupuna)
    ├── favicon.svg
    └── habitaciones/ … ilustraciones de respaldo (se ven si una foto no carga)
```

## Qué tiene de nuevo frente a la tienda

| Tienda de ropa | Hostal |
|---|---|
| Prendas con tallas | **Habitaciones** con capacidad, camas, m² y comodidades con íconos |
| Precio fijo | **Precio por noche** que cambia solo: tarifa de **fin de semana** (vie y sáb) y **temporadas** con recargo (Fiestas Patrias, Año Nuevo) |
| — | **Buscador de fechas** en la portada: llegada, salida y huéspedes. Todas las tarjetas muestran el **total de la estadía** |
| — | **Precio de las apps tachado** ("-15% directo"): reservar por WhatsApp sale más barato que en Booking |
| Vista rápida de la prenda | **Vista de la habitación**: galería deslizable, lo que incluye y el **precio de cada noche** |
| Oferta con cuenta regresiva | **Promo por noches mínimas** ("15% desde 3 noches") que se aplica sola y avisa cuántas noches faltan |
| Looks armados | **Tours** a Tambopata con precio por persona, que se suman a la reserva |
| Envío gratis desde S/ X | **Extras**: recojo del aeropuerto (gratis desde 3 noches), traslado de salida, salida tarde y lavandería |
| — | **Aviso de capacidad**: si las habitaciones no alcanzan para todos los huéspedes |
| — | **Adelanto** (50%) calculado en el total |
| "Tienda abierta" | **Recepción 24 h**, horario de entrada y salida |
| — | **Cerca de todo**: minutos a la Plaza, el mercado, el embarcadero, el terminal y el aeropuerto |
| — | **Políticas** claras: entrada, salida, cancelación, documentos, niños |
| Reseñas con la talla | Reseñas con **país, habitación, noches y tipo de viaje**, y calificación de **Google y Booking** |

**Librerías (por CDN):** [Phosphor Icons](https://phosphoricons.com), [AOS](https://michalsnik.github.io/aos/) y Google Fonts (**Playfair Display** para títulos, estilo revista de viajes, y **Plus Jakarta Sans** para el texto).

**Paleta "Atardecer en el río"** (la de la guía para lodges): selva `#0F1F1A`, atardecer `#B4501A` (botones, texto blanco 5.1:1), oro `#E9B44C` (acentos, texto oscuro), hoja `#3E8E6E` y fondos arena. El naranja de la guía (`#C25A1B`) daba 4.4:1 con texto blanco, así que se oscureció un poco para pasar el 4.5:1.

## Personalizar para un cliente

1. **`js/config.js`:**
   - **Datos básicos:** nombre, WhatsApp (`51` + número, sin espacios), dirección, coordenadas, redes y correo.
   - **Reservas:** hora de entrada y salida, % de adelanto, horas para cancelar sin costo, medios de pago, temporadas y promo.
   - **Habitaciones:** precios (semana, fin de semana y en apps), capacidad, camas, m², cuántas hay y comodidades.
   - **Extras y tours:** precios, qué incluye cada tour y el nombre del operador.
   - **Confianza:** calificaciones, logros, reseñas, políticas y preguntas frecuentes.
2. **`index.html`:** cambia el `<title>`, la `meta description`, la `og:image`, las dos fotos del hero, el dato del recuadro flotante ("Afuera 34 °C…") y la historia de "Nuestra historia".
3. **Logo:** reemplaza `images/logo.svg` y `favicon.svg`.
4. **Colores:** edita las variables de `:root` en `css/styles.css`.

### Cómo cargar una habitación

```js
{ id: "matrimonial", nombre: "Matrimonial con vista al jardín", corto: "Matrimonial",
  precio: 110,          // por noche, domingo a jueves
  precioFinde: 125,     // opcional: noches de viernes y sábado
  precioApps: 129,      // opcional: precio en Booking/Airbnb (se muestra tachado)
  capacidad: 2, camas: "1 cama queen", m2: 20,
  unidades: 6,          // cuántas habitaciones de este tipo tiene el hostal
  etiqueta: "La más pedida", nuevo: true,   // opcionales
  amenidades: ["aire", "bano", "desayuno", "wifi", "tv"],   // claves de CONFIG.amenidades
  descripcion: "…",
  imagenes: ["images/habitaciones/matrimonial-1.webp", "images/habitaciones/matrimonial-2.webp"] },
```

- Para un dormitorio compartido usa `porCama: true`: se reserva por cama y se sugiere una cama por huésped.
- El `id` no debe tener espacios y no conviene cambiarlo después: con él se guarda la reserva en el navegador.
- Las **comodidades** nuevas se agregan en `CONFIG.amenidades` con su nombre y un ícono de [Phosphor](https://phosphoricons.com).
- Las **temporadas** suman un % a las noches entre `desde` y `hasta` (ambas incluidas).

### Fotos

- Las fotos de ejemplo son de [Unsplash](https://unsplash.com) (licencia gratuita, uso comercial permitido) y se cargan desde su CDN.
- Con un cliente real, **usa siempre fotos de sus habitaciones**: el huésped compara con lo que encuentra al llegar. Lo ideal es foto horizontal con luz de día, la cama completa y la ventana a la vista.
- Formato **4:3 (800 × 600 px)** en **WebP** de menos de 150 KB. Comprímelas en [squoosh.app](https://squoosh.app).
- La segunda foto de cada habitación aparece al pasar el mouse por la tarjeta (el baño o la vista funcionan muy bien).

### Datos que deben ser reales

Las calificaciones, los logros, las reseñas, los precios en apps, la promo y el nombre del operador de tours son **de ejemplo**. Con un cliente real usa solo sus datos. Si el precio "en apps" tachado no es el que de verdad aparece en Booking, el huésped lo comprueba en un minuto y deja de confiar.

## Cómo llega la reserva

```
Hola Casa Lupuna 👋, quiero reservar:

📅 Llegada: vie, 16 oct 2026 (desde 1 p. m.)
📅 Salida: lun, 19 oct 2026 (hasta 11 a. m.)
🌙 3 noches · 👥 2 huéspedes

🛏️ Habitaciones
• 1 x Matrimonial con vista al jardín — S/ 360.00
Descuento Temporada verde (-15%): -S/ 54.00

🌿 Tours
• Lago Sandoval x 2 personas — S/ 360.00

➕ Extras
• Recojo del aeropuerto — Gratis (3+ noches)

*Total: S/ 666.00*
Adelanto para confirmar (50%): S/ 333.00

👤 Nombre: Ana Torres
🪪 DNI: 45678912
🌎 Procedencia: Lima
🧭 Llego en: Avión · vuelo LA2071 · aprox. 10:30 a. m.
💳 Pago del adelanto: Yape
```

La página **no confirma disponibilidad**: envía una solicitud y el hostal responde por WhatsApp. Las fechas, la reserva y los extras se guardan en el navegador del huésped: si cierra la página y vuelve, los sigue teniendo.

## Probar en tu computadora

Abre una terminal en la carpeta y ejecuta:

```bash
python -m http.server 8000
```

Luego entra a `http://localhost:8000`.

## Publicar en Netlify (gratis)

1. Entra a [app.netlify.com/drop](https://app.netlify.com/drop) y arrastra la carpeta.
2. En *Site settings → Change site name* ponle un nombre como `casa-lupuna.netlify.app`.
3. Opcional: conecta un dominio `.pe` o `.com`.

Después de publicar, agrega la URL en el **Google Business Profile** (botón "Reservar"), en la bio de Instagram y TikTok, y en un QR para la recepción y las tarjetas que se entregan al salir.

## Checklist antes de entregar

- [ ] Se ve bien en un celular real
- [ ] "Enviar solicitud" abre WhatsApp con el número correcto y el mensaje completo
- [ ] Los precios por noche, de fin de semana y de temporadas son los reales
- [ ] El precio "en apps" es el que aparece hoy en Booking/Airbnb (o se quitó)
- [ ] El número de habitaciones de cada tipo es el real
- [ ] La promo existe y su fecha de fin es real
- [ ] Los tours, precios y operador están confirmados con el cliente
- [ ] Las fotos son del hostal
- [ ] Las calificaciones, reseñas y logros son reales
- [ ] La hora de entrada y salida, el adelanto y la política de cancelación son los del cliente
- [ ] Título, descripción, logo y redes sociales son los del cliente
