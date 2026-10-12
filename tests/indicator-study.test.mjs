import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
test('Indicator extracts only sourced glossary terms and examples, draws ten unique mixed cards',()=>{
 const c={window:{}};for(const f of ['data.js','article-bodies.js','indicator-study.js'])vm.runInNewContext(fs.readFileSync(new URL('../'+f,import.meta.url),'utf8'),c);
 const helper=c.window.IndicatorStudy;const list=helper.candidates(c.window.DASHBOARD_DATA.podcasts,c.window.ARTICLE_BODIES);assert.ok(list.length>=10);
 for(let n=0;n<20;n++){const cards=helper.draw(list);assert.equal(cards.length,10);assert.equal(new Set(cards.map(c=>c.id)).size,10);for(const type of ['單字','用詞','句子'])assert.ok(cards.some(c=>c.type===type));for(const card of cards)assert.ok(c.window.ARTICLE_BODIES[card.source].includes(card.text));}
 assert.equal(helper.isIndicator({tags:[' Indicator ']}),true);assert.equal(helper.isIndicator({tags:['Important']}),false);
 assert.equal(helper.draw([]).length,0);
});
