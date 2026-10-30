# Job Hunter Deep Agent

**Qué es:** un deep agent al que le das tu CV y una lista de vacantes. Investiga cada vacante, compara requisitos vs. tu experiencia y genera un **reporte de gaps + plan de estudio priorizado**. Te sirve hoy mismo para tu búsqueda, y la vacante de Nexaminds es el primer caso de prueba.

## Stack
`deepagents` · LangSmith tracing · (opcional) sandbox para ejecutar código

## Qué conceptos del examen practica
- **`deepagents` vs `create_agent`:** escribe en el README por qué aquí conviene un deep agent
- **Planning:** el agente arma su lista de tareas (una por vacante)
- **Subagentes:** `job-analyzer` (extrae requisitos), `cv-matcher` (compara), `planner` (plan de estudio). Contexto aislado por subagente
- **Filesystem / context engineering:** guarda resultados intermedios en archivos en vez de llenar el contexto
- **`AGENTS.md`:** instrucciones persistentes (tu perfil, tus preferencias: remoto, México)
- **`SKILL.md`:** una skill, p. ej. "cómo evaluar un requisito técnico", que el agente carga solo cuando la necesita
- **Sandboxing:** si el agente genera o ejecuta código (p. ej. un script para scrapear), que corra en sandbox
- **Human-in-the-loop:** pedir tu aprobación antes de guardar el plan final

## Checklist v0.1 (semana 2)
- [ ] Deep agent básico con 1 subagente
- [ ] `AGENTS.md` con tu perfil
- [ ] 1 `SKILL.md`
- [ ] Probarlo con la vacante de Nexaminds ([../../06-vacante/nexaminds.md](../../06-vacante/nexaminds.md))
- [ ] README con un trace de LangSmith
