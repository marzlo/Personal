# Set up the one-click Notion sync

The public dashboard cannot hold credentials. This Cloudflare Worker checks that the visitor is signed in to GitHub as `marzlo`, then asks GitHub Actions to sync Notion and publish the site.

## 1. Deploy the Worker

1. In Cloudflare, open **Workers & Pages** and create a Worker named `shiye-notion-sync`.
2. Open **Edit code**, replace the sample code with `worker/index.js`, and deploy it.
3. Copy the public URL, for example `https://shiye-notion-sync.<your-subdomain>.workers.dev`.

## 2. Create a GitHub OAuth App

Open GitHub **Settings → Developer settings → OAuth Apps → New OAuth App**.

- Application name: `Personal Reading Dashboard Sync`
- Homepage URL: `https://marzlo.github.io/Personal/`
- Authorization callback URL: `https://shiye-notion-sync.<your-subdomain>.workers.dev/auth/callback`

Replace `<your-subdomain>` with the exact Worker URL from step 1. Save the app and note its **Client ID**. Generate a **Client secret**.

## 3. Add Worker settings

In Cloudflare, open **Workers & Pages → shiye-notion-sync → Settings → Variables and Secrets**.

Add `GITHUB_CLIENT_ID` as a regular variable. Add these two as **Secrets**:

- `GITHUB_CLIENT_SECRET`: the OAuth app client secret
- `GITHUB_ACTIONS_TOKEN`: a GitHub fine-grained personal access token restricted to repository `Personal`, with **Actions: Read and write** permission

Save, then redeploy if Cloudflare asks.

The existing `NOTION_TOKEN` stays in GitHub repository secrets; do not copy it into the Worker or the website. Never put any secret in this repository or send it in chat.

## 4. Connect the dashboard

Set `window.SYNC_WORKER_URL` in `sync-worker-config.js` to the Worker base URL (without `/sync`), commit, and push the website change. The dashboard button will then verify the GitHub account and dispatch the sync workflow directly. The first authorization may ask you to approve the OAuth app once.

