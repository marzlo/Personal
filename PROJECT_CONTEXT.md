# 拾頁專案接續紀錄

## Podcast 聽讀筆記（2026-10-13 新版）
- 加入2026-10-22「Can a “moneyball” system work for campaign funding?」，id campaignMoneyball，依使用者提供的開場與逐段整理，10單字＋14片語共24張字卡、5個優先熟記、雙語摘要與比較；未提供測驗故quiz=[]。保留Oath無正式政黨隸屬與實際合作對象的區別，以及勝選不證明因果、有限效益與制度改革的結論。未提供Apple單集URL，僅標示缺少直達網址並連NPR節目總頁，不虛構網址；例句為補充，使用者的bang for our buck例句保留。
- 加入使用者提供的 2026-10-21「The Case for Sharing Your Salary」，id sharingSalary，12張字卡、5個優先片語及雙語摘要；Apple單集連結採使用者提供的 i=1000797339248。內容只涵蓋兩段學習筆記，未自行驗證完整音訊或NPR介紹；使用者範例保留，其餘例句標示補充，未提供測驗故 quiz=[]。保持全部集數混合複習預設及既有收藏／筆記。新增集數時更新 podcast.html 內資料檔SHA256版本。
- 2026-10-20：加入使用者提供的 2026-10-15 The Indicator「How did political campaigns get so expensive?」，id campaignSpending，依日期排序，不取代較新的 movieMarket。34張字卡（原三組30詞＋Wild West、兩個完整重點表達、核心句型）、5個優先熟記與5題測驗；保留使用者例句，補充例句標示非節目原話。內容依筆記，未逐字核對音訊／逐字稿；未提供本集URL，僅連NPR與Apple節目總頁並明示。podcast-exercises.js 的複製按鈕改依實際優先項目數顯示，不再固定15。
- 字卡的同一單字／片語若出現在兩篇以上 Podcast，在卡片列出全部來源與可切換集數的連結；比對忽略大小寫、重複空白與直／彎單引號。以所有集數字卡資料比對，每集只列一次；來源列表不受目前學習範圍或刪除字卡影響，保留未儲存筆記的切換防護，不變更收藏／刪除／筆記儲存結構。
- 段落導覽旁加入「↻ 重新整理」，供 iPhone 主畫面網頁版使用。重新載入保留當前選中集數與 hash；筆記編輯未關閉時先提示儲存／取消並聚焦筆記，不重新載入。
- 2026-10-17：收錄使用者貼文「Anatomy of a Movie Market」，id `movieMarket`，57 張字卡（分類表55詞，另含 split me wide open、consequential），15 個優先熟記項目、三組用詞比較與原五句英中複習。依使用者筆記整理，補充例句非逐字引用；NPR節目介紹核對，日期台灣10/17、美東10/16。未提供測驗題時不顯示空白測驗，保留熟記／複製功能與既有跨集資料。
- 2026-10-17：合併使用者提供的 AI 集數英文筆記：63 個不重複表達／句型，加上原有未重複的17個，共80張；原有詞彙文字保留，穩定刪除ID不變。分類、★推薦、15個優先表達、混淆比較及reticulum非標準句子的疑義註記均保留。來源明確標示使用者筆記與補充例句，未逐字驗證。
- `podcast-exercises.js` 提供本集五題測驗（可檢查／重做）與15個熟記勾選／複製。測驗不儲存；熟記存在既有 `shiyeArticleTags.__podcastMastered[episode.id]`，只登入擁有者可變更並沿用同步，保留其餘整理。切換集數重建練習，遠端載入只更新熟記，不清掉作答。
- 已加入 aiAsilomar：2026-10-14 Planet Money「Wanna slow down AI? These biologists can help.」，19 張詞卡；依 NPR 節目介紹，另以 1975 Asilomar 原始聲明補充歷史，未取得完整逐字稿。明確區分節目介紹、歷史資料與閱讀歸納，結論聚焦集體行動與共同規則，保留 AI 類比的限制。
- Podcast 頁新增 sticky 段落導覽：桌面橫向連結、760px 以下手機原生下拉選單，包含字卡、收藏、集數、內容理解、詞彙、摘要、筆記、登入與同步；捲動更新目前段落。`podcast-navigation.js` 獨立處理，動態切換集數後仍可用，保留 query 集數與筆記草稿。
- economicsNobel 內容理解已补「歷史起點→出資與評選角色→受訪者觀點→閱讀歸納」，結論強調依證據／假設判斷經濟主張。歸納清楚標示非節目結尾原話；補上瑞典中央銀行官方歷史來源。
- 字卡提供可恢復刪除：`shiyeArticleTags.__podcastDeleted` 保存穩定 id（集數 id＋詞彙；舊收藏用原 id）與文字／來源快照，透過既有同步發布。從本集、全部、收藏學習排除；收藏原值留存以便恢復時保留收藏。`已刪除字卡` 清單可恢復，訪客僅閱讀不可刪除／恢復。更新詞彙例句或集數不移除刪除紀錄。
- 使用者確認字卡不固定張數：依內容與學習價值挑選，不為湊數補詞或限制六張。現有三集詞彙已全部補上獨立撰寫的英文例句、中文翻譯及用法，分別12／18／24張；未來適合的詞彙皆可做卡，保留補充內容與節目原話的區別。下列六張紀錄為初版歷史。
- 2026-10-14 加入 economicsNobel：2026-10-13「How did we get a Nobel Prize in economics?」，六張字卡與十二個詞彙；依 NPR 節目介紹及 Podcast Rex 摘要整理，未取得完整逐字稿，頁面明確標示資料範圍與補充例句。
- 2026-10-14：字卡改用與首頁摘句相同的整排 `overflow-x:auto`＋`scroll-snap` 原生捲動；`wordTrack` 內呈現全部詞卡，触控及觸控板直接捲動，`podcast-swipe.js` 只補滑鼠拖曳。保留按鈕及方向鍵；各卡獨立展開中文、收藏與來源連結，不更動收藏／筆記結構。已取代上一版手勢換文字的做法。
- 已加入 2026-10-09 Planet Money「Should we all be getting tariff refunds right now?」，根據 NCPR 提供的 NPR 逐字稿整理，包含六張片語卡與十八個詞彙。最新一集預設顯示，集數列表由新到舊。
- 多集資料在 `podcast-episodes.js` 的 `window.PODCAST_EPISODES`，每集包含穩定 id、日期、標題、片語卡、詞彙、正文 HTML 及反思題；未來新增集數填入此資料，勿覆蓋既有集數。補充例句非逐字引用。
- 字卡支援目前集數／全部集數／收藏，可在集數選單切換。來源連結切換對應正文；`?episode=tariffRefunds`／`?episode=healthBenefits` 可直達指定集數。
- `__podcastNotes` 按集數 id 分開存筆記；原 healthBenefits 筆記保持原鍵，未儲存時阻止切換集數，有取消編輯按鈕。
- 使用者確認以 `podcast.html` 取代原 Indicator 頁；首頁兩個入口已更新，`indicator.html` 保留舊網址轉向新版。
- `podcast-learning.js`／`podcast-learning.css`：頁首英文字卡優先，六個精選片語、展開中文、翻頁、重新排列、本集／全部／收藏範圍；下方收藏、集數列表、內容理解、24 個詞彙、英中摘要及個人筆記。
- 首集為 2026-08-07 I'm Just Here for the Health Benefits；依使用者提供的內容整理並核對 NPR 在 NCPR 的逐字稿，補充學習例句清楚標示非逐字引用。
- 收藏存在 `shiyeArticleTags.__podcastSaved`，筆記存在 `shiyeArticleTags.__podcastNotes.healthBenefits`，沿用 `window.ShiyeNotes.write` 及既有同步，不新增 Worker 儲存鍵。訪客僅閱讀公開整理，擁有者可編輯。
- 原 `__indicatorSaved` 完整保留並呈現於新版收藏／全部範圍；第一次儲存收藏時以 `__podcastLegacyImported` 標記已匯入，避免移除後再次出現。其餘標籤與搜尋標籤不變。
- 筆記編輯使用既有 `studyEditor` 草稿防護，未儲存時阻止遠端覆蓋及登入跳頁。
- 未來使用者在對話貼 Podcast 逐字稿、筆記或摘要並要求加入拾頁，即依此格式收錄，最新集數在前；更新學習範圍、集數列表及對應內容，保留全部收藏／筆記。
- `podcast-preview.*` 為本機試作，正式站不使用；不提交試作檔。

