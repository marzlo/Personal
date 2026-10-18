import test from 'node:test';
import assert from 'node:assert/strict';
import {quoteSearchCandidates,searchQuotes} from '../scripts/quote-search.mjs';
test('Keyword search uses complete original passages, matches all keywords, preserves sources and deduplicates',()=>{
 const url='https://pickle-trail-279.notion.site/11111111111111111111111111111111';
 const sentence='架構二的觀念可以幫助我們理解內在的創造力，以及如何在日常生活裡運用不同的可能性。';
 const neutral='這個架構二的資料表格包含多個欄位與詳細的分類方式，請依照編號逐一核對完整的內容。';
 const db={books:[],podcasts:[{title:'原文章',url}],quotes:[]};
 const cards=quoteSearchCandidates(db,{[url]:sentence+'\n'+neutral+'\n# 未完成標題\n架構二只有片段'},{});
 const matches=searchQuotes([...cards,...cards],'架構二 創造力');
 assert.equal(matches.length,1);assert.equal(matches[0].text,sentence);
 assert.equal(matches[0].notionUrl,url);assert.equal(matches[0].sourceTitle,'原文章');
 const grouped=searchQuotes(cards,'架構二');assert.equal(grouped.length,1);assert.ok(grouped[0].passages.includes(neutral));assert.ok(grouped[0].passages.includes(sentence));
 assert.deepEqual(searchQuotes(cards,' '),[]);assert.deepEqual(searchQuotes(cards,'不存在的詞'),[]);
 assert.ok(!cards.some(q=>q.text.includes('未完成標題')||q.text==='架構二只有片段'));
 assert.equal(searchQuotes([{text:'A complete ORIGINAL passage.',notionUrl:url}],'original').length,1);
});

test('Background worker builds its index only on first search and reuses it for later requests',async()=>{
 const {default:fs}=await import('node:fs');const {default:vm}=await import('node:vm');
 const replies=[];let builds=0;
 const c={self:{postMessage:message=>replies.push(message)},quoteSearchCandidates(){builds++;return [{text:'架構二的完整原文句子。',notionUrl:'source'}]},searchQuotes};
 vm.runInNewContext(fs.readFileSync(new URL('../quote-search-worker.js',import.meta.url),'utf8').replace(/^import[^\n]*\n/,''),c);
 c.self.onmessage({data:{type:'init',db:{},articleBodies:{},quoteBodies:{}}});assert.equal(builds,0);
 c.self.onmessage({data:{type:'search',id:1,query:'架構二'}});assert.equal(builds,1);assert.equal(replies[0].matches.length,1);assert.equal(replies[0].id,1);
 c.self.onmessage({data:{type:'search',id:2,query:'不存在'}});assert.equal(builds,1);assert.equal(replies[1].matches.length,0);assert.equal(replies[1].id,2);
});

test('One result per source article keeps all distinct matching passages and prefers the shortest preview',()=>{
 const cards=[{text:'風暴中的自己，可以用不同的方式重新理解生活。',notionUrl:'a#block1'}, {text:'面對風暴，依然能夠看見新的可能性。',notionUrl:'a#block2'}, {text:'另一篇文章也談到風暴。',notionUrl:'b'}];
 const results=searchQuotes([...cards,cards[0]],'風暴');assert.equal(results.length,2);assert.equal(results[0].passages.length,2);assert.equal(results[0].text,cards[1].text);
});
