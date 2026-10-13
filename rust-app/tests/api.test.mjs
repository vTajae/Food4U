import assert from 'node:assert/strict';
import test, { before, after } from 'node:test';
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { z } from '../../frontend/node_modules/zod/index.js';
import { base, seedFixture, login, cookieValue, session, logout, jwt, jwtSecret } from './auth-fixtures.mjs';
const control = process.env.FOOD4U_MOCK_CONTROL_URL;
assert.ok(control, 'Run through tests/api-mock.mjs, never against a real backend');
assert.equal(new URL(control).hostname, '127.0.0.1');
const users = [];
async function command(path, body) {
  const response = await fetch(new URL(path, control), { method: body ? 'POST' : 'GET',
    headers: body ? { 'content-type': 'application/json' } : {}, ...(body ? { body: JSON.stringify(body) } : {}) });
  assert.equal(response.status, 200, await response.clone().text()); return response.json();
}
const expect = value => command('expect', value);
async function request(path, { user, fields, multipart = false, raw } = {}) {
  let body;
  if (fields) { body = multipart ? new FormData() : new URLSearchParams(); for (const [k, v] of Object.entries(fields)) body.append(k, v); }
  const response = await fetch(`${base}${path}`, { method: fields || raw !== undefined ? 'POST' : 'GET', redirect: 'manual',
    headers: { origin: base, ...(user ? { cookie: `__session=${user.cookie}` } : {}), ...(raw !== undefined ? { 'content-type': 'application/json' } : {}) },
    ...(body ? { body } : {}), ...(raw !== undefined ? { body: raw } : {}), signal: AbortSignal.timeout(30000) });
  return { status: response.status, body: await response.json() };
}
function equal(actual, status, body) { assert.deepEqual(actual, { status, body }); }
const clinicalData = [3, [], { icd10cm: [[{ code: 'E11', name: 'Diabetes' }], [{ code: 'E11', name: 'duplicate' }], [{ code: 'I10', name: 'Hypertension' }]] }, [['E11', 'Diabetes'], ['I10', 'Hypertension']]];
const mapped = [{ code: 'E11', name: 'Diabetes' }, { code: 'I10', name: 'Hypertension' }];
function clinicalExpectation(query, route = 'conditions', max = 5, rest = {}) {
  return { method: 'GET', path: `/clinical/${route}/v3/search`, query: { terms: query, maxList: String(max), ...(route === 'conditions' ? { ef: 'icd10cm' } : { sf: 'name' }) }, response: clinicalData, ...rest };
}
before(async () => {
  for (let i = 0; i < 2; i++) {
    const fixture = await seedFixture(); const cookie = cookieValue(await login(fixture));
    const data = await session(cookie.slice(0, cookie.lastIndexOf('.')));
    assert.equal(await jwt.verify(data.token, jwtSecret), true);
    assert.equal(jwt.decode(data.token).payload.user_id, fixture.row.public_id);
    await command('token', { publicId: fixture.row.public_id, username: fixture.row.username, token: data.token });
    users.push({ ...fixture, cookie, id: fixture.row.public_id });
  }
  assert.notEqual(users[0].id, users[1].id);
});
after(async () => { for (const user of users) await logout(user.cookie); });

test('Rust source cannot contain the production backend hostname', async () => {
  async function scan(url) { for (const entry of await readdir(url, { withFileTypes: true })) {
    const child = new URL(entry.name + (entry.isDirectory() ? '/' : ''), url);
    if (entry.isDirectory()) await scan(child);
    else assert.equal((await readFile(child, 'utf8')).includes('onrender.com'), false, child.pathname);
  } }
  await scan(new URL('../src/', import.meta.url));
});

test('API ordering: refs and suggestion required fields precede auth, clinical auth precedes even malformed form parsing', async () => {
  equal(await request('/api/refs'), 200, { suggestions: [] });
  equal(await request('/api/refs?query=x&type=conditions'), 401, { suggestions: [], message: 'Please log in.' });
  for (const multipart of [false, true]) {
    equal(await request('/api/clinicals', { fields: {}, multipart }), 401, { message: 'Please log in.' });
    equal(await request('/api/suggestion', { fields: {}, multipart }), 400, { error: 'Missing required parameters: action or queryKey' });
    equal(await request('/api/suggestion', { fields: { action: 'meal', queryKey: 'x' }, multipart }), 401, { error: 'Please log in.' });
  }
  equal(await request('/api/clinicals', { raw: '{}' }), 401, { message: 'Please log in.' });
});

