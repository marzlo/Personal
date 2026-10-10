import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
test('existing and new notes can link a quote by title or Notion URL without changing saved notes',()=>{
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');const nodes=new Map();const el=id=>{if(!nodes.has(id))nodes.set(id,{value:'',innerHTML:'',hidden:true,focus(){},querySelectorAll:()=>[]});return nodes.get(id)};
 const c={window:{},el,esc:x=>String(x??''),notionUrl:x=>x,taipeiToday:()=> '2026-10-10',tagsForArticle:a=>a.tags||[],namesFor:refs=>refs.map(u=>c.window.DASHBOARD_DATA.books.find(b=>b.url===u)?.title||'').join('、'),ideas:[{timeline:[{content:'原有記事保留',date:'2026-10-10',tag:'筆記',articleUrl:''}]}],selected:0};vm.createContext(c);
 for(const f of ['data.js','quote-bodies.js'])vm.runInContext(fs.readFileSync(new URL('../'+f,import.meta.url),'utf8'),c);
 for(const prefix of ['const DB=','const linkableArticles=','function searchLinkableArticles(','function articleOptions(','function openNote('])vm.runInContext(html.split('\n').find(l=>l.startsWith(prefix)),c);
 const url='https://pickle-trail-279.notion.site/c4e0393e4df640669cf82e5714a438ed';
 for(const index of [0,null]){
 vm.runInContext('openNote('+JSON.stringify(index)+')',c);if(index===0)assert.equal(el('timelineContent').value,'原有記事保留');
 for(const query of [url,'你會越來越看到事實的真相']){el('timelineSearch').value=query;vm.runInContext('articleOptions()',c);assert.ok(el('timelineResults').innerHTML.includes(url));}
 vm.runInContext('articleOptions('+JSON.stringify(url)+')',c);assert.ok(el('timelineSelected').innerHTML.includes('你會越來越看到事實的真相'));assert.equal(el('timelineArticle').value,url);
 }
 assert.equal(c.ideas[0].timeline[0].content,'原有記事保留');
 assert.ok(vm.runInContext("searchLinkableArticles('人生操作手冊').some(a=>a.title==='人生操作手冊')",c));
 assert.ok(fs.readFileSync(new URL('../series-study.js',import.meta.url),'utf8').includes('const results=searchLinkableArticles(q);'));
});
