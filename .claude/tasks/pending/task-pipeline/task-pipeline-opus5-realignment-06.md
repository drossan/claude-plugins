---
id: task-pipeline-opus5-realignment-06
package: task-pipeline
plan: opus5-realignment
status: pending
priority: 3
depends_on: []
estimate: 4h
actual:
issue: 32
created: 2026-08-09
updated: 2026-08-09
---

# Baseline: valor a ciegas, después coste, veredicto con la regla corregida

## Description

Produce la evidencia con la que un **plan posterior** decidirá si `design-review` y
`scenario-coverage` siguen justificando su coste en Opus 5. No cambia comportamiento: read-only, y
su entregable es un informe.

Dos versiones anteriores de esta tarea fueron tumbadas —por `design-review` (metía a `fact-checker`
en un ranking con denominador cero; cifra de valor no reproducible) y por `scenario-coverage` (la
regla seguía sin caso de denominador degenerado)—. Aquí quedan corregidas.

## Spec

**Alcance del ranking**: solo **`design-review`** y **`scenario-coverage`**.
`fact-checker` **queda fuera** — no produce entradas de `Registro de cambios del plan` por
construcción (gate de cierre de tarea; su salida vive en `.claude/context/`), su denominador sería
cero y la regla lo condenaría automáticamente contra un gate no-negociable. Su **coste sí se
reporta** (referencia: 118 entradas de `usage` a nivel superior + 98 en subagentes) como dato
informativo. Medir su valor exigiría partir de los `INCORRECTO`/`NO VERIFICABLE` de
`.claude/context/*.md`: es trabajo de otro plan.

**Paso 0 — fijar la unidad ANTES de contar.** La cifra "23" del borrador mezclaba tres unidades
(entradas fechadas en unos planes, hallazgos numerados en otros) y **no es reproducible**: no se
reutiliza. Se fija **una** unidad —hallazgo/recomendación individual— y se **re-deriva** el total
sobre los 6 planes cerrados. La definición escrita debe resolver el caso **"hallazgo aceptado en
parte y anulado en parte"**: ningún hallazgo puede quedar sin clasificar.

