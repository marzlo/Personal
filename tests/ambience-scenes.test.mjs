import test from 'node:test';
import assert from 'node:assert/strict';
import {ambienceScenes,currentAmbienceScene,nextAmbienceScene} from '../scripts/ambience-scenes.mjs';
test('Scene remains stable during a snapshot and advances on the next successful sync',()=>{
 const first=currentAmbienceScene({syncedAt:'2026-10-26'});assert.equal(first,'rain-window');
 const next=nextAmbienceScene(first);assert.notEqual(next,first);assert.ok(ambienceScenes.includes(next));
 for(let i=0;i<5;i++)assert.equal(currentAmbienceScene({ambienceScene:next}),next);
 assert.equal(nextAmbienceScene(next),first);assert.equal(currentAmbienceScene({ambienceScene:'unknown'}),first);
});
