import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
function setup(){
  const c={window:{}};vm.runInNewContext(fs.readFileSync(new URL('../podcast-swipe.js',import.meta.url),'utf8'),c);
  const handlers={},track={scrollLeft:0,clientWidth:400,scrollWidth:2400,classList:{add(){},remove(){}},setPointerCapture(){},scrollTo({left}){this.scrollLeft=left},addEventListener(name,fn){handlers[name]=fn}};
  c.window.PodcastSwipe.attach(track);
  const send=(type,x,y=0,pointerType='mouse',interactive=false)=>handlers[type]({type,pointerId:1,pointerType,button:0,clientX:x,clientY:y,target:{closest:()=>interactive},preventDefault(){},stopPropagation(){}});
  return {track,send};
}
test('Mouse drags scroll the actual track and snap to adjacent cards',()=>{
  const s=setup();s.send('pointerdown',200);s.send('pointermove',100);assert.equal(s.track.scrollLeft,100);s.send('pointerup',100);assert.equal(s.track.scrollLeft,400);
  s.send('pointerdown',100);s.send('pointermove',200);s.send('pointerup',200);assert.equal(s.track.scrollLeft,0);
});
test('Native touch scrolling is not intercepted, and controls do not start a mouse drag',()=>{
  const s=setup();s.send('pointerdown',200,0,'touch');s.send('pointermove',100,0,'touch');s.send('pointerup',100,0,'touch');assert.equal(s.track.scrollLeft,0);
  s.send('pointerdown',200,0,'mouse',true);s.send('pointermove',100);s.send('pointerup',100);assert.equal(s.track.scrollLeft,0);
});
