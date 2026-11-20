# builds /home/new-concept/ from the live homepage: swaps the hero + 3D story for the x-ray lens hero and the
# "pain to relief" stage, and drops the 3D loader. Everything else (sections, nav, footer) stays identical.
import io, re, math, os, json
R = 'C:/Users/offic/Desktop/arogyati-pitchdeck/home/'
h = io.open(R + 'index.html', encoding='utf8').read()
IMG = '/home/assets/img/nc/'
ARROW = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
NS = 'vector-effect="non-scaling-stroke"'

def ss(n, ws):
    return f'src="{IMG}{n}-{ws[0]}.webp" srcset="' + ', '.join(f'{IMG}{n}-{w}.webp {w}w' for w in sorted(ws)) + '"'

# ---------------- HERO ----------------
spots = [('.505', '.50', 'C5 – C7', 'Neck Pain'), ('.245', '.60', 'Shoulder', 'Frozen Shoulder'), ('.60', '.755', 'T2 – T6', 'Upper Back Pain')]
hs = ''.join(f'<div class="nch__hs" data-x="{x}" data-y="{y}"><u></u><i></i><b><small>{s}</small>{n}</b></div>' for x, y, s, n in spots)
ticks = ''.join(f'<line x1="{100+math.cos(a)*44:.2f}" y1="{100+math.sin(a)*44:.2f}" x2="{100+math.cos(a)*(47 if k%6 else 50):.2f}" y2="{100+math.sin(a)*(47 if k%6 else 50):.2f}"/>' for k in range(36) for a in [k*math.pi/18])
lens = ('<div class="nch__lens" aria-hidden="true"><svg viewBox="0 0 200 200" fill="none">'
        '<circle cx="100" cy="100" r="43" stroke="rgba(255,255,255,.95)" stroke-width="1.4" vector-effect="non-scaling-stroke"/>'
        f'<g class="lt" stroke="#9EE6FF" stroke-width="1.2" vector-effect="non-scaling-stroke">{ticks}</g>'
        '<path d="M100 52v8M100 140v8M52 100h8M140 100h8" stroke="#fff" stroke-width="1.4" vector-effect="non-scaling-stroke"/>'
        '</svg><span class="nch__lensl">Scanning</span></div>')
hero = f'''<section class="nch" id="top">
  <div class="nch__pin">
    <div class="nch__media">
      <img class="nch__ph" {ss('hero',[1000,1800])} sizes="100vw" width="1800" height="1200" alt="A woman holding the back of her neck in pain" fetchpriority="high">
      <img class="nch__xr" {ss('hero-xr',[1000,1800])} sizes="100vw" width="1800" height="1200" alt="" aria-hidden="true">
      <div class="nch__veil" aria-hidden="true"></div>
      {hs}
      {lens}
    </div>
    <div class="nch__copy">
      <span class="nch__k">First Big Private Clinic In Kolhapur</span>
      <h1 class="nch__h1" data-nc-title>Working for <em>wellness.</em></h1>
      <p class="nch__sub" data-nc-in>Well Equipped Physiotherapy Center With Ultra Modern German Technologies. Working For Holistic Approach.</p>
      <div class="nch__ctas" data-nc-in>
        <a class="hx-pill hx-pill--dark" href="#contact" data-az-magnetic>Book appointment<span class="hx-pill__ic">{ARROW}</span></a>
        <a class="nch__how" href="#relief">See how we treat pain</a>
      </div>
    </div>
    <div class="nch__facts" data-nc-in><span><b>28</b>years in this field</span><span><b>12+8</b>physios &amp; assistants</span></div>
    <div class="nch__hint" data-nc-in><i></i>Move the lens to look beneath the pain</div>
    <div class="nch__dark" aria-hidden="true"></div>
  </div>
</section>
'''

