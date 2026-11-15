import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const script=fs.readFileSync(new URL('../handwritten.js',import.meta.url),'utf8').replace(/ sync=new window\.HandwrittenSync[\s\S]*$/, ' window.test={noteData,imageUrl,escape,transcriptMarkup,draftLabel,photoFilename,handwrittenNumber,comparePhotos,setTags:value=>tags=value};\n})();');
function setup(){const elements=new Map();const get=id=>{if(!elements.has(id))elements.set(id,{addEventListener(){}});return elements.get(id)};const context={window:{HANDWRITTEN_NOTES:[],addEventListener(){}},document:{getElementById:get,body:{classList:{contains:()=>true}}},URL,location:{href:'https://marzlo.github.io/Personal/handwritten.html',origin:'https://marzlo.github.io'}};vm.runInNewContext(script,context);return context.window.test}
test('stored corrections override known text fields and preserve source identity',()=>{const api=setup();api.setTags({__handwrittenNotes:{'note-030':{body:'校對後正文',status:'reviewed',id:'wrong',number:'999',annotation:42}}});const note=api.noteData({id:'note-030',number:'30',body:'原稿',annotation:'紅字'});assert.equal(note.id,'note-030');assert.equal(note.number,'30');assert.equal(note.body,'校對後正文');assert.equal(note.annotation,'紅字');assert.equal(note.status,'reviewed')});
test('image URLs reject executable and insecure external schemes',()=>{const api=setup();assert.equal(api.imageUrl('javascript:alert(1)'),'');assert.equal(api.imageUrl('data:image/png;base64,abc'),'');assert.equal(api.imageUrl('http://external.test/photo.jpg'),'');assert.equal(api.imageUrl('assets/photo.jpg'),'https://marzlo.github.io/Personal/assets/photo.jpg')});
test('transcribed or edited text cannot inject markup',()=>{const api=setup();assert.equal(api.escape('<img src=x onerror="alert(1)">'),'&lt;img src=x onerror=&quot;alert(1)&quot;&gt;')});

test('newly supplied photo fills an empty saved image without losing corrections',()=>{const api=setup();api.setTags({__handwrittenNotes:{'note-034':{image:'',body:'我的校訂'}}});const note=api.noteData({id:'note-034',image:'assets/handwritten/note-034.webp',body:'初稿'});assert.equal(note.image,'assets/handwritten/note-034.webp');assert.equal(note.body,'我的校訂')});


test('OCR rendering escapes text and only uses known ink colors',()=>{
 const api=setup(),note={transcriptionMethod:'local-ocr',body:'original',ocrOriginalFields:{body:'original'},ocrLines:[{role:'body',text:'<script>bad()</script>',color:'red onclick=bad',uncertain:true},{role:'annotation',text:'side note',color:'red'}]};
 const html=api.transcriptMarkup(note,'body');assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('ink-unknown'));assert.ok(!html.includes('onclick'));assert.ok(!html.includes('side note'));
});
test('an owner correction replaces OCR text instead of displaying a stale original',()=>{
 const api=setup(),note={transcriptionMethod:'local-ocr',body:'我的校訂',ocrOriginalFields:{body:'old'},ocrLines:[{role:'body',text:'old',color:'red'}]};assert.equal(api.transcriptMarkup(note,'body'),'我的校訂');assert.equal(api.draftLabel({status:'ocr-draft'}),'機器辨識草稿');assert.equal(api.draftLabel({status:'reviewed'}),'已校對');
});

 test('OCR line breaks remain line breaks in the reading view',()=>{const api=setup(),note={transcriptionMethod:'local-ocr',body:'a\nb',ocrOriginalFields:{body:'a\nb'},ocrLines:[{role:'body',text:'a',color:'blue'},{role:'body',text:'b',color:'red'}]};const html=api.transcriptMarkup(note,'body');assert.ok(html.includes('</span>\n<span'));assert.ok(!html.includes('\\n'))});


test('photo order follows natural filenames and preserves legacy source identities',()=>{
 const api=setup();assert.equal(api.photoFilename({id:'note-030'}),'IMG_0349.JPG');assert.equal(api.photoFilename({id:'note-034'}),'IMG_0357.JPG');
 const notes=[{id:'a',source:'圖片_1.zip／IMG_0010.JPG'},{id:'b',source:'圖片_1.zip／IMG_0002.JPG'},{id:'c',source:'圖片_1.zip／GFHJ3964.JPG'}],before=notes.map(n=>n.id);
 assert.deepEqual([...notes].sort(api.comparePhotos).map(n=>n.id),['c','b','a']);assert.deepEqual(notes.map(n=>n.id),before);
});
test('handwritten sorting groups numbered continuations and leaves unknown numbers after them',()=>{
 const api=setup(),notes=[{id:'b',number:'13②'},{id:'u',number:'IMG_0010'},{id:'a',number:'13①'},{id:'c',number:'2'},{id:'d',number:'13'}];
 assert.deepEqual(notes.sort((a,b)=>api.comparePhotos(a,b,'handwritten')).map(n=>n.id),['c','d','a','b','u']);assert.equal(api.handwrittenNumber({number:'〔待確認〕（IMG_0358）'}),null);assert.equal(api.handwrittenNumber({number:'8–10〔本張條列編號〕'}),null);
});
