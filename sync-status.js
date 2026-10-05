(() => {
  const label = document.querySelector("#syncStatusLabel");
  const percent = document.querySelector("#syncStatusPercent");
  const fill = document.querySelector("#syncProgressFill");
  const track = document.querySelector(".sync-progress-track");
  const syncButton = document.querySelector(".sync-button");
  const syncHint = document.querySelector(".sync-progress-hint");
  const endpoint = "https://api.github.com/repos/marzlo/Personal/actions/workflows/sync-notion.yml/runs?per_page=1";
  if (!label || !percent || !fill || !track) return;

  const workerUrl = window.SYNC_WORKER_URL;
  const syncResult = new URLSearchParams(window.location.search).get("sync");
  const syncStage = new URLSearchParams(window.location.search).get("stage");
  if (syncButton && workerUrl) {
    syncButton.href = `${workerUrl.replace(/\/$/, "")}/sync`;
    syncButton.removeAttribute("target");
    syncButton.removeAttribute("rel");
    syncButton.title = "驗證 GitHub 帳號後直接啟動 Notion 同步";
  }
  if (syncHint) {
    if (!workerUrl) syncHint.textContent = "自動更新入口部署完成後，按鈕會直接啟動同步。";
    else if (syncResult === "started") syncHint.textContent = "已送出同步，進度會在上方自動更新。";
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
      syncHint.textContent = stageHints[syncStage] || "無法啟動同步，請查看 Cloudflare Worker 記錄。";
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
      const response = await fetch(endpoint, { headers: { Accept: "application/vnd.github+json" } });
      if (!response.ok) throw new Error("GitHub status unavailable");
      const runs = (await response.json()).workflow_runs || [];
      const run = runs[0];
      if (!run) {
        show("尚未執行過同步");
        return false;
      }
      if (run.status === "completed") {
        show(run.conclusion === "success" ? "最近一次同步成功" : run.conclusion === "cancelled" ? "最近一次同步已取消" : "最近一次同步失敗", 100);
        return false;
      }

      if (run.status === "queued") {
        show("同步排隊中", 3, true);
        return true;
      }

      let value = 8;
      let text = "同步進行中";
      try {
        const jobsResponse = await fetch(run.jobs_url, { headers: { Accept: "application/vnd.github+json" } });
        if (jobsResponse.ok) {
          const jobs = (await jobsResponse.json()).jobs || [];
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
      return false;
    }
  }

  async function poll() {
    if (await update()) window.setTimeout(poll, 8000);
  }

  poll();
})();
