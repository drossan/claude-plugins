# CU-sdd-proveedor-externo — Activar SDD delegado en un plugin externo

- **Ámbito**: `features.sdd` de `.claude/task-pipeline.yml` y el ciclo de vida de la tarea (arranque y cierre)
- **Nivel**: objetivo de usuario
- **Actor primario**: mantenedor de un repo que ya usa un plugin SDD distinto del nativo
- **Interesados e intereses**:
  - Mantenedor — que el pipeline delegue en su plugin SDD sin imponer los artefactos nativos.
  - Repos con SDD nativo — que `sdd: true` siga comportándose de forma equivalente (con las salvedades del escenario «El modo nativo no cambia»).
  - Autor del plugin externo — un contrato de invocación estable y versionado.

## Precondiciones

- El repo está adoptado (`.claude/task-pipeline.yml` existe).
- El plugin externo está instalado y expone una skill invocable por el nombre configurado.

## Garantía mínima

- Un `features.sdd` mal formado o incompleto se trata como **off** sin error de parseo (fail-safe).
- Un fallo del provider (ausente o con error) **nunca** impide mover el `status:` del `.md`: se avisa.

## Garantía de éxito (postcondición)

- Con `external`, cada tarea invoca al provider al arrancar y al cerrar, no corre `sdd-lint` ni exige scaffolding SDD nativo, y la DoD refleja que el SDD lo gestiona el provider.

## Disparador

- El mantenedor escribe `features.sdd: { enabled: true, provider: "<plugin>:<skill>" }` (a mano o desde `/task-init` / `/doctor`).

## Escenario principal (éxito)

1. El pipeline lee `features.sdd` y resuelve el modo `external` (bloque con `enabled: true` y `provider` string no vacío).
2. Al arrancar una tarea, invoca la skill del provider con `contract=1 phase=start task=<ruta> plan=<ruta>`.
3. La sesión implementa la tarea; el Gherkin vive en la tarea (o se sigue el enlace a un CU si lo trae).
4. Al cerrar, tras `mutation` y antes de `fact-checker`, invoca al provider con `contract=1 phase=close task=<ruta> plan=<ruta>`.
5. La DoD marca la línea «SDD gestionado con `<provider>`» y la tarea se cierra.

## Extensiones (flujos alternativos y de error)

- **1a.** `features.sdd: true` (booleano): modo `native`, comportamiento actual equivalente (ver «El modo nativo no cambia»).
- **1b.** Bloque sin `provider`, con `provider` vacío o no-string, o con `enabled` no booleano: modo `off`.
- **2a.** La skill del provider no está instalada: aviso que el owner reconoce; no se bloquea el `.md`.
- **2b.** La skill del provider falla al ejecutarse: aviso que el owner reconoce; no se bloquea el `.md`.
- **3a.** La tarea ya enlaza a un CU (creada antes del cambio de modo): el enlace se sigue igualmente.
- **4a.** El provider reporta un problema en sus artefactos: se traslada como aviso, nunca como ERROR.

## Reglas de negocio

