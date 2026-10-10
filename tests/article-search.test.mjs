import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
test('search tags match full text and preserve legacy per-article tags; feed combines type and search',()=>{
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');const query={value:'信念'},more={setAttribute(){}};let result='';const items=[{title:'原文章',url:'a',kind:'Podcast',tags:['舊標籤']},{title:'另一篇',url:'b',kind:'含音訊書籍',tags:[]}];const saved={a:['個人標籤'],__searchTags:['信念']};
 const c={window:{ARTICLE_BODIES:{a:'內在的信念會影響生活。',b:'不同內容'}},customTags:saved,articleTagFilter:'',articleSearchTag:'信念',articleFilter:'all',showAllArticles:false,articlePool:items,podcasts:[items[0]],audioBooks:[items[1]],tagsForArticle:a=>a.tags.concat(saved[a.url]||[]),renderArticleTagFilters(){},document:{getElementById:()=>query,querySelector:s=>s==='#showMoreArticles'?more:{set innerHTML(x){},querySelectorAll:()=>[]}},cardHost:{set innerHTML(x){result=x}},esc:x=>String(x||''),notionUrl:x=>x,dateShort:()=>''};vm.createContext(c);
 for(const prefix of ['function articleMatchesSearch(','function searchTags(','function renderCards('])vm.runInContext(html.split('\n').find(l=>l.startsWith(prefix)),c);
 vm.runInContext('renderCards()',c);assert.ok(result.includes('原文章'));assert.ok(!result.includes('另一篇'));assert.equal(c.articleMatchesSearch(items[0],'個人標籤'),true);assert.equal(c.articleMatchesSearch(items[0],'信念 原文章'),true);assert.equal(c.articleMatchesSearch(items[0],'信念 未符合'),false);
 c.articleFilter='含音訊書籍';vm.runInContext('renderCards()',c);assert.ok(result.includes('目前沒有符合的文章'));assert.deepEqual(saved,{a:['個人標籤'],__searchTags:['信念']});
 assert.ok(!html.includes('id="manageArticleTags"'));assert.ok(!html.includes('id="articleTagDialog"'));
});
