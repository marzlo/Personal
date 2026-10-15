import test from 'node:test';
import assert from 'node:assert/strict';
import {selectQuoteCards} from '../scripts/quote-cards.mjs';
test('ten distinct quote cards preserve original text and source; short pools are not fabricated',()=>{
 const candidates=Array.from({length:15},(_,i)=>({text:'原文'+i,sourceUrl:'source'+i,page:i}));
 const cards=selectQuoteCards([...candidates,candidates[0]],10,()=>0.5);
 assert.equal(cards.length,10);assert.equal(new Set(cards.map(c=>c.text)).size,10);
 for(const card of cards)assert.ok(candidates.includes(card));
 assert.equal(selectQuoteCards(candidates.slice(0,2)).length,2);
 assert.deepEqual(selectQuoteCards([]),[]);
});

test('sources have equal opportunity, book-related podcasts share their book group, recent sources wait',()=>{
 const candidates=[...Array.from({length:100},(_,i)=>({text:'many '+i,sourceUrl:'book-a'})),...Array.from({length:12},(_,i)=>({text:'other '+i,sourceUrl:'book-'+i}))];
 const selected=selectQuoteCards(candidates,10,()=>0.5,[{sourceUrl:'book-a'}]);assert.equal(selected.length,10);assert.equal(new Set(selected.map(c=>c.sourceUrl)).size,10);assert.ok(selected.every(c=>c.sourceUrl!=='book-a'));
 assert.equal(selectQuoteCards(candidates.slice(0,100)).length,1);
});
