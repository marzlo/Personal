import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
test('Generated share page exposes absolute PNG metadata without JavaScript and versions social previews',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'shiye-share-'));
 try{
  const script=new URL('../scripts/build-share-pages.mjs',import.meta.url);
  await fs.writeFile(path.join(dir,'data.js'),'window.DASHBOARD_DATA='+JSON.stringify({books:[],podcasts:[{title:'標題 <測試>',url:'https://pickle-trail-279.notion.site/4021c7f3357e80fab1a1dd3138bbef29',updated:'2026-10-23T15:54:00.000Z',author:'作者'}]})+';');
  await fs.writeFile(path.join(dir,'article-bodies.js'),'window.ARTICLE_BODIES={};');
  await fs.copyFile(new URL('../share-excerpt.js',import.meta.url),path.join(dir,'share-excerpt.js'));
  execFileSync(process.execPath,[script.pathname],{cwd:dir});
  const html=await fs.readFile(path.join(dir,'share/4021c7f3357e80fab1a1dd3138bbef29/index.html'),'utf8');
  const image=html.match(/property="og:image" content="([^"]+)"/)[1];
  assert.ok(image.startsWith('https://marzlo.github.io/Personal/share/'));assert.ok(image.includes('/cover.png?v=2-'));
  assert.ok(html.includes('property="og:image:type" content="image/png"'));assert.ok(html.includes('property="og:image:width" content="1200"'));assert.ok(html.includes('property="og:image:height" content="630"'));
  assert.ok(html.includes('property="og:image:secure_url" content="'+image+'"'));assert.ok(html.includes('name="twitter:image" content="'+image+'"'));
  assert.ok(html.includes('標題 &lt;測試&gt;'));
 }finally{await fs.rm(dir,{recursive:true,force:true})}
});
