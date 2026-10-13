import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
test('Indicator extracts only sourced glossary terms and examples, keeps examples inside vocabulary cards',()=>{
 const c={window:{}};for(const f of ['data.js','article-bodies.js','indicator-study.js'])vm.runInNewContext(fs.readFileSync(new URL('../'+f,import.meta.url),'utf8'),c);
 const helper=c.window.IndicatorStudy;const list=helper.candidates(c.window.DASHBOARD_DATA.podcasts,c.window.ARTICLE_BODIES);assert.ok(list.length>0);
 const complete=helper.draw(list,list.length);for(const type of ['單字','用詞'])assert.ok(complete.some(c=>c.type===type));
 // A random subset is not guaranteed to contain every type as the source pool grows.
 for(let n=0;n<20;n++){const cards=helper.draw(list);assert.equal(cards.length,Math.min(10,list.length));assert.equal(new Set(cards.map(c=>c.id)).size,cards.length);for(const card of cards){assert.notEqual(card.type,'句子');assert.ok(c.window.ARTICLE_BODIES[card.source].includes(card.text));assert.ok(card.examples.length>0);for(const example of card.examples)assert.ok(c.window.ARTICLE_BODIES[card.source].includes(example.text));}}
 assert.equal(helper.isIndicator({tags:[' Indicator ']}),true);assert.equal(helper.isIndicator({tags:['Important']}),false);
 assert.equal(helper.draw([]).length,0);
});
