const {test} = require('node:test');
const assert = require('node:assert/strict');
const deploy = require('../scripts/deploy-pages.cjs');
function fixture(statuses) {
  const calls = [], outputs = {};
  return {calls, outputs, artifactId:'123456789', sleep:async()=>{},
    context:{repo:{owner:'owner',repo:'repo'},sha:'abc'},
    core:{getIDToken:async()=> 'test-oidc',info:()=>{},setOutput:(k,v)=>outputs[k]=v},
    github:{request:async(route,args)=>{
      calls.push({route,args});
      if(route.endsWith('/cancel'))return {};
      return route.startsWith('POST')?{data:{id:'deployment',page_url:'https://example.com'}}:{data:{status:statuses.shift()||'queued'}};
    }}};
}
test('deploys the supplied upload ID without listing artifacts, waits for success',async()=>{
  const f=fixture(['queued','building','succeed']);await deploy(f);
  assert.equal(f.calls[0].args.artifact_id,123456789);
  assert.equal(f.calls[0].args.oidc_token,'test-oidc');
  assert.equal(f.outputs.page_url,'https://example.com');
  assert.equal(f.calls.length,4);
  assert.ok(f.calls.every(c=>!c.route.includes('/actions/artifacts')));
});
test('rejects missing IDs before requesting a token or deployment',async()=>{
  const f=fixture([]);f.artifactId='';await assert.rejects(deploy(f),/Missing/);assert.equal(f.calls.length,0);
});
test('fails on an unsuccessful deployment',async()=>{
  const f=fixture(['deployment_content_failed']);await assert.rejects(deploy(f),/deployment_content_failed/);
  assert.deepEqual(f.outputs,{});
});
test('cancels a deployment that never finishes',async()=>{
  const f=fixture([]);await assert.rejects(deploy(f),/timed out/);
  assert.ok(f.calls.at(-1).route.endsWith('/cancel'));assert.deepEqual(f.outputs,{});
});
