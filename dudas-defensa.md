# Dudas para la defensa de MayBuy

Preguntas que me han surgido mientras hacía el proyecto, con su respuesta corta.

## Módulos y componentes

**¿Qué es un módulo y qué es un componente?**
- **Módulo** (`modulo(logica)/modulojuegos.js`): la lógica y los datos. Carga, filtra, ordena, da de alta, modifica y elimina. No toca el HTML.
- **Componente** (`componentes(pintar)/componentemenu.js`): una etiqueta HTML propia (`<menu-principal>`). Pinta y escucha al usuario.
- Comparación: el módulo es la cocina, el componente es el camarero. El camarero toma nota, pide a cocina y sirve, pero nunca cocina.

**¿Cómo sé dónde va una función?**
- Si toca el HTML (`innerHTML`, `createElement`, `addEventListener`) → componente.
- Si solo trabaja con datos (`filter`, `sort`, `find`, `push`, `splice`) → módulo.
- Ejemplo: `filtrarJuegos()` va en el módulo; el botón "☰ Menú" va en el componente.

**¿Entonces el componente solo pinta la estructura?**
No solo. Hace 4 cosas, todas de presentación:
1. Pinta la estructura (el `template`).
2. Pinta lo que viene de los datos (un botón por opción, con `forEach` + `createElement`).
3. Escucha al usuario (`addEventListener`).
4. Responde (`abrir()`, `cerrar()`, avisar del clic).

Lo que nunca hace es calcular con los datos.

**¿Por qué el menú es reutilizable?**
Porque no importa nada del proyecto:
- recibe las opciones desde fuera con `setAttribute("opciones", JSON.stringify(...))`;
- avisa del clic ejecutando una función que le pasa el main (`menu.alElegir = ...`), como el `funcionALlamar` de `cargarDatos`.

Se podría usar en otra web cambiando solo los datos. El único que sabe que es una tienda de juegos es el main.

**¿La lista de juegos va dentro del componente o fuera?**
- Dentro: el menú pinta el desplegable **y** la lista de la opción elegida.
- Sigue siendo reutilizable porque los juegos **le llegan desde fuera**, igual que las opciones: el main hace `setAttribute("juegos", JSON.stringify(juegos))` y el componente los convierte con `JSON.parse` y los pinta con `forEach`.
- Qué juegos van en cada opción lo calcula el **módulo**, no el componente.

**¿Tengo que hacer la lista como otro componente para que sea reutilizable?**
- No. Solo el menú es componente, y la lista va dentro de él.
- Ya es reutilizable si cumple 3 cosas:
  1. Recibe los juegos por atributo.
  2. No hace `import` de nada del proyecto.
  3. No filtra ni calcula nada.
- Para que se lea mejor, la lista se pinta en su propio método, `pintarLista()`, y `pintar()` lo llama. Así, además, la clase tiene un método más.

**Si meto muchos métodos en el componente, ¿deja de ser reutilizable?**
- No. Lo que importa no es **cuántos** métodos tiene, sino **qué hacen**.
- Los métodos del componente son de **pantalla**: `pintar`, `pintarLista`, `abrir`, `cerrar` y `elegir`. Cualquier página que use la etiqueta los necesita igual.
- Los de **lógica** (`filtrar`, `ordenar`, `alta`, `modificar`, `eliminar`, carrito) **no** van en el componente, sino en el módulo.
- Prueba: `cliente.html`, `trabajador.html` y `admin.html` usan el mismo `<menu-principal>` sin cambiar ni una línea. Cada una le pasa sus datos con su main.
- Límite: la tarjeta lee `juego.titulo`, `juego.plataforma` y `juego.precioNuevo`, así que sirve para **cualquier lista de juegos**, no para una de películas. Para el proyecto basta.

**¿Y si quiero que sirva también para películas?**
- Reutilizable tiene dos niveles:
  1. Dentro del proyecto: la misma etiqueta en cliente, trabajador y admin.
  2. En cualquier web: juegos, películas o libros.
- Para el nivel 2, el componente no debe conocer los nombres de los campos de un juego. Usa nombres **genéricos** en cada elemento: `titulo`, `detalle` y `precio`.
- El **módulo** traduce los juegos a ese formato con `map`: `juegos.map(juego => ({ titulo: juego.titulo, detalle: juego.plataforma, precio: juego.precioNuevo }))`.
- En una web de películas solo cambia esa traducción (`detalle: pelicula.director`). El componente queda igual.

