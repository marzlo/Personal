import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
test('Salary study includes provided vocabulary, listening link and limited source scope while keeping dated order and asset version',()=>{
 const source=fs.readFileSync(new URL('../podcast-episodes.js',import.meta.url),'utf8'),c={window:{}};vm.runInNewContext(source,c);
 const episodes=c.window.PODCAST_EPISODES,e=episodes.find(e=>e.id==='sharingSalary');
 assert.equal(e.date,'2026-10-21');assert.equal(e.cards.length,12);assert.equal(e.studyNotes.priority.length,5);assert.equal(e.studyNotes.quiz.length,0);
 assert.equal(e.apple,'https://podcasts.apple.com/tw/podcast/the-indicator-from-planet-money/id1320118593?i=1000797339248');assert.ok(e.html.includes(e.apple));
 assert.equal(new Set(e.cards.map(w=>w[0].toLowerCase())).size,12);
 for(const word of e.cards)for(const field of word.slice(0,6))assert.ok(field.trim());
 for(const term of e.studyNotes.priority)assert.ok(e.cards.some(w=>w[0]===term));
 assert.ok(e.html.includes('兩段'));assert.ok(e.html.includes('非整集逐字稿'));
 assert.equal(e.cards[0][2],'Best-case scenario, we finish testing by Friday.');
 for(let i=1;i<episodes.length;i++)assert.ok(episodes[i-1].date>=episodes[i].date);
 assert.ok(episodes.some(e=>e.id==='campaignSpending'));
 const html=fs.readFileSync(new URL('../podcast.html',import.meta.url),'utf8');assert.ok(html.includes('podcast-episodes.js?v='+createHash('sha256').update(source).digest('hex').slice(0,12)));
});
