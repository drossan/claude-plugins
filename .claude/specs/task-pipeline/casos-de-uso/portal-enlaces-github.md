# CU-portal-enlaces-github — Que un enlace roto del portal a GitHub rompa el build

- **Ámbito**: build del portal de documentación (`website/`, VitePress)
- **Nivel**: subfunción
- **Actor primario**: mantenedor que edita docs o el portal
- **Interesados e intereses**:
  - Mantenedor — enterarse al construir, no tras publicar, de que un enlace del portal a GitHub apunta a una ruta o ancla que ya no existe.
  - Lector del portal — no llegar a una página 404 ni a un ancla inexistente.

## Precondiciones

- Existe `website/` con `pnpm` y los `.md` publicados del portal.
- Los enlaces a GitHub del portal usan `https://github.com/drossan/claude-plugins/(blob|tree)/main/<ruta>[#ancla]`.

## Garantía mínima

- El check no usa red ni dependencias nuevas y no modifica ningún fichero.
- Un enlace con forma no soportada se ignora o se avisa; nunca produce un falso positivo que bloquee por una regla que el check no entiende.

## Garantía de éxito (postcondición)

- Si todos los enlaces resuelven contra el árbol local, el build continúa; si alguno no, el build termina con error que nombra el fichero del portal y el enlace.

## Disparador

- `pnpm docs:build` en `website/`, o `node website/scripts/check-github-links.mjs` a mano.

## Escenario principal (éxito)

1. El check lee los `.md` publicados del portal (no los excluidos por `srcExclude`, ni `node_modules`, `dist` o `cache`).
2. Extrae cada URL de GitHub del repo con `blob` o `tree` sobre `main`.
3. Comprueba que la ruta existe en el árbol local.
4. Si la URL trae `#ancla`, comprueba que coincide con el slug de algún heading del `.md` destino.
5. Sin enlaces rotos, el build sigue.

## Extensiones (flujos alternativos y de error)

- **2a.** La URL aparece solo dentro de un bloque de código (fence): se ignora.
- **2b.** La URL trae query (`?plain=1`) o un signo final de frase o de cierre de enlace: la query y el signo no forman parte de la ruta.
- **3a.** La ruta no existe (o difiere solo en mayúsculas): el build falla nombrando el `.md` del portal y la URL.
- **3b.** La ruta sale del repo (`..`, `%2e%2e`): se marca rota y no se lee nada fuera del repo.
- **4a.** El `.md` destino no tiene ningún heading con ese slug: el build falla nombrando la URL y el ancla.
- **4b.** El ancla lleva sufijo de duplicado (`#foo-1`) sin heading con ese slug: se trata como inexistente; no hay soporte de `-N`.
- **4c.** El destino no es un `.md` o la ancla es de líneas (`#L10-L20`): no se comprueba el ancla.
- **5a.** No se encuentra ninguna URL de GitHub: el check falla (una extracción rota no puede pasar por verde).

## Reglas de negocio

