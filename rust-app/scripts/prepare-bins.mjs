// Executable wrappers for WSL workspaces on filesystems without symlinks.
// These invoke the installed packages unchanged; they are not CLI substitutes.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

assert.equal(process.platform, 'linux', 'install and build this spike from WSL');
const root = new URL('../', import.meta.url);
const bins = new URL('node_modules/.bin/', root);
await mkdir(bins, { recursive: true });

for (const [name, version, command] of [
  ['@topcoat-cloudflare/adapter', '0.2.0', 'topcoat-cloudflare'],
  ['wrangler', '4.142.0', 'wrangler'],
]) {
  const manifest = JSON.parse(await readFile(new URL(`node_modules/${name}/package.json`, root), 'utf8'));
  assert.equal(manifest.version, version, `unexpected ${name} version`);
  const entry = manifest.bin[command];
  assert.ok(entry, `${command} must be provided by the installed package`);
  const wrapper = `#!/bin/sh\nexec node "$(dirname "$0")/../${name}/${entry}" "$@"\n`;
  await writeFile(fileURLToPath(new URL(command, bins)), wrapper, { mode: 0o755 });
}

console.log('Prepared file wrappers for pinned Topcoat adapter and Wrangler.');
