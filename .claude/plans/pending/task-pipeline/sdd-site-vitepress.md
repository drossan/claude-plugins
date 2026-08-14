---
id: task-pipeline-sdd-site-vitepress
package: task-pipeline
status: pending          # pending | active | completed | cancelled
branch: plan/task-pipeline/sdd-site-vitepress
issue:                   # NO proyectado a GitHub todavía (stub de seguimiento; decisión del owner)
created: 2026-08-14
updated: 2026-08-14
---

# [STUB / follow-up] Seed opcional de sitio SDD (VitePress + puente prebuild)

> **Plan-stub de seguimiento**, no listo para ejecutar. Rastrea el trabajo **diferido** desde el plan
> `sdd-y-stack-poliglota` (design-review **F1**, scenario-coverage **T5**). Requiere pasar por el pipeline
> completo (`grilling` + `design-review` + descomposición + `scenario-coverage`) antes de arrancar.

## Contexto y problema

El plan `sdd-y-stack-poliglota` (SDD nativo #36) **cortó** el seed de sitio VitePress a este follow-up: en
el repo source (`stack: none`) **no se puede verificar** un `pnpm docs:build`, el seed **duplicaría** el
`website/` propio del plugin, y #36 lo marca como **opcional**. Se difiere para no arrastrar una pieza
grande, especulativa y no-verificable al release de las features SDD + stack.

## Objetivos (borrador — a refinar en su `grilling`)

1. **Seed materializable de sitio SDD**, gated por una clave opt-in del YAML (candidata: `features.sdd.site:
   vitepress|none`, default `none`) — al añadir el sub-toggle, `features.sdd` pasaría de booleano a bloque
   de forma **aditiva** (compat).
   - *Criterio de éxito (borrador)*: un consumidor con la clave on obtiene un sitio VitePress que publica
     `docs/` **y** `.claude/specs/**` vía un puente prebuild; off por defecto, nunca impuesto.
2. **Puente prebuild** `.claude/specs/**` → mount publicable (precedente: tareas 02/03/04 del plan
   consumidor `siguiente-captulo-v2/.claude/plans/pending/docs/fundacion-sdd.md`).
3. **Ownership de materialización**: `/task-init` (candidato), gated por la clave del YAML.

## Alcance y fuera de alcance

### Dentro del alcance (borrador)
- Seed de config VitePress + script de puente prebuild como plantillas del plugin.
- El sub-toggle `.site` en `features.sdd` (aditivo) + su doc (README/portal/CHANGELOG) + reconocimiento en
  `/doctor`.

### Fuera de alcance (borrador)
- **Verificar el build en este repo** (`stack: none`): la verificación real del sitio la corre un consumidor.
- Reescribir el `website/` propio del plugin.

## Recursos externos

- Plan origen: `.claude/plans/pending/task-pipeline/sdd-y-stack-poliglota.md` (design-review F1 + scenario-coverage T5).
- Precedente de fundación VitePress + puente: `siguiente-captulo-v2/.claude/plans/pending/docs/fundacion-sdd.md`.
- Dolor conocido del sitio propio: `.claude/specs/task-pipeline/github-tracking-runbook.md` (footgun `base`).

## Estimación global

- **Tareas totales**: por descomponer.
- **Esfuerzo estimado**: por estimar (era la pieza más densa del plan origen).

## Criterios de calidad y verificación

- `stack: none` ⇒ verificación por inspección + el precedente; el build real lo corre el consumidor.
- `fact-checker` en cada cierre (no-negociable).

## Tasks

> Por descomponer cuando este follow-up se active (pasar por `grilling` + `design-review` primero).

## Registro de cambios del plan

- 2026-08-14: creado como **stub de seguimiento** del B4 diferido desde `sdd-y-stack-poliglota`
  (design-review F1, scenario-coverage T5). No proyectado a GitHub todavía.
