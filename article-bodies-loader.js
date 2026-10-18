(() => {
 let pending;
 window.ShiyeArticleBodiesState=window.ARTICLE_BODIES?'ready':'loading';
 window.ShiyeLoadArticleBodies=()=>{
  if(window.ARTICLE_BODIES)return Promise.resolve();
  if(pending)return pending;
  window.ShiyeArticleBodiesState='loading';
  pending=new Promise((resolve,reject)=>{
   const script=document.createElement('script');
   const db=window.DASHBOARD_DATA||{};
   script.src='./article-bodies.js?v='+encodeURIComponent(db.syncedAt||db.updatedAt||'');
   script.async=true;
   script.onload=()=>{
    if(!window.ARTICLE_BODIES){fail();return}
    window.ShiyeArticleBodiesState='ready';
    window.dispatchEvent(new CustomEvent('shiye:article-bodies-ready'));resolve();
   };
   function fail(){pending=null;script.remove();window.ShiyeArticleBodiesState='error';window.dispatchEvent(new CustomEvent('shiye:article-bodies-error'));reject(new Error('Article bodies could not be loaded'))}
   script.onerror=fail;document.head.append(script);
  });
  return pending;
 };
 // Let the initial page finish before downloading the full article archive.
 const start=()=>setTimeout(()=>window.ShiyeLoadArticleBodies().catch(()=>{}),0);
 if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
})();
