(() => {
  const label = document.querySelector("#syncStatusLabel");
  const percent = document.querySelector("#syncStatusPercent");
  const fill = document.querySelector("#syncProgressFill");
  const track = document.querySelector(".sync-progress-track");
  const syncButton = document.querySelector(".sync-button");
  const syncHint = document.querySelector(".sync-progress-hint");
  const endpoint = window.SYNC_WORKER_URL.replace(/\/$/, "") + "/api/sync-status";
  if (!label || !percent || !fill || !track) return;

  const timeLabel = document.createElement('p');
  timeLabel.className = 'sync-progress-hint sync-time';
  syncHint?.after(timeLabel);
  const formatTime = value => new Date(value).toLocaleString(window.ShiyeI18n?.language === 'en' ? 'en-US' : 'zh-TW', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  let latestRun = null;
  function showTime() {
    if (latestRun) {
      const finished = latestRun.status === 'completed';
      const since = Date.parse(latestRun.run_started_at || latestRun.created_at);
      timeLabel.textContent = finished ? '最近同步完成：' + formatTime(latestRun.updated_at) : '同步開始：' + formatTime(since) + ' · 已等待 ' + Math.max(0, Math.floor((Date.now()-since)/1000)) + ' 秒';
    } else if (window.DASHBOARD_DATA?.syncedAt) timeLabel.textContent = '目前資料同步時間：' + formatTime(window.DASHBOARD_DATA.syncedAt);
    else if (window.DASHBOARD_DATA?.updatedAt) timeLabel.textContent = '目前資料更新日期：' + window.DASHBOARD_DATA.updatedAt;
  }
  showTime();
  window.addEventListener('shiye:language-changed', showTime);
  const workerUrl = window.SYNC_WORKER_URL;
  const syncResult = new URLSearchParams(window.location.search).get("sync");
  const syncStage = new URLSearchParams(window.location.search).get("stage");
  const dispatchStatus = new URLSearchParams(window.location.search).get("dispatch_status");
  const dispatchMessage = new URLSearchParams(window.location.search).get("dispatch_message");
  const pendingKey = "shiyeSyncRequestedAt";
  let requestedAt = 0;
  try {
    requestedAt = Number(sessionStorage.getItem(pendingKey)) || 0;
    if (syncResult === "started" && !requestedAt) {
      requestedAt = Date.now();
      sessionStorage.setItem(pendingKey, String(requestedAt));
    }
  } catch { /* Polling remains available when storage is disabled. */ }
  if (syncResult === "started" && !requestedAt) requestedAt = Date.now();
  function clearRequest() {
    requestedAt = 0;
    try { sessionStorage.removeItem(pendingKey); } catch {}
    const url = new URL(window.location.href);
    if (url.searchParams.get("sync") === "started") {
      url.searchParams.delete("sync");
      window.history.replaceState(null, "", url);
    }
  }
  if (syncButton) syncButton.addEventListener("click", () => {
    try { sessionStorage.setItem(pendingKey, String(Date.now())); } catch {}
  });
  if (syncButton && workerUrl) {
    syncButton.href = `${workerUrl.replace(/\/$/, "")}/sync`;
    syncButton.removeAttribute("target");
    syncButton.removeAttribute("rel");
    syncButton.title = "驗證 GitHub 帳號後直接啟動 Notion 同步";
  }
  if (syncHint) {
    if (!workerUrl) syncHint.textContent = "自動更新入口部署完成後，按鈕會直接啟動同步。";
    else if (syncResult === "started") syncHint.textContent = "已送出同步，進度會在此自動更新。";
    else if (syncResult === "unauthorized") syncHint.textContent = "此功能僅開放給 GitHub 帳號 marzlo。";
    else if (syncResult === "error") {
      const stageHints = {
        configuration: "Worker 缺少必要設定；請確認 Production 環境的三個憑證名稱並部署。",
        state: "OAuth 驗證狀態失效；請重新按更新資料並完成 GitHub 授權。",
        oauth: "GitHub OAuth 未完成授權；請重新按更新資料並完成授權。",
        code: "GitHub 沒有回傳授權碼；請重新啟動 OAuth 授權。",
        token_exchange: "OAuth token 交換失敗；請檢查 Worker 的 GITHUB_CLIENT_SECRET 是否為目前的 Client secret。",
        verify_user: "無法確認 GitHub 帳號；請檢查 OAuth 設定並確認登入 marzlo。",
        pat_identity: "GitHub Actions token 驗證失敗；請確認 Production 的 GITHUB_ACTIONS_TOKEN 是有效 token。",
        workflow_lookup: "GitHub API 無法讀取 sync-notion.yml；請確認 token 可存取 Personal 儲存庫。",
        dispatch: "GitHub 拒絕啟動工作流程；請檢查 PAT 的 Personal 儲存庫範圍與 Actions 寫入權限。"
      };
      syncHint.textContent = syncStage === "dispatch" && dispatchStatus
        ? `GitHub 派送失敗（HTTP ${dispatchStatus}）：${dispatchMessage || "API 未提供原因"}`
        : stageHints[syncStage] || "無法啟動同步，請查看 Cloudflare Worker 記錄。";
    }
    else syncHint.textContent = "按下更新後，驗證 GitHub 帳號即可直接啟動同步。";
  }

  function show(text, value = 0, active = false) {
    label.textContent = text;
    percent.textContent = value ? `${value}%` : "";
    fill.style.width = `${value}%`;
    fill.classList.toggle("is-active", active);
    track.setAttribute("aria-valuenow", String(value));
  }

  function stepName(name) {
    const value = String(name || "").toLowerCase();
    if (value.includes("fetch") || value.includes("notion")) return "讀取 Notion 資料";
    if (value.includes("save") || value.includes("commit")) return "保存最新資料";
    if (value.includes("upload")) return "準備網站檔案";
    if (value.includes("deploy")) return "發布網站";
    if (value.includes("configure")) return "準備發布環境";
    if (value.includes("checkout")) return "準備程式檔案";
    if (value.includes("node")) return "準備同步環境";
    return "同步進行中";
  }

  async function update() {
    try {
      const response = await fetch(endpoint, { cache: "no-store", headers: { Accept: "application/vnd.github+json" } });
      if (!response.ok) throw new Error("GitHub status unavailable");
      const runs = (await response.json()).workflow_runs || [];
      // A newer queued run must not hide the sync already in progress.
      const run = runs.find(item => item.status === "in_progress") || runs.find(item => item.status !== "completed") || runs[0];
      latestRun = run; showTime();
      if (requestedAt && (!run || (run.status === "completed" && Date.parse(run.created_at) < requestedAt - 10000))) {
        if (Date.now() - requestedAt < 120000) {
          show("已送出同步，等待 GitHub 建立工作", 3, true);
          return true;
        }
        clearRequest();
        show("尚未確認新同步，請到 GitHub 查看");
        if (syncHint) syncHint.textContent = "等待已超過兩分鐘；請查看工作流程是否已建立。";
        return false;
      }
      if (!run) {
        show("尚未執行過同步");
        return false;
      }
      if (run.status === "completed") {
        clearRequest();
        show(run.conclusion === "success" ? "最近一次同步成功" : run.conclusion === "cancelled" ? "最近一次同步已取消" : "最近一次同步失敗", run.conclusion === "success" ? 100 : 0);
        if (syncHint) {
          syncHint.replaceChildren();
          syncHint.append(run.conclusion === "success" ? "資料與網站已更新，可重新整理頁面。 " : "同步未完成，請查看失敗步驟。 ");
          const details = document.createElement("a");
          details.href = run.html_url;
          details.textContent = "查看同步紀錄 ↗";
          details.target = "_blank";
          details.rel = "noreferrer";
          syncHint.append(details);
        }
        return false;
      }

      if (["queued", "pending", "waiting", "requested"].includes(run.status)) {
        show("同步排隊中", 3, true);
        return true;
      }

      let value = 8;
      let text = "同步進行中";
      try {
        if (run.jobs) {
          const jobs = run.jobs;
          const job = jobs.find(item => item.status === "in_progress");
          if (job) {
            const steps = job.steps || [];
            const completed = steps.filter(step => step.status === "completed").length;
            const current = steps.find(step => step.status === "in_progress");
            value = Math.min(95, Math.max(5, Math.round((completed / Math.max(steps.length, 1)) * 95)));
            text = stepName(current?.name);
          }
        }
      } catch { /* Keep the basic running state if job details are unavailable. */ }
      show(text, value, true);
      return true;
    } catch {
      show("暫時讀不到同步狀態，可到 GitHub 查看");
      return true;
    }
  }

  let pollTimer, checking = false;
  async function poll() {
    if (checking || document.hidden) return;
    window.clearTimeout(pollTimer);
    checking = true;
    try { if (await update()) pollTimer = window.setTimeout(poll, 15000); }
    finally { checking = false; }
  }
  window.addEventListener('pageshow', poll);
  window.addEventListener('focus', poll);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(); });

  poll();
})();
