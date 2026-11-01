import { registerHooks } from "node:module";

// Unit tests run in Node, not workerd. Only replace the Worker binding seam.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "cloudflare:workers") {
      return { url: 'data:text/javascript,export const env = { API_BASE_URL: "http://127.0.0.1:8765" };', shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});
