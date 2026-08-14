---
id: task-pipeline-portal-redesign
package: task-pipeline
status: active           # pending | active | completed | cancelled
branch: plan/task-pipeline/portal-redesign
issue: 58                # issue PADRE proyectada (github-tracking)
created: 2026-08-14
updated: 2026-08-14
---

# Plan — `portal-redesign`: rehacer el portal de documentación (website/) autocontenido y claro

## Contexto y problema

El portal VitePress (`website/`, 11 páginas) es hoy un **cascarón delgado sobre el README del plugin**: 8 de
sus páginas terminan en `> Fuente canónica: ver el README`, delegando lo importante. Resultado (feedback del
owner): **mal estructurado, escueto, con huecos → no queda claro cómo funciona el plugin**. Además los
diagramas Mermaid usan el **tema por defecto** (planos, sin jerarquía visual → feos).

El README (466 líneas, 17 secciones H2) sí tiene la sustancia técnica. Objetivo: **elevar el portal a fuente
autocontenida y navegable** que explique el plugin **de punta a punta** con ejemplos reales, dejando los
enlaces al README/GitHub como *"profundizar"*, no como *"el contenido real está en otro sitio"*.

## Objetivos

1. **Portal autocontenido.** Ninguna página depende del README para entenderse; el patrón `Fuente canónica →
   README` se sustituye por contenido propio + enlaces de *profundizar* opcionales.
   - *Criterio de éxito*: 0 páginas cuyo cuerpo remita al README para lo esencial; cada página se entiende sola.
2. **Nueva arquitectura de información (IA) clara**, con sidebar/nav reorganizados en 5 secciones: **Empezar ·
   Conceptos · El pipeline paso a paso · Capas opcionales · Referencia**.
   - *Criterio de éxito*: sidebar refleja las 5 secciones; cada página cae en una y sin solapes.
3. **Walkthrough end-to-end "Tu primer plan"** con ejemplos reales (un plan, una task con Gherkin, un session
   log, y qué ve el usuario en cada checkpoint humano).
   - *Criterio de éxito*: existe una página que sigue un caso de principio a fin, con fragmentos reales.
4. **Diagramas Mermaid con estilo pulido y consistente** — una **paleta/tema compartido** (no ad-hoc por
   página): nodos redondeados, agrupación por subgraphs, jerarquía visual, colores con significado (humano vs
   subagente vs gate).
   - *Criterio de éxito*: todos los diagramas del portal usan el mismo tema/paleta, definido en un solo sitio.
5. **Completo para ENTENDER, con minucia enlazada** (D1). El portal explica cada tema lo suficiente para
   entenderlo **sin salir** (sin "ve al README"); la **minucia de referencia exhaustiva** (tablas de límites,
   nombres exactos de opciones de Project, resolución per-package de mutation…) **enlaza** al README bajo un
   **mapa de fuente canónica por tema** (quién manda, cuánto restata el otro). Evita el clon portal↔README.
   - *Criterio de éxito*: cada concepto/capa se entiende sin salir del portal; existe el mapa de fuente
     canónica; ninguna sección **duplica** minucia que podría enlazar.
6. **Coherencia, URLs estables y build.** Portal compila (`pnpm docs:build`), sin enlaces rotos **internos NI
   entrantes**: los slugs que deben persistir (p.ej. `/guia/pipeline`, por la frase canónica) se conservan y
   las páginas movidas por la nueva IA llevan **redirect**. Datos (nº skills, flags, frase canónica)
   consistentes; la **prosa** duplicada portal↔README lleva nota de fuente canónica.
   - *Criterio de éxito*: `pnpm docs:build` en verde; slugs estables preservados + redirects de las movidas;
     render verificado en **claro Y oscuro** por diagrama; barrido `grep`/inspección sin divergencias.

## Alcance y fuera de alcance

### Dentro del alcance
- Reescritura/reestructura del **contenido** del portal `website/**` (páginas `.md`), la **navegación**
  (`.vitepress/config.mts`: nav + sidebar) y todos sus **diagramas Mermaid**.
- **Tema Mermaid compartido** — con **spike previo del mecanismo** (classDef literal vs `themeVariables` vs
  CSS) porque el hex de `classDef` **no se adapta al modo oscuro**; se resuelve y verifica en **claro+oscuro**
  ANTES de autorar en masa. Se autora en su **propia task** de la que dependen las de contenido (no en el
  cuello de botella de la IA). Incluye nota de convención para futuros diagramas.
- **Mapa de fuente canónica por tema** (portal↔README) + notas de cross-referencia en las secciones que
  restatan minucia (guarda contra la deriva de prosa).