# ---------------- STAGE overlays (drawn in each x-ray's own pixel space) ----------------
def common(i, fx, fy):
    return (f'<defs><radialGradient id="nchg{i}"><stop offset="0" stop-color="currentColor" stop-opacity=".62"/><stop offset=".45" stop-color="currentColor" stop-opacity=".22"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></radialGradient></defs>'
            f'<g class="k-at" transform="translate({fx} {fy})">'
            f'<circle class="k-heat" r="150" fill="url(#nchg{i})"/>'
            f'<circle class="k-ring" r="22" fill="none" stroke="currentColor" stroke-width="2" {NS}/><circle class="k-ring k-ring2" r="22" fill="none" stroke="currentColor" stroke-width="2" {NS}/>'
            f'<circle class="k-core" r="6" fill="currentColor"/>'
            f'<g class="k-ret" fill="none" stroke="#9EE6FF" stroke-width="1.3"><circle class="k-retc" r="66" {NS}/>'
            f'<g class="k-spin"><circle r="80" stroke-dasharray="2 10" opacity=".7" {NS}/><path d="M0 -92v14M0 78v14M-92 0h14M78 0h14" {NS}/></g></g></g>')

def neck():
    W, H = 1100, 1656
    pts = [(.585, .35), (.605, .40), (.62, .445), (.635, .49), (.655, .535), (.68, .575), (.705, .615)]
    P = [(x * W, y * H) for x, y in pts]
    vs = ''.join(f'<g class="k-v"><rect x="-36" y="-15" width="72" height="30" rx="11" fill="rgba(158,230,255,.10)" stroke="#9EE6FF" stroke-width="1.4" {NS}/><text x="52" y="6" fill="#9EE6FF" font-size="20" font-weight="700" font-family="Plus Jakarta Sans,sans-serif">C{k+1}</text></g>' for k in range(7))
    # muscle flow lines either side of the column
    (x0, y0), (x1, y1) = P[0], P[-1]
    dx, dy = x1 - x0, y1 - y0; L = math.hypot(dx, dy); nx, ny = -dy / L, dx / L
    flows = ''
    for off in (-120, -85, 85, 120):
        a = (x0 + nx * off, y0 + ny * off); b = (x1 + nx * off, y1 + ny * off)
        c1 = (a[0] + dx * .33 + nx * off * .25, a[1] + dy * .33 + ny * off * .25); c2 = (a[0] + dx * .66 + nx * off * .25, a[1] + dy * .66 + ny * off * .25)
        flows += f'<path class="k-flow" d="M{a[0]:.0f} {a[1]:.0f}C{c1[0]:.0f} {c1[1]:.0f} {c2[0]:.0f} {c2[1]:.0f} {b[0]:.0f} {b[1]:.0f}" fill="none" stroke="#C9E265" stroke-width="2.2" stroke-linecap="round" {NS}/>'
    line = 'M' + ' L'.join(f'{x:.0f} {y:.0f}' for x, y in P)
    return (f'<g class="k-tr">{flows}<path class="k-chain" fill="none" stroke="rgba(158,230,255,.55)" stroke-width="1.3" {NS}/>{vs}</g>'
            f'<g class="k-mv"><path class="k-line" d="{line}" fill="none" stroke="#C9E265" stroke-width="3" stroke-linecap="round" {NS}/></g>'), {'pts': [[round(x), round(y)] for x, y in P], 'n': [round(nx, 4), round(ny, 4)]}

