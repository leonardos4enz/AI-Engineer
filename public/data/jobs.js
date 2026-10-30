/* Vacantes objetivo.
   reqs[].status = cómo estás hoy: "ok" (lo tienes) · "partial" (algo) · "gap" (falta).
   reqs[].tasks  = tareas que lo cubren; al terminarlas todas pasa a cubierto
                   (o solo a "partial" si cover: "part", porque el plan no lo cubre completo).
   reqs[].refs   = dónde se cubre: {track, week} o {project}. */
window.JOBS = [
  {
    id: "nexaminds-lcde",
    title: "LangChain Deployment AI Engineer",
    company: "Nexaminds",
    location: "Remoto · México",
    type: "Tiempo completo",
    url: "https://remotive.com/remote/jobs/artificial-intelligence/lang-chain-deployment-ai-engineer-5647177",
    note: "Solo para personas que viven en México. Pide el referral a Raúl antes de aplicar.",
    summary: "Llevar arquitecturas de LangChain a producción: copilotos, procesamiento de documentos, workflows en LangGraph, RAG con control de acceso, deploys, tracing y evals en LangSmith, seguridad y costo.",
    reqs: [
      {text: "SWE profesional en Python o JS/TS (APIs, async, testing)", status: "ok",
        how: "3–4 años full stack. Los proyectos van en Python con tests.", tasks: [], refs: [{project: "docuagent"}]},
      {text: "Agentes en producción con LangChain y LangGraph", status: "gap",
        how: "Semanas 1 y 2, y DocuAgent.", tasks: ["c1", "lg", "c2", "p1-agent"], refs: [{track: "lcae", week: 1}, {track: "lcae", week: 2}, {project: "docuagent"}]},
      {text: "APIs de LLM comerciales (OpenAI, Anthropic, Google)", status: "partial",
        how: "Hoy con n8n. Se usa a fondo en DocuAgent y Job Hunter.", tasks: ["setup-llm", "p1-agent", "p2-base"], refs: [{project: "docuagent"}, {project: "job-hunter"}]},
      {text: "RAG: chunking, embeddings, búsqueda, filtros y citas", status: "gap",
        how: "DocuAgent v0.1.", tasks: ["p1-ingest", "p1-agent"], refs: [{track: "lcae", week: 1}, {project: "docuagent"}]},
      {text: "Al menos una base vectorial (pgvector, Pinecone…)", status: "gap",
        how: "pgvector en DocuAgent.", tasks: ["p1-ingest"], refs: [{project: "docuagent"}]},
      {text: "Docker y Kubernetes", status: "partial", cover: "part",
        how: "Docker en la semana 4. Kubernetes básico después, opcional.", tasks: ["setup-tools", "p1-dep"], refs: [{track: "lcae", week: 4}]},
      {text: "Una nube (AWS, Azure o GCP)", status: "gap",
        how: "Después del examen: desplegar DocuAgent en una nube.", tasks: [], refs: []},
      {text: "De POC a producción: CI/CD y monitoreo", status: "partial",
        how: "Evals en GitHub Actions (semana 3) y monitoreo (semana 5).", tasks: ["p1-ci", "p1-oe", "p1-dash"], refs: [{track: "lcae", week: 3}, {track: "lcae", week: 5}]},
      {text: "LangSmith: tracing y evals", status: "gap",
        how: "Semanas 3 y 5.", tasks: ["c3", "p1-ev", "c5", "p1-oe"], refs: [{track: "lcae", week: 3}, {track: "lcae", week: 5}]},
      {text: "Agent Development Lifecycle", status: "gap",
        how: "Es justo lo que cubre la certificación.", tasks: ["exam"], refs: [{track: "lcae", week: 6}]},
      {text: "Seguridad: IAM, secretos, PII, prompt injection", status: "partial",
        how: "Custom auth y secretos (semana 4). Guardrail de PII con middleware.", tasks: ["p1-mw", "p1-auth", "p1-th"], refs: [{track: "lcae", week: 4}, {project: "docuagent"}]},
      {text: "Comunicación con clientes y escritura técnica", status: "ok",
        how: "READMEs y posts técnicos de cada proyecto.", tasks: [], refs: [{track: "lcae", week: 5}]},
    ],
    niceToHave: ["Deep Agents", "Fleet", "Multi-agente", "Human-in-the-loop", "OpenTelemetry", "Terraform", "Helm"],
  },
];
