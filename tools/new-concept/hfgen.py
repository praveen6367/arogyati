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
def photo(cls, n, img, w, hgt, title, line, alt, i):
    return (f'<a class="hfs-card hfs-card--photo {cls}" href="/home/services/" style="--i:{i}"><img src="/home/assets/img/{img}" alt="{alt}" width="{w}" height="{hgt}" loading="lazy">'
            f'<div class="hfs-card__top"><span class="hfs-card__n">{n}</span><span class="hfs-card__go">{ARROW}</span></div>'
            f'<div class="hfs-card__foot"><b>{title}</b><p>{line}</p></div></a>')
def plain(cls, n, ic, title, line, i):
    return (f'<a class="hfs-card {cls}" href="/home/services/" style="--i:{i}"><div class="hfs-card__top"><span class="hfs-card__n">{n}</span><span class="hfs-card__ic">{IC[ic]}</span></div>'
            f'<div class="hfs-card__foot"><b>{title}</b><p>{line}</p></div></a>')
CARDS = (photo('hfs-card--a', '01', 'elder-800.webp', 800, 534, 'Physiotherapy At Home', 'For Hospitalized &amp; Bedridden Patients', 'A physiotherapist supporting a patient at home', 0)
  + photo('', '02', 'hands-800.webp', 800, 534, 'Psychological Counselling', 'Address Emotional Well-Being', 'Hands held in support', 1)
  + plain('hfs-card--green', '03', 'diet', 'Dietitian Advice', 'Nutrition, part of a rehab approach', 2)
  + plain('hfs-card--white', '04', 'speech', 'Speech Therapy', 'Speech consultation', 3)
  + photo('', '05', 'assist-800.webp', 800, 534, 'Prosthesis &amp; Orthosis', 'Promote Independence', 'A therapist guiding a patient through arm movement', 4)
  + photo('', '06', 'sis-800.webp', 800, 534, 'Super Induction Therapy', 'Strong muscle contractions', 'Super Inductive System treatment at Arogyati', 5)
  + plain('hfs-card--white hfs-card--w7', '07', 'cup', 'Cupping And Dry Needling Taping', 'Manage Pain', 6)
  + f'<a class="hfs-card hfs-card--cta" href="/home/contact/" style="--i:7"><span class="hfs-card__plus">+</span><b>Schedule Appointment</b><small>Monday to Saturday · 10.00 Am – 02.00 Pm &amp; 04.00 Pm – 07.00 Pm</small></a>')
SVC = ('<section class="hfs" id="services" aria-label="Our services"><div class="az-wrap"><div class="hfs__panel">'
  '<div class="hfs__bg" aria-hidden="true"><img src="/home/assets/img/svc-hills-1200.webp" srcset="/home/assets/img/svc-hills-1200.webp 1200w, /home/assets/img/svc-hills-2400.webp 2400w" sizes="(max-width:900px) 100vw, 90vw" alt="" width="2400" height="1350" loading="lazy"></div><div class="hfs__shade" aria-hidden="true"></div>'
  '<div class="hfs__head"><h2 class="hfs__h2">Our Services, for faster recovery of patients.</h2><div class="hfs__side"><p>Physiotherapy Services For Hospitalized &amp; Bedridden Patients At Home — with Speech Therapy, Nutritionist, Prosthesis &amp; Orthosis and Psychological Counselling.</p>'
  f'<a class="hx-pill hx-pill--white" href="/home/services/">All services<span class="hx-pill__ic">{ARROW}</span></a></div></div>'
  '<div class="hfs__grid">' + CARDS + '</div></div></div></section>')
MQ = MQ + '\n' + SVC
HERO = HERO.replace('</section>\n</main>', '</section>\n' + MQ + '\n</main>')
assert 'hf-mq' in HERO
a = h.index('<main id="main">'); b = h.index('</main>', a) + len('</main>')
h = h[:a] + HERO + h[b:]
# page scripts and styles: no WebGL hero, no carousel; the film hero has its own small script
h = re.sub(r'<script type="module" src="/home/js/h3gl\.js\?v=\d+"></script>\n?', '', h)
h = re.sub(r'<script src="/home/js/h3film\.js\?v=\d+" defer></script>\n?', '', h)
h = re.sub(r'<link rel="stylesheet" href="/home/css/nc\.css\?v=\d+">\n?', '', h)
h = re.sub(r'<link rel="stylesheet" href="/home/css/h3\.css\?v=\d+">', '<link rel="stylesheet" href="/home/css/hf.css?v=7">', h, count=1)
h = re.sub(r'(<script src="/home/js/home\.js\?v=\d+" defer></script>)', r'\1\n<script src="/home/js/hf.js?v=2" defer></script>', h, count=1)
h = h.replace('<title>Home 3 · ', '<title>Home Final · ', 1)
assert 'hf-hero' in h and 'hf.js' in h and 'hf.css' in h and 'h3gl.js' not in h and 'az-foot' in h and 'az-head' in h
os.makedirs(R + 'home-final', exist_ok=True)
io.open(R + 'home-final/index.html', 'w', encoding='utf8').write(h)
print('ok', len(h))
