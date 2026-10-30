# AI Engineer: camino a LCAE + Nexaminds

**Objetivo:** aprobar la **LangChain Certified Agent Engineer (LCAE)** y aplicar con referral de Raúl a **Nexaminds** (LangChain Deployment AI Engineer, remoto, México).

**Fecha de inicio:** 2026-10-30 · **Meta:** examen en ~6 semanas (mediados de diciembre 2026)

## Mapa del proyecto

| Carpeta | Qué hay |
|---|---|
| [01-certificacion](01-certificacion/examen-lcae.md) | Todo sobre el examen: formato, reglas, temas, guía oficial (PDF) |
| [02-plan](02-plan/plan-6-semanas.md) | Plan acelerado semana a semana + [tracker de progreso](02-plan/progreso.md) |
| [03-recursos](03-recursos/links.md) | Links: cursos, docs, herramientas, extras |
| [04-notas](04-notas/) | Tus notas de estudio por dominio (Build / Test / Deploy / Monitor) |
| [05-proyectos](05-proyectos/README.md) | Proyectos de portafolio (especificaciones y código) |
| [06-vacante](06-vacante/nexaminds.md) | La vacante, el análisis de gaps y el contexto de Raúl |

## Tablero web

`public/index.html` + `server/` (Node + Express + Postgres). Contrato de la API: [CONTRACT.md](CONTRACT.md).

**Local:** `npm install` y luego `npm start` → http://localhost:3000. Sin `DATABASE_URL` guarda en memoria.

**Easypanel** (proyecto `discord`):
1. Servicio *App* `ai-engineer` → fuente GitHub `leonardos4enz/AI-Engineer`, rama `main`, build **Dockerfile**.
2. Environment:
   ```
   DATABASE_URL=<Internal Connection URL de amigatos-db, cambiando el nombre de la base al final por ai_engineer>
   ADMIN_PASSWORD=<tu contraseña>
   JWT_SECRET=<cadena larga aleatoria>
   API_TOKEN=<opcional, para actualizar por API>
   ```
   ⚠️ En el editor de Easypanel `#` inicia un comentario: si un valor lleva `#`, ponlo entre comillas (`ADMIN_PASSWORD="..."`). Al arrancar, el log muestra cuántos caracteres tiene la contraseña para que lo compruebes.

   La base `ai_engineer` se crea sola al arrancar y solo usa tablas `lcae_*`. No toca las de Amigatos.
3. Domains → puerto **80**. Deploy y comprueba `/health` → `ok`.

## Hoy: primeros pasos

1. Inscríbete en los 5 cursos gratuitos (bundle): https://academy.langchain.com/bundles/lcae-prerequisite-courses
2. Crea tu cuenta en LangSmith: https://smith.langchain.com
3. Haz el **practice exam** como diagnóstico, sin estudiar, para ver tu punto de partida: https://academy.langchain.com/courses/lcae-practice-exam
4. Anota el resultado en [progreso.md](02-plan/progreso.md)
5. Arranca la Semana 1 del [plan](02-plan/plan-6-semanas.md)

## Regla de oro

> Consejo de un AI engineer: "enfócate en proyectos que apliquen los conceptos principales, context engineering, deployments con observabilidad en trazas, buena metodología de evals y sobretodo que tengan algo de útil".

Cada semana = **estudiar el curso + aplicarlo al proyecto principal**. Nada de solo ver tutoriales.
