// Módulo de la tienda: aquí va la lógica (cargar, filtrar, ordenar, alta, modificar, eliminar...).
// Solo se exporta lo que se usa en otro archivo.

// Secciones del menú (las usa componentemenu.js)
export const SECCIONES = [
    { clave: "todos", titulo: "Todos los juegos", subtitulo: "El catálogo completo" },
    { clave: "mas-vendidos", titulo: "Más vendidos", subtitulo: "Lo que más se llevan" },
    { clave: "ofertas", titulo: "Ofertas", subtitulo: "Ahorra comprando de segunda mano" },
    { clave: "populares", titulo: "Más populares", subtitulo: "Los favoritos de los clientes" },
    { clave: "fichas", titulo: "Fichas de juegos", subtitulo: "Portada en 3D y todos los detalles" }
];

class Videojuego{

    constructor(datos){
        this.id=datos.id;
        this.titulo=datos.titulo;
        this.plataforma=datos.plataforma;
        this.genero=datos.genero;
        this.precioNuevo=datos.precioNuevo;
        this.stockNuevo=datos.stockNuevo;
        this.precioSegundaMano=datos.precioSegundaMano;
        this.stockSegundaMano=datos.stockSegundaMano;
        this.ventas=datos.ventas;
        this.numClientes=datos.numClientes;
        // Datos de la ficha (los usa juegodetalle.html)
        this.pegi=datos.pegi;
        this.desarrolladora=datos.desarrolladora;
        this.fechaLanzamiento=datos.fechaLanzamiento;
        this.portada=datos.portada;
        this.descripcion=datos.descripcion;
        this.capturas=datos.capturas;

    }

    hayStock(){
        return this.stockNuevo>0 || this.stockSegundaMano>0;
    }
    vender(){
        this.stockNuevo=this.stockNuevo-1;
        this.ventas=this.ventas+1;
    }
    comprarSegundaMano(){
        this.stockSegundaMano=this.stockSegundaMano+1;
    }
}

// RELACIÓN cliente ↔ juegos: una compra guarda quién compró, qué juegos, cuándo y cuánto pagó
class Compra {
    constructor(datos) {
        this.id = datos.id;
        this.idCliente = datos.idCliente;
        this.nombreCliente = datos.nombreCliente;
        this.idsJuegos = datos.idsJuegos;
        this.fecha = datos.fecha;
        this.total = datos.total;
    }

    // Cuántos juegos tiene la compra
    cantidadJuegos() {
        return this.idsJuegos.length;
    }

    // ¿Esta compra incluye este juego?
    incluyeJuego(id) {
        return this.idsJuegos.includes(Number(id));
    }

    // La fecha en formato español: "10/11/2026, 18:42:05"
    fechaLegible() {
        return new Date(this.fecha).toLocaleString("es-ES");
    }
}

// Las compras se guardan en localStorage (duran aunque cierres el navegador)
let compras = (JSON.parse(localStorage.getItem("compras")) || []).map(c => new Compra(c));

let listaJuegos = [];

let carrito = [];

// Guarda el carrito en sessionStorage: solo los ids, no los juegos enteros
function guardarCarrito() {
    sessionStorage.setItem("carrito", JSON.stringify(carrito.map(juego => juego.id)));
}

// Vuelve a montar el carrito a partir de los ids guardados
// (el filter quita los juegos que el admin haya borrado mientras tanto)
function recuperarCarrito() {
    let ids = JSON.parse(sessionStorage.getItem("carrito")) || [];
    carrito = ids.map(id => juegoPorId(id)).filter(juego => juego);
}

export function cargarJuegos(funcionALlamar) {
    let guardados=localStorage.getItem("juegos");
    if (guardados != null) {
        listaJuegos=JSON.parse(guardados).map(juego=>new Videojuego(juego));
        recuperarCarrito();
        funcionALlamar();
        return;
        
    }

    
    fetch("../json/videojuegos.json")
        .then(respuesta => respuesta.json())
        .then(juegos => {
            listaJuegos = juegos.map(juego=>new Videojuego(juego));
            recuperarCarrito();
            funcionALlamar();
        });
}

// Guarda la lista entera en el navegador (no se exporta: solo la usa el módulo)
function guardarJuegos() {
    localStorage.setItem("juegos",JSON.stringify(listaJuegos));
}

// Borra lo guardado: la próxima vez se vuelve a leer el JSON original
export function restablecerJuegos(){

    localStorage.removeItem("juegos");

}


