import { cargarJuegos, juegosDeSeccion, sinRepetidos, juegoPorId, versionesDe } from '../modulo(logica)/modulojuegos.js';
import { pintarCaja, pintarDatos, pintarRejilla, marcarTarjeta, activarGiro } from '../componentes(pintar)/ficha.js';

// Proteger la página: entran los clientes y el admin
let usuario = JSON.parse(sessionStorage.getItem("usuario"));
if (usuario == null || (usuario.rol != "cliente" && usuario.rol != "admin")) {
    location.replace("./login.html");
}

onload = () => {
    cargarJuegos(() => {
        let caja = document.getElementById("caja");
        let escena = document.getElementById("escena");
        let datos = document.getElementById("datos");
        let rejilla = document.getElementById("rejilla");
        let buscador = document.getElementById("buscador");

        // El admin vuelve a su página; el cliente, a la tienda
        if (usuario.rol == "admin") {
            document.getElementById("enlaceVolver").href = "./admin.html";
        }

        // Cada título una sola vez (con sus plataformas juntas), ordenado por nombre
        let titulos = sinRepetidos(juegosDeSeccion("todos"));
        titulos.sort((a, b) => a.titulo.localeCompare(b.titulo, "es"));

        // Enseña un juego: caja 3D + datos, y guarda su id en la URL (juegodetalle.html?id=12)
        function mostrarJuego(id) {
            let juego = juegoPorId(id) || juegoPorId(titulos[0].id);
            pintarCaja(caja, juego);
            pintarDatos(datos, juego, versionesDe(juego.titulo), mostrarJuego);
            document.title = "MayBuy · " + juego.titulo;
            history.replaceState(null, "", "?id=" + juego.id);
            marcarTarjeta(rejilla, juego.titulo);
        }

        // Rejilla con los títulos que coinciden con el buscador
        function mostrarRejilla() {
            let texto = buscador.value.trim().toLowerCase();
            let lista = titulos.filter(juego => juego.titulo.toLowerCase().includes(texto));
            pintarRejilla(rejilla, lista, juego => {
                mostrarJuego(juego.id);
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
            let actual = juegoPorId(new URLSearchParams(location.search).get("id"));
            if (actual) {
                marcarTarjeta(rejilla, actual.titulo);
            }
        }

        buscador.addEventListener("input", () => mostrarRejilla());
        activarGiro(escena, caja, document.querySelectorAll(".vista"));

        // Al entrar
        mostrarRejilla();
        mostrarJuego(new URLSearchParams(location.search).get("id") || titulos[0].id);
    });
};
