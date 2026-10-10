import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
test('podcast groups sort by count, split only uncredited Saturday items, and relabel Lucy',()=>{
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');const c={};vm.createContext(c);vm.runInContext(html.split('\n').find(l=>l.startsWith('function groupPodcastsByAuthor(')),c);
 const items=[{title:'A(周六)',authors:[]},{title:'B（週六）',authors:[]},{title:'C',authors:[]},{title:'D(周六)',authors:['Seth']},{title:'E',authors:['李如心（Lucy Lee）']},{title:'F',author:'李如心'},{title:'G',authors:['李如心','李如心（Lucy Lee）']}];
 const before=JSON.stringify(items),groups=c.groupPodcastsByAuthor(items);
 assert.deepEqual(Array.from(groups,g=>g[0]),['唯識真義','周六課程',...['Seth','未標示作者'].sort((a,b)=>a.localeCompare(b,'zh-Hant'))]);
 assert.equal(groups[0][2].length,3);assert.equal(groups[1][2].length,2);assert.equal(groups.find(g=>g[0]==='Seth')[2][0].title,'D(周六)');assert.equal(groups.find(g=>g[0]==='未標示作者')[2][0].title,'C');assert.equal(JSON.stringify(items),before);
});
