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
    else if (syncResult === "error") syncHint.textContent = "無法啟動同步，請稍後再試或查看 GitHub Actions。";
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
