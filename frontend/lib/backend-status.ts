import { ApiError } from "~/api/services/baseService";

export { BACKEND_WAKING_MESSAGE } from "./backend-messages";

// Called only at backend request boundaries. Workerd can report a plain Error
// for a lost connection; configuration and unrelated application errors stay generic.
export function isBackendWaking(error: unknown): boolean {
  if (error instanceof ApiError) return [502, 503, 504].includes(error.status);
  if (error instanceof TypeError) return true;
  if (!(error instanceof Error)) return false;
  const code = (error as Error & { code?: unknown }).code;
  return ["AbortError", "TimeoutError"].includes(error.name) ||
    error.message === "Network connection lost." ||
    code === "ECONNREFUSED" || code === "ECONNRESET";
}
