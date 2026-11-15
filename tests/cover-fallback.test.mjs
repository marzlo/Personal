import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
test('failed external cover uses a same-site image, correct credit, and cannot loop',()=>{
 const listeners={},credit={textContent:'Photo: Original / Unsplash'};
 const card={parentElement:{querySelectorAll:()=>[card]},querySelector:()=>credit};
 const img={dataset:{},matches:()=>true,closest:()=>card};
 vm.runInNewContext(fs.readFileSync(new URL('../cover-fallback.js',import.meta.url),'utf8'),{document:{baseURI:'https://marzlo.github.io/Personal/',addEventListener:(name,fn)=>listeners[name]=fn},URL});
 listeners.error({target:img});
 assert.equal(img.src,'https://marzlo.github.io/Personal/assets/ambience/sunlit-trees-small.webp');
 assert.equal(credit.textContent,'拾頁生成插圖 · 陽光樹蔭');
 img.src='failed-fallback';listeners.error({target:img});assert.equal(img.src,'failed-fallback');
 for(const file of ['sunlit-trees','quiet-coast','reading-room','city-cafe'])assert.ok(fs.existsSync(new URL('../assets/ambience/'+file+'-small.webp',import.meta.url)));
});
