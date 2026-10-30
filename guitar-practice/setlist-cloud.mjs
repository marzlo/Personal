import {mergeSetlists} from './setlist-merge.mjs?v=3';
const TOKEN='fret.bandSetlist.session.v1',META='fret.bandSetlist.cloud.v1';
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function createSetlistCloud({get,apply,validate,editing,localReady,endpoint=window.SYNC_WORKER_URL}){
 const panel=document.querySelector('#cloud-panel'),label=panel.querySelector('[data-cloud-status]'),login=panel.querySelector('[data-cloud-login]'),button=panel.querySelector('[data-cloud-sync]');
 let base=null,busy=false,timer,stopped=false,pending=false,token='';
 const status=(text,error=false)=>{label.textContent=text;label.classList.toggle('error',error)};
 try{const fragment=new URLSearchParams(location.hash.slice(1)),session=fragment.get('notes_session');if(session){localStorage.setItem(TOKEN,session);localStorage.removeItem('fret.bandSetlist.cloudPaused');history.replaceState(null,'',location.pathname+location.search)}token=localStorage.getItem(TOKEN)||(localStorage.getItem('fret.bandSetlist.cloudPaused')?'':localStorage.getItem('shiyeNotesSession'))||'';if(token)localStorage.setItem(TOKEN,token);const saved=JSON.parse(localStorage.getItem(META)||'null');if(saved&&Number.isInteger(saved.revision)&&validate(saved.data))base=saved}catch{status('無法讀取同步設定；本機歌單不會被替換。',true);stopped=true}
 const url=(endpoint||'').replace(/\/$/,'');login.href=url+'/login?app=guitar';
 function auth(){login.hidden=!!token;button.disabled=!token||busy||!localReady();panel.querySelector('[data-cloud-logout]').hidden=!token}
 async function api(method,body){const response=await fetch(url+'/api/guitar-setlist',{method,cache:'no-store',headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});if(response.status===401){token='';localStorage.removeItem(TOKEN);auth();throw Error('請重新登入 GitHub，再繼續同步；本機歌單已保留。')}if(response.status===404)throw Error('同步服務尚未更新：請先部署新版 Cloudflare Worker。');if(response.status===413)throw Error('歌單超過雲端單次容量（120 KB），本機仍保留；請先匯出備份。');if(!response.ok&&response.status!==409)throw Error('雲端暫時無法連線，本機歌單仍保留，稍後會再試。');const result=await response.json();const renewed=response.headers.get('X-Notes-Session');if(renewed){token=renewed;localStorage.setItem(TOKEN,renewed)}if(!Number.isSafeInteger(result.revision)||result.revision<0||(result.data!==null&&!validate(result.data)))throw Error('雲端回傳的歌單格式不正確，已保留本機版本。');return {result,conflict:response.status===409}}
 function remember(remote){localStorage.setItem(META,JSON.stringify(remote));base=structuredClone(remote)}
 async function sync(){if(stopped||busy||!token||!localReady()||document.hidden)return;if(editing()){pending=true;status('編輯中，已存本機；按「儲存並檢視」後同步。');return}busy=true;pending=false;auth();status('正在合併並同步歌單…');try{
  let remote=(await api('GET')).result;
  for(let attempt=0;attempt<3;attempt++){
   if(editing()){pending=true;status('編輯中，完成後繼續同步。');return}
   const before=structuredClone(get()),merged=remote.data?mergeSetlists(base?.data||null,before,remote.data):{data:before,conflicts:[]};
   if(!remote.data||!eq(merged.data,remote.data)){
    const reply=await api('PUT',{revision:remote.revision,data:merged.data});if(reply.conflict){remote=reply.result;continue}remote=reply.result;
   }
   // Edits may have happened while awaiting the server. Keep them local and merge next time.
   if(editing()||!eq(before,get())){pending=true;status('本機有新修改，下一次同步會繼續合併。');return}
   if(!eq(get(),remote.data)&&!apply(remote.data))throw Error('本機版本已變動，停止套用雲端內容；請先匯出備份。');
   remember(remote);status((merged.conflicts.length?'已同步；不同修改已保留為「本機版本」副本。':'三台裝置使用同一份歌單 · 已同步')+' '+new Date(remote.updatedAt||Date.now()).toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'}));return;
  }
  pending=true;status('其他裝置也在儲存，稍後繼續合併，本機內容已保留。');
 }catch(error){const network=error instanceof TypeError&&/load failed|failed to fetch|network|fetch/i.test(error.message);status(network?'無法連線到歌單同步服務（網路或跨站連線失敗）。若尚未更新 Cloudflare Worker，請先按「連線設定」完成部署。本機歌單未被替換。':error.message,true)}finally{busy=false;auth();if(pending)changed()}}
 function changed(){clearTimeout(timer);pending=true;if(!token){status('已存本機；在三台裝置登入同一 GitHub 帳號即可同步。');return}status(editing()?'編輯中，已存本機；按「儲存並檢視」後同步。':'已存本機，等待雲端同步…');timer=setTimeout(sync,900)}
 button.onclick=sync;login.onclick=()=>{if(editing()){status('請先按「儲存並檢視」，再登入同步。',true);return false}};
 panel.querySelector('[data-cloud-logout]').onclick=()=>{token='';localStorage.removeItem(TOKEN);localStorage.setItem('fret.bandSetlist.cloudPaused','1');clearTimeout(timer);auth();status('已中斷此頁的同步，本機歌單保留。')};
 const interval=setInterval(sync,15000);addEventListener('online',sync);document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});
 auth();if(!token)status('先在 iPad 登入並同步原有歌單，再在電腦與手機登入同一 GitHub 帳號。');else sync();
 return {changed,sync,dispose(){stopped=true;clearTimeout(timer);clearInterval(interval)}};
}
