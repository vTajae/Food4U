import assert from "node:assert/strict";
import { test } from "node:test";
import { draftKey, readDraft, writeDraft, clearDraft } from "../lib/onboarding-draft.ts";

const a = "11111111-1111-4111-8111-111111111111";
const b = "22222222-2222-4222-8222-222222222222";
const initial = { currentStep: 0, answers: [] };
const italian = { currentStep: 0, answers: [{ questionId: 5, answers: [{ name: "Italian" }] }] };
function storage() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); } };
}

test("drafts survive reload only for their opaque signed-in identity", () => {
  const store = storage();
  writeDraft(store, a, italian);
  assert.deepEqual(readDraft(store, a), italian);
  assert.deepEqual(readDraft(store, b), initial);
  assert.notEqual(draftKey(a), draftKey(b));
  assert.equal(draftKey("person@example.test"), null, "email cannot enter a storage key");
  assert.equal(draftKey(undefined), null, "no shared anonymous draft");
});

test("legacy unscoped formState is discarded, never assigned to the next login", () => {
  const store = storage();
  store.setItem("formState", JSON.stringify(italian));
  assert.deepEqual(readDraft(store, b), initial);
  assert.equal(store.getItem("formState"), null);
});

test("sign-out clears only the current identity and legacy storage", () => {
  const store = storage();
  writeDraft(store, a, italian); writeDraft(store, b, italian);
  store.setItem("formState", JSON.stringify(italian));
  clearDraft(store, a);
  assert.equal(store.getItem(draftKey(a)!), null);
  assert.equal(store.getItem("formState"), null);
  assert.deepEqual(readDraft(store, b), italian);
});

for (const [label, raw] of [
  ["malformed JSON", "{invalid-json"],
  ["null", "null"],
  ["legacy shape", JSON.stringify(italian)],
  ["old version", JSON.stringify({ version: 0, identity: a, state: italian })],
  ["wrong owner envelope", JSON.stringify({ version: 1, identity: b, state: italian })],
  ...[
    { currentStep: -1, answers: [] }, { currentStep: 6, answers: [] },
    { currentStep: 1.5, answers: [] }, { currentStep: 0, answers: null },
    { currentStep: 0, answers: [{ questionId: 5, answers: [null] }] },
    { currentStep: 0, answers: [{ questionId: 5, answers: [{ name: {} }] }] },
    { currentStep: 0, answers: [{ questionId: 999, answers: [] }] },
  ].map((state, index) => [`invalid shape ${index}`, JSON.stringify({ version: 1, identity: a, state })]),
] as [string, string][]) {
  test(`${label} is discarded without crashing intake`, () => {
    const store = storage(); store.setItem(draftKey(a)!, raw);
    assert.deepEqual(readDraft(store, a), initial);
    assert.equal(store.getItem(draftKey(a)!), null);
  });
}

test("unavailable or quota-blocked storage never breaks intake or sign-out", () => {
  const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("quota"); }, removeItem() { throw new Error("blocked"); } };
  assert.deepEqual(readDraft(blocked, a), initial);
  assert.doesNotThrow(() => writeDraft(blocked, a, italian));
  assert.doesNotThrow(() => clearDraft(blocked, a));
  assert.deepEqual(readDraft(undefined, a), initial);
});
