// Record first command-to-ready latency, including cold tool preparation.
import { spawn } from 'node:child_process';
import { mkdir, writeFile, appendFile } from 'node:fs/promises';

await mkdir('.evidence', { recursive: true });
await writeFile('.evidence/dev.log', '');
const start = performance.now();
await writeFile('.evidence/cold-dev.json', JSON.stringify({ status: 'starting' }));
const child = spawn('npx', ['wrangler', 'dev', '--local', '--ip', '127.0.0.1', '--port', '8789'], {
  env: process.env,
  stdio: ['inherit', 'pipe', 'pipe'],
});
let pending = '';
let recorded = false;
let writes = Promise.resolve();

for (const stream of [child.stdout, child.stderr]) {
  stream.on('data', chunk => {
    const text = chunk.toString();
    process.stdout.write(text);
    writes = writes.then(() => appendFile('.evidence/dev.log', text));
    pending += text;
    if (!recorded && /Ready on http:\/\/127\.0\.0\.1:8789/.test(pending)) {
      recorded = true;
      const seconds = (performance.now() - start) / 1000;
      writes = writes.then(() => writeFile('.evidence/cold-dev.json', JSON.stringify({
        status: 'ready',
        command: 'npx wrangler dev --local --ip 127.0.0.1 --port 8789',
        commandToReadySeconds: seconds,
        targetDirectory: process.env.CARGO_TARGET_DIR || 'target',
      }, null, 2)));
      process.stdout.write(`\nCOLD_DEV_READY_SECONDS=${seconds.toFixed(3)}\n`);
    }
    pending = pending.slice(-1000);
  });
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
child.on('error', error => {
  process.stderr.write(`${error}\n`);
  process.exitCode = 1;
});
child.on('close', async code => {
  await writes;
  process.exitCode = code ?? 1;
});
