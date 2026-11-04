import {
    SECCIONES, obtenerJuegos, consultarJuego, altaJuego, modificarJuego, eliminarJuego,
    tituloSeccion, juegosDeSeccion, filtrarJuegos, ordenarJuegos, valoresDistintos, formatearFecha
} from './modulojuegos.js';

// Campos por los que se puede ordenar la lista
const CAMPOS_ORDEN = [
    { valor: "", texto: "Recomendado" },
    { valor: "titulo", texto: "Título" },
    { valor: "precioNuevo", texto: "Precio nuevo" },
    { valor: "precioSegundaMano", texto: "Precio 2ª mano" },
    { valor: "fechaLanzamiento", texto: "Fecha de lanzamiento" },
    { valor: "ventas", texto: "Unidades vendidas" },
    { valor: "pegi", texto: "PEGI" }
];

// Ids de los campos del formulario que no pueden quedar vacíos
const CAMPOS_OBLIGATORIOS = ["formTitulo", "formPlataforma", "formGenero", "formDesarrolladora", "formFecha",
    "formPrecioNuevo", "formStockNuevo", "formPrecioSegunda", "formStockSegunda"];

class ListaJuegos extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `<p class="vacio">Cargando juegos…</p>`;
    }

    static get observedAttributes() {
        return ["seccion", "plataforma"];
    }

    // El menú cambia "seccion" o "plataforma" y la lista se vuelve a pintar
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && this.getAttribute("seccion")) {
            this.pintar();
        }
    }

    get template() {
        let opcionesOrden = "";
        CAMPOS_ORDEN.forEach(campo => {
            opcionesOrden += `<option value="${campo.valor}">${campo.texto}</option>`;
        });

        return `
            <div class="cabecera">
                <h1>${tituloSeccion(this.getAttribute("seccion"))}</h1>
                <span id="totalJuegos" class="total"></span>
                <button type="button" id="botonAlta" class="alta">+ Dar de alta</button>
            </div>

            <div id="pestanas" class="pestanas"></div>

            <div class="filtros">
                <label>Buscar
                    <input type="text" id="filtroTexto" placeholder="Título del juego">
                </label>
                <label>Plataforma
                    <select id="filtroPlataforma"></select>
                </label>
                <label>Género
                    <select id="filtroGenero"></select>
                </label>
                <label>Precio máximo
                    <input type="number" id="filtroPrecio" min="0" placeholder="€">
                </label>
                <label>Ordenar por
                    <select id="filtroOrden">${opcionesOrden}</select>
                </label>
                <label>Sentido
                    <select id="filtroSentido">
                        <option value="asc">Ascendente</option>
                        <option value="desc">Descendente</option>
                    </select>
                </label>
                <button type="button" id="botonLimpiar" class="limpiar">Limpiar filtros</button>
            </div>

            <div id="resultados" class="resultados"></div>

            <div id="ventanaFicha" class="ventana oculta">
                <div class="caja">
                    <div id="contenidoFicha"></div>
                    <div class="botones">
                        <button type="button" id="botonCerrarFicha" class="secundario">Cerrar</button>
                    </div>
                </div>
            </div>

            <div id="ventanaFormulario" class="ventana oculta">
                <div class="caja">
                    <h2 id="tituloFormulario">Dar de alta un juego</h2>
                    <input type="hidden" id="formId">
                    <div class="campos">
                        <label class="ancho">Título <input type="text" id="formTitulo"></label>
                        <label>Plataforma <input type="text" id="formPlataforma"></label>
                        <label>Género <input type="text" id="formGenero"></label>
                        <label>Desarrolladora <input type="text" id="formDesarrolladora"></label>
                        <label>PEGI
                            <select id="formPegi">
                                <option>3</option><option>7</option><option>12</option><option>16</option><option>18</option>
                            </select>
                        </label>
                        <label>Fecha de lanzamiento <input type="date" id="formFecha"></label>
                        <label>Precio nuevo (€) <input type="number" id="formPrecioNuevo" min="0" step="0.01"></label>
                        <label>Stock nuevo <input type="number" id="formStockNuevo" min="0"></label>
                        <label>Precio 2ª mano (€) <input type="number" id="formPrecioSegunda" min="0" step="0.01"></label>
                        <label>Stock 2ª mano <input type="number" id="formStockSegunda" min="0"></label>
                    </div>
                    <div class="botones">
                        <button type="button" id="botonCancelar" class="secundario">Cancelar</button>
                        <button type="button" id="botonGuardar" class="principal">Guardar</button>
                    </div>
                </div>
            </div>
        `;
    }

    pintar() {
        this.innerHTML = this.template;
        this.pintarPestanas();
        this.rellenarSelects();
        document.getElementById("filtroPlataforma").value = this.getAttribute("plataforma") || "";

        // Cada vez que cambia un filtro se vuelve a mostrar la lista
        ["filtroTexto", "filtroPlataforma", "filtroGenero", "filtroPrecio", "filtroOrden", "filtroSentido"].forEach(id => {
            document.getElementById(id).addEventListener("change", () => this.mostrarJuegos());
        });

        document.getElementById("botonLimpiar").addEventListener("click", () => this.limpiarFiltros());
        document.getElementById("botonAlta").addEventListener("click", () => this.abrirFormulario(null));
        document.getElementById("botonGuardar").addEventListener("click", () => this.guardarFormulario());
        document.getElementById("botonCancelar").addEventListener("click", () => this.cerrarVentana("ventanaFormulario"));
        document.getElementById("botonCerrarFicha").addEventListener("click", () => this.cerrarVentana("ventanaFicha"));

        this.mostrarJuegos();
    }

    // Botones para cambiar de sección sin abrir el menú
    pintarPestanas() {
        let pestanas = document.getElementById("pestanas");
        let lista = [{ clave: "todos", titulo: "Todos" }].concat(SECCIONES);

        lista.forEach(seccion => {
            let boton = document.createElement("button");
            boton.type = "button";
            boton.innerText = seccion.titulo;
            if (seccion.clave == this.getAttribute("seccion")) {
                boton.className = "activa";
            }
            boton.addEventListener("click", () => {
                this.setAttribute("plataforma", "");
                this.setAttribute("seccion", seccion.clave);
            });
            pestanas.appendChild(boton);
        });
    }

    // Rellena los select de plataforma y género sin perder lo que estuviera elegido
    rellenarSelects() {
        let juegos = obtenerJuegos();
        let selectPlataforma = document.getElementById("filtroPlataforma");
        let selectGenero = document.getElementById("filtroGenero");
        let plataformaElegida = selectPlataforma.value;
        let generoElegido = selectGenero.value;

        selectPlataforma.innerHTML = `<option value="">Todas</option>`;
        valoresDistintos(juegos, "plataforma").forEach(plataforma => {
            selectPlataforma.insertAdjacentHTML("beforeend", `<option>${plataforma}</option>`);
        });

        selectGenero.innerHTML = `<option value="">Todos</option>`;
        valoresDistintos(juegos, "genero").forEach(genero => {
            selectGenero.insertAdjacentHTML("beforeend", `<option>${genero}</option>`);
        });

        selectPlataforma.value = plataformaElegida;
        selectGenero.value = generoElegido;
    }

    leerFiltros() {
        return {
            texto: document.getElementById("filtroTexto").value,
            plataforma: document.getElementById("filtroPlataforma").value,
            genero: document.getElementById("filtroGenero").value,
            precioMax: document.getElementById("filtroPrecio").value
        };
    }

    // Sección -> filtros -> orden, y pinta una tarjeta por juego
    mostrarJuegos() {
        let resultado = juegosDeSeccion(obtenerJuegos(), this.getAttribute("seccion"));
        resultado = filtrarJuegos(resultado, this.leerFiltros());
        resultado = ordenarJuegos(resultado, document.getElementById("filtroOrden").value, document.getElementById("filtroSentido").value);

        document.getElementById("totalJuegos").innerText = resultado.length + " juegos";

        let contenedor = document.getElementById("resultados");
        contenedor.innerHTML = "";
        if (resultado.length == 0) {
            contenedor.innerHTML = `<p class="vacio">No hay juegos con esos filtros.</p>`;
            return;
        }
        resultado.forEach(juego => contenedor.appendChild(this.crearTarjeta(juego)));
    }

    crearTarjeta(juego) {
        let tarjeta = document.createElement("article");
        tarjeta.className = "juego";
        tarjeta.innerHTML = `
            <div class="etiquetas">
                <span>${juego.plataforma}</span>
                <span>PEGI ${juego.pegi}</span>
            </div>
            <h3>${juego.titulo}</h3>
            <p class="detalles">${juego.genero} · ${juego.desarrolladora} · ${formatearFecha(juego.fechaLanzamiento)}</p>
            <div class="precios">
                <span>${juego.precioNuevo} €<small>Nuevo</small></span>
                <span class="usado">${juego.precioSegundaMano} €<small>2ª mano</small></span>
            </div>
            <p class="ventas">${juego.ventas} vendidos</p>
            <div class="acciones">
                <button type="button">Consultar</button>
                <button type="button">Modificar</button>
                <button type="button" class="peligro">Eliminar</button>
            </div>
        `;

        // Cada botón sabe de qué juego es porque el evento se crea junto a su tarjeta
        let botones = tarjeta.getElementsByTagName("button");
        botones[0].addEventListener("click", () => this.consultar(juego.id));
        botones[1].addEventListener("click", () => this.abrirFormulario(juego.id));
        botones[2].addEventListener("click", () => this.eliminar(juego.id));
        return tarjeta;
    }

    limpiarFiltros() {
        document.getElementById("filtroTexto").value = "";
        document.getElementById("filtroPlataforma").value = "";
        document.getElementById("filtroGenero").value = "";
        document.getElementById("filtroPrecio").value = "";
        document.getElementById("filtroOrden").value = "";
        document.getElementById("filtroSentido").value = "asc";
        this.mostrarJuegos();
    }

    abrirVentana(id) {
        document.getElementById(id).className = "ventana visible";
    }

    cerrarVentana(id) {
        document.getElementById(id).className = "ventana oculta";
    }

    // ---------- Consultar ----------

    consultar(id) {
        let juego = consultarJuego(id);
        if (!juego) {
            alert("La operación no se ha podido realizar");
            return;
        }
        document.getElementById("contenidoFicha").innerHTML = `
            <h2>${juego.titulo}</h2>
            <dl>
                <dt>Plataforma</dt><dd>${juego.plataforma}</dd>
                <dt>Género</dt><dd>${juego.genero}</dd>
                <dt>PEGI</dt><dd>${juego.pegi}</dd>
                <dt>Desarrolladora</dt><dd>${juego.desarrolladora}</dd>
                <dt>Lanzamiento</dt><dd>${formatearFecha(juego.fechaLanzamiento)}</dd>
                <dt>Precio nuevo</dt><dd>${juego.precioNuevo} € · ${juego.stockNuevo} en stock</dd>
                <dt>Precio 2ª mano</dt><dd>${juego.precioSegundaMano} € · ${juego.stockSegundaMano} en stock</dd>
                <dt>Vendidos</dt><dd>${juego.ventas} unidades a ${juego.numClientes} clientes</dd>
            </dl>
        `;
        this.abrirVentana("ventanaFicha");
    }

    // ---------- Dar de alta y modificar (mismo formulario) ----------

    abrirFormulario(id) {
        CAMPOS_OBLIGATORIOS.forEach(campo => document.getElementById(campo).value = "");
        document.getElementById("formPegi").value = "3";
        document.getElementById("formId").value = "";
        document.getElementById("tituloFormulario").innerText = "Dar de alta un juego";

        if (id) {
            let juego = consultarJuego(id);
            document.getElementById("tituloFormulario").innerText = "Modificar juego";
            document.getElementById("formId").value = juego.id;
            document.getElementById("formTitulo").value = juego.titulo;
            document.getElementById("formPlataforma").value = juego.plataforma;
            document.getElementById("formGenero").value = juego.genero;
            document.getElementById("formDesarrolladora").value = juego.desarrolladora;
            document.getElementById("formPegi").value = juego.pegi;
            document.getElementById("formFecha").value = juego.fechaLanzamiento;
            document.getElementById("formPrecioNuevo").value = juego.precioNuevo;
            document.getElementById("formStockNuevo").value = juego.stockNuevo;
            document.getElementById("formPrecioSegunda").value = juego.precioSegundaMano;
            document.getElementById("formStockSegunda").value = juego.stockSegundaMano;
        }
        this.abrirVentana("ventanaFormulario");
    }

    guardarFormulario() {
        let hayVacios = false;
        CAMPOS_OBLIGATORIOS.forEach(campo => {
            if (document.getElementById(campo).value.trim() == "") hayVacios = true;
        });
        if (hayVacios) {
            alert("Rellena todos los campos");
            return;
        }

        let juego = {
            titulo: document.getElementById("formTitulo").value.trim(),
            plataforma: document.getElementById("formPlataforma").value.trim(),
            genero: document.getElementById("formGenero").value.trim(),
            pegi: parseInt(document.getElementById("formPegi").value),
            desarrolladora: document.getElementById("formDesarrolladora").value.trim(),
            fechaLanzamiento: document.getElementById("formFecha").value,
            precioNuevo: parseFloat(document.getElementById("formPrecioNuevo").value),
            stockNuevo: parseInt(document.getElementById("formStockNuevo").value),
            precioSegundaMano: parseFloat(document.getElementById("formPrecioSegunda").value),
            stockSegundaMano: parseInt(document.getElementById("formStockSegunda").value)
        };

        if (juego.precioNuevo < 0 || juego.precioSegundaMano < 0 || juego.stockNuevo < 0 || juego.stockSegundaMano < 0) {
            alert("Los precios y el stock no pueden ser negativos");
            return;
        }
        if (juego.precioSegundaMano > juego.precioNuevo) {
            alert("El precio de segunda mano no puede ser mayor que el nuevo");
            return;
        }

        let id = document.getElementById("formId").value;
        if (id == "") {
            altaJuego(juego);
            alert("Juego dado de alta");
        } else if (modificarJuego(parseInt(id), juego)) {
            alert("Datos del juego actualizados");
        } else {
            alert("No se han podido guardar los datos");
        }

        this.cerrarVentana("ventanaFormulario");
        this.rellenarSelects();
        this.mostrarJuegos();
    }

    // ---------- Eliminar ----------

    eliminar(id) {
        if (eliminarJuego(id)) {
            alert("Juego eliminado");
            this.rellenarSelects();
            this.mostrarJuegos();
        } else {
            alert("La operación no se ha podido realizar");
        }
    }
}

export const etiquetaLista = window.customElements.define("lista-juegos", ListaJuegos);
