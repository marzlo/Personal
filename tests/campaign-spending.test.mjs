import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
test('Campaign notes retain all vocabulary and five practice answers without replacing earlier episodes',()=>{
 const c={window:{}};vm.runInNewContext(fs.readFileSync(new URL('../podcast-episodes.js',import.meta.url),'utf8'),c);
 const episodes=c.window.PODCAST_EPISODES,e=episodes.find(e=>e.id==='campaignSpending');
 assert.equal(e.date,'2026-10-15');assert.equal(e.cards.length,34);
 assert.equal(new Set(e.cards.map(w=>w[0].toLowerCase())).size,34);
 for(const word of e.cards)for(const field of word.slice(0,6))assert.ok(field.trim());
 assert.equal(e.studyNotes.priority.length,5);
 for(const term of e.studyNotes.priority)assert.ok(e.cards.some(w=>w[0]===term&&w[6]));
 assert.equal(e.studyNotes.quiz.map(q=>q.answer).join(','),'0,1,2,0,1');
 assert.ok(e.cards.some(w=>w[0]==='Voter turnout'));assert.ok(e.cards.some(w=>w[0]==='Turn out voters'));
 assert.equal(episodes[0].id,'movieMarket');assert.equal(episodes[1].id,e.id);
 for(const id of ['aiAsilomar','economicsNobel','tariffRefunds','healthBenefits'])assert.ok(episodes.some(e=>e.id===id));
 assert.ok(e.html.includes('id="episodePractice"'));assert.ok(e.html.includes('使用者提供'));
});
