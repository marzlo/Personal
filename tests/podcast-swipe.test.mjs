import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
function setup(){
  const context={window:{}};
  vm.runInNewContext(fs.readFileSync(new URL('../podcast-swipe.js',import.meta.url),'utf8'),context);
  const handlers={},moves=[];
  const card={clientWidth:400,style:{},classList:{add(){},remove(){}},setPointerCapture(){},addEventListener(name,fn){handlers[name]=fn}};
  context.window.PodcastSwipe.attach(card,d=>moves.push(d));
  const send=(name,x,y=0,interactive=false)=>handlers[name]({pointerId:1,pointerType:'touch',clientX:x,clientY:y,cancelable:true,target:{closest:()=>interactive},preventDefault(){},stopPropagation(){}});
  return {send,moves,card};
}
test('Left and right drags navigate in opposite directions and reset card position',()=>{
  const s=setup();s.send('pointerdown',200);s.send('pointermove',100);s.send('pointerup',100);
  s.send('pointerdown',100);s.send('pointermove',200);s.send('pointerup',200);
  assert.deepEqual(s.moves,[1,-1]);assert.equal(s.card.style.transform,'');
});
test('Vertical scrolling, small movements, interactive controls and cancelled gestures do not navigate',()=>{
  const s=setup();s.send('pointerdown',200);s.send('pointermove',180,90);s.send('pointerup',100,90);
  s.send('pointerdown',200);s.send('pointermove',180);s.send('pointerup',180);
  s.send('pointerdown',200,0,true);s.send('pointermove',100);s.send('pointerup',100);
  s.send('pointerdown',200);s.send('pointermove',100);s.send('pointercancel',100);s.send('pointerup',100);
  assert.deepEqual(s.moves,[]);assert.equal(s.card.style.transform,'');
});
