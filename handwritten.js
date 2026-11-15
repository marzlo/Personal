(() => {
 const defaults=[...(window.HANDWRITTEN_NOTES||[]),...(window.HANDWRITTEN_IMPORTS||[])].map(note=>({...note,photoFilename:photoFilename(note)})),list=document.getElementById('noteList'),status=document.getElementById('handwrittenStatus');
 let tags={},editingId=null,deferred=null;
 let sync;
 const $=id=>document.getElementById(id),owner=()=>sync?sync.canEdit():false;
 const escape=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const photoCollator=new Intl.Collator('zh-Hant',{numeric:true,sensitivity:'base'});
 function photoFilename(note){
  const legacy={'note-030':'IMG_0349.JPG','note-034':'IMG_0357.JPG'};
  if(legacy[note.id])return legacy[note.id];
  const id=String(note.id||'').match(/^img-(\d+)$/);if(id)return `IMG_${id[1]}.JPG`;
  return String(note.source||'').match(/(?:^|／)([^／；;]+\.(?:jpe?g|heic|png|webp))(?=$|[；;])/i)?.[1]||'';
 }
 function handwrittenNumber(note){
  const raw=String(note.number||'');if(/待確認|條列編號/.test(raw))return null;
  const text=raw.replace(/[①-⑳]/g,c=>'-'+(c.codePointAt(0)-0x2460+1)).normalize('NFKC');
  const match=text.match(/^\s*(\d+(?:\s*[-–—._]\s*\d+)*)/);return match?match[1].match(/\d+/g).map(Number):null;
 }
 function comparePhotos(a,b,mode='photo'){
  if(mode==='handwritten'){
   const x=handwrittenNumber(a),y=handwrittenNumber(b);
   if(x&&y){for(let i=0;i<Math.max(x.length,y.length);i++){const delta=(x[i]||0)-(y[i]||0);if(delta)return delta}}
   else if(x||y)return x?-1:1;
  }
  const x=a.photoFilename||photoFilename(a),y=b.photoFilename||photoFilename(b);
  return (x&&y?photoCollator.compare(x,y):x?-1:y?1:0)||photoCollator.compare(a.id,b.id);
 }
 function transcriptMarkup(note,key){
  if(note.transcriptionMethod==='local-ocr'&&note.ocrOriginalFields?.[key]===note[key]&&Array.isArray(note.ocrLines))return note.ocrLines.filter(line=>line.role===key).map(line=>`<span class="ink-${['red','blue','green'].includes(line.color)?line.color:'unknown'}${line.uncertain?' uncertain':''}">${escape(line.text)}</span>`).join('\n');
  return escape(note[key]);
 }
 function draftLabel(note){return note.status==='reviewed'?'已校對':note.status==='needs-photo'?'需補清晰照片':note.status==='untranscribed'?'待轉錄':note.status==='ocr-draft'?'機器辨識草稿':'待校對'}
 function imageUrl(value){try{const u=new URL(value,location.href);return value&&(u.protocol==='https:'||(u.origin===location.origin&&u.protocol==='http:'))?u.href:''}catch{return ''}}
 function noteData(base){const saved=sync?.get(base.id)||tags.__handwrittenNotes?.[base.id];const result={...base,...(saved&&typeof saved==='object'?Object.fromEntries(Object.entries(saved).filter(([k,v])=>['title','topic','source','image','body','question','annotation','status'].includes(k)&&typeof v==='string')):{})};if(!result.image)result.image=base.image;return result}
 function render(){
  const notes=defaults.map(noteData),query=$('noteSearch').value.trim().toLocaleLowerCase(),topic=$('noteTopic').value,state=$('noteState').value;
  const topics=[...new Set(notes.map(n=>n.topic))];$('noteTopic').replaceChildren(new Option('全部主題',''),...topics.map(t=>new Option(t,t)));$('noteTopic').value=topics.includes(topic)?topic:'';
  const visible=notes.filter(n=>(!query||[n.title,n.body,n.question,n.annotation,n.topic,n.source,n.number].join(' ').toLocaleLowerCase().includes(query))&&(!topic||n.topic===topic)&&(!state||n.status===state)).sort((a,b)=>comparePhotos(a,b,$('noteSort').value));
  list.innerHTML=visible.map(n=>{const url=imageUrl(n.image);return `<article class="note" id="${n.id}"><div class="meta">${escape(n.topic)} · 照片 ${escape(n.photoFilename||n.number)}${handwrittenNumber(n)?` · 手寫編號 ${escape(n.number)}`:''}</div><h2>${escape(n.title)}</h2><span class="badge">${draftLabel(n)}</span><div class="comparison"><div class="photo-column">${url?`<button class="photo-button" data-photo="${escape(url)}" aria-label="放大原始照片"><img src="${escape(url)}" alt="${escape(n.title)}的原始手寫照片" loading="lazy"></button>`:'<div class="photo-placeholder">原始照片待補<br>收到可下載的原圖檔後，會放在這裡供逐字對照。</div>'}<p>${escape(n.source)}</p><p data-image-error hidden>照片無法載入，請確認圖片網址。</p></div><div class="text-column"><div class="reading">${n.transcriptionMethod==='local-ocr'&&n.status!=='reviewed'?'<p class="ocr-notice">本篇為機器辨識草稿，尚未逐字核對；可能有錯字、漏字或旁註混入正文。標有「待確認」的行請優先對照原圖。筆色與分欄亦待核對。</p>':''}<h3>${n.status==='ocr-draft'?'辨識文字（待核對）':'正文'}</h3><div class="prose">${transcriptMarkup(n,'body')||escape(n.status==='needs-photo'?n.transcriptionIssue:'原始照片已收錄，文字尚待轉錄；可點開左側照片閱讀。')}</div>${n.question?`<h3 class="red-note">紅字提問</h3><div class="prose red-note">${transcriptMarkup(n,'question')}</div>`:''}${n.annotation?`<h3>旁註與圈選</h3><div class="prose red-note">${transcriptMarkup(n,'annotation')}</div>`:''}${conflictMarkup(n.id)}<div class="actions"><button data-edit="${n.id}">編輯與校對</button></div></div><form class="editor" hidden aria-label="校對編輯表單">${[['title','標題'],['topic','主題'],['source','來源與頁碼'],['image','公開照片網址（HTTPS）']].map(([k,label])=>`<label>${label}<input name="${k}" value="${escape(n[k])}" maxlength="500"></label>`).join('')}${[['body','正文',14],['question','紅字提問',3],['annotation','旁註與圈選',4]].map(([k,label,rows])=>`<label>${label}<textarea name="${k}" rows="${rows}" maxlength="16000">${escape(n[k])}</textarea></label>`).join('')}<label>校對狀態<select name="status"><option value="needs-photo" ${n.status==='needs-photo'?'selected':''}>需補清晰照片</option><option value="untranscribed" ${n.status==='untranscribed'?'selected':''}>待轉錄</option><option value="ocr-draft" ${n.status==='ocr-draft'?'selected':''}>機器辨識草稿</option><option value="pending" ${!['reviewed','untranscribed','ocr-draft','needs-photo'].includes(n.status)?'selected':''}>待校對</option><option value="reviewed" ${n.status==='reviewed'?'selected':''}>已校對</option></select></label><div class="actions"><button type="submit" class="primary">儲存並發布</button><button type="button" data-cancel>取消編輯</button></div><p>逐篇服務啟用後只同步本篇；離線時先存本機。啟用前沿用原有同步。</p></form></div></div></article>`}).join('');
  $('noteCount').textContent=visible.length?`顯示 ${visible.length} 篇／共 ${notes.length} 篇`:'找不到符合的筆記。';
  list.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.closest('.photo-column').querySelector('[data-image-error]').hidden=false}));
  list.querySelectorAll('[data-edit]').forEach(button=>button.onclick=()=>{if(!owner())return;if(editingId){status.textContent='請先儲存或取消目前編輯。';return}editingId=button.dataset.edit;sync.pause(editingId);const article=button.closest('article');article.querySelector('.reading').hidden=true;const form=article.querySelector('form');form.hidden=false;form.querySelector('input').focus()});
  list.querySelectorAll('form').forEach(form=>{form.querySelector('[data-cancel]').onclick=()=>{sync.resume(editingId);editingId=null;if(deferred){tags=deferred;deferred=null}render();status.textContent='已取消編輯。'};form.onsubmit=event=>{event.preventDefault();if(!owner())return;const entry=Object.fromEntries(new FormData(form));if(['untranscribed','ocr-draft','needs-photo'].includes(entry.status)&&entry.body.trim())entry.status='pending';if(!entry.title.trim()||!entry.body.trim()){status.textContent='標題和正文不可空白。';return}if(entry.image&&!imageUrl(entry.image)){status.textContent='請填入 HTTPS 圖片網址。';return}try{if(sync.ready){sync.save(editingId,entry)}else{const latest=JSON.parse(localStorage.getItem('shiyeArticleTags')||'{}')||{};tags={...latest,__handwrittenNotes:{...latest.__handwrittenNotes,[editingId]:entry}};window.ShiyeNotes.write('shiyeArticleTags',tags);sync.resume(editingId);status.textContent='已透過原有同步儲存；逐篇同步待後端啟用。'}editingId=null;deferred=null;render();}catch{status.textContent='儲存未完成，請保留編輯內容並重試。'}}});
  list.querySelectorAll('[data-conflict]').forEach(button=>button.onclick=()=>{sync.resolve(button.dataset.conflict,button.dataset.choice);render()});
  list.querySelectorAll('[data-photo]').forEach(button=>button.onclick=()=>{$('photoDialog').querySelector('img').src=button.dataset.photo;$('photoDialog').showModal()});
 }
 function conflictMarkup(id){const remote=sync?.conflict(id);if(!remote)return '';return `<section class="note-conflict"><h3>另一台裝置也修改了這篇</h3><details><summary>查看雲端版本（含正文與旁註）</summary><pre class="prose">${escape(JSON.stringify(remote.data,null,2))}</pre></details><p>上方是這台的版本。兩份均保留備份，請選擇要發布的版本。</p><div class="actions"><button data-conflict="${escape(id)}" data-choice="local">發布這台版本</button><button data-conflict="${escape(id)}" data-choice="remote">使用雲端版本</button></div></section>`}
 function load(data){let next;try{next=data?data.shiyeArticleTags||{}:JSON.parse(localStorage.getItem('shiyeArticleTags')||'{}')||{}}catch{return}if(editingId){deferred=next;return}tags=next;if(sync?.ready)sync.migrate(tags.__handwrittenNotes,defaults);render()}
 ['noteSearch','noteTopic','noteState','noteSort'].forEach(id=>$(id).addEventListener(id==='noteSearch'?'input':'change',()=>{if(editingId){status.textContent='請先儲存或取消編輯，再搜尋或篩選。';return}render()}));
 $('closePhoto').onclick=()=>$('photoDialog').close();
 window.addEventListener('shiye:notes-loaded',event=>load(event.detail?.data));
 window.addEventListener('beforeunload',event=>{if(editingId){event.preventDefault();event.returnValue=''}});
 sync=new window.HandwrittenSync({changed:()=>{if(sync?.ready)sync.migrate(tags.__handwrittenNotes,defaults);if(!editingId)render()},status:text=>status.textContent=(!sync?.ready&&text.includes('尚未啟用'))?'逐篇同步待後端啟用；目前仍使用原有同步，既有校訂保留。':text});
 $('handwrittenRetry').onclick=()=>sync.sync();
 $('handwrittenExport').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(sync.export(),null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='拾頁逐篇校訂備份.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 load();void sync.sync();setInterval(()=>{if(!document.hidden)void sync.sync()},15000);window.addEventListener('online',()=>sync.sync());window.addEventListener('focus',()=>sync.sync());
})();
