// WSL-only owner of a local HTTP mock and the child local-rust lifecycle.
import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { spawn } from 'node:child_process';
import { createHmac, timingSafeEqual, randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { jwtSecret } from './auth-fixtures.mjs';
assert.equal(process.platform, 'linux', 'Run with WSL Node so mock and worker share loopback');
const root = fileURLToPath(new URL('../../', import.meta.url));
const expectations = [], violations = [], observed = [], aborted = [], identities = new Map();
const send = (res, status, body) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); };
const server = createServer(async (req, res) => {
  try {
    assert.equal(req.socket.remoteAddress, '127.0.0.1');
    let raw = ''; for await (const part of req) raw += part;
    const body = raw ? JSON.parse(raw) : undefined;
    if (req.url === '/control/token' && req.method === 'POST') {
      const [header, payload, signature, extra] = body.token.split('.');
      assert.equal(extra, undefined);
      assert.equal(JSON.parse(Buffer.from(header, 'base64url')).alg, 'HS256');
      const expected = createHmac('sha256', jwtSecret).update(`${header}.${payload}`).digest();
      const supplied = Buffer.from(signature, 'base64url');
      assert.equal(supplied.length, expected.length); assert.ok(timingSafeEqual(supplied, expected));
      const claims = JSON.parse(Buffer.from(payload, 'base64url'));
      assert.equal(claims.user_id, body.publicId); assert.equal(claims.username, body.username);
      assert.ok(claims.exp > Date.now() / 1000);
      identities.set(body.publicId, body.token); return send(res, 200, { ok: true });
    }
    if (req.url === '/control/expect' && req.method === 'POST') {
      assert.ok(body.path.startsWith('/backend/') || body.path.startsWith('/clinical/'));
      if (body.user) assert.ok(identities.has(body.user), 'Expected identity must be independently verified first');
      expectations.push({ ...body, id: randomUUID(), consumed: false }); return send(res, 200, { ok: true });
    }
    if (req.url === '/control/report' && req.method === 'GET') return send(res, 200, report());
    const actualUrl = new URL(req.url, 'http://127.0.0.1');
    const match = expectations.find(e => !e.consumed && e.method === req.method && e.path === actualUrl.pathname &&
      isDeepStrictEqual(e.body, body) && JSON.stringify(Object.entries(e.query || {}).sort()) === JSON.stringify([...actualUrl.searchParams].sort()));
    assert.ok(match, `Unexpected mock request: ${req.method} ${req.url} ${raw}`);
    match.consumed = true;
    assert.equal(req.headers.authorization, match.user ? `Bearer ${identities.get(match.user)}` : undefined, `Authorization belongs to expected request user, never inferred from token`);
    observed.push({ id: match.id, method: req.method, path: actualUrl.pathname, user: match.user || null });
    if (match.stall) {
      res.once('close', () => { aborted.push(match.id); });
      if (match.stall === 'body') { res.writeHead(200, { 'content-type': 'application/json' }); res.write('{'); }
      return;
    }
    if (match.delay) await new Promise(resolve => setTimeout(resolve, match.delay));
    for (const [name, value] of Object.entries(match.headers || {})) res.setHeader(name, value);
    if (Object.hasOwn(match, 'raw')) { res.writeHead(match.status || 200, { 'content-type': 'text/plain' }); res.end(match.raw); }
    else send(res, match.status || 200, match.response);
  } catch (error) { violations.push(String(error)); send(res, 599, { mockViolation: String(error) }); }
});
function report() { return { violations, aborted, pending: expectations.filter(e => !e.consumed).map(e => ({ id: e.id, path: e.path })), observed }; }
await new Promise((ok, fail) => { server.once('error', fail); server.listen(0, '127.0.0.1', ok); });
const origin = `http://127.0.0.1:${server.address().port}`;
let child;
const stop = signal => { if (child?.exitCode === null && child.signalCode === null) child.kill(signal); };
process.on('SIGINT', () => stop('SIGINT')); process.on('SIGTERM', () => stop('SIGTERM'));
try {
  const args = process.argv.slice(2);
  child = spawn(process.execPath, ['contract/local-rust.mjs', ...(args.length ? args : ['--fixtures', '--checks', '--contract', '--api-tests'])], {
    cwd: root, stdio: 'inherit', env: { ...process.env, FOOD4U_MOCK_API_BASE_URL: `${origin}/backend/`,
      FOOD4U_MOCK_CLINICAL_TABLES_BASE_URL: `${origin}/clinical/`, FOOD4U_MOCK_CONTROL_URL: `${origin}/control/` },
  });
  const code = await new Promise((ok, fail) => { child.once('error', fail); child.once('close', ok); });
  assert.equal(code, 0, 'Owned local-rust child must pass');
  assert.deepEqual(violations, [], 'Every mock request obeyed method/body/query/token expectations');
  assert.equal(report().pending.length, 0, 'All planned mock requests happened');
  assert.ok(observed.length >= 40, 'Concurrency corpus reached the backend');
  console.log(`API_MOCK_PASS observed=${observed.length} violations=0 pending=0`);
} catch (error) { console.error(error); process.exitCode = 1; }
finally {
  await mkdir(`${root}/contract/.evidence`, { recursive: true });
  await writeFile(`${root}/contract/.evidence/${process.env.FOOD4U_EVIDENCE_PREFIX || '007'}-api-mock.json`, JSON.stringify(report(), null, 2));
  server.closeAllConnections(); await new Promise(ok => server.close(ok));
}