test('clinical validation matches installed Zod flatten fieldErrors including null, enum and UTF16 maximum boundaries', async () => {
  const schema = z.object({ query: z.string().trim().max(100, 'Search query is too long').optional().nullable(), code: z.string().optional().nullable(),
    description: z.string().optional().nullable(), action: z.enum(['autocomplete', 'search', 'consider']), key: z.enum(['conditions', 'icd10cm']) });
  const corpus = [{}, { action: '', key: '' }, { action: 'nope', key: 'bad' }, { action: 'search' }, { key: 'conditions' },
    { action: 'Search', key: 'ICD10CM' }, { action: 'search', key: 'conditions', query: 'x'.repeat(101) },
    { action: 'search', key: 'conditions', query: '😀'.repeat(50) + 'x' }, { action: 'nope', key: 'bad', query: 'x'.repeat(101) }];
  for (const fields of corpus) {
    const parsed = schema.safeParse({ query: fields.query?.trim() || null, code: fields.code || null, description: fields.description || null,
      action: fields.action ?? null, key: fields.key ?? null });
    assert.equal(parsed.success, false);
    for (const multipart of [false, true]) equal(await request('/api/clinicals', { user: users[0], fields, multipart }), 400, { errors: parsed.error.flatten().fieldErrors });
  }
});

test('clinical missing values remain action errors after schema validation in both form encodings', async () => {
  for (const multipart of [false, true]) {
    for (const action of ['autocomplete', 'search']) for (const query of ['', '  \t'])
      equal(await request('/api/clinicals', { user: users[0], fields: { action, key: 'conditions', query }, multipart }), 400, { message: 'Query is required for this action' });
    for (const extra of [{}, { code: 'E11' }, { description: 'Diabetes' }])
      equal(await request('/api/clinicals', { user: users[0], fields: { action: 'consider', key: 'icd10cm', ...extra }, multipart }), 400, { message: 'Both description and medical code are required' });
  }
});

test('refs clinical lookup always requests conditions max10 and deduplicates codes without leaking bearer tokens', async () => {
  for (const type of ['icd10cm', 'conditions']) {
    await expect(clinicalExpectation(`refs-${type}`, 'conditions', 10));
    equal(await request(`/api/refs?query=refs-${type}&type=${type}`, { user: users[0] }), 200, { suggestions: mapped });
  }
});

test('refs diet mapping and bundled string/object values filter case insensitively; backend failures become empty diets', async () => {
  const user = users[0];
  const diets = [{ diet_name: 'Mediterranean', description: 'Fresh food' }, { diet_name: 'Keto', description: 'Low carb' }];
  const dietExpectation = rest => ({ method: 'GET', path: '/backend/refs', query: { queryKey: 'diets' }, user: user.id, response: diets, ...rest });
  await expect(dietExpectation({}));
  equal(await request('/api/refs?query=MED&type=diets', { user }), 200, { suggestions: [{ name: 'Mediterranean', description: 'Fresh food' }] });
  const bundle = JSON.parse(await readFile(new URL('../../frontend/lib/refs/allergies.json', import.meta.url), 'utf8'));
  for (const [type, values] of Object.entries(bundle.autocomplete)) {
    const query = 'A'; const expected = values.map(value => ({ name: typeof value === 'string' ? value : value.name })).filter(s => s.name?.toLowerCase().includes(query.toLowerCase()));
    await expect(dietExpectation({}));
    equal(await request(`/api/refs?query=${query}&type=${encodeURIComponent(type)}`, { user }), 200, { suggestions: expected });
  }
  await expect(dietExpectation({ status: 500, response: { detail: 'down' } }));
  equal(await request('/api/refs?query=x&type=diets', { user }), 200, { suggestions: [] });
  await expect(dietExpectation({}));
  equal(await request('/api/refs?query=x&type=unknown', { user }), 200, { suggestions: [] });
});

test('clinical autocomplete/search map both upstream shapes, trim input, and accept exact 100 UTF16 units', async () => {
  for (const [action, key, query, multipart] of [['autocomplete', 'conditions', '  diabetes  ', false], ['search', 'icd10cm', 'E11', true],
    ['search', 'conditions', 'x'.repeat(100), false], ['autocomplete', 'conditions', '😀'.repeat(50), true]]) {
    await expect(clinicalExpectation(query.trim(), key));
    equal(await request('/api/clinicals', { user: users[0], fields: { action, key, query }, multipart }), 200, { suggestions: mapped });
  }
  await expect(clinicalExpectation('none', 'conditions', 5, { response: [0, [], { icd10cm: [] }, []] }));
  equal(await request('/api/clinicals', { user: users[0], fields: { action: 'search', key: 'conditions', query: 'none' } }), 200, { message: 'No suggestions found', suggestions: [] });
});

