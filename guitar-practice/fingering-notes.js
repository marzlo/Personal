const groups=[
 {title:'第一組 · 第 5–9 品',items:[
 ['D',[null,null,7,7,7,null],'D/A','低音為 A；D 根音在第三弦第 7 品。'],
 ['A6(no3)',[null,null,7,9,7,null],'A6(no3)','省略三音 C♯，保留六音 F♯。'],
 ['G6(no3)',[null,null,5,7,5,null],'G6(no3)','省略三音 B，保留六音 E。'],
 ['G♭5(add6)',[null,null,5,6,5,null],'G(add6,♭5,no3)','G 為根音，降低五音；不是 G♭ 和弦。'],
 ['D',[null,null,7,7,7,null],'D/A','回到第一個 D 按法。']]},
 {title:'第二組 · 第 10–14 品',items:[
 ['D',[null,null,7,7,7,null],'D/A','沿用兩組之間的 D，作為這組起點。'],
 ['A6(no3)',[null,12,14,14,null,null],'A5','實際為 A–E–A；沒有六音 F♯。'],
 ['G6(no3)',[null,10,12,12,null,null],'G5','實際為 G–D–G；沒有六音 E。'],
 ['G♭5(add6)',[null,10,11,12,null,null],'G(♭5,no3)','實際為 G–C♯–G；沒有六音 E。'],
 ['D',[10,null,11,11,10,null],'Dmaj7','實際為 D–C♯–F♯–A；含大七音 C♯。']]}
];
const opens=[4,9,2,7,11,4],names=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
function chart(label,frets){
 const positive=frets.filter(f=>f>0),start=Math.min(...positive),rows=Math.max(4,Math.max(...positive)-start+1),bottom=40+rows*36;
 let svg=`<svg viewBox="0 0 240 ${bottom+35}" role="img" aria-label="${label}，六弦至一弦：${frets.map(f=>f===null?'不彈':f+'品').join('、')}"><title>${label} 指板圖</title>`;
 frets.forEach((f,i)=>{const x=40+i*34;svg+=`<line x1="${x}" y1="40" x2="${x}" y2="${bottom}"/><text x="${x}" y="24">${f===null?'×':f===0?'○':''}</text><text x="${x}" y="${bottom+26}">${['E','A','D','G','B','E'][i]}</text>`});
 for(let i=0;i<=rows;i++)svg+=`<line x1="40" y1="${40+i*36}" x2="210" y2="${40+i*36}"/>`;
 svg+=`<text x="14" y="64">${start}</text>`;
 frets.forEach((f,i)=>{if(f>0){const x=40+i*34,y=40+(f-start+.5)*36;svg+=`<circle cx="${x}" cy="${y}" r="15"/><text class="note" x="${x}" y="${y+5}">${names[(opens[i]+f)%12]}</text>`}});
 return svg+'</svg>';
}
const host=document.querySelector('#groups');
for(const group of groups){const section=document.createElement('section');section.innerHTML=`<h2>${group.title}</h2><div class="cards"></div>`;group.items.forEach(([label,frets,actual,note],i)=>{const card=document.createElement('article');card.innerHTML=`<span class="step">${i+1}</span><h3>${label}</h3>${chart(actual,frets)}<p class="frets">${frets.map(f=>f===null?'×':f).join(' · ')}</p><p>組成音：${frets.flatMap((f,i)=>f===null?[]:[names[(opens[i]+f)%12]]).join(' · ')}</p><p>按法判讀：<strong>${actual}</strong></p><p class="explanation">${note}</p>`;section.querySelector('.cards').append(card)});host.append(section)}