本檔記錄原對話已確認的設計及實作，供後續專案對話接續。狀態記錄於 2026-10-06；後續仍以程式與 Git 狀態為準。

## 專案位置與部署

- GitHub： https://github.com/marzlo/Personal
- 網站： https://marzlo.github.io/Personal/
- 主分支：main；推送後由 `.github/workflows/pages.yml` 部署 GitHub Pages。
- `.github/workflows/sync-notion.yml` 每天台灣時間早上 08:00（UTC 00:00）自動同步 Notion 並發布網站，仍保留手動更新；GitHub Actions 排程可能延遲。
- 純 HTML/CSS/JavaScript，沒有建置步驟。
- 建立本檔前，工作目錄乾淨；最近提交為 `ae5ec9e Clarify newest-first timeline ordering`。
- README 的更新按鈕說明已過時：實際有 Cloudflare Worker 驗證與 dispatch 流程，請查看下列檔案，不要退回要求使用者手動 Run workflow 的流程。

## 重要檔案

- `index.html`：版面、文章顯示、標籤、觀念整理及時間軸。
- `series-study.js`：系列深讀、專有名詞、文章連結及整理編輯。
- `sync-status.js`：更新按鈕與同步進度。
- `sync-worker-config.js`、`worker/index.js`、`worker/SETUP.md`：Worker 設定與 GitHub OAuth／workflow dispatch 流程。
- `scripts/sync-notion.mjs`：讀取 Notion、辨識音訊、產生公開資料檔。
- `data.js`、`article-bodies.js`、`quote-bodies.js`：公開資料快照。
- `scripts/book-author-overrides.json`：書籍作者補充。

