# Mapa de fuente canónica (portal ↔ README del plugin)

> Documentación **interna** del portal (excluida de las páginas vía `srcExclude`). Materializada por
> `task-pipeline-portal-redesign-01` (issue #59); la respetan las tasks 02-07.

El portal es **autocontenido** (se entiende sin ir al README), pero la **minucia de referencia exhaustiva** no
se duplica: vive en el README del plugin (canónico) y el portal la **resume + enlaza**. Regla por tema:

| Tema | Fuente canónica | Qué restata el portal (+ enlaza) |
|---|---|---|
| Config `task-pipeline.yml` (flags/presets/stack/models) | Portal → `guia/configuracion` | El README enlaza aquí; el portal es la referencia de config de cara al usuario. |
| Resolución de `mutation` por-package (Stryker/mutmut/escape) | README → "Configuración por repo" | Portal: la idea + tabla resumida + link al README. |
| GitHub tracking: límites, nombres exactos de Status del Project, recipe de estados | README → "GitHub tracking" | Portal: qué proyecta + activar + garantías; la **tabla de límites** y nombres exactos → link. |
| SDD: garantías opt-in, EARS/MADR/Gherkin al detalle | README → "SDD nativo" | Portal: qué es + flujo con/sin SDD + activar; el detalle formal → link. |
| Routing de modelo por fase (`models:`) | README → "Routing de modelo por fase" | Portal: qué fases se rutan + cómo; la limitación de plataforma → link. |
| Trabajo en equipo / colisiones de id | README → "Trabajo en equipo y colisiones de id" | Portal (Conceptos): el modelo + el residual; el detalle → link. |
| Frase canónica del salto trivial | Skill `plan-task` (definición) | Portal: el **string literal** en `guia/pipeline` (pinado). Alinear las 5 copias divergentes = cleanup aparte. |

**Redirects**: hoy **ninguno** — la IA conserva todos los slugs existentes y solo añade páginas nuevas. Si en
el futuro se mueve un slug publicado, se añade su redirect (VitePress) y se anota aquí.
