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

## Private cross-device notes

`/login` reuses the existing GitHub OAuth app with `read:user`; only `marzlo` can obtain a notes session. `/api/notes` requires a signed seven-day bearer session, permits the dashboard origin, and stores personal notes in `NOTES_STORE` (a SQLite Durable Object). Notes are never committed to the public repository. Existing Worker secrets and `GITHUB_CLIENT_ID` are retained by `keep_vars`.

Deploy from `worker/` with the official Wrangler tool using `wrangler deploy`. `wrangler.jsonc` registers `NotesStore` and its binding. Adding the Durable Object requires Wrangler; pasting JavaScript into Quick Edit alone does not apply the storage migration.

First use:

1. Open the dashboard in the **desktop browser that already contains the correct personal notes**.
2. At the bottom, use **共用我的整理 → 登入 GitHub**, then **以這台建立共用資料**.
3. On the phone, open the dashboard and log in to the same GitHub account. The phone backs up its old data before loading the shared desktop snapshot.

Saved changes upload automatically; visible pages check for remote updates every 15 seconds. Offline edits remain local. Revision conflicts require choosing a version instead of silently overwriting either device. Local backups keep ten snapshots (download with **匯出備份**); the Durable Object keeps the preceding twenty revisions. Unsaved forms defer remote updates.

Each snapshot request is limited to 120 KB, below the Durable Object KV value size limit. Larger snapshots remain local and show an export-backup prompt.

The session is stored in `sessionStorage`; if the tab session ends or seven days pass, log in again. Only the four personal-note keys synchronize; Notion articles still use the existing manual/daily sync workflow.

Validation: `node --test tests/notes-worker.test.mjs` from the repository root. Tests use synthetic data and verify private access, initial migration, concurrent writes, backups, payload limits, and the unchanged manual-sync OAuth entry.

