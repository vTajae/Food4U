/* eslint-env node */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { basename, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { hash } from 'bcrypt-ts';
import { unstable_startWorker } from 'wrangler';

const frontend = fileURLToPath(new URL('../', import.meta.url));
const root = resolve(frontend, '..');
const [temp, artifacts] = process.argv.slice(2);
const project = resolve(temp, 'project');
assert.equal(dirname(resolve(temp)).toLowerCase(), resolve(tmpdir()).toLowerCase());
assert.ok(basename(temp).startsWith('food4u-e2e-018-'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
// Hash streams only: owner configuration is never parsed, copied or used.
async function ownerHashes() {
  const result = {};
  for (const name of ['frontend/.dev.vars', '.env.local', '.neon']) {
    const hash = createHash('sha256');
    try {
      for await (const bytes of createReadStream(resolve(root, name))) hash.update(bytes);
      result[name] = hash.digest('hex');
    } catch (error) { if (error.code !== 'ENOENT') throw error; result[name] = 'ABSENT'; }
  }
  return result;
}
const before = await ownerHashes();
const outbound = [], backendCalls = [], profiles = new Map();
let worker, backend, proxy, backendOrigin, redirectHits = 0, deniedProxy = 0, onrender = 0;
const emptyProfile = () => ({ id: 18, attributes: [], diets: [], medical_history: [] });
const savedProfile = () => ({ ...emptyProfile(), diets: [{ diet_type: { diet_name: 'Vegetarian' } }],
  medical_history: [{ icd_details: { code: 'J30.9', description: 'Allergic rhinitis, unspecified' } }] });
const listen = server => new Promise((ok, no) => { server.once('error', no); server.listen(0, '127.0.0.1', ok); });
const close = server => new Promise(ok => { server.closeAllConnections(); server.close(ok); });
const identity = req => {
  try { return JSON.parse(Buffer.from(req.headers.authorization.split('.')[1], 'base64url')).username; }
  catch { return null; }
};
async function command(args) {
  const child = spawn(process.execPath, [resolve(frontend, 'node_modules/wrangler/bin/wrangler.js'), ...args], {
    cwd: temp, windowsHide: true, env: { ...process.env, WRANGLER_SEND_METRICS: 'false', CI: 'true' }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = ''; for (const stream of [child.stdout, child.stderr]) stream.on('data', b => { log += b; });
  const code = await new Promise((ok, no) => { child.once('error', no); child.once('close', ok); });
  await writeFile(resolve(artifacts, '018-d1-init.log'), log);
  assert.equal(code, 0, 'fresh local D1 schema and synthetic accounts');
}
let failure;
try {
  backend = createServer(async (req, res) => {
    res.setHeader('content-type', 'application/json');
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === '/_redirect') { res.writeHead(302, { location: `http://${req.headers.host}/_target` }); res.end(); return; }
    if (url.pathname === '/_target') { redirectHits++; res.end('{}'); return; }
    const user = identity(req);
    backendCalls.push({ method: req.method, path: req.url, user }); // no tokens
    const send = (status, body) => { res.statusCode = status; res.end(JSON.stringify(body)); };
    if (url.pathname === '/health') return send(200, { status: 'ok' });
    if (!user) return send(401, { detail: 'Missing synthetic identity' });
    if (url.pathname === '/refs' && url.searchParams.get('queryKey') === 'diets') {
      return send(200, ['Vegetarian', 'Vegan', 'Mediterranean'].map(diet_name => ({ diet_name, description: 'Synthetic E2E diet' })));
    }
    if (url.pathname === '/api/suggestion') {
      await new Promise(ok => setTimeout(ok, 2000)); // deterministic visible loading state
      return send(503, { detail: 'Synthetic service unavailable' });
    }
    if (url.pathname === '/user/profile') {
      if (user.startsWith('waking-')) return send(503, { detail: 'Synthetic backend waking' });
      if (user.startsWith('dashboard-')) return send(200, savedProfile());
      return profiles.has(user) ? send(200, profiles.get(user)) : send(403, { detail: 'User not found' });
    }
    if (url.pathname === '/profile' && req.method === 'POST') {
      if (!profiles.has(user)) profiles.set(user, emptyProfile());
      return send(200, { id: 18 });
    }
    if (url.pathname === '/welcome' && req.method === 'POST') {
      if (user.startsWith('save-waking-')) return send(503, { detail: 'Synthetic backend waking' });
      let raw = ''; for await (const part of req) raw += part;
      const { submission } = JSON.parse(raw);
      const profile = emptyProfile();
      for (const question of submission) for (const answer of question.answers) {
        if (question.queryKey === 'diets') profile.diets.push({ diet_type: { diet_name: answer.name } });
        else if (['conditions', 'icd10cm'].includes(question.queryKey)) profile.medical_history.push({ icd_details: { code: answer.code, description: answer.name } });
        else profile.attributes.push({ attribute_category: question.queryKey, attribute_name: answer.name ?? answer.value, attribute_value: answer.value ?? answer.name });
      }
      profiles.set(user, profile);
      return send(200, { status: true, message: 'Profile saved' });
    }
    return send(404, { detail: 'Unsupported deterministic fake route' });
  });
  await listen(backend);
  backendOrigin = `http://127.0.0.1:${backend.address().port}`;
  const guard = async request => {
    const url = new URL(request.url);
    if (/(^|\.)onrender\.com$/i.test(url.hostname)) onrender++;
    outbound.push({ origin: url.origin, path: url.pathname });
    assert.equal(url.origin, backendOrigin, `SERVER EGRESS DENIED: ${url.origin}`);
    const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer();
    return fetch(url, { method: request.method, headers: request.headers, body, redirect: 'error', signal: AbortSignal.timeout(10_000) });
  };
  await assert.rejects(guard(new Request('http://egress-canary.invalid/')), /SERVER EGRESS DENIED/);
  await assert.rejects(guard(new Request(backendOrigin + '/_redirect')));
  assert.equal(redirectHits, 0); outbound.length = 0;
  proxy = createServer((_, res) => { deniedProxy++; res.writeHead(403); res.end('E2E external egress denied'); });
  proxy.on('connect', (_, socket) => { deniedProxy++; socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n'); });
  await listen(proxy);
  const built = JSON.parse(await readFile(resolve(project, 'dist/server/wrangler.json'), 'utf8'));
  const main = resolve(project, 'dist/server/index.js');
  const mainHash = sha(await readFile(main));
  const configPath = resolve(temp, 'wrangler.json'), envFile = resolve(temp, 'empty.env'), persist = resolve(temp, 'state');
  const config = { name: 'food4u-e2e-018', compatibility_date: built.compatibility_date, compatibility_flags: built.compatibility_flags,
    main, no_bundle: true, rules: built.rules, assets: { ...built.assets, directory: resolve(project, 'dist/client') },
    vars: { API_BASE_URL: backendOrigin, JWT_ACCESS_TOKEN_EXPIRE_MINUTES: '30m', USER_SESSION_SECRET: 'synthetic-e2e-session-secret-018-12345', USER_COOKIE_SECRET: 'synthetic-e2e-cookie-secret-018-12345', JWT_SECRET_KEY: 'synthetic-e2e-jwt-secret-018-12345' },
    kv_namespaces: [{ binding: 'cloudflare_KV', id: '01801801801801801801801801801801', remote: false }],
    d1_databases: [{ binding: 'cloudflare_db', database_name: 'food4u-e2e-018', database_id: randomUUID(), remote: false }],
  };
  await writeFile(configPath, JSON.stringify(config)); await writeFile(envFile, '');
  const passwordHash = await hash('E2E-password-018!', 10);
  const users = ['dashboard-desktop', 'dashboard-mobile', 'waking-desktop', 'waking-mobile', 'save-waking-desktop', 'save-waking-mobile'];
  const seed = users.map(name => `INSERT INTO user (public_id, username, user_password, user_role) VALUES ('${randomUUID()}', '${name}@food4u.test', '${passwordHash}', '1');`).join('\n');
  const sqlPath = resolve(temp, 'seed.sql');
  await writeFile(sqlPath, (await readFile(resolve(frontend, 'database/basic.sql'), 'utf8')) + '\n' + seed);
  await command(['d1', 'execute', 'food4u-e2e-018', '--local', '--config', configPath, '--env-file', envFile, '--persist-to', persist, '--file', sqlPath]);
  worker = await unstable_startWorker({ config: configPath, envFiles: [envFile],
    dev: { remote: false, server: { hostname: '127.0.0.1', port: 0 }, inspector: { hostname: '127.0.0.1', port: 0 }, watch: false,
      persist, registry: undefined, outboundService: guard, enableContainers: false, generateTypes: false } });
  await worker.ready;
  process.send({ type: 'ready', base: (await worker.url).origin, proxy: `http://127.0.0.1:${proxy.address().port}` });
  await new Promise(ok => {
    process.once('message', message => { if (message.type === 'stop') ok(); });
    process.once('disconnect', ok);
    process.once('SIGTERM', ok);
  });
  assert.equal(sha(await readFile(main)), mainHash, 'built Worker left unmodified');
} catch (error) { failure = error; console.error(error); }
finally {
  try {
    if (worker) await worker.dispose();
    if (backend) await close(backend);
    if (proxy) await close(proxy);
    const after = await ownerHashes();
    assert.deepEqual(after, before, 'owner files unchanged byte-for-byte');
    assert.equal(onrender, 0); assert.equal(redirectHits, 0);
    assert.ok(outbound.every(entry => entry.origin === backendOrigin), 'all application egress must target the exact owned fake backend');
    await writeFile(resolve(artifacts, '018-isolation.json'), JSON.stringify({ before, after, owner_hashes_unchanged: true,
      server_onrender_requests: onrender, redirect_destination_hits: redirectHits, external_deny_canary: true,
      browser_deny_proxy_connections: deniedProxy, outbound, backendCalls, private_local_d1_kv: true,
      error: failure?.message ?? null }, null, 2));
    console.log('ONRENDER_REQUESTS_OBSERVED=' + onrender);
  } catch (error) { failure ??= error; console.error(error); }
  process.exit(failure ? 1 : 0);
}
