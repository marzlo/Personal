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
 assert.ok(searchQuotes(cards,'架構二').some(q=>q.text===neutral));
 assert.deepEqual(searchQuotes(cards,' '),[]);assert.deepEqual(searchQuotes(cards,'不存在的詞'),[]);
 assert.ok(!cards.some(q=>q.text.includes('未完成標題')||q.text==='架構二只有片段'));
 assert.equal(searchQuotes([{text:'A complete ORIGINAL passage.',notionUrl:url}],'original').length,1);
});
