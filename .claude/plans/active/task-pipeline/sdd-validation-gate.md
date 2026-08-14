---
id: task-pipeline-sdd-validation-gate
package: task-pipeline
status: active           # pending | active | completed | cancelled
branch: plan/task-pipeline/sdd-validation-gate
issue: 51                # issue PADRE (github-tracking) — drossan/claude-plugins#51
created: 2026-08-14
updated: 2026-08-14
---

# `sdd-validation-gate`: gate de validación de formato + completitud de artefactos SDD

## Contexto y problema

La capa SDD (plan `sdd-y-stack-poliglota`, v0.15.0) shipeó **plantillas + flujo + prompt de activación +
`/doctor` de presencia**, pero **no valida el CONTENIDO** de los artefactos SDD al escribirlos/cerrarlos.
Hueco (señalado por el owner como "gran fallo de diseño"): nadie comprueba que una spec sea **EARS** válido,
que un ADR tenga un **estado MADR** coherente, que el **Gherkin** del CU cumpla la disciplina, que no queden
**`[NECESITA ACLARACIÓN]` sin resolver**, ni la **trazabilidad** FR↔CU↔escenario / CUs huérfanos.

**Investigación verificada (ago-2026, no de memoria):**
- **EARS** vigente (5 patrones: ubicuo / `While` / `When` / `If…then` / `Where`; Mavin, RE'09; sin versionado).
- **MADR** última **4.0.0** (2024-09-17, sin posterior); "MADR" **revirtió** a *Architectural* (no *Any*).
- **GitHub Spec Kit** = patrón exacto del gate: `checklist` (calidad de spec) + **`analyze`** (gate read-only
  que busca incoherencias/ambigüedades/huecos antes de implementar).
- **GAINUP** (plugin hermano, `griddo-gainup-main`): validador SDD real (Node ESM, 0 deps, 169 self-tests).
  **Diverge en notación** → rescatamos el **MECANISMO** (dos capas, errores/avisos, vocabulario cerrado,
  cero-verde-falso, huérfanos/link-rot, validar plantillas, incompletitud=gate), **no el formato**.

**Decisiones del owner (AskUserQuestion):**
- **Mecanismo = HÍBRIDO Bash + skill** (Bash mecánico grepeable + skill model-driven para lo semántico).
- **Enganche = gate al cerrar tarea (gated `features.sdd`) + skill invocable `/sdd-lint`**; bloquea el cierre
  ante violación de formato/completitud.

## Objetivos

1. **Gate model-driven = skill `sdd-lint` (fuente ÚNICA de reglas, autoritativa).** Valida por inspección
   (como `fact-checker`/Spec-Kit `analyze`), **emitiendo comandos `grep`/`test` FIJOS** para lo mecánico +
   **juicio** para lo semántico:
   - *Mecánico (comandos deterministas)*: secciones obligatorias por artefacto, **vocabulario cerrado** (estado
     MADR ∈ 5 → desconocido = **ERROR**), **`[NECESITA ACLARACIÓN]` sin resolver = bloqueo**, ids
     `FR-00x`/`SC-00x`, **enlaces rotos** (CU/ADR inexistente), **huérfanos/duplicados**.
   - *Semántico (juicio)*: **EARS bien-formado**, **coherencia de estados MADR**, **disciplina Gherkin del
     CU**, **trazabilidad FR↔CU↔escenario**.
   - **Severidad ERROR bloquea / AVISO no** (como `fact-checker`); ante **duda de parseo, demota a AVISO** (no
     bloquea por regex frágil). Invocable `/sdd-lint [pkg]`.
   *Éxito*: la skill existe, invocable, cubre lo mecánico (comandos fijos) + las 4 dimensiones semánticas con
   descarte explícito; sobre artefactos con defectos inyectados reporta cada uno con su severidad.
2. **Bash helper OPCIONAL, NO bloqueante, shipeable (`sdd-lint.sh`).** Cubre el **subconjunto determinista**
   (los checks mecánicos) para que un repo consumidor **con runner/CI** lo cablee y tenga validación
   **desatendida**. **La skill es la autoritativa**; el Bash es best-effort (puede ir por detrás) y **no**
   forma parte del gate de cierre. + **fixtures** known-good/known-bad **con expectativa aseverada** (qué
   violación reporta cada known-bad; known-good sale con exit 0).
   *Éxito*: `sdd-lint.sh` existe con `bash -n` OK; sobre known-bad reporta las violaciones esperadas y sobre
   known-good sale exit 0; doc de "cómo cablearlo a tu CI".
3. **Gate en el cierre + config.** DoD **gated `features.sdd`** ("gate `sdd-lint` superado") en `task.md` +
   2×lifecycle; wiring en "Cerrar una tarea" (INCORRECTO de formato/completitud **bloquea**, como
   `fact-checker`); nota en `plan-task`.
   *Éxito*: con `features.sdd` on la DoD incluye la línea; con off, no aparece (byte-idéntico a hoy).
4. **Rescate GAINUP + coherencia.** `/doctor` valida también las **PLANTILLAS** SDD (P7); fix "MADR *Any*" →
   "*Architectural*" en `adr.md`/`adr-index.md`; `/doctor` reconoce el gate (ausencia ≠ drift con SDD off).
   *Éxito*: las plantillas pasan `sdd-lint` limpias; grep sin "*Any*".
5. **Release coherente.** README + portal + CHANGELOG + bump SemVer (**0.16.0**, o folded si 0.15.0 sigue sin
   mergear) + manifiestos + retro.

## Alcance y fuera de alcance

### Dentro
Skill `sdd-lint` = gate model-driven autoritativo (mecánico vía comandos fijos + semántico + invocable); gate
en el cierre gated `features.sdd` (antes de `fact-checker`); **Bash helper opcional** (`sdd-lint.sh`) + fixtures
aseverados para CI de consumidores; `checkTemplate` en `/doctor` + fix "Architectural"; doc/portal/release.

### Fuera de alcance
- **El Bash como GATE bloqueante**: el gate es la **skill**; el Bash es helper opcional NO bloqueante (design-review).
- **Cambiar `stack: none`**: NO se shippa runner/CLI Node (à la GAINUP). El rigor "self-tests" se aproxima con
  **fixtures aseverados** verificados por inspección/correr el Bash, no un harness real.
- **`--strict` (promover AVISO→ERROR)**: **diferido** (YAGNI día-uno; `fact-checker` no lo tiene) → futuro.
- **Check `adr-index` stale**: **diferido** hasta que exista ≥1 ADR real (hoy el índice está vacío).
- **Rehacer la notación** (seguimos EARS/MADR/Gherkin; GAINUP = mecanismo, no formato).
- **Parsing complejo** (lexer/YAML completo): lo mecánico se limita a `grep`/`test` robustos; lo que requiere
  parseo/juicio va al juicio de la skill (frontera explícita, como GAINUP trace↔doctor).
- **Autogenerar** contenido; validar repos con `features.sdd` off.

## Recursos externos

- EARS: https://alistairmavin.com/ears/ · https://visuresolutions.com/alm-guide/adopting-ears-notation/
- MADR 4.0.0: https://adr.github.io/madr/ · https://github.com/adr/madr/releases
- Spec Kit (`analyze`/`checklist`): https://github.com/github/spec-kit
- GAINUP (mecanismo): `griddo-gainup-main` (`scripts/gainup-trace.mjs`, `gainup-doctor.mjs`, `gainup.test.mjs`).
- Precedentes internos: `fact-checker`, `mutation`, `/doctor` cat. 9, `scenario-coverage`.

## Estimación global

- ~5 tareas (se afina en Paso 5). Multi-sesión. Stack `none` ⇒ TDD/mutation N/A; verificación por inspección /
  grep / correr el Bash sobre fixtures / correr la skill.

## Criterios de calidad y verificación

- Escenarios Gherkin por tarea = criterios de aceptación.
- **Correr el Bash** sobre fixtures known-good/known-bad = verificación e2e del mecanismo mecánico.
- **Correr la skill** `/sdd-lint` sobre repo de prueba con defectos inyectados.
- `fact-checker` en cada cierre (afirmaciones: "el gate bloquea", "off = idéntico a hoy", "MADR Architectural
  4.0.0", "plantillas pasan el lint").
- Barrido `grep` reforzado (sin identificadores muertos; frase canónica intacta; espejos consistentes).

## Tasks

> Reordenadas tras design-review (Opción 3: skill = gate; Bash = helper opcional). Gherkin se rellena en el
> Paso 5; `scenario-coverage` puede añadir escenarios.
- [x] `task-pipeline-sdd-validation-gate-01` (P1) — **Skill `sdd-lint`**: gate model-driven autoritativo — mecánico vía comandos `grep`/`test` FIJOS (vocabulario MADR cerrado, `[NECESITA ACLARACIÓN]`, secciones, ids, enlaces rotos, huérfanos/dup) + semántico por juicio (EARS/MADR/Gherkin/trazabilidad); severidad ERROR bloquea/AVISO no (demota a AVISO ante duda de parseo); invocable `/sdd-lint`  · depends_on: —
- [x] `task-pipeline-sdd-validation-gate-02` (P2) — **Bash helper opcional** `sdd-lint.sh` (subconjunto determinista, NO bloqueante, best-effort) + **fixtures aseverados** known-good/known-bad + doc "cómo cablearlo a tu CI"  · depends_on: 01
- [x] `task-pipeline-sdd-validation-gate-03` (P1) — Gate en el cierre: línea de DoD gated `features.sdd` en `task.md` + 2×lifecycle + wiring "Cerrar una tarea" (`mutation → sdd-lint → fact-checker`) + nota `plan-task` + reconocimiento en `/doctor` (ausencia ≠ drift)  · depends_on: 01
- [ ] `task-pipeline-sdd-validation-gate-04` (P2) — `/doctor` valida que las **PLANTILLAS** SDD pasan el lint (`checkTemplate`) + fix **"MADR *Any*"→"*Architectural*"** en plantillas/doc shipeadas  · depends_on: 01
- [ ] `task-pipeline-sdd-validation-gate-05` (P3) — Release: README (sección `sdd-lint`) + portal + CHANGELOG + bump/manifiestos + retro + cierre del plan/PR  · depends_on: 01,02,03,04

## Registro de cambios del plan

- 2026-08-14: creado como plan-stub (follow-up de la extensión de `sdd-y-stack-poliglota`).
- 2026-08-14: **promovido a plan** vía `/plan-task` (plan mode + research). Investigación de specs vigentes
  (EARS/MADR 4.0.0/Spec Kit) + análisis del repo GAINUP del compañero (Explore agent). 2 decisiones del owner
  (AskUserQuestion): mecanismo **híbrido Bash + skill**; enganche **gate al cerrar + `/sdd-lint` invocable**.
  Aprobado el borrador (ExitPlanMode).
- 2026-08-14: **grilling** (checkpoint). Decisiones del owner:
  1. **Severidad de dos niveles**: **ERROR bloquea** (violación inequívoca: `[NECESITA ACLARACIÓN]` sin
     resolver, estado MADR inválido, enlace roto, sección ausente, id mal formado, `adr-index` stale) / **AVISO
     no bloquea** (juicio: EARS "casi", ACs no consecutivos, Gherkin poco declarativo) — mismo modelo que
     `fact-checker` (`INCORRECTO`/`NO VERIFICABLE`); `--strict` (o config) promueve avisos a errores.
  2. **Gate intrínseco a `features.sdd`** (sin flag propio): si SDD on, el gate corre al cerrar. Como
     `fact-checker`, no hay "off" — el eje de rigor lo da `--strict`; solo lo inequívoco bloquea.
  3. **Frontera Bash↔skill**: Bash = determinista (presencia/membresía/enlace/format/stale/huérfanos) **+
     pre-check barato de keyword/estructura EARS/Gherkin**; skill = juicio (EARS bien-formado, coherencia MADR,
     disciplina Gherkin, trazabilidad con sentido). La **skill orquesta** (Bash primero, luego semántica).
  4. **`sdd-lint` = gate propio, corre ANTES de `fact-checker`** (secuencia `mutation → sdd-lint →
     fact-checker`); `fact-checker` atestigua "el gate pasó". Distinto de la línea de DoD SDD (que dice *si
     tocaste* spec/CU; el gate dice *si están bien*).
  - **Detalle (default del agente, no confirmado explícitamente — "sigue")**: fixtures **dev-only** en el
    plugin (known-good = plantillas limpias; known-bad = una violación inyectada por fichero; verificación =
    correr el Bash); fix **"MADR Any→Architectural"** solo en plantillas/doc shipeadas.
  - Pendiente: design-review → descomposición → scenario-coverage.
- 2026-08-14: **design-review** (subagente fresco, opus). Hallazgo material: la capa Bash como **gate** no
  encaja con "skills = playbooks, no scripts" + `stack: none` (no hay hook de cierre → el modelo invoca el
  Bash igual; su determinismo neto es marginal; 3 fuentes de reglas; fixtures-sin-harness = teatro). La
  alternativa "todo model-driven" es más fuerte. **Decisión del owner (reconsideración con el trade-off):
  Opción 3 —**
  - **El GATE que bloquea = skill `sdd-lint` model-driven** (fuente ÚNICA y autoritativa de reglas): emite
    comandos `grep`/`test` FIJOS y documentados para lo mecánico + juzga lo semántico. Encaja con la
    arquitectura; mismo patrón que `fact-checker`/Spec-Kit `analyze`.
  - **El Bash = herramienta OPCIONAL, NO bloqueante, shipeable** (`sdd-lint.sh`), para que un repo consumidor
    **con runner/CI** la cablee y tenga validación **desatendida** (ahí es donde el Bash paga de verdad; el
    source `stack:none` no). Marcada "best-effort; la skill es la autoritativa". **No** está en el camino
    crítico del gate ni fuerza la 3ª fuente de reglas en él.
  - **Recs menores aceptadas**: **`--strict` fuera de día-uno** (YAGNI; `fact-checker` no lo tiene) → futuro;
    **check `adr-index` stale diferido** (índice vacío, 0 ADRs) → solo cuando exista ≥1 ADR real.
  - **Resiste (no se toca)**: vocabulario MADR cerrado, `[NECESITA ACLARACIÓN]` bloquea, off = byte-idéntico,
    `checkTemplate` en `/doctor`, secuencia `mutation → sdd-lint → fact-checker`.
- 2026-08-14: **scenario-coverage** (subagente QA fresco, sonnet) sobre las 5 tareas.
  - **(B) Fuera del alcance declarado: UNO** — drift `adr-index` stale (índice ↔ ADR real). Cae en el bullet
    ya diferido ("hasta ≥1 ADR real"). **Decisión: sigue diferido** (no incorporado).
  - **(A) Dentro del alcance — decisiones del owner:**
    - **Tensión crítica `[NECESITA ACLARACIÓN]`** (la plantilla `spec.md` lo tiene 4× como texto instructivo →
      chocaría con "las plantillas pasan el lint"): **Opción C — reescribir la plantilla** para que el token
      no aparezca como literal resolvible; un literal crudo en un artefacto materializado = pendiente real =
      ERROR. → tareas **01** (define el check así) y **04** (reescribe la plantilla + verifica que pasa).
    - **Hardening aceptado (se materializa en los escenarios de cada tarea)**: case-insensitive del vocabulario
      MADR (01/02); scope de duplicados de ids = **por-package** (01); convivencia inline↔CU — un `## Scenarios`
      inline pre-flag **no** es "enlace roto" (01/03); `/sdd-lint [pkg]` + multi-package agregado (01);
      invocación manual con flag off = **audita pero avisa** que SDD está off (01); enlace con `..`/absoluto,
      fichero ilegible, idempotencia de re-correr (01/02/03); plantilla **plugin-owned** con defecto →
      solo-reporte (04); frontera con `/doctor` cat. 9 "scaffolding SDD ausente" para "flag on, 0 artefactos"
      (03); portabilidad `grep` BSD↔GNU del helper (02); known-bad que faltaban (sección ausente, CU huérfano,
      id duplicado, `superseded by` roto) (02); bump como `Scenario Outline` + aclarar "frase canónica" (05).
  - **Pendiente**: materializar el hardening en el Gherkin de cada tarea → handoff.
