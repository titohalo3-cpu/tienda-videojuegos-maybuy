import { cargarJuegos, juegosDelCarrito, cantidadCarrito, totalCarrito, quitarDelCarrito, finalizarCompra, comprasDe, juegoPorId } from '../modulo(logica)/modulojuegos.js';
import { COLOR_GENERO } from '../componentes(pintar)/ficha.js';

// Proteger la página: solo pueden entrar los clientes
let usuario = JSON.parse(sessionStorage.getItem("usuario"));
if (usuario == null || usuario.rol != "cliente") {
    location.replace("./login.html");
}

onload = () => {
    cargarJuegos(() => {
        let lineas = document.getElementById("lineas");
        let botonComprar = document.getElementById("botonComprar");
        let confirmacion = document.getElementById("confirmacion");

        document.getElementById("saludo").textContent = usuario.nombre;

        // Cerrar sesión: borrar el usuario guardado y volver al login
        document.getElementById("botonSalir").addEventListener("click", () => {
            sessionStorage.removeItem("usuario");
            location.href = "./login.html";
        });

        // ---------- 1. Pintar las líneas del carrito y el resumen ----------

        function pintarCarrito() {
            lineas.innerHTML = "";

            if (cantidadCarrito() == 0) {
                lineas.innerHTML = `<li class="vacio-carrito">Tu carrito está vacío. <a href="./cliente.html">Ir a la tienda</a></li>`;
            }

            juegosDelCarrito().forEach(juego => {
                let li = document.createElement("li");
                li.className = "linea";

                // Portada pequeña (o la inicial con el color del género si no hay imagen)
                let portada = document.createElement("div");
                portada.className = "linea__portada";
                portada.style.setProperty("--color-genero", COLOR_GENERO[juego.genero] || "#444");
                let inicial = document.createElement("span");
                inicial.className = "linea__inicial";
                inicial.textContent = juego.titulo.charAt(0);
                portada.appendChild(inicial);
                if (juego.portada) {
                    let img = document.createElement("img");
                    img.src = juego.portada;
                    img.alt = "";
                    img.addEventListener("error", () => img.remove());
                    portada.appendChild(img);
                }

                let texto = document.createElement("div");
                let titulo = document.createElement("p");
                titulo.className = "linea__titulo";
                titulo.textContent = juego.titulo;
                let detalle = document.createElement("p");
                detalle.className = "linea__detalle";
                detalle.textContent = juego.plataforma + " · " + juego.genero;
                texto.appendChild(titulo);
                texto.appendChild(detalle);

                let precio = document.createElement("span");
                precio.className = "linea__precio";
                precio.textContent = juego.precioNuevo + " €";

                let quitar = document.createElement("button");
                quitar.className = "linea__quitar";
                quitar.textContent = "Quitar";
                quitar.addEventListener("click", () => {
                    quitarDelCarrito(juego.id);
                    pintarCarrito();
                });

                li.appendChild(portada);
                li.appendChild(texto);
                li.appendChild(precio);
                li.appendChild(quitar);
                lineas.appendChild(li);
            });

            document.getElementById("resumenCantidad").textContent = cantidadCarrito();
            document.getElementById("resumenTotal").textContent = totalCarrito() + " €";
            // Sin juegos no se puede comprar
            botonComprar.disabled = cantidadCarrito() == 0;
        }

        // ---------- 2. Historial de compras del cliente ----------

        function pintarCompras() {
            let lista = document.getElementById("compras");
            let misCompras = comprasDe(usuario.id);
            lista.innerHTML = "";

            if (misCompras.length == 0) {
                lista.innerHTML = `<li class="compras__vacio">Todavía no has hecho ninguna compra.</li>`;
                return;
            }

            // La más reciente primero
            [...misCompras].reverse().forEach(compra => {
                let li = document.createElement("li");
                li.className = "compra";

                let cabecera = document.createElement("div");
                cabecera.className = "compra__cabecera";
                cabecera.textContent = "Pedido nº " + compra.id + " · " + compra.cantidadJuegos() + " juegos · " + compra.total + " €";
                let fecha = document.createElement("span");
                fecha.className = "compra__fecha";
                fecha.textContent = compra.fechaLegible();
                cabecera.appendChild(fecha);

                // De cada id se busca el juego para enseñar su título (si el admin lo borró, se avisa)
                let juegos = document.createElement("p");
                juegos.className = "compra__juegos";
                juegos.textContent = compra.idsJuegos
                    .map(id => {
                        let juego = juegoPorId(id);
                        return juego ? juego.titulo + " (" + juego.plataforma + ")" : "Juego retirado";
                    })
                    .join(" · ");

                li.appendChild(cabecera);
                li.appendChild(juegos);
                lista.appendChild(li);
            });
        }

        // ---------- 3. Finalizar la compra ----------

        botonComprar.addEventListener("click", () => {
            let compra = finalizarCompra(usuario);
            if (compra == null) return;
            confirmacion.innerHTML = `<strong>¡Compra realizada!</strong>Pedido nº ${compra.id}: ${compra.cantidadJuegos()} juegos por ${compra.total} €. Gracias, ${usuario.nombre}.`;
            confirmacion.hidden = false;
            // setTimeout: el mensaje de "compra realizada" se oculta solo a los 6 segundos
            setTimeout(() => confirmacion.hidden = true, 6000);
            pintarCarrito();
            pintarCompras();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        // Al entrar
        pintarCarrito();
        pintarCompras();
    });
};
