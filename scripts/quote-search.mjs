import {buildQuoteCandidates} from './quote-cards.mjs';
export function quoteSearchCandidates(db,articleBodies,quoteBodies){
 return buildQuoteCandidates(db.books||[],db.podcasts||[],db.quotes||[],articleBodies,quoteBodies,{}, {preferReflective:false});
}
export function searchQuotes(candidates,query){
 const terms=String(query||'').normalize('NFKC').toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
 if(!terms.length)return [];
 const groups=new Map();
 for(const card of candidates){
  const text=card.text.normalize('NFKC').toLocaleLowerCase();
  if(!terms.every(term=>text.includes(term)))continue;
  const key=String(card.notionUrl||card.sourceUrl).split('#')[0];
  if(!groups.has(key))groups.set(key,{...card,passages:[]});
  const group=groups.get(key);
  if(!group.passages.includes(card.text))group.passages.push(card.text);
 }
 return [...groups.values()].map(group=>{
  group.passages.sort((a,b)=>a.length-b.length);
  return {...group,text:group.passages[0]};
 });
}
