# Plan acelerado: 6 semanas (tiempo completo)

**Ritmo sugerido (lun–sáb, ~7 h/día):**
- 🌅 Bloque 1 (2.5 h): **curso** de Academy + notas en `04-notas/`
- 🛠️ Bloque 2 (3 h): **proyecto**, aplicando lo del día
- 🔁 Bloque 3 (1.5 h): **repaso activo**. Responde sin ver las preguntas de tus notas y busca en docs.langchain.com como si fuera el examen
- Domingo: descanso + revisión semanal en [progreso.md](progreso.md)

La secuencia sigue el **Agent Development Lifecycle**: Build → Test → Deploy → Monitor. Así cada semana el proyecto principal ([DocuAgent](../05-proyectos/p1-docuagent/README.md)) suma una capa nueva.

---

## Semana 0 · Arranque (vie 30 oct – dom 1 nov)
- [ ] Python 3.12+, `uv`, VS Code, Git, Docker Desktop
- [ ] Cuenta de GitHub lista (repo público para el portafolio)
- [ ] Cuenta de LangSmith + API key
- [ ] API key de un proveedor de LLM (OpenAI o Anthropic). Pon un límite de gasto de ~US$20/mes
- [ ] Inscribirte en el bundle de los 5 cursos
- [ ] **Practice exam diagnóstico.** Anota tu puntaje por sección
- [ ] Leer la guía oficial completa ([examen-lcae.md](../01-certificacion/examen-lcae.md))

## Semana 1 · BUILD I: LangChain + `create_agent` (2–8 nov)
- Curso: **Introduction to LangChain – Python**
- Conceptos: modelos, mensajes, tools, `create_agent`, structured output, memoria/short-term state, streaming, **middleware**
- Extra para la vacante: bases de **LangGraph** (state, nodes, edges, checkpointer), porque la vacante lo pide explícitamente
- Proyecto: **DocuAgent v0.1**. Ingesta de documentos + RAG con pgvector + agente con `create_agent` que responde **con citas**. Tracing a LangSmith activado desde el día 1
- ✅ Entregable: repo en GitHub con README y demo funcionando en local

## Semana 2 · BUILD II: Deep Agents + context engineering (9–15 nov)
- Curso: **Introduction to Deep Agents**
- Conceptos: `deepagents` vs `create_agent` (cuándo usar cada uno), planning/todos, filesystem virtual, subagentes, `AGENTS.md`, `SKILL.md`, **sandboxing**, context engineering para agentes largos (resumir, offload a archivos, aislar contexto en subagentes)
- Proyecto: **Job Hunter Deep Agent** ([p2](../05-proyectos/p2-job-hunter-deepagent/README.md)). Deep agent con subagentes que analiza vacantes vs. tu CV y te arma un plan de estudio. Te sirve a ti mismo
- ✅ Entregable: p2 v0.1 + nota "create_agent vs deepagents" escrita con tus palabras

## Semana 3 · TEST: evals con LangSmith (16–22 nov)
- Curso: **Building Reliable Agents with LangSmith**
- Conceptos: datasets, agregar ejemplos (desde traces, a mano, sintéticos), evaluadores con código vs LLM-as-judge, offline vs online, experimentos, comparar experimentos, **evaluator alignment**, no sobreajustarse al ruido
- Proyecto: DocuAgent v0.2. Dataset de 30–50 preguntas "golden" + evaluadores (correctness, groundedness/citas, tool-call correcto) + **CI en GitHub Actions** que corre las evals en cada PR (gate de regresión)
- ✅ Entregable: tabla de experimentos en el README (antes/después de un cambio de prompt o modelo)

## Semana 4 · DEPLOY: LangSmith Deployment (23–29 nov)
- Curso: **Introduction to LangSmith Deployment**
- Conceptos: `graph` / `deployment` / `revision` / `assistant` / `thread` / `run`, `langgraph.json`, servidor local (`langgraph dev`), secretos, **authn vs authz** (custom auth), multi-región, durabilidad del storage (checkpoints, store)
- Proyecto: DocuAgent v0.3. Desplegado (LangSmith Deployment o, si el plan gratuito no alcanza, `langgraph dev` + Docker), con **custom auth** y acceso por usuario a los documentos (authz)
- ✅ Entregable: URL o demo en video de 2 min + diagrama de arquitectura
- ⚠️ Revisa qué incluye el plan gratuito de LangSmith para Deployment antes de pagar algo

## Semana 5 · MONITOR: producción (30 nov – 6 dic)
- Curso: **Monitoring Production Agents**
- Conceptos: leer traces, agrupar en **threads**, costos/tokens por run, feedback y sentimiento del usuario, **Online Evals vs Insights**, dashboards, **alertas**
- Proyecto: DocuAgent v1.0. Online evaluators, dashboard de costo/latencia, alerta (p. ej. error rate o feedback negativo), botón 👍/👎 que manda feedback a LangSmith
- ✅ Entregable: post técnico (LinkedIn/X) con métricas reales: costo por consulta, latencia, % de aciertos
- 📅 **Agenda el examen** para la semana 6

## Semana 6 · Repaso + examen + aplicación (7–13 dic)
- [ ] Practice exam #2. Meta: ≥ 34/40 para ir con margen
- [ ] Repasar las secciones débiles (notas + docs)
- [ ] Simulacro: 2 h, sin Google ni IA, solo docs + LangSmith
- [ ] **Examen LCAE**
- [ ] CV actualizado (proyectos + certificación) → mandárselo a Raúl para el **referral**

---

### Si vas más rápido o más lento
- **Más rápido:** junta las semanas 1–2 y agenda el examen en la semana 5. El proyecto se puede terminar después del examen
- **Más lento:** no muevas el orden, solo estira cada semana. El reintento gratis te da colchón, pero no lo planees como estrategia
