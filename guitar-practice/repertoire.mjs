import {ensureScoreSupplements,isShantou,supplementShantou} from './shantou-score.mjs?v=1';
// User-supplied Letting Go.pdf. Section labels are practice labels, not original verse/chorus labels.
const id='letting-go-potsu-v1';
function section(n,label,bars,chords,notes,pages,concepts=[]){return {id:`letting-go-${n}`,name:label.includes('Solo')?'Solo':'其他',label,bars,chords,notation:'notes',concepts,notes,scorePages:pages}}
const main='Emaj7 → Em7 → Bmaj9 → Adim → C♯m7 → Cmaj7 → Bmaj7 → Emaj7';
export const lettingGo={id,title:'Letting Go',artist:'Potsu',key:'B 大調',tempo:'100 BPM · 4/4',sourceId:id,ideas:[{id:'letting-go-idea',text:'先以 100 BPM 分開練伴奏與旋律，再合起來。主題的推弦、顫音與快速 Solo 的三連音，可分成短句慢練。此為練習建議，原譜沒有提供音訊。'}],sections:[
 section(1,'開頭和弦','1–8','C♯m9 → Em7 → Bmaj9 → Adim → C♯m7 → Cmaj7/C♯ → G♯m7 → C♯m9','原譜第 1 頁上半。第二條旋律聲部休止。原譜標記 CM7/C♯ 與 Adim 保留，不擅自依和弦名稱重寫原按法；以 PDF 的音符及 TAB 為準。',[1],['延伸和弦']),
 section(2,'伴奏主循環','9–16',main,'第 16 小節沒有另標和弦名；這裡依相同的音符／TAB 暫記為 Emaj7，請對照原譜。Emaj7 → Em7 可觀察大三音降為小三音的色彩變化。',[1],['借用和弦','共同音連接']),
 section(3,'主題旋律','17–24',main,'原譜第 2 頁上半。旋律聲部含全音推弦（箭頭標示 1）、顫音與高把位樂句；先練主題節奏，再對照伴奏和弦。',[2],['旋律動機','節奏／律動']),
 section(4,'快速 Solo','25–32',main,'第 2 頁下半至第 4 頁上半。第 25–30 小節有快速音群、連音與半音色彩；第 31–32 小節包含三連音上行與下行。Solo 的弦位、品位及節奏直接保留原譜，未以純文字猜寫。',[2,3,4],['旋律動機','節奏／律動']),
 section(5,'反覆伴奏','33–40',main,'原譜第 4 頁反覆記號區，結尾標示 3x。第 40 小節同樣未另標和弦名；依音符／TAB 暫記為 Emaj7。旋律聲部休止，練穩伴奏銜接。',[4],['共同音連接']),
 section(6,'主題再現','41–48','Emaj7 → Em7 → Bmaj9 → Adim → C♯m7 → Cmaj7 → Bmaj7 → C♯m9','第 4 頁下半。前段回到主題推弦樂句，最後一小節改接 C♯m9，銜接尾段。',[4],['旋律動機','延伸和弦']),
 section(7,'尾段旋律 A','49–54','C♯m7 → F♯7 → Bmaj7 → Emaj7 → A♯m7 → D♯m7 / D♯maj7','第 5 頁上半。末小節依序為 D♯m7、D♯maj7（原譜 D♯M7），斜線在此表示同小節先後兩個和弦，不表示轉位低音。旋律以原譜 TAB 為準。',[5],['屬和弦／解決','共同音連接']),
 section(8,'尾段旋律 B／收尾','55–59','G♯m7 / Gm7 → F♯m7 / Fm7 → Emaj7 → D♯maj7 → G♯m7','第 5 頁下半。前兩小節各有兩個和弦，以半音下行連接；斜線表示同小節先後演奏。最後停在 G♯m7。',[5],['共同音連接','節奏／律動'])]};
const scoreChords={'Emaj7':[4,'maj7'],'Em7':[4,'m7'],'Bmaj9':[11,'maj9'],'Adim':[9,'dim'],'C♯m7':[1,'m7'],'Cmaj7':[0,'maj7'],'Bmaj7':[11,'maj7'],'C♯m9':[1,'m9'],'F♯7':[6,'7'],'A♯m7':[10,'m7'],'D♯m7':[3,'m7'],'D♯maj7':[3,'maj7'],'G♯m7':[8,'m7'],'Gm7':[7,'m7'],'F♯m7':[6,'m7'],'Fm7':[5,'m7']};
for(const p of lettingGo.sections.slice(1)){p.harmony={key:11,mode:'major',inputMode:'notes',active:0,chords:p.chords.split(/ → | \/ /).map(symbol=>{const [root,quality]=scoreChords[symbol];return {root,quality,shape:0}})};p.harmonyOrigin='reference'}
export const shantouBeforeScore={id:'shantou-wuwang-v1',title:'山頭',artist:'無妄合作社',key:'',tempo:'',sourceFilename:'山頭 -  無妄合作社.wav',audioStatus:'pending',ideas:[],sections:[]};
export const shantou=structuredClone(shantouBeforeScore);supplementShantou(shantou);
export const builtInSongs=[lettingGo,shantou];
export const pristineBuiltIns=[...builtInSongs,shantouBeforeScore];
export function ensureRepertoire(data){
 if(!Array.isArray(data.installedRepertoire))data.installedRepertoire=[];
 let changed=false;
 for(const song of builtInSongs){
  if(data.installedRepertoire.includes(song.id))continue;
  const existing=data.songs.some(s=>s.id===song.id||s.sourceId===song.id||(s.title.trim().toLowerCase()===song.title.toLowerCase()&&s.artist.trim().toLowerCase()===song.artist.toLowerCase()));
  if(!existing&&data.songs.length>=500)continue;
  if(!existing)data.songs.push(structuredClone(song));
  data.installedRepertoire.push(song.id);changed=true;
 }
 return ensureScoreSupplements(data)||changed;
}
export function scoreSource(song){
 if(song.sourceId===id)return {url:'assets/scores/letting-go/score.pdf',assetDir:'assets/scores/letting-go',label:'Letting Go',pages:5,title:'Letting Go.pdf · 使用者提供的練團譜',description:'依小節整理練習段落，不另猜作主歌／副歌。原譜的音符、TAB、Solo 記號保留於 PDF。'};
 if(isShantou(song))return {url:'assets/scores/shantou-utopia/score.pdf',assetDir:'assets/scores/shantou-utopia',label:'山頭 Utopia',pages:14,title:'山頭 Utopia.pdf · 使用者提供的練團譜',description:'原譜標示 126 BPM、4/4。依原譜標記及小節整理；和弦為段落概要，特殊指法、雙吉他聲部、泛音、悶音與主奏記號以原譜為準。未依音檔確認調性或節奏。'};
 return null;
}