export function anadirAlCarrito(id){

        let juego = listaJuegos.find(juego => juego.id==id);
        carrito.push(juego);
        guardarCarrito();

}
export function quitarDelCarrito(id){
    let posicion=carrito.findIndex(juego=>juego.id==id);
    if (posicion!=-1) {
        carrito.splice(posicion,1);
        guardarCarrito();
    }


}

export function cantidadCarrito(){
    return carrito.length;
}

// Juegos que ha metido el cliente en el carrito (los usa el main para pintarlos)
export function juegosDelCarrito() {
    return carrito;
}

// Suma de los precios de todo el carrito, con 2 decimales
export function totalCarrito() {
    let total = 0;
    carrito.forEach(juego => {
        total=total+juego.precioNuevo;

    });
    return Number(total.toFixed(2));
}

// COMPRAR: crea la compra, resta stock, suma ventas, la guarda y vacía el carrito
export function finalizarCompra(usuario) {
    if (carrito.length == 0) return null;

    let compra = new Compra({
        id: compras.length + 1,
        idCliente: usuario.id,
        nombreCliente: usuario.nombre + " " + usuario.apellidos,
        idsJuegos: carrito.map(juego => juego.id),
        fecha: new Date().toISOString(),
        total: totalCarrito()
    });

    carrito.forEach(juego => {
        juego.vender();                              // stock -1 y ventas +1 (método de la clase)
        juego.numClientes = juego.numClientes + 1;   // para la sección "Más populares"
    });
    guardarJuegos();

    compras.push(compra);
    localStorage.setItem("compras", JSON.stringify(compras));

    carrito = [];
    guardarCarrito();
    return compra;
}

// Las compras de un cliente (para "Mis compras")
export function comprasDe(idCliente) {
    return compras.filter(compra => compra.idCliente == idCliente);
}


// Un juego concreto por su id (para la ficha)
export function juegoPorId(id) {
    return listaJuegos.find(juego => juego.id == id);
}

// Todas las versiones de un mismo título (una por plataforma)
export function versionesDe(titulo) {
    return listaJuegos.filter(juego => juego.titulo == titulo);
}

// ALTA: crea un juego nuevo con el siguiente id libre y lo añade a la lista
export function altaJuego(datos) {
    let ids= listaJuegos.map(juego=>juego.id);
    datos.id = Math.max(...ids)+1;

    datos.ventas=0;
    datos.numClientes=0;
    datos.portada="";
    datos.capturas=[];
    datos.descripcion=datos.descripcion || "";
    let juego = new Videojuego(datos);
    listaJuegos.push(juego);
    guardarJuegos();
    return juego;
}

// MODIFICAR: cambia los datos de un juego que ya existe (el id no se toca)
export function modificarJuego(id,datos) {
    let juego = juegoPorId(id);
    if(juego){
        Object.assign(juego,datos);
        guardarJuegos();
    }
}

// BAJA: quita un juego de la lista por su id
export function bajaJuego(id) {
    let posicion = listaJuegos.findIndex(juego => juego.id == id);
    if (posicion != -1) {
        listaJuegos.splice(posicion, 1);
        guardarJuegos();
    }
}

// CIFRAS de la página de estadísticas: juegos, títulos distintos, unidades y valor del stock
export function resumenCatalogo() {
    let unidades = 0;
    let valor = 0;
    listaJuegos.forEach(juego => {
        unidades = unidades + juego.stockNuevo + juego.stockSegundaMano;
        valor = valor + juego.precioNuevo * juego.stockNuevo + juego.precioSegundaMano * juego.stockSegundaMano;
    });
    return {
        juegos: listaJuegos.length,
        titulos: sinRepetidos(listaJuegos).length,
        unidades: unidades,
        valor: Number(valor.toFixed(2))
    };
}

// GRÁFICO 1: por cada plataforma, cuántas unidades hay nuevas y de segunda mano
export function stockPorPlataforma() {
    let resumen = [];
    listaJuegos.forEach(juego => {
        let fila = resumen.find(f => f.nombre == juego.plataforma);
        if (!fila) {
            fila = { nombre: juego.plataforma, nuevo: 0, segundaMano: 0 };
            resumen.push(fila);
        }
        fila.nuevo = fila.nuevo + juego.stockNuevo;
        fila.segundaMano = fila.segundaMano + juego.stockSegundaMano;
    });
    return resumen;
}

// GRÁFICO 2: cuántos juegos hay de cada género
export function juegosPorGenero() {
    let resumen = [];
    listaJuegos.forEach(juego => {
        let fila = resumen.find(f => f.nombre == juego.genero);
        if (!fila) {
            fila = { nombre: juego.genero, cantidad: 0 };
            resumen.push(fila);
        }
        fila.cantidad = fila.cantidad + 1;
    });
    return resumen;
}

