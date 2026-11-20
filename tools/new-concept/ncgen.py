# builds /home/new-concept/ from the live homepage: swaps the hero + 3D story for the lens hero and the
# "pain to relief" stage (site theme: light canvas, Jakarta two-tone type, white cards/pills), drops the 3D loader.
# Run:  python tools/new-concept/ncgen.py   (images: tools/new-concept/ncimg.py)
import io, re, math, os, json
R = 'C:/Users/offic/Desktop/arogyati-pitchdeck/home/'
h = io.open(R + 'index.html', encoding='utf8').read()
IMG = '/home/assets/img/nc/'
NS = 'vector-effect="non-scaling-stroke"'
WL = 'rgba(255,255,255,.92)'      # line white
ACC = '#CFE98F'                   # relief accent (the site's lime, softened for x-ray)
ARROW = re.search(r'<span class="hx-pill__ic">(<svg.*?</svg>)</span>', h, re.S).group(1)

def ss(n, ws):
    return f'src="{IMG}{n}-{ws[0]}.webp" srcset="' + ', '.join(f'{IMG}{n}-{w}.webp {w}w' for w in sorted(ws)) + '"'

# ---------------- HERO ----------------
spots = [('.505', '.50', 'Neck pain'), ('.245', '.60', 'Frozen shoulder'), ('.60', '.755', 'Upper back pain')]
hs = ''.join(f'<div class="nch__hs" data-x="{x}" data-y="{y}"><i></i><b><em>{n}</em></b></div>' for x, y, n in spots)
hero = f'''<section class="nch" id="top">
  <div class="nch__pin">
    <div class="nch__grid az-wrap">
      <div class="nch__copy">
        <span class="rx__label" data-nc-in>First Big Private Clinic In Kolhapur</span>
        <h1 class="nch__h1" data-nc-title>Working for wellness. <span class="nch__g">First time in Kolhapur.</span></h1>
        <p class="nch__sub" data-nc-in>Well Equipped Physiotherapy Center With Ultra Modern German Technologies. Working For Holistic Approach.</p>
        <div class="nch__ctas" data-nc-in>
          <a class="hx-pill hx-pill--dark" href="#contact" data-az-magnetic>Book appointment<span class="hx-pill__ic">{ARROW}</span></a>
          <a class="hx-pill hx-pill--white" href="#relief" data-az-magnetic>How we treat pain<span class="hx-pill__ic">{ARROW}</span></a>
        </div>
        <div class="nch__facts" data-nc-in><div><b>28</b><span>Years of experience in this field</span></div><div><span>Physios &amp; assistant physios</span><b>12+8</b></div></div>
      </div>
      <div class="nch__card" data-nc-card>
        <div class="nch__media">
          <img class="nch__ph" {ss('hero',[1000,1800])} sizes="(max-width:899px) 100vw, 56vw" width="1800" height="1200" alt="A woman holding the back of her neck in pain" fetchpriority="high">
          <img class="nch__xr" {ss('hero-xr',[1000,1800])} sizes="(max-width:899px) 100vw, 56vw" width="1800" height="1200" alt="" aria-hidden="true">
          {hs}
          <div class="nch__lens" aria-hidden="true"></div>
        </div>
        <span class="nch__hint" data-nc-in><i></i>Move over the photo to look beneath the pain</span>
      </div>
    </div>
  </div>
</section>
'''

# ---------------- STAGE overlays (drawn in each x-ray's own pixel space) ----------------
def common(i, fx, fy):
    return (f'<defs><radialGradient id="nchg{i}"><stop offset="0" stop-color="currentColor" stop-opacity=".5"/><stop offset=".5" stop-color="currentColor" stop-opacity=".16"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></radialGradient></defs>'
            f'<g class="k-at" transform="translate({fx} {fy})">'
            f'<circle class="k-heat" r="150" fill="url(#nchg{i})"/>'
            f'<circle class="k-ring" r="20" fill="none" stroke="{WL}" stroke-width="1" {NS}/>'
            f'<circle class="k-retc" r="58" fill="none" stroke="{WL}" stroke-width="1.2" {NS}/>'
            f'<circle r="7" fill="#fff"/><circle class="k-core" r="3.5" fill="currentColor"/></g>')

