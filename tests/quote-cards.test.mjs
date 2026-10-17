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

 test('unfinished lead-ins include their continuation and never cross headings or truncate',async()=>{
 const {completeQuotePassages}=await import('../scripts/quote-cards.mjs');
 const lead='但如果從實際生命來看，其實可以用一個非常簡單的方式觀察：';const tail='看一個人有沒有能力打破自己的慣性。';
 const cards=completeQuotePassages(lead+'\n\n'+tail);assert.ok(cards.includes(lead+'\n'+tail));assert.ok(!cards.includes(lead));
 assert.equal(completeQuotePassages(lead).length,0);
 assert.equal(completeQuotePassages(lead+'\n## 另一個主題\n'+tail).length,0);
 assert.equal(completeQuotePassages('很長的生命與自己的句子'.repeat(60)+'。').length,0);
 assert.ok(cards.every(text=>/[。！？.!?][」』”’）)"']*$/.test(text)));
 });
