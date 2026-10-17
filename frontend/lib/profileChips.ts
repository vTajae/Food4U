import type { ProfileSchema } from "../api/schemas/profile";

// Meal constraints, ordered diets, medical history, then legacy attributes.
export function profileChips(profile: ProfileSchema): string[] {
  const chips: string[] = [];
  for (const d of profile.diets ?? []) {
    if (d.diet_type?.diet_name) chips.push(d.diet_type.diet_name);
  }
  for (const history of profile.medical_history ?? []) {
    const label = history.icd_details?.description || history.icd_details?.code;
    if (label) chips.push(label);
  }
  for (const a of profile.attributes ?? []) {
    const category = (a.attribute_category || "").toLowerCase();
    if (/condition|allerg|restriction|icd/.test(category) && a.attribute_name) {
      chips.push(a.attribute_name);
    }
  }
  return Array.from(new Set(chips)).slice(0, 8);
}

export function hasAnswers(profile: ProfileSchema): boolean {
  return (profile.attributes?.length ?? 0) > 0 || (profile.diets?.length ?? 0) > 0 || (profile.medical_history?.length ?? 0) > 0;
}
