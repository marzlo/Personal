import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function setup(tags, episode = 'healthBenefits') {
  const elements = new Map();
  function element() {return {hidden:false,value:'',textContent:'',children:[],append(...items){this.children.push(...items)},replaceChildren(){this.children=[]},setAttribute(){},focus(){}};}
  const get = id => {if(!elements.has(id))elements.set(id,element());return elements.get(id)};
  get('studyEditor').hidden=true; get('scope').value='episode';
  let stored=JSON.stringify(tags); const events={};
  const context={URLSearchParams,document:{getElementById:get,createElement:element,querySelector:()=>get('source'),querySelectorAll:()=>[]},localStorage:{getItem:()=>stored},window:{location:{search:'?episode='+episode},scrollTo(){},addEventListener:(name,fn)=>events[name]=fn,ShiyeNotes:{write(key,value){assert.equal(key,'shiyeArticleTags');stored=JSON.stringify(value)}}}};
  vm.runInNewContext(fs.readFileSync(new URL('../podcast-episodes.js',import.meta.url),'utf8'),context);
  vm.runInNewContext(fs.readFileSync(new URL('../podcast-learning.js',import.meta.url),'utf8'),context);
  return {get,events,stored:()=>JSON.parse(stored)};
}

test('Podcast saves preserve legacy tags, import old cards and keep removed legacy cards removed',()=>{
  const old={id:'old-id',text:'legacy phrase',meaning:'舊收藏',source:'https://example.com/article',title:'舊集數',examples:[{text:'A legacy example.',meaning:'舊例句'}]};
  const original={__searchTags:['信念'],'article-url':['Important'],__indicatorSaved:[old]};
  const s=setup(original);
  assert.equal(s.get('savedCount').textContent,'1 個收藏');
  assert.equal(s.get('position').textContent,'1 / 24');
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

test('Each episode has its own cards and notes; mixed review includes both episodes',()=>{
  const s=setup({__podcastNotes:{healthBenefits:'舊筆記',tariffRefunds:'關稅筆記'}},'tariffRefunds');
  assert.equal(s.get('term').textContent,'pass along');
  assert.equal(s.get('note').value,'關稅筆記');
  s.get('scope').value='all';s.get('scope').onchange();
  assert.equal(s.get('position').textContent,'1 / 73');
  s.get('episodeSelect').value='healthBenefits';s.get('episodeSelect').onchange();
  s.get('scope').value='episode';s.get('scope').onchange();
  assert.equal(s.get('term').textContent,'ballpark');
  assert.equal(s.get('note').value,'舊筆記');
  s.get('editNote').onclick();s.get('note').value='未存草稿';
  s.get('episodeSelect').value='tariffRefunds';s.get('episodeSelect').onchange();
  assert.equal(s.get('episodeSelect').value,'healthBenefits');
  assert.equal(s.get('note').value,'未存草稿');
  s.get('saveNote').onclick();
  assert.deepEqual(s.stored().__podcastNotes,{healthBenefits:'未存草稿',tariffRefunds:'關稅筆記'});
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

test('Deleted cards stay out of episode, mixed review and saved words after reload, and can be restored',()=>{
  const original={__podcastSaved:['ballpark'],__searchTags:['信念'],__podcastNotes:{healthBenefits:'保留筆記'}};
  const s=setup(original);s.get('deleteCard').onclick();
  assert.equal(s.get('term').textContent,'strike out on one’s own');
  assert.equal(s.get('position').textContent,'1 / 23');
  assert.equal(s.get('savedCount').textContent,'0 個收藏');
  assert.deepEqual(s.stored().__podcastNotes,original.__podcastNotes);
  assert.deepEqual(s.stored().__searchTags,original.__searchTags);
  const again=setup(s.stored());
  assert.equal(again.get('position').textContent,'1 / 23');
  again.get('scope').value='all';again.get('scope').onchange();
  assert.equal(again.get('position').textContent,'1 / 72');
  again.get('scope').value='saved';again.get('scope').onchange();
  assert.equal(again.get('position').textContent,'0 / 0');
  again.get('deletedList').children[0].children[2].onclick();
  assert.equal(again.get('term').textContent,'ballpark');
  assert.equal(again.get('savedCount').textContent,'1 個收藏');
  assert.deepEqual(again.stored().__podcastDeleted,[]);
});

test('Deleting every card keeps an empty carousel usable and remote restoration updates it',()=>{
  const s=setup({},'economicsNobel');
  for(let i=0;i<12;i++)s.get('deleteCard').onclick();
  assert.equal(s.get('position').textContent,'0 / 0');
  assert.equal(s.get('deleteCard').disabled,true);
  assert.equal(s.stored().__podcastDeleted.length,12);
  s.events['shiye:notes-loaded']({detail:{data:{shiyeArticleTags:{...s.stored(),__podcastDeleted:[]}}}});
  assert.equal(s.get('position').textContent,'1 / 12');
});
