---
id: task-pipeline-model-routing-per-phase-01
package: task-pipeline
plan: model-routing-per-phase
status: done
priority: 1
depends_on: []
estimate: 3h
actual: 1 sesión
issue: 68
created: 2026-08-18
updated: 2026-08-18
---

# Contrato canónico de routing + corrección de la limitación del README

## Description

Reconciliar la definición del set de fases ruteables y corregir un hecho de plataforma desactualizado en el
README, para que todas las copias del contrato digan lo mismo. Hoy hay **drift de conteo** (2/3) y un
**lector silencioso** (`sdd-lint` lee `models.sdd-lint` sin estar documentado). Fuente del contrato:
`.claude/specs/task-pipeline/spec.md` (FR-001…FR-005, FR-011) y el CU enlazado.

## Spec

- **Formulación canónica** (una sola, replicada literal): **"3 fases siempre ruteables (`design-review`,
  `scenario-coverage`, `fact-checker`) + `sdd-lint`, que rutea solo con `features.sdd` on"**. NO "4 plano".
- **Corregir `task-pipeline/README.md:151-181`** ("Routing de modelo por fase"): la afirmación de que una
  skill inline "no puede cambiarse el modelo" está **desactualizada** — un `SKILL.md` **sí** admite `model:`
  en frontmatter (inline), pero es **por-turno + estático**; el routing **robusto y per-repo sigue siendo
  subagente-only**. Reescribir la "Limitación de plataforma" con esa verdad (mantener la subsección `effort`).
- **Reconciliar el conteo** en: `README.md:55` (raíz, dice 2), `skills/plan-task/SKILL.md:45` (dice 2),
  `CLAUDE.md:56-57`, `docs/guides/task-lifecycle.md:64-66`, `docs/flujo-del-pipeline.md:118-120`, y las
  **cabeceras** de ambos `task-pipeline.yml` (L4/L117: mencionar el set + `sdd-lint` condicional).
- **Documentar el lector de `sdd-lint`**: mencionarlo como fase ruteable condicional donde se enumera el set.
- **Verificar (re-confirmar) el mecanismo "frontmatter por-turno"** contra la doc actual (`skills.md`) antes
  de dar por buena la redacción del README (es load-bearing; lo señaló `design-review`).

## Fuera de alcance

- **Forzar** el modelo de fases inline; **escalado automático** a Opus; **voltear** la invariante del template.
- Cambiar valores de `models:` (eso es la tarea 02) ni tocar `/doctor` (tarea 05).

## Scenarios (Gherkin)

> `features.sdd` ON — el Gherkin vive en el CU (fuente única). Criterios de aceptación:
> - [CU-routing-contrato](../../specs/task-pipeline/casos-de-uso/routing-contrato.md) — semántica del contrato.
>
> Verificación adicional de ESTA tarea (doc, por inspección/`grep`): tras editar, `grep` de "2 fases"/"3
> fases"/conteos de routing no devuelve afirmaciones contradictorias; el README ya no afirma que una skill
> inline "no puede cambiarse el modelo".

## Provides

- La **formulación canónica** del set ruteable ("3 + `sdd-lint` condicional") y la **redacción corregida**
  de la limitación de plataforma. Las tareas 02 (perfil), 05 (`/doctor` reconoce el set) y 06 (website)
  dependen de este texto de referencia.

## Definition of Done

- [ ] Escenarios del CU verificados como criterios de aceptación (inspección / `grep`) — TDD/mutation N/A (stack `none`)
- [ ] Spec cumplida; lo declarado en `Provides` disponible para las tareas dependientes
- [ ] Mecanismo "frontmatter por-turno" **re-confirmado** contra `skills.md` (o marcado NO VERIFICABLE si no se puede)
- [ ] **Gate `sdd-lint`** superado — artefactos SDD sin ERROR (tras `mutation`, antes de `fact-checker`) · `features.sdd`
- [ ] Gate de `fact-checker` superado — afirmaciones verificadas (INCORRECTO bloquea) · no-negociable
- [ ] **SDD** — spec (EARS) + CU actualizados, o "sin cambios de spec/CU" · `features.sdd`
- [ ] Documentación: doc técnica/contexto (`technical-docs`) + histórico en `.claude/context/…` (`context-log`) — TSDoc N/A (Markdown)
- [ ] Barrido `grep` reforzado — sin conteos de fase contradictorios ni identificadores muertos
- [ ] Proyección de estado a GitHub al cerrar (best-effort) · `features.github-tracking`
- [ ] Auto-commit `task-pipeline-model-routing-per-phase-01: <conventional commit>` en la rama del plan · `git-automation`
