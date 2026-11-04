// Módulo de datos de la tienda: carga, alta, consulta, modificación, baja, filtros y orden

let listaJuegos = [];

// Secciones destacadas del menú
export const SECCIONES = [
    { clave: "mas-vendidos", titulo: "Más vendidos", subtitulo: "Lo que más se llevan" },
    { clave: "ofertas", titulo: "Ofertas", subtitulo: "Ahorra comprando de segunda mano" },
    { clave: "populares", titulo: "Más populares", subtitulo: "Los favoritos de los clientes" }
];

// Pide los juegos al servidor y, cuando los tiene, llama a funcionALlamar.
// Si ya se modificaron los juegos en esta sesión, se cogen de sessionStorage.
export function cargarDatos(funcionALlamar) {
    if (sessionStorage.getItem("videojuegos")) {
        listaJuegos = JSON.parse(sessionStorage.getItem("videojuegos"));
        funcionALlamar();
    } else {
        fetch("../json/videojuegos.json")
            .then(respuesta => respuesta.json())
            .then(juegos => {
                listaJuegos = juegos;
                funcionALlamar();
            });
    }
}

function guardar() {
    sessionStorage.setItem("videojuegos", JSON.stringify(listaJuegos));
}

export function obtenerJuegos() {
    return listaJuegos;
}

// ---------- Alta, consulta, modificación y baja ----------

export function consultarJuego(id) {
    return listaJuegos.find(juego => juego.id == id);
}

export function altaJuego(juego) {
    let idMayor = 0;
    listaJuegos.forEach(j => {
        if (j.id > idMayor) idMayor = j.id;
    });
    juego.id = idMayor + 1;
    juego.ventas = 0;
    juego.numClientes = 0;
    listaJuegos.push(juego);
    guardar();
}

export function modificarJuego(id, datos) {
    let posicion = listaJuegos.findIndex(juego => juego.id == id);
    if (posicion != -1) {
        // Lo que no está en el formulario se conserva del juego antiguo
        datos.id = id;
        datos.fechaAlta = listaJuegos[posicion].fechaAlta;
        datos.ventas = listaJuegos[posicion].ventas;
        datos.numClientes = listaJuegos[posicion].numClientes;
        listaJuegos[posicion] = datos;
        guardar();
        return true;
    } else {
        return false;
    }
}

export function eliminarJuego(id) {
    let posicion = listaJuegos.findIndex(juego => juego.id == id);
    if (posicion != -1) {
        listaJuegos.splice(posicion, 1);
        guardar();
        return true;
    } else {
        return false;
    }
}

// ---------- Secciones, filtros y orden ----------

export function tituloSeccion(clave) {
    let seccion = SECCIONES.find(s => s.clave == clave);
    return seccion ? seccion.titulo : "Todos los videojuegos";
}

export function juegosDeSeccion(lista, seccion) {
    switch (seccion) {
        case "mas-vendidos":
            return lista.filter(j => j.ventas > 0).sort((a, b) => b.ventas - a.ventas);
        case "ofertas":
            // Primero los que más se ahorran comprándolos de segunda mano
            return lista.filter(j => j.stockSegundaMano > 0)
                .sort((a, b) => (b.precioNuevo - b.precioSegundaMano) - (a.precioNuevo - a.precioSegundaMano));
        case "populares":
            return lista.filter(j => j.numClientes > 0).sort((a, b) => b.numClientes - a.numClientes);
        default:
            return lista.slice();
    }
}

export function filtrarJuegos(lista, filtros) {
    return lista.filter(j =>
        j.titulo.toLowerCase().includes(filtros.texto.toLowerCase()) &&
        (filtros.plataforma == "" || j.plataforma == filtros.plataforma) &&
        (filtros.genero == "" || j.genero == filtros.genero) &&
        (filtros.precioMax == "" || j.precioNuevo <= parseFloat(filtros.precioMax))
    );
}

// Ordena por cualquier campo del juego. Con campo "" se deja el orden de la sección
export function ordenarJuegos(lista, campo, sentido) {
    if (campo == "") return lista;

    lista.sort((a, b) => {
        if (a[campo] > b[campo]) return 1;
        if (a[campo] < b[campo]) return -1;
        return 0;
    });
    if (sentido == "desc") lista.reverse();
    return lista;
}

// Valores distintos de un campo, ordenados: ["PC", "PS4", "PS5", ...]
export function valoresDistintos(lista, campo) {
    let valores = [];
    lista.forEach(j => {
        if (!valores.includes(j[campo])) valores.push(j[campo]);
    });
    return valores.sort();
}

// "2023-05-12" -> "12/05/2023"
export function formatearFecha(fecha) {
    return fecha.split("-").reverse().join("/");
}