## 已確認的呈現規則

- 文章日期與排序使用 Notion `last_edited_time`。
- 最新 Podcast：含音訊的 Podcast 與書籍合併，依最後編輯時間取四筆，附 Unsplash 封面。
- 推薦文章：Notion Podcast 的 Tags 包含 `Important`，依最後編輯時間排序，附封面與關聯書籍；使用與最新 Podcast 不同的一組圖片。
- 文章清單預設十筆，可顯示更多；有類型與標籤篩選。
- 自動標籤：Seth賽斯、唯識真義、阿乙莎；另可管理自訂文章標籤。
- 本次更新摘句：引用 Notion 原文並附來源。
- 更新資料按鈕和同步進度在整個頁面最底下。
- 左側導覽依頁面順序提供：總覽、最新 Podcast、推薦文章、文章、觀念整理、系列深讀、Podcast 與主題；反白及 aria-current 隨捲動位置更新。
- 文章、最新 Podcast、推薦文章提供分享按鈕；`article-share.js` 與 `article-share.css` 實作已確認的「靜讀卡片」。分享網址使用 Notion page ID（`?article=...`），開啟時顯示深色背景文字彈窗，可前往 Notion 原文或取消回首頁。無效文章顯示提示，不接受任意外部網址。
- 分享彈窗提供中文／English 切換，按鈕、提示與文章類型翻譯；標題及作者保留原文。分享網址用 `lang=zh`／`lang=en` 帶上語言；網址設定優先於 `shiyeShareLanguage` 本機偏好，既有分享網址仍可使用。
- 整頁語言切換由 `page-language.js`／`page-language.css` 提供，頁首中文／English 切換導覽、表單、提示及動態產生的介面，與分享彈窗共用語言。`shiyeLanguage` 保存介面偏好；文章、標籤、作者、名詞、筆記及輸入值保留原文，切換不重建表單。選單 option 的原始 value 保留，避免把翻譯後文字写入整理資料。

## 觀念整理

- 參考 https://github.com/marzlo/Car-Radar 的議題設計。
- 條列展開／收合；有標題、四種狀態、開始日期、當時／現在想法。
- 設定及記事表單按下操作才出現；儲存後顯示文字。
- 時間軸由新到舊，同日後新增者先顯示；記事可編輯、刪除及連結文章。
- 連結文章以搜尋標題、作者、標籤並點選結果完成。
- 相關文章比對正文段落，不用文章標題代替正文；目前為文字比對，非語意模型。
- 正文不齊全時顯示取得篇數，避免把缺資料誤報成沒有相關文章。

## 系列深讀

- 位於 Podcast 與主題分類上方。
- 採用已確認的草稿二號：系列 → 專有名詞 → 文章與自己的理解。
- 各系列使用不同 Unsplash 風景背景；背景需看得見，文字仍清楚。
- 系列與名詞都可新增／刪除；刪除前確認。
- 減少框線：文字頁籤、下劃線標示選中；新增刪除收進管理選單。
- 字體層級：系列深讀最大，系列名稱次之，名詞最小。
- 名詞下提示固定為「這個名詞對我有什麼意義？哪些文章可以幫助我理解它？」。
- 我的理解與整理只有一個自由編輯框；旧多欄位內容合併保留。
- 已選文章獨立顯示；自動推薦文章在下方可收合的清單，加入後才成為已選文章。
- 移除連結是文章標題左側的小型斷鏈 icon，帶 tooltip 與 aria-label。

## 本機儲存

以下內容在本機保存；啟用「共用我的整理」後，登入 `marzlo` 可透過 Cloudflare 私人儲存跨裝置同步，不會寫回 Notion 或公開 GitHub：

