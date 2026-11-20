/* AROGYATI — new concept: "From pain to motion".
   One pinned canvas. A figure made of particles stands hunched with a knot of pain at the neck; scroll locates it,
   releases it, realigns the spine, lifts the arms — and the particles finally reform into the Arogyati logo figure.
   Particles are bound to a skeleton (bone, position along bone, offset across it), so the body moves as one. */
(() => {
  const d = document, $ = (s, r = d) => r.querySelector(s), $$ = (s, r = d) => [...r.querySelectorAll(s)];
  const g = window.gsap, ST = window.ScrollTrigger;
  const sec = $('.ncx'); if (!sec || !g || !ST) return;
  const cv = $('.ncx__cv', sec), ctx = cv.getContext('2d');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches, FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), mix = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), seg = (p, a, b) => ease(clamp((p - a) / (b - a)));
  const bell = (p, a, b) => Math.sin(Math.PI * clamp((p - a) / (b - a)));

  /* ---------- skeleton ---------- */
  const J = ['H', 'N', 'C', 'P', 'sA', 'eA', 'hA', 'sB', 'eB', 'hB', 'iA', 'kA', 'fA', 'iB', 'kB', 'fB'];
  const pose = (o) => J.map((k) => o[k]);
  const legs = { iA: [-0.055, -0.52], kA: [-0.06, -0.27], fA: [-0.065, 0], iB: [0.055, -0.52], kB: [0.06, -0.27], fB: [0.065, 0] };
  const P_PAIN = pose({ H: [0.085, -0.915], N: [0.05, -0.845], C: [0.025, -0.745], P: [0, -0.515], sA: [-0.075, -0.8], eA: [-0.15, -0.93], hA: [0.02, -0.865], sB: [0.125, -0.785], eB: [0.16, -0.635], hB: [0.165, -0.49], ...legs, iA: [-0.05, -0.515], iB: [0.06, -0.515] });
  const P_UP = pose({ H: [0, -0.95], N: [0, -0.86], C: [0, -0.76], P: [0, -0.52], sA: [-0.1, -0.81], eA: [-0.125, -0.65], hA: [-0.135, -0.5], sB: [0.1, -0.81], eB: [0.125, -0.65], hB: [0.135, -0.5], ...legs });
  const P_T = pose({ H: [0, -0.955], N: [0, -0.865], C: [0, -0.765], P: [0, -0.52], sA: [-0.1, -0.815], eA: [-0.25, -0.84], hA: [-0.39, -0.87], sB: [0.1, -0.815], eB: [0.25, -0.84], hB: [0.39, -0.87], ...legs, fA: [-0.085, 0], fB: [0.085, 0], kA: [-0.07, -0.27], kB: [0.07, -0.27] });
  const P_V = pose({ H: [0, -0.96], N: [0, -0.87], C: [0, -0.77], P: [0, -0.52], sA: [-0.1, -0.82], eA: [-0.18, -0.97], hA: [-0.27, -1.1], sB: [0.1, -0.82], eB: [0.18, -0.97], hB: [0.27, -1.1], ...legs, fA: [-0.1, 0], fB: [0.1, 0], kA: [-0.08, -0.27], kB: [0.08, -0.27] });
  const ix = Object.fromEntries(J.map((k, i) => [k, i]));
  // bone: [a, b, rA, rB, tag]
  const B = [
    ['P', 'C', 0.088, 0.1, 'spine'], ['C', 'N', 0.04, 0.03, 'spine'], ['C', 'sA', 0.05, 0.04, 'sh'], ['C', 'sB', 0.05, 0.04, 'sh'],
    ['sA', 'eA', 0.033, 0.027, 'arm'], ['eA', 'hA', 0.027, 0.02, 'arm'], ['sB', 'eB', 0.033, 0.027, 'arm'], ['eB', 'hB', 0.027, 0.02, 'arm'],
    ['P', 'iA', 0.07, 0.055, 'hip'], ['P', 'iB', 0.07, 0.055, 'hip'], ['iA', 'kA', 0.052, 0.038, 'leg'], ['kA', 'fA', 0.037, 0.025, 'leg'], ['iB', 'kB', 0.052, 0.038, 'leg'], ['kB', 'fB', 0.037, 0.025, 'leg'],
  ].map(([a, b, r0, r1, t]) => ({ a: ix[a], b: ix[b], r0, r1, t }));
  const HEAD_R = 0.064;
  const blendPose = (A, Bp, t) => A.map((p, i) => [mix(p[0], Bp[i][0], t), mix(p[1], Bp[i][1], t)]);

  /* ---------- particles ---------- */
  const MOB = innerWidth < 900, M = MOB ? 5200 : 10000;
  const bone = new Int16Array(M), uu = new Float32Array(M), vv = new Float32Array(M), sz = new Float32Array(M), ph = new Float32Array(M);
  const heat = new Float32Array(M), spineK = new Float32Array(M), ox = new Float32Array(M), oy = new Float32Array(M), lx = new Float32Array(M), ly = new Float32Array(M);
  const sx0 = new Float32Array(M), sy0 = new Float32Array(M), dly = new Float32Array(M), rnd = new Float32Array(M);
  {
    const area = B.map((b) => { const A = P_UP[b.a], Bb = P_UP[b.b]; return Math.hypot(Bb[0] - A[0], Bb[1] - A[1]) * (b.r0 + b.r1); });
    const headA = Math.PI * HEAD_R * HEAD_R * 0.62, tot = area.reduce((s, x) => s + x, 0) + headA;
    let k = 0;
    const put = (bi, u, v) => { if (k >= M) return; bone[k] = bi; uu[k] = u; vv[k] = v; sz[k] = 0.9 + Math.random() * 1.1; ph[k] = Math.random() * 6.283; rnd[k] = Math.random(); k++; };
    B.forEach((b, bi) => { const n = Math.round((area[bi] / tot) * M); for (let i = 0; i < n; i++) { const edge = Math.random() < 0.2; put(bi, Math.random(), edge ? (Math.random() < 0.5 ? -1 : 1) * (0.9 + Math.random() * 0.1) : Math.random() * 2 - 1); } });
    while (k < M) { const a = Math.random() * 6.283, r = Math.random() < 0.22 ? 0.92 + Math.random() * 0.08 : Math.sqrt(Math.random()); put(-1, a, r); }
  }
  const NECK = [0.045, -0.85];
  const bodyPos = (Pz, i, out) => {
    const bi = bone[i];
    if (bi < 0) { const Hh = Pz[0]; out[0] = Hh[0] + Math.cos(uu[i]) * vv[i] * HEAD_R; out[1] = Hh[1] + Math.sin(uu[i]) * vv[i] * HEAD_R * 1.12; return; }
    const b = B[bi], A = Pz[b.a], Bb = Pz[b.b], u = uu[i];
    const dx = Bb[0] - A[0], dy = Bb[1] - A[1], L = Math.hypot(dx, dy) || 1, r = mix(b.r0, b.r1, u);
    out[0] = A[0] + dx * u + (-dy / L) * vv[i] * r; out[1] = A[1] + dy * u + (dx / L) * vv[i] * r;
  };
  { const o = [0, 0]; for (let i = 0; i < M; i++) { bodyPos(P_PAIN, i, o); const dd = Math.hypot(o[0] - NECK[0], o[1] - NECK[1]); heat[i] = Math.exp(-(dd * dd) / (0.1 * 0.1)); const b = bone[i] >= 0 ? B[bone[i]] : null; spineK[i] = b && b.t === 'spine' && Math.abs(vv[i]) < 0.32 ? 1 : 0; } }

  /* logo figure targets (the brand mark: leaf body, two leaf arms raised, head) */
  const lgx = new Float32Array(M), lgy = new Float32Array(M);
  {
    const paths = $$('.ncx__logo path').map((p) => new Path2D(p.getAttribute('d')));
    const oc = d.createElement('canvas'), octx = oc.getContext('2d'); oc.width = 4; oc.height = 4;
    const pts = []; let guard = 0;
    const X0 = 129.8, X1 = 163.1, Y0 = 0, Y1 = 41.7;
    while (pts.length < M && guard++ < M * 40) {
      const x = mix(X0, X1, Math.random()), y = mix(Y0, Y1, Math.random());
      if (paths.some((p) => octx.isPointInPath(p, x, y))) pts.push([x, y]);
    }
    while (pts.length < M) pts.push(pts[pts.length % Math.max(1, pts.length)] || [146, 20]);
    const S = 1.18 / (Y1 - Y0), cxL = 146.42;
    const lp = pts.map(([x, y]) => [(x - cxL) * S, (y - Y1) * S]);
    // pair by height so the body flows into the mark instead of scrambling
    const o = [0, 0], bodyY = Array.from({ length: M }, (_, i) => { bodyPos(P_V, i, o); return [i, o[1] + o[0] * 0.02]; }).sort((a, b) => a[1] - b[1]);
    lp.sort((a, b) => a[1] + a[0] * 0.02 - (b[1] + b[0] * 0.02));
    bodyY.forEach(([i], k) => { lgx[i] = lp[k][0]; lgy[i] = lp[k][1]; });
  }

  /* ---------- copy / chapters ---------- */
  const chs = $$('.ncx-ch', sec), word = $('[data-ncx-word]'), bar = $('.ncx__bar i'), num = $('[data-ncx-n]'), tint = $('.ncx__tint');
  const RANGES = [[0, 0.13], [0.13, 0.3], [0.3, 0.47], [0.47, 0.63], [0.63, 0.82], [0.82, 1.01]];
  const WORDS = ['WELLNESS', 'LOCATE', 'RELEASE', 'REALIGN', 'MOVE', 'AROGYATI'];
  const TINTS = ['#E4EEDD', '#F6E6DA', '#E8E5F5', '#DFEAF6', '#E3F0E6', '#E4EEDD'];
  let cur = -1;
  const setChapter = (k) => {
    if (k === cur) return; cur = k;
    chs.forEach((c, i) => c.classList.toggle('is-on', i === k));
    if (num) num.textContent = String(k + 1).padStart(2, '0');
    if (tint) tint.style.setProperty('--t', TINTS[k]);
    if (word) { g.to(word, { opacity: 0, y: -20, duration: 0.35, ease: 'power2.in', overwrite: true, onComplete: () => { word.textContent = WORDS[k]; g.fromTo(word, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' }); } }); }
  };

  /* ---------- canvas ---------- */
  let W = 0, H = 0, DPR = 1, prog = 0, mx = -9999, my = -9999, intro = RM ? 1 : 0, inView = true;
  const resize = () => {
    DPR = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    for (let i = 0; i < M; i++) { sx0[i] = (Math.random() - 0.2) * W * 1.4; sy0[i] = (Math.random() - 0.5) * H * 1.6 + H / 2; }
  };
  resize(); addEventListener('resize', resize);
  for (let i = 0; i < M; i++) dly[i] = Math.random() * 0.55;
  if (FINE) { sec.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; }, { passive: true }); sec.addEventListener('pointerleave', () => { mx = my = -9999; }); }

  const INK = [23, 35, 27], CORAL = [232, 112, 92], GREEN = [79, 138, 63], BLUE = [64, 108, 180], OLIVE = [125, 142, 57];
  const NB = 14; // colour buckets
  const bucketPaths = Array.from({ length: NB * 3 + 2 }, () => []);
  const o = [0, 0];
  const render = (time) => {
    const p = prog, t = time;
    // pose & camera timeline
    const up = seg(p, 0.3, 0.46), tp = seg(p, 0.63, 0.72), vp = seg(p, 0.72, 0.8), lg = seg(p, 0.82, 0.93);
    let Pz = blendPose(P_PAIN, P_UP, up); if (tp > 0) Pz = blendPose(Pz, P_T, tp); if (vp > 0) Pz = blendPose(Pz, P_V, vp);
    const br = Math.sin(t * 1.5) * 0.004; Pz = Pz.map((q, k) => (k <= 2 || (k >= 4 && k <= 9) ? [q[0], q[1] + br * (k <= 2 ? 1 : 0.6)] : q));
    const ZM = MOB ? 1.3 : 1.75, zoom = mix(1, ZM, seg(p, 0.12, 0.22)) * mix(1, 1 / ZM, seg(p, 0.3, 0.42)) * mix(1, MOB ? 0.72 : 0.92, lg);
    const focus = [mix(0, NECK[0], seg(p, 0.12, 0.22) * (1 - seg(p, 0.3, 0.42))), mix(-0.52, NECK[1], seg(p, 0.12, 0.22) * (1 - seg(p, 0.3, 0.42))) + mix(0, -0.05, lg)];
    const S = (MOB ? Math.min(H * 0.44, W * 0.95) : Math.min(H * 0.74, W * 0.6)) * zoom;
    const CX = MOB ? W * 0.5 : W * 0.62, CY = MOB ? H * 0.33 : H * 0.5;
    const toX = (x) => CX + (x - focus[0]) * S, toY = (y) => CY + (y - focus[1]) * S;
    const pain = 1 - seg(p, 0.3, 0.44), burst = bell(p, 0.29, 0.43), calm = bell(p, 0.34, 0.5), align = seg(p, 0.47, 0.58), spineGlow = bell(p, 0.47, 0.64), lift = bell(p, 0.63, 0.82);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
    // ground shadow + the warm glow under the knot
    { const gx = toX(0), gy = toY(0.012), gw = 0.32 * S * (1 - lg), sh = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(1, gw)); sh.addColorStop(0, `rgba(20,32,26,${(0.16 * intro * (1 - lg)).toFixed(3)})`); sh.addColorStop(1, 'rgba(20,32,26,0)'); ctx.save(); ctx.translate(gx, gy); ctx.scale(1, 0.14); ctx.translate(-gx, -gy); ctx.fillStyle = sh; ctx.fillRect(gx - gw, gy - gw, gw * 2, gw * 2); ctx.restore(); }
    { const kg = pain * intro, cg = calm * 0.8; if (kg + cg > 0.02) { const nx = toX(NECK[0]), ny = toY(NECK[1]), rr = 0.17 * S; const gr = ctx.createRadialGradient(nx, ny, 0, nx, ny, rr); const col = kg > cg ? '232,112,92' : '79,138,63', a = Math.max(kg * (0.32 + 0.08 * Math.sin(t * 3)), cg * 0.3); gr.addColorStop(0, `rgba(${col},${a.toFixed(3)})`); gr.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = gr; ctx.fillRect(nx - rr, ny - rr, rr * 2, rr * 2); } }
    for (let k = 0; k < bucketPaths.length; k++) bucketPaths[k].length = 0;
    const mr = 90, mr2 = mr * mr, unit = S;
    for (let i = 0; i < M; i++) {
      bodyPos(Pz, i, o);
      let x = o[0], y = o[1];
      // a slight S-curve in the spine that straightens while realigning
      if (bone[i] === 0 || bone[i] === 1) x += 0.022 * Math.sin(uu[i] * Math.PI * 1.6 + 0.4) * (1 - align);
      // pain: knot jitters; release: it opens outward and settles
      const h = heat[i];
      if (h > 0.05) {
        const j = h * pain * 0.007;
        x += Math.sin(t * 23 + ph[i] * 7) * j; y += Math.cos(t * 19 + ph[i] * 5) * j;
        const ang = ph[i], rad = burst * h * (0.05 + rnd[i] * 0.13);
        x += Math.cos(ang) * rad; y += Math.sin(ang) * rad;
      }
      // breathing shimmer
      x += Math.sin(t * 0.9 + ph[i]) * 0.0016; y += Math.cos(t * 0.8 + ph[i]) * 0.0016;
      if (lg > 0) { x = mix(x, lgx[i], lg); y = mix(y, lgy[i], lg); }
      let X = toX(x), Y = toY(y);
      // intro: assemble from a drifting cloud
      if (intro < 1) { const k = ease(clamp((intro - dly[i]) / 0.45)); X = mix(sx0[i], X, k); Y = mix(sy0[i], Y, k); }
      // cursor: particles part around the pointer, then spring back
      const dx = X + ox[i] - mx, dy = Y + oy[i] - my, d2 = dx * dx + dy * dy;
      if (d2 < mr2) { const dd = Math.sqrt(d2) || 1, f = (1 - dd / mr) * 18; ox[i] += (dx / dd) * f * 0.35; oy[i] += (dy / dd) * f * 0.35; }
      ox[i] *= 0.9; oy[i] *= 0.9; X += ox[i]; Y += oy[i];
      if (X < -10 || X > W + 10 || Y < -10 || Y > H + 10) continue;
      // colour: ink body, coral knot, green as it calms, blue spine while aligning, brand blue as the mark
      let c = 0; // 0 ink
      const hp = h * pain;
      if (lg > 0.5) c = 4; else if (spineK[i] && spineGlow > 0.25) c = 3; else if (hp > 0.12) c = 1; else if (h > 0.12 && calm > 0.2) c = 2;
      const lvl = c === 1 ? Math.min(NB - 1, Math.floor(hp * NB)) : c === 2 ? Math.min(NB - 1, Math.floor(h * calm * NB)) : c === 3 ? Math.min(NB - 1, Math.floor(spineGlow * NB)) : 0;
      const key = c === 0 ? 0 : c === 4 ? 1 : (c - 1) * NB + lvl + 2;
      (bucketPaths[key] || bucketPaths[0]).push(X, Y, sz[i] * (MOB ? 1.1 : 1) * (c === 1 ? 1 + hp * 0.9 : c === 3 ? 1.35 : c === 4 ? 1.2 : 1));
    }
    const fill = (arr, col, a) => { if (!arr.length) return; ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${a})`; ctx.beginPath(); for (let k = 0; k < arr.length; k += 3) { const s = arr[k + 2]; ctx.rect(arr[k] - s / 2, arr[k + 1] - s / 2, s, s); } ctx.fill(); };
    const inkMix = (col, f) => INK.map((v, k) => Math.round(mix(v, col[k], f)));
    fill(bucketPaths[0], inkMix(OLIVE, 0.25 * lift), 0.72);
    fill(bucketPaths[1], BLUE, 0.85);
    for (let l = 0; l < NB; l++) {
      fill(bucketPaths[2 + l], inkMix(CORAL, 0.35 + 0.65 * (l / NB)), 0.9);
      fill(bucketPaths[2 + NB + l], inkMix(GREEN, 0.4 + 0.6 * (l / NB)), 0.88);
      fill(bucketPaths[2 + 2 * NB + l], inkMix(BLUE, 0.5 + 0.5 * (l / NB)), 0.9);
    }
    // located: soft rings breathe out from the knot
    const loc = clamp(seg(p, 0.1, 0.18) * pain) * intro;
    if (loc > 0.01) {
      const nx = toX(NECK[0]), ny = toY(NECK[1]);
      for (let r = 0; r < 3; r++) { const fr = (t * 0.45 + r / 3) % 1; ctx.strokeStyle = `rgba(232,112,92,${(0.45 * (1 - fr) * loc).toFixed(3)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(nx, ny, (0.04 + fr * 0.16) * unit, 0, 6.283); ctx.stroke(); }
    }
    // realign: vertebrae light up one by one along the straightened spine
    if (spineGlow > 0.02) {
      const A = Pz[ix.P], Cc = Pz[ix.N];
      for (let v = 0; v < 12; v++) {
        const f = v / 11, on = clamp(align * 14 - v * 0.9) * spineGlow;
        if (on <= 0) continue;
        const X = toX(mix(A[0], Cc[0], f)), Y = toY(mix(A[1], Cc[1], f));
        ctx.fillStyle = `rgba(255,255,255,${(0.95 * on).toFixed(3)})`; ctx.beginPath(); ctx.arc(X, Y, 3.2, 0, 6.283); ctx.fill();
        ctx.strokeStyle = `rgba(64,108,180,${on.toFixed(3)})`; ctx.lineWidth = 1.4; ctx.stroke();
      }
    }
    // move: the arms draw their arcs as they rise
    if (lift > 0.02 && lg < 0.6) {
      const a = (tp + vp) / 2;
      [[ix.sA, -1], [ix.sB, 1]].forEach(([si, sgn]) => {
        const s = Pz[si], R = 0.3 * S, cx = toX(s[0]), cy = toY(s[1]);
        const a0 = Math.PI / 2 - sgn * 0.12, a1 = a0 - sgn * (Math.PI * 0.85) * a;
        ctx.strokeStyle = `rgba(125,142,57,${(0.55 * lift * (1 - lg)).toFixed(3)})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, R, Math.min(a0, a1), Math.max(a0, a1)); ctx.stroke();
      });
    }
  };

  /* ---------- drive ---------- */
  ST.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: (s) => { prog = s.progress; const k = RANGES.findIndex(([a, b]) => prog >= a && prog < b); setChapter(k < 0 ? 5 : k); if (bar) bar.style.transform = `scaleY(${prog.toFixed(4)})`; } });
  new IntersectionObserver((es) => es.forEach((e) => (inView = e.isIntersecting))).observe(sec);
  setChapter(0);
  const hd = $('.az-head'); if (hd) hd.classList.add('on-light');
  g.ticker.add((time) => { if (inView) render(time); });
  if (!RM) {
    const go = () => {
      g.to({ v: 0 }, { v: 1, duration: 2.8, ease: 'power2.inOut', onUpdate() { intro = this.targets()[0].v; } });
      g.fromTo('.ncx-ch.is-on .ncx-ln>span', { yPercent: 110 }, { yPercent: 0, duration: 1.3, stagger: 0.08, ease: 'expo.out', delay: 0.6, clearProps: 'transform' });
      g.fromTo('[data-ncx-in]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, delay: 1, ease: 'expo.out' });
    };
    const t0 = performance.now(), chk = () => (!$('.az-pre') || performance.now() - t0 > 7000 ? go() : setTimeout(chk, 120)); chk();
  }
})();
