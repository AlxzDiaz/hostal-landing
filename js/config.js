/* ==========================================================
   CONFIGURACIÓN DEL HOSTAL
   Todo lo que cambia de un cliente a otro está en este archivo.
   No hace falta tocar main.js para personalizar la página.
   ========================================================== */

// Fotos de Unsplash (licencia gratuita, uso comercial permitido).
// Para un cliente real: reemplaza por sus fotos, p. ej. "images/habitaciones/matrimonial-1.webp"
// Las habitaciones usan formato horizontal 4:3 (800 × 600 px).
const foto = (id, w = 800, h = 600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? "&h=" + h : ""}&q=70`;

const CONFIG = {
  nombre: "Casa Lupuna",
  eslogan: "Hostal · Puerto Maldonado",

  // WhatsApp: código de país + número, sin "+", espacios ni guiones
  whatsapp: "51944870026",
  // Demo del portafolio ALXZ//: marca los mensajes con "[Demo ALXZ//]" y muestra el aviso.
  // Para un cliente real: pon su número arriba y demo: false.
  demo: true,
  telefono: "+51 999 999 999",
  email: "reservas@casalupuna.pe",

  direccion: "Jr. Puno 512, a 3 cuadras de la Plaza de Armas",
  ciudad: "Puerto Maldonado",
  region: "Madre de Dios",
  // En Google Maps: clic derecho sobre el local → copiar coordenadas
  ubicacion: { lat: -12.5966, lng: -69.1873 },

  // Deja una red en "" para ocultarla
  redes: {
    facebook: "https://www.facebook.com/",
    instagram: "https://www.instagram.com/",
    tiktok: "https://www.tiktok.com/",
  },

  // Mensajes de la barra superior (rotan cada pocos segundos). [] = se oculta.
  anuncios: [
    "Reserva directo por WhatsApp y paga menos que en las apps",
    "Recojo del aeropuerto gratis desde 3 noches",
    "Recepción 24 horas · guardamos tu equipaje gratis",
  ],

  // Usa las calificaciones REALES del cliente. max: escala de cada página (Google 5, Booking 10).
  ratings: [
    { fuente: "Google", valor: 4.8, total: 412, max: 5, icono: "ph-google-logo" },
    { fuente: "Booking.com", valor: 9.1, total: 268, max: 10, icono: "ph-bed" },
  ],

  // Horas en formato 24 h
  checkin: "13:00",
  checkout: "11:00",
  adelanto: 50,                // % que se paga para confirmar la reserva
  cancelacionHoras: 48,        // cambios y cancelación sin costo hasta X horas antes
  pagos: ["Yape", "Plin", "Transferencia", "Tarjeta", "Efectivo"],

  // Fechas con tarifa especial (feriados, festivales). El recargo se suma a esas noches.
  temporadas: [
    { nombre: "Fiestas Patrias", desde: "2026-07-24", hasta: "2026-07-31", recargo: 20 },
    { nombre: "Fiestas de fin de año", desde: "2026-12-23", hasta: "2027-01-02", recargo: 25 },
  ],

  // Promoción con cuenta regresiva. Se aplica sola si la estadía tiene las noches mínimas.
  // Al pasar la fecha de fin, la sección se oculta y el descuento deja de aplicarse. null = sin promo.
  promo: {
    titulo: "Temporada verde",
    texto: "Reserva antes de que termine el mes y quédate 3 noches o más con descuento en tu habitación. Es la mejor época para ver fauna: los ríos están llenos y la selva, más verde que nunca.",
    minNoches: 3,
    porcentaje: 15,
    fin: "2026-10-31T23:59:00-05:00",
    imagen: foto("1556751003-a249a53dc9b7", 900, 1000),
  },

  // Números que generan confianza (se animan al aparecer)
  logros: [
    { valor: 11, sufijo: "", texto: "años recibiendo viajeros" },
    { valor: 18, sufijo: "k", texto: "huéspedes de 40 países" },
    { valor: 9.1, sufijo: "", texto: "en Booking.com", decimales: 1 },
  ],

  // Frases de la cinta que se desplaza
  cinta: ["Aire acondicionado", "Piscina entre plantas", "Desayuno con frutas de la selva", "Recepción 24 h", "Tours a Tambopata", "A 3 cuadras de la Plaza"],

  // Íconos y nombres de las comodidades (se usan con su clave en cada habitación)
  amenidades: {
    aire: { nombre: "Aire acondicionado", icono: "ph-snowflake" },
    ventilador: { nombre: "Ventilador de techo", icono: "ph-fan" },
    wifi: { nombre: "Wi-Fi de fibra", icono: "ph-wifi-high" },
    bano: { nombre: "Baño privado con agua caliente", icono: "ph-shower" },
    banoCompartido: { nombre: "Baños compartidos con agua caliente", icono: "ph-shower" },
    tv: { nombre: "TV con cable", icono: "ph-television-simple" },
    desayuno: { nombre: "Desayuno incluido", icono: "ph-coffee" },
    mosquitero: { nombre: "Mosquitero", icono: "ph-bug" },
    casillero: { nombre: "Casillero con candado", icono: "ph-lock-key" },
    balcon: { nombre: "Balcón al jardín", icono: "ph-plant" },
    frigobar: { nombre: "Frigobar", icono: "ph-thermometer-cold" },
    escritorio: { nombre: "Escritorio de trabajo", icono: "ph-desk" },
    cuna: { nombre: "Cuna a pedido", icono: "ph-baby" },
  },

  /* Habitaciones
     - id: único y sin espacios (se usa para guardar la reserva)
     - precio: por noche de domingo a jueves · precioFinde: noches de viernes y sábado (opcional)
     - precioApps: lo que cuesta en Booking/Airbnb (opcional). Se muestra tachado: "reserva directo y ahorra".
     - porCama: true si se vende por cama (dormitorio compartido)
     - unidades: cuántas habitaciones (o camas) de ese tipo tiene el hostal */
  habitaciones: [
    { id: "matrimonial", nombre: "Matrimonial con vista al jardín", corto: "Matrimonial", etiqueta: "La más pedida",
      precio: 110, precioFinde: 125, precioApps: 129, capacidad: 2, camas: "1 cama queen", m2: 20, unidades: 6,
      descripcion: "Ventanal hacia el jardín, aire acondicionado silencioso y colchón queen. La favorita de las parejas que vienen a conocer Tambopata.",
      amenidades: ["aire", "bano", "desayuno", "wifi", "tv", "mosquitero", "frigobar"],
      imagenes: [foto("1774280954999-9758f11f3d41"), foto("1776500588044-e42853f74ae4")] },

    { id: "doble", nombre: "Doble con dos camas", corto: "Doble",
      precio: 120, precioFinde: 135, precioApps: 139, capacidad: 2, camas: "2 camas de 1½ plaza", m2: 22, unidades: 5,
      descripcion: "Dos camas amplias, mucha luz y vista a las palmeras. Ideal para amigos, colegas o mamá e hijo.",
      amenidades: ["aire", "bano", "desayuno", "wifi", "tv", "mosquitero", "escritorio"],
      imagenes: [foto("1776500587879-5f8acadf4a69"), foto("1737517302831-e7b8a8eaa97c")] },

    { id: "superior", nombre: "Superior con balcón", corto: "Superior", nuevo: true,
      precio: 150, precioFinde: 170, precioApps: 179, capacidad: 2, camas: "1 cama king", m2: 28, unidades: 3,
      descripcion: "Nuestra habitación más amplia: cama king, balcón privado sobre el jardín y baño con ducha de lluvia. Para una ocasión especial.",
      amenidades: ["aire", "balcon", "bano", "desayuno", "wifi", "tv", "frigobar", "escritorio"],
      imagenes: [foto("1776500587875-8a0653e9c10e"), foto("1596194789619-e0ff3e3f310a")] },

    { id: "familiar", nombre: "Familiar para 4", corto: "Familiar",
      precio: 190, precioFinde: 210, precioApps: 225, capacidad: 4, camas: "1 cama queen + 2 camas de 1 plaza", m2: 32, unidades: 2,
      descripcion: "Espacio para toda la familia sin separarse: cama queen, dos camas individuales y ventanales al bosque. Cuna gratis a pedido.",
      amenidades: ["aire", "bano", "desayuno", "wifi", "tv", "mosquitero", "cuna", "frigobar"],
      imagenes: [foto("1760067537116-de1f76fe8f95"), foto("1760067537740-faa11f7bdf1e")] },

    { id: "simple", nombre: "Simple con ventilador", corto: "Simple",
      precio: 65, precioFinde: 70, precioApps: 79, capacidad: 1, camas: "1 cama de 1½ plaza", m2: 12, unidades: 4,
      descripcion: "Cómoda, limpia y bien ubicada. Para el viajero de trabajo o de paso que solo necesita descansar bien.",
      amenidades: ["ventilador", "bano", "desayuno", "wifi", "mosquitero"],
      imagenes: [foto("1605346434674-a440ca4dc4c0"), foto("1664917555352-f3f66e57ccc2")] },

    { id: "compartido", nombre: "Cama en dormitorio compartido", corto: "Compartido", porCama: true,
      precio: 35, precioFinde: 38, precioApps: 42, capacidad: 1, camas: "1 cama en litera · dormitorio de 6", m2: 26, unidades: 12,
      descripcion: "Literas con cortina, luz de lectura y enchufe propio. Ambiente tranquilo de mochileros que vienen o van a la selva.",
      amenidades: ["aire", "banoCompartido", "casillero", "desayuno", "wifi"],
      imagenes: [foto("1709805619372-40de3f158e83"), foto("1555854877-bab0e564b8d5")] },
  ],

  /* Extras que el huésped puede sumar a su reserva
     cobro: "unico" (una vez) · "noche" (por noche) · "personaNoche" (por huésped y por noche)
     gratisDesdeNoches: el extra sale gratis si la estadía llega a esas noches (opcional) */
  extras: [
    { id: "recojo", nombre: "Recojo del aeropuerto", detalle: "Te esperamos con tu nombre", precio: 25, cobro: "unico", gratisDesdeNoches: 3, icono: "ph-airplane-landing" },
    { id: "retorno", nombre: "Traslado al aeropuerto", detalle: "El día de tu salida", precio: 25, cobro: "unico", icono: "ph-airplane-takeoff" },
    { id: "latecheckout", nombre: "Salida tarde", detalle: "Quédate hasta las 6 p. m.", precio: 40, cobro: "unico", icono: "ph-clock-afternoon" },
    { id: "lavanderia", nombre: "Lavandería", detalle: "Hasta 3 kg, lista en el día", precio: 15, cobro: "unico", icono: "ph-t-shirt" },
  ],

  // Tours con nuestro operador aliado. El precio es por persona.
  operador: "Selva Viva Expediciones (operador autorizado por DIRCETUR)",
  tours: [
    { id: "sandoval", nombre: "Lago Sandoval", etiqueta: "El más pedido", precio: 180, duracion: "Día completo · 6 a. m. a 4 p. m.",
      descripcion: "Bote por el río Madre de Dios, caminata de 3 km por la Reserva Tambopata y canoa por el lago entre palmeras de aguaje.",
      fauna: ["Lobo de río", "Guacamayos", "Monos", "Caimanes"],
      incluye: "Guía bilingüe, bote, entrada a la reserva y almuerzo",
      imagen: foto("1699902647748-a69d908a58dc", 700, 520) },
    { id: "monos", nombre: "Isla de los Monos", precio: 70, duracion: "Medio día · 3 h",
      descripcion: "Paseo en bote por la confluencia de los ríos Tambopata y Madre de Dios hasta una isla con monos en libertad.",
      fauna: ["Monos capuchinos", "Monos ardilla", "Aves"],
      incluye: "Guía, bote y agua",
      imagen: foto("1699902647194-1c66f3a61348", 700, 520) },
    { id: "caimanes", nombre: "Caimanes de noche", precio: 80, duracion: "Noche · 6 p. m. a 9 p. m.",
      descripcion: "Salida en bote al anochecer con linterna para buscar caimanes, aves nocturnas y escuchar la selva despertar.",
      fauna: ["Caimanes", "Ranas", "Aves nocturnas"],
      incluye: "Guía, bote, linternas y chaleco",
      imagen: foto("1734793807954-09057dabb1bb", 700, 520) },
    { id: "collpa", nombre: "Collpa de guacamayos", precio: 650, duracion: "2 días / 1 noche",
      descripcion: "Viaje río arriba hasta una collpa donde cientos de guacamayos y loros bajan al amanecer a comer arcilla. Una noche en albergue.",
      fauna: ["Guacamayos", "Loros", "Tapir (con suerte)"],
      incluye: "Transporte, guía, albergue, todas las comidas y entradas",
      imagen: foto("1551189013-03cf5bc1c73c", 700, 520) },
  ],

  // Galería de áreas comunes. grande: true ocupa más espacio en la cuadrícula.
  instalaciones: [
    { nombre: "Piscina entre plantas", icono: "ph-swimming-pool", grande: true, imagen: foto("1506812428898-fe5a708f5359", 900, 900) },
    { nombre: "Hamacas en el jardín", icono: "ph-tree-palm", imagen: foto("1596908439454-a183bdad0213", 600, 600) },
    { nombre: "Desayuno con frutas", icono: "ph-coffee", imagen: foto("1687877465679-8020c83c75c1", 600, 600) },
    { nombre: "Patio para conversar", icono: "ph-plant", imagen: foto("1644093128192-3abfd57c4a99", 600, 600) },
    { nombre: "Recepción 24 horas", icono: "ph-bell-simple", imagen: foto("1759038085950-1234ca8f5fed", 600, 600) },
  ],
  servicios: [
    { nombre: "Recepción 24 h", icono: "ph-bell-simple" },
    { nombre: "Guardamos tu equipaje", icono: "ph-suitcase-rolling" },
    { nombre: "Wi-Fi de fibra en todo el hostal", icono: "ph-wifi-high" },
    { nombre: "Agua filtrada gratis", icono: "ph-drop" },
    { nombre: "Lavandería", icono: "ph-washing-machine" },
    { nombre: "Cochera para motos", icono: "ph-motorcycle" },
  ],

  // Lugares cercanos (ayuda mucho al viajero que no conoce la ciudad)
  cerca: [
    { lugar: "Plaza de Armas", tiempo: "4 min a pie", icono: "ph-tree" },
    { lugar: "Mercado Modelo", tiempo: "6 min a pie", icono: "ph-basket" },
    { lugar: "Embarcadero del río Madre de Dios", tiempo: "8 min a pie", icono: "ph-boat" },
    { lugar: "Mirador del Obelisco", tiempo: "12 min a pie", icono: "ph-binoculars" },
    { lugar: "Terminal terrestre", tiempo: "10 min en mototaxi", icono: "ph-bus" },
    { lugar: "Aeropuerto Padre Aldámiz", tiempo: "15 min en auto", icono: "ph-airplane" },
  ],

  // Usa reseñas REALES del cliente (copiadas de Google o Booking)
  testimonios: [
    { nombre: "Claire D.", pais: "Francia", fuente: "Booking.com", estrellas: 5, estadia: "Matrimonial · 3 noches · en pareja",
      texto: "Nos recogieron en el aeropuerto y nos ayudaron a organizar el tour a Sandoval. El aire acondicionado fue una bendición después de la selva." },
    { nombre: "Jorge R.", pais: "Lima", fuente: "Google", estrellas: 5, estadia: "Familiar · 4 noches · en familia",
      texto: "Mis hijos no querían salir de la piscina. Habitación amplia, limpia y el desayuno con frutas de la zona, riquísimo." },
    { nombre: "Lukas M.", pais: "Alemania", fuente: "Booking.com", estrellas: 5, estadia: "Compartido · 2 noches · solo",
      texto: "El mejor hostal de mi viaje por Perú. Ambiente tranquilo, Wi-Fi rápido y el personal habla inglés." },
    { nombre: "Patricia V.", pais: "Cusco", fuente: "Google", estrellas: 4, estadia: "Simple · 1 noche · trabajo",
      texto: "Llegué de madrugada en bus y me atendieron sin problema. Cerca de todo, volveré en mi próximo viaje de trabajo." },
  ],

  // Políticas del hostal (se muestran como tarjetas)
  politicas: [
    { icono: "ph-sign-in", titulo: "Entrada", texto: "Desde la 1 p. m. Si llegas antes, guardamos tu equipaje y puedes usar la piscina." },
    { icono: "ph-sign-out", titulo: "Salida", texto: "Hasta las 11 a. m. Pide salida tarde si tu vuelo es en la noche." },
    { icono: "ph-calendar-x", titulo: "Cambios y cancelación", texto: "Sin costo hasta 48 horas antes. Después se retiene el adelanto." },
    { icono: "ph-identification-card", titulo: "Documentos", texto: "DNI o pasaporte de todos los huéspedes. Los menores van con sus padres." },
    { icono: "ph-baby", titulo: "Niños", texto: "Menores de 5 años no pagan si duermen con sus padres. Cuna gratis." },
    { icono: "ph-cigarette-slash", titulo: "Hostal libre de humo", texto: "No se fuma en habitaciones. Mascotas pequeñas, consúltanos antes." },
  ],

  preguntas: [
    { p: "¿Cómo confirmo mi reserva?",
      r: "Envíanos tu solicitud por WhatsApp desde esta página. Te confirmamos la disponibilidad en minutos y, para asegurarla, pagas el 50% de adelanto por Yape, Plin o transferencia. El resto lo pagas al llegar." },
    { p: "¿Por qué es más barato reservar directo?",
      r: "Porque no pagamos comisión a las apps de reserva. Ese ahorro te lo damos a ti en el precio, y además tienes recojo gratis del aeropuerto desde 3 noches." },
    { p: "¿Cómo llego desde el aeropuerto o el terminal?",
      r: "Del aeropuerto son unos 15 minutos. Si lo agregas a tu reserva te esperamos con un cartel con tu nombre. Desde el terminal terrestre, cualquier mototaxi te trae en 10 minutos por unos S/ 5." },
    { p: "¿Puedo llegar de madrugada?",
      r: "Sí, la recepción atiende las 24 horas. Si tu bus llega de madrugada, avísanos tu hora y te dejamos la habitación lista. La noche anterior se cobra si quieres entrar antes de la 1 p. m." },
    { p: "¿Ustedes organizan los tours?",
      r: "Trabajamos con un operador autorizado que te recoge en el hostal. Puedes agregarlos a tu reserva o decidir cuando llegues: te asesoramos según los días que tengas." },
    { p: "¿Necesito vacuna contra la fiebre amarilla?",
      r: "Se recomienda para visitar la selva de Madre de Dios. Póntela al menos 10 días antes del viaje en cualquier centro de salud. Trae también repelente y ropa de manga larga para los tours." },
  ],
};
