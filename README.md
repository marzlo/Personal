# 拾頁｜個人閱讀儀表板

靜態 GitHub Pages 網站，無需建置工具。首頁為 `index.html`；`data.js` 與 `quote-bodies.js` 是從三個 Notion 資料庫匯出的公開快照。

## 發佈

1. 將此資料夾中的檔案放到 `marzlo/Personal` repository 根目錄。
2. 在 GitHub repository 的 **Settings → Pages** 將 Build and deployment 的來源設為 **GitHub Actions**。
3. 推送到 `main` 後，`.github/workflows/pages.yml` 會自動部署網站。

## 資料與觀念筆記

- 快照包含 151 筆書籍、108 筆 Podcast、148 筆金句索引，以及金句頁面的文字內容。快照日期為 2026-10-05。
- 金句原文會公開顯示在網站，並可展開閱讀；頁面不複製 Notion 的音檔或圖片檔。
- GitHub Actions 會在推送後自動部署，但 Notion 資料不會自動同步；新增或修改 Notion 資料後，需要更新快照檔案再推送。
- 觀念整理編輯內容存放在使用者瀏覽器的 `localStorage`，不會同步至 Notion，也不會跨裝置同步。
- 此頁沒有 Notion API 憑證。repository 為公開，因此索引、金句文字和頁面連結都會公開；Notion 權限仍由 Notion 控制。
