# Slims the rigged human used by the new-concept particle body.
# Source: "Superhero Male" from Quaternius "Universal Base Characters" (Standard pack), CC0 1.0 —
#   https://quaternius.com/packs/universalbasecharacters.html (GLB packaging from github.com/programasweights/avatar)
# Keeps only the body mesh + skin + skeleton (drops eyes/eyebrows, UVs, colours, materials), packs joints/weights into bytes.
# Usage: python tools/new-concept/bodyslim.py <character.glb>
import json, struct, sys
import numpy as np

OUT = 'C:/Users/offic/Desktop/arogyati-pitchdeck/home/assets/3d/body.glb'
raw = open(sys.argv[1], 'rb').read()
n = struct.unpack('<I', raw[12:16])[0]
j = json.loads(raw[20:20 + n])
binoff = 20 + n + 8
CT = {5126: ('<f4', 4), 5123: ('<u2', 2), 5121: ('u1', 1), 5125: ('<u4', 4)}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}

def read(ai):
    a = j['accessors'][ai]; bv = j['bufferViews'][a['bufferView']]
    dt, _ = CT[a['componentType']]; c = NC[a['type']]
    o = binoff + bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    stride = bv.get('byteStride')
    if stride and stride != np.dtype(dt).itemsize * c:
        rows = [np.frombuffer(raw, dt, c, o + i * stride) for i in range(a['count'])]
        arr = np.stack(rows)
    else:
        arr = np.frombuffer(raw, dt, a['count'] * c, o).reshape(a['count'], c)
    if a.get('normalized'):
        arr = arr.astype(np.float32) / {5121: 255, 5123: 65535}[a['componentType']]
    return arr if c > 1 else arr[:, 0]

blob = bytearray(); views = []; accs = []
def add(arr, ctype, typ, target=None, norm=False, minmax=False):
    while len(blob) % 4: blob.append(0)
    bv = {'buffer': 0, 'byteOffset': len(blob), 'byteLength': arr.nbytes}
    if target: bv['target'] = target
    blob.extend(arr.tobytes()); views.append(bv)
    a = {'bufferView': len(views) - 1, 'componentType': ctype, 'count': len(arr), 'type': typ}
    if norm: a['normalized'] = True
    if minmax: a['min'] = arr.min(0).tolist(); a['max'] = arr.max(0).tolist()
    accs.append(a); return len(accs) - 1

# the body is the mesh with the most vertices
body = max(range(len(j['meshes'])), key=lambda i: j['accessors'][j['meshes'][i]['primitives'][0]['attributes']['POSITION']]['count'])
meshes = []
for p in j['meshes'][body]['primitives']:
    at = p['attributes']
    pos = read(at['POSITION']).astype('<f4'); nor = read(at['NORMAL']).astype('<f4')
    jt = read(at['JOINTS_0']).astype('u1')
    w = read(at['WEIGHTS_0']).astype(np.float32); w = w / np.maximum(w.sum(1, keepdims=True), 1e-6)
    wq = np.round(w * 255).astype(np.int32); wq[np.arange(len(wq)), wq.argmax(1)] += 255 - wq.sum(1)
    idx = read(p['indices']); idx = idx.astype('<u2') if idx.max() < 65536 else idx.astype('<u4')
    meshes.append({'attributes': {'POSITION': add(pos, 5126, 'VEC3', 34962, minmax=True), 'NORMAL': add(nor, 5126, 'VEC3', 34962),
                                  'JOINTS_0': add(jt, 5121, 'VEC4', 34962), 'WEIGHTS_0': add(wq.astype('u1'), 5121, 'VEC4', 34962, norm=True)},
                   'indices': add(idx, 5123 if idx.dtype == np.dtype('<u2') else 5125, 'SCALAR', 34963)})
j['meshes'] = [{'name': 'Body', 'primitives': meshes}]
for nd in j['nodes']:
    if 'mesh' in nd:
        if nd['mesh'] == body: nd['mesh'] = 0
        else: nd.pop('mesh'); nd.pop('skin', None)
for sk in j['skins']:
    sk['inverseBindMatrices'] = add(read(sk['inverseBindMatrices']).astype('<f4'), 5126, 'MAT4')
for k in ('animations', 'materials', 'textures', 'images', 'samplers', 'extensionsUsed', 'extensionsRequired'): j.pop(k, None)
j['accessors'] = accs; j['bufferViews'] = views
while len(blob) % 4: blob.append(0)
j['buffers'] = [{'byteLength': len(blob)}]
js = json.dumps(j, separators=(',', ':')).encode(); js += b' ' * (-len(js) % 4)
out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(blob))
out += struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(blob), 0x004E4942) + bytes(blob)
open(OUT, 'wb').write(out)
print('wrote', OUT, len(out))
