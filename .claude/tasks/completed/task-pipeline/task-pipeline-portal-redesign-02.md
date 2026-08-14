---
id: task-pipeline-portal-redesign-02
package: task-pipeline
plan: portal-redesign
status: done
priority: 1
depends_on: []
estimate: 3h
actual: 1h
issue: 60                    # sub-issue proyectada (github-tracking)
created: 2026-08-14
updated: 2026-08-14
---

# Tema Mermaid: spike de mecanismo (claro+oscuro) + paleta por rol + muestra

## Description

De-riesga el aspecto de los diagramas —la queja visual del owner— **antes** de autorar en masa. Resuelve el
**mecanismo** de theming (el punto técnicamente más difícil: los `classDef` con hex literal **no se adaptan al
modo oscuro** de VitePress) y fija una **paleta por rol** reutilizable, verificada legible en **claro Y
oscuro**. Produce una **muestra** que se aprueba antes de que 03-06 dibujen.

## Spec

- **Spike del mecanismo**: evaluar y elegir entre `mermaid.themeVariables` (config global en `withMermaid`),
  `classDef` por rol, y/o CSS del portal que reaccione al toggle claro/oscuro de VitePress. Elegir el que dé
  **color-por-rol legible en ambos modos** con el mínimo de mantenimiento.
- **Paleta por rol** (semántica, no decorativa): humano/checkpoint = ámbar · subagente adversario = azul ·
  gate = rojo · artefacto/nodo normal = neutro. Nodos redondeados, agrupación por `subgraph`.
- Definir el tema en **un solo sitio** (config y/o CSS en `website/.vitepress/`), no ad-hoc por página.
- **Muestra**: 1 diagrama representativo (p.ej. el flowchart del pipeline) con el tema aplicado, para aprobar.
- **Nota de convención** breve (dónde vive el tema, qué clase usar por rol) para futuros diagramas.

## Fuera de alcance

- Reescribir todos los diagramas del portal (eso lo hacen 03-07 aplicando este tema).
- Los diagramas Mermaid de los docs de GitHub (README/lifecycle): GitHub no aplica tema custom.
- Añadir dependencias nuevas (`vitepress-plugin-mermaid`/`mermaid` ya están cableados).

## Scenarios (Gherkin)

> Doc-only + config: criterios de aceptación verificables por `pnpm docs:build` + render en navegador
> (`evaluate_script`) en los **dos** modos, no tests TDD.

```gherkin
Feature: tema de diagramas Mermaid consistente y legible en claro y oscuro

  Scenario: la muestra renderiza legible en modo claro
    Given el tema Mermaid aplicado a un diagrama de muestra
    When se carga la página en modo claro
    Then el SVG del diagrama se renderiza y los colores por rol son distinguibles y legibles

  Scenario: la muestra renderiza legible en modo oscuro
    Given el mismo diagrama de muestra
    When se conmuta el portal a modo oscuro
    Then el diagrama sigue siendo legible (texto y fondos con contraste suficiente), sin nodos ilegibles

  Scenario: el tema vive en un único sitio
    Given diagramas en varias páginas
    When se inspecciona de dónde toman su estilo
    Then el color por rol se define una sola vez (config/CSS del portal), no repetido por diagrama

  Scenario Outline: cada rol tiene su color con significado
    Given un nodo de rol <rol>
    When se renderiza
    Then usa el color <color> de la paleta

    Examples:
      | rol                 | color   |
      | humano/checkpoint   | ámbar   |
      | subagente adversario| azul    |
      | gate                | rojo    |
      | normal/artefacto    | neutro  |
```

### Refuerzos (scenario-coverage 2026-08-14)

- **Diagrama con sintaxis inválida se detecta**: `vitepress-plugin-mermaid` renderiza en cliente → `docs:build`
  verde no lo caza. `Given` un bloque mermaid malformado, `When` se carga en navegador, `Then` aparece el error
  de parseo (no un SVG silenciosamente vacío) y el render-checklist lo marca como fallo.
- **Labels con caracteres especiales** (tildes/ñ/comillas anidadas/`<br/>`) — el portal está en español:
  `Then` el SVG se genera sin error de parseo.
- **Accesibilidad**: la distinción de rol **no depende solo del color** (añadir forma/etiqueta) y cumple
  contraste **WCAG AA** en claro y oscuro (no solo "distinguible").
- **Aprobación explícita del owner de la muestra** ANTES de que 03-06 dibujen: `Then` la aprobación queda
  registrada (Plan change log) antes de que ninguna task de contenido pase a `active`. **La elección del caso
  real del walkthrough NO es de esta task** (es de la 03).

## Provides

El **tema/convención de diagramas Mermaid** (mecanismo elegido + paleta por rol + dónde se define) y la
**muestra aprobada** — contrato del que dependen 03-07 para dibujar diagramas consistentes y legibles en
ambos modos sin re-decidir el estilo.

## Definition of Done

- [ ] TDD / gate de mutation: **N/A** (config + doc) — verificación = `pnpm docs:build` + render en navegador.
- [ ] `sdd-lint`: **N/A**; se declara "sin cambios de spec/CU".
- [ ] `pnpm docs:build` en verde con la muestra.
- [ ] Muestra verificada **renderizada en claro Y oscuro** (checklist), no solo que compile.
- [ ] `Provides` disponible: tema en un único sitio + nota de convención + muestra aprobada.
- [ ] Gate de `fact-checker` superado (no-negociable).
- [ ] Proyección de estado a GitHub al cerrar — best-effort  · `features.github-tracking`.
- [ ] Doc técnica: nota de convención del tema  · `technical-docs`.
- [ ] Session log en `.claude/context/task-pipeline/task-pipeline-portal-redesign-02.md`  · `context-log`.
