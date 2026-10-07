(() => {
  const keys = ['shiyeIdeas', 'shiyeArticleTags', 'shiyeSeriesStudy', 'shiyeSeriesConfigs'];
  const metaKey = 'shiyeNotesSyncBase';
  const backupKey = 'shiyeNotesBackup';
  const tokenKey = 'shiyeNotesSession';
  let applying = false, busy = false, timer, base = null, token = '', conflict = null, panel;
  let reminder, loginExpired = false, lastEditAt = 0;
  let publicRevision = -1;
  function visitor() { return !token && !base && !loginExpired; }
  async function loadPublic() {
    if (busy || !window.SYNC_WORKER_URL || document.hidden) return;
    busy = true;
    try {
      const response = await fetch(window.SYNC_WORKER_URL.replace(/\/$/, '') + '/api/public-notes', { cache: 'no-store' });
      if (!response.ok) throw new Error('公開整理暫時無法載入，請稍後重新整理。');
      const remote = await response.json();
      if (!visitor()) return;
      if (remote.revision !== publicRevision) {
        // Display in memory only; never replace a visitor's existing local notes.
        const data = remote.data || Object.fromEntries(keys.map(key => [key, null]));
        window.dispatchEvent(new CustomEvent('shiye:notes-loaded', { detail: { data, public: true } }));
        publicRevision = remote.revision;
      }
      status(remote.data ? '公開整理已更新；訪客可直接閱讀。' : '尚未發布整理。');
    } catch (error) { status(error.message); }
    finally { busy = false; }
  }
  function sessionValid() {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[0].replaceAll('-', '+').replaceAll('_', '/')));
      return Number.isFinite(payload.exp) && payload.exp > Date.now() / 1000;
    } catch { return false; }
  }
  function invalidateSession() {
    loginExpired = true;
    token = '';
    try { sessionStorage.removeItem(tokenKey); } catch {}
    if (panel) panel.querySelector('[data-notes-login]').hidden = false;
  }
  function requireLogin() {
    if (token && !sessionValid()) invalidateSession();
    if (token) return false;
    if (reminder) {
      reminder.hidden = false;
      reminder.querySelector('[data-login-reminder-text]').textContent = (loginExpired || base ? '登入已失效，請重新登入 GitHub 才能同步到另一台裝置。' : '請登入 GitHub，讓這次整理同步到另一台裝置。') + ' 請先儲存目前編輯；已儲存的內容會保留在本機。';
    }
    return true;
  }
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
      if (panel && visitor()) return;
      const text = JSON.stringify(value);
      const changed = localStorage.getItem(key) !== text;
      localStorage.setItem(key, text);
      if (changed && !applying) {
        if (panel) requireLogin();
        if (panel) status(token ? '已儲存在本機，正在同步…' : '已儲存在本機；登入後可同步到另一台裝置。');
        clearTimeout(timer); timer = setTimeout(synchronize, 900);
      }
    }
  };
  function status(text) { panel.querySelector('[data-notes-status]').textContent = text; }
  function editing() {
    return document.activeElement?.matches('input,textarea,select') || [...document.querySelectorAll('#newConceptForm,#ideaSettings,#timelineForm,#studyEditor,#studySeriesForm,#studyTermForm,#articleTagDialog[open],#concepts textarea,#concepts input:not([type="hidden"])')].some(form => !form.hidden && form.getClientRects().length);
  }
  async function api(method, body) {
    const response = await fetch(window.SYNC_WORKER_URL.replace(/\/$/, '') + '/api/notes', {
      method, cache: 'no-store', headers: { Authorization: 'Bearer ' + token, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    if (response.status === 401) {
      invalidateSession();
      if (editing() || Date.now() - lastEditAt < 120000) requireLogin();
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
    if (token && !sessionValid()) {
      invalidateSession();
      if (panel) status('登入已過期，請重新登入 GitHub。');
      if (editing() || Date.now() - lastEditAt < 120000) requireLogin();
    }
    if (panel && visitor()) return loadPublic();
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
    panel.innerHTML = `<div><strong>共用我的整理</strong><p data-notes-status aria-live="polite">登入 GitHub 後，手機與電腦共用名詞、筆記與觀念。</p></div><div class="notes-sync-actions"><a data-notes-login class="primary">登入 GitHub</a><button type="button" data-notes-initialize hidden>以這台建立共用資料</button><details class="notes-sync-more"><summary>更多</summary><div><button type="button" data-notes-now>同步整理</button><button type="button" data-notes-backup>匯出備份</button></div></details></div><div data-notes-conflict hidden><button type="button" data-notes-use-remote>載入共用版本</button><button type="button" data-notes-use-local>以這台版本更新共用資料</button></div>`;
    document.querySelector('.sync-topbar').before(panel);
    reminder = document.createElement('aside');
    reminder.className = 'notes-login-reminder';
    reminder.hidden = true;
    reminder.setAttribute('aria-label', '整理同步登入提醒');
    reminder.innerHTML = '<p data-login-reminder-text role="status"></p><a data-notes-login class="primary">重新登入 GitHub</a><button type="button" data-reminder-dismiss aria-label="暫時關閉登入提醒">×</button>';
    document.body.append(reminder);
    reminder.querySelector('[data-reminder-dismiss]').onclick = () => { reminder.hidden = true; };
    document.querySelectorAll('[data-notes-login]').forEach(link => {
      link.href = (window.SYNC_WORKER_URL || '').replace(/\/$/, '') + '/login';
      link.addEventListener('click', event => {
        if (editing()) {
          event.preventDefault();
          requireLogin();
          reminder.querySelector('[data-login-reminder-text]').textContent = '請先儲存或關閉目前的編輯，再按重新登入；避免離開頁面時遺失尚未儲存的內容。';
        }
      });
    });
    const editActions = '#focusNewConcept,#addConcept,#openSettings,#openTimeline,#deleteIdea,#manageArticleTags,#studyEdit,#studyAddSeries,#studyDeleteSeries,#studyAddTerm,#studyDeleteTerm,#studyAddArticle,.idea-field-action,.concept-delete,.study-unlink,[data-remove],[data-link]';
    document.addEventListener('click', event => {
      if (event.target.closest?.(editActions)) { lastEditAt = Date.now(); requireLogin(); }
    }, true);
    document.addEventListener('input', event => {
      if (event.target.closest?.('#concepts,#seriesStudy,#articleTagDialog') && event.target.matches('input:not([type="search"]),textarea,select')) {
        lastEditAt = Date.now(); requireLogin();
      }
    });
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
      document.body.classList.toggle('notes-visitor', visitor());
      if (visitor()) {
        window.dispatchEvent(new CustomEvent('shiye:notes-loaded', { detail: { public: true, data: Object.fromEntries(keys.map(key => [key, null])) } }));
        status('正在載入公開整理…');
      }
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
