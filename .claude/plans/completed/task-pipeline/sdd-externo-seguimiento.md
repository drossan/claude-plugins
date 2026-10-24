---
id: task-pipeline-sdd-externo-seguimiento
package: task-pipeline
status: completed
branch: plan/task-pipeline/sdd-externo-seguimiento
issue: 88
created: 2026-10-24
updated: 2026-10-24
---

# Seguimiento del SDD externo: riesgos documentados y huecos de redacción

## Contexto y problema

La PR #84 (0.18.3) dejó el SDD con proveedor externo. El primer code review dejó follow-ups que son solo
documentación o redacción de instrucciones: riesgos de seguridad sin documentar (M5), frases «off idéntico» que
ya no son ciertas (B3), una regla de DoD escondida en un comentario HTML (B4), un gate que no verifica la
invocación del provider (B6), un caso sin definir (B7) y un HOW-TO que ignora `phase=start` (B8).

## Objetivos

1. **Riesgos del provider documentados con honestidad** (M5).
   - Los 4 riesgos: (1) con `auto-commit`/`auto-pr` lo que escribe el provider en `phase=close` entra en commit/PR sin revisión; (2) el provider puede reescribir la tarea en `phase=start` y el pipeline la relee y sigue sus instrucciones (**hipótesis**); (3) el identificador único y el rechazo de skills propias los respeta el modelo, no un parser; (4) «sin confirmación en la primera invocación» sugiere que las siguientes sí la piden y no es así.
   - Consejo: en un repo ajeno el mismo `task-pipeline.yml` fija provider **y** automatización → revisar el fichero entero (`features.sdd` y `features.git-automation`) antes de trabajar en él.
   - *Criterio de éxito*: el README lista los 4 riesgos y el consejo; el portal solo un resumen de una línea que enlaza al README (sin copia); el de inyección va marcado como hipótesis; el heading `SDD: nativo o externo (opcional)` no se renombra.
2. **Ninguna frase afirma «off idéntico» sin salvedad** (B3).
   - *Criterio de éxito*: `grep -rn "idéntic"` en `task-pipeline/`, `website/`, `docs/` y el CU (sin entradas históricas del CHANGELOG) no deja «byte-idéntico»/«idéntico» sin salvedad: se usa «equivalente en comportamiento» con la salvedad del enlace a un CU y, en nativo, de la línea de DoD de `external` y la cat. 13 de `/doctor`; el caso externo→nativo queda cubierto o declarado como hueco conocido.
3. **DoD y cierre en `external` sin huecos** (B4, B6, B7, B8).
   - B7: `phase=close` se invoca **cuando el cierre llega a su hueco**; si falla un paso previo de la DoD (tests, lint, `mutation` si está activo) no se invoca; sin gate de mutation el hueco sigue a lint/tests.
   - B4 bidireccional: nativo→externo y **externo→nativo** (la línea del provider pasa a no aplicable; aplican las líneas nativas).
   - B6: el lifecycle exige una línea en el session log al invocar (`provider phase=close: <resultado>`) y `fact-checker` comprueba que existe (autodeclarada, y se dice).
   - *Criterio de éxito*: la regla de líneas de DoD de otro modo está en la DoD visible del lifecycle y su plantilla; el lifecycle fija B7 una vez; `fact-checker/SKILL.md`, lifecycle paso 4 y Paso 8 de `plan-task` recogen B6; los `HOW-TO-START-A-TASK.md` (repo y plantilla) mencionan `phase=start`.
4. **Release 0.18.4 coherente**.
   - El CHANGELOG 0.18.4 avisa de que los lifecycles materializados en 0.18.0–0.18.3 no se detectan (la cat. 13 solo mira el heading): re-sincronizar a mano 4b, 3c y la DoD. Hueco aceptado, sin detección nueva.
   - *Criterio de éxito*: `plugin.json` y CHANGELOG subidos; `claude plugin validate .` y `pnpm docs:build` en verde.

## Alcance y fuera de alcance

### Dentro del alcance
- README, portal, `sdd-lint/SKILL.md`, `fact-checker/SKILL.md`, lifecycle (repo + plantilla), `templates/task.md`, `plan-task/SKILL.md` (Paso 8), `HOW-TO-START-A-TASK.md` (repo + plantilla), CU, CHANGELOG, `plugin.json`.