- **Preservación de URLs / redirects** de las páginas movidas por la nueva IA (slugs estables + redirect).
- Página nueva **"Tu primer plan"** (walkthrough) y las páginas de **Conceptos** y **Referencia** que hoy no
  existen como tales.

### Fuera de alcance
- **Reescribir el README del plugin** (`task-pipeline/README.md`): sigue siendo la referencia técnica canónica
  para máquina/consumidores; el portal deja de *depender* de él, pero el README **no se toca** en este plan.
- **Los diagramas Mermaid de los docs de GitHub** (`README.md`, `docs/guides/task-lifecycle.md`,
  `flujo-del-pipeline.md`): GitHub no aplica tema custom; el restyle es **solo del portal**.
- El **seed de sitio para consumidores** (plan `sdd-site-vitepress`).
- Cambiar **funcionalidad** del plugin (skills/hooks/flags): esto es **solo documentación**.
- Traducción a otros idiomas; SEO/analytics del sitio.

## Recursos externos

- Fuente de sustancia a absorber: `task-pipeline/README.md` (17 secciones) y `docs/guides/task-lifecycle.md`.
- Portal actual: `website/**` + `website/.vitepress/config.mts` (ya con `withMermaid`, `base:/claude-plugins/`).
- Theming Mermaid: `vitepress-plugin-mermaid` (config `mermaid`) + Mermaid `themeVariables` / `theme:'base'`.
- Frase canónica del salto trivial (debe seguir intacta en `website/guia/pipeline.md`).

## Estimación global

- **Tareas totales**: 7 (ver lista; afinado tras grilling + design-review).
- **Esfuerzo estimado**: 5-7 sesiones.
- **Verificación**: `website/` tiene su propio toolchain pnpm (`pnpm docs:build`) — es la comprobación e2e.

## Criterios de calidad y verificación

- Stack del pipeline = `none` (MD): verificación por **inspección** + `grep`. **Excepción**: el portal SÍ
  compila (`cd website && pnpm docs:build`) — gate e2e real del contenido/diagramas.
- **TDD/mutation = N/A** (docs). **SDD = N/A honesto** (D2): `sdd:true` pero el package no tiene baseline
  (`spec.md`/`casos-de-uso/`), así que `sdd-lint` es N/A y cada task declara "sin cambios de spec/CU" — se
  dice **claramente que SDD no aporta aquí**, no se vende como dogfood. `fact-checker` **sí** aplica en cada
  cierre.
- Cada diagrama se verifica **renderizado** con un **checklist explícito claro+oscuro** (build + carga en
  navegador/`evaluate_script` por página × 2 modos), no solo que compile.
- **Chequeo de enlaces movidos**: toda URL que cambie de slug lleva redirect verificado; los slugs pinados no
  cambian.
- Barrido de coherencia final (nº skills = 10 + la prosa "ocho orquestan…", tablas de flags, frase canónica,
  **y los extractos del walkthrough** —copias congeladas de `.claude/**`, que VitePress no incluye— para que
  no se pudran).

## Tasks (borrador — se afina en Paso 5 tras grilling/design-review)

- [x] `task-pipeline-portal-redesign-01` (P1) — IA + navegación + slugs estables/redirects + mapa de fuente
  canónica (contrato de estructura)  · depends_on: —
- [ ] `task-pipeline-portal-redesign-02` (P1) — Tema Mermaid: **spike del mecanismo** (claro+oscuro, paleta por
  rol) + muestra verificada + nota de convención  · depends_on: —
- [ ] `task-pipeline-portal-redesign-03` (P2) — "Empezar" (Qué es + Instalación + Tu primer plan = walkthrough
  caso real)  · depends_on: 01,02
- [ ] `task-pipeline-portal-redesign-04` (P2) — "Conceptos" (modelo estático: plan/task/context/specs, estados,
  ramas, ids)  · depends_on: 01,02
- [ ] `task-pipeline-portal-redesign-05` (P2) — "El pipeline paso a paso" (recorrido secuencial de fases)  ·
  depends_on: 01,02
- [ ] `task-pipeline-portal-redesign-06` (P2) — "Capas opcionales" (SDD/git-automation/github-tracking/caveman)
  · depends_on: 01,02
- [ ] `task-pipeline-portal-redesign-07` (P3) — "Referencia" + barrido de coherencia + render checklist
  claro/oscuro + gate de build  · depends_on: 03,04,05,06

> Detalle de cada task (Provides, Gherkin, Fuera de alcance) se materializa en el Paso 5. **task-02 (tema
> Mermaid) es el spike que de-riesga el aspecto**: su muestra se aprueba antes de que 03-06 autoren diagramas.

