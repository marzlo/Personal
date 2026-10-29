# Personal 離線使用

部署後第一次請保持連線，開啟拾頁首頁、Podcast 或吉他頁面，等待左下角顯示「離線已備妥」。首次約下載6.8MB；同一瀏覽器之後可斷網重新開啟、重新整理或切換這些主要頁面，不必先加入主畫面。

可離線使用：首頁與Notion公開資料快照、Podcast筆記／字卡、吉他級數工具與指板圖庫、練團歌單與idea編輯、已收錄的Letting Go PDF與譜頁、本站生活場景圖片。其他本站分享頁與縮圖會保留最近瀏覽的60個資源；未下載的頁面顯示離線導覽頁。

需要連線：GitHub登入、Notion更新、歌單／筆記雲端同步，以及Apple Podcasts、Suno、Notion等外部網站與音訊。離線不是跨裝置同步；歌單仍存於原本瀏覽器，網路恢復後沿用既有同步流程。本功能不修改任何localStorage資料，也不快取登入或API回應。

左下角可查看狀態及檢查更新。有新版時會先完整下載到另一份快取，不自動重載編輯中的頁面；先儲存，再按「套用新版」，或關閉本站所有分頁後重開。清除網站資料或瀏覽器回收快取後，需要再連線下載。

## 維護

- `service-worker.js` 範圍僅 `/Personal/`，不接管其他儲存庫網站。只清除 `personal-offline-core-*` 舊版快取，保留本機筆記及其他快取。
- `offline.js` 在首次頁面load後延後註冊，下載完成才顯示備妥。三個吉他獨立匯出頁的外層CSP允許本站script及worker；內層sandbox仍保留原設定。
- `node scripts/build-offline-assets.mjs` 產生 `offline-assets.js`：只列白名單的公開靜態資源，雜湊所有檔案與worker內容形成版本。樣式檔若混入HTML會拒絕產生。推送與每日Notion同步工作流程都在發布前執行此步驟。
- 程式／HTML／樣式採完整版本快取；data.js、article-bodies.js、quote-bodies.js優先網路並在失敗時使用快照。`v=`快取參數不會導致離線失效；瀏覽分享頁／圖片保留原query以尊重縮圖版本。
- 跨來源、帶Authorization、api/auth/login/sync/worker路徑，以及含token/session/code/state/sync參數的請求不進離線快取。

驗證：`node --test tests/offline-assets.test.mjs`；使用Playwright啟動本機網站後跑 `tests/offline-browser.cjs`（OFFLINE_URL指定含Personal路徑的根網址）、`tests/offline-update-browser.cjs`（自行建立測試server）。測試包含斷網重新載入各頁、離線修改歌單、原譜載入、身份API不快取、新版等待與編輯保護。
