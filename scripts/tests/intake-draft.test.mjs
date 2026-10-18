import test from 'node:test';
import assert from 'node:assert/strict';
import { scopedIntakeDraft, hasOfficialRhinitisDraft } from '../post-deploy-common.mjs';

const identity = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const key = `food4u:intake:v1:${identity}`;
const condition = { name: 'Allergic rhinitis, unspecified', code: 'J30.9' };
const envelope = () => ({ version: 1, identity, state: { currentStep: 2, answers: [{ questionId: 1, answers: [condition] }] } });
const entries = value => [[key, JSON.stringify(value)], ['theme', 'light']];

test('one matching owner-scoped envelope preserves official J30.9 metadata without a legacy key', () => {
  const value = envelope();
  const storage = entries(value);
  assert.deepEqual(scopedIntakeDraft(storage), { key, envelope: value });
  assert.equal(hasOfficialRhinitisDraft(storage), true);
  assert.equal(storage[0][1], JSON.stringify(value), 'inspection must not mutate the input');
});

for (const [name, storage] of [
  ['missing scoped draft', []],
  ['legacy-only draft', [['formState', JSON.stringify(envelope().state)]]],
  ['legacy key alongside a valid scoped draft', [...entries(envelope()), ['formState', '']]],
  ['multiple scoped accounts', [...entries(envelope()), [`food4u:intake:v1:${other}`, JSON.stringify({ ...envelope(), identity: other })]]],
  ['non-UUID key', [['food4u:intake:v1:not-a-uuid', JSON.stringify(envelope())]]],
  ['malformed UUID key', [[`food4u:intake:v1:${'a'.repeat(36)}`, JSON.stringify(envelope())]]],
  ['wrong version', entries({ ...envelope(), version: 2 })],
  ['wrong owner', entries({ ...envelope(), identity: other })],
  ['missing owner', entries({ version: 1, state: envelope().state })],
  ['malformed JSON', [[key, '{broken']]],
  ['null envelope', entries(null)],
  ['missing state', entries({ version: 1, identity })],
  ['non-array answers', entries({ version: 1, identity, state: { answers: {} } })],
]) {
  test(`scoped draft rejects ${name}`, () => {
    assert.equal(scopedIntakeDraft(storage), null);
    assert.equal(hasOfficialRhinitisDraft(storage), false);
  });
}

for (const [name, answers] of [
  ['no condition', []],
  ['wrong question', [{ questionId: 11, answers: [condition] }]],
  ['display name instead of official name', [{ questionId: 1, answers: [{ name: 'Seasonal allergies (hay fever)', code: 'J30.9' }] }]],
  ['wrong code', [{ questionId: 1, answers: [{ ...condition, code: 'E11.9' }] }]],
  ['code and official name on different answers', [{ questionId: 1, answers: [{ code: 'J30.9' }, { name: condition.name }] }]],
  ['malformed answer collection', [{ questionId: 1, answers: null }]],
  ['malformed question', [null]],
]) {
  test(`official condition check rejects ${name}`, () => {
    assert.equal(hasOfficialRhinitisDraft(entries({ ...envelope(), state: { currentStep: 2, answers } })), false);
  });
}

test('a valid empty account draft can be discovered for screenshot seeding without a condition', () => {
  const value = { version: 1, identity, state: { currentStep: 0, answers: [] } };
  assert.deepEqual(scopedIntakeDraft(entries(value)), { key, envelope: value });
  assert.equal(hasOfficialRhinitisDraft(entries(value)), false);
});
