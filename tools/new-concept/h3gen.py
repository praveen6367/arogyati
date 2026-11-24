# builds /home/home-3/ from the generated new-concept page: the particle body is replaced by the pain photographs
# (a 12-tile collage) and the clinic's treatment footage. Run after ncgen.py:  python tools/new-concept/h3gen.py
import io, re, os
R = 'C:/Users/offic/Desktop/arogyati-pitchdeck/home/'
h = io.open(R + 'new-concept/index.html', encoding='utf8').read()

TILES = ['neck', 'shoulder', 'elbow', 'wrist', 'upperback', 'spine', 'lowerback', 'hip', 'knee', 'ankle', 'ribs', 'chest']
tiles = ''.join(f'<div class="h3-tile" data-k="{k}"><img src="/home/assets/img/pain/{k}.webp" alt="" width="273" height="373" decoding="async"><b class="h3-ring"></b><i class="h3-heal"></i></div>' for k in TILES)
MEDIA = [('video', 'video/tech-osteo.mp4', 'video/tech-osteo.jpg', 'Neck · Hands-on osteopathy'), ('img', 'img/shoulder-800.webp', '', 'Shoulder · Mobilisation'),
  ('img', 'img/back-800.webp', '', 'Lower back · Manual therapy'), ('video', 'video/tech-mrt.mp4', 'video/tech-mrt.jpg', 'Knee · Hands-on therapy'),
  ('video', 'reels/DfOezDQINUI.mp4', 'reels/DfOezDQINUI.webp', 'Rehab · Moving again')]
CROP = ' data-crop="1"'
win = ''.join((f'<video muted playsinline loop preload="none" data-src="/home/assets/{s}" data-poster="/home/assets/{p}" data-cap="{c}"{CROP if "DfOez" in s else ""}></video>' if k == 'video'
  else f'<img alt="" decoding="async" data-src="/home/assets/{s}" data-cap="{c}">') for k, s, p, c in MEDIA)
FIG = re.search(r'<svg class="ncx__logo" viewBox="129 0 35 42" aria-hidden="true">(.*?)</svg>', h, re.S).group(1)
vis = (f'<div class="h3v" aria-hidden="true">{tiles}<figure class="h3-win">{win}</figure>'
       f'<div class="h3-cap"><i></i><span></span></div><svg class="h3-logo" viewBox="129 0 35 42">{FIG}</svg></div>')

# stage: drop the particle canvas and the arch window, put the photo stage in their place
h = re.sub(r'\s*<figure class="ncx__arch".*?</figure>', '', h, count=1, flags=re.S)
h = re.sub(r'\s*<div class="ncx__archcap".*?</div>', '', h, count=1, flags=re.S)
h = h.replace('<canvas class="ncx__cv" aria-hidden="true"></canvas>', vis + '<div class="h3-touch" aria-hidden="true"><i></i><span>See how we treat it</span></div>', 1)

assert 'h3v' in h
# scripts: no three.js, no model preload
h = re.sub(r'<script type="module" src="/home/js/nc\.js\?v=\d+"></script>\n?', '', h)
h = re.sub(r'<link rel="preload" href="/home/assets/3d/body\.glb"[^>]*>\n?', '', h)
h = re.sub(r'(<script src="/home/js/home\.js\?v=\d+" defer></script>)', r'\1\n<script type="module" src="/home/js/h3gl.js?v=8"></script>', h, count=1)
h = re.sub(r'(<link rel="stylesheet" href="/home/css/nc\.css\?v=\d+">)', r'\1\n<link rel="stylesheet" href="/home/css/h3.css?v=5">', h, count=1)
h = re.sub(r'<link rel="preload" as="image" href="/home/assets/img/pain/neck\.webp">\n?', '', h)
h = h.replace('<title>New concept · ', '<title>Home 3 · ', 1)
assert 'h3gl.js' in h and 'h3.css' in h and 'nc.js' not in h
os.makedirs(R + 'home-3', exist_ok=True)
io.open(R + 'home-3/index.html', 'w', encoding='utf8').write(h)
print('ok', len(h))
