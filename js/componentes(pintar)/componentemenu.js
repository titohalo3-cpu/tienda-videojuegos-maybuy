class MenuPrincipal extends HTMLElement {
    constructor() {
        super();
        this.titulo = "Mi Tienda";
        this.carrito = null;    // null = esta página no tiene carrito (el admin)
        this.abierto = false;
        this.opciones = [];
        this.opcionActual = "";
        this.alElegir = null;
        this.alSalir = null;
        this.alComprar=null;
        this.elementos = [];
        this.alVerCarrito = null;
        this.textoBoton = "Comprar";
    }

    connectedCallback() {
        this.pintar();
    }

    get template() {
        // Solo hay botón de carrito si la página le ha dado el atributo "carrito"
        let botonCarrito = "";
        if (this.carrito != null) {
            botonCarrito = `<button class="carrito" id="botonCarrito">Carrito (${this.carrito})</button>`;
        }
        return `
            <div class="barra">
                <span class="logo">${this.titulo}</span>
                <button class="abrir" id="botonAbrirMenu">☰ Menú</button>
                ${botonCarrito}
                <button class="salir" id="botonSalir">
                    <span class="largo">Cerrar sesión</span><span class="corto">Salir</span>
                </button>
            </div>
            <div id="fondoMenu" class="fondo"></div>
            <nav class="panel">
                <button class="cerrar" id="botonCerrarMenu">✕</button>
                <h2>Secciones</h2>
                <div id="despegable"></div>
            </nav>
            <section id="lista" class="lista"></section>
        `;
    }

    pintar() {
        this.innerHTML = this.template;
        document.getElementById("botonAbrirMenu").addEventListener("click", () => this.abrir());
        document.getElementById("botonCerrarMenu").addEventListener("click", () => this.cerrar());
        document.getElementById("fondoMenu").addEventListener("click", () => this.cerrar());
        document.getElementById("botonSalir").addEventListener("click", () => this.salir());
        // El botón del carrito puede no existir (en el admin): solo se escucha si está
        let botonCarrito = document.getElementById("botonCarrito");
        if (botonCarrito) {
            botonCarrito.addEventListener("click", () => this.verCarrito());
        }

        let contenedor = document.getElementById("despegable");
        this.opciones.forEach(opcion => {
            let boton = document.createElement("button");
            boton.className = "destacado";
            boton.id = "destacado";
            boton.innerHTML = `
                <span class="texto">
                    <strong>${opcion.titulo}</strong>
                    <small>${opcion.subtitulo}</small>
                </span>
                <span class="flecha">›</span>
            `;
            boton.addEventListener("click", () => this.elegir(opcion.clave));
            contenedor.appendChild(boton);
        });

        this.pintarLista();
    }

    pintarLista() {
        let lista = document.getElementById("lista");
        this.elementos.forEach(elemento => {
            let tarjeta = document.createElement("article");
            let titulo = document.createElement("h3");
            let detalle = document.createElement("p");
            let precio = document.createElement("p");
            let extra = document.createElement("p");

            titulo.innerHTML = elemento.titulo;
            detalle.innerHTML = elemento.detalle;
            precio.innerHTML = elemento.precio + " €";
            precio.className = "precio";
            extra.innerHTML = elemento.extra;
            extra.className = "extra";

            tarjeta.appendChild(titulo);
            tarjeta.appendChild(detalle);
            tarjeta.appendChild(precio);
            tarjeta.appendChild(extra);

            // El botón solo existe si el main le ha dado un texto
            if (this.textoBoton != "") {
                let boton = document.createElement("button");
                boton.innerHTML = this.textoBoton;
                boton.className = "comprar";
                boton.addEventListener("click", () => this.comprar(elemento.id));
                tarjeta.appendChild(boton);
            }

            lista.appendChild(tarjeta);
        });
    }

    abrir() {
        this.abierto = true;
        this.className = "abierto";
    }

    cerrar() {
        this.abierto = false;
        this.className = "";
    }

    elegir(clave) {
        this.opcionActual = clave;
        if (this.alElegir) {
            this.alElegir(clave);
        }
        this.cerrar();
    }

    // Avisa de que han pulsado "Cerrar sesión" (qué hacer lo decide el main)
    salir() {
        if (this.alSalir) {
            this.alSalir();
        }
    }

    // Avisa de que han pulsado "Comprar" en una tarjeta y de cuál (qué hacer lo decide el main)
    comprar(id) {
        if (this.alComprar) {
            this.alComprar(id);
        }
    }
    // Avisa de que han pulsado "Carrito" (qué enseñar lo decide el main)
    verCarrito() {
        if (this.alVerCarrito) {
            this.alVerCarrito();
        }
    }

    static get observedAttributes() {
        return ["titulo", "carrito", "opciones", "elementos","boton"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "titulo":
                this.titulo = newValue;
                break;
            case "carrito":
                this.carrito = newValue;
                break;
            case "opciones":
                this.opciones = JSON.parse(newValue);
                break;
            case "elementos":
                this.elementos = JSON.parse(newValue);
                break;
            case "boton":
                this.textoBoton=newValue;
                break;
        }
        this.pintar();
    }
}

export const etiquetaMenu = window.customElements.define("menu-principal", MenuPrincipal);