test('clinical transport failures produce the brief-prescribed route-specific 500 bodies', async () => {
  await expect(clinicalExpectation('fail-refs', 'conditions', 10, { status: 500, response: { detail: 'local failure' } }));
  equal(await request('/api/refs?query=fail-refs&type=conditions', { user: users[0] }), 500, { suggestions: [], error: 'Error fetching medical codes' });
  await expect(clinicalExpectation('fail-clinical', 'conditions', 5, { status: 500, response: { detail: 'local failure' } }));
  equal(await request('/api/clinicals', { user: users[0], fields: { action: 'search', key: 'conditions', query: 'fail-clinical' } }), 500, { message: 'An error occurred while fetching suggestions.' });
});

test('consider sends exact medical JSON with its own bearer, preserves code text, and distinguishes falsy versus thrown failures', async () => {
  const user = users[0]; const fields = { action: 'consider', key: 'icd10cm', code: 'E11', description: 'Diabetes' };
  const backend = { method: 'POST', path: '/backend/user/medical', user: user.id, body: { icd10cm: 'E11', description: 'Diabetes' } };
  for (const multipart of [false, true]) {
    await expect({ ...backend, response: { saved: true } });
    equal(await request('/api/clinicals', { user, fields, multipart }), 200, { message: 'Medical code E11 has been successfully submitted.', isLoading: false });
  }
  await expect({ ...backend, response: null });
  equal(await request('/api/clinicals', { user, fields }), 500, { message: 'An error occurred while posting the medical code.' });
  await expect({ ...backend, status: 403, response: { detail: 'no profile' } });
  equal(await request('/api/clinicals', { user, fields }), 500, { message: 'An error occurred while submitting the medical code.' });
});

test('all five suggestion actions preserve query/text/nullish precedence and exact backend response mapping', async () => {
  const user = users[0];
  for (const [i, action] of ['meal', 'suggest', 'diets', 'diet', 'recipie'].entries()) {
    const fields = { action, queryKey: 'local-key', ...(i === 0 ? { query: 'query wins', text: 'ignored' } : i === 1 ? { query: '', text: 'ignored' } : i === 2 ? { text: 'fallback' } : {}) };
    const result = { id: action, foods: ['local only'] };
    await expect({ method: 'POST', path: '/backend/api/suggestion', user: user.id, body: { queryKey: fields.queryKey, text: fields.query ?? fields.text ?? '', action }, response: { status: true, result } });
    equal(await request('/api/suggestion', { user, fields, multipart: i % 2 === 1 }), 200, { message: 'Suggestion fetched', meal: result });
  }
  equal(await request('/api/suggestion', { user, fields: { action: 'recipe', queryKey: 'x' } }), 400, { message: 'Unknown action' });
});

test('suggestion status false, null and backend failures are deliberately swallowed to a 200 envelope', async () => {
  const user = users[0]; const fields = { action: 'meal', queryKey: 'failure' };
  for (const response of [{ status: false, result: 'must not leak' }, null]) {
    await expect({ method: 'POST', path: '/backend/api/suggestion', user: user.id, body: { queryKey: 'failure', text: '', action: 'meal' }, response });
    equal(await request('/api/suggestion', { user, fields }), 200, { message: 'Suggestion fetched' });
  }
  await expect({ method: 'POST', path: '/backend/api/suggestion', user: user.id, body: { queryKey: 'failure', text: '', action: 'meal' }, status: 500, raw: 'not json' });
  equal(await request('/api/suggestion', { user, fields }), 200, { message: 'Suggestion fetched' });
});

test('malformed authenticated form requests retain route-specific unexpected-error bodies', async () => {
  equal(await request('/api/clinicals', { user: users[0], raw: '{}' }), 500, { error: 'An unexpected error occurred.' });
  equal(await request('/api/suggestion', { user: users[0], raw: '{}' }), 500, { error: 'An error occurred while processing your request' });
});

test('typed backend errors preserve status and optional detail independently of API fallback envelopes', async () => {
  for (const [name, status, detail, raw] of [['403', 403, 'no profile'], ['500', 500, 'backend down'], ['nonjson', 502, null, 'bad gateway']]) {
    await expect({ method: 'GET', path: `/backend/probe/${name}`, user: users[0].id, status, ...(raw ? { raw } : { response: { detail } }) });
    equal(await request(`/_spike/backend-error?case=${name}`, { user: users[0] }), 200, { kind: 'http', status, detail });
  }
});

