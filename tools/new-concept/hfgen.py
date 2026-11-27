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

# the modalities, as a large-type band after the hero (the icons are the site's own)
mqs = re.findall(r'<li>(<svg class="az-ic".*?</svg>)([^<]+)</li>', re.search(r'<ul class="ix__mqt">(.*?)</ul>', h, re.S).group(1))
seen, items = set(), []
for svg, name in mqs:
    if name in seen: continue
    seen.add(name); items.append(f'<li><span class="hf-mq__ic">{svg}</span><span class="hf-mq__t">{name}</span></li>')
MQ = ('<section class="hf-mq" aria-label="Advanced modalities"><div class="hf-mq__track">'
      + '<ul>' + ''.join(items) + '</ul><ul aria-hidden="true">' + ''.join(items) + '</ul><ul aria-hidden="true">' + ''.join(items) + '</ul><ul aria-hidden="true">' + ''.join(items) + '</ul>'
      + '</div></section>')
HERO = HERO.replace('</section>\n</main>', '</section>\n' + MQ + '\n</main>')
assert 'hf-mq' in HERO
a = h.index('<main id="main">'); b = h.index('</main>', a) + len('</main>')
h = h[:a] + HERO + h[b:]
# page scripts and styles: no WebGL hero, no carousel; the film hero has its own small script
h = re.sub(r'<script type="module" src="/home/js/h3gl\.js\?v=\d+"></script>\n?', '', h)
h = re.sub(r'<script src="/home/js/h3film\.js\?v=\d+" defer></script>\n?', '', h)
h = re.sub(r'<link rel="stylesheet" href="/home/css/nc\.css\?v=\d+">\n?', '', h)
h = re.sub(r'<link rel="stylesheet" href="/home/css/h3\.css\?v=\d+">', '<link rel="stylesheet" href="/home/css/hf.css?v=3">', h, count=1)
h = re.sub(r'(<script src="/home/js/home\.js\?v=\d+" defer></script>)', r'\1\n<script src="/home/js/hf.js?v=1" defer></script>', h, count=1)
h = h.replace('<title>Home 3 · ', '<title>Home Final · ', 1)
assert 'hf-hero' in h and 'hf.js' in h and 'hf.css' in h and 'h3gl.js' not in h and 'az-foot' in h and 'az-head' in h
os.makedirs(R + 'home-final', exist_ok=True)
io.open(R + 'home-final/index.html', 'w', encoding='utf8').write(h)
print('ok', len(h))
