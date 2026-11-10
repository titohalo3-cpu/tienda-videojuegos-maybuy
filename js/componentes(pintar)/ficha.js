// Funciones para pintar la ficha de un juego (caja 3D, datos y rejilla de portadas).
// Las usan juegodetalle.html (cliente) y admin.html, así el código no está repetido.
// No es un Web Component: son funciones normales que reciben dónde pintar y qué pintar.

// Colores de cada plataforma (franja de la caja) y de cada género (portada dibujada)
const COLOR_PLATAFORMA = {
    "PS5": "#1d4ed8",
    "PS4": "#0b2f7a",
    "Switch": "#e4000f",
    "Switch 2": "#a3000b",
    "Xbox Series": "#107c10",
    "PC": "#111111"
};
// (se exporta porque el gráfico de géneros del admin usa los mismos colores)
export const COLOR_GENERO = {
    "Acción": "#b4372d",
    "Aventura": "#2f6f4f",
    "Carreras": "#c4620f",
    "Deportes": "#1f6aa5",
    "Plataformas": "#b03f7d",
    "RPG": "#5b3fa0",
    "Sandbox": "#5f7a1f",
    "Shooter": "#3b3f46",
    "Simulación": "#23807f"
};

// Color de la etiqueta PEGI: verde (3 y 7), naranja (12 y 16) y rojo (18)
function colorPegi(pegi) {
    if (pegi >= 18) return "#d7001f";
    if (pegi >= 12) return "#f39200";
    return "#6ab023";
}

