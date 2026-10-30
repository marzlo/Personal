import {pristineBuiltIns} from './repertoire.mjs?v=3';
import {ensureScoreSupplements} from './shantou-score.mjs?v=1';
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
// Three-way merge: unmodified copies follow the other device; conflicting edits keep both versions.
export function mergeSetlists(base,local,remote,newId=()=>crypto.randomUUID()){
 const prior=new Map((base?.songs||[]).map(s=>[s.id,s])),left=new Map(local.songs.map(s=>[s.id,s])),right=new Map(remote.songs.map(s=>[s.id,s]));const songs=[],conflicts=[];
 for(const id of new Set([...right.keys(),...left.keys(),...prior.keys()])){
  const b=prior.get(id),l=left.get(id),r=right.get(id);let chosen;
  if(equal(l,r))chosen=l;
  else if(base&&equal(l,b))chosen=r;
  else if(base&&equal(r,b))chosen=l;
  else if(!l)chosen=r;
  else if(!r)chosen=l;
  else if(!base&&pristineBuiltIns.some(song=>equal(l,song)))chosen=r;
  else if(!base&&pristineBuiltIns.some(song=>equal(r,song)))chosen=l;
  else {chosen=r;const copy=structuredClone(l);ensureScoreSupplements({songs:[copy]});copy.id=newId();copy.title=(copy.title||'未命名歌曲')+'（本機版本）';songs.push(copy);conflicts.push(l.title)}
  if(chosen)songs.push(structuredClone(chosen));
 }
 if(songs.length>500)throw Error('合併後超過 500 首，請先匯出備份再整理歌單。');
 const data={...structuredClone(remote),version:1,songs,installedRepertoire:[...new Set([...(local.installedRepertoire||[]),...(remote.installedRepertoire||[])])]};ensureScoreSupplements(data);return {data,conflicts};
}
