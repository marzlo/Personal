import test from 'node:test';
import assert from 'node:assert/strict';
import {refreshPodcastCovers} from '../scripts/podcast-covers.mjs';
test('new covers exclude every previous photo and preserve source credits',async()=>{
 const catalogue=Array.from({length:12},(_,i)=>({id:String(i),author:'Author '+i,width:1200,height:800,url:'https://unsplash.com/photos/'+i}));
 const fetcher=async()=>({ok:true,json:async()=>catalogue});
 const old=await refreshPodcastCovers([],fetcher,()=>0.5),next=await refreshPodcastCovers(old,fetcher,()=>0.5);
 assert.equal(next.length,4);assert.equal(new Set(next.map(p=>p.id)).size,4);assert.ok(next.every(p=>!old.some(o=>o.id===p.id)));
 for(const photo of next){assert.equal(photo.artist,'Author '+photo.id);assert.equal(photo.url,'https://unsplash.com/photos/'+photo.id);}
 await assert.rejects(refreshPodcastCovers([],async()=>({ok:false,status:503})),/unavailable/);
});
