import {quoteSearchCandidates,searchQuotes} from './scripts/quote-search.mjs';
let source,candidates;
self.onmessage=event=>{
 const data=event.data;
 if(data.type==='init'){source=data;return}
 if(data.type!=='search')return;
 try{
  candidates??=quoteSearchCandidates(source.db,source.articleBodies,source.quoteBodies);
  source=null;
  self.postMessage({id:data.id,matches:searchQuotes(candidates,data.query)});
 }catch{self.postMessage({id:data.id,error:true})}
};
