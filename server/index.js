'use strict';
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const jwt = require('jsonwebtoken');

const db = require('./db');

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const JWT_SECRET = process.env.JWT_SECRET || '';
const API_TOKEN = process.env.API_TOKEN || '';
const LOGIN_ENABLED = !!ADMIN_PASSWORD;

if (ADMIN_PASSWORD && !JWT_SECRET) {
  console.error('[ai-engineer] JWT_SECRET es obligatoria cuando hay ADMIN_PASSWORD.');
  process.exit(1);
}
if (!LOGIN_ENABLED) console.warn('[ai-engineer] ADMIN_PASSWORD no está definida: login deshabilitado (solo lectura).');

const COOKIE = 'session';
const SESSION_DAYS = 30;
const TASK_ID = /^[a-z0-9-]{1,40}$/;

// ---------- Utilidades ----------
const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest();
// Compara sobre hashes SHA-256 para que ambos buffers midan lo mismo.
function safeEqual(a, b) {
  return crypto.timingSafeEqual(sha256(a), sha256(b));
}

// Parseo manual del header Cookie (sin cookie-parser).
function readCookie(req, name) {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i === -1) continue;
    if (part.slice(0, i).trim() !== name) continue;
    const value = part.slice(i + 1).trim();
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  return null;
}

function cookieAttrs(req, maxAge) {
  const attrs = [`Max-Age=${maxAge}`, 'Path=/', 'HttpOnly', 'SameSite=Lax'];
  if (req.secure) attrs.push('Secure'); // req.secure respeta X-Forwarded-Proto gracias a trust proxy
  return attrs.join('; ');
}
function setSessionCookie(req, res, token) {
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; ${cookieAttrs(req, SESSION_DAYS * 24 * 60 * 60)}`);
}
function clearSessionCookie(req, res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; ${cookieAttrs(req, 0)}`);
}

function sessionValid(req) {
  if (!LOGIN_ENABLED) return false;
  const token = readCookie(req, COOKIE);
  if (!token) return false;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload && payload.sub === 'leo';
  } catch {
    return false;
  }
}

function bearerValid(req) {
  if (!API_TOKEN) return false;
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return false;
  return safeEqual(h.slice(7), API_TOKEN);
}

// ---------- Límite de intentos de login (en memoria, por IP) ----------
const LOGIN_MAX_FAILS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const loginFails = new Map(); // ip -> [timestamps]

function recentFails(ip) {
  const now = Date.now();
  const list = (loginFails.get(ip) || []).filter((t) => now - t < LOGIN_WINDOW_MS);
  if (list.length) loginFails.set(ip, list);
  else loginFails.delete(ip);
  return list;
}
// Limpieza periódica para que el Map no crezca sin control.
setInterval(() => {
  for (const ip of loginFails.keys()) recentFails(ip);
}, LOGIN_WINDOW_MS).unref();

// ---------- Express ----------
const app = express();
app.set('trust proxy', 1); // Easypanel/Traefik
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (req, res) => res.type('text').send('ok'));

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Escritura: Bearer API_TOKEN, o cookie de sesión + X-Requested-With: fetch (defensa CSRF simple).
function requireAuth(req, res, next) {
  if (bearerValid(req)) return next();
  if (sessionValid(req)) {
    if (req.get('X-Requested-With') !== 'fetch') return res.status(403).json({ error: 'Petición no permitida' });
    return next();
  }
  res.status(401).json({ error: 'Inicia sesión' });
}

app.get('/api/progress', wrap(async (req, res) => {
  res.json(await db.getProgress());
}));

app.get('/api/me', (req, res) => {
  res.json({ loggedIn: sessionValid(req), loginEnabled: LOGIN_ENABLED });
});

app.post('/api/login', (req, res) => {
  if (!LOGIN_ENABLED) return res.status(503).json({ error: 'El inicio de sesión está deshabilitado' });
  const ip = req.ip || 'desconocida';
  const fails = recentFails(ip);
  if (fails.length >= LOGIN_MAX_FAILS) {
    return res.status(429).json({ error: 'Demasiados intentos. Espera unos minutos.' });
  }
  const password = req.body && typeof req.body.password === 'string' ? req.body.password : '';
  if (!password || !safeEqual(password, ADMIN_PASSWORD)) {
    fails.push(Date.now());
    loginFails.set(ip, fails);
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }
  loginFails.delete(ip);
  const token = jwt.sign({ sub: 'leo' }, JWT_SECRET, { expiresIn: `${SESSION_DAYS}d` });
  setSessionCookie(req, res, token);
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  clearSessionCookie(req, res);
  res.json({ ok: true });
});

app.put('/api/done/:taskId', requireAuth, wrap(async (req, res) => {
  const { taskId } = req.params;
  if (!TASK_ID.test(taskId)) return res.status(400).json({ error: 'taskId inválido' });
  const done = req.body && req.body.done;
  if (typeof done !== 'boolean') return res.status(400).json({ error: 'El campo "done" debe ser booleano' });
  await db.setDone(taskId, done);
  res.json({ ok: true });
}));

const SCORE_KEYS = ['build', 'test', 'deploy', 'monitor'];

app.post('/api/scores', requireAuth, wrap(async (req, res) => {
  const body = req.body || {};
  const s = {};
  for (const k of SCORE_KEYS) {
    const v = body[k];
    if (!Number.isInteger(v) || v < 0 || v > 10) {
      return res.status(400).json({ error: `"${k}" debe ser un entero entre 0 y 10` });
    }
    s[k] = v;
  }
  res.status(201).json(await db.addScore(s));
}));

app.delete('/api/scores/:id', requireAuth, wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (!/^\d+$/.test(req.params.id) || !Number.isSafeInteger(id) || id <= 0 || id > 2147483647) {
    return res.status(400).json({ error: 'id inválido' });
  }
  await db.deleteScore(id); // idempotente: si no existe, también responde ok
  res.json({ ok: true });
}));

app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && (err.type === 'entity.parse.failed' || err.type === 'entity.too.large')) {
    return res.status(400).json({ error: 'Solicitud inválida' });
  }
  console.error('[ai-engineer] error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

db.init()
  .then(() => {
    app.listen(PORT, () => console.log(`[ai-engineer] escuchando en http://localhost:${PORT} (db: ${db.mode})`));
  })
  .catch((err) => {
    console.error('[ai-engineer] no se pudo iniciar la base de datos:', err);
    process.exit(1);
  });
