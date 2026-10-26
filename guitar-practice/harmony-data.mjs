// Theory and voicings copied from src/harmony.html; preserve Chord Blueprint attribution.
const pcs=['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'];
const letters=['C','D','E','F','G','A','B'],naturals=[0,2,4,5,7,9,11];
const modes={major:{name:'大調',iv:[0,2,4,5,7,9,11]},natural:{name:'自然小調',iv:[0,2,3,5,7,8,10]},harmonic:{name:'和聲小調',iv:[0,2,3,5,7,8,11]},melodic:{name:'旋律小調（爵士）',iv:[0,2,3,5,7,9,11]}};
const defs=[
{id:'maj',suffix:'',name:'大三和弦',iv:[0,4,7],sh:[[0,2,2,1,0,0],[null,0,2,2,2,0]]},
{id:'maj7',suffix:'maj7',name:'大七和弦',iv:[0,4,7,11],sh:[[0,null,1,1,0,null],[null,0,2,1,2,0]]},
{id:'add9',suffix:'add9',name:'加九和弦',iv:[0,4,7,2],sh:[[0,null,2,1,0,2],[null,0,-1,-3,0,null]]},
{id:'6',suffix:'6',name:'六和弦',iv:[0,4,7,9],sh:[[0,null,2,1,2,null],[null,0,2,2,2,2]]},
{id:'maj9',suffix:'maj9',name:'大九和弦',iv:[0,4,7,11,2],sh:[[0,-1,1,-1,null,null],[null,0,-1,1,0,null]]},
{id:'min',suffix:'m',name:'小三和弦',iv:[0,3,7],sh:[[0,2,2,0,0,0],[null,0,2,2,1,0]]},
{id:'m7',suffix:'m7',name:'小七和弦',iv:[0,3,7,10],sh:[[0,null,0,0,0,null],[null,0,2,0,1,0]]},
{id:'m9',suffix:'m9',name:'小九和弦',iv:[0,3,7,10,2],sh:[[0,2,0,0,0,2],[null,0,-2,0,0,null]]},
{id:'m11',suffix:'m11',name:'小十一和弦',iv:[0,3,7,10,2,5],sh:[[0,null,0,0,-2,null],[null,0,0,0,1,0]]},
{id:'m6',suffix:'m6',name:'小六和弦',iv:[0,3,7,9],sh:[[0,null,-1,0,0,null],[null,0,2,2,1,2]]},
{id:'7',suffix:'7',name:'屬七和弦',iv:[0,4,7,10],sh:[[0,2,0,1,0,0],[null,0,2,0,2,0]]},
{id:'9',suffix:'9',name:'屬九和弦',iv:[0,4,7,10,2],sh:[[0,null,0,1,0,2],[null,0,-1,0,0,null]]},
{id:'sus2',suffix:'sus2',name:'掛二和弦',iv:[0,2,7],sh:[[0,null,null,-1,0,0],[null,0,2,2,0,0]]},
{id:'sus4',suffix:'sus4',name:'掛四和弦',iv:[0,5,7],sh:[[0,2,2,2,0,0],[null,0,2,2,3,0]]},
{id:'7sus4',suffix:'7sus4',name:'屬七掛四',iv:[0,5,7,10],sh:[[0,2,0,2,0,0],[null,0,2,0,3,0]]},
{id:'m7b5',suffix:'m7♭5',name:'半減七和弦',iv:[0,3,6,10],sh:[[0,null,0,0,-1,null],[null,0,1,0,1,null]]},
{id:'dim7',suffix:'dim7',name:'減七和弦',iv:[0,3,6,9],sh:[[0,null,-1,0,-1,null],[null,0,1,-1,1,null]]}
];
defs.push(
{id:'dim',suffix:'dim',name:'減三和弦',iv:[0,3,6],sh:[[0,1,2,0,null,null],[null,0,1,2,1,null]]},
{id:'aug',suffix:'aug',name:'增三和弦',iv:[0,4,8],sh:[[0,null,2,1,1,0],[null,0,3,2,2,1]]},
{id:'mMaj7',suffix:'m(maj7)',name:'小大七和弦',iv:[0,3,7,11],sh:[[0,null,1,0,0,null],[null,0,2,1,1,0]]},
{id:'augMaj7',suffix:'maj7(♯5)',name:'增大七和弦',iv:[0,4,8,11],sh:[[0,null,1,1,1,null],[null,0,3,1,2,1]]}
);
// Verified against the embedded William Vinci / Chord Blueprint library.
// Entries identify original page and figure, not fingering numbers.
const shapeSources={
 maj:['第6頁・A 第1圖','第6頁・A 第2圖'],
 min:['第8頁・Am 第1圖','第8頁・Am 第2圖'],
 maj7:['第10頁・Amaj7 第1圖','第10頁・Amaj7 第6圖'],
 add9:['第17頁・A(add9) 第2圖','第17頁・A(add9) 第6圖'],
 maj9:['第23頁・Amaj9 第2圖','第23頁・Amaj9 第1圖'],
 m7:['第12頁・Am7 第3圖','第12頁・Am7 第7圖'],
 m9:['第23頁・Am9 第3圖','第23頁・Am9 第4圖'],
 m11:['第12頁・Am11 第1圖',null],
 m6:['第12頁・Am6 第2圖',null],
 '7':['第14頁・A7 第8圖','第14頁・A7 第9圖'],
 sus2:[null,'第21頁・Asus2 第6圖'],
 sus4:['第21頁・Asus4 第1圖','第21頁・Asus4 第5圖'],
 '7sus4':['第21頁・A7sus4 第2圖','第21頁・A7sus4 第4圖'],
 m7b5:['第19頁・Am7(♭5) 第1圖','第19頁・Am7(♭5) 第3圖'],
 dim7:['第19頁・Adim7 第1圖','第19頁・Adim7 第2圖']
};

export {pcs,letters,naturals,modes,defs,shapeSources};
