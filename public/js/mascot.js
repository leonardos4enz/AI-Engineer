/* <agent-eyes>: el agente animado de AI Engineer.
   Custom element con Shadow DOM, sin dependencias. Ver CONTRACT.md ("<agent-eyes>").

   Atributos: size (px, default 40) · face · follow · mood (idle|happy|sad|shy|focus|sleep)
   Métodos:   blink() · react(mood, ms = 1200) · lookAt(x, y) en coords de página · lookAt(null)
   Colores:   --agent-face (default var(--accent)) · --agent-eye (default var(--on-accent); sin face, var(--fg))

   Un solo motor global: un listener de pointermove compartido y un solo bucle rAF que
   solo corre si hay alguna instancia visible y la pestaña está activa. */
(() => {
  'use strict';
  if (!('customElements' in window) || customElements.get('agent-eyes')) return;

  const MOODS = ['idle', 'happy', 'sad', 'shy', 'focus', 'sleep'];

  /* ---------- Poses (parámetros del ojo izquierdo; el derecho es su espejo) ----------
     sx/sy: escala de la píldora · po: opacidad de la píldora · dy: desplazamiento vertical del ojo
     rot: inclinación · lidY/lidS: altura y pendiente del párpado superior (máscara)
     L: trazo "cerrado" (M p0 Q p1 p2 Q p3 p4) · lo/lw: su opacidad y grosor
     blush: rubor · gx/gy/gw: mirada forzada y su peso · frot/fdy: giro y caída de la cara
     hop/bob: rebote · brA/brP: amplitud y periodo de la respiración · sacc: radio de los sacádicos */
  const FLAT = [-7, 0, -3.5, 0, 0, 0, 3.5, 0, 7, 0];
  const BASE = {
    sx: 1, sy: 1, po: 1, dy: 0, rot: 0, lidY: -24, lidS: 0,
    L: FLAT, lo: 0, lw: 5.6, blush: 0,
    gx: 0, gy: 0, gw: 0, frot: 0, fdy: 0,
    hop: 0, bob: 0, brA: 0.0075, brP: 4000, sacc: 1
  };
  const POSE = {
    idle: BASE,
    happy: {
      ...BASE, sy: 0.14, po: 0, dy: -2.5, lo: 1, lw: 5.8,
      L: [-7.5, 3, -6.6, -5.2, 0, -5.2, 6.6, -5.2, 7.5, 3],
      blush: 0.6, gx: 0, gy: -0.15, gw: 0.65, hop: 1, bob: 1, brA: 0.01
    },
    sad: {
      ...BASE, sx: 0.96, sy: 0.86, dy: 3.5, rot: 0, lidY: -7.5, lidS: -0.42,
      gx: 0, gy: 0.6, gw: 0.75, fdy: 1.6, brA: 0.005, brP: 5600, sacc: 0.35
    },
    shy: {
      ...BASE, sy: 0.14, po: 0, dy: 1, lo: 1, lw: 5.2,
      L: [-6, -6, -0.5, -3, 5, 0, -0.5, 3, -6, 6],
      blush: 1, gx: -0.7, gy: 0.2, gw: 1, frot: -6
    },
    focus: {
      ...BASE, sx: 0.8, sy: 0.8, lidY: -7.6, lidS: 0, brA: 0.005, sacc: 0.3
    },
    sleep: {
      ...BASE, sy: 0.12, po: 0, dy: 4, lo: 1, lw: 4.8,
      L: [-7.5, -1, -6, 3.6, 0, 3.6, 6, 3.6, 7.5, -1],
      blush: 0.25, gx: 0, gy: 0.35, gw: 1, frot: 4, fdy: 1.5, brA: 0.028, brP: 5200
    }
  };
  const NUM_KEYS = Object.keys(BASE).filter((k) => k !== 'L');

  const lerp = (a, b, k) => a + (b - a) * k;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const rand = (a, b) => a + Math.random() * (b - a);
  const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const easeOut = (k) => 1 - Math.pow(1 - k, 3);
  const easeIn = (k) => k * k;
  const f = (n) => (Math.round(n * 100) / 100).toString();

  function clonePose(p) { return { ...p, L: p.L.slice() }; }
  function mixPose(a, b, k, out) {
    for (const key of NUM_KEYS) out[key] = lerp(a[key], b[key], k);
    for (let i = 0; i < 10; i++) out.L[i] = lerp(a.L[i], b.L[i], k);
    return out;
  }

  /* ---------- Motor global ---------- */
  const mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const engine = {
    items: new Set(),
    raf: 0,
    last: 0,
    bound: false,
    reduce: !!(mq && mq.matches),
    px: 0, py: 0, pt: -Infinity // puntero (coords de viewport) y último movimiento (performance.now)
  };

  function onMove(e) { engine.px = e.clientX; engine.py = e.clientY; engine.pt = performance.now(); }
  function onOut(e) { if (!e.relatedTarget) engine.pt = -Infinity; }
  function onVis() { kick(); }
  function onReduce() { engine.reduce = !!(mq && mq.matches); }

  function bind() {
    if (engine.bound) return;
    engine.bound = true;
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerout', onOut, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    if (mq) {
      if (mq.addEventListener) mq.addEventListener('change', onReduce);
      else if (mq.addListener) mq.addListener(onReduce);
    }
  }
  function unbind() {
    if (!engine.bound) return;
    engine.bound = false;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerout', onOut);
    document.removeEventListener('visibilitychange', onVis);
    if (mq) {
      if (mq.removeEventListener) mq.removeEventListener('change', onReduce);
      else if (mq.removeListener) mq.removeListener(onReduce);
    }
  }

  function frame(ts) {
    engine.raf = requestAnimationFrame(frame);
    const dt = engine.last ? Math.min(64, ts - engine.last) : 16;
    engine.last = ts;
    for (const el of engine.items) if (el._visible) el._tick(dt);
  }
  function kick() {
    let want = !document.hidden;
    if (want) { want = false; for (const el of engine.items) if (el._visible) { want = true; break; } }
    if (want && !engine.raf) { engine.last = 0; engine.raf = requestAnimationFrame(frame); }
    else if (!want && engine.raf) { cancelAnimationFrame(engine.raf); engine.raf = 0; }
  }

  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
      for (const e of entries) e.target._visible = e.isIntersecting;
      kick();
    })
    : null;

  /* ---------- Plantilla ---------- */
  // Squircle suave en un viewBox de 100.
  const SQUIRCLE = 'M50 3C84 3 97 16 97 50C97 84 84 97 50 97C16 97 3 84 3 50C3 16 16 3 50 3Z';
  let uid = 0;

  function template(id) {
    const eye = (side) => `
      <g class="eye" data-side="${side}">
        <mask id="${id}-m${side}" maskUnits="userSpaceOnUse" x="-40" y="-60" width="80" height="120">
          <rect x="-40" y="-60" width="80" height="120" fill="#fff"/>
          <path class="lid" fill="#000" d=""/>
        </mask>
        <g mask="url(#${id}-m${side})">
          <g class="pill">
            <rect class="eye-fill" x="-8" y="-15" width="16" height="30" rx="8"/>
            <circle class="glint" cx="-2.8" cy="-8.4" r="2.5"/>
          </g>
        </g>
        <path class="line" fill="none" d=""/>
      </g>`;
    return `
      <style>
        :host { display: inline-block; line-height: 0; vertical-align: middle; flex: none; }
        :host([hidden]) { display: none; }
        svg { display: block; overflow: visible; }
        .face-shape { fill: var(--agent-face, var(--accent, #6b79de)); }
        .eye-fill { fill: var(--agent-eye, var(--on-accent, #fff)); }
        .line { stroke: var(--agent-eye, var(--on-accent, #fff)); stroke-linecap: round; stroke-linejoin: round; }
        .glint { fill: var(--agent-face, var(--accent, #6b79de)); opacity: .42; }
        .blush-dot { fill: var(--agent-blush, var(--monitor, #db7895)); }
        .face-only { display: none; }
        :host([face]) .face-only { display: inline; }
        :host(:not([face])) .eye-fill { fill: var(--agent-eye, var(--fg, #1d2130)); }
        :host(:not([face])) .line { stroke: var(--agent-eye, var(--fg, #1d2130)); }
        :host(:not([face])) .glint { fill: var(--surface, #fff); opacity: .6; }
        svg[data-small] .glint { display: none; }
      </style>
      <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="${id}-hl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#fff" stop-opacity=".26"/>
            <stop offset=".46" stop-color="#fff" stop-opacity="0"/>
          </linearGradient>
          <linearGradient id="${id}-sh" x1="0" y1="0" x2="0" y2="1">
            <stop offset=".62" stop-color="#000" stop-opacity="0"/>
            <stop offset="1" stop-color="#000" stop-opacity=".1"/>
          </linearGradient>
          <radialGradient id="${id}-bl">
            <stop offset="0" stop-color="#fff" stop-opacity="1"/>
            <stop offset="1" stop-color="#fff" stop-opacity="0"/>
          </radialGradient>
          <mask id="${id}-blm" maskContentUnits="objectBoundingBox">
            <rect width="1" height="1" fill="url(#${id}-bl)"/>
          </mask>
        </defs>
        <g class="head">
          <g class="face-only">
            <path class="face-shape" d="${SQUIRCLE}"/>
            <path d="${SQUIRCLE}" fill="url(#${id}-sh)"/>
            <path d="${SQUIRCLE}" fill="url(#${id}-hl)"/>
            <ellipse cx="40" cy="14" rx="15" ry="3.6" fill="#fff" opacity=".12"/>
          </g>
          <g class="blush" opacity="0">
            <ellipse class="blush-dot" cx="22" cy="68" rx="9" ry="5.5" mask="url(#${id}-blm)"/>
            <ellipse class="blush-dot" cx="78" cy="68" rx="9" ry="5.5" mask="url(#${id}-blm)"/>
          </g>
          <g class="eyes">${eye(-1)}${eye(1)}</g>
        </g>
      </svg>`;
  }

  /* ---------- Elemento ---------- */
  class AgentEyes extends HTMLElement {
    static get observedAttributes() { return ['size', 'face', 'follow', 'mood']; }

    constructor() {
      super();
      const id = 'ae' + (++uid);
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = template(id);
      this._svg = root.querySelector('svg');
      this._head = root.querySelector('.head');
      this._eyesG = root.querySelector('.eyes');
      this._blushG = root.querySelector('.blush');
      this._eyes = Array.from(root.querySelectorAll('.eye')).map((g) => ({
        side: Number(g.dataset.side),
        g,
        lid: g.querySelector('.lid'),
        pill: g.querySelector('.pill'),
        fill: g.querySelector('.eye-fill'),
        line: g.querySelector('.line')
      }));
      this._cache = new Map();

      this._visible = !io; // sin IntersectionObserver, siempre "visible"
      this._t = 0;                 // reloj propio (ms), solo avanza cuando se anima
      this._base = 'idle';
      this._react = null;
      this._reactUntil = 0;
      this._mood = null;           // ánimo efectivo actual
      this._pose = null;           // pose interpolada actual
      this._from = null; this._to = null; this._m0 = 0; this._mDur = 260;
      this._moodAt = 0;
      this._gx = 0; this._gy = 0;  // mirada viva (-1..1)
      this._sac = null;            // { fx, fy, tx, ty, t0, d }
      this._nextSac = rand(300, 1200);
      this._nextBlink = rand(1200, 3500);
      this._blinkT0 = -1;
      this._blinkQ = -1;
      this._look = null;           // { x, y } en coords de página
      this._mode = 'sac';
      this._brPh = 0;
      this._size = 40;
      this._ready = false;
    }

    connectedCallback() {
      if (!this.hasAttribute('aria-label') && !this.hasAttribute('role')) this.setAttribute('aria-hidden', 'true');
      this._applySize();
      this._applyFace();
      this._base = this._readMood();
      engine.items.add(this);
      bind();
      if (io) io.observe(this);
      this._ready = true;
      this._tick(0); // primer cuadro síncrono: sin destello de una pose equivocada
      kick();
    }

    disconnectedCallback() {
      if (io) io.unobserve(this);
      engine.items.delete(this);
      if (!engine.items.size) unbind();
      this._visible = !io;
      this._ready = false;
      kick();
    }

    attributeChangedCallback(name) {
      if (name === 'size') this._applySize();
      else if (name === 'face') this._applyFace();
      else if (name === 'mood') this._base = this._readMood();
      if (this._ready && !engine.raf) this._tick(0);
    }

    get mood() { return this._readMood(); }
    set mood(v) { this.setAttribute('mood', v); }

    /* ---------- API pública ---------- */
    blink() {
      if (this._pose && this._pose.po < 0.5) return;
      if (this._blinkT0 < 0) this._blinkT0 = this._t;
      else this._blinkQ = this._t + 200;
    }

    react(mood, ms = 1200) {
      if (!MOODS.includes(mood)) return;
      this._react = mood;
      this._reactUntil = this._t + Math.max(0, Number(ms) || 0);
      if (this._ready && !engine.raf) this._tick(0);
    }

    lookAt(x, y) {
      if (x == null || y == null || !isFinite(x) || !isFinite(y)) { this._look = null; return; }
      this._look = { x: Number(x), y: Number(y) };
    }

    /* ---------- Interno ---------- */
    _readMood() {
      const m = (this.getAttribute('mood') || 'idle').trim();
      return MOODS.includes(m) ? m : 'idle';
    }

    _applySize() {
      const n = parseFloat(this.getAttribute('size'));
      const s = isFinite(n) && n > 0 ? n : 40;
      this._size = s;
      this._svg.setAttribute('width', s);
      this._svg.setAttribute('height', s);
      this._svg.toggleAttribute('data-small', s < 28);
    }

    _applyFace() {
      // Sin cara, los ojos crecen un poco para llenar la caja.
      this._eyesG.setAttribute('transform', this.hasAttribute('face') ? '' : 'translate(50 51) scale(1.32) translate(-50 -52)');
    }

    _set(el, attr, val) {
      let c = this._cache.get(el);
      if (!c) { c = {}; this._cache.set(el, c); }
      if (c[attr] !== val) { c[attr] = val; el.setAttribute(attr, val); }
    }

    // Dirección hacia un punto del viewport → mirada normalizada (-1..1), saturando con la distancia.
    _gazeTo(px, py) {
      const r = this.getBoundingClientRect();
      if (!r.width) return null;
      const dx = px - (r.left + r.width / 2);
      const dy = py - (r.top + r.height * 0.52);
      const d = Math.hypot(dx, dy);
      if (d < 1) return { x: 0, y: 0 };
      const reach = Math.max(r.width * 2.4, 170);
      const m = 1 - Math.exp(-d / reach * 1.6);
      return { x: (dx / d) * m, y: (dy / d) * m };
    }

    _tick(dt) {
      this._t += dt;
      const t = this._t;
      const reduce = engine.reduce;

      // --- Ánimo efectivo y transición entre poses ---
      if (this._react && t >= this._reactUntil) this._react = null;
      const mood = this._react || this._base;
      if (!this._pose) {
        this._pose = clonePose(POSE[mood]);
        this._mood = mood;
        this._to = POSE[mood];
        this._from = null;
      } else if (mood !== this._mood) {
        this._from = clonePose(this._pose);
        this._to = POSE[mood];
        this._m0 = t;
        this._mDur = reduce ? 180 : 260;
        this._mood = mood;
        this._moodAt = t;
        if (mood === 'idle' || mood === 'focus') this._nextBlink = t + rand(500, 1600);
      }
      if (this._from) {
        const k = clamp((t - this._m0) / this._mDur, 0, 1);
        mixPose(this._from, this._to, easeInOut(k), this._pose);
        if (k >= 1) this._from = null;
      }
      const p = this._pose;

      // --- Mirada ---
      let target = null;
      let rate = 0;
      if (this._look) {
        target = this._gazeTo(this._look.x - window.scrollX, this._look.y - window.scrollY);
        rate = 14;
      } else if (!reduce && this.hasAttribute('follow') && performance.now() - engine.pt < 3000) {
        target = this._gazeTo(engine.px, engine.py);
        rate = 10;
      }
      if (reduce) {
        // Sin sacádicos ni seguimiento: mirada quieta (solo lookAt explícito, sin animar el trayecto).
        const g = target || { x: 0, y: 0 };
        this._gx = g.x; this._gy = g.y;
        this._sac = null;
        this._mode = 'still';
      } else if (target) {
        const a = 1 - Math.exp(-rate * dt / 1000);
        this._gx += (target.x - this._gx) * a;
        this._gy += (target.y - this._gy) * a;
        this._sac = null;
        this._mode = 'track';
      } else {
        if (this._mode !== 'sac') { this._mode = 'sac'; this._nextSac = t + rand(350, 1100); }
        if (!this._sac && t >= this._nextSac) {
          let tx = 0, ty = 0;
          if (Math.random() > 0.22 || Math.hypot(this._gx, this._gy) < 0.15) {
            const ang = Math.random() * Math.PI * 2;
            const rad = Math.sqrt(Math.random()) * 0.62 * p.sacc;
            tx = Math.cos(ang) * rad;
            ty = Math.sin(ang) * rad * 0.65;
          }
          const dist = Math.hypot(tx - this._gx, ty - this._gy);
          this._sac = { fx: this._gx, fy: this._gy, tx, ty, t0: t, d: 85 + 70 * Math.min(1, dist) };
          if (dist > 0.45 && Math.random() < 0.2) this.blink();
        }
        if (this._sac) {
          const s = this._sac;
          const k = clamp((t - s.t0) / s.d, 0, 1);
          const e = easeOut(k);
          this._gx = lerp(s.fx, s.tx, e);
          this._gy = lerp(s.fy, s.ty, e);
          if (k >= 1) { this._sac = null; this._nextSac = t + rand(600, 2500); }
        }
      }
      // Microderiva: los ojos nunca quedan totalmente quietos.
      const drift = reduce || this._mode !== 'sac' ? 0 : 1;
      const gx0 = this._gx + drift * 0.018 * Math.sin(t / 830);
      const gy0 = this._gy + drift * 0.014 * Math.sin(t / 610 + 1.3);
      let gx = lerp(gx0, p.gx, p.gw);
      let gy = lerp(gy0, p.gy, p.gw);
      const gl = Math.hypot(gx, gy);
      if (gl > 1) { gx /= gl; gy /= gl; }

      // --- Parpadeo ---
      const open = p.po >= 0.5;
      if (open && this._blinkT0 < 0 && t >= this._nextBlink) {
        this._blinkT0 = t;
        this._nextBlink = t + rand(2000, 6000);
        if (!reduce && Math.random() < 0.15) this._blinkQ = t + 200;
      }
      if (this._blinkQ >= 0 && t >= this._blinkQ && this._blinkT0 < 0) { this._blinkT0 = t; this._blinkQ = -1; }
      let lid = 1;
      if (this._blinkT0 >= 0) {
        const D = reduce ? 260 : 140;
        const minS = reduce ? 0.14 : 0.1;
        const bt = t - this._blinkT0;
        const tc = D * 0.4;
        const c = bt < tc ? easeIn(bt / tc) : 1 - easeOut(clamp((bt - tc) / (D - tc), 0, 1));
        lid = 1 - (1 - minS) * c;
        if (bt >= D) { this._blinkT0 = -1; lid = 1; }
      }

      // --- Respiración y rebote ---
      let breath = 1;
      let hopY = 0;
      if (!reduce) {
        this._brPh += (dt / p.brP) * Math.PI * 2;
        if (this._brPh > Math.PI * 2) this._brPh -= Math.PI * 2;
        breath = 1 + p.brA * (1 - Math.cos(this._brPh));
        if (p.hop > 0.01) {
          const ht = t - this._moodAt;
          const hops = Math.abs(Math.sin((ht / 300) * Math.PI)) * Math.exp(-ht / 520) * 5.5;
          const bob = (1 - Math.cos((ht / 1500) * Math.PI * 2)) * 0.5 * 1.1;
          hopY = -(hops * p.hop + bob * p.bob);
        }
      }

      // --- Render ---
      const fx = gx * 1.8;
      const fy = gy * 1.3 + p.fdy + hopY;
      this._set(this._head, 'transform',
        `translate(${f(50 + fx)} ${f(50 + fy)}) rotate(${f(p.frot)}) scale(${breath.toFixed(4)}) translate(-50 -50)`);
      this._set(this._blushG, 'opacity', f(p.blush * 0.55));
      this._set(this._blushG, 'transform', `translate(${f(gx * 3)} ${f(gy * 1.5)})`);

      const ex = gx * 10;
      const ey = gy * 7.5;
      const squash = 1 - 0.1 * Math.abs(gx);
      const lw = p.lw * (this._size < 28 ? 1.3 : 1);
      for (const e of this._eyes) {
        const s = e.side;
        const cx = 50 + s * 16;
        this._set(e.g, 'transform', `translate(${f(cx + ex)} ${f(52 + ey + p.dy)}) rotate(${f(p.rot * -s)})`);
        const slope = p.lidS * -s;
        this._set(e.lid, 'd', `M-40 ${f(p.lidY - slope * 40)}L40 ${f(p.lidY + slope * 40)}L40 -60L-40 -60Z`);
        this._set(e.pill, 'transform', `translate(0 3) scale(${f(p.sx * squash)} ${f(Math.max(0.02, p.sy * lid))}) translate(0 -3)`);
        this._set(e.pill, 'opacity', f(clamp(p.po, 0, 1)));
        const L = p.L;
        const X = (i) => f(L[i] * -s);
        const Y = (i) => f(L[i]);
        this._set(e.line, 'd', `M${X(0)} ${Y(1)}Q${X(2)} ${Y(3)} ${X(4)} ${Y(5)}Q${X(6)} ${Y(7)} ${X(8)} ${Y(9)}`);
        this._set(e.line, 'stroke-width', f(lw));
        this._set(e.line, 'opacity', f(clamp(p.lo, 0, 1)));
      }
    }
  }

  customElements.define('agent-eyes', AgentEyes);
})();
