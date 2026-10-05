# 拾頁｜個人閱讀儀表板

靜態 GitHub Pages 網站，無需建置工具。`index.html` 是網站首頁。

## 發佈

1. 將這個資料夾內的檔案放到 `marzlo/Personal` repository 根目錄。
2. 在 GitHub repository 的 **Settings → Pages** 將 Build and deployment 的來源設為 **GitHub Actions**。
3. 推送到 `main` 後，`.github/workflows/pages.yml` 會自動部署網站。

## 資料與觀念筆記

- 文章卡與分類使用整理時從 Notion Reading List 取得的靜態資料，並連回 Notion 原文。
- 觀念整理編輯內容存放在使用者瀏覽器的 `localStorage`，不會同步至 Notion，也不會跨裝置同步。
- 此頁沒有 Notion API 憑證或自動同步能力。若 repository 為公開，首頁列出的文章標題、分類與 Notion 頁面連結也會公開；請先確認你希望這些索引資訊公開。
