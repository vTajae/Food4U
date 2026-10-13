import assert from 'node:assert/strict';
import { randomUUID, webcrypto } from 'node:crypto';
import { hash, compare } from '../../frontend/node_modules/bcrypt-ts/dist/node.mjs';
import * as jwt from '../../frontend/node_modules/@tsndr/cloudflare-worker-jwt/index.js';

export { hash, compare, jwt, randomUUID };
export const base = process.env.SPIKE_URL || 'http://127.0.0.1:8789';
const origin = new URL(base);
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(origin.hostname), 'fixtures are localhost only');
export const sessionSecret = 'food4u-rust-spike-fake-session-secret-32bytes';
export const jwtSecret = 'food4u-rust-spike-fake-jwt-secret-32bytes';

// Independently reproduce session.ts WebCrypto, not Rust's implementation.
export async function signedCookie(id) {
  const encoder = new TextEncoder();
  const key = await webcrypto.subtle.importKey('raw', encoder.encode(sessionSecret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await webcrypto.subtle.sign('HMAC', key, encoder.encode(id));
  return `${id}.${Buffer.from(signature).toString('base64url')}`;
}

export async function newFixture() {
  const password = 'Local compatibility password 002!';
  return {
    password,
    row: {
      username: `ts-${randomUUID()}`,
      public_id: randomUUID(),
      user_password: await hash(password, 10),
      user_role: '2',
      createdAt: 1700000000,
      updatedAt: 1700000001,
    },
  };
}

export async function jsonRequest(path, body, method = 'POST') {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { 'content-type': 'application/json', origin: base },
    body: JSON.stringify(body),
    redirect: 'manual',
  });
  assert.equal(response.status, 200, `${method} ${path}: ${await response.clone().text()}`);
  return response;
}

export async function seedFixture() {
  const fixture = await newFixture();
  await jsonRequest('/_spike/seed-user', fixture.row);
  const response = await fetch(`${base}/_spike/user?username=${encodeURIComponent(fixture.row.username)}`);
  assert.equal(response.status, 200);
  fixture.row = await response.json();
  return fixture;
}

export function authFor(row) {
  return { username: row.username, id: row.user_id, publicId: row.public_id,
    role: row.user_role, createdAt: row.createdAt, updatedAt: row.updatedAt };
}

export async function login(fixture, password = fixture.password) {
  return jsonRequest('/api/login', [fixture.row.username, password]);
}

export function cookieValue(response) {
  const header = response.headers.get('set-cookie');
  assert.ok(header, 'login must set a cookie');
  const value = header.match(/(?:^|,\s*)__session=([^;]+)/)?.[1];
  assert.ok(value, 'login must set __session');
  return value;
}

export async function session(id) {
  const response = await fetch(`${base}/_spike/session?id=${encodeURIComponent(id)}`);
  assert.equal(response.status, 200);
  return response.json();
}

export async function sessionKeys() {
  const response = await fetch(`${base}/_spike/sessions`);
  assert.equal(response.status, 200);
  return (await response.json()).keys;
}

export async function logout(cookie) {
  return fetch(`${base}/logout`, { method: 'POST',
    headers: { cookie: `__session=${cookie}`, origin: base }, redirect: 'manual' });
}

export async function me(cookie) {
  return fetch(`${base}/me`, { headers: { cookie: `__session=${cookie}` }, redirect: 'manual' });
}