- `shiyeIdeas`：觀念與記事。
- `shiyeArticleTags`：自訂文章標籤。
- `shiyeSeriesStudy`：系列名詞整理與文章連結。
- `shiyeSeriesConfigs`：可管理的系列與名詞設定。

- `notes-sync.js`／`notes-sync.css`：頁面底部的共用整理入口、備份、自動上傳與每 15 秒查詢；未儲存表單暫緩載入，衝突須選擇版本。
- `worker/index.js`／`worker/wrangler.jsonc`：`/login`、簽名登入 session、`/api/notes` 及 `NotesStore` Durable Object；Cloudflare 已部署。
- 初次以使用者電腦版為主：在原本有整理的電腦瀏覽器登入並按「以這台建立共用資料」，手機再登入；手機原有整理先備份，已刪除名詞不合併回來。
- 登入 session 存在 sessionStorage，有效七天；本機保留十份備份，可匯出；服務端保留前二十個版本。
- 本機保存入口使用 `window.ShiyeNotes.write`；遠端載入以 `shiye:notes-loaded` 事件重新顯示，保留 localStorage 原結構。
- 未登入或 session 過期時，開始編輯或儲存整理會顯示頁面下方登入提醒；本機修改保留，提醒不強制跳轉。有編輯表單未關閉時先儲存／關閉，再登入，避免遺失草稿。
- 同步整理與匯出備份收進「更多」；登入及初次建立共用資料仍直接顯示。

變更這些結構時需保留既有資料；資料檔為公開資料，金鑰不要寫入前端或提交到 Git。

## 使用者協作偏好

- 使用繁體中文，說明簡短清楚。
- 新的重大版面概念先提供草圖，已確認設計的修正可直接實作。
- 喜歡簡潔、少框線、有意境的風景封面，以及文章與想法之間的明確關係。
- 使用者已授權此專案後續修改由 Codex 直接提交並推送，不必每次提供指令；推送前先 `git pull --rebase origin main`，避免覆蓋同步流程的資料提交。
- 不把 API credentials 放在對話或公開程式裡。

## 尚未落實的需求紀錄

使用者曾以影片列表／議題追蹤截图要求右側也具備編輯、記事、連結功能，但該回合被中斷，尚未確認其對應的網站與檔案，也未實作。若再次處理，先釐清對應區塊；勿聲稱已完成。

- 記事與系列深讀的手動連結搜尋使用全部 Podcast 與書籍（linkableArticles），包含無音訊的書籍；文章清單與自動推薦仍遵循原有含音訊範圍。

## 公開整理（2026-10-07）
- 使用者授權全部已儲存整理公開。`/api/public-notes` 無須登入，只回傳目前共用快照；備份及 PUT 寫入仍僅 marzlo 可存取。
- 無 session、無同步基準的訪客從公開 API 每十五秒載入，僅在記憶體呈現，不覆蓋本機整理或建立同步基準；隱藏編輯、刪除及管理功能。
- 原有 owner 裝置的本機未上傳內容仍保留；登入失效後仍可先存本機，再登入同步。公開的是雲端已同步版本，不含尚未儲存草稿及備份。

## 自動發布與記住登入（2026-10-07）
- 整理狀態列縮成更新中／已發布，移除手動同步按鈕；備份與登出收在更多。登入入口只在未登入時顯示。
- 登入憑證由 sessionStorage 遷移至 localStorage 的原 `shiyeNotesSession`，保留現有整理；新憑證有效180天，已驗證且剩餘不足90天時，由 API 回傳新憑證延長至180天。過期或401清除憑證並提醒登入。
- 仍須每台裝置初次登入；備份不包含登入憑證。未登入及網路錯誤時的本機保存與版本衝突處理維持原樣。

## 手機區域導覽（2026-10-07）
- 手機寬度620px以下顯示頂端固定「跳至區域」原生選單，包含原有七個區域，隨捲動同步選中項目，支援中英文及 hash 直達；區塊預留頂部空間避免標題被遮住。
- 桌面側邊導覽維持原樣；手機原橫向導覽收起，選單不影響編輯草稿。

## 同步時間與效率（2026-10-07）
- Notion 更新狀態顯示開始時間、等待秒數及最近工作完成時間（含失敗狀態），時區台北；新資料快照含 syncedAt 精確時間。
- Actions 快取已讀取的音訊判斷及正文，頁面 last_edited_time 變更立即失效，最長六小時重新讀取；刪除頁面不沿用舊資料。快取存在 runner.temp，不包含 token，不上傳到網站。
- 首次與每日超過六小時仍完整讀取；短時間重複同步可減少請求，GitHub 排隊與部署延遲無法消除。同步日誌顯示請求數及耗時。
- Safari 從背景或返回上一頁時，以 pageshow／focus 重新讀取公開整理及同步狀態。

