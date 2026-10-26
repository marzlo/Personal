import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ambienceScenes,sceneDetails,currentAmbienceScene,nextAmbienceScene} from '../scripts/ambience-scenes.mjs';
test('Six complete scenes rotate once each and remain stable within a snapshot',()=>{
 assert.equal(ambienceScenes.length,6);
 const first=currentAmbienceScene({syncedAt:'2026-10-26'});assert.equal(first,'rain-window');
 const seen=new Set();let scene=first;
 for(let i=0;i<ambienceScenes.length;i++){
  assert.ok(!seen.has(scene));seen.add(scene);
  assert.equal(currentAmbienceScene({ambienceScene:scene}),scene);
  assert.ok(sceneDetails[scene].label);
  for(const suffix of ['', '-small'])assert.ok(fs.statSync(new URL('../assets/ambience/'+scene+suffix+'.webp',import.meta.url)).size<350000);
  scene=nextAmbienceScene(scene);
 }
 assert.equal(scene,first);assert.equal(currentAmbienceScene({ambienceScene:'unknown'}),first);
 assert.deepEqual(ambienceScenes.filter(s=>sceneDetails[s].effect==='rain'),['rain-window']);
});
