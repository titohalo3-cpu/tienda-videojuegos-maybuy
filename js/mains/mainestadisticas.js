import { cargarJuegos, stockPorPlataforma, juegosPorGenero, resumenCatalogo } from '../modulo(logica)/modulojuegos.js';
import { COLOR_GENERO } from '../componentes(pintar)/ficha.js';

// Proteger la página: solo puede entrar el admin
let usuario = JSON.parse(sessionStorage.getItem("usuario"));
if (usuario == null || usuario.rol != "admin") {
    location.replace("./login.html");
}

// Pinta las cifras y los dos gráficos con los juegos que haya ahora mismo
function pintarEstadisticas() {
    // ---------- 1. Cifras rápidas ----------
    let resumen = resumenCatalogo();
    document.getElementById("cifraJuegos").innerHTML = resumen.juegos;
    document.getElementById("cifraTitulos").innerHTML = resumen.titulos;
    // toLocaleString pone los puntos de los miles al estilo español: 12.345,67
    document.getElementById("cifraStock").innerHTML = resumen.unidades.toLocaleString("es-ES");
    document.getElementById("cifraValor").innerHTML = resumen.valor.toLocaleString("es-ES") + " €";

    // ---------- 2. Barras: stock por plataforma ----------
    // El ancho de cada tramo es su % respecto a la plataforma con más stock
    let filas = stockPorPlataforma();
    let maximo = Math.max(...filas.map(f => f.nuevo + f.segundaMano));
    document.getElementById("graficoStock").innerHTML = filas.map(f => `
        <li class="barra">
            <span class="barra__nombre">${f.nombre}</span>
            <span class="barra__pista">
                <span class="barra__nuevo" style="width:${f.nuevo / maximo * 100}%"></span>
                <span class="barra__segunda" style="width:${f.segundaMano / maximo * 100}%"></span>
            </span>
            <span class="barra__total">${f.nuevo + f.segundaMano}</span>
        </li>
    `).join("");

    // ---------- 3. Donut: juegos por género ----------
    // Cada género ocupa un trozo del círculo proporcional a sus juegos
    let generos = juegosPorGenero();
    let total = 0;
    generos.forEach(g => total = total + g.cantidad);

    let inicio = 0;
    let trozos = generos.map(g => {
        let fin = inicio + g.cantidad / total * 100;
        let trozo = COLOR_GENERO[g.nombre] + " " + inicio + "% " + fin + "%";
        inicio = fin;
        return trozo;
    });
    document.getElementById("donutGeneros").style.background = "conic-gradient(" + trozos.join(", ") + ")";
    document.getElementById("totalJuegos").innerHTML = total;
    document.getElementById("leyendaGeneros").innerHTML = generos.map(g => `
        <li><i class="punto" style="background:${COLOR_GENERO[g.nombre]}"></i>${g.nombre}<b>${g.cantidad}</b></li>
    `).join("");

    document.getElementById("actualizado").textContent =
        "Actualizado a las " + new Date().toLocaleTimeString("es-ES") + " · se refresca cada 10 segundos";
}

onload = () => {
    // Cerrar sesión: borrar el usuario guardado y volver al login
    document.getElementById("botonSalir").addEventListener("click", () => {
        sessionStorage.removeItem("usuario");
        location.href = "./login.html";
    });

    cargarJuegos(() => {
        pintarEstadisticas();
        // Las barras solo se animan la primera vez, no en cada refresco
        setTimeout(() => document.querySelector(".graficos").classList.add("quieto"), 1000);
    });

    // setInterval: cada 10 segundos se vuelven a leer los juegos y se repintan los gráficos.
    // Si el admin cambia algo en otra pestaña, aquí se ve sin recargar la página.
    setInterval(() => cargarJuegos(pintarEstadisticas), 10000);
};
