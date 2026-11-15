import test from 'node:test';
import assert from 'node:assert/strict';
import {refreshPodcastCovers, podcastCoverPhotos} from '../scripts/podcast-covers.mjs';
test('sync only rotates curated Unsplash lifestyle photos with source credits', async () => {
 const first = await refreshPodcastCovers([{id:'456'}]);
 const next = await refreshPodcastCovers(first);
 assert.equal(first.length,4);
 assert.equal(new Set(first.map(photo=>photo.id)).size,4);
 assert.notEqual(next[0].id,first[0].id);
 for(const photo of next){
  assert.ok(photo.image.startsWith('https://images.unsplash.com/photo-'));
  assert.equal(photo.url,'https://unsplash.com/photos/'+photo.id);
  assert.ok(photo.alt && photo.artist);
  assert.deepEqual(photo,podcastCoverPhotos.find(source=>source.id===photo.id));
 }
 let cycle=first;
 for(let i=0;i<4;i++)cycle=await refreshPodcastCovers(cycle);
 assert.deepEqual(cycle,first);
});
