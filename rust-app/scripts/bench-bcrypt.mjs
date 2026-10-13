// Run from WSL after a standalone release build. No deployment or adapter patch.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, appendFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashSync } from '../../frontend/node_modules/bcrypt-ts/dist/node.mjs';
import WebSocket from '../node_modules/ws/wrapper.mjs';

assert.equal(process.platform, 'linux', 'run this benchmark inside WSL');
const root = fileURLToPath(new URL('../', import.meta.url));
process.chdir(root);
const evidence = resolve('.evidence');
await mkdir(evidence, { recursive: true });
const run_id = randomUUID();
await writeFile(resolve('.evidence/003-summary.json'), JSON.stringify({ status: 'starting', run_id }));
for (const runtime of ['rust-release', 'bcrypt-js']) {
  await writeFile(resolve(`.evidence/003-${runtime}.json`), JSON.stringify({ status: 'pending', run_id, runtime }));
}
const owned = new Set();
let cancelled;
let cleanup;
let publication = Promise.resolve();
function checkCancellation() {
  if (cancelled) throw new Error(`benchmark cancelled by ${cancelled}`);
}
function publish(path, result) {
  checkCancellation();
  publication = publication.then(() => writeFile(path, JSON.stringify(result, null, 2)));
  return publication;
}
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    if (cancelled) return;
    cancelled = signal;
    cleanup = Promise.all([...owned].map(instance => instance.stop())).then(async () => {
      await publication;
      await writeFile(resolve('.evidence/003-summary.json'), JSON.stringify({ status: 'interrupted', run_id, signal }));
      process.exit(signal === 'SIGINT' ? 130 : 143);
    });
  });
}
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const wasmPath = resolve('.topcoat-cloudflare/dist/worker/index_bg.wasm');
const metadata = JSON.parse(await readFile('.topcoat-cloudflare/dist/build.json', 'utf8'));
assert.equal(metadata.profile, 'release', 'first run npx topcoat-cloudflare build outside dev');
const releaseSha = sha(await readFile(wasmPath));
assert.equal(releaseSha, metadata.wasmSha256);
const version = JSON.parse(await readFile('node_modules/wrangler/package.json', 'utf8')).version;
assert.equal(version, '4.142.0');
const bcryptVersion = JSON.parse(await readFile('../frontend/node_modules/bcrypt-ts/package.json', 'utf8')).version;
assert.equal(bcryptVersion, '5.0.3');

// Absolute artifact paths preserve resolution from the ignored alternate config.
const config = JSON.parse(await readFile('wrangler.jsonc', 'utf8'));
delete config.build;
config.main = resolve(config.main);
config.assets.directory = resolve(config.assets.directory);
config.vars = { SPIKE_DEBUG: '1' }; // Probe only; no login or production secrets.
const releaseConfig = resolve('.evidence/003-release.wrangler.json');
await writeFile(releaseConfig, JSON.stringify(config, null, 2));
const fixture = { password: 'synthetic-benchmark-fixture-003',
  hash: hashSync('synthetic-benchmark-fixture-003', '$2b$10$......................') };

async function freePort(port) {
  const socket = createServer();
  await new Promise((ok, fail) => {
    socket.once('error', fail);
    socket.listen(port, '127.0.0.1', ok);
  });
  await new Promise(ok => socket.close(ok));
}

