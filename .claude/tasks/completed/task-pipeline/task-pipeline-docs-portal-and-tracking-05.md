---
id: task-pipeline-docs-portal-and-tracking-05
package: task-pipeline
plan: docs-portal-and-tracking
status: done
priority: 2
depends_on: [task-pipeline-docs-portal-and-tracking-03]
estimate: 1.5h
actual: 0.5h
issue: 16                 # SUB-ISSUE (padre #11)
created: 2026-07-23
updated: 2026-07-23
---

# Workflow de GitHub Actions: build + deploy a Pages

## Description

Crear `.github/workflows/deploy-docs.yml` que construye VitePress y despliega a GitHub Pages. Depende solo
de `-03` (scaffold construible; no necesita contenido). **Límite honesto**: el *deploy real* es
**inverificable en sesión** (Pages está apagado y falta `admin`); la verificación aquí es la **validez del
YAML** + `pnpm docs:build` en local. La **primera ejecución real** será un tag de release en producción.

## Spec

- `on:` → `push` con `tags: ['v*']` **y** `workflow_dispatch` (deploy manual sin tag). Filtro `paths` no
  aplica a triggers por tag; para `workflow_dispatch` no hace falta.
- Job de build: checkout, setup pnpm (**versión pineada**) + Node (pineado), `pnpm install --frozen-lockfile`
  en `website/`, `pnpm docs:build`, subir artifact con `actions/upload-pages-artifact` (dir = dist de
  VitePress).
- Job de deploy: `actions/deploy-pages`, `environment: github-pages`, permisos `pages: write` +
  `id-token: write`, `concurrency` para no solapar despliegues.
- Documentar en el propio workflow (comentario) que **Pages debe encenderse a mano** (Settings→Pages→Source:
  GitHub Actions) — requiere `admin` (runbook en `-01`/`-06`).

## Scenarios (Gherkin)

```gherkin
Feature: Despliegue del portal a GitHub Pages vía Actions

  Scenario: el deploy se dispara con un tag de release
    Given el workflow de deploy
    When se empuja un tag que casa con v*
    Then el workflow se activa

  Scenario: existe un disparo manual
    Given el workflow de deploy
    When el owner quiere desplegar sin cortar un tag
    Then workflow_dispatch permite lanzarlo a mano

  Scenario: el job construye con el toolchain pineado y sube el artifact de Pages
    Given el job de build
    When corre
    Then instala con lockfile congelado, construye el sitio y sube el artifact de Pages

  Scenario: el deploy tiene los permisos y el entorno de Pages
    Given el job de deploy
    When se define
    Then declara environment github-pages y permisos pages:write + id-token:write

  Scenario: el YAML es válido pese a que el deploy real no se puede probar en sesión
    Given Pages apagado y sin admin en la sesión
    When se verifica el workflow
    Then su sintaxis es válida y el build local pasa
    And se documenta que el deploy real solo ocurrirá tras encender Pages + tag

  Scenario: los despliegues no se solapan
    Given el workflow de deploy
    When se define
    Then declara un bloque concurrency que evita despliegues simultáneos

  Scenario: el deploy solo corre si el build tuvo éxito
    Given los jobs build y deploy
    When se inspecciona el workflow
    Then deploy declara needs: build
    And no se ejecuta si build falla

  Scenario: el artifact sube el directorio dist real del scaffold
    Given el dist que produce el scaffold de -03
    When el job build sube el artifact de Pages
    Then el path del artifact coincide con la salida real de VitePress (website/.vitepress/dist)

  Scenario: la validez del schema de Actions se reconoce como inspección si no hay actionlint
    Given que actionlint puede no estar disponible en la sesión
    When se verifica el workflow
    Then si actionlint corre, su salida se reporta
    And si no, se declara que la validez del schema (más allá del YAML) es solo por inspección — NO VERIFICABLE en verde
```

## Provides

- `.github/workflows/deploy-docs.yml` válido → tras el merge del plan y un tag `v*` (y Pages encendido por
  el owner), el portal se publica. Es el mecanismo de go-live (hito de owner, no del cierre del plan).

## Definition of Done

- [ ] `.github/workflows/deploy-docs.yml` con triggers (`tags: ['v*']` + `workflow_dispatch`), build (pnpm/Node pineados, `--frozen-lockfile`) y deploy (`deploy-pages`, permisos, environment, concurrency).
- [ ] Sintaxis del workflow válida (inspección / `actionlint` si está disponible) + `pnpm docs:build` local verde.
- [ ] Comentario en el workflow sobre el encendido manual de Pages.
- [ ] Límite declarado: deploy real inverificable en sesión (reconocido como NO VERIFICABLE, no como «pasa»).
- [ ] Gate de `fact-checker` superado — no-negociable (el «deploy funciona» es NO VERIFICABLE y debe reconocerse).
- [ ] Proyección de estado a GitHub al cerrar — best-effort.
- [ ] Histórico de la tarea actualizado.
- [ ] N/A (`stack: none`): TDD, gate de mutation, TSDoc.