> Frase: "He separado la lógica de la presentación. El módulo contiene las funciones que trabajan con los datos y solo exporta las que usan otros archivos. El componente pinta e interactúa con el usuario, y es reutilizable porque recibe los datos por atributo y avisa de los clics con una función."

**¿Cómo funciona "Cerrar sesión"?**
- El botón está en la barra del componente, pero el componente **no sabe qué es una sesión**: solo llama a `this.alSalir()`, igual que hace con `alElegir`.
- Lo que pasa al salir lo decide cada main: `sessionStorage.removeItem("usuario")` borra al usuario que guardó `login.js`, y `location.href = "./login.html"` vuelve al login.
- Así el componente sigue siendo reutilizable: en otra web, `alSalir` podría hacer otra cosa.

**¿Cómo se protegen las páginas?**
- Al principio de cada main, **antes del `onload`**: `let usuario = JSON.parse(sessionStorage.getItem("usuario"));`. Si no hay nadie, da `null`.
- Si no hay usuario, o su rol no puede entrar en esa página, `location.replace("./login.html")`.
- **El orden del `||` importa**: primero `usuario == null`. Si es verdad, JS ya no mira `usuario.rol`, que daría error con `null`.
- En trabajador pueden entrar dos roles: `usuario.rol != "trabajador" && usuario.rol != "admin"` significa "no es ni trabajador **ni** admin". Va entre paréntesis para que se calcule antes que el `||`.
- `replace` en vez de `href`: así no queda en el historial, y el botón "atrás" no te devuelve a la página prohibida.
- Quién entra en cada página: cliente.html, solo cliente; trabajador.html, trabajador y admin; admin.html, solo admin.
- Límite: es una protección **del navegador**. Alguien que sepa JS puede escribir en `sessionStorage` a mano. La protección de verdad necesita un servidor (backend), y eso queda fuera de esta asignatura.

## import / export

**¿Por qué hace falta `import`?**
- Cada archivo con `type="module"` es una caja cerrada: no ve las variables de otro archivo.
- Para compartir algo, el que lo tiene pone `export` y el que lo usa pone `import`.
- Si falta, sale `ReferenceError: X is not defined`.

**¿El `import` va en el módulo o en el componente?**
- En el archivo que **usa** la cosa.
- El `export` va en el archivo que **la tiene**.

**¿Por qué el módulo no tiene `import`?**
- Porque no depende de nadie.
- Si el módulo importara el componente y el componente el módulo, sería un import circular, y da errores.

**Error "does not provide an export named X"**
Estás importando un nombre que no tiene `export` en el otro archivo, o está mal escrito (las mayúsculas cuentan).

**La ruta `'../modulo(logica)/modulojuegos.js'`**
- `..` sube una carpeta, de `componentes(pintar)` a `js`.
- Después entra en `modulo(logica)`.

**¿Desde dónde se cuentan las rutas?**
- En el HTML (`<script src="...">`, `<link href="...">`) se cuentan **desde el archivo HTML**. Ejemplo: `html/cliente.html` → `../js/mains/maincliente.js`.
- En un `import` se cuentan **desde el archivo JS que hace el import**. Ejemplo: `js/mains/maincliente.js` → `../componentes(pintar)/componentemenu.js`.
- En un `fetch` la ruta se cuenta **desde la página HTML** que está abierta, no desde el JS. Ejemplo: desde `html/cliente.html` → `fetch("../json/videojuegos.json")`, aunque el `fetch` esté en `js/modulo(logica)/modulojuegos.js`.
- Si mueves un archivo de carpeta, hay que revisar sus `import` y todos los sitios que lo cargan. Si no, sale un 404 o un error de módulo.

**Solo exportamos lo que usamos.** Si una función solo la usa el propio módulo, no lleva `export`.

## Clases y componentes

**Requisito: más de 5 campos, constructor y al menos 3 métodos más.**
- Campos: los `this.algo` del constructor.
- Métodos: funciones de la clase como `pintar()`, `abrir()`, `cerrar()` o `elegir()`.

**¿Qué hace `super()`?**
- Llama al constructor de `HTMLElement`.
- Es obligatorio con `extends` y va el primero: antes de `super()`, `this` no existe.

