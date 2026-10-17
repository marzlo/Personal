(() => {
  const episodes = window.PODCAST_EPISODES || [];
  const $ = id => document.getElementById(id);
  const cardElement = document.querySelector('.flashcard');
  const track = document.getElementById('wordTrack');
  let buildingTrack = false;
  let tags = {}, saved = [], cards = [], pool = [], index = 0, deleted = [];
  let episode = episodes[0];
  if (!episode) return;
  const requested = new URLSearchParams(window.location?.search || '').get('episode');
  episode = episodes.find(e => e.id === requested) || episode;
  const cardLabel = card => card?.old ? '原有 Indicator 收藏' : (card?.word[6] ? '★ 優先推薦 · ' : '') + (card?.word[5] || card?.episode?.show || '精選詞句');
  function rebuildCards() {
    cards = episodes.flatMap(e => e.cards.map(word => ({word, episode:e, id:e.id + ':' + word[0].trim().toLowerCase()})));
    for (const old of Array.isArray(tags.__indicatorSaved) ? tags.__indicatorSaved : []) {
      if (!old.text || cards.some(c => c.word[0] === old.text)) continue;
      cards.push({word:[old.text,old.meaning || '',old.examples?.[0]?.text || '',old.examples?.[0]?.meaning || '',old.context || '原有 Indicator 收藏'],old,id:'legacy:' + (old.id || (old.source || '') + '|' + old.text.toLowerCase())});
    }
  }
  function setPool() {
    const active = cards.filter(c => !deleted.some(d => d.id === c.id));
    pool = $('scope').value === 'saved' ? active.filter(c => saved.includes(c.word[0]))
      : $('scope').value === 'all' ? active : active.filter(c => c.episode?.id === episode.id);
    index = Math.max(0, Math.min(index, pool.length - 1));
  }
  function collection() {
    const visibleSaved = saved.filter(term => !deleted.some(d => d.text === term) || cards.some(c => c.word[0] === term && !deleted.some(d => d.id === c.id)));
    $('savedCount').textContent = visibleSaved.length + ' 個收藏'; $('savedList').replaceChildren();
    if (!visibleSaved.length) {
      const p = document.createElement('p'); p.textContent = '把想記住的表達留下，下次再回來練習。'; $('savedList').append(p);
    }
    for (const term of visibleSaved) {
      const button = document.createElement('button'); button.textContent = term;
      button.onclick = () => {
        $('scope').value = 'saved'; setPool(); index = Math.max(0,pool.findIndex(c => c.word[0] === term));
        render(); window.scrollTo({top:0,behavior:'smooth'});
      }; $('savedList').append(button);
    }
  }
  function render() {
    const card = pool[index], word = card?.word;
    $('position').textContent = pool.length ? (index + 1) + ' / ' + pool.length : '0 / 0';
    $('term').textContent = word?.[0] || '目前沒有可學習的字卡';
    $('example').textContent = word?.[2] || '可以切換學習範圍，或從「已刪除字卡」恢復。';
    $('meaning').textContent = word?.[1] || ''; $('translation').textContent = word?.[3] || ''; $('usage').textContent = word?.[4] || '';
    $('kind').textContent = cardLabel(card);
    const source = cardElement?.querySelector ? cardElement.querySelector('footer a') : document.querySelector('.flashcard footer a');
    source.textContent = '來源：' + (card?.episode?.title || card?.old?.title || 'Podcast') + ' ↗';
    source.href = card?.old && /^https:\/\//.test(card.old.source || '') ? card.old.source : '#episode';
    source.onclick = card?.episode ? event => {
      event.preventDefault(); if (switchEpisode(card.episode.id)) $('episode').scrollIntoView({behavior:'smooth'});
    } : null;
    $('answer').hidden = true; $('reveal').textContent = '顯示中文與用法 ＋'; $('reveal').disabled = !word; $('save').disabled = !word;
    $('deleteCard').disabled = !card;
    $('deleteCard').onclick = () => {if(card) deleteWord(card)};
    const marked = saved.includes(word?.[0]); $('save').textContent = marked ? '★ 已收藏' : '☆ 收藏詞句'; $('save').setAttribute('aria-pressed',String(marked));
    $('prev').disabled = index <= 0; $('next').disabled = index >= pool.length - 1; collection(); renderDeleted();
    if (track && cardElement?.cloneNode) buildTrack();
  }
  function buildTrack() {
    buildingTrack = true;
    const slides = pool.map((card,i) => {
      if (i === index) return cardElement;
      const slide = cardElement.cloneNode(true), word = card.word;
      const field = id => slide.querySelector('#' + id);
      field('term').textContent = word[0]; field('example').textContent = word[2];
      field('meaning').textContent = word[1]; field('translation').textContent = word[3]; field('usage').textContent = word[4];
      field('kind').textContent = cardLabel(card);
      field('position').textContent = (i + 1) + ' / ' + pool.length;
      const answer = field('answer'), reveal = field('reveal'), save = field('save');
      reveal.onclick = () => {answer.hidden = !answer.hidden;reveal.textContent = answer.hidden ? '顯示中文與用法 ＋' : '收起中文與用法 −'};
      const marked = saved.includes(word[0]);save.textContent = marked ? '★ 已收藏' : '☆ 收藏詞句';save.setAttribute('aria-pressed',String(marked));
      save.dataset.wordSave = '';save.onclick = () => saveWord(word[0],i);
      const remove = field('deleteCard');remove.dataset.wordDelete = '';remove.onclick = () => deleteWord(card);
      const source = slide.querySelector('footer a');
      source.textContent = '來源：' + (card.episode?.title || card.old?.title || 'Podcast') + ' ↗';
      source.href = card.old && /^https:\/\//.test(card.old.source || '') ? card.old.source : '#episode';
      source.onclick = card.episode ? event => {event.preventDefault();if(switchEpisode(card.episode.id)) $('episode').scrollIntoView({behavior:'smooth'})} : null;
      slide.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
      return slide;
    });
    track.replaceChildren(...(slides.length ? slides : [cardElement]));
    track.scrollLeft = index * track.clientWidth;
    buildingTrack = false;
  }
  function moveCard(delta) {
    const next = Math.max(0,Math.min(pool.length - 1,index + delta));
    if (track && cardElement?.cloneNode) track.scrollTo({left:next * track.clientWidth,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    else {index = next;render()}
  }
  if (track?.addEventListener) {
    track.addEventListener('scroll', () => {
      if (buildingTrack) return;
      index = Math.max(0,Math.min(pool.length - 1,Math.round(track.scrollLeft / Math.max(track.clientWidth,1))));
      $('prev').disabled = index <= 0; $('next').disabled = index >= pool.length - 1;
    }, {passive:true});
    track.addEventListener('keydown', event => {
      if (event.target !== track || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
      event.preventDefault();moveCard(event.key === 'ArrowLeft' ? -1 : 1);
    });
    window.PodcastSwipe?.attach(track);
  }
  function saveWord(term,position) {
    index = position;
    saved = saved.includes(term) ? saved.filter(s => s !== term) : [...saved,term];
    tags = {...tags,__podcastSaved:saved,__podcastLegacyImported:true};window.ShiyeNotes.write('shiyeArticleTags',tags);setPool();render();
  }
  function writeDeleted() {
    tags = {...tags,__podcastDeleted:deleted};
    window.ShiyeNotes.write('shiyeArticleTags',tags);setPool();render();
  }
  function deleteWord(card) {
    if (document.body?.classList.contains('notes-visitor') || deleted.some(d => d.id === card.id)) return;
    deleted = [...deleted,{id:card.id,text:card.word[0],meaning:card.word[1],title:card.episode?.title || card.old?.title || '原有 Indicator 收藏'}];
    writeDeleted();
    $('cardStatus').textContent = '已刪除「' + card.word[0] + '」，可在已刪除字卡中恢復。';
  }
  function renderDeleted() {
    $('deletedCount').textContent = '已刪除字卡（' + deleted.length + '）';
    $('deletedList').replaceChildren();
    if (!deleted.length) {const p=document.createElement('p');p.textContent='目前沒有已刪除字卡。';$('deletedList').append(p)}
    for (const entry of deleted) {
      const row=document.createElement('div');row.className='deleted-word';
      const label=document.createElement('span');label.textContent=entry.text + ' · ' + entry.meaning;
      const source=document.createElement('small');source.textContent=entry.title;
      const restore=document.createElement('button');restore.textContent='恢復';restore.setAttribute('data-word-restore','');
      restore.onclick=()=>{
        if(document.body?.classList.contains('notes-visitor'))return;
        deleted=deleted.filter(d=>d.id!==entry.id);writeDeleted();$('cardStatus').textContent='已恢復「'+entry.text+'」。';
      };
      row.append(label,source,restore);$('deletedList').append(row);
    }
  }
  function showNote() {
    $('note').value = tags.__podcastNotes?.[episode.id] || '';
    $('publishedNote').textContent = $('note').value || '還沒有留下筆記。';
  }
  function renderEpisode() {
    // Episode HTML is authored in the repository; saved user text uses textContent.
    $('episodeContent').innerHTML = episode.html;
    let category='';
    for (const word of episode.glossary) {
      if(word[5] && word[5]!==category){category=word[5];const heading=document.createElement('h3');heading.textContent=category;$('vocab').append(heading)}
      const row = document.createElement('div'); row.className = 'vocab-row';
      ['strong','span','span'].forEach((tag,i) => {
        const cell = document.createElement(tag); cell.textContent = [(word[6]?'★ ':'')+word[0],word[1],word[4]][i]; row.append(cell);
      }); $('vocab').append(row);
    }
    $('toggleSummary').onclick = () => {
      const hidden = $('toggleSummary').textContent === '隱藏中文'; document.querySelectorAll('.zh').forEach(p => p.hidden = hidden);
      $('toggleSummary').textContent = hidden ? '顯示中文' : '隱藏中文';
    };
    window.PodcastExercises?.render($('episodePractice'),episode,()=>tags,changes=>{tags={...tags,...changes};window.ShiyeNotes.write('shiyeArticleTags',tags)});
    $('reflectionPrompt').textContent = episode.prompt; $('episodeSelect').value = episode.id; showNote();
  }
  function switchEpisode(id) {
    if (!$('studyEditor').hidden) {
      $('noteStatus').textContent = '請先儲存或取消目前筆記，再切換集數。'; $('episodeSelect').value = episode.id; return false;
    }
    const next = episodes.find(e => e.id === id); if (!next) return false;
    if (episode.id !== next.id) {episode = next; index = 0; renderEpisode(); setPool(); render()}
    return true;
  }
  function loadNotes(data) {
    if (!$('studyEditor').hidden) return;
    try {tags = data ? data.shiyeArticleTags || {} : JSON.parse(localStorage.getItem('shiyeArticleTags') || '{}') || {}} catch {return}
    saved = Array.isArray(tags.__podcastSaved) ? [...tags.__podcastSaved] : [];
    deleted = Array.isArray(tags.__podcastDeleted) ? tags.__podcastDeleted.filter(d => d && typeof d.id === 'string') : [];
    if (!tags.__podcastLegacyImported) {
      for (const old of Array.isArray(tags.__indicatorSaved) ? tags.__indicatorSaved : []) if (old.text && !saved.includes(old.text)) saved.push(old.text);
    }
    rebuildCards(); showNote(); setPool(); render();window.PodcastExercises?.refresh(episode,tags);
  }
  $('reveal').onclick = () => {
    $('answer').hidden = !$('answer').hidden; $('reveal').textContent = $('answer').hidden ? '顯示中文與用法 ＋' : '收起中文與用法 −';
  };
  $('prev').onclick = () => moveCard(-1); $('next').onclick = () => moveCard(1);
  $('save').onclick = () => {
    if (!pool[index]) return;saveWord(pool[index].word[0],index);
  };
  $('scope').onchange = () => {index = 0; setPool(); render()}; $('episodeSelect').onchange = () => switchEpisode($('episodeSelect').value);
  $('shuffle').onclick = () => {
    for (let i = pool.length - 1; i > 0; i--) {const j = Math.floor(Math.random() * (i + 1)); [pool[i],pool[j]] = [pool[j],pool[i]]}
    index = 0; render();
  };
  $('editNote').onclick = () => {
    $('studyEditor').hidden = false; $('publishedNote').hidden = true; $('editNote').hidden = true;
    $('saveNote').hidden = false; $('cancelNote').hidden = false; $('note').focus();
  };
  function closeEditor() {
    $('studyEditor').hidden = true; $('publishedNote').hidden = false; $('editNote').hidden = false;
    $('saveNote').hidden = true; $('cancelNote').hidden = true;
  }
  $('cancelNote').onclick = () => {closeEditor();showNote()}; $('saveNote').hidden = true;
  $('saveNote').onclick = () => {
    tags = {...tags,__podcastNotes:{...(tags.__podcastNotes || {}),[episode.id]:$('note').value}};
    window.ShiyeNotes.write('shiyeArticleTags',tags); closeEditor(); showNote(); $('noteStatus').textContent = '已儲存；同步狀態請見頁面下方';
  };
  for (const e of episodes) {
    const option = document.createElement('option'); option.value = e.id; option.textContent = e.date + ' · ' + e.shortTitle; $('episodeSelect').append(option);
    const link = document.createElement('a'); link.href = '#episode';
    const meta = document.createElement('small'); meta.textContent = e.show + ' · ' + e.date;
    const title = document.createElement('h3'); title.textContent = e.title;
    const teaser = document.createElement('p'); teaser.textContent = e.teaser + ' ↗'; link.append(meta,title,teaser);
    link.onclick = event => {event.preventDefault();if(switchEpisode(e.id)) $('episode').scrollIntoView({behavior:'smooth'})}; $('episodeList').append(link);
  }
  window.addEventListener('shiye:notes-loaded',event => loadNotes(event.detail?.data)); renderEpisode(); loadNotes();
})();
