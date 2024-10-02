// Base URL should be configured from environment or configuration files
const API_BASE_URL ="https://food4u-nrpy.onrender.com";


export class ApiService {
  private static token: string | null = null; // Store token globally
  // Default headers for requests; will be updated with authorization tokens when needed
  static defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Method to set JWT token after login
  static setToken(token: string): void {
    this.token = token;
  }

  // Method to clear the token
  static clearToken(): void {
    this.token = null;
  }

    // Method to clear the token
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
      ...this.addAuthorizationHeader(customHeaders || {}), // Include JWT in headers
    };

    ////console.log("headers", headers);

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    return options;
  }

  // Add the JWT token to the request headers if available
  private static addAuthorizationHeader(headers: HeadersInit): HeadersInit {
    if (this.token) {
      return {
        ...headers,
        "Authorization": `Bearer ${this.token}`, // Add Authorization header
      };
    }
    return headers;
  }

  // Handle response from server
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      console.error(`Bad response code ${response.status} from ${response.url}`);
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    try {
      const data = await response.json(); // Use JSON response, not body directly
      return data as T;
    } catch (error) {
      console.error("Failed to parse response JSON:", error);
      throw new Error("Invalid JSON response");
    }
  }

  // Generic GET method for fetching raw data
  static async get<T>(url: string): Promise<T[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${url}`,
        this.getRequestOptions("GET")
      );
      return this.handleResponse<T[]>(response);
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
      return []; // Return an empty array in case of an error
    }
  }

  // POST request to submit data
  static async post<T>(url: string, body: unknown): Promise<T | void> {
    try {


      // ////console.log("Token in the placee:", token);
      const response = await fetch(
        `${API_BASE_URL}/${url}`,
        this.getRequestOptions("POST", body)
      );
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`Error posting data to ${url}:`, error);
    }
  }

  // Fetch a single item from the server
  static async getSingle<T>(url: string): Promise<T | void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${url}`,
        this.getRequestOptions("GET")
      );
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`Error fetching single item from ${url}:`, error);
    }
  }
}