def shoulder():
    W, H = 1300, 1286; hx, hy = .635 * W, .43 * H
    rings = ''.join(f'<circle class="k-f" cx="{hx:.0f}" cy="{hy:.0f}" r="80" fill="none" stroke="#9EE6FF" stroke-width="1.6" {NS}/>' for _ in range(4))
    ells = ''.join(f'<g transform="rotate({a} {hx:.0f} {hy:.0f})"><ellipse class="k-spin" cx="{hx:.0f}" cy="{hy:.0f}" rx="330" ry="120" fill="none" stroke="rgba(201,226,101,.55)" stroke-width="1.2" stroke-dasharray="3 9" {NS}/></g>' for a in (-35, 0, 35))
    coil = (f'<g transform="translate(1085 770) rotate(-42)"><rect x="-80" y="-30" width="160" height="60" rx="22" fill="rgba(158,230,255,.12)" stroke="#9EE6FF" stroke-width="1.6" {NS}/>'
            + ''.join(f'<line x1="{-50+k*20}" y1="-14" x2="{-50+k*20}" y2="14" stroke="#9EE6FF" stroke-width="1.2" {NS}/>' for k in range(6)) + '</g>')
    beam = f'<path class="k-fl" d="M1050 735 Q 1000 610 {hx+45:.0f} {hy+45:.0f}" fill="none" stroke="#9EE6FF" stroke-width="2" stroke-dasharray="6 10" {NS}/>'
    mv = (f'<path class="k-arc" fill="none" stroke="#C9E265" stroke-width="3" stroke-linecap="round" {NS}/>'
          f'<line class="k-arm" x1="{hx:.0f}" y1="{hy:.0f}" stroke="rgba(201,226,101,.7)" stroke-width="2" stroke-dasharray="4 8" {NS}/><circle class="k-dot" r="12" fill="#C9E265"/>')
    return f'<g class="k-tr">{ells}{rings}{beam}{coil}</g><g class="k-mv">{mv}</g>', {'h': [round(hx), round(hy)], 'R': 300}

def back():
    W, H = 1800, 1012; cx = 900
    marks = ''.join(f'<g class="k-lv"><line x1="{cx-70}" y1="{y}" x2="{cx-44}" y2="{y}" stroke="#9EE6FF" stroke-width="1.4" {NS}/><text x="{cx-104}" y="{y+8}" fill="#9EE6FF" font-size="15" font-weight="700" font-family="Plus Jakarta Sans,sans-serif">{n}</text></g>' for n, y in (('L3', 118), ('L4', 196), ('L5', 276)))
    return (f'<g class="k-tr">{marks}<path class="k-w2" fill="none" stroke="rgba(158,230,255,.35)" stroke-width="1.4" {NS}/><path class="k-w" fill="none" stroke="#9EE6FF" stroke-width="2.4" stroke-linecap="round" {NS}/></g>'
            f'<g class="k-mv"><path class="k-line" d="M{cx} 20 C {cx-6} 140 {cx+6} 260 {cx} 430" fill="none" stroke="#C9E265" stroke-width="3" stroke-linecap="round" {NS}/>'
            f'<circle class="k-relief" cx="{cx}" cy="273" r="60" fill="none" stroke="#C9E265" stroke-width="2" {NS}/></g>'), {'y': 236, 'x0': 560, 'x1': 1240}