## Decisiones de grilling (2026-08-14)

- **Features del plan.** **SDD = N/A honesto** (ajustado en design-review, D2): `sdd:true` pero sin baseline
  → `sdd-lint` N/A y cada task declara "sin cambios de spec/CU"; se dice **claro que SDD no aporta aquí** (no
  se vende como dogfood). **auto-commit** al cerrar cada task + **auto-PR** al cerrar el plan (co-author:false).
  **github-tracking**: 1 issue padre + 7 sub-issues.
- **Portal autocontenido + "Profundizar" opcional.** Cada página explica su tema completo; los enlaces al
  README quedan como *referencia técnica opcional* al final, **nunca como tapón**.
- **Walkthrough = caso REAL del propio repo** (un plan/task cerrado representativo, con extractos abreviados
  para enseñar sin abrumar). Se elige al ejecutar la **task 03** (corregido en scenario-coverage; la 02 solo
  hace el tema de diagramas).
- **Diagramas = tema Mermaid compartido, paleta por ROL** (humano=ámbar · subagente=azul · gate=rojo ·
  artefacto/normal=neutro), nodos redondeados, subgraphs; **legible en claro Y oscuro** (verificar ambos en el
  build, no solo que compile).
- **Frontera Conceptos↔Pipeline nítida.** *Conceptos* = modelo **estático** (qué/por qué), no recorre fases.
  *Pipeline* = recorrido **secuencial** (cómo), usa el modelo sin redefinirlo. Cero repetición.

> **Follow-up separado (NO es este plan): `sdd-baseline` (lean).** Crear la baseline SDD del package
> `task-pipeline` — `spec.md` con el núcleo del pipeline en EARS + 1-2 CUs del flujo principal + `adr-index` —
> forward-growing, **sin migrar historia** (los plans/tasks completados se quedan como histórico append-only).
> Se planifica/ejecuta aparte; no infla portal-redesign.

## Registro de cambios del plan

- 2026-08-14: creado (borrador).
- 2026-08-14: refinado con `grilling` (5 preguntas, 5 decisiones — ver "Decisiones de grilling"): features del
  plan todas ON, portal autocontenido + profundizar, walkthrough caso real, tema Mermaid por rol claro+oscuro,
  frontera Conceptos↔Pipeline. Registrado follow-up separado `sdd-baseline` (lean).
- 2026-08-14: **design-review** (subagente opus) — el plan no aguantó tal cual; ajustes aplicados:
  **(D1)** completitud recalibrada a "completo para entender + minucia enlazada" con **mapa de fuente canónica**
  portal↔README (Obj 5/6); **(D2)** SDD reconocido **N/A honesto** (no dogfood); **tema Mermaid** sacado a su
  propia task-02 con **spike de mecanismo** claro+oscuro antes de autorar; **redirects/slugs estables** por la
  nueva IA (Obj 6); verificación reforzada (**render checklist claro+oscuro** por diagrama, chequeo de URLs
  movidas, extractos del walkthrough al barrido). Tasks 6→**7**. Resiste: problema real bien diagnosticado,
  walkthrough alto-valor, sin deps nuevas, descomposición contract-first razonable.
- 2026-08-14: **scenario-coverage** (subagente sonnet) — refuerzos aceptados incorporados a las tasks
  01/02/03/05/06/07 (redirect real vía `docs:preview`, no solo build; detección de Mermaid roto en cliente +
  labels con caracteres especiales; **accesibilidad AA + no-solo-color** en la paleta; aprobación explícita de
  la muestra; verificación de que los **extractos congelados** coinciden con su origen; **preservación** de
  honesty-rules/"subagentes frescos"/atribución Matt Pocock; chequeo de **enlaces externos** a GitHub;
  **móvil**; `srcExclude` del mapa; **buscador local** activado). Corregida inconsistencia: el caso real del
  walkthrough lo elige la **task 03**. **(B) decisiones del owner**: (B1) frase canónica **solo portal** ahora
  → alinear las 5 copias divergentes = **cleanup separado**; (B4) meta-tags SEO/OG **fuera de alcance**;
  (B2/B3) consecuencias ya aceptadas (estilo de diagrama GitHub↔portal, asimetría de prosa con el README).

> **Follow-up separado #2: `canonical-phrase-consistency` (cleanup).** Alinear el string literal de la frase
> canónica del salto trivial en sus 5 copias (`README.md`, `docs/guides/task-lifecycle.md`,
> `templates/task-lifecycle.md`, `task-pipeline/docs/flujo-del-pipeline.md`, `website/guia/pipeline.md`), que
> **ya divergen hoy**. Fuera de portal-redesign (toca ficheros no-`website/`).
