import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('Series recommendations include cross-series body matches and exclude linked, title-only and missing-body articles',()=>{
 const c={window:{},term:'架構二',note:{links:[]},config:{tag:'Seth賽斯'}};
 vm.createContext(c);
 for(const file of ['data.js','article-bodies.js'])vm.runInContext(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'),c);
 const article=c.window.DASHBOARD_DATA.podcasts.find(a=>a.url.includes('7e41c7f3357e83199639016c952bbc84'));
 assert.ok(article);
 assert.ok(!article.tags.includes(c.config.tag));
 const host={innerHTML:'',querySelectorAll:()=>[]};
 Object.assign(c,{articlePool:[article,{url:'title-only',title:'架構二',tags:['Seth賽斯']},{url:'missing-body',tags:['Seth賽斯']}],linkableArticles:[article],find:()=>host,card:a=>'MATCH:'+a.url});
 const source=fs.readFileSync(new URL('../series-study.js',import.meta.url),'utf8');
 vm.runInContext(source.split('\n').find(line=>line.startsWith('function showArticles()')),c);
 vm.runInContext('showArticles()',c);
 assert.ok(host.innerHTML.includes('推薦文章（1）'));
 assert.ok(host.innerHTML.includes(article.url));
 assert.ok(!host.innerHTML.includes('MATCH:title-only'));
 assert.ok(!host.innerHTML.includes('MATCH:missing-body'));
 c.note.links=[article.url];vm.runInContext('showArticles()',c);
 assert.ok(host.innerHTML.includes('已選文章（1）'));
 assert.ok(host.innerHTML.includes('推薦文章（0）'));
 assert.equal(host.innerHTML.split('MATCH:'+article.url).length-1,1);
 c.note.links=[];c.term=' ';vm.runInContext('showArticles()',c);
 assert.ok(host.innerHTML.includes('推薦文章（0）'));
});
