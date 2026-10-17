import assert from 'node:assert/strict';
import test from 'node:test';

const base = process.env.SPIKE_URL || 'http://127.0.0.1:8789';

test('anonymous root reaches the server-rendered login surface', async () => {
  const response = await fetch(base);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
  assert.equal(new URL(response.url).pathname, '/login');
  assert.match(await response.text(), /Welcome back/);
});

test('the page stylesheet is a served CSS asset', async () => {
  const response = await fetch(base);
  const html = await response.text();
  const stylesheet = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)]
    .find(match => new URL(match[1], base).origin === new URL(base).origin);
  assert.ok(stylesheet, 'the SSR page must link its stylesheet');
  const asset = await fetch(new URL(stylesheet[1], base));
  assert.equal(asset.status, 200);
  assert.match(asset.headers.get('content-type'), /text\/css/);
  assert.match(await asset.text(), /color-scheme/);
});

test('the SSR page loads the generated Topcoat browser runtime', async () => {
  const response = await fetch(base);
  const html = await response.text();
  const runtime = html.match(/<script\b[^>]*src="([^"]+)"[^>]*>/);
  assert.ok(runtime, 'topcoat::runtime::script() must emit a runtime script');
  const script = await fetch(new URL(runtime[1], base));
  assert.equal(script.status, 200);
  assert.match(script.headers.get('content-type'), /(?:java|ecma)script/);
  assert.ok((await script.text()).length > 0, 'the runtime must not be empty');
});
