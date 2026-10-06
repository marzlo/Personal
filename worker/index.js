const DASHBOARD_URL = "https://marzlo.github.io/Personal/";
const ALLOWED_GITHUB_LOGIN = "marzlo";
const REPOSITORY = "marzlo/Personal";
const WORKFLOW_FILE = "sync-notion.yml";
const WORKFLOW_URL = `https://api.github.com/repos/${REPOSITORY}/actions/workflows/${WORKFLOW_FILE}`;
const NOTES_KEYS = ['shiyeIdeas', 'shiyeArticleTags', 'shiyeSeriesStudy', 'shiyeSeriesConfigs'];
const DASHBOARD_ORIGIN = new URL(DASHBOARD_URL).origin;

function jsonResponse(value, status = 200, headers = {}) {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers } });
}
function encodeUrl64(bytes) {
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}
function decodeUrl64(text) {
  return Uint8Array.from(atob(text.replaceAll('-', '+').replaceAll('_', '/')), c => c.charCodeAt(0));
}
async function notesSessionKey(secret) {
  return crypto.subtle.importKey('raw', new TextEncoder().encode('shiye-notes-session:' + secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
async function createNotesSession(secret) {
  const payload = encodeUrl64(new TextEncoder().encode(JSON.stringify({ sub: ALLOWED_GITHUB_LOGIN, scope: 'private-notes', exp: Math.floor(Date.now() / 1000) + 7 * 86400 })));
  const signature = await crypto.subtle.sign('HMAC', await notesSessionKey(secret), new TextEncoder().encode(payload));
  return payload + '.' + encodeUrl64(new Uint8Array(signature));
}
async function validNotesSession(token, secret) {
  try {
    if (!secret || token.length > 2048) return false;
    const parts = token.split('.');
    if (parts.length !== 2 || !await crypto.subtle.verify('HMAC', await notesSessionKey(secret), decodeUrl64(parts[1]), new TextEncoder().encode(parts[0]))) return false;
    const payload = JSON.parse(new TextDecoder().decode(decodeUrl64(parts[0])));
    return payload.sub === ALLOWED_GITHUB_LOGIN && payload.scope === 'private-notes' && payload.exp > Date.now() / 1000;
  } catch { return false; }
}
function validNotes(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).length !== NOTES_KEYS.length) return false;
  return NOTES_KEYS.every(key => Object.hasOwn(data, key) && (data[key] === null || (['shiyeIdeas', 'shiyeSeriesConfigs'].includes(key) ? Array.isArray(data[key]) : typeof data[key] === 'object' && !Array.isArray(data[key]))));
}
async function notesApi(request, env) {
  const origin = request.headers.get('Origin');
  const cors = { 'Access-Control-Allow-Origin': DASHBOARD_ORIGIN, 'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS', 'Access-Control-Allow-Headers': 'Authorization, Content-Type', Vary: 'Origin' };
  if (origin && origin !== DASHBOARD_ORIGIN) return jsonResponse({ error: 'origin' }, 403);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (!['GET', 'PUT'].includes(request.method)) return jsonResponse({ error: 'method' }, 405, cors);
  if (!await validNotesSession((request.headers.get('Authorization') || '').replace(/^Bearer /, ''), env.GITHUB_CLIENT_SECRET)) return jsonResponse({ error: 'unauthorized' }, 401, cors);
  if (!env.NOTES_STORE) return jsonResponse({ error: 'not_configured' }, 503, cors);
  try {
    let body;
    if (request.method === 'PUT') {
      if (!request.headers.get('Content-Type')?.startsWith('application/json')) return jsonResponse({ error: 'content_type' }, 415, cors);
      // Limit the streamed request before parsing it.
      const reader = request.body?.getReader();
      if (!reader) return jsonResponse({ error: 'body' }, 400, cors);
      let bytes = 0; const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > 120000) { await reader.cancel(); return jsonResponse({ error: 'too_large' }, 413, cors); }
        chunks.push(value);
      }
      const combined = new Uint8Array(bytes); let offset = 0;
      for (const chunk of chunks) { combined.set(chunk, offset); offset += chunk.length; }
      body = JSON.parse(new TextDecoder().decode(combined));
      if (!Number.isSafeInteger(body.revision) || body.revision < 0 || !validNotes(body.data)) return jsonResponse({ error: 'invalid_data' }, 400, cors);
    }
    const store = env.NOTES_STORE.get(env.NOTES_STORE.idFromName(ALLOWED_GITHUB_LOGIN));
    const result = await store.fetch(new Request('https://notes.internal/', { method: request.method, ...(body ? { body: JSON.stringify(body) } : {}) }));
    return new Response(result.body, { status: result.status, headers: { ...Object.fromEntries(result.headers), ...cors } });
  } catch { return jsonResponse({ error: 'unavailable' }, 503, cors); }
}

