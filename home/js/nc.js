/* AROGYATI — new concept: "From pain to motion".
   A 3D particle human. The body is an athletic rigged base character (CC0, "Superhero Male" from Quaternius'
   Universal Base Characters, quaternius.com) sampled on smooth curved patches into points, a wire network and glowing
   nodes, all skinned on the GPU to its real skeleton — so every
   movement is a true joint rotation with smooth skin, never cut-out parts. Inside it, a particle spine and nerve
   paths. It rises from a heap of particles, four pains (neck, shoulder, lower back, knee) are located, treated and
   healed, the body turns and moves freely, then its particles reform into the Arogyati logo figure. */
import * as THREE from '/home/vendor/three/three.module.min.js';
import { GLTFLoader } from '/home/vendor/three/GLTFLoader.js';

(() => {
  const d = document, $ = (s, r = d) => r.querySelector(s), $$ = (s, r = d) => [...r.querySelectorAll(s)];
  const g = window.gsap, ST = window.ScrollTrigger;
  const sec = $('.ncx'); if (!sec || !g || !ST) return;
  const cv = $('.ncx__cv', sec), ctx = cv.getContext('2d');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches, FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), mix = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), seg = (p, a, b) => ease(clamp((p - a) / (b - a)));
  const bell = (p, a, b) => Math.sin(Math.PI * clamp((p - a) / (b - a)));
  const MOB = innerWidth < 900, NS = MOB ? 18000 : 34000, NI = MOB ? 2400 : 4200, NR = MOB ? 1700 : 3400, NN = MOB ? 1100 : 2400, ND = MOB ? 0.024 : 0.0165;
  const MODEL = '/home/assets/3d/body.glb', DEG = Math.PI / 180, TAU = Math.PI * 2;

  /* ---------- poses: rotations about world axes, applied relative to each bone's rest frame ---------- */
  const X = new THREE.Vector3(1, 0, 0), Y = new THREE.Vector3(0, 1, 0), Z = new THREE.Vector3(0, 0, 1);
  const q = (...rs) => rs.reduce((acc, [ax, deg]) => acc.premultiply(new THREE.Quaternion().setFromAxisAngle(ax, deg * DEG)), new THREE.Quaternion());
  // arm poses are written as abduction angles (0 = hanging, 90 = horizontal) and converted from the model's rest angle
  let POSE = null;
  const makePoses = (rest) => {
    const arms = (l, r, o = {}) => ({ LeftArm: q([Z, l - rest]), RightArm: q([Z, rest - r]), ...o });
    const RELAX = { ...arms(9, 9), LeftForeArm: q([Z, 4]), RightForeArm: q([Z, -4]) };
    const P = (o) => ({ ...RELAX, ...o });
    POSE = {
      UP: P({}),
      NECK: P({ Neck: q([Z, 10], [X, 8]), Head: q([Z, 6]), LeftShoulder: q([Z, 5]) }),           // guarded, tilted neck
      SH: P({ LeftArm: q([Z, 88 - rest], [Y, -14]), LeftForeArm: q([Z, 8]) }),                    // shoulder lifts freely
      SLUMP: P({ Spine: q([X, 10], [Z, -4]), Spine1: q([X, 7]), Neck: q([X, -6]) }),              // bent lower back
      KNEE: P({ RightUpLeg: q([X, -18]), RightLeg: q([X, 34]), RightFoot: q([X, -12]), Hips: q([Z, 2]) }),
      TP: P({ ...arms(78, 78), LeftForeArm: q(), RightForeArm: q() }),
      VP: P({ ...arms(140, 140), LeftForeArm: q([Z, 6]), RightForeArm: q([Z, -6]), Spine1: q([X, -4]), Head: q([X, -8]) }),
    };
  };
  const KEYS = [[0, 'UP'], [0.105, 'UP'], [0.13, 'NECK'], [0.19, 'NECK'], [0.225, 'UP'], [0.34, 'UP'], [0.36, 'SH'], [0.38, 'SH'], [0.395, 'UP'],
    [0.44, 'SLUMP'], [0.5, 'SLUMP'], [0.545, 'UP'], [0.655, 'UP'], [0.675, 'KNEE'], [0.69, 'KNEE'], [0.705, 'UP'], [0.82, 'UP'], [0.852, 'VP'], [1, 'VP']];
  // walking: full in the hero and between chapters, stops while a pain is treated, resumes once it heals
  const walkW = (p) => {
    let w = 1;
    for (let a = 1; a <= 4; a++) { const [s0, e0] = R[a]; if (p >= s0 && p < e0) { const c = (p - s0) / (e0 - s0); w = 1 - seg(c, 0, 0.1) + seg(c, 0.8, 0.95); } }
    return clamp(w * (1 - seg(p, 0.82, 0.85)));
  };
  const walk = (n, ph, w) => {
    const s1 = Math.sin(ph), c1 = Math.cos(ph), sw = (v) => v * w;
    switch (n) {
      case 'Hips': return q([Y, sw(6 * s1)], [Z, sw(2.5 * c1)]);
      case 'Spine1': return q([Y, sw(-7 * s1)], [X, sw(3)]);
      case 'Neck': return q([Y, sw(3 * s1)]);
      case 'LeftUpLeg': return q([X, sw(-24 * s1 - 4)]);
      case 'RightUpLeg': return q([X, sw(24 * s1 - 4)]);
      case 'LeftLeg': return q([X, sw(6 + 46 * Math.pow(Math.max(0, c1), 1.6))]);
      case 'RightLeg': return q([X, sw(6 + 46 * Math.pow(Math.max(0, -c1), 1.6))]);
      case 'LeftFoot': return q([X, sw(-14 * Math.max(0, c1) + 8 * Math.max(0, -s1))]);
      case 'RightFoot': return q([X, sw(-14 * Math.max(0, -c1) + 8 * Math.max(0, s1))]);
      case 'LeftArm': return q([X, sw(20 * s1)]);
      case 'RightArm': return q([X, sw(-20 * s1)]);
      case 'LeftForeArm': return q([X, sw(-12 - 8 * Math.max(0, -s1))]);
      case 'RightForeArm': return q([X, sw(-12 - 8 * Math.max(0, s1))]);
      default: return null;
    }
  };
  const YAW = [[0, -0.62], [0.1, -0.62], [0.14, -0.12], [0.26, -0.12], [0.3, -0.55], [0.42, -0.55], [0.47, Math.PI], [0.56, Math.PI], [0.61, TAU + 0.38], [0.72, TAU + 0.38], [0.75, TAU - 0.5], [0.82, TAU * 1.6], [0.86, 2 * TAU], [1, 2 * TAU]];
  const keyAt = (K, p) => { let k = 0; while (k < K.length - 2 && p > K[k + 1][0]) k++; const [t0, a] = K[k], [t1, b] = K[k + 1]; return [a, b, ease(clamp((p - t0) / Math.max(1e-4, t1 - t0)))]; };
  const RIGMAP = { pelvis: 'Hips', spine01: 'Spine', spine02: 'Spine1', spine03: 'Spine2', neck01: 'Neck', Head: 'Head', claviclel: 'LeftShoulder', upperarml: 'LeftArm', lowerarml: 'LeftForeArm', handl: 'LeftHand', clavicler: 'RightShoulder', upperarmr: 'RightArm', lowerarmr: 'RightForeArm', handr: 'RightHand', thighl: 'LeftUpLeg', calfl: 'LeftLeg', footl: 'LeftFoot', balll: 'LeftToe', thighr: 'RightUpLeg', calfr: 'RightLeg', footr: 'RightFoot', ballr: 'RightToe', spine: 'Hips', spine001: 'Spine', spine002: 'Spine1', spine003: 'Spine2', spine004: 'Neck', spine005: 'Head', shoulderL: 'LeftShoulder', upperarmL: 'LeftArm', forearmL: 'LeftForeArm', handL: 'LeftHand', shoulderR: 'RightShoulder', upperarmR: 'RightArm', forearmR: 'RightForeArm', handR: 'RightHand', thighL: 'LeftUpLeg', shinL: 'LeftLeg', footL: 'LeftFoot', toeL: 'LeftToe', thighR: 'RightUpLeg', shinR: 'RightLeg', footR: 'RightFoot', toeR: 'RightToe' };
  const BONE_NAMES = ['Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head', 'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand', 'RightShoulder', 'RightArm', 'RightForeArm', 'RightHand', 'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'RightUpLeg', 'RightLeg', 'RightFoot'];

  /* ---------- pains & chapters ---------- */
  const AREAS = [ // [bone, toward bone, t, radius]
    ['Neck', 'Head', 0.25, 0.05], ['LeftArm', 'LeftForeArm', 0.08, 0.05], ['Spine', 'Hips', 0.2, 0.065], ['RightLeg', 'RightUpLeg', 0.04, 0.045],
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
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(26, 1, 0.05, 50), FOVT = Math.tan((26 * DEG) / 2);
  const rig = new THREE.Group(); scene.add(rig);
  const U = {
    uRes: { value: new THREE.Vector2(1, 1) }, uIntro: { value: RM ? 1 : 0 }, uLogo: { value: 0 }, uTime: { value: 0 }, uSize: { value: 2 },
    uMouse: { value: new THREE.Vector3(-9999, -9999, 90) }, uArea: { value: Array.from({ length: 4 }, () => new THREE.Vector4()) },
    uPain: { value: Array.from({ length: 4 }, () => new THREE.Vector2()) }, uSpine: { value: 0 }, uScan: { value: -2 }, uCz: { value: 0 },
  };
  const VERT = /* glsl */`
    #include <common>
    #include <skinning_pars_vertex>
    attribute vec3 aHeap; attribute vec3 aLogo; attribute float aRnd; attribute float aDelay; attribute float aKind;
    uniform vec2 uRes; uniform float uIntro, uLogo, uTime, uSize, uSpine, uScan, uCz; uniform vec3 uMouse; uniform vec4 uArea[4]; uniform vec2 uPain[4];
    varying vec3 vCol; varying float vA; varying float vGlow;
    float e3(float t){ return t < 0.5 ? 4.0*t*t*t : 1.0 - pow(-2.0*t + 2.0, 3.0) / 2.0; }
    void main(){
      vec3 objectNormal = normal;
      #include <skinbase_vertex>
      #include <skinnormal_vertex>
      vec3 transformed = position;
      #include <skinning_vertex>
      vec4 wp = modelMatrix * vec4(transformed, 1.0);
      vec3 body = wp.xyz;
      if (aKind < 3.5 || aKind > 4.5) wp.xyz += 0.0012 * vec3(sin(uTime*0.9 + aRnd*40.0), cos(uTime*0.8 + aRnd*31.0), sin(uTime*0.7 + aRnd*17.0));
      vec3 nW = normalize(mat3(modelMatrix) * objectNormal), nV = normalize(mat3(viewMatrix) * nW);
      vec4 mv0 = viewMatrix * vec4(body, 1.0);
      float fr = 1.0 - abs(dot(nV, normalize(-mv0.xyz)));
      // skin: soft studio light (key from upper left, fill, brand-blue rim); inside: spine (kind 1), nerves (kind 2)
      float key = max(dot(nV, normalize(vec3(-0.45, 0.65, 0.6))), 0.0), fill = max(dot(nV, normalize(vec3(0.7, -0.1, 0.5))), 0.0);
      float lit = clamp(key * 0.8 + fill * 0.25, 0.0, 1.0);
      vec3 col = mix(vec3(0.09, 0.18, 0.42), vec3(0.50, 0.66, 0.94), lit);
      col = mix(col, vec3(0.20, 0.42, 0.92), pow(fr, 2.5) * 0.8);
      float a = 0.1 + 0.16 * (1.0 - lit) + 0.4 * pow(fr, 2.2);
      float glow = 0.0;
      if (aKind > 4.5) { col = vec3(0.97, 0.6, 0.28); a = 0.5; glow = 0.4; } // ribs
      else if (aKind > 3.5) { // network nodes
        bool warm = fract(aRnd * 7.0) < 0.16;
        col = warm ? vec3(0.98, 0.56, 0.20) : mix(vec3(0.16, 0.40, 0.92), vec3(0.36, 0.60, 1.0), fr);
        a = (0.75 + 0.25 * fr) * (0.7 + 0.3 * sin(uTime * 1.7 + aRnd * 40.0)); glow = 1.0;
      }
      else if (aKind > 2.5) {
        float life = fract(uTime * 0.07 + aRnd * 9.0);
        wp.xyz += nW * life * 0.03 + vec3(0.0, life * 0.05, 0.0);
        col = mix(vec3(0.30, 0.50, 0.82), vec3(0.42, 0.62, 0.30), fract(aRnd * 13.0)); a = sin(3.14159 * life) * 0.75;
      }
      else if (aKind > 1.5) { col = vec3(0.97, 0.55, 0.22); a = 0.42 + 0.25 * sin(uTime * 2.3 + aRnd * 50.0); glow = 0.6; }
      else if (aKind > 0.5) { col = mix(vec3(0.97, 0.58, 0.20), vec3(1.0, 0.72, 0.30), uSpine); a = (0.55 + 0.3 * uSpine) * (0.75 + 0.25 * sin(uTime * 3.0 + aRnd * 60.0)); glow = 1.0; }
      float hot = 0.0, calm = 0.0;
      for (int k = 0; k < 4; k++) { vec3 dd = body - uArea[k].xyz; float h = exp(-dot(dd,dd) / (uArea[k].w*uArea[k].w)); hot = max(hot, h * uPain[k].x); calm = max(calm, h * uPain[k].y); }
      col = mix(col, vec3(0.93, 0.36, 0.27), clamp(hot * 1.2, 0.0, 1.0)); a = mix(a, 1.0, clamp(hot, 0.0, 1.0));
      col = mix(col, vec3(0.36, 0.66, 0.27), clamp(calm, 0.0, 1.0)); a = mix(a, 1.0, clamp(calm, 0.0, 1.0));
      float sb = uScan > -1.5 ? exp(-pow((body.y - uScan) / 0.009, 2.0)) : 0.0; col = mix(col, vec3(0.25, 0.42, 0.71), sb * 0.6); a = mix(a, 0.8, sb * 0.7);
      if (uLogo > 0.0) { float k = e3(clamp(uLogo * 1.15 - aRnd * 0.15, 0.0, 1.0)); wp.xyz = mix(wp.xyz, aLogo, k) + vec3(sin(k*3.14159) * (aRnd - 0.5) * 0.1, 0.0, sin(k*3.14159) * (aRnd - 0.5) * 0.2); col = mix(col, vec3(0.25, 0.42, 0.71), clamp(uLogo*1.6 - 0.3, 0.0, 1.0)); a = mix(a, 0.95, clamp(uLogo*1.6 - 0.3, 0.0, 1.0)); }
      if (uIntro < 1.0) { float k = e3(clamp((uIntro - aDelay) / 0.42, 0.0, 1.0)); wp.xyz = mix(aHeap, wp.xyz, k) + vec3((aRnd - 0.5) * 0.08, 0.0, (fract(aRnd*7.3) - 0.5) * 0.08) * sin(k*3.14159); a = mix(0.8, a, k); col = mix(mix(vec3(0.37, 0.42, 0.24), vec3(0.16, 0.22, 0.17), aRnd), col, k); }
      vec4 mv = viewMatrix * wp;
      vec4 cp = projectionMatrix * mv;
      // cursor parts the particles
      vec2 s = (cp.xy / cp.w * 0.5 + 0.5) * uRes; vec2 md = s - vec2(uMouse.x, uRes.y - uMouse.y); float ml = length(md);
      if (ml < uMouse.z && (aKind < 3.5 || aKind > 4.5)) { s += md / max(ml, 0.001) * (1.0 - ml / uMouse.z) * 16.0; cp.xy = ((s / uRes) * 2.0 - 1.0) * cp.w; }
      gl_Position = cp;
      float back = clamp((uCz - mv.z) / 0.22, 0.0, 1.0);
      gl_PointSize = uSize * (0.85 + aRnd * 0.3) * (aKind > 2.5 && aKind < 3.5 ? 1.5 : 1.0) * (1.0 + hot * 0.5 + calm * 0.3) * (1.0 - back * 0.3) * (1.0 + glow * (aKind > 3.5 && aKind < 4.5 ? 3.4 : 1.3));
      vCol = col; vA = a * (1.0 - back * 0.55); vGlow = glow;
    }`;
  const FRAG = /* glsl */`
    varying vec3 vCol; varying float vA; varying float vGlow;
    void main(){
      vec2 c = gl_PointCoord - 0.5; float r = length(c), a; vec3 col = vCol;
      if (vGlow > 0.01) { float core = smoothstep(0.22, 0.08, r), halo = exp(-r * r * 14.0) * 0.5 * smoothstep(0.5, 0.3, r); a = (core + halo * vGlow) * vA; col = mix(vCol, min(vCol * 1.2 + 0.12, vec3(1.0)), core); }
      else a = smoothstep(0.5, 0.05, r) * vA;
      if (a < 0.01) discard; gl_FragColor = vec4(col * a, a); }`;
  // the wire network that connects the nodes over the skin
  const LVERT = /* glsl */`
    #include <common>
    #include <skinning_pars_vertex>
    uniform float uIntro, uLogo, uCz; uniform vec4 uArea[4]; uniform vec2 uPain[4];
    varying vec3 vCol; varying float vA;
    void main(){
      vec3 objectNormal = normal;
      #include <skinbase_vertex>
      #include <skinnormal_vertex>
      vec3 transformed = position;
      #include <skinning_vertex>
      vec4 wp = modelMatrix * vec4(transformed, 1.0);
      vec3 nV = normalize(mat3(viewMatrix) * normalize(mat3(modelMatrix) * objectNormal));
      vec4 mv = viewMatrix * wp;
      float fr = 1.0 - abs(dot(nV, normalize(-mv.xyz)));
      vec3 col = mix(vec3(0.10, 0.27, 0.74), vec3(0.22, 0.48, 0.98), fr);
      float a = 0.3 + 0.45 * pow(fr, 1.4);
      float hot = 0.0, calm = 0.0;
      for (int k = 0; k < 4; k++) { vec3 dd = wp.xyz - uArea[k].xyz; float h = exp(-dot(dd,dd) / (uArea[k].w*uArea[k].w)); hot = max(hot, h * uPain[k].x); calm = max(calm, h * uPain[k].y); }
      col = mix(col, vec3(0.93, 0.36, 0.27), clamp(hot * 1.2, 0.0, 1.0)); col = mix(col, vec3(0.36, 0.66, 0.27), clamp(calm, 0.0, 1.0)); a = mix(a, 0.75, max(hot, calm));
      float back = clamp((uCz - mv.z) / 0.22, 0.0, 1.0);
      vCol = col; vA = a * (1.0 - back * 0.6) * smoothstep(0.72, 1.0, uIntro) * (1.0 - clamp(uLogo * 2.5, 0.0, 1.0));
      gl_Position = projectionMatrix * mv;
    }`;
  const LFRAG = /* glsl */`varying vec3 vCol; varying float vA; void main(){ if (vA < 0.01) discard; gl_FragColor = vec4(vCol * vA, vA); }`;
  const lmat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: LVERT, fragmentShader: LFRAG, transparent: true, depthTest: false, depthWrite: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor });
  const mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthTest: false, depthWrite: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor });

  /* ---------- the body ---------- */
  const B = {}, REST = {}; let pts = null, bodyH = 1;
  const wpos = (n, v = new THREE.Vector3()) => B[n].getWorldPosition(v);
  const build = (gltf) => {
    const root = gltf.scene; rig.add(root);
    root.traverse((o) => { const k = RIGMAP[o.name.replace(/[^A-Za-z0-9]/g, '')]; if (k) B[k] = o; });
    const skinned = []; root.traverse((o) => { if (o.isSkinnedMesh) { skinned.push(o); o.visible = false; } });
    // fit: feet on the floor, height 1, centred
    rig.updateMatrixWorld(true);
    { const fw = wpos('LeftToe').sub(wpos('LeftFoot')).add(wpos('RightToe').sub(wpos('RightFoot'))); root.rotation.y -= Math.atan2(fw.x, fw.z); rig.updateMatrixWorld(true); } // toes point at the camera
    const bb = new THREE.Box3().setFromObject(root, true), sc = 1 / (bb.max.y - bb.min.y);
    const o0 = root.position.clone(), cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2;
    root.scale.multiplyScalar(sc); root.position.set((o0.x - cx) * sc, (o0.y - bb.min.y) * sc, (o0.z - cz) * sc); rig.updateMatrixWorld(true);
    { const s2 = wpos('LeftArm'), e2 = wpos('LeftForeArm'); makePoses(Math.atan2(Math.abs(e2.x - s2.x), s2.y - e2.y) / DEG); }
    BONE_NAMES.forEach((n) => { const b = B[n]; REST[n] = { L: b.quaternion.clone(), P: b.parent.getWorldQuaternion(new THREE.Quaternion()), Pi: null }; REST[n].Pi = REST[n].P.clone().invert(); });
    const host = skinned.find((m) => /surface/i.test(m.name)) || skinned[0], sk = host.skeleton, bi = (n) => sk.bones.indexOf(B[n]);
    // --- surface samples (area weighted), skin weights blended from the triangle's corners
    const tris = []; let tot = 0;
    const va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3();
    skinned.forEach((m) => { const ps = m.geometry.attributes.position, ix = m.geometry.index.array; for (let i = 0; i < ix.length; i += 3) { va.fromBufferAttribute(ps, ix[i]); vb.fromBufferAttribute(ps, ix[i + 1]); vc.fromBufferAttribute(ps, ix[i + 2]); const ar = e1.subVectors(vb, va).cross(e2.subVectors(vc, va)).length() * 0.5; if (ar <= 0) continue; tot += ar; tris.push([m, ix[i], ix[i + 1], ix[i + 2], tot]); } });
    // smooth (welded) vertex normals, then sample curved PN-triangle patches so the low-poly mesh reads as a smooth body
    const SN = new Map();
    skinned.forEach((m) => {
      if (!m.geometry.attributes.normal) m.geometry.computeVertexNormals();
      const ps = m.geometry.attributes.position, nr = m.geometry.attributes.normal, key = (i) => `${Math.round(ps.getX(i) * 1e4)},${Math.round(ps.getY(i) * 1e4)},${Math.round(ps.getZ(i) * 1e4)}`, sum = new Map(), out = new Float32Array(ps.count * 3);
      for (let i = 0; i < ps.count; i++) { const k = key(i), a = sum.get(k) || [0, 0, 0]; a[0] += nr.getX(i); a[1] += nr.getY(i); a[2] += nr.getZ(i); sum.set(k, a); }
      for (let i = 0; i < ps.count; i++) { const a = sum.get(key(i)), l = Math.hypot(a[0], a[1], a[2]) || 1; out[i * 3] = a[0] / l; out[i * 3 + 1] = a[1] / l; out[i * 3 + 2] = a[2] / l; }
      SN.set(m, out);
    });
    const n1 = new THREE.Vector3(), n2 = new THREE.Vector3(), n3 = new THREE.Vector3();
    const pn = (nrm, P1, P2, P3, i0, i1, i2, w, u, v) => {
      n1.fromArray(nrm, i0 * 3); n2.fromArray(nrm, i1 * 3); n3.fromArray(nrm, i2 * 3);
      const b = (Pi, Pj, Ni) => Pi.clone().multiplyScalar(2).add(Pj).addScaledVector(Ni, -Pj.clone().sub(Pi).dot(Ni)).multiplyScalar(1 / 3);
      const b210 = b(P1, P2, n1), b120 = b(P2, P1, n2), b021 = b(P2, P3, n2), b012 = b(P3, P2, n3), b102 = b(P3, P1, n3), b201 = b(P1, P3, n1);
      const E = b210.clone().add(b120).add(b021).add(b012).add(b102).add(b201).multiplyScalar(1 / 6), Vc = P1.clone().add(P2).add(P3).multiplyScalar(1 / 3), b111 = E.clone().addScaledVector(E.clone().sub(Vc), 0.5);
      const p = P1.clone().multiplyScalar(w * w * w).addScaledVector(P2, u * u * u).addScaledVector(P3, v * v * v)
        .addScaledVector(b210, 3 * w * w * u).addScaledVector(b120, 3 * w * u * u).addScaledVector(b201, 3 * w * w * v)
        .addScaledVector(b021, 3 * u * u * v).addScaledVector(b102, 3 * w * v * v).addScaledVector(b012, 3 * u * v * v).addScaledVector(b111, 6 * w * u * v);
      const nn = n1.clone().multiplyScalar(w).addScaledVector(n2, u).addScaledVector(n3, v).normalize();
      return { p, nn };
    };
    const N = NS + NI + NR + NN, WS = new Float32Array(NS * 3), pos = new Float32Array(N * 3), nor = new Float32Array(N * 3), sI = new Float32Array(N * 4), sW = new Float32Array(N * 4);
    const heap = new Float32Array(N * 3), logo = new Float32Array(N * 3), rnd = new Float32Array(N), dly = new Float32Array(N), kind = new Float32Array(N), hgt = new Float32Array(N);
    const acc = new Map(), toWorld = new THREE.Matrix4().multiplyMatrices(sk.bones[0].matrixWorld, sk.boneInverses[0]).multiply(host.bindMatrix);
    const wv = new THREE.Vector3();
    for (let n = 0; n < NS; n++) {
      const r = Math.random() * tot; let lo = 0, hi = tris.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (tris[m][4] < r) lo = m + 1; else hi = m; }
      const [m, i0, i1, i2] = tris[lo], ps = m.geometry.attributes.position, si = m.geometry.attributes.skinIndex, sw = m.geometry.attributes.skinWeight;
      let u = Math.random(), v = Math.random(); if (u + v > 1) { u = 1 - u; v = 1 - v; } const w0 = 1 - u - v, bw = [w0, u, v], id = [i0, i1, i2];
      va.fromBufferAttribute(ps, i0); vb.fromBufferAttribute(ps, i1); vc.fromBufferAttribute(ps, i2);
      const { p, nn } = pn(SN.get(m), va, vb, vc, i0, i1, i2, w0, u, v);
      pos.set([p.x, p.y, p.z], n * 3); nor.set([nn.x, nn.y, nn.z], n * 3);
      acc.clear(); for (let c = 0; c < 3; c++) for (let k = 0; k < 4; k++) { const wt = sw.getComponent(id[c], k) * bw[c]; if (wt > 0) { const j = si.getComponent(id[c], k); acc.set(j, (acc.get(j) || 0) + wt); } }
      const best = [...acc].sort((x, y) => y[1] - x[1]).slice(0, 4), sum = best.reduce((s, x) => s + x[1], 0) || 1;
      best.forEach(([j, wt], k) => { sI[n * 4 + k] = j; sW[n * 4 + k] = wt / sum; });
      wv.copy(p).applyMatrix4(toWorld); hgt[n] = wv.y; WS.set([wv.x, wv.y, wv.z], n * 3); if (Math.random() < 0.015) kind[n] = 3;
    }
    // --- inner anatomy: spine (vertebrae) and nerve paths, each point rigid to its bone
    const bindInv = (j) => new THREE.Matrix4().multiplyMatrices(sk.bones[j].matrixWorld, sk.boneInverses[j]).multiply(host.bindMatrix).invert();
    const CH = [[1, ['Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head'], 0.5],
      [2, ['LeftArm', 'LeftForeArm', 'LeftHand'], 0.09], [2, ['RightArm', 'RightForeArm', 'RightHand'], 0.09],
      [2, ['LeftUpLeg', 'LeftLeg', 'LeftFoot'], 0.12], [2, ['RightUpLeg', 'RightLeg', 'RightFoot'], 0.12]];
    const segs = []; let ltot = 0;
    CH.forEach(([kd, ch, share]) => { for (let i = 1; i < ch.length; i++) { const a = wpos(ch[i - 1]), b = wpos(ch[i]), l = a.distanceTo(b); segs.push({ kd, a, b, j: bi(ch[i - 1]), l, share: (share * l) / ch.slice(1).reduce((s, n, k) => s + wpos(ch[k]).distanceTo(wpos(n)), 0) }); } });
    let n = NS; const inv = new Map();
    segs.forEach((sg) => {
      const cnt = Math.round(sg.share * NI); if (!inv.has(sg.j)) inv.set(sg.j, bindInv(sg.j)); const M = inv.get(sg.j);
      for (let c = 0; c < cnt && n < N; c++, n++) {
        let f = Math.random(), rad = sg.kd === 1 ? 0.008 : 0.0035;
        if (sg.kd === 1) { const nv = 22, vi = Math.floor(f * nv); f = (vi + 0.5 + (Math.random() - 0.5) * 0.32) / nv; rad *= 0.55 + 0.45 * Math.random(); }
        const a3 = Math.random() * TAU, rr = rad * Math.sqrt(Math.random());
        const w = sg.a.clone().lerp(sg.b, f).add(new THREE.Vector3(Math.cos(a3) * rr, (Math.random() - 0.5) * rad * 0.4, Math.sin(a3) * rr * (sg.kd === 1 ? 0.6 : 1)));
        if (sg.kd === 1) w.z -= 0.012; // spine sits toward the back
        hgt[n] = w.y; const p = w.clone().applyMatrix4(M); pos.set([p.x, p.y, p.z], n * 3); nor.set([0, 0, 1], n * 3);
        sI[n * 4] = sg.j; sW[n * 4] = 1; kind[n] = sg.kd;
      }
    });
    // ribcage: arcs from the spine round to the sternum, sized from the chest it sits in
    {
      const yTop = wpos('Neck').y - 0.035, nr = 11, perRib = Math.floor(NR / nr), jU = bi('Spine2'), jL = bi('Spine1');
      if (!inv.has(jU)) inv.set(jU, bindInv(jU)); if (!inv.has(jL)) inv.set(jL, bindInv(jL));
      for (let r = 0; r < nr; r++) {
        const yr = yTop - (r / (nr - 1)) * 0.16; let ax = 0, z0 = 9, z1 = -9;
        for (let i = 0; i < NS; i++) { const y = WS[i * 3 + 1], x = WS[i * 3], z = WS[i * 3 + 2]; if (Math.abs(y - yr) < 0.008 && Math.abs(x) < 0.105) { ax = Math.max(ax, Math.abs(x)); z0 = Math.min(z0, z); z1 = Math.max(z1, z); } }
        if (ax === 0) continue;
        const A = ax * 0.8 * (r === 0 ? 0.75 : 1), Bz = (z1 - z0) * 0.4, zc = (z0 + z1) / 2, sx = wpos('Spine2').x, M = inv.get(r < 6 ? jU : jL);
        for (let c = 0; c < perRib && n < N; c++, n++) {
          const side = c % 2 ? 1 : -1, f = Math.random(), ph = -Math.PI / 2 + f * (Math.PI - 0.5);
          const w = new THREE.Vector3(sx + side * A * Math.cos(ph), yr - 0.03 * f + (Math.random() - 0.5) * 0.003, zc + Bz * Math.sin(ph) + (Math.random() - 0.5) * 0.003);
          hgt[n] = w.y; const p = w.applyMatrix4(M); pos.set([p.x, p.y, p.z], n * 3); nor.set([0, 0, 1], n * 3); sI[n * 4] = r < 6 ? jU : jL; sW[n * 4] = 1; kind[n] = 5;
        }
      }
    }
    // network nodes: evenly spaced surface samples, wired to their nearest neighbours
    const cell = ND, grid = new Map(), gk = (x, y, z) => `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`, nodes = [];
    for (let i = 0; i < NS && nodes.length < NN; i++) {
      if (kind[i]) continue; const x = WS[i * 3], y = WS[i * 3 + 1], z = WS[i * 3 + 2]; let ok = true;
      const cx0 = Math.floor(x / cell), cy0 = Math.floor(y / cell), cz0 = Math.floor(z / cell);
      for (let a = -1; a <= 1 && ok; a++) for (let b = -1; b <= 1 && ok; b++) for (let c = -1; c <= 1 && ok; c++) { const L = grid.get(`${cx0 + a},${cy0 + b},${cz0 + c}`); if (L) for (const j of L) { const dx = WS[j * 3] - x, dy = WS[j * 3 + 1] - y, dz = WS[j * 3 + 2] - z; if (dx * dx + dy * dy + dz * dz < cell * cell) { ok = false; break; } } }
      if (!ok) continue; const k = gk(x, y, z); (grid.get(k) || grid.set(k, []).get(k)).push(i); nodes.push(i);
    }
    const edges = [], seen = new Set(), R2 = (cell * 2.1) ** 2;
    nodes.forEach((i) => {
      const x = WS[i * 3], y = WS[i * 3 + 1], z = WS[i * 3 + 2], cand = [];
      const cx0 = Math.floor(x / cell), cy0 = Math.floor(y / cell), cz0 = Math.floor(z / cell);
      for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) for (let c = -2; c <= 2; c++) { const L = grid.get(`${cx0 + a},${cy0 + b},${cz0 + c}`); if (L) for (const j of L) { if (j === i) continue; const dx = WS[j * 3] - x, dy = WS[j * 3 + 1] - y, dz = WS[j * 3 + 2] - z, d2 = dx * dx + dy * dy + dz * dz; if (d2 < R2 && nor[i * 3] * nor[j * 3] + nor[i * 3 + 1] * nor[j * 3 + 1] + nor[i * 3 + 2] * nor[j * 3 + 2] > 0.2) cand.push([j, d2]); } }
      cand.sort((p, q) => p[1] - q[1]).slice(0, 4).forEach(([j]) => { const key = i < j ? i * 1e6 + j : j * 1e6 + i; if (!seen.has(key)) { seen.add(key); edges.push(i, j); } });
    });
    nodes.forEach((i) => { if (n >= N) return; pos.set(pos.subarray(i * 3, i * 3 + 3), n * 3); nor.set(nor.subarray(i * 3, i * 3 + 3), n * 3); sI.set(sI.subarray(i * 4, i * 4 + 4), n * 4); sW.set(sW.subarray(i * 4, i * 4 + 4), n * 4); hgt[n] = hgt[i]; kind[n] = 4; n++; });
    {
      const E = edges.length, lp3 = new Float32Array(E * 3), ln3 = new Float32Array(E * 3), li = new Float32Array(E * 4), lw = new Float32Array(E * 4);
      edges.forEach((i, k) => { lp3.set(pos.subarray(i * 3, i * 3 + 3), k * 3); ln3.set(nor.subarray(i * 3, i * 3 + 3), k * 3); li.set(sI.subarray(i * 4, i * 4 + 4), k * 4); lw.set(sW.subarray(i * 4, i * 4 + 4), k * 4); });
      const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(lp3, 3)); lg.setAttribute('normal', new THREE.BufferAttribute(ln3, 3)); lg.setAttribute('skinIndex', new THREE.BufferAttribute(li, 4)); lg.setAttribute('skinWeight', new THREE.BufferAttribute(lw, 4));
      const lines = new THREE.SkinnedMesh(lg, lmat); lines.isMesh = false; lines.isLine = true; lines.isLineSegments = true; lines.frustumCulled = false;
      host.parent.add(lines); lines.position.copy(host.position); lines.quaternion.copy(host.quaternion); lines.scale.copy(host.scale); lines.bind(sk, host.bindMatrix);
    }
    const NT = n;
    for (let i = 0; i < NT; i++) {
      const hx = (Math.random() + Math.random() + Math.random() - 1.5) * 0.24, hz = (Math.random() + Math.random() - 1) * 0.16;
      heap[i * 3] = hx; heap[i * 3 + 1] = 0.09 * Math.exp(-((hx / 0.13) ** 2) - ((hz / 0.1) ** 2)) * Math.sqrt(Math.random()) + 0.002; heap[i * 3 + 2] = hz;
      rnd[i] = Math.random(); dly[i] = clamp(hgt[i]) * 0.5 + Math.random() * 0.08;
    }
    // logo targets, paired by height so the body flows into the mark
    const paths = $$('.ncx__logo path').map((q) => new Path2D(q.getAttribute('d'))), oc = d.createElement('canvas').getContext('2d'), lp = []; let gd = 0;
    while (lp.length < NT && gd++ < NT * 40) { const x = mix(129.8, 163.1, Math.random()), y = Math.random() * 41.7; if (paths.some((pp) => oc.isPointInPath(pp, x, y))) lp.push([x, y]); }
    while (lp.length < NT) lp.push(lp[lp.length % Math.max(1, lp.length)] || [146, 20]);
    const S = 1.0 / 41.7; lp.sort((a, b) => b[1] - a[1]);
    const order = Array.from({ length: NT }, (_, i) => i).sort((a, b) => hgt[a] - hgt[b]);
    order.forEach((i, k) => { logo[i * 3] = (lp[k][0] - 146.42) * S; logo[i * 3 + 1] = (41.7 - lp[k][1]) * S + 0.02; logo[i * 3 + 2] = (Math.random() - 0.5) * 0.02; });
    const geo = new THREE.BufferGeometry(), sl = (a, c) => new THREE.BufferAttribute(a.subarray(0, NT * c), c);
    geo.setAttribute('position', sl(pos, 3)); geo.setAttribute('normal', sl(nor, 3)); geo.setAttribute('skinIndex', sl(sI, 4)); geo.setAttribute('skinWeight', sl(sW, 4));
    geo.setAttribute('aHeap', sl(heap, 3)); geo.setAttribute('aLogo', sl(logo, 3)); geo.setAttribute('aRnd', sl(rnd, 1)); geo.setAttribute('aDelay', sl(dly, 1)); geo.setAttribute('aKind', sl(kind, 1));
    // a skinned mesh drawn as points: the GPU skins every particle with the real skeleton
    pts = new THREE.SkinnedMesh(geo, mat); pts.isMesh = false; pts.isPoints = true; pts.frustumCulled = false;
    host.parent.add(pts); pts.position.copy(host.position); pts.quaternion.copy(host.quaternion); pts.scale.copy(host.scale);
    pts.bind(sk, host.bindMatrix);
  };

  /* ---------- posing ---------- */
  const QI = new THREE.Quaternion(), qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), qx = new THREE.Quaternion(), qt = new THREE.Quaternion();
  const idle = (n, t) => {
    switch (n) {
      case 'Spine1': return q([X, 1.1 * Math.sin(t * 1.4)]);
      case 'Neck': return q([Z, 1.6 * Math.sin(t * 0.5)], [Y, smx * 22]);
      case 'Head': return q([X, -smy * 10]);
      case 'LeftArm': return q([Z, 1.4 * Math.sin(t * 0.7)]);
      case 'RightArm': return q([Z, -1.4 * Math.sin(t * 0.7 + 0.6)]);
      case 'Hips': return q([Z, 0.6 * Math.sin(t * 0.35)]);
      default: return null;
    }
  };
  let WK = 0, PH = 0, lastT = 0;
  const pose = (p, t) => {
    const [a, b, k] = keyAt(KEYS, p), A = POSE[a], Bp = POSE[b];
    BONE_NAMES.forEach((n) => {
      const r = REST[n]; if (!r) return;
      qx.slerpQuaternions(A[n] || QI, Bp[n] || QI, k);
      const id = idle(n, t); if (id) qx.premultiply(id);
      if (WK > 0.01) { const wq = walk(n, PH, WK); if (wq) qx.premultiply(wq); }
      qt.copy(r.Pi).multiply(qx).multiply(r.P).multiply(r.L); B[n].quaternion.copy(qt);
    });
  };

  /* ---------- canvas sizing & input ---------- */
  let W = 0, H = 0, DPR = 1, prog = 0, mx = -9999, my = -9999, smx = 0, smy = 0, inView = true, ready = false;
  const resize = () => {
    DPR = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight;
    [cv, fxc].forEach((c) => { c.width = Math.round(W * DPR); c.height = Math.round(H * DPR); });
    if (renderer) { renderer.setPixelRatio(DPR); renderer.setSize(W, H, false); }
    camera.aspect = W / Math.max(1, H); U.uRes.value.set(W, H);
  };
  resize(); addEventListener('resize', resize);
  if (FINE) { sec.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; }, { passive: true }); sec.addEventListener('pointerleave', () => { mx = my = -9999; }); }
  const DUST = Array.from({ length: MOB ? 26 : 48 }, () => ({ x: Math.random(), y: Math.random(), z: 0.3 + Math.random() * 0.7, r: 0.6 + Math.random() * 1.8, ph: Math.random() * 6.28 }));
  const CHAINS = [['Head', 'Neck', 'Spine2', 'Spine', 'Hips', 'RightUpLeg', 'RightLeg', 'RightFoot'], ['Spine2', 'Hips', 'LeftUpLeg', 'LeftLeg', 'LeftFoot'], ['Spine2', 'RightShoulder', 'RightArm', 'RightForeArm', 'RightHand'], ['Spine2', 'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand'], ['Neck', 'Spine2', 'LeftShoulder', 'LeftArm', 'LeftForeArm']];
  const V = new THREE.Vector3(), V2 = new THREE.Vector3();
  const proj = (w) => { V.copy(w).project(camera); return [(V.x * 0.5 + 0.5) * W, (-V.y * 0.5 + 0.5) * H]; };
  const along = (ch, u) => { const ps = ch.map((n) => wpos(n, new THREE.Vector3())); let tot = 0; const L = []; for (let i = 1; i < ps.length; i++) { L.push(ps[i].distanceTo(ps[i - 1])); tot += L[i - 1]; } let r = u * tot; for (let i = 0; i < L.length; i++) { if (r <= L[i]) return ps[i].lerp(ps[i + 1], r / L[i]); r -= L[i]; } return ps[ps.length - 1]; };
  const areaPos = (a, v = new THREE.Vector3()) => { const [b0, b1, f] = AREAS[a]; wpos(b0, v); return v.lerp(wpos(b1, V2), f); };

  const render = (time) => {
    if (!ready) return;
    const p = prog, t = time, intro = U.uIntro.value, lg = seg(p, 0.86, 0.95), formed = clamp((intro - 0.7) / 0.3);
    if (mx > -9000) { smx += ((mx - W / 2) / W - smx) * 0.06; smy += ((my - H / 2) / H - smy) * 0.06; } else { smx *= 0.95; smy *= 0.95; }
    // body: yaw by scroll (turns to show the back, spins when it moves freely), pose by scroll
    const [y0, y1, yk] = keyAt(YAW, p);
    rig.rotation.y = mix(y0, y1, yk) + (1 - lg) * (0.06 * Math.sin(t * 0.3) + smx * 0.5);
    WK = RM ? 0 : walkW(p) * formed; PH += Math.min(0.05, Math.max(0, t - lastT)) * 5.4; lastT = t;
    rig.position.y = WK * 0.006 * (Math.cos(2 * PH) - 1);
    pose(p, t); rig.updateMatrixWorld(true);
    const states = AREAS.map((_, a) => areaState(a, p)); let act = -1, zf = 0; const foc = new THREE.Vector3(0, 0.5, 0);
    states.forEach((st, a) => { if (st.c >= 0 && st.c <= 1) { act = a; zf = seg(st.c, 0, 0.25) * (1 - seg(st.c, 0.82, 1)); const at = areaPos(a), wf = a === 3 ? (MOB ? 0.15 : 0.08) : a === 2 ? (MOB ? 0.3 : 0.4) : 1; foc.set(mix(0, at.x, zf), mix(0.5, at.y, zf * wf), 0); } });
    const Zm = MOB ? 1.2 : 1.12, zoom = (1 + (Zm - 1) * zf) * mix(1, MOB ? 0.78 : 0.95, lg);
    foc.y += mix(0, 0.06, lg);
    const S = (MOB ? Math.min(H * 0.5, W * 1.25) : Math.min(H * 0.8, W * 0.6)) * zoom, CX = (MOB ? W * 0.5 : W * 0.66) + smx * 14, CY = (MOB ? H * 0.35 : H * 0.5) + smy * 8;
    const D = H / (2 * S * FOVT);
    camera.position.set(foc.x, foc.y + D * 0.05, D); camera.lookAt(foc.x, foc.y, 0);
    camera.setViewOffset(W, H, W / 2 - CX, H / 2 - CY, W, H); camera.updateMatrixWorld();
    const align = seg(p, 0.5, 0.57), spineGlow = bell(p, 0.44, 0.58), lift = bell(p, 0.74, 0.88);

    // ---- back layer: dust + floor platform ----
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
    for (const o of DUST) { const yy = ((o.y - t * 0.012 * o.z) % 1 + 1) % 1, xx = o.x + Math.sin(t * 0.3 + o.ph) * 0.01; ctx.fillStyle = `rgba(255,255,255,${(0.55 * o.z).toFixed(3)})`; ctx.beginPath(); ctx.arc(xx * W - smx * 30 * o.z, yy * H - smy * 20 * o.z, o.r * o.z * 1.4, 0, 6.283); ctx.fill(); }
    { // soft light behind the body
      const [ax, ay] = proj(V2.set(0, 0.55, 0)), al = clamp(intro * 1.2) * (1 - lg * 0.6), ag = ctx.createRadialGradient(ax, ay, 0, ax, ay, 0.62 * S);
      ag.addColorStop(0, `rgba(255,255,250,${(0.85 * al).toFixed(3)})`); ag.addColorStop(0.55, `rgba(255,255,248,${(0.35 * al).toFixed(3)})`); ag.addColorStop(1, 'rgba(255,255,248,0)');
      ctx.fillStyle = ag; ctx.fillRect(ax - 0.62 * S, ay - 0.62 * S, 1.24 * S, 1.24 * S);
    }
    {
      const [gx, gy] = proj(V2.set(0, 0, 0)), pa = clamp(intro * 1.4) * (1 - lg);
      const sh = ctx.createRadialGradient(gx, gy, 0, gx, gy, 0.26 * S); sh.addColorStop(0, `rgba(20,32,26,${(0.2 * pa).toFixed(3)})`); sh.addColorStop(1, 'rgba(20,32,26,0)');
      ctx.save(); ctx.translate(gx, gy); ctx.scale(1, 0.16); ctx.fillStyle = sh; ctx.fillRect(-0.3 * S, -0.3 * S, 0.6 * S, 0.6 * S); ctx.restore();
      if (pa > 0.01) {
        ctx.save(); ctx.translate(gx, gy); ctx.scale(1, 0.16); ctx.lineWidth = 0.9 / 0.16;
        [[0.3, 0.32, [4, 10], 1], [0.38, 0.22, [1, 7], -1], [0.46, 0.14, [24, 18], 1]].forEach(([r, al, dash, dir]) => { ctx.setLineDash(dash.map((v) => (v / 0.16) * 0.5)); ctx.lineDashOffset = dir * t * 30; ctx.strokeStyle = `rgba(93,106,41,${(al * pa).toFixed(3)})`; ctx.beginPath(); ctx.arc(0, 0, r * S, 0, 6.283); ctx.stroke(); });
        ctx.setLineDash([]);
        if (WK > 0.02) for (let i = 0; i < 7; i++) { const f = (i / 7 + PH * 0.045) % 1, yy = mix(-0.3, 0.3, f) * S, hw = Math.sqrt(Math.max(0, 1 - (yy / (0.31 * S)) ** 2)) * 0.22 * S; ctx.strokeStyle = `rgba(93,106,41,${(0.3 * WK * pa * Math.sin(Math.PI * f)).toFixed(3)})`; ctx.beginPath(); ctx.moveTo(-hw, yy); ctx.lineTo(hw, yy); ctx.stroke(); }
        for (let i = 0; i < 4; i++) { const a = t * 0.4 + (i * Math.PI) / 2; ctx.fillStyle = `rgba(93,106,41,${(0.55 * pa).toFixed(3)})`; ctx.beginPath(); ctx.arc(Math.cos(a) * 0.38 * S, Math.sin(a) * 0.38 * S, 3 / 0.16 * 0.5, 0, 6.283); ctx.fill(); }
        ctx.restore();
      }
    }

    // ---- GPU particles ----
    if (renderer && pts) {
      U.uTime.value = t; U.uLogo.value = lg;
      states.forEach((st, a) => { const at = areaPos(a); U.uArea.value[a].set(at.x, at.y, at.z, AREAS[a][3]); U.uPain.value[a].set(st.pain * formed * (1 - lg), st.calm * (1 - lg)); });
      U.uSpine.value = spineGlow;
      const sc = (t - scanT) / 1.8; U.uScan.value = sc >= 0 && sc <= 1 && formed > 0.9 && lg < 0.05 ? mix(1.03, -0.02, ease(sc)) : -2;
      U.uMouse.value.set(mx, my, 80); U.uCz.value = -D;
      U.uSize.value = (MOB ? 1.9 : 2.0) * Math.sqrt(zoom) * Math.sqrt(S / 700) * DPR + 0.4 * DPR;
      renderer.render(scene, camera);
    }

    // ---- front layer: treatment motion graphics, pulses, spine, arcs ----
    fctx.setTransform(DPR, 0, 0, DPR, 0, 0); fctx.clearRect(0, 0, W, H);
    if (formed > 0.6 && lg < 0.3) {
      CHAINS.forEach((chn, k) => {
        const u = (t * 0.16 + k * 0.37) % 1, [Xp, Yp] = proj(along(chn, u));
        const gr = fctx.createRadialGradient(Xp, Yp, 0, Xp, Yp, 11); gr.addColorStop(0, 'rgba(250,150,60,0.55)'); gr.addColorStop(1, 'rgba(250,150,60,0)');
        fctx.fillStyle = gr; fctx.fillRect(Xp - 11, Yp - 11, 22, 22);
      });
    }
    if (act >= 0 && lg < 0.1 && formed > 0.5) {
      const st = states[act], eff = bell(st.c, 0.22, 0.8), [Xp, Yp] = proj(areaPos(act)), u = S;
      if (st.c < 0.32) for (let r = 0; r < 3; r++) { const fr = (t * 0.45 + r / 3) % 1, al = 0.55 * (1 - fr) * seg(st.c, 0, 0.15) * (1 - seg(st.c, 0.22, 0.32)); fctx.strokeStyle = `rgba(232,112,92,${al.toFixed(3)})`; fctx.lineWidth = 1.2; fctx.beginPath(); fctx.arc(Xp, Yp, (0.03 + fr * 0.11) * u, 0, 6.283); fctx.stroke(); }
      const sw = clamp((st.c - 0.3) / 0.16);
      if (sw > 0 && sw < 1) { fctx.strokeStyle = `rgba(255,255,255,${(0.85 * (1 - sw)).toFixed(3)})`; fctx.lineWidth = 2 * (1 - sw) + 0.5; fctx.beginPath(); fctx.arc(Xp, Yp, (0.02 + sw * 0.32) * u, 0, 6.283); fctx.stroke(); }
      if (eff > 0.01) {
        fctx.lineWidth = 1.4;
        if (act === 0) { for (let k = 0; k < 2; k++) { const a0 = t * 0.9 + k * Math.PI; fctx.strokeStyle = `rgba(255,255,255,${(0.9 * eff).toFixed(3)})`; fctx.beginPath(); fctx.arc(Xp, Yp, 0.065 * u, a0, a0 + 1.6); fctx.stroke(); } }
        else if (act === 1) { for (let r = 0; r < 3; r++) { const fr = (t * 0.6 + r / 3) % 1; fctx.strokeStyle = `rgba(64,108,180,${(0.65 * (1 - fr) * eff).toFixed(3)})`; fctx.beginPath(); fctx.arc(Xp, Yp, (0.035 + fr * 0.15) * u, 0, 6.283); fctx.stroke(); } }
        else if (act === 2) {
          const clean = seg(st.c, 0.3, 0.7), w = 0.2 * u; fctx.strokeStyle = `rgba(255,255,255,${(0.95 * eff).toFixed(3)})`; fctx.beginPath();
          for (let k = 0; k <= 60; k++) { const f = k / 60, xx = Xp - w + f * 2 * w, env = Math.sin(Math.PI * f), nn = 0.6 * Math.sin(f * 58 + t * 9) + 0.4 * Math.sin(f * 97 - t * 13), cl = Math.sin(f * 25 - t * 5), yy = Yp + env * 0.026 * u * mix(nn, cl, clean); k ? fctx.lineTo(xx, yy) : fctx.moveTo(xx, yy); }
          fctx.stroke();
        } else {
          const sx = Xp + 0.32 * u, sy = Yp - 0.4 * u, lb = fctx.createLinearGradient(sx, sy, Xp, Yp); lb.addColorStop(0, 'rgba(232,112,92,0)'); lb.addColorStop(1, `rgba(232,112,92,${(0.9 * eff).toFixed(3)})`);
          fctx.strokeStyle = lb; fctx.beginPath(); fctx.moveTo(sx, sy); fctx.lineTo(Xp, Yp); fctx.stroke();
          for (let k = 0; k < 5; k++) { const fr = (t * 0.7 + k / 5) % 1; fctx.fillStyle = `rgba(232,112,92,${(Math.sin(Math.PI * fr) * eff).toFixed(3)})`; fctx.beginPath(); fctx.arc(mix(sx, Xp, fr), mix(sy, Yp, fr), 2.4, 0, 6.283); fctx.fill(); }
        }
      }
      if (tag) {
        const vis = clamp(seg(st.c, 0.08, 0.2) * (1 - seg(st.c, 0.86, 0.98)));
        const flip = Xp + 280 > W; tag.classList.toggle('is-flip', flip);
        const tx = flip ? Xp - 16 - tag.offsetWidth : Xp + 16;
        tag.style.transform = `translate(${clamp(tx, 8, W - tag.offsetWidth - 8).toFixed(1)}px,${(Yp - tag.offsetHeight / 2).toFixed(1)}px)`; tag.style.opacity = vis.toFixed(3);
        tag.classList.toggle('is-calm', st.c > 0.55);
      }
    } else if (tag) tag.style.opacity = 0;
    if (spineGlow > 0.02 && formed > 0.5) {
      const ch = ['Hips', 'Spine', 'Spine1', 'Spine2', 'Neck'];
      for (let v = 0; v < 12; v++) { const f = v / 11, on = clamp(align * 14 - v * 0.9) * spineGlow; if (on <= 0) continue; const [Xp, Yp] = proj(along(ch, f)); fctx.fillStyle = `rgba(255,255,255,${(0.95 * on).toFixed(3)})`; fctx.beginPath(); fctx.arc(Xp, Yp, 3, 0, 6.283); fctx.fill(); fctx.strokeStyle = `rgba(64,108,180,${on.toFixed(3)})`; fctx.lineWidth = 1.4; fctx.stroke(); }
    }
    if (lift > 0.02 && lg < 0.6) {
      const a = seg(p, 0.745, 0.84);
      [['RightArm', -1], ['LeftArm', 1]].forEach(([bn, sg]) => { const [cx, cy] = proj(wpos(bn, V2)), Rr = 0.36 * S, sd = Math.sign(Math.cos(rig.rotation.y)) * sg, a0 = Math.PI / 2 - sd * 0.55, a1 = a0 - sd * (Math.PI * 0.62) * a; fctx.strokeStyle = `rgba(125,142,57,${(0.5 * lift * (1 - lg)).toFixed(3)})`; fctx.lineWidth = 1.2; fctx.beginPath(); fctx.arc(cx, cy, Rr, Math.min(a0, a1), Math.max(a0, a1)); fctx.stroke(); });
    }
  };

  /* ---------- drive ---------- */
  ST.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: (s) => { prog = s.progress; const k = R.findIndex(([a, b]) => prog >= a && prog < b); setChapter(k < 0 ? R.length - 1 : k); if (bar) bar.style.transform = `scaleY(${prog.toFixed(4)})`; } });
  new IntersectionObserver((es) => es.forEach((e) => (inView = e.isIntersecting))).observe(sec);
  setChapter(0);
  const hd = $('.az-head'); if (hd) hd.classList.add('on-light');
  g.ticker.add((time) => { if (inView) render(time); });
  if (!renderer) return;
  new GLTFLoader().load(MODEL, (gltf) => {
    build(gltf); ready = true; scanT = performance.now() / 1000 + 3.6;
    if (RM) return;
    const go = () => {
      g.to(U.uIntro, { value: 1, duration: 3.4, delay: 0.3, ease: 'power1.inOut' });
      g.fromTo('[data-ncx-in]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, delay: 1, ease: 'expo.out' });
    };
    const t0 = performance.now(), chk = () => (!$('.az-pre') || performance.now() - t0 > 7000 ? go() : setTimeout(chk, 120)); chk();
  }, undefined, (e) => console.error(e));
})();
