import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {loadCache} from '../scripts/notion-cache.mjs';
test('unchanged page cache preserves false/empty values; edits and expiry refresh; deleted pages removed',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'shiye-cache-'));const file=pathToFileURL(path.join(dir,'data.json'));
 try{
 const page={id:'one',last_edited_time:'2026-10-07T00:00:00Z'};const now=100000000;
 const cache=await loadCache(file,now);cache.set(page,'audio',false);cache.set(page,'body','');await cache.save([page]);
 const reused=await loadCache(file,now+1000);assert.equal(reused.get(page,'audio'),false);assert.equal(reused.get(page,'body'),'');assert.equal(reused.get({...page,last_edited_time:'changed'},'audio'),undefined);
 const expired=await loadCache(file,now+6*3600000);assert.equal(expired.get(page,'body'),undefined);
 reused.set(page,'body','updated');await reused.save([page]);assert.equal((await loadCache(file,now+6*3600000)).get(page,'body'),undefined);
 await reused.save([]);assert.equal((await loadCache(file,now)).get(page,'audio'),undefined);
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
