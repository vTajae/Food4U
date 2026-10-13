import assert from 'node:assert/strict';
import test from 'node:test';
import { performance } from 'node:perf_hooks';
import { base, newFixture, seedFixture, authFor, login, cookieValue, session, sessionKeys,
  logout, me, signedCookie, jsonRequest, compare, jwt, jwtSecret, randomUUID } from './auth-fixtures.mjs';

test('a bcrypt-ts account can enter the Rust login flow', async () => {
  const fixture = await newFixture();
  assert.match(fixture.row.user_password, /^\$2[aby]\$10\$/);
  const response = await fetch(`${base}/login`);
  assert.equal(response.status, 200, 'existing bcrypt-ts users need a real Rust login page');
  assert.match(await response.text(), /<form\b/);
});

test('bcrypt-ts D1 credentials log in through the Rust server procedure', async () => {
  const fixture = await seedFixture();
  const response = await login(fixture);
  assert.equal(await response.json(), '');
  const cookie = cookieValue(response);
  try {
    const page = await me(cookie);
    assert.equal(page.status, 200);
    assert.ok((await page.text()).includes(fixture.row.username));
  } finally { await logout(cookie); }
});

test('Rust registration produces bcrypt-ts compatible cost-10 hashes and existing D1 fields', async () => {
  const username = `rust-${randomUUID()}`;
  const password = 'Rust registration password 002!';
  const before = Math.floor(Date.now() / 1000);
  const response = await fetch(`${base}/register`, { method: 'POST', redirect: 'manual',
    headers: { origin: base }, body: new URLSearchParams({ username, password }) });
  assert.equal(response.status, 200);
  const registered = await response.json();
  assert.equal(registered.registered, true);
  const row = await (await fetch(`${base}/_spike/user?username=${encodeURIComponent(username)}`)).json();
  assert.equal(row.public_id, registered.public_id);
  assert.match(row.public_id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.equal(row.user_role, '2');
  assert.ok(Number.isInteger(row.user_id));
  assert.ok(Number.isInteger(row.createdAt) && row.createdAt >= before && row.createdAt <= Math.floor(Date.now() / 1000));
  assert.equal(row.updatedAt, row.createdAt);
  assert.match(row.user_password, /^\$2[aby]\$10\$/);
  assert.equal(await compare(password, row.user_password), true);
  assert.equal(await compare('wrong password', row.user_password), false);
});

test('Rust session cookie and KV value match the Next.js wire contract', async () => {
  const fixture = await seedFixture();
  const before = Math.floor(Date.now() / 1000);
  const response = await login(fixture);
  const cookie = cookieValue(response);
  try {
    const id = cookie.slice(0, cookie.lastIndexOf('.'));
    assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    assert.equal(cookie, await signedCookie(id));
    const header = response.headers.get('set-cookie');
    for (const attribute of [/;\s*HttpOnly(?:;|$)/i, /;\s*Secure(?:;|$)/i,
      /;\s*SameSite=Lax(?:;|$)/i, /;\s*Path=\/(?:;|$)/i, /;\s*Max-Age=2592000(?:;|$)/i]) {
      assert.match(header, attribute);
    }
    const data = await session(id);
    assert.deepEqual(data.auth, authFor(fixture.row));
    assert.equal(typeof data.token, 'string');
    const key = (await sessionKeys()).find(entry => entry.name === `session:${id}`);
    assert.ok(key, 'KV key must be prefixed session:');
    assert.ok(key.expiration >= before + 2592000 && key.expiration <= Math.floor(Date.now() / 1000) + 2592000);
  } finally { await logout(cookie); }
});

test('Rust JWT is accepted by the existing frontend verifier with stable public identity and 30-minute expiry', async () => {
  const fixture = await seedFixture();
  const before = Math.floor(Date.now() / 1000);
  const response = await login(fixture);
  const cookie = cookieValue(response);
  try {
    const { token } = await session(cookie.slice(0, cookie.lastIndexOf('.')));
    assert.equal(await jwt.verify(token, jwtSecret), true);
    const { header, payload } = jwt.decode(token);
    assert.equal(header.alg, 'HS256');
    assert.equal(payload.user_id, fixture.row.public_id);
    assert.equal(payload.username, fixture.row.username);
    assert.equal(payload.role, fixture.row.user_role);
    assert.ok(payload.exp >= before + 1800 && payload.exp <= Math.floor(Date.now() / 1000) + 1800);
    console.log(`PYJWT_FIXTURE ${JSON.stringify({ token, public_id: fixture.row.public_id, issued_before: before })}`);
  } finally { await logout(cookie); }
});

test('a TS-signed cookie and TS-created KV session are accepted by Rust /me', async () => {
  const fixture = await seedFixture();
  const id = randomUUID();
  const data = { auth: authFor(fixture.row),
    token: await jwt.sign({ user_id: fixture.row.public_id, username: fixture.row.username,
      role: fixture.row.user_role, exp: Math.floor(Date.now() / 1000) + 1800 }, jwtSecret),
    welcome: { isComplete: false }, flash: { error: 'fixture flash' } };
  await jsonRequest('/_spike/session', { id, data }, 'PUT');
  const cookie = await signedCookie(id);
  try {
    const page = await me(cookie);
    assert.equal(page.status, 200);
    assert.ok((await page.text()).includes(fixture.row.username));
    assert.deepEqual(await session(id), data);
  } finally { await logout(cookie); }
});

test('tampering with a valid session signature cannot authenticate /me', async () => {
  const fixture = await seedFixture();
  const response = await login(fixture);
  const cookie = cookieValue(response);
  try {
    const dot = cookie.lastIndexOf('.');
    const tampered = `${cookie.slice(0, dot + 1)}${cookie[dot + 1] === 'A' ? 'B' : 'A'}${cookie.slice(dot + 2)}`;
    const page = await me(tampered);
    assert.equal(page.status, 303);
    assert.equal(new URL(page.headers.get('location'), base).pathname, '/login');
  } finally { await logout(cookie); }
});

test('schema-invalid KV session reports a server error instead of silently treating it as logout', async () => {
  const id = randomUUID();
  const cookie = await signedCookie(id);
  await jsonRequest('/_spike/session', { id, data: { auth: {} } }, 'PUT');
  try {
    const response = await me(cookie);
    assert.equal(response.status, 500, 'incompatible persisted session data must surface an error');
  } finally { await logout(cookie); }
});

test('a validly signed cookie with no KV session still redirects to login', async () => {
  const response = await me(await signedCookie(randomUUID()));
  assert.equal(response.status, 303);
  assert.equal(new URL(response.headers.get('location'), base).pathname, '/login');
});

for (const [label, expected] of [['unknown user', 'User does not exist.'], ['wrong password', 'Incorrect password.']]) {
  test(`${label} returns its exact error without a cookie or KV session`, async () => {
    const fixture = label === 'unknown user' ? await newFixture() : await seedFixture();
    const before = await sessionKeys();
    const response = await login(fixture, 'definitely wrong');
    assert.equal(await response.json(), expected);
    assert.equal(response.headers.get('set-cookie'), null);
    assert.deepEqual(await sessionKeys(), before);
  });
}

test('logout deletes the session KV record, clears its cookie, and rejects replay', async () => {
  const fixture = await seedFixture();
  const cookie = cookieValue(await login(fixture));
  const id = cookie.slice(0, cookie.lastIndexOf('.'));
  assert.ok(await session(id));
  const response = await logout(cookie);
  assert.equal(response.status, 303);
  assert.equal(new URL(response.headers.get('location'), base).pathname, '/login');
  assert.match(response.headers.get('set-cookie'), /__session=;/);
  assert.match(response.headers.get('set-cookie'), /Max-Age=0/i);
  assert.equal(await session(id), null);
  assert.equal((await me(cookie)).status, 303);
});

test('cost-10 bcrypt verification is measured over 20 local-workerd and Node runs', async () => {
  const fixture = await newFixture();
  const rust = [];
  const typescript = [];
  const warmup = await (await jsonRequest('/_spike/bcrypt', { password: fixture.password, hash: fixture.row.user_password })).json();
  assert.equal(warmup.valid, true);
  assert.equal(await compare(fixture.password, fixture.row.user_password), true);
  for (let i = 0; i < 20; i++) {
    const result = await (await jsonRequest('/_spike/bcrypt', { password: fixture.password, hash: fixture.row.user_password })).json();
    assert.equal(result.valid, true);
    assert.ok(Number.isFinite(result.elapsed_ms) && result.elapsed_ms > 0, 'timing clock must advance during bcrypt verification');
    rust.push(result.elapsed_ms);
    const start = performance.now();
    assert.equal(await compare(fixture.password, fixture.row.user_password), true);
    const elapsed = performance.now() - start;
    assert.ok(Number.isFinite(elapsed) && elapsed > 0);
    typescript.push(elapsed);
  }
  function summary(samples) {
    const sorted = [...samples].sort((a, b) => a - b);
    return { samples, median_ms: (sorted[9] + sorted[10]) / 2, p95_ms: sorted[18] };
  }
  console.log(`BCRYPT_TIMING ${JSON.stringify({ rust: summary(rust), bcrypt_ts: summary(typescript),
    warmup_runs_per_runtime: 1, measured_runs_per_runtime: 20,
    note: 'Local workerd timing is indicative only, not deployed CPU billing. Free 10ms/request; Paid default 30000ms.' })}`);
});
