/* Proyectos de portafolio. El progreso sale de las mismas tareas de las rutas:
   cada hito lista ids de tareas existentes (p. ej. de data/lcae.js).
   status: null = se calcula del progreso; o un texto fijo ("En pausa"). */
window.PROJECTS = [
  {
    id: "docuagent",
    name: "DocuAgent",
    role: "Proyecto principal",
    pitch: "Asistente que responde sobre los documentos de una empresa, con citas a la fuente y control de acceso por usuario.",
    stack: ["Python 3.12", "LangChain", "LangGraph", "pgvector", "LangSmith", "Docker", "GitHub Actions"],
    status: null,
    repo: null,
    milestones: [
      {name: "v0.1 · Build",   dom: "build",   when: "Semana 1", tasks: ["p1-ingest", "p1-agent", "p1-mw"]},
      {name: "v0.2 · Test",    dom: "test",    when: "Semana 3", tasks: ["p1-ds", "p1-ev", "p1-align", "p1-exp", "p1-ci"]},
      {name: "v0.3 · Deploy",  dom: "deploy",  when: "Semana 4", tasks: ["p1-lg", "p1-dep", "p1-auth", "p1-th"]},
      {name: "v1.0 · Monitor", dom: "monitor", when: "Semana 5", tasks: ["p1-fb", "p1-oe", "p1-dash", "post"]},
    ],
  },
  {
    id: "job-hunter",
    name: "Job Hunter Deep Agent",
    role: "Proyecto secundario",
    pitch: "Deep agent que compara vacantes contra tu CV y arma un reporte de brechas con un plan de estudio.",
    stack: ["deepagents", "Subagentes", "AGENTS.md", "SKILL.md", "LangSmith"],
    status: null,
    repo: null,
    milestones: [
      {name: "v0.1 · Deep agent", dom: "build", when: "Semana 2", tasks: ["p2-base", "p2-md", "p2-try"]},
    ],
  },
];
