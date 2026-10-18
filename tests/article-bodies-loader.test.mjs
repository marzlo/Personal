import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
test('Article archive loads after page load, shares requests and retries failures without blocking startup',async()=>{
 const appended=[],events={},dispatched=[];
 const c={Promise,setTimeout:fn=>fn(),CustomEvent:class{constructor(type){this.type=type}},window:{DASHBOARD_DATA:{syncedAt:'snapshot'},addEventListener:(name,fn)=>events[name]=fn,dispatchEvent:event=>dispatched.push(event.type)},document:{readyState:'loading',createElement:()=>({remove(){}}),head:{append:s=>appended.push(s)}}};
 vm.runInNewContext(fs.readFileSync(new URL('../article-bodies-loader.js',import.meta.url),'utf8'),c);
 assert.equal(appended.length,0);
 const first=c.window.ShiyeLoadArticleBodies();assert.equal(c.window.ShiyeLoadArticleBodies(),first);assert.equal(appended.length,1);
 assert.equal(appended[0].src,'./article-bodies.js?v=snapshot');
 appended[0].onerror();await assert.rejects(first);assert.equal(c.window.ShiyeArticleBodiesState,'error');
 const retry=c.window.ShiyeLoadArticleBodies();assert.equal(appended.length,2);
 c.window.ARTICLE_BODIES={};appended[1].onload();await retry;
 assert.equal(c.window.ShiyeArticleBodiesState,'ready');assert.ok(dispatched.includes('shiye:article-bodies-ready'));
 events.load();assert.equal(appended.length,2);
});
