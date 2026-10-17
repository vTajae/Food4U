import assert from "node:assert/strict";
import { test } from "node:test";
import { commonConditions, commonFoodAllergies, conditionsByCode, plainLabel } from "../lib/refs/conditions.ts";

test("known vocabulary separates friendly display from official saved names", () => {
  assert.equal(plainLabel("J30.9", "Allergic rhinitis, unspecified"), "Seasonal allergies (hay fever)");
  assert.equal(plainLabel("Z91.010", "Allergy to peanuts"), "Peanut allergy");
  assert.equal(plainLabel("I10", ""), "High blood pressure (hypertension)");
  assert.equal(conditionsByCode["Z91.010"].officialName, "Allergy to peanuts");
  assert.equal(conditionsByCode["K58.9"].officialName, "Irritable bowel syndrome, unspecified");
});

test("only the explicit trailing administrative suffix table is removed", () => {
  for (const suffix of [", unspecified", " without complications", ", initial encounter", ", subsequent encounter"]) {
    assert.equal(plainLabel("X99.9", `Example condition${suffix}`), "Example condition", suffix);
  }
  assert.equal(plainLabel("X99.9", "Example condition, unspecified, initial encounter"), "Example condition");
  for (const name of ["Arthritis", "Unspecified abdominal pain", "Example, unspecified type", "Example without diarrhea", "Example without esophagitis", "Example with complications", "Example, sequela", "Allergy to eggs with tolerance to baked egg", "Example, initial encounter for fracture"]) {
    assert.equal(plainLabel("X99.9", name), name);
  }
});

test("missing names and code-only legacy names never expose ICD metadata", () => {
  for (const name of [undefined, null, "", "X99.9", "E11", " Z91.0110 "]) {
    assert.equal(plainLabel("X99.9", name), "");
  }
  assert.equal(plainLabel(undefined, "I10"), "High blood pressure (hypertension)");
  assert.equal(plainLabel(undefined, "Arthritis"), "Arthritis");
});

test("curated lists use verified leaf codes, educational copy and no obesity suggestion", () => {
  assert.equal(commonConditions.length, 9);
  assert.equal(commonFoodAllergies.length, 7);
  assert.ok(!commonConditions.some(item => item.code === "E66.9"));
  assert.ok(commonFoodAllergies.some(item => item.code === "Z91.0110"));
  assert.ok(commonFoodAllergies.some(item => item.code === "Z91.0120"));
  for (const item of [...commonConditions, ...commonFoodAllergies]) {
    assert.equal(item, conditionsByCode[item.code]);
    assert.ok(item.learn.length > 20);
    assert.ok(item.officialName.length > 0);
    assert.doesNotMatch(`${item.label} ${item.learn}`, /\b[A-Z]\d\d(?:\.\w+)?\b/);
  }
});
