# Por qué las reglas de honestidad no son sobre-verificación

> Justificación exigida por la tarea `task-pipeline-opus5-realignment-02`. Existe porque la guía de
> migración a **Opus 5** de Anthropic dice que hay que **borrar** el scaffolding de verificación, y este
> plugin **añade** reglas de evidencia al fichero que se lee cada turno. O el argumento se sostiene, o
> las reglas se retiran. Se escribió **antes** de publicar la sección, no después.

## Qué dice exactamente la guía

Dos afirmaciones distintas, que conviene no mezclar (`claude-api` → `shared/model-migration.md`):

- **`:1066`** — *"Claude Opus 5 verifies its own work without being asked. Instructions that tell it to
  verify (…'use a subagent to verify') now cause over-verification. **Removing them reduces
  over-verification with no capability regression** — this is a delete, not a rewrite."*
- **`:1064`** — *"**Self-check instructions are the same trap.** Beyond harness scaffolding, per-prompt
  re-check phrasing — *'double-check your answer'*, *'re-verify before responding'* — triggers the same
  extra work. Note this **inverts a standard prompting best practice**."*

Lo que ambas describen es lo mismo: **una pasada adicional sobre trabajo ya hecho**. «Vuelve a
comprobar», «re-verifica antes de responder», «añade un paso final de verificación», «usa un subagente
para verificar». El objeto de la instrucción es **el output del propio modelo, ya producido**.

## Eje 1 — Distinción de objeto: re-verificar ≠ no afirmar sin evidencia

Nuestras reglas **no piden ninguna pasada adicional**. Restringen **qué se puede afirmar y qué se puede
hacer la primera vez**:

| La trampa que describe la guía | Lo que hacen estas reglas |
|---|---|
| Actúa **después** de producir el trabajo | Actúan **antes** de producir el trabajo |
| Su objeto es el **output propio** | Su objeto es **la evidencia disponible** |
| **Añade** una pasada | **No añade** pasada: acota una acción o una frase |
| Efecto: más tokens por el mismo resultado | Efecto: menos trabajo (no se implementa sobre un diagnóstico falso) |

El argumento no descansa solo en esta distinción nuestra. **Anthropic publica reglas de evidencia
casi idénticas en el mismo documento**, para Claude Fable 5:

- **`:1456`** — *"Before reporting progress, **audit each claim against a tool result from this
  session**. Only report work you can point to evidence for; if something is not yet verified, say so
  explicitly."* Y `:1454` añade el resultado medido: *"in testing this **nearly eliminated fabricated
  status reports**"*.
- **`:1460`** — *"Before running a command that changes system state… **check that the evidence actually
  supports that specific action. A signal that pattern-matches to a known failure may have a different
  cause.**"*

`:1460` **es** la regla de «no implementes sobre un diagnóstico que no has reproducido», publicada por
Anthropic. Si toda regla de evidencia cayera bajo la trampa, la guía se estaría contradiciendo a sí
misma dentro del mismo fichero. No se contradice: distingue **re-verificación** (borrar) de
**fundamentación en evidencia** (añadir).

> **Salvedad honesta**: `:1456` y `:1460` están publicadas en la sección de **Fable 5**, no en la de
> Opus 5. No afirmamos que Anthropic las prescriba para Opus 5. El peso que soportan aquí es más débil
> y más seguro: demuestran que, en la taxonomía de Anthropic, **una regla de evidencia no es una
> instrucción de auto-verificación**. Además, este fichero se materializa en repos que pueden correr
> cualquier modelo: no es un prompt de Opus 5.

Hay un segundo motivo por el que la trampa no aplica, específico de Opus 5. La guía dice que el modelo
**verifica su propio trabajo** sin que se lo pidan (`:1066`) — por eso sobra decírselo. De ahí **no** se
sigue que se abstenga de **actuar sobre una hipótesis que no ha reproducido**: son comportamientos
distintos, y el segundo es justamente el que motivó este plan.

## Eje 2 — Coste relativo

Estas reglas **no lanzan subagentes ni añaden fases**: son texto dentro de un fichero que ya se carga.
Su coste es el de su propio tamaño, una vez por turno — y por eso la tarea le pone un **techo medible**
(ver abajo), en vez de declararlo gratis.

Enfrente: el bucle que previenen. El caso que motivó el plan fue **un día de trabajo** persiguiendo un
problema inexistente, con cada «arreglo» generando el siguiente. La asimetría es de órdenes de magnitud.

Es el mismo cálculo que hace la guía, con el signo invertido: allí se borra el scaffolding **porque su
coste supera a su beneficio en este modelo**. Aquí se añaden reglas cuyo beneficio supera con holgura su
coste. El criterio es idéntico; lo que cambia es el resultado.

## Veredicto regla a regla

| Regla | ¿Cae bajo la trampa? | Veredicto |
|---|---|---|
| Etiquetar hipótesis vs hecho confirmado | No: acota **cómo se afirma**, no re-revisa nada. Respaldo: `:1456` (*"if something is not yet verified, say so explicitly"*) | **se publica** |
| No implementar sobre un diagnóstico no reproducido | No: acota **una acción antes** de ejecutarla. Respaldo directo: `:1460` | **se publica** |
| Tope de intentos sobre el mismo síntoma | No, y por partida doble: no añade ninguna pasada — **retira** intentos. Es un cortacircuitos, lo contrario de trabajo extra | **se publica** |
| «He revisado X» solo si se leyó en esta sesión | No: prohíbe **una afirmación falsa**. Respaldo casi literal: `:1456` (*"from this session"*) | **se publica** |
| Causa raíz antes que síntoma | No cae bajo la trampa, **pero no se sostiene como regla aparte**: sin «reprodúcelo primero» no es verificable (¿quién decide qué es «la raíz»?), y con él es redundante | **absorbida** en la regla del diagnóstico, como su última frase: *«arregla la causa que reprodujiste, no el síntoma que viste»* |

**Ninguna regla se retira por fallar la defensa.** La quinta se **absorbe** en la segunda por una razón
distinta —no era verificable por separado y duplicaba a la anterior—, que es la disciplina de admisión
del propio fichero: no acretar reglas vagas en un documento que se lee cada turno.

## Techo de tamaño del fichero

`honesty-rules.md` se inyecta **en cada turno de cada sesión** de cada repo adoptado. Sin un número, la
prosa crece hasta que alguien se asusta.

- **Techo declarado: 7 000 bytes** del fichero materializado (`wc -c`), equivalentes a ~110 líneas.
- **Trazabilidad**: 1 698 B antes de este plan → 5 097 B tras la tarea 01 → ver el estado actual con
  `wc -c .claude/honesty-rules.md`.
- El número es un **juicio**, elegido para que **ate**: deja a la tarea 02 menos de 2 000 B, así que
  obliga a redactar corto en vez de premiar la extensión. Superarlo **no** es motivo para subir el
  techo: es motivo para recortar, o para mover la regla a un coding-standard.
- Es **verificable byte a byte**, que es la única forma de que un techo signifique algo.
