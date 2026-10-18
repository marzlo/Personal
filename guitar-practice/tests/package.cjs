const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = path.resolve(__dirname, '..');
for (const page of ['index.html','library.html','studio.html']) {
  const text = fs.readFileSync(path.join(base,page),'utf8');
  assert(/<!doctype html>/i.test(text),page+' must be standalone');
  assert(text.includes('級數配和弦') && text.includes('library.html'),page+' needs navigation');
  assert(!text.includes('C:/Users/'),page+' must not depend on local paths');
}
const library=fs.readFileSync(path.join(base,'src/library.html'),'utf8');
const data=JSON.parse(library.match(/id="chord-library-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
assert.equal(data.length,10);
assert.equal(data.reduce((n,g)=>n+g.count,0),68);
assert.equal(data.reduce((n,g)=>n+g.images.length,0),11);
assert(data.every(g=>g.images.every(src=>src.startsWith('data:image/jpeg;base64,'))));
console.log('PASS: three standalone pages, navigation, 10 groups / 68 shapes / 11 embedded chart images; no local paths.');
