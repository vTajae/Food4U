let wake: Promise<void> | undefined;

// Module lifetime is the browser document, including tab switches, remounts and
// Strict Mode effects. Do not wait for this before accepting credentials.
export function wakeBackend(): Promise<void> {
  return wake ??= fetch("/api/wake", { cache: "no-store", credentials: "omit" })
    // Drain the chunked response so the browser can finish the request.
    .then(response => response.text())
    .then(() => {})
    .catch(() => {});
}
