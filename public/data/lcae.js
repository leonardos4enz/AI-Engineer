/* Ruta: Certificación LCAE (LangChain Certified Agent Engineer).
   Los ids de tareas se guardan en la base (tabla lcae_done): no cambiarlos.
   weeks[].tasks: [id, texto, tipo?]
   courses / extra: [idHecho, slug, nombre, dominio, lecciones, cuándo, por qué] (slug se une a `acad`)
   links: [texto, url] */
window.TRACK_LCAE = {
  id: "lcae",
  name: "Certificación LCAE",
  short: "LCAE",
  color: "accent",
  examDate: "2026-12-11",
  planLabel: "30 oct – 13 dic",
  planTitle: "Plan de 6 semanas",
  acad: "https://academy.langchain.com/courses/",
  coursesLabel: "LangChain Academy",
  coursesSub: "La ruta para el examen, en orden. Cada curso abre en otra pestaña.",
  extraTitle: "Para la vacante",
  domains: [["build","Build"],["test","Test"],["deploy","Deploy"],["monitor","Monitor"]],
  labels: {setup:"Preparación",build:"Build",test:"Test",deploy:"Deploy",monitor:"Monitor"},
  // Solo las rutas con `exam` muestran la pestaña Exámenes (los puntajes viven en lcae_scores).
  exam: {
    label: "Practice exams",
    sub: "40 preguntas, 10 por sección. Apruebas con 28.",
    per: 10, total: 40, pass: 28,
    practice: "https://academy.langchain.com/courses/lcae-practice-exam",
  },
  weeks: [
    {id:"w0", name:"Arranque", dom:"setup", from:"2026-10-30", to:"2026-11-01", tasks:[
      ["setup-tools","Python 3.12, uv, Git, Docker"],["setup-ls","Cuenta y API key de LangSmith"],
      ["setup-llm","API key de LLM con límite de US$20"],["enroll","Inscribirme a los 5 cursos"],
      ["diag","Practice exam diagnóstico","examen"]]},
    {id:"w1", name:"LangChain y create_agent", dom:"build", from:"2026-11-02", to:"2026-11-08", tasks:[
      ["c1","Curso: Introduction to LangChain","curso"],["lg","Bases de LangGraph","extra"],
      ["p1-ingest","DocuAgent: ingesta a pgvector","proyecto"],["p1-agent","DocuAgent: agente con citas","proyecto"],
      ["p1-mw","Middleware propio","proyecto"],["n1","Notas de Build","notas"]]},
    {id:"w2", name:"Deep Agents", dom:"build", from:"2026-11-09", to:"2026-11-15", tasks:[
      ["c2","Curso: Introduction to Deep Agents","curso"],["p2-base","Job Hunter: deep agent con subagente","proyecto"],
      ["p2-md","AGENTS.md y SKILL.md","proyecto"],["p2-try","Probarlo con la vacante de Nexaminds","proyecto"],
      ["n2","Nota: create_agent vs deepagents","notas"]]},
    {id:"w3", name:"Evals con LangSmith", dom:"test", from:"2026-11-16", to:"2026-11-22", tasks:[
      ["c3","Curso: Building Reliable Agents","curso"],["p1-ds","Dataset golden de 30 a 50 preguntas","proyecto"],
      ["p1-ev","Evaluadores: código y LLM-judge","proyecto"],["p1-align","Alinear el LLM-judge","proyecto"],
      ["p1-exp","Comparar 2 experimentos","proyecto"],["p1-ci","Evals en GitHub Actions","proyecto"]]},
    {id:"w4", name:"LangSmith Deployment", dom:"deploy", from:"2026-11-23", to:"2026-11-29", tasks:[
      ["c4","Curso: Introduction to LangSmith Deployment","curso"],["p1-lg","langgraph.json y langgraph dev","proyecto"],
      ["p1-dep","Desplegar DocuAgent","proyecto"],["p1-auth","Custom auth y authz por usuario","proyecto"],
      ["p1-th","Threads y secretos","proyecto"],["msg-raul","Mandarle avance a Raúl","vacante"]]},
    {id:"w5", name:"Monitoreo en producción", dom:"monitor", from:"2026-11-30", to:"2026-12-06", tasks:[
      ["c5","Curso: Monitoring Production Agents","curso"],["p1-fb","Feedback de usuario","proyecto"],
      ["p1-oe","Online evals","proyecto"],["p1-dash","Dashboard y una alerta","proyecto"],
      ["post","Post técnico con métricas","portafolio"],["sched","Agendar el examen","examen"]]},
    {id:"w6", name:"Repaso y examen", dom:"setup", from:"2026-12-07", to:"2026-12-13", tasks:[
      ["pe2","Practice exam con 34/40 o más","examen"],["sim","Simulacro de 2 h sin IA","examen"],
      ["exam","Presentar LCAE","examen"],["cv","CV actualizado y pedir referral","vacante"]]},
  ],
  // Detalle opcional por tarea: una línea de contexto y botones de enlace.
  details: {
    "setup-tools": {d:"Ya verificado en tu compu: uv 0.13.6, Python 3.12.16, Git 2.49 y Docker."},
    "setup-ls": {d:"Crea un Personal Access Token y pégalo en tu .env como LANGSMITH_API_KEY.",
      l:[["Abrir LangSmith","https://smith.langchain.com"]]},
    "setup-llm": {d:"Una llave de OpenAI o Anthropic, con un límite de gasto mensual.",
      l:[["OpenAI","https://platform.openai.com/api-keys"],["Anthropic","https://console.anthropic.com/settings/keys"]]},
    "enroll": {d:"Son gratis: LangChain, Deep Agents, Reliable Agents, Deployment y Monitoring. Con el bundle te inscribes a los 5 de una vez.",
      l:[["Inscribirme al bundle","https://academy.langchain.com/bundles/lcae-prerequisite-courses"]]},
    "diag": {d:"Hazlo sin estudiar y registra el puntaje en Exámenes.",
      l:[["Abrir practice exam","https://academy.langchain.com/courses/lcae-practice-exam"]]},
    "c1": {d:"30 lecciones: create_agent, tools, middleware.", l:[["Abrir curso","https://academy.langchain.com/courses/foundation-introduction-to-langchain-python"]]},
    "lg": {d:"La vacante lo pide. Con State, Nodes, Edges y Memory basta por ahora.", l:[["Abrir curso","https://academy.langchain.com/courses/intro-to-langgraph"]]},
    "c2": {d:"46 lecciones: deepagents, AGENTS.md, SKILL.md, sandbox.", l:[["Abrir curso","https://academy.langchain.com/courses/foundation-introduction-to-deepagents"]]},
    "c3": {d:"29 lecciones: datasets, evaluadores, experimentos.", l:[["Abrir curso","https://academy.langchain.com/courses/building-reliable-agents"]]},
    "c4": {d:"37 lecciones: deployments, threads, auth.", l:[["Abrir curso","https://academy.langchain.com/courses/langsmith-deployment"]]},
    "c5": {d:"37 lecciones: traces, costos, alertas.", l:[["Abrir curso","https://academy.langchain.com/courses/production-monitoring"]]},
    "sched": {d:"US$99 con un reintento gratis. Agéndalo para la semana 6.", l:[["Agendar en Talview","https://cx-v2.talview.com/login?driveScheduleId=114879&tid=3916&from=/scheduling/drive-registration"]]},
    "pe2": {d:"Meta: 34/40 para ir con margen.", l:[["Abrir practice exam","https://academy.langchain.com/courses/lcae-practice-exam"]]},
    "sim": {d:"2 horas, solo docs.langchain.com, LangSmith y Academy. Sin Google ni IA.", l:[["docs.langchain.com","https://docs.langchain.com"]]},
    "exam": {d:"Conéctate 15 min antes, con INE y celular como segunda cámara.", l:[["Guía del examen","https://academy.langchain.com/pages/certifications-lcae"]]},
  },
  courses: [
    ["diag","lcae-practice-exam","LCAE Practice Exam (diagnóstico)","setup",5,"Sem 0","Para ver de dónde partes"],
    ["c1","foundation-introduction-to-langchain-python","Introduction to LangChain – Python","build",30,"Sem 1","create_agent, tools, middleware"],
    ["c2","foundation-introduction-to-deepagents","Introduction to Deep Agents","build",46,"Sem 2","deepagents, AGENTS.md, SKILL.md, sandbox"],
    ["c3","building-reliable-agents","Building Reliable Agents with LangSmith","test",29,"Sem 3","Datasets, evaluadores, experimentos"],
    ["c4","langsmith-deployment","Introduction to LangSmith Deployment","deploy",37,"Sem 4","Deployments, threads, auth"],
    ["c5","production-monitoring","Monitoring Production Agents","monitor",37,"Sem 5","Traces, costos, alertas"],
    ["pe2","lcae-practice-exam","LCAE Practice Exam (final)","setup",5,"Sem 6","Meta: 34/40 o más"],
  ],
  extra: [
    ["lg","intro-to-langgraph","Introduction to LangGraph – Python","build",55,"Sem 1–2","La vacante lo pide explícitamente"],
    ["x-engine","langsmith-engine","Autonomous Agent Improvement with LangSmith Engine","test",12,"Sem 6","Repaso del ciclo completo"],
    ["x-research","deep-research-with-langgraph","Project: Deep Research with LangGraph","build",null,"Después","Multi-agente, para el portafolio"],
    ["x-ambient","ambient-agents","Project: Ambient Agents with LangGraph","build",null,"Después","Human-in-the-loop y evals"],
    ["x-fleet","quickstart-agent-builder","LangSmith Fleet","deploy",null,"Después","Nice-to-have de la vacante"],
  ],
  links: [
    ["Cursos (bundle gratis)","https://academy.langchain.com/bundles/lcae-prerequisite-courses"],
    ["Practice exam","https://academy.langchain.com/courses/lcae-practice-exam"],
    ["docs.langchain.com","https://docs.langchain.com"],
    ["LangSmith","https://smith.langchain.com"],
    ["Página de la certificación","https://academy.langchain.com/pages/certifications-lcae"],
    ["Agendar examen (Talview)","https://cx-v2.talview.com/login?driveScheduleId=114879&tid=3916&from=/scheduling/drive-registration"],
    ["Repo AI-Engineer","https://github.com/leonardos4enz/AI-Engineer"],
    ["Vacante Nexaminds","https://remotive.com/remote/jobs/artificial-intelligence/lang-chain-deployment-ai-engineer-5647177"],
  ],
};