## 更新摘句字卡（2026-10-07）
- 每次 Notion 同步隨機選十個不重複原文摘句，保留來源、頁碼及 Notion 連結；不足十筆不虛構或重複。`featuredQuotes` 保存本次十張，`featuredQuote` 保留舊版相容。
- 摘句區改成 scroll-snap 橫向字卡，手機可左右滑動，桌面有左右按鈕、張數與方向鍵操作；不自動輪播，文章原文不翻譯。

- 頁首右側以台灣時間顯示資料 syncedAt，格式更新時間：YYYY/MM/DD HH:mm，取代當日日期；中英文同步切換。

- 同步進度改由 Worker /api/sync-status 使用既有伺服端 GitHub 憑證查詢，十五秒共用快取；前端不直接查詢未登入 GitHub API，避免共享 IP 額度耗尽。僅回傳工作狀態與步驟名稱，不回傳憑證或日誌。

- 系列深讀主題與名詞支援 Pointer Events 左右拖曳排序及 Alt＋左右鍵；只存 configs 順序，不重建表單，保留選中項目和草稿；取消拖曳還原，訪客不可排序。

- 分享彈窗附上該篇 ARTICLE_BODIES 原文摘句，share-excerpt.js 以完整句子及反思詞彙評分挑選；排除標題、網址、操作文案，無合適正文則不顯示；分享者與訪客使用同一摘句，切換英文保留原文。

## 文章分享縮圖（2026-10-08）
- 新分享網址 `/Personal/share/<Notion page ID>/?lang=zh|en` 為文章專屬靜態預覽頁，提供 Open Graph／Twitter 名稱、原文摘句、1200×630 PNG 圖片；瀏覽器自動回到原有 `?article=` 分享彈窗，舊網址仍有效。
- `scripts/build-share-pages.mjs` 使用現有資料及 share-excerpt.js 挑句；`scripts/build-share-images.py` 產生中文書名字卡。兩個部署工作流程在上傳前產生，不把生成目錄提交；安裝 Pillow10.4及 Noto CJK 字型。
- 社群平台可能快取預覽，需使用新分享按鈕複製網址；舊的首頁 query 網址無法在 GitHub Pages 上對爬蟲提供文章專屬 meta。

## 金句連結搜尋（2026-10-10）
- linkableArticles 包含所有書籍、Podcast與金句，不限音訊。記事新增／編輯和系列深讀共用 searchLinkableArticles，支援標題、關聯書名、作者、標籤、金句正文及 Notion URL／page ID。
- 不改寫既有記事結構與內容；現有記錄再次編輯即套用同一搜尋。回歸測試含 c4e0393e4df640669cf82e5714a438ed 與無音訊人生操作手冊。

- iPhone 加入主畫面沿用淡綠底與深色八芒✳品牌圖示，icons/apple-touch-icon.png 為180px不透明方形；另有32px favicon。主畫面名稱拾頁，未改成獨立App啟動模式。

- 最新 Podcast 四張封面依快照 coverRotation 每次成功同步輪換一次；重新整理不隨機改變，同一輪更新所有訪客一致，攝影者與來源連結同步移動。推薦文章封面保留原設定。

- Podcast與主題的Podcast分類依篇數由多到少，同篇數依名稱；未標示作者且標題含周六／週六獨立周六課程，其餘留未標示作者。李如心及Lucy括號形式分組名稱改唯識真義，不改文章作者原資料。

## 文章搜尋標籤（2026-10-10）
- 移除逐篇管理文章標籤 UI，新增 articleSearch 搜尋標題、作者、原有標籤、正文；可與類型與標籤條件同時使用。
- 新增搜尋標籤是保存關鍵字的篩選按鈕，存在 shiyeArticleTags.__searchTags 陣列並透過既有同步發布；原 URL→tags 陣列保留，不做資料遷移或刪除。新增文章自動套用關鍵字比對。
- 訪客可搜尋、使用已發布搜尋標籤；只有擁有者可新增，未保存搜尋標籤表單阻止登入跳頁與遠端覆蓋。

- 修正封面需求：每次Notion同步從Picsum攝影目錄取得四張新照片，排除上一批所有photo ID，快照latestPodcastCovers保存照片與作者来源，不再輪動原四張。來源服務失敗保留上一批並記錄警告，不中斷Notion同步。

