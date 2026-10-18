const fs=require('fs'),assert=require('assert');
const source=fs.readFileSync(__dirname+'/../src/harmony.html','utf8');
const script=source.match(/<script>([\s\S]*?)<\/script>/)[1];
new Function(script);
const end=script.lastIndexOf('pcs.forEach((n,i)=>');
const instrumented=script.slice(0,end)+'return {defs,modes,stacked,scale,spelling,label,set(k,m){key=k;mode=m;}};})();';
global.document={getElementById(){return {querySelector(){}}}};global.window={};
const engine=eval(instrumented);
let tested=0;
for(let key=0;key<12;key++)for(const mode of Object.keys(engine.modes)){
  engine.set(key,mode);const scale=engine.scale();
  assert.equal(new Set(engine.spelling().map(n=>n[0])).size,7);
  for(const root of scale)for(const seventh of [false,true]){
    const chord=engine.stacked(root,seventh);
    assert.equal(chord.iv.length,seventh?4:3);
    assert(chord.iv.every(i=>scale.includes((root+i)%12)),'Invalid stacked harmony');tested++;
  }
}
for(const chord of engine.defs)for(let shape=0;shape<2;shape++){
  const base=shape?9:4;
  const intervals=chord.sh[shape].map((f,i)=>f===null?null:([4,9,2,7,11,4][i]+f-base+24)%12).filter(v=>v!==null);
  assert(intervals.every(v=>chord.iv.includes(v)),chord.id+' nonchord tone');
  assert(intervals.includes(0),chord.id+' missing root');
}
engine.set(9,'natural');assert.deepEqual([9,2,4].map(pc=>engine.stacked(pc,true).suffix),['m7','m7','m7']);
engine.set(9,'harmonic');assert.deepEqual([9,2,4].map(pc=>engine.stacked(pc,true).suffix),['m(maj7)','m7','7']);
engine.set(9,'melodic');assert.deepEqual([9,2,4].map(pc=>engine.stacked(pc,true).suffix),['m(maj7)','7','7']);
console.log('PASS:',tested,'stacked chords across 12 tonics and 4 modes;',engine.defs.length*2,'voicings; A-minor progressions.');
