import { env } from "cloudflare:workers";

// Resolve per call: unrelated routes/builds must not fail at module load.
function backendUrl(path: string): string {
  // Deployed binding comes from wrangler.jsonc; .dev.vars can override locally.
  const API_BASE_URL = env.API_BASE_URL;
  if (!API_BASE_URL) throw new Error("API_BASE_URL is not configured");
  let parsed: URL;
  try {
    parsed = new URL(API_BASE_URL);
  } catch {
    throw new Error("API_BASE_URL is not an absolute http(s) URL");
  }
  if (!/^https?:\/\//i.test(API_BASE_URL) || (parsed.protocol !== "http:" && parsed.protocol !== "https:")) {
    throw new Error("API_BASE_URL is not an absolute http(s) URL");
  }
  return `${API_BASE_URL.replace(/\/+$/, "")}/${path}`;
}
// The backend sleeps on Render's free tier; a request must fail fast enough
// for the UI to show its "unavailable" state instead of hanging the page.
const REQUEST_TIMEOUT_MS = 20_000;

/** A non-2xx response from the backend, with enough detail for callers to branch on. */
export class ApiError extends Error {
  readonly status: number;
  readonly url: string;
  readonly detail: string | undefined;

  constructor(status: number, url: string, detail?: string) {
    super(`Backend responded ${status} for ${url}${detail ? `: ${detail}` : ""}`);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
    this.detail = detail;
  }
}

export class ApiService {
  // Construct inside the request from its session. Never share authenticated
  // clients between requests; refreshing creates a new client for that request.
  constructor(private readonly token: string | null = null) {}

  private readonly defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  protected getRequestOptions(
    method: string,
    body?: unknown,
    customHeaders?: HeadersInit
  ): RequestInit {
    const headers = {
      ...this.defaultHeaders,
      ...this.addAuthorizationHeader(customHeaders || {}),
    };

    const options: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    };
    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }
    return options;
  }

  private addAuthorizationHeader(headers: HeadersInit): HeadersInit {
    if (this.token) {
      return { Authorization: `Bearer ${this.token}`, ...headers };
    }
    return headers;
  }

  /**
   * Throws ApiError on non-2xx (with the backend's `detail` when it sends one)
   * so callers can tell "no profile yet" (403) from "backend down" (5xx).
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let detail: string | undefined;
      try {
        const body = (await response.json()) as { detail?: unknown };
        if (typeof body.detail === "string") detail = body.detail;
      } catch {
        /* non-JSON error body */
      }
      throw new ApiError(response.status, response.url, detail);
    }
    try {
      return (await response.json()) as T;
    } catch {
      throw new ApiError(response.status, response.url, "Invalid JSON response");
    }
  }

  /** GET a list. Throws ApiError / network errors; callers decide the fallback. */
  async get<T>(url: string): Promise<T[]> {
    const response = await fetch(backendUrl(url), this.getRequestOptions("GET"));
    return this.handleResponse<T[]>(response);
  }

  /** POST JSON. Throws ApiError / network errors. */
  async post<T>(url: string, body?: unknown, customHeaders?: HeadersInit): Promise<T> {
    const response = await fetch(backendUrl(url), this.getRequestOptions("POST", body, customHeaders));
    return this.handleResponse<T>(response);
  }

  /** GET a single item. Throws ApiError / network errors. */
  async getSingle<T>(url: string): Promise<T> {
    const response = await fetch(backendUrl(url), this.getRequestOptions("GET"));
    return this.handleResponse<T>(response);
  }
}
