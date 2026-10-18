const host=document.getElementById('featuredQuote');
if(host){
 const section=document.createElement('section');section.className='quote-search';section.setAttribute('aria-label','關鍵字找句子');
 section.innerHTML='<h2>關鍵字找句子</h2><form><label for="quoteKeyword">輸入關鍵字，從文章原文挑選摘句</label><div class="quote-search-tools"><input id="quoteKeyword" type="search" placeholder="例如：架構二、信念（多個詞請用空白分隔）"><button type="submit">搜尋</button><button type="button" data-search-clear>清除</button></div></form><p class="hint">搜尋現有書籍、Podcast 與金句的原文片段，每篇文章只列一次。長按或拖曳選取文字，再收藏選取範圍；登入後可同步。</p><p data-search-status role="status" aria-live="polite">輸入關鍵字開始搜尋。</p><div data-search-results></div><button type="button" data-search-more hidden>顯示更多文章</button>';
 host.after(section);
 const input=section.querySelector('input'),results=section.querySelector('[data-search-results]'),status=section.querySelector('[data-search-status]'),more=section.querySelector('[data-search-more]');
 const selections=new Map(),passageChoices=new Map();
 let worker, matches=[],limit=20,timer,requestId=0;
 function selectedQuote(index){const {passages,...quote}=matches[index];return {...quote,text:selections.get(index)||''}}
 function updateButtons(){results.querySelectorAll('[data-quote-save]').forEach(button=>{const index=Number(button.dataset.index),quote=selectedQuote(index),marked=quote.text&&window.ShiyeQuoteFavorites?.isSaved(quote);button.disabled=!quote.text;button.textContent=!quote.text?'先選取摘句範圍':marked?'★ 已收藏':'☆ 收藏選取摘句';button.setAttribute('aria-pressed',String(Boolean(marked)))})}
 function render(){
  results.replaceChildren();
  for(const [index,quote] of matches.slice(0,limit).entries()){
   const article=document.createElement('article'),text=document.createElement('textarea'),meta=document.createElement('div'),source=document.createElement('a'),save=document.createElement('button');
   text.value=(quote.passages||[quote.text])[passageChoices.get(index)||0];text.readOnly=true;text.rows=6;text.className='quote-range-text';text.setAttribute('aria-label','原文片段，請選取要收藏的文字');text.setAttribute('data-no-translate','');
   const preview=document.createElement('blockquote');preview.className='quote-range-preview';preview.setAttribute('data-no-translate','');
   function showSelection(){preview.textContent=selections.get(index)||'尚未選取摘句。請在上方原文長按或拖曳選取文字。';updateButtons()}
   text.onselect=()=>{const value=text.value.slice(text.selectionStart,text.selectionEnd).trim();if(value){selections.set(index,value);showSelection()}};
   const whole=document.createElement('button');whole.type='button';whole.textContent='使用整個片段';whole.onclick=()=>{selections.set(index,text.value.trim());showSelection()};
   const passages=quote.passages||[quote.text];
   if(passages.length>1){
    const label=document.createElement('label'),select=document.createElement('select');label.textContent='本篇符合片段 ';select.setAttribute('aria-label','選擇本篇符合片段');
    passages.forEach((passage,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=(i+1)+' / '+passages.length+' · '+passage.slice(0,35).replace(/\n/g,' ')+'…';select.append(option)});
    select.value=String(passageChoices.get(index)||0);
    select.onchange=()=>{passageChoices.set(index,Number(select.value));text.value=passages[Number(select.value)];selections.delete(index);showSelection()};label.append(select);article.append(label);
   }

   source.textContent=quote.sourceTitle+(quote.page?' · 第 '+quote.page+' 頁':'')+' ↗';source.setAttribute('data-no-translate','');
   const url=String(quote.notionUrl||quote.sourceUrl||'');source.href=url.startsWith('https://pickle-trail-279.notion.site/')?url:'#';source.target='_blank';source.rel='noreferrer';
   save.type='button';save.setAttribute('data-quote-save','');save.dataset.index=String(index);save.onclick=()=>{const selected=selectedQuote(index);if(selected.text)window.ShiyeQuoteFavorites?.toggle(selected)};
   meta.append(source,save);article.append(text,whole,preview,meta);results.append(article);showSelection();
  }
  more.hidden=matches.length<=limit;
  status.textContent=input.value.trim()?(matches.length?'找到 '+matches.length+' 篇文章，顯示 '+Math.min(matches.length,limit)+' 篇。':'找不到符合的完整句子，請換個關鍵字。'):'輸入關鍵字開始搜尋。';updateButtons();
 }
 async function search(){
  clearTimeout(timer);limit=20;selections.clear();passageChoices.clear();const id=++requestId;
  if(!input.value.trim()){matches=[];render();return}
  results.replaceChildren();more.hidden=true;status.textContent='正在搜尋原文句子…';
  try{
   if(window.ShiyeLoadArticleBodies){status.textContent='正在載入文章正文，完成後會顯示搜尋結果…';await window.ShiyeLoadArticleBodies();if(id!==requestId)return}
   if(!worker){
    worker=new Worker(new URL('./quote-search-worker.js',import.meta.url),{type:'module'});
    worker.onmessage=event=>{if(event.data.id!==requestId)return;if(event.data.error){status.textContent='搜尋失敗，請再試一次。';return}matches=event.data.matches;render()};
    worker.onerror=()=>{worker?.terminate();worker=null;status.textContent='搜尋暫時無法使用，請重新搜尋。'};
    worker.postMessage({type:'init',db:window.DASHBOARD_DATA,articleBodies:window.ARTICLE_BODIES||{},quoteBodies:window.QUOTE_BODIES||{}});
   }
   worker.postMessage({type:'search',id,query:input.value});
  }catch{worker?.terminate();worker=null;status.textContent='搜尋暫時無法使用，請重新搜尋。'}
 }
 section.querySelector('form').onsubmit=event=>{event.preventDefault();search()};
 input.oninput=()=>{clearTimeout(timer);timer=setTimeout(search,400)};
 section.querySelector('[data-search-clear]').onclick=()=>{input.value='';search();input.focus()};
 more.onclick=()=>{limit+=20;render()};
 window.addEventListener('shiye:quote-favorites-changed',updateButtons);
 window.addEventListener('shiye:notes-loaded',updateButtons);
}
