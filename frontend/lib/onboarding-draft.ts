import { z } from "zod";
import type { FormState } from "~/api/schemas/refs";

type DraftStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
const uuid = z.string().uuid();
const answer = z.object({
  name: z.string().max(512).optional(), value: z.string().max(128).optional(),
  code: z.string().max(64).optional(), description: z.string().max(8192).optional(),
}).strip().refine(value => Object.values(value).some(field => field !== undefined));
const stateSchema = z.object({
  currentStep: z.number().int().min(0).max(5),
  answers: z.array(z.object({
    questionId: z.union([z.literal(5), z.literal(5555), z.literal(1), z.literal(11), z.literal(555)]),
    answers: z.array(answer),
  }).strict()).max(5).refine(questions => new Set(questions.map(q => q.questionId)).size === questions.length),
}).strict();
const envelope = z.object({ version: z.literal(1), identity: uuid, state: stateSchema }).strict();

export const emptyDraft = (): FormState => ({ currentStep: 0, answers: [] });

/** Only opaque server-provided identity ids may enter a key, never an email. */
export function draftKey(identity: string | undefined): string | null {
  return uuid.safeParse(identity).success ? `food4u:intake:v1:${identity}` : null;
}

export function browserDraftStorage(): DraftStorage | undefined {
  try { return window.localStorage; } catch { return undefined; }
}

function remove(storage: DraftStorage | undefined, key: string) {
  try { storage?.removeItem(key); } catch { /* Storage may be disabled. */ }
}

export function readDraft(storage: DraftStorage | undefined, identity: string | undefined): FormState {
  // An old shared draft has no provable owner. Never migrate it to a login.
  remove(storage, "formState");
  const key = draftKey(identity);
  if (!key) return emptyDraft();
  try {
    const raw = storage?.getItem(key);
    if (!raw) return emptyDraft();
    const parsed = envelope.safeParse(JSON.parse(raw));
    if (parsed.success && parsed.data.identity === identity) return parsed.data.state;
  } catch { /* Invalid JSON or unavailable browser storage: recover empty. */ }
  remove(storage, key);
  return emptyDraft();
}

export function writeDraft(storage: DraftStorage | undefined, identity: string | undefined, state: FormState) {
  const key = draftKey(identity);
  if (!key) return;
  const parsed = envelope.safeParse({ version: 1, identity, state });
  // A partial snapshot could silently omit health answers. If validation or
  // storage fails, discard this identity's old snapshot instead of reviving it.
  if (!parsed.success) { remove(storage, key); return; }
  try { storage?.setItem(key, JSON.stringify(parsed.data)); } catch { remove(storage, key); }
}

export function clearDraft(storage: DraftStorage | undefined, identity: string | undefined) {
  remove(storage, "formState");
  const key = draftKey(identity);
  if (key) remove(storage, key);
}
