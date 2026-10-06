import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import test from 'node:test';

const source = await fs.readFile(new URL('../worker/index.js', import.meta.url), 'utf8');
const worker = await import('data:text/javascript;base64,' + Buffer.from(source + '\nexport {createNotesSession, validNotesSession};').toString('base64'));
const data = { shiyeIdeas: [], shiyeArticleTags: {}, shiyeSeriesStudy: {}, shiyeSeriesConfigs: [{ name: '唯識真義', key: 'weishi', terms: ['轉識成智'] }] };
const secret = 'test-only-secret';
const token = await worker.createNotesSession(secret);

class MemoryStorage {
  values = new Map();
  queue = Promise.resolve();
  async get(key) { return structuredClone(this.values.get(key)); }
  async put(key, value) { this.values.set(key, structuredClone(value)); }
  async delete(key) { this.values.delete(key); }
  transaction(fn) { const next = this.queue.then(() => fn(this)); this.queue = next.catch(() => {}); return next; }
}
function fixture() {
  const storage = new MemoryStorage();
  const store = new worker.NotesStore({ storage });
  const env = { GITHUB_CLIENT_SECRET: secret, NOTES_STORE: { idFromName: name => name, get: () => store } };
  return { env, storage };
}
function request(method, body, auth = token, origin = 'https://marzlo.github.io') {
  return new Request('https://worker.test/api/notes', { method, headers: { Origin: origin, Authorization: 'Bearer ' + auth, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
}
test('private access, signature tampering, wrong origin and missing binding', async () => {
  const { env } = fixture();
  assert.equal(await worker.validNotesSession(token, secret), true);
  assert.equal(await worker.validNotesSession(token, 'different'), false);
  assert.equal((await worker.default.fetch(request('GET', null, token + 'x'), env)).status, 401);
  assert.equal((await worker.default.fetch(request('GET', null, token, 'https://other.test'), env)).status, 403);
  assert.equal((await worker.default.fetch(request('GET', null), { GITHUB_CLIENT_SECRET: secret })).status, 503);
  const preflight = await worker.default.fetch(request('OPTIONS', null, ''), env);
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), 'https://marzlo.github.io');
});
test('initial desktop snapshot preserves deleted terms on other devices', async () => {
  const { env } = fixture();
  assert.deepEqual(await (await worker.default.fetch(request('GET'), env)).json(), { revision: 0, data: null });
  const saved = await (await worker.default.fetch(request('PUT', { revision: 0, data }), env)).json();
  assert.equal(saved.revision, 1);
  const phone = await (await worker.default.fetch(request('GET'), env)).json();
  assert.deepEqual(phone.data.shiyeSeriesConfigs[0].terms, ['轉識成智']);
});
test('simultaneous writers cannot overwrite each other; previous revision backed up', async () => {
  const { env, storage } = fixture();
  await worker.default.fetch(request('PUT', { revision: 0, data }), env);
  const changed = structuredClone(data); changed.shiyeSeriesConfigs[0].terms = [];
  const replies = await Promise.all([worker.default.fetch(request('PUT', { revision: 1, data: changed }), env), worker.default.fetch(request('PUT', { revision: 1, data }), env)]);
  assert.deepEqual(replies.map(r => r.status).sort(), [200, 409]);
  const remote = await (await worker.default.fetch(request('GET'), env)).json();
  assert.equal(remote.revision, 2);
  assert.deepEqual((await storage.get('backup-1')).data, data);
});
test('invalid payloads and oversized bodies leave the saved snapshot intact', async () => {
  const { env } = fixture();
  assert.equal((await worker.default.fetch(request('PUT', { revision: 0, data: {} }), env)).status, 400);
  const huge = { ...data, shiyeSeriesStudy: { test: 'x'.repeat(1000001) } };
  assert.equal((await worker.default.fetch(request('PUT', { revision: 0, data: huge }), env)).status, 413);
  assert.equal((await worker.default.fetch(request('GET'), env)).status, 200);
});
test('notes login preserves normal sync entry and protects callback state', async () => {
  const env = { GITHUB_CLIENT_ID: 'test-client', GITHUB_CLIENT_SECRET: secret, GITHUB_ACTIONS_TOKEN: 'test-pat' };
  const login = await worker.default.fetch(new Request('https://worker.test/login'), env);
  assert.equal(login.status, 302); assert.match(login.headers.get('Set-Cookie'), /:notes;/);
  const sync = await worker.default.fetch(new Request('https://worker.test/sync'), env);
  assert.doesNotMatch(sync.headers.get('Set-Cookie'), /:notes;/);
  const callback = await worker.default.fetch(new Request('https://worker.test/auth/callback?state=wrong&code=test'), env);
  assert.match(callback.headers.get('Location'), /stage=state/);
});
