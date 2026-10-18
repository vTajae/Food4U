// Fresh build of byte-identical product sources in an owned temporary project.
// No owner env files, normal dist, deployment pointer or product source changes.
/* eslint-env node */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile, symlink, access } from 'node:fs/promises';
import { resolve, relative, join } from 'node:path';
const temp = process.argv[2];
const frontend = process.cwd();
const project = resolve(temp, 'project');
await mkdir(project);
const sourceHashes = {};
const excluded = new Set(['node_modules', 'dist', 'e2e', 'playwright-report', 'test-results', 'tests', 'scripts', 'playwright.config.ts', 'wrangler.jsonc']);
async function copySources(source, target) {
  await mkdir(target, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if ((source === frontend && (entry.name.startsWith('.') || excluded.has(entry.name))) ||
      /^(?:\.env(?:\.|$)|\.dev\.vars(?:\.|$)|\.neon$|node_modules$|\.git$)/.test(entry.name)) continue;
    assert.ok(!entry.isSymbolicLink(), `refuse source symlink: ${entry.name}`);
    const from = join(source, entry.name), to = join(target, entry.name);
    if (entry.isDirectory()) await copySources(from, to);
    else {
      const bytes = await readFile(from);
      sourceHashes[relative(frontend, from).replaceAll('\\', '/')] = createHash('sha256').update(bytes).digest('hex');
      await writeFile(to, bytes);
    }
  }
}
await copySources(frontend, project);
// Fault injection exists ONLY in this private test build. Product source bytes
// remain unchanged; no environment switch or crash route ships to production.
const faultPath = 'app/e2e-error-019/page.tsx';
await assert.rejects(access(resolve(frontend, faultPath)), { code: 'ENOENT' });
const faultSource = `"use client";
import { useState } from "react";
export default function TestFaultPage() {
  const [attempt, setAttempt] = useState(0);
  if (typeof window !== "undefined" && sessionStorage.getItem("e2e-error-019") === "fail") {
    throw new Error("E2E_ERROR_019_EXPECTED");
  }
  return <main><h1>Error boundary test ready</h1><button onClick={() => {
    sessionStorage.setItem("e2e-error-019", "fail"); setAttempt(attempt + 1);
  }}>Trigger test fault</button></main>;
}
`;
await mkdir(resolve(project, 'app/e2e-error-019'));
await writeFile(resolve(project, faultPath), faultSource);
const switchPath = 'app/e2e-draft-019/page.tsx';
await assert.rejects(access(resolve(frontend, switchPath)), { code: 'ENOENT' });
const switchSource = `"use client";
import { useLayoutEffect, useState } from "react";
import { FormProvider } from "~/components/form/context";
import { OnboardingStepper } from "~/components/onboarding/stepper";
export default function IdentitySwitchPage() {
  const [identity, setIdentity] = useState("11111111-1111-4111-8111-111111111111");
  const [observed, setObserved] = useState("initial");
  useLayoutEffect(() => {
    if (identity.startsWith("2222")) setObserved(document.querySelector("[data-intake]").textContent.includes("Italian") ? "leaked" : "clean");
  }, [identity]);
  return <main><button onClick={() => setIdentity("22222222-2222-4222-8222-222222222222")}>Switch synthetic account</button>
    <output aria-label="Identity switch privacy">{observed}</output>
    <div data-intake><FormProvider identity={identity}><OnboardingStepper /></FormProvider></div></main>;
}
`;
await mkdir(resolve(project, 'app/e2e-draft-019'));
await writeFile(resolve(project, switchPath), switchSource);
await symlink(resolve(frontend, 'node_modules'), resolve(project, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
// Public JSONC currently uses line comments only; fail closed if its syntax changes.
const config = JSON.parse((await readFile(resolve(frontend, 'wrangler.jsonc'), 'utf8')).replace(/^\s*\/\/.*$/gm, ''));
for (const binding of ['services', 'r2_buckets', 'queues', 'durable_objects', 'hyperdrive', 'unsafe', 'workflows', 'send_email', 'dispatch_namespaces', 'mtls_certificates', 'browser', 'ai', 'vectorize']) {
  assert.ok(!config[binding], `new binding requires explicit test isolation: ${binding}`);
}
Object.assign(config, { name: 'food4u-e2e-build', vars: { API_BASE_URL: 'http://127.0.0.1:9', JWT_ACCESS_TOKEN_EXPIRE_MINUTES: '30m' },
  kv_namespaces: [{ binding: 'cloudflare_KV', id: '01801801801801801801801801801801', remote: false }],
  d1_databases: [{ binding: 'cloudflare_db', database_name: 'food4u-e2e-build', database_id: '01801801-8018-4018-8018-018018018018', remote: false }],
});
delete config.$schema;
await writeFile(resolve(project, 'wrangler.jsonc'), JSON.stringify(config));
const child = spawn(process.execPath, [resolve(frontend, 'node_modules/vite/bin/vite.js'), 'build'], {
  cwd: project, windowsHide: true, stdio: 'inherit',
  env: { ...process.env, CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: 'false' },
});
const code = await new Promise((ok, no) => { child.once('error', no); child.once('close', ok); });
assert.equal(code, 0, 'fresh isolated built Worker');
// Prove neither the source snapshot nor the actual checkout changed mid-build.
for (const [path, expected] of Object.entries(sourceHashes)) {
  for (const base of [project, frontend]) assert.equal(createHash('sha256').update(await readFile(resolve(base, path))).digest('hex'), expected, `stable unmodified source: ${path}`);
}
await writeFile(resolve(frontend, 'e2e/.artifacts/018-source-build.json'), JSON.stringify({ fresh_build: true, source_hashes: sourceHashes, source_files: Object.keys(sourceHashes).length,
  test_only_injection: { path: faultPath, sha256: createHash('sha256').update(faultSource).digest('hex'), absent_from_checkout: true },
  test_only_identity_switch: { path: switchPath, sha256: createHash('sha256').update(switchSource).digest('hex'), absent_from_checkout: true },
  worker_sha256: createHash('sha256').update(await readFile(resolve(project, 'dist/server/index.js'))).digest('hex'),
  private_build_and_deploy_pointer: true }, null, 2));
