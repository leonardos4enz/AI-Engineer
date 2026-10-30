# ⭐ DocuAgent

**Qué es:** un asistente que responde preguntas sobre los documentos de una empresa (políticas, manuales, contratos) **con citas a la fuente**, respetando qué documentos puede ver cada usuario. Es exactamente el tipo de sistema que Nexaminds entrega a clientes ("copilots, document-processing tools").

**Corpus sugerido:** documentos públicos reales, para que sea útil y demostrable. Por ejemplo, reglamentos de la LFT, guías del SAT o la documentación técnica de alguna herramienta open source. Elige uno el día 1.

## Stack
Python 3.12 · uv · LangChain (`create_agent`) · LangGraph · Postgres + pgvector · LangSmith (tracing, evals, deployment, monitoring) · Docker · GitHub Actions

## Roadmap por versiones (sigue el plan de 6 semanas)

### v0.1 · Build (semana 1)
- [ ] Ingesta: cargar documentos → chunking → embeddings → pgvector (con metadata: fuente, página, `access_group`)
- [ ] Tool `search_docs(query, filters)` con filtrado por metadata
- [ ] Agente con `create_agent` + structured output: `{answer, citations[]}`
- [ ] Tracing a LangSmith desde el primer commit
- [ ] Middleware: al menos uno propio (p. ej. ocultar PII en la salida o limitar tool calls)

### v0.2 · Test (semana 3)
- [ ] Dataset golden de 30–50 preguntas con respuestas y fuentes esperadas
- [ ] Evaluadores: con código (¿citó la fuente correcta?) + LLM-as-judge (¿la respuesta está fundamentada?)
- [ ] Alinear el LLM-judge con 15–20 ejemplos que tú calificaste a mano
- [ ] Experimentos comparando 2 configuraciones (modelo, chunk size o prompt)
- [ ] GitHub Actions: correr evals en cada PR y fallar si baja la calidad

### v0.3 · Deploy (semana 4)
- [ ] `langgraph.json` + servidor local con `langgraph dev`
- [ ] Deploy (LangSmith Deployment, o Docker si el plan gratuito no lo permite)
- [ ] Custom auth: autenticación (¿quién eres?) + autorización (solo ves docs de tu `access_group`)
- [ ] Threads para conversaciones multi-turno; secretos fuera del código

### v1.0 · Monitor (semana 5)
- [ ] Threads agrupados con metadata de usuario
- [ ] Feedback 👍/👎 → LangSmith
- [ ] Online evaluators sobre tráfico real
- [ ] Dashboard de costo, latencia y errores + una alerta configurada
- [ ] Post técnico con métricas

## Para explicar en la entrevista
- ¿Por qué ese chunk size? (muéstralo con un experimento)
- ¿Cómo evitas que un usuario vea documentos que no le tocan? (authz + filtros de metadata, no el prompt)
- ¿Cómo sabes que un cambio no rompió nada? (evals en CI)
- ¿Cuánto cuesta cada consulta y cómo lo bajarías?
