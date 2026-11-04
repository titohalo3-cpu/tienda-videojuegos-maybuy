// Página del trabajador: carga los componentes y, cuando llegan los datos, muestra todos los juegos
import { cargarDatos } from './modulojuegos.js';
import { etiquetaMenu } from './componentemenu.js';
import { etiquetaLista } from './lista.js';

onload = () => {
    cargarDatos(() => {
        document.getElementsByTagName("lista-juegos")[0].setAttribute("seccion", "todos");
    });
};
