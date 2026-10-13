import { env } from "cloudflare:workers";

// Deployed binding comes from wrangler.jsonc; .dev.vars can override locally.
const API_BASE_URL = env.API_BASE_URL;
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
  // The JWT for the current request. Workers share one isolate across requests,
  // so callers load it from the session right before each use (lib/auth.ts:
  // applyBackendToken) and headers are built synchronously below.
  private static token: string | null = null;

  static defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  static setToken(token: string): void {
    this.token = token;
  }

  static clearToken(): void {
    this.token = null;
  }

  static getToken(): string | null {
    return this.token;
  }

  protected static getRequestOptions(
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

  private static addAuthorizationHeader(headers: HeadersInit): HeadersInit {
    if (this.token) {
      return { ...headers, Authorization: `Bearer ${this.token}` };
    }
    return headers;
  }

  /**
   * Throws ApiError on non-2xx (with the backend's `detail` when it sends one)
   * so callers can tell "no profile yet" (403) from "backend down" (5xx).
   */
  private static async handleResponse<T>(response: Response): Promise<T> {
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
  static async get<T>(url: string): Promise<T[]> {
    const response = await fetch(`${API_BASE_URL}/${url}`, this.getRequestOptions("GET"));
    return this.handleResponse<T[]>(response);
  }

  /** POST JSON. Throws ApiError / network errors. */
  static async post<T>(url: string, body?: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/${url}`, this.getRequestOptions("POST", body));
    return this.handleResponse<T>(response);
  }

  /** GET a single item. Throws ApiError / network errors. */
  static async getSingle<T>(url: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/${url}`, this.getRequestOptions("GET"));
    return this.handleResponse<T>(response);
  }
}
