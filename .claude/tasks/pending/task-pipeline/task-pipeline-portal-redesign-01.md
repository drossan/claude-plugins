---
id: task-pipeline-portal-redesign-01
package: task-pipeline
plan: portal-redesign
status: pending
priority: 1
depends_on: []
estimate: 3h
actual:
issue: 59                    # sub-issue proyectada (github-tracking)
created: 2026-08-14
updated: 2026-08-14
---

# IA + navegación + slugs estables/redirects + mapa de fuente canónica

## Description

Sienta el **contrato de estructura** del que dependen todas las tasks de contenido: la nueva arquitectura de
información en 5 secciones (Empezar · Conceptos · El pipeline paso a paso · Capas opcionales · Referencia), la
navegación (`nav` + `sidebar` en `website/.vitepress/config.mts`), la **preservación de URLs** de las páginas
que se mueven, y el **mapa de fuente canónica portal↔README** que guarda contra la doble verdad. No escribe
el contenido de las secciones (eso es 03-06); define **dónde** va cada cosa y **qué URL** tiene.

## Spec

- `website/.vitepress/config.mts`: `nav` + `sidebar` reorganizados en las **5 secciones**. Cada página actual
  y futura asignada a exactamente una sección.
- **Slugs estables**: `/guia/pipeline` NO cambia (lleva la frase canónica del salto trivial). Enumera los
  slugs que deben persistir por enlaces entrantes (README del plugin, GitHub Pages).
- **Redirects** para páginas movidas: usar el mecanismo de VitePress (p.ej. `rewrites` o páginas-stub con
  redirect) — decidir e implementar el que no rompa el build (`ignoreDeadLinks` sigue `false`).
- **Mapa de fuente canónica** (nuevo, p.ej. `website/CANONICAL-SOURCES.md` interno o sección en el README de
  dev del portal): por cada tema con detalle también en el README del plugin, declara **quién es canónico** y
  **cuánto** restata el portal + link. Es la guía que 03-07 respetan.
- `website/index.md` (landing): ajustado a la nueva IA (puntos de entrada a las 5 secciones).

## Fuera de alcance

- Reescribir el README del plugin (`task-pipeline/README.md`) — sigue siendo referencia técnica canónica.
- El **contenido** de las páginas de sección (03-06) y el tema visual de diagramas (02).

## Scenarios (Gherkin)

> Task doc-only (stack `none`): los escenarios son **criterios de aceptación** verificables por inspección /
> `grep` / `pnpm docs:build`, no tests TDD.

```gherkin
Feature: estructura de navegación y URLs estables del portal

  Scenario: el sidebar refleja las 5 secciones
    Given el portal reestructurado
    When se inspecciona el sidebar en config.mts
    Then existen exactamente las secciones Empezar, Conceptos, El pipeline paso a paso, Capas opcionales y Referencia
    And cada página del portal está asignada a una sola de ellas

  Scenario: los slugs con enlaces entrantes se conservan
    Given que /guia/pipeline lleva la frase canónica y hay enlaces entrantes a él
    When se aplica la nueva IA
    Then /guia/pipeline sigue resolviendo (mismo slug)
    And toda página movida a un slug nuevo tiene un redirect desde el antiguo

  Scenario: el build no tiene enlaces internos rotos
    Given la nueva navegación y los redirects
    When se ejecuta pnpm docs:build
    Then el build termina en verde sin dead links (ignoreDeadLinks sigue false)

  Scenario: existe el mapa de fuente canónica
    Given temas con detalle duplicado portal↔README
    When se consulta el mapa de fuente canónica
    Then cada tema declara qué artefacto es canónico y qué restata el otro con su link
```

### Refuerzos (scenario-coverage 2026-08-14)

- **Redirect REAL, no solo build**: `Given` una URL movida servida (`pnpm docs:preview`), `When` se navega,
  `Then` aterriza en la página nueva (no 404 ni stub inerte) — Pages es hosting estático, `docs:build` verde no
  lo prueba.
- **El `nav` superior también refleja la IA** (no solo el sidebar), sin entradas huérfanas.
- **Todos los slugs hoy publicados resuelven** tras la IA (`Scenario Outline`: `/guia/que-es`,
  `/guia/instalacion`, `/guia/configuracion`, `/skills/`, `/features/{sdd,git-automation,github-tracking,caveman}`),
  no solo `/guia/pipeline`.
- **`CANONICAL-SOURCES.md`** (si vive en `website/`) va a `srcExclude` o se enlaza deliberadamente — que no se
  publique como página huérfana.
- **Buscador local** de VitePress activado (decisión owner) y verificado en el build.

## Provides

La **estructura de navegación** (nav/sidebar de las 5 secciones), la **tabla de slugs estables + redirects** y
el **mapa de fuente canónica** — contrato del que dependen las tasks 02-07 para saber dónde y con qué URL va
cada página y hasta dónde detallar antes de enlazar al README.

## Definition of Done

- [ ] TDD / gate de mutation: **N/A** (stack `none`, doc-only) — verificación = inspección + `pnpm docs:build`.
- [ ] `sdd-lint`: **N/A** (sin baseline SDD); se declara "sin cambios de spec/CU".
- [ ] `pnpm docs:build` en verde, sin dead links internos.
- [ ] Slugs pinados preservados; páginas movidas con redirect verificado.
- [ ] `Provides` disponible: nav/sidebar + tabla de slugs + mapa de fuente canónica materializados.
- [ ] Gate de `fact-checker` superado (no-negociable).
- [ ] Proyección de estado a GitHub al cerrar (issue → done) — best-effort  · `features.github-tracking`.
- [ ] Doc técnica actualizada (comentarios en `config.mts`, mapa de fuente canónica)  · `technical-docs`.
- [ ] Session log en `.claude/context/task-pipeline/task-pipeline-portal-redesign-01.md`  · `context-log`.
