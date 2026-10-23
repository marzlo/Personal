import io,json,os,runpy,tempfile,unittest,hashlib
from pathlib import Path
from unittest.mock import patch
from urllib.error import URLError
from PIL import Image
SCRIPT=Path(__file__).resolve().parents[1]/'scripts/build-share-images.py'

class SharePhotos(unittest.TestCase):
 def test_photo_layout_and_download_cache(self):
  photo=io.BytesIO();Image.new('RGB',(900,600),'#345678').save(photo,format='JPEG')
  class Response(io.BytesIO):headers={'Content-Type':'image/jpeg'}
  with tempfile.TemporaryDirectory() as directory:
   old=os.getcwd();os.chdir(directory)
   try:
    Path('.cache').mkdir();cards=[]
    for ident in ['a','b']:
     Path('share',ident).mkdir(parents=True)
     cards.append(dict(id=ident,title='讓理性回歸本位：從內在力量走向價值完成的神奇之道',author='Seth',excerpt='生命的創造力在理解與行動之間，逐漸展現新的可能性。',photo={'image':'https://example.test/photo.jpg','artist':'Test Photographer'}))
    Path('.cache/share-manifest.json').write_text(json.dumps(cards))
    with patch('urllib.request.urlopen',return_value=Response(photo.getvalue())) as fetch:
     runpy.run_path(str(SCRIPT));self.assertEqual(fetch.call_count,1)
    for ident in ['a','b']:
     with Image.open('share/'+ident+'/cover.png') as image:
      self.assertEqual(image.size,(1200,630));self.assertLess(sum(abs(a-b) for a,b in zip(image.getpixel((100,200)),(52,86,120))),10)
      self.assertEqual(image.getpixel((1190,20)),(245,244,239))
      self.assertEqual(image.getpixel((5,615)),(37,52,45))
   finally:os.chdir(old)
 def test_unavailable_photo_keeps_working_text_preview(self):
  with tempfile.TemporaryDirectory() as directory:
   old=os.getcwd();os.chdir(directory)
   try:
    Path('.cache').mkdir();Path('share/a').mkdir(parents=True)
    Path('.cache/share-manifest.json').write_text(json.dumps([dict(id='a',title='分享測試',author='作者',excerpt='完整的原文摘句。',photo={'image':'https://example.test/unavailable.jpg'})]))
    with patch('urllib.request.urlopen',side_effect=URLError('unavailable')):
     with self.assertWarns(UserWarning):runpy.run_path(str(SCRIPT))
    with Image.open('share/a/cover.png') as image:self.assertEqual(image.size,(1200,630))
   finally:os.chdir(old)
if __name__=='__main__':unittest.main()
