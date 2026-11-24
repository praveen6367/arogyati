# builds /home/home-3/ from the generated new-concept page: the particle body is replaced by the pain photographs
# (a 12-tile collage) and the clinic's treatment footage. Run after ncgen.py:  python tools/new-concept/h3gen.py
import io, re, os
R = 'C:/Users/offic/Desktop/arogyati-pitchdeck/home/'
h = io.open(R + 'new-concept/index.html', encoding='utf8').read()

TILES = ['neck', 'shoulder', 'elbow', 'wrist', 'upperback', 'spine', 'lowerback', 'hip', 'knee', 'ankle', 'ribs', 'chest']
tiles = ''.join(f'<div class="h3-tile" data-k="{k}"><img src="/home/assets/img/pain/{k}.webp" alt="" width="273" height="373" decoding="async"><b class="h3-ring"></b><i class="h3-heal"></i></div>' for k in TILES)
MEDIA = [('video', 'video/tech-osteo.mp4', 'video/tech-osteo.jpg', 'Neck · Hands-on osteopathy'), ('video', 'video/tech-laser.mp4', 'video/tech-laser.jpg', 'Shoulder · In treatment'),
  ('video', 'reels/DfOezDQINUI.mp4', 'reels/DfOezDQINUI.webp', 'Lower back · Rehab exercise'), ('video', 'video/tech-mrt.mp4', 'video/tech-mrt.jpg', 'Knee · Hands-on therapy'),
  ('video', 'reels/DfOezDQINUI.mp4', 'reels/DfOezDQINUI.webp', 'Rehab · Moving again')]
CROP = ' data-crop="1"'
PIP = ''.join(f'<video muted playsinline loop preload="none" data-src="/home/assets/{s}"{CROP if "DfOez" in s else ""}></video>' if s.endswith('.mp4') else f'<img alt="" decoding="async" data-src="/home/assets/{s}">' for s in ('video/tech-osteo.mp4', 'video/tech-laser.mp4', 'reels/DfOezDQINUI.mp4', 'video/tech-mrt.mp4'))
HEROX = ('<div class="h3-note" aria-hidden="true"><span class="h3-note__n"><b>01</b> / 04</span><p class="h3-note__t">Neck pain</p><p class="h3-note__m">Osteopathy</p>'
  + '<figure class="h3-note__v">' + PIP + '</figure><span class="h3-note__c">Treatment at Arogyati</span>'
  + '<ol class="h3-note__steps"><li><i></i><span>01</span>Pain</li><li><i></i><span>02</span>Treatment<em></em></li><li><i></i><span>03</span>Recovery</li></ol>'
  + '<dl class="h3-note__s"><div><dt>28 yrs</dt><dd>First big private clinic in Kolhapur</dd></div><div><dt>12 + 8</dt><dd>Physios + assistant physios</dd></div></dl></div>'
  + '<button type="button" class="h3-arw h3-arw--prev" aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button><button type="button" class="h3-arw h3-arw--next" aria-label="Next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>'
  + '<div class="h3-pin" aria-hidden="true"><b>01</b></div><div class="h3-ba" aria-hidden="true"><span>After</span><span>Before</span></div>'
  + '<div class="h3-prog" role="group" aria-label="Pains we treat">' + ''.join(f'<button type="button"><i></i><span>0{k + 1}</span>{n}</button>' for k, n in enumerate(('Neck', 'Shoulder', 'Lower back', 'Knee'))) + '</div>')
win = ''.join((f'<video muted playsinline loop preload="none" data-src="/home/assets/{s}" data-poster="/home/assets/{p}" data-cap="{c}"{CROP if "DfOez" in s else ""}></video>' if k == 'video'
  else f'<img alt="" decoding="async" data-src="/home/assets/{s}" data-cap="{c}">') for k, s, p, c in MEDIA)
FIG = re.search(r'<svg class="ncx__logo" viewBox="129 0 35 42" aria-hidden="true">(.*?)</svg>', h, re.S).group(1)
vis = (f'<div class="h3v" aria-hidden="true">{tiles}<figure class="h3-win">{win}</figure>'
       f'<div class="h3-cap"><i></i><span></span></div><svg class="h3-logo" viewBox="129 0 35 42">{FIG}</svg></div>')

# stage: drop the particle canvas and the arch window, put the photo stage in their place
h = re.sub(r'\s*<figure class="ncx__arch".*?</figure>', '', h, count=1, flags=re.S)
h = re.sub(r'\s*<div class="ncx__archcap".*?</div>', '', h, count=1, flags=re.S)
h = h.replace('<canvas class="ncx__cv" aria-hidden="true"></canvas>', vis + '<div class="h3-touch" aria-hidden="true"><i></i><span>See how we treat it</span></div>' + HEROX, 1)

assert 'h3v' in h
# scripts: no three.js, no model preload
h = re.sub(r'<script type="module" src="/home/js/nc\.js\?v=\d+"></script>\n?', '', h)
h = re.sub(r'<link rel="preload" href="/home/assets/3d/body\.glb"[^>]*>\n?', '', h)
h = re.sub(r'(<script src="/home/js/home\.js\?v=\d+" defer></script>)', r'\1\n<script type="module" src="/home/js/h3gl.js?v=18"></script>', h, count=1)
h = re.sub(r'(<link rel="stylesheet" href="/home/css/nc\.css\?v=\d+">)', r'\1\n<link rel="stylesheet" href="/home/css/h3.css?v=23">', h, count=1)
h = re.sub(r'<link rel="preload" as="image" href="/home/assets/img/pain/neck\.webp">\n?', '', h)
# the "why choose us" rail gives way (for now) to the Matrix Rhythm Therapy film, full screen
a = h.index('<!-- RAIL SECTION -->'); b = h.index('<!-- INTRO -->', a)
FILM = """<!-- FILM -->
<section class="h3-film" id="film" aria-label="Matrix Rhythm Therapy film">
  <div class="h3-film__stage">
    <div class="h3-film__frame">
      <video class="h3-film__v" muted playsinline loop preload="none" poster="/home/assets/video/mrt-film.jpg" data-src-hd="/home/assets/video/mrt-film-1080.mp4" data-src-sd="/home/assets/video/mrt-film-720.mp4" aria-label="Matrix Rhythm Therapy at Arogyati"></video>
      <div class="h3-film__ui">
        <p class="h3-film__k"><span>Inside Arogyati</span><b>Matrix Rhythm Therapy</b></p>
        <div class="h3-film__bar"><button type="button" class="h3-film__snd" aria-pressed="false" aria-label="Unmute video"><b class="h3-film__ic"><svg class="is-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="m22 9-6 6M16 9l6 6"/></svg><svg class="is-on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg></b><span>Tap for sound</span></button><span class="h3-film__t">00:00 / 01:15</span></div>
        <div class="h3-film__p" aria-hidden="true"><i></i></div>
      </div>
    </div>
  </div>
</section>

"""
h = h[:a] + FILM + h[b:]
assert 'class="rx"' not in h and 'h3-film' in h
h = re.sub(r'(<script type="module" src="/home/js/h3gl\.js\?v=\d+"></script>)', r'\1\n<script src="/home/js/h3film.js?v=3" defer></script>', h, count=1)
h = h.replace('<title>New concept · ', '<title>Home 3 · ', 1)
assert 'h3gl.js' in h and 'h3.css' in h and 'nc.js' not in h
os.makedirs(R + 'home-3', exist_ok=True)
io.open(R + 'home-3/index.html', 'w', encoding='utf8').write(h)
print('ok', len(h))
