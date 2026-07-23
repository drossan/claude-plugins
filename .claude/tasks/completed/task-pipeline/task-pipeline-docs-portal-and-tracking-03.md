---
id: task-pipeline-docs-portal-and-tracking-03
package: task-pipeline
plan: docs-portal-and-tracking
status: done
priority: 2
depends_on: []
estimate: 2h
actual: 1h
issue: 14                 # SUB-ISSUE (padre #11)
created: 2026-07-23
updated: 2026-07-23
---

# Scaffold VitePress (pnpm) en `website/` + config `base`/`srcDir`/`.gitignore`

## Description

Levantar el esqueleto de VitePress en un directorio dedicado `website/` con **pnpm**, aislado del resto del
repo, de modo que `pnpm docs:build` construya sin errores un sitio vacío-pero-navegable. **No** cambia el
`stack: none` del pipeline: `website/` es un sub-proyecto con su propio toolchain (no es el harness de tests
del pipeline). **Dependencia nueva** (VitePress) — aprobada por el owner en la fase de clarificación.

## Spec

- `website/package.json` (pnpm) con VitePress como devDependency y scripts `docs:dev` / `docs:build` /
  `docs:preview`. Fijar la versión de VitePress y **verificarla corriendo el build** (no de memoria).
- `website/.vitepress/config.*`: `title`, `lang: 'es-ES'`, `base: '/claude-plugins/'` (project-site),
  `srcDir` = `website/` (o la raíz de contenido bajo `website/`), estructura mínima de `themeConfig` (nav +
  sidebar esqueleto). **Español-only** (sin i18n).
- `website/index.md` mínimo (home) para que el build tenga al menos una página.
- `.gitignore`: ignorar `website/node_modules/`, `website/.vitepress/cache/`, `website/.vitepress/dist/`;
  **versionar** `website/pnpm-lock.yaml`.
- **No** tocar `.claude/task-pipeline.yml` (`stack` sigue `none`). El carve-out de la narrativa de stack que
  esto vuelve falsa (`CLAUDE.md`/HOW-TO) es responsabilidad de `-06`.

## Scenarios (Gherkin)

```gherkin
Feature: Andamiaje del sitio de documentación

  Scenario: el sitio construye sin errores en local
    Given el scaffold de VitePress en website/ con al menos una página
    When se construye el sitio con el script de build
    Then el build termina sin error
    And genera el directorio de salida (dist)

  Scenario: el base es el del project-site
    Given un project-site en github.io/claude-plugins
    When se configura VitePress
    Then base es "/claude-plugins/"

  Scenario: el sitio no escanea la doc canónica del repo
    Given docs/guides/ con el spec canónico fuera de website/
    When VitePress resuelve su srcDir
    Then srcDir está acotado a website/ y guides/ no se trata como páginas del sitio

  Scenario: los artefactos de build no se versionan
    Given el sitio construido en local
    When se inspecciona el control de versiones
    Then node_modules, cache y dist de website/ están ignorados
    But website/pnpm-lock.yaml sí se versiona

  Scenario: el stack del pipeline no cambia
    Given el pipeline con stack none
    When se añade el toolchain de la web
    Then .claude/task-pipeline.yml sigue declarando stack none

  Scenario: el sitio declara el idioma español
    Given la config de VitePress
    When se inspecciona
    Then lang es 'es-ES'

  Scenario: la versión de VitePress queda pineada
    Given package.json de website/
    When se inspecciona la devDependency de VitePress
    Then la versión está pineada (verificada corriendo el build), no floating
    And pnpm-lock.yaml refleja esa versión

  Scenario: el sitio no convierte en páginas ningún .md del repo fuera de website/
    Given README.md, CLAUDE.md, CHANGELOG.md en raíz y .claude/**/*.md
    When VitePress resuelve srcDir y construye
    Then ninguno de esos .md se emite como página del sitio
    And en particular .claude/plans/ y .claude/tasks/ no se publican

  Scenario: el build falla ante enlaces muertos (dead-link check activo)
    Given la config de VitePress
    When se inspecciona ignoreDeadLinks
    Then no está en true (el build aborta ante enlaces internos rotos)
```

## Provides

- `website/` construible (`pnpm install && pnpm docs:build`) con `base`/`srcDir`/theme base → sobre él
  `-04` escribe contenido y `-05` monta el deploy. Lockfile versionado para builds reproducibles en CI.

## Definition of Done

- [ ] `pnpm install && pnpm docs:build` verde en local (salida real vista en sesión, no «debería»).
- [ ] `base: '/claude-plugins/'`, `lang: es-ES`, `srcDir` acotado a `website/`.
- [ ] `.gitignore` cubre node_modules/cache/dist; `pnpm-lock.yaml` versionado.
- [ ] `.claude/task-pipeline.yml` `stack` sin cambios (`none`).
- [ ] Spec cumplida; `Provides` disponible.
- [ ] Gate de `fact-checker` superado (incl. «el build pasó») — no-negociable.
- [ ] Proyección de estado a GitHub al cerrar — best-effort.
- [ ] Doc técnica (README de `website/` con cómo correr/servir) + histórico de la tarea.
- [ ] N/A (`stack: none` para el pipeline): TDD, gate de mutation. Verificación de la web = **correr el build**.
