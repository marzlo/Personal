import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('all imported photos have real transcription drafts with their original identity intact',()=>{
 const context={window:{}};
 vm.runInNewContext(fs.readFileSync('handwritten-imports.js','utf8'),context);
 const notes=context.window.HANDWRITTEN_IMPORTS;
 const report=JSON.parse(fs.readFileSync('handwritten-transcription-report.json','utf8'));
 assert.equal(notes.length,307);
 assert.equal(report.missing.length,0);
 assert.equal(report.visualDrafts+report.machineDrafts+report.needsPhoto.length,307);
 for(const note of notes){
  assert.equal(note.id,'photo-'+note.sourceSha256.slice(0,16));
  if(note.status==='needs-photo'){assert.equal(note.number,'IMG_0260');assert.equal(note.body,'');assert.ok(note.transcriptionIssue.includes('晃動'));continue}
  assert.ok(note.body.length>30,note.id);
  assert.ok(!note.body.includes('文字尚待轉錄'),note.id);
  assert.ok(['pending','ocr-draft'].includes(note.status));
  if(note.transcriptionMethod==='local-ocr'){
   assert.equal(note.status,'ocr-draft');
   for(const field of ['body','question','annotation'])assert.equal(note.ocrOriginalFields[field],note[field]);
   assert.ok(note.ocrLines.length>0);
   for(const line of note.ocrLines){assert.ok(['body','question','annotation'].includes(line.role));assert.ok(['red','blue','green','unknown'].includes(line.color));if(line.uncertain)assert.ok(line.text.includes('待確認'))}
  }
 }
 assert.ok(notes.find(n=>n.number==='13①').body.includes('權杖'));
 assert.ok(notes.find(n=>n.number==='13②').body.includes('光之柱'));
});