def knee():
    bone = f'fill="url(#kbone)" stroke="#E6F5FF" stroke-width="1.6" {NS}'
    glow = f'fill="none" stroke="rgba(158,214,255,.18)" stroke-width="9" {NS}'
    femur = 'M430,0 C428,250 420,380 395,470 C370,540 338,560 344,600 C350,642 412,652 470,632 C484,612 516,612 530,632 C588,652 650,642 656,600 C662,560 630,540 605,470 C580,380 572,250 570,0 Z'
    tibia = 'M350,672 C352,652 420,650 480,657 C494,662 506,662 520,657 C580,650 648,652 650,672 C652,704 620,734 590,774 C575,804 572,904 572,1250 L438,1250 C438,904 432,804 415,774 C385,734 348,704 350,672 Z'
    fib = 'M642,738 C662,728 690,738 692,762 C694,787 676,802 668,822 C664,902 664,1102 666,1250 L644,1250 C644,1102 644,902 646,822 C640,802 630,762 642,738 Z'
    leg = 'M250,0 C260,300 290,500 300,640 C306,760 330,900 360,1250 L660,1250 C690,900 712,760 716,640 C722,500 740,300 750,0 Z'
    cells = [(430, 600), (575, 610), (470, 700), (540, 690), (395, 655), (610, 662), (500, 590), (455, 650), (548, 640)]
    cs = ''.join(f'<circle class="k-cell" cx="{x}" cy="{y}" r="{10 + (k % 3) * 3}" fill="rgba(255,120,90,.15)" stroke="#FF8A6A" stroke-width="1.4" {NS}/>' for k, (x, y) in enumerate(cells))
    xr = (f'<g class="k-xr"><defs><linearGradient id="kbone" x1="0" x2="1"><stop offset="0" stop-color="#7FA6D2" stop-opacity=".55"/><stop offset=".5" stop-color="#DCEEFF" stop-opacity=".85"/><stop offset="1" stop-color="#7FA6D2" stop-opacity=".55"/></linearGradient>'
          f'<radialGradient id="kbg" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#0C1E33"/><stop offset="1" stop-color="#02060A"/></radialGradient>'
          f'<linearGradient id="kleg" x1="0" x2="1"><stop offset="0" stop-color="#5E88B8" stop-opacity="0"/><stop offset=".2" stop-color="#5E88B8" stop-opacity=".22"/><stop offset=".8" stop-color="#5E88B8" stop-opacity=".22"/><stop offset="1" stop-color="#5E88B8" stop-opacity="0"/></linearGradient>'
          f'<linearGradient id="kbeam" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF5A4A" stop-opacity=".0"/><stop offset=".4" stop-color="#FF5A4A" stop-opacity=".55"/><stop offset="1" stop-color="#FFB199" stop-opacity=".95"/></linearGradient></defs>'
          f'<rect x="-600" y="-600" width="2200" height="2450" fill="url(#kbg)"/><path d="{leg}" fill="url(#kleg)"/>'
          f'<path d="{femur}" {glow}/><path d="{tibia}" {glow}/><path d="{fib}" {glow}/>'
          f'<path d="{femur}" {bone}/><path d="{fib}" {bone}/><path d="{tibia}" {bone}/>'
          f'<ellipse cx="500" cy="548" rx="68" ry="84" fill="rgba(220,238,255,.16)" stroke="rgba(230,245,255,.6)" stroke-width="1.2" {NS}/>'
          f'<path d="M470 520 C 480 470 520 470 530 520" fill="none" stroke="rgba(230,245,255,.35)" stroke-width="1" {NS}/></g>')
    tr = (f'<g class="k-tr"><polygon class="k-beam" points="868,104 900,132 508,652 492,636" fill="url(#kbeam)"/>'
          f'<line x1="884" y1="118" x2="500" y2="644" stroke="#FFD9CF" stroke-width="1.4" {NS}/>'
          + ''.join('<circle class="k-ph" r="6" fill="#FFD0C2"/>' for _ in range(7)) + cs +
          f'<g transform="translate(884 118) rotate(53)"><rect x="-26" y="-60" width="52" height="96" rx="16" fill="rgba(255,138,106,.14)" stroke="#FF8A6A" stroke-width="1.6" {NS}/></g></g>')
    mv = f'<g class="k-mv"><path class="k-arc" fill="none" stroke="#C9E265" stroke-width="3" stroke-linecap="round" {NS}/><circle class="k-dot" r="12" fill="#C9E265"/></g>'
    return xr, tr + mv, {}

