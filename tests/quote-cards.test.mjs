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