- 使用者確認主題探索改為作者分類：書籍用作者、金句用關聯書籍作者，沿用Podcast分組規則與篇數遞減；保留書籍／金句類型與全部資料。

## Indicator 英語專頁（2026-10-13）
- `indicator.html` 由頁首側欄與文章區入口進入；僅Podcast tags不分大小寫等於Indicator，按最新編輯時間呈現正文。
- `indicator-study.js` 從原文已整理的編號詞彙標題與例句段落抽取單字、用詞、句子及中文說明；不生成虛構內容。每次開頁／重新抽選隨機十張，盡可能包含三種類型，來源不足時不補造。
- 重要詞句保存於既有 shiyeArticleTags.__indicatorSaved，不更動其餘文章標籤，沿用notes-sync發布與跨裝置同步。訪客可看公開詞句，擁有者可標記／移除；未登入可回首頁登入後返回此頁。
- 首頁文章pool排除Indicator，連結文章搜尋仍保留，article-share以linkableArticles建立查找以維持舊分享網址。

- Indicator下方改為封面文章卡片，不嵌入／展開正文；顯示標題、作者、最後編輯、分享與攝影者。封面從生活物件照片池隨機排列，正文仍供上方字卡抽取。頁首明確回到拾頁連結。

- Indicator字卡僅抽單字與用詞，例句與中文翻譯附在該詞彙examples陣列中，不再有獨立句子卡；目前六詞六卡，上限十張且不足不重複。既有重要詞句資料保留，單字／用詞ID不變。

- 更新摘句可收藏／取消，原文來源頁碼完整存於shiyeArticleTags.__favoriteQuotes，收藏清單在字卡下方；每次Notion更新不丟失收藏，沿用同步與訪客唯讀。不修改既有未追蹤podcast-preview檔案。

- 使用者已確認折行名詞按鈕設計：study-term-tabs改flex-wrap、無橫向溢位、44px點選區，淡綠選中態；系列頁籤及既有拖曳儲存方式保留，不變動整理資料。

- 更新摘句改先依sourceUrl平衡來源，每輪每來源一句；書籍及其關聯Podcast統一來源，優先未在上一輪出現來源。候選含金句及所有書籍／Podcast正文（包括無音訊書籍），去除重複句子，不為湊數重複來源。收藏不變。

- 文章列、最新／推薦Podcast、分享視窗及Indicator卡片提供在Notion編輯入口，Notion頁面ID轉為www.notion.so工作區網址，新分頁開啟；notes-visitor隱藏，實際編輯權限仍由Notion控制，公開閱讀連結保留。

- 摘句完整性：冒號、未完結句與未閉合中文引號會接續後文，最多360字且不跨章節標題；無法完整結尾者排除，不強截文字。現有收藏保留原貌。

- 摘句排除清單編號誤切：移除數字／中文序號，孤立數字不當句號，條列項目間設邊界避免拼接；缺結尾的待辦條列不選入。

- 更新摘句字卡及收藏清單也加入在Notion編輯，使用摘句notionUrl的頁面ID（非書籍總頁），公開查看連結保持不變。

- 摘句定位：Notion同步保存正文每個區塊ID及文字於快取，候選摘句以第一句對應來源區塊，在notionUrl加#blockId；查看與編輯都定位該區塊，跨區塊摘句定位第一段。舊收藏不改寫；無ID回頁首。下一次Notion同步後新字卡開始帶位置。收藏比對忽略錨點避免重複。

- 系列深讀推薦改為跨系列比對正文中的目前名詞，不再要求符合系列標籤；保留既有 articlePool 範圍及已選文章排除，空白名詞不推薦，不更動已儲存文章連結或整理。

- 摘句區新增「關鍵字找句子」（quote-search.js、scripts/quote-search.mjs），可從所有書籍、Podcast 正文及金句搜尋完整原文段句，多個空白分隔詞須同時符合，結果每次20筆可繼續載入。沿用完整句提取但不套反思詞偏好，保留原文、來源、頁碼；未具區塊ID的結果連到來源頁，不虛構定位。收藏沿用 __favoriteQuotes 與 ShiyeNotes.write，同來源同句不重複；不改儲存結構，自動摘句仍保留。訪客可搜尋及讀取，收藏操作只對擁有者開放。

- 摘句搜尋效能：頁面初載不匯入搜尋模組或建立索引，首次輸入搜尋才啟動 module Web Worker（quote-search-worker.js），在背景建立並重用句子索引，舊請求結果以ID排除；初次頁面仍只顯示搜尋表單。文章正文 article-bodies.js 的快取鍵改用資料 syncedAt（備援 updatedAt），同快照重新載入可重用快取，新同步使用新網址；data.js 仍維持即時更新。