### Fuera de alcance
- B11 (check de enlaces a GitHub en el build) y B12 (ruta de `installed_plugins.json`): follow-ups.
- Cambiar el modo nativo más allá de la regla bidireccional de «líneas de DoD de otro modo» (externo→nativo, decidida por el owner); validar el contenido del provider.
- Mitigaciones técnicas de M5: solo se documentan los riesgos.
- Detectar lifecycles materializados en 0.18.0–0.18.3 (hueco aceptado, ver objetivo 4).

## Recursos externos

- Primer code review del plan `sdd-proveedor-externo` (recuperado del transcript del subagente, 2026-10-24).
- `docs/guides/task-lifecycle.md` → «Modo SDD»; CU `.claude/specs/task-pipeline/casos-de-uso/sdd-proveedor-externo.md`.

## Estimación global

- 2 tareas, ~1–2 sesiones. Sin dependencias nuevas.

## Criterios de calidad y verificación

- Stack `none`: `grep`, `claude plugin validate .`, `cd website && pnpm docs:build` (enlaces al lifecycle desde el portal = URL de GitHub). TDD y mutation N/A; `fact-checker` aplica.

## Tasks

- [x] `task-pipeline-sdd-externo-seguimiento-01` (P1) — Riesgos del provider documentados y frases «idéntico» con salvedad (M5 + B3)  · depends_on: —
- [x] `task-pipeline-sdd-externo-seguimiento-02` (P2) — DoD, cierre y HOW-TO en modo external + release 0.18.4 (B4 + B6 + B7 + B8)  · depends_on: task-pipeline-sdd-externo-seguimiento-01

## Registro de cambios del plan

- 2026-10-24: creado (plan mode aprobado por el owner).
- 2026-10-24: refinado con `grilling` (2 decisiones del owner): (1) B7 → `phase=close` se invoca **siempre** en su hueco (donde estaría `mutation`), solo un `mutation` fallido lo impide; (2) M5 → documentar los 4 riesgos (inyección vía `phase=start` como hipótesis) **y** recomendar no usar `auto-commit`/`auto-pr` con providers no confiables, sin cambio de comportamiento. `design-review` no se ofrece omitir: B7 fija semántica del lifecycle (2 ejes de decisión).
- 2026-10-24: `design-review` (Opus, subagente fresco) → 7 hallazgos, **los 7 aceptados**: (1) B7 reformulado: se invoca al llegar al hueco, no si falla un paso previo; (2) M5: el consejo es revisar todo el `task-pipeline.yml` de un repo ajeno (provider y automatización los fija el mismo fichero); (3) los 4 riesgos se escriben en el plan; (4) B6 con línea en el session log (decisión del owner; entra `fact-checker/SKILL.md`); (5) B3 ampliado a todo «idéntic» incl. el nativo; (6) hueco aceptado de lifecycles 0.18.0–0.18.3, avisado en el CHANGELOG; (7) el portal no copia los riesgos, enlaza al README.
- 2026-10-24: `scenario-coverage` (Sonnet, subagente fresco) → 28 huecos dentro del alcance y 6 fuera. Incorporados al CU `sdd-proveedor-externo.md` (fuente única). Decisiones del owner: (1) externo→nativo se **cubre con comportamiento** (regla bidireccional de líneas de DoD; estrecha el «fuera de alcance» sobre el modo nativo); (2) falta de la línea de rastro de `phase=close` → `fact-checker` da **NO VERIFICABLE**, no INCORRECTO; (3) se añade un **FR EARS** a `spec.md` para el contrato de cierre; (4) resto de (A) incorporado salvo check de enlaces del portal (= B11) y truncado adversario del resultado del provider. Sección (B): los 6 siguen fuera (B11, B12, mitigaciones de M5, detección 0.18.0–0.18.3, validar el provider; el 6.º queda resuelto por la decisión (1)).
- 2026-10-24: tarea 02 cerrada y plan `completed`. Code review del plan (Opus): sin hallazgos graves; 10 hallazgos, aceptados 1–10 salvo las 3 simplificaciones opcionales (riesgo 4 duplicado, reapertura en 3c, fusión de escenarios de reintento), que quedan como follow-up. Release 0.18.4.

## Retro
- Estimación 2 tareas / ~1–2 sesiones; real ~2 sesiones (01 ≈1h, 02 ≈1h + fixes del review). Sorpresa: la regla de cierre estaba copiada a medias en README, portal y `plan-task` (la detectó el review, no el grep del plan); conviene que un cambio de semántica del lifecycle liste desde el principio todos los sitios que la repiten. Dependencia no vista: la tarea 01 quedó sin commitear y entró en el commit de la 02.
