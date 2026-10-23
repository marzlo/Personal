import fs from 'node:fs/promises';
import vm from 'node:vm';
const context={window:{}};vm.createContext(context);
for(const file of ['data.js','article-bodies.js','share-excerpt.js'])vm.runInContext(await fs.readFile(file,'utf8'),context);
const db=context.window.DASHBOARD_DATA;
const cards=[...db.podcasts,...db.books.filter(b=>b.hasAudio)].filter(a=>a.title);
const escape=value=>String(value||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const root='https://marzlo.github.io/Personal/';
const manifest=[];
const covers=db.latestPodcastCovers||[];
const latest=[...db.podcasts,...db.books.filter(b=>b.hasAudio)].filter(a=>a.hasAudio&&!(a.tags||[]).some(t=>String(t).trim().toLowerCase()==='indicator')).sort((a,b)=>new Date(b.updated||0)-new Date(a.updated||0)).slice(0,4);
const photoFor=article=>{
 if(!covers.length)return null;
 const index=latest.findIndex(a=>a.url===article.url);
 const stable=[...article.url].reduce((sum,char)=>(sum*31+char.charCodeAt(0))>>>0,0);
 return covers[index>=0?index%covers.length:stable%covers.length];
};
for(const article of cards){
 const id=article.url.match(/([a-f0-9]{32})$/i)?.[1];if(!id)continue;
 const author=article.author||(article.authors||[]).join('・');
 const excerpt=context.window.ShiyeShareExcerpt(context.window.ARTICLE_BODIES?.[article.url],article.title);
 const url=root+'share/'+id+'/';const version='3-'+(Date.parse(db.syncedAt||article.updated)||0);const previewUrl=url+'?v='+version;const image=url+'cover.png?v='+version;const destination=root+'?article='+id;
 const dir='share/'+id;await fs.mkdir(dir,{recursive:true});
 const title=article.title+'｜拾頁';const description=excerpt||[article.title,author].filter(Boolean).join(' · ');
 await fs.writeFile(dir+'/index.html',`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta property="og:type" content="article"><meta property="og:site_name" content="拾頁"><meta property="og:title" content="${escape(article.title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${previewUrl}"><meta property="og:image" content="${image}"><meta property="og:image:secure_url" content="${image}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${escape(article.title+' · '+author)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(article.title)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="${image}"></head><body><h1>${escape(article.title)}</h1><p>${escape(author)}</p><blockquote>${escape(excerpt)}</blockquote><a href="${destination}&amp;lang=zh">前往拾頁閱讀邀請</a><script>const lang=new URLSearchParams(location.search).get('lang')==='en'?'en':'zh';location.replace(${JSON.stringify(destination)}+'&lang='+lang);</script></body></html>`);
 manifest.push({id,title:article.title,author,excerpt,photo:photoFor(article)});
}
await fs.mkdir('.cache',{recursive:true});await fs.writeFile('.cache/share-manifest.json',JSON.stringify(manifest));console.log('Generated '+manifest.length+' article preview pages');
