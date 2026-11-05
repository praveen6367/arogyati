/* AROGYATI — "Rehabilitation, in every dimension": pinned 3D chapter section (variant page /home/3d/). */
import * as THREE from '/home/vendor/three/three.module.min.js';
import { GLTFLoader } from '/home/vendor/three/GLTFLoader.js';
import { MeshoptDecoder } from '/home/vendor/three/meshopt_decoder.module.js';
import { RoomEnvironment } from '/home/vendor/three/RoomEnvironment.js';

const d = document, h = d.documentElement, $ = (s, r = d) => r.querySelector(s), $$ = (s, r = d) => [...r.querySelectorAll(s)];
const sec = $('.m3'), stage = $('.m3__stage'), box = $('.m3__canvas');
const LITE = h.classList.contains('az-lite'), RM = h.classList.contains('az-rm');
const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
const fail = () => h.classList.add('m3-fail');

/* focus points in model space (feet at y=0, centred) */
const PTS = { center: [0, 0.95, 0], shoulder: [-0.12, 1.42, 0.08], knee: [-0.3, 0.72, 0.11], back: [-0.2, 1.05, -0.15], steth: [0.18, 1.42, 0.15] };
/* chapter keyframes: rig yaw, camera distance factor, focus point, hotspot shown */
const K = [
  { yaw: 0, dist: 1, f: 'center', spot: null },
  { yaw: 0.45, dist: 0.5, f: 'shoulder', spot: 'shoulder' },
  { yaw: 0.8, dist: 0.58, f: 'knee', spot: 'knee' },
  { yaw: 2.95, dist: 0.6, f: 'back', spot: 'back' },
  { yaw: Math.PI * 2, dist: 0.9, f: 'center', spot: 'steth' },
];

if (sec && box) {
  let renderer = null;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { fail(); }
  if (renderer) run(renderer);
}

