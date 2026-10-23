/* ==========================================================
   Landing de hostal · lógica
   Lee los datos de CONFIG (js/config.js) y arma la página.
   ========================================================== */
(function () {
  "use strict";

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const soles = (n) => "S/ " + (Number.isInteger(n) ? n : n.toFixed(2));   // para la página
  const solesExacto = (n) => "S/ " + n.toFixed(2);                          // para el mensaje
  const redondear = (n) => Math.round(n * 100) / 100;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const waLink = (msg) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent((CONFIG.demo ? "[Demo ALXZ//] " : "") + msg)}`;
  const estrellas = (n) => `${"★".repeat(Math.round(n))}<span class="vacia">${"★".repeat(5 - Math.round(n))}</span>`;
  const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
  const FALLBACK_HAB = "images/habitaciones/habitacion.svg";
  const FALLBACK_TOUR = "images/habitaciones/tour.svg";
  const FALLBACK_LUGAR = "images/habitaciones/instalacion.svg";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const HABS = new Map(CONFIG.habitaciones.map((h) => [h.id, h]));
  const TOURS = new Map(CONFIG.tours.map((t) => [t.id, t]));
  const EXTRAS = new Map(CONFIG.extras.map((x) => [x.id, x]));
  const AMEN = CONFIG.amenidades;
  const MAX_NOCHES = 30, MAX_HUESPEDES = 16;

  /* ---------- 0. Si una foto no carga, usar la ilustración de respaldo ---------- */
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (img.tagName === "IMG" && img.dataset.fallback && !img.src.endsWith(img.dataset.fallback)) img.src = img.dataset.fallback;
  }, true);
  $$("img[data-fallback]").forEach((img) => { if (img.complete && img.naturalWidth === 0 && img.src) img.src = img.dataset.fallback; });

  /* ---------- 1. Fechas (todo en hora de Perú, fechas como "AAAA-MM-DD") ---------- */
  const hoyLima = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date());
  const aUTC = (f) => new Date(f + "T00:00:00Z");
  const sumarDias = (f, n) => { const d = aUTC(f); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const difDias = (a, b) => Math.round((aUTC(b) - aUTC(a)) / 86400000);
  const esFecha = (f) => /^\d{4}-\d{2}-\d{2}$/.test(f || "") && !isNaN(aUTC(f));
  const fmt = (f, opciones) => new Intl.DateTimeFormat("es-PE", { timeZone: "UTC", ...opciones }).format(aUTC(f)).replace(/\./g, "");
  const fechaCorta = (f) => fmt(f, { weekday: "short", day: "numeric", month: "short" });          // "vie 16 oct"
  const fechaLarga = (f) => fmt(f, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const formatoHora = (hhmm) => {
    let [h, m] = hhmm.split(":").map(Number);
    const sufijo = h >= 12 ? "p. m." : "a. m.";
    h = h % 12 || 12;
    return m === 0 ? `${h} ${sufijo}` : `${h}:${String(m).padStart(2, "0")} ${sufijo}`;
  };

  /* ---------- 2. Estado de la reserva (se guarda en el navegador) ---------- */
  const CLAVE = "hostal-" + CONFIG.nombre;
  const leer = (k, def) => { try { return JSON.parse(localStorage.getItem(`${CLAVE}-${k}`)) ?? def; } catch (_) { return def; } };
  const escribir = (k, v) => { try { localStorage.setItem(`${CLAVE}-${k}`, JSON.stringify(v)); } catch (_) { /* almacenamiento no disponible */ } };

  const est = (() => {
    const guardado = leer("estadia", {});
    const hoy = hoyLima();
    const llegada = esFecha(guardado.llegada) && guardado.llegada >= hoy ? guardado.llegada : hoy;
    let salida = esFecha(guardado.salida) ? guardado.salida : sumarDias(llegada, 1);
    if (difDias(llegada, salida) < 1 || difDias(llegada, salida) > MAX_NOCHES) salida = sumarDias(llegada, 1);
    const huespedes = Math.min(MAX_HUESPEDES, Math.max(1, Number(guardado.huespedes) || 2));
    return { llegada, salida, huespedes };
  })();

  const reservaHab = new Map(leer("habitaciones", []).filter(([id, n]) => HABS.has(id) && n > 0)
    .map(([id, n]) => [id, Math.min(n, HABS.get(id).unidades)]));
  const reservaTours = new Map(leer("tours", []).filter(([id, n]) => TOURS.has(id) && n > 0));
  const extrasSel = new Set(leer("extras", []).filter((id) => EXTRAS.has(id)));
  const guardar = () => {
    escribir("estadia", est);
    escribir("habitaciones", [...reservaHab]);
    escribir("tours", [...reservaTours]);
    escribir("extras", [...extrasSel]);
  };

  /* ---------- 3. Precios ---------- */
  const noches = () => Array.from({ length: difDias(est.llegada, est.salida) }, (_, i) => sumarDias(est.llegada, i));
  const temporadaDe = (f) => CONFIG.temporadas.find((t) => f >= t.desde && f <= t.hasta);

  function precioNoche(h, f) {
    const dia = aUTC(f).getUTCDay();
    const finde = (dia === 5 || dia === 6) && Boolean(h.precioFinde);
    const base = finde ? h.precioFinde : h.precio;
    const t = temporadaDe(f);
    return { fecha: f, finde, temporada: t, precio: t ? Math.round(base * (1 + t.recargo / 100)) : base };
  }
  const detalleEstadia = (h) => noches().map((f) => precioNoche(h, f));
  const precioEstadia = (h) => detalleEstadia(h).reduce((s, n) => s + n.precio, 0);

  const promo = CONFIG.promo;
  const finPromo = promo ? new Date(promo.fin).getTime() : 0;
  const promoVigente = () => Boolean(promo) && Date.now() < finPromo;
  const promoAplica = () => promoVigente() && noches().length >= promo.minNoches;
  const conPromo = (monto) => (promoAplica() ? redondear(monto * (1 - promo.porcentaje / 100)) : monto);
  const ahorroApps = (h) => (h.precioApps ? Math.round((1 - h.precio / h.precioApps) * 100) : 0);

  function precioExtra(x) {
    const n = noches().length;
    if (x.gratisDesdeNoches && n >= x.gratisDesdeNoches) return 0;
    return { unico: 1, noche: n, personaNoche: n * est.huespedes }[x.cobro] * x.precio;
  }

  function calcular() {
    const n = noches().length;
    let habitaciones = 0, capacidad = 0, unidades = 0;
    reservaHab.forEach((cant, id) => {
      const h = HABS.get(id);
      habitaciones += cant * precioEstadia(h);
      capacidad += cant * h.capacidad;
      unidades += cant;
    });
    const descuento = promoAplica() ? redondear(habitaciones * promo.porcentaje / 100) : 0;
    let tours = 0;
    reservaTours.forEach((personas, id) => { tours += personas * TOURS.get(id).precio; });
    const extras = reservaHab.size ? [...extrasSel].reduce((s, id) => s + precioExtra(EXTRAS.get(id)), 0) : 0;
    const total = redondear(habitaciones - descuento + tours + extras);
    const adelanto = redondear(total * CONFIG.adelanto / 100);
    return { n, habitaciones, descuento, tours, extras, total, adelanto, capacidad, unidades, items: reservaHab.size + reservaTours.size };
  }

  /* ---------- 4. Datos generales ---------- */
  $$("[data-config]").forEach((el) => { el.textContent = CONFIG[el.dataset.config]; });
  // Logo: primera palabra normal, el resto en cursiva dorada
  $$("[data-logo]").forEach((el) => {
    const [primera, ...resto] = CONFIG.nombre.split(" ");
    el.innerHTML = resto.length ? `${esc(primera)} <em>${esc(resto.join(" "))}</em>` : esc(primera);
  });
  $$("[data-wa]").forEach((a) => {
    a.href = waLink(a.dataset.wa || `Hola ${CONFIG.nombre}, quiero hacer una consulta.`);
    a.target = "_blank";
    a.rel = "noopener";
  });
  $$("[data-red]").forEach((a) => {
    const url = CONFIG.redes[a.dataset.red];
    if (url) a.href = url; else a.remove();
  });
  $("#tel").href = "tel:" + CONFIG.telefono.replace(/\s/g, "");
  $("#email").href = "mailto:" + CONFIG.email;
  $("#anio").textContent = new Date().getFullYear();

  const direccionCompleta = `${CONFIG.direccion}, ${CONFIG.ciudad}, ${CONFIG.region}`;
  $("#direccion").textContent = direccionCompleta;
  $("#footer-direccion").textContent = direccionCompleta;
  $("#select-pago").innerHTML = CONFIG.pagos.map((p) => `<option>${esc(p)}</option>`).join("");
  $("#operador").textContent = CONFIG.operador;
  $("#estado").textContent = "Recepción abierta las 24 horas";

  // Beneficios de reservar directo
  const maxAhorro = Math.max(0, ...CONFIG.habitaciones.map(ahorroApps));
  if (maxAhorro) $("#ben-ahorro").textContent = `Ahorra hasta ${maxAhorro}%`;
  const recojo = EXTRAS.get("recojo");
  $("#ben-recojo").textContent = recojo?.gratisDesdeNoches ? `Del aeropuerto, desde ${recojo.gratisDesdeNoches} noches` : "Te esperamos en el aeropuerto";
  $("#ben-cambios").textContent = `Hasta ${CONFIG.cancelacionHoras} horas antes de llegar`;
  $("#ben-adelanto").textContent = CONFIG.adelanto;
  $("#ben-pagos").textContent = CONFIG.pagos.slice(0, 3).join(" · ") + "; el resto al llegar";
  $("#nota-pago").textContent = `No pagas aquí: te confirmamos la disponibilidad y te enviamos los datos para el adelanto (${CONFIG.adelanto}%) por WhatsApp.`;

  $("#footer-horarios").innerHTML = [
    ["ph-sign-in", `Entrada desde ${formatoHora(CONFIG.checkin)}`],
    ["ph-sign-out", `Salida hasta ${formatoHora(CONFIG.checkout)}`],
    ["ph-bell-simple", "Recepción 24 horas"],
  ].map(([i, t]) => `<li><i class="ph ${i}" aria-hidden="true"></i><span>${t}</span></li>`).join("");
  $("#footer-habitaciones").innerHTML = CONFIG.habitaciones.map((h) =>
    `<li><i class="ph ph-bed" aria-hidden="true"></i><button type="button" data-abrir="${h.id}">${esc(h.corto || h.nombre)}</button></li>`).join("");

  // Anuncio: varios mensajes que rotan
  const anuncios = CONFIG.anuncios || [];
  if (!anuncios.length) $("#anuncio").remove();
  else {
    const txt = $("#anuncio-txt");
    let i = 0;
    txt.textContent = anuncios[0];
    if (anuncios.length > 1 && !reduceMotion) {
      setInterval(() => {
        txt.classList.add("saliendo");
        setTimeout(() => { i = (i + 1) % anuncios.length; txt.textContent = anuncios[i]; txt.classList.remove("saliendo"); }, 350);
      }, 4500);
    }
  }

  // Calificaciones (hero + sección de opiniones)
  const ratings = CONFIG.ratings || [];
  $("#ratings").innerHTML = ratings.map((r) => `<a class="rating" href="#opiniones">
      <span class="rating__g"><i class="ph-fill ${r.icono}" aria-hidden="true"></i></span>
      <strong>${r.valor.toFixed(1)}</strong><span>/${r.max} · ${r.total} reseñas<span class="sr-only"> en ${esc(r.fuente)}</span></span></a>`).join("");
  $("#resumen-rating").innerHTML = ratings.map((r) => `<div class="resumen-rating__item">
      <span class="num">${r.valor.toFixed(1)}<small>/${r.max}</small></span>
      <span><span class="estrellas" role="img" aria-label="${r.valor} de ${r.max}">${estrellas(r.valor / r.max * 5)}</span><br><small>${r.total} reseñas en ${esc(r.fuente)}</small></span>
    </div>`).join("");

  // Cinta
  const cinta = CONFIG.cinta.map((t) => `${esc(t)} <i class="ph-fill ph-leaf"></i>`).join(" ");
  $("#cinta").innerHTML = `<span>${cinta}</span><span>${cinta}</span>`;

  /* ---------- 5. Selector de fechas y huéspedes (hay varios en la página, todos sincronizados) ---------- */
  function resumenFechas() {
    const n = noches().length;
    return `${fechaCorta(est.llegada)} → ${fechaCorta(est.salida)} · ${plural(n, "noche", "noches")} · ${plural(est.huespedes, "huésped", "huéspedes")}`;
  }

  function pintarFechas() {
    const hoy = hoyLima();
    $$('[data-fecha="llegada"]').forEach((i) => { i.min = hoy; i.max = sumarDias(hoy, 365); i.value = est.llegada; });
    $$('[data-fecha="salida"]').forEach((i) => { i.min = sumarDias(est.llegada, 1); i.max = sumarDias(est.llegada, MAX_NOCHES); i.value = est.salida; });
    $$("[data-huespedes-n]").forEach((s) => { s.textContent = est.huespedes; });
    $$('[data-huespedes="-1"]').forEach((b) => { b.disabled = est.huespedes <= 1; });
    $$('[data-huespedes="1"]').forEach((b) => { b.disabled = est.huespedes >= MAX_HUESPEDES; });
    $$("[data-resumen-fechas]").forEach((p) => { p.textContent = resumenFechas(); });
  }

  function cambiarFecha(campo, valor) {
    const hoy = hoyLima();
    if (!esFecha(valor)) return pintarFechas();          // campo borrado: se restaura
    if (campo === "llegada") {
      est.llegada = valor < hoy ? hoy : valor;
      const n = difDias(est.llegada, est.salida);
      if (n < 1 || n > MAX_NOCHES) est.salida = sumarDias(est.llegada, Math.max(1, Math.min(n, MAX_NOCHES)));
    } else {
      est.salida = valor;
      if (difDias(est.llegada, est.salida) < 1) est.salida = sumarDias(est.llegada, 1);
      if (difDias(est.llegada, est.salida) > MAX_NOCHES) est.salida = sumarDias(est.llegada, MAX_NOCHES);
    }
    alCambiarEstadia();
  }

  function alCambiarEstadia() {
    guardar();
    pintarFechas();
    pintarPrecios();
    actualizarReserva();
    if (hv.h) pintarVista();
  }

  document.addEventListener("change", (e) => {
    const campo = e.target.dataset?.fecha;
    if (campo) cambiarFecha(campo, e.target.value);
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-huespedes]");
    if (!b) return;
    est.huespedes = Math.min(MAX_HUESPEDES, Math.max(1, est.huespedes + Number(b.dataset.huespedes)));
    alCambiarEstadia();
  });

  const irA = (sel) => $(sel).scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  $("#buscador").addEventListener("submit", (e) => {
    e.preventDefault();
    irA("#habitaciones");
    avisar(`Precios para ${plural(noches().length, "noche", "noches")}`, "ph-calendar-check");
  });

  const modalFechas = $("#modal-fechas");
  const abrirFechas = () => modalFechas.showModal();
  $("#cambiar-fechas").addEventListener("click", abrirFechas);
  document.addEventListener("click", (e) => { if (e.target.closest("[data-abrir-fechas]")) abrirFechas(); });

  /* ---------- 6. Habitaciones: tarjetas, filtros y precios ---------- */
  const lista = $("#lista-habitaciones");
  const FILTROS = [
    { id: "todas", nombre: "Todas", icono: "ph-squares-four", f: () => true },
    { id: "pareja", nombre: "Parejas", icono: "ph-heart", f: (h) => h.capacidad === 2 },
    { id: "familia", nombre: "Familias", icono: "ph-users-three", f: (h) => h.capacidad >= 3 },
    { id: "solo", nombre: "Solo viajeros", icono: "ph-backpack", f: (h) => h.capacidad === 1 },
    { id: "aire", nombre: "Con aire", icono: "ph-snowflake", f: (h) => h.amenidades.includes("aire") },
    { id: "economicas", nombre: "Económicas", icono: "ph-piggy-bank", f: (h) => h.precio < 80 },
  ].filter((fl) => fl.id === "todas" || CONFIG.habitaciones.some(fl.f));
  let filtro = "todas";

  $("#filtros").innerHTML = FILTROS.map((fl) =>
    `<button type="button" class="chip" data-filtro-chip="${fl.id}" aria-pressed="${fl.id === "todas"}"><i class="ph ${fl.icono}" aria-hidden="true"></i>${esc(fl.nombre)}</button>`).join("");

  function tagsHTML(h) {
    const tags = [];
    if (h.etiqueta) tags.push(`<span class="tag tag--top"><i class="ph-fill ph-star"></i>${esc(h.etiqueta)}</span>`);
    if (h.nuevo) tags.push('<span class="tag tag--nuevo">Nueva</span>');
    if (ahorroApps(h)) tags.push(`<span class="tag tag--directo">-${ahorroApps(h)}% directo</span>`);
    return tags.slice(0, 2).join("");
  }
  const amenIcono = (k) => (AMEN[k] ? `<li title="${esc(AMEN[k].nombre)}"><i class="ph ${AMEN[k].icono}" aria-hidden="true"></i><span class="sr-only">${esc(AMEN[k].nombre)}</span></li>` : "");

  lista.innerHTML = CONFIG.habitaciones.map((h, i) => {
    const [a, b] = h.imagenes;
    const extra = h.amenidades.length - 5;
    return `<li class="hab" data-id="${h.id}" data-aos="fade-up" data-aos-delay="${(i % 3) * 70}">
      <div class="hab__media">
        <button class="hab__abrir" type="button" data-abrir="${h.id}" aria-label="Ver ${esc(h.nombre)}: fotos y precios">
          <img class="img-1${b ? " tiene-2" : ""}" src="${esc(a)}" data-fallback="${FALLBACK_HAB}" alt="${esc(h.nombre)}" width="800" height="600" loading="lazy" decoding="async">
          ${b ? `<img class="img-2" src="${esc(b)}" alt="" width="800" height="600" loading="lazy" decoding="async">` : ""}
        </button>
        <span class="tags">${tagsHTML(h)}</span>
        <span class="hab__cap"><i class="ph-fill ph-users" aria-hidden="true"></i>${h.porCama ? "Por cama" : `Hasta ${h.capacidad}`}</span>
      </div>
      <div class="hab__cuerpo">
        <h3 class="hab__nombre">${esc(h.nombre)}</h3>
        <p class="hab__camas"><i class="ph ph-bed" aria-hidden="true"></i>${esc(h.camas)} · ${h.m2} m²</p>
        <ul class="hab__amen" aria-label="Incluye">${h.amenidades.slice(0, 5).map(amenIcono).join("")}${extra > 0 ? `<li class="hab__mas">+${extra}</li>` : ""}</ul>
        <div class="hab__precio" data-precio-hab="${h.id}"></div>
        <div class="hab__acciones">
          <button class="btn btn--add" type="button" data-abrir="${h.id}"><i class="ph ph-images" aria-hidden="true"></i>Ver</button>
          <button class="btn btn--primario" type="button" data-agregar-hab="${h.id}"><i class="ph ph-calendar-plus" aria-hidden="true"></i><span>Reservar</span></button>
        </div>
      </div>
    </li>`;
  }).join("");

  function pintarPrecios() {
    const n = noches().length;
    $$("[data-precio-hab]").forEach((el) => {
      const h = HABS.get(el.dataset.precioHab);
      const total = conPromo(precioEstadia(h));
      const porNoche = Math.round(total / n);
      const apps = h.precioApps ? h.precioApps * n : 0;
      el.innerHTML = `
        <div class="hab__total">
          <strong>${soles(total)}</strong>
          ${apps > total ? `<s title="Precio en apps de reserva">${soles(apps)}</s>` : ""}
        </div>
        <small>${n === 1 ? `1 noche${h.porCama ? " · por cama" : ""}` : `${n} noches · ${soles(porNoche)} por noche${h.porCama ? " por cama" : ""}`}${promoAplica() ? ` · <b>incluye -${promo.porcentaje}%</b>` : ""}</small>`;
    });
    $$("[data-agregar-hab]").forEach((b) => {
      const en = reservaHab.has(b.dataset.agregarHab);
      b.classList.toggle("en-reserva", en);
      b.lastElementChild.textContent = en ? "En tu reserva" : "Reservar";
      b.firstElementChild.className = `ph ${en ? "ph-check-circle" : "ph-calendar-plus"}`;
    });

    // Aviso para grupos grandes
    const aviso = $("#aviso-grupo");
    const maxCap = Math.max(...CONFIG.habitaciones.map((h) => h.capacidad));
    aviso.hidden = est.huespedes <= maxCap;
    aviso.innerHTML = `<i class="ph ph-users-three" aria-hidden="true"></i><span>Son ${est.huespedes} huéspedes: combina varias habitaciones en tu reserva o <a href="${waLink(`Hola, somos un grupo de ${est.huespedes} personas del ${fechaCorta(est.llegada)} al ${fechaCorta(est.salida)}. ¿Qué habitaciones nos recomiendan?`)}" target="_blank" rel="noopener">pídenos una tarifa de grupo</a>.</span>`;
  }

  function aplicarFiltro() {
    const fl = FILTROS.find((x) => x.id === filtro);
    let visibles = 0;
    $$(".hab", lista).forEach((li) => {
      const ok = fl.f(HABS.get(li.dataset.id));
      li.hidden = !ok;
      if (ok) visibles++;
    });
    $("#sin-resultados").hidden = visibles > 0;
    if (window.AOS) AOS.refresh();
  }
  $("#filtros").addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    filtro = b.dataset.filtroChip;
    $$(".chip", $("#filtros")).forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
    $("#filtros").scrollTo({ left: b.offsetLeft - ($("#filtros").clientWidth - b.offsetWidth) / 2, behavior: "smooth" });
    aplicarFiltro();
  });

  // Cantidad sugerida: en el dormitorio compartido, una cama por huésped
  const cantidadSugerida = (h) => reservaHab.get(h.id) || (h.porCama ? Math.min(est.huespedes, h.unidades) : 1);

  lista.addEventListener("click", (e) => {
    const b = e.target.closest("[data-agregar-hab]");
    if (!b) return;
    const h = HABS.get(b.dataset.agregarHab);
    if (reservaHab.has(h.id)) return abrirReserva();
    reservaHab.set(h.id, cantidadSugerida(h));
    guardar();
    actualizarReserva();
    pop($("#reserva-btn"));
    avisar(`${h.corto || h.nombre} agregada a tu reserva`);
  });

  /* ---------- 7. Vista de la habitación ---------- */
  const modalHab = $("#modal-hab");
  const hv = { h: null, foto: 0, cantidad: 1 };

  function abrirHab(id) {
    const h = HABS.get(id);
    if (!h) return;
    Object.assign(hv, { h, foto: 0, cantidad: cantidadSugerida(h) });
    $("#hv-nombre").textContent = h.nombre;
    $("#hv-desc").textContent = h.descripcion;
    $("#hv-tags").innerHTML = tagsHTML(h);
    $("#hv-datos").innerHTML = [
      ["ph-users", h.porCama ? "Se reserva por cama" : `Hasta ${plural(h.capacidad, "persona", "personas")}`],
      ["ph-bed", h.camas],
      ["ph-frame-corners", `${h.m2} m²`],
    ].map(([i, t]) => `<li><i class="ph ${i}" aria-hidden="true"></i>${esc(t)}</li>`).join("");
    $("#hv-amenidades").innerHTML = h.amenidades.filter((k) => AMEN[k]).map((k) =>
      `<li><i class="ph ${AMEN[k].icono}" aria-hidden="true"></i>${esc(AMEN[k].nombre)}</li>`).join("");
    $("#hv-unidades").textContent = `Tenemos ${plural(h.unidades, h.porCama ? "cama" : "habitación", h.porCama ? "camas" : "habitaciones")} de este tipo. Te confirmamos la disponibilidad por WhatsApp.`;
    pintarVista();
    if (!modalHab.open) modalHab.showModal();
    modalHab.querySelector(".modal__panel").scrollTop = 0;
  }

  function pintarVista() {
    const { h } = hv;
    const fotos = h.imagenes;
    const img = $("#hv-img");
    img.src = fotos[hv.foto];
    img.alt = `${h.nombre}, foto ${hv.foto + 1} de ${fotos.length}`;
    img.dataset.fallback = FALLBACK_HAB;
    $("#hv-prev").hidden = $("#hv-sig").hidden = fotos.length < 2;
    $("#hv-miniaturas").innerHTML = fotos.length > 1 ? fotos.map((f, i) =>
      `<button type="button" data-hv-foto="${i}" aria-label="Foto ${i + 1}" aria-current="${i === hv.foto}"><img src="${esc(f)}" alt="" loading="lazy"></button>`).join("") : "";

    // Precio de cada noche
    const detalle = detalleEstadia(h);
    $("#hv-noches").innerHTML = detalle.map((d) => `<li>
        <span>${fechaCorta(d.fecha)}${d.temporada ? ` <em class="noche-tag noche-tag--temporada">${esc(d.temporada.nombre)}</em>` : d.finde ? ' <em class="noche-tag">fin de semana</em>' : ""}</span>
        <strong>${soles(d.precio)}</strong></li>`).join("");
    const unidad = h.porCama ? ["cama", "camas"] : ["habitación", "habitaciones"];
    const bruto = hv.cantidad * detalle.reduce((s, d) => s + d.precio, 0);
    const neto = conPromo(bruto);
    const apps = h.precioApps ? h.precioApps * detalle.length * hv.cantidad : 0;
    $("#hv-total").innerHTML = `
      ${promoAplica() ? `<div class="hv__linea"><span>${plural(hv.cantidad, unidad[0], unidad[1])} × ${plural(detalle.length, "noche", "noches")}</span><span>${soles(bruto)}</span></div>
        <div class="hv__linea hv__linea--promo"><span>${esc(promo.titulo)} (-${promo.porcentaje}%)</span><span>-${soles(redondear(bruto - neto))}</span></div>` : ""}
      <div class="hv__linea hv__linea--total"><span>Total${promoAplica() ? "" : ` · ${plural(hv.cantidad, unidad[0], unidad[1])} × ${plural(detalle.length, "noche", "noches")}`}</span><strong>${soles(neto)}</strong></div>
      ${apps > neto ? `<p class="hv__ahorro"><i class="ph-fill ph-piggy-bank" aria-hidden="true"></i>En las apps pagarías ${soles(apps)}. Reservando directo ahorras ${soles(redondear(apps - neto))}.</p>` : ""}`;

    $("#hv-cantidad").textContent = hv.cantidad;
    $("#hv-menos").disabled = hv.cantidad <= 1;
    $("#hv-mas").disabled = hv.cantidad >= h.unidades;
    $("#hv-agregar").lastElementChild.textContent = reservaHab.has(h.id) ? "Actualizar mi reserva" : "Agregar a mi reserva";
    $("#hv-preguntar").href = waLink(`Hola ${CONFIG.nombre}, ¿tienen disponible ${hv.cantidad > 1 ? `${hv.cantidad} ${unidad[1]}` : "la habitación"} ${h.nombre} del ${fechaCorta(est.llegada)} al ${fechaCorta(est.salida)} para ${plural(est.huespedes, "persona", "personas")}?`);
  }

  const moverFoto = (paso) => { const n = hv.h.imagenes.length; hv.foto = (hv.foto + paso + n) % n; pintarVista(); };
  $("#hv-prev").addEventListener("click", () => moverFoto(-1));
  $("#hv-sig").addEventListener("click", () => moverFoto(1));
  $("#hv-miniaturas").addEventListener("click", (e) => { const b = e.target.closest("[data-hv-foto]"); if (b) { hv.foto = Number(b.dataset.hvFoto); pintarVista(); } });
  // Deslizar con el dedo para cambiar de foto
  let toqueX = null;
  $(".hv__principal").addEventListener("touchstart", (e) => { toqueX = e.touches[0].clientX; }, { passive: true });
  $(".hv__principal").addEventListener("touchend", (e) => {
    if (toqueX === null) return;
    const dx = e.changedTouches[0].clientX - toqueX;
    if (Math.abs(dx) > 40 && hv.h.imagenes.length > 1) moverFoto(dx < 0 ? 1 : -1);
    toqueX = null;
  });
  modalHab.addEventListener("keydown", (e) => {
    if (e.target.closest("input, select, textarea")) return;
    if (e.key === "ArrowRight") moverFoto(1);
    if (e.key === "ArrowLeft") moverFoto(-1);
  });
  $("#hv-menos").addEventListener("click", () => { hv.cantidad = Math.max(1, hv.cantidad - 1); pintarVista(); });
  $("#hv-mas").addEventListener("click", () => { hv.cantidad = Math.min(hv.h.unidades, hv.cantidad + 1); pintarVista(); });
  $("#hv-agregar").addEventListener("click", () => {
    const { h } = hv;
    const habia = reservaHab.has(h.id);
    reservaHab.set(h.id, hv.cantidad);
    guardar();
    actualizarReserva();
    pintarPrecios();
    modalHab.close();
    pop($("#reserva-btn"));
    avisar(habia ? "Reserva actualizada" : `${h.corto || h.nombre} agregada a tu reserva`);
  });

  // Compartir el enlace directo a la habitación
  $("#hv-compartir").addEventListener("click", async () => {
    const url = `${location.origin}${location.pathname}#habitacion-${hv.h.id}`;
    const texto = $("#hv-compartir span");
    try {
      if (navigator.share) { await navigator.share({ title: hv.h.nombre, text: `Mira esta habitación de ${CONFIG.nombre}`, url }); return; }
      await navigator.clipboard.writeText(url);
      texto.textContent = "¡Enlace copiado!";
    } catch (_) {
      texto.textContent = "No se pudo copiar";
    }
    setTimeout(() => { texto.textContent = "Compartir"; }, 2000);
  });

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-abrir]");
    if (b) abrirHab(b.dataset.abrir);
  });

  /* ---------- 8. Promo con cuenta regresiva ---------- */
  if (!promoVigente()) {
    $("#promo").remove();
  } else {
    $("#promo-titulo").textContent = promo.titulo;
    $("#promo-texto").textContent = promo.texto;
    $("#promo-pct").textContent = `${promo.porcentaje}% menos`;
    $("#promo-noches").textContent = promo.minNoches;
    $("#promo-sello-n").textContent = promo.minNoches;
    $("#promo-sello").textContent = `-${promo.porcentaje}%`;
    $("#promo-img").src = promo.imagen;
    $("#promo-img").alt = promo.titulo;
    $("#promo-usar").addEventListener("click", () => {
      // Ajusta la estadía al mínimo de la promo y abre las fechas para confirmarlas
      if (noches().length < promo.minNoches) {
        est.salida = sumarDias(est.llegada, promo.minNoches);
        alCambiarEstadia();
      }
      abrirFechas();
    });
    const unidades = Object.fromEntries($$("#cuenta [data-u]").map((el) => [el.dataset.u, el]));
    const tic = () => {
      const resta = finPromo - Date.now();
      if (resta <= 0) { $("#promo").remove(); clearInterval(timer); alCambiarEstadia(); return; }
      const s = Math.floor(resta / 1000);
      const valores = { d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60 };
      Object.entries(valores).forEach(([u, v]) => { unidades[u].textContent = String(v).padStart(2, "0"); });
    };
    const timer = setInterval(tic, 1000);
    tic();
  }

  /* ---------- 9. Instalaciones y servicios ---------- */
  $("#mosaico").innerHTML = CONFIG.instalaciones.map((x, i) => `
    <figure class="mosaico__item${x.grande ? " mosaico__item--grande" : ""}" data-aos="fade-up" data-aos-delay="${i * 60}">
      <img src="${esc(x.imagen)}" data-fallback="${FALLBACK_LUGAR}" alt="${esc(x.nombre)}" loading="lazy" decoding="async">
      <figcaption><i class="ph-fill ${x.icono}" aria-hidden="true"></i>${esc(x.nombre)}</figcaption>
    </figure>`).join("");
  $("#servicios").innerHTML = CONFIG.servicios.map((s) =>
    `<li><i class="ph ${s.icono}" aria-hidden="true"></i>${esc(s.nombre)}</li>`).join("");

  /* ---------- 10. Tours ---------- */
  $("#lista-tours").innerHTML = CONFIG.tours.map((t, i) => `
    <li class="tour" data-aos="fade-up" data-aos-delay="${(i % 4) * 70}">
      <div class="tour__media">
        <img src="${esc(t.imagen)}" data-fallback="${FALLBACK_TOUR}" alt="${esc(t.nombre)}" loading="lazy" decoding="async" width="700" height="520">
        ${t.etiqueta ? `<span class="tag tag--top"><i class="ph-fill ph-star"></i>${esc(t.etiqueta)}</span>` : ""}
        <span class="tour__duracion"><i class="ph ph-clock" aria-hidden="true"></i>${esc(t.duracion)}</span>
      </div>
      <div class="tour__cuerpo">
        <h3>${esc(t.nombre)}</h3>
        <p>${esc(t.descripcion)}</p>
        <ul class="fauna" aria-label="Lo que puedes ver">${t.fauna.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
        <p class="tour__incluye"><i class="ph ph-check-circle" aria-hidden="true"></i><span>${esc(t.incluye)}</span></p>
        <div class="tour__pie">
          <div class="tour__precio"><strong>${soles(t.precio)}</strong><small>por persona</small></div>
          <button class="btn btn--dorado" type="button" data-tour="${t.id}" aria-pressed="false"><i class="ph ph-plus" aria-hidden="true"></i><span>Agregar</span></button>
        </div>
      </div>
    </li>`).join("");

  function pintarTours() {
    $$("[data-tour]").forEach((b) => {
      const en = reservaTours.has(b.dataset.tour);
      b.setAttribute("aria-pressed", String(en));
      b.firstElementChild.className = `ph ${en ? "ph-check" : "ph-plus"}`;
      b.lastElementChild.textContent = en ? "En tu reserva" : "Agregar";
    });
  }
  $("#lista-tours").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tour]");
    if (!b) return;
    const t = TOURS.get(b.dataset.tour);
    if (reservaTours.has(t.id)) {
      reservaTours.delete(t.id);
      avisar(`Quitaste ${t.nombre}`, "ph-minus-circle");
    } else {
      reservaTours.set(t.id, est.huespedes);
      pop($("#reserva-btn"));
      avisar(`${t.nombre} para ${plural(est.huespedes, "persona", "personas")}`);
    }
    guardar();
    actualizarReserva();
  });

  /* ---------- 11. Mi reserva ---------- */
  const drawer = $("#drawer");
  const form = $("#form-reserva");

  $("#extras").innerHTML = CONFIG.extras.map((x) => `
    <label class="extra">
      <input type="checkbox" name="extra" value="${x.id}">
      <span class="extra__ico"><i class="ph ${x.icono}" aria-hidden="true"></i></span>
      <span class="extra__txt"><strong>${esc(x.nombre)}</strong><small>${esc(x.detalle)}</small></span>
      <span class="extra__precio" data-extra-precio="${x.id}"></span>
    </label>`).join("");

  function actualizarReserva() {
    const c = calcular();
    const n = c.n;

    // Header y barra inferior
    $("#reserva-n").hidden = c.items === 0;
    $("#reserva-n").textContent = c.items;
    $("#barra").hidden = c.items === 0;
    $("#barra-detalle").textContent = [c.unidades ? plural(c.unidades, "hab.", "hab.") : "", plural(n, "noche", "noches"), reservaTours.size ? plural(reservaTours.size, "tour", "tours") : ""].filter(Boolean).join(" · ");
    $("#barra-total").textContent = soles(c.total);
    document.body.classList.toggle("con-pedido", c.items > 0);

    // Habitaciones
    $("#items-hab").innerHTML = [...reservaHab].map(([id, cant]) => {
      const h = HABS.get(id);
      const subtotal = cant * precioEstadia(h);
      return `<li class="item">
        <img src="${esc(h.imagenes[0])}" data-fallback="${FALLBACK_HAB}" alt="" loading="lazy">
        <div><strong>${esc(h.nombre)}</strong><small>${plural(cant, h.porCama ? "cama" : "habitación", h.porCama ? "camas" : "habitaciones")} · ${plural(n, "noche", "noches")}</small><small class="item__precio">${soles(subtotal)}</small></div>
        <div class="stepper">
          <button type="button" data-item="hab:${id}" data-op="-1" aria-label="Quitar una: ${esc(h.nombre)}"><i class="ph ph-${cant === 1 ? "trash" : "minus"}"></i></button>
          <span>${cant}</span>
          <button type="button" data-item="hab:${id}" data-op="1" aria-label="Agregar otra: ${esc(h.nombre)}" ${cant >= h.unidades ? "disabled" : ""}><i class="ph ph-plus"></i></button>
        </div>
      </li>`;
    }).join("");
    $("#vacio").hidden = reservaHab.size > 0;

    // ¿Entran todos?
    const avisoCap = $("#aviso-capacidad");
    const falta = reservaHab.size > 0 && c.capacidad < est.huespedes;
    avisoCap.innerHTML = falta
      ? `<i class="ph ph-warning-circle" aria-hidden="true"></i><span>Tus habitaciones son para ${plural(c.capacidad, "persona", "personas")} y son ${est.huespedes} huéspedes. Agrega otra habitación o elige una más grande.</span>`
      : "";

    // Tours
    $("#bloque-tours").hidden = reservaTours.size === 0;
    $("#items-tours").innerHTML = [...reservaTours].map(([id, personas]) => {
      const t = TOURS.get(id);
      return `<li class="item">
        <img src="${esc(t.imagen)}" data-fallback="${FALLBACK_TOUR}" alt="" loading="lazy">
        <div><strong>${esc(t.nombre)}</strong><small>${plural(personas, "persona", "personas")} · ${soles(t.precio)} c/u</small><small class="item__precio">${soles(personas * t.precio)}</small></div>
        <div class="stepper">
          <button type="button" data-item="tour:${id}" data-op="-1" aria-label="Una persona menos: ${esc(t.nombre)}"><i class="ph ph-${personas === 1 ? "trash" : "minus"}"></i></button>
          <span>${personas}</span>
          <button type="button" data-item="tour:${id}" data-op="1" aria-label="Una persona más: ${esc(t.nombre)}" ${personas >= MAX_HUESPEDES ? "disabled" : ""}><i class="ph ph-plus"></i></button>
        </div>
      </li>`;
    }).join("");

    // Promo: cuántas noches faltan para el descuento
    const pp = $("#promo-progreso");
    pp.hidden = !promoVigente() || reservaHab.size === 0;
    if (!pp.hidden) {
      const faltan = promo.minNoches - n;
      pp.classList.toggle("listo", faltan <= 0);
      pp.innerHTML = faltan > 0
        ? `<i class="ph ph-leaf" aria-hidden="true"></i><span>Quédate <strong>${plural(faltan, "noche", "noches")} más</strong> y tus habitaciones salen ${promo.porcentaje}% más baratas.</span><button type="button" class="link-btn" id="sumar-noches">Sumar</button>`
        : `<i class="ph-fill ph-check-circle" aria-hidden="true"></i><span>¡Tienes ${promo.porcentaje}% de descuento por ${esc(promo.titulo)}!</span>`;
    }

    // Extras
    $(".extras").hidden = reservaHab.size === 0;
    $$("[name=extra]", form).forEach((cb) => { cb.checked = extrasSel.has(cb.value); });
    $$("[data-extra-precio]").forEach((el) => {
      const x = EXTRAS.get(el.dataset.extraPrecio);
      const p = precioExtra(x);
      el.innerHTML = p === 0 && x.gratisDesdeNoches
        ? `<b class="gratis">Gratis</b>`
        : `${soles(p)}${x.gratisDesdeNoches ? `<small>Gratis desde ${x.gratisDesdeNoches} noches</small>` : ""}`;
    });

    // Formulario y totales
    $("#checkout").hidden = c.items === 0;
    $("#drawer-pie").hidden = c.items === 0;
    $("#campo-vuelo").hidden = form.llegaPor.value !== "Avión";
    // Desglose en el cuerpo (se desplaza) y solo total + adelanto en el pie (siempre visible)
    const filasHTML = (filas) => filas.filter(Boolean).map(([dt, dd, cls]) => `<div class="${cls ? "totales__" + cls : ""}"><dt>${esc(dt)}</dt><dd>${dd}</dd></div>`).join("");
    $("#resumen").innerHTML = filasHTML([
      reservaHab.size ? [`Habitaciones (${plural(n, "noche", "noches")})`, soles(c.habitaciones)] : null,
      c.descuento ? [`${promo.titulo} (-${promo.porcentaje}%)`, "-" + soles(c.descuento), "descuento"] : null,
      reservaTours.size ? ["Tours", soles(c.tours)] : null,
      extrasSel.size && reservaHab.size ? ["Extras", c.extras ? soles(c.extras) : "Gratis"] : null,
    ]);
    $("#totales").innerHTML = filasHTML([
      ["Total", soles(c.total), "total"],
      [`Adelanto para confirmar (${CONFIG.adelanto}%)`, soles(c.adelanto), "adelanto"],
    ]);
  }

  // Botones +/− de la reserva (mantienen el foco tras redibujar)
  drawer.addEventListener("click", (e) => {
    if (e.target.closest("#sumar-noches")) {
      est.salida = sumarDias(est.llegada, promo.minNoches);
      return alCambiarEstadia();
    }
    const b = e.target.closest("[data-item][data-op]");
    if (!b) return;
    const [tipo, id] = b.dataset.item.split(":");
    const mapa = tipo === "hab" ? reservaHab : reservaTours;
    const max = tipo === "hab" ? HABS.get(id).unidades : MAX_HUESPEDES;
    const nuevo = Math.min(max, (mapa.get(id) || 0) + Number(b.dataset.op));
    if (nuevo > 0) mapa.set(id, nuevo); else mapa.delete(id);
    guardar();
    actualizarReserva();
    pintarPrecios();
    pintarTours();
    const { item, op } = b.dataset;
    requestAnimationFrame(() => {
      const mismo = $(`[data-item="${CSS.escape(item)}"][data-op="${op}"]:not(:disabled)`, drawer) || $(`[data-item="${CSS.escape(item)}"]`, drawer);
      (mismo || $("#drawer-titulo")).focus?.();
    });
  });

  form.addEventListener("change", (e) => {
    if (e.target.name === "extra") {
      if (e.target.checked) extrasSel.add(e.target.value); else extrasSel.delete(e.target.value);
      guardar();
      actualizarReserva();
    }
    if (e.target.name === "llegaPor") $("#campo-vuelo").hidden = e.target.value !== "Avión";
  });

  const abrirReserva = () => { actualizarReserva(); drawer.showModal(); };
  $("#barra").addEventListener("click", abrirReserva);
  $("#reserva-btn").addEventListener("click", abrirReserva);
  $("#vacio-ver").addEventListener("click", () => { drawer.close(); irA("#habitaciones"); });

  // Cerrar cualquier modal con su botón o tocando fuera del panel
  $$("dialog").forEach((d) => d.addEventListener("click", (e) => { if (e.target === d) d.close(); }));
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-cerrar]"); if (b) b.closest("dialog").close(); });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const c = calcular();
    if (!c.items) return;
    const v = (campo) => form[campo].value.trim();

    const requeridos = ["nombre", "docnum"];
    requeridos.forEach((r) => form[r].setAttribute("aria-invalid", String(!v(r))));
    const primero = requeridos.find((r) => !v(r));
    if (primero) return form[primero].focus();

    const n = c.n;
    const lineasHab = [...reservaHab].map(([id, cant]) => {
      const h = HABS.get(id);
      return `• ${cant} x ${h.nombre} — ${solesExacto(cant * precioEstadia(h))}`;
    });
    const lineasTours = [...reservaTours].map(([id, personas]) => {
      const t = TOURS.get(id);
      return `• ${t.nombre} x ${plural(personas, "persona", "personas")} — ${solesExacto(personas * t.precio)}`;
    });
    const lineasExtras = reservaHab.size ? [...extrasSel].map((id) => {
      const x = EXTRAS.get(id);
      const p = precioExtra(x);
      return `• ${x.nombre} — ${p ? solesExacto(p) : `Gratis (${n}+ noches)`}`;
    }) : [];
    const llegaPor = form.llegaPor.value;
    const llegada = [llegaPor, llegaPor === "Avión" && v("vuelo") ? `vuelo ${v("vuelo")}` : null, v("hora") ? `aprox. ${formatoHora(v("hora"))}` : null].filter(Boolean).join(" · ");

    const msg = [
      `Hola ${CONFIG.nombre} 👋, quiero reservar:`,
      "",
      `📅 Llegada: ${fechaLarga(est.llegada)} (desde ${formatoHora(CONFIG.checkin)})`,
      `📅 Salida: ${fechaLarga(est.salida)} (hasta ${formatoHora(CONFIG.checkout)})`,
      `🌙 ${plural(n, "noche", "noches")} · 👥 ${plural(est.huespedes, "huésped", "huéspedes")}`,
      ...(lineasHab.length ? ["", "🛏️ Habitaciones", ...lineasHab] : []),
      c.descuento ? `Descuento ${promo.titulo} (-${promo.porcentaje}%): -${solesExacto(c.descuento)}` : null,
      ...(lineasTours.length ? ["", "🌿 Tours", ...lineasTours] : []),
      ...(lineasExtras.length ? ["", "➕ Extras", ...lineasExtras] : []),
      "",
      `*Total: ${solesExacto(c.total)}*`,
      `Adelanto para confirmar (${CONFIG.adelanto}%): ${solesExacto(c.adelanto)}`,
      "",
      `👤 Nombre: ${v("nombre")}`,
      `🪪 ${form.doc.value}: ${v("docnum")}`,
      v("procedencia") ? `🌎 Procedencia: ${v("procedencia")}` : null,
      `🧭 Llego en: ${llegada}`,
      `💳 Pago del adelanto: ${form.pago.value}`,
      v("notas") ? `📝 Notas: ${v("notas")}` : null,
    ].filter((l) => l !== null).join("\n");

    window.open(waLink(msg), "_blank", "noopener");
  });

  /* ---------- 12. Toast ---------- */
  let toastTimer;
  function avisar(texto, icono = "ph-check-circle") {
    const t = $("#toast");
    t.innerHTML = `<i class="ph-fill ${icono}" aria-hidden="true"></i>${esc(texto)}`;
    t.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("visible"), 2200);
  }
  const pop = (el) => { el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); };

  /* ---------- 13. Logros con contador animado ---------- */
  $("#logros").innerHTML = CONFIG.logros.map((l) =>
    `<li><strong data-valor="${l.valor}" data-dec="${l.decimales || 0}" data-sufijo="${esc(l.sufijo || "")}">0</strong><span>${esc(l.texto)}</span></li>`).join("");
  const animarNumero = (el) => {
    const fin = Number(el.dataset.valor), dec = Number(el.dataset.dec), suf = el.dataset.sufijo;
    const t0 = performance.now(), dur = 1400;
    // Respaldo: si la pestaña está en segundo plano, requestAnimationFrame se pausa
    setTimeout(() => { el.textContent = fin.toFixed(dec) + suf; }, dur + 100);
    const paso = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = (fin * e).toFixed(dec) + suf;
      if (k < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  };
  $$("#logros strong").forEach((el) => {
    if (reduceMotion || !("IntersectionObserver" in window)) { el.textContent = Number(el.dataset.valor).toFixed(el.dataset.dec) + el.dataset.sufijo; return; }
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { animarNumero(el); io.disconnect(); } }, { threshold: .6 });
    io.observe(el);
  });

  /* ---------- 14. Opiniones, ubicación, políticas y preguntas ---------- */
  $("#testimonios").innerHTML = CONFIG.testimonios.map((t, i) => `
    <li class="testimonio" data-aos="fade-up" data-aos-delay="${i * 80}">
      <span class="testimonio__comilla" aria-hidden="true">“</span>
      <span class="estrellas" role="img" aria-label="${t.estrellas} de 5 estrellas">${estrellas(t.estrellas)}</span>
      <blockquote>${esc(t.texto)}</blockquote>
      ${t.estadia ? `<span class="testimonio__estadia"><i class="ph ph-bed" aria-hidden="true"></i>${esc(t.estadia)}</span>` : ""}
      <div class="autor">
        <span class="avatar" aria-hidden="true">${esc(t.nombre.charAt(0))}</span>
        <span><strong>${esc(t.nombre)}</strong>${esc(t.pais)} · ${esc(t.fuente)}</span>
      </div>
    </li>`).join("");

  $("#cerca").innerHTML = CONFIG.cerca.map((c) =>
    `<li><i class="ph ${c.icono}" aria-hidden="true"></i><span>${esc(c.lugar)}</span><strong>${esc(c.tiempo)}</strong></li>`).join("");
  const { lat, lng } = CONFIG.ubicacion;
  $("#mapa").src = `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
  $("#como-llegar").href = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  $("#politicas").innerHTML = CONFIG.politicas.map((p, i) => `
    <li data-aos="fade-up" data-aos-delay="${(i % 3) * 60}"><i class="ph ${p.icono}" aria-hidden="true"></i><div><strong>${esc(p.titulo)}</strong><span>${esc(p.texto)}</span></div></li>`).join("");
  $("#faq").innerHTML = CONFIG.preguntas.map((q) =>
    `<details><summary>${esc(q.p)}<i class="ph ph-plus" aria-hidden="true"></i></summary><p>${esc(q.r)}</p></details>`).join("");

  /* ---------- 15. Header y menú móvil ---------- */
  const header = $("#header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const toggle = $("#nav-toggle");
  const nav = $("#nav");
  const cerrarMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
    nav.classList.remove("abierto");
  };
  toggle.addEventListener("click", () => {
    const abrirMenu = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(abrirMenu));
    toggle.setAttribute("aria-label", abrirMenu ? "Cerrar menú" : "Abrir menú");
    nav.classList.toggle("abierto", abrirMenu);
  });
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) cerrarMenu(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarMenu(); });

  /* ---------- 16. SEO local: datos estructurados para Google ---------- */
  const precios = CONFIG.habitaciones.map((h) => h.precio);
  const ld = {
    "@context": "https://schema.org",
    "@type": "Hostel",
    name: CONFIG.nombre,
    telephone: CONFIG.telefono,
    email: CONFIG.email,
    priceRange: `S/ ${Math.min(...precios)} – S/ ${Math.max(...precios)}`,
    url: location.href.split("#")[0],
    checkinTime: CONFIG.checkin,
    checkoutTime: CONFIG.checkout,
    paymentAccepted: CONFIG.pagos.join(", "),
    amenityFeature: [...new Set(CONFIG.habitaciones.flatMap((h) => h.amenidades))].filter((k) => AMEN[k])
      .map((k) => ({ "@type": "LocationFeatureSpecification", name: AMEN[k].nombre, value: true })),
    address: { "@type": "PostalAddress", streetAddress: CONFIG.direccion, addressLocality: CONFIG.ciudad, addressRegion: CONFIG.region, addressCountry: "PE" },
    geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng },
  };
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(ld);
  document.head.appendChild(script);

  /* ---------- 17. Inicio ---------- */
  pintarFechas();
  pintarPrecios();
  pintarTours();
  aplicarFiltro();
  actualizarReserva();
  // La fecha de hoy cambia a medianoche: si la llegada quedó en el pasado, se corrige
  setInterval(() => { if (est.llegada < hoyLima()) cambiarFecha("llegada", hoyLima()); }, 60 * 1000);
  if (window.AOS) AOS.init({ once: true, duration: 700, easing: "ease-out-cubic", offset: 40, disable: reduceMotion });
  // Enlace directo a una habitación: index.html#habitacion-matrimonial
  const enlace = location.hash.match(/^#habitacion-(.+)$/);
  if (enlace && HABS.has(enlace[1])) {
    abrirHab(enlace[1]);
    history.replaceState(null, "", location.pathname + location.search);
  }
})();
