const host=document.getElementById('featuredQuote');
if(host){
 const section=document.createElement('section');section.className='quote-search';section.setAttribute('aria-label','關鍵字找句子');
 section.innerHTML='<h2>關鍵字找句子</h2><form><label for="quoteKeyword">輸入關鍵字，從文章原文挑選摘句</label><div class="quote-search-tools"><input id="quoteKeyword" type="search" placeholder="例如：架構二、信念（多個詞請用空白分隔）"><button type="submit">搜尋</button><button type="button" data-search-clear>清除</button></div></form><p class="hint">搜尋現有書籍、Podcast 與金句的完整原文句子；登入後可收藏並同步。</p><p data-search-status role="status" aria-live="polite">輸入關鍵字開始搜尋。</p><div data-search-results></div><button type="button" data-search-more hidden>顯示更多句子</button>';
 host.after(section);
 const input=section.querySelector('input'),results=section.querySelector('[data-search-results]'),status=section.querySelector('[data-search-status]'),more=section.querySelector('[data-search-more]');
 let worker, matches=[],limit=20,timer,requestId=0;
 function updateButtons(){results.querySelectorAll('[data-quote-save]').forEach(button=>{const marked=window.ShiyeQuoteFavorites?.isSaved(matches[Number(button.dataset.index)]);button.textContent=marked?'★ 已收藏':'☆ 收藏摘句';button.setAttribute('aria-pressed',String(Boolean(marked)))})}
 function render(){
  results.replaceChildren();
  for(const [index,quote] of matches.slice(0,limit).entries()){
   const article=document.createElement('article'),text=document.createElement('blockquote'),meta=document.createElement('div'),source=document.createElement('a'),save=document.createElement('button');
   text.textContent=quote.text;text.setAttribute('data-no-translate','');
   source.textContent=quote.sourceTitle+(quote.page?' · 第 '+quote.page+' 頁':'')+' ↗';source.setAttribute('data-no-translate','');
   const url=String(quote.notionUrl||quote.sourceUrl||'');source.href=url.startsWith('https://pickle-trail-279.notion.site/')?url:'#';source.target='_blank';source.rel='noreferrer';
   save.type='button';save.setAttribute('data-quote-save','');save.dataset.index=String(index);save.onclick=()=>window.ShiyeQuoteFavorites?.toggle(quote);
   meta.append(source,save);article.append(text,meta);results.append(article);
  }
  more.hidden=matches.length<=limit;
  status.textContent=input.value.trim()?(matches.length?'找到 '+matches.length+' 句，顯示 '+Math.min(matches.length,limit)+' 句。':'找不到符合的完整句子，請換個關鍵字。'):'輸入關鍵字開始搜尋。';updateButtons();
 }
 function search(){
  clearTimeout(timer);limit=20;const id=++requestId;
  if(!input.value.trim()){matches=[];render();return}
  results.replaceChildren();more.hidden=true;status.textContent='正在搜尋原文句子…';
  try{
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