test('two independently verified users interleave 24 backend requests each without shared-token leakage', async () => {
  const jobs = [];
  for (let i = 0; i < 24; i++) for (const user of users) {
    const text = `${user.id}:request-${i}`;
    const fields = { queryKey: user.id, text, action: 'meal' };
    const response = { status: true, result: { owner: user.id, text } };
    await expect({ method: 'POST', path: '/backend/api/suggestion', user: user.id, body: fields, response, delay: (i % 5) * 7 });
    jobs.push({ user, fields, response });
  }
  await Promise.all(jobs.map(async ({ user, fields, response }) => equal(await request('/api/suggestion', { user, fields }), 200, { message: 'Suggestion fetched', meal: response.result })));
  const report = await command('report');
  assert.deepEqual(report.violations, []); assert.deepEqual(report.pending, []);
  for (const user of users) assert.ok(report.observed.filter(e => e.user === user.id && e.path === '/backend/api/suggestion').length >= 24);
});

test('backend deadline covers waiting for headers and waiting for a JSON response body', { timeout: 35000 }, async () => {
  const before = await command('report');
  for (const [name, stall] of [['timeout', 'headers'], ['body-timeout', 'body']])
    await expect({ method: 'GET', path: `/backend/probe/${name}`, user: users[0].id, stall });
  const start = performance.now();
  await Promise.all(['timeout', 'body-timeout'].map(async name =>
    equal(await request(`/_spike/backend-error?case=${name}`, { user: users[0] }), 200, { kind: 'timeout', status: name === 'body-timeout' ? 200 : null, detail: null })));
  const elapsed = performance.now() - start;
  assert.ok(elapsed >= 19000 && elapsed < 29000, `20 second deadline, elapsed ${elapsed}ms`);
  // Abort propagation crosses the mock's socket event loop; bounded polling observes the event, not a blind sleep.
  const deadline = performance.now() + 2000;
  let report;
  do { report = await command('report'); if (report.aborted.length >= before.aborted.length + 2) break;
    await new Promise(resolve => setTimeout(resolve, 20));
  } while (performance.now() < deadline);
  assert.equal(report.aborted.length, before.aborted.length + 2, 'Both expired upstream connections were aborted');
  assert.deepEqual(report.violations, []); assert.deepEqual(report.pending, []);
});

test('multipart File fields match frontend Zod object errors while a File query triggers its trim failure', async () => {
  const schema = z.object({ query: z.string().trim().max(100, 'Search query is too long').optional().nullable(), code: z.string().optional().nullable(),
    description: z.string().optional().nullable(), action: z.enum(['autocomplete', 'search', 'consider']), key: z.enum(['conditions', 'icd10cm']) });
  for (const name of ['code', 'description', 'action', 'key']) {
    const file = new File(['not a string'], 'local-fixture.txt', { type: 'text/plain' });
    const fields = { action: 'consider', key: 'conditions', code: 'E11', description: 'Diabetes', [name]: file };
    const parsed = schema.safeParse({ ...fields, query: null });
    assert.equal(parsed.success, false);
    equal(await request('/api/clinicals', { user: users[0], fields, multipart: true }), 400, { errors: parsed.error.flatten().fieldErrors });
  }
  equal(await request('/api/clinicals', { user: users[0], fields: { action: 'search', key: 'conditions', query: new File(['diabetes'], 'query.txt') }, multipart: true }), 500, { error: 'An unexpected error occurred.' });
});

test('backend redirects are typed failures, never followed or forwarded with another user bearer', async () => {
  const hits = [];
  const canary = createServer((req, res) => {
    hits.push({ method: req.method, authorization: req.headers.authorization || null });
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ status: true, result: 'redirect must not be followed' }));
  });
  await new Promise((ok, fail) => { canary.once('error', fail); canary.listen(0, '127.0.0.1', ok); });
  try {
    const user = users[0];
    const fields = { action: 'meal', queryKey: 'redirect-canary', text: 'local-only' };
    await expect({ method: 'POST', path: '/backend/api/suggestion', user: user.id, body: fields,
      status: 302, headers: { location: `http://127.0.0.1:${canary.address().port}/must-not-arrive` },
      response: { status: true, result: 'redirect body must not become meal' } });
    equal(await request('/api/suggestion', { user, fields }), 200, { message: 'Suggestion fetched' });
    // The API response awaits the upstream response; one event-loop turn drains already queued socket callbacks.
    await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(hits, [], 'Backend redirects must not make a second request, with or without the bearer');
  } finally {
    canary.closeAllConnections();
    await new Promise(ok => canary.close(ok));
  }
});
