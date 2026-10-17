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
 const passages=completeQuotePassages;
 const cards=[];
 for(const quote of quotes){const book=(quote.bookRefs||[]).map(url=>byUrl.get(url)).find(Boolean);for(const text of passages(quoteBodies[quote.url]))cards.push({text,sourceTitle:book?.title||quote.title,sourceUrl:book?.url||quote.url,notionUrl:quote.url,page:quote.page});}
 for(const article of [...books,...podcasts]){const book=(article.bookRefs||[]).map(url=>byUrl.get(url)).find(Boolean)||books.find(book=>(book.podcastRefs||[]).includes(article.url));for(const text of passages(articleBodies[article.url]))cards.push({text,sourceTitle:book?.title||article.title,sourceUrl:book?.url||article.url,notionUrl:article.url,page:null});}
 return cards;
}

export function completeQuotePassages(body){
 const units=[];
 for(const line of String(body||'').split(/\n+/)){
  if(/^\s*#{1,6}\s/.test(line)){units.push(null);continue;}
  const listItem=/^\s*(?:(?:\d+|[一二三四五六七八九十]+)[.、．)]\s*|[-*]\s+)/.test(line);
  const text=line.trim().replace(/^(?:\d+|[一二三四五六七八九十]+)[.、．)]\s*/,'').replace(/^[-*>]\s*/,'');
  if(!text)continue;
  if(listItem)units.push(null);
  units.push(...(text.match(/[^。！？.!?]+[。！？.!?]?[」』”’）)"']*/g)||[]).map(s=>s.trim()).filter(s=>s&&!/^[\d\s.,:、．]+$/.test(s)));
  if(listItem)units.push(null);
 }
 const closed=text=>/[。！？.!?][」』”’）)"']*$/.test(text)&&[['「','」'],['『','』'],['（','）']].every(([a,b])=>text.split(a).length===text.split(b).length);
 const result=[];
 for(let i=0;i<units.length;i++){
  if(!units[i])continue;
  let text=units[i];let next=i;
  while((!closed(text)||text.length<28)&&next+1<units.length&&next-i<7&&units[next+1]&&text.length+units[next+1].length<=360){text+='\n'+units[++next];}
  if(text.length>=28&&text.length<=360&&closed(text)&&!/https?:|深度探討模式|辯論模式|以下為|以下是|點擊|訂閱/.test(text))result.push(text);
 }
 const reflective=result.filter(text=>/自己|生命|意識|選擇|相信|理解|自由|改變|感受|存在|行動|責任|世界|內在|思考|經驗|可能|看見|成為/.test(text));
 return reflective.length?reflective:result;
}