- **RN-1** — Solo se valida contra el árbol local (`main` es la rama de release); no hay red.
- **RN-2** — Slug estilo GitHub: minúsculas, backticks fuera conservando su contenido, se eliminan los signos salvo letras, números, guion y guion bajo (Unicode), espacios a guion. El ancla del enlace se decodifica (`%`) y se pasa a minúsculas antes de comparar; un `%` inválido es un error legible.
- **RN-3** — Los headings dentro de bloques de código (``` y ~~~, de longitud ≥ 3, cerrados con el mismo carácter) y el front matter no cuentan. Los headings Setext y los `<a id>` no están soportados. CRLF y BOM no cambian el slug.
- **RN-4** — El check corre también solo con `node`, sin `pnpm install`, porque el deploy de docs solo corre en tags `v*` y no hay CI en PRs. Resuelve la raíz del repo desde `import.meta.url`, no desde el directorio de trabajo.
- **RN-5** — Los `.md` revisados son los de `website/` que no excluye `srcExclude`. El script lee `srcExclude` como **texto** de `website/.vitepress/config.mts` (importarlo exige `vitepress`); si no puede parsearlo, falla con un error explícito. Ignora `node_modules`, `dist` y `cache`.
- **RN-6** — Una URL se extrae por patrón (cualquier sintaxis: enlace Markdown, `<a href>`, referencia o desnuda), solo `blob` y `tree` sobre `main`; `raw`, `edit` o ramas distintas se ignoran. Una URL rota repetida se reporta una vez por fichero.
- **RN-7** — El check es de solo lectura e idempotente; lista todos los fallos en una ejecución como `fichero  URL  motivo` y sale con código distinto de 0. Exige Node ≥ 18 (comprobación por versión, no por característica); si no, falla con un mensaje de versión.
- **RN-8** — La línea de DoD que pide correrlo vive en el lifecycle de **este repo**; la plantilla que se materializa en repos consumidores no la impone.

## Criterios de aceptación (Gherkin)

```gherkin
Feature: Check de enlaces del portal a GitHub

  Scenario: Todos los enlaces resuelven
    Given un portal cuyos enlaces a GitHub apuntan a rutas y anclas existentes
    When se ejecuta el check
    Then termina con código 0

  Scenario: Los anclas reales del portal pasan
    Given el portal y el árbol actuales, con enlaces a headings de task-pipeline/README.md y docs/guides/task-lifecycle.md
    When se ejecuta el check
    Then termina con código 0 y el resumen cuenta los enlaces con ancla validados

  Scenario: Ruta inexistente
    Given un enlace del portal a una ruta que no existe en el repo
    When se ejecuta el check
    Then falla nombrando el fichero del portal y la URL

  Scenario: Ancla inexistente
    Given un enlace a un fichero existente con un ancla que no coincide con ningún heading
    When se ejecuta el check
    Then falla nombrando la URL y el ancla

  Scenario Outline: Slug de heading estilo GitHub
    Given un heading <heading> en el fichero destino
    When se calcula el slug
    Then el slug es <slug>

    Examples:
      | heading                                              | slug                                          |
      | SDD: nativo o externo (opcional)                     | sdd-nativo-o-externo-opcional                 |
      | Modo SDD: `off` / `native` / `external`              | modo-sdd-off--native--external                |
      | Configuración por repo (`.claude/task-pipeline.yml`) | configuración-por-repo-claudetask-pipelineyml |
      | Trabajo en equipo y colisiones de id                 | trabajo-en-equipo-y-colisiones-de-id          |
      | Nombre_con guion_bajo y año 2026                     | nombre_con-guion_bajo-y-año-2026              |
      | `código` con *énfasis* y [enlace](x)                 | código-con-énfasis-y-enlace                   |
      | Foo ##                                               | foo                                           |

  Scenario Outline: Forma de la URL
    Given el portal contiene un enlace a <url>
    When se ejecuta el check
    Then <resultado>

    Examples:
      | url                                           | resultado                                              |
      | blob/main/README.md?plain=1                   | valida la ruta e ignora la query                       |
      | blob/main/README.md#L10-L20                   | valida la ruta y no comprueba ancla                    |
      | blob/main/README.md.                          | el punto final no forma parte de la URL                |
      | blob/main/README.md dentro de [t](...)        | el paréntesis de cierre no forma parte de la URL       |
      | blob/main/README.md#                          | ancla vacía: se ignora                                 |
      | tree/main/task-pipeline                       | directorio existente: válido, sin comprobar ancla      |
      | blob/main/Task-Pipeline/README.md             | falla: GitHub distingue mayúsculas                     |
      | blob/main/docs/mi%20guia.md con "docs/mi guia.md" | decodifica la ruta antes de comprobarla            |
      | blob/main/../../etc/passwd                    | se marca rota y no se lee fuera del repo               |
      | raw/main/README.md, blob/dev/README.md        | se ignoran: solo blob y tree sobre main                |
      | <a href="…blob/main/ruta-rota.md">            | se valida igual que un enlace Markdown                 |

  Scenario Outline: Forma del ancla
    Given un enlace con ancla <ancla> y un heading "Configuración por repo"
    When se ejecuta el check
    Then <resultado>

    Examples:
      | ancla                         | resultado                          |
      | #configuraci%C3%B3n-por-repo  | resuelve tras decodificar          |
      | #Configuración-por-repo       | resuelve tras pasar a minúsculas   |
      | #config%ZZ                    | falla con un error legible         |

  Scenario: Headings dentro de bloques de código no cuentan
    Given un fichero destino con "## Tasks" solo dentro de un bloque de código
    When un enlace apunta a "#tasks"
    Then el check lo da por roto

  Scenario Outline: Cierre de los bloques de código
    Given un destino con un bloque abierto con <apertura>
    When se calculan sus headings
    Then los headings dentro del bloque no cuentan

    Examples:
      | apertura                          |
      | tres backticks                    |
      | cuatro backticks                  |
      | tres tildes                       |
      | tres backticks sin cerrar         |

  Scenario: El front matter no cuenta como heading
    Given un destino con front matter que contiene una línea "# comentario"
    When se calculan sus headings
    Then esa línea no es un heading

  Scenario: Sufijo de duplicado sin soporte
    Given un enlace con ancla "#foo-1" y un único heading "Foo"
    When se ejecuta el check
    Then falla porque "foo-1" no existe como ancla

  Scenario: Un heading llamado como el sufijo
    Given dos headings "Foo" y "Foo 1" en el destino
    When un enlace apunta a "#foo-1"
    Then resuelve por el heading "Foo 1"

  Scenario: Destino con CRLF o BOM
    Given un destino idéntico a otro salvo por CRLF o BOM
    When se calculan sus slugs
    Then son los mismos

  Scenario: URL solo dentro de un bloque de código del portal
    Given una URL rota que aparece únicamente dentro de un fence de un .md del portal
    When se ejecuta el check
    Then no se reporta

  Scenario: Ficheros excluidos del portal no se revisan
    Given un enlace roto dentro de un fichero que srcExclude excluye
    When se ejecuta el check
    Then no se reporta

  Scenario: srcExclude se lee de config.mts
    Given un patrón nuevo en srcExclude de config.mts
    When se ejecuta el check
    Then respeta el patrón sin cambiar el script

  Scenario: srcExclude no se puede parsear
    Given un config.mts sin un srcExclude interpretable
    When se ejecuta el check
    Then falla con un error explícito y no revisa todos los .md en silencio

  Scenario: Cero enlaces encontrados
    Given un portal del que la extracción no obtiene ninguna URL
    When se ejecuta el check
    Then falla en lugar de pasar en verde

  Scenario: Todos los fallos en una ejecución
    Given tres enlaces rotos en dos ficheros y uno de ellos repetido
    When se ejecuta el check
    Then lista los tres una vez por fichero con "fichero  URL  motivo" y sale con código distinto de 0

  Scenario: Solo lectura e idempotente
    Given un árbol sin cambios
    When se ejecuta el check dos veces
    Then ambas dan el mismo resultado y git status no cambia

  Scenario Outline: Independiente del directorio de trabajo
    Given el check lanzado <desde>
    When se ejecuta
    Then da el mismo resultado

    Examples:
      | desde                               |
      | la raíz del repo                    |
      | website/                            |
      | pnpm docs:build                     |

  Scenario: Versión de Node no soportada
    Given un Node anterior a la versión mínima soportada
    When se ejecuta el check
    Then falla con un mensaje de versión y no con un error de sintaxis

  Scenario: El build falla cuando el check falla
    Given un enlace roto en el portal
    When se ejecuta pnpm docs:build
    Then el build termina con error antes de ejecutar vitepress build

  Scenario: El check se puede ejecutar solo
    Given un clon sin dependencias instaladas
    When se ejecuta node website/scripts/check-github-links.mjs
    Then corre con el Node del sistema

  Scenario: La DoD del repo recuerda correr el check
    Given docs/guides/task-lifecycle.md de este repo
    When se lee la DoD
    Then hay una línea que pide correr el check al tocar headings o mover ficheros bajo task-pipeline/ o docs/

  Scenario: La plantilla no impone el check a consumidores
    Given task-pipeline/skills/plan-task/templates/task-lifecycle.md
    When se lee su DoD
    Then no contiene la línea del check de enlaces

  Scenario: La documentación recoge el check
    Given website/README.md y spec.md
    When se buscan el check y el CU
    Then website/README.md lo documenta y spec.md enlaza este CU y amplía SC-004

  Scenario: El check pasa tras editar sus destinos
    Given ediciones posteriores en task-pipeline/README.md o el lifecycle
    When se ejecuta pnpm docs:build
    Then el check sigue en verde
```
