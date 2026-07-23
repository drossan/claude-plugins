# Session log — task-pipeline-docs-portal-and-tracking-01

> Histórico append-only de la tarea. Registro canónico; no duplicar en el plan.

## 2026-07-23 — Arranque

- Tarea movida a `active/`, `status: active`. Rama `plan/task-pipeline/docs-portal-and-tracking` creada
  desde `main` (local; el push lo hace el owner). Plan movido a `active/`, `status: active`.
- Issue vinculada: **#12** (sub-issue de la PADRE **#11**). Sin `project` → sin campo de estado que mover.

### Estado de partida (honesto): parte de -01 ya ejecutada en Paso 5.7 de `/plan-task`

Durante la proyección del plan (antes de arrancar la tarea) ya se hizo parte del Spec de -01:

- **`.claude/task-pipeline.yml`**: bloque `features.github-tracking` añadido (`enabled: true`,
  `repo: drossan/claude-plugins`, `project:` comentado, `issue-type-plan` comentado). ✅ Verificado por Read.
- **Label `plan`**: creada en `drossan/claude-plugins` (`gh label create … --force`). ✅ Verificada: la
  issue PADRE #11 la lleva.

### 2026-07-23 — Project v2 cableado

- El owner creó el **Project #2** (`github.com/users/drossan/projects/2`) — la cuenta gh `danielrosse`
  (colaborador) NO puede crear projects de `drossan` (`createProjectV2`: permission denied), ni resolvía el
  #2 hasta que el owner le dio acceso **Write** al Project.
- Con acceso: **7 issues añadidas** al tablero (#11-17); verificado `item-list` = 7 items.
- **`project: 2`** cableado en `.claude/task-pipeline.yml` con la salvedad de acceso (las ops de tablero
  requieren identidad gh con acceso al Project; `danielrosse` ya lo tiene tras el grant).

### Pendiente de -01 en esta sesión

- Redactar el **runbook** de setup manual del owner (scope Projects, crear Project v2, wiring `project:`,
  encender Pages, footgun `base`).
- Verificar que el **template del plugin** (`skills/plan-task/templates/task-pipeline.yml`) sigue con
  github-tracking off/comentado (no imponer coste a repos consumidores).
- Gates de cierre: `fact-checker` (no-negociable). TDD/mutation = N/A (`stack: none`).

## 2026-07-23 — Cierre

**Resumen**: github-tracking activado end-to-end en el repo. Entregado: bloque `github-tracking`
(`enabled/repo/project: 2`) en el YAML; label `plan`; runbook `.claude/specs/task-pipeline/github-tracking-runbook.md`;
proyección del plan (padre #11 + subs #12-17) y Project #2 poblado con 7 items.

**Decisiones técnicas + porqué**:
- `repo` explícito en el YAML porque la identidad gh (`danielrosse`) ≠ owner (`drossan`) → sin él,
  `gh repo view` podría resolver mal.
- `project: 2` cableado con salvedad de acceso: `danielrosse` no podía crear ni resolver el Project de
  `drossan`; el owner lo creó y dio acceso Write → ops de tablero habilitadas.
- Template del plugin NO tocado (verificado): la feature es opt-in; no se impone a repos consumidores.

**Verificación** (stack:none → sin runner): `fact-checker` (subagente fresco) = **7/7 VERIFICADO**
(YAML, label, issues #11-17 + vínculo sub_issues, `issue:` en los 7 `.md`, Project #2 = 7 items, template
comentado, runbook existe). Sin INCORRECTO ni NO VERIFICABLE.

**Docs actualizadas**: `.claude/task-pipeline.yml` (bloque feature), runbook (nuevo), este session log,
sección "Proyección a GitHub" del plan. TSDoc = N/A (no hay código).

**Ficheros**: `.claude/task-pipeline.yml`, `.claude/specs/task-pipeline/github-tracking-runbook.md`,
plan + 6 tareas (frontmatter `issue:`), este log. **Commit**: pendiente (lo decide el owner).

**Proyección de estado al cerrar**: issue **#12 cerrada** (best-effort); Project #2 item → Done si el
campo Status existe.

**Tiempo real**: ~1h (parte solapada con la proyección del plan). **Follow-ups**: encender Pages y (si se
quiere) el campo Status del Project quedan en el runbook / tareas posteriores.
