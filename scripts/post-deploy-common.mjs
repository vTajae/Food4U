import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const frontend = resolve(root, 'frontend');

// Pure inspection of an Object.entries(localStorage) snapshot. Never choose an
// arbitrary account or accept an ownerless legacy draft in a fresh check context.
export function scopedIntakeDraft(entries) {
  const pattern = /^food4u:intake:v1:([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
  const drafts = entries.filter(([key]) => pattern.test(key));
  if (drafts.length !== 1 || entries.some(([key]) => key === 'formState')) return null;
  const [key, raw] = drafts[0];
  try {
    const envelope = JSON.parse(raw);
    if (!envelope || envelope.version !== 1 || envelope.identity !== pattern.exec(key)[1] || !Array.isArray(envelope.state?.answers)) return null;
    return { key, envelope };
  } catch { return null; }
}

export function hasOfficialRhinitisDraft(entries) {
  const draft = scopedIntakeDraft(entries);
  return draft !== null && draft.envelope.state.answers.some(question => question?.questionId === 1 &&
    Array.isArray(question.answers) && question.answers.some(answer => answer?.code === 'J30.9' && answer.name === 'Allergic rhinitis, unspecified'));
}

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
