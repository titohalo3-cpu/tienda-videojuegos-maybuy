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

> Frase: "He separado la lógica de la presentación. El módulo contiene las funciones que trabajan con los datos y solo exporta las que usan otros archivos. El componente pinta e interactúa con el usuario, y es reutilizable porque recibe los datos por atributo y avisa de los clics con una función."

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

**¿Qué hace `connectedCallback`?**
- El navegador lo ejecuta solo cuando la etiqueta entra en la página. Ahí se pinta.
- El constructor prepara los campos; `connectedCallback` pinta.
- No se pinta en el constructor porque el elemento aún no está en la página.

**¿Qué es `get template()`?**
- Un getter: una función que se usa como propiedad (`this.template`, sin paréntesis).
- Devuelve el HTML con comillas invertidas y `${...}` para meter los campos.

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

## Errores que me han salido

- **`Unexpected token '{'`**: faltaba la `}` que cerraba `get template()`, y `pintar()` quedaba dentro.
- **"A constructor, method, accessor, or property was expected"**: había pegado código fuera de un método, suelto dentro de la clase.
- **`favicon.ico 404`**: no es un error mío; el navegador busca un icono para la pestaña.
