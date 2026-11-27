# builds /home/home-final/ : the site's header and footer with the Matrix Rhythm Therapy film as a full-screen hero.
# Run after h3gen.py:  python tools/new-concept/hfgen.py
import io, re, os
R = 'C:/Users/offic/Desktop/arogyati-pitchdeck/home/'
h = io.open(R + 'home-3/index.html', encoding='utf8').read()

SPK_OFF = '<svg class="is-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="m22 9-6 6M16 9l6 6"/></svg>'
SPK_ON = '<svg class="is-on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>'
HERO = f'''<main id="main">
<!-- HERO: the Matrix Rhythm Therapy film -->
<section class="hf-hero" id="top" aria-label="Matrix Rhythm Therapy at Arogyati">
  <div class="hf-hero__bg" aria-hidden="true"></div>
  <video class="hf-hero__v" muted playsinline loop autoplay preload="auto" poster="/home/assets/video/mrt-film.jpg" data-src-hd="/home/assets/video/mrt-film-1080.mp4" data-src-sd="/home/assets/video/mrt-film-720.mp4" aria-label="Matrix Rhythm Therapy at Arogyati"></video>
  <button type="button" class="hf-snd" aria-pressed="false" aria-label="Unmute video"><b class="hf-snd__ic">{SPK_OFF}{SPK_ON}</b><span>Tap for sound</span></button>
  <div class="hf-hero__p" aria-hidden="true"><i></i></div>
</section>
</main>'''

# the modalities: a quiet editorial strip, the names divided by the Arogyati leaf
LEAF = re.search(r'<svg class="h3-logo" viewBox="129 0 35 42">(.*?)</svg>', h, re.S).group(1)
mqs = re.findall(r'<li>(<svg class="az-ic".*?</svg>)([^<]+)</li>', re.search(r'<ul class="ix__mqt">(.*?)</ul>', h, re.S).group(1))
seen, items = set(), []
for svg, name in mqs:
    if name in seen: continue
    seen.add(name); items.append(f'<li><span class="hf-mq__t">{name}</span><svg class="hf-mq__leaf" viewBox="129 0 35 42" aria-hidden="true">{LEAF}</svg></li>')
MQ = ('<section class="hf-mq" aria-label="Advanced modalities"><div class="hf-mq__track">'
      + '<ul>' + ''.join(items) + '</ul><ul aria-hidden="true">' + ''.join(items) + '</ul><ul aria-hidden="true">' + ''.join(items) + '</ul><ul aria-hidden="true">' + ''.join(items) + '</ul>'
      + '</div></section>')

# services: the seven services as a bento on the sky panel (copy from the services page)
ARROW = re.search(r'<span class="hx-pill__ic">(<svg.*?</svg>)</span>', h, re.S).group(1)
IC = {
  'diet': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8c-1-2-3-3-5-2-3 1.5-3 6-1 9.5 1.2 2 2.8 3.5 4.5 3 .6-.2 1-.5 1.5-.5s.9.3 1.5.5c1.7.5 3.3-1 4.5-3 2-3.5 2-8-1-9.5-2-1-4 0-5 2z"/><path d="M12 8c0-2 1-3.5 3-4.5"/></svg>',
  'speech': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/></svg>',
  'cup': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 9h11l-1.2 8.6a2.5 2.5 0 0 1-2.5 2.4h-3.6a2.5 2.5 0 0 1-2.5-2.4z"/><path d="M9 5.5h6M12 5.5V3"/></svg>',
}
SERV = [
  ('Physiotherapy At Home', 'For Hospitalized &amp; Bedridden Patients', 'home-visit', 'A physiotherapist supporting a patient at home'),
  ('Psychological Counselling', 'Address Emotional Well-Being', 'counselling', 'Hands held in support'),
  ('Dietitian Advice', 'Nutrition, part of a rehab approach', 'dietitian', 'A consultation at Arogyati'),
  ('Speech Therapy', 'Speech consultation', 'speech', 'An illustration of the brain'),
  ('Prosthesis &amp; Orthosis', 'Promote Independence', 'prosthesis', 'A therapist guiding a patient through arm movement'),
  ('Super Induction Therapy', 'Strong muscle contractions', 'sis', 'Super Inductive System treatment at Arogyati'),
  ('Cupping And Dry Needling Taping', 'Manage Pain', 'cupping', 'A therapist treating a patient\'s arm'),
]
CHEV_L = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>'
CHEV_R = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>'
def gcard(k, title, line, img, alt, clone=False):
    hide = ' aria-hidden="true"' if clone else ''
    return (f'<article class="hfs-g{" is-clone" if clone else ""}" style="--i:{k}"{hide}><div class="hfs-g__media"><img class="hfs-g__img" src="/home/assets/img/svc/{img}.webp" alt="{"" if clone else alt}" width="960" height="744" loading="lazy" decoding="async"></div><div class="hfs-g__body">'
            f'<span class="hfs-g__n">{k + 1:02d}<i> / 07</i></span><h3>{title}</h3><p>{line}</p>'
            f'<a class="hfs-g__more" href="/home/services/"{" tabindex=\"-1\"" if clone else ""}>Learn more<span>{ARROW}</span></a></div></article>')
