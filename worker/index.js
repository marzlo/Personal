const DASHBOARD_URL = "https://marzlo.github.io/Personal/";
const ALLOWED_GITHUB_LOGIN = "marzlo";
const WORKFLOW_DISPATCH_URL = "https://api.github.com/repos/marzlo/Personal/actions/workflows/sync-notion.yml/dispatches";

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

function dashboardResult(result) {
  const url = new URL(DASHBOARD_URL);
  url.searchParams.set("sync", result);
  return redirect(url.toString());
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method !== "GET") return response("Method not allowed", 405, { Allow: "GET" });

    if (url.pathname === "/sync") {
      if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.GITHUB_ACTIONS_TOKEN) {
        return response("Worker 尚未完成設定。請確認 OAuth 憑證與 GitHub Actions token 已加入 Worker Secrets/Variables。", 503);
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
        "Set-Cookie": `sync_oauth_state=${state}; Path=/auth/callback; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
      });
    }

    if (url.pathname === "/auth/callback") {
      const clearCookie = "sync_oauth_state=; Path=/auth/callback; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
      const state = url.searchParams.get("state") || "";
      const expectedState = getCookie(request, "sync_oauth_state");
      if (!state || !expectedState || state !== expectedState) {
        return dashboardResult("error");
      }
      if (url.searchParams.has("error")) return redirect(`${DASHBOARD_URL}?sync=error`, { "Set-Cookie": clearCookie });
      const code = url.searchParams.get("code");
      if (!code) return redirect(`${DASHBOARD_URL}?sync=error`, { "Set-Cookie": clearCookie });

      try {
        const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code, redirect_uri: `${url.origin}/auth/callback` }),
        });
        if (!tokenResponse.ok) throw new Error("OAuth token exchange failed");
        const tokenData = await tokenResponse.json();
        if (!tokenData.access_token) throw new Error("OAuth returned no access token");

        const userResponse = await fetch("https://api.github.com/user", {
          headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${tokenData.access_token}`, "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "Personal-Notion-Dashboard" },
        });
        if (!userResponse.ok) throw new Error("Could not verify GitHub user");
        const user = await userResponse.json();
        if (user.login !== ALLOWED_GITHUB_LOGIN) return redirect(`${DASHBOARD_URL}?sync=unauthorized`, { "Set-Cookie": clearCookie });

        const dispatchResponse = await fetch(WORKFLOW_DISPATCH_URL, {
          method: "POST",
          headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${env.GITHUB_ACTIONS_TOKEN}`, "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json", "User-Agent": "Personal-Notion-Dashboard" },
          body: JSON.stringify({ ref: "main" }),
        });
        if (dispatchResponse.status !== 204) throw new Error(`Workflow dispatch returned ${dispatchResponse.status}`);
        return redirect(`${DASHBOARD_URL}?sync=started`, { "Set-Cookie": clearCookie });
      } catch {
        return redirect(`${DASHBOARD_URL}?sync=error`, { "Set-Cookie": clearCookie });
      }
    }

    return response("Not found", 404);
  },
};
