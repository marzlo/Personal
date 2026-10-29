# 啟用三台裝置的歌單同步

網站端已加入登入、同步狀態與自動合併。真正連線需要把現有的 Cloudflare Worker 更新一次，前端推送 GitHub Pages 不會代替發布 Worker。

1. 登入 Cloudflare → Workers & Pages → `shiye-notion-sync` → Edit code。
2. 將本儲存庫 `worker/index.js` 的完整內容更新進去，按 Deploy。保留既有 `GITHUB_CLIENT_ID`、`GITHUB_CLIENT_SECRET`、`GITHUB_ACTIONS_TOKEN` 與 `NOTES_STORE` 綁定。沿用原本 NotesStore 類別，無需新增儲存綁定或 migration；若原 Worker 尚無 NOTES_STORE，需先依 worker/SETUP.md 用 Wrangler 設定。
3. **先用 iPad 原本新增歌曲的瀏覽器**開啟練團歌單，按「登入 GitHub 連接歌單」，用 marzlo 登入。等待顯示「已同步」。首次會保留並合併本機歌曲。
4. 電腦、手機開啟同一頁，登入同一個 GitHub 帳號。若已有拾頁登入，可沿用登入狀態。三台各自的本機歌曲會合併；同首歌曲的不同修改會保留本機版本副本。

檢視模式每15秒檢查雲端，也可按「立即同步」。編輯時先自動儲存本機，按「儲存並檢視」後約1秒同步。離線保留本機資料；恢復連線後繼續。初次使用仍建議在每台裝置各匯出一份備份。

歌單使用 `/api/guitar-setlist` 與 `marzlo:guitar-setlist` 獨立 Durable Object，不會出現在 `/api/public-notes`，也不寫入公開 GitHub。只允許已驗證 marzlo 登入的裝置讀寫；沿用180天登入與原子版本檢查、雲端20版／本機備份。單次雲端上限120KB，超過時顯示提示並保留本機。

本執行環境未持有 Cloudflare 部署登入，不能替使用者直接發布 Worker；GitHub API 權限亦無法檢查是否有部署用 secret。請不要把密鑰貼到對話或公開儲存庫。
