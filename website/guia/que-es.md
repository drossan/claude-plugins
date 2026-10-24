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

## Capas opt-in (default off)

El pipeline base funciona sin tocar nada. Además, el plugin trae **capas opcionales** que enciendes por flag
en `.claude/task-pipeline.yml` — ninguna se activa sola y su ausencia no es "drift":

- **[SDD nativo](../features/sdd.md)** — specs vivas: requisitos **EARS**, casos de uso **Gherkin**, decisiones **ADR/MADR**, con gate de validación `/sdd-lint`.
- **[Git automation](../features/git-automation.md)** — auto-commit al cerrar tarea, auto-PR al cerrar plan.
- **[GitHub tracking](../features/github-tracking.md)** — proyecta el trabajo a GitHub Issues/Projects (one-way).
- **[Modo caveman](../features/caveman.md)** — comprime el output del hilo principal para ahorrar tokens.
- **Stack por-package poliglota** (`stack.packages`) y presets (`mode: full/legacy/docs-only`) — ver [Configuración](./configuracion.md).

## Siguiente paso

- [Instalación](./instalacion.md) — añade el marketplace e instala el plugin.
- [Tu primer plan](./tu-primer-plan.md) — un caso real de principio a fin, con lo que ves y decides en cada checkpoint.
- [El pipeline](./pipeline.md) — el flujo completo, fase a fase.
- [Configuración](./configuracion.md) — `task-pipeline.yml`: presets, stack, features, models.

## Profundizar (opcional)

Todo lo anterior se entiende sin salir del portal. Si quieres la **referencia técnica exhaustiva** para
máquina/consumidores —tablas de límites, nombres exactos de opciones— está en el
[README del plugin](https://github.com/drossan/claude-plugins/blob/main/task-pipeline/README.md) y en la
[guía de ciclo de vida](https://github.com/drossan/claude-plugins/blob/main/docs/guides/task-lifecycle.md).
No hace falta para empezar.
