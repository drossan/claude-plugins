---
id: task-pipeline-sdd-y-stack-poliglota
package: task-pipeline
status: active           # pending | active | completed | cancelled
branch: plan/task-pipeline/sdd-y-stack-poliglota
issue: 37                # issue PADRE proyectada (github-tracking) — drossan/claude-plugins#37
created: 2026-08-13
updated: 2026-08-14
---

# SDD nativo + stack por-paquete poliglota en `task-pipeline`

Plan **paraguas** que aborda **dos issues abiertas** del plugin en un solo plan, con un
cierre compartido (docs/portal/release).

- **#35** — `/task-init` y `/mutation`: soporte multi-lenguaje y stack **por-package** (monorepos poliglotas).
- **#36** — soporte **SDD nativo** (plantillas spec / caso-de-uso / ADR + flujo imperativo).

**Por qué un solo plan (no dos ramas A/B).** No por "misma maquinaria" (argumento débil), sino porque las
tareas **01 (stack) y 05 (flag) editan los MISMOS ficheros** (README, las dos copias de `task-lifecycle`,
`plan-task/SKILL.md`, los dos `task-pipeline.yml`): un split A/B en ramas separadas **conflictaría** en esas
5 superficies de config-docs. El paraguas es correcto por **superficie de edición compartida**.

Referencia de diseño: el plan consumidor `siguiente-captulo-v2/.claude/plans/pending/docs/fundacion-sdd.md`
(precedente concreto de la capa SDD que #36 propone subir al plugin) y sus estándares (MADR 4.0.0,
Spec Kit, EARS, Cockburn).

## Contexto y problema

El plugin `task-pipeline` (v0.14.0) asume hoy dos cosas que no escalan:

