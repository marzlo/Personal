// Use the upload step's exact artifact ID: no eventually consistent name lookup.
module.exports = async ({github, core, context, artifactId, sleep = ms => new Promise(resolve => setTimeout(resolve, ms))}) => {
  if (!/^\d+$/.test(String(artifactId || ''))) throw new Error('Missing uploaded Pages artifact ID');
  const repo = context.repo;
  const oidc = await core.getIDToken();
  const {data: deployment} = await github.request('POST /repos/{owner}/{repo}/pages/deployments', {
    ...repo, artifact_id: Number(artifactId), pages_build_version: context.sha, oidc_token: oidc
  });
  core.info(`Created Pages deployment ${deployment.id} for artifact ${artifactId}`);
  for (let attempt = 0; attempt < 120; attempt++) {
    const {data} = await github.request('GET /repos/{owner}/{repo}/pages/deployments/{deployment_id}', {
      ...repo, deployment_id: deployment.id
    });
    core.info(`Pages deployment: ${data.status}`);
    if (data.status === 'succeed') {
      core.setOutput('page_url', deployment.page_url);
      return;
    }
    if (['deployment_failed', 'deployment_content_failed', 'deployment_cancelled', 'deployment_lost', 'failed', 'cancelled'].includes(data.status)) {
      throw new Error(`Pages deployment failed: ${data.status}`);
    }
    await sleep(5000);
  }
  await github.request('POST /repos/{owner}/{repo}/pages/deployments/{deployment_id}/cancel', {...repo, deployment_id: deployment.id});
  throw new Error('Pages deployment timed out after 10 minutes and was cancelled');
};
