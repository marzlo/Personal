# 啟用手寫筆記逐篇同步

程式沿用現有 shiye-notion-sync Worker、NOTES_STORE binding、NotesStore 類別與 GitHub 登入。無須新增儲存遷移或設定金鑰。

## 從 Cloudflare 網頁部署

1. 登入 Cloudflare，開啟 Workers & Pages → shiye-notion-sync → Edit code。
2. 將此專案 worker/index.js 的完整內容貼入既有主程式檔（不要更動既有 Variables、Secrets、Durable Object bindings）。
3. 按 Deploy。開啟 `https://shiye-notion-sync.brilliantgreat.workers.dev/api/handwritten`，應回傳 `{"version":1,"items":{}}` 或已有篇章的索引。
4. 拾頁套用新版後，開啟手寫拾記，登入原帳號並保持連線；狀態列顯示「逐篇同步已就緒」即啟用。若存在不同版本，逐篇選擇保留版本。

前端在新 API 尚未啟用時繼續使用原有同步，避免中斷已上線的校對。API 就緒後，自動將讀到的舊校訂逐篇搬移；舊 shiyeArticleTags.__handwrittenNotes 不刪除，供備份與舊裝置相容。未上傳的舊裝置請先同步舊資料，再套用新版。已搬移的同篇新校訂以獨立服務為準；之後使用新版裝置校對。

## 在已登入 Cloudflare 的電腦部署

在專案 worker 目錄執行：

```sh
npx wrangler@4 deploy
```

## 資料與限制

- GET /api/handwritten：公開篇章索引，只包含 revision 與 updatedAt。
- GET /api/handwritten/:id：公開單篇校訂。
- PUT /api/handwritten/:id：沿用擁有者簽名驗證，每篇一次最多120000 bytes；單一文字欄位最多16000字。
- 每篇獨立版本號、原子衝突檢查、前20版伺服器備份；本機保留每篇前10份校訂，可匯出。
- 最大1000篇已校訂紀錄，符合目前約346張規模。不是無限容量；總量不再塞進單次120KB快照。
- 使用獨立物件名稱 marzlo:handwritten；不影響原閱讀整理與吉他資料。
- 新服務採版本索引輪詢，只讀取有變動的篇章，寫入僅包含修改的單篇。
- 本機新儲存鍵 shiyeHandwrittenSyncV1 不包含登入金鑰，不寫入公開GitHub。

測試：`node --test tests/handwritten-sync.test.mjs tests/handwritten.test.mjs tests/notes-worker.test.mjs tests/guitar-worker.test.mjs`。
