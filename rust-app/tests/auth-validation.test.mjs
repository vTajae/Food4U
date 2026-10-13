import assert from 'node:assert/strict';
import test from 'node:test';
import { z } from '../../frontend/node_modules/zod/index.js';
import { base, jsonRequest, randomUUID, compare, cookieValue, session, logout } from './auth-fixtures.mjs';

const schema = z.object({
  username: z.string().email('Enter a valid email address.').trim(),
  password: z.string().min(6, 'Use at least 6 characters.').trim(),
});

test('both public procedures enforce the frontend Zod validation before D1 writes', async () => {
  const cases = [
    ['', ''], ['invalid', 'abcdef'], ['a@b', 'abcdef'], [' a@example.test', 'abcdef'],
    ['a@example.test ', 'abcdef'], ['.a@example.test', 'abcdef'], ['a..b@example.test', 'abcdef'],
    ["a'@example.test", 'abcdef'], ['a@-example.test', 'abcdef'], ['a@ex_ample.test', 'abcdef'],
    ['a@example.t', 'abcdef'], ['é@example.test', 'abcdef'], ['a@example.test\n', 'abcdef'],
    ['a@example.test', ''], ['a@example.test', '12345'], ['a@example.test', '😀😀a'],
  ];
  for (const [username, password] of cases) {
    const expected = schema.safeParse({ username, password });
    assert.equal(expected.success, false);
    for (const path of ['/api/login', '/api/register']) {
      const response = await jsonRequest(path, [username, password]);
      assert.equal(await response.json(), expected.error.issues[0].message, `${path}: ${JSON.stringify([username, password])}`);
      assert.equal(response.headers.get('set-cookie'), null);
    }
  }
});

test('public registration uses cost 10, UUID, seconds and preserves welcome through login/logout', async () => {
  const username = `public-${randomUUID()}@example.test`;
  const password = '\uFEFF😀😀😀\u00a0';
  const parsed = schema.parse({ username, password });
  const before = Math.floor(Date.now() / 1000);
  const registration = await jsonRequest('/api/register', [username, password]);
  assert.equal(await registration.json(), '');
  const registrationCookie = cookieValue(registration);
  const rowResponse = await fetch(`${base}/_spike/user?username=${encodeURIComponent(username)}`);
  assert.equal(rowResponse.status, 200);
  const row = await rowResponse.json();
  assert.match(row.public_id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.equal(row.user_role, '2');
  assert.ok(Number.isInteger(row.createdAt) && row.createdAt >= before && row.createdAt <= Math.floor(Date.now() / 1000));
  assert.equal(row.updatedAt, row.createdAt);
  assert.match(row.user_password, /^\$2[aby]\$10\$/);
  assert.equal(await compare(parsed.password, row.user_password), true);
  assert.deepEqual(await session(registrationCookie.slice(0, registrationCookie.lastIndexOf('.'))), { welcome: { isComplete: false } });
  const duplicate = await jsonRequest('/api/register', [username, password]);
  assert.equal(await duplicate.json(), 'User already exists.');
  const login = await fetch(`${base}/api/login`, { method: 'POST', headers: {
    'content-type': 'application/json', origin: base, cookie: `__session=${registrationCookie}`,
  }, body: JSON.stringify([username, '😀😀😀']), redirect: 'manual' });
  assert.equal(login.status, 200);
  assert.equal(await login.json(), '');
  const cookie = cookieValue(login);
  const data = await session(cookie.slice(0, cookie.lastIndexOf('.')));
  assert.equal(data.auth.username, username);
  assert.deepEqual(data.welcome, { isComplete: false });
  const destroy = await fetch(`${base}/api/auth/logout`, { method: 'POST', headers: { origin: base, cookie: `__session=${cookie}` }, redirect: 'manual' });
  assert.equal(destroy.status, 303);
  assert.equal(destroy.headers.get('location'), '/login');
  const replay = await fetch(`${base}/me`, { headers: { cookie: `__session=${cookie}` }, redirect: 'manual' });
  assert.equal(replay.status, 303);
  await logout(registrationCookie);
});
