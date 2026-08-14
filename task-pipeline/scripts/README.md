# `scripts/sdd-lint.sh` — helper Bash opcional de validación SDD

> **Best-effort, NO bloqueante.** La **autoridad** es la skill **`/sdd-lint`** del plugin (incluye los checks
> **semánticos** — EARS bien-formado, coherencia MADR, disciplina Gherkin, trazabilidad — que un Bash no puede
> juzgar). Este helper cubre solo el **subconjunto mecánico determinista** (grep/`test`) para que un repo
> consumidor **con runner/CI** lo cablee y tenga validación **desatendida** en cada commit. Puede ir por
> detrás de las reglas de la skill.

## Uso

```bash
scripts/sdd-lint.sh [RUTA]     # RUTA por defecto: .claude/specs
```

- **exit 0** = sin ERROR mecánico · **exit 2** = algún ERROR · **exit 1** = uso/entorno (ruta inexistente).
- Los **AVISOS** van a stderr y **no** cambian el exit code.
- **Cero verde-falso**: si no encuentra artefactos SDD bajo la ruta, lo **dice** (no sale 0 "silencioso").

## Qué comprueba (subconjunto mecánico)

- **Estado MADR** de cada `adr/NNNN-*.md` ∈ {proposed, accepted, rejected, deprecated, superseded}
  (**case-insensitive**) → ERROR si no.
- **`[NECESITA ACLARACIÓN]` sin resolver** en cualquier artefacto → ERROR (incompletitud).
- **Ids** `FR-000`/`SC-000` (3 dígitos) bien formados y **sin duplicados por-package** → ERROR si no.
- **Sección obligatoria** `## Requisitos funcionales (EARS)` en cada `spec.md` → ERROR si falta.
- **Enlace ADR roto**: `superseded by NNNN` sin fichero `NNNN-*.md` → ERROR.

Lo **semántico** (¿es EARS de verdad?, ¿el estado MADR es fiel a la fuente?, disciplina Gherkin) lo hace la
skill `/sdd-lint`, no este helper.

## Portabilidad

- **Bash 3.2+** (macOS incluido — **sin** `mapfile`).
- `grep -E` (BSD/macOS y GNU/Linux); **no** usa `-P`/`\d`.
- Sin dependencias (solo `grep`/`test`/`find`/`sort`/`uniq`/`dirname`/`ls`).

## Cómo cablearlo a tu CI (repo consumidor con runner)

**npm/`package.json`:**
```json
{ "scripts": { "sdd-lint": "bash node_modules/.../scripts/sdd-lint.sh .claude/specs" } }
```

**GitHub Actions:**
```yaml
- name: SDD lint (mecánico)
  run: bash path/al/plugin/scripts/sdd-lint.sh .claude/specs
```

Falla el job si `exit 2`. Recuerda: el gate **completo** (mecánico + semántico) lo da la skill `/sdd-lint` en
el cierre de tarea; este helper es la red mecánica desatendida.

## Fixtures y su expectativa aseverada (`fixtures/`, dev-only)

Verificación del helper = correrlo sobre los fixtures y comprobar **exactamente** esto (no "correr y mirar"):

| Fixture | Esperado |
|---|---|
| `known-good/` | **exit 0**, sin ERROR |
| `known-bad/estado-madr-invalido/` | ERROR "estado MADR no canónico" · exit 2 |
| `known-bad/necesita-aclaracion/` | ERROR "[NECESITA ACLARACIÓN] sin resolver" · exit 2 |
| `known-bad/id-mal-formado/` | ERROR "id mal formado" · exit 2 |
| `known-bad/enlace-adr-roto/` | ERROR "enlace ADR roto: 'superseded by 0099'" · exit 2 |
| `known-bad/seccion-ausente/` | ERROR "sección obligatoria ausente" · exit 2 |

Los fixtures son **dev-only** (no se materializan a repos consumidores).