**¿Por qué el constructor del componente no recibe parámetros (a diferencia de `EquipoFutbol`)?**
- Porque es el navegador quien crea el objeto al encontrar la etiqueta en el HTML, y no le pasa nada.
- Los campos empiezan con un valor inicial y se rellenan después con atributos (`observedAttributes`).

**¿Qué diferencia hay entre un campo (`this.titulo`) y una variable (`let titulo`)?**
- `let titulo` es una variable **local**: solo existe dentro de la función donde se crea y desaparece al terminar.
- `this.titulo` es un **campo del objeto**: se guarda en el objeto y lo pueden usar todos sus métodos (`template`, `pintar`...).
- Los campos se crean en el **constructor** con `this.campo = valorInicial`.

**¿Qué diferencia hay entre un campo y un atributo?**
- El **atributo** está en el HTML (`<menu-principal carrito="3">`) y siempre es texto. Se lee con `this.getAttribute("carrito")`.
- El **campo** está en el objeto de JS (`this.carrito`).
- `observedAttributes` + `attributeChangedCallback` sirven para copiar el atributo al campo cuando cambia.
- Solo se observan atributos que pueden venir del HTML. Una función (`alElegir`) no puede ser un atributo.

**¿Cuándo se usa `getAttribute`?**
- Cuando quieres leer un atributo del HTML **en cualquier momento**, por ejemplo en `connectedCallback` o en `template`.
- Ejemplo: `this.getAttribute("titulo") || "Mi tienda"`. El `||` da un valor por defecto si el atributo no existe, porque entonces `getAttribute` devuelve `null`.
- En `attributeChangedCallback` no hace falta: el valor nuevo ya llega en el parámetro `newValue`.

**¿Qué hace `connectedCallback`?**
- El navegador lo ejecuta solo cuando la etiqueta entra en la página. Ahí se pinta.
- El constructor prepara los campos; `connectedCallback` pinta.
- No se pinta en el constructor porque el elemento aún no está en la página.

**¿Qué es `get template()`?**
- Un getter: una función que se usa como propiedad (`this.template`, sin paréntesis).
- Devuelve el HTML con comillas invertidas y `${...}` para meter los campos.

**¿Por qué `pintar()` hace `this.innerHTML = this.template`?**
- `template` **dibuja**: devuelve el HTML como texto.
- `pintar()` **coloca** ese texto dentro de la etiqueta y le añade los escuchadores.
- Cada vez que se lee `this.template`, el getter se vuelve a ejecutar con los valores actuales de los campos. Así, si `carrito` ha cambiado, sale el número nuevo.

**¿Qué es `customElements.define("menu-principal", MenuPrincipal)`?**
- Registra la etiqueta y la une a la clase.
- El nombre tiene que llevar guion.

**¿Para qué es `export const etiquetaMenu = ...`?**
Para poder importarlo desde el main. Si nadie lo importa, el archivo no se ejecuta.

## Funciones y arrays

**¿Cuándo pasar algo por parámetro?**
- Cuando la función necesita un dato que no tiene.
- Ejemplo: `filtrarJuegos(lista, filtros)` recibe la lista; no la busca ella.

**`find` y `findIndex`**
- `find` devuelve el elemento que cumple la condición.
- `findIndex` devuelve su posición (−1 si no está). Sirve para `splice` (eliminar) o para sustituir (modificar).

**`sessionStorage.setItem("usuario", JSON.stringify(usuario))`**
- Guarda el objeto convertido a texto mientras dure la pestaña.
- Para leerlo se usa `JSON.parse(sessionStorage.getItem("usuario"))`.

**¿Por qué sale `undefined` en la tarjeta?**
- Cada tarjeta es el objeto que crea la función del módulo (`aTarjetas`, `aTarjetasOferta`, `aTarjetasVentas`). Si una de ellas no crea un campo, ese campo **no existe** en sus tarjetas.
- Leer un campo que no existe da `undefined`, e `innerHTML = undefined` escribe literalmente "undefined".
- Para añadir una línea nueva hay dos opciones:
  1. Que **todas** las funciones `aTarjetas...` creen ese campo.
  2. Que el componente solo la pinte si viene: `if (elemento.extra2) { ... }`.
- El nombre del campo tiene que ser **genérico** (`extra2`), no `ventas`, para que el componente siga sin saber que son juegos.

