import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile, appendFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';

await mkdir('.evidence', { recursive: true });
await writeFile('.evidence/release-build.log', '');
const start = performance.now();
const child = spawn('npx', ['topcoat-cloudflare', 'build'], { env: process.env });
let writes = Promise.resolve();
for (const stream of [child.stdout, child.stderr]) {
  stream.on('data', chunk => {
    process.stdout.write(chunk);
    writes = writes.then(() => appendFile('.evidence/release-build.log', chunk));
  });
}
const exitCode = await new Promise((resolve, reject) => {
  child.on('error', reject);
  child.on('close', resolve);
});
await writes;
assert.equal(exitCode, 0, 'the pinned release build must succeed');
const seconds = (performance.now() - start) / 1000;
const path = '.topcoat-cloudflare/dist/worker/index_bg.wasm';
const wasm = await readFile(path);
const metadata = JSON.parse(await readFile('.topcoat-cloudflare/dist/build.json', 'utf8'));
assert.equal(metadata.profile, 'release');
const result = {
  command: 'npx topcoat-cloudflare build',
  exitCode,
  buildSeconds: seconds,
  targetDirectory: process.env.CARGO_TARGET_DIR || 'target',
  path,
  rawBytes: wasm.length,
  gzipLevel9Bytes: gzipSync(wasm, { level: 9 }).length,
  sha256: createHash('sha256').update(wasm).digest('hex'),
  scope: 'Worker Wasm only; not a deployed total-bundle measurement',
};
await writeFile('.evidence/release.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
