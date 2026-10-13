(() => {
  const episodes = window.PODCAST_EPISODES || [];
  const $ = id => document.getElementById(id);
  const cardElement = document.querySelector('.flashcard');
  const track = document.getElementById('wordTrack');
  let buildingTrack = false;
  let tags = {}, saved = [], cards = [], pool = [], index = 0;
  let episode = episodes[0];
  if (!episode) return;
  const requested = new URLSearchParams(window.location?.search || '').get('episode');
  episode = episodes.find(e => e.id === requested) || episode;
  function rebuildCards() {
    cards = episodes.flatMap(e => e.cards.map(word => ({word, episode:e})));
    for (const old of Array.isArray(tags.__indicatorSaved) ? tags.__indicatorSaved : []) {
      if (!old.text || cards.some(c => c.word[0] === old.text)) continue;
      cards.push({word:[old.text,old.meaning || '',old.examples?.[0]?.text || '',old.examples?.[0]?.meaning || '',old.context || '原有 Indicator 收藏'],old});
    }
  }
  function setPool() {
    pool = $('scope').value === 'saved' ? cards.filter(c => saved.includes(c.word[0]))
      : $('scope').value === 'all' ? [...cards] : cards.filter(c => c.episode?.id === episode.id);
    index = Math.max(0, Math.min(index, pool.length - 1));
  }
  function collection() {
    $('savedCount').textContent = saved.length + ' 個收藏'; $('savedList').replaceChildren();
    if (!saved.length) {
      const p = document.createElement('p'); p.textContent = '把想記住的表達留下，下次再回來練習。'; $('savedList').append(p);
    }
    for (const term of saved) {
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
    $('term').textContent = word?.[0] || '還沒有收藏詞句';
    $('example').textContent = word?.[2] || '先從本集精選中，收藏你想記住的表達。';
    $('meaning').textContent = word?.[1] || ''; $('translation').textContent = word?.[3] || ''; $('usage').textContent = word?.[4] || '';
    $('kind').textContent = card?.old ? '原有 Indicator 收藏' : card?.episode?.show || '精選詞句';
    const source = cardElement?.querySelector ? cardElement.querySelector('footer a') : document.querySelector('.flashcard footer a');
    source.textContent = '來源：' + (card?.episode?.title || card?.old?.title || 'Podcast') + ' ↗';
    source.href = card?.old && /^https:\/\//.test(card.old.source || '') ? card.old.source : '#episode';
    source.onclick = card?.episode ? event => {
      event.preventDefault(); if (switchEpisode(card.episode.id)) $('episode').scrollIntoView({behavior:'smooth'});
    } : null;
    $('answer').hidden = true; $('reveal').textContent = '顯示中文與用法 ＋'; $('reveal').disabled = !word; $('save').disabled = !word;
    const marked = saved.includes(word?.[0]); $('save').textContent = marked ? '★ 已收藏' : '☆ 收藏詞句'; $('save').setAttribute('aria-pressed',String(marked));
    $('prev').disabled = index <= 0; $('next').disabled = index >= pool.length - 1; collection();
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
      field('kind').textContent = card.old ? '原有 Indicator 收藏' : card.episode.show;
      field('position').textContent = (i + 1) + ' / ' + pool.length;
      const answer = field('answer'), reveal = field('reveal'), save = field('save');
      reveal.onclick = () => {answer.hidden = !answer.hidden;reveal.textContent = answer.hidden ? '顯示中文與用法 ＋' : '收起中文與用法 −'};
      const marked = saved.includes(word[0]);save.textContent = marked ? '★ 已收藏' : '☆ 收藏詞句';save.setAttribute('aria-pressed',String(marked));
      save.dataset.wordSave = '';save.onclick = () => saveWord(word[0],i);
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
  function showNote() {
    $('note').value = tags.__podcastNotes?.[episode.id] || '';
    $('publishedNote').textContent = $('note').value || '還沒有留下筆記。';
  }
  function renderEpisode() {
    // Episode HTML is authored in the repository; saved user text uses textContent.
    $('episodeContent').innerHTML = episode.html;
    for (const word of episode.glossary) {
      const row = document.createElement('div'); row.className = 'vocab-row';
      ['strong','span','span'].forEach((tag,i) => {
        const cell = document.createElement(tag); cell.textContent = [word[0],word[1],word[4]][i]; row.append(cell);
      }); $('vocab').append(row);
    }
    $('toggleSummary').onclick = () => {
      const hidden = $('toggleSummary').textContent === '隱藏中文'; document.querySelectorAll('.zh').forEach(p => p.hidden = hidden);
      $('toggleSummary').textContent = hidden ? '顯示中文' : '隱藏中文';
    };
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
    if (!tags.__podcastLegacyImported) {
      for (const old of Array.isArray(tags.__indicatorSaved) ? tags.__indicatorSaved : []) if (old.text && !saved.includes(old.text)) saved.push(old.text);
    }
    rebuildCards(); showNote(); setPool(); render();
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
