// Run in WSL after the release build, before the final benchmark run.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const readResult = name => readFile(`${root}.evidence/003-${name}.json`, 'utf8').then(JSON.parse);

test('direct driver cancellation invalidates old evidence and releases owned ports', { timeout: 60000 }, async () => {
  assert.equal(process.platform, 'linux', 'run inside WSL');
  const previous = await readResult('summary').catch(() => null);
  const child = spawn(process.execPath, ['scripts/bench-bcrypt.mjs'], {
    cwd: root, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  const closed = new Promise(resolve => child.once('close', (code, signal) => resolve({ code, signal })));
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`startup timeout: ${output}`)), 45000);
      const collect = chunk => {
        output += chunk.toString();
        if (output.includes('rust-release instance 1: ready')) {
          clearTimeout(timer);
          resolve();
        }
      };
      child.stdout.on('data', collect);
      child.stderr.on('data', collect);
      child.once('error', error => { clearTimeout(timer); reject(error); });
      child.once('close', code => { clearTimeout(timer); reject(new Error(`early exit ${code}: ${output}`)); });
    });
    // Signal only the driver PID, not a process group or a port owner.
    assert.equal(child.kill('SIGTERM'), true);
    const result = await closed;
    assert.equal(result.code, 143, output);
    assert.equal(result.signal, null);
    const summary = await readResult('summary');
    assert.equal(summary.status, 'interrupted');
    assert.equal(summary.signal, 'SIGTERM');
    assert.notEqual(summary.run_id, previous?.run_id);
    for (const runtime of ['rust-release', 'bcrypt-js']) {
      const result = await readResult(runtime);
      assert.equal(result.status, 'pending');
      assert.equal(result.run_id, summary.run_id);
    }
    for (const port of [8789, 9238]) {
      const server = createServer();
      await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, '127.0.0.1', resolve);
      });
      await new Promise(resolve => server.close(resolve));
    }
  } finally {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM');
    await closed;
  }
});
