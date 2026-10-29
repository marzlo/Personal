/* Personal-only offline cache. Never cache authentication or cloud API responses. */
importScripts('./offline-assets.js');
const PREFIX='personal-offline-',CORE=PREFIX+'core-'+self.PERSONAL_OFFLINE.revision,RUNTIME=PREFIX+'visited';
const root=new URL('./',self.location.href),assets=new Set(self.PERSONAL_OFFLINE.assets.map(p=>new URL(p,root).pathname));
const snapshots=new Set(['data.js','article-bodies.js','quote-bodies.js'].map(p=>new URL(p,root).pathname));
function canonical(url){const next=new URL(url);next.search='';next.hash='';if(next.pathname.endsWith('/'))next.pathname+='index.html';return next.href}
function cacheable(request,url){return request.method==='GET'&&url.origin===root.origin&&url.pathname.startsWith(root.pathname)&&!request.headers.has('Authorization')&&!/(?:^|\/)(?:api|auth|login|sync|worker|\.git)(?:\/|$)/.test(url.pathname)&&![...url.searchParams.keys()].some(k=>/token|session|code|state|sync/i.test(k))}
async function boundedFetch(request){const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),3500);try{return await fetch(request,{signal:controller.signal})}finally{clearTimeout(timeout)}}
async function remember(cache,key,response){if(response.ok&&response.type!=='opaque'&&!response.headers.has('Set-Cookie'))await cache.put(key,response.clone());return response}
async function trimRuntime(cache){const keys=await cache.keys();for(const key of keys.slice(0,Math.max(0,keys.length-60)))await cache.delete(key)}
self.addEventListener('install',event=>{event.waitUntil((async()=>{const cache=await caches.open(CORE);try{let offset=0;const paths=self.PERSONAL_OFFLINE.assets;while(offset<paths.length){await Promise.all(paths.slice(offset,offset+5).map(async path=>{const url=new URL(path,root);const response=await fetch(new Request(url,{cache:'reload',credentials:'same-origin'}));if(!response.ok||response.type==='opaque')throw Error('Offline asset unavailable: '+path);await cache.put(canonical(url),response)}));offset+=5}}catch(error){await caches.delete(CORE);throw error}})())});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith(PREFIX+'core-')&&key!==CORE)await caches.delete(key);await self.clients.claim()})())});
self.addEventListener('message',event=>{if(event.data?.type==='PERSONAL_SKIP_WAITING')self.skipWaiting();if(event.data?.type==='PERSONAL_OFFLINE_STATUS')event.ports[0]?.postMessage({revision:self.PERSONAL_OFFLINE.revision,bytes:self.PERSONAL_OFFLINE.bytes,assets:self.PERSONAL_OFFLINE.assets.length})});
self.addEventListener('fetch',event=>{const request=event.request,url=new URL(request.url);if(!cacheable(request,url))return;const key=canonical(url),path=new URL(key).pathname,known=assets.has(path),publicVisited=url.pathname.startsWith(root.pathname+'share/')&&(/\.(?:png|jpg|jpeg|webp)$/i.test(url.pathname)||request.mode==='navigate');if(!known&&!publicVisited&&request.mode!=='navigate')return;
 const visitKey=publicVisited?url.href:key;
 event.respondWith((async()=>{const core=await caches.open(CORE),runtime=await caches.open(RUNTIME),cached=await core.match(key)||await runtime.match(visitKey);
  if(snapshots.has(path)){try{const response=await boundedFetch(request);if(response.ok)return await remember(core,key,response);if(cached)return cached;return response}catch{if(cached)return cached;return Response.error()}}
  if(cached)return cached;
  try{const response=await boundedFetch(request);if(response.ok&&publicVisited){await remember(runtime,visitKey,response);await trimRuntime(runtime)}return response}catch{if(request.mode==='navigate')return await core.match(new URL('offline.html',root).href)||new Response('離線內容尚未下載',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});return Response.error()}
 })());
});