CARDS = ('<div class="hfs__car"><div class="hfs__track" tabindex="0" aria-label="Services"><div class="hfs__rail">' + ''.join(gcard(k, *s) for k, s in enumerate(SERV)) + ''.join(gcard(k, *s, clone=True) for k, s in enumerate(SERV)) + ''.join(gcard(k, *s, clone=True) for k, s in enumerate(SERV)) + '</div></div>'
  f'<div class="hfs__nav"><div class="hfs__bar" aria-hidden="true"><i></i></div><div class="hfs__btns"><button type="button" class="hfs__btn hfs__btn--prev" aria-label="Previous services">{CHEV_L}</button>'
  f'<button type="button" class="hfs__btn hfs__btn--next" aria-label="Next services">{CHEV_R}</button></div></div></div>')
SVC = ('<section class="hfs" id="services" aria-label="Our services"><div class="az-wrap"><div class="hfs__panel">'
  '<div class="hfs__bg" aria-hidden="true"><img src="/home/assets/img/svc-hills-1200.webp" srcset="/home/assets/img/svc-hills-1200.webp 1200w, /home/assets/img/svc-hills-2400.webp 2400w" sizes="(max-width:900px) 100vw, 90vw" alt="" width="2400" height="1350" loading="lazy"></div><div class="hfs__shade" aria-hidden="true"></div>'
  '<div class="hfs__head"><h2 class="hfs__h2">Our Services, for faster recovery of patients.</h2><div class="hfs__side"><p>Physiotherapy Services For Hospitalized &amp; Bedridden Patients At Home — with Speech Therapy, Nutritionist, Prosthesis &amp; Orthosis and Psychological Counselling.</p>'
  f'<a class="hx-pill hx-pill--white" href="/home/services/">All services<span class="hx-pill__ic">{ARROW}</span></a></div></div>'
  + CARDS + '</div></div></section>')

