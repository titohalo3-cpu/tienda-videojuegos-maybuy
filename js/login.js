let listaUsuarios = [];
const patron_email = /^[\w.+-]+@[\w-]+(\.[\w-]+)*\.[a-z]{2,}$/i;
const patron_clave = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/;
const cargaUsuarios = fetch("../json/usuarios.json")
    .then(respuesta => respuesta.json())
    .then(datosJson => listaUsuarios = datosJson)
    .catch(error => console.error("No se pudo cargar usuarios.json. Abre la página desde un servidor (Live Server), no con doble clic.", error));

onload = () => {
    document.getElementById("registro").addEventListener("click", validarAcceso);
    document.getElementById("idusuario").addEventListener("focus", ocultarError);
    document.getElementById("claveusuario").addEventListener("focus", ocultarError);
    document.getElementById("idusuario").addEventListener("blur", comprobarEmail);
    document.getElementById("claveusuario").addEventListener("blur", comprobarClave);
};

function comprobarEmail() {
    let email = document.getElementById("idusuario").value.trim();
    let error = document.getElementById("errorEmail");
    if (!patron_email.test(email)) {
        error.textContent = "El email debe tener el formato usuario@dominio.es";
        return false;
    }
    error.textContent = "";
    return true;
}

function comprobarClave() {
    let clave = document.getElementById("claveusuario").value;
    let error = document.getElementById("errorClave");
    if (!patron_clave.test(clave)) {
        error.textContent = "De 8 a 20 caracteres con mayúscula, minúscula, número y símbolo";
        return false;
    }
    error.textContent = "";
    return true;
}

async function validarAcceso() {
    let emailValido = comprobarEmail();
    let claveValida = comprobarClave();
    if (!emailValido || !claveValida) {
        return;
    }

    await cargaUsuarios;

    if (listaUsuarios.length == 0) {
        document.getElementById("mensajeError").textContent = "No se pudieron cargar los usuarios. Abre la web desde un servidor (Live Server).";
        document.getElementById("mensajeError").className = "visible";
        return;
    }

    let emailUsuario = document.getElementById("idusuario").value.trim();
    let claveUsuario = document.getElementById("claveusuario").value;

    let usuario = listaUsuarios.find(u => u.email == emailUsuario && u.clave == claveUsuario);

    if (!usuario) {
        document.getElementById("mensajeError").className = "visible";
        return;
    }

    if (!usuario.activo) {
        document.getElementById("mensajeError").textContent = "Tu cuenta está desactivada";
        document.getElementById("mensajeError").className = "visible";
        return;
    }

    sessionStorage.setItem("usuario", JSON.stringify(usuario));

    

    switch (usuario.rol) {
        case "admin":
            location.href = "./admin.html";
            break;
        case "trabajador":
            location.href = "./trabajador.html";
            break;
        case "cliente":
            location.href = "./cliente.html";
            break;
    }
}

function ocultarError() {
    document.getElementById("mensajeError").className = "oculto";
}