(() => {
const ICONS = {"heart": "<path d=\"M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z\"/>", "pulse": "<path d=\"M3 12h4l2-6 4 12 2-6h6\"/>", "users": "<circle cx=\"9\" cy=\"8\" r=\"3.5\"/><path d=\"M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6\"/><circle cx=\"17.5\" cy=\"9\" r=\"2.5\"/><path d=\"M18 14.2c2.4.3 3.9 2.2 3.9 5\"/>", "award": "<circle cx=\"12\" cy=\"9\" r=\"6\"/><path d=\"M8.5 14L7 21l5-3 5 3-1.5-7\"/>", "star": "<path d=\"M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z\"/>", "shield": "<path d=\"M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6z\"/><path d=\"M9 12l2 2 4-4\"/>", "target": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"5\"/><circle cx=\"12\" cy=\"12\" r=\"1.5\"/>", "clock": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 2\"/>", "brain": "<path d=\"M12 4a3 3 0 0 0-5.5 1.5A3.2 3.2 0 0 0 4 9a3 3 0 0 0 1 4.5A3.2 3.2 0 0 0 8 18a3 3 0 0 0 4 1zM12 4a3 3 0 0 1 5.5 1.5A3.2 3.2 0 0 1 20 9a3 3 0 0 1-1 4.5A3.2 3.2 0 0 1 16 18a3 3 0 0 1-4 1zM12 4v15\"/>", "leaf": "<path d=\"M5 19C5 10 10 5 20 4c0 10-5 15-14 15z\"/><path d=\"M5 19c3-5 6-8 10-10\"/>", "flask": "<path d=\"M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3\"/><path d=\"M7.5 15h9\"/>", "cpu": "<rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"2\"/><rect x=\"10\" y=\"10\" width=\"4\" height=\"4\"/><path d=\"M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4\"/>", "collab": "<circle cx=\"9\" cy=\"12\" r=\"5.5\"/><circle cx=\"15\" cy=\"12\" r=\"5.5\"/>", "community": "<circle cx=\"12\" cy=\"6\" r=\"2.5\"/><circle cx=\"5\" cy=\"17\" r=\"2.5\"/><circle cx=\"19\" cy=\"17\" r=\"2.5\"/><path d=\"M10.5 8l-4 7M13.5 8l4 7M8 17h8\"/>", "person": "<circle cx=\"12\" cy=\"5\" r=\"2.5\"/><path d=\"M12 8v6M6 10l6 1 6-1M9 21l3-7 3 7\"/>", "chat": "<path d=\"M4 5h16v11H9l-5 4z\"/>", "clip": "<rect x=\"5\" y=\"4\" width=\"14\" height=\"17\" rx=\"2\"/><path d=\"M9 4h6v3H9zM8 12h8M8 16h5\"/>", "mega": "<path d=\"M3 10v4h4l8 5V5L7 10z\"/><path d=\"M18 9a4 4 0 0 1 0 6\"/>", "bed": "<path d=\"M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5\"/><circle cx=\"7\" cy=\"11\" r=\"1.6\"/>", "building": "<path d=\"M5 21V4h9v17M14 9h5v12M3 21h18M8 8h3M8 12h3M8 16h3\"/>", "bolt": "<path d=\"M13 2L4 14h7l-1 8 9-12h-7z\"/>", "gear": "<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2\"/>", "growth": "<path d=\"M3 17l6-6 4 4 8-8\"/><path d=\"M15 7h6v6\"/>", "calendar": "<rect x=\"4\" y=\"5\" width=\"16\" height=\"16\" rx=\"2\"/><path d=\"M4 10h16M9 3v4M15 3v4\"/>", "bulb": "<path d=\"M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z\"/>", "check": "<path d=\"M5 12l5 5L20 7\"/>", "spark": "<path d=\"M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18\"/>", "smile": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M8 14c1 1.5 2.5 2.2 4 2.2s3-.7 4-2.2M9 9.5h.01M15 9.5h.01\"/>", "dumbbell": "<path d=\"M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12\"/>", "book": "<path d=\"M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5\"/>", "baby": "<circle cx=\"12\" cy=\"12\" r=\"8\"/><path d=\"M9 12h.01M15 12h.01M10 16c1 .8 3 .8 4 0M12 4c1-1.5 3-1.5 3 0\"/>", "film": "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"M10 9l5 3-5 3z\"/>", "hand": "<path d=\"M8 12V6a1.5 1.5 0 0 1 3 0v5M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6a1.5 1.5 0 0 1 3 0v8c0 4-3 7-6 7s-4-1-6-4l-2-3a1.5 1.5 0 0 1 2.4-1.8L8 14\"/>", "wave": "<path d=\"M3 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0\"/>", "monitor": "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"/><path d=\"M8 21h8M12 16v5\"/>"};
const $ = (s, r = document) => r.querySelector(s);

/* ---------------- helpers ---------------- */
const fmt = (s) => s.replace(/\{([^}]+)\}/g, '<span class="hl">$1</span>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
const tile = (n, big) => `<span class="tile${big ? ' big' : ''}"><svg viewBox="0 0 24 24">${ICONS[n] || ''}</svg></span>`;
const box = (x, y, w, html, extra = '') => `<div class="box" style="left:${x}px;top:${y}px;width:${w}px;${extra}">${html}</div>`;
const title = (t, size = 66) => `<h2 class="a" style="font-size:${size}px">${fmt(t)}</h2>`;
const items = (list, {cols = 2, size = 28, side = false, gap = '56px 60px'} = {}) =>
  `<div class="items" style="grid-template-columns:repeat(${cols},1fr);gap:${gap}">${list.map(([t, ic]) =>
    `<div class="item a${side ? ' side' : ''}">${ic ? tile(ic) : '<span class="dot"></span>'}<div class="t" style="font-size:${size}px">${fmt(t)}</div></div>`).join('')}</div>`;
const rows = (list, {cols, dots, size = 30, vw = 330} = {}) =>
  `<div class="rows">${cols ? `<div class="r hd a"><span></span>${cols.map((c) => `<b style="width:${vw}px;color:inherit;font-size:16px">${c}</b>`).join('')}</div>` : ''}${list.map((r) =>
    `<div class="r a" style="font-size:${size}px">${dots ? '<i></i>' : ''}<span>${r[0]}</span>${r.slice(1).map((v) => `<b style="width:${vw}px">${v}</b>`).join('')}</div>`).join('')}</div>`;
const amt = (s) => { const m = s.replace(/\s/g, '').match(/^([\d.]+)(K|LAC|L|CR)?/i); if (!m) return 1; const u = (m[2] || '').toUpperCase(); return parseFloat(m[1]) * (u === 'K' ? 1e3 : u === 'CR' ? 1e7 : u ? 1e5 : 1); };
const bars = (list, max) => `<div class="bars">${list.map((r) => `<div class="b a"><div class="lab"><span>${r[0]}</span><b>${r[1]}</b></div><div class="tr"><i style="--w:${Math.max(0.04, Math.pow(amt(r[1]) / max, 0.62)).toFixed(3)}"></i></div></div>`).join('')}</div>`;
const tags = (list, size = 26) => `<div class="tags">${list.map((t) => `<span class="a" style="font-size:${size}px">${t}</span>`).join('')}</div>`;
const num = (t, size, extra = '') => `<div class="num a cnt" data-to="${t}" style="font-size:${size}px;${extra}">${t}</div>`;
const DON = ['#06261B', '#0A6B3B', '#1E9447', '#0F4A2F', '#2F8F55', '#F4FFD6'];
function donut(vals, size, sw, center) {
  const tot = vals.reduce((a, b) => a + b, 0), c = size / 2, r = c - sw / 2 - 2;
  let acc = 0;
  const segs = vals.map((v, k) => {
    const len = (v / tot) * 100, off = -acc; acc += len;
    return `<circle class="seg" pathLength="100" cx="${c}" cy="${c}" r="${r}" stroke="${DON[k % DON.length]}" stroke-width="${sw}" stroke-dashoffset="${off}" style="--len:${Math.max(0, len - 0.7)};--k:${k}" transform="rotate(-90 ${c} ${c})"/>`;
  }).join('');
  return `<div class="donut a" style="position:relative;width:${size}px;height:${size}px"><svg width="${size}" height="${size}"><circle cx="${c}" cy="${c}" r="${r}" stroke="rgba(6,38,27,.12)" stroke-width="${sw}" fill="none"/>${segs}</svg><div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center;color:#06261B">${center}</div></div>`;
}
function chart(w, h) {
  const v = [0.2, 0.29, 0.27, 0.43, 0.5, 0.68, 0.9], n = v.length, sl = w / n;
  const P = v.map((y, i) => [sl * (i + 0.5), h - h * y]);
  let d = `M${P[0][0]} ${P[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(n - 1, i + 2)];
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6},${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6},${p2[0]} ${p2[1]}`;
  }
  const grid = [0, 1, 2, 3, 4].map((g) => `<line x1="0" x2="${w}" y1="${(h / 4) * g}" y2="${(h / 4) * g}" stroke="rgba(242,251,234,.13)" stroke-width="1.5" ${g < 4 ? 'stroke-dasharray="4 8"' : ''}/>`).join('');
  const cols = v.map((y, i) => `<rect class="col" style="--k:${i}" x="${sl * i + sl * 0.24}" y="${h - h * y}" width="${sl * 0.52}" height="${h * y}" rx="${sl * 0.12}" fill="url(#gc)" opacity=".55"/>`).join('');
  const pts = P.map((p, i) => `<g class="pt" style="--k:${i}">${i === n - 1 ? `<circle class="pulse" cx="${p[0]}" cy="${p[1]}" r="12" fill="none" stroke="#B6F23C" stroke-width="2"/>` : ''}<circle cx="${p[0]}" cy="${p[1]}" r="${i === n - 1 ? 11 : 7}" fill="#04150F" stroke="#B6F23C" stroke-width="${i === n - 1 ? 5 : 4}"/></g>`).join('');
  return `<svg class="chart a" width="${w}" height="${h}" style="overflow:visible"><defs>
    <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B6F23C" stop-opacity=".95"/><stop offset="1" stop-color="#1B9A4B" stop-opacity=".3"/></linearGradient>
    <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B6F23C" stop-opacity=".4"/><stop offset="1" stop-color="#B6F23C" stop-opacity="0"/></linearGradient>
    <linearGradient id="gl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1B9A4B"/><stop offset="1" stop-color="#D8FF6A"/></linearGradient></defs>
    ${grid}${cols}<path class="ar" d="${d} L${P[n - 1][0]} ${h} L${P[0][0]} ${h} Z" fill="url(#ga)"/>
    <path class="ln" pathLength="1" d="${d}" fill="none" stroke="url(#gl)" stroke-width="5" stroke-linecap="round" style="filter:drop-shadow(0 0 10px rgba(182,242,60,.9))"/>${pts}</svg>`;
}

/* ---------------- morph presets (stage px) ---------------- */
const B = {
  hero: {x: 1000, y: -170, w: 1160, h: 1420, r: '52% 48% 44% 56% / 46% 52% 48% 54%', rot: 0},
  behindL: {x: 50, y: 100, w: 790, h: 940, r: '420px 420px 110px 110px', rot: -5},
  behindL2: {x: 70, y: 90, w: 800, h: 950, r: '440px 440px 90px 90px', rot: 4},
  behindR: {x: 1080, y: 100, w: 790, h: 940, r: '420px 420px 110px 110px', rot: 5},
  behindR2: {x: 1060, y: 90, w: 800, h: 950, r: '440px 440px 90px 90px', rot: -4},
  orbTR: {x: 1530, y: -230, w: 620, h: 620, r: '50%', rot: 0},
  orbTRs: {x: 1650, y: -330, w: 520, h: 520, r: '50%', rot: 0},
  behindLandL: {x: 70, y: 205, w: 800, h: 640, r: '90px', rot: -4},
  behindLandR: {x: 1050, y: 205, w: 800, h: 640, r: '90px', rot: 4},
  orbBL: {x: -230, y: 730, w: 600, h: 600, r: '50%', rot: 0},
  orbBR: {x: 1560, y: 760, w: 560, h: 560, r: '50%', rot: 0},
  full: {x: -320, y: -320, w: 2560, h: 1720, r: '0px', rot: 0},
  circL: {x: 130, y: 200, w: 680, h: 680, r: '50%', rot: 0},
  hubL: {x: 130, y: 330, w: 430, h: 430, r: '50%', rot: 0},
  circR: {x: 1140, y: 210, w: 660, h: 660, r: '50%', rot: 0},
  wave: {x: -260, y: 800, w: 2440, h: 700, r: '50% 50% 0 0 / 38% 38% 0 0', rot: 0},
};
const O = {
  a: {x: 1700, y: 880, w: 140, h: 140, r: '50%'}, b: {x: 820, y: 120, w: 96, h: 96, r: '50%'}, c: {x: 70, y: 900, w: 120, h: 120, r: '50%'},
  d: {x: 1760, y: 150, w: 110, h: 110, r: '50%'}, e: {x: 960, y: 930, w: 90, h: 90, r: '50%'}, none: {x: 960, y: 540, w: 0, h: 0, r: '50%', o: 0},
};
const P = {
  archL: {x: 120, y: 170, w: 640, h: 800, r: '320px 320px 34px 34px'},
  archR: {x: 1160, y: 170, w: 640, h: 800, r: '320px 320px 34px 34px'},
  coverC: {x: 1250, y: 250, w: 560, h: 560, r: '50%'},
  bg: {x: -120, y: -120, w: 2160, h: 1320, r: '0px'},
  landL: {x: 110, y: 255, w: 740, h: 540, r: '44px'},
  landR: {x: 1070, y: 255, w: 740, h: 540, r: '44px'},
};

/* ---------------- slides (text exactly as in the deck) ---------------- */
const IMG = (n) => `assets/img/${n}`;
const S = [];
const add = (name, o) => S.push({name, ...o});

add('AROGYATI', {blob: B.hero, orb: O.c, photo: {at: P.coverC, src: IMG('site-clinic.webp')}, html:
  box(140, 300, 980, `<svg class="ecg a" width="560" height="90" viewBox="0 0 760 120" style="overflow:visible;margin-bottom:26px"><path pathLength="1" d="M0 60 H220 L260 60 L290 10 L330 110 L365 30 L395 60 H760" fill="none" stroke="#B6F23C" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <h1 class="a" style="font-size:176px;letter-spacing:-.05em">AROGYATI</h1>
    <div class="a" style="font-size:46px;font-weight:600;margin-top:26px;letter-spacing:-.02em">${fmt('{REHABE} *SETUP* {VISIO}')}</div>`)});

add('Why AROGYATI?', {blob: B.behindL, orb: O.d, photo: {at: P.archL, src: IMG('site-doctor.png')}, html:
  box(900, 190, 880, title('*Why* {AROGYATI?}') + `<div style="height:70px"></div>` + items([
    ['Dr. Pranjali has {25yrs} of working experiences in clinical practice of physiotherapy.', 'award'],
    ['{1st} big private clinic in Kolhapur.', 'building'],
    ['Working in Kolhapur with own private set up since {18yrs.}', 'clock'],
    ['Having {advance modalities.}', 'cpu'],
  ]))});
add('Why AROGYATI? (2)', {blob: B.behindLandL, orb: O.a, photo: {at: P.landL, src: IMG('site-team.png')}, html:
  box(900, 190, 880, title('*Why* {AROGYATI?}') + `<div style="height:70px"></div>` + items([
    ['Launched few devices {1st time} in India and Kolhapur.', 'star'],
    ['Have good name, fame, good will, provided {best results} in neurological conditions, orthopedic conditions, and more.', 'heart'],
    ['Have some pre post documentary videos and photos attached to it.', 'film'],
    ['Arogyati already has a team of {6physio+ 6 staff,} working under a system.', 'users'],
  ], {size: 26}))});

add('Our team', {blob: B.behindR, orb: O.b, photo: {at: P.archR, src: IMG('site-ball.png')}, html:
  box(140, 200, 900, items([
    ['Staff has experience not only working under a private set up but also in {multi-specialty hospital} and {home visit.}', 'users'],
    ['Arogyati aims to achieve big, vision of Arogyati is to {serve society.}', 'target'],
    ['We have {problem solving} abilities, {innovative thinking,} {interpersonal skills} which will contribute to achieve goals together.', 'brain'],
    ['Believe in {quality} than quantity.', 'award'],
  ], {size: 27, gap: '70px 60px'}))});
add('Our values', {blob: B.behindLandR, orb: O.c, photo: {at: P.landR, src: IMG('site-exercise.png')}, html:
  box(140, 230, 820, items([
    ['It’s not only about financial support but also it is the joy of working with {total fruitfulness.}', 'heart'],
    ['We have {aimed} it and {achieved} best patient results.', 'target'],
    ['We are easy to work with. We take the work {seriously.}', 'check'],
    ['And we understand and respect your {brand value.}', 'shield'],
  ], {size: 28, gap: '80px 60px'}))});
add('Our promise', {blob: B.wave, orb: O.d, photo: null, html:
  box(140, 380, 1640, items([
    ['We are good at {social} and {offline} promotions.', 'mega'],
    ['And are charges to patients are {affordable.}', 'smile'],
    ['And we are focused to get you {results.}', 'target'],
  ], {cols: 3, size: 40, gap: '60px 80px'}))});

add('Trust', {blob: B.orbBR, orb: O.none, photo: {at: P.bg, src: IMG('st-shoulder.jpg'), bg: true}, html:
  box(140, 220, 820, items([
    ['In this competitive world yet leading {top place} in Kolhapur.', 'award'],
    ['Patients not only from Kolhapur visit our clinic but also from {outer areas} because of trust and results.', 'users'],
    ['Service provided to patient has {no compromise} regarding economical and religious status.', 'heart'],
  ], {cols: 1, size: 32, side: true, gap: '64px'}))});
add('Holistic', {blob: B.orbBR, orb: O.none, photo: {at: P.bg, src: IMG('st-arm.jpg'), bg: true}, html:
  box(140, 200, 840, items([
    ['We not only treat patients’ condition but also help them with {holistic approach} and recovery.', 'leaf'],
    ['We have team of *nutrition, speech consultation, prosthesis and orthosis, psychological counselling* which provides a {rehab approach}', 'community'],
    ['Working for {wellness} and making societal wellness accessible to all.', 'smile'],
  ], {cols: 1, size: 30, side: true, gap: '60px'}))});

add('AIM', {blob: B.circL, orb: O.a, photo: null, html:
  box(130, 200, 680, `<div class="a" style="height:680px;display:grid;place-items:center;color:#06261B;font-size:190px;font-weight:800;letter-spacing:-.06em">AIM</div>`) +
  box(930, 210, 860, `<div class="items" style="grid-template-columns:1fr 1fr;gap:34px 50px">${['Restore Function', 'Enhance Mobility', 'Manage Pain', 'Prevent Future Injuries', 'Promote Independence', 'Support Recovery', 'Improve Quality of Life', 'Encourage Active Involvement', 'Address Emotional Well-Being']
    .map((t) => `<div class="item side a" style="gap:18px"><span class="dot"></span><div class="t" style="font-size:30px;font-weight:600">${t}</div></div>`).join('')}</div>
    <div class="a" style="margin-top:64px;padding-top:34px;border-top:1.5px solid var(--line);font-size:32px;font-weight:500">${fmt('Utilize {Evidence-Based Approaches} of all patients.')}</div>`)});

add('VISION', {blob: B.behindLandL, orb: O.d, photo: {at: P.landL, src: IMG('site-osteo.png')}, html:
  box(900, 170, 880, title('{VISION}') + `<div style="height:64px"></div>` + items([
    ['{Individualized Care:} Tailor treatment plans to meet each patient’s unique needs and goals.', 'person'],
    ['{Holistic Approach:} Address physical, emotional, and social aspects of recovery.', 'leaf'],
    ['{Patient Empowerment:} Educate and involve patients in their rehabilitation process for better outcomes.', 'book'],
  ], {cols: 1, side: true, size: 29, gap: '48px'}))});
add('VISION (2)', {blob: B.behindL2, orb: O.a, photo: {at: P.archL, src: IMG('st-grip.jpg')}, html:
  box(900, 170, 880, title('{VISION}') + `<div style="height:64px"></div>` + items([
    ['{Functional Improvement:} Focus on restoring movement, strength, and overall function.', 'dumbbell'],
    ['{Pain Management:} Utilize techniques to alleviate pain and enhance comfort.', 'hand'],
    ['{Prevention Strategies:} Implement measures to prevent future injuries and promote long-term health.', 'shield'],
  ], {cols: 1, side: true, size: 29, gap: '48px'}))});

add('Practice', {blob: B.orbTRs, orb: O.c, photo: null, html:
  box(140, 220, 1640, items([
    ['{Evidence-Based Practice:} Use the latest research and techniques to guide treatment.', 'flask'],
    ['{Collaborative Care:} Work alongside other healthcare professionals for comprehensive support {WINS}', 'collab'],
    ['{Technology Integration:} Leverage advancements in technology to enhance rehabilitation methods.', 'cpu'],
    ['{Community Engagement:} Foster connections and support systems within the community to aid recovery.', 'community'],
  ], {size: 34, gap: '96px 110px'}))});

add('Scope of Collaboration', {blob: B.orbTRs, orb: O.d, photo: null, html:
  box(140, 160, 1640, title('{Scope of Collaboration:}') + `<div style="height:70px"></div>` + items([
    ['Post-operative rehabilitation', 'clip'], ['Chronic pain management', 'hand'],
    ['Functional recovery from neurological conditions', 'brain'], ['Patient education and support', 'book'],
  ], {cols: 4, size: 30, gap: '40px 50px'})) +
  box(140, 740, 760, `<div class="a" style="font-size:66px;font-weight:700;letter-spacing:-.035em;line-height:1.08">${fmt('*Patients* {faster recovery.}')}</div>`) +
  box(1000, 650, 780, chart(780, 300))});

add('CHARGES', {blob: B.orbTRs, orb: O.none, photo: null, html:
  box(140, 150, 1640, title('{CHARGES:}') + `<div style="height:40px"></div>` + rows([
    ['Consultation', '500', '500'], ['Physiotherapy', '500', '500'], ['Hydrotherapy', '1000', '1000'], ['Robotics', '1000', '1000'],
    ['Matrix rhythm therapy', '1500/2000/2500', '1500/2000/2500'], ['Class 4 laser', '600', '600'], ['Super induction system', '1000', '1000'], ['Shock wave diathermy', '500', '500'],
  ], {cols: ['IPD', 'OPD'], size: 30, vw: 360}))});

const pk = (name, t, list, total) => add(name, {blob: B.circR, orb: O.e, photo: null, html:
  box(140, 160, 900, title(t, 58) + `<div style="height:48px"></div>` + rows(list, {dots: true, size: 32, vw: 220})) +
  box(1190, 260, 560, donut(list.map((r) => parseInt(r[1].replace(/\D/g, ''))), 560, 64,
    `<div><div style="font-size:24px;font-weight:800;letter-spacing:.2em">TOTAL:</div><div class="cnt" data-to="${total}" style="font-size:96px;font-weight:800;letter-spacing:-.05em;line-height:1">${total}</div></div>`))});
pk('Package 01', '{EXAMPLE PACKAGE:}<br>*PACKAGE 01: 6 DAYS*', [['Consultation', '500'], ['5 PT', '2500'], ['1 MT', '1500'], ['5 ROBOTICS', '5000'], ['1 HYDROTHERAPY', '1000'], ['2 SIS', '2000']], '12500');
pk('Package 02', '{PACKAGE 02:} *1 MONTH*', [['Consultation', '500'], ['25 PT', '12500'], ['5 MT', '7500'], ['8 HYDRO', '8000'], ['8 SIS', '8000'], ['20 ROBOTICS', '20000']], '56500');

add('OUTCOME', {blob: B.orbBR, orb: O.b, photo: null, html:
  box(140, 160, 1640, title('{OUTCOME}') + `<div style="height:72px"></div>` + items([
    ['Minimum a patient will pay {12000} to max {56500}', 'users'],
    ['If we get minimum 15 patients of 1 month package and 15 of basic package we can reach our target of {8,47,500+ 1,80,000=10,27,500/month.}', 'target'],
    ['Total investment {1.40cr}', 'building'],
    ['In 225 bedded hospitals if we get to treat at least 30 patients/ day Min charge of each patient 12500/1 week to 56500/month', 'bed'],
    ['Monthly turn over will be {9,00,000 to 10,00,000}', 'calendar'],
  ], {cols: 3, size: 29, gap: '72px 80px'}))});
add('OUTCOME (2)', {theme: 'lime', blob: B.full, orb: O.none, photo: null, html:
  box(140, 160, 1640, title('{OUTCOME}') + `<div style="height:72px"></div>` + items([
    ['Annual income {1cr to 1.25cr}', 'growth'],
    ['Annual expenses15L *including staff salary, device maintenance*', 'gear'],
    ['{AROGYATI 40%:} monthly {360000-400000}', 'pulse'],
    ['Sum of profit to wins annually: {60L-70L}', 'star'],
  ], {cols: 4, size: 30, gap: '40px 60px'})) +
  box(140, 700, 1640, `<div class="a" style="display:flex;align-items:baseline;gap:40px"><span style="font-size:60px;font-weight:800;letter-spacing:-.03em">R.O.I</span><span class="num" style="font-size:150px">18 TO 24 MONTHS.</span></div>`)});

const roles = (name, label, icon, list, side, withTitle) => add(name, {blob: B.hubL, orb: O.a, photo: null, html:
  (withTitle ? box(140, 150, 1640, title('{Roles and Responsibilities:}', 60)) : '') +
  box(130, 330, 430, `<div class="a" style="height:430px;display:grid;place-items:center">${tile(icon, true)}</div>`) +
  box(130, 790, 430, `<div class="a" style="text-align:center;font-size:36px;font-weight:700">${fmt(label)}</div>`) +
  box(660, 330, 560, items(list.map((t) => [t]), {cols: 1, side: true, size: 30, gap: '34px'})) +
  box(1290, 330, 490, items(side, {cols: 1, side: true, size: 27, gap: '44px'}))});
roles('Neurosurgeon', '{Neurosurgeon:}', 'brain', ['Diagnosis and Surgical Intervention', 'Post-operative Care', 'Medical Treatment Planning', 'Referrals: Importance of physio', 'Progress Monitoring'],
  [['Promotion of physio through your marketing platform both online and offline.', 'mega'], ['Phase 01 investment', 'bolt'], ['Admin expenses management', 'gear']], true);
roles('Physiotherapist', '{Physiotherapist:}', 'person', ['Assessment and Evaluation', 'Rehabilitation Planning and protocol designing', 'Patient Education', 'Collaboration and Communication with patient doctor and relatives'],
  [['Admin management of physio department will be done under our system', 'gear'], ['Management and selection of physio team will be {ours.}', 'users'], ['Joint meetings can be conducted to achieve specific aim and goal of patient.', 'collab']]);

const E1 = [['6 IFT+ TENS AND STIMULATOR COMBINATION DEVICE', '8LAC'], ['SPINAL DECOMPRESSION', '8LAC'], ['TILT TABLE:2', '40K'], ['STANDING FRAME: 2', '20K'], ['TREADMILL WITH ROBOTICS', '4LAC'], ['VIRTUAL REHABE', '2 LAC']];
const E2 = [['CLASS FOUR LASER', '15LAC'], ['SUPER INDUCTIVE SYSTEM', '20LAC'], ['SH0Ck WAVE DIATHERMY', '4LAC'], ['MATRIX RHYTHM THERAPY', '5L'], ['HYDROTHERAPY', '20L'], ['SUSPENSION BED', '40K']];
const E3 = [['MOIST HEAT', '10K'], ['BALANCE AND POSTURAL STABILITY SYSTEM', '2L'], ['SMART BALL', '60K'], ['BICYCLE: 2', '1L'], ['SMART GLOVE', '2L']];
const E4 = [['OVERHEAD HARNESS SYSTEM', '50K'], ['PARALLEL BAR', '20K'], ['TRAMPOLINE', '5K'], ['SENSORY KIT', '1K']];
const m1 = Math.max(...[...E1, ...E2].map((r) => amt(r[1]))), m2 = Math.max(...[...E3, ...E4].map((r) => amt(r[1])));
add('Equipment PHASE 01', {blob: B.orbTRs, orb: O.c, photo: null, html:
  box(140, 150, 1640, title('{Equipment\'s:} *PHASE 01:*')) + box(140, 330, 760, bars(E1, m1)) + box(1020, 330, 760, bars(E2, m1))});
add('Equipment (2)', {blob: B.behindLandR, orb: O.d, photo: {at: P.landR, src: IMG('site-sis.png')}, html:
  box(140, 200, 820, bars([...E3, ...E4], m2))});
add('Basic equipments & budget', {theme: 'lime', blob: B.full, orb: O.none, photo: null, html:
  box(140, 170, 1640, `<div class="a" style="font-size:40px;font-weight:700;letter-spacing:-.02em">${fmt('{BASIC PHYSIO EQUIPMENTS FOR ASSESMENT AND TREATMENT} *1L*')}</div><div style="height:46px"></div>` +
    tags(['BALL', 'GONEOMETER', 'MUSCLE STRENGTH TESTER', 'STEPPER', 'PULLEYS', 'BALANCE BOARD', 'STAIR CASE', 'TOYS', 'WOODEN BLOCKS'], 30)) +
  box(140, 640, 1640, `<div class="a" style="font-size:44px;font-weight:700;letter-spacing:-.02em">PHASE 01 BUDGET:</div>`) +
  box(130, 710, 1640, num('1.10CR', 250))});

add('INFRASTRUCTURE AND FURNITURE', {blob: B.orbTRs, orb: O.c, photo: null, html:
  box(140, 150, 1640, title('{INFRASTRUCTURE AND FURNITURE:}', 58)) +
  box(140, 340, 380, `<div class="a">${tile('bed')}</div><div class="a" style="margin-top:36px;font-size:40px;font-weight:700">BEDS:</div>`) + box(130, 500, 400, num('15', 240)) +
  box(620, 340, 560, items([['FURNITURE', 'building'], ['TROLEYS', 'gear'], ['INTERIOR DESIGN: LIGHT PAINT', 'spark'], ['TABLES', 'clip'], ['FLOORING', 'wave']], {cols: 1, side: true, size: 28, gap: '26px'})) +
  box(1260, 340, 520, `<div class="a" style="font-size:40px;font-weight:700;margin-bottom:30px">${fmt('{BASICS}')}</div>` + tags(['CURTAIN', 'COMPUTER', 'CCTV', 'PRINTER', 'CHAIRS', 'WEIGHING MACHINE', 'BIOMETRY'], 26)) +
  box(1260, 790, 520, `<div class="a" style="display:flex;align-items:baseline;gap:26px"><span style="font-size:40px;font-weight:700">BUDGET:</span>${num('35LAK', 110)}</div>`)});

add('MONTHLY MAINTAINACE', {blob: B.wave, orb: O.d, photo: null, html:
  box(140, 150, 1640, title('{MONTHLY MAINTAINACE:}') + `<div style="height:70px"></div>` + items([['TEAM SALARY', 'users'], ['ELECTRIC BILL', 'bolt'], ['DEVICE MAINTAINANCE', 'gear'], ['ADMIN RELATED:', 'clip']], {cols: 4, size: 32})) +
  box(140, 560, 700, `<div class="a" style="font-size:44px;font-weight:700">TOTAL:</div>`) + box(130, 620, 700, num('2LAK', 200)) + box(1000, 470, 780, chart(780, 280))});

add('PHASE 2', {blob: B.behindR, orb: O.c, photo: {at: P.archR, src: IMG('st-back.jpg')}, html:
  box(140, 170, 900, title('{PHASE 2:}') + `<div style="height:64px"></div>` + items([
    ['Once phase 1 investment is recovered and admin management and clinical system is set by end of first year, and depending upon the patient’s recovery rate and ratio of number of patients per month we can step into {phase 2.}', 'calendar'],
    ['Phase 2 will be focusing on reaching to {larger population,} not only neuro and ortho patients but also non-medical individual {sports fitness}', 'users'],
  ], {cols: 1, side: true, size: 29, gap: '56px'}))});
add('PHASE 2 (2)', {blob: B.behindR2, orb: O.a, photo: {at: P.archR, src: IMG('st-dumbbell.jpg')}, html:
  box(140, 170, 900, title('{PHASE 2:}') + `<div style="height:64px"></div>` + items([
    ['We can focus on *geriatric, pediatric, OBG and Gynecology, musculoskeletal and sports departments.*', 'leaf'],
    ['We can think of collaborating few associations like geriatrics, OBG and sports.', 'collab'],
  ], {cols: 1, side: true, size: 32, gap: '64px'}))});

add('Phase 2 investment', {blob: B.circR, orb: O.c, photo: null, html:
  box(140, 220, 900, items([
    ['Regarding development in neuro we can add on more {advance modalities,} according to patient need', 'cpu'],
    ['Investment of phase 2 will not be as phase 01.', 'growth'],
    ['Investment can be done proportion to present day income.', 'calendar'],
  ], {cols: 1, side: true, size: 32, gap: '64px'})) +
  box(1190, 260, 560, donut([60, 40], 560, 70, `<div class="cnt" data-to="60-40" style="font-size:110px;font-weight:800;letter-spacing:-.05em">60-40</div>`))});
add('Partnership 60-40', {theme: 'lime', blob: B.full, orb: O.none, photo: null, html:
  box(140, 250, 1500, `<div class="a" style="font-size:58px;font-weight:600;letter-spacing:-.03em;line-height:1.22">${fmt('Arogyati is growing along with {wins,} by phase 02 Arogyati, have established a trust, good will and goal-oriented results, now we would like to know our working partnership of {60-40} *by when can we increase it?*')}</div>`)});

/* ---------------- build DOM ---------------- */
const stage = $('#stage'), wrap = $('#slides');
const blob = $('#blob'), orb = $('#blob2'), photo = $('#photo');
const imgs = [...photo.querySelectorAll('img')];
wrap.innerHTML = S.map((s, i) => `<section class="slide" data-i="${i}">${s.html}</section>`).join('');
const els = [...wrap.children];
els.forEach((el) => el.querySelectorAll('.a').forEach((a, i) => a.style.setProperty('--i', i)));
const N = S.length;
$('#tot').textContent = String(N).padStart(2, '0');
$('#pgt').textContent = String(N).padStart(2, '0');

function place(el, p, extra = {}) {
  el.style.left = p.x + 'px'; el.style.top = p.y + 'px'; el.style.width = p.w + 'px'; el.style.height = p.h + 'px';
  el.style.borderRadius = p.r; el.style.transform = `rotate(${p.rot || 0}deg) scale(${extra.s ?? 1})`; el.style.opacity = extra.o ?? (p.o ?? 1);
}
let lastPhoto = P.archR, front = 0, curSrc = '';
function setPhoto(ph) {
  if (!ph) { place(photo, lastPhoto, {o: 0, s: 0.86}); photo.classList.remove('bg'); return; }
  lastPhoto = ph.at; place(photo, ph.at);
  photo.classList.toggle('bg', !!ph.bg);
  if (ph.src !== curSrc) {
    curSrc = ph.src; front ^= 1;
    const a = imgs[front], b = imgs[front ^ 1];
    a.src = ph.src; a.classList.remove('show'); void a.offsetWidth; a.classList.add('show'); b.classList.remove('show');
  }
}

/* ---------------- sound ---------------- */
let sfxOn = true, musicOn = false;
const sfx = {};
['whoosh', 'pop', 'tick'].forEach((n) => { sfx[n] = new Audio(`assets/sfx/${n}.wav`); sfx[n].preload = 'auto'; });
const play = (n, v) => { if (!sfxOn) return; const a = sfx[n].cloneNode(); a.volume = v; a.play().catch(() => {}); };
const music = $('#music'); music.volume = 0.4;

/* ---------------- counters ---------------- */
function count(el) {
  const to = el.dataset.to, m = to.match(/^(\d+(?:\.\d+)?)(.*)$/);
  if (!m) return;
  const dec = (m[1].split('.')[1] || '').length, target = parseFloat(m[1]), t0 = performance.now() + 500, dur = 1400;
  (function tick(t) {
    const p = Math.min(1, Math.max(0, (t - t0) / dur)), e = 1 - Math.pow(1 - p, 3);
    el.textContent = p < 1 ? (target * e).toFixed(dec) + m[2] : to;
    if (p < 1) setTimeout(() => tick(performance.now()), 16);
  })(performance.now());
}

/* ---------------- navigation ---------------- */
let cur = -1;
function go(n, silent) {
  n = Math.max(0, Math.min(N - 1, n));
  if (n === cur) return;
  const prev = cur; cur = n;
  if (prev < 0) { stage.classList.add('noanim'); setTimeout(() => stage.classList.remove('noanim'), 60); }
  document.body.classList.toggle('back', n < prev);
  if (prev >= 0) {
    const o = els[prev]; o.classList.remove('on'); o.classList.add('out');
    setTimeout(() => o.classList.remove('out'), 650);
  }
  const s = S[n], el = els[n];
  document.body.classList.toggle('lime', s.theme === 'lime');
  place(blob, s.blob); place(orb, s.orb || O.none); setPhoto(s.photo);
  void el.offsetWidth; setTimeout(() => el.classList.add('on'), 30);
  el.querySelectorAll('.cnt').forEach(count);
  $('#cur').textContent = $('#pgc').textContent = String(n + 1).padStart(2, '0');
  $('#prog').style.width = ((n + 1) / N) * 100 + '%';
  history.replaceState(null, '', '#' + (n + 1));
  [...$('#ovg').children].forEach((c, i) => c.classList.toggle('cur', i === n));
  if (!silent) play('whoosh', 0.32);
}
const next = () => go(cur + 1), prev = () => go(cur - 1);

/* ---------------- scale to screen ---------------- */
function fit() { const k = Math.min(innerWidth / 1920, innerHeight / 1080); stage.style.transform = `translate(-50%,-50%) scale(${k})`; }
addEventListener('resize', fit); fit();

/* ---------------- controls ---------------- */
const ov = $('#ov');
$('#ovg').innerHTML = S.map((s, i) => `<div data-i="${i}"><b>${String(i + 1).padStart(2, '0')}</b><span>${s.name}</span></div>`).join('');
$('#ovg').addEventListener('click', (e) => { const d = e.target.closest('[data-i]'); if (d) { go(+d.dataset.i); toggleOv(false); } });
function toggleOv(v) { ov.classList.toggle('show', v ?? !ov.classList.contains('show')); $('#bOv').classList.toggle('on', ov.classList.contains('show')); }
function setSfx(v) { sfxOn = v; $('#bSnd').classList.toggle('off', !v); }
function setMusic(v) { musicOn = v; $('#bMusic').classList.toggle('off', !v); v ? music.play().catch(() => {}) : music.pause(); }
function fs() { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}); }
$('#bPrev').onclick = prev; $('#bNext').onclick = next; $('#bOv').onclick = () => toggleOv();
$('#bSnd').onclick = () => setSfx(!sfxOn); $('#bMusic').onclick = () => setMusic(!musicOn); $('#bFs').onclick = fs;
$('#eL').onclick = prev; $('#eR').onclick = next;
document.addEventListener('fullscreenchange', () => $('#bFs').classList.toggle('on', !!document.fullscreenElement));
addEventListener('keydown', (e) => {
  const k = e.key;
  if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); next(); }
  else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); prev(); }
  else if (k === 'Home') go(0); else if (k === 'End') go(N - 1);
  else if (k === 'f' || k === 'F') fs(); else if (k === 'g' || k === 'G' || k === 'o' || k === 'O') toggleOv();
  else if (k === 'm' || k === 'M') setMusic(!musicOn); else if (k === 's' || k === 'S') setSfx(!sfxOn);
  else if (k === 'Escape') toggleOv(false);
  wake();
});
let idle;
function wake() { document.body.classList.remove('idle'); clearTimeout(idle); idle = setTimeout(() => { if (!ov.classList.contains('show')) document.body.classList.add('idle'); }, 2600); }
addEventListener('mousemove', wake); wake();
setTimeout(() => $('#toast').classList.add('gone'), 4800);

setSfx(!/mute/.test(location.search)); setMusic(false);
const h = parseInt(location.hash.slice(1));
document.fonts.ready.then(() => go(isNaN(h) ? 0 : h - 1, true));
})();
