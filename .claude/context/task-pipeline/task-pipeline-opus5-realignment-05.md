# Session log — task-pipeline-opus5-realignment-05

> Append-only. Documentación, dogfooding del repo source y release **0.14.0**.

## 2026-08-10 — Arranque

- Gate OK: `depends_on: [02, 03, 04]` los tres en `completed/` ✓; rama del plan ✓; única `active` ✓.
- Proyección GitHub: **#31** → Project `In progress` + label + assignee.
- Estado de partida verificado: ancla de la plantilla ya en `0.14.0` (la fijó la 01), `plugin.json` aún
  en `0.13.0`, `.claude/honesty-rules.md` **idéntico** a la plantilla, `coding-standards.md` ya existe.
  Es decir: el **dogfooding ya estaba hecho** por las tareas 01 y 02; esta tarea lo **verifica** y corta
  la versión.

## 2026-08-10 — Qué se documentó

**README del plugin** — sección nueva `## Reglas de honestidad y disciplina de trabajo`, con:
- Tabla de los **cinco bloques** y qué acota cada uno.
- El **criterio de admisión** al fichero, con su test operativo.
- El **coste dicho claro**: se inyecta cada turno, techo de **7 000 B**.
- **El `@import` es tuyo**: sin él el fichero está en disco pero no se lee y ninguna regla se aplica.
- Subsección **"Actualizaciones y opt-out deliberado"**: cómo funciona el ancla, y —lo que pedía la
  Spec— **qué pasa si borras un bloque a propósito**. Respuesta honesta: el check es por ancla, no por
  contenido, así que en cuanto aceptes una actualización `/doctor` **dejará de decirte nada** sobre ese
  bloque, ni que falta ni que la plantilla lo mejoró después. Es el precio de no marcar como drift la
  personalización legítima. Se documenta la alternativa: **comentar en vez de borrar**.
- **Enlace a la justificación** de la tarea 02 → `docs/honestidad-no-es-sobre-verificacion.md`,
  verificado que resuelve a un fichero versionado existente (este plan arregló un puntero colgante; no
  íbamos a crear otro).
- Subsección **`effort` se fija por sesión, no por fase**, junto al routing de modelo: **no existe ni
  existirá** una clave `effort:` en el YAML porque la Agent tool no acepta ese parámetro. Se dice para
  que nadie la busque, y se apunta a la palanca real (`low`/`medium` rinden bien en Opus 5).
- Criterios calibrados del salto, con la **frase canónica literal**.

**`website/`** — tres ficheros alineados para que no contradigan al README: `guia/pipeline.md` (dos
secciones nuevas: alcance y reglas que viajan con el repo), `skills/index.md` (la descripción de
`scenario-coverage` ahora dice que separa la salida en dos), `features/caveman.md` (contenido protegido).

**Propagación de la carta ampliada** — los cinco sitios que describían el fichero como
"anti-alucinación" quedan cubiertos: `templates/README.md` y `task-init/SKILL.md` (tarea 01), y en esta
tarea el **mensaje de `bootstrap.sh`**, el **título de la categoría 6 de `doctor`** y el **README**.

**`CHANGELOG.md`** — entrada `[0.14.0]` en formato Keep a Changelog, con `Added` / `Changed` / `Fixed`.
El `</content>` va en **`Fixed`** describiendo el impacto real: se propagaba a cada repo consumidor vía
`/task-init` y vía la restauración del hook, y en `honesty-rules.md` dentro de un fichero leído **cada
turno**; a quien ya lo tenga materializado, `/doctor` se lo reportará por ancla, salvo en
`coding-standards.md`, que es **user-owned** y solo se informa.

**Decisión registrada: el README pasa a ser el quinto sitio con los criterios de salto.** La tarea 04
avisó de que enumerarlos aquí crearía un sitio más que mantener. Lo asumo porque el README es la puerta
de entrada y un usuario debe saber cuándo se le ofrecerá un salto; el coste está contenido porque la
frase es **literal y greppable**. Actualizada la nota de mantenimiento de `plan-task/SKILL.md`: de
"tocas las cuatro" a **"tocas las cinco"**.

## 2026-08-10 — Verificación ejecutada