export function juegosDeSeccion(seccion) {
    switch (seccion) {
        case "mas-vendidos":
            return listaJuegos.filter(juego => juego.ventas > 0);
        case "ofertas":
            return listaJuegos.filter(juego => juego.stockSegundaMano > 0);
        case "populares":
            return listaJuegos.filter(juego => juego.numClientes > 0);
        default:
            return listaJuegos;
    }
}
// Tarjeta normal: precio nuevo y, debajo, el de segunda mano
export function aTarjetas(lista) {
    return lista.map(juego => ({
        id: juego.id,
        titulo: juego.titulo,
        detalle: juego.plataforma + " · " + juego.genero,
        precio: juego.precioNuevo,
        extra: "Segunda mano: " + juego.precioSegundaMano + " €"
    }));
}

// Tarjeta de oferta: precio de segunda mano y, debajo, el nuevo
export function aTarjetasOferta(lista) {
    return lista.map(juego => ({
        id: juego.id,
        titulo: juego.titulo,
        detalle: juego.plataforma + " · " + juego.genero,
        precio: juego.precioSegundaMano,
        extra: "Nuevo: " + juego.precioNuevo + " €"
    }));
}

// Tarjeta de más vendidos: precio nuevo y, debajo, el número de ventas
export function aTarjetasVentas(lista) {
    return lista.map(juego => ({
        id: juego.id,
        titulo: juego.titulo,
        detalle: juego.plataforma + " · " + juego.genero,
        precio: juego.precioNuevo,
        extra: "Nº ventas: " + juego.ventas
    }));
}

// Tarjeta de más populares: precio nuevo y, debajo, cuántos clientes lo han comprado
export function aTarjetasPopulares(lista) {
    return lista.map(juego => ({
        id: juego.id,
        titulo: juego.titulo,
        detalle: juego.plataforma + " · " + juego.genero,
        precio: juego.precioNuevo,
        extra: "Nº clientes: " + juego.numClientes
    }));
}

// Filtra una lista por plataforma, género y rango de precio (vacío = sin filtrar)
export function filtrarJuegos(lista, plataforma, genero, min, max) {
    let resultado = lista;
    if (plataforma !== "") {
        resultado = resultado.filter(juego => juego.plataforma == plataforma);
    }
    if (genero !== "") {
        resultado = resultado.filter(juego => juego.genero == genero);
    }
    if (min!=="") {
        resultado=resultado.filter(juego=>juego.precioNuevo>=Number(min));
    }
    if (max!=="") {
        resultado=resultado.filter(juego=>juego.precioNuevo<=Number(max));
    }
    return resultado;
}
// Precio nuevo del juego más caro, redondeado hacia arriba (tope del slider de precio)
export function precioMaximo() {
    let precios = listaJuegos.map(juego => juego.precioNuevo);
    return Math.ceil(Math.max(...precios));
}

// Deja cada título una sola vez y junta sus plataformas: "PS5, Xbox Series, PC"
// Se queda con la primera versión que encuentra (la lista ya viene ordenada)
export function sinRepetidos(lista) {
    let resultado = [];
    lista.forEach(juego => {
        let yaEsta = resultado.find(otro => otro.titulo == juego.titulo);
        if (yaEsta) {
            yaEsta.plataforma = yaEsta.plataforma + ", " + juego.plataforma;
        } else {
            resultado.push({ ...juego });
        }
    });
    return resultado;
}

// Campo por el que se ordena cada sección (no se exporta: solo lo usa el módulo)
function campoOrden(seccion) {
    switch (seccion) {
        case "mas-vendidos":
            return "ventas";
        case "populares":
            return "numClientes";
        case "ofertas":
            return "precioSegundaMano";
        default:
            return "precioNuevo";
    }
}

// Texto para el desplegable: "Ordenar por ..."
export function textoOrden(seccion) {
    switch (seccion) {
        case "mas-vendidos":
            return "ventas";
        case "populares":
            return "nº de clientes";
        case "ofertas":
            return "precio de segunda mano";
        default:
            return "precio";
    }
}

// Ordena una lista según la sección: "desc" = de mayor a menor, "asc" = de menor a mayor
export function ordenarJuegos(lista, seccion, sentido) {
    let campo = campoOrden(seccion);
    let copia = [...lista];
    if (sentido == "desc") {
        copia.sort((a, b) => b[campo] - a[campo]);
    } else {
        copia.sort((a, b) => a[campo] - b[campo]);
    }
    return copia;
}

