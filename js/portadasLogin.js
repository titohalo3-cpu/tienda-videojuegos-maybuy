// Túnel de carátulas del login (solo decoración, no toca el login).
// Coge juegos del JSON, pinta una carátula por juego y las hace girar en un
// cilindro con CSS 3D. Se puede arrastrar y pausar.

const COLOR_GENERO = {
    "Acción": "#b4372d",
    "Aventura": "#2f6f4f",
    "Carreras": "#c4620f",
    "Deportes": "#1f6aa5",
    "Plataformas": "#b03f7d",
    "RPG": "#5b3fa0",
    "Sandbox": "#5f7a1f",
    "Shooter": "#3b3f46",
    "Simulación": "#23807f"
};

const COLOR_PLATAFORMA = {
    "PS5": "#1d4ed8",
    "PS4": "#0b2f7a",
    "Switch": "#e4000f",
    "Switch 2": "#a3000b",
    "Xbox Series": "#107c10",
    "PC": "#111111"
};

const CARATULAS = 30;          // cuántas carátulas hay en el cilindro
const CRUCERO = 0.035;         // grados por fotograma cuando nadie toca
const FUERZA_ARRASTRE = 0.12;  // grados por píxel arrastrado

fetch("../json/videojuegos.json")
    .then(respuesta => respuesta.json())
    .then(juegos => {
        pintarEstadisticas(juegos);
        crearTunel(elegirJuegos(juegos));
    })
    .catch(() => {
        // Sin JSON el login sigue funcionando: solo se queda sin túnel
    });

function pintarEstadisticas(juegos) {
    let numeros = document.querySelectorAll("#estadisticas span");
    numeros[0].textContent = juegos.length;
    numeros[1].textContent = new Set(juegos.map(juego => juego.plataforma)).size;
    numeros[2].textContent = new Set(juegos.map(juego => juego.genero)).size;
}

// Un juego por título (sin repetir plataformas) y con portada, mezclados de forma fija
function elegirJuegos(juegos) {
    let vistos = new Set();
    let unicos = juegos.filter(juego => juego.portada).filter(juego => {
        if (vistos.has(juego.titulo)) {
            return false;
        }
        vistos.add(juego.titulo);
        return true;
    });
    unicos.sort((a, b) => ((a.id * 37) % 101) - ((b.id * 37) % 101));
    return unicos.slice(0, CARATULAS);
}

function crearTunel(juegos) {
    let tunel = document.getElementById("tunel");
    let anillo = document.getElementById("anillo");
    let botonPausa = document.getElementById("botonPausa");

    let cartas = juegos.map((juego, i) => {
        let carta = document.createElement("li");
        carta.className = "caratula";
        carta.style.setProperty("--color-genero", COLOR_GENERO[juego.genero] || "#444");
        carta.style.setProperty("--color-plataforma", COLOR_PLATAFORMA[juego.plataforma] || "#111");
        carta.style.setProperty("--x", ((i * 47) % 70) - 40 + "%");
        carta.style.setProperty("--y", ((i * 29) % 60) - 10 + "%");

        let plataforma = document.createElement("span");
        plataforma.className = "caratula__plataforma";
        plataforma.textContent = juego.plataforma;

        let arte = document.createElement("span");
        arte.className = "caratula__arte";
        let inicial = document.createElement("span");
        inicial.className = "caratula__inicial";
        inicial.textContent = juego.titulo.charAt(0);
        arte.appendChild(inicial);

        let titulo = document.createElement("span");
        titulo.className = "caratula__titulo";
        titulo.textContent = juego.titulo;
        let genero = document.createElement("span");
        genero.className = "caratula__genero";
        genero.textContent = juego.genero;
        titulo.appendChild(genero);

        carta.appendChild(plataforma);
        carta.appendChild(arte);
        carta.appendChild(titulo);

        // La portada real va encima; si no carga, se queda la carátula dibujada
        if (juego.portada) {
            let imagen = document.createElement("img");
            imagen.className = "caratula__img";
            imagen.src = juego.portada;
            imagen.alt = "";
            imagen.draggable = false;
            imagen.loading = "lazy";
            imagen.addEventListener("error", () => imagen.remove());
            carta.appendChild(imagen);
        }
        anillo.appendChild(carta);
        return carta;
    });

    let paso = 360 / cartas.length;
    let radio = 0;
    let pivote = 0;
    let giro = 0;
    let velocidad = 0;
    let arrastrando = false;
    let ultimaX = 0;
    let pausado = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // El radio depende del ancho de la carátula (que cambia con la pantalla)
    function medir() {
        let ancho = cartas[0].offsetWidth;
        radio = (ancho * 1.12) / (paso * Math.PI / 180);
        pivote = radio - 260;
    }

    function colocar() {
        cartas.forEach((carta, i) => {
            // Ángulo de cada carátula entre -180 y 180 grados
            let angulo = ((i * paso + giro) % 360 + 540) % 360 - 180;
            let coseno = Math.cos(angulo * Math.PI / 180);
            if (coseno < 0.25) {
                carta.style.visibility = "hidden";
                return;
            }
            carta.style.visibility = "visible";
            carta.style.opacity = Math.min(1, (coseno - 0.25) / 0.3);
            carta.style.transform = `translateZ(${pivote}px) rotateY(${angulo}deg) translateZ(${-radio}px)`;
        });
    }

    function animar() {
        if (!arrastrando) {
            giro += velocidad + (pausado ? 0 : CRUCERO);
            velocidad *= 0.94;
        }
        colocar();
        requestAnimationFrame(animar);
    }

    // Arrastrar con el ratón o el dedo
    tunel.addEventListener("pointerdown", evento => {
        arrastrando = true;
        ultimaX = evento.clientX;
        velocidad = 0;
        tunel.classList.add("arrastrando");
        tunel.setPointerCapture(evento.pointerId);
    });
    tunel.addEventListener("pointermove", evento => {
        if (!arrastrando) {
            return;
        }
        let movimiento = (evento.clientX - ultimaX) * FUERZA_ARRASTRE;
        giro -= movimiento;
        velocidad = -movimiento;
        ultimaX = evento.clientX;
    });
    let soltar = () => {
        arrastrando = false;
        tunel.classList.remove("arrastrando");
    };
    tunel.addEventListener("pointerup", soltar);
    tunel.addEventListener("pointercancel", soltar);

    // Botón de pausa
    function pintarPausa() {
        botonPausa.setAttribute("aria-pressed", pausado);
        botonPausa.setAttribute("aria-label", pausado ? "Reanudar el movimiento" : "Pausar el movimiento");
        botonPausa.innerHTML = pausado
            ? '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z"/></svg>'
            : '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="1" width="3" height="10" rx="1"/><rect x="7" y="1" width="3" height="10" rx="1"/></svg>';
    }
    botonPausa.addEventListener("click", () => {
        pausado = !pausado;
        pintarPausa();
    });

    addEventListener("resize", medir);
    medir();
    pintarPausa();
    animar();
}
