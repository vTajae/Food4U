import assert from 'node:assert/strict';
import test from 'node:test';
import { base, randomUUID, jsonRequest, cookieValue, session, signedCookie,
  logout, seedFixture, authFor, jwt, jwtSecret } from './auth-fixtures.mjs';

const idOf = cookie => cookie.slice(0, cookie.lastIndexOf('.'));
const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
async function signIn(username, password, cookie) {
  return fetch(`${base}/api/login`, { method: 'POST', redirect: 'manual',
    headers: { origin: base, 'content-type': 'application/json', cookie: `__session=${cookie}` },
    body: JSON.stringify([username, password]) });
}
async function dashboard(cookie) {
  return fetch(`${base}/dashboard`, { headers: { cookie: `__session=${cookie}` }, redirect: 'manual' });
}
async function assertReplayRejected(cookie) {
  const response = await dashboard(cookie);
  assert.equal(response.status, 303, 'The retired session cannot authenticate a protected page');
  assert.equal(new URL(response.headers.get('location'), base).pathname, '/login');
  await response.text();
}
async function registered() {
  const username = `rotation-${randomUUID()}@example.test`;
  const password = 'Local rotation password 006!';
  const response = await jsonRequest('/api/register', [username, password]);
  assert.equal(await response.json(), '');
  const cookie = cookieValue(response);
  const cookies = new Set([cookie]);
  try {
    assert.match(idOf(cookie), uuidV4);
    assert.deepEqual(await session(idOf(cookie)), { welcome: { isComplete: false } });
    const rowResponse = await fetch(`${base}/_spike/user?username=${encodeURIComponent(username)}`);
    assert.equal(rowResponse.status, 200);
    return { username, password, cookie, cookies, row: await rowResponse.json() };
  } catch (error) { await logout(cookie); throw error; }
}
async function clean(cookies) {
  // Delete all identities, including a newly issued cookie if a later assertion failed.
  for (const cookie of cookies) await logout(cookie);
}

test('failed login does not rotate, overwrite or delete a pre-login registration session', async () => {
  const fixture = await registered();
  try {
    const data = { welcome: { isComplete: false, step: 'review', draft: { diet: 'local-only' } }, flash: { info: 'retained after failure' } };
    await jsonRequest('/_spike/session', { id: idOf(fixture.cookie), data }, 'PUT');
    const response = await signIn(fixture.username, 'incorrect password', fixture.cookie);
    assert.equal(response.status, 200);
    assert.equal(await response.json(), 'Incorrect password.');
    assert.equal(response.headers.get('set-cookie'), null, 'Failure must not issue any session cookie');
    assert.deepEqual(await session(idOf(fixture.cookie)), data, 'Unsuccessful authentication preserves the exact prior KV data');
    await assertReplayRejected(fixture.cookie);
  } finally { await clean(fixture.cookies); }
});

test('successful login rotates registration and authenticated session IDs, preserves data and deletes every retired KV key', async () => {
  const fixture = await registered();
  try {
    const carried = { welcome: { isComplete: false, step: 'review', draft: { diet: 'local-only' } }, flash: { info: 'retained through rotation', errors: ['local fixture'] } };
    await jsonRequest('/_spike/session', { id: idOf(fixture.cookie), data: carried }, 'PUT');
    let previousCookie = fixture.cookie;
    for (const phase of ['pre-login registration', 'already authenticated']) {
      const response = await signIn(fixture.username, fixture.password, previousCookie);
      assert.equal(response.status, 200);
      assert.equal(await response.json(), '');
      const cookie = cookieValue(response);
      fixture.cookies.add(cookie);
      const id = idOf(cookie);
      assert.notEqual(id, idOf(previousCookie), `Successful login must replace the ${phase} session id`);
      assert.match(id, uuidV4);
      assert.equal(cookie, await signedCookie(id), 'New cookie retains the independently verified wire signature');
      const current = await session(id);
      assert.deepEqual(current.welcome, carried.welcome);
      assert.deepEqual(current.flash, carried.flash);
      assert.deepEqual(current.auth, authFor(fixture.row));
      assert.equal(await jwt.verify(current.token, jwtSecret), true);
      assert.equal(jwt.decode(current.token).payload.user_id, fixture.row.public_id);
      assert.equal(await session(idOf(previousCookie)), null, 'Rotation must delete the old session:<id> KV key');
      await assertReplayRejected(previousCookie);
      const protectedPage = await dashboard(cookie);
      assert.equal(protectedPage.status, 200, 'Replacement cookie authenticates the protected page');
      await protectedPage.text();
      previousCookie = cookie;
    }
    assert.equal(fixture.cookies.size, 3, 'Registration plus two successful logins yield three distinct identities');
    for (const retired of fixture.cookies) if (retired !== previousCookie) {
      assert.equal(await session(idOf(retired)), null);
      await assertReplayRejected(retired);
    }
  } finally { await clean(fixture.cookies); }
});

test('a valid signed cookie without a KV record cannot select the new authenticated session ID', async () => {
  const fixture = await seedFixture();
  const attackerSelectedId = randomUUID();
  const oldCookie = await signedCookie(attackerSelectedId);
  const cookies = new Set([oldCookie]);
  try {
    assert.equal(await session(attackerSelectedId), null);
    const response = await signIn(fixture.row.username, fixture.password, oldCookie);
    assert.equal(response.status, 200);
    assert.equal(await response.json(), '');
    const cookie = cookieValue(response);
    cookies.add(cookie);
    assert.notEqual(idOf(cookie), attackerSelectedId, 'Login must generate a fresh ID even when a valid signature names missing KV');
    assert.match(idOf(cookie), uuidV4);
    assert.equal(cookie, await signedCookie(idOf(cookie)));
    assert.equal(await session(attackerSelectedId), null);
    assert.deepEqual((await session(idOf(cookie))).auth, authFor(fixture.row));
    await assertReplayRejected(oldCookie);
  } finally { await clean(cookies); }
});
