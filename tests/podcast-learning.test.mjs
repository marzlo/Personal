import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function setup(tags) {
  const elements = new Map();
  function element() {return {hidden:false,value:'',textContent:'',children:[],append(...items){this.children.push(...items)},replaceChildren(){this.children=[]},setAttribute(){},focus(){}};}
  const get = id => {if(!elements.has(id))elements.set(id,element());return elements.get(id)};
  get('studyEditor').hidden=true; get('scope').value='episode';
  let stored=JSON.stringify(tags); const events={};
  const context={document:{getElementById:get,createElement:element,querySelector:()=>get('source'),querySelectorAll:()=>[]},localStorage:{getItem:()=>stored},window:{scrollTo(){},addEventListener:(name,fn)=>events[name]=fn,ShiyeNotes:{write(key,value){assert.equal(key,'shiyeArticleTags');stored=JSON.stringify(value)}}}};
  vm.runInNewContext(fs.readFileSync(new URL('../podcast-learning.js',import.meta.url),'utf8'),context);
  return {get,events,stored:()=>JSON.parse(stored)};
}

test('Podcast saves preserve legacy tags, import old cards and keep removed legacy cards removed',()=>{
  const old={id:'old-id',text:'legacy phrase',meaning:'舊收藏',source:'https://example.com/article',title:'舊集數',examples:[{text:'A legacy example.',meaning:'舊例句'}]};
  const original={__searchTags:['信念'],'article-url':['Important'],__indicatorSaved:[old]};
  const s=setup(original);
  assert.equal(s.get('savedCount').textContent,'1 個收藏');
  assert.equal(s.get('position').textContent,'1 / 6');
  s.get('scope').value='saved';s.get('scope').onchange();
  assert.equal(s.get('term').textContent,'legacy phrase');
  assert.equal(s.get('source').href,old.source);
  s.get('save').onclick();
  assert.deepEqual(s.stored().__indicatorSaved,[old]);
  assert.deepEqual(s.stored().__searchTags,['信念']);
  assert.deepEqual(s.stored()['article-url'],['Important']);
  assert.deepEqual(s.stored().__podcastSaved,[]);
  s.events['shiye:notes-loaded']({detail:{data:{shiyeArticleTags:s.stored()}}});
  assert.equal(s.get('savedCount').textContent,'0 個收藏');
});

test('Podcast note editor protects a draft and saves alongside other episode notes',()=>{
  const s=setup({__podcastNotes:{healthBenefits:'原筆記',otherEpisode:'另一集'},__searchTags:['信念']});
  s.get('editNote').onclick();s.get('note').value='新草稿';
  s.events['shiye:notes-loaded']({detail:{data:{shiyeArticleTags:{__podcastNotes:{healthBenefits:'遠端'}}}}});
  assert.equal(s.get('note').value,'新草稿');
  s.get('saveNote').onclick();
  assert.deepEqual(s.stored().__podcastNotes,{healthBenefits:'新草稿',otherEpisode:'另一集'});
  assert.deepEqual(s.stored().__searchTags,['信念']);
  assert.equal(s.get('studyEditor').hidden,true);
});
