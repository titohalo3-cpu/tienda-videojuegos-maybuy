// Módulo de usuarios: clase Usuario, carga inicial, alta / modificar / baja / consultar,
// validación con expresiones regulares y cookies.
// Solo se exporta lo que se usa en otro archivo.

// ---------- Expresiones regulares para validar formularios (login, registro y admin) ----------
export const PATRONES = {
    // Letras (con tildes y ñ), espacios y guiones, de 2 a 30 caracteres
    nombre: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]{1,29}$/,
    // Igual que el nombre pero hasta 50 (dos apellidos)
    apellidos: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]{1,49}$/,
    // usuario@dominio.es
    email: /^[\w.+-]+@[\w-]+(\.[\w-]+)*\.[a-z]{2,}$/i,
    // Móvil o fijo español: 9 cifras que empiezan por 6, 7, 8 o 9
    telefono: /^[6-9]\d{8}$/,
    // De 8 a 20 caracteres con mayúscula, minúscula, número y símbolo
    clave: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/
};

// ---------- Clase Usuario ----------
class Usuario {
    constructor(datos) {
        this.id = datos.id;
        this.rol = datos.rol;
        this.nombre = datos.nombre;
        this.apellidos = datos.apellidos;
        this.email = datos.email;
        this.clave = datos.clave;
        this.telefono = datos.telefono || "";
        this.fechaNacimiento = datos.fechaNacimiento || "";
        this.activo = datos.activo;
        this.fechaAlta = datos.fechaAlta;
        this.ultimoAcceso = datos.ultimoAcceso || "";
    }

    // "Lucía García López"
    nombreCompleto() {
        return this.nombre + " " + this.apellidos;
    }

    // ¿Es el administrador?
    esAdmin() {
        return this.rol == "admin";
    }

    // ¿La clave escrita es la suya?
    comprobarClave(clave) {
        return this.clave == clave;
    }

    // Apunta la fecha y hora del último inicio de sesión
    registrarAcceso() {
        this.ultimoAcceso = new Date().toISOString();
    }
}

let listaUsuarios = [];

// ---------- Carga inicial: localStorage (si ya hubo cambios) o usuarios.json (AJAX) ----------
export function cargarUsuarios(funcionALlamar) {
    let guardados = localStorage.getItem("usuarios");
    if (guardados != null) {
        listaUsuarios = JSON.parse(guardados).map(u => new Usuario(u));
        funcionALlamar();
        return;
    }
    fetch("../json/usuarios.json")
        .then(respuesta => respuesta.json())
        .then(usuarios => {
            listaUsuarios = usuarios.map(u => new Usuario(u));
            funcionALlamar();
        })
        .catch(error => console.error("No se pudo cargar usuarios.json. Abre la web desde un servidor (Live Server).", error));
}

// Guarda la lista entera en el navegador (no se exporta: solo la usa el módulo)
function guardarUsuarios() {
    localStorage.setItem("usuarios", JSON.stringify(listaUsuarios));
}

// ---------- Consultar ----------

export function usuarioPorId(id) {
    return listaUsuarios.find(u => u.id == id);
}

// ¿Hay ya alguien con ese email? (para no registrar dos veces el mismo)
export function emailRegistrado(email, idQueNoCuenta) {
    return listaUsuarios.some(u => u.email.toLowerCase() == email.toLowerCase() && u.id != idQueNoCuenta);
}

// Login: devuelve el usuario si el email y la clave coinciden (o undefined)
export function buscarUsuario(email, clave) {
    let usuario = listaUsuarios.find(u => u.email.toLowerCase() == email.toLowerCase());
    if (usuario && usuario.comprobarClave(clave)) {
        usuario.registrarAcceso();
        guardarUsuarios();
        return usuario;
    }
    return undefined;
}

// Solo los clientes (el admin no se gestiona desde la lista)
export function listaClientes() {
    return listaUsuarios.filter(u => u.rol == "cliente");
}

// Filtra por texto (nombre, apellidos o email) y por estado ("", "activo" o "inactivo")
export function filtrarClientes(lista, texto, estado) {
    let resultado = lista;
    if (texto != "") {
        let t = texto.toLowerCase();
        resultado = resultado.filter(u => (u.nombreCompleto() + " " + u.email).toLowerCase().includes(t));
    }
    if (estado == "activo") {
        resultado = resultado.filter(u => u.activo);
    } else if (estado == "inactivo") {
        resultado = resultado.filter(u => !u.activo);
    }
    return resultado;
}

// Ordena por un campo: "nombre", "apellidos", "fechaAlta" o "ultimoAcceso"
export function ordenarClientes(lista, campo, sentido) {
    let copia = [...lista];
    copia.sort((a, b) => String(a[campo]).localeCompare(String(b[campo]), "es"));
    if (sentido == "desc") {
        copia.reverse();
    }
    return copia;
}

// ---------- Alta, modificar y baja ----------

// ALTA (registro o admin): siempre como cliente activo, con el siguiente id libre
export function altaUsuario(datos) {
    let ids = listaUsuarios.map(u => u.id);
    datos.id = Math.max(...ids) + 1;
    datos.rol = "cliente";
    datos.activo = true;
    datos.fechaAlta = new Date().toISOString().slice(0, 10);
    datos.ultimoAcceso = "";
    let usuario = new Usuario(datos);
    listaUsuarios.push(usuario);
    guardarUsuarios();
    return usuario;
}

// MODIFICAR: el id y el rol no se tocan
export function modificarUsuario(id, datos) {
    let usuario = usuarioPorId(id);
    if (usuario) {
        delete datos.id;
        delete datos.rol;
        Object.assign(usuario, datos);
        guardarUsuarios();
    }
}

// BAJA: quita el usuario de la lista
export function bajaUsuario(id) {
    let posicion = listaUsuarios.findIndex(u => u.id == id);
    if (posicion != -1) {
        listaUsuarios.splice(posicion, 1);
        guardarUsuarios();
    }
}

// Vuelve a los usuarios del JSON original
export function restablecerUsuarios() {
    localStorage.removeItem("usuarios");
}

// ---------- Edad (para validar la fecha de nacimiento) ----------

export function edad(fechaNacimiento) {
    let hoy = new Date();
    let nacimiento = new Date(fechaNacimiento);
    let anos = hoy.getFullYear() - nacimiento.getFullYear();
    let aunNoCumplio = hoy.getMonth() < nacimiento.getMonth() ||
        (hoy.getMonth() == nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
    return aunNoCumplio ? anos - 1 : anos;
}

// ---------- Cookies ----------
// Una cookie es un texto "nombre=valor" que el navegador guarda con fecha de caducidad

export function guardarCookie(nombre, valor, dias) {
    let caduca = new Date();
    caduca.setTime(caduca.getTime() + dias * 24 * 60 * 60 * 1000);
    document.cookie = nombre + "=" + encodeURIComponent(valor) + ";expires=" + caduca.toUTCString() + ";path=/;SameSite=Lax";
}

export function leerCookie(nombre) {
    let trozos = document.cookie.split("; ");
    let encontrada = trozos.find(t => t.startsWith(nombre + "="));
    return encontrada ? decodeURIComponent(encontrada.split("=")[1]) : "";
}

export function borrarCookie(nombre) {
    document.cookie = nombre + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
}
