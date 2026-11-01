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

test("production-shaped answers for all five questions survive a draft round trip after choosing a diet", () => {
  const store = storage();
  writeDraft(store, a, italian);
  const complete = { currentStep: 5, answers: [
    { questionId: 5, answers: [{ name: "Italian" }] },
    { questionId: 5555, answers: [{ name: "Vegetarian", description: "A plant-based diet that includes dairy and eggs." }] },
    { questionId: 1, answers: [{ name: "Allergic rhinitis, unspecified", code: "J30.9" }] },
    { questionId: 11, answers: [{ name: "Peanut allergy" }] },
    { questionId: 555, answers: [{ value: "12.50" }] },
  ] };
  writeDraft(store, a, complete);
  assert.deepEqual(readDraft(store, a), complete);
  assert.deepEqual(JSON.parse(store.getItem(draftKey(a)!)!).state, complete);
});

test("unknown suggestion fields are stripped while known fields and the owner envelope persist", () => {
  const store = storage();
  const decorated = { currentStep: 1, answers: [{ questionId: 5, answers: [{ name: "Italian", searchRank: 7 }] }] };
  writeDraft(store, a, decorated);
  const clean = { currentStep: 1, answers: [{ questionId: 5, answers: [{ name: "Italian" }] }] };
  assert.deepEqual(readDraft(store, a), clean);
  assert.deepEqual(JSON.parse(store.getItem(draftKey(a)!)!), { version: 1, identity: a, state: clean });
});

for (const [label, invalid] of [
  ["out-of-range step", { currentStep: 6, answers: [] }],
  ["duplicate questions", { currentStep: 0, answers: [...italian.answers, ...italian.answers] }],
  ["unknown-only answer", { currentStep: 0, answers: [{ questionId: 5, answers: [{ searchRank: 7 }] }] }],
  ["undefined-only answer", { currentStep: 0, answers: [{ questionId: 5, answers: [{ name: undefined }] }] }],
  ...Object.entries({ name: 512, value: 128, code: 64, description: 8192 }).map(([field, max]) => [
    `oversized ${field}`, { currentStep: 0, answers: [{ questionId: 5, answers: [{ [field]: "x".repeat(max + 1) }] }] },
  ]),
] as [string, unknown][]) {
  test(`an unpersistable ${label} removes only the current stale draft`, () => {
    const store = storage();
    writeDraft(store, a, italian); writeDraft(store, b, italian);
    writeDraft(store, a, invalid as Parameters<typeof writeDraft>[2]);
    assert.equal(store.getItem(draftKey(a)!), null);
    assert.deepEqual(readDraft(store, a), initial);
    assert.deepEqual(readDraft(store, b), italian);
  });
}

test("a quota failure removes an older draft rather than restoring stale answers", () => {
  const store = storage(); writeDraft(store, a, italian);
  const full = { ...store, setItem() { throw new Error("quota"); } };
  assert.doesNotThrow(() => writeDraft(full, a, { currentStep: 1, answers: [] }));
  assert.equal(store.getItem(draftKey(a)!), null);
});

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