def neck():
    W, H = 1100, 1656
    pts = [(.585, .35), (.605, .40), (.62, .445), (.635, .49), (.655, .535), (.68, .575), (.705, .615)]
    P = [(x * W, y * H) for x, y in pts]
    vs = ''.join(f'<g class="k-v"><rect x="-34" y="-14" width="68" height="28" rx="12" fill="rgba(255,255,255,.07)" stroke="{WL}" stroke-width="1.1" {NS}/><text x="50" y="5" fill="rgba(255,255,255,.75)" font-size="15" font-weight="500" font-family="Plus Jakarta Sans,sans-serif">C{k+1}</text></g>' for k in range(7))
    (x0, y0), (x1, y1) = P[0], P[-1]
    dx, dy = x1 - x0, y1 - y0; L = math.hypot(dx, dy); nx, ny = -dy / L, dx / L
    flows = ''
    for off in (-115, 115):
        a = (x0 + nx * off, y0 + ny * off); b = (x1 + nx * off, y1 + ny * off)
        c1 = (a[0] + dx * .33 + nx * off * .2, a[1] + dy * .33 + ny * off * .2); c2 = (a[0] + dx * .66 + nx * off * .2, a[1] + dy * .66 + ny * off * .2)
        flows += f'<path class="k-flow" d="M{a[0]:.0f} {a[1]:.0f}C{c1[0]:.0f} {c1[1]:.0f} {c2[0]:.0f} {c2[1]:.0f} {b[0]:.0f} {b[1]:.0f}" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1" stroke-linecap="round" {NS}/>'
    line = 'M' + ' L'.join(f'{x:.0f} {y:.0f}' for x, y in P)
    return (f'<g class="k-tr">{flows}<path class="k-chain" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1" {NS}/>{vs}</g>'
            f'<g class="k-mv"><path class="k-line" d="{line}" fill="none" stroke="{ACC}" stroke-width="2" stroke-linecap="round" {NS}/></g>'), {'pts': [[round(x), round(y)] for x, y in P], 'n': [round(nx, 4), round(ny, 4)]}

def shoulder():
    W, H = 1300, 1286; hx, hy = .635 * W, .43 * H
    rings = ''.join(f'<circle class="k-f" cx="{hx:.0f}" cy="{hy:.0f}" r="80" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="1" {NS}/>' for _ in range(3))
    mv = (f'<path class="k-arc" fill="none" stroke="{ACC}" stroke-width="2" stroke-linecap="round" {NS}/>'
          f'<line class="k-arm" x1="{hx:.0f}" y1="{hy:.0f}" stroke="rgba(255,255,255,.55)" stroke-width="1" stroke-dasharray="3 7" {NS}/><circle class="k-dot" r="9" fill="#fff"/>')
    return f'<g class="k-tr">{rings}</g><g class="k-mv">{mv}</g>', {'h': [round(hx), round(hy)], 'R': 300}

def back():
    cx = 900
    marks = ''.join(f'<g class="k-lv"><line x1="{cx-66}" y1="{y}" x2="{cx-44}" y2="{y}" stroke="{WL}" stroke-width="1" {NS}/><text x="{cx-98}" y="{y+5}" fill="rgba(255,255,255,.75)" font-size="14" font-weight="500" font-family="Plus Jakarta Sans,sans-serif">{n}</text></g>' for n, y in (('L3', 118), ('L4', 196), ('L5', 276)))
    return (f'<g class="k-tr">{marks}<path class="k-w2" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1" {NS}/><path class="k-w" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" {NS}/></g>'
            f'<g class="k-mv"><path class="k-line" d="M{cx} 20 C {cx-6} 140 {cx+6} 260 {cx} 430" fill="none" stroke="{ACC}" stroke-width="2" stroke-linecap="round" {NS}/>'
            f'<circle class="k-relief" cx="{cx}" cy="273" r="60" fill="none" stroke="{ACC}" stroke-width="1.2" {NS}/></g>'), {'y': 236, 'x0': 560, 'x1': 1240}

