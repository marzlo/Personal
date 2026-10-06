(() => {
  const keys = ['shiyeIdeas', 'shiyeArticleTags', 'shiyeSeriesStudy', 'shiyeSeriesConfigs'];
  const metaKey = 'shiyeNotesSyncBase';
  const backupKey = 'shiyeNotesBackup';
  const tokenKey = 'shiyeNotesSession';
  let applying = false, busy = false, timer, base = null, token = '', conflict = null, panel;
  const copy = value => JSON.parse(JSON.stringify(value));
  const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  function snapshot() {
    return Object.fromEntries(keys.map(key => {
      const raw = localStorage.getItem(key);
      // Invalid saved data must not be silently replaced with empty cloud data.
      return [key, raw === null ? null : JSON.parse(raw)];
    }));
  }
  function backup(reason) {
    const entry = { reason, savedAt: new Date().toISOString(), data: snapshot() };
    const previous = JSON.parse(localStorage.getItem(backupKey) || '[]');
    localStorage.setItem(backupKey, JSON.stringify([...previous.slice(-9), entry]));
  }
  function remember(remote) {
    localStorage.setItem(metaKey, JSON.stringify(remote));
    base = copy(remote);
  }
  function apply(remote) {
    backup('載入共用資料前的本機版本');
    applying = true;
    try {
      for (const key of keys) {
        if (remote.data[key] === null) localStorage.removeItem(key);
        else localStorage.setItem(key, JSON.stringify(remote.data[key]));
      }
      remember(remote);
      window.dispatchEvent(new CustomEvent('shiye:notes-loaded'));
    } finally { applying = false; }
  }
  window.ShiyeNotes = {
    write(key, value) {
      const text = JSON.stringify(value);
      const changed = localStorage.getItem(key) !== text;
      localStorage.setItem(key, text);
      if (changed && !applying) {
        if (panel) status(token ? '已儲存在本機，正在同步…' : '已儲存在本機；登入後可同步到另一台裝置。');
        clearTimeout(timer); timer = setTimeout(synchronize, 900);
      }
    }
  };
  function status(text) { panel.querySelector('[data-notes-status]').textContent = text; }
  function editing() {
    return document.activeElement?.matches('input,textarea,select') || [...document.querySelectorAll('#ideaSettings,#timelineForm,#studyEditor,#studySeriesForm,#studyTermForm,#articleTagDialog[open]')].some(form => !form.hidden && form.getClientRects().length);
  }
  async function api(method, body) {
    const response = await fetch(window.SYNC_WORKER_URL.replace(/\/$/, '') + '/api/notes', {
      method, cache: 'no-store', headers: { Authorization: 'Bearer ' + token, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    if (response.status === 401) {
      token = ''; sessionStorage.removeItem(tokenKey);
      panel.querySelector('[data-notes-login]').hidden = false;
      throw new Error('登入已過期，請重新登入 GitHub。');
    }
    if (response.status === 503 || response.status === 404) throw new Error('共用整理服務尚未連線，本機內容仍已保留。');
    const result = await response.json();
    if (response.status === 409) return { conflict: result };
    if (!response.ok) throw new Error(response.status === 413 ? '整理資料超過同步容量（約 120 KB），請先匯出備份。' : '同步未完成，本機內容仍已保留。');
    return result;
  }
  function showConflict(remote) {
    conflict = remote;
    backup('版本衝突時的本機版本');
    status('另一台裝置也有修改。請選擇共用版本，或保留這台版本；兩個版本都會先備份。');
    panel.querySelector('[data-notes-conflict]').hidden = false;
  }
  async function save(revision) {
    const outgoing = snapshot();
    const result = await api('PUT', { revision, data: outgoing });
    if (result.conflict) { showConflict(result.conflict); return; }
    remember(result);
    status(equal(outgoing, snapshot()) ? '共用整理已同步 · ' + new Date(result.updatedAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) : '已儲存在本機，正在同步…');
  }
  async function synchronize() {
    if (!panel || !token || !window.SYNC_WORKER_URL || busy || conflict || document.hidden) return;
    busy = true;
    try {
      const remote = await api('GET');
      const local = snapshot();
      if (!remote.data) {
        status('尚未建立共用整理。請先在電腦按「以這台建立共用資料」，再讓手機登入。');
        panel.querySelector('[data-notes-initialize]').hidden = false;
        return;
      }
      panel.querySelector('[data-notes-initialize]').hidden = true;
      if (!base) {
        if (editing()) { status('共用資料已就緒；請先儲存或關閉編輯，再載入。'); return; }
        // First-time devices adopt the chosen desktop snapshot, retaining their own backup.
        apply(remote);
        status('已載入共用整理；此裝置原有內容已備份。');
      } else if (equal(local, remote.data)) {
        remember(remote); status('共用整理已同步');
      } else {
        const localChanged = !equal(local, base.data);
        const remoteChanged = remote.revision !== base.revision;
        if (localChanged && remoteChanged) showConflict(remote);
        else if (localChanged) await save(remote.revision);
        else if (editing()) status('另一台裝置有更新；請先儲存或關閉編輯，再載入。');
        else { apply(remote); status('已載入另一台裝置的最新整理'); }
      }
    } catch (error) { status(error.message || '無法連線，本機整理仍已保留。'); }
    finally { busy = false; }
  }
  function downloadBackup() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ savedAt: new Date().toISOString(), current: snapshot(), backups: JSON.parse(localStorage.getItem(backupKey) || '[]') }, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = '拾頁整理備份.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function boot() {
    panel = document.createElement('section'); panel.className = 'notes-sync-panel'; panel.setAttribute('aria-label', '跨裝置整理同步');
    panel.innerHTML = `<div><strong>共用我的整理</strong><p data-notes-status aria-live="polite">登入 GitHub 後，手機與電腦共用名詞、筆記與觀念。</p></div><div class="notes-sync-actions"><a data-notes-login class="primary">登入 GitHub</a><button type="button" data-notes-now>同步整理</button><button type="button" data-notes-backup>匯出備份</button><button type="button" data-notes-initialize hidden>以這台建立共用資料</button></div><div data-notes-conflict hidden><button type="button" data-notes-use-remote>載入共用版本</button><button type="button" data-notes-use-local>以這台版本更新共用資料</button></div>`;
    document.querySelector('.sync-topbar').before(panel);
    panel.querySelector('[data-notes-login]').href = (window.SYNC_WORKER_URL || '').replace(/\/$/, '') + '/login';
    panel.querySelector('[data-notes-now]').onclick = synchronize;
    panel.querySelector('[data-notes-backup]').onclick = () => { try { downloadBackup(); } catch { status('無法匯出，請保留此瀏覽器資料。'); } };
    panel.querySelector('[data-notes-initialize]').onclick = async () => {
      if (busy || !token) return;
      if (!confirm('以這台裝置目前的整理建立共用資料？請先在電腦執行，再到手機登入。')) return;
      busy = true;
      try { backup('建立共用資料前'); await save(0); if (!conflict) panel.querySelector('[data-notes-initialize]').hidden = true; }
      catch (error) { status(error.message); } finally { busy = false; }
    };
    panel.querySelector('[data-notes-use-remote]').onclick = () => {
      if (!conflict || busy) return;
      if (editing()) { status('請先儲存或關閉目前的編輯。'); return; }
      try { apply(conflict); conflict = null; panel.querySelector('[data-notes-conflict]').hidden = true; status('已載入共用版本；這台原有整理可從備份找回。'); }
      catch (error) { status(error.message); }
    };
    panel.querySelector('[data-notes-use-local]').onclick = async () => {
      if (!conflict || busy || !confirm('以這台已儲存的整理更新共用資料？共用舊版本也會備份。')) return;
      const revision = conflict.revision; conflict = null; busy = true;
      panel.querySelector('[data-notes-conflict]').hidden = true;
      try { await save(revision); } catch (error) { status(error.message); } finally { busy = false; }
    };
    try {
      base = JSON.parse(localStorage.getItem(metaKey) || 'null');
      if (!base?.data || !Number.isSafeInteger(base.revision)) base = null;
      const fragment = new URLSearchParams(location.hash.slice(1));
      const session = fragment.get('notes_session');
      // Remove the session from the URL before any further interaction.
      if (session) { history.replaceState(null, '', location.pathname + location.search); sessionStorage.setItem(tokenKey, session); }
      token = sessionStorage.getItem(tokenKey) || '';
      panel.querySelector('[data-notes-login]').hidden = !!token;
      synchronize();
    } catch { status('無法讀取整理儲存空間，請保留現有瀏覽器資料。'); }
    setInterval(synchronize, 15000);
    window.addEventListener('online', synchronize);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) synchronize(); });
    window.addEventListener('beforeunload', event => {
      if (token && base && !equal(snapshot(), base.data)) { event.preventDefault(); event.returnValue = ''; }
    });
  }
  window.addEventListener('DOMContentLoaded', boot, { once: true });
})();
