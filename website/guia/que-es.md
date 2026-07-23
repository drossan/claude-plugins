# Qué es task-pipeline

**task-pipeline** es un plugin de [Claude Code](https://code.claude.com/docs) que convierte
"ponerse a programar" en un **flujo guiado con checkpoints de calidad**. En vez de saltar directo al
código, conduce el trabajo desde las especificaciones hasta tareas pequeñas, verificables y trazables.

## El problema

Los agentes tienden a dos fallos: **empezar a codificar antes de entender el problema** y **afirmar cosas
sin verificarlas** ("los tests pasan", "esa función existe"). task-pipeline mete fricción deliberada donde
importa —refinar el plan, revisar el diseño, endurecer los escenarios, verificar las afirmaciones al
cerrar— y deja fluir el resto.

## La idea

- **El trabajo vive en Markdown**, versionado con el código: planes en `.claude/plans/`, tareas en
  `.claude/tasks/`, histórico en `.claude/context/`. El `.md` es la **fuente de verdad**.
- **Las skills son playbooks** que Claude sigue (no scripts): orquestan el flujo y lanzan subagentes frescos
  para las revisiones adversarias.
- **Dos checkpoints humanos no negociables**: el refinado con `grilling` y la aprobación del plan. Ningún
  flag los desactiva.

## Cuándo usarlo

- Arrancar trabajo nuevo a partir de unas specs (`/plan-task "quiero añadir X"`).
- Descomponer algo grande en tareas pequeñas con criterios de aceptación (Gherkin).
- Cerrar cada tarea con gates de calidad (mutation testing, verificación de afirmaciones).

## Siguiente paso

- [Instalación](./instalacion.md) — añade el marketplace e instala el plugin.
- [El pipeline](./pipeline.md) — el flujo completo, fase a fase.

> **Fuente canónica**: el README del plugin y la guía de ciclo de vida documentan el detalle exhaustivo.
> Ver [`task-pipeline/README.md`](https://github.com/drossan/claude-plugins/blob/main/task-pipeline/README.md)
> y [`docs/guides/task-lifecycle.md`](https://github.com/drossan/claude-plugins/blob/main/docs/guides/task-lifecycle.md).
