import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { d1Query, frontend, isMain, runCommand, wranglerArgs } from './post-deploy-common.mjs';

export async function main(args, { run = runCommand, write = console.log } = {}) {
  let result;
  try {
    if (args.length) throw new Error('arguments');
    const migrations = (await readdir(resolve(frontend, 'database/migrations'))).filter(name => name.endsWith('.sql')).sort();
    if (!migrations.length) throw new Error('no migration files');
    // List initializes/uses Wrangler's own tracking table. Its exit status alone
    // does NOT distinguish pending migrations, and its output has no JSON mode.
    await run(process.execPath, wranglerArgs(['d1', 'migrations', 'list', 'food4u-db', '--remote']), { cwd: frontend });
    const applied = new Set((await d1Query('SELECT name FROM d1_migrations', run)).map(row => row.name));
    const missing = migrations.filter(name => !applied.has(name));
    result = { result: missing.length ? 'FAIL' : 'PASS', checked: migrations.length, missing };
  } catch {
    result = { result: 'FAIL', reason: args.length ? 'no arguments accepted' : 'D1 migration check failed; verify CLI authentication, configuration and tracking' };
  }
  write(`D1_SCHEMA ${JSON.stringify(result)}`);
  return result.result === 'PASS' ? 0 : 1;
}

if (isMain(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
