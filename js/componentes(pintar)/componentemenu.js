import { SECCIONES } from '../modulo(logica)/modulojuegos.js';

class MenuPrincipal extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.pintar();
    }

    get template() {
        let carrito = this.getAttribute("carrito") || 0;
        return `
            <div class="barra">
                <button type="button" id="botonAbrirMenu" class="abrir">☰ Menú</button>
                <span class="logo">MayBuy</span>
                <span class="carrito">Carrito (${carrito})</span>
            </div>

            <div id="fondoMenu" class="fondo"></div>

            <nav class="panel">
                <button type="button" id="botonCerrarMenu" class="cerrar">✕</button>
                <h2>Destacados</h2>
                <div id="menuDestacados"></div>
            </nav>
        `;
    }

    pintar() {
        this.innerHTML = this.template;
        document.getElementById("botonAbrirMenu").addEventListener("click", () => this.abrir());
        document.getElementById("botonCerrarMenu").addEventListener("click", () => this.cerrar());
        document.getElementById("fondoMenu").addEventListener("click", () => this.cerrar());

        // Un botón por cada sección destacada
        let destacados = document.getElementById("menuDestacados");
        SECCIONES.forEach(seccion => {
            let boton = document.createElement("button");
            boton.type = "button";
            boton.className = "destacado";
            boton.innerHTML = `
                <span class="texto">
                    <strong>${seccion.titulo}</strong>
                    <small>${seccion.subtitulo}</small>
                </span>
                <span class="flecha">›</span>
            `;
            boton.addEventListener("click", () => this.irA(seccion.clave));
            destacados.appendChild(boton);
        });
    }

    abrir() {
        this.className = "abierto";
    }

    cerrar() {
        this.className = "";
    }

    // De momento solo cierra el menú; aquí se llamará a la función que pinte la lista de esa sección
    irA(seccion) {
        console.log("Sección elegida:", seccion);
        this.cerrar();
    }

    static get observedAttributes() {
        return ["carrito"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.pintar();
        }
    }
}

export const etiquetaMenu = window.customElements.define("menu-principal", MenuPrincipal);