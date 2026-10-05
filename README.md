# 拾頁｜個人閱讀儀表板

靜態 GitHub Pages 網站，無需建置工具。首頁為 `index.html`；`data.js` 與 `quote-bodies.js` 是公開的 Notion 資料快照。

## 發佈與 Notion 同步

- `.github/workflows/pages.yml` 會在推送到 `main` 後部署網站。
- `.github/workflows/sync-notion.yml` 可在 GitHub Actions 手動執行，同步後更新資料快照並部署網站。
- 網站的「更新資料」按鈕會開啟該 GitHub Actions 工作流程；登入 GitHub 後，按 **Run workflow** 啟動同步。完成後重新整理儀表板。
- 同步工作流程需要 repository secret `NOTION_TOKEN`。建立 Notion internal integration，給它三個來源資料庫的讀取權限，再將 token 設為 GitHub repository 的 `NOTION_TOKEN` secret。金鑰只供 GitHub Actions 使用，不會放入公開網頁。

## 公開資料

- 快照包含書籍、Podcast、金句索引與金句文字。GitHub repository 為公開，因此這些快照資料也會公開。
- 同步會複製頁面文字，不會複製音檔、圖片或 Notion 的檔案附件。
- 觀念整理的編輯內容存在使用者瀏覽器的 `localStorage`，不會同步至 Notion，也不會跨裝置同步。
