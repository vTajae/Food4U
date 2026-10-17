import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const frontend = resolve(root, 'frontend');

// Capture privately: upstream errors can contain credentials or connection URLs.
export function runCommand(command, args, { cwd = root, input, env = process.env } = {}) {
  return new Promise((ok, fail) => {
    const child = spawn(command, args, { cwd, env, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    const timeout = setTimeout(() => child.kill(), 120000);
    child.stdout.on('data', data => { stdout += data; });
    child.stderr.resume();
    child.stdin.on('error', () => {});
    child.once('error', () => { clearTimeout(timeout); fail(new Error('command failed')); });
    child.once('close', code => {
      clearTimeout(timeout);
      if (code !== 0) fail(new Error('command failed'));
      else ok(stdout.trim());
    });
    child.stdin.end(input);
  });
}

export function wranglerArgs(args) {
  return [resolve(frontend, 'node_modules/wrangler/bin/wrangler.js'), ...args, '--config', resolve(frontend, 'wrangler.jsonc')];
}

export async function d1Query(sql, run = runCommand) {
  const data = JSON.parse(await run(process.execPath, wranglerArgs([
    'd1', 'execute', 'food4u-db', '--remote', '--command', sql, '--json',
  ]), { cwd: frontend }));
  if (!Array.isArray(data) || data.length !== 1 || data[0].success !== true || !Array.isArray(data[0].results)) {
    throw new Error('invalid D1 response');
  }
  return data[0].results;
}

export function isMain(url) {
  return !!process.argv[1] && fileURLToPath(url) === resolve(process.argv[1]);
}
