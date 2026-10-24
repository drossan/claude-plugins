---
id: task-pipeline-model-routing-per-phase-05
package: task-pipeline
plan: model-routing-per-phase
status: done
priority: 3
depends_on: [01, 02, 03, 04]
estimate: 5h
actual: 1h 15min
issue: 72
created: 2026-08-18
updated: 2026-08-18
---

# `/task-init` + `/doctor`: ofrecer `models:`, materializar el schema y detectar su drift

## Description

Cablear en `/task-init` y `/doctor` el soporte del contrato extendido, **sin** crear un wizard fase-a-fase ni
duplicar la lista de fases. Fuente: `spec.md` (FR-009, FR-010) + CU-configurador-doctor + ADR 0002.

## Spec

- **Estado de `models:` — tres casos distintos** (ambas skills): **presente-comentado** → **ofrecer** (una
  frase) descomentar con el perfil recomendado (tarea 02); **ausente del todo** → `/doctor` **recrea el
  bloque COMENTADO** (perfil de referencia, sin valores activos); **activo** (alguna sub-clave con valor,
  aunque sea "a medias") → **configurado**, no se ofrece nada. **Nada** se escribe sin aprobación (diff);
  **sin** cuestionario por fase (una sola oferta). La **ausencia** de `models:` **no** es drift duro.
- **`/doctor` reconoce el set** "3 + `sdd-lint` condicional" (actualizar `skills/doctor/SKILL.md:41-46,234,252`):
  una clave concreta ausente no es drift (default inherit); una **clave espuria** (fase inline `models.grilling`
  o inexistente `models.qa-fase`) se **señala como posible typo**, no se borra en silencio.
- **Materialización del schema** (ADR 0002): `/task-init` (bootstrap) copia el schema al repo consumidor
  (ruta canónica de la tarea 03) con modeline relativo; `/doctor` lo materializa **con diff + aprobación** si
  falta en un repo ya adoptado.
- **Drift del schema — ancla explícita**: como JSON no admite comentarios (el truco `template-version` de
  `honesty-rules.md` **no** es trasladable), el schema lleva una **clave-ancla de versión** (p.ej. top-level
  `"x-task-pipeline-schema-version"`, a fijar en coordinación con la tarea 03). `/doctor` compara esa clave:
  **más vieja** → drift, ofrece actualizar (diff + aprobación); **igual** → no-op; **difiere sin ser más
  vieja** (editado a mano) → **reporta y NO sobrescribe** (misma regla que la prosa personalizada). Documentar
  la categoría en el README de `/doctor`.

## Fuera de alcance

- **Wizard interactivo fase-a-fase** y duplicar la lógica del contrato en dos skills.
- Cambiar el perfil recomendado (tarea 02) o el schema en sí (tarea 03).

## Scenarios (Gherkin)

> `features.sdd` ON — Gherkin en el CU (fuente única). Criterios de aceptación:
> - [CU-configurador-doctor](../../specs/task-pipeline/casos-de-uso/configurador-doctor.md).
>
> Verificación de ESTA tarea (correr la skill sobre repos de prueba): `/doctor` sobre un repo sin `models:`
> **ofrece** descomentar y no escribe sin aprobación; sobre un repo con schema viejo, **marca drift**; sobre
> un repo sin schema, lo materializa.

## Provides

- `/task-init` y `/doctor` alineados con el contrato: oferta de `models:`, materialización del schema y
  detección de drift. Consumido por la doc (tareas 06/07).

## Definition of Done

- [ ] Escenarios del CU verificados **corriendo la skill** en repos de prueba (sin `models:` / schema viejo / sin schema) — TDD/mutation N/A
- [ ] Spec cumplida; `Provides` disponible
- [ ] **Gate `sdd-lint`** superado · `features.sdd`
- [ ] Gate de `fact-checker` superado (incl. "corrí `/doctor` y observé el resultado") · no-negociable
- [ ] **SDD** — spec + CU actualizados o "sin cambios de spec/CU" · `features.sdd`
- [ ] Documentación: doc técnica/contexto (README de `/doctor`) + histórico en `.claude/context/…` — TSDoc N/A
- [ ] Barrido `grep` reforzado
- [ ] Proyección de estado a GitHub al cerrar · `features.github-tracking`
- [ ] Auto-commit `task-pipeline-model-routing-per-phase-05: <conventional commit>` · `git-automation`
