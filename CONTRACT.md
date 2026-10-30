# Contrato del tablero (frontend ↔ backend)

App de un solo usuario (Leo). Todo requiere sesión salvo `/login`, `/api/login`, `/api/me`, `/health` y los assets estáticos.

## Páginas

| Ruta | Comportamiento |
|---|---|
| `/login` | Sirve `public/login.html`. Con sesión válida → 302 a `/` |
| `/` (y `/index.html`) | Sirve `public/index.html` con sesión válida; sin sesión → 302 a `/login` |
| Otros archivos de `public/` | Estáticos y públicos (`theme.css`, etc.) |

Flujo: el login hace `POST /api/login` y, con 200, navega a `/`. El logout hace `POST /api/logout` y navega a `/login`. Si cualquier llamada de la API responde 401, el tablero navega a `/login`.

Stack: Node 22 + Express + PostgreSQL (`pg`) + `jsonwebtoken`. Frontend vanilla sin build en `public/index.html`, servido estático por Express.

## Frontend: estructura del hub

La app es **AI Engineer**, el espacio de Leo para todo lo de su camino a AI Engineer. La certificación LCAE es la primera **ruta**; vendrán más.

```
public/
  index.html          shell del hub (con sesión)
  login.html          login (público)
  theme.css           tokens y componentes compartidos
  favicon.svg         el agente, estático
  js/mascot.js        <agent-eyes>, el agente animado
  data/tracks.js      registro de rutas: window.TRACKS = [lcae, …]
  data/lcae.js        datos de la ruta LCAE (semanas, cursos, extras, fecha de examen, links)
  data/projects.js    window.PROJECTS: proyectos de portafolio
  data/jobs.js        window.JOBS: vacantes objetivo
```

Navegación por hash: `#inicio`, `#ruta/lcae/resumen|plan|cursos|examenes`, `#proyectos`, `#vacantes`.

Los ids de tareas son globales (una sola tabla `lcae_done`). Una ruta nueva debe usar ids con su propio prefijo (`ml-…`, `aws-…`) para no chocar.

### `<agent-eyes>` (js/mascot.js)

Custom element con Shadow DOM, sin dependencias. Cargar con `<script src="/js/mascot.js" defer></script>`.

| Atributo | Valores | Default |
|---|---|---|
| `size` | píxeles del lado | `40` |
| `face` | presente = dibuja la cara (squircle) detrás de los ojos | ausente |
| `follow` | presente = los ojos siguen el puntero en toda la página | ausente |
| `mood` | `idle` · `happy` · `sad` · `shy` · `focus` · `sleep` | `idle` |

- `idle`: mira alrededor con movimientos rápidos y pausas (sacádicos) y parpadea a intervalos aleatorios (2–6 s, a veces doble).
- `happy`: ojos en arco (^ ^) con un pequeño rebote. `sad`: ojos caídos. `shy`: ojos cerrados o mirando a otro lado (para cuando se escribe la contraseña). `focus`: pupilas más chicas, mirando a un punto. `sleep`: líneas cerradas con respiración lenta.
- Métodos: `blink()`, `react(mood, ms = 1200)` (cambia de ánimo un rato y vuelve al anterior), `lookAt(x, y)` en coordenadas de la página, o `lookAt(null)` para volver a idle o follow.
- Colores: `--agent-face` (default `var(--accent)`) y `--agent-eye` (default `var(--on-accent)`; sin `face` usa `var(--fg)`).
- Con `prefers-reduced-motion`: sin sacádicos, sin seguir el puntero, sin rebotes; solo parpadeo suave.

## Variables de entorno

| Variable | Uso |
|---|---|
| `PORT` | Puerto (Dockerfile fija 80; local 3000) |
| `DATABASE_URL` | Postgres. Sin ella, almacenamiento en memoria |
| `ADMIN_PASSWORD` | Contraseña para iniciar sesión. Sin ella, el login está deshabilitado (solo lectura) |
| `JWT_SECRET` | Firma de la cookie de sesión. Obligatoria si hay `ADMIN_PASSWORD` |
| `API_TOKEN` | Opcional. Permite escribir con `Authorization: Bearer <API_TOKEN>` (para scripts / Claude) |

Si la base de `DATABASE_URL` no existe (error `3D000`), el server se conecta a la base `postgres` del mismo servidor y ejecuta `CREATE DATABASE`, luego reintenta. Solo crea tablas con prefijo `lcae_`; nunca toca otras.

## Tablas

```sql
CREATE TABLE IF NOT EXISTS lcae_done (task_id TEXT PRIMARY KEY, done_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS lcae_scores (
  id SERIAL PRIMARY KEY, taken_on DATE NOT NULL DEFAULT ((now() AT TIME ZONE 'America/Mexico_City')::date),
  build INT NOT NULL, test INT NOT NULL, deploy INT NOT NULL, monitor INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now());
```

## Endpoints

Todas las respuestas JSON salvo `/health`. Errores: `{ "error": "mensaje en español" }`.

| Método | Ruta | Auth | Body | Respuesta |
|---|---|---|---|---|
| GET | `/health` | no | | `ok` (texto) |
| GET | `/api/progress` | sí (lectura: cookie o Bearer, sin exigir `X-Requested-With`) | | `{ done: { [taskId]: isoString }, scores: [{ id, at: "YYYY-MM-DD", build, test, deploy, monitor }] }` (scores ordenados por `at`, luego `id`) |
| GET | `/api/me` | no | | `{ loggedIn: boolean, loginEnabled: boolean }` |
| POST | `/api/login` | no | `{ password }` | 200 `{ ok: true }` + cookie `session`; 401 si es incorrecta; 429 tras 5 fallos en 15 min por IP; 503 si el login está deshabilitado |
| POST | `/api/logout` | no | | `{ ok: true }`, borra la cookie |
| PUT | `/api/done/:taskId` | sí | `{ done: boolean }` | `{ ok: true }` (true = upsert, false = delete) |
| POST | `/api/scores` | sí | `{ build, test, deploy, monitor }` enteros 0–10 | 201 con la fila creada `{ id, at, build, test, deploy, monitor }`; 400 si inválido |
| DELETE | `/api/scores/:id` | sí | | `{ ok: true }` |

- `taskId`: `^[a-z0-9-]{1,40}$`, si no 400.
- Sin auth en rutas protegidas: 401 `{ error: "Inicia sesión" }`.

## Sesión

- Cookie `session`: JWT `{ sub: "leo" }` firmado con `JWT_SECRET`, expira en 30 días. `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` cuando la petición llega por HTTPS (`app.set('trust proxy', 1)`, Easypanel usa Traefik).
- Comparación de contraseña con `crypto.timingSafeEqual` sobre hashes SHA-256.
- Escrituras con cookie exigen además el header `X-Requested-With: fetch` (defensa CSRF simple). Con `Authorization: Bearer` no hace falta.