def knee():
    bone = f'fill="url(#kbone)" stroke="rgba(236,247,255,.9)" stroke-width="1.2" {NS}'
    femur = 'M430,0 C428,250 420,380 395,470 C370,540 338,560 344,600 C350,642 412,652 470,632 C484,612 516,612 530,632 C588,652 650,642 656,600 C662,560 630,540 605,470 C580,380 572,250 570,0 Z'
    tibia = 'M350,672 C352,652 420,650 480,657 C494,662 506,662 520,657 C580,650 648,652 650,672 C652,704 620,734 590,774 C575,804 572,904 572,1250 L438,1250 C438,904 432,804 415,774 C385,734 348,704 350,672 Z'
    fib = 'M642,738 C662,728 690,738 692,762 C694,787 676,802 668,822 C664,902 664,1102 666,1250 L644,1250 C644,1102 644,902 646,822 C640,802 630,762 642,738 Z'
    leg = 'M250,0 C260,300 290,500 300,640 C306,760 330,900 360,1250 L660,1250 C690,900 712,760 716,640 C722,500 740,300 750,0 Z'
    cells = [(430, 600), (575, 610), (470, 700), (540, 690), (395, 655), (610, 662), (500, 590)]
    cs = ''.join(f'<circle class="k-cell" cx="{x}" cy="{y}" r="{9 + (k % 3) * 3}" fill="none" stroke="#fff" stroke-width="1" {NS}/>' for k, (x, y) in enumerate(cells))
    xr = (f'<defs><linearGradient id="kbone" x1="0" x2="1"><stop offset="0" stop-color="#7FA6D2" stop-opacity=".5"/><stop offset=".5" stop-color="#DCEEFF" stop-opacity=".82"/><stop offset="1" stop-color="#7FA6D2" stop-opacity=".5"/></linearGradient>'
          f'<radialGradient id="kbg" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#1A3350"/><stop offset="1" stop-color="#0B1520"/></radialGradient>'
          f'<linearGradient id="kleg" x1="0" x2="1"><stop offset="0" stop-color="#6F96C4" stop-opacity="0"/><stop offset=".22" stop-color="#6F96C4" stop-opacity=".2"/><stop offset=".78" stop-color="#6F96C4" stop-opacity=".2"/><stop offset="1" stop-color="#6F96C4" stop-opacity="0"/></linearGradient>'
          f'<linearGradient id="kbeam" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB4A2" stop-opacity="0"/><stop offset="1" stop-color="#FFD3C7" stop-opacity=".7"/></linearGradient></defs>'
          f'<rect x="-600" y="-600" width="2200" height="2450" fill="url(#kbg)"/><path d="{leg}" fill="url(#kleg)"/>'
          f'<path d="{femur}" {bone}/><path d="{fib}" {bone}/><path d="{tibia}" {bone}/>'
          f'<ellipse cx="500" cy="548" rx="68" ry="84" fill="rgba(220,238,255,.14)" stroke="rgba(230,245,255,.5)" stroke-width="1" {NS}/>')
    tr = (f'<g class="k-tr"><polygon class="k-beam" points="872,108 896,128 506,650 494,638" fill="url(#kbeam)"/>'
          f'<line x1="884" y1="118" x2="500" y2="644" stroke="rgba(255,236,230,.85)" stroke-width="1" {NS}/>'
          + ''.join('<circle class="k-ph" r="4" fill="#fff"/>' for _ in range(5)) + cs + '</g>')
    mv = f'<g class="k-mv"><path class="k-arc" fill="none" stroke="{ACC}" stroke-width="2" stroke-linecap="round" {NS}/><circle class="k-dot" r="9" fill="#fff"/></g>'
    return xr, tr + mv, {}

