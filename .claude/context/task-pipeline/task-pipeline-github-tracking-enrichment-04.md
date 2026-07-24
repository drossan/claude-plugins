# Session log — task-pipeline-github-tracking-enrichment-04

> Append-only. Docs de usuario: README §GitHub-tracking + website/features/github-tracking.md + runbook.
> `gh` requerido explícito + comportamientos nuevos + límites honestos. No duplicar la mecánica fina
> (canónica en lifecycle tarea 02 + Paso 5.7 tarea 01); resumir + enlazar + listar límites.

## 2026-07-24 — Arranque

- Gate OK: rama del plan ✓; depends_on (01,02,03) en `completed/` ✓; ninguna otra tarea `active` ✓.
  Movida la 04 a `active/`, `status: active`, `updated: 2026-07-24`.
- Stack `none`: TDD/mutation = N/A. DoD pide además `pnpm docs:build` en `website/` (sub-proyecto aislado).
- 3 destinos localizados: `task-pipeline/README.md` §GitHub tracking (170+, STALE en Estados/límites),
  `website/features/github-tracking.md`, `.claude/specs/task-pipeline/github-tracking-runbook.md`.

## 2026-07-24 — Ediciones + verificación

Editados los 3 destinos:
- `task-pipeline/README.md` §GitHub tracking: Setup (gh REQUERIDO + scopes repo/project), fila `assignee` en
  la tabla de config, Mapeo (body+banner, pkg, alta Project Backlog, Estados en 2 sitios con recipe
  add-then-remove + enlace a lifecycle canónico, padre sin status:*/assignee), Límites (type omitido+asimetría
  org, @me asignable, Status opciones-default case-insensitive, body sin daemon + límite ~65536, I3 ampliado).
- `website/features/github-tracking.md`: reescrito coherente con el README (gh requerido, comportamientos,
  límites incl. tamaño de body; usa `status: blocked`, no la pelada).
- `.claude/specs/task-pipeline/github-tracking-runbook.md`: gotcha de identidad corregido (write al Project
  VERIFICADO, ya no dice que editar falla) + nueva sección de comandos gh concretos (--body-file, label create,
  project item-add/item-edit --single-select-option-id, issue edit --add-assignee), coherentes con 01/02.

### Verificación corrida + resultado
- grep de coherencia: README exige gh + scopes; sin "label blocked" pelada en README/website; "In Progress"
  solo en la línea intencional de contraste case-insensitive; `status: blocked` en ambos.
- `pnpm docs:build` en `website/` -> build complete (exit 0). DoD del sub-proyecto cumplida.
- fact-checker (subagente fresco, inherit): 7/7 VERIFICADO.
- Dogfood #23: arranque (label+assignee+Project In progress) + cierre (Done + status:* retirada + CLOSED).
  El primer `gh issue close` emitio un error GraphQL transitorio pero el estado reconcilio a CLOSED
  (demostracion real de la degradacion best-effort C3: gh puede fallar a mitad; el estado final es correcto).
- Barrido grep de ids muertos en ficheros tocados: limpio.
- TDD/mutation = N/A (stack `none`).

## 2026-07-24 — Cierre de la tarea

### Resumen
Docs de usuario alineadas con la proyeccion enriquecida: README §GitHub-tracking + website + runbook.
gh requerido explicito (scopes repo+project), comportamientos nuevos (body completo+banner, pkg label,
estado en Project Status + label status:*, assignee, alta Backlog) enlazando al canonico (lifecycle/Paso 5.7)
sin duplicar la mecanica, y limites honestos (type omitido+asimetria org, @me asignable, Status opciones-default,
body sin daemon+tamano, I3 ampliado). Runbook: gotcha corregido + comandos gh concretos.

### Decisiones tecnicas + porque
- README = referencia detallada; website = resumen que enlaza al README canonico; runbook = comandos gh del
  owner. Evita duplicar la mecanica fina (vive en lifecycle tarea 02 + Paso 5.7 tarea 01).
- "In Progress" solo en la nota de contraste (coherente con el lifecycle): documenta el porque del match
  case-insensitive.

### Docs actualizadas / Ficheros tocados
- task-pipeline/README.md
- website/features/github-tracking.md
- .claude/specs/task-pipeline/github-tracking-runbook.md
- (bookkeeping) task .md -> completed/, plan tick+updated, este context log.

### Tiempo real
~1h (estimate 2h).

### Follow-ups
- Tarea 05 (release): CHANGELOG 0.13.0 + bump plugin.json + coherencia marketplace.json/description; cerrar
  la issue PADRE #19 al completar el plan.
- HOW-TO-START-A-TASK.md sigue con menciones stale (follow-up de tarea 02, no abordado aqui porque el plan lo
  dejo fuera de alcance). Candidato a /doctor o a un plan futuro.
