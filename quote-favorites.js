(() => {
 const host=document.getElementById('featuredQuote');if(!host)return;
 const cards=DB.featuredQuotes?.length?DB.featuredQuotes:DB.featuredQuote?[DB.featuredQuote]:[];
 const key=quote=>String(quote.notionUrl||quote.sourceUrl||'')+'|'+quote.text;
 const section=document.createElement('details');section.className='quote-favorites';section.innerHTML='<summary>收藏摘句 <span data-favorite-count></span></summary><div data-favorite-list></div>';host.after(section);
 const saved=()=>Array.isArray(customTags.__favoriteQuotes)?customTags.__favoriteQuotes:[];
 function write(items){customTags={...customTags,__favoriteQuotes:items};window.ShiyeNotes.write('shiyeArticleTags',customTags);refresh()}
 function refresh(){const items=saved();section.querySelector('[data-favorite-count]').textContent='（'+items.length+'）';section.querySelector('[data-favorite-list]').innerHTML=items.length?items.map((quote,index)=>'<article><blockquote data-no-translate>'+esc(quote.text)+'</blockquote><div><a data-no-translate href="'+notionUrl(quote.notionUrl||quote.sourceUrl)+'" target="_blank" rel="noreferrer">'+esc(quote.sourceTitle)+(quote.page?' · 第 '+esc(quote.page)+' 頁':'')+' ↗</a><button type="button" data-favorite-remove="'+index+'">取消收藏</button></div></article>').join(''):'<p>還沒有收藏摘句。</p>';section.querySelectorAll('[data-favorite-remove]').forEach(button=>button.onclick=()=>write(items.filter((_,index)=>index!==Number(button.dataset.favoriteRemove))));
 host.querySelectorAll('.quote-slide').forEach((slide,index)=>{const quote=cards[index];if(!quote)return;let button=slide.querySelector('[data-quote-save]');if(!button){button=document.createElement('button');button.type='button';button.setAttribute('data-quote-save','');slide.querySelector('.featured-quote-meta').append(button);button.onclick=()=>{const exists=saved().some(item=>key(item)===key(quote));write(exists?saved().filter(item=>key(item)!==key(quote)):[...saved(),{...quote}])}}const marked=items.some(item=>key(item)===key(quote));button.textContent=marked?'★ 已收藏':'☆ 收藏摘句';button.setAttribute('aria-pressed',String(marked));});
 }
 window.addEventListener('shiye:notes-loaded',refresh);refresh();
})();
