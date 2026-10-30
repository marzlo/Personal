export const SHANTOU_SCORE_ID='shantou-utopia-score-v1';
export const isShantou=s=>(Array.isArray(s.scoreSupplements)&&s.scoreSupplements.includes(SHANTOU_SCORE_ID))||s.id==='shantou-wuwang-v1'||(s.title?.trim()==='山頭'&&s.artist?.trim()==='無妄合作社');
const chorus='C → Dadd4(add9) → Em';
const verse='Em7 → Em → C → Dadd4(add9)';
const power='E5 → E5 → C5 → D5';
function part(n,name,label,bars,chords,notes,scorePages,concepts=[]){return {id:'shantou-score-'+String(n).padStart(2,'0'),name,label,bars,chords,notation:'notes',concepts,notes,scorePages}}
export const shantouScoreSections=[
 part(1,'前奏','前奏','1–24','E 低音／12 品泛音 → C → Dadd4(add9)','原譜標「前奏」。開頭保留低音 E 與 12 品泛音，再接 10–12 品 hammer-on 與分解和弦。這裡的「E 低音／泛音」是演奏提示，不是完整和弦名；兩把吉他的入點與連音請對照原譜。',[1,2],['旋律動機']),
 part(2,'間奏','前奏過門（練習分段）','25–28',power,'此處原譜沒有另標段落名；為練習方便獨立整理。第二把吉他從這裡進入 P.M. 悶音，E5／C5／D5 依 TAB 的根音與五音簡記，不代表原譜另標了這些和弦名稱。',[2],['節奏／律動']),
 part(3,'間奏','前奏後主奏（練習分段）','29–40',power+'（循環）','以主奏樂句搭配第二把吉他的悶音伴奏，包含滑音與全音推弦。原譜此處未另標「Solo」，本段按演奏安排分組；節奏、弦位與品位保留於 TAB。',[3],['旋律動機','節奏／律動']),
 part(4,'主歌','主歌 A','41–48',verse,'第 41–44 小節有反覆記號，標 3x；第 45–48 小節接續另一輪。小節範圍使用譜面編號，不把反覆展開成新的編號。',[4],['延伸和弦']),
 part(5,'間奏','間奏','49–56',power+'（循環）','原譜標「間奏」。主奏延續前面的短句、滑音和推弦，伴奏維持悶音；先分開練兩條聲部，再合奏。',[4,5],['旋律動機','節奏／律動']),
 part(6,'主歌','主歌 B','57–64',verse+'；後半 Em7 →（未另標）→ C → Dadd4(add9)','後半第 62 小節沒有另標伴奏和弦，保留原譜休止／延音安排，不自行補寫 Em。',[5],['延伸和弦']),
 part(7,'預副歌','導歌 A · Pre-chorus','65–72','C → D → E5 → E5（循環）','原譜標「導歌 Pre-chorus」。C、D 為原譜和弦名；後兩小節的 E5 是依伴奏 TAB 簡記。留意第一把吉他的雙音旋律，與悶音伴奏的節奏銜接。',[6],['旋律動機','節奏／律動']),
 part(8,'副歌','副歌 A','73–88',chorus+'（反覆與變化）','原譜標「副歌」。和弦為段落概要；第 84 小節主奏另標 Em13，後段有伴奏停頓與節奏變化。Hammer-on／pull-off、全音推弦與顫音以原譜為準，不以普通 Em 按法取代原圖。',[6,7],['延伸和弦','旋律動機']),
 part(9,'主歌','主歌 C','89–96',verse+'；後半 Em7 → Em9 → C → Dadd4(add9)','第二輪把 Em 變成 Em9；留意九音的色彩，並維持相同的分句與節奏。',[8],['延伸和弦']),
 part(10,'預副歌','導歌 B · Pre-chorus','97–104','C → D → E5 → E5（循環）','對照前一段導歌，確認雙音旋律、主奏收句與最後的開放和弦；E5 仍是依 TAB 簡記。',[8,9],['旋律動機','節奏／律動']),
 part(11,'副歌','副歌 B','105–122',chorus+'（反覆與變化）','第 105 小節開始原譜標「副歌」，高把位短句逐漸增加，包含 15–17 品 hammer-on、延音與顫音。最後兩小節以低音 E 銜接 Bridge；實際伴奏停頓請對照 TAB。',[9,10],['旋律動機','節奏／律動']),
 part(12,'橋段','Bridge','123–128','Cmaj7 → D9 → Em → Em9；接 Cmaj7 → D9','原譜以 CM7 表示 Cmaj7。第 123–126 小節反覆標 3x，第 127–128 小節銜接下一段；D9 保留原譜標記與指法，不擅自換成編輯器的標準屬九和弦。',[10,11],['延伸和弦']),
 part(13,'主歌','主歌 D · 近看遠看','129–132',verse,'原譜段落標「主歌…近看遠看」，反覆記號標 6x。這裡只保留段落名稱，不額外補寫歌詞。',[11],['延伸和弦']),
 part(14,'副歌','副歌 C','133–148',chorus+'（反覆與變化）','主奏從熟悉的副歌動機往高把位發展。留意雙音、hammer-on、半音推弦、顫音，以及後段伴奏的切分與留白。',[11,12],['旋律動機','節奏／律動']),
 part(15,'尾奏','尾段主奏／收尾（練習分段）','149–166',chorus+'；末段伴奏休止、主奏延音收尾','原譜此處沒有另標尾奏；依收尾安排分組。第 149–164 小節分句練推弦、回弦與連音，最後由主奏延音結束。完整節奏與推弦幅度直接保留原譜，不猜寫逐音轉錄。',[13,14],['旋律動機','節奏／律動'])
];
// Append the supplied score once; never replace an existing idea, section, chord choice or tempo.
export function supplementShantou(song){
 if(!isShantou(song)||(Array.isArray(song.scoreSupplements)&&song.scoreSupplements.includes(SHANTOU_SCORE_ID)))return false;
 const missing=shantouScoreSections.filter(section=>!song.sections.some(p=>p.id===section.id));if(song.sections.length+missing.length>500)return false;
 if(!song.tempo)song.tempo='126 BPM · 4/4';
 const ids=new Set(song.sections.map(s=>s.id));for(const section of shantouScoreSections)if(!ids.has(section.id))song.sections.push(structuredClone(section));
 song.scoreSupplements=[...(Array.isArray(song.scoreSupplements)?song.scoreSupplements:[]),SHANTOU_SCORE_ID];return true;
}
export function ensureScoreSupplements(data){let changed=false;for(const song of data.songs)if(supplementShantou(song))changed=true;return changed}
