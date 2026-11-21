/* AROGYATI — new concept: "From pain to motion".
   An all-particle anatomical body rendered on the GPU (three.js points). The body is rigged like cut-out
   animation: 14 parts (head, torso, upper arm / forearm / hand, thigh / shin / foot per side), each rotating at
   a real joint with a round joint cap — every particle belongs to exactly one part and moves rigidly with it, so
   joints can never tear or thin out. It rises from a heap of particles, four pains (neck, shoulder, lower back,
   knee) are located, treated and healed, then the body moves freely and its particles reform into the logo. */
import * as THREE from '/home/vendor/three/three.module.min.js';

(() => {
  const d = document, $ = (s, r = d) => r.querySelector(s), $$ = (s, r = d) => [...r.querySelectorAll(s)];
  const g = window.gsap, ST = window.ScrollTrigger;
  const sec = $('.ncx'); if (!sec || !g || !ST) return;
  const cv = $('.ncx__cv', sec), ctx = cv.getContext('2d');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches, FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), mix = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), seg = (p, a, b) => ease(clamp((p - a) / (b - a)));
  const bell = (p, a, b) => Math.sin(Math.PI * clamp((p - a) / (b - a)));
  const MOB = innerWidth < 900, NP = MOB ? 32000 : 70000;
  const RIG = '/home/assets/img/rig/';
  const ORDER = ['thighA', 'shinA', 'footA', 'thighB', 'shinB', 'footB', 'torso', 'head', 'uarmA', 'farmA', 'handA', 'uarmB', 'farmB', 'handB'];

  /* ---------- skeleton & poses ---------- */
  let meta = null, IW = 1, IH = 1, REST = null, KEYS = null;
  const BONES = [['P', 'C'], ['C', 'N'], ['N', 'H'], ['C', 'sA'], ['sA', 'eA'], ['eA', 'wA'], ['wA', 'tA'], ['C', 'sB'], ['sB', 'eB'], ['eB', 'wB'], ['wB', 'tB'], ['P', 'iA'], ['iA', 'kA'], ['kA', 'aA'], ['aA', 'oA'], ['P', 'iB'], ['iB', 'kB'], ['kB', 'aB'], ['aB', 'oB']];
  const clone = (P) => Object.fromEntries(Object.entries(P).map(([k, v]) => [k, v.slice()]));
  const rot = (P, keys, pivot, deg) => { const [px, py] = P[pivot], a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a); keys.forEach((k) => { const [x, y] = P[k], dx = x - px, dy = y - py; P[k] = [px + dx * c - dy * s, py + dx * s + dy * c]; }); return P; };
  const mv = (P, keys, dx, dy) => { keys.forEach((k) => { P[k] = [P[k][0] + dx, P[k][1] + dy]; }); return P; };
  const ARM_A = ['eA', 'wA', 'tA'], ARM_B = ['eB', 'wB', 'tB'];
  const makePoses = () => {
    const UP = clone(REST);
    const SH = rot(clone(REST), ARM_B, 'sB', -64);
    const KNEE = (() => { const P = clone(REST); rot(P, ['kA', 'aA', 'oA'], 'iA', 6); rot(P, ['aA', 'oA'], 'kA', -24); mv(P, ['P', 'C', 'N', 'H', 'sA', 'sB', ...ARM_A, ...ARM_B, 'iB', 'kB', 'aB', 'oB'], 0.004, 0); return P; })();
    const TP = (() => { const P = clone(REST); rot(P, ARM_A, 'sA', 54); rot(P, ARM_B, 'sB', -54); return P; })();
    const VP = (() => { const P = clone(REST); rot(P, ARM_A, 'sA', 104); rot(P, ARM_B, 'sB', -104); rot(P, ['wA', 'tA'], 'eA', 8); rot(P, ['wB', 'tB'], 'eB', -8); return P; })();
    KEYS = [[0, UP], [0.355, UP], [0.385, SH], [0.405, SH], [0.43, UP], [0.67, UP], [0.7, KNEE], [0.72, KNEE], [0.745, UP], [0.78, TP], [0.84, VP], [1, VP]];
  };
  const poseAt = (p) => {
    let k = 0; while (k < KEYS.length - 2 && p > KEYS[k + 1][0]) k++;
    const [t0, A] = KEYS[k], [t1, B] = KEYS[k + 1], t = ease(clamp((p - t0) / Math.max(1e-4, t1 - t0))), o = {};
    o.P = [mix(A.P[0], B.P[0], t), mix(A.P[1], B.P[1], t)];
    for (const [a, b] of BONES) { // blend by angle so limbs swing without shrinking
      const aa = Math.atan2(A[b][1] - A[a][1], A[b][0] - A[a][0]); let ab = Math.atan2(B[b][1] - B[a][1], B[b][0] - B[a][0]);
      while (ab - aa > Math.PI) ab -= 2 * Math.PI; while (ab - aa < -Math.PI) ab += 2 * Math.PI;
      const an = mix(aa, ab, t), L = mix(Math.hypot(A[b][0] - A[a][0], A[b][1] - A[a][1]), Math.hypot(B[b][0] - B[a][0], B[b][1] - B[a][1]), t);
      o[b] = [o[a][0] + Math.cos(an) * L, o[a][1] + Math.sin(an) * L];
    }
    return o;
  };
  // per part: image px → figure units (rigid rotation at the proximal joint, optional stretch along the bone)
  const xf = {};
  const partXform = (Pz) => {
    for (const n of ORDER) {
      const pt = meta.parts[n], A0 = REST[pt.a], B0 = REST[pt.b], A1 = Pz[pt.a], B1 = Pz[pt.b];
      const fr = Math.atan2(B0[1] - A0[1], B0[0] - A0[0]), fp = Math.atan2(B1[1] - A1[1], B1[0] - A1[0]);
      const s = Math.hypot(B1[0] - A1[0], B1[1] - A1[1]) / Math.hypot(B0[0] - A0[0], B0[1] - A0[1]);
      const cr = Math.cos(-fr), sr = Math.sin(-fr), cp = Math.cos(fp), sp = Math.sin(fp);
      const m11 = cp * s * cr - sp * sr, m12 = -cp * s * sr - sp * cr, m21 = sp * s * cr + cp * sr, m22 = -sp * s * sr + cp * cr;
      const k = 1 / IH, ox = -IW / 2 / IH - A0[0], oy = -0.997 - A0[1];
      xf[n] = [m11 * k, m21 * k, m12 * k, m22 * k, A1[0] + m11 * ox + m12 * oy, A1[1] + m21 * ox + m22 * oy];
    }
  };

  /* ---------- pains & chapters ---------- */
  const AREAS = [
    { at: (P) => [mix(P.C[0], P.N[0], 0.35), mix(P.C[1], P.N[1], 0.35)], s: 0.05 },
    { at: (P) => [mix(P.sB[0], P.eB[0], 0.12), mix(P.sB[1], P.eB[1], 0.12)], s: 0.05 },
    { at: (P) => [mix(P.P[0], P.C[0], 0.22), mix(P.P[1], P.C[1], 0.22)], s: 0.06 },
    { at: (P) => P.kA.slice(), s: 0.045 },
  ];
  const R = [[0, 0.1], [0.1, 0.26], [0.26, 0.42], [0.42, 0.58], [0.58, 0.74], [0.74, 0.86], [0.86, 1.01]];
  const areaState = (a, p) => {
    const [s, e] = R[a + 1], c = (p - s) / (e - s);
    if (c < 0) return { pain: 0.32, calm: 0, c };
    if (c > 1) return { pain: 0, calm: 0, c };
    return { pain: mix(0.32, 1, seg(c, 0, 0.22)) * (1 - seg(c, 0.45, 0.8)), calm: bell(c, 0.5, 1.02), c };
  };
  const chs = $$('.ncx-ch', sec), word = $('[data-ncx-word]'), bar = $('.ncx__bar i'), num = $('[data-ncx-n]'), tint = $('.ncx__tint');
  const tag = $('.ncx__tag'), tagB = $('[data-ncx-tag]'), tagE = $('[data-ncx-tagm]');
  const WORDS = ['WELLNESS', 'NECK', 'SHOULDER', 'BACK', 'KNEE', 'MOVE', 'AROGYATI'];
  const TINTS = ['#E4EEDD', '#F6E6DA', '#DFEAF6', '#E8E5F5', '#F3E9DC', '#E3F0E6', '#E4EEDD'];
  const TAGS = [null, ['Neck pain', 'Osteopathy'], ['Frozen shoulder', 'Super Inductive System'], ['Lower back pain', 'Matrix Rhythm Therapy'], ['Knee pain', 'Class IV Laser']];
  let cur = -1, scanT = -10;
  const setChapter = (k) => {
    if (k === cur) return; cur = k; scanT = performance.now() / 1000;
    chs.forEach((c, i) => c.classList.toggle('is-on', i === k));
    if (num) num.textContent = String(k + 1).padStart(2, '0');
    if (tint) tint.style.setProperty('--t', TINTS[k]);
    if (TAGS[k] && tagB) { tagB.textContent = TAGS[k][0]; tagE.textContent = TAGS[k][1]; }
    if (word) g.to(word, { opacity: 0, y: -20, duration: 0.35, ease: 'power2.in', overwrite: true, onComplete: () => { word.textContent = WORDS[k]; g.fromTo(word, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' }); } });
  };

  /* ---------- layers: back 2D (dust, platform) · GPU particles · front 2D (treatment graphics) ---------- */
  const mkCanvas = () => { const c = d.createElement('canvas'); c.className = 'ncx__cv'; c.setAttribute('aria-hidden', 'true'); return c; };
  const glc = mkCanvas(), fxc = mkCanvas(); cv.after(glc); glc.after(fxc); const fctx = fxc.getContext('2d');
  let renderer = null;
  try { renderer = new THREE.WebGLRenderer({ canvas: glc, alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' }); renderer.setClearColor(0x000000, 0); } catch (e) { renderer = null; }
  const scene = new THREE.Scene(), camera = new THREE.Camera();
  const U = {
    uMa: { value: Array.from({ length: 14 }, () => new THREE.Vector3()) }, uMb: { value: Array.from({ length: 14 }, () => new THREE.Vector3()) },
    uView: { value: new THREE.Vector4() }, uFocus: { value: new THREE.Vector2() }, uRes: { value: new THREE.Vector2(1, 1) },
    uIntro: { value: RM ? 1 : 0 }, uLogo: { value: 0 }, uTime: { value: 0 }, uSize: { value: 2 }, uMouse: { value: new THREE.Vector3(-9999, -9999, 90) },
    uArea: { value: Array.from({ length: 4 }, () => new THREE.Vector3()) }, uPain: { value: Array.from({ length: 4 }, () => new THREE.Vector2()) },
    uSpine: { value: 0 }, uScan: { value: -1 },
  };
  const VERT = /* glsl */`
    attribute float aPart; attribute vec2 aUV; attribute vec3 aColor; attribute vec2 aHeap; attribute vec2 aLogo; attribute vec2 aRest; attribute float aRnd; attribute float aDelay;
    uniform vec3 uMa[14]; uniform vec3 uMb[14]; uniform vec4 uView; uniform vec2 uFocus; uniform vec2 uRes;
    uniform float uIntro, uLogo, uTime, uSize, uSpine, uScan; uniform vec3 uMouse; uniform vec3 uArea[4]; uniform vec2 uPain[4];
    varying vec3 vCol; varying float vA;
    float e3(float t){ return t < 0.5 ? 4.0*t*t*t : 1.0 - pow(-2.0*t + 2.0, 3.0) / 2.0; }
    void main(){
      int i = int(aPart + 0.5); vec3 p = vec3(aUV, 1.0);
      vec2 u = vec2(dot(uMa[i], p), dot(uMb[i], p));
      vec2 body = u;
      u += 0.0007 * vec2(sin(uTime*0.9 + aRnd*40.0), cos(uTime*0.8 + aRnd*31.0));
      // pains: colour by distance to each posed pain centre
      vec3 col = aColor; float hot = 0.0, calm = 0.0;
      for (int k = 0; k < 4; k++) { vec2 dd = body - uArea[k].xy; float h = exp(-dot(dd,dd) / (uArea[k].z*uArea[k].z)); hot = max(hot, h * uPain[k].x); calm = max(calm, h * uPain[k].y); }
      col = mix(col, vec3(0.93, 0.36, 0.27), clamp(hot * 1.15, 0.0, 1.0));
      col = mix(col, vec3(0.42, 0.72, 0.31), clamp(calm, 0.0, 1.0));
      float sp = step(abs(aRest.x), 0.007) * step(aRest.y, -0.52) * step(-0.865, aRest.y);
      col = mix(col, vec3(0.30, 0.48, 0.80), sp * uSpine);
      // diagnostic scan: a bright band passing down the body
      float sb = uScan > -1.5 ? exp(-pow((body.y - uScan) / 0.012, 2.0)) : 0.0; col = mix(col, vec3(1.0, 1.0, 0.92), sb * 0.32);
      // logo: flow into the brand mark
      if (uLogo > 0.0) { float k = e3(clamp(uLogo * 1.15 - aRnd * 0.15, 0.0, 1.0)); u = mix(u, aLogo, k) + vec2(sin(k*3.14159) * (aRnd - 0.5) * 0.08, 0.0); col = mix(col, vec3(0.25, 0.42, 0.71), clamp(uLogo*1.6 - 0.3, 0.0, 1.0)); }
      // intro: rise from the heap on the floor, feet first
      if (uIntro < 1.0) { float k = e3(clamp((uIntro - aDelay) / 0.42, 0.0, 1.0)); u = mix(aHeap, u, k) + vec2(sin(k*3.14159) * (aRnd - 0.5) * 0.06, 0.0); }
      vec2 s = uView.xy + (u - uFocus) * uView.z;
      // cursor parts the particles
      vec2 md = s - uMouse.xy; float ml = length(md); if (ml < uMouse.z) s += md / max(ml, 0.001) * (1.0 - ml / uMouse.z) * 14.0;
      gl_Position = vec4(s.x / uRes.x * 2.0 - 1.0, 1.0 - s.y / uRes.y * 2.0, 0.0, 1.0);
      gl_PointSize = uSize * (0.8 + aRnd * 0.45) * (1.0 + hot * 0.35);
      vCol = col; vA = 1.0;
    }`;
  const FRAG = /* glsl */`
    varying vec3 vCol; varying float vA;
    void main(){ vec2 c = gl_PointCoord - 0.5; float r = length(c); float a = smoothstep(0.5, 0.32, r) * vA; if (a < 0.02) discard; gl_FragColor = vec4(vCol * a, a); }`;
  const mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthTest: false, depthWrite: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor });
  let points = null, NPa = 0, bodyArea = 1;

  /* sample the rig into particles: every spot of the body gets particles only from the part visible there */
  const build = (imgs) => {
    const data = {}; ORDER.forEach((n) => { const im = imgs[n], c = d.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0); data[n] = x.getImageData(0, 0, im.width, im.height).data; });
    const top = (X, Y) => { for (let k = ORDER.length - 1; k >= 0; k--) { const n = ORDER[k], pt = meta.parts[n], u = X - pt.x, v = Y - pt.y; if (u < 0 || v < 0 || u >= pt.w || v >= pt.h) continue; const o = ((v | 0) * pt.w + (u | 0)) * 4; if (data[n][o + 3] >= 128) return [k, o]; } return null; };
    let area = 0; for (let y = 0; y < IH; y += 2) for (let x = 0; x < IW; x += 2) if (top(x, y)) area += 4;
    bodyArea = area;
    const step = Math.sqrt(area / NP), P = new Float32Array(NP * 3), part = new Float32Array(NP), uv = new Float32Array(NP * 2), col = new Float32Array(NP * 3), heap = new Float32Array(NP * 2), logo = new Float32Array(NP * 2), rest = new Float32Array(NP * 2), rnd = new Float32Array(NP), dly = new Float32Array(NP);
    let n = 0;
    for (let gy = 0; gy < IH && n < NP; gy += step) for (let gx = 0; gx < IW && n < NP; gx += step) {
      const X = gx + Math.random() * step, Y = gy + Math.random() * step, hit = top(X, Y); if (!hit) continue;
      const [k, o] = hit, px = data[ORDER[k]];
      part[n] = k; uv[n * 2] = X; uv[n * 2 + 1] = Y; col[n * 3] = px[o] / 255; col[n * 3 + 1] = px[o + 1] / 255; col[n * 3 + 2] = px[o + 2] / 255;
      const rx = (X - IW / 2) / IH, ry = Y / IH - 0.997; rest[n * 2] = rx; rest[n * 2 + 1] = ry;
      const hx = (Math.random() + Math.random() + Math.random() - 1.5) * 0.22; heap[n * 2] = hx; heap[n * 2 + 1] = -0.085 * Math.exp(-((hx / 0.12) ** 2)) * Math.sqrt(Math.random()) + 0.004;
      rnd[n] = Math.random(); dly[n] = clamp(Y / IH) * 0.5 + Math.random() * 0.08; n++;
    }
    NPa = n;
    // logo targets, paired by height so the body flows into the mark
    const paths = $$('.ncx__logo path').map((q) => new Path2D(q.getAttribute('d'))), oc = d.createElement('canvas').getContext('2d'), pts = []; let gd = 0;
    while (pts.length < NPa && gd++ < NPa * 40) { const x = mix(129.8, 163.1, Math.random()), y = Math.random() * 41.7; if (paths.some((q) => oc.isPointInPath(q, x, y))) pts.push([x, y]); }
    while (pts.length < NPa) pts.push(pts[pts.length % Math.max(1, pts.length)] || [146, 20]);
    const S = 1.18 / 41.7, lp = pts.map(([x, y]) => [(x - 146.42) * S, (y - 41.7) * S]).sort((a, b) => a[1] + a[0] * 0.02 - (b[1] + b[0] * 0.02));
    partXform(KEYS[KEYS.length - 1][1]);
    const order = Array.from({ length: NPa }, (_, i) => { const m = xf[ORDER[part[i]]], X = uv[i * 2], Y = uv[i * 2 + 1]; return [i, m[1] * X + m[3] * Y + m[5] + (m[0] * X + m[2] * Y + m[4]) * 0.02]; }).sort((a, b) => a[1] - b[1]);
    order.forEach(([i], k) => { logo[i * 2] = lp[k][0]; logo[i * 2 + 1] = lp[k][1]; });
    const geo = new THREE.BufferGeometry(), sl = (a, c) => a.subarray(0, NPa * c);
    geo.setAttribute('position', new THREE.BufferAttribute(sl(P, 3), 3));
    geo.setAttribute('aPart', new THREE.BufferAttribute(sl(part, 1), 1)); geo.setAttribute('aUV', new THREE.BufferAttribute(sl(uv, 2), 2)); geo.setAttribute('aColor', new THREE.BufferAttribute(sl(col, 3), 3));
    geo.setAttribute('aHeap', new THREE.BufferAttribute(sl(heap, 2), 2)); geo.setAttribute('aLogo', new THREE.BufferAttribute(sl(logo, 2), 2)); geo.setAttribute('aRest', new THREE.BufferAttribute(sl(rest, 2), 2));
    geo.setAttribute('aRnd', new THREE.BufferAttribute(sl(rnd, 1), 1)); geo.setAttribute('aDelay', new THREE.BufferAttribute(sl(dly, 1), 1));
    points = new THREE.Points(geo, mat); points.frustumCulled = false; scene.add(points);
  };

  /* ---------- canvas sizing & input ---------- */
  let W = 0, H = 0, DPR = 1, prog = 0, mx = -9999, my = -9999, smx = 0, smy = 0, inView = true, ready = false;
  const resize = () => {
    DPR = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight;
    [cv, fxc].forEach((c) => { c.width = Math.round(W * DPR); c.height = Math.round(H * DPR); });
    if (renderer) { renderer.setPixelRatio(DPR); renderer.setSize(W, H, false); }
    U.uRes.value.set(W, H);
  };
  resize(); addEventListener('resize', resize);
  if (FINE) { sec.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; }, { passive: true }); sec.addEventListener('pointerleave', () => { mx = my = -9999; }); }
  const DUST = Array.from({ length: MOB ? 26 : 48 }, () => ({ x: Math.random(), y: Math.random(), z: 0.3 + Math.random() * 0.7, r: 0.6 + Math.random() * 1.8, ph: Math.random() * 6.28 }));
  const CHAINS = [['H', 'N', 'C', 'P', 'iA', 'kA', 'aA'], ['C', 'P', 'iB', 'kB', 'aB'], ['C', 'sA', 'eA', 'wA', 'tA'], ['C', 'sB', 'eB', 'wB', 'tB'], ['N', 'C', 'sB', 'eB', 'wB'], ['P', 'iA', 'kA', 'aA', 'oA']];
  const along = (Pz, ch, u) => { const pts = ch.map((k) => Pz[k]), L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(l); tot += l; } let r = u * tot; for (let i = 0; i < L.length; i++) { if (r <= L[i]) { const f = r / L[i]; return [mix(pts[i][0], pts[i + 1][0], f), mix(pts[i][1], pts[i + 1][1], f)]; } r -= L[i]; } return pts[pts.length - 1]; };

  const render = (time) => {
    if (!ready) return;
    const p = prog, t = time, Pz = poseAt(p);
    const br = Math.sin(t * 1.4) * 0.0035; ['H', 'N', 'C', 'sA', 'sB', 'eA', 'eB', 'wA', 'wB', 'tA', 'tB'].forEach((k) => { Pz[k][1] += br; });
    rot(Pz, ARM_A, 'sA', 1.2 * Math.sin(t * 0.7)); rot(Pz, ARM_B, 'sB', -1.2 * Math.sin(t * 0.7 + 0.6)); rot(Pz, ['H'], 'N', 1.4 * Math.sin(t * 0.5));
    partXform(Pz);
    const lg = seg(p, 0.86, 0.95), states = AREAS.map((_, a) => areaState(a, p)), intro = U.uIntro.value;
    let fx = 0, fy = -0.5, zf = 0, act = -1;
    states.forEach((st, a) => { if (st.c >= 0 && st.c <= 1) { act = a; zf = seg(st.c, 0, 0.25) * (1 - seg(st.c, 0.82, 1)); const at = AREAS[a].at(Pz), wf = a === 3 ? (MOB ? 0.35 : 0.6) : 1; fx = mix(0, at[0], zf); fy = mix(-0.5, at[1], zf * wf); } });
    const Z = MOB ? 1.2 : 1.3, zoom = (1 + (Z - 1) * zf) * mix(1, MOB ? 0.72 : 0.92, lg);
    fy += mix(0, -0.05, lg);
    if (mx > -9000) { smx += ((mx - W / 2) / W - smx) * 0.06; smy += ((my - H / 2) / H - smy) * 0.06; } else { smx *= 0.95; smy *= 0.95; }
    const S = (MOB ? Math.min(H * 0.48, W * 1.25) : Math.min(H * 0.82, W * 0.6)) * zoom, CX = (MOB ? W * 0.5 : W * 0.66) + smx * 14, CY = (MOB ? H * 0.34 : H * 0.5) + smy * 8;
    const toX = (x) => CX + (x - fx) * S, toY = (y) => CY + (y - fy) * S;
    const align = seg(p, 0.5, 0.57), spineGlow = bell(p, 0.5, 0.6), lift = bell(p, 0.74, 0.88), formed = clamp((intro - 0.7) / 0.3);

    // ---- back layer: dust + floor platform ----
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
    for (const q of DUST) { const yy = ((q.y - t * 0.012 * q.z) % 1 + 1) % 1, xx = q.x + Math.sin(t * 0.3 + q.ph) * 0.01; ctx.fillStyle = `rgba(255,255,255,${(0.55 * q.z).toFixed(3)})`; ctx.beginPath(); ctx.arc(xx * W - smx * 30 * q.z, yy * H - smy * 20 * q.z, q.r * q.z * 1.4, 0, 6.283); ctx.fill(); }
    {
      const gx = toX(0), gy = toY(0.012), pa = clamp(intro * 1.4) * (1 - lg);
      const sh = ctx.createRadialGradient(gx, gy, 0, gx, gy, 0.28 * S); sh.addColorStop(0, `rgba(20,32,26,${(0.22 * pa).toFixed(3)})`); sh.addColorStop(1, 'rgba(20,32,26,0)');
      ctx.save(); ctx.translate(gx, gy); ctx.scale(1, 0.13); ctx.fillStyle = sh; ctx.fillRect(-0.3 * S, -0.3 * S, 0.6 * S, 0.6 * S); ctx.restore();
      if (pa > 0.01) {
        ctx.save(); ctx.translate(gx, gy); ctx.scale(1, 0.16); ctx.lineWidth = 0.9 / 0.16;
        [[0.3, 0.32, [4, 10], 1], [0.38, 0.22, [1, 7], -1], [0.46, 0.14, [24, 18], 1]].forEach(([r, al, dash, dir]) => { ctx.setLineDash(dash.map((v) => (v / 0.16) * 0.5)); ctx.lineDashOffset = dir * t * 30; ctx.strokeStyle = `rgba(93,106,41,${(al * pa).toFixed(3)})`; ctx.beginPath(); ctx.arc(0, 0, r * S, 0, 6.283); ctx.stroke(); });
        ctx.setLineDash([]);
        for (let i = 0; i < 4; i++) { const a = t * 0.4 + (i * Math.PI) / 2; ctx.fillStyle = `rgba(93,106,41,${(0.55 * pa).toFixed(3)})`; ctx.beginPath(); ctx.arc(Math.cos(a) * 0.38 * S, Math.sin(a) * 0.38 * S, 3 / 0.16 * 0.5, 0, 6.283); ctx.fill(); }
        ctx.restore();
      }
    }

    // ---- GPU particles ----
    if (renderer && points) {
      ORDER.forEach((n, k) => { const m = xf[n]; U.uMa.value[k].set(m[0], m[2], m[4]); U.uMb.value[k].set(m[1], m[3], m[5]); });
      U.uView.value.set(CX, CY, S, 0); U.uFocus.value.set(fx, fy); U.uTime.value = t; U.uLogo.value = lg;
      states.forEach((st, a) => { const at = AREAS[a].at(Pz); U.uArea.value[a].set(at[0], at[1], AREAS[a].s); U.uPain.value[a].set(st.pain * formed * (1 - lg), st.calm * (1 - lg)); });
      U.uSpine.value = spineGlow;
      const sc = (t - scanT) / 1.6; U.uScan.value = sc >= 0 && sc <= 1 && formed > 0.9 ? mix(-1.02, 0.01, ease(sc)) : -2;
      U.uMouse.value.set(mx, my, 80);
      const area = bodyArea * (S / IH) * (S / IH);
      U.uSize.value = clamp(Math.sqrt(area / NPa) * 2.7, 1.8, 6) * DPR;
      renderer.render(scene, camera);
    }

    // ---- front layer: treatment motion graphics, pulses, spine, arcs ----
    fctx.setTransform(DPR, 0, 0, DPR, 0, 0); fctx.clearRect(0, 0, W, H);
    if (formed > 0.6 && lg < 0.3) {
      fctx.globalCompositeOperation = 'lighter';
      CHAINS.forEach((chn, k) => {
        const u = (t * 0.16 + k * 0.37) % 1, q = along(Pz, chn, u), X = toX(q[0]), Y = toY(q[1]);
        const gr = fctx.createRadialGradient(X, Y, 0, X, Y, 12); gr.addColorStop(0, 'rgba(210,255,150,0.55)'); gr.addColorStop(1, 'rgba(210,255,150,0)');
        fctx.fillStyle = gr; fctx.fillRect(X - 12, Y - 12, 24, 24);
      });
      fctx.globalCompositeOperation = 'source-over';
    }
    if (act >= 0 && lg < 0.1 && formed > 0.5) {
      const st = states[act], eff = bell(st.c, 0.22, 0.8), at = AREAS[act].at(Pz), X = toX(at[0]), Y = toY(at[1]), u = S;
      if (st.c < 0.32) for (let r = 0; r < 3; r++) { const fr = (t * 0.45 + r / 3) % 1, al = 0.55 * (1 - fr) * seg(st.c, 0, 0.15) * (1 - seg(st.c, 0.22, 0.32)); fctx.strokeStyle = `rgba(232,112,92,${al.toFixed(3)})`; fctx.lineWidth = 1.2; fctx.beginPath(); fctx.arc(X, Y, (0.03 + fr * 0.11) * u, 0, 6.283); fctx.stroke(); }
      const sw = clamp((st.c - 0.3) / 0.16);
      if (sw > 0 && sw < 1) { fctx.strokeStyle = `rgba(255,255,255,${(0.85 * (1 - sw)).toFixed(3)})`; fctx.lineWidth = 2 * (1 - sw) + 0.5; fctx.beginPath(); fctx.arc(X, Y, (0.02 + sw * 0.32) * u, 0, 6.283); fctx.stroke(); }
      if (eff > 0.01) {
        fctx.lineWidth = 1.4;
        if (act === 0) { for (let k = 0; k < 2; k++) { const a0 = t * 0.9 + k * Math.PI; fctx.strokeStyle = `rgba(255,255,255,${(0.9 * eff).toFixed(3)})`; fctx.beginPath(); fctx.arc(X, Y, 0.065 * u, a0, a0 + 1.6); fctx.stroke(); } }
        else if (act === 1) { for (let r = 0; r < 3; r++) { const fr = (t * 0.6 + r / 3) % 1; fctx.strokeStyle = `rgba(64,108,180,${(0.65 * (1 - fr) * eff).toFixed(3)})`; fctx.beginPath(); fctx.arc(X, Y, (0.035 + fr * 0.15) * u, 0, 6.283); fctx.stroke(); } }
        else if (act === 2) {
          const clean = seg(st.c, 0.3, 0.7), w = 0.2 * u; fctx.strokeStyle = `rgba(255,255,255,${(0.95 * eff).toFixed(3)})`; fctx.beginPath();
          for (let k = 0; k <= 60; k++) { const f = k / 60, xx = X - w + f * 2 * w, env = Math.sin(Math.PI * f), nn = 0.6 * Math.sin(f * 58 + t * 9) + 0.4 * Math.sin(f * 97 - t * 13), cl = Math.sin(f * 25 - t * 5), yy = Y + env * 0.026 * u * mix(nn, cl, clean); k ? fctx.lineTo(xx, yy) : fctx.moveTo(xx, yy); }
          fctx.stroke();
        } else {
          const sx = X + 0.32 * u, sy = Y - 0.4 * u, lb = fctx.createLinearGradient(sx, sy, X, Y); lb.addColorStop(0, 'rgba(232,112,92,0)'); lb.addColorStop(1, `rgba(232,112,92,${(0.9 * eff).toFixed(3)})`);
          fctx.strokeStyle = lb; fctx.beginPath(); fctx.moveTo(sx, sy); fctx.lineTo(X, Y); fctx.stroke();
          for (let k = 0; k < 5; k++) { const fr = (t * 0.7 + k / 5) % 1; fctx.fillStyle = `rgba(232,112,92,${(Math.sin(Math.PI * fr) * eff).toFixed(3)})`; fctx.beginPath(); fctx.arc(mix(sx, X, fr), mix(sy, Y, fr), 2.4, 0, 6.283); fctx.fill(); }
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
    if (spineGlow > 0.02 && formed > 0.5) {
      const A = Pz.P, Cc = Pz.N;
      for (let v = 0; v < 12; v++) { const f = v / 11, on = clamp(align * 14 - v * 0.9) * spineGlow; if (on <= 0) continue; const X = toX(mix(A[0], Cc[0], f)), Y = toY(mix(A[1], Cc[1], f)); fctx.fillStyle = `rgba(255,255,255,${(0.95 * on).toFixed(3)})`; fctx.beginPath(); fctx.arc(X, Y, 3, 0, 6.283); fctx.fill(); fctx.strokeStyle = `rgba(64,108,180,${on.toFixed(3)})`; fctx.lineWidth = 1.4; fctx.stroke(); }
    }
    if (lift > 0.02 && lg < 0.6) {
      const a = seg(p, 0.745, 0.84);
      [['sA', -1], ['sB', 1]].forEach(([si, sg]) => { const s0 = Pz[si], Rr = 0.36 * S, cx = toX(s0[0]), cy = toY(s0[1]), a0 = Math.PI / 2 - sg * 0.55, a1 = a0 - sg * (Math.PI * 0.62) * a; fctx.strokeStyle = `rgba(125,142,57,${(0.55 * lift * (1 - lg)).toFixed(3)})`; fctx.lineWidth = 1.2; fctx.beginPath(); fctx.arc(cx, cy, Rr, Math.min(a0, a1), Math.max(a0, a1)); fctx.stroke(); });
    }
  };

  /* ---------- drive ---------- */
  ST.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: (s) => { prog = s.progress; const k = R.findIndex(([a, b]) => prog >= a && prog < b); setChapter(k < 0 ? R.length - 1 : k); if (bar) bar.style.transform = `scaleY(${prog.toFixed(4)})`; } });
  new IntersectionObserver((es) => es.forEach((e) => (inView = e.isIntersecting))).observe(sec);
  setChapter(0);
  const hd = $('.az-head'); if (hd) hd.classList.add('on-light');
  g.ticker.add((time) => { if (inView) render(time); });
  const imgs = {};
  fetch(RIG + 'rig.json').then((r) => r.json()).then((m) => {
    meta = m; IW = m.w; IH = m.h;
    REST = Object.fromEntries(Object.entries(m.joints).map(([k, [x, y]]) => [k, [(x - IW / 2) / IH, y / IH - 0.997]]));
    makePoses();
    return Promise.all(ORDER.map((n) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res((imgs[n] = im)); im.onerror = rej; im.src = RIG + n + '.png'; })));
  }).then(() => {
    build(imgs); ready = true; scanT = performance.now() / 1000 + 3.6;
    if (RM) return;
    const go = () => {
      g.to(U.uIntro, { value: 1, duration: 3.4, delay: 0.3, ease: 'power1.inOut' });
      g.fromTo('[data-ncx-in]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, delay: 1, ease: 'expo.out' });
    };
    const t0 = performance.now(), chk = () => (!$('.az-pre') || performance.now() - t0 > 7000 ? go() : setTimeout(chk, 120)); chk();
  }).catch((e) => console.error(e));
})();
