import assert from 'node:assert/strict';
import test from 'node:test';
import { hashSync } from '../../../frontend/node_modules/bcrypt-ts/dist/browser.mjs';
import worker from './worker.mjs';

const request = (body, method = 'POST', path = '/_spike/bcrypt') =>
  new Request(`http://localhost${path}`, {
    method,
    ...(method === 'POST' ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
  });

test('health identifies the benchmark without verifying a password', async () => {
  const response = await worker.fetch(request(undefined, 'GET', '/_spike/health'));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    ready: true, runtime: 'bcrypt-ts/workerd', version: '5.0.3',
  });
});

test('bcrypt contract accepts cost 10 and rejects malformed input', async () => {
  const password = 'synthetic-benchmark-fixture';
  const hash = hashSync(password, '$2b$10$......................');
  for (const [candidate, valid] of [[password, true], ['wrong-fixture', false]]) {
    const response = await worker.fetch(request({ password: candidate, hash }));
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.deepEqual(Object.keys(result).sort(), ['elapsed_ms', 'runtime', 'valid', 'version']);
    assert.equal(result.valid, valid);
    assert.equal(result.runtime, 'bcrypt-ts/workerd');
    assert.equal(result.version, '5.0.3');
    assert.ok(Number.isInteger(result.elapsed_ms) && result.elapsed_ms >= 0);
  }
  for (const input of ['{', null, [], {}, { password: 1, hash },
    { password, hash: hash.replace('$10$', '$11$') },
    { password, hash: 'not-a-bcrypt-hash' }]) {
    assert.equal((await worker.fetch(request(input))).status, 400);
  }
  assert.equal((await worker.fetch(request(undefined, 'GET'))).status, 400);
  assert.equal((await worker.fetch(request({}, 'POST', '/unknown'))).status, 404);
});
