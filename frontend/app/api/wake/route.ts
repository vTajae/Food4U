import { ApiService } from "~/api/services/baseService";
import { isBackendWaking } from "~/lib/backend-status";

// Anonymous and read-only. Keep the request open while Render starts; returning
// early with waitUntil would only give background work a 30-second allowance.
export async function GET() {
  let awake = false;
  try {
    const health = await new ApiService(null, 60_000).getSingle<{ status: string }>("health");
    awake = health.status === "ok";
  } catch (error) {
    // This is a best-effort head start, never a prerequisite for D1 auth.
    if (!isBackendWaking(error)) console.error("Backend wake failed unexpectedly");
  }
  return Response.json({ awake }, { headers: { "Cache-Control": "no-store" } });
}