// Evita que un texto se interprete como HTML al meterlo con innerHTML
function escapar(texto) {
    return String(texto ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

// "2025-09-26" → "26 de septiembre de 2025"
function fechaLarga(fecha) {
    if (!fecha) return "Sin fecha";
    return new Date(fecha).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

// Las portadas cuadradas o apaisadas se ven enteras y, detrás,
// la misma imagen desenfocada rellena el hueco (sin bandas negras)
function ajustarPortada(img) {
    if (!img) return;
    let comprobar = () => {
        if (img.naturalWidth / img.naturalHeight > 0.8) {
            img.classList.add("ancha");
            img.parentElement.classList.add("con-fondo");
            img.parentElement.style.setProperty("--fondo-portada", `url("${img.src}")`);
        }
    };
    if (img.complete) comprobar();
    else img.addEventListener("load", comprobar);
}

// Código de barras decorativo a partir del id del juego (13 cifras, como un EAN)
function codigoDeBarras(id) {
    let cifras = "84" + String(id).padStart(11, "0");
    let barras = "";
    let x = 0;
    for (let i = 0; i < cifras.length; i++) {
        let n = Number(cifras[i]);
        barras += `<rect x="${x}" y="0" width="${(n % 3) + 1}" height="34"/>`;
        x += (n % 3) + 2;
        barras += `<rect x="${x}" y="0" width="1" height="34"/>`;
        x += 3;
    }
    return `<svg class="codigo" viewBox="-4 -2 ${x + 8} 48" role="img" aria-label="Código ${cifras}">
        <rect x="-4" y="-2" width="${x + 8}" height="48" fill="#fff"/>
        <g fill="#111">${barras}</g>
        <text x="${x / 2}" y="45" text-anchor="middle" font-size="9" font-family="monospace" fill="#111">${cifras}</text>
    </svg>`;
}

// ---------- 1. La caja 3D: portada, lomo, contraportada y cantos ----------

export function pintarCaja(caja, juego) {
    caja.style.setProperty("--color-plataforma", COLOR_PLATAFORMA[juego.plataforma] || "#111");
    caja.style.setProperty("--color-genero", COLOR_GENERO[juego.genero] || "#444");
    caja.style.setProperty("--color-pegi", colorPegi(juego.pegi));

    let titulo = escapar(juego.titulo);
    let plataforma = escapar(juego.plataforma);
    let ano = String(juego.fechaLanzamiento || "").slice(0, 4);

    // Portada: la imagen encima de una portada dibujada (por si no hay imagen o falla)
    let imagenPortada = juego.portada ? `<img src="${juego.portada}" alt="Portada de ${titulo}">` : "";

    // Contraportada: dos capturas (o, si no hay, la portada recortada)
    let capturas = (juego.capturas || []).map(url => url.replace(".1920x1080.jpg", ".600x338.jpg"));
    if (capturas.length == 0 && juego.portada) {
        capturas = [juego.portada, juego.portada];
    }
    let imagenesCapturas = capturas
        .map((url, i) => `<img src="${url}" alt="Captura ${i + 1} de ${titulo}" style="object-position: center ${i == 0 ? "20%" : "70%"}">`)
        .join("");

    caja.innerHTML = `
        <div class="cara cara--frente">
            <div class="banda">${plataforma}<small>MayBuy</small></div>
            <div class="portada">
                <div class="portada__dibujo">
                    <span class="portada__inicial">${titulo.charAt(0)}</span>
                    <p class="portada__titulo">${titulo}</p>
                    <p class="portada__genero">${escapar(juego.genero)}</p>
                </div>
                ${imagenPortada}
            </div>
        </div>

        <div class="cara cara--lomo">
            <div class="lomo">
                <span class="lomo__plataforma">${plataforma}</span>
                <span class="lomo__titulo">${titulo}</span>
                <span class="lomo__sello">M</span>
            </div>
        </div>

        <div class="cara cara--detras">
            <div class="contra">
                <div class="banda">${plataforma}<small>MayBuy</small></div>
                <div class="contra__cuerpo">
                    <p class="contra__presenta"><strong>${escapar(juego.desarrolladora)}</strong> presenta</p>
                    <div class="contra__capturas">${imagenesCapturas}</div>
                    <p class="contra__sinopsis"><strong>${titulo}:</strong> ${escapar(juego.descripcion)}</p>
                    <div class="contra__iconos">
                        <span class="contra__icono"><b>${escapar(juego.genero)}</b>Género</span>
                        <span class="contra__icono"><b>${ano}</b>Lanzamiento</span>
                        <span class="contra__icono"><b>${plataforma}</b>Plataforma</span>
                    </div>
                </div>
                <div class="contra__pie">
                    <p class="contra__legal">© ${ano} ${escapar(juego.desarrolladora)}. Todas las marcas pertenecen a sus propietarios. Distribuido por MayBuy, tienda de videojuegos nuevos y de segunda mano. Prohibido el alquiler, la copia y la reproducción no autorizada. Solo para uso doméstico. Textos de pantalla en castellano.</p>
                    <div class="contra__marcas">
                        <span class="pegi" title="PEGI ${juego.pegi}">${juego.pegi}<small>PEGI</small></span>
                        ${codigoDeBarras(juego.id)}
                    </div>
                </div>
            </div>
        </div>

        <div class="cara cara--canto"></div>
        <div class="cara cara--arriba"></div>
        <div class="cara cara--abajo"></div>
    `;

    // Si una imagen no carga, se quita y se ve lo de debajo (la portada dibujada)
    caja.querySelectorAll("img").forEach(img => {
        img.addEventListener("error", () => img.remove());
    });
    ajustarPortada(caja.querySelector(".portada img"));
}

// ---------- 2. Los datos del juego ----------
// alCambiarVersion(id) se llama al pulsar otra plataforma del mismo juego

export function pintarDatos(contenedor, juego, versiones, alCambiarVersion) {
    let botonesVersion = versiones
        .map(v => `<button class="version ${v.id == juego.id ? "activa" : ""}" data-id="${v.id}">${escapar(v.plataforma)}</button>`)
        .join("");

    contenedor.innerHTML = `
        <p class="datos__eyebrow">${escapar(juego.genero)} · ${String(juego.fechaLanzamiento || "").slice(0, 4)}</p>
        <h1 class="datos__titulo">${escapar(juego.titulo)} <span>${escapar(juego.plataforma)}</span></h1>
        <div class="versiones" aria-label="Plataformas">${botonesVersion}</div>
        <div class="precios">
            <div class="precio precio--nuevo">
                <span>Nuevo</span>
                <strong>${juego.precioNuevo} €</strong>
                <small>${juego.stockNuevo > 0 ? juego.stockNuevo + " en stock" : "Agotado"}</small>
            </div>
            <div class="precio">
                <span>Segunda mano</span>
                <strong>${juego.precioSegundaMano} €</strong>
                <small>${juego.stockSegundaMano > 0 ? juego.stockSegundaMano + " en stock" : "Agotado"}</small>
            </div>
        </div>
        <dl class="hechos">
            <div><dt>Desarrolladora</dt><dd>${escapar(juego.desarrolladora)}</dd></div>
            <div><dt>Lanzamiento</dt><dd>${fechaLarga(juego.fechaLanzamiento)}</dd></div>
            <div><dt>Edad</dt><dd>PEGI ${juego.pegi}</dd></div>
            <div><dt>Vendidos</dt><dd>${juego.ventas}</dd></div>
        </dl>
        <p class="sinopsis">${escapar(juego.descripcion)}</p>
    `;

    contenedor.querySelectorAll(".version").forEach(boton => {
        boton.addEventListener("click", () => alCambiarVersion(boton.dataset.id));
    });
}

// ---------- 3. La rejilla de portadas ----------
// alElegir(juego) se llama al pulsar una tarjeta

export function pintarRejilla(rejilla, lista, alElegir) {
    rejilla.innerHTML = "";

    if (lista.length == 0) {
        rejilla.innerHTML = `<li class="vacio">No hay ningún juego que se llame así.</li>`;
        return;
    }

    lista.forEach(juego => {
        let li = document.createElement("li");
        let boton = document.createElement("button");
        boton.className = "tarjeta";
        boton.dataset.titulo = juego.titulo;
        boton.style.setProperty("--color-genero", COLOR_GENERO[juego.genero] || "#444");
        boton.innerHTML = `
            <span class="tarjeta__img">
                <span class="tarjeta__inicial">${escapar(juego.titulo.charAt(0))}</span>
                ${juego.portada ? `<img src="${juego.portada}" alt="" loading="lazy">` : ""}
            </span>
            <span class="tarjeta__titulo">${escapar(juego.titulo)}
                <span class="tarjeta__plataformas">${escapar(juego.plataforma)}</span>
            </span>
        `;
        let img = boton.querySelector("img");
        if (img) {
            img.addEventListener("error", () => img.remove());
            ajustarPortada(img);
        }
        boton.addEventListener("click", () => alElegir(juego));
        li.appendChild(boton);
        rejilla.appendChild(li);
    });
}

// Marca en la rejilla la tarjeta del juego que se está viendo
export function marcarTarjeta(rejilla, titulo) {
    rejilla.querySelectorAll(".tarjeta").forEach(t => {
        t.classList.toggle("activa", t.dataset.titulo == titulo);
    });
}

// ---------- 4. Girar la caja 360° (arrastrando, con botones o con el teclado) ----------

export function activarGiro(escena, caja, botonesVista) {
    let angulo = -24;        // giro horizontal (grados)
    let inclinacion = -6;    // giro vertical (grados), limitado para que no se dé la vuelta
    let velocidad = 0;
    let arrastrando = false;
    let xAnterior = 0;
    let yAnterior = 0;
    let menosMovimiento = matchMedia("(prefers-reduced-motion: reduce)").matches;

    function aplicarGiro() {
        caja.style.setProperty("--ry", angulo + "deg");
        caja.style.setProperty("--rx", inclinacion + "deg");
        // Marca el botón de la cara que se está viendo de frente
        let a = ((angulo % 360) + 360) % 360;
        let cara = "";
        if (a < 45 || a >= 315) cara = "0";
        else if (a < 135) cara = "90";
        else if (a < 225) cara = "180";
        botonesVista.forEach(b => b.classList.toggle("activa", b.dataset.angulo == cara));
    }

    // Ir a una cara por el camino más corto (sin dar vueltas de más)
    function irA(destino) {
        let vueltas = Math.round((angulo - destino) / 360);
        angulo = destino + vueltas * 360;
        inclinacion = -6;
        velocidad = 0;
        caja.classList.add("suave");
        aplicarGiro();
    }

    escena.addEventListener("pointerdown", e => {
        arrastrando = true;
        velocidad = 0;
        xAnterior = e.clientX;
        yAnterior = e.clientY;
        caja.classList.remove("suave");
        escena.classList.add("arrastrando");
        escena.setPointerCapture(e.pointerId);
    });

    escena.addEventListener("pointermove", e => {
        if (!arrastrando) return;
        let dx = e.clientX - xAnterior;
        let dy = e.clientY - yAnterior;
        xAnterior = e.clientX;
        yAnterior = e.clientY;
        velocidad = dx * 0.6;
        angulo = angulo + velocidad;
        inclinacion = Math.max(-25, Math.min(25, inclinacion - dy * 0.3));
        aplicarGiro();
    });

    function soltar() {
        if (!arrastrando) return;
        arrastrando = false;
        escena.classList.remove("arrastrando");
        if (!menosMovimiento) {
            inercia();
        }
    }
    escena.addEventListener("pointerup", soltar);
    escena.addEventListener("pointercancel", soltar);

    // Al soltar, la caja sigue girando un poco y frena poco a poco
    function inercia() {
        if (arrastrando || Math.abs(velocidad) < 0.05) return;
        velocidad = velocidad * 0.94;
        angulo = angulo + velocidad;
        aplicarGiro();
        requestAnimationFrame(inercia);
    }

    botonesVista.forEach(boton => {
        boton.addEventListener("click", () => irA(Number(boton.dataset.angulo)));
    });

    // Con el teclado: flechas izquierda y derecha giran de 45 en 45 grados
    escena.addEventListener("keydown", e => {
        if (e.key == "ArrowRight" || e.key == "ArrowLeft") {
            e.preventDefault();
            caja.classList.add("suave");
            angulo = angulo + (e.key == "ArrowRight" ? 45 : -45);
            aplicarGiro();
        }
    });

    aplicarGiro();
}