**Receta para escribir un main (siempre los mismos 4 pasos)**
1. **Importar**: el componente (para que exista la etiqueta) y las funciones del módulo que voy a usar.
2. **Esperar a los datos**: `onload = () => { cargarJuegos(() => { ... }); };`. Todo lo demás va dentro.
3. **Coger y rellenar**: coger el menú con `getElementsByTagName` y darle los datos con `setAttribute`.
4. **Escuchar**: cada cosa que pulse el usuario (`alElegir`, `addEventListener`) hace siempre lo mismo: pedir datos al módulo → `aTarjetas` → `setAttribute("elementos", JSON.stringify(...))`.

**¿Por qué el formulario de filtros va fuera del componente?**
- Porque "plataforma" o "precio" son cosas de juegos, y el componente es genérico: no sabe qué pinta.
- El `<select>` va en `cliente.html`. El main lo escucha, el módulo filtra, y el main le pasa el resultado al menú con `setAttribute("elementos", ...)`.

**¿Cómo funciona el slider de precio de dos puntos?**
- Son **dos `<input type="range">` uno encima del otro**: uno es el mínimo y otro el máximo.
- En el CSS, la línea de los inputs se ignora (`pointer-events: none`) y solo se pueden coger los puntos (`pointer-events: auto` en el thumb).
- La parte naranja es un `linear-gradient` que usa dos variables CSS, `--desde` y `--hasta`. El main las cambia con `rango.style.setProperty(...)`.
- Para que no se crucen: si el mínimo pasa del máximo, el main lo devuelve (`inputMin.value = inputMax.value`).
- El tope (80 €) no está escrito a mano: lo calcula el módulo con `precioMaximo()`, usando `Math.max(...precios)`. Los `...` sacan los números del array, porque `Math.max` no acepta un array.

**¿Por qué los filtros salen entre la barra y la lista, si la lista está dentro del componente?**
- `menu-principal { display: contents }` hace que la etiqueta no tenga caja propia: sus partes (barra, lista) se colocan como si fueran hijas directas del `body`.
- El `body` es `flex` en columna, y `order` decide la posición: barra (0), filtros (1), lista (2).
- No se toca el JS del componente: es solo CSS.

**¿Cómo funciona ordenar (`sort`)?**
- `lista.sort((a, b) => b.ventas - a.ventas)` ordena de **mayor a menor**; `a.ventas - b.ventas`, de **menor a mayor**.
- `sort` compara los elementos de dos en dos. Si la resta da negativo, `a` va antes; si da positivo, `b` va antes.
- `sort` **cambia el array original**. Por eso antes se copia con `[...lista]`: así `listaJuegos` no se desordena.
- `juego[campo]` (con corchetes) lee el campo cuyo **nombre** está en una variable: si `campo = "ventas"`, es lo mismo que `juego.ventas`.

**¿Cómo se quitan los juegos repetidos (`sinRepetidos`)?**
- Cada versión de un juego (PS5, PC...) es un objeto distinto en el JSON, con su `id` y su stock.
- Con "Todas" las plataformas, el módulo recorre la lista con `forEach` y busca con `find` si ese título ya está en el resultado:
  - si no está, lo añade con `push({ ...juego })`, una **copia**, para no cambiar el original;
  - si ya está, solo le añade la plataforma: "PS5, PC".
- Se hace **después** de ordenar, así se queda la versión que va primero según el orden elegido.

**¿Por qué el main guarda `seccionActual`?**
- Para que sección, filtros y orden se **sumen**: `aplicarFiltros()` coge los juegos de la sección elegida, los filtra, los ordena y elige el tipo de tarjeta.
- Antes, elegir una sección ignoraba los filtros, y filtrar ignoraba la sección.

**`"change"` frente a `"click"`**
- `"click"` salta al pulsar algo (un botón).
- `"change"` salta cuando cambia el valor de un `<select>` o un `<input>`.
- `select.value` da el `value` de la opción elegida. Por eso tiene que coincidir letra a letra con el JSON (`"Switch 2"`, `"Xbox Series"`).

## Preguntas para el profe

