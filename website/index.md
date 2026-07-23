---
layout: home

hero:
  name: task-pipeline
  text: Pipeline de trabajo guiado para Claude Code
  tagline: >-
    plan → grilling → design-review → tareas Gherkin → scenario-coverage → TDD →
    mutation → fact-checker. Dos checkpoints humanos no negociables, por diseño.
  actions:
    - theme: brand
      text: Qué es
      link: /guia/que-es
    - theme: alt
      text: Instalación
      link: /guia/instalacion
    - theme: alt
      text: Ver en GitHub
      link: https://github.com/drossan/claude-plugins

features:
  - title: Plan → tareas Gherkin
    details: >-
      /plan-task orquesta el flujo completo: plan mode, refinado con grilling,
      revisión adversaria de diseño y descomposición en tareas con escenarios.
    link: /guia/pipeline
    linkText: El pipeline
  - title: Gates de calidad
    details: >-
      Mutation testing (Stryker) y fact-checker como gate de cierre que verifica
      las afirmaciones de la sesión. Configurable por repo.
    link: /skills/
    linkText: Las skills
  - title: Opt-in, portable
    details: >-
      Modos opcionales caveman (compresión de output) y github-tracking
      (proyección a Issues/Projects). Reutilizable en cualquier repo que adopte
      la convención.
    link: /features/github-tracking
    linkText: github-tracking
---