N_, N_d = neck(); S_, S_d = shoulder(); B_, B_d = back(); K_xr, K_ov, K_d = knee()
CH = [
  dict(id='neck', area='Neck', h='Neck <em>pain.</em>', tag='Neck Pain', rx='Osteopathy', p='Physiotherapist realign the body by moving, stretching and massaging a persons muscle &amp; joints.', f='FOMT', u='Fellowship', hud='Cervical spine · C1–C7',
       ph=('neck', [640, 1100], 1100, 1650, .47, .63), xr=('neck-xr', [640, 1100], 1100, 1656, .62, .52), T=[.5, .5], ov=N_, d=N_d, alt='A woman holding the back of her neck'),
  dict(id='shoulder', area='Shoulder', h='Frozen <em>shoulder.</em>', tag='Frozen Shoulder', rx='Super Inductive System', p='It gives the effect of a strong pulsed electromagnetic field in human tissue. Triggers strong muscle contractions &amp; contributes to pain management.', f='0.85', u='Tesla intensity', hud='Glenohumeral joint',
       ph=('shoulder', [820, 1500], 1500, 1050, .63, .68), xr=('shoulder-xr', [720, 1300], 1300, 1286, .635, .43), T=[.54, .52], ov=S_, d=S_d, alt='A man holding his painful shoulder'),
  dict(id='back', area='Lower back', h='Lower back <em>pain.</em>', tag='Lower Back Pain', rx='Matrix Rhythm Therapy', p='A specially developed resonator produces vibration between 8 &amp; 12 Hz, equal &amp; similar to the normal cells in human body.', f='8–12', u='Hz resonance', hud='Lumbar spine · L3–L5',
       ph=('back', [820, 1500], 1500, 1000, .55, .66), xr=('back-xr', [1000, 1800], 1800, 1012, .5, .27), T=[.5, .36], ov=B_, d=B_d, alt='A person pressing both hands into their lower back'),
  dict(id='knee', area='Knee', h='Knee <em>pain.</em>', tag='Knee Pain', rx='Class IV Laser', p='Non-invasive use of laser energy to generate a photochemical response in damaged/dysfunctional tissue. Penetrates deep into the tissue &amp; stimulates healing at a cellular level.', f='IV', u='Class laser', hud='Knee joint · tibiofemoral',
       ph=('knee', [820, 1500], 1500, 1000, .45, .72), xr=(None, None, 1000, 1250, .5, .52), T=[.48, .54], ov=K_ov, d=K_d, alt='A woman resting her hand on a painful knee'),
]
texts = ''.join(f'''<article class="ncs-t" data-i="{i}"><span class="ncs-t__area">{i+1:02d} · {c["area"]}</span><h2 class="ncs-t__h">{c["h"]}</h2>
        <div class="ncs-t__rx"><span>How we treat it</span><b>{c["rx"]}</b><p>{c["p"]}</p></div></article>''' for i, c in enumerate(CH))
wins = ''
for i, c in enumerate(CH):
    pn, pw, *_ = c['ph']; xn, xw, W, H, fx, fy = c['xr']
    xrimg = (f'<img class="ncs-c__xr" {ss(xn, xw)} sizes="(max-width:899px) 100vw, 60vw" alt="" aria-hidden="true" loading="lazy">' if xn
             else f'<svg class="ncs-c__xr" viewBox="0 0 {W} {H}" preserveAspectRatio="none" aria-hidden="true">{K_xr}</svg>')
    inner = ''
    wins += (f'<div class="ncs-c" data-i="{i}"><img class="ncs-c__ph" {ss(pn, pw)} sizes="(max-width:899px) 100vw, 60vw" alt="{c["alt"]}" loading="lazy">'
             f'<div class="ncs-c__pl">{xrimg}<svg class="ncs-c__ov" viewBox="0 0 {W} {H}" preserveAspectRatio="none" aria-hidden="true">'
             + (f'<g class="ncs-c__xr">{inner}</g>' if inner else '') + common(i, W * fx, H * fy) + c['ov'] + '</svg></div></div>')