- 首頁載入最佳化：article-bodies-loader.js 不阻擋首頁，在 window load 後背景載入全文，沿用快照版本快取；ShiyeLoadArticleBodies() 共用Promise、失敗可重試。全文搜尋等候正文就緒，系列推薦顯示載入／失敗提示且保留已選文章，正文就緒後更新文章篩選、系列推薦與已開啟分享摘句；不重建正在編輯的系列表單。以本機 Chromium 模擬150ms延遲、1.6Mbps下載、4倍CPU降速（外部服務請求未納入）測得主要內容由16.4秒降至3.4秒；實站時間仍依裝置、網路與服務回應而異。

- 摘句搜尋依原始 notionUrl（忽略區塊錨點）合併，每篇文章只列一筆，保留該篇各個相符片段供下拉切換，優先較短片段。結果提供唯讀原文選取框，長按／拖曳選取範圍後顯示摘句預覽，收藏僅保存選取原文；可明確按「使用整個片段」。切換片段清空舊選取，未選取前停用收藏，原收藏不變。

- Podcast 封面已加入：icons/podcast/ 為耳機與書本圖案，含768px WebP封面、180px Apple touch icon、32px favicon。頁首顯示小圖，手機與桌面皆可見，僅 podcast.html 使用這組圖示，不取代拾頁首頁圖示。

