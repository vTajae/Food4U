// Run in WSL. The unchanged browser contract uses Windows Node and Chrome.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, appendFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
assert.equal(process.platform, 'linux', 'Use WSL Linux Node');
const flags = new Set(process.argv.slice(2));
for (const flag of flags) assert.ok(['--fixtures', '--checks', '--contract', '--visual', '--api-tests', '--dashboard-tests', '--dashboard-browser', '--dashboard-visual', '--release', '--release-proof'].includes(flag), `Unknown option ${flag}`);
assert.ok(!flags.has('--checks') || flags.has('--fixtures'), '--checks requires --fixtures');
assert.ok(!flags.has('--api-tests') || flags.has('--fixtures'), '--api-tests requires --fixtures');
const dashboardFlags = ['--dashboard-tests', '--dashboard-browser', '--dashboard-visual'];
const dashboardRun = dashboardFlags.some(flag => flags.has(flag));
assert.ok(!dashboardRun || flags.has('--fixtures'), 'Dashboard proofs require --fixtures');
const releaseProof = flags.has('--release-proof');
assert.equal(flags.has('--release'), releaseProof, 'Use --release --release-proof together');
assert.ok(!releaseProof || flags.size === 2, 'Release proof cannot be combined with fixtures/checks/contract/visual');
const prefix = releaseProof ? '007-rust-release' : dashboardRun ? '007-rust-dashboard' : flags.has('--api-tests') ? '007-rust-api' : flags.has('--visual') ? '007-rust-auth-visual' : '007-rust';
const root = fileURLToPath(new URL('../', import.meta.url));
const mounted = root.match(/^\/mnt\/([a-z])\/(.*)$/);
assert.ok(mounted, 'Repository must be on a Windows drive mounted in WSL');
const windowsRoot = `${mounted[1].toUpperCase()}:/${mounted[2]}`;
const app = resolve(root, 'rust-app');
const evidence = resolve(root, 'contract/.evidence');
await mkdir(evidence, { recursive: true });
await mkdir(resolve(app, '.evidence'), { recursive: true });
const result = { run_id: randomUUID(), status: 'starting', fixtures: flags.has('--fixtures'), release_proof: releaseProof, commands: [] };
const save = () => writeFile(resolve(evidence, `${prefix}-results.json`), JSON.stringify(result, null, 2));
await save();
for (const suffix of ['dev', 'contract', 'checks', 'visual', 'build', 'proof']) await writeFile(resolve(evidence, `${prefix}-${suffix}.log`), `RUN_ID=${result.run_id}\nSTATUS=PENDING\n`);
let child, closed, cancelled, loggingError;
let writes = Promise.resolve();
const commands = new Set();
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  cancelled = signal;
  for (const command of commands) command.kill('SIGTERM');
  if (child?.exitCode === null && child.signalCode === null) child.kill('SIGINT');
});
const env = { ...process.env, NO_COLOR: '1', WRANGLER_SEND_METRICS: 'false' };
delete env.WORKER_BUILD_BIN;
if (releaseProof) {
  for (const key of ['RUSTFLAGS', 'CARGO_ENCODED_RUSTFLAGS', 'CARGO_BUILD_RUSTFLAGS', 'WRANGLER_COMMAND']) delete env[key];
}
const shellQuote = value => `'${value.replaceAll("'", "'\\''")}'`;
async function run(command, args, cwd, filename, extraEnv = {}) {
  assert.ok(!cancelled, 'Run cancelled');
  const processChild = spawn(command, args, { cwd, env: { ...env, ...extraEnv }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  commands.add(processChild);
  let output = '';
  for (const stream of [processChild.stdout, processChild.stderr]) stream.on('data', chunk => { output += chunk; process.stdout.write(chunk); });
  try {
    const code = await new Promise((ok, fail) => { processChild.once('error', fail); processChild.once('close', ok); });
    await writeFile(resolve(evidence, filename), `RUN_ID=${result.run_id}\n${output}`);
    result.commands.push({ command, args, exit: code });
    return { code, output };
  } finally { commands.delete(processChild); }
}
async function windowsRun(args, filename) {
  const variables = { BASE_URL: 'http://127.0.0.1:8789', BASE: 'http://127.0.0.1:8789', CONTRACT_TIMEOUT_MS: '4000', NO_COLOR: '1' };
  if (dashboardRun) variables.FOOD4U_MOCK_CONTROL_URL = env.FOOD4U_MOCK_CONTROL_URL;
  if (flags.has('--visual')) variables.FOOD4U_AUTH_VISUAL_DIR = 'rust-app/.evidence/007-auth-visual';
  const program = `const {spawn}=require('node:child_process');const c=spawn(process.execPath,${JSON.stringify(args)},{cwd:${JSON.stringify(windowsRoot)},env:{...process.env,...${JSON.stringify(variables)}},stdio:'inherit',windowsHide:true});c.on('error',e=>{throw e});c.on('close',code=>process.exitCode=code);`;
  return run('/mnt/c/Program Files/nodejs/node.exe', ['-e', program], root, filename);
}
const expectedFailures = new Set([
  'welcome backend save failure is an explicit alert and preserves review',
]);
try {
  for (const port of [8789, 9238]) {
    const socket = createServer();
    await new Promise((ok, fail) => { socket.once('error', fail); socket.listen(port, '127.0.0.1', ok); });
    await new Promise(ok => socket.close(ok));
  }
  if (releaseProof) {
    const build = await run('npx', ['--no-install', 'topcoat-cloudflare', 'build'], app, `${prefix}-build.log`);
    assert.equal(build.code, 0, 'Standalone optimized release build');
    const metadata = JSON.parse(await readFile(resolve(app, '.topcoat-cloudflare/dist/build.json'), 'utf8'));
    assert.equal(metadata.profile, 'release', 'Standalone build must be release, not dev');
    const wasm = await readFile(resolve(app, '.topcoat-cloudflare/dist/worker/index_bg.wasm'));
    const sha256 = createHash('sha256').update(wasm).digest('hex');
    assert.equal(sha256, metadata.wasmSha256, 'Release metadata must identify the built Wasm');
    assert.equal(wasm.includes(Buffer.from('/_spike/')), false, 'Release Wasm excludes debug route strings');
    assert.equal(wasm.includes(Buffer.from('SPIKE_DEBUG')), false, 'Release Wasm excludes runtime debug flag');
    result.release = { metadata, wasm_sha256: sha256, wasm_bytes: wasm.length, debug_strings_absent: true, routes: [] };
  }
  const config = JSON.parse(await readFile(resolve(app, 'wrangler.jsonc'), 'utf8'));
  config.main = resolve(app, config.main);
  config.assets.directory = resolve(app, config.assets.directory);
  config.build.cwd = app;
  config.build.watch_dir = config.build.watch_dir.map(path => resolve(app, path));
  config.build.command = `${flags.has('--fixtures') ? `WORKER_BUILD_BIN=${shellQuote(resolve(app, 'scripts/worker-build-fixtures.sh'))} ` : ''}npx --no-install topcoat-cloudflare build`;
  if (releaseProof) delete config.build; // Serve standalone release bytes; never run a dev build hook.
  const example = await readFile(resolve(app, '.dev.vars.example'), 'utf8');
  config.vars = {};
  for (const key of ['USER_SESSION_SECRET', 'JWT_SECRET_KEY']) {
    const value = example.match(new RegExp(`^${key}="([^"]+)"`, 'm'))?.[1];
    assert.ok(value?.startsWith('food4u-rust-spike-fake-'), `Expected fake example ${key}`);
    config.vars[key] = value;
  }
  config.vars.SPIKE_DEBUG = flags.has('--fixtures') || releaseProof ? '1' : '0';
  for (const [key, override] of [['API_BASE_URL', 'FOOD4U_MOCK_API_BASE_URL'], ['CLINICAL_TABLES_BASE_URL', 'FOOD4U_MOCK_CLINICAL_TABLES_BASE_URL']]) {
    if (flags.has('--api-tests') || dashboardRun) assert.ok(env[override], `${override} must point at the owned local mock`);
    const url = new URL(env[override] || 'http://127.0.0.1:9');
    assert.ok(url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname) && !url.username && !url.password && !url.search && !url.hash, `${key} test runs are loopback-only`);
    config.vars[key] = url.href;
  }
  const configPath = resolve(app, `.evidence/007-${releaseProof ? 'release' : 'dev'}.wrangler.json`);
  await writeFile(configPath, JSON.stringify(config, null, 2));
  assert.ok(!cancelled, 'Run cancelled');
  child = spawn(process.execPath, [resolve(app, 'node_modules/wrangler/bin/wrangler.js'), 'dev', '--config', configPath,
    '--local', '--ip', '127.0.0.1', '--port', '8789', '--inspector-port', '9238', '--persist-to', resolve(app, '.wrangler/state')],
  { cwd: app, env, stdio: ['ignore', 'pipe', 'pipe'] });
  result.server_pid = child.pid;
  closed = new Promise(ok => child.once('close', (code, signal) => ok({ code, signal })));
  let output = '';
  await new Promise((ok, fail) => {
    const timer = setTimeout(() => fail(new Error('Rust startup timeout after 60 seconds')), 60000);
    for (const stream of [child.stdout, child.stderr]) stream.on('data', chunk => {
      output += chunk;
      writes = writes.then(() => appendFile(resolve(evidence, `${prefix}-dev.log`), chunk)).catch(error => { loggingError ??= error; fail(error); });
      process.stdout.write(chunk);
      if (output.includes('Build failed. Serving the previous development build.')) {
        clearTimeout(timer);
        fail(new Error('Custom build failed; refusing stale development artifacts'));
        return;
      }
      if (output.includes('Ready on http://127.0.0.1:8789')) { clearTimeout(timer); ok(); }
    });
    child.once('error', error => { clearTimeout(timer); fail(error); });
    child.once('close', code => { clearTimeout(timer); fail(new Error(`Rust exited before ready: ${code}`)); });
  });
  result.status = 'running';
  await save();
  if (releaseProof) {
    const base = 'http://127.0.0.1:8789';
    const probeId = randomUUID();
    const hash = '$2b$10$......................7zKQ4MnRQhjLQJHXrFfhn0Bn2NWiKhW';
    const routes = [
      ['POST', '/_spike/seed-user', { username: `release-${probeId}@example.test`, public_id: probeId, user_password: hash, user_role: '2', createdAt: 1700000000, updatedAt: 1700000000 }],
      ['GET', `/_spike/user?username=release-${probeId}%40example.test`],
      ['GET', `/_spike/session?id=${probeId}`],
      ['PUT', '/_spike/session', { id: probeId, data: { welcome: { isComplete: false } } }],
      ['GET', '/_spike/sessions'],
      ['POST', '/_spike/bcrypt', { password: 'release-proof', hash }],
      ['POST', '/register', new URLSearchParams({ username: `release-${probeId}@example.test`, password: 'release-proof' })],
      ['GET', '/_spike/backend-error?case=403'],
      ['GET', '/me'],
    ];
    const login = await fetch(`${base}/login`, { redirect: 'manual', signal: AbortSignal.timeout(10000) });
    assert.equal(login.status, 200, 'Release login page remains live');
    await login.text();
    const registration = await fetch(`${base}/api/register`, { method: 'POST', redirect: 'manual',
      headers: { origin: base, 'content-type': 'application/json' }, body: JSON.stringify(['invalid', 'short']), signal: AbortSignal.timeout(10000) });
    assert.equal(registration.status, 200, 'Public registration procedure remains live');
    assert.equal(await registration.json(), 'Enter a valid email address.');
    for (const [method, path, body] of routes) {
      const form = body instanceof URLSearchParams;
      const response = await fetch(`${base}${path}`, { method, redirect: 'manual', signal: AbortSignal.timeout(10000),
        headers: { origin: base, ...(body ? { 'content-type': form ? 'application/x-www-form-urlencoded' : 'application/json' } : {}) },
        ...(body ? { body: form ? body : JSON.stringify(body) } : {}) });
      result.release.routes.push({ method, path, status: response.status });
      await response.text();
      assert.equal(response.status, 404, `Release excludes ${method} ${path} even with SPIKE_DEBUG=1`);
    }
    const servedFile = await readFile(resolve(app, '.topcoat-cloudflare/dist/worker/index_bg.wasm'));
    assert.equal(createHash('sha256').update(servedFile).digest('hex'), result.release.wasm_sha256, 'Release Wasm unchanged while serving');
    const proof = `RELEASE_PROOF_PASS: login 200; public registration validation live; all ${routes.length} fixture method/routes 404 with SPIKE_DEBUG=1; debug strings absent; release Wasm SHA256 ${result.release.wasm_sha256}\n`;
    await writeFile(resolve(evidence, `${prefix}-proof.log`), `RUN_ID=${result.run_id}\n${proof}`);
    console.log(proof.trim());
  }
  if (flags.has('--checks')) {
    const checks = await run(process.execPath, ['--test', '--test-concurrency=1', 'tests/http.test.mjs', 'tests/auth.test.mjs', 'tests/auth-validation.test.mjs', 'tests/session-rotation.test.mjs'], app, `${prefix}-checks.log`, { SPIKE_URL: 'http://127.0.0.1:8789' });
    assert.equal(checks.code, 0, 'HTTP/auth/validation/session-rotation checks');
  }
  if (flags.has('--contract')) {
    const suite = await windowsRun(['--test', '--test-reporter=spec', 'contract/'], `${prefix}-contract.log`);
    const text = suite.output.replace(/\u001b\[[0-9;]*m/g, '');
    const failures = [...new Set([...text.matchAll(/^\s*\u2716 (.+?) \([\d.]+m?s\)\s*$/gm)].map(match => match[1]))]
      .filter(name => name !== 'Food4U observable web contract');
    const count = label => Number(text.match(new RegExp(`\\u2139 ${label} (\\d+)`))?.[1]);
    result.contract = { raw_exit: suite.code, expected_out_of_scope_failures: failures, in_scope_pass: count('pass'), skipped: count('skipped') };
    assert.equal(suite.code, 1, 'Unmigrated routes must remain failing in the unchanged contract');
    assert.deepEqual(new Set(failures), expectedFailures, 'Only the deferred welcome screen check may fail');
    assert.equal(count('pass'), 35, 'All 35 in-scope leaf checks must pass');
    assert.equal(count('skipped'), 6);
    assert.equal(count('tests'), 43);
    assert.equal(count('fail'), 2, 'Welcome leaf failure plus its parent');
    assert.equal(count('cancelled'), 0);
    assert.match(text, /ONRENDER_REQUESTS_OBSERVED=0(?:\r?\n|$)/);
    assert.ok(!/ONRENDER_REQUESTS_OBSERVED=[1-9]/.test(text));
  }
  if (flags.has('--api-tests')) assert.equal((await run(process.execPath, ['--test', '--test-concurrency=1', 'tests/api.test.mjs'], app, `${prefix}-api.log`, { SPIKE_URL: 'http://127.0.0.1:8789' })).code, 0, 'API/mock/concurrency checks');
  if (flags.has('--dashboard-tests')) assert.equal((await run(process.execPath, ['--test', '--test-concurrency=1', 'tests/dashboard.test.mjs'], app, `${prefix}-state.log`, { SPIKE_URL: 'http://127.0.0.1:8789' })).code, 0, 'Dashboard state-machine checks');
  if (flags.has('--dashboard-browser')) assert.equal((await windowsRun(['rust-app/tests/dashboard-browser.mjs'], `${prefix}-browser.log`)).code, 0, 'Dashboard browser checks');
  if (flags.has('--dashboard-visual')) assert.equal((await windowsRun(['rust-app/tests/dashboard-visual.mjs'], `${prefix}-visual.log`)).code, 0, 'Dashboard visual capture');
  if (flags.has('--visual')) assert.equal((await windowsRun(['rust-app/tests/auth-visual.mjs'], `${prefix}-visual.log`)).code, 0, 'Visual capture');
  if (!releaseProof && ![...flags].some(flag => ['--checks', '--contract', '--visual', '--api-tests', ...dashboardFlags].includes(flag))) {
    console.log('LOCAL_RUST_READY; press Ctrl+C to stop this owned server');
    await closed;
    assert.ok(cancelled, 'Dev server exited unexpectedly');
  }
  assert.ok(!cancelled, 'Run cancelled');
  result.status = 'PASS';
} catch (error) {
  result.status = cancelled ? 'interrupted' : 'FAIL';
  result.error = String(error);
  process.exitCode = cancelled ? 130 : 1;
  console.error(error);
} finally {
  if (child?.exitCode === null && child.signalCode === null) child.kill('SIGINT');
  if (closed) result.server_closed = await closed;
  await writes;
  if (loggingError) { result.status = 'FAIL'; result.logging_error = String(loggingError); process.exitCode = 1; }
  await save();
}