// Atomic revision checks prevent two devices from silently overwriting each other.
export class NotesStore {
  constructor(ctx) { this.storage = ctx.storage; }
  async fetch(request) {
    if (request.method === 'GET') return jsonResponse(await this.storage.get('current') || { revision: 0, data: null });
    if (request.method !== 'PUT') return jsonResponse({ error: 'method' }, 405);
    const incoming = await request.json();
    if (!Number.isSafeInteger(incoming.revision) || !validNotes(incoming.data)) return jsonResponse({ error: 'invalid_data' }, 400);
    return this.storage.transaction(async txn => {
      const current = await txn.get('current') || { revision: 0, data: null };
      if (incoming.revision !== current.revision) return jsonResponse(current, 409);
      if (current.data) await txn.put('backup-' + current.revision, current);
      const next = { revision: current.revision + 1, updatedAt: new Date().toISOString(), data: incoming.data };
      await txn.put('current', next);
      if (current.revision > 20) await txn.delete('backup-' + (current.revision - 20));
      return jsonResponse(next);
    });
  }
}

function githubHeaders(token) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "Personal-Notion-Dashboard",
  };
}

function response(body, status = 200, headers = {}) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });
}

function redirect(url, headers = {}) {
  return new Response(null, { status: 302, headers: { Location: url, "Cache-Control": "no-store", ...headers } });
}

function randomState() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, value => value.toString(16).padStart(2, "0")).join("");
}

function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  const part = cookie.split(";").map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  return part ? part.slice(name.length + 1) : "";
}

