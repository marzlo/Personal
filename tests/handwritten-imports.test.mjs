import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('archive imports retain source identity, photos and honest transcription status',()=>{
 const context={window:{}};
 for(const file of ['handwritten-data.js','handwritten-imports.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),context);
 const originals=context.window.HANDWRITTEN_NOTES,imports=context.window.HANDWRITTEN_IMPORTS;
 const all=[...originals,...imports];
 assert.equal(imports.length,302);
 assert.equal(new Set(all.map(n=>n.id)).size,all.length);
 assert.equal(new Set(imports.map(n=>n.sourceSha256)).size,imports.length);
 for(const n of imports){
  assert.equal(n.id,'photo-'+n.sourceSha256.slice(0,16));
  assert.match(n.sourceArchive,/\.zip$/);
  assert.ok(n.source.includes(n.sourceArchive));
  assert.ok(fs.statSync(n.image).size>10000);
  if(!n.body)assert.ok(['untranscribed','needs-photo'].includes(n.status));
 }
 const report=JSON.parse(fs.readFileSync('handwritten-import-report.json','utf8'));
 assert.equal(report.batches.length,68);
 assert.equal(report.batches.flatMap(b=>b.images).length,337);
 assert.equal(report.duplicates,35);
 assert.equal(report.new,302);
});