1. ¿El requisito de "más de 5 campos, constructor y 3 métodos" vale para la clase del componente o solo para clases de datos como `Videojuego`? ¿Hay que convertir cada juego del JSON en un objeto `Videojuego` con `new`?
2. ¿Es correcto pasar los datos al componente por atributo con `JSON.stringify`, o es mejor asignar la propiedad directamente (`menu.juegos = lista`)?
3. ¿Hace falta usar Shadow DOM, o vale sin él (los estilos del CSS general le llegan al componente)?
4. Para avisar del clic uso una función (`alElegir`). ¿Lo ves bien o preferirías otra forma?
5. ¿Vale `sessionStorage` para guardar las altas, modificaciones y bajas, aunque se pierdan al cerrar la pestaña?
6. Si alguien escribe la URL de `admin.html` sin hacer login, puede entrar. ¿Basta con comprobar el rol en `sessionStorage` al cargar la página?
7. Cada vez que cambia un atributo, repinto todo el componente con `innerHTML` y vuelvo a poner los escuchadores. ¿Es aceptable o debería actualizar solo la parte que cambia?

## Errores que me han salido

- **`Unexpected token '{'`**: faltaba la `}` que cerraba `get template()`, y `pintar()` quedaba dentro.
- **"A constructor, method, accessor, or property was expected"**: había pegado código fuera de un método, suelto dentro de la clase.
- **Métodos dentro del `template`**: si no cierras `get template()` con `` `; `` y `}`, lo que escribas debajo queda dentro y da error de sintaxis. Cada método se cierra antes de empezar el siguiente.
- **`() => this.abrir` frente a `() => this.abrir()`**: sin paréntesis solo nombras la función; no la ejecutas.
- **`this.abierto = this.abrir`** guarda la función en el campo, no `true`. El campo tiene que valer `true` o `false`.
- **`JSON.stringify` frente a `JSON.parse`**: `stringify` convierte un array u objeto en texto (para `setAttribute` o `sessionStorage`); `parse` convierte ese texto otra vez en array u objeto (al leerlo).
- **¿`SECCIONES` es JSON?** No. Es un **array de objetos de JS** escrito en el código, aunque se parezca. JSON es siempre **texto** (un string o un archivo `.json`). Para meterlo en un atributo hay que pasarlo a texto con `JSON.stringify`.
- **`=` frente a `==`**: `=` asigna un valor (`menu.alElegir = ...`); `==` compara (`if (a == b)`).
- **Un campo y un método con el mismo nombre**: si existe `this.opciones = []`, no puede haber también un método `opciones()`. El campo tapa al método y `this.opciones()` da "is not a function".
- **`cargarJuegos => {...}` frente a `cargarJuegos(() => {...})`**: lo primero **crea** una función flecha nueva (cuyo parámetro se llama `cargarJuegos`) y no ejecuta nada. Lo segundo **llama** a `cargarJuegos` y le pasa una función para que la ejecute cuando lleguen los datos (callback).
- **`respuesta.json` frente a `respuesta.json()`**: sin paréntesis no se convierte nada; solo se nombra el método.
- **Un `switch` sin `default`** devuelve `undefined` si no coincide ningún `case`. Si la función tiene que devolver algo siempre, pon un `default`.
- **`resultado += resultado.filter(...)`** frente a **`resultado = resultado.filter(...)`**: `+=` **suma**, y con arrays los convierte en texto y los pega (`"[object Object],..."`). Para **sustituir** la lista por la filtrada se usa `=`.
- **`=>` frente a `>=`**: `=>` es la flecha de una función (`juego => ...`); `>=` es "mayor o igual". Escribir `precioNuevo => min` crea otra flecha y da error de sintaxis. Truco: en las comparaciones el `=` va siempre **detrás** (`>=`, `<=`, `!=`).
- **`!=` frente a `!==`**: los dos significan "distinto". `!==` además comprueba el tipo (es más estricto). Para comparar con `""`, valen los dos.
- **`favicon.ico 404`**: no es un error mío; el navegador busca un icono para la pestaña.

## ¿Por qué el campo del callback y el método no pueden llamarse igual?

En una clase, `this.verCarrito = null` (en el constructor) crea un campo **en el objeto**, y `verCarrito() {}` crea un método **en la clase**. Si se llaman igual, el campo tapa al método: `this.verCarrito()` encuentra `null` y da error. Por eso el callback lleva el prefijo `al` (`alVerCarrito`, `alSalir`, `alComprar`) y el método no (`verCarrito()`, `salir()`, `comprar(id)`).

Otro fallo típico: escribir `this.alVerCarrito;` sin paréntesis. Eso solo **nombra** la función, no la **ejecuta**. Para llamarla hacen falta los `()`.

## ¿Qué hacen `observedAttributes` y `attributeChangedCallback`?

Van siempre juntos:

- `observedAttributes` es **la lista** de atributos que el componente vigila. Si cambia uno que no está en la lista, el componente no se entera.
- `attributeChangedCallback(name, oldValue, newValue)` es **la función que el navegador llama solo** cada vez que cambia uno de esos atributos. Nunca la llamas tú.
  - `name`: qué atributo ha cambiado (`"boton"`, `"elementos"`...).
  - `oldValue`: el valor que tenía antes.
  - `newValue`: el valor nuevo, **siempre texto** (por eso `JSON.parse` en `opciones` y `elementos`).

El `switch (name)` decide en qué campo guardar el valor, y el `this.pintar()` del final vuelve a dibujar con los datos nuevos.

Ejemplo: el main hace `menu.setAttribute("boton", "Quitar")` → el navegador ve que `"boton"` está en la lista → llama a `attributeChangedCallback("boton", "Comprar", "Quitar")` → el `case "boton"` guarda `this.textoBoton = "Quitar"` → `pintar()` → las tarjetas salen con «Quitar».

## ¿Cómo se hace un buscador que muestra resultados mientras escribes?

Con el evento **`input`**, que salta **cada vez que cambia el texto** (cada letra que escribes o borras). `change`, en cambio, solo salta al salir del campo o pulsar Enter.

```js
buscador.addEventListener("input", () => pintarRejilla());

