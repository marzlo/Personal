# 拾頁專案接續紀錄

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