- **RN-1** — Solo `true` booleano activa `native`; solo bloque con `enabled: true` booleano y `provider` string no vacío activa `external`; todo lo demás es `off`.
- **RN-2** — El pipeline no valida el nombre ni el contenido que produce el provider.
- **RN-3** — Contrato de invocación v1 (experimental): `contract=1 phase=start|close task=<ruta> plan=<ruta>`. Las rutas son relativas a la raíz del repo y **existen** en el instante de la invocación: `start` tras mover la tarea a `active`; `close` antes de moverla a `completed`. Si la tarea no tiene plan legible, `plan=` va vacío con aviso, sin bloquear.
- **RN-4** — Con `external`, el **gate automático** de `sdd-lint` y `models.sdd-lint` no tienen efecto y `/doctor` no exige scaffolding SDD nativo. La invocación **manual** de `/sdd-lint` audita igualmente y avisa de que el SDD lo gestiona el provider (como con SDD off).
- **RN-5** — El valor de `provider` se pasa como **un único identificador**, nunca interpolado como argumentos. Un provider que resuelve a una skill del propio `task-pipeline` (con prefijo `task-pipeline:` o un nombre sin `:` que coincide con una de sus skills) se rechaza con aviso (modo efectivo `off`). Que un repo clonado pueda nombrar cualquier skill instalada es un riesgo conocido y documentado en el README.
- **RN-6** — Orden de cierre: `phase=close` se invoca al llegar al hueco de cierre —tras `mutation` si está activo, o tras lint/tests si no hay gate de mutation—, antes de `fact-checker`, del auto-commit y de la proyección a GitHub, de modo que lo que genere el provider entra en el commit. Al invocarlo se anota en el session log `provider phase=close: <resultado>` (`ok`, `aviso`, `ausente` o `error`).
- **RN-7** — Reentrada: `start` se invoca solo en la activación `pending → active` (ni `blocked → active` ni la reapertura `done → active` lo repiten); `close` se reintenta tras un fallo y se repite tras una reapertura `done → active` (el provider debe ser idempotente, documentado); no se invoca si falla un paso previo de la DoD (tests, lint/typecheck o `mutation` si está activo), y cada invocación añade una línea nueva al session log (append-only). Terminar sin error ni reporte cuenta como OK. Reconocer un aviso es dejar una nota en el session log; el pipeline lo señala y no cierra en silencio.
- **RN-8** — Sin respuesta, o sin canal para un provider interactivo, se trata como error del provider (aviso). No hay timeout propio.
- **RN-9** — Cancelar, desbloquear (`blocked → active`) o reabrir (`done → active`) una tarea no invoca `start` al provider. Solo hay una tarea `active` por plan, así que el pipeline no añade exclusión entre tareas.
- **RN-10** — El cambio de nativo a externo es manual (editar `features.sdd`); `/doctor` no reofrece la activación si ya hay modo `external`.
- **RN-11** — Diagnóstico del provider en `/doctor`: la vía principal es la skill visible en la sesión; `installed_plugins.json` es solo un respaldo que afina el diagnóstico (plugin ausente, instalado sin esa skill, instalado pero no cargado en esta sesión, no verificado) y **nunca declara el provider como activo**. El formato del fichero es observado y no soportado. No se deduce qué entrada aplica a este repo.

## Criterios de aceptación (Gherkin)

