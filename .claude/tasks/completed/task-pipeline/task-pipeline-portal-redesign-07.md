---
id: task-pipeline-portal-redesign-07
package: task-pipeline
plan: portal-redesign
status: done
priority: 3
depends_on: [task-pipeline-portal-redesign-03, task-pipeline-portal-redesign-04, task-pipeline-portal-redesign-05, task-pipeline-portal-redesign-06]
estimate: 3h
actual:
issue: 65                    # sub-issue proyectada (github-tracking)
created: 2026-08-14
updated: 2026-08-14
---

# Sección "Referencia" + barrido de coherencia + gate de build final

## Description

Cierra el portal: la sección **Referencia** (la minucia canónica que el resto enlaza) y el **gate final** de
coherencia + build + render. Es la task que verifica que el rediseño completo no rompió nada y es consistente.

## Spec

- Sección **Referencia** (según IA de task 01): 
  - `website/guia/configuracion.md` (o su ubicación en la nueva IA): `task-pipeline.yml` completo (presets,
    stack + `stack.packages`, todas las features, models) — **fuente canónica** de la tabla de flags en el
    portal (las capas la enlazan, no la duplican).
  - Catálogo de **skills** (las 10, con la prosa "ocho orquestan…" coherente) y CLI (`claude plugin validate`,
    `--plugin-dir`, `/reload-plugins`, marketplace add/install/update).
- **Barrido de coherencia** (gate): nº skills = 10 + prosa; tablas de flags sin divergencia; **frase canónica
  del salto trivial** intacta en sus copias; extractos congelados del walkthrough (task 03) fieles a su origen.
- **Render checklist claro+oscuro**: cargar cada página con diagrama en los **dos** modos y confirmar SVGs
  legibles (`evaluate_script`), no solo que compile.
- **`pnpm docs:build`** en verde final; redirects de slugs movidos verificados.

## Fuera de alcance

- Reescribir el contenido de secciones ya cerradas (03-06) salvo fixes de coherencia puntuales.
- Reescribir el README.

## Scenarios (Gherkin)

> Doc-only + gate: criterios de aceptación por inspección + `grep` + `pnpm docs:build` + render en navegador.

```gherkin
Feature: cierre coherente y verificado del portal rediseñado

  Scenario: la Referencia es la fuente canónica de la config en el portal
    Given la tabla de flags/config del portal
    When se inspecciona dónde vive
    Then vive completa en Referencia y las páginas de capas la enlazan en vez de duplicarla

  Scenario: el barrido de coherencia no encuentra divergencias
    Given el portal completo
    When se hace el barrido (nº skills=10 + prosa, tablas de flags, frase canónica, extractos del walkthrough)
    Then no hay divergencias entre páginas ni con el repo

  Scenario: todos los diagramas renderizan legibles en ambos modos
    Given cada página con diagrama
    When se carga en claro y en oscuro
    Then todos los SVGs se renderizan y son legibles en los dos modos

  Scenario: el build final pasa sin enlaces rotos
    Given el portal completo con redirects
    When se ejecuta pnpm docs:build
    Then termina en verde sin dead links, y los slugs pinados/redirects resuelven
```

### Refuerzos (scenario-coverage 2026-08-14)

- **Enlaces "profundizar" externos verificados**: `Given` cada enlace del portal a un fichero/anchor del repo
  (README, CHANGELOG, task-lifecycle), `When` se verifica contra el repo actual, `Then` ninguno apunta a un
  heading o ruta que ya no existe (`ignoreDeadLinks:false` solo cubre internos).
- **Legibilidad en móvil**: `Given` una página con Mermaid, `When` se emula viewport 375px, `Then` el diagrama
  es legible o scrollable sin cortar contenido crítico, en ambos modos.
- **Paridad de CONTENIDO portal↔GitHub** (no de estilo): el flowchart del pipeline en el portal no diverge en
  nodos/orden/labels de las copias de GitHub (el estilo sí difiere, y eso es esperado).

## Provides

La sección **Referencia** + el **gate de cierre del portal** (coherencia/build/render). `Provides`: — (última task del plan).

## Definition of Done

- [x] TDD / gate de mutation: **N/A** (doc-only) — verificación = inspección + `grep` + `pnpm docs:build` + render.
- [x] `sdd-lint`: **N/A**; "sin cambios de spec/CU".
- [x] `pnpm docs:build` en verde final; **redirects: ninguno** (la IA conservó todos los slugs); sin dead links.
- [x] Render checklist claro+oscuro completado para las 6 páginas con diagrama (9 diagramas: svgCount == mermaidDivs, 0 errores en ambos modos). **Móvil 375px**: LR diagramas escalan a fit, sin overflow horizontal.
- [x] Barrido de coherencia sin divergencias (skills=10 + prosa; flags defaults; frase canónica solo en pipeline.md; extractos congelados fieles — Gherkin verbatim).
- [x] Gate de `fact-checker` superado (no-negociable). **9/10 VERIFICADO**; el matiz del punto 6 es de **formato** (la frase canónica es **texto verbatim**; el énfasis markdown difiere), no de contenido — corregido el término "byte-idéntica" → "texto verbatim".
- [x] Proyección de estado a GitHub al cerrar — best-effort  · `features.github-tracking`. **Bloqueado por el clasificador de permisos → pendiente owner**.
- [x] Doc técnica actualizada  · `technical-docs` (cli.md + skills/index).
- [x] Session log en `.claude/context/task-pipeline/task-pipeline-portal-redesign-07.md`  · `context-log`.
