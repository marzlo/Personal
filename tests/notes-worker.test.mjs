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

test('public visitors read latest snapshot but cannot write or read backups', async () => {
  const { env, storage } = fixture();
  const publicRequest = method => new Request('https://worker.test/api/public-notes', { method });
  assert.deepEqual(await (await worker.default.fetch(publicRequest('GET'), env)).json(), { revision: 0, data: null });
  await worker.default.fetch(request('PUT', { revision: 0, data }), env);
  const changed = structuredClone(data); changed.shiyeIdeas = [{title:'公開想法',timeline:[]}];
  await worker.default.fetch(request('PUT', { revision: 1, data: changed }), env);
  const response = await worker.default.fetch(publicRequest('GET'), env);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), '*');
  const published = await response.json();
  assert.equal(published.revision, 2);
  assert.deepEqual(published.data, changed);
  assert.deepEqual(Object.keys(published).sort(), ['data','revision','updatedAt']);
  assert.equal((await worker.default.fetch(publicRequest('PUT'), env)).status, 405);
  assert.equal((await worker.default.fetch(request('PUT', {revision:2,data}, ''), env)).status,401);
  assert.deepEqual((await storage.get('backup-1')).data, data);
});

test('remembered owner session lasts 180 days and valid older sessions renew automatically', async () => {
  const payload = JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString());
  assert.ok(payload.exp > Date.now()/1000 + 179*86400);
  const shortPayload = Buffer.from(JSON.stringify({...payload,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode('shiye-notes-session:'+secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const signature = Buffer.from(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(shortPayload))).toString('base64url');
  const {env}=fixture();
  const response=await worker.default.fetch(request('GET',null,shortPayload+'.'+signature),env);
  const renewed=response.headers.get('X-Notes-Session');
  assert.equal(await worker.validNotesSession(renewed,secret),true);
  assert.ok(JSON.parse(Buffer.from(renewed.split('.')[0],'base64url')).exp > Date.now()/1000+179*86400);
  assert.equal(response.headers.get('Access-Control-Expose-Headers'),'X-Notes-Session');
  assert.equal((await worker.default.fetch(request('GET'),env)).headers.get('X-Notes-Session'),null);
  assert.equal((await worker.default.fetch(request('GET',null,'invalid'),env)).headers.get('X-Notes-Session'),null);
});

test('sync status uses authenticated server requests and shares cached sanitized output', async()=>{
 const previousFetch=globalThis.fetch,previousCache=globalThis.caches;const values=new Map();let calls=0;
 globalThis.caches={default:{match:async key=>values.get(key.url)?.clone(),put:async(key,value)=>values.set(key.url,value)}};
 globalThis.fetch=async(url,options)=>{calls++;assert.equal(options.headers.Authorization,'Bearer server-secret');return new Response(JSON.stringify({workflow_runs:[{id:123,status:'completed',conclusion:'success',html_url:'https://github.com/marzlo/Personal/actions/runs/123',private_field:'omit'}]}));};
 try{const req=new Request('https://worker.test/api/sync-status');const r=await worker.default.fetch(req,{GITHUB_ACTIONS_TOKEN:'server-secret'});assert.equal(r.status,200);const body=await r.json();assert.equal(body.workflow_runs[0].private_field,undefined);assert.equal(JSON.stringify(body).includes('server-secret'),false);await worker.default.fetch(req,{});assert.equal(calls,1);assert.equal(r.headers.get('Access-Control-Allow-Origin'),'*');}
 finally{globalThis.fetch=previousFetch;globalThis.caches=previousCache;}
});
