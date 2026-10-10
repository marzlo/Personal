export async function refreshPodcastCovers(previous = [], fetcher = fetch, random = Math.random) {
  const response = await fetcher('https://picsum.photos/v2/list?page='+(1+Math.floor(random()*8))+'&limit=100', {signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error('Photo catalogue unavailable: '+response.status);
  const old=new Set(previous.map(photo=>photo.id));
  const pool=(await response.json()).filter(photo=>/^\d+$/.test(String(photo.id))&&!old.has(String(photo.id))&&photo.width>=600&&photo.height>=400&&/^https:\/\/unsplash.com\//.test(photo.url));
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  if(pool.length<4)throw new Error('Not enough new cover photos');
  return pool.slice(0,4).map(photo=>({id:String(photo.id),image:'https://picsum.photos/id/'+photo.id+'/900/600',alt:'攝影封面 · '+photo.author,artist:photo.author,url:photo.url}));
}
