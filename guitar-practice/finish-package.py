from pathlib import Path
import re

base=Path(__file__).parent
navigation=(base/'navigation.html').read_text(encoding='utf-8')
for name in ['index.html','library.html','studio.html']:
    file=base/name
    text=file.read_text(encoding='utf-8')
    if 'aria-label="指間功能"' not in text:
        text=re.sub(r'(<body\b[^>]*>)',lambda m:m.group(1)+'\n'+navigation,text,count=1)
    file.write_text(text,encoding='utf-8')
print('Added navigation to standalone pages.')
