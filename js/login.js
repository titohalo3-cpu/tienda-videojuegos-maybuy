// Login: valida el formulario con expresiones regulares, busca el usuario y lo guarda en sessionStorage.
// Es un módulo (type="module") para poder importar la lógica de usuarios.
import { cargarUsuarios, buscarUsuario, PATRONES, guardarCookie, leerCookie, borrarCookie } from './modulo(logica)/modulousuarios.js';

let usuariosCargados = false;
cargarUsuarios(() => usuariosCargados = true);

onload = () => {
    document.getElementById("registro").addEventListener("click", validarAcceso);
    document.getElementById("idusuario").addEventListener("focus", ocultarError);
    document.getElementById("claveusuario").addEventListener("focus", ocultarError);
    document.getElementById("idusuario").addEventListener("blur", comprobarEmail);
    document.getElementById("claveusuario").addEventListener("blur", comprobarClave);

    // Evento keypress: pulsar Enter en la clave es como pulsar "Entrar"
    document.getElementById("claveusuario").addEventListener("keypress", e => {
        if (e.key == "Enter") {
            validarAcceso();
        }
    });

    // Cookie: si el usuario marcó "Recordar mi email", se rellena solo
    let emailRecordado = leerCookie("emailRecordado");
    if (emailRecordado != "") {
        document.getElementById("idusuario").value = emailRecordado;
        document.getElementById("recordar").checked = true;
    }
};

function comprobarEmail() {
    let email = document.getElementById("idusuario").value.trim();
    let error = document.getElementById("errorEmail");
    if (!PATRONES.email.test(email)) {
        error.textContent = "El email debe tener el formato usuario@dominio.es";
        return false;
    }
    error.textContent = "";
    return true;
}

function comprobarClave() {
    let clave = document.getElementById("claveusuario").value;
    let error = document.getElementById("errorClave");
    if (!PATRONES.clave.test(clave)) {
        error.textContent = "De 8 a 20 caracteres con mayúscula, minúscula, número y símbolo";
        return false;
    }
    error.textContent = "";
    return true;
}

function mostrarError(texto) {
    let mensaje = document.getElementById("mensajeError");
    mensaje.textContent = texto;
    mensaje.className = "visible";
}

function validarAcceso() {
    let emailValido = comprobarEmail();
    let claveValida = comprobarClave();
    if (!emailValido || !claveValida) {
        return;
    }

    if (!usuariosCargados) {
        mostrarError("No se pudieron cargar los usuarios. Abre la web desde un servidor (Live Server).");
        return;
    }

    let emailUsuario = document.getElementById("idusuario").value.trim();
    let claveUsuario = document.getElementById("claveusuario").value;

    let usuario = buscarUsuario(emailUsuario, claveUsuario);

    if (!usuario) {
        mostrarError("El email o la contraseña no son correctos");
        return;
    }

    if (!usuario.activo) {
        mostrarError("Tu cuenta está desactivada");
        return;
    }

    // Cookie de 30 días con el email (solo si marcó "Recordar mi email")
    if (document.getElementById("recordar").checked) {
        guardarCookie("emailRecordado", emailUsuario, 30);
    } else {
        borrarCookie("emailRecordado");
    }

    sessionStorage.setItem("usuario", JSON.stringify(usuario));

    if (usuario.esAdmin()) {
        location.href = "./admin.html";
    } else {
        location.href = "./cliente.html";
    }
}

function ocultarError() {
    document.getElementById("mensajeError").className = "oculto";
}
