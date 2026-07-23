---
id: task-pipeline-docs-portal-and-tracking-04
package: task-pipeline
plan: docs-portal-and-tracking
status: done
priority: 2
depends_on: [task-pipeline-docs-portal-and-tracking-02, task-pipeline-docs-portal-and-tracking-03]
estimate: 3h
actual: 1.5h
issue: 15                 # SUB-ISSUE (padre #11)
created: 2026-07-23
updated: 2026-07-23
---

# Contenido curado + IA/nav + frontera anti-drift (enlaza al spec canónico)

## Description

Escribir el contenido **curado** del portal: páginas pensadas para lectura web (narrativa/onboarding), con
navegación y sidebar. Aplicar la **frontera anti-drift** decidida: la web posee la narrativa; el **spec
canónico sigue en los `.md` del repo** y la web **enlaza** en vez de re-enunciar. Depende de `-02` (enlaza
docs ya alineadas) y `-03` (scaffold construible).

## Spec

- Páginas mínimas (curadas, español): **home/landing**, **qué es y por qué**, **instalación/quickstart**,
  **tour de las 9 skills**, **guía del pipeline** (resumen del flujo), **github-tracking** (opcional),
  **caveman** (opcional). Reusar narrativa de `README`/`flujo-del-pipeline.md` **sin copiar bloques de spec**.
- **Frontera anti-drift (#5)**: para el detalle canónico (DoD, esquema de ids, tabla de resolución de
  config), dar un **resumen curado + enlace "fuente canónica"** a una **ruta estable**: `README.md`,
  `docs/guides/task-lifecycle.md`, CHANGELOG (blob de GitHub o ruta relativa estable).
- **Prohibido** enlazar a `.claude/plans/` o `.claude/tasks/` (ficheros que el repo **mueve/renombra por
  diseño** → enlaces que se pudren).
- Nav + sidebar que cubran las páginas; todos los enlaces internos deben resolver en el build.

## Scenarios (Gherkin)

```gherkin
Feature: Contenido curado del portal con frontera anti-drift

  Scenario: el portal ofrece las páginas de onboarding
    Given un lector que llega por primera vez
    When navega el portal
    Then encuentra landing, qué-es, instalación, tour de skills y guía del pipeline

  Scenario: el spec profundo se enlaza, no se copia
    Given una sección que necesita el spec canónico (p.ej. la DoD o el esquema de ids)
    When la web la presenta
    Then da un resumen curado y enlaza a la fuente canónica en el repo
    And no reproduce verbatim el bloque de spec

  Scenario: no hay enlaces a ficheros mutables del repo
    Given la disciplina de enlazar solo a rutas estables
    When se audita el contenido del sitio
    Then no existe ningún enlace a .claude/plans/ ni a .claude/tasks/

  Scenario: la navegación resuelve todos los enlaces internos
    Given el nav y el sidebar del portal
    When se construye el sitio
    Then el build no reporta enlaces internos rotos

  Scenario: los enlaces sitio→repo apuntan a rutas que existen
    Given los enlaces "fuente canónica" hacia el repo
    When se verifican contra el árbol real del repo
    Then cada destino existe (README, task-lifecycle, CHANGELOG)

  Scenario: el portal incluye las páginas de features opcionales
    Given un lector interesado en github-tracking y caveman
    When navega el portal
    Then encuentra la página de github-tracking y la de caveman
    And ambas señalan que son opt-in (default off)

  Scenario: los enlaces fuente-canónica no se anclan a líneas ni a refs mutables
    Given un enlace a la fuente canónica (README/task-lifecycle/CHANGELOG)
    When se audita el enlace
    Then apunta al fichero (o a un ancla de sección estable), no a un número de línea
    And no depende de una rama que el repo reescribe

  Scenario: los enlaces sitio→repo se verifican por grep contra el árbol, no por el build
    Given que VitePress no comprueba enlaces a rutas fuera de srcDir
    When se verifican los enlaces "fuente canónica"
    Then cada destino se comprueba con test -f / grep contra el árbol real del repo
    And se reconoce que el build no los cubre (solo cubre enlaces intra-sitio)

  Scenario: el contenido no hardcodea una versión que drifte
    Given las páginas de instalación/quickstart
    When se audita el contenido
    Then no fijan un número de versión que quede obsoleto (usan placeholder o enlazan al CHANGELOG)
```

## Provides

- Portal con contenido navegable y frontera anti-drift establecida → base para el wire-up final (`-06`,
  enlaces README↔web) y para el deploy (`-05`, que solo necesita el scaffold).

## Definition of Done

- [ ] Páginas curadas creadas (home, qué-es, instalación, skills, pipeline, github-tracking, caveman).
- [ ] `pnpm docs:build` verde; **sin enlaces internos rotos** y **sin enlaces a `.claude/plans|tasks/`** (grep).
- [ ] Enlaces "fuente canónica" verificados contra rutas reales del repo (sitio→repo).
- [ ] Frontera anti-drift respetada: sin bloques de spec copiados verbatim.
- [ ] Gate de `fact-checker` superado — no-negociable.
- [ ] Proyección de estado a GitHub al cerrar — best-effort.
- [ ] Histórico de la tarea actualizado.
- [ ] N/A (`stack: none`): TDD, gate de mutation, TSDoc. Verificación = build + revisión visual.
