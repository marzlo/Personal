import json, os, hashlib, urllib.request, warnings
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
font_path = next((p for p in [os.environ.get('SHARE_FONT',''), 'C:/Windows/Fonts/msjh.ttc', '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'] if p and os.path.isfile(p)), None)
if not font_path: raise RuntimeError('CJK font is required for article thumbnails')

def font(size): return ImageFont.truetype(font_path,size)
def wrap(text,f,width):
    lines=[];line=''
    for char in text:
        if char=='\n' or (line and f.getlength(line+char)>width):
            lines.append(line);line='' if char=='\n' else char
        else: line+=char
    if line: lines.append(line)
    return lines
photo_cache=Path('.cache/share-photos');photo_cache.mkdir(parents=True,exist_ok=True)
photo_results={}
def photograph(photo):
    url=(photo or {}).get('image','')
    if not url.startswith('https://'): return None
    if url in photo_results: return photo_results[url]
    cached=photo_cache/(hashlib.sha256(url.encode()).hexdigest()+'.jpg')
    try:
        if not cached.exists():
            request=urllib.request.Request(url,headers={'User-Agent':'ShiyeSharePreview/1.0'})
            with urllib.request.urlopen(request,timeout=20) as response:
                if not response.headers.get('Content-Type','').startswith('image/'): raise ValueError('Not an image')
                data=response.read(12*1024*1024+1)
                if len(data)>12*1024*1024: raise ValueError('Image too large')
            from io import BytesIO
            image=Image.open(BytesIO(data));image.load();image.convert('RGB').save(cached,quality=90)
        with Image.open(cached) as image: result=image.convert('RGB').copy()
        photo_results[url]=result
        return result
    except Exception as error:
        warnings.warn('Cover photo unavailable; preserving text thumbnail: '+url+' ('+str(error)+')')
        photo_results[url]=None
        return None

def photo_thumbnail(card,photo):
    im=Image.new('RGB',(1200,630),'#f5f4ef')
    im.paste(ImageOps.fit(photo,(520,630),method=Image.Resampling.LANCZOS),(0,0))
    d=ImageDraw.Draw(im)
    d.text((558,40),'拾頁 · READING & REFLECTION',font=font(22),fill='#426a54')
    size=44
    while size>27 and len(wrap(card['title'],font(size),600))>4:size-=1
    y=110
    for line in wrap(card['title'],font(size),600)[:4]:d.text((558,y),line,font=font(size),fill='#25342d');y+=size+11
    author=wrap(card.get('author',''),font(23),600)
    if author:d.text((558,y+6),author[0],font=font(23),fill='#7c8980')
    y+=52
    d.line((558,y,638,y),fill='#426a54',width=3)
    available=max(0,min(3,(540-y)//35))
    lines=wrap(card.get('excerpt',''),font(23),590)
    for i,line in enumerate(lines[:available]):
        if i==available-1 and len(lines)>available:line=line.rstrip('，。；、')+'…'
        d.text((558,y+18+i*35),line,font=font(23),fill='#53675a')
    credit='Photo: '+str((card.get('photo') or {}).get('artist') or '攝影封面')
    d.rectangle((0,595,520,630),fill='#25342d')
    credit_lines=wrap(credit,font(15),490)
    if credit_lines:d.text((15,602),credit_lines[0],font=font(15),fill='#fffefa')
    d.text((558,580),'閱讀，然後讓想法繼續生長。',font=font(18),fill='#7c8980')
    return im

cards=json.loads(Path('.cache/share-manifest.json').read_text(encoding='utf-8'))
for card in cards:
    photo=photograph(card.get('photo'))
    if photo is not None:
        photo_thumbnail(card,photo).save('share/'+card['id']+'/cover.png',optimize=True)
        continue
    im=Image.new('RGB',(1200,630),'#f5f4ef');d=ImageDraw.Draw(im)
    d.rounded_rectangle((38,38,1162,592),radius=28,fill='#fffefa',outline='#d9e1d8',width=2)
    d.rounded_rectangle((76,72,128,124),radius=15,fill='#d9e5d9')
    d.text((88,78),'＊',font=font(28),fill='#426a54')
    d.text((148,78),'拾頁 · READING & REFLECTION',font=font(25),fill='#426a54')
    size=56
    while size>30 and len(wrap(card['title'],font(size),1020))>3: size-=2
    title_lines=wrap(card['title'],font(size),1020)[:3]
    y=155
    for line in title_lines:d.text((80,y),line,font=font(size),fill='#25342d');y+=size+10
    author_lines=wrap(card['author'],font(25),1000)
    if author_lines:d.text((82,y+8),author_lines[0],font=font(25),fill='#7c8980')
    y+=58
    d.line((82,y,162,y),fill='#426a54',width=4)
    quote_font=font(27)
    available=max(0,min(3,(535-y-24)//40))
    lines=wrap(card['excerpt'],quote_font,1000)
    for i,line in enumerate(lines[:available]):
        if i==available-1 and len(lines)>available:
            while quote_font.getlength(line+'…')>1000:line=line[:-1]
            line+='…'
        d.text((82,y+24+i*40),line,font=quote_font,fill='#53675a')
    d.text((82,548),'閱讀，然後讓想法繼續生長。',font=font(21),fill='#8b978d')
    im.save('share/'+card['id']+'/cover.png',optimize=True)
print('Generated article thumbnail PNGs')