```gherkin
Feature: SDD delegado en un plugin externo

  Scenario Outline: Resolución del modo SDD
    Given un task-pipeline.yml con features.sdd = <valor>
    When el pipeline resuelve el modo SDD
    Then el modo es <modo>

    Examples:
      | valor                                          | modo     |
      | true                                           | native   |
      | false                                          | off      |
      | ausente                                        | off      |
      | { enabled: true, provider: "spec:run" }        | external |
      | { enabled: true }                              | off      |
      | { enabled: true, provider: "" }                | off      |
      | { enabled: true, provider: 42 }                | off      |
      | { enabled: true, provider: "   " }             | off      |
      | { enabled: true, provider: null }              | off      |
      | { enabled: true, provider: ["spec:run"] }      | off      |
      | { provider: "spec:run" }                       | off      |
      | { enabled: "true", provider: "spec:run" }      | off      |
      | { enabled: false, provider: "spec:run" }       | off      |
      | { enabled: true, provider: "solo-nombre" }     | external |
      | { enabled: true, provider: "spec:run", x: 1 }  | external |
      | "true"                                         | off      |
      | yes                                            | off      |
      | [true]                                         | off      |
      | vacío (null)                                   | off      |

  Scenario: El modo nativo no cambia
    Given un repo con features.sdd: true
    When se arranca y se cierra una tarea
    Then el flujo es equivalente en comportamiento al anterior a este cambio, incluido el gate sdd-lint
    And las salvedades son: una tarea que ya enlaza a un CU sigue ese enlace en cualquier modo, la línea de DoD de external es no aplicable en nativo y la cat. 13 de /doctor detecta el lifecycle anterior a la regla de modos

  Scenario: El provider se invoca al arrancar la tarea
    Given un repo en modo external con provider "spec:run"
    When se arranca una tarea
    Then se invoca la skill "spec:run" con phase=start, la ruta de la tarea y la ruta del plan

  Scenario: El provider se invoca al cerrar entre mutation y fact-checker
    Given un repo en modo external y una tarea con el gate de mutation superado
    When se cierra la tarea
    Then se invoca la skill del provider con phase=close antes de fact-checker
    And no se ejecuta sdd-lint

  Scenario: Provider no instalado
    Given un repo en modo external cuyo provider no está instalado
    When se arranca una tarea
    Then se avisa de que el provider no está disponible
    And la tarea arranca igualmente
    And la línea de DoD del SDD queda sin marcar hasta que el owner la reconoce

  Scenario: Provider que falla al ejecutarse
    Given un repo en modo external cuyo provider termina con error
    When se cierra la tarea
    Then se avisa del error del provider
    And el cambio de status del .md no se bloquea

  Scenario: El provider reporta un problema en sus artefactos
    Given un provider que informa de una especificación incompleta
    When se cierra la tarea
    Then el problema se traslada como aviso
    And no se trata como ERROR bloqueante

  Scenario: Gherkin en la tarea con provider externo
    Given un repo en modo external y una tarea nueva sin caso de uso enlazado
    When se materializa la tarea
    Then su sección de escenarios contiene el Gherkin y no un enlace a un CU

  Scenario: El enlace a un CU se sigue en cualquier modo
    Given un repo en modo external y una tarea cuyo apartado de escenarios enlaza a un CU
    When mutation o scenario-coverage buscan los escenarios
    Then leen los escenarios del CU enlazado

  Scenario: sdd-lint y models.sdd-lint sin efecto en external
    Given un repo en modo external con models.sdd-lint definido
    When se cierra una tarea
    Then sdd-lint no corre
    And la clave models.sdd-lint se ignora sin aviso de drift

  Scenario: Activación guiada de external
    Given un repo adoptado sin SDD activo
    When el owner elige SDD externo en /task-init o /doctor e indica el provider
    Then se escribe features.sdd con enabled: true y ese provider tras aprobar el diff

  Scenario: Activación sin canal para preguntar
    Given una sesión sin canal para preguntar
    When /task-init o /doctor llegan a la activación SDD
    Then no escriben nada y reportan que SDD no se activó

  Scenario: Repo ya en external no se reofrece
    Given un repo con features.sdd en modo external
    When corre /doctor
    Then no ofrece activar SDD de nuevo

  Scenario: Doctor avisa de bloque sin provider
    Given un repo con features.sdd: { enabled: true } sin provider
    When corre /doctor
    Then avisa de que hay intención de activar SDD pero falta el provider
    And el modo en runtime sigue siendo off

  Scenario: Doctor avisa de provider no instalado
    Given un repo en modo external cuyo provider no está instalado
    When corre /doctor
    Then reporta el drift sin escribir nada

  Scenario: Config ilegible no activa SDD
    Given un task-pipeline.yml con YAML malformado
    When el pipeline resuelve el modo SDD
    Then el modo es off y se avisa de que la config es ilegible
    And no se invoca a ningún provider

  Scenario: Las rutas pasadas existen al invocar
    Given un repo en modo external y una tarea que pasa de pending a active
    When se invoca al provider con phase=start
    Then task apunta a un fichero existente relativo a la raíz del repo
    And al cerrar, phase=close recibe la ruta de la tarea antes de moverla a completed

  Scenario: Tarea sin plan legible
    Given un repo en modo external y una tarea sin plan legible
    When se invoca al provider
    Then plan va vacío y se avisa, sin bloquear la tarea

  Scenario: La invocación lleva la versión del contrato
    Given un repo en modo external
    When se invoca al provider
    Then los argumentos incluyen contract=1

  Scenario: Provider que apunta al propio pipeline
    Given un repo con features.sdd con provider "task-pipeline:plan-task"
    When el pipeline resuelve el modo SDD
    Then el modo efectivo es off
    And se avisa de que el provider es una skill del propio task-pipeline

  Scenario: Provider sin prefijo que coincide con una skill del pipeline
    Given un repo con features.sdd con provider "doctor"
    When el pipeline resuelve el modo SDD
    Then el modo efectivo es off
    And se avisa de que el provider es una skill del propio task-pipeline

  Scenario: Provider pasado como único identificador
    Given un provider configurado como "spec:run phase=close"
    When se invoca al provider
    Then el valor completo se trata como un identificador y no como argumentos adicionales

  Scenario: Cierre repetido tras un fallo
    Given una tarea en modo external cuyo cierre falló en fact-checker
    When se reintenta el cierre
    Then phase=close se invoca de nuevo

  Scenario: Provider sin respuesta
    Given una sesión sin canal y un provider que necesita input del usuario
    When se invoca al provider
    Then se trata como error del provider y se avisa

  Scenario: Cierre limpio con provider OK
    Given un provider que termina sin error ni reporte
    When se cierra la tarea
    Then la línea de DoD «SDD gestionado con el provider» se puede marcar

  Scenario: Aviso sin reconocer no cierra en silencio
    Given una línea de DoD del SDD sin marcar por provider ausente
    When se intenta cerrar la tarea sin reconocer el aviso
    Then el pipeline señala la línea pendiente y pide la nota en el session log

  Scenario: El pipeline relee la tarea tras el provider
    Given un provider que modifica la tarea en phase=start
    When termina la invocación
    Then el pipeline relee la tarea antes de continuar

  Scenario: Cancelar una tarea no invoca al provider
    Given una tarea en modo external
    When se cancela
    Then no se invoca al provider

  Scenario: Líneas de DoD de otro modo no aplican
    Given una tarea creada en modo nativo y cerrada en modo external
    When se evalúa su DoD
    Then la línea del gate sdd-lint se trata como no aplicable

  Scenario: scenario-coverage endurece en la tarea sin enlace
    Given un repo en modo external y una tarea con el Gherkin inline
    When scenario-coverage incorpora un escenario aceptado
    Then el escenario se añade al Scenarios de la tarea

  Scenario: scenario-coverage endurece en el CU enlazado
    Given un repo en modo external y una tarea que enlaza a un CU
    When scenario-coverage incorpora un escenario aceptado
    Then el escenario se añade al CU enlazado

  Scenario: sdd-lint manual en external
    Given un repo en modo external
    When el owner ejecuta /sdd-lint a mano
    Then audita igualmente y avisa de que el SDD lo gestiona el provider

  Scenario: El orden de close incluye lo que genera el provider en el commit
    Given un repo en modo external con auto-commit activo y un provider que genera ficheros en phase=close
    When se cierra la tarea
    Then los ficheros generados entran en el commit de la tarea
    And la proyección a GitHub ocurre después

  Scenario: Doctor avisa de clave desconocida bajo features.sdd
    Given un repo con features.sdd: { enabled: true, provder: "spec:run" }
    When corre /doctor
    Then avisa de la clave desconocida y de que falta provider

  Scenario: Doctor distingue plugin ausente de skill ausente
    Given un repo en modo external cuyo plugin está instalado pero no expone la skill configurada
    When corre /doctor
    Then reporta que falta la skill y no que falta el plugin

  Scenario: Doctor en external sin plantillas nativas
    Given un repo en modo external sin spec ni plantillas SDD nativas
    When corre /doctor
    Then no reporta scaffolding SDD ausente

  Scenario: Doctor avisa de artefactos nativos huérfanos
    Given un repo en modo external con spec, CU y ADR nativos existentes
    When corre /doctor
    Then avisa de los artefactos nativos que el provider ya no gestiona
    And no migra ni borra nada

  Scenario Outline: Entrada del provider en la activación guiada
    Given la activación guiada de SDD externo
    When el owner responde <entrada> al prompt de provider
    Then <resultado>

    Examples:
      | entrada                        | resultado                                              |
      | vacío o solo espacios          | no escribe nada y reporta que no se activó             |
      | cancelar                       | no escribe nada y reporta que no se activó             |
      | un valor con ": " o "#"        | lo escribe entrecomillado y el YAML sigue siendo válido |
      | un valor válido, diff rechazado | no escribe nada                                        |

  Scenario: features.sdd malformado antes de activar
    Given un repo con features.sdd: yes
    When corre /doctor
    Then lo trata como off y ofrece la activación sin tratarlo como config inválida

  Scenario: Doctor detecta un lifecycle materializado anterior a la regla de modos
    Given un repo con features.sdd en bloque con provider y docs/guides/task-lifecycle.md sin la sección "Modo SDD"
    When corre /doctor
    Then reporta que el lifecycle es anterior a 0.18.0 y no define el modo external
    And ofrece añadir la sección "Modo SDD" y los pasos 4b/3c desde la plantilla actual con diff y aprobación
    And no escribe nada sin aprobación

  Scenario: Lifecycle al día no se reporta
    Given un repo con docs/guides/task-lifecycle.md que contiene la sección "Modo SDD"
    When corre /doctor
    Then la categoría no reporta drift

  Scenario: Repo sin SDD y con lifecycle antiguo
    Given un repo con features.sdd off y un lifecycle sin la sección "Modo SDD"
    When corre /doctor
    Then lo menciona como aviso informativo sin ofrecer cambios obligatorios

  Scenario: Los cuatro riesgos están nombrados
    Given el README del plugin
    When se lee la lista de riesgos del provider
    Then aparecen cuatro: automatización sin revisión, reescritura de la tarea en phase=start (hipótesis), identificador único y rechazo de skills propias respetados por el modelo, y ausencia de confirmación en toda invocación
    And "primera invocación" no sugiere que las siguientes la piden

  Scenario: El README recomienda revisar el task-pipeline.yml de un repo ajeno
    Given el README del plugin
    When un mantenedor lee la sección del provider externo
    Then encuentra el consejo de revisar features.sdd y features.git-automation antes de trabajar en un repo ajeno
    And la recomendación de no usar auto-commit ni auto-pr con providers no confiables

  Scenario: El portal no copia los riesgos
    Given website/features/sdd.md
    When se lee la sección del provider externo
    Then hay un resumen de una línea y un enlace al README, sin la lista de riesgos

  Scenario: Ninguna mención presenta la inyección como confirmada
    Given el README, el portal y el lifecycle
    When se busca "inyección" o "reescribe la tarea"
    Then toda mención la califica como hipótesis

  Scenario: El barrido de identidad se limita a SDD
    Given las apariciones de "idéntic", "exactamente igual", "intacto" y "byte-" fuera de CHANGELOG (entradas anteriores a 0.18.4), dist/ y node_modules/
    When se clasifican
    Then las que afirman equivalencia del modo off o nativo de SDD llevan la salvedad (enlace a un CU; en nativo, línea de DoD de external y cat. 13 de /doctor)
    And las ajenas a SDD (git-automation, honestidad) se dejan sin tocar y la tarea lo registra
    And el escenario "El modo nativo no cambia" de este CU lleva la salvedad

  Scenario Outline: phase=close según el paso previo del cierre
    Given un repo en modo external y un paso previo en estado <estado>
    When la tarea llega al cierre
    Then phase=close <invocacion>

    Examples:
      | estado                                          | invocacion   |
      | tests en rojo                                   | no se invoca |
      | lint o typecheck en rojo                        | no se invoca |
      | mutation activo y sin superar                   | no se invoca |
      | mutation-gate false, tests y lint en verde      | se invoca    |
      | stack.mutation-tool none, tests y lint en verde | se invoca    |

  Scenario: Cierre tras una reapertura
    Given una tarea en modo external cerrada y reabierta (done → active)
    When llega de nuevo al hueco de cierre
    Then phase=close se invoca otra vez y el session log añade una línea nueva

  Scenario: La invocación de phase=close deja rastro verificable
    Given un repo en modo external y una tarea que va a cerrarse
    When se invoca phase=close
    Then el session log recoge una línea "provider phase=close: <resultado>"
    And fact-checker comprueba que esa línea existe y la declara autodeclarada

  Scenario: Rastro cuando el provider falla o está ausente
    Given un repo en modo external con un provider ausente o con error
    When se intenta invocar phase=close
    Then el session log recoge la línea con el resultado "ausente" o "error"
    And fact-checker lo trata como aviso a reconocer, no como INCORRECTO

  Scenario: Falta la línea de rastro
    Given una tarea en modo external que llega a fact-checker sin la línea "provider phase=close:"
    When corre fact-checker
    Then la afirmación "el provider se invocó" es NO VERIFICABLE, no INCORRECTO

  Scenario: Reintento de phase=close
    Given una tarea en modo external cuyo cierre falló después de invocar al provider
    When se reintenta el cierre y se invoca phase=close de nuevo
    Then el session log (append-only) tiene una línea nueva y fact-checker toma la última

  Scenario: Tarea creada en external y cerrada en nativo
    Given una tarea creada en modo external con el Gherkin inline y el repo ya en features.sdd: true
    When se evalúa su DoD
    Then la línea "SDD gestionado con <provider>" se trata como no aplicable
    And aplican las líneas del modo nativo (spec/CU o "sin cambios de spec/CU", y el gate sdd-lint)
    And el Gherkin inline de la tarea no se migra a la fuerza al CU

  Scenario: La regla de líneas de DoD de otro modo es visible
    Given docs/guides/task-lifecycle.md y su plantilla
    When se lee la sección de DoD
    Then hay una nota visible, no un comentario HTML, que dice que las líneas de otro modo no aplican en ambos sentidos

  Scenario: El HOW-TO menciona phase=start y el modo external
    Given los dos HOW-TO-START-A-TASK.md (repo y plantilla)
    When se buscan "phase=start" y "external"
    Then ambos los mencionan

  Scenario: Los tres sitios de B6 dicen lo mismo
    Given fact-checker/SKILL.md, el paso 4 del lifecycle y el Paso 8 de plan-task
    When se lee qué afirmación sobre el provider se verifica
    Then los tres hablan de la línea "provider phase=close:" y de su carácter autodeclarado

  Scenario: Lifecycle del repo y plantilla sincronizados
    Given docs/guides/task-lifecycle.md y su plantilla
    When se comparan los pasos 4b y 3c, la DoD de external y la nota de otro modo
    Then dicen lo mismo, salvo lo propio de este repo

  Scenario: Release 0.18.4 coherente
    Given plugin.json y CHANGELOG.md
    When se lee la versión
    Then ambos dicen 0.18.4
    And el CHANGELOG avisa de que los lifecycles materializados en 0.18.0-0.18.3 no se detectan y hay que re-sincronizar 4b, 3c y la DoD a mano

  Scenario: La spec recoge el requisito del cierre en external
    Given .claude/specs/task-pipeline/spec.md
    When se buscan los requisitos de phase=close
    Then existe un FR que fija cuándo se invoca y el rastro verificable

  Scenario: El barrido final no reintroduce identidad sin salvedad
    Given el CHANGELOG 0.18.4 ya escrito
    When se repite el grep de "idéntic"
    Then ninguna aparición nueva afirma identidad de SDD sin salvedad

  Scenario Outline: Diagnóstico del provider con skill visible o no en la sesión
    Given un repo en modo external con provider "spec:run"
    And la skill "spec:run" <visibilidad> en la sesión
    And el respaldo installed_plugins.json en estado <respaldo>
    When corre /doctor
    Then el diagnóstico es <diagnostico>
    And no escribe nada

    Examples:
      | visibilidad | respaldo                                                       | diagnostico                              |
      | visible     | sin consultar                                                  | instalado                                |
      | no visible  | entrada de "spec@" con la skill en installPath                 | instalado pero no cargado en esta sesión |
      | no visible  | entrada de "spec@" sin esa skill en installPath                | instalado sin esa skill                  |
      | no visible  | entrada de "spec@" con installPath inexistente                 | instalado sin esa skill                  |
      | no visible  | entrada de "spec@" sin installPath o con installPath no string | no verificado si no queda otra entrada   |
      | no visible  | clave "spec@mkt" con lista vacía                               | plugin ausente                           |
      | no visible  | sin ninguna clave con prefijo "spec@"                          | plugin ausente                           |
      | no visible  | solo "spec-kit@mkt" y "spec" sin arroba                        | plugin ausente                           |
      | no visible  | fichero inexistente                                            | no verificado                            |
      | no visible  | fichero vacío o que no parsea                                  | no verificado                            |
      | no visible  | error de lectura distinto de inexistente                       | no verificado                            |
      | no visible  | raíz que no es objeto, "plugins" ausente, nulo o array         | no verificado                            |
      | no visible  | valor de la clave que no es una lista                          | no verificado                            |
      | no visible  | SKILL.md ilegible o es un directorio                           | no verificado                            |
      | no visible  | HOME sin definir o ruta del fichero no resoluble               | no verificado                            |

  Scenario: Seguridad de la ruta al buscar la skill
    Given un provider cuyo componente de skill o plugin contiene "..", "/" o "\"
    When /doctor construye la ruta a buscar
    Then lo rechaza como identificador inválido y no lee nada fuera de installPath/skills

  Scenario: El provider que apunta a task-pipeline no se comprueba como instalado
    Given un provider "task-pipeline:plan-task"
    When corre /doctor
    Then avisa de que apunta al propio pipeline y no ejecuta la comprobación de instalación

  Scenario: La comprobación solo corre en modo external
    Given un repo en modo off o native
    When corre /doctor
    Then no consulta installed_plugins.json

  Scenario: Visibilidad por nombre cualificado
    Given una skill "run" de otro plugin visible en la sesión
    When /doctor busca "spec:run"
    Then no la cuenta como visible

  Scenario: Gravedad de cada diagnóstico
    Given los resultados del diagnóstico del provider
    When /doctor los reporta
    Then "plugin ausente" e "instalado sin esa skill" se reportan como drift y "no verificado" e "instalado pero no cargado en esta sesión" como aviso

  Scenario: El mensaje nombra qué falta
    Given un provider cuyo plugin está instalado pero no expone la skill
    When /doctor lo reporta
    Then el mensaje nombra la skill y no el plugin como lo que falta

  Scenario: Reinstalar o recargar cambia el diagnóstico
    Given un diagnóstico "instalado pero no cargado en esta sesión"
    When el owner recarga los plugins y repite /doctor
    Then pasa a "instalado"

  Scenario: Doctor idempotente
    Given cualquiera de los estados anteriores
    When corre /doctor dos veces
    Then el reporte es el mismo y no se escribe nada

  Scenario: El respaldo nunca declara el provider como activo
    Given un repo en modo external con la skill del provider no visible en la sesión
    And un installed_plugins.json con la skill presente en installPath
    When corre /doctor
    Then no informa de que el provider está activo ni "OK"

  Scenario: Varias entradas del mismo plugin
    Given un installed_plugins.json con varias entradas de "spec@mkt" para scopes, proyectos y versiones distintos
    When /doctor busca la skill del provider
    Then basta con que una entrada tenga la skill en installPath, sin deducir cuál aplica a este repo

  Scenario: El provider no lleva marketplace
    Given un provider "spec:run" y un installed_plugins.json con la clave "spec@mkt"
    When /doctor busca el plugin
    Then compara por el prefijo "spec@" y acepta más de un marketplace

  Scenario: El formato del respaldo se declara no soportado
    Given la categoría 12 de /doctor
    When se lee cómo se usa installed_plugins.json
    Then nombra la ruta, la clave "<plugin>@<marketplace>", la lista de entradas y installPath, y dice que es un formato observado y no soportado
    And no cita la versión ni la lista de campos

  Scenario: El CU fija la regla del respaldo
    Given este caso de uso
    When se buscan las reglas de negocio
    Then RN-11 dice que el respaldo afina el diagnóstico y nunca declara el provider como activo

  Scenario Outline: Repetición de phase=close tras un fallo o una reapertura
    Given una tarea en modo external <situacion>
    When el cierre vuelve a llegar al hueco y se invoca phase=close de nuevo
    Then el session log añade una línea nueva "provider phase=close:" sin tocar las anteriores
    And fact-checker toma la última

    Examples:
      | situacion                                          |
      | cuyo cierre falló después de invocar al provider   |
      | cerrada y reabierta (done → active)                |

  Scenario: El riesgo 4 del README no repite la frase anterior
    Given la lista de riesgos del provider en el README
    When se lee el riesgo de ausencia de confirmación
    Then no repite palabra por palabra la frase que lo precede

  Scenario: El Outline de repetición conserva los Then
    Given el CU tras la edición
    When se buscan «Cierre repetido tras un fallo», «Cierre tras una reapertura» y «Reintento de phase=close»
    Then ninguno existe como Scenario y el Outline «Repetición de phase=close…» conserva la unión de sus Then

  Scenario: El riesgo 4 conserva etiqueta y contenido
    Given el README tras la edición
    When se lee la lista de riesgos
    Then siguen siendo cuatro, el 4 nombra la ausencia de confirmación en toda invocación y "primera invocación" no aparece

  Scenario: Release 0.18.5 coherente
    Given plugin.json y CHANGELOG.md
    When se lee la versión
    Then ambos dicen 0.18.5
    And la entrada 0.18.5 está sobre la 0.18.4, tiene fecha y cita B12 y las simplificaciones
    And cita B11 solo como nota de website/

  Scenario: El CHANGELOG cita solo lo cerrado
    Given el plan con sus tareas
    When se escribe la entrada 0.18.5
    Then solo describe lo que las tareas cerradas entregaron

  Scenario: La versión anterior no queda como actual
    Given README, portal y docs
    When se busca "0.18.4"
    Then solo aparece como versión histórica
```
