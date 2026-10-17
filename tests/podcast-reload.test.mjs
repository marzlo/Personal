import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
function setup(editing){
  const events={},history=[],status={textContent:''};let reloads=0;
  const nodes={podcastNavigation:{querySelectorAll:()=>[],getBoundingClientRect:()=>({height:60})},podcastJump:{addEventListener(){}},podcastReload:{addEventListener:(type,fn)=>events[type]=fn},podcastReloadStatus:status,studyEditor:{hidden:!editing},episodeSelect:{value:'movieMarket'},reflection:{scrollIntoView(){}},note:{focus(){}},episodeContent:{}};
  vm.runInNewContext(fs.readFileSync(new URL('../podcast-navigation.js',import.meta.url),'utf8'),{URL,document:{getElementById:id=>nodes[id]},location:{href:'https://example.com/podcast.html?episode=aiAsilomar#summary',hash:'#summary',reload:()=>reloads++},history:{replaceState:(_,__,url)=>history.push(url)},window:{addEventListener(){}},MutationObserver:class{observe(){}},requestAnimationFrame(){}});
  return {click:()=>events.click(),reloads:()=>reloads,history,status};
}
test('Reload preserves selected episode and section; open notes editor blocks reload',()=>{
  const normal=setup(false);normal.click();assert.equal(normal.reloads(),1);assert.equal(normal.history[0],'/podcast.html?episode=movieMarket#summary');
  const draft=setup(true);draft.click();assert.equal(draft.reloads(),0);assert.equal(draft.history.length,0);assert.match(draft.status.textContent,/儲存或取消/);
});