- 三站圖示更新為極簡森林綠剪影搭配淡綠／米色幾何背景：首頁 icons/home/ 書本、Podcast icons/podcast/*-v2 耳機、吉他 guitar-practice/icons/*-v2 吉他。首頁側欄品牌圖亦採用新書本，首頁原圖示檔保留；新路徑避開舊圖示快取。

- Podcast 頁 script/CSS 使用內容雜湊 v 參數防舊快取，修改 podcast-episodes.js、podcast-exercises.js、podcast-learning.js、podcast-navigation.js、podcast-swipe.js 或 podcast-learning.css 時同步更新 podcast.html 該資源的 v（SHA256前12碼）。頁面無 episode query 仍按日期顯示最新集數；campaignSpending 日期10/15故不是預設集數，用 ?episode=campaignSpending 直達。

- Podcast 頁學習範圍預設為「全部集數混合複習」（scope=all），仍可手動切回本集／收藏，不更動收藏、刪除或筆記資料。

- iPad 直式閱讀版：tablet-reading.css 僅適用621–1024px且直式，改用頂端段落選單與全寬閱讀（最大960px），保留品牌與Podcast／吉他入口。正文18px、摘句21px、統計30px，文章卡片雙欄，系列深讀內容單欄。手機、橫式與桌面保留既有規則；已檢查768/820/834/1024直式及手機／桌面無橫向溢出。

- 文章分享縮圖：產生頁補齊 og:image:type=image/png 與 secure_url，1200×630 PNG維持既有產生器。og:url、圖片及「複製網址」加上 v=2-文章updated毫秒值，讓社群預覽使用新版網址；已貼出的舊LINE訊息仍可能保留平台快取。分享視窗新增同一張縮圖預覽，無圖／失敗時隱藏。已驗證使用者指定4021c7f3357e80fab1a1dd3138bbef29頁及手機／平板圖片。

- 分享縮圖改為照片＋標題／作者／少量摘句的1200×630橫式卡：manifest帶入latestPodcastCovers照片，首頁最新四篇沿用相同位置的照片，其餘按URL穩定選同批照片；保留攝影者標示。產生器在CI下載照片並快取同一URL，失敗時回退文字卡不阻止部署。預覽版本v=3-本次syncedAt毫秒。本機picsum存取回403，合成／快取／回退以fixture驗證，正式照片需由部署環境下載。

- 首頁新增雨窗街景動態：assets/ambience/ 為使用者確認的生成圖壓縮版（小圖約59KB／大圖151KB），ambience.css/js 在主內容後低優先載入圖片，頂部呈現場景與18條CSS雨滴、緩慢光影；捲動時固定背景透明度由0.9降至0.16並增加米白遮罩。文字閱讀層維持高對比，提供暫停／播放，頁面隱藏會暫停，prefers-reduced-motion使用靜態，saveData預設暫停。只套首頁；目前只有一個雨窗場景，尚無多場景隨同步輪換。已驗證手機／直式iPad／桌面、捲動淡化、暫停與減少動態。

- 首頁雨效改用Lively作者 Rainy Window 的原始rain.frag（rocksdanister/rain threejs分支55d90619c2ba0cfc68c81f6b39f8d2dc64e8072b），保留rocksdanister／BigWings署名及CC BY-NC-SA 3.0授權於assets/ambience/rain/NOTICE.txt與畫面來源連結。未採原桌布照片或Icons8圖示。rain-renderer.js為原生WebGL接合層，同樣CC BY-NC-SA，無three.js額外依賴，保留原選定街景、折射雨滴、關閉閃電／多重模糊；最大1000px渲染寬、20fps上限。首內容後才載入、離開視窗／捲離場景停止、減少動態／省流量預設靜態、WebGL失敗回退靜態。後續生活場景不限定雨景，目前先替換此版本。

- 背景呈現修正：移除頂部獨立ambient-window圖片區，WebGL直接掛在整個viewport的fixed背景，內容層在前方；以捲動距離調整背景透明度／米白遮罩與閱讀層透明度，回頂恢復。暫停及來源移到右下角。捲超過首屏停止雨效，回頂恢復；全屏渲染限制60萬像素、20fps。手機／iPad／桌面已驗證背景不隨內容移動、淡化與回復、48項測試通過。

- 新增atom-preview.html獨立預覽：米色底、三條細橢圓軌道、中央原子核與3顆電子的SVG動畫（13／17／21秒），提供暫停與減少動態支援，無外部資源；為視覺示意而非電子實際軌跡模型。目前只提供獨立預覽，尚未取代首頁雨景。

- 原子動畫依使用者要求作為首頁主閱讀區最上方置中小圖，非背景。home-atom.css/js＋內嵌SVG，桌面132×110、手機112×94，米色底；點擊可暫停／播放，離屏或分頁隱藏暫停，尊重減少動態。保留既有街景背景與獨立atom-preview.html。已驗證390/820/1440寬度置中與不遮擋文字。

- 首頁場景轉場：同一fixed WebGL層在頂端定位到原子小圖下方的清晰封面位置，隨捲動連續擴展至整個viewport並淡化，米白閱讀層保留背景可見度；回頂還原，不是兩張互不相關的圖片。新增都市咖啡窗景city-cafe壓縮圖，與rain-window輪換。scripts/ambience-scenes.mjs集中定義，Notion成功產生新snapshot時寫入下一個ambienceScene；舊snapshot預設rain-window，同次資料重新整理保持不變。未在本機執行實際Notion同步，已測試輪換函式及模擬新版snapshot的選圖。

- 原子小圖移入品牌導覽區：平板直式置於拾頁品牌與Podcast／吉他入口之間，手機品牌右側、桌面側欄品牌下方。移除米色底板改透明，原子核放大1.8倍並提高軌道對比；動畫與暫停行為保留。

- 背景動態修正：轉場完成後背景仍留在viewport，移除依progress<1停止雨效的條件；維持使用者暫停、分頁隱藏、減少動態及省流量控制，以及原20fps／60萬像素上限。

- 場景診斷：同步提交8999cc2→d888d02→47212c3為咖啡→雨窗→咖啡，只有兩張所以隔兩次回原圖。新增目前場景名稱與手動換圖按鈕（僅本次頁面，不改同步輪換），載入成功後才換背景、失敗可重試；換圖釋放舊WebGL。更新載入程式／場景模組快取版本。正式Pages與狀態API在本執行環境回403，未宣稱已驗證裝置或正式部署。

- 生活場景擴充為6種：雨窗、咖啡窗景、陽光樹蔭、清晨海岸、夜晚街道、窗邊閱讀。新增4組生成寫實WebP素材（1440/900px），SCENES.md註明為圖片非實拍影片。只有雨窗使用WebGL雨滴；其餘為CSS緩慢鏡頭平移／縮放，樹蔭與夜景帶輕微亮度變化。暫停、背景分頁、減少動態與省流量控制共用，場景名稱／效果集中於sceneDetails；每次成功Notion同步循環下一張，手動切換只影響當前頁。載入當前圖片而非預載整批。

- 動態可見度修正：咖啡窗景恢復雨滴WebGL；其他場景除了緩慢鏡頭，增加可見的光束／樹影／水面亮紋／夜景光軌CSS疊層，仍是圖片上的動畫，不是真實影片。轉場後持續播放，暫停與減少動態一併控制所有層。更新CSS/JS/場景模組快取版本。

- 生活光影進一步依場景調整：窗邊閱讀為斜向陽光／窗框陰影／牆面葉影三層；樹蔭增多層不同節奏的斑駁樹影；咖啡窗景保留WebGL雨滴並加局部暖光；海岸前景增加16根不同高度與相位的草影搖曳（原圖草木不變形）。皆為CSS合成效果非實拍影片，所有新層沿用暫停與減少動態。
