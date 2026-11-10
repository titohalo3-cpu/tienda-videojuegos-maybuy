import { etiquetaMenu } from '../componentes(pintar)/componentemenu.js';
import { cargarJuegos, SECCIONES, juegosDeSeccion, aTarjetas, aTarjetasOferta, aTarjetasVentas, aTarjetasPopulares, filtrarJuegos, ordenarJuegos, sinRepetidos, textoOrden, precioMaximo, anadirAlCarrito, cantidadCarrito } from '../modulo(logica)/modulojuegos.js';

// Proteger la página: solo pueden entrar los clientes
let usuario = JSON.parse(sessionStorage.getItem("usuario"));
if (usuario == null || usuario.rol != "cliente") {
    location.replace("./login.html");
}

onload = () => {
    cargarJuegos(() => {
        let menu = document.getElementsByTagName("menu-principal")[0];
        menu.setAttribute("opciones", JSON.stringify(SECCIONES));
        // El carrito puede venir de antes (guardado en sessionStorage): el contador empieza con lo que tenga
        menu.setAttribute("carrito", cantidadCarrito());
        menu.alSalir = () =>{
            sessionStorage.removeItem("usuario");
            location.href="./login.html";
        }
        // Botón "Comprar" de una tarjeta: el juego va al carrito y el contador sube
        menu.alComprar = id => {
            anadirAlCarrito(id);
            menu.setAttribute("carrito", cantidadCarrito());
        };

        // Al pulsar "Carrito" se va a su propia página (carrito.html).
        // El carrito no se pierde al cambiar de página porque el módulo lo guarda en sessionStorage.
        menu.alVerCarrito = () => {
            location.href = "./carrito.html";
        };

        // La sección elegida en el menú se guarda para que los filtros trabajen sobre ella
        let seccionActual = "todos";
        menu.alElegir = clave => {
            // "Fichas de juegos" no es una sección de la lista: lleva a otra página
            if (clave == "fichas") {
                location.href = "./juegodetalle.html";
                return;
            }
            seccionActual = clave;
            aplicarFiltros();
        };

        // 1. Coger los controles de los filtros
        let selectPlataforma = document.getElementById("filtroPlataforma");
        let selectGenero = document.getElementById("filtroGenero");
        let selectOrden = document.getElementById("filtroOrden");
        let etiquetaOrden = document.getElementById("textoOrden");
        let inputMin = document.getElementById("precioMin");
        let inputMax = document.getElementById("precioMax");
        let rango = document.getElementById("rangoPrecio");
        let textoPrecio = document.getElementById("textoPrecio");

        // 2. El tope del slider es el precio del juego más caro (lo calcula el módulo)
        let tope = precioMaximo();
        inputMin.max = tope;
        inputMax.max = tope;
        inputMax.value = tope;

        // 3. Pinta el texto y la parte naranja de la línea entre los dos puntos
        function pintarRango() {
            textoPrecio.innerHTML = "Entre " + inputMin.value + " € y " + inputMax.value + " €";
            rango.style.setProperty("--desde", inputMin.value / tope * 100 + "%");
            rango.style.setProperty("--hasta", inputMax.value / tope * 100 + "%");
        }

        // 4. Sección → filtros → orden → tarjetas → al menú
        function aplicarFiltros() {
            let juegos = juegosDeSeccion(seccionActual);
            juegos = filtrarJuegos(juegos, selectPlataforma.value, selectGenero.value, inputMin.value, inputMax.value);
            juegos = ordenarJuegos(juegos, seccionActual, selectOrden.value);
            // Con "Todas" las plataformas, cada juego sale una sola vez
            if (selectPlataforma.value == "") {
                juegos = sinRepetidos(juegos);
            }
            etiquetaOrden.innerHTML = "Ordenar por " + textoOrden(seccionActual);

            let tarjetas;
            if (seccionActual == "ofertas") {
                tarjetas = aTarjetasOferta(juegos);
            } else if (seccionActual == "mas-vendidos") {
                tarjetas = aTarjetasVentas(juegos);
            } else if (seccionActual == "populares") {
                tarjetas = aTarjetasPopulares(juegos);
            } else {
                tarjetas = aTarjetas(juegos);
            }
            menu.setAttribute("elementos", JSON.stringify(tarjetas));
        }

        // 5. Escuchar los filtros
        selectPlataforma.addEventListener("change", () => aplicarFiltros());
        selectGenero.addEventListener("change", () => aplicarFiltros());
        selectOrden.addEventListener("change", () => aplicarFiltros());

        // Los dos puntos no se pueden cruzar: el mínimo nunca pasa del máximo
        inputMin.addEventListener("input", () => {
            if (Number(inputMin.value) > Number(inputMax.value)) {
                inputMin.value = inputMax.value;
            }
            pintarRango();
            aplicarFiltros();
        });
        inputMax.addEventListener("input", () => {
            if (Number(inputMax.value) < Number(inputMin.value)) {
                inputMax.value = inputMin.value;
            }
            pintarRango();
            aplicarFiltros();
        });

        // 6. Al entrar: pintar el slider y la lista completa
        pintarRango();
        aplicarFiltros();
    });
};