# where does it hurt: the particle body, the clinic reel and the nine areas, together (data from the conditions section)
AREAS = re.findall(r'<article class="cd4m__s" data-area="([a-z]+)"><header class="cd4m__h"><span>[^<]*</span><h3>([^<]*)</h3><p>([^<]*)</p></header>.*?data-poster="([^"]+)" data-src="([^"]+)".*?<b>([^<]*)</b><small>([^<]*)</small>', h, re.S)
assert len(AREAS) == 9, len(AREAS)
SPOT = {'head': (54.2, 7.5), 'neck': (54.2, 14.1), 'shoulder': (76.4, 21.9), 'chest': (54.2, 26.4), 'back': (54.2, 42.0), 'elbow': (17.1, 37.5), 'wrist': (8.3, 52.0), 'knee': (64.8, 72.1), 'heel': (35.6, 95.5)}
SNDOFF = SPK_OFF.replace('class="is-off"', 'class="is-off"'); SNDON = SPK_ON
spots = ''.join(f'<button type="button" class="hp-spot" data-k="{k}" style="--x:{SPOT[a][0]}%;--y:{SPOT[a][1]}%" aria-label="{n}"><i></i></button>' for k, (a, n, c, po, src, cb, cs) in enumerate(AREAS))
vids = ''.join(f'<video muted loop playsinline preload="none" data-k="{k}" data-poster="{po}" data-src="{src}"></video>' for k, (a, n, c, po, src, cb, cs) in enumerate(AREAS))
rows = ''.join(f'<li><button type="button" class="hp-row" data-k="{k}"><span class="hp-row__n">{k + 1:02d}</span><b>{n}</b><small>{c}</small></button></li>' for k, (a, n, c, po, src, cb, cs) in enumerate(AREAS))
import json, html as _h
data = json.dumps([{'n': _h.unescape(n), 'c': _h.unescape(c), 'cb': _h.unescape(cb), 'cs': _h.unescape(cs)} for (a, n, c, po, src, cb, cs) in AREAS], ensure_ascii=False).replace('</', '<\\/')
HP = (f'<section class="hp" id="conditions" aria-label="Where does it hurt?"><div class="az-wrap">'
  '<h2 class="hp__h2">Where does it <em>hurt?</em></h2>'
  '<div class="hp__grid">'
  f'<div class="hp__body"><div class="hp__fig"><img src="/home/assets/img/body-particles.webp" alt="" width="560" height="1163" loading="lazy" decoding="async">{spots}</div>'
  '<div class="hp__name"><span class="hp__idx"><b>01</b> / 09</span><b class="hp__area">Head</b><span class="hp__cond">Stroke · Bell&#39;s Palsy</span></div></div>'
  f'<figure class="hp__reel"><div class="hp__vids">{vids}</div><div class="hp__cap"><b>TMJ pain</b><small>Lower jaw &amp; upper skull</small></div>'
  f'<button type="button" class="hp__snd" aria-pressed="false" aria-label="Unmute reel"><b class="hf-snd__ic">{SNDOFF}{SNDON}</b></button><div class="hp__prog" aria-hidden="true"><i></i></div></figure>'
  f'<ol class="hp__list">{rows}</ol>'
  f'</div><script type="application/json" id="hp-data">{data}</script></div></section>')
SVC = SVC + '\n' + HP
MQ = MQ + '\n' + SVC
HERO = HERO.replace('</section>\n</main>', '</section>\n' + MQ + '\n</main>')
assert 'hf-mq' in HERO
a = h.index('<main id="main">'); b = h.index('</main>', a) + len('</main>')
h = h[:a] + HERO + h[b:]
# page scripts and styles: no WebGL hero, no carousel; the film hero has its own small script
h = re.sub(r'<script type="module" src="/home/js/h3gl\.js\?v=\d+"></script>\n?', '', h)
h = re.sub(r'<script src="/home/js/h3film\.js\?v=\d+" defer></script>\n?', '', h)
h = re.sub(r'<link rel="stylesheet" href="/home/css/nc\.css\?v=\d+">\n?', '', h)
h = re.sub(r'<link rel="stylesheet" href="/home/css/h3\.css\?v=\d+">', '<link rel="stylesheet" href="/home/css/hf.css?v=16">', h, count=1)
h = re.sub(r'(<script src="/home/js/home\.js\?v=\d+" defer></script>)', r'\1\n<script src="/home/js/hf.js?v=11" defer></script>', h, count=1)
h = h.replace('<title>Home 3 · ', '<title>Home Final · ', 1)
assert 'hf-hero' in h and 'hf.js' in h and 'hf.css' in h and 'h3gl.js' not in h and 'az-foot' in h and 'az-head' in h
os.makedirs(R + 'home-final', exist_ok=True)
io.open(R + 'home-final/index.html', 'w', encoding='utf8').write(h)
print('ok', len(h))