N_, N_d = neck(); S_, S_d = shoulder(); B_, B_d = back(); K_xr, K_ov, K_d = knee()
CH = [
  dict(id='neck', area='Neck Pain', h='Neck pain, <span>realigned by hand.</span>', rx='Osteopathy', p='Physiotherapist realign the body by moving, stretching and massaging a persons muscle &amp; joints.', f='FOMT', u='Fellowship in Osteopathy',
       ph=('neck', [640, 1100], 1100, 1650, .47, .63), xr=('neck-xr', [640, 1100], 1100, 1656, .62, .52), T=[.5, .5], ov=N_, d=N_d, alt='A woman holding the back of her neck', tint='#E4EEDD'),
  dict(id='shoulder', area='Frozen Shoulder', h='Frozen shoulder, <span>moving again.</span>', rx='Super Inductive System', p='It gives the effect of a strong pulsed electromagnetic field in human tissue. Triggers strong muscle contractions &amp; contributes to pain management.', f='0.85', u='Tesla intensity',
       ph=('shoulder', [820, 1500], 1500, 1050, .63, .68), xr=('shoulder-xr', [720, 1300], 1300, 1286, .635, .43), T=[.52, .52], ov=S_, d=S_d, alt='A man holding his painful shoulder', tint='#DFEAF6'),
  dict(id='back', area='Lower Back Pain', h='Lower back pain, <span>back in rhythm.</span>', rx='Matrix Rhythm Therapy', p='A specially developed resonator produces vibration between 8 &amp; 12 Hz, equal &amp; similar to the normal cells in human body.', f='8–12', u='Hz resonance',
       ph=('back', [820, 1500], 1500, 1000, .55, .66), xr=('back-xr', [1000, 1800], 1800, 1012, .5, .27), T=[.5, .38], ov=B_, d=B_d, alt='A person pressing both hands into their lower back', tint='#E8E5F5'),
  dict(id='knee', area='Knee Pain', h='Knee pain, <span>healed from within.</span>', rx='Class IV Laser', p='Non-invasive use of laser energy to generate a photochemical response in damaged/dysfunctional tissue. Penetrates deep into the tissue &amp; stimulates healing at a cellular level.', f='IV', u='Class laser',
       ph=('knee', [820, 1500], 1500, 1000, .45, .72), xr=(None, None, 1000, 1250, .5, .52), T=[.48, .54], ov=K_ov, d=K_d, alt='A woman resting her hand on a painful knee', tint='#F6E6DA'),
]
texts = ''.join(f'<article class="ncs-t" data-i="{i}"><h2 class="ncs-t__h">{c["h"]}</h2><p class="ncs-t__p">{c["p"]}</p></article>' for i, c in enumerate(CH))
wins = ''
for i, c in enumerate(CH):
    pn, pw, *_ = c['ph']; xn, xw, W, H, fx, fy = c['xr']
    xrimg = (f'<img class="ncs-c__xr" {ss(xn, xw)} sizes="(max-width:899px) 100vw, 56vw" alt="" aria-hidden="true" loading="lazy">' if xn
             else f'<svg class="ncs-c__xr" viewBox="0 0 {W} {H}" preserveAspectRatio="none" aria-hidden="true">{K_xr}</svg>')
    wins += (f'<div class="ncs-c" data-i="{i}"><img class="ncs-c__ph" {ss(pn, pw)} sizes="(max-width:899px) 100vw, 56vw" alt="{c["alt"]}" loading="lazy">'
             f'<div class="ncs-c__pl">{xrimg}<svg class="ncs-c__ov" viewBox="0 0 {W} {H}" preserveAspectRatio="none" aria-hidden="true">'
             + common(i, W * fx, H * fy) + c['ov'] + '</svg></div></div>')
