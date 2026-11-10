import { cargarJuegos, juegosDeSeccion, sinRepetidos, juegoPorId, versionesDe, altaJuego, modificarJuego, bajaJuego, restablecerJuegos} from '../modulo(logica)/modulojuegos.js';
import { pintarCaja, pintarDatos, pintarRejilla, marcarTarjeta, activarGiro } from '../componentes(pintar)/ficha.js';

// Proteger la página: solo puede entrar el admin
let usuario = JSON.parse(sessionStorage.getItem("usuario"));
if (usuario == null || usuario.rol != "admin") {
    location.replace("./login.html");
}

onload = () => {
    cargarJuegos(() => {
        let caja = document.getElementById("caja");
        let escena = document.getElementById("escena");
        let datos = document.getElementById("datos");
        let rejilla = document.getElementById("rejilla");
        let buscador = document.getElementById("buscador");

        // Cerrar sesión: borrar el usuario guardado y volver al login
        document.getElementById("botonSalir").addEventListener("click", () => {
            sessionStorage.removeItem("usuario");
            location.href = "./login.html";
        });

        // Restaurar: borra los cambios guardados en localStorage y vuelve a cargar el JSON original
        document.getElementById("botonRestaurar").addEventListener("click", () => {
            if (confirm("¿Volver al catálogo original? Se perderán las altas, cambios y bajas.")) {
                restablecerJuegos();
                location.reload();
            }
        });

        // ---------- CONSULTAR ----------

        // El juego que se está viendo en la ficha (lo usarán Editar y Eliminar)
        let juegoActual = null;

        // Cada título una sola vez, ordenado por nombre.
        // Es una función (y no una variable) porque la lista cambia con las altas y bajas
        function listaTitulos() {
            let titulos = sinRepetidos(juegosDeSeccion("todos"));
            titulos.sort((a, b) => a.titulo.localeCompare(b.titulo, "es"));
            return titulos;
        }

        // Enseña un juego: caja 3D + datos
        function mostrarJuego(id) {
            juegoActual = juegoPorId(id) || juegoPorId(listaTitulos()[0].id);
            pintarCaja(caja, juegoActual);
            pintarDatos(datos, juegoActual, versionesDe(juegoActual.titulo), mostrarJuego);
            let acciones = document.createElement("div");
            acciones.className="acciones-ficha";
            acciones.innerHTML = `
                <button id="botonEditar">Editar</button>
                <button class="peligro" id="botonBorrar">Eliminar</button>
            `;
            datos.appendChild(acciones);
            document.getElementById("botonEditar").addEventListener("click",()=>editarJuego(juegoActual));
            document.getElementById("botonBorrar").addEventListener("click",()=>eliminarJuego(juegoActual));
            marcarTarjeta(rejilla, juegoActual.titulo);
        }

        // Rejilla con los títulos que coinciden con el buscador
        function mostrarRejilla() {
            let texto = buscador.value.trim().toLowerCase();
            let lista = listaTitulos().filter(juego => juego.titulo.toLowerCase().includes(texto));
            pintarRejilla(rejilla, lista, juego => {
                mostrarJuego(juego.id);
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
            if (juegoActual) {
                marcarTarjeta(rejilla, juegoActual.titulo);
            }
        }

        buscador.addEventListener("input", () => mostrarRejilla());
        activarGiro(escena, caja, document.querySelectorAll(".vista"));

        // ---------- ALTA ----------

        let form = document.getElementById("formJuego");
        let aviso = document.getElementById("aviso");

        // setTimeout: el aviso ("dado de alta", "modificado", "eliminado") se borra solo a los 4 segundos
        let temporizadorAviso = null;
        function borrarAvisoLuego() {
            clearTimeout(temporizadorAviso);
            temporizadorAviso = setTimeout(() => aviso.innerHTML = "", 4000);
        }

        // Lee todos los campos del formulario y devuelve un objeto { titulo: ..., precioNuevo: ..., ... }
        function leerFormulario() {
            let datosForm = Object.fromEntries(new FormData(form));
            // Lo que viene de un formulario es siempre texto: los números hay que convertirlos
            datosForm.precioNuevo = Number(datosForm.precioNuevo);
            datosForm.stockNuevo = Number(datosForm.stockNuevo);
            datosForm.precioSegundaMano = Number(datosForm.precioSegundaMano);
            datosForm.stockSegundaMano = Number(datosForm.stockSegundaMano);
            datosForm.pegi = Number(datosForm.pegi);
            return datosForm;
        }

        // ---------- MODIFICAR (paso 4) ----------


        let idJuego=document.getElementById("idJuego");
        let tituloFormulario=document.getElementById("tituloFormulario");
        let botonEliminar=document.getElementById("botonEliminar");

        const CAMPOS=["titulo","plataforma","genero","desarrolladora","fechaLanzamiento","pegi","precioNuevo","stockNuevo","precioSegundaMano","stockSegundaMano","descripcion"];

        function editarJuego(juego) {

            idJuego.value=juego.id;
            CAMPOS.forEach(campo=>{


                form.elements[campo].value=juego[campo];


            });
            tituloFormulario.innerHTML="Editar «"+juego.titulo+"» (" + juego.plataforma + ")";
            botonEliminar.hidden=false;
            aviso.innerHTML="";
            document.getElementById("gestion").scrollIntoView({behavior:"smooth"});
            
        }
        form.addEventListener("reset",()=>{

            idJuego.value="";
            tituloFormulario.innerHTML="Nuevo juego";
            botonEliminar.hidden=true;

        });


        // Al pulsar "Guardar": alta (si idJuego está vacío) o modificar (si tiene un id)
        form.addEventListener("submit",e=>{

            e.preventDefault();
            let datosForm=leerFormulario();
            let juego;
            if (idJuego.value=="") {
                juego=altaJuego(datosForm);
                aviso.innerHTML="«" + juego.titulo + "» dado de alta con el id " + juego.id;
            }else{
                modificarJuego(idJuego.value,datosForm);
                juego=juegoPorId(idJuego.value);
                aviso.innerHTML="«" + juego.titulo + "» modificado";
            }
            borrarAvisoLuego();

            form.reset();
            mostrarRejilla();
            mostrarJuego(juego.id);
            window.scrollTo({top:0,behavior:"smooth"});



        });



        // ---------- ELIMINAR (paso 5) ----------

        function eliminarJuego(juego) {
            if (!juego) return;
            let seguro = confirm("¿Seguro que quieres eliminar «" + juego.titulo + "» (" + juego.plataforma + ")?\nNo se puede deshacer.");
            if (!seguro) return;

            bajaJuego(juego.id);
            form.reset();
            aviso.innerHTML="«"+juego.titulo+"» ("+juego.plataforma+") eliminado";
            borrarAvisoLuego();
            mostrarRejilla();


            let otraVersion=versionesDe(juego.titulo)[0];
            if (otraVersion) {
                mostrarJuego(otraVersion.id);

            }else{
                mostrarJuego(listaTitulos()[0].id);
            }
            window.scrollTo({top:0,behavior:'smooth'});
        }

        botonEliminar.addEventListener("click",()=>eliminarJuego(juegoPorId(idJuego.value)));


        // Al entrar: la rejilla completa y la ficha del primer juego
        // (los gráficos están en su propia página: estadisticas.html)
        mostrarRejilla();
        mostrarJuego(listaTitulos()[0].id);
    });
};