data = [dict(id=c['id'], tag=c['tag'], f=c['f'], u=c['u'], hud=c['hud'], T=c['T'], ph=list(c['ph'][2:]), xr=list(c['xr'][2:]), d=c['d']) for c in CH]
phases = ''.join(f'<li><b>{k+1:02d}</b>{a}<span>&nbsp;{b}</span><i></i></li>' for k, (a, b) in enumerate([('Locate', 'the pain'), ('Scan', 'beneath it'), ('Treat', 'at the source'), ('Move', 'again')]))
nav = ''.join(f'<button type="button" data-go="{i}">{c["area"]}<i></i></button>' for i, c in enumerate(CH))
stage = f'''
<!-- PAIN TO RELIEF: one pinned stage, four places pain lives; each one is located, scanned, treated, then moves again -->
<section class="ncs" id="relief" aria-label="How we treat pain">
  <div class="ncs__pin">
    <div class="ncs__side">
      <div class="ncs__top"><span>From pain to relief</span><span><b data-ncs-i>01</b> / 04</span></div>
      <div class="ncs__texts">{texts}</div>
      <ol class="ncs__phases">{phases}</ol>
    </div>
    <div class="ncs__win">
      {wins}
      <i class="ncs__scan" aria-hidden="true"></i>
      <div class="ncs__tag" aria-hidden="true"><svg viewBox="0 0 64 56" fill="none"><path d="M2 54 L30 14 H64" stroke="currentColor" stroke-width="1.4"/><circle cx="2" cy="54" r="2.5" fill="currentColor"/></svg><div><b data-ncs-tag>Neck Pain</b><span data-ncs-st>Pain located</span></div></div>
      <div class="ncs__hud" aria-hidden="true"><span>Arogyati · <em data-ncs-hud>Scan</em></span><span class="ncs__mod"><b data-ncs-f>FOMT</b><span data-ncs-u>Fellowship</span></span></div>
      <div class="ncs__vas" aria-hidden="true"><b data-ncs-v>8</b><div><small>Pain score</small><div class="ncs__bars">{'<i></i>' * 10}</div></div></div>
      <div class="ncs__nav">{nav}</div>
    </div>
  </div>
  <script type="application/json" id="ncs-data">{json.dumps(data, separators=(',', ':'))}</script>
</section>
'''

a = h.index('<section class="hx"'); b = h.index('<section class="rx"')
out = h[:a] + hero + stage + '\n<!-- RAIL SECTION -->\n' + h[b:]
m3 = re.search(r'<script>addEventListener\("load",function\(\)\{var go=function\(\)\{import\("/home/js/m3d\.js[^<]*</script>', out)
assert m3, 'm3d loader'; out = out.replace(m3.group(0), '')
out = out.replace('<link rel="stylesheet" href="/home/css/home.css?v=132">', '<link rel="stylesheet" href="/home/css/home.css?v=132">\n<link rel="stylesheet" href="/home/css/nc.css?v=1">', 1)
out = out.replace('<script src="/home/js/home.js?v=81" defer></script>', '<script src="/home/js/home.js?v=81" defer></script>\n<script src="/home/vendor/DrawSVGPlugin.min.js" defer></script>\n<script src="/home/js/nc.js?v=1" defer></script>', 1)
assert 'nc.js' in out and 'nc.css' in out
out = out.replace('<link rel="canonical" href="https://arogyati-chi.vercel.app/home">', '<link rel="canonical" href="https://arogyati-chi.vercel.app/home">\n<meta name="robots" content="noindex">', 1)
# preload hero image (not the old one)
out = re.sub(r'<link rel="preload"[^>]*(hero-|model-mid)[^>]*>\n?', '', out)
out = out.replace('<link rel="preload" href="/home/assets/fonts/InstrumentSerif.woff2"', '<link rel="preload" as="image" href="/home/assets/img/nc/hero-1800.webp" type="image/webp" imagesrcset="/home/assets/img/nc/hero-1000.webp 1000w, /home/assets/img/nc/hero-1800.webp 1800w" imagesizes="100vw" fetchpriority="high">\n<link rel="preload" href="/home/assets/fonts/InstrumentSerif.woff2"', 1)
out = out.replace('<title>', '<title>New concept · ', 1)
os.makedirs(R + 'new-concept', exist_ok=True)
io.open(R + 'new-concept/index.html', 'w', encoding='utf8').write(out)
print('ok', len(out))
