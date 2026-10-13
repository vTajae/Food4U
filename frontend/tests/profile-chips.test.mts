import assert from "node:assert/strict";
import { test } from "node:test";
import type { ProfileSchema } from "../api/schemas/profile.ts";
import { profileChips, hasAnswers } from "../lib/profileChips.ts";

const profile = (data: Partial<ProfileSchema> = {}): ProfileSchema => ({
  id: 7, created_at: new Date(), updated_at: new Date(), attributes: [], diets: [], ...data,
});
const attribute = (category: string, name: string) => ({ id: 1, attribute_category: category,
  attribute_name: name, attribute_value: "like", created_at: new Date(), updated_at: new Date() });

test("chips order diets, medical descriptions/code fallback, legacy matches; dedupe and cap at eight", () => {
  const data = profile({
    diets: ["Vegetarian", "Vegan", "Vegetarian", ""].map(diet_name => ({ diet_type: { diet_name } })),
    medical_history: [
      { icd_details: { code: "J30.9", description: "Allergic rhinitis, unspecified" } },
      { icd_details: { code: "J30.9", description: "Allergic rhinitis, unspecified" } },
      { icd_details: { code: "I10", description: "" } },
      { icd_details: { code: "E11" } }, { icd_details: {} }, {},
    ],
    attributes: [attribute("cuisine", "Italian"), attribute("budget", "12.50"),
      attribute("CONDITION", "I10"), attribute("allergen", "Peanut"),
      attribute("food restriction", "Sodium"), attribute("ICD10CM", "Legacy code"),
      attribute("preconditions", "Ninth"), attribute("condition", "")],
  });
  assert.deepEqual(profileChips(data), ["Vegetarian", "Vegan", "Allergic rhinitis, unspecified", "I10", "E11", "Peanut", "Sodium", "Legacy code"]);
});

test("legacy attribute matching is retained while cuisine and budget are not chips", () => {
  assert.deepEqual(profileChips(profile({ attributes: [attribute("cuisine", "Italian"), attribute("budget", "12.50"),
    attribute("preconditions", "Arthritis"), attribute("allergy", "Peanut"), attribute("restriction", "Salt"), attribute("icd", "I10")] })),
    ["Arthritis", "Peanut", "Salt", "I10"]);
});

test("medical-only answers count as completed onboarding", () => {
  assert.equal(hasAnswers(profile({ medical_history: [{ icd_details: { code: "I10", description: "Hypertension" } }] })), true);
  assert.equal(hasAnswers(profile()), false);
  assert.equal(hasAnswers(profile({ diets: [{ diet_type: { diet_name: "Vegan" } }] })), true);
  assert.equal(hasAnswers(profile({ attributes: [attribute("budget", "12.50")] })), true);
  assert.deepEqual(profileChips(profile()), []);
});
