import json, os
from PIL import Image, ImageDraw, ImageFont
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
for card in json.load(open('.cache/share-manifest.json',encoding='utf-8')):
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
