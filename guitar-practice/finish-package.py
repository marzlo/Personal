"""Refresh shared navigation and export the plain setlist source page."""
from pathlib import Path
import re

base=Path(__file__).parent
navigation=(base/'navigation.html').read_text(encoding='utf-8').rstrip()
for name in ['index.html','library.html','studio.html','fingering-notes.html','setlist.html']:
    file=base/name
    nav=navigation.replace('href="'+name+'">','href="'+name+'" aria-current="page">')
    if name=='setlist.html':
        text=(base/'src/setlist.html').read_text(encoding='utf-8').replace('<!-- GUITAR_NAV -->',nav)
    else:
        text=file.read_text(encoding='utf-8')
        pattern=r'(?:<style data-guitar-navigation>.*?</style>\s*)?<nav\b[^>]*aria-label="指間功能"[^>]*>.*?</nav>'
        text,count=re.subn(pattern,lambda m:nav,text,count=1,flags=re.S)
        if not count:
            text=re.sub(r'(<body\b[^>]*>)',lambda m:m.group(1)+'\n'+nav,text,count=1)
    file.write_text(text,encoding='utf-8')
print('Updated shared navigation and setlist export.')
