import {buildQuoteCandidates} from './quote-cards.mjs';
export function quoteSearchCandidates(db,articleBodies,quoteBodies){
 return buildQuoteCandidates(db.books||[],db.podcasts||[],db.quotes||[],articleBodies,quoteBodies,{}, {preferReflective:false});
}
export function searchQuotes(candidates,query){
 const terms=String(query||'').normalize('NFKC').toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
 if(!terms.length)return [];
 const seen=new Set();
 return candidates.filter(card=>{
  const text=card.text.normalize('NFKC').toLocaleLowerCase();
  const key=String(card.notionUrl||card.sourceUrl).split('#')[0]+'|'+card.text;
  if(!terms.every(term=>text.includes(term))||seen.has(key))return false;
  seen.add(key);return true;
 });
}
