const DASHBOARD_URL = "https://marzlo.github.io/Personal/";
const ALLOWED_GITHUB_LOGIN = "marzlo";
const REPOSITORY = "marzlo/Personal";
const WORKFLOW_FILE = "sync-notion.yml";
const WORKFLOW_URL = `https://api.github.com/repos/${REPOSITORY}/actions/workflows/${WORKFLOW_FILE}`;

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
    if (request.method !== "GET") return response("Method not allowed", 405, { Allow: "GET" });

    if (url.pathname === "/sync") {
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
        "Set-Cookie": `sync_oauth_state=${state}; Path=/auth/callback; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
      });
    }

    if (url.pathname === "/auth/callback") {
      const clearCookie = "sync_oauth_state=; Path=/auth/callback; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
      const state = url.searchParams.get("state") || "";
      const expectedState = getCookie(request, "sync_oauth_state");
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
