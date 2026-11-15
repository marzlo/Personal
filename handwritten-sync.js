/* Per-note synchronization. Legacy snapshots remain untouched as migration backups. */
(() => {
 const KEY='shiyeHandwrittenSyncV1';
 const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const fields=['title','topic','source','image','body','question','annotation','status'];
 function clean(value){return Object.fromEntries(fields.filter(k=>typeof value?.[k]==='string').map(k=>[k,value[k]]))}
 class HandwrittenSync {
  constructor(options={}){
   this.storage=options.storage||localStorage;this.fetch=options.fetch||globalThis.fetch.bind(globalThis);this.endpoint=options.endpoint||((window.SYNC_WORKER_URL||'').replace(/\/$/,'')+'/api/handwritten');
   this.token=options.token||(()=>this.storage.getItem('shiyeNotesSession')||'');this.changed=options.changed||(()=>{});this.status=options.status||(()=>{});this.records={};this.paused=new Set();this.busy=false;this.ready=false;
   try{const raw=JSON.parse(this.storage.getItem(KEY)||'null');if(raw?.version===1&&raw.records&&typeof raw.records==='object')this.records=raw.records}catch{this.status('無法讀取校訂備份；請先匯出瀏覽器資料。');throw Error('Invalid handwritten local state')}
  }
  canEdit(){try{const token=this.token();const p=JSON.parse(atob(token.split('.')[0].replaceAll('-','+').replaceAll('_','/')));return p.sub==='marzlo'&&p.exp>Date.now()/1000}catch{return false}}
  persist(){this.storage.setItem(KEY,JSON.stringify({version:1,records:this.records}))}
  get(id){const r=this.records[id];return this.canEdit()?r?.local:r?.base?.data}
  conflict(id){return this.canEdit()?this.records[id]?.conflict:null}
  pause(id){this.paused.add(id)}
  resume(id){this.paused.delete(id)}
  backup(r){if(r.local)r.backups=[...(r.backups||[]).slice(-9),{savedAt:new Date().toISOString(),data:r.local}]}
  save(id,data){
   if(!this.canEdit())throw Error('請先登入再儲存校訂。');
   const old=this.records[id],r=structuredClone(old||{base:null});this.backup(r);r.local=clean(data);r.pending=true;this.records[id]=r;
   try{this.persist()}catch(error){if(old)this.records[id]=old;else delete this.records[id];throw error}
   this.paused.delete(id);this.changed();this.status('已存本機，正在逐篇發布…');void this.sync();
  }
  migrate(legacy,defaults){
   if(!this.canEdit())return;
   let changed=false;
   for(const base of defaults){const old=legacy?.[base.id];if(!old||this.records[base.id])continue;
    this.records[base.id]={base:null,local:clean({...base,...old}),pending:true,migration:true,backups:[]};changed=true;
   }
   if(changed){this.persist();this.changed()}
  }
  accept(id,remote){
   const r=this.records[id];
   if(r?.pending){
    if(equal(r.local,remote.data)){r.base=remote;r.pending=false;delete r.conflict;delete r.migration}
    else if((r.base?.revision??0)!==remote.revision||(r.base===null&&remote.data))r.conflict=remote;
    else r.base=remote;
   }else this.records[id]={...r,base:remote,local:remote.data,pending:false};
   this.persist();
  }
  resolve(id,choice){
   if(!this.canEdit())return;const r=this.records[id];if(!r?.conflict)return;
   this.backup(r);r.base=r.conflict;delete r.conflict;
   if(choice==='remote'){r.local=r.base.data;r.pending=false}else r.pending=true;
   this.persist();this.changed();void this.sync();
  }
  async request(path,method='GET',body){
   const response=await this.fetch(this.endpoint+path,{method,cache:'no-store',headers:{...(method==='PUT'?{Authorization:'Bearer '+this.token(),'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
   if(response.status===404||response.status===405)throw Error('逐篇同步服務尚未啟用；已儲存校訂保留在本機。');
   if(response.status===401)throw Error('登入已過期；校訂保留在本機，請重新登入後發布。');
   if(response.status===413)throw Error('這篇校訂超過容量；本機內容保留，請縮短後重試。');
   if(!response.ok&&response.status!==409)throw Error('暫時無法同步；校訂保留在本機，連線後會重試。');
   const data=await response.json();const renewed=response.headers?.get('X-Notes-Session');if(renewed)this.storage.setItem('shiyeNotesSession',renewed);
   return {data,conflict:response.status===409};
  }
  async sync(){
   if(this.busy)return;this.busy=true;
   try{
    const {data:index}=await this.request('');if(index.version!==1||!index.items)throw Error('逐篇同步服務尚未啟用；校訂保留在本機。');this.ready=true;
    const ids=new Set([...Object.keys(index.items),...Object.keys(this.records)]);
    for(const id of ids){
     if(this.paused.has(id))continue;
     let r=this.records[id];
     if((index.items[id]?.revision||0)!==(r?.base?.revision||0)||(r?.pending&&!r.base)){
      const {data}=await this.request('/'+encodeURIComponent(id));if(this.paused.has(id))continue;this.accept(id,data);r=this.records[id];
     }
     if(r?.pending&&!r.conflict&&this.canEdit()){
      const outgoing=structuredClone(r.local),base=r.base?.revision||0;
      const result=await this.request('/'+encodeURIComponent(id),'PUT',{revision:base,data:outgoing});
      // A newer local save may have happened while this request was in flight.
      r=this.records[id];if(result.conflict)r.conflict=result.data;
      else{r.base=result.data;if(equal(outgoing,r.local)){r.pending=false;delete r.migration}}
      this.persist();
     }
    }
    this.changed();const records=Object.values(this.records),conflicts=records.filter(r=>r.conflict).length,pending=records.filter(r=>r.pending).length;
    this.status(conflicts?`有 ${conflicts} 篇版本衝突，請在文章下方選擇保留版本。`:pending?`有 ${pending} 篇保存在本機，等待登入或連線後逐篇發布。`:'逐篇同步已就緒 · 校訂已發布');
   }catch(error){this.status(error.message||'同步失敗；本機校訂保留。')}finally{this.busy=false}
  }
  export(){return {savedAt:new Date().toISOString(),version:1,records:this.records}}
 }
 window.HandwrittenSync=HandwrittenSync;
})();
