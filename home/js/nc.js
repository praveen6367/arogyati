/* AROGYATI — new concept: "From pain to motion".
   The figure begins as a heap of particles on the floor and rises into a body. It carries four pains (neck,
   shoulder, lower back, knee); scroll visits each one — located, treated with its modality, healed from coral to
   green — then the figure moves freely and its particles reform into the Arogyati logo figure.
   Body: an anatomical silhouette (8 heads tall) sampled into particles, skinned to a skeleton with blended bone
   weights so joints bend smoothly, and shaded as a sculpted volume (height field from the silhouette edge). */
(() => {
  const d = document, $ = (s, r = d) => r.querySelector(s), $$ = (s, r = d) => [...r.querySelectorAll(s)];
  const g = window.gsap, ST = window.ScrollTrigger;
  const sec = $('.ncx'); if (!sec || !g || !ST) return;
  const cv = $('.ncx__cv', sec), ctx = cv.getContext('2d');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches, FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), mix = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), seg = (p, a, b) => ease(clamp((p - a) / (b - a)));
  const bell = (p, a, b) => Math.sin(Math.PI * clamp((p - a) / (b - a)));
  const MOB = innerWidth < 900, M = MOB ? 8000 : 16000;

  /* ---------- silhouette (right half, figure units: feet y=0, crown y=-1) ---------- */
  const HALF_R = [[0, -1], [0.03, -0.995], [0.047, -0.982], [0.056, -0.96], [0.058, -0.935], [0.055, -0.91], [0.049, -0.893], [0.04, -0.88], [0.027, -0.872],
    [0.027, -0.86], [0.031, -0.845], [0.05, -0.832], [0.078, -0.822], [0.1, -0.815], [0.118, -0.806], [0.13, -0.79], [0.136, -0.765], [0.137, -0.735],
    [0.139, -0.7], [0.143, -0.66], [0.148, -0.625], [0.157, -0.59], [0.165, -0.55], [0.17, -0.515], [0.172, -0.495],
    [0.18, -0.475], [0.186, -0.45], [0.188, -0.42], [0.184, -0.395], [0.176, -0.382], [0.166, -0.386], [0.16, -0.405], [0.153, -0.43], [0.15, -0.455], [0.153, -0.48], [0.152, -0.497],
    [0.145, -0.53], [0.134, -0.57], [0.124, -0.61], [0.115, -0.65], [0.108, -0.69], [0.1, -0.725], [0.093, -0.745],
    [0.092, -0.725], [0.091, -0.69], [0.087, -0.65], [0.079, -0.61], [0.074, -0.585], [0.077, -0.56], [0.086, -0.53], [0.092, -0.5], [0.094, -0.475],
    [0.093, -0.44], [0.088, -0.4], [0.08, -0.35], [0.068, -0.3], [0.067, -0.27], [0.07, -0.23], [0.068, -0.19], [0.058, -0.13], [0.047, -0.08], [0.044, -0.055],
    [0.05, -0.035], [0.058, -0.012], [0.056, 0], [0.03, 0.003], [0.02, -0.005],
    [0.022, -0.05], [0.024, -0.09], [0.026, -0.15], [0.03, -0.2], [0.028, -0.25], [0.024, -0.29], [0.024, -0.33], [0.02, -0.39], [0.014, -0.44], [0.006, -0.468], [0, -0.472]];
  const RAW = [...HALF_R, ...HALF_R.slice(1, -1).reverse().map(([x, y]) => [-x, y])];
  const POLY = []; // Catmull-Rom smoothed outline
  for (let i = 0; i < RAW.length; i++) {
    const p0 = RAW[(i - 1 + RAW.length) % RAW.length], p1 = RAW[i], p2 = RAW[(i + 1) % RAW.length], p3 = RAW[(i + 2) % RAW.length];
    for (let k = 0; k < 6; k++) { const t = k / 6, t2 = t * t, t3 = t2 * t; POLY.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3))); }
  }

  /* ---------- skeleton ---------- */
  const REST = { H: [0, -0.935], N: [0, -0.862], C: [0, -0.77], P: [0, -0.5], sA: [-0.105, -0.8], eA: [-0.135, -0.62], wA: [-0.16, -0.495], tA: [-0.172, -0.41], sB: [0.105, -0.8], eB: [0.135, -0.62], wB: [0.16, -0.495], tB: [0.172, -0.41], iA: [-0.05, -0.49], kA: [-0.047, -0.29], aA: [-0.035, -0.06], oA: [-0.04, 0], iB: [0.05, -0.49], kB: [0.047, -0.29], aB: [0.035, -0.06], oB: [0.04, 0] };
  const BONES = [['P', 'C'], ['C', 'N'], ['N', 'H'], ['C', 'sA'], ['sA', 'eA'], ['eA', 'wA'], ['wA', 'tA'], ['C', 'sB'], ['sB', 'eB'], ['eB', 'wB'], ['wB', 'tB'], ['P', 'iA'], ['iA', 'kA'], ['kA', 'aA'], ['aA', 'oA'], ['P', 'iB'], ['iB', 'kB'], ['kB', 'aB'], ['aB', 'oB']];
  const clone = (P) => Object.fromEntries(Object.entries(P).map(([k, v]) => [k, v.slice()]));
  const rot = (P, keys, pivot, deg) => { const [px, py] = P[pivot], a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a); keys.forEach((k) => { const [x, y] = P[k], dx = x - px, dy = y - py; P[k] = [px + dx * c - dy * s, py + dx * s + dy * c]; }); return P; };
  const mv = (P, keys, dx, dy) => { keys.forEach((k) => { P[k] = [P[k][0] + dx, P[k][1] + dy]; }); return P; };
  const ARM_A = ['eA', 'wA', 'tA'], ARM_B = ['eB', 'wB', 'tB'];
  const UP = clone(REST);
  const HUNCH = (() => { const P = clone(REST); mv(P, ['H', 'N'], 0.004, 0.014); rot(P, ['H'], 'N', -10); mv(P, ['sA', ...ARM_A], 0.006, 0.013); mv(P, ['sB', ...ARM_B], -0.004, 0.009); rot(P, ARM_A, 'sA', -3); rot(P, ARM_B, 'sB', 3); return P; })();
  const HALFP = (() => { const P = clone(REST); mv(P, ['sA', ...ARM_A], 0.003, 0.007); mv(P, ['sB', ...ARM_B], -0.002, 0.005); return P; })();
  const SH = rot(clone(REST), ARM_B, 'sB', -76);
  const KNEE = (() => { const P = clone(REST); P.kA = [-0.052, -0.39]; P.aA = [-0.05, -0.2]; P.oA = [-0.055, -0.15]; mv(P, ['P', 'C', 'N', 'H'], 0.005, 0); return P; })();
  const TP = (() => { const P = clone(REST); rot(P, ARM_A, 'sA', 78); rot(P, ARM_B, 'sB', -78); return P; })();
  const VP = (() => { const P = clone(REST); rot(P, ARM_A, 'sA', 126); rot(P, ARM_B, 'sB', -126); rot(P, ['kA', 'aA', 'oA'], 'iA', 4); rot(P, ['kB', 'aB', 'oB'], 'iB', -4); mv(P, ['H', 'N'], 0, -0.006); return P; })();
  const KEYS = [[0, HUNCH], [0.2, HUNCH], [0.25, HALFP], [0.355, HALFP], [0.385, SH], [0.405, SH], [0.43, HALFP], [0.52, HALFP], [0.57, UP], [0.67, UP], [0.7, KNEE], [0.72, KNEE], [0.745, UP], [0.78, TP], [0.84, VP], [1, VP]];
  const poseAt = (p) => {
    let k = 0; while (k < KEYS.length - 2 && p > KEYS[k + 1][0]) k++;
    const [t0, A] = KEYS[k], [t1, B] = KEYS[k + 1], t = ease(clamp((p - t0) / Math.max(1e-4, t1 - t0))), o = {};
    for (const key in A) o[key] = [mix(A[key][0], B[key][0], t), mix(A[key][1], B[key][1], t)];
    return o;
  };

  /* ---------- sample the silhouette, bind to bones, bake shading ---------- */
  const rx = new Float32Array(M), ry = new Float32Array(M), b1 = new Int8Array(M), b2 = new Int8Array(M), w1 = new Float32Array(M);
  const al1 = new Float32Array(M), pe1 = new Float32Array(M), al2 = new Float32Array(M), pe2 = new Float32Array(M);
  const shade = new Float32Array(M), sz = new Float32Array(M), ph = new Float32Array(M), rnd = new Float32Array(M), torW = new Float32Array(M);
  const aidx = new Int8Array(M).fill(-1), aheat = new Float32Array(M), spineK = new Uint8Array(M);
  const ox = new Float32Array(M), oy = new Float32Array(M), hx = new Float32Array(M), hy = new Float32Array(M), dly = new Float32Array(M);
  const BR = BONES.map(([a, b]) => { const A = REST[a], B = REST[b], dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy); return { a, b, ax: A[0], ay: A[1], ux: dx / L, uy: dy / L, L }; });
  {
    const path = new Path2D(); POLY.forEach(([x, y], i) => (i ? path.lineTo(x * 1000, y * 1000) : path.moveTo(x * 1000, y * 1000))); path.closePath();
    const oc = d.createElement('canvas').getContext('2d');
    let n = 0, guard = 0;
    while (n < M && guard++ < M * 12) {
      const x = (Math.random() * 2 - 1) * 0.2, y = -Math.random() * 1.005 + 0.004;
      if (!oc.isPointInPath(path, x * 1000, y * 1000)) continue;
      rx[n] = x; ry[n] = y; n++;
    }
    const L = { x: -0.5, y: -0.58, z: 0.64 }, ln = Math.hypot(L.x, L.y, L.z);
    for (let i = 0; i < M; i++) {
      const x = rx[i], y = ry[i];
      // two nearest bones, sharply weighted, so joints bend smoothly without smearing across the body
      let d1 = 9, d2 = 9, i1 = 0, i2 = 0;
      // bind only within the particle's own region (torso / arm / leg), so lifting a limb never drags the body
      const arm = Math.abs(x) >= 0.0955 && y < -0.37, leg = !arm && y > -0.468, side = x < 0 ? 'A' : 'B';
      const ok = (bb) => (arm ? bb.b === 's' + side || bb.a === 's' + side || bb.a === 'e' + side || bb.a === 'w' + side
        : leg ? bb.a === 'P' && bb.b === 'i' + side || bb.a === 'i' + side || bb.a === 'k' + side || bb.a === 'a' + side
        : bb.a === 'P' || bb.a === 'C' || bb.a === 'N');
      BR.forEach((b, k) => { if (!ok(b)) return; const t = clamp((x - b.ax) * b.ux + (y - b.ay) * b.uy, 0, b.L), qx = b.ax + b.ux * t, qy = b.ay + b.uy * t, dd = Math.hypot(x - qx, y - qy); if (dd < d1) { d2 = d1; i2 = i1; d1 = dd; i1 = k; } else if (dd < d2) { d2 = dd; i2 = k; } });
      const wa = 1 / Math.pow(d1 + 0.006, 6), wb = 1 / Math.pow(d2 + 0.006, 6);
      b1[i] = i1; b2[i] = i2; w1[i] = wa / (wa + wb);
      const A = BR[i1], B = BR[i2];
      al1[i] = (x - A.ax) * A.ux + (y - A.ay) * A.uy; pe1[i] = (x - A.ax) * -A.uy + (y - A.ay) * A.ux;
      al2[i] = (x - B.ax) * B.ux + (y - B.ay) * B.uy; pe2[i] = (x - B.ax) * -B.uy + (y - B.ay) * B.ux;
      torW[i] = (i1 <= 1 ? w1[i] : 0) + (i2 <= 1 ? 1 - w1[i] : 0);
      // volume: distance to the outline is the height of a rounded form; light from top-left-front
      let dm = 9, cx = 0, cy = 0;
      for (let k = 0; k < POLY.length; k += 1) { const q = POLY[k], dd = (q[0] - x) * (q[0] - x) + (q[1] - y) * (q[1] - y); if (dd < dm) { dm = dd; cx = q[0]; cy = q[1]; } }
      dm = Math.sqrt(dm);
      const h = 1 - Math.exp(-dm / 0.018), ex = dm ? (cx - x) / dm : 0, ey = dm ? (cy - y) / dm : 0;
      let nx = ex * (1 - h), ny = ey * (1 - h), nz = h + 0.05; const nn = Math.hypot(nx, ny, nz); nx /= nn; ny /= nn; nz /= nn;
      shade[i] = clamp((nx * L.x + ny * L.y + nz * L.z) / ln) * (0.82 + 0.18 * h) * (dm < 0.0035 ? 0.55 : 1);
      sz[i] = 0.8 + Math.random() * 0.95; ph[i] = Math.random() * 6.283; rnd[i] = Math.random();
    }
    // anatomical definition: soft creases carried by the shading (collarbones, chest, centre line, abs, hip lines,
    // deltoids, elbows, kneecaps, jaw shadow) — mirrored left/right
    const half = [
      [[0.012, -0.818], [0.05, -0.822], [0.095, -0.812]], [[0.004, -0.73], [0.04, -0.716], [0.07, -0.727], [0.089, -0.752]],
      [[0, -0.8], [0, -0.68], [0, -0.56]], [[0.004, -0.678], [0.034, -0.682]], [[0.004, -0.637], [0.033, -0.64]], [[0.004, -0.598], [0.031, -0.6]],
      [[0.066, -0.575], [0.045, -0.53], [0.026, -0.496], [0.01, -0.48]], [[0.108, -0.792], [0.115, -0.76], [0.124, -0.728]],
      [[0.127, -0.632], [0.137, -0.622]], [[0.03, -0.3], [0.04, -0.278], [0.055, -0.276], [0.064, -0.296]], [[0.03, -0.31], [0.047, -0.318], [0.063, -0.31]],
      [[-0.024, -0.873], [0, -0.869], [0.024, -0.873]], [[0.012, -0.945], [0.026, -0.942]], [[0.002, -0.935], [0.004, -0.912]],
    ];
    const lines = []; half.forEach((ln) => { lines.push(ln); if (ln.some(([x]) => Math.abs(x) > 0.003)) lines.push(ln.map(([x, y]) => [-x, y])); });
    for (let i = 0; i < M; i++) {
      let dm = 9;
      for (const ln of lines) for (let k = 0; k < ln.length - 1; k++) {
        const [x0, y0] = ln[k], [x1, y1] = ln[k + 1], vx = x1 - x0, vy = y1 - y0, t = clamp(((rx[i] - x0) * vx + (ry[i] - y0) * vy) / (vx * vx + vy * vy));
        const dd = Math.hypot(rx[i] - x0 - vx * t, ry[i] - y0 - vy * t); if (dd < dm) dm = dd;
      }
      shade[i] *= 1 - 0.5 * Math.exp(-((dm / 0.0045) ** 2));
    }
  }
  const frames = BR.map(() => ({ ax: 0, ay: 0, ux: 0, uy: 1, s: 1 }));
  const setFrames = (Pz) => BR.forEach((b, k) => { const A = Pz[b.a], B = Pz[b.b], dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1, f = frames[k]; f.ax = A[0]; f.ay = A[1]; f.ux = dx / L; f.uy = dy / L; f.s = L / b.L; });
  const skin = (i, o) => {
    const f = frames[b1[i]], q = frames[b2[i]], w = w1[i];
    const a1 = al1[i] > 0 ? al1[i] * f.s : al1[i], a2 = al2[i] > 0 ? al2[i] * q.s : al2[i];
    o[0] = w * (f.ax + f.ux * a1 - f.uy * pe1[i]) + (1 - w) * (q.ax + q.ux * a2 - q.uy * pe2[i]);
    o[1] = w * (f.ay + f.uy * a1 + f.ux * pe1[i]) + (1 - w) * (q.ay + q.uy * a2 + q.ux * pe2[i]);
  };

  /* four pains, bound to the body */
  const AREAS = [
    { at: (P) => [mix(P.C[0], P.N[0], 0.45), mix(P.C[1], P.N[1], 0.45)], s: 0.05 },
    { at: (P) => [mix(P.sB[0], P.eB[0], 0.12), mix(P.sB[1], P.eB[1], 0.12)], s: 0.05 },
    { at: (P) => [mix(P.P[0], P.C[0], 0.22), mix(P.P[1], P.C[1], 0.22)], s: 0.055 },
    { at: (P) => P.kA.slice(), s: 0.045 },
  ];
  {
    const anc = AREAS.map((a) => a.at(UP));
    for (let i = 0; i < M; i++) {
      let best = -1, bh = 0;
      anc.forEach((q, a) => { const dd = Math.hypot(rx[i] - q[0], ry[i] - q[1]), h = Math.exp(-(dd * dd) / (AREAS[a].s * AREAS[a].s)); if (h > bh) { bh = h; best = a; } });
      if (bh > 0.05) { aidx[i] = best; aheat[i] = bh; }
      spineK[i] = Math.abs(rx[i]) < 0.006 && ry[i] < -0.5 && ry[i] > -0.86 ? 1 : 0;
      // the heap on the floor they rise from; lower parts of the body rise first
      const r1 = Math.random(), r2 = Math.random(), r3 = Math.random();
      hx[i] = (r1 + r2 + r3 - 1.5) * 0.2; hy[i] = -0.075 * Math.exp(-((hx[i] / 0.11) ** 2)) * Math.sqrt(Math.random()) + 0.004;
      dly[i] = clamp(-ry[i]) * 0.5 + Math.random() * 0.08;
    }
  }

  /* logo figure targets */
  const lgx = new Float32Array(M), lgy = new Float32Array(M);
  {
    const paths = $$('.ncx__logo path').map((q) => new Path2D(q.getAttribute('d')));
    const oc = d.createElement('canvas').getContext('2d'), pts = []; let guard = 0;
    while (pts.length < M && guard++ < M * 40) { const x = mix(129.8, 163.1, Math.random()), y = Math.random() * 41.7; if (paths.some((q) => oc.isPointInPath(q, x, y))) pts.push([x, y]); }
    while (pts.length < M) pts.push(pts[pts.length % Math.max(1, pts.length)] || [146, 20]);
    const S = 1.18 / 41.7, lp = pts.map(([x, y]) => [(x - 146.42) * S, (y - 41.7) * S]);
    setFrames(VP); const o = [0, 0];
    const order = Array.from({ length: M }, (_, i) => { skin(i, o); return [i, o[1] + o[0] * 0.02]; }).sort((a, b) => a[1] - b[1]);
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
  const areaState = (a, p) => {
    const [s, e] = R[a + 1], c = (p - s) / (e - s);
    if (c < 0) return { pain: 0.3, calm: 0, c };
    if (c > 1) return { pain: 0, calm: 0, c };
    return { pain: mix(0.3, 1, seg(c, 0, 0.22)) * (1 - seg(c, 0.45, 0.8)), calm: bell(c, 0.5, 1.02), c };
  };

  /* ---------- canvas ---------- */
  let W = 0, H = 0, DPR = 1, prog = 0, mx = -9999, my = -9999, intro = RM ? 1 : 0, inView = true;
  const resize = () => { DPR = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); };
  resize(); addEventListener('resize', resize);
  if (FINE) { sec.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; }, { passive: true }); sec.addEventListener('pointerleave', () => { mx = my = -9999; }); }

  const INK = [21, 33, 26], CORAL = [232, 112, 92], GREEN = [79, 138, 63], BLUE = [64, 108, 180], OLIVE = [125, 142, 57];
  const NS = 7, NB = 8, OFF = NS + 1, NBK = OFF + NB * 3, bk = Array.from({ length: NBK }, () => []);
  const o = [0, 0];
  const render = (time) => {
    const p = prog, t = time, Pz = poseAt(p);
    const br = Math.sin(t * 1.5) * 0.003; ['H', 'N', 'C', 'sA', 'sB', 'eA', 'eB', 'wA', 'wB', 'tA', 'tB'].forEach((k) => { Pz[k][1] += br; });
    setFrames(Pz);
    const lg = seg(p, 0.86, 0.95), states = AREAS.map((_, a) => areaState(a, p));
    let fx = 0, fy = -0.5, zf = 0, act = -1;
    states.forEach((st, a) => { if (st.c >= 0 && st.c <= 1) { act = a; zf = seg(st.c, 0, 0.25) * (1 - seg(st.c, 0.82, 1)); const at = AREAS[a].at(Pz), wf = a === 3 ? (MOB ? 0.35 : 0.6) : 1; fx = mix(0, at[0], zf); fy = mix(-0.5, at[1], zf * wf); } });
    const Z = MOB ? 1.2 : 1.32, zoom = (1 + (Z - 1) * zf) * mix(1, MOB ? 0.72 : 0.92, lg);
    fy += mix(0, -0.05, lg);
    const S = (MOB ? Math.min(H * 0.46, W * 1.0) : Math.min(H * 0.78, W * 0.6)) * zoom, CX = MOB ? W * 0.5 : W * 0.64, CY = MOB ? H * 0.33 : H * 0.5;
    const toX = (x) => CX + (x - fx) * S, toY = (y) => CY + (y - fy) * S;
    const align = seg(p, 0.5, 0.57), spineGlow = bell(p, 0.5, 0.6), lift = bell(p, 0.74, 0.88);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
    { const gx = toX(0), gy = toY(0.012), gw = 0.26 * S * (1 - lg), sh = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(1, gw)); sh.addColorStop(0, `rgba(20,32,26,${(0.18 * (1 - lg)).toFixed(3)})`); sh.addColorStop(1, 'rgba(20,32,26,0)'); ctx.save(); ctx.translate(gx, gy); ctx.scale(1, 0.12); ctx.translate(-gx, -gy); ctx.fillStyle = sh; ctx.fillRect(gx - gw, gy - gw, gw * 2, gw * 2); ctx.restore(); }
    const formed = clamp((intro - 0.55) / 0.45);
    states.forEach((st, a) => {
      const v = Math.max(st.pain, st.calm * 0.85) * formed * (1 - lg); if (v < 0.02) return;
      const at = AREAS[a].at(Pz), X = toX(at[0]), Y = toY(at[1]), rr = AREAS[a].s * 2.2 * S, col = st.pain >= st.calm ? '232,112,92' : '79,138,63';
      const gr = ctx.createRadialGradient(X, Y, 0, X, Y, rr); gr.addColorStop(0, `rgba(${col},${(v * (0.3 + 0.07 * Math.sin(t * 3 + a))).toFixed(3)})`); gr.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = gr; ctx.fillRect(X - rr, Y - rr, rr * 2, rr * 2);
    });
    for (let k = 0; k < NBK; k++) bk[k].length = 0;
    const mr = 90, mr2 = mr * mr;
    for (let i = 0; i < M; i++) {
      skin(i, o);
      let x = o[0], y = o[1];
      if (torW[i] > 0) x += 0.016 * Math.sin((-0.5 - y) * 9 + 0.4) * (1 - align) * torW[i];
      const a = aidx[i]; let hp = 0, hc = 0;
      if (a >= 0) {
        const st = states[a], h = aheat[i]; hp = h * st.pain * formed; hc = h * st.calm;
        if (hp > 0.05) { const j = hp * 0.004; x += Math.sin(t * 23 + ph[i] * 7) * j; y += Math.cos(t * 19 + ph[i] * 5) * j; }
        const burst = st.c >= 0 && st.c <= 1 ? bell(st.c, 0.42, 0.72) : 0;
        if (burst > 0) { const rad = burst * h * (0.02 + rnd[i] * 0.05); x += Math.cos(ph[i]) * rad; y += Math.sin(ph[i]) * rad; }
      }
      x += Math.sin(t * 0.9 + ph[i]) * 0.0009; y += Math.cos(t * 0.8 + ph[i]) * 0.0009;
      if (lg > 0) { x = mix(x, lgx[i], lg); y = mix(y, lgy[i], lg); }
      if (intro < 1) { const k = ease(clamp((intro - dly[i]) / 0.42)); x = mix(hx[i], x, k) + Math.sin(k * Math.PI) * (rnd[i] - 0.5) * 0.06; y = mix(hy[i], y, k); }
      let X = toX(x), Y = toY(y);
      const dx = X + ox[i] - mx, dy = Y + oy[i] - my, d2 = dx * dx + dy * dy;
      if (d2 < mr2) { const dd = Math.sqrt(d2) || 1, f = (1 - dd / mr) * 6; ox[i] += (dx / dd) * f; oy[i] += (dy / dd) * f; }
      ox[i] *= 0.9; oy[i] *= 0.9; X += ox[i]; Y += oy[i];
      if (X < -10 || X > W + 10 || Y < -10 || Y > H + 10) continue;
      let key, s = sz[i] * (MOB ? 1.05 : 1);
      if (lg > 0.5) { key = NS; s *= 1.15; }
      else if (spineK[i] && spineGlow > 0.25) { key = OFF + 2 * NB + Math.min(NB - 1, Math.floor(spineGlow * NB)); s *= 1.5; }
      else if (hp > 0.1) { key = OFF + Math.min(NB - 1, Math.floor(hp * NB)); s *= 1 + hp * 0.5; }
      else if (hc > 0.12) key = OFF + NB + Math.min(NB - 1, Math.floor(hc * NB));
      else key = Math.min(NS - 1, Math.floor(shade[i] * NS));
      bk[key].push(X, Y, s);
    }
    const fill = (arr, col, al) => { if (!arr.length) return; ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${al.toFixed(3)})`; ctx.beginPath(); for (let k = 0; k < arr.length; k += 3) { const s = arr[k + 2]; ctx.rect(arr[k] - s / 2, arr[k + 1] - s / 2, s, s); } ctx.fill(); };
    const inkMix = (col, f) => INK.map((v, k) => Math.round(mix(v, col[k], f)));
    const base = inkMix(OLIVE, 0.22 * lift);
    // shading: shadowed side dense and dark, lit side airy — reads as a sculpted volume
    for (let l = 0; l < NS; l++) fill(bk[l], base, mix(0.97, 0.34, l / (NS - 1)));
    fill(bk[NS], BLUE, 0.85);
    for (let l = 0; l < NB; l++) {
      fill(bk[OFF + l], inkMix(CORAL, 0.4 + 0.6 * (l / NB)), 0.9);
      fill(bk[OFF + NB + l], inkMix(GREEN, 0.45 + 0.55 * (l / NB)), 0.88);
      fill(bk[OFF + 2 * NB + l], inkMix(BLUE, 0.55 + 0.45 * (l / NB)), 0.92);
    }
    if (act >= 0 && lg < 0.1) {
      const st = states[act], eff = bell(st.c, 0.22, 0.8), at = AREAS[act].at(Pz), X = toX(at[0]), Y = toY(at[1]), u = S;
      if (st.c < 0.32) for (let r = 0; r < 3; r++) { const fr = (t * 0.45 + r / 3) % 1, al = 0.4 * (1 - fr) * seg(st.c, 0, 0.15) * (1 - seg(st.c, 0.22, 0.32)); ctx.strokeStyle = `rgba(232,112,92,${al.toFixed(3)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(X, Y, (0.03 + fr * 0.11) * u, 0, 6.283); ctx.stroke(); }
      if (eff > 0.01) {
        ctx.lineWidth = 1.2;
        if (act === 0) { for (let k = 0; k < 2; k++) { const a0 = t * 0.9 + k * Math.PI; ctx.strokeStyle = `rgba(125,142,57,${(0.7 * eff).toFixed(3)})`; ctx.beginPath(); ctx.arc(X, Y, 0.065 * u, a0, a0 + 1.6); ctx.stroke(); } }
        else if (act === 1) { for (let r = 0; r < 3; r++) { const fr = (t * 0.6 + r / 3) % 1; ctx.strokeStyle = `rgba(64,108,180,${(0.5 * (1 - fr) * eff).toFixed(3)})`; ctx.beginPath(); ctx.arc(X, Y, (0.035 + fr * 0.14) * u, 0, 6.283); ctx.stroke(); } }
        else if (act === 2) {
          const clean = seg(st.c, 0.3, 0.7), w = 0.22 * u; ctx.strokeStyle = `rgba(125,142,57,${(0.75 * eff).toFixed(3)})`; ctx.beginPath();
          for (let k = 0; k <= 60; k++) { const f = k / 60, xx = X - w + f * 2 * w, env = Math.sin(Math.PI * f), n = 0.6 * Math.sin(f * 58 + t * 9) + 0.4 * Math.sin(f * 97 - t * 13), cl = Math.sin(f * 25 - t * 5), yy = Y + env * 0.028 * u * mix(n, cl, clean); k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
          ctx.stroke();
        } else {
          const sx = X + 0.32 * u, sy = Y - 0.4 * u, lb = ctx.createLinearGradient(sx, sy, X, Y); lb.addColorStop(0, 'rgba(232,112,92,0)'); lb.addColorStop(1, `rgba(232,112,92,${(0.8 * eff).toFixed(3)})`);
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
      const A = Pz.P, Cc = Pz.N;
      for (let v = 0; v < 12; v++) { const f = v / 11, on = clamp(align * 14 - v * 0.9) * spineGlow; if (on <= 0) continue; const X = toX(mix(A[0], Cc[0], f)), Y = toY(mix(A[1], Cc[1], f)); ctx.fillStyle = `rgba(255,255,255,${(0.95 * on).toFixed(3)})`; ctx.beginPath(); ctx.arc(X, Y, 2.8, 0, 6.283); ctx.fill(); ctx.strokeStyle = `rgba(64,108,180,${on.toFixed(3)})`; ctx.lineWidth = 1.3; ctx.stroke(); }
    }
    if (lift > 0.02 && lg < 0.6) {
      const a = seg(p, 0.745, 0.84);
      [['sA', -1], ['sB', 1]].forEach(([si, sg]) => { const s0 = Pz[si], Rr = 0.3 * S, cx = toX(s0[0]), cy = toY(s0[1]), a0 = Math.PI / 2 - sg * 0.12, a1 = a0 - sg * (Math.PI * 0.85) * a; ctx.strokeStyle = `rgba(125,142,57,${(0.55 * lift * (1 - lg)).toFixed(3)})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, Rr, Math.min(a0, a1), Math.max(a0, a1)); ctx.stroke(); });
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
      g.to({ v: 0 }, { v: 1, duration: 3.4, delay: 0.3, ease: 'power1.inOut', onUpdate() { intro = this.targets()[0].v; } });
      g.fromTo('[data-ncx-in]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, delay: 1, ease: 'expo.out' });
    };
    const t0 = performance.now(), chk = () => (!$('.az-pre') || performance.now() - t0 > 7000 ? go() : setTimeout(chk, 120)); chk();
  }
})();
