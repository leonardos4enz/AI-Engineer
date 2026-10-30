# Proyectos de portafolio

Son dos proyectos, no diez. Uno principal que crece cada semana siguiendo el ADLC, y uno secundario para Deep Agents.

| | Proyecto | Cubre del examen | Cubre de la vacante |
|---|---|---|---|
| ⭐ | [DocuAgent](p1-docuagent/README.md): asistente sobre documentos empresariales con RAG, citas y control de acceso | Build, Test, Deploy, Monitor | RAG, pgvector, LangGraph, CI/CD, evals, LangSmith, auth, Docker |
| 2 | [Job Hunter Deep Agent](p2-job-hunter-deepagent/README.md): analiza vacantes vs tu CV y arma un plan | Build (deepagents, AGENTS.md, SKILL.md, sandbox, subagentes) | Deep Agents, multi-agente, HITL |

## Reglas para que cuenten en una entrevista
1. **README que lo explique como a un cliente:** problema → arquitectura (diagrama) → decisiones y trade-offs → métricas
2. **Números reales:** % de aciertos en evals, costo por consulta, latencia p50/p95
3. **Evals en CI:** que se vea que un cambio que empeora la calidad no pasa
4. **Traces públicos:** comparte un trace de LangSmith en el README
5. **Commits pequeños y frecuentes:** el historial también se lee

## Ideas para después del examen
- Supervisor multi-agente en LangGraph con human-in-the-loop (aprobación antes de una acción)
- Servidor MCP propio que use DocuAgent como herramienta
- DocuAgent desplegado en AWS/GCP con Docker + Terraform (cubre la parte de nube de la vacante)
