(function(root){
 const isIndicator=article=>(article.tags||[]).some(tag=>String(tag).trim().toLowerCase()==='indicator');
 function candidates(articles,bodies){const result=[];for(const article of articles.filter(isIndicator)){const lines=String(bodies[article.url]||'').split('\n');let active=null;for(let i=0;i<lines.length;i++){
 const heading=lines[i].match(/^#{1,6}\s+\d+[.、]\s+(.+)$/);
 if(heading){active=null;const raw=heading[1].replaceAll('**','');const at=raw.search(/[\u3400-\u9fff]/);if(at>0&&/[a-zA-Z]/.test(raw.slice(0,at))){const term=raw.slice(0,at).trim();const context=lines.slice(i+1,i+8).find(l=>/職場應用|實用|用法/.test(l))||'';active={type:term.split(/\s+/).length>1?'用詞':'單字',text:term,meaning:raw.slice(at).trim(),context:context.replace(/^[-*]\s*/,'').trim(),source:article.url,title:article.title,examples:[]};result.push(active);}}
 const example=lines[i].match(/^\s*[-*]?\s*(?:商務例句|實用例句|例句|例句應用|英文例句)[：:]\s*(.+)$/);
 if(active&&example&&/[a-zA-Z]/.test(example[1])){const next=lines.slice(i+1,i+4).find(l=>/^[（(]/.test(l.trim()))||'';active.examples.push({text:example[1].trim().replace(/^"|"$/g,''),meaning:next.trim().replace(/^[（(]|[）)]$/g,'')});}
 }}return [...new Map(result.map(card=>[card.type+':'+card.text.toLowerCase(),card])).values()].map(card=>({...card,id:card.source+'|'+card.type+'|'+card.text}));}
 function draw(cards,count=10,random=Math.random){const pool=cards.filter(card=>card.type==='單字'||card.type==='用詞');for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}return pool.slice(0,count)}
 root.IndicatorStudy={isIndicator,candidates,draw};
})(typeof window==='undefined'?globalThis:window);
