/* AROGYATI — About: our story. A small particle town drawn in the same point style as the body: the clinic,
   a road, a hospital, houses and trees. The clinic's ambulance (CC0 "Car Kit" ambulance by Kenney) waits outside
   the clinic, then, as you scroll, drives out on call, past the hospital, to a patient's home. The copy beside it
   changes at each stop. */
import * as THREE from '/home/vendor/three/three.module.min.js';
import { GLTFLoader } from '/home/vendor/three/GLTFLoader.js';

(() => {
  const d = document, sec = d.querySelector('.abs'); if (!sec) return;
  const cv = sec.querySelector('.abs__gl'), beats = [...sec.querySelectorAll('.abs__beat')], ticks = [...sec.querySelectorAll('.abs__prog li')];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches, FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const MOB = innerWidth < 900, g = window.gsap;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), mix = (a, b, t) => a + (b - a) * t, sst = (t) => t * t * (3 - 2 * t);
  const DEN = MOB ? 0.55 : 1; // particle density

  /* ---------- copy: which beat is showing ---------- */
  const BEAT_AT = [0, 0.17, 0.43, 0.64];
  let curB = 0;
  const setBeat = (k) => {
    if (k === curB) return; const from = beats[curB], to = beats[k], dir = k > curB ? 1 : -1; curB = k;
    ticks.forEach((t, i) => { t.classList.toggle('is-on', i <= k); t.classList.toggle('is-now', i === k); });
    beats.forEach((b) => b.setAttribute('aria-hidden', String(b !== to)));
    if (g && !RM) {
      g.killTweensOf([from, to, ...from.children, ...to.children]);
      g.to(from.children, { y: -20 * dir, opacity: 0, filter: 'blur(6px)', duration: 0.35, stagger: 0.03, ease: 'power2.in', onComplete: () => { from.classList.remove('is-on'); g.set(from.children, { clearProps: 'all' }); } });
      to.classList.add('is-on');
      g.fromTo(to.children, { y: 28 * dir, opacity: 0, filter: 'blur(8px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.95, stagger: 0.06, delay: 0.18, ease: 'expo.out', clearProps: 'filter' });
    } else { from.classList.remove('is-on'); to.classList.add('is-on'); }
  };
  const progress = () => { const r = sec.getBoundingClientRect(), len = Math.max(1, sec.offsetHeight - innerHeight); return clamp(-r.top / len); };
  const beatOf = (p) => { let k = 0; BEAT_AT.forEach((b, i) => { if (p >= b) k = i; }); return k; };

  let renderer = null;
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' }); renderer.setClearColor(0x000000, 0); } catch (e) { renderer = null; }
  if (!renderer) { sec.classList.add('is-nogl'); addEventListener('scroll', () => setBeat(beatOf(progress())), { passive: true }); return; }

  /* ---------- the point material: soft round dots, lit by their surface normal, fading into the morning haze ---------- */
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);
  const U = { uTime: { value: 0 }, uSize: { value: 1 }, uScale: { value: 500 }, uFogN: { value: 18 }, uFogF: { value: 70 }, uBlink: { value: 0 }, uArrive: { value: 0 }, uFade: { value: 0 }, uMaxPx: { value: 8 } };
  const VERT = /* glsl */`
    attribute vec3 color; attribute float aRnd; attribute float aKind; attribute float aSize;
    uniform float uTime, uSize, uScale, uFogN, uFogF, uBlink, uArrive, uFade, uMaxPx;
    varying vec3 vCol; varying float vA; varying float vGlow;
    void main(){
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vec3 nV = normalize(normalMatrix * normal), vd = normalize(-mv.xyz);
      float facing = dot(nV, vd);
      float key = max(dot(nV, normalize(vec3(-0.4, 0.75, 0.5))), 0.0), fill = max(dot(nV, normalize(vec3(0.6, 0.2, 0.6))), 0.0);
      float lit = clamp(key * 0.9 + fill * 0.25, 0.0, 1.0), rim = smoothstep(0.55, 0.98, 1.0 - abs(facing));
      vec3 col = color * (0.78 + 0.34 * lit);
      col = mix(col, vec3(0.86, 0.92, 1.0), rim * 0.35);
      float a = mix(0.55, 0.95, lit);
      a *= mix(0.05, 1.0, smoothstep(-0.05, 0.25, facing));
      float glow = 0.0, sz = aSize;
      if (aKind > 0.5 && aKind < 1.5) { float b = step(0.5, fract(uTime * 1.6)); glow = uBlink * b; col = mix(col, vec3(1.0, 0.36, 0.3), glow); sz *= 1.0 + glow * 0.8; a = max(a, glow); }
      else if (aKind > 1.5 && aKind < 2.5) { float b = 1.0 - step(0.5, fract(uTime * 1.6)); glow = uBlink * b; col = mix(col, vec3(0.35, 0.6, 1.0), glow); sz *= 1.0 + glow * 0.8; a = max(a, glow); }
      else if (aKind > 2.5 && aKind < 3.5) { glow = 0.6; col = vec3(1.0, 0.86, 0.55); sz *= 1.3; a = 1.0; }
      else if (aKind > 3.5 && aKind < 4.5) { glow = uArrive; col = mix(col, vec3(1.0, 0.72, 0.42), uArrive); sz *= 1.0 + uArrive * 0.5; a = max(a, 0.5 + 0.5 * uArrive); }
      float fog = smoothstep(uFogF, uFogN, -mv.z) * smoothstep(2.0, 7.0, -mv.z);
      mv.xyz += 0.012 * vec3(sin(uTime * 0.8 + aRnd * 40.0), cos(uTime * 0.7 + aRnd * 31.0), 0.0) * (1.0 - fog * 0.6);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = clamp(uSize * sz * (0.9 + aRnd * 0.2) * uScale / -mv.z, 1.0, uMaxPx);
      vCol = col; vA = a * fog * uFade; vGlow = glow;
    }`;
  const FRAG = /* glsl */`
    varying vec3 vCol; varying float vA; varying float vGlow;
    void main(){
      vec2 c = gl_PointCoord - 0.5; float r = length(c);
      float core = smoothstep(0.5, 0.28, r), halo = exp(-r * r * 10.0) * vGlow * 0.8;
      float a = max(core, halo) * vA; if (a < 0.01) discard;
      gl_FragColor = vec4(vCol * a, a); }`;
  const mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthTest: true, depthWrite: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor });

  /* ---------- a buffer we fill with points ---------- */
  const mkBuf = () => ({ p: [], n: [], c: [], k: [], s: [] });
  const push = (B, x, y, z, nx, ny, nz, col, kind = 0, size = 1) => { B.p.push(x, y, z); B.n.push(nx, ny, nz); B.c.push(col[0], col[1], col[2]); B.k.push(kind); B.s.push(size); };
  const toPoints = (B) => {
    const geo = new THREE.BufferGeometry(), n = B.k.length, rnd = new Float32Array(n); for (let i = 0; i < n; i++) rnd[i] = Math.random();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(B.p, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(B.n, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(B.c, 3)); geo.setAttribute('aKind', new THREE.Float32BufferAttribute(B.k, 1));
    geo.setAttribute('aSize', new THREE.Float32BufferAttribute(B.s, 1)); geo.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 1));
    const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; return pts;
  };

  /* ---------- the road: a winding path from the clinic, past the hospital, to a patient's home ---------- */
  const path = new THREE.CatmullRomCurve3([[-10, 0, 4], [0, 0, 0], [12, 0, -3], [21, 0, -12], [23, 0, -25], [16, 0, -35], [5, 0, -40], [-4, 0, -49], [-6, 0, -60]].map((a) => new THREE.Vector3(...a)), false, 'catmullrom', 0.5);
  const L = path.getLength();
  const S_CLINIC = 10.5, S_HOSP = L * 0.52, S_HOME = L - 9;
  const at = (s) => path.getPointAt(clamp(s / L)), tan = (s) => path.getTangentAt(clamp(s / L));
  const side = (s) => { const t = tan(s); return new THREE.Vector3(-t.z, 0, t.x); }; // to the left of travel

  /* ---------- colours ---------- */
  const C = {
    wall: [0.5, 0.6, 0.74], wall2: [0.56, 0.65, 0.78], roof: [0.38, 0.56, 0.38], roof2: [0.44, 0.52, 0.66], glass: [0.16, 0.26, 0.46],
    clinic: [0.36, 0.5, 0.74], sign: [0.31, 0.54, 0.25], cross: [0.91, 0.43, 0.36], trunk: [0.5, 0.44, 0.38], leaf: [0.36, 0.6, 0.38], leaf2: [0.46, 0.66, 0.4],
    edge: [0.45, 0.53, 0.65], dash: [0.58, 0.65, 0.75], asphalt: [0.72, 0.77, 0.84], ground: [0.66, 0.74, 0.78], warm: [0.95, 0.74, 0.5],
  };
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* ---------- builders: analytic surfaces sampled as dots, with real windows and doors left open ---------- */
  // a vertical rectangle in local space (u along x, v up) facing +z, mapped by a matrix; holes(u,v) returns kind/colour override or null to skip
  const V3 = new THREE.Vector3(), N3 = new THREE.Vector3();
  const wall = (B, M, w, h, col, dens, holes) => {
    const n = Math.round(w * h * dens * DEN), nm = new THREE.Matrix3().getNormalMatrix(M);
    for (let i = 0; i < n; i++) {
      const u = Math.random() * w, v = Math.random() * h; let c = col, k = 0, sz = 1;
      if (holes) { const r = holes(u, v); if (r === false) continue; if (r) { c = r.c || c; k = r.k || 0; sz = r.s || 1; } }
      V3.set(u - w / 2, v, 0).applyMatrix4(M); N3.set(0, 0, 1).applyMatrix3(nm).normalize();
      push(B, V3.x, V3.y, V3.z, N3.x, N3.y, N3.z, c, k, sz);
    }
  };
  const matAt = (x, y, z, ry, extra) => { const m = new THREE.Matrix4().makeRotationY(ry).setPosition(x, y, z); return extra ? m.multiply(extra) : m; };
  const T = (x, y, z) => new THREE.Matrix4().makeTranslation(x, y, z), RY = (a) => new THREE.Matrix4().makeRotationY(a), RX = (a) => new THREE.Matrix4().makeRotationX(a);
  // a box building: front faces +z in its own frame
  const building = (B, x, z, ry, w, h, dp, opt) => {
    const base = matAt(x, 0, z, ry), dens = opt.dens || 26;
    const win = opt.win, door = opt.door;
    const holeFn = (front) => (u, v) => {
      if (front && door && Math.abs(u - (opt.doorU ?? w / 2)) < door[0] / 2 && v < door[1]) return opt.doorFill ? { c: opt.doorFill, k: opt.doorKind || 0 } : false;
      if (win) {
        const [cols, rows, ww, wh, y0, gap] = win, cw = w / cols;
        const cu = (u % cw) - cw / 2, row = Math.floor((v - y0) / gap), rv = (v - y0) - row * gap;
        if (row >= 0 && row < rows && Math.abs(cu) < ww / 2 && rv < wh && !(front && door && Math.abs(u - (opt.doorU ?? w / 2)) < door[0] / 2 + 0.4 && v < door[1] + 0.4)) return opt.winFill ? { c: opt.winFill, k: opt.winKind || 0, s: 0.9 } : false;
      }
      return null;
    };
    wall(B, base.clone().multiply(T(0, 0, dp / 2)), w, h, opt.col, dens, holeFn(true));
    wall(B, base.clone().multiply(RY(Math.PI)).multiply(T(0, 0, dp / 2)), w, h, opt.col2 || opt.col, dens * 0.7, holeFn(false));
    const sideWin = opt.sideWin === false ? null : (u, v) => { if (!win) return null; const [, rows, ww, wh, y0, gap] = win; const cw = dp / Math.max(1, Math.round(dp / 2.4)); const cu = (u % cw) - cw / 2, row = Math.floor((v - y0) / gap), rv = (v - y0) - row * gap; return row >= 0 && row < rows && Math.abs(cu) < ww / 2 && rv < wh ? (opt.winFill ? { c: opt.winFill, k: opt.winKind || 0, s: 0.9 } : false) : null; };
    wall(B, base.clone().multiply(RY(Math.PI / 2)).multiply(T(0, 0, w / 2)), dp, h, opt.col2 || opt.col, dens * 0.85, sideWin);
    wall(B, base.clone().multiply(RY(-Math.PI / 2)).multiply(T(0, 0, w / 2)), dp, h, opt.col2 || opt.col, dens * 0.85, sideWin);
    if (opt.gable) { // pitched roof, ridge along the width
      const rise = opt.gable, slope = Math.hypot(dp / 2 + 0.3, rise), ang = Math.atan2(rise, dp / 2 + 0.3);
      wall(B, base.clone().multiply(T(0, h, dp / 2 + 0.3)).multiply(RX(-Math.PI / 2 + ang)), w + 0.6, slope, opt.roof, dens * 1.1);
      wall(B, base.clone().multiply(RY(Math.PI)).multiply(T(0, h, dp / 2 + 0.3)).multiply(RX(-Math.PI / 2 + ang)), w + 0.6, slope, opt.roof, dens * 0.9);
      // gable ends: triangles
      [1, -1].forEach((sd) => { const M = base.clone().multiply(RY(sd * Math.PI / 2)).multiply(T(0, h, w / 2)), nm = new THREE.Matrix3().getNormalMatrix(M); const n = Math.round((dp * rise / 2) * dens * DEN * 0.85); for (let i = 0; i < n; i++) { const u = Math.random() * dp, v = Math.random() * rise; if (v > rise * (1 - Math.abs(u - dp / 2) / (dp / 2))) continue; V3.set(u - dp / 2, v, 0).applyMatrix4(M); N3.set(0, 0, 1).applyMatrix3(nm).normalize(); push(B, V3.x, V3.y, V3.z, N3.x, N3.y, N3.z, opt.col2 || opt.col); } });
    } else { // flat roof with a parapet line
      const M = base.clone().multiply(T(0, h, 0)).multiply(RX(-Math.PI / 2)).multiply(T(0, -dp / 2, 0)); wall(B, M, w, dp, opt.roof, dens * 0.6);
    }
  };
  const tree = (B, x, z, s = 1) => {
    const h = 1.6 * s; for (let i = 0; i < 40 * s * DEN; i++) { const a = Math.random() * 6.283, y = Math.random() * h; push(B, x + Math.cos(a) * 0.12 * s, y, z + Math.sin(a) * 0.12 * s, Math.cos(a), 0, Math.sin(a), C.trunk); }
    const r = 1.1 * s, cy = h + r * 0.75, n = Math.round(4 * Math.PI * r * r * 30 * DEN);
    for (let i = 0; i < n; i++) { const u = Math.random() * 2 - 1, a = Math.random() * 6.283, sq = Math.sqrt(1 - u * u), nx = sq * Math.cos(a), nz = sq * Math.sin(a), rr = r * (0.92 + Math.random() * 0.12) * (u > 0 ? 1 : 0.92); push(B, x + nx * rr, cy + u * rr * 0.95, z + nz * rr, nx, u, nz, Math.random() < 0.5 ? C.leaf : C.leaf2); }
  };
  // words drawn on a facade, sampled from a canvas
  const sign = (B, M, text, wWorld, col) => {
    const c = d.createElement('canvas'), W = 1024, H = 200; c.width = W; c.height = H; const x = c.getContext('2d');
    x.fillStyle = '#000'; x.font = '600 150px "Plus Jakarta Sans", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, W / 2, H / 2 + 6);
    const im = x.getImageData(0, 0, W, H).data, sc = wWorld / W, nm = new THREE.Matrix3().getNormalMatrix(M), step = MOB ? 5 : 4;
    for (let yy = 0; yy < H; yy += step) for (let xx = 0; xx < W; xx += step) { if (im[(yy * W + xx) * 4 + 3] < 128) continue; V3.set((xx - W / 2) * sc, (H / 2 - yy) * sc, 0).applyMatrix4(M); N3.set(0, 0, 1).applyMatrix3(nm).normalize(); push(B, V3.x, V3.y, V3.z, N3.x, N3.y, N3.z, col, 0, 1.15); }
  };

  /* ---------- the town ---------- */
  const ENV = mkBuf();
  const facing = (s, sd) => { const sv = side(s).multiplyScalar(sd); return Math.atan2(-sv.x, -sv.z); }; // rotation so a building's front (+z) looks at the road
  const place = (s, sd, off) => at(s).add(side(s).multiplyScalar(sd * off));
  { // road: edges, centre dashes, a light tarmac haze
    const step = 0.09 / DEN;
    for (let s = 0; s < L; s += step) {
      const p = at(s), n = side(s);
      [-2.3, 2.3].forEach((o) => push(ENV, p.x + n.x * o + rnd(-0.03, 0.03), 0.01, p.z + n.z * o + rnd(-0.03, 0.03), 0, 1, 0, C.edge, 0, 1.05));
      if ((s % 1.6) < 0.8) push(ENV, p.x, 0.01, p.z, 0, 1, 0, C.dash, 0, 0.9);
      for (let j = 0; j < 2; j++) { const o = rnd(-2.2, 2.2); push(ENV, p.x + n.x * o, 0, p.z + n.z * o, 0, 1, 0, C.asphalt, 0, 0.7); }
    }
    // ground: dots thinning away from the road
    const gN = Math.round(16000 * DEN);
    for (let i = 0; i < gN; i++) { const s = Math.random() * L, o = (Math.random() < 0.5 ? -1 : 1) * (2.8 + Math.pow(Math.random(), 1.6) * 26), p = at(s), n = side(s); push(ENV, p.x + n.x * o + rnd(-1, 1), 0, p.z + n.z * o + rnd(-1, 1), 0, 1, 0, Math.random() < 0.3 ? C.leaf2 : C.ground, 0, 0.5); }
  }
  { // the clinic: two storeys, a glass front, the name over the door
    const s = S_CLINIC, sd = 1, p = place(s, sd, 9.2), ry = facing(s, sd);
    building(ENV, p.x, p.z, ry, 12, 6.4, 7, { col: C.clinic, col2: C.wall, roof: C.roof2, dens: 70, win: [5, 2, 1.7, 1.6, 0.9, 3], winFill: C.glass, door: [2.2, 2.4], doorFill: C.glass });
    sign(ENV, matAt(p.x, 0, p.z, ry, T(0, 5.65, 3.53)), 'AROGYATI', 6.2, C.sign);
  }
  { // the hospital: tall, a cross on the roof
    const s = S_HOSP, sd = -1, p = place(s, sd, 11), ry = facing(s, sd);
    building(ENV, p.x, p.z, ry, 10, 11, 8, { col: C.wall2, col2: C.wall, roof: C.roof2, dens: 30, win: [5, 4, 1.1, 1.3, 1.4, 2.4], door: [2.6, 2.6] });
    const M = matAt(p.x, 0, p.z, ry, T(0, 11.2, 4.05));
    wall(ENV, M.clone().multiply(T(0, 0, 0)), 0.7, 2.4, C.cross, 120); wall(ENV, M.clone().multiply(T(0, 0.85, 0)), 2.4, 0.7, C.cross, 120);
  }
  { // the patient's home: the door and windows light up when the ambulance arrives
    const s = S_HOME, sd = 1, p = place(s, sd, 8.5), ry = facing(s, sd);
    building(ENV, p.x, p.z, ry, 6.5, 3.4, 5.5, { col: C.wall2, col2: C.wall, roof: C.roof, gable: 2, dens: 85, win: [3, 1, 1.1, 1.1, 1.2, 3], winFill: C.warm, winKind: 4, door: [1.1, 2.1], doorU: 3.25, doorFill: C.warm, doorKind: 4, sideWin: false });
    tree(ENV, p.x + 5, p.z - 1, 1.1); tree(ENV, p.x - 5.2, p.z + 1.5, 0.9);
  }
  { // houses and trees along the way, kept clear of the three places
    const busy = [S_CLINIC, S_HOSP, S_HOME];
    for (let s = 2; s < L - 2; s += rnd(5, 8)) {
      [-1, 1].forEach((sd) => {
        if (busy.some((b, i) => Math.abs(s - b) < 9 && ((i === 1 && sd === -1) || (i !== 1 && sd === 1)))) { if (Math.random() < 0.6) { const q = place(s, sd, rnd(4, 5)); tree(ENV, q.x, q.z, rnd(0.7, 1)); } return; }
        if (Math.random() < 0.55) { const w = rnd(4.4, 6), dp = rnd(4, 5), off = rnd(6.5, 9.5), p = place(s, sd, off); building(ENV, p.x, p.z, facing(s, sd), w, rnd(2.8, 3.6), dp, { col: C.wall2, col2: C.wall, roof: Math.random() < 0.6 ? C.roof : C.roof2, gable: rnd(1.4, 2), dens: 20, win: [2, 1, 1, 1, 1.1, 3], door: [1, 2] }); }
        else { const q = place(s, sd, rnd(4.2, 7)); tree(ENV, q.x, q.z, rnd(0.7, 1.15)); }
        if (Math.random() < 0.35) { const q = place(s + 2.5, sd, rnd(12, 16)); tree(ENV, q.x, q.z, rnd(0.8, 1.2)); }
      });
    }
  }
  const envPts = toPoints(ENV); scene.add(envPts);

  /* ---------- the ambulance: points on the real model, coloured from its own palette ---------- */
  const van = new THREE.Group(), vanBody = new THREE.Group(); van.add(vanBody); scene.add(van);
  const wheels = []; let vanReady = false;
  const loadImg = (src) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
  const buildVan = async (gltf) => {
    const im = await loadImg('/home/assets/3d/ambulance/Textures/colormap.png'), c = d.createElement('canvas'); c.width = im.width; c.height = im.height;
    const cx = c.getContext('2d'); cx.drawImage(im, 0, 0); const px = cx.getImageData(0, 0, c.width, c.height).data;
    const tex = (u, v) => { const x = Math.min(c.width - 1, Math.max(0, Math.floor(u * c.width))), y = Math.min(c.height - 1, Math.max(0, Math.floor(v * c.height))), i = (y * c.width + x) * 4; return [px[i] / 255, px[i + 1] / 255, px[i + 2] / 255]; };
    // the palette, brought into the site's colours: white body -> brand blue, red -> coral, dark -> deep navy
    const remap = (rgb, y) => {
      const [r, gg, b] = rgb, mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), lum = 0.3 * r + 0.59 * gg + 0.11 * b, sat = mx - mn;
      if (r > gg + 0.25 && r > b + 0.2) return { c: [0.91, 0.43, 0.36], k: y > 1.42 ? 1 : 0 };
      if (b > r + 0.2 && b > gg + 0.05) return { c: [0.3, 0.5, 0.86], k: y > 1.42 ? 2 : 0 };
      if (r > 0.85 && gg > 0.6 && b < 0.45) return { c: [1, 0.82, 0.5], k: 3 };
      if (lum < 0.32) return { c: [0.14, 0.2, 0.32], k: 0 };
      if (sat < 0.12 && lum > 0.72) return { c: [0.27 + y * 0.07, 0.44 + y * 0.06, 0.74 + y * 0.03], k: 0 }; // body: brand blue, lighter towards the roof
      return { c: [0.45, 0.53, 0.66], k: 0 };
    };
    const root = gltf.scene; root.updateMatrixWorld(true);
    const sample = (mesh, M, count, B) => {
      const g2 = mesh.geometry, pos = g2.attributes.position, uv = g2.attributes.uv, idx = g2.index.array, nm = new THREE.Matrix3().getNormalMatrix(M);
      const tris = []; let tot = 0; const a = new THREE.Vector3(), b = new THREE.Vector3(), cc = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3();
      for (let i = 0; i < idx.length; i += 3) { a.fromBufferAttribute(pos, idx[i]).applyMatrix4(M); b.fromBufferAttribute(pos, idx[i + 1]).applyMatrix4(M); cc.fromBufferAttribute(pos, idx[i + 2]).applyMatrix4(M); const ar = e1.subVectors(b, a).cross(e2.subVectors(cc, a)).length() / 2; if (ar <= 1e-7) continue; tot += ar; tris.push([idx[i], idx[i + 1], idx[i + 2], tot]); }
      const r0 = 0.75 * Math.sqrt(tot / count), grid = new Map(), key = (x, y, z) => `${Math.floor(x / r0)},${Math.floor(y / r0)},${Math.floor(z / r0)}`;
      const ok = (p) => { const gx = Math.floor(p.x / r0), gy = Math.floor(p.y / r0), gz = Math.floor(p.z / r0); for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) { const L2 = grid.get(`${gx + i},${gy + j},${gz + k}`); if (L2) for (const q of L2) if (q.distanceToSquared(p) < r0 * r0) return false; } return true; };
      const nrm = new THREE.Vector3(); let n = 0;
      for (let tries = 0; n < count && tries < count * 8; tries++) {
        const r = Math.random() * tot; let lo = 0, hi = tris.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (tris[m][3] < r) lo = m + 1; else hi = m; }
        const [i0, i1, i2] = tris[lo]; let u = Math.random(), v = Math.random(); if (u + v > 1) { u = 1 - u; v = 1 - v; } const w = 1 - u - v;
        a.fromBufferAttribute(pos, i0).applyMatrix4(M); b.fromBufferAttribute(pos, i1).applyMatrix4(M); cc.fromBufferAttribute(pos, i2).applyMatrix4(M);
        const p = new THREE.Vector3(a.x * w + b.x * u + cc.x * v, a.y * w + b.y * u + cc.y * v, a.z * w + b.z * u + cc.z * v);
        if (!ok(p)) continue; const kk = key(p.x, p.y, p.z); if (grid.has(kk)) grid.get(kk).push(p); else grid.set(kk, [p]);
        nrm.subVectors(b, a).cross(e2.subVectors(cc, a)).normalize();
        const tu = uv.getX(i0) * w + uv.getX(i1) * u + uv.getX(i2) * v, tv = uv.getY(i0) * w + uv.getY(i1) * u + uv.getY(i2) * v;
        const m = remap(tex(tu, tv), p.y + 0.2);
        push(B, p.x, p.y, p.z, nrm.x, nrm.y, nrm.z, m.c, m.k, m.k ? 1.25 : 1); n++;
      }
    };
    const BODY = mkBuf(), occ = [];
    root.traverse((o) => {
      if (!o.isMesh) return;
      if (/wheel/.test(o.name)) {
        const W = mkBuf(); sample(o, new THREE.Matrix4(), Math.round(1500 * DEN), W);
        const pivot = new THREE.Group(); pivot.position.copy(o.getWorldPosition(new THREE.Vector3())); vanBody.add(pivot); const wp = toPoints(W); pivot.add(wp);
        if (o.position.x < 0) wp.rotation.y = 0; wheels.push(pivot);
      } else {
        sample(o, o.matrixWorld, Math.round((o.name === 'body' ? 15000 : 900) * DEN), BODY);
        const m = new THREE.Mesh(o.geometry, new THREE.MeshBasicMaterial({ colorWrite: false, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 4 })); m.applyMatrix4(o.matrixWorld); m.renderOrder = 0; occ.push(m); vanBody.add(m);
      }
    });
    const bp = toPoints(BODY); bp.renderOrder = 1; vanBody.add(bp);
    vanReady = true;
  };

  /* ---------- where the van is: scroll -> distance along the road (parked at the clinic, at the hospital, at home) ---------- */
  const KS = [[0, S_CLINIC], [0.15, S_CLINIC], [0.44, S_HOSP], [0.56, S_HOSP + 2.5], [0.86, S_HOME], [1, S_HOME]];
  const sAt = (p) => { for (let i = 1; i < KS.length; i++) if (p <= KS[i][0]) { const [p0, s0] = KS[i - 1], [p1, s1] = KS[i]; return mix(s0, s1, sst(clamp((p - p0) / (p1 - p0 || 1)))); } return S_HOME; };
  // camera: angle around the van (relative to its heading), height and distance per moment
  const CAM = [[0, 1.05, 0.3, 23], [0.15, 1.2, 0.32, 19], [0.3, 1.5, 0.38, 16], [0.47, -1.15, 0.55, 26], [0.62, -0.35, 0.46, 19], [0.86, 1.05, 0.3, 19], [1, 1.2, 0.3, 18]];
  // az: +pi/2 = the van's right side (the clinic and the home stand on its left, the hospital on its right)
  const camAt = (p) => { for (let i = 1; i < CAM.length; i++) if (p <= CAM[i][0]) { const a = CAM[i - 1], b = CAM[i], t = sst(clamp((p - a[0]) / (b[0] - a[0] || 1))); return [mix(a[1], b[1], t), mix(a[2], b[2], t), mix(a[3], b[3], t)]; } const z = CAM[CAM.length - 1]; return [z[1], z[2], z[3]]; };

  /* ---------- loop ---------- */
  let W = 0, H = 0, DPR = 1, vis = false, last = 0, sNow = S_CLINIC, sPrev = S_CLINIC, heading = 0, mx = 0, my = 0, pSm = 0, arrive = 0;
  const resize = () => { DPR = Math.min(devicePixelRatio || 1, MOB ? 1.75 : 2); W = cv.clientWidth; H = cv.clientHeight; renderer.setPixelRatio(DPR); renderer.setSize(W, H, false); camera.aspect = W / Math.max(1, H); if (MOB) camera.setViewOffset(W, H, 0, -H * 0.2, W, H); else camera.setViewOffset(W, H, -W * 0.2, 0, W, H); camera.updateProjectionMatrix(); /* the van sits in the open half, clear of the copy */ U.uScale.value = (H * DPR) / (2 * Math.tan((camera.fov * Math.PI) / 360)); };
  resize(); addEventListener('resize', resize);
  if (FINE) addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
  const look = new THREE.Vector3(), camP = new THREE.Vector3(), tmp = new THREE.Vector3();
  const loop = (now) => {
    requestAnimationFrame(loop);
    const p = progress(); setBeat(beatOf(p));
    if (!vis) return;
    const t = now / 1000, dt = Math.min(0.05, last ? t - last : 0.016); last = t;
    pSm += (p - pSm) * Math.min(1, dt * (RM ? 30 : 5));
    sPrev = sNow; sNow = sAt(pSm);
    const pos = at(sNow), tg = tan(sNow), hd = Math.atan2(tg.x, tg.z);
    let dh = hd - heading; while (dh > Math.PI) dh -= 2 * Math.PI; while (dh < -Math.PI) dh += 2 * Math.PI; heading += dh * Math.min(1, dt * 6);
    van.position.set(pos.x, 0, pos.z); van.rotation.y = heading;
    const ds = sNow - sPrev, moving = Math.abs(ds) > 0.002;
    wheels.forEach((w) => { w.rotation.x += ds / 0.3; });
    vanBody.position.y = moving && !RM ? 0.02 * Math.sin(t * 18) * Math.min(1, Math.abs(ds) * 20) : 0;
    vanBody.rotation.z = -dh * 0.6;
    U.uBlink.value += ((pSm > 0.12 && pSm < 0.9 ? 1 : 0.15) - U.uBlink.value) * Math.min(1, dt * 3);
    arrive += ((pSm > 0.84 ? 1 : 0) - arrive) * Math.min(1, dt * 1.5); U.uArrive.value = arrive;
    const [az, el, dist] = camAt(pSm), a = heading + az + mx * 0.12, dd = dist * (MOB ? 1.7 : 1);
    look.set(pos.x, 0.9 + clamp(1 - Math.abs(sNow - S_CLINIC) / 8) * 1.6 + clamp(1 - Math.abs(sNow - S_HOME) / 8) * 1.0, pos.z);
    camP.set(pos.x + Math.sin(a) * Math.cos(el) * dd, Math.sin(el) * dd + 0.6 - my * 1.2, pos.z + Math.cos(a) * Math.cos(el) * dd);
    camera.position.lerp(camP, last && camera.position.lengthSq() > 0 ? Math.min(1, dt * 4) : 1);
    camera.lookAt(look);
    U.uTime.value = t; U.uSize.value = (MOB ? 0.06 : 0.055) * (DPR > 1.5 ? 1 : 1.15);
    U.uMaxPx.value = (MOB ? 6 : 7.5) * DPR; U.uFogN.value = dd * 1.2; U.uFogF.value = dd * 3.6 + 18;
    renderer.render(scene, camera);
  };
  camera.position.set(0, 8, 14);
  requestAnimationFrame(loop);
  new IntersectionObserver((es) => es.forEach((e) => { vis = e.isIntersecting; }), { threshold: 0 }).observe(sec);
  new GLTFLoader().load('/home/assets/3d/ambulance/ambulance.glb', async (gltf) => {
    await buildVan(gltf);
    if (g) g.to(U.uFade, { value: 1, duration: 1.6, ease: 'power2.out' }); else U.uFade.value = 1;
    sec.classList.add('is-ready');
  }, undefined, () => { U.uFade.value = 1; });
})();
