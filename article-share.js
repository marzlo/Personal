(() => {
  const translations = {
    zh: {
      close: '關閉並回到拾頁', language: '分享視窗語言', share: '分享',
      recipientKicker: '拾頁 · 分享給你的一篇閱讀', senderKicker: '拾頁 · 分享文章',
      missingTitle: '這篇文章目前不在收藏中', missingIntro: '分享網址可能已失效，回到拾頁探索其他閱讀。',
      recipientIntro: '留一點時間，讀一篇讓想法繼續生長的文章。',
      senderIntro: '把這個網址分享出去，對方開啟後就會看到這篇文章的邀請卡片。',
      urlLabel: '文章分享網址', copy: '複製網址', preview: '預覽分享畫面',
      notion: '前往 Notion 閱讀 ↗', home: '取消，回到拾頁',
      copied: '已複製分享網址。', copyFallback: '請複製上方已選取的網址。', audioBook: '含音訊書籍'
    },
    en: {
      close: 'Close and return to Shiye', language: 'Share dialog language', share: 'Share',
      recipientKicker: 'Shiye · A reading invitation for you', senderKicker: 'Shiye · Share an article',
      missingTitle: 'This article is no longer in the collection', missingIntro: 'This share link may be out of date. Return to Shiye to explore other reading.',
      recipientIntro: 'Take a moment to read something that gives your ideas room to grow.',
      senderIntro: 'Share this link to invite someone to read this article.',
      urlLabel: 'Article share link', copy: 'Copy link', preview: 'Preview invitation',
      notion: 'Read on Notion ↗', home: 'Cancel, return to Shiye',
      copied: 'Share link copied.', copyFallback: 'Copy the selected link above.', audioBook: 'Book with audio'
    }
  };
  const languageKey = 'shiyeShareLanguage';
  const urlLanguage = new URL(window.location.href).searchParams.get('lang');
  let language = 'zh';
  try { if (localStorage.getItem(languageKey) === 'en') language = 'en'; } catch {}
  if (urlLanguage === 'en' || urlLanguage === 'zh') language = urlLanguage;
  const t = () => translations[language];
  const pageId = url => String(url || '').match(/([a-f0-9]{32}|[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})(?:[/?#]|$)/i)?.[1].replaceAll('-', '').toLowerCase();
  const byId = new Map(articlePool.map(article => [pageId(article.url), article]).filter(([id]) => id));
  const byUrl = new Map(articlePool.map(article => [notionUrl(article.url), article]));
  const dialog = document.createElement('dialog');
  dialog.className = 'article-share-dialog';
  dialog.setAttribute('aria-labelledby', 'shareArticleTitle');
  dialog.innerHTML = `<button type="button" class="share-close" aria-label="關閉並回到拾頁">×</button>
    <div class="share-language" role="group" aria-label="分享視窗語言"><button type="button" data-share-language="zh" lang="zh-Hant">中文</button><span aria-hidden="true">/</span><button type="button" data-share-language="en" lang="en">English</button></div>
    <div class="share-kicker"></div><h2 id="shareArticleTitle"></h2><p class="share-meta"></p>
    <div class="share-divider"></div><p class="share-intro"></p>
    <div class="share-url-area" hidden><label for="shareArticleUrl">文章分享網址</label><input id="shareArticleUrl" readonly></div>
    <div class="share-actions"><button type="button" class="primary share-copy">複製網址</button><button type="button" class="share-preview">預覽分享畫面</button><a class="primary share-notion" target="_blank" rel="noreferrer">前往 Notion 閱讀 ↗</a><button type="button" class="share-home">取消，回到拾頁</button></div>
    <p class="share-message" aria-live="polite"></p>`;
  document.body.append(dialog);
  const find = selector => dialog.querySelector(selector);
  let article = null;
  let recipient = false;
  let directEntry = false;
  let copyVersion = 0;
  const makeUrl = item => {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('article', pageId(item.url));
    url.searchParams.set('lang', language);
    return url.href;
  };
  function display(item, mode) {
    article = item;
    recipient = mode === 'recipient';
    copyVersion++;
    dialog.lang = language === 'en' ? 'en' : 'zh-Hant';
    find('.share-language').setAttribute('aria-label', t().language);
    find('.share-close').setAttribute('aria-label', t().close);
    dialog.querySelectorAll('[data-share-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.shareLanguage === language)));
    find('.share-kicker').textContent = recipient ? t().recipientKicker : t().senderKicker;
    find('#shareArticleTitle').textContent = item?.title || t().missingTitle;
    find('.share-meta').textContent = item ? [item.kind === '含音訊書籍' ? t().audioBook : item.kind, (item.authors || []).join('・') || item.author].filter(Boolean).join(' · ') : '';
    find('.share-intro').textContent = !item ? t().missingIntro : recipient ? t().recipientIntro : t().senderIntro;
    find('.share-url-area label').textContent = t().urlLabel;
    find('.share-copy').textContent = t().copy;
    find('.share-preview').textContent = t().preview;
    find('.share-notion').textContent = t().notion;
    find('.share-home').textContent = t().home;
    find('.share-url-area').hidden = recipient;
    find('.share-copy').hidden = recipient;
    find('.share-preview').hidden = recipient;
    find('.share-notion').hidden = !recipient || !item;
    find('.share-home').hidden = !recipient;
    find('.share-message').textContent = '';
    if (item) {
      find('#shareArticleUrl').value = makeUrl(item);
      find('.share-notion').href = notionUrl(item.url);
    } else find('.share-notion').removeAttribute('href');
    if (!dialog.open) dialog.showModal();
  }
  function close() { dialog.close(); }
  dialog.querySelectorAll('[data-share-language]').forEach(button => {
    button.onclick = () => {
      language = button.dataset.shareLanguage;
      try { localStorage.setItem(languageKey, language); } catch {}
      if (directEntry) {
        const url = new URL(window.location.href);
        url.searchParams.set('lang', language);
        window.history.replaceState(null, '', url);
      }
      refreshShareButtons();
      display(article, recipient ? 'recipient' : 'sender');
    };
  });
  find('.share-close').onclick = close;
  find('.share-home').onclick = close;
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('article-share-open');
    copyVersion++;
    if (directEntry) {
      const url = new URL(window.location.href);
      url.searchParams.delete('article');
      url.searchParams.delete('lang');
      url.hash = '';
      window.history.replaceState(null, '', url);
      window.scrollTo({ top: 0, behavior: 'instant' });
      directEntry = false;
    }
  });
  find('.share-preview').onclick = () => display(article, 'recipient');
  find('.share-copy').onclick = async () => {
    const version = copyVersion;
    try {
      await navigator.clipboard.writeText(find('#shareArticleUrl').value);
      if (version === copyVersion && dialog.open) find('.share-message').textContent = t().copied;
    } catch {
      if (version !== copyVersion || !dialog.open) return;
      find('#shareArticleUrl').focus();
      find('#shareArticleUrl').select();
      find('.share-message').textContent = t().copyFallback;
    }
  };
  function open(item, mode) {
    display(item, mode);
    document.body.classList.add('article-share-open');
  }
  function refreshShareButtons() {
    document.querySelectorAll('.article-share-button').forEach(button => {
      button.textContent = t().share;
      button.setAttribute('aria-label', t().share + '「' + button.dataset.shareTitle + '」');
      button.lang = language === 'en' ? 'en' : 'zh-Hant';
    });
  }
  function decorate(host) {
    host.querySelectorAll('.article-row, .podcast-card').forEach(element => {
      if (element.querySelector('.article-share-button') || element.closest('.article-share-row')) return;
      const link = element.matches('a') ? element : element.querySelector('.podcast-card-main');
      const item = byUrl.get(link?.getAttribute('href'));
      if (!item || !pageId(item.url)) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'article-share-button';
      button.dataset.shareTitle = item.title;
      button.textContent = t().share;
      button.setAttribute('aria-label', t().share + '「' + item.title + '」');
      button.lang = language === 'en' ? 'en' : 'zh-Hant';
      button.onclick = () => open(item, 'sender');
      if (element.matches('.article-row')) {
        const row = document.createElement('div');
        row.className = 'article-share-row';
        element.before(row);
        row.append(element, button);
      } else {
        const actions = document.createElement('div');
        actions.className = 'article-share-card-actions';
        actions.append(button);
        element.querySelector('.podcast-photo-credit')?.before(actions);
      }
    });
  }
  for (const id of ['recentCards', 'podcastCards', 'recommendedCards']) {
    const host = document.getElementById(id);
    if (!host) continue;
    decorate(host);
    new MutationObserver(() => decorate(host)).observe(host, { childList: true });
  }
  const requested = new URL(window.location.href).searchParams.get('article');
  if (requested !== null) {
    directEntry = true;
    open(byId.get(requested.replaceAll('-', '').toLowerCase()) || null, 'recipient');
  }
})();