data = [dict(id=c['id'], tag=c['area'], f=c['f'], u=c['u'], T=c['T'], ph=list(c['ph'][2:]), xr=list(c['xr'][2:]), d=c['d']) for c in CH]
tints = ''.join(f'<i style="background:radial-gradient(70% 70% at 70% 55%,#FFFFFF 0%,{c["tint"]} 75%)"></i>' for c in CH)
lst = ''.join(f'<li><button type="button" data-go="{i}"><b>{i+1:02d}</b>{c["area"]}<span>{c["rx"]}</span><i></i></button></li>' for i, c in enumerate(CH))
stage = f'''
<!-- PAIN TO RELIEF: one pinned card, four places pain lives; each is located, scanned, treated, then moves again -->
<section class="ncs" id="relief" aria-label="How we treat pain">
  <div class="ncs__sticky">
    <div class="ncs__tints" aria-hidden="true">{tints}</div>
    <div class="ncs__pin az-wrap">
      <div class="ncs__side">
        <span class="rx__label">From pain to relief<span class="ncs__count"><b data-ncs-i>01</b> / 04</span></span>
        <div class="ncs__texts">{texts}</div>
        <ol class="ncs__list">{lst}</ol>
        <a class="hx-pill hx-pill--dark ncs__cta" href="#contact" data-az-magnetic>Book a session<span class="hx-pill__ic">{ARROW}</span></a>
      </div>
      <div class="ncs__card">
        {wins}
        <i class="ncs__scan" aria-hidden="true"></i>
        <div class="ncs__pill ncs__phase" aria-hidden="true"><span class="ncs__segs"><i></i><i></i><i></i><i></i></span><b data-ncs-ph>Locate</b></div>
        <div class="ncs__call" aria-hidden="true"><i></i><span><b data-ncs-tag>Neck Pain</b><em data-ncs-st>located</em></span></div>
        <div class="ncs__fact" aria-hidden="true"><b data-ncs-f>FOMT</b><span data-ncs-u>Fellowship</span></div>
        <div class="ncs__pill ncs__meter" aria-hidden="true"><span>Pain</span><span class="ncs__track"><b></b></span><span>Relief</span></div>
      </div>
    </div>
  </div>
  <script type="application/json" id="ncs-data">{json.dumps(data, separators=(',', ':'))}</script>
</section>
'''

a = h.index('<section class="hx"'); b = h.index('<section class="rx"')
out = h[:a] + hero + stage + '\n<!-- RAIL SECTION -->\n' + h[b:]
m3 = re.search(r'<script>addEventListener\("load",function\(\)\{var go=function\(\)\{import\("/home/js/m3d\.js[^<]*</script>', out)
assert m3, 'm3d loader'; out = out.replace(m3.group(0), '')
out = re.sub(r'<link rel="stylesheet" href="/home/css/home\.css\?v=(\d+)">', lambda m: m.group(0) + '\n<link rel="stylesheet" href="/home/css/nc.css?v=3">', out, count=1)
out = re.sub(r'(<script src="/home/js/home\.js\?v=\d+" defer></script>)', r'\1\n<script src="/home/vendor/DrawSVGPlugin.min.js" defer></script>\n<script src="/home/js/nc.js?v=3" defer></script>', out, count=1)
assert 'nc.js' in out and 'nc.css' in out
out = out.replace('<link rel="canonical" href="https://arogyati-chi.vercel.app/home">', '<link rel="canonical" href="https://arogyati-chi.vercel.app/home">\n<meta name="robots" content="noindex">', 1)
out = re.sub(r'<link rel="preload"[^>]*(hero-|model-mid)[^>]*>\n?', '', out)
out = out.replace('<link rel="preload" href="/home/assets/fonts/InstrumentSerif.woff2"', '<link rel="preload" as="image" href="/home/assets/img/nc/hero-1800.webp" type="image/webp" imagesrcset="/home/assets/img/nc/hero-1000.webp 1000w, /home/assets/img/nc/hero-1800.webp 1800w" imagesizes="(max-width:899px) 100vw, 56vw" fetchpriority="high">\n<link rel="preload" href="/home/assets/fonts/InstrumentSerif.woff2"', 1)
out = out.replace('<title>', '<title>New concept · ', 1)
os.makedirs(R + 'new-concept', exist_ok=True)
io.open(R + 'new-concept/index.html', 'w', encoding='utf8').write(out)
print('ok', len(out))