async function start(target, instance) {
  await freePort(target.port);
  await freePort(target.inspector);
  const log = resolve(`.evidence/003-${target.id}-${instance}-wrangler.log`);
  await writeFile(log, '');
  const args = ['node_modules/wrangler/bin/wrangler.js', 'dev', '--config', target.config,
    '--local', '--ip', '127.0.0.1', '--port', String(target.port),
    '--inspector-port', String(target.inspector), '--inspector-ip', '127.0.0.1'];
  checkCancellation(); // No owned process may be created after cleanup's snapshot.
  const child = spawn(process.execPath, args, {
    cwd: root, env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let writes = Promise.resolve();
  let output = '';
  const closed = new Promise(ok => child.once('close', (code, signal) => ok({ code, signal })));
  const ready = new Promise((ok, fail) => {
    const timer = setTimeout(() => fail(new Error(`startup timeout; see ${log}`)), 60000);
    const collect = chunk => {
      const text = chunk.toString();
      writes = writes.then(() => appendFile(log, text));
      output = (output + text).slice(-8000);
      if (output.includes(`Ready on http://127.0.0.1:${target.port}`)) {
        clearTimeout(timer);
        ok();
      }
    };
    child.stdout.on('data', collect);
    child.stderr.on('data', collect);
    child.once('error', error => { clearTimeout(timer); fail(error); });
    child.once('close', code => { clearTimeout(timer); fail(new Error(`Wrangler exited ${code}; see ${log}`)); });
  });
  let stopping;
  const handle = { pid: child.pid, command: [process.execPath, ...args], stop: () => {
    stopping ??= stop();
    return stopping;
  } };
  async function stop() {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGINT');
    const result = await Promise.race([closed, new Promise((_, fail) => {
      const timer = setTimeout(() => fail(new Error('owned Wrangler did not stop')), 10000);
      timer.unref();
    })]);
    await writes;
    owned.delete(handle);
    return result;
  }
  owned.add(handle);
  try { await ready; } catch (error) { await handle.stop(); throw error; }
  console.log(`${target.id} instance ${instance}: ready (owned pid ${child.pid})`);
  return handle;
}

async function verify(target) {
  const response = await fetch(`http://127.0.0.1:${target.port}/_spike/bcrypt`, {
    method: 'POST', headers: { 'content-type': 'application/json', origin: `http://127.0.0.1:${target.port}` },
    body: JSON.stringify(fixture), signal: AbortSignal.timeout(10000),
  });
  assert.equal(response.status, 200, await response.clone().text());
  const sample = await response.json();
  assert.equal(sample.valid, true);
  assert.ok(Number.isFinite(sample.elapsed_ms) && sample.elapsed_ms > 0, 'clock must advance during verification');
  if (target.id === 'bcrypt-js') {
    assert.equal(sample.runtime, 'bcrypt-ts/workerd');
    assert.equal(sample.version, bcryptVersion);
  }
  return sample.elapsed_ms;
}

// Attach AFTER timing, so debugger instrumentation cannot affect the samples.
async function loadedWasm(target) {
  const response = await fetch(`http://127.0.0.1:${target.inspector}/json/list`);
  assert.equal(response.status, 200);
  const targets = await response.json();
  assert.equal(targets.length, 1, 'owned inspector must identify one Worker');
  await writeFile(resolve('.evidence/003-inspector-targets.json'), JSON.stringify(targets, null, 2));
  const address = new URL(targets[0].webSocketDebuggerUrl);
  address.hostname = '127.0.0.1';
  address.port = String(target.inspector);
  console.log(`Owned inspector target: ${address}`);
  // Wrangler's installed inspector requires an explicit permitted Origin.
  const socket = new WebSocket(address, { origin: 'http://localhost', handshakeTimeout: 10000 });
  await new Promise((ok, fail) => {
    socket.addEventListener('open', ok, { once: true });
    socket.addEventListener('error', event => fail(new Error(`CDP connect failed: ${event.message}; ${event.error?.message ?? ''}`)), { once: true });
  });
  let id = 0;
  const pending = new Map();
  const scripts = [];
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Debugger.scriptParsed') scripts.push(message.params);
    if (message.id && pending.has(message.id)) {
      const entry = pending.get(message.id);
      pending.delete(message.id);
      clearTimeout(entry.timer);
      if (message.error) entry.fail(new Error(JSON.stringify(message.error)));
      else entry.ok(message.result);
    }
  });
  const send = (method, params = {}) => new Promise((ok, fail) => {
    const requestId = ++id;
    const timer = setTimeout(() => { pending.delete(requestId); fail(new Error(`CDP timeout: ${method}`)); }, 10000);
    pending.set(requestId, { ok, fail, timer });
    socket.send(JSON.stringify({ id: requestId, method, params }));
  });
  try {
    await send('Debugger.enable');
    const modules = scripts.filter(script => script.scriptLanguage === 'WebAssembly' || script.url?.startsWith('wasm://'));
    assert.ok(modules.length, 'inspector must expose the loaded Wasm');
    const hashes = [];
    for (const script of modules) {
      const source = await send('Debugger.getScriptSource', { scriptId: script.scriptId });
      assert.equal(typeof source.bytecode, 'string', 'use actual Wasm bytecode, not script hash');
      const bytes = Buffer.from(source.bytecode, 'base64');
      hashes.push({ scriptId: script.scriptId, url: script.url, bytes: bytes.length, sha256: sha(bytes) });
    }
    assert.ok(hashes.some(module => module.sha256 === releaseSha), 'loaded Wasm must equal release artifact SHA256');
    assert.equal(sha(await readFile(wasmPath)), releaseSha, 'artifact must remain unchanged while measuring');
    return { targetId: targets[0].id, title: targets[0].title, modules: hashes,
      artifactSha256: releaseSha, metadataSha256: metadata.wasmSha256, matched: true };
  } finally { socket.close(); }
}

function summary(samples) {
  const sorted = [...samples].sort((a, b) => a - b);
  return { median_ms: (sorted[14] + sorted[15]) / 2, p95_ms: sorted[Math.ceil(0.95 * samples.length) - 1],
    min_ms: sorted[0], max_ms: sorted.at(-1) };
}

const results = [];
try {
for (const target of [
  { id: 'rust-release', port: 8789, inspector: 9238, config: releaseConfig },
  { id: 'bcrypt-js', port: 8790, inspector: 9239, config: resolve('bench/bcrypt-js/wrangler.jsonc') },
]) {
  const instance = await start(target, 1);
  let result;
  try {
    const warmup_ms = await verify(target); // First call; excluded from warm samples.
    const samples_ms = [];
    for (let i = 0; i < 30; i++) samples_ms.push(await verify(target));
    result = { status: 'PASS', run_id, runtime: target.id, warmup_runs: 1, measured_runs: 30, warmup_ms, samples_ms,
      ...summary(samples_ms), firstInstance: { pid: instance.pid, command: instance.command } };
    if (target.id === 'rust-release') result.firstInstance.wasmProof = await loadedWasm(target);
  } finally { await instance.stop(); }
  const cold = await start(target, 2);
  try {
    result.cold_restart_ms = await verify(target); // No HTTP readiness probe before this call.
    result.coldInstance = { pid: cold.pid, command: cold.command };
    if (target.id === 'rust-release') result.coldInstance.wasmProof = await loadedWasm(target);
  } finally { await cold.stop(); }
  result.note = 'Local workerd elapsed verification interval; indicative, not billed CPU. No debugger attached during timing.';
  await publish(resolve(`.evidence/003-${target.id}.json`), result);
  results.push(result);
  console.log(JSON.stringify({ runtime: target.id, ...summary(result.samples_ms), cold_restart_ms: result.cold_restart_ms }));
}
await publish(resolve('.evidence/003-summary.json'), {
  status: 'PASS', run_id,
  fixture_sha256: sha(JSON.stringify(fixture)), bcrypt_ts_version: bcryptVersion, wrangler_version: version,
  release_metadata: metadata, results,
});
console.log('BENCHMARK_PASS: both runtimes, sequential, 30 samples each, cold restarts, loaded release hash proof.');
} catch (error) {
  if (cancelled) await cleanup;
  else throw error;
}
