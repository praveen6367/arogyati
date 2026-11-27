/* AROGYATI — About: our story. A small particle town drawn in the same point style as the body: the clinic,
   a road, a hospital, houses, trees and street lamps under a soft morning sky. The clinic's ambulance (CC0 "Car Kit"
   ambulance by Kenney, carrying a red cross and the Arogyati name) waits outside the clinic, then, as you scroll,
   drives out on call, past the hospital, to a patient's home, its beacons washing the road in light. The copy beside
   it changes at each stop. */
import * as THREE from '/home/vendor/three/three.module.min.js';
import { GLTFLoader } from '/home/vendor/three/GLTFLoader.js';

(() => {
  const d = document, sec = d.querySelector('.abs'); if (!sec) return;
  const cv = sec.querySelector('.abs__gl'), beats = [...sec.querySelectorAll('.abs__beat')], ticks = [...sec.querySelectorAll('.abs__prog li')];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches, FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const MOB = innerWidth < 900, g = window.gsap;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), mix = (a, b, t) => a + (b - a) * t, sst = (t) => t * t * (3 - 2 * t);
  const DEN = MOB ? 0.55 : 1; // particle density
  const DBG = /abdbg/.test(location.search);

  /* ---------- copy: which beat is showing ---------- */
  const BEAT_AT = [0, 0.17, 0.43, 0.64];
  let curB = 0;
  const setBeat = (k) => {
    if (k === curB) return; const from = beats[curB], to = beats[k], dir = k > curB ? 1 : -1; curB = k;
    ticks.forEach((t, i) => { t.classList.toggle('is-on', i <= k); t.classList.toggle('is-now', i === k); });
    beats.forEach((b) => b.setAttribute('aria-hidden', String(b !== to)));
    if (g && !RM) {
      g.killTweensOf([from, to, ...from.children, ...to.children]);
      g.to(from.children, { y: -20 * dir, opacity: 0, filter: 'blur(6px)', duration: 0.4, stagger: 0.03, ease: 'power2.in', onComplete: () => { from.classList.remove('is-on'); g.set(from.children, { clearProps: 'all' }); } });
      to.classList.add('is-on');
      g.fromTo(to.children, { y: 28 * dir, opacity: 0, filter: 'blur(8px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.1, stagger: 0.07, delay: 0.2, ease: 'expo.out', clearProps: 'filter' });
    } else { from.classList.remove('is-on'); to.classList.add('is-on'); }
  };
  const progress = () => { const r = sec.getBoundingClientRect(), len = Math.max(1, sec.offsetHeight - innerHeight); return clamp(-r.top / len); };
  const beatOf = (p) => { let k = 0; BEAT_AT.forEach((b, i) => { if (p >= b) k = i; }); return k; };

  let renderer = null;
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' }); renderer.setClearColor(0x000000, 0); } catch (e) { renderer = null; }
  if (!renderer) { sec.classList.add('is-nogl'); addEventListener('scroll', () => setBeat(beatOf(progress())), { passive: true }); return; }

  /* ---------- the point material ----------
     kinds: 0 surface · 1/2 beacon red/blue · 3 headlamp · 4 home window (lights up on arrival) · 5 leaves (sway)
            6 ground (catches beacon light and the headlamp pool) · 7 dust in the air · 8 the van's shadow · 9 street lamp · 10 cloud */
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(34, 1, 0.1, 260);
  const U = {
    uTime: { value: 0 }, uSize: { value: 1 }, uScale: { value: 500 }, uFogN: { value: 18 }, uFogF: { value: 70 }, uBlink: { value: 0 }, uArrive: { value: 0 }, uFade: { value: 0 }, uMaxPx: { value: 8 },
    uVan: { value: new THREE.Vector3() }, uVanDir: { value: new THREE.Vector2(0, 1) }, uLamps: { value: 1 }, uCenter: { value: new THREE.Vector3() },
  };
  const VERT = /* glsl */`
    attribute vec3 color; attribute float aRnd; attribute float aKind; attribute float aSize;
    uniform float uTime, uSize, uScale, uFogN, uFogF, uBlink, uArrive, uFade, uMaxPx, uLamps;
    uniform vec3 uVan, uCenter; uniform vec2 uVanDir;
    varying vec3 vCol; varying float vA; varying float vGlow;
    void main(){
      vec3 pos = position; float k = aKind;
      if (k > 6.5 && k < 7.5) { // dust motes drifting up through the light, wrapped around the view
        vec3 q = position; q.y = mod(q.y + uTime * (0.12 + aRnd * 0.18), 9.0); q.x += sin(uTime * 0.25 + aRnd * 30.0) * 0.8; q.z += cos(uTime * 0.2 + aRnd * 17.0) * 0.8;
        q.xz = mod(q.xz - uCenter.xz + 18.0, 36.0) - 18.0; pos = vec3(uCenter.x, 0.0, uCenter.z) + q;
      }
      if (k > 9.5) pos.x += mod(uTime * 0.25 + aRnd * 0.0, 200.0) * 0.0 + sin(uTime * 0.03 + aRnd) * 1.5; // clouds: a slow breathing drift
      vec4 wp = modelMatrix * vec4(pos, 1.0);
      if (k > 4.5 && k < 5.5) { float hgt = max(0.0, wp.y - 1.2); wp.x += sin(uTime * 1.1 + wp.z * 0.35 + aRnd) * 0.05 * hgt; wp.z += cos(uTime * 0.9 + wp.x * 0.3) * 0.035 * hgt; }
      vec4 mv = viewMatrix * wp;
      vec3 nV = normalize(mat3(viewMatrix) * normalize(mat3(modelMatrix) * normal)), vd = normalize(-mv.xyz);
      float facing = dot(nV, vd);
      float key = max(dot(nV, normalize(mat3(viewMatrix) * normalize(vec3(-0.45, 0.8, 0.35)))), 0.0), fill = max(dot(nV, vd), 0.0);
      float lit = clamp(key * 0.85 + fill * 0.3, 0.0, 1.0), rim = smoothstep(0.6, 0.98, 1.0 - abs(facing));
      vec3 col = color * (0.8 + 0.32 * lit);
      col = mix(col, vec3(0.88, 0.93, 1.0), rim * 0.3);
      float a = mix(0.6, 0.96, lit);
      a *= mix(0.05, 1.0, smoothstep(-0.05, 0.25, facing));
      float glow = 0.0, sz = aSize, blinkR = step(0.5, fract(uTime * 1.5));
      if (k > 0.5 && k < 1.5) { glow = uBlink * blinkR; col = mix(col, vec3(1.0, 0.34, 0.28), glow); sz *= 1.0 + glow * 0.9; a = max(a, glow); }
      else if (k > 1.5 && k < 2.5) { glow = uBlink * (1.0 - blinkR); col = mix(col, vec3(0.32, 0.58, 1.0), glow); sz *= 1.0 + glow * 0.9; a = max(a, glow); }
      else if (k > 2.5 && k < 3.5) { glow = 0.75; col = vec3(1.0, 0.88, 0.6); sz *= 1.4; a = 1.0; }
      else if (k > 3.5 && k < 4.5) { glow = uArrive * (0.85 + 0.15 * sin(uTime * 2.0 + aRnd * 6.0)); col = mix(col, vec3(1.0, 0.74, 0.44), uArrive); sz *= 1.0 + uArrive * 0.45; a = max(a, 0.55 + 0.45 * uArrive); }
      else if (k > 5.5 && k < 6.5) { // ground and road: beacon wash and the headlamp pool
        a = 0.62; float dv = distance(wp.xz, uVan.xz), wash = exp(-dv * dv / 14.0) * uBlink;
        vec3 bc = mix(vec3(1.0, 0.42, 0.36), vec3(0.4, 0.62, 1.0), 1.0 - blinkR);
        col = mix(col, bc, wash * 0.55); a = max(a, wash * 0.7); glow = wash * 0.35;
        vec2 rel = wp.xz - (uVan.xz + uVanDir * 4.2); float pool = exp(-dot(rel, rel) / 4.0) * uLamps;
        col = mix(col, vec3(1.0, 0.86, 0.6), pool * 0.6); a = max(a, pool * 0.75);
      }
      else if (k > 6.5 && k < 7.5) { col = vec3(0.6, 0.72, 0.92); a = 0.32 + 0.2 * sin(uTime * 1.3 + aRnd * 9.0); glow = 0.5; }
      else if (k > 7.5 && k < 8.5) { col = vec3(0.22, 0.28, 0.4); a = aSize * 0.5; sz = 1.3; }
      else if (k > 8.5 && k < 9.5) { glow = 0.45; col = vec3(1.0, 0.9, 0.7); sz *= 1.3; a = 0.9; }
      else if (k > 9.5) { a = 0.26; glow = 0.4; }
      float fog = smoothstep(uFogF, uFogN, -mv.z) * smoothstep(2.0, 7.0, -mv.z);
      if (k > 9.5) fog = 0.9;
      mv.xyz += 0.01 * vec3(sin(uTime * 0.8 + aRnd * 40.0), cos(uTime * 0.7 + aRnd * 31.0), 0.0) * (1.0 - fog * 0.6);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = clamp(uSize * sz * (0.9 + aRnd * 0.2) * uScale / -mv.z, 1.0, k > 9.5 ? uMaxPx * 2.2 : uMaxPx);
      vCol = col; vA = a * fog * uFade; vGlow = glow;
    }`;
  const FRAG = /* glsl */`
    varying vec3 vCol; varying float vA; varying float vGlow;
    void main(){
      vec2 c = gl_PointCoord - 0.5; float r = length(c);
      float core = smoothstep(0.5, 0.26, r), halo = exp(-r * r * 9.0) * vGlow * 0.85;
      float a = max(core * (1.0 - vGlow * 0.3), halo) * vA; if (a < 0.008) discard;
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

  /* ---------- colours (brand blues and greens, softened for a morning haze) ---------- */
  const C = {
    wall: [0.56, 0.65, 0.79], wall2: [0.62, 0.7, 0.83], roof: [0.4, 0.58, 0.4], roof2: [0.46, 0.54, 0.68], glass: [0.13, 0.21, 0.4], glass2: [0.26, 0.38, 0.6],
    clinic: [0.44, 0.57, 0.79], sign: [0.31, 0.54, 0.25], cross: [0.91, 0.43, 0.36], trunk: [0.46, 0.4, 0.36], leaf: [0.34, 0.58, 0.36], leaf2: [0.44, 0.65, 0.38], leaf3: [0.3, 0.5, 0.4],
    line: [0.5, 0.58, 0.7], dash: [0.62, 0.68, 0.78], asphalt: [0.72, 0.76, 0.83], kerb: [0.56, 0.62, 0.72], walk: [0.76, 0.8, 0.85], ground: [0.68, 0.75, 0.79], grass: [0.5, 0.68, 0.46],
    flowerA: [0.95, 0.62, 0.52], flowerB: [0.96, 0.82, 0.5], pole: [0.42, 0.48, 0.58],
  };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const shade = (c, f) => [c[0] * f, c[1] * f, c[2] * f];

  /* ---------- builders: surfaces drawn as evenly spaced dots, with crisp edges, glass panes and open doors ---------- */
  const V3 = new THREE.Vector3(), N3 = new THREE.Vector3();
  // a vertical rectangle (u along x, v up) facing +z, mapped by matrix M; holes(u,v) -> false (skip) | {c,k,s} | null
  const wall = (B, M, w, h, col, dens, holes) => {
    const sp = 1 / Math.sqrt(dens * DEN), nm = new THREE.Matrix3().getNormalMatrix(M); N3.set(0, 0, 1).applyMatrix3(nm).normalize(); const nx = N3.x, ny = N3.y, nz = N3.z;
    for (let v = sp * 0.5; v < h; v += sp) for (let u = sp * 0.5; u < w; u += sp) {
      const uu = Math.min(w, Math.max(0, u + (Math.random() - 0.5) * sp * 0.7)), vv = Math.min(h, Math.max(0, v + (Math.random() - 0.5) * sp * 0.7)); let c = col, k = 0, sz = 1;
      if (holes) { const r = holes(uu, vv); if (r === false) continue; if (r) { c = r.c || c; k = r.k || 0; sz = r.s || 1; } }
      V3.set(uu - w / 2, vv, 0).applyMatrix4(M); push(B, V3.x, V3.y, V3.z, nx, ny, nz, c, k, sz);
    }
  };
  const line = (B, M, a, b, col, step = 0.07, size = 1.1, n = [0, 1, 0]) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), cnt = Math.max(2, Math.round(len / (step / Math.sqrt(DEN)))); N3.set(n[0], n[1], n[2]).applyMatrix3(new THREE.Matrix3().getNormalMatrix(M)).normalize(); const nn = [N3.x, N3.y, N3.z];
    for (let i = 0; i <= cnt; i++) { const t = i / cnt; V3.set(mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)).applyMatrix4(M); push(B, V3.x, V3.y, V3.z, nn[0], nn[1], nn[2], col, 0, size); }
  };
  const matAt = (x, y, z, ry, extra) => { const m = new THREE.Matrix4().makeRotationY(ry).setPosition(x, y, z); return extra ? m.multiply(extra) : m; };
  const T = (x, y, z) => new THREE.Matrix4().makeTranslation(x, y, z), RY = (a) => new THREE.Matrix4().makeRotationY(a), RX = (a) => new THREE.Matrix4().makeRotationX(a);
  // a building; its front faces +z in its own frame
  const building = (B, x, z, ry, w, h, dp, opt) => {
    const base = matAt(x, 0, z, ry), dens = opt.dens || 26, win = opt.win, door = opt.door, dU = opt.doorU ?? w / 2;
    const pane = opt.winFill || C.glass2; const refl = (c, v) => { const f = win ? clamp(((v - win[4]) % win[5]) / win[3]) : 0; return [mix(c[0], 0.62, f * 0.35), mix(c[1], 0.72, f * 0.35), mix(c[2], 0.88, f * 0.35)]; };
    const inDoor = (u, v, pad = 0) => door && Math.abs(u - dU) < door[0] / 2 + pad && v < door[1] + pad;
    const winAt = (u, v, span) => { if (!win) return false; const [cols, rows, ww, wh, y0, gap] = win, n = span === w ? cols : Math.max(1, Math.round(span / 2.6)), cw = span / n, cu = (u % cw) - cw / 2, row = Math.floor((v - y0) / gap), rv = (v - y0) - row * gap; return row >= 0 && row < rows && Math.abs(cu) < ww / 2 && rv < wh; };
    // a window: open, with a little glass (warm windows on the home are filled so they can light up)
    const glassAt = (v, glow) => (glow ? { c: refl(pane, v), k: opt.winKind, s: 1.05 } : (Math.random() < 0.3 ? { c: refl(pane, v), s: 0.85 } : false));
    const front = (u, v) => { if (inDoor(u, v)) return opt.doorKind ? { c: opt.doorFill, k: opt.doorKind, s: 0.95 } : (Math.random() < 0.3 ? { c: opt.doorFill || shade(opt.col, 0.55), s: 0.85 } : false); if (winAt(u, v, w) && !inDoor(u, v, 0.35)) return glassAt(v, !!opt.winKind); return null; };
    const back = (u, v) => (winAt(u, v, w) ? glassAt(v, false) : null);
    const sideF = (u, v) => (opt.sideWin !== false && winAt(u, v, dp) ? glassAt(v, !!(opt.winKind && opt.sideGlow)) : null);
    wall(B, base.clone().multiply(T(0, 0, dp / 2)), w, h, opt.col, dens, front);
    wall(B, base.clone().multiply(RY(Math.PI)).multiply(T(0, 0, dp / 2)), w, h, opt.col2 || opt.col, dens * 0.6, back);
    wall(B, base.clone().multiply(RY(Math.PI / 2)).multiply(T(0, 0, w / 2)), dp, h, opt.col2 || opt.col, dens * 0.8, sideF);
    wall(B, base.clone().multiply(RY(-Math.PI / 2)).multiply(T(0, 0, w / 2)), dp, h, opt.col2 || opt.col, dens * 0.8, sideF);
    // window frames with a centre bar, on every wall that has windows
    if (win) {
      const [cols, rows, ww, wh, y0, gap] = win, fcol = shade(opt.col, 0.66);
      const frames = (M, span, n, isFront) => { const cw = span / n; for (let c = 0; c < n; c++) for (let r = 0; r < rows; r++) { const uc = (c + 0.5) * cw, v0 = y0 + r * gap, v1 = v0 + wh, u0 = uc - ww / 2, u1 = uc + ww / 2; if (isFront && door && Math.abs(uc - dU) < door[0] / 2 + ww / 2 + 0.35 && v0 < door[1] + 0.35) continue; const X = (u) => u - span / 2; line(B, M, [X(u0), v0, 0.02], [X(u1), v0, 0.02], fcol, 0.045, 1, [0, 0, 1]); line(B, M, [X(u0), v1, 0.02], [X(u1), v1, 0.02], fcol, 0.045, 1, [0, 0, 1]); line(B, M, [X(u0), v0, 0.02], [X(u0), v1, 0.02], fcol, 0.045, 1, [0, 0, 1]); line(B, M, [X(u1), v0, 0.02], [X(u1), v1, 0.02], fcol, 0.045, 1, [0, 0, 1]); if (ww > 0.9) line(B, M, [X(uc), v0, 0.02], [X(uc), v1, 0.02], fcol, 0.05, 0.9, [0, 0, 1]); line(B, M, [X(u0) - 0.08, v0 - 0.06, 0.05], [X(u1) + 0.08, v0 - 0.06, 0.05], fcol, 0.045, 1.05, [0, 0, 1]); } };
      frames(base.clone().multiply(T(0, 0, dp / 2)), w, cols, true);
      frames(base.clone().multiply(RY(Math.PI)).multiply(T(0, 0, dp / 2)), w, cols, false);
      if (opt.sideWin !== false) { const ns = Math.max(1, Math.round(dp / 2.6)); frames(base.clone().multiply(RY(Math.PI / 2)).multiply(T(0, 0, w / 2)), dp, ns, false); frames(base.clone().multiply(RY(-Math.PI / 2)).multiply(T(0, 0, w / 2)), dp, ns, false); }
    }
    // edges: corners, eaves and the door frame make the form read at a glance
    const e = shade(opt.col, 0.78), hw = w / 2, hd = dp / 2;
    [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].forEach(([ex, ez]) => line(B, base, [ex, 0, ez], [ex, h, ez], e, 0.06, 1.15));
    line(B, base, [-hw, h, hd], [hw, h, hd], e, 0.06, 1.15); line(B, base, [-hw, h, -hd], [hw, h, -hd], e, 0.06, 1.1); line(B, base, [hw, h, -hd], [hw, h, hd], e, 0.06, 1.1); line(B, base, [-hw, h, -hd], [-hw, h, hd], e, 0.06, 1.1);
    if (door) { const f = shade(opt.col, 0.7); line(B, base, [dU - w / 2 - door[0] / 2, 0, hd + 0.01], [dU - w / 2 - door[0] / 2, door[1], hd + 0.01], f, 0.05, 1.05, [0, 0, 1]); line(B, base, [dU - w / 2 + door[0] / 2, 0, hd + 0.01], [dU - w / 2 + door[0] / 2, door[1], hd + 0.01], f, 0.05, 1.05, [0, 0, 1]); line(B, base, [dU - w / 2 - door[0] / 2, door[1], hd + 0.01], [dU - w / 2 + door[0] / 2, door[1], hd + 0.01], f, 0.05, 1.05, [0, 0, 1]); }
    if (opt.gable) { // pitched roof, ridge along the width, with overhang
      const rise = opt.gable, ov = 0.35, slope = Math.hypot(hd + ov, rise), ang = Math.atan2(rise, hd + ov);
      wall(B, base.clone().multiply(T(0, h - ov * Math.tan(ang), hd + ov)).multiply(RX(-Math.PI / 2 + ang)), w + 0.7, slope + 0.05, opt.roof, dens * 1.15);
      wall(B, base.clone().multiply(RY(Math.PI)).multiply(T(0, h - ov * Math.tan(ang), hd + ov)).multiply(RX(-Math.PI / 2 + ang)), w + 0.7, slope + 0.05, opt.roof, dens * 0.9);
      const re = shade(opt.roof, 0.72);
      line(B, base, [-hw - 0.35, h + rise, 0], [hw + 0.35, h + rise, 0], re, 0.05, 1.2);
      line(B, base, [-hw - 0.35, h - ov * Math.tan(ang), hd + ov], [hw + 0.35, h - ov * Math.tan(ang), hd + ov], re, 0.06, 1.1);
      [1, -1].forEach((sd) => { // gable ends: triangles with their own edges
        const M = base.clone().multiply(RY(sd * Math.PI / 2)).multiply(T(0, h, w / 2)), nm = new THREE.Matrix3().getNormalMatrix(M), sp = 1 / Math.sqrt(dens * 0.8 * DEN);
        N3.set(0, 0, 1).applyMatrix3(nm).normalize();
        for (let v = sp / 2; v < rise; v += sp) for (let u = sp / 2; u < dp; u += sp) { const uu = u + (Math.random() - 0.5) * sp * 0.6, vv = v + (Math.random() - 0.5) * sp * 0.6; if (vv > rise * (1 - Math.abs(uu - hd) / hd)) continue; V3.set(uu - hd, vv, 0).applyMatrix4(M); push(B, V3.x, V3.y, V3.z, N3.x, N3.y, N3.z, opt.col2 || opt.col); }
        line(B, M, [-hd - ov, -ov * Math.tan(ang), 0.02], [0, rise, 0.02], re, 0.05, 1.15, [0, 0, 1]); line(B, M, [hd + ov, -ov * Math.tan(ang), 0.02], [0, rise, 0.02], re, 0.05, 1.15, [0, 0, 1]);
      });
    } else { // flat roof with a parapet
      wall(B, base.clone().multiply(T(0, h, 0)).multiply(RX(-Math.PI / 2)).multiply(T(0, -hd, 0)), w, dp, opt.roof, dens * 0.5);
      const pe = shade(opt.col, 0.72); [[-hw, -hd, hw, -hd], [hw, -hd, hw, hd], [hw, hd, -hw, hd], [-hw, hd, -hw, -hd]].forEach(([a1, b1, a2, b2]) => line(B, base, [a1, h + 0.35, b1], [a2, h + 0.35, b2], pe, 0.06, 1.05));
    }
  };
  // a leafy tree: tapered trunk, a few branches and a crown of overlapping clumps that sway; sometimes a slim cypress
  const tree = (B, x, z, s = 1) => {
    const h = 1.5 * s, tn = Math.round(70 * s * DEN);
    for (let i = 0; i < tn; i++) { const a = Math.random() * 6.283, y = Math.random() * h, r = 0.14 * s * (1 - y / h * 0.45); push(B, x + Math.cos(a) * r, y, z + Math.sin(a) * r, Math.cos(a), 0, Math.sin(a), C.trunk); }
    if (Math.random() < 0.22) { // cypress
      const ht = 3.6 * s, n = Math.round(ht * 260 * s * DEN);
      for (let i = 0; i < n; i++) { const y = Math.random() * ht, r = 0.75 * s * Math.sin(Math.PI * Math.pow(y / ht, 0.8)) * (0.9 + Math.random() * 0.15), a = Math.random() * 6.283; push(B, x + Math.cos(a) * r, h * 0.6 + y, z + Math.sin(a) * r, Math.cos(a), 0.3, Math.sin(a), Math.random() < 0.5 ? C.leaf3 : C.leaf, 5); }
      return;
    }
    const clumps = [[0, h + 0.9 * s, 0, 1.05 * s], [0.55 * s, h + 0.55 * s, 0.2 * s, 0.75 * s], [-0.5 * s, h + 0.6 * s, -0.25 * s, 0.72 * s], [0.1 * s, h + 1.45 * s, -0.1 * s, 0.7 * s]];
    clumps.forEach(([cx, cy, cz, r]) => {
      const n = Math.round(4 * Math.PI * r * r * 26 * DEN);
      for (let i = 0; i < n; i++) { const u = Math.random() * 2 - 1, a = Math.random() * 6.283, sq = Math.sqrt(1 - u * u), nx = sq * Math.cos(a), nz = sq * Math.sin(a), rr = r * (0.86 + Math.random() * 0.18); const c = u > 0.3 ? C.leaf2 : (u < -0.3 ? C.leaf3 : C.leaf); push(B, x + cx + nx * rr, cy + u * rr * 0.9, z + cz + nz * rr, nx, u, nz, c, 5); }
    });
  };
  // a street lamp: pole, arm and a soft lamp head
  const lamp = (B, x, z, ry) => {
    const M = matAt(x, 0, z, ry);
    line(B, M, [0, 0, 0], [0, 3.4, 0], C.pole, 0.05, 1.05); line(B, M, [0, 3.4, 0], [0, 3.55, 0.7], C.pole, 0.05, 1.05);
    for (let i = 0; i < 26; i++) { const a = Math.random() * 6.283, r = Math.random() * 0.12; V3.set(Math.cos(a) * r, 3.48, 0.75 + Math.sin(a) * r).applyMatrix4(M); push(B, V3.x, V3.y, V3.z, 0, -1, 0, [1, 0.92, 0.75], 9, 1.1); }
  };
  // words drawn on a surface, sampled from a canvas
  const textPts = (B, M, text, wWorld, col, weight = 600, kind = 0, size = 1.15, normal = [0, 0, 1]) => {
    const c = d.createElement('canvas'), W = 1024, H = 200; c.width = W; c.height = H; const x = c.getContext('2d');
    x.fillStyle = '#000'; x.font = `${weight} 150px "Plus Jakarta Sans", Arial, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, W / 2, H / 2 + 6);
    const im = x.getImageData(0, 0, W, H).data, sc = wWorld / W, step = MOB ? 5 : 4; N3.set(normal[0], normal[1], normal[2]).applyMatrix3(new THREE.Matrix3().getNormalMatrix(M)).normalize(); const nn = [N3.x, N3.y, N3.z];
    for (let yy = 0; yy < H; yy += step) for (let xx = 0; xx < W; xx += step) { if (im[(yy * W + xx) * 4 + 3] < 128) continue; V3.set((xx - W / 2) * sc, (H / 2 - yy) * sc, 0).applyMatrix4(M); push(B, V3.x, V3.y, V3.z, nn[0], nn[1], nn[2], col, kind, size); }
  };

  /* ---------- the town ---------- */
  const ENV = mkBuf();
  const facing = (s, sd) => { const sv = side(s).multiplyScalar(sd); return Math.atan2(-sv.x, -sv.z); }; // a building's front (+z) looks at the road
  const place = (s, sd, off) => at(s).add(side(s).multiplyScalar(sd * off));
  { // road: lane lines, centre dashes, kerbs, pavements, a zebra crossing by the clinic
    const step = 0.08 / Math.sqrt(DEN);
    for (let s = 0; s < L; s += step) {
      const p = at(s), n = side(s);
      [-2.15, 2.15].forEach((o) => push(ENV, p.x + n.x * o, 0.01, p.z + n.z * o, 0, 1, 0, C.line, 6, 0.95));
      [-2.75, 2.75].forEach((o) => push(ENV, p.x + n.x * o, 0.06, p.z + n.z * o, 0, 1, 0, C.kerb, 6, 1.05));
      if ((s % 1.8) < 0.9) push(ENV, p.x, 0.01, p.z, 0, 1, 0, C.dash, 6, 0.95);
      for (let j = 0; j < 3; j++) { const o = rnd(-2.6, 2.6); push(ENV, p.x + n.x * o, 0, p.z + n.z * o, 0, 1, 0, C.asphalt, 6, 0.6); }
      for (let j = 0; j < 2; j++) { const o = (Math.random() < 0.5 ? -1 : 1) * rnd(2.85, 4.1); push(ENV, p.x + n.x * o, 0.05, p.z + n.z * o, 0, 1, 0, C.walk, 6, 0.6); }
    }
    const zs = S_CLINIC + 7.5, zp = at(zs), zt = tan(zs), zn = side(zs);
    for (let i = -5; i <= 5; i++) { const o = i * 0.45; if (i % 2) continue; for (let k = 0; k < 60 * DEN; k++) { const f = rnd(-0.55, 0.55), l = rnd(-0.17, 0.17); push(ENV, zp.x + zn.x * o + zt.x * f + zn.x * l, 0.015, zp.z + zn.z * o + zt.z * f + zn.z * l, 0, 1, 0, [0.82, 0.86, 0.92], 6, 0.9); } }
    // ground: grass and soil dots thinning away from the road, little tufts and the odd flower
    const gN = Math.round(18000 * DEN);
    for (let i = 0; i < gN; i++) { const s = Math.random() * L, o = (Math.random() < 0.5 ? -1 : 1) * (4.2 + Math.pow(Math.random(), 1.5) * 28), p = at(s), n = side(s); const r = Math.random(); push(ENV, p.x + n.x * o + rnd(-1, 1), 0, p.z + n.z * o + rnd(-1, 1), 0, 1, 0, r < 0.32 ? C.grass : (r < 0.336 ? C.flowerA : (r < 0.35 ? C.flowerB : C.ground)), 6, r < 0.35 && r > 0.32 ? 0.9 : 0.5); }
    for (let i = 0; i < 260 * DEN; i++) { const s = Math.random() * L, o = (Math.random() < 0.5 ? -1 : 1) * rnd(4.4, 12), p = at(s), n = side(s), cx = p.x + n.x * o, cz = p.z + n.z * o; for (let j = 0; j < 9; j++) { const a = Math.random() * 6.283, r = Math.random() * 0.22; push(ENV, cx + Math.cos(a) * r, Math.random() * 0.22, cz + Math.sin(a) * r, 0, 1, 0, C.grass, 5, 0.7); } }
  }
  { // the clinic: two storeys, a glass front, the name over the door, a little garden
    const s = S_CLINIC, sd = 1, p = place(s, sd, 9.6), ry = facing(s, sd);
    building(ENV, p.x, p.z, ry, 12, 6.4, 7, { col: C.clinic, col2: C.wall, roof: C.roof2, dens: 64, win: [5, 2, 1.8, 1.7, 0.85, 3], winFill: C.glass, door: [2.2, 2.4], doorFill: C.glass });
    textPts(ENV, matAt(p.x, 0, p.z, ry, T(0, 5.7, 3.53)), 'AROGYATI', 6.2, C.sign);
    const back = matAt(p.x, 0, p.z, ry); [[-7.4, 2], [7.4, 1.6]].forEach(([dx, dz]) => { V3.set(dx, 0, dz).applyMatrix4(back); tree(ENV, V3.x, V3.z, 0.95); });
  }
  { // the hospital: tall, a cross on the roof
    const s = S_HOSP, sd = -1, p = place(s, sd, 11.5), ry = facing(s, sd);
    building(ENV, p.x, p.z, ry, 10, 11, 8, { col: C.wall2, col2: C.wall, roof: C.roof2, dens: 34, win: [5, 4, 1.1, 1.3, 1.4, 2.4], winFill: C.glass2, door: [2.6, 2.6], doorFill: C.glass });
    const M = matAt(p.x, 0, p.z, ry, T(0, 11.5, 4.05));
    wall(ENV, M.clone().multiply(T(0, 0, 0)), 0.7, 2.4, C.cross, 140); wall(ENV, M.clone().multiply(T(0, 0.85, 0)), 2.4, 0.7, C.cross, 140);
  }
  { // the patient's home: its windows and door glow warm when the ambulance arrives
    const s = S_HOME, sd = 1, p = place(s, sd, 9), ry = facing(s, sd);
    building(ENV, p.x, p.z, ry, 6.5, 3.4, 5.5, { col: C.wall2, col2: C.wall, roof: C.roof, gable: 2, dens: 80, win: [3, 1, 1.1, 1.1, 1.2, 3], winFill: C.glass2, winKind: 4, door: [1.1, 2.1], doorU: 3.25, doorFill: [0.5, 0.42, 0.38], doorKind: 4, sideWin: true, sideGlow: true });
    const hm = matAt(p.x, 0, p.z, ry); [[5.2, -0.8, 1.1], [-5.4, 1.2, 0.9], [-3, -4.5, 1]].forEach(([dx, dz, sc]) => { V3.set(dx, 0, dz).applyMatrix4(hm); tree(ENV, V3.x, V3.z, sc); });
    for (let i = 0; i < 14; i++) { V3.set(rnd(-3.2, 3.2), 0, 3.6 + rnd(0, 0.3)).applyMatrix4(hm); for (let j = 0; j < 8; j++) push(ENV, V3.x + rnd(-0.12, 0.12), rnd(0, 0.35), V3.z + rnd(-0.12, 0.12), 0, 1, 0, Math.random() < 0.3 ? C.flowerA : C.grass, 5, 0.8); }
  }
  { // houses, trees and street lamps along the way, kept clear of the three places
    const busy = [S_CLINIC, S_HOSP, S_HOME];
    for (let s = 2; s < L - 2; s += rnd(5.5, 8)) {
      [-1, 1].forEach((sd) => {
        if (busy.some((b, i) => Math.abs(s - b) < (((i === 1 && sd === -1) || (i !== 1 && sd === 1)) ? (i === 1 ? 14 : 9) : 16))) { if (Math.random() < 0.5) { const q = place(s, sd, rnd(14, 20)); tree(ENV, q.x, q.z, rnd(0.7, 1)); } return; }
        if (Math.random() < 0.58) { const w = rnd(4.4, 6), dp = rnd(4, 5), off = rnd(7, 10), p = place(s, sd, off); building(ENV, p.x, p.z, facing(s, sd), w, rnd(2.8, 3.6), dp, { col: Math.random() < 0.5 ? C.wall2 : C.wall, col2: C.wall, roof: Math.random() < 0.6 ? C.roof : C.roof2, gable: rnd(1.4, 2), dens: 24, win: [2, 1, 1, 1, 1.1, 3], door: [1, 2] }); if (Math.random() < 0.6) { const q = place(s + rnd(-3, 3), sd, off + rnd(3.5, 5)); tree(ENV, q.x, q.z, rnd(0.8, 1.1)); } }
        else { const q = place(s, sd, rnd(4.8, 7)); tree(ENV, q.x, q.z, rnd(0.75, 1.15)); }
        if (Math.random() < 0.35) { const q = place(s + 2.5, sd, rnd(13, 18)); tree(ENV, q.x, q.z, rnd(0.8, 1.25)); }
      });
    }
    for (let s = 4, i = 0; s < L - 2; s += 15, i++) { const sd = i % 2 ? 1 : -1; if (busy.some((b) => Math.abs(s - b) < 4)) continue; const q = place(s, sd, 3.3); lamp(ENV, q.x, q.z, facing(s, sd) + Math.PI); }
    // clouds far above, drifting
    for (let c = 0; c < 7; c++) { const s = rnd(0, L), q = place(s, Math.random() < 0.5 ? -1 : 1, rnd(25, 45)), y = rnd(16, 24), rx = rnd(4, 7), ry2 = rnd(1.2, 2), n = Math.round(320 * DEN); for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, r = Math.sqrt(Math.random()); push(ENV, q.x + Math.cos(a) * r * rx, y + (Math.random() - 0.3) * ry2, q.z + Math.sin(a) * r * rx * 0.6, 0, 1, 0, [0.74, 0.82, 0.94], 10, rnd(1.5, 3)); } }
  }
  const envPts = toPoints(ENV); scene.add(envPts);
  { // dust in the morning light (placed by the shader around the view)
    const B = mkBuf(), n = Math.round(700 * DEN); for (let i = 0; i < n; i++) push(B, rnd(-18, 18), rnd(0, 9), rnd(-18, 18), 0, 0, 1, [1, 1, 1], 7, rnd(0.7, 1.4));
    scene.add(toPoints(B));
  }

  /* ---------- the ambulance: points on the real model, coloured from its own palette, with its markings ---------- */
  const van = new THREE.Group(), vanBody = new THREE.Group(); van.add(vanBody); scene.add(van);
  const wheels = []; let vanReady = false;
  const loadImg = (src) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
  const buildVan = async (gltf) => {
    const im = await loadImg('/home/assets/3d/ambulance/Textures/colormap.png'), c = d.createElement('canvas'); c.width = im.width; c.height = im.height;
    const cx = c.getContext('2d'); cx.drawImage(im, 0, 0); const px = cx.getImageData(0, 0, c.width, c.height).data;
    const tex = (u, v) => { const x = Math.min(c.width - 1, Math.max(0, Math.floor(u * c.width))), y = Math.min(c.height - 1, Math.max(0, Math.floor(v * c.height))), i = (y * c.width + x) * 4; return [px[i] / 255, px[i + 1] / 255, px[i + 2] / 255]; };
    // the palette, brought into the site's colours: white body -> soft brand blue, red -> coral, dark -> deep navy glass and tyres
    const remap = (rgb, y) => {
      const [r, gg, b] = rgb, mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), lum = 0.3 * r + 0.59 * gg + 0.11 * b, sat = mx - mn;
      if (r > gg + 0.25 && r > b + 0.2) return { c: [0.9, 0.42, 0.35], k: y > 1.42 ? 1 : 0 };
      if (b > r + 0.2 && b > gg + 0.05) return { c: [0.3, 0.5, 0.86], k: y > 1.42 ? 2 : 0 };
      if (r > 0.85 && gg > 0.6 && b < 0.45) return { c: [1, 0.84, 0.52], k: 3 };
      if (lum < 0.32) return { c: [0.12, 0.17, 0.28], k: 0, s: 0.95 };
      if (sat < 0.12 && lum > 0.72) return { c: [0.36 + y * 0.08, 0.52 + y * 0.065, 0.8 + y * 0.03], k: 0 };
      return { c: [0.46, 0.54, 0.67], k: 0 };
    };
    const root = gltf.scene; root.updateMatrixWorld(true);
    const box = new THREE.Box3();
    const sample = (mesh, M, count, B) => {
      const g2 = mesh.geometry, pos = g2.attributes.position, uv = g2.attributes.uv, idx = g2.index.array;
      const tris = []; let tot = 0; const a = new THREE.Vector3(), b = new THREE.Vector3(), cc = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3();
      for (let i = 0; i < idx.length; i += 3) { a.fromBufferAttribute(pos, idx[i]).applyMatrix4(M); b.fromBufferAttribute(pos, idx[i + 1]).applyMatrix4(M); cc.fromBufferAttribute(pos, idx[i + 2]).applyMatrix4(M); const ar = e1.subVectors(b, a).cross(e2.subVectors(cc, a)).length() / 2; if (ar <= 1e-7) continue; tot += ar; tris.push([idx[i], idx[i + 1], idx[i + 2], tot]); box.expandByPoint(a); box.expandByPoint(b); box.expandByPoint(cc); }
      const r0 = 0.78 * Math.sqrt(tot / count), grid = new Map(), key = (x, y, z) => `${Math.floor(x / r0)},${Math.floor(y / r0)},${Math.floor(z / r0)}`;
      const ok = (p) => { const gx = Math.floor(p.x / r0), gy = Math.floor(p.y / r0), gz = Math.floor(p.z / r0); for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) { const L2 = grid.get(`${gx + i},${gy + j},${gz + k}`); if (L2) for (const q of L2) if (q.distanceToSquared(p) < r0 * r0) return false; } return true; };
      const nrm = new THREE.Vector3(); let n = 0;
      for (let tries = 0; n < count && tries < count * 10; tries++) {
        const r = Math.random() * tot; let lo = 0, hi = tris.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (tris[m][3] < r) lo = m + 1; else hi = m; }
        const [i0, i1, i2] = tris[lo]; let u = Math.random(), v = Math.random(); if (u + v > 1) { u = 1 - u; v = 1 - v; } const w = 1 - u - v;
        a.fromBufferAttribute(pos, i0).applyMatrix4(M); b.fromBufferAttribute(pos, i1).applyMatrix4(M); cc.fromBufferAttribute(pos, i2).applyMatrix4(M);
        const p = new THREE.Vector3(a.x * w + b.x * u + cc.x * v, a.y * w + b.y * u + cc.y * v, a.z * w + b.z * u + cc.z * v);
        if (!ok(p)) continue; const kk = key(p.x, p.y, p.z); if (grid.has(kk)) grid.get(kk).push(p); else grid.set(kk, [p]);
        nrm.subVectors(b, a).cross(e2.subVectors(cc, a)).normalize();
        const tu = uv.getX(i0) * w + uv.getX(i1) * u + uv.getX(i2) * v, tv = uv.getY(i0) * w + uv.getY(i1) * u + uv.getY(i2) * v;
        const m = remap(tex(tu, tv), p.y);
        push(B, p.x, p.y, p.z, nrm.x, nrm.y, nrm.z, m.c, m.k, m.k ? 1.25 : (m.s || 1)); n++;
      }
    };
    const BODY = mkBuf();
    root.traverse((o) => {
      if (!o.isMesh) return;
      if (/wheel/.test(o.name)) {
        const Wb = mkBuf(); sample(o, new THREE.Matrix4(), Math.round(1700 * DEN), Wb);
        const pivot = new THREE.Group(); pivot.position.copy(o.getWorldPosition(new THREE.Vector3())); vanBody.add(pivot); pivot.add(toPoints(Wb)); wheels.push(pivot);
      } else {
        sample(o, o.matrixWorld, Math.round((o.name === 'body' ? 19000 : 1100) * DEN), BODY);
        const m = new THREE.Mesh(o.geometry, new THREE.MeshBasicMaterial({ colorWrite: false, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 4 })); m.applyMatrix4(o.matrixWorld); m.renderOrder = 0; vanBody.add(m);
      }
    });
    // markings: a red cross and the Arogyati name on both sides of the box, a cross on the roof
    const bx = box.max.x + 0.012, top = box.max.y + 0.012, zBox = mix(box.min.z, box.max.z, 0.3);
    const cross = (M, s, n) => { const st = 0.035 / Math.sqrt(DEN); for (let y = -s; y <= s; y += st) for (let x = -s; x <= s; x += st) { if (Math.abs(x) > s * 0.33 && Math.abs(y) > s * 0.33) continue; V3.set(x, y, 0).applyMatrix4(M); push(BODY, V3.x, V3.y, V3.z, n[0], n[1], n[2], [0.92, 0.36, 0.3], 0, 1.05); } };
    [1, -1].forEach((sd) => {
      const M = new THREE.Matrix4().makeRotationY(sd * Math.PI / 2).setPosition(sd * bx, 1.18, zBox - 0.35 * sd * 0);
      cross(M.clone().multiply(T(sd * -0.15, 0, 0)), 0.27, [sd, 0, 0]);
    });
    cross(new THREE.Matrix4().makeRotationX(-Math.PI / 2).setPosition(0, top, zBox - 0.2), 0.32, [0, 1, 0]);
    vanBody.add(toPoints(BODY)).children.at(-1).renderOrder = 1;
    // a soft shadow on the road beneath it
    const SH = mkBuf(), sw = (box.max.x - box.min.x) * 0.62, sl = (box.max.z - box.min.z) * 0.56, scz = (box.max.z + box.min.z) / 2;
    for (let i = 0; i < 2200 * DEN; i++) { const a = Math.random() * 6.283, r = Math.sqrt(Math.random()); push(SH, Math.cos(a) * r * sw, 0.02, scz + Math.sin(a) * r * sl, 0, 1, 0, [0, 0, 0], 8, Math.pow(1 - r, 1.3)); }
    van.add(toPoints(SH));
    vanReady = true;
  };

  /* ---------- where the van is: scroll -> distance along the road (parked at the clinic, at the hospital, at home) ---------- */
  const KS = [[0, S_CLINIC], [0.15, S_CLINIC], [0.44, S_HOSP], [0.56, S_HOSP + 2.5], [0.86, S_HOME], [1, S_HOME]];
  const sAt = (p) => { for (let i = 1; i < KS.length; i++) if (p <= KS[i][0]) { const [p0, s0] = KS[i - 1], [p1, s1] = KS[i]; return mix(s0, s1, sst(clamp((p - p0) / (p1 - p0 || 1)))); } return S_HOME; };
  // camera: angle around the van (relative to its heading; +pi/2 = its right side, away from the clinic and the home), height, distance
  const CAM = [[0, 1.05, 0.3, 23], [0.15, 1.2, 0.32, 19], [0.3, 1.5, 0.36, 16], [0.47, -1.25, 0.36, 30], [0.62, -0.4, 0.4, 21], [0.86, 1.05, 0.3, 19], [1, 1.2, 0.3, 18]];
  const camAt = (p) => { for (let i = 1; i < CAM.length; i++) if (p <= CAM[i][0]) { const a = CAM[i - 1], b = CAM[i], t = sst(clamp((p - a[0]) / (b[0] - a[0] || 1))); return [mix(a[1], b[1], t), mix(a[2], b[2], t), mix(a[3], b[3], t)]; } const z = CAM[CAM.length - 1]; return [z[1], z[2], z[3]]; };

  /* ---------- loop ---------- */
  let W = 0, H = 0, DPR = 1, vis = false, last = 0, sNow = S_CLINIC, sPrev = S_CLINIC, heading = 0, mx = 0, my = 0, mxs = 0, mys = 0, pSm = 0, arrive = 0, vel = 0, pitch = 0;
  const resize = () => { DPR = Math.min(devicePixelRatio || 1, MOB ? 1.75 : 2); W = cv.clientWidth; H = cv.clientHeight; renderer.setPixelRatio(DPR); renderer.setSize(W, H, false); camera.aspect = W / Math.max(1, H); if (MOB) camera.setViewOffset(W, H, 0, -H * 0.2, W, H); else camera.setViewOffset(W, H, -W * 0.2, 0, W, H); camera.updateProjectionMatrix(); /* the van sits in the open half, clear of the copy */ U.uScale.value = (H * DPR) / (2 * Math.tan((camera.fov * Math.PI) / 360)); };
  resize(); addEventListener('resize', resize);
  if (FINE) addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
  const look = new THREE.Vector3(), camP = new THREE.Vector3(), lookS = new THREE.Vector3();
  let first = true;
  const loop = (now) => {
    requestAnimationFrame(loop);
    const p = progress(); setBeat(beatOf(p));
    if (!vis) return;
    const t = now / 1000, dt = Math.min(0.05, last ? t - last : 0.016); last = t;
    pSm += (p - pSm) * Math.min(1, dt * (RM ? 30 : 3.2));
    sPrev = sNow; sNow = sAt(pSm);
    const pos = at(sNow), tg = tan(sNow), hd = Math.atan2(tg.x, tg.z);
    let dh = hd - heading; while (dh > Math.PI) dh -= 2 * Math.PI; while (dh < -Math.PI) dh += 2 * Math.PI; heading += dh * Math.min(1, dt * 6);
    van.position.set(pos.x, 0, pos.z); van.rotation.y = heading;
    const ds = sNow - sPrev, v = ds / Math.max(dt, 1e-3), acc = (v - vel) / Math.max(dt, 1e-3); vel += (v - vel) * Math.min(1, dt * 8);
    wheels.forEach((w) => { w.rotation.x += ds / 0.3; });
    // suspension: a gentle bob at speed, nose dips when braking and lifts on pulling away, leans into bends
    pitch += (clamp(-acc * 0.004, -0.035, 0.035) - pitch) * Math.min(1, dt * 4);
    vanBody.position.y = RM ? 0 : 0.012 * Math.sin(t * 13) * clamp(Math.abs(vel) / 6);
    vanBody.rotation.x = RM ? 0 : pitch; vanBody.rotation.z = RM ? 0 : clamp(-dh * 0.5, -0.05, 0.05);
    U.uBlink.value += ((pSm > 0.12 && pSm < 0.9 ? 1 : 0.18) - U.uBlink.value) * Math.min(1, dt * 2.5);
    arrive += ((pSm > 0.84 ? 1 : 0) - arrive) * Math.min(1, dt * 1.2); U.uArrive.value = arrive;
    U.uVan.value.set(pos.x, 0, pos.z); U.uVanDir.value.set(Math.sin(heading), Math.cos(heading));
    mxs += (mx - mxs) * Math.min(1, dt * 2); mys += (my - mys) * Math.min(1, dt * 2);
    const [az, el, dist] = camAt(pSm), breathe = RM ? 0 : 1, a = heading + az + mxs * 0.14 + Math.sin(t * 0.21) * 0.035 * breathe, dd = dist * (MOB ? 1.7 : 1) * (1 + Math.sin(t * 0.17) * 0.012 * breathe);
    look.set(pos.x, 0.9 + clamp(1 - Math.abs(sNow - S_CLINIC) / 8) * 1.6 + clamp(1 - Math.abs(sNow - S_HOSP) / 10) * 3.6 + clamp(1 - Math.abs(sNow - S_HOME) / 8) * 1.0, pos.z);
    const e2 = el + Math.sin(t * 0.27) * 0.012 * breathe - mys * 0.05;
    camP.set(pos.x + Math.sin(a) * Math.cos(e2) * dd, Math.sin(e2) * dd + 0.6, pos.z + Math.cos(a) * Math.cos(e2) * dd);
    if (first) { camera.position.copy(camP); lookS.copy(look); first = false; } else { camera.position.lerp(camP, Math.min(1, dt * 3.2)); lookS.lerp(look, Math.min(1, dt * 5)); }
    camera.lookAt(lookS);
    if (DBG && window.__absCam) { camera.position.set(...window.__absCam.p); camera.lookAt(...window.__absCam.l); }
    U.uCenter.value.set(lookS.x, 0, lookS.z);
    U.uTime.value = t; U.uSize.value = (MOB ? 0.06 : 0.055) * (DPR > 1.5 ? 1 : 1.15);
    U.uMaxPx.value = (MOB ? 6 : 7.5) * DPR; U.uFogN.value = dd * 1.25; U.uFogF.value = dd * 3.8 + 20;
    renderer.render(scene, camera);
  };
  requestAnimationFrame(loop);
  new IntersectionObserver((es) => es.forEach((e) => { vis = e.isIntersecting; }), { threshold: 0 }).observe(sec);
  new GLTFLoader().load('/home/assets/3d/ambulance/ambulance.glb', async (gltf) => {
    await buildVan(gltf);
    if (g) g.to(U.uFade, { value: 1, duration: 1.8, ease: 'power2.out' }); else U.uFade.value = 1;
    sec.classList.add('is-ready');
  }, undefined, () => { U.uFade.value = 1; });
  if (DBG) window.__abs = { camera, van, U, at, side, S_CLINIC, S_HOME, S_HOSP };
})();
