(function(root) {
  let current = null;
  function marked(tags,id) {return Array.isArray(tags.__podcastMastered?.[id]) ? tags.__podcastMastered[id] : []}
  function refresh(episode,tags) {
    if (!current || current.id !== episode.id) return;
    const terms=marked(tags,episode.id),visitor=document.body.classList.contains('notes-visitor');
    for(const [term,input] of current.inputs){input.checked=terms.includes(term);input.disabled=visitor}
    current.count.textContent=current.inputs.filter(([term])=>terms.includes(term)).length+' / '+current.inputs.length+' 已熟記';
  }
  function render(host,episode,read,write) {
    current=null;if(!host || !episode.studyNotes)return;
    host.replaceChildren();const notes=episode.studyNotes;
    function el(tag,text,parent=host){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;parent.append(node);return node}
    el('h3','容易混淆的表達');
    for(const [title,text] of notes.comparisons){el('h4',title);el('p',text)}
    if(notes.quiz?.length){
    el('h3','互動複習');
    const progress=el('p','0 / '+notes.quiz.length+' 已作答');progress.setAttribute('aria-live','polite');
    const answers=[];
    notes.quiz.forEach((q,i)=>{
      const group=el('fieldset');el('legend',(i+1)+'. '+q.question,group);
      const inputs=q.options.map((option,j)=>{
        const label=el('label',undefined,group),input=document.createElement('input');input.type='radio';input.name='podcast-quiz-'+episode.id+'-'+i;input.value=String(j);label.append(input,document.createTextNode(option));
        input.onchange=()=>{progress.textContent=answers.filter(a=>a.inputs.some(n=>n.checked)).length+' / '+notes.quiz.length+' 已作答';score.textContent='';answers.forEach(a=>a.result.textContent='')};
        return input;
      });
      const result=el('p','',group);result.className='quiz-feedback';answers.push({inputs,result,q});
    });
    const score=el('p','');score.setAttribute('role','status');
    const check=el('button','檢查答案');check.type='button';
    check.onclick=()=>{
      let correct=0;
      answers.forEach(({inputs,result,q})=>{const chosen=inputs.findIndex(n=>n.checked);const good=chosen===q.answer;if(good)correct++;result.textContent=(chosen<0?'尚未作答':good?'答對了':'再想一想')+'。正解：'+q.options[q.answer]+'。'+q.explanation});
      score.textContent='答對 '+correct+' / '+answers.length+' 題';
    };
    const reset=el('button','重做');reset.type='button';reset.onclick=()=>{answers.forEach(a=>{a.inputs.forEach(n=>n.checked=false);a.result.textContent=''});progress.textContent='0 / '+answers.length+' 已作答';score.textContent=''};
    }
    el('h3','優先學習清單');const count=el('p','');count.setAttribute('aria-live','polite');
    el('p','熟記進度登入後會自動同步；訪客可閱讀清單與練習測驗。').className='sample-note';
    const inputs=notes.priority.map(term=>{
      const label=el('label'),input=document.createElement('input');input.type='checkbox';input.setAttribute('data-mastery','');
      const word=episode.cards.find(w=>w[0]===term);label.append(input,document.createTextNode(term+' · '+(word?.[1]||'')));
      input.onchange=()=>{
        if(document.body.classList.contains('notes-visitor')){refresh(episode,read());return}
        const tags=read(),previous=marked(tags,episode.id),next=input.checked?[...new Set([...previous,term])]:previous.filter(t=>t!==term);
        write({__podcastMastered:{...(tags.__podcastMastered||{}),[episode.id]:next}});refresh(episode,read());
      };return [term,input];
    });
    const copy=el('button','複製 15 個重點表達');copy.type='button';const copyStatus=el('p','');copyStatus.setAttribute('role','status');
    copy.onclick=async()=>{const text=notes.priority.map(term=>{const word=episode.cards.find(w=>w[0]===term);return term+' — '+(word?.[1]||'')}).join('\n');try{await navigator.clipboard.writeText(text);copyStatus.textContent='已複製優先學習清單。'}catch{copyStatus.textContent='無法自動複製，請選取下方文字。';const area=el('textarea',text);area.readOnly=true;area.setAttribute('aria-label','優先學習清單文字');area.select()}};
    current={id:episode.id,count,inputs};refresh(episode,read());
  }
  root.PodcastExercises={render,refresh};
})(typeof window==='undefined'?globalThis:window);
