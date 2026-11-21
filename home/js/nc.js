/* AROGYATI — new concept: "From pain to motion".
   The figure begins as a heap of particles on the floor and rises into a realistic anatomical body (skeleton,
   organs, nerves — sampled from the anatomy illustration for both position and colour). It carries four pains
   (neck, shoulder, lower back, knee); scroll visits each — located, treated with its modality, healed from coral
   to green — then the body moves freely and its particles reform into the Arogyati logo figure.
   Particles are skinned to a skeleton (region-bound blended weights) so limbs move without tearing. */
(() => {
  const d = document, $ = (s, r = d) => r.querySelector(s), $$ = (s, r = d) => [...r.querySelectorAll(s)];
  const g = window.gsap, ST = window.ScrollTrigger;
  const sec = $('.ncx'); if (!sec || !g || !ST) return;
  const cv = $('.ncx__cv', sec), ctx = cv.getContext('2d');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches, FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), mix = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), seg = (p, a, b) => ease(clamp((p - a) / (b - a)));
  const bell = (p, a, b) => Math.sin(Math.PI * clamp((p - a) / (b - a)));
  const MOB = innerWidth < 900, M = MOB ? 22000 : 50000;
  const SRC = sec.dataset.body || '/home/assets/img/body-anatomy.png';

  /* ---------- skeleton (figure units: feet y=0, crown y≈-1), mapped onto the illustration ---------- */
  const fu = (fx, fy) => [(fx - 0.5) * 0.5232, fy - 0.997];
  const REST = { H: fu(0.5, 0.06), N: fu(0.5, 0.135), C: fu(0.5, 0.19), P: fu(0.5, 0.47),
    sA: fu(0.29, 0.2), eA: fu(0.2, 0.34), wA: fu(0.11, 0.46), tA: fu(0.04, 0.53), sB: fu(0.71, 0.2), eB: fu(0.8, 0.34), wB: fu(0.89, 0.46), tB: fu(0.96, 0.53),
    iA: fu(0.4, 0.48), kA: fu(0.375, 0.68), aA: fu(0.36, 0.92), oA: fu(0.33, 0.98), iB: fu(0.6, 0.48), kB: fu(0.625, 0.68), aB: fu(0.64, 0.92), oB: fu(0.67, 0.98) };
  const BONES = [['P', 'C'], ['C', 'N'], ['N', 'H'], ['C', 'sA'], ['sA', 'eA'], ['eA', 'wA'], ['wA', 'tA'], ['C', 'sB'], ['sB', 'eB'], ['eB', 'wB'], ['wB', 'tB'], ['P', 'iA'], ['iA', 'kA'], ['kA', 'aA'], ['aA', 'oA'], ['P', 'iB'], ['iB', 'kB'], ['kB', 'aB'], ['aB', 'oB']];
  const clone = (P) => Object.fromEntries(Object.entries(P).map(([k, v]) => [k, v.slice()]));
  const rot = (P, keys, pivot, deg) => { const [px, py] = P[pivot], a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a); keys.forEach((k) => { const [x, y] = P[k], dx = x - px, dy = y - py; P[k] = [px + dx * c - dy * s, py + dx * s + dy * c]; }); return P; };
  const mv = (P, keys, dx, dy) => { keys.forEach((k) => { P[k] = [P[k][0] + dx, P[k][1] + dy]; }); return P; };
  const ARM_A = ['eA', 'wA', 'tA'], ARM_B = ['eB', 'wB', 'tB'];
  const UP = clone(REST);
  const HUNCH = (() => { const P = clone(REST); mv(P, ['H', 'N'], 0.004, 0.012); rot(P, ['H'], 'N', -9); mv(P, ['sA', ...ARM_A], 0.006, 0.012); mv(P, ['sB', ...ARM_B], -0.004, 0.008); rot(P, ARM_A, 'sA', -10); rot(P, ARM_B, 'sB', 10); return P; })();
  const HALFP = (() => { const P = clone(REST); mv(P, ['sA', ...ARM_A], 0.003, 0.006); mv(P, ['sB', ...ARM_B], -0.002, 0.004); rot(P, ARM_A, 'sA', -5); rot(P, ARM_B, 'sB', 5); return P; })();
  const SH = rot(clone(REST), ARM_B, 'sB', -62);
  const KNEE = (() => { const P = clone(REST); P.kA = fu(0.37, 0.58); P.aA = fu(0.36, 0.76); P.oA = fu(0.33, 0.81); mv(P, ['P', 'C', 'N', 'H', 'sA', 'sB', ...ARM_A, ...ARM_B], 0.004, 0); return P; })();
  const TP = (() => { const P = clone(REST); rot(P, ARM_A, 'sA', 52); rot(P, ARM_B, 'sB', -52); return P; })();
  const VP = (() => { const P = clone(REST); rot(P, ARM_A, 'sA', 100); rot(P, ARM_B, 'sB', -100); mv(P, ['H', 'N'], 0, -0.005); return P; })();
  const KEYS = [[0, UP], [0.355, UP], [0.385, SH], [0.405, SH], [0.43, UP], [0.67, UP], [0.7, KNEE], [0.72, KNEE], [0.745, UP], [0.78, TP], [0.84, VP], [1, VP]];
  const poseAt = (p) => {
    let k = 0; while (k < KEYS.length - 2 && p > KEYS[k + 1][0]) k++;
    const [t0, A] = KEYS[k], [t1, B] = KEYS[k + 1], t = ease(clamp((p - t0) / Math.max(1e-4, t1 - t0))), o = {};
    for (const key in A) o[key] = [mix(A[key][0], B[key][0], t), mix(A[key][1], B[key][1], t)];
    return o;
  };
  const BR = BONES.map(([a, b]) => { const A = REST[a], B = REST[b], dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy); return { a, b, ax: A[0], ay: A[1], ux: dx / L, uy: dy / L, L, ra: Math.atan2(dy, dx) }; });
  const frames = BR.map(() => ({ ax: 0, ay: 0, ux: 0, uy: 1, s: 1, th: 0 }));
  const JK = Object.keys(REST); let curPose = REST;
  const setFrames = (Pz) => { curPose = Pz; BR.forEach((b, k) => { const A = Pz[b.a], B = Pz[b.b], dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1, f = frames[k]; f.ax = A[0]; f.ay = A[1]; f.ux = dx / L; f.uy = dy / L; f.s = L / b.L; let th = Math.atan2(dy, dx) - b.ra; while (th > Math.PI) th -= 2 * Math.PI; while (th < -Math.PI) th += 2 * Math.PI; f.th = th; }); };

  /* ---------- particle buffers ---------- */
  const rx = new Float32Array(M), ry = new Float32Array(M), col = new Uint8Array(M * 3), b1 = new Int8Array(M), b2 = new Int8Array(M), w1 = new Float32Array(M);
  const al1 = new Float32Array(M), pe1 = new Float32Array(M), al2 = new Float32Array(M), pe2 = new Float32Array(M), torW = new Float32Array(M);
  const ph = new Float32Array(M), rnd = new Float32Array(M), aidx = new Int8Array(M).fill(-1), aheat = new Float32Array(M), spineK = new Uint8Array(M);
  const ox = new Float32Array(M), oy = new Float32Array(M), hx = new Float32Array(M), hy = new Float32Array(M), dly = new Float32Array(M), lgx = new Float32Array(M), lgy = new Float32Array(M);
  const sj = new Int8Array(M).fill(-1), jdx = new Float32Array(M), jdy = new Float32Array(M);
  const skin = (i, o) => {
    const f = frames[b1[i]], q = frames[b2[i]], w = w1[i];
    // two bones meeting at a joint: blend the rotation about that joint (keeps shoulders/hips full, no pinching)
    if (sj[i] >= 0 && Math.abs(f.s - 1) < 0.03 && Math.abs(q.s - 1) < 0.03) {
      const th = w * f.th + (1 - w) * q.th, c = Math.cos(th), sn = Math.sin(th), J = curPose[JK[sj[i]]];
      o[0] = J[0] + jdx[i] * c - jdy[i] * sn; o[1] = J[1] + jdx[i] * sn + jdy[i] * c; return;
    }
    const a1 = al1[i] > 0 ? al1[i] * f.s : al1[i], a2 = al2[i] > 0 ? al2[i] * q.s : al2[i];
    o[0] = w * (f.ax + f.ux * a1 - f.uy * pe1[i]) + (1 - w) * (q.ax + q.ux * a2 - q.uy * pe2[i]);
    o[1] = w * (f.ay + f.uy * a1 + f.ux * pe1[i]) + (1 - w) * (q.ay + q.uy * a2 + q.ux * pe2[i]);
  };
  const AREAS = [
    { at: (P) => [mix(P.C[0], P.N[0], 0.35), mix(P.C[1], P.N[1], 0.35)], s: 0.045 },
    { at: (P) => [mix(P.sB[0], P.eB[0], 0.1), mix(P.sB[1], P.eB[1], 0.1)], s: 0.045 },
    { at: (P) => [mix(P.P[0], P.C[0], 0.22), mix(P.P[1], P.C[1], 0.22)], s: 0.055 },
    { at: (P) => P.kA.slice(), s: 0.042 },
  ];

  const build = (img) => {
    const iw = img.naturalWidth, ih = img.naturalHeight, oc = d.createElement('canvas'); oc.width = iw; oc.height = ih;
    const octx = oc.getContext('2d', { willReadFrequently: true }); octx.drawImage(img, 0, 0); const px = octx.getImageData(0, 0, iw, ih).data;
    // stratified (jittered-grid) sampling: evenly spread particles, no holes, still a particle texture
    let area = 0; for (let k = 3; k < px.length; k += 4) if (px[k] >= 140) area++;
    const step = Math.sqrt(area / M), cand = [];
    for (let gy = 0; gy < ih; gy += step) for (let gx = 0; gx < iw; gx += step) {
      const x = gx + Math.random() * step, y = gy + Math.random() * step; if (x >= iw || y >= ih) continue;
      const k = ((y | 0) * iw + (x | 0)) * 4; if (px[k + 3] >= 140) cand.push(x, y, k);
    }
    for (let i = cand.length / 3 - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; for (let c = 0; c < 3; c++) { const t = cand[i * 3 + c]; cand[i * 3 + c] = cand[j * 3 + c]; cand[j * 3 + c] = t; } }
    let n = 0;
    for (; n < M && n * 3 < cand.length; n++) { const x = cand[n * 3], y = cand[n * 3 + 1], k = cand[n * 3 + 2]; rx[n] = (x / iw - 0.5) * 0.5232; ry[n] = (y / ih) - 0.997; col[n * 3] = px[k]; col[n * 3 + 1] = px[k + 1]; col[n * 3 + 2] = px[k + 2]; }
    for (let guard = 0; n < M && guard < M * 20; guard++) { const x = Math.random() * iw, y = Math.random() * ih, k = ((y | 0) * iw + (x | 0)) * 4; if (px[k + 3] < 140) continue; rx[n] = (x / iw - 0.5) * 0.5232; ry[n] = (y / ih) - 0.997; col[n * 3] = px[k]; col[n * 3 + 1] = px[k + 1]; col[n * 3 + 2] = px[k + 2]; n++; }
    for (; n < M; n++) { rx[n] = rx[n % 100]; ry[n] = ry[n % 100]; col.copyWithin(n * 3, (n % 100) * 3, (n % 100) * 3 + 3); }
    const anc = AREAS.map((a) => a.at(UP));
    for (let i = 0; i < M; i++) {
      const x = rx[i], y = ry[i], fy = y + 0.997, side = x < 0 ? 'A' : 'B', ax = Math.abs(x);
      // arm/torso split follows the measured gap between them (arms separate below the armpit at fy≈0.29)
      const AT = [[0.29, 0.096], [0.36, 0.097], [0.4, 0.106], [0.44, 0.125], [0.48, 0.138], [0.56, 0.152]];
      let thr = 0.102; if (fy >= 0.29) { thr = AT[AT.length - 1][1]; for (let k = 0; k < AT.length - 1; k++) if (fy < AT[k + 1][0]) { thr = mix(AT[k][1], AT[k + 1][1], (fy - AT[k][0]) / (AT[k + 1][0] - AT[k][0])); break; } }
      const leg = fy > 0.5 && ax < 0.15, arm = !leg && fy > 0.16 && ax > thr;
      const ok = (bb) => (arm ? bb.b === 's' + side || bb.a === 's' + side || bb.a === 'e' + side || bb.a === 'w' + side
        : leg ? (bb.a === 'P' && bb.b === 'i' + side) || bb.a === 'i' + side || bb.a === 'k' + side || bb.a === 'a' + side
        : bb.a === 'P' || bb.a === 'C' || bb.a === 'N');
      let d1 = 9, d2 = 9, i1 = 0, i2 = 0;
      BR.forEach((b, k) => { if (!ok(b)) return; const t = clamp((x - b.ax) * b.ux + (y - b.ay) * b.uy, 0, b.L), qx = b.ax + b.ux * t, qy = b.ay + b.uy * t, dd = Math.hypot(x - qx, y - qy); if (dd < d1) { d2 = d1; i2 = i1; d1 = dd; i1 = k; } else if (dd < d2) { d2 = dd; i2 = k; } });
      if (d2 === 9) { i2 = i1; d2 = d1; }
      const wa = 1 / Math.pow(d1 + 0.008, 6), wb = 1 / Math.pow(d2 + 0.008, 6);
      b1[i] = i1; b2[i] = i2; w1[i] = wa / (wa + wb);
      const A = BR[i1], B = BR[i2];
      al1[i] = (x - A.ax) * A.ux + (y - A.ay) * A.uy; pe1[i] = (x - A.ax) * -A.uy + (y - A.ay) * A.ux;
      al2[i] = (x - B.ax) * B.ux + (y - B.ay) * B.uy; pe2[i] = (x - B.ax) * -B.uy + (y - B.ay) * B.ux;
      torW[i] = !arm && !leg ? 1 : 0;
      { const A1 = BR[i1], B1 = BR[i2]; const J = A1.b === B1.a ? A1.b : A1.a === B1.b ? A1.a : A1.a === B1.a ? A1.a : A1.b === B1.b ? A1.b : null; if (J && i1 !== i2) { sj[i] = JK.indexOf(J); jdx[i] = x - REST[J][0]; jdy[i] = y - REST[J][1]; } }
      ph[i] = Math.random() * 6.283; rnd[i] = Math.random();
      let best = -1, bh = 0;
      anc.forEach((q, a) => { const dd = Math.hypot(x - q[0], y - q[1]), h = Math.exp(-(dd * dd) / (AREAS[a].s * AREAS[a].s)); if (h > bh) { bh = h; best = a; } });
      if (bh > 0.05) { aidx[i] = best; aheat[i] = bh; }
      spineK[i] = ax < 0.006 && y < REST.P[1] && y > REST.N[1] ? 1 : 0;
      const r1 = Math.random(), r2 = Math.random(), r3 = Math.random();
      hx[i] = (r1 + r2 + r3 - 1.5) * 0.22; hy[i] = -0.08 * Math.exp(-((hx[i] / 0.12) ** 2)) * Math.sqrt(Math.random()) + 0.004;
      dly[i] = clamp(-y) * 0.5 + Math.random() * 0.08;
    }
    // logo figure targets, paired by height so the body flows into the mark
    const paths = $$('.ncx__logo path').map((q) => new Path2D(q.getAttribute('d'))), pts = []; let gd = 0;
    while (pts.length < M && gd++ < M * 40) { const x = mix(129.8, 163.1, Math.random()), y = Math.random() * 41.7; if (paths.some((q) => octx.isPointInPath(q, x, y))) pts.push([x, y]); }
    while (pts.length < M) pts.push(pts[pts.length % Math.max(1, pts.length)] || [146, 20]);
    const S = 1.18 / 41.7, lp = pts.map(([x, y]) => [(x - 146.42) * S, (y - 41.7) * S]);
    setFrames(VP); const o = [0, 0];
    const order = Array.from({ length: M }, (_, i) => { skin(i, o); return [i, o[1] + o[0] * 0.02]; }).sort((a, b) => a[1] - b[1]);
    lp.sort((a, b) => a[1] + a[0] * 0.02 - (b[1] + b[0] * 0.02));
    order.forEach(([i], k) => { lgx[i] = lp[k][0]; lgy[i] = lp[k][1]; });
  };

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

  /* ---------- canvas: particles are plotted straight into pixel memory (fast, per-particle colour) ---------- */
  let W = 0, H = 0, DPR = 1, prog = 0, mx = -9999, my = -9999, intro = RM ? 1 : 0, inView = true, ready = false;
  const pc = d.createElement('canvas'), pctx = pc.getContext('2d');
  let img32 = null, imgData = null, BW = 0, BH = 0;
  const resize = () => {
    DPR = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = BW = Math.round(W * DPR); cv.height = BH = Math.round(H * DPR);
    pc.width = BW; pc.height = BH; imgData = pctx.createImageData(BW, BH); img32 = new Uint32Array(imgData.data.buffer);
  };
  resize(); addEventListener('resize', resize);
  if (FINE) { sec.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; }, { passive: true }); sec.addEventListener('pointerleave', () => { mx = my = -9999; }); }

  const CORAL = [232, 112, 92], GREEN = [96, 160, 74], BLUE = [64, 108, 180];
  const o = [0, 0];
  const render = (time) => {
    if (!ready) return;
    const p = prog, t = time, Pz = poseAt(p);
    const br = Math.sin(t * 1.5) * 0.003; ['H', 'N', 'C', 'sA', 'sB', 'eA', 'eB', 'wA', 'wB', 'tA', 'tB'].forEach((k) => { Pz[k][1] += br; });
    setFrames(Pz);
    const lg = seg(p, 0.86, 0.95), states = AREAS.map((_, a) => areaState(a, p));
    let fx = 0, fy = -0.5, zf = 0, act = -1;
    states.forEach((st, a) => { if (st.c >= 0 && st.c <= 1) { act = a; zf = seg(st.c, 0, 0.25) * (1 - seg(st.c, 0.82, 1)); const at = AREAS[a].at(Pz), wf = a === 3 ? (MOB ? 0.35 : 0.6) : 1; fx = mix(0, at[0], zf); fy = mix(-0.5, at[1], zf * wf); } });
    const Z = MOB ? 1.2 : 1.3, zoom = (1 + (Z - 1) * zf) * mix(1, MOB ? 0.72 : 0.92, lg);
    fy += mix(0, -0.05, lg);
    const S = (MOB ? Math.min(H * 0.48, W * 1.25) : Math.min(H * 0.82, W * 0.6)) * zoom, CX = MOB ? W * 0.5 : W * 0.66, CY = MOB ? H * 0.34 : H * 0.5;
    const toX = (x) => CX + (x - fx) * S, toY = (y) => CY + (y - fy) * S;
    const align = seg(p, 0.5, 0.57), spineGlow = bell(p, 0.5, 0.6), lift = bell(p, 0.74, 0.88);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
    { const gx = toX(0), gy = toY(0.012), gw = 0.28 * S * (1 - lg), sh = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(1, gw)); sh.addColorStop(0, `rgba(20,32,26,${(0.2 * (1 - lg)).toFixed(3)})`); sh.addColorStop(1, 'rgba(20,32,26,0)'); ctx.save(); ctx.translate(gx, gy); ctx.scale(1, 0.12); ctx.translate(-gx, -gy); ctx.fillStyle = sh; ctx.fillRect(gx - gw, gy - gw, gw * 2, gw * 2); ctx.restore(); }
    // particles → pixel buffer
    img32.fill(0);
    const ps = Math.max(2, Math.round(2.1 * DPR * Math.max(0.9, S / 720))), mr = 90, mr2 = mr * mr, formed = clamp((intro - 0.55) / 0.45);
    for (let i = 0; i < M; i++) {
      skin(i, o);
      let x = o[0], y = o[1];
      if (torW[i]) x += 0.014 * Math.sin((-0.5 - y) * 9 + 0.4) * (1 - align) * clamp((y - REST.N[1]) * 6) * clamp((REST.P[1] + 0.03 - y) * 12);
      const a = aidx[i]; let hp = 0, hc = 0;
      if (a >= 0) {
        const st = states[a], h = aheat[i]; hp = h * st.pain * formed; hc = h * st.calm;
        if (hp > 0.05) { const j = hp * 0.003; x += Math.sin(t * 23 + ph[i] * 7) * j; y += Math.cos(t * 19 + ph[i] * 5) * j; }
        const burst = st.c >= 0 && st.c <= 1 ? bell(st.c, 0.42, 0.72) : 0;
        if (burst > 0) { const rad = burst * h * (0.015 + rnd[i] * 0.04); x += Math.cos(ph[i]) * rad; y += Math.sin(ph[i]) * rad; }
      }
      x += Math.sin(t * 0.9 + ph[i]) * 0.0006; y += Math.cos(t * 0.8 + ph[i]) * 0.0006;
      if (lg > 0) { x = mix(x, lgx[i], lg); y = mix(y, lgy[i], lg); }
      if (intro < 1) { const k = ease(clamp((intro - dly[i]) / 0.42)); x = mix(hx[i], x, k) + Math.sin(k * Math.PI) * (rnd[i] - 0.5) * 0.06; y = mix(hy[i], y, k); }
      let X = toX(x), Y = toY(y);
      const dx = X + ox[i] - mx, dy = Y + oy[i] - my, d2 = dx * dx + dy * dy;
      if (d2 < mr2) { const dd = Math.sqrt(d2) || 1, f = (1 - dd / mr) * 6; ox[i] += (dx / dd) * f; oy[i] += (dy / dd) * f; }
      ox[i] *= 0.9; oy[i] *= 0.9; X += ox[i]; Y += oy[i];
      const PX = (X * DPR) | 0, PY = (Y * DPR) | 0; if (PX < 0 || PY < 0 || PX >= BW - ps || PY >= BH - ps) continue;
      let r = col[i * 3], gg = col[i * 3 + 1], b = col[i * 3 + 2];
      if (lg > 0) { const k = clamp(lg * 1.6 - 0.3); r = mix(r, BLUE[0], k); gg = mix(gg, BLUE[1], k); b = mix(b, BLUE[2], k); }
      else if (spineK[i] && spineGlow > 0.1) { r = mix(r, BLUE[0], spineGlow); gg = mix(gg, BLUE[1], spineGlow); b = mix(b, BLUE[2], spineGlow); }
      else if (hp > 0.05) { const k = Math.min(1, hp * 1.1); r = mix(r, CORAL[0], k); gg = mix(gg, CORAL[1], k); b = mix(b, CORAL[2], k); }
      else if (hc > 0.05) { const k = Math.min(1, hc); r = mix(r, GREEN[0], k); gg = mix(gg, GREEN[1], k); b = mix(b, GREEN[2], k); }
      const c32 = (255 << 24) | ((b | 0) << 16) | ((gg | 0) << 8) | (r | 0);
      for (let yy = 0; yy < ps; yy++) { const row = (PY + yy) * BW + PX; for (let xx = 0; xx < ps; xx++) img32[row + xx] = c32; }
    }
    pctx.putImageData(imgData, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(pc, 0, 0); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    // soft glow on top of each pain (screen blend keeps the anatomy visible beneath)
    ctx.globalCompositeOperation = 'source-over';
    states.forEach((st, a) => {
      const v = Math.max(st.pain, st.calm * 0.85) * formed * (1 - lg); if (v < 0.02) return;
      const at = AREAS[a].at(Pz), X = toX(at[0]), Y = toY(at[1]), rr = AREAS[a].s * 2.1 * S, c = st.pain >= st.calm ? '240,84,60' : '110,190,80';
      const gr = ctx.createRadialGradient(X, Y, 0, X, Y, rr); gr.addColorStop(0, `rgba(${c},${(v * (0.42 + 0.1 * Math.sin(t * 3 + a))).toFixed(3)})`); gr.addColorStop(0.45, `rgba(${c},${(v * 0.18).toFixed(3)})`); gr.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = gr; ctx.fillRect(X - rr, Y - rr, rr * 2, rr * 2);
    });
    ctx.globalCompositeOperation = 'source-over';
    if (act >= 0 && lg < 0.1) {
      const st = states[act], eff = bell(st.c, 0.22, 0.8), at = AREAS[act].at(Pz), X = toX(at[0]), Y = toY(at[1]), u = S;
      if (st.c < 0.32) for (let r = 0; r < 3; r++) { const fr = (t * 0.45 + r / 3) % 1, al = 0.5 * (1 - fr) * seg(st.c, 0, 0.15) * (1 - seg(st.c, 0.22, 0.32)); ctx.strokeStyle = `rgba(232,112,92,${al.toFixed(3)})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(X, Y, (0.03 + fr * 0.11) * u, 0, 6.283); ctx.stroke(); }
      if (eff > 0.01) {
        ctx.lineWidth = 1.4;
        if (act === 0) { for (let k = 0; k < 2; k++) { const a0 = t * 0.9 + k * Math.PI; ctx.strokeStyle = `rgba(255,255,255,${(0.85 * eff).toFixed(3)})`; ctx.beginPath(); ctx.arc(X, Y, 0.06 * u, a0, a0 + 1.6); ctx.stroke(); } }
        else if (act === 1) { for (let r = 0; r < 3; r++) { const fr = (t * 0.6 + r / 3) % 1; ctx.strokeStyle = `rgba(64,108,180,${(0.6 * (1 - fr) * eff).toFixed(3)})`; ctx.beginPath(); ctx.arc(X, Y, (0.035 + fr * 0.14) * u, 0, 6.283); ctx.stroke(); } }
        else if (act === 2) {
          const clean = seg(st.c, 0.3, 0.7), w = 0.2 * u; ctx.strokeStyle = `rgba(255,255,255,${(0.9 * eff).toFixed(3)})`; ctx.beginPath();
          for (let k = 0; k <= 60; k++) { const f = k / 60, xx = X - w + f * 2 * w, env = Math.sin(Math.PI * f), n = 0.6 * Math.sin(f * 58 + t * 9) + 0.4 * Math.sin(f * 97 - t * 13), cl = Math.sin(f * 25 - t * 5), yy = Y + env * 0.026 * u * mix(n, cl, clean); k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
          ctx.stroke();
        } else {
          const sx = X + 0.32 * u, sy = Y - 0.4 * u, lb = ctx.createLinearGradient(sx, sy, X, Y); lb.addColorStop(0, 'rgba(232,112,92,0)'); lb.addColorStop(1, `rgba(232,112,92,${(0.85 * eff).toFixed(3)})`);
          ctx.strokeStyle = lb; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(X, Y); ctx.stroke();
          for (let k = 0; k < 5; k++) { const fr = (t * 0.7 + k / 5) % 1; ctx.fillStyle = `rgba(232,112,92,${(Math.sin(Math.PI * fr) * eff).toFixed(3)})`; ctx.beginPath(); ctx.arc(mix(sx, X, fr), mix(sy, Y, fr), 2.2, 0, 6.283); ctx.fill(); }
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
      [['sA', -1], ['sB', 1]].forEach(([si, sg]) => { const s0 = Pz[si], Rr = 0.36 * S, cx = toX(s0[0]), cy = toY(s0[1]), a0 = Math.PI / 2 - sg * 0.55, a1 = a0 - sg * (Math.PI * 0.62) * a; ctx.strokeStyle = `rgba(125,142,57,${(0.55 * lift * (1 - lg)).toFixed(3)})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, Rr, Math.min(a0, a1), Math.max(a0, a1)); ctx.stroke(); });
    }
  };

  /* ---------- drive ---------- */
  ST.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: (s) => { prog = s.progress; const k = R.findIndex(([a, b]) => prog >= a && prog < b); setChapter(k < 0 ? R.length - 1 : k); if (bar) bar.style.transform = `scaleY(${prog.toFixed(4)})`; } });
  new IntersectionObserver((es) => es.forEach((e) => (inView = e.isIntersecting))).observe(sec);
  setChapter(0);
  const hd = $('.az-head'); if (hd) hd.classList.add('on-light');
  g.ticker.add((time) => { if (inView) render(time); });
  const img = new Image(); img.decoding = 'async'; img.src = SRC;
  img.decode().then(() => {
    build(img); ready = true;
    if (RM) return;
    const go = () => {
      g.to({ v: 0 }, { v: 1, duration: 3.4, delay: 0.3, ease: 'power1.inOut', onUpdate() { intro = this.targets()[0].v; } });
      g.fromTo('[data-ncx-in]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, delay: 1, ease: 'expo.out' });
    };
    const t0 = performance.now(), chk = () => (!$('.az-pre') || performance.now() - t0 > 7000 ? go() : setTimeout(chk, 120)); chk();
  }).catch(() => {});
})();