function run(renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, LITE ? 1.25 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = !LITE; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  box.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.035).texture;
  scene.add(new THREE.HemisphereLight(0xeef4ff, 0xd8ccb6, 0.55));
  const key = new THREE.DirectionalLight(0xfff2e0, 2.4); key.position.set(2.2, 3.6, 2.8); key.castShadow = !LITE;
  key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -1.6, right: 1.6, top: 2, bottom: -1.6, near: 0.5, far: 12 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; key.shadow.radius = 7; scene.add(key);
  const rim = new THREE.DirectionalLight(0xc4dcff, 1.7); rim.position.set(-3, 2.4, -2.6); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 0.5); fill.position.set(-2.2, 0.8, 3); scene.add(fill);

  const rig = new THREE.Group(); scene.add(rig);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.ShadowMaterial({ opacity: 0.15 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; rig.add(ground);
  const cam = new THREE.PerspectiveCamera(26, 1, 0.05, 60);

  let H = 1.9, ready = false, baseDist = 6;
  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(LITE ? '/home/assets/3d/model-lite.glb' : '/home/assets/3d/model.glb', (g) => {
    const m = g.scene, aniso = renderer.capabilities.getMaxAnisotropy();
    m.traverse((o) => {
      if (!o.isMesh) return; o.castShadow = !LITE;
      const mt = o.material;
      ['map', 'normalMap', 'roughnessMap', 'metalnessMap'].forEach((k) => { if (mt[k]) mt[k].anisotropy = aniso; });
      if (mt.map) mt.map.colorSpace = THREE.SRGBColorSpace;
      mt.envMapIntensity = 0.9; mt.metalness = Math.min(mt.metalness ?? 0, 0.15); mt.roughness = Math.max(mt.roughness ?? 1, 0.42);
      if (mt.normalScale) mt.normalScale.set(1.15, 1.15);
    });
    const b = new THREE.Box3().setFromObject(m), c = b.getCenter(new THREE.Vector3());
    m.position.set(-c.x, -b.min.y, -c.z); H = b.getSize(new THREE.Vector3()).y;
    rig.add(m); ready = true; h.classList.add('m3-ready'); fit(); dirty = true;
  }, undefined, fail);

  let W = 1, Hh = 1, mobile = false, dirty = true;
  const fit = () => {
    W = Math.max(1, box.clientWidth); Hh = Math.max(1, box.clientHeight); mobile = W < 900;
    renderer.setSize(W, Hh, false); renderer.domElement.style.width = W + 'px'; renderer.domElement.style.height = Hh + 'px';
    cam.aspect = W / Hh;
    /* desktop: subject sits right of centre (copy on the left); mobile: subject sits higher (copy below) */
    if (mobile) cam.setViewOffset(W, Hh, 0, Hh * 0.2, W, Hh); else cam.setViewOffset(W, Hh, -W * 0.14, 0, W, Hh);
    const v = THREE.MathUtils.degToRad(cam.fov);
    baseDist = Math.max((H * 1.12) / 2 / Math.tan(v / 2), (H * 0.62) / 2 / (Math.tan(v / 2) * cam.aspect)) * (mobile ? 1.4 : 1);
    cam.updateProjectionMatrix(); dirty = true;
  };
  let fq = 0; const qfit = () => { cancelAnimationFrame(fq); fq = requestAnimationFrame(fit); };
  addEventListener('resize', qfit); new ResizeObserver(qfit).observe(box);

  /* chapter state */
  const chapters = $$('.m3-ch'), dots = $$('.m3__nav i'), bgs = $$('.m3__bg i'), spot = $('.m3__spot'), line = $('.m3__line path');
  let prog = 0, smooth = 0, curCh = -1, mx = 0, my = 0, tmx = 0, tmy = 0;
  const N = K.length;
  const kf = (p) => { /* plateau easing: hold each chapter, glide between */
    const t = p * (N - 1), i = Math.min(N - 2, Math.floor(t)), f = t - i;
    const hold = 0.28, u = Math.min(1, Math.max(0, (f - hold) / (1 - 2 * hold)));
    return { i, u: u * u * (3 - 2 * u) };
  };
  const setCh = (k) => {
    if (k === curCh) return; curCh = k;
    chapters.forEach((c, i) => c.classList.toggle('is-on', i === k));
    dots.forEach((c, i) => c.classList.toggle('is-on', i <= k));
    bgs.forEach((c, i) => c.classList.toggle('is-on', i === k));
  };
  if (window.ScrollTrigger) {
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: () => '+=' + Math.round(innerHeight * (N - 1) * 1.1), pin: stage, scrub: true, invalidateOnRefresh: true,
      onUpdate: (s) => { prog = s.progress; dirty = true; } });
    ScrollTrigger.sort(); ScrollTrigger.refresh();
    addEventListener('load', () => ScrollTrigger.refresh());
  }
  if (FINE && !LITE) { stage.addEventListener('mousemove', (e) => { tmx = e.clientX / innerWidth - 0.5; tmy = e.clientY / innerHeight - 0.5; }); stage.addEventListener('mouseleave', () => { tmx = tmy = 0; }); }

  let vis = false; new IntersectionObserver((es) => { vis = es[0].isIntersecting; }).observe(stage);
  const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
  const tmp = new THREE.Vector3(), clock = new THREE.Clock();
  const tick = () => {
    requestAnimationFrame(tick);
    if (!vis || !ready) return;
    const dt = Math.min(clock.getDelta(), 0.05), e = 1 - Math.pow(0.0005, dt);
    smooth += (prog - smooth) * (RM ? 1 : e);
    mx += (tmx - mx) * e * 0.6; my += (tmy - my) * e * 0.6;
    const { i, u } = kf(smooth), A = K[i], B = K[i + 1];
    setCh(u < 0.5 ? i : i + 1);
    rig.rotation.y = A.yaw + (B.yaw - A.yaw) * u + mx * 0.25 + (RM ? 0 : Math.sin(clock.elapsedTime * 0.4) * 0.03);
    const fA = V(PTS[A.f]), fB = V(PTS[B.f]), focus = fA.lerp(fB, u);
    rig.updateMatrixWorld(); const T = focus.applyMatrix4(rig.matrixWorld);
    const dist = baseDist * (A.dist + (B.dist - A.dist) * u);
    cam.position.set(T.x, T.y + H * 0.04 + my * 0.08, T.z + dist); cam.lookAt(T);
    renderer.render(scene, cam);
    /* hotspot: projected 3D point + connector to the chapter card */
    const sk = u < 0.5 ? A.spot : B.spot, fade = 1 - Math.min(1, Math.abs(u - (u < 0.5 ? 0 : 1)) * 4);
    if (sk && spot) {
      tmp.copy(V(PTS[sk])).applyMatrix4(rig.matrixWorld).project(cam);
      const x = (tmp.x * 0.5 + 0.5) * W, y = (-tmp.y * 0.5 + 0.5) * Hh, front = tmp.z < 1;
      spot.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`; spot.style.opacity = front ? fade.toFixed(3) : 0;
      const card = $('.m3-ch.is-on .m3-ch__card');
      if (card && line && !mobile) {
        const r = card.getBoundingClientRect(), s = stage.getBoundingClientRect(), x2 = r.right - s.left, y2 = r.top - s.top + 46;
        const mxp = (x + x2) / 2;
        line.setAttribute('d', `M${x2} ${y2} C ${mxp} ${y2}, ${mxp} ${y}, ${x} ${y}`); line.style.opacity = (fade * 0.8).toFixed(3);
      } else if (line) line.style.opacity = 0;
    } else { if (spot) spot.style.opacity = 0; if (line) line.style.opacity = 0; }
    dirty = false;
  };
  tick();
}