function pintarRejilla() {
    let texto = buscador.value.trim().toLowerCase();
    let lista = titulos.filter(juego => juego.titulo.toLowerCase().includes(texto));
    // ...vaciar la rejilla y pintar solo los de "lista"
}
```

- `value`: lo que hay escrito ahora mismo.
- `trim()`: quita espacios del principio y del final.
- `toLowerCase()` en **los dos lados**: así «zelda» encuentra «Zelda».
- `includes(texto)`: ¿el título **contiene** ese trozo? Con el texto vacío, `includes("")` es siempre `true`, así que salen todos.

## Admin: ¿cómo funcionan Editar y Eliminar?

- **Un formulario, dos usos.** El `<input type="hidden" id="idJuego">` decide: vacío = alta (`altaJuego`), con un id = modificar (`modificarJuego(id, datos)`). Como no tiene `name`, `FormData` no lo recoge y el id nunca se cambia.
- **Rellenar el formulario** con un `forEach` sobre los nombres de los campos: `form.elements[campo].value = juego[campo]`. Funciona porque los `name` del formulario se llaman igual que los campos de la clase.
- **El evento `reset`** salta al pulsar Cancelar y también con `form.reset()`; ahí se vuelve al modo «Nuevo juego».
- **Varios listeners del mismo evento se ejecutan todos.** Si quedan dos `submit`, al editar también se daría de alta un juego duplicado.
- **Eliminar:** `confirm()` devuelve `true` (Aceptar) o `false` (Cancelar); con `false` se hace `return` sin borrar. Una sola función `eliminarJuego(juego)` para los dos botones: cada botón solo dice *qué* juego.
- **Después de borrar** la ficha no puede enseñar un juego que ya no existe: se enseña otra plataforma del mismo título o, si no queda ninguna, el primero de la lista.
- **`getElementById` de un botón que no está en el HTML devuelve `null`**, y `null.addEventListener` rompe la función entera.

## ¿Cómo se guardan los cambios del admin? (localStorage)

- Desde el navegador **no se puede escribir en un archivo** como `videojuegos.json`. Por eso los cambios se guardan en `localStorage`, un almacén de texto del navegador para esta web.
- `localStorage` **sigue ahí al cerrar el navegador**; `sessionStorage` (el del usuario logueado) se borra al cerrar la pestaña.
- Solo guarda **texto**: `setItem("juegos", JSON.stringify(listaJuegos))` para guardar y `JSON.parse(getItem("juegos"))` para leer. Si nunca se guardó, `getItem` devuelve `null`.
- `cargarJuegos` mira primero en `localStorage`; si hay datos, los usa (sin `fetch`); si no, lee el JSON.
- Al leer se hace `.map(juego => new Videojuego(juego))`: `JSON.parse` devuelve objetos simples, sin los métodos de la clase.
- `guardarJuegos()` (sin `export`) se llama al final de `altaJuego`, `modificarJuego` y `bajaJuego`.
- `restablecerJuegos()` hace `removeItem("juegos")`: al recargar se vuelve al JSON original.
- Cliente y admin usan el mismo módulo y el mismo `localStorage`: lo que cambia el admin lo ve el cliente.

## localStorage y sessionStorage: ¿cuándo get y cuándo set?

| | Dura | En MayBuy guarda |
|---|---|---|
| `sessionStorage` | hasta cerrar la pestaña | `"usuario"` (quién ha entrado) y `"carrito"` (ids de los juegos) |
| `localStorage` | para siempre, hasta que se borre | `"juegos"` (catálogo con los cambios del admin) y `"compras"` (historial) |

- **`setItem(nombre, texto)` = GUARDAR / ESCRIBIR.** Se usa justo **después de cambiar algo**: login (guardar usuario), añadir o quitar del carrito, alta/modificar/baja de juegos, finalizar compra.
- **`getItem(nombre)` = LEER.** Se usa **al empezar**, cuando una página necesita lo que se guardó antes: proteger la página (¿hay usuario?), `cargarJuegos` (¿hay juegos guardados?), `recuperarCarrito`, cargar las compras. Si no hay nada devuelve `null`.
- **`removeItem(nombre)` = BORRAR:** cerrar sesión (`usuario`), restaurar catálogo (`juegos`).
- Solo guardan **texto**: al guardar `JSON.stringify(...)`, al leer `JSON.parse(...)`.
- `JSON.parse(getItem(...)) || []`: si no había nada, `JSON.parse(null)` da `null` y el `||` pone un array vacío.
- El carrito guarda **ids**, no juegos: al recuperarlo se buscan los juegos actuales (precio al día) y se quitan los que el admin haya borrado.
- **Relación cliente ↔ juegos:** la clase `Compra` (id, idCliente, nombreCliente, idsJuegos, fecha, total; métodos `cantidadJuegos`, `incluyeJuego`, `fechaLegible`).

## Requisitos de la práctica: dónde se cumple cada uno

| Requisito | Dónde |
|---|---|
| Al menos 6 páginas | 8: login, registro, cliente (tienda), juegodetalle (fichas), carrito, admin (juegos), clientes, estadisticas |
| Login y registro con validación | `login.js` y `mainregistro.js`: expresiones regulares en `PATRONES` (nombre, apellidos, email, teléfono, clave), tipos (`email`, `tel`, `date`, `password`, `checkbox`), edad mínima 14 años, claves iguales, email no repetido |
| Menú como componente web | `<menu-principal>` (`componentemenu.js`) en la tienda |
| 2 objetos y su relación | `Videojuego` y `Usuario`; relación `Compra` (idCliente + idsJuegos) |
| Más de 5 campos, constructor y 3 métodos | Videojuego (16 campos; `hayStock`, `vender`, `comprarSegundaMano`), Usuario (11; `nombreCompleto`, `esAdmin`, `comprobarClave`, `registrarAcceso`), Compra (6; `cantidadJuegos`, `incluyeJuego`, `fechaLegible`) |
| Alta, modificar, eliminar, consultar | Juegos en `admin.html`; clientes en `clientes.html` (y alta también desde `registro.html`) |
| Filtrar y ordenar | Tienda: plataforma, género, precio y orden por sección. Clientes: texto, estado y orden por nombre, apellidos, alta o último acceso |
| Eventos | click, change, input, submit, reset, blur, focus, keypress (Enter en login, solo números en teléfono), keydown (girar la caja), pointerdown/move/up (arrastrar la caja), load |
| setInterval y setTimeout | `setInterval`: estadísticas se refrescan cada 10 s. `setTimeout`: avisos que se borran solos (admin, clientes, carrito) y redirección tras el registro |
| Carga inicial | AJAX con `fetch` de `videojuegos.json` y `usuarios.json` |
| Cookies y storage | Cookie `emailRecordado` (30 días, «Recordar mi email» y tras registrarse). `sessionStorage`: usuario y carrito. `localStorage`: juegos, usuarios y compras |
