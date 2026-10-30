'use strict';
// Almacenamiento del progreso: Postgres si hay DATABASE_URL, si no, en memoria.
// Solo se crean/tocan tablas con prefijo lcae_.

function rowToScore(r) {
  return {
    id: Number(r.id),
    at: r.at,
    build: Number(r.build),
    test: Number(r.test),
    deploy: Number(r.deploy),
    monitor: Number(r.monitor),
  };
}

// Fechas en hora de México: el contenedor y Postgres corren en UTC.
const TZ = 'America/Mexico_City';

// Fecha YYYY-MM-DD en TZ (equivalente al DEFAULT de taken_on en modo memoria).
function today() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
}

function makePg(url) {
  const { Pool, Client } = require('pg');
  const ssl = process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined;
  let pool = new Pool({ connectionString: url, ssl });

  // Si la base no existe (3D000), se conecta a "postgres" del mismo servidor y la crea.
  async function createDatabase() {
    const u = new URL(url);
    const name = decodeURIComponent(u.pathname.replace(/^\//, ''));
    if (!name) throw new Error('DATABASE_URL no indica el nombre de la base');
    u.pathname = '/postgres';
    const client = new Client({ connectionString: u.toString(), ssl });
    await client.connect();
    try {
      await client.query(`CREATE DATABASE "${name.replace(/"/g, '""')}"`);
      console.log(`[ai-engineer] base de datos "${name}" creada`);
    } catch (e) {
      if (e.code !== '42P04') throw e; // 42P04: ya existe (otra instancia la creó)
    } finally {
      await client.end();
    }
  }

  async function createTables() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lcae_done (
        task_id TEXT PRIMARY KEY,
        done_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lcae_scores (
        id SERIAL PRIMARY KEY,
        taken_on DATE NOT NULL DEFAULT ((now() AT TIME ZONE '${TZ}')::date),
        build INT NOT NULL,
        test INT NOT NULL,
        deploy INT NOT NULL,
        monitor INT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);
  }

  const SCORE_COLS = "id, to_char(taken_on, 'YYYY-MM-DD') AS at, build, test, deploy, monitor";

  return {
    mode: 'postgres',
    async init() {
      try {
        await createTables();
      } catch (e) {
        if (e.code !== '3D000') throw e;
        await pool.end().catch(() => {});
        await createDatabase();
        pool = new Pool({ connectionString: url, ssl });
        await createTables();
      }
    },
    async getProgress() {
      const [done, scores] = await Promise.all([
        pool.query('SELECT task_id, done_at FROM lcae_done'),
        pool.query(`SELECT ${SCORE_COLS} FROM lcae_scores ORDER BY taken_on, id`),
      ]);
      const map = {};
      for (const r of done.rows) map[r.task_id] = new Date(r.done_at).toISOString();
      return { done: map, scores: scores.rows.map(rowToScore) };
    },
    async setDone(taskId, done) {
      if (done) {
        // Upsert: si ya estaba marcada se conserva la fecha original.
        await pool.query('INSERT INTO lcae_done (task_id) VALUES ($1) ON CONFLICT (task_id) DO NOTHING', [taskId]);
      } else {
        await pool.query('DELETE FROM lcae_done WHERE task_id = $1', [taskId]);
      }
    },
    async addScore(s) {
      const { rows } = await pool.query(
        `INSERT INTO lcae_scores (build, test, deploy, monitor) VALUES ($1, $2, $3, $4) RETURNING ${SCORE_COLS}`,
        [s.build, s.test, s.deploy, s.monitor]
      );
      return rowToScore(rows[0]);
    },
    async deleteScore(id) {
      const { rowCount } = await pool.query('DELETE FROM lcae_scores WHERE id = $1', [id]);
      return rowCount > 0;
    },
  };
}

function makeMemory() {
  const done = new Map(); // taskId -> isoString
  const scores = [];
  let nextId = 1;
  return {
    mode: 'memory',
    async init() {},
    async getProgress() {
      const sorted = [...scores].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : a.id - b.id));
      return { done: Object.fromEntries(done), scores: sorted.map((s) => ({ ...s })) };
    },
    async setDone(taskId, isDone) {
      if (isDone) {
        if (!done.has(taskId)) done.set(taskId, new Date().toISOString());
      } else {
        done.delete(taskId);
      }
    },
    async addScore(s) {
      const row = { id: nextId++, at: today(), build: s.build, test: s.test, deploy: s.deploy, monitor: s.monitor };
      scores.push(row);
      return { ...row };
    },
    async deleteScore(id) {
      const i = scores.findIndex((s) => s.id === Number(id));
      if (i === -1) return false;
      scores.splice(i, 1);
      return true;
    },
  };
}

const impl = process.env.DATABASE_URL ? makePg(process.env.DATABASE_URL) : makeMemory();
module.exports = impl;
