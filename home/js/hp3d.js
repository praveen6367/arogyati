/* AROGYATI — "Where does it hurt?": the particle body from the new concept, live in 3D, walking in place.
   The section pins; scrolling steps through nine body areas. For each area the body turns to show it, the area glows
   on the moving body, and the clinic's reel, the area name, the conditions and the reel caption change with it.
   Same model, sampling, skinning and shading as the new concept (CC0 "Superhero Male", Quaternius), with fewer particles. */
import * as THREE from '/home/vendor/three/three.module.min.js';
import { GLTFLoader } from '/home/vendor/three/GLTFLoader.js';

(() => {
  const d = document, $ = (s, r = d) => r.querySelector(s), $$ = (s, r = d) => [...r.querySelectorAll(s)];
  const sec = $('.hp3'); if (!sec) return;
  const cv = $('.hp3__gl', sec), fig = $('.hp3__fig', sec);
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches, FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), mix = (a, b, t) => a + (b - a) * t;
  const MOB = innerWidth < 900, NS = MOB ? 30000 : 62000;
  const MODEL = '/home/assets/3d/body.glb', DEG = Math.PI / 180, TAU = Math.PI * 2;
  const DATA = JSON.parse($('#hp3-data').textContent);

  /* ---------- the nine areas: where they sit on the skeleton, how big the glow is, how the body turns to show them ---------- */
  const AREA = {
    head: ['Neck', 'Head', 1.9, 0.075, -0.12], neck: ['Neck', 'Head', 0.35, 0.05, 0.25], shoulder: ['LeftArm', 'LeftForeArm', 0.06, 0.055, -0.55],
    chest: ['Spine2', 'Neck', 0.25, 0.075, -0.1], back: ['Spine', 'Hips', 0.15, 0.075, Math.PI], elbow: ['LeftForeArm', 'LeftForeArm', 0, 0.045, -0.7],
    wrist: ['LeftHand', 'LeftHand', 0, 0.042, -0.45], knee: ['RightLeg', 'RightUpLeg', 0.04, 0.05, 0.35], heel: ['RightFoot', 'RightFoot', 0, 0.045, Math.PI * 0.82],
  };
  const LIST = DATA.map((x) => AREA[x.a]);

  /* ---------- poses ---------- */
  const X = new THREE.Vector3(1, 0, 0), Y = new THREE.Vector3(0, 1, 0), Z = new THREE.Vector3(0, 0, 1);
  const q = (...rs) => rs.reduce((acc, [ax, deg]) => acc.premultiply(new THREE.Quaternion().setFromAxisAngle(ax, deg * DEG)), new THREE.Quaternion());
  let RELAX = null;
  const makePoses = (rest) => { RELAX = { LeftArm: q([Z, 13 - rest]), RightArm: q([Z, rest - 13]), LeftForeArm: q([Z, 7]), RightForeArm: q([Z, -7]) }; };
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
  const idle = (n, t) => {
    switch (n) {
      case 'Spine1': return q([X, 1.1 * Math.sin(t * 1.4)]);
      case 'Neck': return q([Z, 1.6 * Math.sin(t * 0.5)]);
      case 'LeftArm': return q([Z, 1.4 * Math.sin(t * 0.7)]);
      case 'RightArm': return q([Z, -1.4 * Math.sin(t * 0.7 + 0.6)]);
      case 'Hips': return q([Z, 0.6 * Math.sin(t * 0.35)]);
      default: return null;
    }
  };
  const RIGMAP = { pelvis: 'Hips', spine01: 'Spine', spine02: 'Spine1', spine03: 'Spine2', neck01: 'Neck', Head: 'Head', claviclel: 'LeftShoulder', upperarml: 'LeftArm', lowerarml: 'LeftForeArm', handl: 'LeftHand', clavicler: 'RightShoulder', upperarmr: 'RightArm', lowerarmr: 'RightForeArm', handr: 'RightHand', thighl: 'LeftUpLeg', calfl: 'LeftLeg', footl: 'LeftFoot', balll: 'LeftToe', thighr: 'RightUpLeg', calfr: 'RightLeg', footr: 'RightFoot', ballr: 'RightToe', spine: 'Hips', spine001: 'Spine', spine002: 'Spine1', spine003: 'Spine2', spine004: 'Neck', spine005: 'Head', shoulderL: 'LeftShoulder', upperarmL: 'LeftArm', forearmL: 'LeftForeArm', handL: 'LeftHand', shoulderR: 'RightShoulder', upperarmR: 'RightArm', forearmR: 'RightForeArm', handR: 'RightHand', thighL: 'LeftUpLeg', shinL: 'LeftLeg', footL: 'LeftFoot', toeL: 'LeftToe', thighR: 'RightUpLeg', shinR: 'RightLeg', footR: 'RightFoot', toeR: 'RightToe' };
  const BONE_NAMES = ['Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head', 'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand', 'RightShoulder', 'RightArm', 'RightForeArm', 'RightHand', 'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'RightUpLeg', 'RightLeg', 'RightFoot'];

  /* ---------- renderer and the particle shader (brand blue body, soft studio light, glowing area) ---------- */
  let renderer = null;
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' }); renderer.setClearColor(0x000000, 0); } catch (e) { renderer = null; }
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(26, 1, 0.05, 50), FOVT = Math.tan((26 * DEG) / 2);
  const rig = new THREE.Group(); scene.add(rig);
  const U = { uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uSize: { value: 2 }, uMouse: { value: new THREE.Vector3(-9999, -9999, 70) }, uArea: { value: new THREE.Vector4() }, uHot: { value: 0 }, uFade: { value: 0 } };
  const VERT = /* glsl */`
    #include <common>
    #include <skinning_pars_vertex>
    attribute float aRnd;
    uniform vec2 uRes; uniform float uTime, uSize, uHot, uFade; uniform vec3 uMouse; uniform vec4 uArea;
    varying vec3 vCol; varying float vA; varying float vShine;
    void main(){
      vec3 objectNormal = normal;
      #include <skinbase_vertex>
      #include <skinnormal_vertex>
      vec3 transformed = position;
      #include <skinning_vertex>
      vec4 wp = modelMatrix * vec4(transformed, 1.0);
      vec3 body = wp.xyz;
      wp.xyz += 0.0012 * vec3(sin(uTime*0.9 + aRnd*40.0), cos(uTime*0.8 + aRnd*31.0), sin(uTime*0.7 + aRnd*17.0));
      vec3 nW = normalize(mat3(modelMatrix) * objectNormal), nV = normalize(mat3(viewMatrix) * nW);
      vec4 mv0 = viewMatrix * vec4(body, 1.0);
      float fr = 1.0 - abs(dot(nV, normalize(-mv0.xyz)));
      float key = max(dot(nV, normalize(vec3(-0.45, 0.65, 0.6))), 0.0), fill = max(dot(nV, normalize(vec3(0.7, -0.1, 0.5))), 0.0);
      float lit = clamp(key * 0.95 + fill * 0.22, 0.0, 1.0);
      vec3 BL = vec3(0.25, 0.42, 0.71);
      vec3 base = mix(vec3(0.17, 0.39, 0.55), BL, smoothstep(0.05, 0.6, body.y));
      vec3 shadowC = base * 0.8 + vec3(0.04, 0.06, 0.1), hiC = mix(base, vec3(1.0), mix(0.28, 0.55, smoothstep(0.02, 0.22, body.y)));
      float lt = smoothstep(0.0, 1.0, lit);
      vec3 col = lt < 0.5 ? mix(shadowC, base, lt * 2.0) : mix(base, hiC, lt * 2.0 - 1.0);
      float rim = smoothstep(0.58, 0.97, fr);
      col = mix(col, vec3(0.6, 0.76, 1.0), rim * 0.75);
      float a = max(mix(0.64, 0.96, lt), rim);
      a *= smoothstep(-0.1, 0.04, dot(nV, normalize(-mv0.xyz)));
      float shine = rim * 0.85 + smoothstep(0.82, 1.0, lit) * 0.45;
      // the selected area: a warm glow that breathes on the moving body
      vec3 dd = body - uArea.xyz; float h = exp(-dot(dd, dd) / (uArea.w * uArea.w)) * uHot, pul = 0.78 + 0.22 * sin(uTime * 3.2);
      col = mix(col, mix(vec3(0.91, 0.36, 0.27), vec3(1.0, 0.6, 0.36), 0.4 * pul), clamp(h * 1.3, 0.0, 1.0)); a = mix(a, 1.0, clamp(h, 0.0, 1.0));
      wp.xyz += nW * h * 0.004 * pul;
      vec4 cp = projectionMatrix * viewMatrix * wp;
      vec2 s = (cp.xy / cp.w * 0.5 + 0.5) * uRes; vec2 md = s - vec2(uMouse.x, uRes.y - uMouse.y); float ml = length(md);
      if (ml < uMouse.z) { s += md / max(ml, 0.001) * (1.0 - ml / uMouse.z) * 14.0; cp.xy = ((s / uRes) * 2.0 - 1.0) * cp.w; }
      gl_Position = cp;
      gl_PointSize = uSize * (0.95 + aRnd * 0.1) * (1.0 + 0.28 * lt + 0.28 * rim) * (1.0 + h * 0.55);
      vCol = col; vA = a * uFade; vShine = shine;
    }`;
  const FRAG = /* glsl */`
    varying vec3 vCol; varying float vA; varying float vShine;
    void main(){
      vec2 c = gl_PointCoord - 0.5; float r = length(c);
      float core = smoothstep(0.5, 0.3, r), halo = exp(-r * r * 9.0) * smoothstep(0.5, 0.2, r) * 0.55 * vShine;
      float a = max(core, halo) * vA; vec3 col = mix(vCol, min(vCol * 1.12 + 0.12, vec3(1.0)), vShine * smoothstep(0.32, 0.0, r));
      if (a < 0.01) discard; gl_FragColor = vec4(col * a, a); }`;
  const mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthTest: true, depthWrite: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor });

  /* ---------- the body (same sampling as the new concept: blue-noise points on smooth PN patches, skin weights from the triangle) ---------- */
  const B = {}, REST = {}; let occ = [], ready = false;
  const wpos = (n, v = new THREE.Vector3()) => B[n].getWorldPosition(v);
  const build = async (gltf) => {
    const root = gltf.scene; rig.add(root);
    root.traverse((o) => { const k = RIGMAP[o.name.replace(/[^A-Za-z0-9]/g, '')]; if (k) B[k] = o; });
    const skinned = []; root.traverse((o) => { if (o.isSkinnedMesh) { skinned.push(o); o.visible = false; } });
    rig.updateMatrixWorld(true);
    { const fw = wpos('LeftToe').sub(wpos('LeftFoot')).add(wpos('RightToe').sub(wpos('RightFoot'))); root.rotation.y -= Math.atan2(fw.x, fw.z); rig.updateMatrixWorld(true); }
    const bb = new THREE.Box3().setFromObject(root, true), sc = 1 / (bb.max.y - bb.min.y);
    const o0 = root.position.clone(), cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2;
    root.scale.multiplyScalar(sc); root.position.set((o0.x - cx) * sc, (o0.y - bb.min.y) * sc, (o0.z - cz) * sc); rig.updateMatrixWorld(true);
    { const s2 = wpos('LeftArm'), e2 = wpos('LeftForeArm'); makePoses(Math.atan2(Math.abs(e2.x - s2.x), s2.y - e2.y) / DEG); }
    BONE_NAMES.forEach((n) => { const b = B[n]; REST[n] = { L: b.quaternion.clone(), P: b.parent.getWorldQuaternion(new THREE.Quaternion()) }; REST[n].Pi = REST[n].P.clone().invert(); });
    const host = skinned.find((m) => /surface/i.test(m.name)) || skinned[0], sk = host.skeleton;
    const tris = []; let tot = 0;
    const va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3();
    skinned.forEach((m) => { const ps = m.geometry.attributes.position, ix = m.geometry.index.array; for (let i = 0; i < ix.length; i += 3) { va.fromBufferAttribute(ps, ix[i]); vb.fromBufferAttribute(ps, ix[i + 1]); vc.fromBufferAttribute(ps, ix[i + 2]); const ar = e1.subVectors(vb, va).cross(e2.subVectors(vc, va)).length() * 0.5; if (ar <= 0) continue; tot += ar; tris.push([m, ix[i], ix[i + 1], ix[i + 2], tot]); } });
    const SN = new Map();
    skinned.forEach((m) => {
      if (!m.geometry.attributes.normal) m.geometry.computeVertexNormals();
      const ps = m.geometry.attributes.position, nr = m.geometry.attributes.normal, key = (i) => `${Math.round(ps.getX(i) * 1e4)},${Math.round(ps.getY(i) * 1e4)},${Math.round(ps.getZ(i) * 1e4)}`, sum = new Map(), out = new Float32Array(ps.count * 3);
      for (let i = 0; i < ps.count; i++) { const k = key(i), a = sum.get(k) || [0, 0, 0]; a[0] += nr.getX(i); a[1] += nr.getY(i); a[2] += nr.getZ(i); sum.set(k, a); }
      for (let i = 0; i < ps.count; i++) { const a = sum.get(key(i)), l = Math.hypot(a[0], a[1], a[2]) || 1; out[i * 3] = a[0] / l; out[i * 3 + 1] = a[1] / l; out[i * 3 + 2] = a[2] / l; }
      SN.set(m, out);
    });
    const PO = new THREE.Vector3(), NO = new THREE.Vector3();
    const pn = (nrm, P1, P2, P3, i0, i1, i2, w, u, v) => {
      const o = [P1.x, P1.y, P1.z, P2.x, P2.y, P2.z, P3.x, P3.y, P3.z], N1 = i0 * 3, N2 = i1 * 3, N3 = i2 * 3, ww = w * w, uu = u * u, vv = v * v, out = [0, 0, 0];
      for (let c = 0; c < 3; c++) {
        const p1 = o[c], p2 = o[3 + c], p3 = o[6 + c];
        const d12 = (P2.x - P1.x) * nrm[N1] + (P2.y - P1.y) * nrm[N1 + 1] + (P2.z - P1.z) * nrm[N1 + 2];
        const d21 = (P1.x - P2.x) * nrm[N2] + (P1.y - P2.y) * nrm[N2 + 1] + (P1.z - P2.z) * nrm[N2 + 2];
        const d23 = (P3.x - P2.x) * nrm[N2] + (P3.y - P2.y) * nrm[N2 + 1] + (P3.z - P2.z) * nrm[N2 + 2];
        const d32 = (P2.x - P3.x) * nrm[N3] + (P2.y - P3.y) * nrm[N3 + 1] + (P2.z - P3.z) * nrm[N3 + 2];
        const d31 = (P1.x - P3.x) * nrm[N3] + (P1.y - P3.y) * nrm[N3 + 1] + (P1.z - P3.z) * nrm[N3 + 2];
        const d13 = (P3.x - P1.x) * nrm[N1] + (P3.y - P1.y) * nrm[N1 + 1] + (P3.z - P1.z) * nrm[N1 + 2];
        const b210 = (2 * p1 + p2 - d12 * nrm[N1 + c]) / 3, b120 = (2 * p2 + p1 - d21 * nrm[N2 + c]) / 3;
        const b021 = (2 * p2 + p3 - d23 * nrm[N2 + c]) / 3, b012 = (2 * p3 + p2 - d32 * nrm[N3 + c]) / 3;
        const b102 = (2 * p3 + p1 - d31 * nrm[N3 + c]) / 3, b201 = (2 * p1 + p3 - d13 * nrm[N1 + c]) / 3;
        const E = (b210 + b120 + b021 + b012 + b102 + b201) / 6, Vc = (p1 + p2 + p3) / 3, b111 = E + (E - Vc) * 0.5;
        out[c] = p1 * ww * w + p2 * uu * u + p3 * vv * v + 3 * (b210 * ww * u + b120 * w * uu + b201 * ww * v + b021 * uu * v + b102 * w * vv + b012 * u * vv) + 6 * b111 * w * u * v;
      }
      PO.set(out[0], out[1], out[2]);
      NO.set(nrm[N1] * w + nrm[N2] * u + nrm[N3] * v, nrm[N1 + 1] * w + nrm[N2 + 1] * u + nrm[N3 + 1] * v, nrm[N1 + 2] * w + nrm[N2 + 2] * u + nrm[N3 + 2] * v).normalize();
      return { p: PO, nn: NO };
    };
    const pos = new Float32Array(NS * 3), nor = new Float32Array(NS * 3), sI = new Float32Array(NS * 4), sW = new Float32Array(NS * 4), rnd = new Float32Array(NS);
    const toWorld = new THREE.Matrix4().multiplyMatrices(sk.bones[0].matrixWorld, sk.boneInverses[0]).multiply(host.bindMatrix);
    const wv = new THREE.Vector3(), JJ = new Int32Array(12), WW = new Float32Array(12);
    const r0 = 0.8 * Math.sqrt((tot * toWorld.getMaxScaleOnAxis() ** 2) / NS), bg = new Map(), bk = (x, y, z) => ((Math.floor(x / r0) + 512) * 1024 + (Math.floor(y / r0) + 512)) * 1024 + (Math.floor(z / r0) + 512);
    const far = (x, y, z) => { const cx2 = Math.floor(x / r0), cy2 = Math.floor(y / r0), cz2 = Math.floor(z / r0); for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) { const L = bg.get(((cx2 + a + 512) * 1024 + (cy2 + b + 512)) * 1024 + (cz2 + c + 512)); if (L) for (let k = 0; k < L.length; k += 3) { const dx = L[k] - x, dy = L[k + 1] - y, dz = L[k + 2] - z; if (dx * dx + dy * dy + dz * dz < r0 * r0) return false; } } return true; };
    let n = 0, slice = performance.now();
    for (let tries = 0; n < NS && tries < NS * 6; tries++) {
      if ((tries & 511) === 0 && performance.now() - slice > 12) { await new Promise((r) => setTimeout(r, 0)); slice = performance.now(); }
      const r = Math.random() * tot; let lo = 0, hi = tris.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (tris[m][4] < r) lo = m + 1; else hi = m; }
      const [m, i0, i1, i2] = tris[lo], ps = m.geometry.attributes.position, si = m.geometry.attributes.skinIndex, sw = m.geometry.attributes.skinWeight;
      let u = Math.random(), v = Math.random(); if (u + v > 1) { u = 1 - u; v = 1 - v; } const w0 = 1 - u - v, bw = [w0, u, v], id = [i0, i1, i2];
      va.fromBufferAttribute(ps, i0); vb.fromBufferAttribute(ps, i1); vc.fromBufferAttribute(ps, i2);
      wv.set(va.x * w0 + vb.x * u + vc.x * v, va.y * w0 + vb.y * u + vc.y * v, va.z * w0 + vb.z * u + vc.z * v).applyMatrix4(toWorld);
      if (!far(wv.x, wv.y, wv.z)) continue;
      const { p, nn } = pn(SN.get(m), va, vb, vc, i0, i1, i2, w0, u, v);
      { const key = bk(wv.x, wv.y, wv.z), L = bg.get(key); if (L) L.push(wv.x, wv.y, wv.z); else bg.set(key, [wv.x, wv.y, wv.z]); }
      pos.set([p.x, p.y, p.z], n * 3); nor.set([nn.x, nn.y, nn.z], n * 3);
      let nj = 0;
      for (let c = 0; c < 3; c++) for (let k = 0; k < 4; k++) { const wt = sw.getComponent(id[c], k) * bw[c]; if (wt <= 0) continue; const j = si.getComponent(id[c], k); let e = 0; while (e < nj && JJ[e] !== j) e++; if (e === nj) { JJ[nj] = j; WW[nj] = 0; nj++; } WW[e] += wt; }
      let sum = 0;
      for (let k = 0; k < 4; k++) { let bi2 = -1; for (let e = 0; e < nj; e++) if (WW[e] > 0 && (bi2 < 0 || WW[e] > WW[bi2])) bi2 = e; if (bi2 < 0) { sI[n * 4 + k] = 0; sW[n * 4 + k] = 0; continue; } sI[n * 4 + k] = JJ[bi2]; sW[n * 4 + k] = WW[bi2]; sum += WW[bi2]; WW[bi2] = -1; }
      for (let k = 0; k < 4; k++) sW[n * 4 + k] /= sum || 1;
      rnd[n] = Math.random(); n++;
    }
    const geo = new THREE.BufferGeometry(), sl = (a, c) => new THREE.BufferAttribute(a.subarray(0, n * c), c);
    geo.setAttribute('position', sl(pos, 3)); geo.setAttribute('normal', sl(nor, 3)); geo.setAttribute('skinIndex', sl(sI, 4)); geo.setAttribute('skinWeight', sl(sW, 4)); geo.setAttribute('aRnd', sl(rnd, 1));
    const pts = new THREE.SkinnedMesh(geo, mat); pts.isMesh = false; pts.isPoints = true; pts.frustumCulled = false;
    host.parent.add(pts); pts.position.copy(host.position); pts.quaternion.copy(host.quaternion); pts.scale.copy(host.scale);
    pts.bind(sk, host.bindMatrix); pts.renderOrder = 1;
    occ = skinned; skinned.forEach((m) => { m.visible = true; m.material = new THREE.MeshBasicMaterial({ colorWrite: false, polygonOffset: true, polygonOffsetFactor: 3, polygonOffsetUnits: 6 }); m.renderOrder = 0; m.frustumCulled = false; });
  };

  /* ---------- posing: relaxed stance, breathing, walking in place ---------- */
  const QI = new THREE.Quaternion(), qx = new THREE.Quaternion(), qt = new THREE.Quaternion();
  let PH = 0;
  const pose = (t, wk) => {
    BONE_NAMES.forEach((n) => {
      const r = REST[n]; if (!r) return;
      qx.copy(RELAX[n] || QI);
      const id = idle(n, t); if (id) qx.premultiply(id);
      if (wk > 0.01) { const wq = walk(n, PH, wk); if (wq) qx.premultiply(wq); }
      qt.copy(r.Pi).multiply(qx).multiply(r.P).multiply(r.L); B[n].quaternion.copy(qt);
    });
  };

  /* ---------- the copy, the reel, the label: everything that follows the active area ---------- */
  const lname = $('.hp3__lname', sec), lidx = $('.hp3__lidx b', sec), tt = $('.hp3__t', sec), tc = $('.hp3__c', sec), trl = $('.hp3__r b', sec), trs = $('.hp3__r small', sec);
  const vids = $$('.hp3__vids video', sec), bgs = $$('.hp3__bgs img', sec), dots = $$('.hp3__dots button', sec), snd = $('.hp3__snd', sec), mprog = $('.hp3__mprog i', sec);
  const g = window.gsap;
  let cur = -1, muted = true, vis = false;
  const setArea = (k) => {
    if (k === cur) return; const first = cur < 0; cur = k; const x = DATA[k];
    const put = () => { lname.textContent = x.n; lidx.textContent = String(k + 1).padStart(2, '0'); tt.textContent = x.n; tc.textContent = x.c; trl.textContent = x.cb; trs.textContent = x.cs; };
    if (g && !first && !RM) { const els = [lname, tt, tc, trl, trs]; g.to(els, { opacity: 0, y: -8, duration: 0.2, ease: 'power2.in', overwrite: true, onComplete: () => { put(); g.fromTo(els, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'expo.out' }); } }); } else put();
    dots.forEach((b, i) => b.classList.toggle('is-on', i === k));
    bgs.forEach((im, i) => { if (i === k && !im.getAttribute('src')) im.src = im.dataset.src; im.classList.toggle('is-on', i === k); });
    vids.forEach((v, i) => {
      if (i === k) { if (!v.getAttribute('src')) { v.poster = v.dataset.poster; v.src = v.dataset.src; } v.muted = muted; v.classList.add('is-on'); if (vis) { const p = v.play(); if (p) p.catch(() => {}); } }
      else { v.classList.remove('is-on'); v.pause(); }
    });
    hot = 0;
  };
  vids.forEach((v) => v.addEventListener('timeupdate', () => { if (v.classList.contains('is-on') && v.duration && mprog) mprog.style.setProperty('--p', (v.currentTime / v.duration).toFixed(4)); }));
  if (snd) snd.addEventListener('click', () => { muted = !muted; snd.setAttribute('aria-pressed', String(!muted)); snd.setAttribute('aria-label', muted ? 'Unmute reel' : 'Mute reel'); vids.forEach((v) => { v.muted = muted; }); const v = vids[cur]; if (v && !muted) { const p = v.play(); if (p) p.catch(() => {}); } });

  /* ---------- scroll: the section pins and its length is split into nine steps ---------- */
  const N = DATA.length;
  const range = () => { const top = sec.getBoundingClientRect().top + scrollY; return [top, Math.max(1, sec.offsetHeight - innerHeight)]; };
  const progress = () => { const [top, len] = range(); return clamp((scrollY - top) / len); };
  const goTo = (k) => {
    k = Math.max(0, Math.min(N - 1, k)); const [top, len] = range(), y = top + ((k + 0.5) / N) * len;
    if (window.__azLenis) window.__azLenis.scrollTo(y, { duration: 1.1 }); else scrollTo({ top: y, behavior: 'smooth' });
  };
  $('.hp3__arw--prev', sec).addEventListener('click', () => goTo(cur - 1));
  $('.hp3__arw--next', sec).addEventListener('click', () => goTo(cur + 1));
  dots.forEach((b, i) => b.addEventListener('click', () => goTo(i)));

  /* ---------- sizing, input, loop ---------- */
  let W = 0, H = 0, DPR = 1, mx = -9999, my = -9999, yaw = LIST[0][4], hot = 0, last = 0;
  const resize = () => { DPR = Math.min(devicePixelRatio || 1, 2); W = fig.clientWidth; H = fig.clientHeight; if (renderer) { renderer.setPixelRatio(DPR); renderer.setSize(W, H, false); } camera.aspect = W / Math.max(1, H); camera.updateProjectionMatrix(); U.uRes.value.set(W, H); };
  resize(); addEventListener('resize', resize);
  if (FINE) { fig.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; }, { passive: true }); fig.addEventListener('pointerleave', () => { mx = my = -9999; }); }
  const V2 = new THREE.Vector3(), AP = new THREE.Vector3();
  const areaPos = (k) => { const [b0, b1, f] = LIST[k]; wpos(b0, AP); return AP.lerp(wpos(b1, V2), f); };
  const loop = (now) => {
    requestAnimationFrame(loop);
    const t = now / 1000, dt = Math.min(0.05, last ? t - last : 0.016); last = t;
    const p = progress(), k = Math.min(N - 1, Math.floor(p * N));
    if (k !== cur) setArea(k);
    if (!vis || !renderer || !ready) return;
    // the body turns to show the area (shortest way round), walks in place, the glow fades in on the new area
    let target = LIST[cur][4]; while (target - yaw > Math.PI) target -= TAU; while (target - yaw < -Math.PI) target += TAU;
    yaw += (target - yaw) * Math.min(1, dt * 3.2);
    rig.rotation.y = yaw + 0.05 * Math.sin(t * 0.4);
    hot += (1 - hot) * Math.min(1, dt * 2.6);
    const wk = RM ? 0 : 1; PH += dt * 5.0;
    rig.position.y = wk * 0.006 * (Math.cos(2 * PH) - 1);
    pose(t, wk); rig.updateMatrixWorld(true);
    const ap = areaPos(cur); U.uArea.value.set(ap.x, ap.y, ap.z, LIST[cur][3]); U.uHot.value = hot;
    const S = Math.min(H * 0.9, W * (MOB ? 2.15 : 1.9)), D = H / (2 * S * FOVT);
    camera.position.set(0, 0.5 + D * 0.05, D); camera.lookAt(0, 0.5, 0); camera.updateMatrixWorld();
    U.uTime.value = t; U.uSize.value = (MOB ? 1.5 : 1.55) * Math.sqrt(S / 700) * DPR + 0.4 * DPR; U.uMouse.value.set(mx, my, 70);
    renderer.render(scene, camera);
  };
  requestAnimationFrame(loop);
  new IntersectionObserver((es) => es.forEach((e) => {
    vis = e.isIntersecting;
    if (vis) { sec.classList.add('is-in'); const v = vids[cur]; if (v) { const p = v.play(); if (p) p.catch(() => {}); } }
    else vids.forEach((v) => v.pause());
  }), { threshold: 0.05 }).observe(sec);
  // load the model only as the section approaches
  if (renderer) {
    let started = false;
    new IntersectionObserver((es, o) => es.forEach((e) => {
      if (!e.isIntersecting || started) return; started = true; o.disconnect();
      new GLTFLoader().load(MODEL, async (gltf) => {
        await build(gltf); ready = true; resize();
        if (g) g.to(U.uFade, { value: 1, duration: 1.4, ease: 'power2.out' }); else U.uFade.value = 1;
      }, undefined, () => {});
    }), { rootMargin: '1200px 0px' }).observe(sec);
  }
})();
