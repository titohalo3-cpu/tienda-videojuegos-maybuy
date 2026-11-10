import { cargarUsuarios, altaUsuario, emailRegistrado, PATRONES, edad, guardarCookie } from '../modulo(logica)/modulousuarios.js';

// Registro de clientes nuevos: cada campo se valida con su expresión regular (o su tipo)
// al salir del campo (blur) y todos juntos al pulsar "Crear cuenta" (submit).

onload = () => {
    cargarUsuarios(() => {
        let form = document.getElementById("formRegistro");
        let campo = id => document.getElementById(id);

        // Marca el campo en rojo o en verde y escribe (o borra) el mensaje de error
        function marcar(input, error, mensaje) {
            error.textContent = mensaje;
            input.classList.toggle("mal", mensaje != "");
            input.classList.toggle("bien", mensaje == "");
            return mensaje == "";
        }

        // ---------- Una función de validación por campo ----------

        function validarNombre() {
            let ok = PATRONES.nombre.test(campo("nombre").value.trim());
            return marcar(campo("nombre"), campo("errorNombre"), ok ? "" : "Solo letras, de 2 a 30 caracteres");
        }

        function validarApellidos() {
            let ok = PATRONES.apellidos.test(campo("apellidos").value.trim());
            return marcar(campo("apellidos"), campo("errorApellidos"), ok ? "" : "Solo letras, de 2 a 50 caracteres");
        }

        function validarEmail() {
            let email = campo("email").value.trim();
            if (!PATRONES.email.test(email)) {
                return marcar(campo("email"), campo("errorEmail"), "Formato usuario@dominio.es");
            }
            if (emailRegistrado(email)) {
                return marcar(campo("email"), campo("errorEmail"), "Ya hay una cuenta con este email");
            }
            return marcar(campo("email"), campo("errorEmail"), "");
        }

        function validarTelefono() {
            let ok = PATRONES.telefono.test(campo("telefono").value.trim());
            return marcar(campo("telefono"), campo("errorTelefono"), ok ? "" : "9 cifras que empiecen por 6, 7, 8 o 9");
        }

        // Tipo date: el navegador da la fecha como "AAAA-MM-DD"; hay que tener 14 años o más
        function validarFecha() {
            let fecha = campo("fechaNacimiento").value;
            if (fecha == "") {
                return marcar(campo("fechaNacimiento"), campo("errorFecha"), "Indica tu fecha de nacimiento");
            }
            if (edad(fecha) < 14) {
                return marcar(campo("fechaNacimiento"), campo("errorFecha"), "Tienes que tener al menos 14 años");
            }
            return marcar(campo("fechaNacimiento"), campo("errorFecha"), "");
        }

        function validarClave() {
            let ok = PATRONES.clave.test(campo("clave").value);
            return marcar(campo("clave"), campo("errorClave"), ok ? "" : "8 a 20 caracteres con mayúscula, minúscula, número y símbolo");
        }

        function validarClave2() {
            let iguales = campo("clave2").value != "" && campo("clave2").value == campo("clave").value;
            return marcar(campo("clave2"), campo("errorClave2"), iguales ? "" : "Las dos claves no coinciden");
        }

        function validarCondiciones() {
            let ok = campo("condiciones").checked;
            campo("errorCondiciones").textContent = ok ? "" : "Tienes que aceptar las condiciones";
            return ok;
        }

        // ---------- Eventos ----------

        // blur: al salir de cada campo se valida ese campo
        campo("nombre").addEventListener("blur", validarNombre);
        campo("apellidos").addEventListener("blur", validarApellidos);
        campo("email").addEventListener("blur", validarEmail);
        campo("telefono").addEventListener("blur", validarTelefono);
        campo("fechaNacimiento").addEventListener("change", validarFecha);
        campo("clave").addEventListener("blur", validarClave);
        campo("clave2").addEventListener("input", validarClave2);
        campo("condiciones").addEventListener("change", validarCondiciones);

        // keypress: en el teléfono solo se pueden escribir números
        campo("telefono").addEventListener("keypress", e => {
            if (e.key < "0" || e.key > "9") {
                e.preventDefault();
            }
        });

        // submit: se validan todos (sin cortar en el primero, para enseñar todos los errores)
        form.addEventListener("submit", e => {
            e.preventDefault();
            let resultados = [
                validarNombre(), validarApellidos(), validarEmail(), validarTelefono(),
                validarFecha(), validarClave(), validarClave2(), validarCondiciones()
            ];
            if (resultados.includes(false)) {
                return;
            }

            let usuario = altaUsuario({
                nombre: campo("nombre").value.trim(),
                apellidos: campo("apellidos").value.trim(),
                email: campo("email").value.trim(),
                telefono: campo("telefono").value.trim(),
                fechaNacimiento: campo("fechaNacimiento").value,
                clave: campo("clave").value
            });

            // Cookie: el login tendrá ya escrito el email del usuario nuevo
            guardarCookie("emailRecordado", usuario.email, 30);

            let ok = campo("mensajeOk");
            ok.textContent = "¡Cuenta creada, " + usuario.nombre + "! Te llevamos al inicio de sesión...";
            ok.hidden = false;
            form.querySelector("button[type=submit]").disabled = true;

            // setTimeout: espera 2,5 segundos para que se lea el mensaje y va al login
            setTimeout(() => {
                location.href = "./login.html";
            }, 2500);
        });
    });
};