function dashboardResult(result, stage = "") {
  const url = new URL(DASHBOARD_URL);
  url.searchParams.set("sync", result);
  if (stage) url.searchParams.set("stage", stage);
  return redirect(url.toString());
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/notes") return notesApi(request, env);
    if (request.method !== "GET") return response("Method not allowed", 405, { Allow: "GET" });

    if (url.pathname === "/sync" || url.pathname === "/login") {
      if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.GITHUB_ACTIONS_TOKEN) {
        return dashboardResult("error", "configuration");
      }
      const state = randomState();
      const callback = `${url.origin}/auth/callback`;
      const authorize = new URL("https://github.com/login/oauth/authorize");
      authorize.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
      authorize.searchParams.set("redirect_uri", callback);
      authorize.searchParams.set("scope", "read:user");
      authorize.searchParams.set("state", state);
      authorize.searchParams.set("allow_signup", "false");
      return redirect(authorize.toString(), {
        "Set-Cookie": `sync_oauth_state=${state}${url.pathname === "/login" ? ":notes" : ""}; Path=/auth/callback; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
      });
    }

    if (url.pathname === "/auth/callback") {
      const clearCookie = "sync_oauth_state=; Path=/auth/callback; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
      const state = url.searchParams.get("state") || "";
      const stateCookie = getCookie(request, "sync_oauth_state");
      const notesLogin = stateCookie.endsWith(":notes");
      const expectedState = stateCookie.split(":")[0];
      if (!state || !expectedState || state !== expectedState) {
        return dashboardResult("error", "state");
      }
      if (url.searchParams.has("error")) return redirect(`${DASHBOARD_URL}?sync=error&stage=oauth`, { "Set-Cookie": clearCookie });
      const code = url.searchParams.get("code");
      if (!code) return redirect(`${DASHBOARD_URL}?sync=error&stage=code`, { "Set-Cookie": clearCookie });

      let stage = "token_exchange";
      try {
        const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code, redirect_uri: `${url.origin}/auth/callback` }),
        });
        if (!tokenResponse.ok) throw new Error(`OAuth token exchange returned ${tokenResponse.status}`);
        const tokenData = await tokenResponse.json();
        if (!tokenData.access_token) throw new Error("OAuth returned no access token");

        stage = "verify_user";
        const userResponse = await fetch("https://api.github.com/user", { headers: githubHeaders(tokenData.access_token) });
        if (!userResponse.ok) throw new Error("Could not verify GitHub user");
        const user = await userResponse.json();
        if (user.login !== ALLOWED_GITHUB_LOGIN) return redirect(`${DASHBOARD_URL}?sync=unauthorized`, { "Set-Cookie": clearCookie });
        if (notesLogin) {
          const session = await createNotesSession(env.GITHUB_CLIENT_SECRET);
          return redirect(`${DASHBOARD_URL}#notes_session=${session}`, { "Set-Cookie": clearCookie, "Referrer-Policy": "no-referrer" });
        }

        stage = "pat_identity";
        const patResponse = await fetch("https://api.github.com/user", { headers: githubHeaders(env.GITHUB_ACTIONS_TOKEN) });
        if (!patResponse.ok) throw new Error(`GitHub Actions token identity check returned ${patResponse.status}`);
        const patUser = await patResponse.json();
        if (patUser.login !== ALLOWED_GITHUB_LOGIN) throw new Error("GitHub Actions token belongs to a different account");

        stage = "workflow_lookup";
        const workflowResponse = await fetch(WORKFLOW_URL, { headers: githubHeaders(env.GITHUB_ACTIONS_TOKEN) });
        if (!workflowResponse.ok) throw new Error(`Workflow lookup returned ${workflowResponse.status}`);
        const workflow = await workflowResponse.json();
        if (workflow.state !== "active") throw new Error(`Workflow state is ${workflow.state}`);

        stage = "dispatch";
        const dispatchResponse = await fetch(`https://api.github.com/repos/${REPOSITORY}/actions/workflows/${workflow.id}/dispatches`, {
          method: "POST",
          headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${env.GITHUB_ACTIONS_TOKEN}`, "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json", "User-Agent": "Personal-Notion-Dashboard" },
          body: JSON.stringify({ ref: "main" }),
        });
        if (![200, 204].includes(dispatchResponse.status)) {
          let githubMessage = "";
          try {
            const payload = await dispatchResponse.json();
            if (typeof payload.message === "string") githubMessage = payload.message.slice(0, 160);
          } catch { /* GitHub may return an empty or non-JSON error body. */ }
          const error = new Error(`Workflow dispatch returned ${dispatchResponse.status}${githubMessage ? `: ${githubMessage}` : ""}`);
          error.status = dispatchResponse.status;
          throw error;
        }
        return redirect(`${DASHBOARD_URL}?sync=started`, { "Set-Cookie": clearCookie });
      } catch (error) {
        const message = error instanceof Error ? error.message : "unknown error";
        console.error(`Notion sync failed at ${stage}: ${message}`);
        const resultUrl = new URL(DASHBOARD_URL);
        resultUrl.searchParams.set("sync", "error");
        resultUrl.searchParams.set("stage", stage);
        if (stage === "dispatch" && error?.status) {
          resultUrl.searchParams.set("dispatch_status", String(error.status));
          const githubMessage = message.split(": ").slice(1).join(": ").slice(0, 160);
          if (githubMessage) resultUrl.searchParams.set("dispatch_message", githubMessage);
        }
        return redirect(resultUrl.toString(), { "Set-Cookie": clearCookie });
      }
    }

    return response("Not found", 404);
  },
};
