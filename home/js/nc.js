/* AROGYATI — new concept: "From pain to motion".
   A particle figure carries four pains (neck, shoulder, lower back, knee). Scroll visits each one: it is located,
   treated with its modality, and heals from coral to green while the body straightens. Then the figure moves
   freely and its particles reform into the Arogyati logo figure.
   Anatomy: rounded capsule limbs with muscle taper, a shaped torso, hands and feet, soft side lighting. */
(() => {
  const d = document, $ = (s, r = d) => r.querySelector(s), $$ = (s, r = d) => [...r.querySelectorAll(s)];
  const g = window.gsap, ST = window.ScrollTrigger;
  const sec = $('.ncx'); if (!sec || !g || !ST) return;
  const cv = $('.ncx__cv', sec), ctx = cv.getContext('2d');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches, FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), mix = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), seg = (p, a, b) => ease(clamp((p - a) / (b - a)));
  const bell = (p, a, b) => Math.sin(Math.PI * clamp((p - a) / (b - a)));

  /* ---------- skeleton & poses (figure units: feet at y=0, head top ≈ -1) ---------- */
  const J = ['H', 'N', 'C', 'P', 'sA', 'eA', 'hA', 'sB', 'eB', 'hB', 'iA', 'kA', 'fA', 'iB', 'kB', 'fB'];
  const ix = Object.fromEntries(J.map((k, i) => [k, i]));
  const mk = (base, o = {}) => J.map((k) => (o[k] || base[k]).slice());
  const UPo = { H: [0, -0.937], N: [0, -0.865], C: [0, -0.76], P: [0, -0.515], sA: [-0.1, -0.805], eA: [-0.138, -0.648], hA: [-0.15, -0.5], sB: [0.1, -0.805], eB: [0.138, -0.648], hB: [0.15, -0.5], iA: [-0.056, -0.515], kA: [-0.06, -0.275], fA: [-0.064, -0.045], iB: [0.056, -0.515], kB: [0.06, -0.275], fB: [0.064, -0.045] };
  const UP = mk(UPo);
  const HUNCH = mk(UPo, { H: [0.03, -0.893], N: [0.02, -0.84], C: [0.012, -0.745], sA: [-0.092, -0.79], sB: [0.098, -0.785], eA: [-0.13, -0.632], hA: [-0.128, -0.484], eB: [0.135, -0.632], hB: [0.134, -0.484] });
  const HALF = mk(UPo, { C: [0.006, -0.756], sA: [-0.096, -0.798], sB: [0.1, -0.797], eA: [-0.134, -0.64], hA: [-0.14, -0.492], eB: [0.137, -0.64], hB: [0.143, -0.492] });
  const SH = mk(UPo, { eB: [0.245, -0.83], hB: [0.375, -0.86] });
  const KNEE = mk(UPo, { P: [0.008, -0.515], kA: [-0.072, -0.4], fA: [-0.078, -0.205], iA: [-0.05, -0.515] });
  const TP = mk(UPo, { eA: [-0.25, -0.835], hA: [-0.39, -0.865], eB: [0.25, -0.835], hB: [0.39, -0.865], fA: [-0.085, -0.045], fB: [0.085, -0.045], kA: [-0.07, -0.275], kB: [0.07, -0.275] });
  const VP = mk(UPo, { H: [0, -0.948], N: [0, -0.872], C: [0, -0.768], sA: [-0.1, -0.815], sB: [0.1, -0.815], eA: [-0.18, -0.965], hA: [-0.27, -1.095], eB: [0.18, -0.965], hB: [0.27, -1.095], fA: [-0.1, -0.045], fB: [0.1, -0.045], kA: [-0.08, -0.275], kB: [0.08, -0.275] });
  const KEYS = [[0, HUNCH], [0.2, HUNCH], [0.25, HALF], [0.355, HALF], [0.385, SH], [0.405, SH], [0.43, HALF], [0.52, HALF], [0.57, UP], [0.67, UP], [0.7, KNEE], [0.72, KNEE], [0.745, UP], [0.78, TP], [0.84, VP], [1, VP]];
  const poseAt = (p) => {
    let k = 0; while (k < KEYS.length - 2 && p > KEYS[k + 1][0]) k++;
    const [t0, A] = KEYS[k], [t1, Bp] = KEYS[k + 1], t = ease(clamp((p - t0) / Math.max(1e-4, t1 - t0)));
    return A.map((q, i) => [mix(q[0], Bp[i][0], t), mix(q[1], Bp[i][1], t)]);
  };

  /* ---------- body parts ---------- */
  // limbs: rounded capsules with a muscle bulge near the top (deltoid, forearm, thigh, calf)
  const LIMBS = [
    ['sA', 'eA', 0.036, 0.026, 0.006, 0.25], ['eA', 'hA', 0.028, 0.019, 0.005, 0.22], ['sB', 'eB', 0.036, 0.026, 0.006, 0.25], ['eB', 'hB', 0.028, 0.019, 0.005, 0.22],
    ['iA', 'kA', 0.056, 0.035, 0.007, 0.3], ['kA', 'fA', 0.037, 0.021, 0.011, 0.28], ['iB', 'kB', 0.056, 0.035, 0.007, 0.3], ['kB', 'fB', 0.037, 0.021, 0.011, 0.28],
    ['C', 'N', 0.038, 0.033, 0, 0.5],
  ].map(([a, b, r0, r1, bu, bc]) => ({ a: ix[a], b: ix[b], r0, r1, bu, bc }));
  const rAt = (l, u) => { const uc = clamp(u); return mix(l.r0, l.r1, uc) + (uc < 2 * l.bc ? l.bu * Math.sin(Math.PI * (uc / (2 * l.bc))) : 0) + l.bu * 0.4 * Math.sin(Math.PI * uc); };
  // torso width along pelvis(0) → chest top(1): hips, waist, ribcage, shoulders, rounded top
  const TW = [[-0.14, 0.045], [0, 0.08], [0.22, 0.068], [0.5, 0.078], [0.8, 0.094], [0.95, 0.092], [1.06, 0.05]];
  const tw = (u) => { if (u <= TW[0][0]) return TW[0][1]; for (let k = 0; k < TW.length - 1; k++) { const [a, wa] = TW[k], [b, wb] = TW[k + 1]; if (u <= b) { const t = (u - a) / (b - a); return mix(wa, wb, (1 - Math.cos(Math.PI * t)) / 2); } } return TW[TW.length - 1][1]; };
  const HEAD = [0.058, 0.07];

  /* ---------- particles ---------- */
  const MOB = innerWidth < 900, M = MOB ? 6000 : 12000;
  const kind = new Int8Array(M), part = new Int8Array(M), uu = new Float32Array(M), vv = new Float32Array(M), sz = new Float32Array(M), ph = new Float32Array(M), rnd = new Float32Array(M);
  const aidx = new Int8Array(M).fill(-1), aheat = new Float32Array(M), spineK = new Uint8Array(M);
  const ox = new Float32Array(M), oy = new Float32Array(M), sx0 = new Float32Array(M), sy0 = new Float32Array(M), dly = new Float32Array(M);
  {
    const len = (a, b) => Math.hypot(UP[b][0] - UP[a][0], UP[b][1] - UP[a][1]);
    const parts = [];
    LIMBS.forEach((l, li) => { const L = len(l.a, l.b); parts.push({ k: 0, li, area: L * (l.r0 + l.r1) + Math.PI * (l.r0 * l.r0 + l.r1 * l.r1) / 2, L }); });
    parts.push({ k: 1, area: 0.2 * len(ix.P, ix.C) * 1.25 });
    parts.push({ k: 2, area: Math.PI * HEAD[0] * HEAD[1] });
    [0, 1].forEach((s) => parts.push({ k: 3, s, area: Math.PI * 0.042 * 0.019 }));
    [0, 1].forEach((s) => parts.push({ k: 4, s, area: Math.PI * 0.03 * 0.015 }));
    const tot = parts.reduce((s, q) => s + q.area, 0);
    let n = 0;
    const put = (k, pt, u, v) => { if (n >= M) return false; kind[n] = k; part[n] = pt; uu[n] = u; vv[n] = v; sz[n] = 0.85 + Math.random() * 1.05; ph[n] = Math.random() * 6.283; rnd[n] = Math.random(); n++; return true; };
    // uniform fill with a light preference for the silhouette, so the outline reads cleanly
    const tSample = () => (Math.random() < 0.1 ? (Math.random() < 0.5 ? -1 : 1) * (0.86 + Math.random() * 0.14) : Math.random() * 2 - 1);
    parts.forEach((q) => {
      const cnt = Math.round((q.area / tot) * M);
      for (let c = 0; c < cnt; c++) {
        if (q.k === 0) {
          const l = LIMBS[q.li], L = q.L;
          for (let tries = 0; tries < 30; tries++) {
            const s = -l.r0 + Math.random() * (L + l.r0 + l.r1), t = tSample(), u = s / L;
            if (s < 0 && s * s + (t * l.r0) * (t * l.r0) > l.r0 * l.r0) continue;
            if (s > L && (s - L) * (s - L) + (t * l.r1) * (t * l.r1) > l.r1 * l.r1) continue;
            put(0, q.li, u, t * (s < 0 ? l.r0 : s > L ? l.r1 : rAt(l, u))); break;
          }
        } else if (q.k === 1) {
          for (let tries = 0; tries < 30; tries++) {
            const u = -0.14 + Math.random() * 1.2, t = tSample();
            if (u > 0.96 && Math.abs(t) > Math.sqrt(Math.max(0, 1 - Math.pow((u - 0.96) / 0.1, 2)))) continue;
            put(1, 0, u, t); break;
          }
        } else if (q.k === 2) { const a = Math.random() * 6.283, r = Math.random() < 0.1 ? 0.88 + Math.random() * 0.12 : Math.sqrt(Math.random()); put(2, 0, a, r); }
        else put(q.k, q.s, Math.random() * 6.283, Math.sqrt(Math.random()));
      }
    });
    while (n < M) put(1, 0, Math.random(), Math.random() * 2 - 1);
  }
  const bodyPos = (Pz, i, o) => {
    const k = kind[i];
    if (k === 0) {
      const l = LIMBS[part[i]], A = Pz[l.a], Bb = Pz[l.b], dx = Bb[0] - A[0], dy = Bb[1] - A[1], L = Math.hypot(dx, dy) || 1, u = uu[i];
      o[0] = A[0] + dx * u + (-dy / L) * vv[i]; o[1] = A[1] + dy * u + (dx / L) * vv[i]; o[2] = -dy / L; return;
    }
    if (k === 1) {
      const P = Pz[ix.P], C = Pz[ix.C], dx = C[0] - P[0], dy = C[1] - P[1], L = Math.hypot(dx, dy) || 1, u = uu[i], w = tw(u);
      o[0] = P[0] + dx * u + (-dy / L) * vv[i] * w; o[1] = P[1] + dy * u + (dx / L) * vv[i] * w; o[2] = -dy / L; return;
    }
    if (k === 2) {
      const Hh = Pz[ix.H], N = Pz[ix.N], tilt = Math.atan2(Hh[0] - N[0], N[1] - Hh[1]);
      const x = Math.cos(uu[i]) * vv[i] * HEAD[0] * (Math.sin(uu[i]) > 0.3 ? 0.86 : 1), y = Math.sin(uu[i]) * vv[i] * HEAD[1];
      o[0] = Hh[0] + x * Math.cos(tilt) - y * Math.sin(tilt); o[1] = Hh[1] + x * Math.sin(tilt) + y * Math.cos(tilt); o[2] = 1; return;
    }
    if (k === 3) { // hand: an ellipse continuing the forearm
      const e = Pz[part[i] ? ix.eB : ix.eA], h = Pz[part[i] ? ix.hB : ix.hA], dx = h[0] - e[0], dy = h[1] - e[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
      const a = Math.cos(uu[i]) * vv[i] * 0.042, b = Math.sin(uu[i]) * vv[i] * 0.019, cx = h[0] + ux * 0.04, cy = h[1] + uy * 0.04;
      o[0] = cx + ux * a - uy * b; o[1] = cy + uy * a + ux * b; o[2] = -uy; return;
    }
    const f = Pz[part[i] ? ix.fB : ix.fA], sgn = part[i] ? 1 : -1; // foot: small turned-out ellipse under the ankle
    o[0] = f[0] + sgn * 0.012 + Math.cos(uu[i]) * vv[i] * 0.03; o[1] = f[1] + 0.03 + Math.sin(uu[i]) * vv[i] * 0.015; o[2] = 1;
  };

  /* four pains, bound to the body so they move with it */
  const AREAS = [
    { at: (Pz) => [mix(Pz[ix.C][0], Pz[ix.N][0], 0.55), mix(Pz[ix.C][1], Pz[ix.N][1], 0.55)], s: 0.07 },
    { at: (Pz) => [mix(Pz[ix.sB][0], Pz[ix.C][0], 0.12), mix(Pz[ix.sB][1], Pz[ix.C][1], 0.12)], s: 0.065 },
    { at: (Pz) => [mix(Pz[ix.P][0], Pz[ix.C][0], 0.22), mix(Pz[ix.P][1], Pz[ix.C][1], 0.22)], s: 0.062 },
    { at: (Pz) => Pz[ix.kA].slice(), s: 0.055 },
  ];
  {
    const o = [0, 0, 0], anc = AREAS.map((a) => a.at(UP));
    for (let i = 0; i < M; i++) {
      bodyPos(UP, i, o);
      let best = -1, bh = 0;
      anc.forEach((q, a) => { const dd = Math.hypot(o[0] - q[0], o[1] - q[1]), h = Math.exp(-(dd * dd) / (AREAS[a].s * AREAS[a].s)); if (h > bh) { bh = h; best = a; } });
      if (bh > 0.04) { aidx[i] = best; aheat[i] = bh; }
      spineK[i] = kind[i] === 1 && Math.abs(vv[i]) < 0.18 ? 1 : 0;
    }
  }

  /* logo figure targets */
  const lgx = new Float32Array(M), lgy = new Float32Array(M);
  {
    const paths = $$('.ncx__logo path').map((q) => new Path2D(q.getAttribute('d')));
    const oc = d.createElement('canvas').getContext('2d'), pts = []; let guard = 0;
    const X0 = 129.8, X1 = 163.1, Y1 = 41.7;
    while (pts.length < M && guard++ < M * 40) { const x = mix(X0, X1, Math.random()), y = Math.random() * Y1; if (paths.some((q) => oc.isPointInPath(q, x, y))) pts.push([x, y]); }
    while (pts.length < M) pts.push(pts[pts.length % Math.max(1, pts.length)] || [146, 20]);
    const S = 1.18 / Y1, lp = pts.map(([x, y]) => [(x - 146.42) * S, (y - Y1) * S]);
    const o = [0, 0, 0], order = Array.from({ length: M }, (_, i) => { bodyPos(VP, i, o); return [i, o[1] + o[0] * 0.02]; }).sort((a, b) => a[1] - b[1]);
    lp.sort((a, b) => a[1] + a[0] * 0.02 - (b[1] + b[0] * 0.02));
    order.forEach(([i], k) => { lgx[i] = lp[k][0]; lgy[i] = lp[k][1]; });
  }

  /* ---------- chapters ---------- */
  const chs = $$('.ncx-ch', sec), word = $('[data-ncx-word]'), bar = $('.ncx__bar i'), num = $('[data-ncx-n]'), tint = $('.ncx__tint');
  const tag = $('.ncx__tag'), tagB = $('[data-ncx-tag]'), tagE = $('[data-ncx-tagm]');
  const R = [[0, 0.1], [0.1, 0.26], [0.26, 0.42], [0.42, 0.58], [0.58, 0.74], [0.74, 0.86], [0.86, 1.01]];
  const WORDS = ['WELLNESS', 'NECK', 'SHOULDER', 'BACK', 'KNEE', 'MOVE', 'AROGYATI'];
  const TINTS = ['#E4EEDD', '#F6E6DA', '#DFEAF6', '#E8E5F5', '#F3E9DC', '#E3F0E6', '#E4EEDD'];
  const TAGS = [null, ['Neck pain', 'Osteopathy'], ['Frozen shoulder', 'Super Inductive System'], ['Lower back pain', 'Matrix Rhythm Therapy'], ['Knee pain', 'Class IV Laser']];
  let cur = -1;
  const setChapter = (k) => {
    if (k === cur) return; cur = k;
    chs.forEach((c, i) => c.classList.toggle('is-on', i === k));
    if (num) num.textContent = String(k + 1).padStart(2, '0');
    if (tint) tint.style.setProperty('--t', TINTS[k]);
    if (TAGS[k] && tagB) { tagB.textContent = TAGS[k][0]; tagE.textContent = TAGS[k][1]; }
    if (word) g.to(word, { opacity: 0, y: -20, duration: 0.35, ease: 'power2.in', overwrite: true, onComplete: () => { word.textContent = WORDS[k]; g.fromTo(word, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' }); } });
  };
  // each pain: dim before its chapter, flares when located, heals to green, then gone
  const areaState = (a, p) => {
    const [s, e] = R[a + 1], c = (p - s) / (e - s);
    if (c < 0) return { pain: 0.32, calm: 0, c };
    if (c > 1) return { pain: 0, calm: 0, c };
    return { pain: mix(0.32, 1, seg(c, 0, 0.22)) * (1 - seg(c, 0.45, 0.8)), calm: bell(c, 0.5, 1.02), c };
  };

  /* ---------- canvas ---------- */
  let W = 0, H = 0, DPR = 1, prog = 0, mx = -9999, my = -9999, intro = RM ? 1 : 0, inView = true;
  const resize = () => {
    DPR = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    for (let i = 0; i < M; i++) { sx0[i] = (Math.random() - 0.2) * W * 1.4; sy0[i] = (Math.random() - 0.5) * H * 1.6 + H / 2; dly[i] = Math.random() * 0.55; }
  };
  resize(); addEventListener('resize', resize);
  if (FINE) { sec.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; }, { passive: true }); sec.addEventListener('pointerleave', () => { mx = my = -9999; }); }

  const INK = [23, 35, 27], CORAL = [232, 112, 92], GREEN = [79, 138, 63], BLUE = [64, 108, 180], OLIVE = [125, 142, 57];
  const NB = 10, NBK = 5 + NB * 3, bk = Array.from({ length: NBK }, () => []);
  const o = [0, 0, 0];
  const render = (time) => {
    const p = prog, t = time, Pz = poseAt(p);
    const br = Math.sin(t * 1.5) * 0.004; for (const k of [ix.H, ix.N, ix.C, ix.sA, ix.sB, ix.eA, ix.eB, ix.hA, ix.hB]) Pz[k][1] += br * (k <= ix.C ? 1 : 0.6);
    const lg = seg(p, 0.86, 0.95), states = AREAS.map((_, a) => areaState(a, p));
    // camera: drift gently toward the pain being treated, pull back for movement and the mark
    let fx = 0, fy = -0.5, zf = 0, act = -1;
    states.forEach((st, a) => { if (st.c >= 0 && st.c <= 1) { act = a; zf = seg(st.c, 0, 0.25) * (1 - seg(st.c, 0.82, 1)); const at = AREAS[a].at(Pz), wf = a === 3 ? (MOB ? 0.35 : 0.6) : 1; fx = mix(0, at[0], zf); fy = mix(-0.5, at[1], zf * wf); } });
    const Z = MOB ? 1.2 : 1.32, zoom = (1 + (Z - 1) * zf) * mix(1, MOB ? 0.72 : 0.92, lg);
    fy += mix(0, -0.05, lg);
    const S = (MOB ? Math.min(H * 0.44, W * 0.95) : Math.min(H * 0.74, W * 0.6)) * zoom, CX = MOB ? W * 0.5 : W * 0.62, CY = MOB ? H * 0.33 : H * 0.5;
    const toX = (x) => CX + (x - fx) * S, toY = (y) => CY + (y - fy) * S;
    const align = seg(p, 0.5, 0.57), spineGlow = bell(p, 0.5, 0.6), lift = bell(p, 0.74, 0.88);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
    { const gx = toX(0), gy = toY(0.014), gw = 0.3 * S * (1 - lg), sh = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(1, gw)); sh.addColorStop(0, `rgba(20,32,26,${(0.16 * intro * (1 - lg)).toFixed(3)})`); sh.addColorStop(1, 'rgba(20,32,26,0)'); ctx.save(); ctx.translate(gx, gy); ctx.scale(1, 0.13); ctx.translate(-gx, -gy); ctx.fillStyle = sh; ctx.fillRect(gx - gw, gy - gw, gw * 2, gw * 2); ctx.restore(); }
    states.forEach((st, a) => {
      const v = Math.max(st.pain, st.calm * 0.85) * intro * (1 - lg); if (v < 0.02) return;
      const at = AREAS[a].at(Pz), X = toX(at[0]), Y = toY(at[1]), rr = AREAS[a].s * 1.8 * S, col = st.pain >= st.calm ? '232,112,92' : '79,138,63';
      const gr = ctx.createRadialGradient(X, Y, 0, X, Y, rr); gr.addColorStop(0, `rgba(${col},${(v * (0.3 + 0.07 * Math.sin(t * 3 + a))).toFixed(3)})`); gr.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = gr; ctx.fillRect(X - rr, Y - rr, rr * 2, rr * 2);
    });
    for (let k = 0; k < NBK; k++) bk[k].length = 0;
    const mr = 90, mr2 = mr * mr;
    for (let i = 0; i < M; i++) {
      bodyPos(Pz, i, o);
      let x = o[0], y = o[1];
      if (kind[i] === 1) x += 0.02 * Math.sin(uu[i] * Math.PI * 1.6 + 0.4) * (1 - align) * clamp(uu[i] + 0.2);
      const a = aidx[i]; let hp = 0, hc = 0;
      if (a >= 0) {
        const st = states[a], h = aheat[i]; hp = h * st.pain; hc = h * st.calm;
        if (hp > 0.05) { const j = hp * 0.006; x += Math.sin(t * 23 + ph[i] * 7) * j; y += Math.cos(t * 19 + ph[i] * 5) * j; }
        const burst = st.c >= 0 && st.c <= 1 ? bell(st.c, 0.42, 0.72) : 0;
        if (burst > 0) { const rad = burst * h * (0.03 + rnd[i] * 0.07); x += Math.cos(ph[i]) * rad; y += Math.sin(ph[i]) * rad; }
      }
      x += Math.sin(t * 0.9 + ph[i]) * 0.0014; y += Math.cos(t * 0.8 + ph[i]) * 0.0014;
      if (lg > 0) { x = mix(x, lgx[i], lg); y = mix(y, lgy[i], lg); }
      let X = toX(x), Y = toY(y);
      if (intro < 1) { const k = ease(clamp((intro - dly[i]) / 0.45)); X = mix(sx0[i], X, k); Y = mix(sy0[i], Y, k); }
      const dx = X + ox[i] - mx, dy = Y + oy[i] - my, d2 = dx * dx + dy * dy;
      if (d2 < mr2) { const dd = Math.sqrt(d2) || 1, f = (1 - dd / mr) * 6.3; ox[i] += (dx / dd) * f; oy[i] += (dy / dd) * f; }
      ox[i] *= 0.9; oy[i] *= 0.9; X += ox[i]; Y += oy[i];
      if (X < -10 || X > W + 10 || Y < -10 || Y > H + 10) continue;
      let key, s = sz[i] * (MOB ? 1.1 : 1);
      if (lg > 0.5) { key = 2; s *= 1.2; }
      else if (spineK[i] && spineGlow > 0.25) { key = 5 + 2 * NB + Math.min(NB - 1, Math.floor(spineGlow * NB)); s *= 1.3; }
      else if (hp > 0.1) { key = 5 + Math.min(NB - 1, Math.floor(hp * NB)); s *= 1 + hp * 0.7; }
      else if (hc > 0.12) key = 5 + NB + Math.min(NB - 1, Math.floor(hc * NB));
      else { // soft side light: the left of every form is lit, the right in shade
        const side = kind[i] >= 2 ? Math.cos(uu[i]) * vv[i] : (kind[i] === 1 ? vv[i] : vv[i] / 0.03) * (o[2] >= 0 ? 1 : -1);
        key = side < -0.3 ? 0 : side > 0.35 ? 3 : 1;
      }
      bk[key].push(X, Y, s);
    }
    const fill = (arr, col, al) => { if (!arr.length) return; ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${al})`; ctx.beginPath(); for (let k = 0; k < arr.length; k += 3) { const s = arr[k + 2]; ctx.rect(arr[k] - s / 2, arr[k + 1] - s / 2, s, s); } ctx.fill(); };
    const inkMix = (col, f) => INK.map((v, k) => Math.round(mix(v, col[k], f)));
    const base = inkMix(OLIVE, 0.25 * lift);
    fill(bk[0], base, 0.46); fill(bk[1], base, 0.7); fill(bk[3], base, 0.9); fill(bk[2], BLUE, 0.85);
    for (let l = 0; l < NB; l++) {
      fill(bk[5 + l], inkMix(CORAL, 0.35 + 0.65 * (l / NB)), 0.9);
      fill(bk[5 + NB + l], inkMix(GREEN, 0.4 + 0.6 * (l / NB)), 0.88);
      fill(bk[5 + 2 * NB + l], inkMix(BLUE, 0.5 + 0.5 * (l / NB)), 0.9);
    }
    // the treatment, drawn lightly at the active pain
    if (act >= 0 && lg < 0.1) {
      const st = states[act], eff = bell(st.c, 0.22, 0.8), at = AREAS[act].at(Pz), X = toX(at[0]), Y = toY(at[1]), u = S;
      if (st.c < 0.32) for (let r = 0; r < 3; r++) { const fr = (t * 0.45 + r / 3) % 1, al = 0.4 * (1 - fr) * seg(st.c, 0, 0.15) * (1 - seg(st.c, 0.22, 0.32)); ctx.strokeStyle = `rgba(232,112,92,${al.toFixed(3)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(X, Y, (0.03 + fr * 0.12) * u, 0, 6.283); ctx.stroke(); }
      if (eff > 0.01) {
        ctx.lineWidth = 1.2;
        if (act === 0) { // osteopathy: slow guiding arcs, like two hands
          for (let k = 0; k < 2; k++) { const a0 = t * 0.9 + k * Math.PI; ctx.strokeStyle = `rgba(125,142,57,${(0.7 * eff).toFixed(3)})`; ctx.beginPath(); ctx.arc(X, Y, 0.075 * u, a0, a0 + 1.6); ctx.stroke(); }
        } else if (act === 1) { // SIS: a pulsed field
          for (let r = 0; r < 3; r++) { const fr = (t * 0.6 + r / 3) % 1; ctx.strokeStyle = `rgba(64,108,180,${(0.5 * (1 - fr) * eff).toFixed(3)})`; ctx.beginPath(); ctx.arc(X, Y, (0.04 + fr * 0.16) * u, 0, 6.283); ctx.stroke(); }
        } else if (act === 2) { // Matrix Rhythm: resonance settling into a clean wave
          const clean = seg(st.c, 0.3, 0.7), w = 0.24 * u; ctx.strokeStyle = `rgba(125,142,57,${(0.75 * eff).toFixed(3)})`; ctx.beginPath();
          for (let k = 0; k <= 60; k++) { const f = k / 60, xx = X - w + f * 2 * w, env = Math.sin(Math.PI * f), n = 0.6 * Math.sin(f * 58 + t * 9) + 0.4 * Math.sin(f * 97 - t * 13), cl = Math.sin(f * 25 - t * 5), yy = Y + env * 0.03 * u * mix(n, cl, clean); k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
          ctx.stroke();
        } else { // Class IV laser: a fine beam, light travelling into the joint
          const sx = X + 0.34 * u, sy = Y - 0.42 * u, lb = ctx.createLinearGradient(sx, sy, X, Y); lb.addColorStop(0, 'rgba(232,112,92,0)'); lb.addColorStop(1, `rgba(232,112,92,${(0.8 * eff).toFixed(3)})`);
          ctx.strokeStyle = lb; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(X, Y); ctx.stroke();
          for (let k = 0; k < 5; k++) { const fr = (t * 0.7 + k / 5) % 1; ctx.fillStyle = `rgba(232,112,92,${(Math.sin(Math.PI * fr) * eff).toFixed(3)})`; ctx.beginPath(); ctx.arc(mix(sx, X, fr), mix(sy, Y, fr), 2, 0, 6.283); ctx.fill(); }
        }
      }
      if (tag) {
        const vis = clamp(seg(st.c, 0.08, 0.2) * (1 - seg(st.c, 0.86, 0.98)));
        const flip = X + 280 > W; tag.classList.toggle('is-flip', flip);
        const tx = flip ? X - 16 - tag.offsetWidth : X + 16;
        tag.style.transform = `translate(${clamp(tx, 8, W - tag.offsetWidth - 8).toFixed(1)}px,${(Y - tag.offsetHeight / 2).toFixed(1)}px)`; tag.style.opacity = vis.toFixed(3);
        tag.classList.toggle('is-calm', st.c > 0.55);
      }
    } else if (tag) tag.style.opacity = 0;
    if (spineGlow > 0.02) {
      const A = Pz[ix.P], Cc = Pz[ix.N];
      for (let v = 0; v < 12; v++) { const f = v / 11, on = clamp(align * 14 - v * 0.9) * spineGlow; if (on <= 0) continue; const X = toX(mix(A[0], Cc[0], f)), Y = toY(mix(A[1], Cc[1], f)); ctx.fillStyle = `rgba(255,255,255,${(0.95 * on).toFixed(3)})`; ctx.beginPath(); ctx.arc(X, Y, 3, 0, 6.283); ctx.fill(); ctx.strokeStyle = `rgba(64,108,180,${on.toFixed(3)})`; ctx.lineWidth = 1.3; ctx.stroke(); }
    }
    if (lift > 0.02 && lg < 0.6) {
      const a = seg(p, 0.745, 0.84);
      [[ix.sA, -1], [ix.sB, 1]].forEach(([si, sg]) => { const s0 = Pz[si], Rr = 0.3 * S, cx = toX(s0[0]), cy = toY(s0[1]), a0 = Math.PI / 2 - sg * 0.12, a1 = a0 - sg * (Math.PI * 0.85) * a; ctx.strokeStyle = `rgba(125,142,57,${(0.55 * lift * (1 - lg)).toFixed(3)})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, Rr, Math.min(a0, a1), Math.max(a0, a1)); ctx.stroke(); });
    }
  };

  /* ---------- drive ---------- */
  ST.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: (s) => { prog = s.progress; const k = R.findIndex(([a, b]) => prog >= a && prog < b); setChapter(k < 0 ? R.length - 1 : k); if (bar) bar.style.transform = `scaleY(${prog.toFixed(4)})`; } });
  new IntersectionObserver((es) => es.forEach((e) => (inView = e.isIntersecting))).observe(sec);
  setChapter(0);
  const hd = $('.az-head'); if (hd) hd.classList.add('on-light');
  g.ticker.add((time) => { if (inView) render(time); });
  if (!RM) {
    const go = () => {
      g.to({ v: 0 }, { v: 1, duration: 2.8, ease: 'power2.inOut', onUpdate() { intro = this.targets()[0].v; } });
      g.fromTo('[data-ncx-in]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, delay: 1, ease: 'expo.out' });
    };
    const t0 = performance.now(), chk = () => (!$('.az-pre') || performance.now() - t0 > 7000 ? go() : setTimeout(chk, 120)); chk();
  }
})();
