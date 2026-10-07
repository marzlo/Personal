import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function setup(exp, responseStatus = 200) {
  const nodes = new Map();
  const node = selector => {
    if (!nodes.has(selector)) nodes.set(selector, { textContent: '', hidden: true });
    return nodes.get(selector);
  };
  const saved = new Map(); let requests = 0;
  const storage = { getItem: k => saved.get(k) ?? null, setItem: (k, v) => saved.set(k, v), removeItem: k => saved.delete(k) };
  const token = exp === null ? '' : Buffer.from(JSON.stringify({ exp })).toString('base64url') + '.signature';
  storage.setItem('shiyeNotesSession', token);
  const context = { CustomEvent: class { constructor(type,options){this.type=type;this.detail=options?.detail;} }, window: { dispatchEvent(event){context.lastEvent=event;}, addEventListener() {}, SYNC_WORKER_URL: 'https://worker.test' }, document: { hidden: false, activeElement: null, querySelectorAll: () => [] }, localStorage: storage, sessionStorage: storage, Date, JSON, URL, atob, setTimeout: () => 0, clearTimeout() {}, fetch: async () => { requests++; return { status: responseStatus, ok: responseStatus === 200, json: async () => ({ revision: 0, data: null }) }; } };
  const source = fs.readFileSync(new URL('../notes-sync.js', import.meta.url), 'utf8').replace("window.addEventListener('DOMContentLoaded', boot, { once: true });", `window.test = { requireLogin, synchronize, api, edit: () => { lastEditAt = Date.now(); }, init: (value, element) => { token = value; panel = element; reminder = element; }, };`);
  vm.runInNewContext(source, context);
  const reminder = { hidden: true, querySelector: node };
  context.window.test.init(token, reminder);
  return { api: context.window.test, node, reminder, saved, context, requests: () => requests };
}
test('editing after expiry reminds to log in and removes the unusable session', () => {
  const fixture = setup(Date.now() / 1000 - 10);
  assert.equal(fixture.api.requireLogin(), true);
  assert.equal(fixture.reminder.hidden, false);
  assert.match(fixture.node('[data-login-reminder-text]').textContent, /登入已失效/);
  assert.equal(fixture.saved.has('shiyeNotesSession'), false);
});
test('new tab without a session gets a reminder; valid sessions do not', () => {
  const missing = setup(null);
  assert.equal(missing.api.requireLogin(), true);
  assert.match(missing.node('[data-login-reminder-text]').textContent, /請登入 GitHub/);
  const valid = setup(Date.now() / 1000 + 3600);
  assert.equal(valid.api.requireLogin(), false);
  assert.equal(valid.reminder.hidden, true);
});
test('saved local edits survive expired-session checks without network upload', async () => {
  const fixture = setup(Date.now() / 1000 - 10);
  fixture.context.window.ShiyeNotes.write('shiyeSeriesStudy', { test: { content: '保留這份筆記' } });
  await fixture.api.synchronize();
  assert.match(fixture.saved.get('shiyeSeriesStudy'), /保留這份筆記/);
  assert.equal(fixture.requests(), 0);
  assert.equal(fixture.reminder.hidden, false);
});
test('server-rejected session prompts a recent editor, even before local expiry', async () => {
  const fixture = setup(Date.now() / 1000 + 3600, 401);
  fixture.api.edit();
  await assert.rejects(fixture.api.api('GET'), /登入已過期/);
  assert.equal(fixture.reminder.hidden, false);
  assert.equal(fixture.saved.has('shiyeNotesSession'), false);
});

test('public loading does not replace local notes or sync baseline', async () => {
 const fixture=setup(null);
 fixture.saved.set('shiyeIdeas',JSON.stringify([{title:'保留本機'}]));
 const before=[...fixture.saved];
 await fixture.api.synchronize();
 assert.deepEqual([...fixture.saved],before);
 assert.equal(fixture.context.lastEvent.detail.public,true);
 assert.equal(fixture.context.lastEvent.detail.data.shiyeIdeas,null);
 fixture.context.window.ShiyeNotes.write('shiyeIdeas',[]);
 assert.deepEqual([...fixture.saved],before);
 await fixture.api.synchronize();
 assert.equal(fixture.requests(),2);
});
