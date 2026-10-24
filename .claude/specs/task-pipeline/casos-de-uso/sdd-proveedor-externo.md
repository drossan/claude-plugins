# CU-sdd-proveedor-externo — Activar SDD delegado en un plugin externo

- **Ámbito**: `features.sdd` de `.claude/task-pipeline.yml` y el ciclo de vida de la tarea (arranque y cierre)
- **Nivel**: objetivo de usuario
- **Actor primario**: mantenedor de un repo que ya usa un plugin SDD distinto del nativo
- **Interesados e intereses**:
  - Mantenedor — que el pipeline delegue en su plugin SDD sin imponer los artefactos nativos.
  - Repos con SDD nativo — que `sdd: true` siga comportándose exactamente igual.
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
2. Al arrancar una tarea, invoca la skill del provider con `phase=start task=<ruta> plan=<ruta>`.
3. La sesión implementa la tarea; el Gherkin vive en la tarea (o se sigue el enlace a un CU si lo trae).
4. Al cerrar, tras `mutation` y antes de `fact-checker`, invoca al provider con `phase=close task=<ruta> plan=<ruta>`.
5. La DoD marca la línea «SDD gestionado con `<provider>`» y la tarea se cierra.

## Extensiones (flujos alternativos y de error)

- **1a.** `features.sdd: true` (booleano): modo `native`, comportamiento actual intacto.
- **1b.** Bloque sin `provider`, con `provider` vacío o no-string, o con `enabled` no booleano: modo `off`.
- **2a.** La skill del provider no está instalada: aviso que el owner reconoce; no se bloquea el `.md`.
- **2b.** La skill del provider falla al ejecutarse: aviso que el owner reconoce; no se bloquea el `.md`.
- **4a.** El provider reporta un problema en sus artefactos: se traslada como aviso, nunca como ERROR.
- **3a.** La tarea ya enlaza a un CU (creada antes del cambio de modo): el enlace se sigue igualmente.

## Reglas de negocio

- **RN-1** — Solo `true` booleano activa `native`; solo bloque con `enabled: true` booleano y `provider` string no vacío activa `external`; todo lo demás es `off`.
- **RN-2** — El pipeline no valida el nombre ni el contenido que produce el provider.
- **RN-3** — Contrato de invocación v1 (experimental): `contract=1 phase=start|close task=<ruta> plan=<ruta>`. Las rutas son relativas a la raíz del repo y **existen** en el instante de la invocación: `start` tras mover la tarea a `active`; `close` antes de moverla a `completed`. Si la tarea no tiene plan legible, `plan=` va vacío con aviso, sin bloquear.
- **RN-4** — Con `external`, el **gate automático** de `sdd-lint` y `models.sdd-lint` no tienen efecto y `/doctor` no exige scaffolding SDD nativo. La invocación **manual** de `/sdd-lint` audita igualmente y avisa de que el SDD lo gestiona el provider (como con SDD off).
- **RN-5** — El valor de `provider` se pasa como **un único identificador**, nunca interpolado como argumentos. Un provider que resuelve a una skill del propio `task-pipeline` se rechaza con aviso (modo efectivo `off`). Que un repo clonado pueda nombrar cualquier skill instalada es un riesgo conocido y documentado en el README.
- **RN-6** — Orden de cierre: `phase=close` se invoca tras `mutation`, antes de `fact-checker`, del auto-commit y de la proyección a GitHub, de modo que lo que genere el provider entra en el commit.
- **RN-7** — Reentrada: `start` se invoca una vez por activación de la tarea; `close` se reintenta tras un fallo (el provider debe ser idempotente, documentado) y no se invoca si `mutation` falla. Terminar sin error ni reporte cuenta como OK. Reconocer un aviso es dejar una nota en el session log; el pipeline lo señala y no cierra en silencio.
- **RN-8** — Sin respuesta, o sin canal para un provider interactivo, se trata como error del provider (aviso). No hay timeout propio.
- **RN-9** — Cancelar o reabrir una tarea no invoca al provider. Solo hay una tarea `active` por plan, así que el pipeline no añade exclusión entre tareas.
- **RN-10** — El cambio de nativo a externo es manual (editar `features.sdd`); `/doctor` no reofrece la activación si ya hay modo `external`.

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
    Then el flujo es idéntico al anterior a este cambio, incluido el gate sdd-lint

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

  Scenario: Provider pasado como único identificador
    Given un provider configurado como "spec:run phase=close"
    When se invoca al provider
    Then el valor completo se trata como un identificador y no como argumentos adicionales

  Scenario: Cierre repetido tras un fallo
    Given una tarea en modo external cuyo cierre falló en fact-checker
    When se reintenta el cierre
    Then phase=close se invoca de nuevo

  Scenario: Mutation fallida no invoca al provider
    Given una tarea en modo external con el gate de mutation sin superar
    When se intenta cerrar la tarea
    Then no se invoca al provider con phase=close

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
```
