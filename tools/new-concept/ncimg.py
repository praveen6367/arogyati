from PIL import Image, ImageDraw
import os
D='dl3/'; O='C:/Users/offic/Desktop/arogyati-pitchdeck/home/assets/img/nc/'
os.makedirs(O,exist_ok=True)
def save(im,name,widths,q=74):
    for w in widths:
        r=im.copy(); 
        if r.width>w: r=r.resize((w,round(r.height*w/r.width)),Image.LANCZOS)
        r.save(O+f'{name}-{w}.webp','WEBP',quality=q,method=6); print(name,w,r.size,os.path.getsize(O+f'{name}-{w}.webp')//1024,'KB')
ph=Image.open(D+'1701826510629-051bb954fb8f.jpg').convert('RGB')
save(ph,'hero',[1800,1000])
# x-ray composite aligned to hero photo geometry
xr=Image.open(D+'1763198302249-db661c45bf7d.jpg').convert('RGB')
s=0.72; xr=xr.resize((round(xr.width*s),round(xr.height*s)),Image.LANCZOS)
cv=Image.new('RGB',ph.size,(3,8,14))
mask=Image.new('L',xr.size,255); md=ImageDraw.Draw(mask)
for y in range(160): md.line([(0,y),(xr.width,y)],fill=int(255*(y/160)**1.5))
from PIL import ImageChops
side=Image.new('L',xr.size,255); sd=ImageDraw.Draw(side); F=180
for x in range(F):
    v=int(255*(x/F)**1.4); sd.line([(x,0),(x,xr.height)],fill=v); sd.line([(xr.width-1-x,0),(xr.width-1-x,xr.height)],fill=v)
mask=ImageChops.multiply(mask,side)
cv.paste(xr,(300,515),mask)
save(cv,'hero-xr',[1800,1000])
for f,n,ws in [('1615997380705-504484cd99c4','neck',[1100,640]),('1763198302535-265c44183bcb','neck-xr',[1100,640]),
               ('1497044383938-c0486a41b655','shoulder',[1500,820]),('1769204978162-55d6fdb408ce','shoulder-xr',[1300,720]),
               ('1769029266264-7c4685baebc9','back',[1500,820]),('1763198302745-57cb94135f11','back-xr',[1800,1000]),
               ('1687013367433-9077a7624830','knee',[1500,820])]:
    save(Image.open(D+f+'.jpg').convert('RGB'),n,ws)
