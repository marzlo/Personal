const sourceKey = card => String(card.sourceUrl || card.notionUrl || card.sourceTitle || '').split(/[?#]/)[0].replaceAll('-', '').toLowerCase();
function shuffle(items,random){const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
export function selectQuoteCards(candidates, count = 10, random = Math.random, previous = []) {
 if(count<=0)return [];
 const groups=new Map();
 for(const card of candidates){if(!card?.text?.trim())continue;const key=sourceKey(card);if(!groups.has(key))groups.set(key,new Map());groups.get(key).set(card.text.trim(),card);}
 const recent=new Set(previous.map(sourceKey));const keys=[...shuffle([...groups.keys()].filter(key=>!recent.has(key)),random),...shuffle([...groups.keys()].filter(key=>recent.has(key)),random)];
 const chosen=[],seen=new Set();for(const key of keys){const card=shuffle([...groups.get(key).values()],random).find(card=>!seen.has(card.text.trim()));if(!card)continue;chosen.push(card);seen.add(card.text.trim());if(chosen.length>=count)break;}return chosen;
}
export function buildQuoteCandidates(books,podcasts,quotes,articleBodies,quoteBodies){
 const byUrl=new Map(books.map(book=>[book.url,book]));
 const passages=body=>{const lines=String(body||'').split(/\n+/).filter(line=>!/^\s*#{1,6}\s/.test(line));let result=lines.flatMap(line=>(line.match(/[^。！？.!?]+[。！？.!?]?/g)||[]).map(text=>text.trim().replace(/^[-*>]\s*/,''))).filter(text=>text.length>=28&&text.length<=220&&!/https?:|深度探討模式|辯論模式|以下為|以下是|點擊|訂閱/.test(text));const reflective=result.filter(text=>/自己|生命|意識|選擇|相信|理解|自由|改變|感受|存在|行動|責任|世界|內在|思考|經驗|可能|看見|成為/.test(text));return reflective.length?reflective:result;};
 const cards=[];
 for(const quote of quotes){const book=(quote.bookRefs||[]).map(url=>byUrl.get(url)).find(Boolean);for(const text of passages(quoteBodies[quote.url]))cards.push({text,sourceTitle:book?.title||quote.title,sourceUrl:book?.url||quote.url,notionUrl:quote.url,page:quote.page});}
 for(const article of [...books,...podcasts]){const book=(article.bookRefs||[]).map(url=>byUrl.get(url)).find(Boolean)||books.find(book=>(book.podcastRefs||[]).includes(article.url));for(const text of passages(articleBodies[article.url]))cards.push({text,sourceTitle:book?.title||article.title,sourceUrl:book?.url||article.url,notionUrl:article.url,page:null});}
 return cards;
}