1. **Stack plano, mono-lenguaje.** `stack:` en `.claude/task-pipeline.yml` es un único
   `language`/`package-manager`/`test-runner`/`mutation-tool`; `/mutation` está **100 % cableado a
   Stryker+Vitest+pnpm** (19 acoplamientos en `skills/mutation/SKILL.md`), y `/task-init` bootstrapea
   asumiendo Vitest/Jest+pnpm. En un monorepo poliglota (p.ej. Python+TS) el usuario configura a mano
   el stack por lenguaje y "no hay gate de mutation posible" para packages no-JS/TS (#35).
2. **Sin capa de decisión/requisitos perdurable.** El Gherkin-por-tarea es la fuente de los tests, pero
   no hay artefacto de **decisión** (ADR), **spec de requisitos** (el "qué") ni **casos de uso** (el
   "cómo" del actor) aguas arriba. La "fuente de verdad" vive en `docs/` en prosa y no se actualiza
   *imperativamente* con cada tarea (#36). Grep confirma que **SDD/EARS/MADR/Cockburn/Spec-Kit tienen 0
   hits** en el repo; "ADR" solo aparece como ejemplo del flag `technical-docs`, sin carpeta ni
   plantilla que lo respalde.

**Resultado buscado:** el pipeline (a) se adapta al stack real de cada workspace en un monorepo
poliglota, eligiendo runner y herramienta de mutation por-package; y (b) ofrece una capa **SDD opt-in**
(plantillas + flujo imperativo) que hace de las specs/CU/ADR fuente de verdad viva, sin imponerla a
quien no la quiera.

## Objetivos

1. **Stack por-package poliglota (#35).**
   - *Criterio de éxito*: el schema documenta `stack.packages.<pkg>` (override; el `stack:` top-level
     queda como default/fallback) con su **regla de resolución enunciada en UN sitio canónico** (README)
     y las demás sedes apuntando a él; `/mutation` resuelve la herramienta por package con **Stryker
     verificado + `mutmut` (Python) + un escape genérico `mutation-command: "<cmd>"`** (cosmic-ray /
     cargo-mutants / gremlins quedan como **ejemplos en docs**, no comportamiento shipeado); `/task-init`
     detecta lenguaje por-workspace **best-effort con confirm humano** y **refleja** el stack en el
     `HOW-TO-START-A-TASK.md` del package.
2. **SDD nativo opt-in (#36).**
   - *Criterio de éxito*: existe el flag **`features.sdd`** (**booleano**, default **off**, fuera de todo
     preset, su ausencia **no es drift**), tres plantillas nuevas (`spec.md` SpecKit+EARS, `caso-de-uso.md`
     Cockburn+Gherkin, `adr.md`+índice MADR 4.0.0) con ubicación canónica `.claude/specs/<pkg>/spec.md`,
     `.claude/specs/<pkg>/casos-de-uso/<id>.md`, `.claude/specs/adr/NNNN-*.md`; con `features.sdd` ON, el
     **Gherkin vive solo en el CU** y el `## Scenarios` de la tarea **enlaza** (no copia) los escenarios del
     CU, `scenario-coverage` **retro-alimenta el CU**, y con `features.sdd` OFF (default) **nada cambia**
     (Gherkin en la tarea, como hoy); la DoD exige, **solo con el flag on**, actualizar/crear spec (EARS) +
     CU (Gherkin) en la misma tarea (o declarar "sin cambios").
3. **Coherencia end-to-end + release.**
   - *Criterio de éxito*: `/doctor` reconoce el flag/schema nuevos (ausencia ≠ drift, como
     caveman/github-tracking) y detecta las plantillas SDD ausentes **si el flag está on** (la lista de
     plantillas SDD vive en **un** sitio que la tarea de plantillas y la de doctor referencian); portal web
     + CHANGELOG + strings de manifiestos + bump SemVer coherentes; se preserva la **frase canónica de las
     6 sedes** (intacta — no la tocamos) y la consistencia entre las copias espejo de tablas de flags y
     prosa de stack.

## Alcance y fuera de alcance

### Dentro del alcance
- **A1** Schema `stack.packages.<pkg>` (override map) + **regla de resolución en UN sitio canónico**
  (README → "Configuración por repo"); el YAML seed lleva solo un ejemplo comentado, y las demás sedes
  (repo config, 2×lifecycle, contrato en `plan-task/SKILL.md`) **apuntan** a la canónica en vez de
  re-enunciarla.
- **A2** `/mutation` agnóstico por herramienta y por-package: selector por `stack.mutation-tool` del
  package; **Stryker verificado** (gotchas pnpm como hoy) + **`mutmut`** (Python, el caso real) + escape
  genérico **`mutation-command: "<cmd>"`** para cualquier otro lenguaje; el resto de herramientas como
  ejemplos en docs. **Nota explícita**: `features.mutation-gate` **no** es per-package (solo `stack.*` lo
  es) → "Python sin gate" se hace con `mutation-tool: none` en ese package.
- **A3** `/task-init` detección de lenguaje por-workspace **best-effort + `AskUserQuestion` de confirm** +
  materializa `stack.packages` + el HOW-TO del package **refleja** ese stack.
- **B1** Set de plantillas SDD (`spec.md`/`caso-de-uso.md`/`adr.md` + `adr-index.md`) con convenciones de
  ubicación, numeración ADR (`NNNN-titulo.md` desde `0001`), status fiel a la fuente y
  `[NECESITA ACLARACIÓN: …]`; **sin ADR-0000 relleno** (contenido del consumidor). La **lista canónica de
  nombres/ubicaciones** de plantillas SDD se fija aquí para que la tarea 07 (doctor) la referencie.
  Actualizar el mapeo en `templates/README.md`.
- **B2** Flag `features.sdd` **booleano** (opt-in, default off) en todas las sedes del schema (YAML seed,
  tabla de flags de README + dos lifecycle, contrato de `plan-task/SKILL.md`).
- **B3** Flujo SDD imperativo cableado en el ciclo de vida (paso "Cerrar una tarea") + **línea de DoD**
  gated por `features.sdd` en `task.md` y las dos lifecycle + nota de orquestación en `plan-task`. Fija la
  interacción Gherkin↔CU: **CU = única fuente**, la tarea **enlaza**, `scenario-coverage` retro-alimenta el
  CU; SDD off = comportamiento actual intacto.
- **C1 (tarea 07)** `/doctor`: reconoce `features.sdd` y `stack.packages` (ausencia ≠ drift); detecta
  plantillas SDD ausentes **con flag on** (referenciando la lista canónica de B1).
- **C2 (tarea 08)** **Release only**: registrar sidebar en `config.mts` (nav final), e2e de coherencia
  (espejos/`test -d`), **bump SemVer** en `plugin.json`, strings de manifiestos, consolidar CHANGELOG bajo
  un único header de versión + retro. (La doc de cada feature se escribe **en su propia tarea**.)

### Fuera de alcance
- **Seed ejecutable de sitio VitePress + puente prebuild (ex-B4): DIFERIDO a un plan follow-up**
  (design-review F1). Es #36-**opcional**, **duplica el `website/` propio** del plugin, y es **no
  verificable en este repo** (`stack: none`, no puedo correr `pnpm docs:build`). `features.sdd` se ship
  como **booleano**; añadir un sub-toggle `.site` cuando exista el sitio es **aditivo y no-rompedor**.
  **Rastro del diferimiento (T5, scenario-coverage)**: queda como **plan-stub**
  `.claude/plans/pending/task-pipeline/sdd-site-vitepress.md` para que el follow-up no se pierda.
- **`cosmic-ray` / `cargo-mutants` / `gremlins` como comportamiento shipeado de `/mutation`**: solo
  **ejemplos en docs**; el escape `mutation-command` cubre cualquier lenguaje sin que el plugin finja
  conocer su CLI.
- **Ejecutar/verificar builds o comandos de terceros en ESTE repo** (`stack: none`, sin runner): ni
  Stryker, ni los comandos de `mutmut`/`mutation-command`. Se materializan como seeds y se verifican por
  **inspección**; lo no-Stryker va **marcado como referencia no verificada**.
- **Migrar** los `task-lifecycle.md` ya materializados de repos consumidores al contenido nuevo
  (re-materialización completa del lifecycle vía `/doctor` es una limitación **preexistente**; no se
  amplía aquí).
- **Autogenerar** specs/CU/ADRs de ningún package: el plugin envía **plantillas + flujo**; el contenido
  lo redacta cada tarea en el repo consumidor.
- **Tocar `honesty-rules.md`**: SDD y stack no son reglas de honestidad → su ancla `template-version`
  **no** se toca por este plan.
- **Cambiar los criterios del salto en planes triviales** ni la **frase canónica** (se preservan intactos).
- **Cablear un hook nuevo**: `features.sdd` no añade hook; `bootstrap.sh` no restaura contenido SDD del
  consumidor (es contenido de usuario).

## Recursos externos

- Issues **drossan/claude-plugins#35** y **#36** (cuerpos completos = la spec de cada workstream).
- Plan de referencia: `siguiente-captulo-v2/.claude/plans/pending/docs/fundacion-sdd.md` (precedente del
  flujo SDD; su fundación VitePress/puente prebuild queda para el follow-up de B4).
- Estándares: [MADR 4.0.0](https://adr.github.io/madr/) · [GitHub Spec Kit](https://github.com/github/spec-kit) ·
  [EARS](https://visuresolutions.com/alm-guide/adopting-ears-notation/) · Cockburn, *Writing Effective Use Cases*.
- **Inventario de superficie** (Explore, sesión de planificación) — el conjunto mínimo de sedes al añadir
  un flag: (1) los dos YAML; (2) tabla de flags en `README.md` + lifecycle template + lifecycle docs; (3)
  contrato en `plan-task/SKILL.md`; (4) drift en `doctor/SKILL.md`; (5) línea de DoD en `task.md`; (6)
  `website/features/<name>.md` + sidebar en `website/.vitepress/config.mts`; (7) `### Added` en CHANGELOG;
  (8) strings de `plugin.json` + `marketplace.json`. Hotspot de acoplamiento a Stryker: `mutation/SKILL.md`.
- Precedente de flag opt-in: `github-tracking` (0.12.0) y `caveman` (0.11.0) — mismo patrón "default off,
  fuera de preset, ausencia ≠ drift".

## Estimación global

- **Tareas totales**: 8 (workstream A: 3 · B: 3 · C: 2). Bajo el umbral de partición.
- **Esfuerzo estimado**: multi-sesión. La más densa: **A2** (`/mutation` agnóstico). B4 (sitio) **cortada**
  a follow-up tras el design-review → se de-riesga el release entero.
- **Recursos**: 1 dev + aprobación del owner en los checkpoints. Stack `none` ⇒ TDD/mutation **N/A**;
  verificación por inspección/`grep`/correr la skill en un repo de prueba.

## Criterios de calidad y verificación

- **Stack `none`** (repo source: Markdown + Bash): **TDD y gate de mutation N/A** en la DoD de cada
  tarea; se omiten al materializar. Verificación = inspección / `grep` / `test -d` / **correr la skill en
  un repo de prueba** (adoptado / sano / no adoptado).
- **`fact-checker`** en cada cierre (no-negociable): incluye afirmaciones como "el flag `features.sdd`
  está en las N sedes", "solo Stryker se afirma verificado", "la regla de resolución se enuncia en 1 sitio
  canónico".
- **Barrido `grep` reforzado** al cerrar: sin identificadores muertos vivos (allowlist habitual del repo);
  y **consistencia de espejos**: las tablas de flags (README + 2 lifecycle) y la prosa de stack coinciden;
  la frase canónica de las 6 sedes queda **byte a byte** intacta.
- **Regla SDD propia** (tareas que tocan la capa SDD/stack): la superficie de doc de una feature (página de
  portal + fila de tabla + entrada de CHANGELOG) se escribe **en la misma tarea** que la introduce
  (evita el drift docs↔skill que el inventario ya mapeó).

## Tasks

> Los `.md` de tarea con su Gherkin se crean en el Paso 5; `scenario-coverage` puede añadir escenarios.
> `<nn>` correlativo del plan desde `01` (plan-scoped, todos los estados).

**Workstream A — #35: stack por-package poliglota**
- [x] `task-pipeline-sdd-y-stack-poliglota-01` (P1) — Schema `stack.packages.<pkg>` + regla de resolución en 1 sitio canónico (README) + demás sedes apuntando (YAML seed comentado, repo, 2×lifecycle, contrato `plan-task/SKILL.md`)  · depends_on: —
- [x] `task-pipeline-sdd-y-stack-poliglota-02` (P1) — `/mutation` agnóstico: selector por `stack.mutation-tool` del package + Stryker verificado + `mutmut` + escape `mutation-command` (cosmic-ray/cargo-mutants/gremlins solo ejemplos en docs) + DoD tool-agnóstica + nota "mutation-gate no es per-package"  · depends_on: task-pipeline-sdd-y-stack-poliglota-01
- [x] `task-pipeline-sdd-y-stack-poliglota-03` (P2) — `/task-init` detección de lenguaje por-workspace best-effort + `AskUserQuestion` de confirm + materializa `stack.packages` + el HOW-TO refleja el stack  · depends_on: task-pipeline-sdd-y-stack-poliglota-01, task-pipeline-sdd-y-stack-poliglota-02

**Workstream B — #36: SDD nativo opt-in**
- [x] `task-pipeline-sdd-y-stack-poliglota-04` (P1) — Set de plantillas SDD: `spec.md`(SpecKit+EARS) · `caso-de-uso.md`(Cockburn+Gherkin) · `adr.md`+`adr-index.md`(MADR 4.0.0, `NNNN` desde `0001`, sin ADR-0000 relleno) + lista canónica de nombres/ubicaciones (para doctor) + mapeo en `templates/README.md`  · depends_on: —
- [ ] `task-pipeline-sdd-y-stack-poliglota-05` (P1) — Flag `features.sdd` **booleano** (opt-in, default off, fuera de preset, ausencia ≠ drift) en todas las sedes del schema  · depends_on: task-pipeline-sdd-y-stack-poliglota-04
- [ ] `task-pipeline-sdd-y-stack-poliglota-06` (P2) — Flujo SDD imperativo + línea de DoD gated por `features.sdd` + interacción Gherkin↔CU (CU única fuente, la tarea enlaza, scenario-coverage retro-alimenta el CU; SDD off = intacto)  · depends_on: task-pipeline-sdd-y-stack-poliglota-04, task-pipeline-sdd-y-stack-poliglota-05

**Workstream C — cierre compartido**
- [ ] `task-pipeline-sdd-y-stack-poliglota-07` (P2) — `/doctor`: reconoce `features.sdd` + `stack.packages` (ausencia ≠ drift); detecta plantillas SDD ausentes con flag on (referencia la lista canónica de la tarea 04)  · depends_on: task-pipeline-sdd-y-stack-poliglota-01, task-pipeline-sdd-y-stack-poliglota-04, task-pipeline-sdd-y-stack-poliglota-05
- [ ] `task-pipeline-sdd-y-stack-poliglota-08` (P3) — **Release only**: sidebar en `config.mts` (nav final) + e2e de coherencia (espejos/`test -d`) + bump SemVer en `plugin.json` + strings de manifiestos + consolidar CHANGELOG + retro  · depends_on: 01,02,03,04,05,06,07

## Registro de cambios del plan

- 2026-08-13: creado (plan paraguas: workstream A #35 · B #36 · C cierre).
- 2026-08-13: 4 decisiones de scope del owner (AskUserQuestion previa a la redacción):
  (1) #36 se cablea con **flag propio `features.sdd`** (opt-in, default off), no plegado en
  `technical-docs`; (2) #35 stack por-package = **`stack.packages` en el YAML como fuente + el HOW-TO
  refleja**; (3) #36 item 4 = scaffold VitePress opcional (luego CORTADO en design-review, ver abajo);
  (4) #35 `/mutation` = selector agnóstico (luego right-sized en design-review, ver abajo).
- 2026-08-13: refinado con `grilling` (6 decisiones): `features.sdd` bloque (luego booleano tras
  design-review); `stack.packages` resuelve por-clave con fallback + herencia parcial; `/mutation` tabla-
  adapter con banner "no verificada"; doc repartida por tarea + tarea de cierre = solo release; plantillas
  SDD sin ADR-0000 relleno; `/task-init` materializa el sitio (luego cortado).
- 2026-08-13: `design-review` (subagente opus, fresco). Owner decide sobre 3 hallazgos materiales +
  aplica los menores:
  - **F1 (aceptado): CORTAR B4** (seed VitePress + puente prebuild) a un **plan follow-up**. Era
    #36-opcional, duplica el `website/` propio y es no-verificable en `stack: none`. Efecto: 9→8 tareas;
    el sitio sale del alcance; el "salto anterior" (grilling: `/task-init` materializa el sitio) queda
    **invalidado**.
  - **F5 (consecuencia de F1): `features.sdd` vuelve a BOOLEANO** (no bloque `{enabled, site}`): no se
    compromete la forma de config para un sub-feature (`site`) que ya no se construye; añadir `.site`
    luego es aditivo.
  - **F2 (aceptado, right-sizing): `/mutation`** ship **Stryker verificado + `mutmut` + escape
    `mutation-command`**; cosmic-ray/cargo-mutants/gremlins pasan a **ejemplos en docs** (Rust/Go no los
    pidió nadie; salían de la lista "ejemplos a validar" de #35).
  - **F3 (aceptado, coherencia): Gherkin↔CU con SDD on** — **CU = única fuente**, la tarea **enlaza** (no
    copia), `scenario-coverage` retro-alimenta el CU; SDD off (default) = comportamiento actual intacto.
    Cierra la contradicción "Gherkin = fuente de tests" ↔ "Gherkin solo en el CU".
  - **Menores aplicados**: F4 regla de resolución de stack en 1 sitio canónico (README) + apuntadores;
    F6 justificación del paraguas = superficie de edición compartida (01 y 05 editan los mismos ficheros),
    sin oferta de split A/B; F7a nota "mutation-gate no es per-package" en tarea 02; F7b `/task-init`
    detección best-effort + confirm humano; F7c lista de plantillas SDD en un solo sitio (04↔07).
- 2026-08-14: `scenario-coverage` (subagente sonnet, fresco). **(B) fuera de alcance declarado: ninguno.**
  Owner acepta **incorporar todos** los huecos (A) — estructurales + hardening fino — a los escenarios/Spec
  de las 8 tareas. Estructurales tapados: 06 lado de **entrada** de `scenario-coverage`/`mutation` (seguir
  el enlace al CU con SDD on) + **bootstrap** del primer spec/CU + **enlace roto** + **convivencia** de
  tareas inline vs CU (toggle a mitad); 03 **actualización incremental** de YAML/HOW-TO ya materializados;
  07 **presencia parcial** + **alcance per-package** + **clave `stack.packages` huérfana (T4)** + fail-safe
  no-booleano + idempotencia; 04 **5 estados MADR** + disciplina Gherkin del CU; **T1** entrada de CHANGELOG
  añadida a la DoD de 01/03/04/07. **T5**: el B4 diferido queda rastreado con un **plan-stub**
  (`sdd-site-vitepress.md`) — nota en Fuera de alcance.
- 2026-08-14: proyección a GitHub (github-tracking, **modo plano C3**: gh 2.69.0 sin `--parent`). PADRE
  **#37** (labels `plan`+`pkg:task-pipeline`, Project 2 → Backlog); sub-issues **#38–#45** (tareas 01→#38 …
  08→#45; label `pkg:task-pipeline`, assignee `@me`, "Parent #37" como texto, Project Backlog). Sin
  jerarquía nativa (residual conocido → reconciliar con `/doctor` o gh con `--parent`). El plan-stub
  `sdd-site-vitepress` **no** se proyectó (decisión del owner).
- 2026-08-14: **arranque del plan** (plan→`active`, rama `plan/task-pipeline/sdd-y-stack-poliglota` desde
  `main`; #37 y #38 → In progress). **Tarea 01 cerrada** (`done`): schema `stack.packages.<pkg>` con la
  regla de resolución canónica en README + punteros; `fact-checker` 9/9 VERIFICADO. Nota "mutation-gate no
  es per-package" reservada a la tarea 02 (F7a), no adelantada aquí.
