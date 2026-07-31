---
id: UC-<AREA>-<slug>      # <AREA> = alias del package declarado en `features.use-cases.areas` del YAML (MAYÚSCULAS sin guiones); sin entrada declarada → el package en MAYÚSCULAS sin guiones (shop-cart → SHOPCART). <slug> = kebab, 2-4 palabras, nombra la capacidad (no la implementación). El nombre del fichero ES el id.
package: <package>
status: draft             # draft | active — active = todos los ACs tienen su test en verde. Sin harness que taguear (`features.tdd: false` O `stack.test-runner: none`) los UCs se quedan en draft: spec sin verificación automática
trace:                    # los ficheros donde SE EDITA el comportamiento (rutas desde la raíz del repo) — siempre el artefacto vivo, nunca una plantilla/semilla que se copia. Los tests NO van aquí: se encuentran por su tag [UC-<AREA>-<slug>].
  - <ruta/al/fichero.ts>
adr: []                   # opcional: decisiones de arquitectura que condicionan el UC, SI el repo mantiene ADRs (p.ej. docs/adr/); si no los mantiene, borra esta clave
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# UC-<AREA>-<slug> — <la capacidad en una frase corta>

<!-- QUÉ ES ESTO. Un caso de uso es la spec VIVA de un comportamiento que el
     software tiene HOY — sobrevive a los planes y tareas que lo construyeron.
     Los planes/tareas son efímeros (se archivan al cerrar); esto es lo que queda.

     DE DÓNDE NACE. Sus ACs son escenarios Gherkin PROMOVIDOS desde las tareas
     que los implementaron (o escritos aquí primero, si el UC precede al plan):
     - SUBE el escenario que describe comportamiento observable del producto.
     - NO SUBE el escenario de andamiaje de la tarea (bootstrap, migración,
       refactor interno): ese muere con la tarea, como hasta ahora.
     - Al subir, generaliza si hace falta: el escenario de la tarea puede ser
       más concreto que el comportamiento que consolida.
     - Si una tarea CAMBIA un comportamiento ya especificado, ACTUALIZA el AC
       existente (y su test) — nunca añadas un AC que contradiga otro.

     CICLO DE VIDA. Nace en `status: draft` (committeable sin tests). Pasa a
     `active` cuando cada AC tiene al menos un test en verde. Si el
     comportamiento se retira del producto, el UC se borra (git lo recuerda).
     RENOMBRAR un UC es una operación de primera clase: ver la checklist en el
     README del plugin → "Use cases (opcional)". -->

## Intent

<Qué consigue el actor y por qué le importa al producto. 2-4 frases; si hay una
regla de negocio que gobierna el caso, dila en negrita.>

## Actors and trigger

- **Actor:** <quién lo ejercita (usuario, rol, sistema externo, job)>
- **Trigger:** <qué lo dispara>

## Main flow

<!-- El camino feliz en pasos numerados, en lenguaje de dominio (sin UI ni
     detalles de implementación). Los desvíos referencian estos números.
     REGLA ANTI-DRIFT: NO dupliques aquí un detalle que un AC ya fija (formatos,
     límites, valores concretos) — referéncialo («…con el formato que fija AC5»).
     Cada dato duplicado es una copia más que, sin validador, acaba
     contradiciéndose. -->

1. <paso>
2. <paso>

## Alternative flows / errors

<!-- Un desvío por bullet: nombre, paso del main flow donde salta, y cómo cierra
     (termina / continúa en el paso n con qué ajuste). -->

- **<Desvío>** (paso <n>): <qué pasa y cómo cierra>.

## Acceptance criteria (Gherkin)

<!-- Cada `Scenario` es UN criterio de aceptación, numerado `ACn · <título>`.
     Mismas reglas de calidad que `## Scenarios (Gherkin)` de una tarea
     (declarativo > imperativo, un escenario = un comportamiento, disciplina
     G/W/T, `Scenario Outline` para fronteras) — ver templates/task.md; no se
     repiten aquí.

     Reglas propias del UC:
     - Numeración correlativa DENTRO del UC. Un AC retirado no libera su
       número (los tags de tests viejos no deben re-significarse).
     - Un `Scenario Outline` (comportamiento + variaciones) es UN solo AC.
     - Cada AC mapea 1:1 con al menos un test cuyo título empieza por
       `[UC-<AREA>-<slug>] ACn · …` (o el tag en su `describe`). Es lo que
       el trace comprueba para dar el UC por `active`.
     - Residual conocido: dos ramas que añaden ACs al MISMO UC pueden elegir
       el mismo `ACn`. A diferencia de los task-ids (ficheros nuevos, add/add
       silencioso), aquí ambas editan el mismo fichero → git da conflicto
       textual visible al mergear; si aun así cuela, `/doctor` reporta el
       `ACn` duplicado. -->

```gherkin
Feature: UC-<AREA>-<slug> — <capacidad>

  Scenario: AC1 · <comportamiento del camino feliz>
    Given <precondición / estado>
    When <acción de dominio>
    Then <resultado observable y verificable>

  Scenario: AC2 · <caso de error / borde>
    Given ...
    When ...
    Then <error esperado, efecto>
```

## Out of scope

<!-- Las fronteras EXPLÍCITAS: qué podría parecer parte de este UC y no lo es,
     y dónde vive. Evita UCs solapados y le da baseline a scenario-coverage.
     REGLA: cada bullet lleva un destino EXISTENTE (el fichero de otro UC, un
     package, una skill/doc concreta). Un "no existe aún" NO es una frontera —
     es un hueco: no lo declares aquí (anótalo en Notes como candidato a UC si
     quieres; scenario-coverage lo tratará como hueco, no como frontera). -->

- <comportamiento excluido> → <destino existente: `UC-<AREA>-<otro-slug>.md` / otro package / skill o doc concreta>.

## Notes / links

<Contexto que no cabe arriba: UCs relacionados (enlázalos por fichero), matices
de dominio, candidatos a UC futuro. Opcional; bórrala si no aporta.>

## Change log

<!-- Qué plan/tarea creó o tocó este UC y qué cambió. Es lo que conecta la spec
     viva con el trabajo (efímero) que la formó. Una línea por cambio. -->

- YYYY-MM-DD: creado (`draft`) desde <plan-id>.
- YYYY-MM-DD: AC<n> <añadido|actualizado> por <task-id>; `draft` → `active`.
