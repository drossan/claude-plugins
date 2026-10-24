# Session log — task-pipeline-sdd-externo-followups-01

## 2026-10-24 — Arranque
- Gate: sin `depends_on`; #91 mergeada (`main` en `5a661c1`); rama `plan/task-pipeline/sdd-externo-followups` creada desde `main` (los ficheros sin commitear viajaron); plan y tarea movidos a `active/`; ninguna otra tarea `active`.
- Modo SDD del repo: nativo (`sdd: true`). Gherkin en el CU `portal-enlaces-github.md` (ya escrito al crear la tarea).

## 2026-10-24 — Implementación
- `website/scripts/check-github-links.mjs`: Node sin dependencias, solo lectura. Extrae `github.com/drossan/claude-plugins/(blob|tree)/main/…` de los `.md` publicados (srcExclude leído como texto de `config.mts`, error explícito si no se interpreta), ignora fences, comprueba ruta (mayúsculas exactas) y ancla (slug estilo GitHub, decodificada, minúsculas, sin `-N`, `#L…` ignorado). Exporta `slug` y `headingSlugs` para poder probarlos. 0 enlaces = fallo. Node ≥ 18 comprobado por versión.
- `website/package.json`: `docs:build` = check + `vitepress build`; nuevo `docs:check-links`. `website/README.md`: sección del check. Lifecycle del repo: línea de DoD (la plantilla NO la lleva, RN-8). `spec.md`: SC-004 ampliado + enlace al CU.
- Decisión: los fixtures de slug se probaron importando las funciones exportadas, sin fichero de tests (stack `none`).
- Dato corregido: el portal tiene 12 enlaces con ancla y 8 anclas distintas (el plan decía 9). El script solo cuenta los enlaces con ancla (12), así que el CU ya no cita el «8».

## Verificación (ejecutada en esta sesión)
- Portal real: `OK — 25 enlaces (12 con ancla) en 15 ficheros` desde la raíz, desde `website/` y desde `/tmp`.
- 7 fixtures de slug OK; fences (3/4 backticks, tildes, sin cerrar), front matter, CRLF y BOM OK.
- Repo de juguete en `/tmp` (borrado después): ruta inexistente, mayúsculas, ancla inexistente, ancla en fence, `#foo-1`, `%ZZ`, traversal (`..`, `%2e%2e`), duplicados, URL solo en fence, fichero excluido, 0 enlaces, `srcExclude` no parseable, Node simulado 16 → todos como dice el CU; exit 1 con enlace roto y 0 sin él.
- `claude plugin validate .` → Validation passed. `pnpm docs:build` limpio → build complete. Con 2 enlaces rotos inyectados en `guia/que-es.md` → falla y NO genera `dist/`; restaurado con `git checkout` y vuelve a pasar.
- Barrido: sin ids muertos; el único «idéntic» es una frase del fixture CRLF/BOM, no SDD.

## Cierre
- **sdd-lint**: mecánico limpio. Semántico (Sonnet): 0 ERROR. AVISOS: (a) arreglados — «8 anclas distintas» no observable, RN-7/escenario de Node promete por característica pero se comprueba por versión, fila del Outline en prosa; (b) reconocidos — «Todos los fallos en una ejecución» mezcla listar/deduplicar/formato; «El check se puede ejecutar solo» tiene un Then débil; el escenario de la DoD comprueba texto, no comportamiento.
- **fact-checker** (Sonnet): 11/11 VERIFICADO (check OK 25/12/15, validate, docs:build, package.json, script, DoD solo en el lifecycle del repo, spec.md sin FR, README, que-es.md restaurado, sin residuos, sin ids muertos).
- SDD: CU `portal-enlaces-github.md` creado al planificar y ajustado en el cierre; `spec.md` enlaza el CU y amplía SC-004 (sin FR, decisión del owner).
- Ficheros: `website/scripts/check-github-links.mjs`, `website/package.json`, `website/README.md`, `docs/guides/task-lifecycle.md`, `.claude/specs/task-pipeline/spec.md`, CU `portal-enlaces-github.md`.
- Tiempo real: ~1h (estimado, sin cronómetro). Follow-ups: workflow de CI en PRs para el check (fuera de alcance); el release 0.18.5 lo cierra la tarea 03.
