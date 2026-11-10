import { cargarUsuarios, listaClientes, filtrarClientes, ordenarClientes, usuarioPorId, altaUsuario, modificarUsuario, bajaUsuario, emailRegistrado, PATRONES } from '../modulo(logica)/modulousuarios.js';
import { comprasDe } from '../modulo(logica)/modulojuegos.js';

// Proteger la página: solo puede entrar el admin
let usuario = JSON.parse(sessionStorage.getItem("usuario"));
if (usuario == null || usuario.rol != "admin") {
    location.replace("./login.html");
}

onload = () => {
    cargarUsuarios(() => {
        let lista = document.getElementById("listaClientes");
        let buscar = document.getElementById("buscarCliente");
        let filtroEstado = document.getElementById("filtroEstado");
        let ordenCampo = document.getElementById("ordenCampo");
        let ordenSentido = document.getElementById("ordenSentido");
        let form = document.getElementById("formCliente");
        let idCliente = document.getElementById("idCliente");
        let tituloFormulario = document.getElementById("tituloFormulario");
        let aviso = document.getElementById("aviso");

        // Cerrar sesión
        document.getElementById("botonSalir").addEventListener("click", () => {
            sessionStorage.removeItem("usuario");
            location.href = "./login.html";
        });

        // setTimeout: el aviso se borra solo a los 4 segundos
        let temporizadorAviso = null;
        function avisar(texto) {
            aviso.textContent = texto;
            clearTimeout(temporizadorAviso);
            temporizadorAviso = setTimeout(() => aviso.textContent = "", 4000);
        }

        // "2026-11-10T17:42:05.000Z" → "10/11/2026"
        function fechaCorta(fecha) {
            return fecha ? new Date(fecha).toLocaleDateString("es-ES") : "nunca";
        }

        // ---------- CONSULTAR: lista filtrada y ordenada ----------

        function pintarClientes() {
            let clientes = filtrarClientes(listaClientes(), buscar.value.trim(), filtroEstado.value);
            clientes = ordenarClientes(clientes, ordenCampo.value, ordenSentido.value);
            document.getElementById("numClientes").textContent = "(" + clientes.length + ")";
            lista.innerHTML = "";

            if (clientes.length == 0) {
                lista.innerHTML = `<li class="vacio">No hay clientes con esos filtros.</li>`;
                return;
            }

            clientes.forEach(cliente => {
                // RELACIÓN: las compras de este cliente (clase Compra del módulo de juegos)
                let compras = comprasDe(cliente.id);
                let gastado = 0;
                compras.forEach(c => gastado = gastado + c.total);

                let li = document.createElement("li");
                li.className = "cliente" + (cliente.activo ? "" : " cliente--inactivo");

                let datos = document.createElement("div");
                let nombre = document.createElement("p");
                nombre.className = "cliente__nombre";
                nombre.textContent = cliente.nombreCompleto();
                let estado = document.createElement("span");
                estado.className = "cliente__estado";
                estado.textContent = cliente.activo ? "Activo" : "Desactivado";
                nombre.appendChild(estado);
                let detalle = document.createElement("p");
                detalle.className = "cliente__detalle";
                detalle.textContent = cliente.email + (cliente.telefono ? " · " + cliente.telefono : "") +
                    " · Alta: " + fechaCorta(cliente.fechaAlta) + " · Último acceso: " + fechaCorta(cliente.ultimoAcceso);
                let resumenCompras = document.createElement("p");
                resumenCompras.className = "cliente__compras";
                resumenCompras.textContent = compras.length + " compras · " + Number(gastado.toFixed(2)) + " € gastados";
                datos.appendChild(nombre);
                datos.appendChild(detalle);
                datos.appendChild(resumenCompras);

                let acciones = document.createElement("div");
                acciones.className = "acciones-ficha";
                let editar = document.createElement("button");
                editar.textContent = "Editar";
                editar.addEventListener("click", () => editarCliente(cliente));
                let activar = document.createElement("button");
                activar.textContent = cliente.activo ? "Desactivar" : "Activar";
                activar.addEventListener("click", () => {
                    modificarUsuario(cliente.id, { activo: !cliente.activo });
                    avisar(cliente.nombreCompleto() + (cliente.activo ? " activado" : " desactivado"));
                    pintarClientes();
                });
                let eliminar = document.createElement("button");
                eliminar.className = "peligro";
                eliminar.textContent = "Eliminar";
                eliminar.addEventListener("click", () => eliminarCliente(cliente));
                acciones.appendChild(editar);
                acciones.appendChild(activar);
                acciones.appendChild(eliminar);

                li.appendChild(datos);
                li.appendChild(acciones);
                lista.appendChild(li);
            });
        }

        buscar.addEventListener("input", () => pintarClientes());
        filtroEstado.addEventListener("change", () => pintarClientes());
        ordenCampo.addEventListener("change", () => pintarClientes());
        ordenSentido.addEventListener("change", () => pintarClientes());

        // ---------- Validación del formulario (expresiones regulares) ----------

        function marcarError(nombreCampo, mensaje) {
            form.querySelector(`[data-error="${nombreCampo}"]`).textContent = mensaje;
            return mensaje == "";
        }

        function validarFormulario(datos, esAlta) {
            let ok = true;
            ok = marcarError("nombre", PATRONES.nombre.test(datos.nombre) ? "" : "Solo letras, de 2 a 30") && ok;
            ok = marcarError("apellidos", PATRONES.apellidos.test(datos.apellidos) ? "" : "Solo letras, de 2 a 50") && ok;
            if (!PATRONES.email.test(datos.email)) {
                ok = marcarError("email", "Formato usuario@dominio.es") && ok;
            } else if (emailRegistrado(datos.email, idCliente.value)) {
                ok = marcarError("email", "Ese email ya lo usa otro usuario") && ok;
            } else {
                marcarError("email", "");
            }
            ok = marcarError("telefono", datos.telefono == "" || PATRONES.telefono.test(datos.telefono) ? "" : "9 cifras (6, 7, 8 o 9 al principio)") && ok;
            // Al dar de alta la clave es obligatoria; al editar, si se deja vacía se mantiene la anterior
            let claveOk = (!esAlta && datos.clave == "") || PATRONES.clave.test(datos.clave);
            ok = marcarError("clave", claveOk ? "" : "8-20 con mayúscula, minúscula, número y símbolo") && ok;
            return ok;
        }

        // keypress: en el teléfono solo números
        form.elements.telefono.addEventListener("keypress", e => {
            if (e.key < "0" || e.key > "9") {
                e.preventDefault();
            }
        });

        // ---------- ALTA y MODIFICAR ----------

        const CAMPOS = ["nombre", "apellidos", "email", "telefono", "fechaNacimiento"];

        function editarCliente(cliente) {
            idCliente.value = cliente.id;
            CAMPOS.forEach(c => form.elements[c].value = cliente[c]);
            form.elements.clave.value = "";
            form.elements.clave.placeholder = "Déjala vacía para no cambiarla";
            tituloFormulario.textContent = "Editar a " + cliente.nombreCompleto();
            document.getElementById("gestion").scrollIntoView({ behavior: "smooth" });
        }

        form.addEventListener("reset", () => {
            idCliente.value = "";
            form.elements.clave.placeholder = "";
            tituloFormulario.textContent = "Nuevo cliente";
            form.querySelectorAll(".error-campo").forEach(e => e.textContent = "");
        });

        form.addEventListener("submit", e => {
            e.preventDefault();
            let datos = Object.fromEntries(new FormData(form));
            Object.keys(datos).forEach(k => datos[k] = datos[k].trim());
            let esAlta = idCliente.value == "";
            if (!validarFormulario(datos, esAlta)) {
                return;
            }

            if (esAlta) {
                let nuevo = altaUsuario(datos);
                avisar(nuevo.nombreCompleto() + " dado de alta con el id " + nuevo.id);
            } else {
                if (datos.clave == "") {
                    delete datos.clave;
                }
                modificarUsuario(idCliente.value, datos);
                avisar(usuarioPorId(idCliente.value).nombreCompleto() + " modificado");
            }
            form.reset();
            pintarClientes();
        });

        // ---------- ELIMINAR ----------

        function eliminarCliente(cliente) {
            let seguro = confirm("¿Eliminar a " + cliente.nombreCompleto() + "?\nSus compras se conservan en el historial.");
            if (!seguro) return;
            bajaUsuario(cliente.id);
            form.reset();
            avisar(cliente.nombreCompleto() + " eliminado");
            pintarClientes();
        }

        // Al entrar
        pintarClientes();
    });
};
