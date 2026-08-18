# Configuración (`.claude/task-pipeline.yml`)

El pipeline se adapta al repo sin imponer estructura. Toda la config vive en `.claude/task-pipeline.yml`;
las skills la leen y la respetan.

**Resolución** (de menor a mayor prioridad): defaults internos (= preset `full`) → preset de `mode:` →
claves explícitas en `stack:` / `features:`. **Sin archivo → todo `full`** (comportamiento histórico, así
los repos existentes no cambian). `/task-init` lo materializa con el stack detectado; el hook `SessionStart`
lo restaura si se borra.

## Preset (`mode`)

Fija los defaults de las features de golpe:

| `mode` | TDD | docs | mutation-gate | Para |
|---|---|---|---|---|
| `full` (default) | ON | ON | `80` | repos con stack de tests sano |
| `legacy` | ON | ON | OFF | testeas lo que tocas, pero no llegas a 80 |
| `docs-only` | OFF | ON | OFF | solo orquestar planes + documentar |

## Stack (`stack`) — mono y multi-lenguaje

`stack:` (`language` · `package-manager` · `test-runner` · `mutation-tool`) hace que las skills elijan
comandos reales en vez de asumir pnpm/Vitest/Stryker.

En **monorepos poliglotas**, `stack.packages.<pkg>` pisa el stack **por-workspace** con **herencia parcial**
(solo las claves que declara; el resto hereda del `stack:` top-level):

```yaml
stack:
  language: typescript
  test-runner: vitest
  mutation-tool: stryker
  packages:
    api:                    # workspace Python dentro de un monorepo TS
      language: python
      test-runner: none
      mutation-tool: mutmut
```

`/mutation` resuelve la herramienta por package: **Stryker** (verificado) · **`mutmut`** (Python) · escape
genérico **`mutation-command: "<cmd>"`** para cualquier otro lenguaje. La regla de resolución canónica está
en el [README del plugin](https://github.com/drossan/claude-plugins/blob/main/task-pipeline/README.md).

## Features (`features`)

Una clave explícita pisa el preset. Resumen (detalle y garantías en las páginas enlazadas):

| Flag | Default | Qué controla |
|---|---|---|
| `tdd` | ON | Exigir TDD (1 test por escenario Gherkin) en la DoD. |
| `closing-documentation.*` | ON | Las 3 capas de doc de cierre (código / técnica / session log). |
| `mutation-gate` | `80` | Gate de mutation y su umbral `break`; `false` lo desactiva. |
| `conventional-commits` | ON | Formato `<task-id>: <conventional commit>`; **aplica incluso sin git-automation**. |
| [`sdd`](../features/sdd.md) | off | Capa **SDD** (spec EARS + CU Gherkin + ADR MADR) + gate `/sdd-lint`. |
| [`git-automation`](../features/git-automation.md) | off | `auto-commit` (cierre de tarea) · `auto-pr` (cierre de plan) · `co-author`. |
| [`github-tracking`](../features/github-tracking.md) | off | Proyección one-way `.md`→GitHub (issue padre + sub-issues). |
| [`caveman`](../features/caveman.md) | off | Comprime el output del hilo principal. |

Las capas opt-in (`sdd`, `git-automation`, `github-tracking`, `caveman`) están **fuera de todo preset** y su
**ausencia no es "drift"** para `/doctor` — un repo que no las declara se comporta como siempre.

## Modelos por fase (`models`)

Fija el modelo de las fases que lanzan **subagente**: **3 siempre ruteables** (`design-review`,
`scenario-coverage`, `fact-checker`) **+ `sdd-lint`** (condicional, solo con `features.sdd` on). Clave
ausente/`inherit` = modelo de la sesión; alias (`opus`/`sonnet`/`haiku`/`fable`) o id de modelo libre =
se pasa al subagente; valor inválido = aviso + inherit. Las fases **inline** (`grilling`, `mutation`,
`plan-task`, `doctor`, `task-init`) heredan la sesión y no se rutan por aquí.

**Perfil recomendado** (por coste — el pipeline lanza varias pasadas de subagente por plan, y en Opus
ese coste se dispara):

```yaml
models:
  design-review: opus        # 1×/plan, la revisión de más valor — donde el modelo fuerte más pesa
  scenario-coverage: sonnet
  fact-checker: sonnet
  sdd-lint: sonnet            # solo tiene efecto con features.sdd: true
```

`design-review` en Opus captura casi toda la calidad donde importa; el resto en Sonnet captura casi todo
el ahorro (son las pasadas repetidas/de cierre). Es el bloque **comentado** del template — no se te
impone — y el que este mismo repo dogfoodea activo.

**Recomendación de modelo de sesión** para las fases inline (no se rutan, es solo una guía):

| Fase inline | Modelo de sesión recomendado |
|---|---|
| `grilling` | Opus |
| `/plan-task`, `/mutation`, `/doctor`, `/task-init` | Sonnet |
| `/pipeline-usage` | Haiku (fijado en su propio frontmatter — read-only, un solo turno) |

**Plan complejo**: sube `design-review` a Opus a mano (o la sesión entera) — no hay heurística automática
de escalado, a propósito (ver el porqué en el README del plugin).

**Autocompletado con JSON schema**: `.claude/task-pipeline.yml` referencia un JSON schema
(`.claude/task-pipeline.schema.json`) vía el modeline `# yaml-language-server`, que tu editor (con la
extensión `redhat.vscode-yaml` u otra compatible) usa para sugerir claves y valores — incluidos los alias
de `models:` — sin rechazar un id de modelo libre. Es ayuda de editor, no valida en runtime. `/task-init`
lo materializa en el bootstrap; `/doctor` lo mantiene al día (materializa si falta, avisa de drift).

El **`effort`** se fija por sesión, no por fase — no hay ni habrá una clave `effort:` en el YAML (la Agent
tool no la acepta por invocación). Detalle completo en el [README del plugin](https://github.com/drossan/claude-plugins/blob/main/task-pipeline/README.md#routing-de-modelo-por-fase-models).

> **Los dos checkpoints humanos** (`grilling` y la aprobación del plan) **no son configurables** por ningún
> flag ni preset: son por diseño.