**Mitad A — valor, a ciegas** (sin haber consultado ninguna cifra de tokens). Tres buckets:
- **cambio material**
- **cosmético**
- **recomendación correcta anulada por el owner** — verificado que existe (`collision-free-ids`,
  `docs-portal-and-tracking`, `github-tracking-enrichment` #4 y #7). **No cuenta como coste de la
  fase**: en "cosmético" castigaría a `design-review` por los overrides del propio owner.

Si la mitad A se reanuda en otra sesión, el session log debe demostrar que **no se consultó coste
entre medias**; si se consultó, lo clasificado después se marca **no ciego**.

**Mitad B — coste** (solo tras cerrar la mitad A).
- **Mapear transcript → plan** como paso explícito: ese mapeo **no existe** en el repo. Población
  restringida a los transcripts de los 6 planes cerrados, **no** los 19. Un transcript que abarque
  dos planes: se documenta el criterio de reparto o se excluye declarándolo. Un plan sin transcript
  localizable: se declara que no aporta coste y **no se extrapola** desde los demás. El informe dice
  cuántos transcripts quedaron sin mapear.
- **Declarado**: el agregador de `pipeline-usage/SKILL.md` toma **un** transcript y emite
  "POR SUBAGENTE" **sin clave de fase**. El cruce fase×subagente **requiere un agregador propio**;
  es obtenible (los subagentes llevan `attributionSkill`) pero no es lo que la skill emite tal cual.

**Veredicto — con casos degenerados declarados.** Rankear por **coste por cambio material**.
Si la peor cuesta **≥3×** que la mejor → plan de reducción para **esa** fase. Si no → se cierran
como justificadas. **Ninguna división por cero**: si una fase tiene 0 cambios materiales, o coste
atribuido 0, o ambos → **"no rankeable"**, se declara como tal y **no** se convierte en ratio
infinito ni en condena automática. Un veredicto de "plan de reducción" debe dejar registrado
**dónde** se abre ese plan o por qué se pospone.

**Auditoría complementaria**: `/claude-api prompt-audit` con target `claude-opus-5` sobre
`task-pipeline/skills/**/SKILL.md` y `skills/plan-task/templates/*.md`. Hallazgos y diff propuesto
**sin aplicar** — ningún fichero del plugin queda modificado por la auditoría.

**Entregable**: `.claude/specs/task-pipeline/opus5-audit.md`.

**Limitaciones a declarar con estas palabras**: el eje de valor es **auto-reportado** (las entradas
las escribió el mismo orquestador que corrió la fase), n=6; la atribución de tokens es
**best-effort** (29,7% de las entradas de nivel superior y 49,0% de las de subagentes llevan
`attributionSkill`) y el informe debe decir **qué porcentaje quedó sin atribuir**.

## Scenarios (Gherkin)

```gherkin
Feature: Baseline de coste y valor de las fases con subagente

  Scenario: La clasificación de valor precede al coste
    Given los 6 planes cerrados
    When se ejecuta la mitad A
    Then cada hallazgo queda clasificado en uno de los tres buckets
    And no se ha consultado ninguna cifra de tokens todavía

  Scenario: La mitad A se reanuda en otra sesión
    Given una mitad A incompleta y una sesión nueva
    When se retoma la clasificación
    Then el session log demuestra que no se consultó coste entre ambas sesiones
    And si se consultó, lo clasificado después queda marcado como no ciego

  Scenario: Una recomendación anulada por el owner no penaliza a su fase
    Given un hallazgo correcto que el owner decidió no aplicar
    When se clasifica
    Then queda en el bucket de anulados por el owner
    And no cuenta como coste de la fase que lo produjo

  Scenario: Un hallazgo aceptado en parte tiene destino definido
    Given un hallazgo que el owner aceptó en parte y anuló en parte
    When se clasifica
    Then la definición escrita fija a qué bucket va
    And ningún hallazgo queda sin clasificar

  Scenario: fact-checker se reporta pero no se rankea
    Given que fact-checker no produce entradas de Registro de cambios del plan
    When se construye el ranking
    Then fact-checker no aparece en él
    And su coste se reporta aparte como dato informativo

  Scenario: La unidad de conteo se fija antes de contar
    Given los 6 planes cerrados con formatos de change log heterogéneos
    When se inicia la mitad A
    Then existe una única definición escrita de qué cuenta como un hallazgo
    And el total se re-deriva con esa definición

  Scenario: La población de coste casa con la de valor
    Given 19 transcripts disponibles y 6 planes cerrados
    When se calcula el coste
    Then solo se agregan los transcripts mapeados a esos 6 planes
    And el mapeo utilizado queda documentado

  Scenario: Un transcript abarca dos planes
    Given un transcript con trabajo de dos de los planes cerrados
    When se construye el mapeo
    Then se documenta el criterio de reparto, o se excluye declarándolo
    And el informe dice cuántos transcripts quedaron sin mapear

  Scenario: Un plan cerrado sin transcript localizable
    Given uno de los 6 planes sin transcript
    When se calcula el coste
    Then el informe declara que ese plan no aporta coste
    And no se extrapola su coste desde los demás

  Scenario Outline: Denominadores degenerados no producen condenas
    Given una fase con <materiales> cambios materiales y coste atribuido <coste>
    When se aplica la regla
    Then el veredicto es <veredicto>

    Examples:
      | materiales | coste | veredicto                                       |
      | 0          | > 0   | no rankeable, se declara; no "ratio infinito"   |
      | > 0        | 0     | no rankeable, se declara                        |
      | 0          | 0     | no rankeable, se declara                        |

  Scenario Outline: El veredicto sale de la regla, no del criterio del momento
    Given un ratio de coste por cambio material de <ratio> entre la peor y la mejor fase
    When se aplica la regla
    Then el resultado es <veredicto>

    Examples:
      | ratio | veredicto                        |
      | 1.5×  | ambas justificadas, se documenta |
      | 2.9×  | ambas justificadas, se documenta |
      | 3×    | plan de reducción para la peor   |
      | 6×    | plan de reducción para la peor   |

  Scenario: Un veredicto de reducción deja destino
    Given un veredicto de plan de reducción para una de las dos fases
    When se cierra la tarea
    Then queda registrado dónde se abre ese plan, o por qué se pospone

  Scenario: La auditoría entrega diff sin aplicar
    Given prompt-audit corrido sobre las skills y las plantillas
    When se publica el informe
    Then incluye hallazgos y el diff propuesto
    And ningún fichero del plugin quedó modificado por la auditoría

  Scenario: El informe declara lo que no puede garantizar
    Given que la atribución por fase es best-effort
    When se publica el informe
    Then indica qué porcentaje del gasto quedó sin atribuir
    And declara que el eje de valor es auto-reportado sobre n=6
```

## Provides

- `.claude/specs/task-pipeline/opus5-audit.md` — evidencia y veredicto que alimentan un plan
  posterior. **Nada de este plan depende de ella.**

## Definition of Done

- [ ] Tests escritos ANTES de la implementación (TDD) — **N/A**: stack `none`; la tarea no produce código
- [ ] Cada escenario Gherkin tiene al menos un test — **N/A**: se verifican contra el informe producido
- [ ] La mitad A cerrada y fechada **antes** de la primera consulta de tokens (verificable en el session log)
- [ ] Ninguna división por cero: los tres casos degenerados declarados como "no rankeable"
- [ ] El informe declara las dos limitaciones con las palabras exigidas en la Spec
- [ ] El veredicto se deriva de la regla escrita; cualquier desviación va argumentada
- [ ] Ningún fichero del plugin modificado por `prompt-audit`
- [ ] Spec cumplida; lo declarado en `Provides` disponible
- [ ] Lint / format / typecheck — **N/A** (Markdown)
- [ ] Gate de mutation testing — **N/A**: `stack.mutation-tool: none`
- [ ] Gate de `fact-checker` superado · **no-negociable, sin flag**
- [ ] Proyección de estado a GitHub al cerrar — sin `issue:` se marca **N/A con su motivo** · solo si `features.github-tracking`
- [ ] Documentación — tres capas:
  - [ ] Doc en el código — **N/A**
  - [ ] Doc técnica — el propio informe en `.claude/specs/task-pipeline/`
  - [ ] Histórico — session log en `.claude/context/task-pipeline/task-pipeline-opus5-realignment-06.md`
- [ ] Docs de dev / usuario final — **N/A**: artefacto interno
