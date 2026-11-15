/* Keep home-page covers visible when third-party photo services fail. */
(() => {
 const covers = [
  ['sunlit-trees','陽光樹蔭'],['quiet-coast','清晨海岸'],
  ['reading-room','窗邊閱讀'],['city-cafe','咖啡窗景']
 ];
 function recover(img) {
  if (!img?.matches?.('.podcast-cover img') || img.dataset.localCover) return;
  const card=img.closest('.podcast-card');
  if (!card) return;
  const siblings=Array.from(card.parentElement.querySelectorAll('.podcast-card'));
  const [name,label]=covers[Math.max(0,siblings.indexOf(card))%covers.length];
  img.dataset.localCover='true';
  img.alt=label+' · 拾頁生成插圖';
  img.src=new URL('assets/ambience/'+name+'-small.webp',document.baseURI).href;
  const credit=card.querySelector('.podcast-photo-credit');
  if (credit) credit.textContent='拾頁生成插圖 · '+label;
 }
 // Image error events do not bubble; capture also covers cards added after initial load.
 document.addEventListener('error',event=>recover(event.target),true);
 document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.podcast-cover img').forEach(img=>{
   if (img.complete && !img.naturalWidth) recover(img);
  });
 },{once:true});
})();