| Comprobación | Comando / resultado |
|---|---|
| Manifest válido | `claude plugin validate .` → **✔ Validation passed** |
| Portal construye | `pnpm docs:build` en `website/` → *build complete in 1.21s*, **EXIT=0** |
| Ancla ≤ versión publicada | ancla `0.14.0` · `plugin.json` `0.14.0` · ancla repo `0.14.0` → no posterior ✓ |
| Dogfooding | `.claude/honesty-rules.md` **idéntico** a la plantilla; `coding-standards.md` existe; `@import` presente en `CLAUDE.md:5` |
| Enlace a la justificación | resuelve a `task-pipeline/docs/honestidad-no-es-sobre-verificacion.md`, que existe |
| Techo del fichero de cada turno | **6 191 B / 93 líneas** contra 7 000 / 110 |
| Frase canónica de los criterios | presente en los **5** sitios (`grep` normalizado) |
| Barrido de ids muertos | limpio en ficheros vivos del plugin; los hits son `templates/task.md` (nombre de fichero, falso positivo ya documentado en `task-pipeline-001`) y la allowlist de `CLAUDE.md` |
| Bump idempotente | el script solo sustituye si encuentra `0.13.0`; re-ejecutarlo imprime "ya bumpeada". `## [0.14.0]` aparece **1** vez en el CHANGELOG |
| Descripciones coherentes | `plugin.json` ↔ `marketplace.json`: ambas incorporan las reglas nuevas y la detección de drift por ancla |

**El escenario "toolchain del portal no disponible" no se dio**: `pnpm` estaba disponible y el build se
ejecutó de verdad. Si no lo hubiera estado, el ítem quedaría **no verificado y bloquearía el cierre** —
no se declara que pasa sin correrlo.

**`/doctor` sobre este repo no reporta drift de `honesty-rules.md`**: verificado **por el mecanismo**, no
ejecutando la skill — el ancla del materializado y la de la plantilla son la misma (`0.14.0`) y los
ficheros son idénticos byte a byte, que es exactamente la condición que la categoría 6b evalúa. Correr
`/doctor` ahora ejercitaría la instalación cacheada (**0.13.0**), que no tiene esa categoría. Queda
declarado como límite; se podrá ejercitar de verdad tras publicar este release.

## 2026-08-10 — Cierre de la tarea

### Resumen
Release **0.14.0** preparado: documentación del comportamiento nuevo en README, portal y CHANGELOG;
carta ampliada propagada a los cinco sitios que la describían; `plugin.json` bumpeado y descripciones
alineadas con `marketplace.json`; y este repo verificado como consumidor alineado con lo que publica.

### Decisiones técnicas + porqué
- **El opt-out deliberado se documenta como lo que es**: una consecuencia aceptada del check por ancla,
  no una feature. Se dice qué pierdes y se ofrece la alternativa (comentar en vez de borrar).
- **`effort` se documenta por su ausencia**: decir "no existe ni existirá y este es el motivo" evita que
  alguien lo busque o abra un issue pidiéndolo.
- **README como quinto sitio de los criterios**, con la nota de mantenimiento actualizada en vez de
  dejarla mintiendo.
- **El `</content>` va en `Fixed` con su impacto**, no como una nota menor: llegó a repos ajenos.

### Verificación corrida + resultado
Tabla de arriba. `claude plugin validate .` y `pnpm docs:build` **ejecutados**, ambos en verde.

### Docs actualizadas
- `task-pipeline/README.md` (sección de honesty-rules, opt-out, `effort`, criterios, doctor, plantillas).
- `task-pipeline/CHANGELOG.md` (entrada 0.14.0), `task-pipeline/.claude-plugin/plugin.json` (bump +
  description), `.claude-plugin/marketplace.json` (description).
- `task-pipeline/hooks/bootstrap.sh` (mensaje), `task-pipeline/skills/doctor/SKILL.md` (título cat. 6),
  `task-pipeline/skills/plan-task/SKILL.md` (nota de mantenimiento: cinco copias).
- `website/guia/pipeline.md`, `website/skills/index.md`, `website/features/caveman.md`.

## 2026-08-10 — Gate `fact-checker`

**14 VERIFICADO · 0 INCORRECTO · 0 NO VERIFICABLE.** El verificador ejecutó él mismo
`claude plugin validate .` (exit 0) y `pnpm docs:build` (exit 0 medido con `$?` directo, no con
`PIPESTATUS`), y reprodujo el `printf` de `bootstrap.sh` comprobando que el JSON resultante parsea.

**Hallazgo incidental suyo, corregido**: el CHANGELOG decía *"los criterios viven ahora en **cinco
sitios** con una frase canónica literal en **las cuatro copias**"* — recuento que se quedó viejo al
añadir el README como copia en esta misma tarea, y que además se contradecía con
`plan-task/SKILL.md:58` ("tocas las cinco"). Corregido a **seis sitios / cinco copias**, enumerándolas.
No afectaba a ninguna afirmación verificada, pero era texto **publicado** incoherente.

### Tiempo real
~1h (estimate 3h).

### Follow-ups
- **Tag y publicación**: el release se corta con un tag SemVer `v0.14.0` sobre `main` tras mergear el PR
  del plan. Nada de esto está pusheado todavía.
- Tras publicar, **ejercitar de verdad** `/doctor` y `/task-init` con la 0.14.0 instalada: es lo único
  que este plan no ha podido verificar ejecutando (límite declarado en las tareas 01, 02 y 03).
- Queda la tarea **06** (baseline de medición), independiente del release.
