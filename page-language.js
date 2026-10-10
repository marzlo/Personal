(() => {
  const words = {
    '拾頁':'Shiye', '工作桌':'Workspace', '總覽':'Overview', '最新 Podcast':'Latest podcasts', '推薦文章':'Recommended reads', '文章':'Articles', '觀念整理':'Reflections', '系列深讀':'Deep reading', 'Podcast 與主題':'Podcasts & topics',
    '閱讀，然後讓想法':'Read. Reflect.', '繼續生長。':'Let your ideas grow.', '你的閱讀、聆聽與觀念收藏，在這裡慢慢連成一張地圖。':'Connect what you read, hear, and think into a map of your own.',
    '你的閱讀空間':'Your reading space', '今天，從一個好奇的問題開始。':'Start today with a question that sparks your curiosity.', '在最新文章裡找靈感，或回到觀念筆記繼續整理。':'Find inspiration in a new article, or revisit your reflections.', '把讀過的東西，慢慢活成自己的。':'Make what you read part of how you live.',
    '公開整理已更新；訪客可直接閱讀。':'Public notes are up to date and available to visitors.', '尚未發布整理。':'No notes have been published yet.', '正在載入公開整理…':'Loading public notes…', '公開整理暫時無法載入，請稍後重新整理。':'Public notes are temporarily unavailable. Please refresh later.', '儲存後自動發布':'Saved changes publish automatically', '登入以編輯':'Sign in to edit', '已發布':'Published', '更新中…':'Updating…', '已存本機；登入後自動發布。':'Saved locally. Sign in to publish automatically.', '已登出；登入後自動發布。':'Signed out. Sign in to publish automatically.', '登出':'Sign out', '跳至區域':'Jump to section', '快速區域導覽':'Quick section navigation', '上一張字卡':'Previous quote card', '下一張字卡':'Next quote card', '左右滑動閱讀字卡':'Swipe to read quote cards', '左右拖曳排序；Alt＋方向鍵也可移動':'Drag to reorder; Alt + arrow keys also work', '＋ 新增搜尋標籤':'＋ Add search tag', '搜尋標籤關鍵字':'Search tag keyword', '搜尋標題、作者、標籤或正文':'Search titles, authors, tags, or text', '例如：信念、動中定':'For example: beliefs, stillness in motion', '書籍':'Books', '金句索引':'Quote index', '整理中的觀念':'Reflections in progress', '含音訊書籍':'Book with audio', 'Podcast 文章':'Podcast article',
    '含音訊檔的 Podcast 與含音訊檔的書籍，依最後編輯時間排列，顯示最新四筆。':'The four latest podcasts and books with audio, sorted by last edit.', 'Notion 中標記 Important 的 Podcast，依最後編輯時間排列。':'Podcasts marked Important in Notion, sorted by last edit.', 'Podcast 與含音訊檔的書籍，依最後編輯時間排列。':'Podcasts and books with audio, sorted by last edit.', '關聯書籍':'Related books', '本次更新摘句':'Quote from the latest update', '來源：':'Source: ', '查看 Notion 摘錄 ↗':'View excerpt on Notion ↗',
    '目前沒有含音訊檔的 Podcast 或書籍。':'There are no podcasts or books with audio yet.', '目前沒有標記 Important 的 Podcast。可在 Notion 加上標籤，再更新資料。':'No podcasts are marked Important. Add the tag in Notion, then update the data.',
    '全部':'All', '所有標籤':'All tags', '管理文章標籤':'Manage article tags', '文章標籤':'Article tags', '搜尋文章':'Search articles', '選擇文章':'Choose an article', '自訂標籤':'Custom tags', '輸入文章名稱':'Enter an article title', '多個標籤以逗號分隔':'Separate tags with commas', '儲存後會出現篩選按鈕。自訂標籤儲存在此瀏覽器。':'Saved tags become filters. Custom tags are stored in this browser.', '顯示更多文章':'Show more articles', '收合文章':'Show fewer articles', '目前沒有符合的文章。':'No articles match these filters.',
    '記下最初的理解，追蹤閱讀與經驗如何改變想法。':'Record your first understanding and follow how reading and experience reshape it.', '新增觀念':'New reflection', '觀念標題（可以是一個問題）':'Reflection title (a question is welcome)', '建立':'Create', '取消':'Cancel', '儲存':'Save', '已儲存':'Saved', '編輯':'Edit', '刪除':'Delete', '更新想法／設定':'Update reflection / settings', '新增記事':'Add a note', '編輯記事':'Edit note', '儲存記事':'Save note', '刪除觀念':'Delete reflection', '查看相關文章':'View related articles', '時間軸記事':'Timeline notes', '由新到舊':'Newest first', '當時':'Then', '現在':'Now', '觀念標題':'Reflection title', '狀態':'Status', '開始日期':'Start date', '當時的想法':'What I thought then', '現在的想法':'What I think now',
    '觀察中':'Observing', '觀點維持':'Unchanged', '修正中':'Revising', '已推翻':'Overturned', '日期':'Date', '標籤':'Tag', '筆記':'Note', '觀察':'Observation', '實踐':'Practice', '回顧':'Review', '開始追蹤':'Started tracking', '內容':'Content', '連結文章':'Link an article', '移除連結':'Unlink',
    '現在怎麼看？觀點維持、修正，還是推翻？':'How do you see it now? Unchanged, revised, or overturned?', '把更新後的想法同時記到時間軸（回顧，日期：今天）':'Also add the updated reflection to the timeline (review, dated today)', '今天讀到什麼、想到什麼？':'What did you read or think about today?', '輸入標題、作者或標籤搜尋文章':'Search by title, author, or tag', '尚未連結文章':'No article linked yet', '输入關鍵字後，點選搜尋結果即可連結。':'Enter keywords, then select an article to link it.', '輸入關鍵字後，點選搜尋結果即可連結。':'Enter keywords, then select an article to link it.', '找不到符合的文章，請換個關鍵字。':'No matching articles. Try another keyword.', '還沒有觀念，新增一則開始整理。':'No reflections yet. Add one to get started.', '還沒有記事，記下第一則觀察吧。':'No notes yet. Record your first observation.', '（尚未記錄）':'(No notes yet)', '（尚未整理）':'(No notes yet)', '查看正文取得狀態':'View article availability', '文章正文尚未就緒':'Article text is not available yet',
    '觀念與記事先儲存在此瀏覽器；登入共用整理後可跨裝置同步。':'Reflections and notes are saved locally; sign in to sync across devices.',
    '從重要名詞出發，把文章與自己的理解連起來。':'Explore key concepts and connect your reading with your own understanding.', '管理系列':'Manage series', '新增系列':'New series', '刪除目前系列':'Delete this series', '系列名稱':'Series name', '文章標籤（選填）':'Article tag (optional)', '例如：Seth賽斯':'For example: Seth賽斯', '風景背景':'Landscape background', '霧林':'Misty forest', '天空':'Sky', '晨光山景':'Mountains at dawn', '建立系列':'Create series', '管理名詞':'Manage concepts', '新增名詞':'New concept', '刪除目前名詞':'Delete this concept', '名詞':'Concept', '新增':'Add', '閱讀的入口':'A starting point', '這個名詞對我有什麼意義？哪些文章可以幫助我理解它？':'What does this concept mean to me? Which articles can help me understand it?', '從文章看這個名詞':'Explore this concept through reading', '我的理解與整理':'My understanding & notes', '整理內容':'Notes', '自由記下對這個名詞的理解、生活例子或問題…':'Write your understanding, examples from life, or questions…', '尚未選擇文章。可搜尋文章，或從下方推薦中加入。':'No articles selected. Search for one, or add a recommendation below.', '正文提到此名詞的系列文章，加入後才會列入已選文章。':'Articles in this series that mention the concept. Add them to your selected articles.', '目前沒有其他符合的推薦文章。':'There are no other matching recommendations.', '加入此名詞':'Add to this concept', '沒有符合的文章。':'No matching articles.', '輸入標題、作者或標籤搜尋文章':'Search by title, author, or tag', '輸入關鍵字搜尋文章。':'Enter keywords to search articles.', '新增第一個名詞':'Add your first concept', '還沒有系列，新增一個開始整理。':'No series yet. Add one to get started.',
    '整理與文章連結先儲存在此瀏覽器；登入共用整理後可跨裝置同步。背景：':'Notes and article links are saved locally; sign in to sync across devices. Photo: ',
    'Podcast 與含音訊檔的書籍依作者整理，再用主題探索其他收藏。':'Browse podcasts and books with audio by author, then explore other items by topic.', '主題探索':'Explore topics', '搜尋書名、Podcast、金句…':'Search books, podcasts, or quotes…', '尚無關聯資料':'No related items yet', '找不到相符資料。':'No matching items.', '心靈與賽斯':'Spirituality & Seth', '意識與修行':'Consciousness & practice', '思想與哲學':'Ideas & philosophy', '商業與投資':'Business & investing', '生活與實踐':'Life & practice', '其他收藏':'Other items', '未標示作者':'Unknown author', '金句':'Quote',
    '共用我的整理':'My shared notes', '登入 GitHub 後，手機與電腦共用名詞、筆記與觀念。':'Sign in to GitHub to share concepts, notes, and reflections across your devices.', '共用整理已同步':'Your notes are synced', '登入 GitHub':'Sign in to GitHub', '重新登入 GitHub':'Sign in again', '同步整理':'Sync notes', '匯出備份':'Export backup', '更多':'More', '以這台建立共用資料':'Create shared notes from this device', '載入共用版本':'Load shared version', '以這台版本更新共用資料':'Use this device’s version', '已儲存在本機，正在同步…':'Saved locally. Syncing…', '已儲存在本機；登入後可同步到另一台裝置。':'Saved locally. Sign in to sync to your other device.', '登入已過期，請重新登入 GitHub。':'Your session has expired. Please sign in to GitHub again.', '共用整理服務尚未連線，本機內容仍已保留。':'Shared notes are unavailable. Your local notes are preserved.', '同步未完成，本機內容仍已保留。':'Sync did not complete. Your local notes are preserved.', '整理資料超過同步容量（約 120 KB），請先匯出備份。':'Your notes exceed the sync limit (about 120 KB). Export a backup first.',
    '尚未建立共用整理。請先在電腦按「以這台建立共用資料」，再讓手機登入。':'Shared notes have not been created. Create them from your desktop first, then sign in on your phone.', '共用資料已就緒；請先儲存或關閉編輯，再載入。':'Shared notes are ready. Save or close your editor before loading them.', '已載入共用整理；此裝置原有內容已備份。':'Shared notes loaded. Your previous local notes have been backed up.', '另一台裝置有更新；請先儲存或關閉編輯，再載入。':'Your other device has updates. Save or close your editor before loading them.', '已載入另一台裝置的最新整理':'Loaded the latest notes from your other device', '無法連線，本機整理仍已保留。':'Unable to connect. Your local notes are preserved.', '無法匯出，請保留此瀏覽器資料。':'Unable to export. Keep this browser’s saved data.', '請先儲存或關閉目前的編輯。':'Save or close your editor first.', '已載入共用版本；這台原有整理可從備份找回。':'Shared version loaded. Your previous local notes are in the backup.', '無法讀取整理儲存空間，請保留現有瀏覽器資料。':'Unable to read saved notes. Keep this browser’s existing data.', '另一台裝置也有修改。請選擇共用版本，或保留這台版本；兩個版本都會先備份。':'Both devices have changes. Choose the shared version or this device’s version; both will be backed up.',
    '登入已失效，請重新登入 GitHub 才能同步到另一台裝置。':'Your session has expired. Sign in to GitHub again to sync with your other device.', '請登入 GitHub，讓這次整理同步到另一台裝置。':'Sign in to GitHub to sync these notes with your other device.', '請先儲存目前編輯；已儲存的內容會保留在本機。':'Save your current edits first. Saved notes will remain on this device.', '請先儲存或關閉目前的編輯，再按重新登入；避免離開頁面時遺失尚未儲存的內容。':'Save or close your editor before signing in again, so you do not lose unsaved work.',
    '更新資料':'Update data', '正在讀取同步狀態…':'Checking sync status…', '按下更新後，驗證 GitHub 帳號即可直接啟動同步。':'Click Update data and verify your GitHub account to start syncing.', '驗證 GitHub 帳號後直接啟動 Notion 同步':'Verify your GitHub account to start Notion sync', '已送出同步，進度會在此自動更新。':'Sync requested. Progress updates here automatically.', '此功能僅開放給 GitHub 帳號 marzlo。':'This feature is only available to the GitHub account marzlo.', '自動更新入口部署完成後，按鈕會直接啟動同步。':'The button will start syncing once the update service is deployed.', '已送出同步，等待 GitHub 建立工作':'Sync requested. Waiting for GitHub to create the workflow', '尚未確認新同步，請到 GitHub 查看':'New sync not confirmed. Check GitHub', '等待已超過兩分鐘；請查看工作流程是否已建立。':'Waiting for over two minutes. Check whether the workflow was created.', '尚未執行過同步':'No sync has run yet', '最近一次同步成功':'Latest sync succeeded', '最近一次同步已取消':'Latest sync was cancelled', '最近一次同步失敗':'Latest sync failed', '資料與網站已更新，可重新整理頁面。':'Data and site updated. Refresh the page.', '同步未完成，請查看失敗步驟。':'Sync did not complete. Check the failed step.', '查看同步紀錄 ↗':'View sync log ↗', '同步排隊中':'Sync queued', '同步進行中':'Sync in progress', '讀取 Notion 資料':'Fetching Notion data', '保存最新資料':'Saving the latest data', '準備網站檔案':'Preparing site files', '發布網站':'Publishing the site', '準備發布環境':'Preparing the publishing environment', '準備程式檔案':'Preparing code files', '準備同步環境':'Preparing the sync environment', '暫時讀不到同步狀態，可到 GitHub 查看':'Sync status is unavailable. Check GitHub', '無法啟動同步，請查看 Cloudflare Worker 記錄。':'Unable to start sync. Check the Cloudflare Worker logs.',
    '刪除這則記事？':'Delete this timeline note?', '以這台装置目前的整理建立共用資料？請先在電腦執行，再到手機登入。':'Create shared notes from this device? Use your desktop first, then sign in on your phone.', '以這台裝置目前的整理建立共用資料？請先在電腦執行，再到手機登入。':'Create shared notes from this device? Use your desktop first, then sign in on your phone.', '以這台已儲存的整理更新共用資料？共用舊版本也會備份。':'Update shared notes with this device’s saved version? The previous shared version will be backed up.',
    '閱讀與整理導覽':'Reading and reflection navigation', '文章類型':'Article types', '標籤篩選':'Filter by tag', '可能相關文章':'Related articles', '已選文章':'Selected articles', 'Notion 資料同步狀態':'Notion data sync status', '同步進度':'Sync progress', '跨裝置整理同步':'Cross-device notes sync', '整理同步登入提醒':'Sign-in reminder for notes sync', '暫時關閉登入提醒':'Dismiss sign-in reminder',
    '目前沒有正文可供比對，無法判斷相關篇數。請更新資料取得文章正文。':'Article text is unavailable for comparison. Update data to retrieve it.', '已比對現有正文，目前沒有符合文字比對條件的段落；這不代表文章在意思上無關。':'No passages match the current text search. This does not rule out related meanings.', '依文章正文段落提供建議。可在記事中連結文章。':'Suggestions are based on article passages. Link an article in a timeline note.'
  };
  Object.assign(words, {
    'Worker 缺少必要設定；請確認 Production 環境的三個憑證名稱並部署。':'The Worker is missing configuration. Check the three credential names in Production and deploy it.',
    'OAuth 驗證狀態失效；請重新按更新資料並完成 GitHub 授權。':'OAuth verification expired. Click Update data again and complete GitHub authorization.',
    'GitHub OAuth 未完成授權；請重新按更新資料並完成授權。':'GitHub OAuth authorization was not completed. Click Update data and authorize again.',
    'GitHub 沒有回傳授權碼；請重新啟動 OAuth 授權。':'GitHub did not return an authorization code. Restart OAuth authorization.',
    'OAuth token 交換失敗；請檢查 Worker 的 GITHUB_CLIENT_SECRET 是否為目前的 Client secret。':'OAuth token exchange failed. Check that the Worker uses the current GITHUB_CLIENT_SECRET.',
    '無法確認 GitHub 帳號；請檢查 OAuth 設定並確認登入 marzlo。':'Unable to verify the GitHub account. Check OAuth settings and sign in as marzlo.',
    'GitHub Actions token 驗證失敗；請確認 Production 的 GITHUB_ACTIONS_TOKEN 是有效 token。':'GitHub Actions token verification failed. Check GITHUB_ACTIONS_TOKEN in Production.',
    'GitHub API 無法讀取 sync-notion.yml；請確認 token 可存取 Personal 儲存庫。':'The GitHub API could not read sync-notion.yml. Check that the token can access Personal.',
    'GitHub 拒絕啟動工作流程；請檢查 PAT 的 Personal 儲存庫範圍與 Actions 寫入權限。':'GitHub refused the workflow request. Check the PAT’s Personal repository scope and Actions write permission.'
  });
  const patterns = [
    [/^更新時間：(.+)$/, m => `Updated: ${m[1]}`], [/^更新日期：(.+)$/, m => `Updated: ${m[1]}`],
    [/^最近同步完成：(.+)$/, m => `Last sync finished: ${m[1]}`], [/^同步開始：(.+) · 已等待 (\d+) 秒$/, m => `Sync started: ${m[1]} · Waiting ${m[2]} seconds`], [/^目前資料同步時間：(.+)$/, m => `Data synced: ${m[1]}`], [/^目前資料更新日期：(.+)$/, m => `Data updated: ${m[1]}`],
    [/^已發布 · (.+)$/, m => `Published · ${m[1]}`],
    [/^當時（(.+)）$/, m => `Then (${m[1]})`], [/^(\d+) 篇$/, m => `${m[1]} articles`], [/^已選文章（(\d+)）$/, m => `Selected articles (${m[1]})`], [/^推薦文章（(\d+)）$/, m => `Recommended articles (${m[1]})`], [/^可能相關文章（(\d+)）$/, m => `Related articles (${m[1]})`],
    [/^從 (.+) 開始 · (\d+) 筆記事 · (\d+) 篇已連結 · (\d+) 篇可能相關$/, m => `Since ${m[1]} · ${m[2]} notes · ${m[3]} linked articles · ${m[4]} related articles`],
    [/^看 (\d+) 篇可能相關文章$/, m => `View ${m[1]} related articles`], [/^最後編輯 (.+)$/, m => `Last edited ${m[1]}`], [/^已取得可比對正文：(\d+) \/ (\d+) 篇。$/, m => `Article text available: ${m[1]} / ${m[2]}.`], [/^尚有 (\d+) 篇未取得可比對正文。$/, m => `Text is still unavailable for ${m[1]} articles.`],
    [/^找到 (\d+) 篇(.*)$/, m => `${m[1]} articles found${m[2].includes('20') ? '. Showing the first 20; add keywords to narrow your search.' : '.'}`], [/^(.+) 篇　⌄$/, m => `${m[1]} articles　⌄`], [/^(.+) 筆　⌄$/, m => `${m[1]} items　⌄`],
    [/^共用整理已同步 · (.+)$/, m => `Your notes are synced · ${m[1]}`], [/^原有與自動標籤：(.+)$/, m => `Original and automatic tags: ${m[1] === '尚無' ? 'None' : m[1]}`], [/^已連結：(.+)$/, m => `Linked: ${m[1]}`],
    [/^刪除「(.+)」系列及其中的名詞、整理與文章連結？$/, m => `Delete the series “${m[1]}” and its concepts, notes, and article links?`], [/^刪除「(.+)」名詞及其整理與文章連結？$/, m => `Delete the concept “${m[1]}” and its notes and article links?`], [/^刪除「(.+)」與全部記事？$/, m => `Delete “${m[1]}” and all its timeline notes?`], [/^移除連結：(.+)$/, m => `Unlink: ${m[1]}`],
    [/^資料快照 (.+)　·$/, m => `Data snapshot ${m[1]} ·`], [/^·　金句原文會公開顯示於主題卡片中。$/, () => '· Original quotes are publicly visible in topic cards.'],
    [/^GitHub 派送失敗（HTTP (\d+)）：(.+)$/, m => `GitHub dispatch failed (HTTP ${m[1]}): ${m[2]}`]
  ];
  const key = 'shiyeLanguage';
  let language = 'zh';
  try { language = localStorage.getItem(key) || localStorage.getItem('shiyeShareLanguage') || 'zh'; } catch {}
  const requested = new URLSearchParams(location.search).get('lang');
  if (requested === 'en' || requested === 'zh') language = requested;
  if (language !== 'en') language = 'zh';
  function english(text) {
    const trimmed = text.trim();
    if (!trimmed) return text;
    let translated = words[trimmed];
    if (!translated) {
      const decorated = trimmed.match(/^([＋+✎↻⌂♫☆≡◇▦↗]\s*)(.+)$/);
      if (decorated && words[decorated[2]]) translated = decorated[1] + words[decorated[2]];
      const linked = trimmed.match(/^(.+?)\s+↗$/);
      if (linked && words[linked[1]]) translated = words[linked[1]] + ' ↗';
    }
    if (!translated) for (const [pattern, format] of patterns) { const match = trimmed.match(pattern); if (match) { translated = format(match); break; } }
    if (!translated && trimmed.includes('。')) {
      const sentences = trimmed.match(/[^。]+。?/g) || [];
      translated = sentences.map(part => words[part.trim()] || part).join(' ');
    }
    return translated ? text.replace(trimmed, translated) : text;
  }
  const textCache = new WeakMap(), attributeCache = new WeakMap();
  // User text, Notion titles, tags, authors and excerpts are never translated.
  const protectedSelector = 'script,style,textarea,input,[data-no-translate],.article-share-dialog,.page-language,.concept-name,.idea-display,.study-note,.study-tabs,.study-intro h3,#seriesStudy>.study-heading>h3,.study-article h4,.study-article blockquote,.study-result,.article-search-result,.podcast-card h3,.podcast-card-meta,.article-row h3,.article-row .meta,.article-row .tag,.cat-row a,.cat-title,.cover-word,.featured-quote blockquote,#featuredQuoteSource,.related-article,.timeline-entry,.tag,[data-search-tag],[data-tag]:not([data-tag=""]),#tagArticleSelect';
  function protectedText(element) {
    if (element.closest('.timeline-entry-tools')) return false;
    const original = textCache.get(element.firstChild)?.original || element.textContent;
    if (element.matches('.study-intro h3') && original === '新增第一個名詞') return false;
    if (element.closest('.study-note') && original === '（尚未整理）') return false;
    if (element.matches('.cat-title,.cover-word') && document.querySelector('[data-view="theme"].on')) return false;
    if (element.matches('.cat-title,.cover-word') && original === '未標示作者') return false;
    if (element.closest('.idea-display') && element.classList.contains('is-empty')) return false;
    return !!element.closest(protectedSelector);
  }
  let observer;
  function apply() {
    if (!document.body) return;
    observer?.disconnect();
    document.documentElement.lang = language === 'en' ? 'en' : 'zh-Hant';
    document.title = language === 'en' ? 'Shiye | Reading & Reflection' : '拾頁｜個人閱讀儀表板';
    document.querySelectorAll('.page-language button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.parentElement || protectedText(node.parentElement)) continue;
      if (node.parentElement.tagName === 'OPTION' && !node.parentElement.hasAttribute('value')) node.parentElement.setAttribute('value', node.parentElement.value);
      let entry = textCache.get(node);
      if (!entry || node.data !== entry.rendered) entry = { original: node.data };
      entry.rendered = language === 'en' ? english(entry.original) : entry.original;
      if (node.data !== entry.rendered) node.data = entry.rendered;
      textCache.set(node, entry);
    }
    document.querySelectorAll('[placeholder],[aria-label],[title],[alt]').forEach(element => {
      if (element.closest('.article-share-dialog,.page-language,[data-no-translate]')) return;
      let entries = attributeCache.get(element); if (!entries) entries = {};
      for (const attr of ['placeholder', 'aria-label', 'title', 'alt']) {
        if (!element.hasAttribute(attr)) continue;
        const value = element.getAttribute(attr);
        let entry = entries[attr];
        if (!entry || value !== entry.rendered) entry = { original: value };
        entry.rendered = language === 'en' ? english(entry.original) : entry.original;
        if (entry.rendered !== value) element.setAttribute(attr, entry.rendered);
        entries[attr] = entry;
      }
      attributeCache.set(element, entries);
    });
    observer?.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'aria-label', 'title', 'alt'] });
  }
  function setLanguage(value) {
    if (value !== 'zh' && value !== 'en') return;
    language = value;
    try { localStorage.setItem(key, value); localStorage.setItem('shiyeShareLanguage', value); } catch {}
    const url = new URL(location.href);
    if (url.searchParams.has('article') || url.searchParams.has('lang')) { url.searchParams.set('lang', value); history.replaceState(null, '', url); }
    apply();
    window.dispatchEvent(new CustomEvent('shiye:language-changed', { detail: { language } }));
  }
  window.ShiyeI18n = { get language() { return language; }, setLanguage, apply, translate: text => language === 'en' ? english(text) : text };
  const nativeConfirm = window.confirm.bind(window);
  window.confirm = message => nativeConfirm(language === 'en' ? english(message) : message);
  document.addEventListener('DOMContentLoaded', () => {
    const top = document.querySelector('.topline');
    const controls = document.createElement('div'); controls.className = 'page-language'; controls.setAttribute('role', 'group'); controls.setAttribute('aria-label', 'Language / 語言');
    controls.innerHTML = '<button type="button" data-language="zh" lang="zh-Hant">中文</button><span aria-hidden="true">/</span><button type="button" data-language="en" lang="en">English</button>';
    top.append(controls);
    controls.querySelectorAll('button').forEach(button => button.onclick = () => setLanguage(button.dataset.language));
    observer = new MutationObserver(apply);
    apply();
  }, { once: true });
})();
