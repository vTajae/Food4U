// Local-only dashboard backend owner. Never contacts the real backend or NLM.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { jwtSecret } from './auth-fixtures.mjs';
assert.equal(process.platform, 'linux', 'Run in WSL so worker and mock share loopback');
const root = fileURLToPath(new URL('../../', import.meta.url));
const pending = [], observed = [], violations = [], aborted = [];
const identities = new Map();
const send = (res, status, data) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(data)); };
function verify(token, identity, refreshed) {
  const parts = token.split('.');
  assert.ok(parts.length === 3, 'JWT has three segments');
  const [header, payload, signature] = parts;
  assert.equal(JSON.parse(Buffer.from(header, 'base64url')).alg, 'HS256');
  const expected = createHmac('sha256', jwtSecret).update(`${header}.${payload}`).digest();
  const actual = Buffer.from(signature, 'base64url');
  assert.ok(actual.length === expected.length && timingSafeEqual(actual, expected), 'Bearer signature verifies independently');
  const claims = JSON.parse(Buffer.from(payload, 'base64url'));
  if (refreshed) assert.deepEqual(Object.keys(claims).sort(), ['exp', 'role', 'user_id', 'username']);
  assert.equal(claims.user_id, identity.publicId); assert.equal(claims.username, identity.username); assert.equal(claims.role, identity.role);
  if (refreshed) {
    const now = Math.floor(Date.now() / 1000);
    assert.ok(claims.exp >= now + 1790 && claims.exp <= now + 1810, 'Refreshed JWT expires in 30 minutes (10 second cross-process clock tolerance)');
    assert.ok(token !== identity.original, 'Refresh replaces the expired token');
    if (identity.refreshed) assert.ok(token === identity.refreshed, 'All retries use the exact refreshed bearer');
    identity.refreshed = token;
  }
}
const report = () => ({ pending: pending.map(({method,path}) => ({method,path})), observed, violations, aborted });
const server = createServer(async (req,res) => {
  try {
    assert.equal(req.socket.remoteAddress, '127.0.0.1');
    let raw = ''; for await (const part of req) raw += part;
    const body = raw ? JSON.parse(raw) : undefined;
    if (req.url === '/control/token' && req.method === 'POST') {
      verify(body.token, body, false); identities.set(body.publicId, { ...body, original: body.token }); return send(res,200,{ok:true});
    }
    if (req.url === '/control/expect' && req.method === 'POST') {
      assert.ok(identities.has(body.user)); assert.ok(body.path.startsWith('/backend/'));
      pending.push(body); return send(res,200,{ok:true});
    }
    if (req.url === '/control/report' && req.method === 'GET') return send(res,200,report());
    if (req.url === '/control/persisted' && req.method === 'POST') {
      const identity = identities.get(body.user);
      assert.ok(identity?.refreshed && body.token === identity.refreshed, 'Session persisted the exact independently validated refreshed token');
      return send(res,200,{ok:true});
    }
    const next = pending.shift();
    assert.ok(next, 'Unexpected upstream call');
    assert.equal(req.method,next.method); assert.equal(req.url,next.path); assert.deepEqual(body,next.body);
    const identity = identities.get(next.user);
    if (next.refreshed) {
      assert.ok(req.headers.authorization?.startsWith('Bearer ')); verify(req.headers.authorization.slice(7),identity,true);
    } else assert.ok(req.headers.authorization === `Bearer ${identity.original}`, 'Exact original bearer belongs to independently specified user');
    observed.push({method:req.method,path:req.url,user:next.user,refreshed:!!next.refreshed});
    if (next.stall) { res.once('close', () => aborted.push(next.path)); return; }
    if (next.disconnect) { req.socket.destroy(); return; }
    if (next.delay) await new Promise(resolve => setTimeout(resolve, next.delay));
    send(res,next.status || 200,next.response);
  } catch {
    // Never serialize assertion actual/expected values: those could contain a token.
    violations.push('Dashboard mock expectation failed (method/path/body/bearer/claims)');
    send(res,599,{error:'Dashboard mock expectation failed'});
  }
});
await new Promise((ok,fail) => { server.once('error',fail); server.listen(0,'127.0.0.1',ok); });
const origin = `http://127.0.0.1:${server.address().port}`;
let child;
for (const signal of ['SIGINT','SIGTERM']) process.on(signal,() => { if(child?.exitCode === null) child.kill(signal); });
try {
  const args = process.argv.slice(2);
  child = spawn(process.execPath,['contract/local-rust.mjs',...(args.length ? args : ['--fixtures','--dashboard-tests'])], {cwd:root,stdio:'inherit',env:{...process.env,
    FOOD4U_MOCK_API_BASE_URL:`${origin}/backend/`,FOOD4U_MOCK_CLINICAL_TABLES_BASE_URL:`${origin}/clinical/`,FOOD4U_MOCK_CONTROL_URL:`${origin}/control/`}});
  const code = await new Promise((ok,fail) => {child.once('error',fail);child.once('close',ok);});
  assert.equal(code,0,'Dashboard child suite passes'); assert.deepEqual(violations,[]); assert.equal(pending.length,0);
  assert.ok(observed.length > 0); console.log(`DASHBOARD_MOCK_PASS observed=${observed.length} violations=0 pending=0`);
} catch(error) { console.error(error); process.exitCode=1; }
finally { await mkdir(`${root}/contract/.evidence`,{recursive:true}); await writeFile(`${root}/contract/.evidence/007-dashboard-mock.json`,JSON.stringify(report(),null,2)); server.closeAllConnections(); await new Promise(ok=>server.close(ok)); }
