export default class ApiClient {
  private readonly baseUrl: string;
  private headers = {
    "Content-Type": "application/json",
  };
  constructor() {
    this.baseUrl = process.env["BASE_URL"] || "http://localhost:3000";
  }

  private async request(path: string, options: RequestInit) {
    const url = this.baseUrl + path;
    const response = await fetch(url, {
      ...options,
      headers: { ...this.headers, ...options.headers },
    });

    return response;
  }

  async get(path: string) {
    return this.request(path, { method: "GET" });
  }

  async post<T extends Record<string, unknown>>(
    path: string,
    body: T,
    isForm = true
  ) {
    const options: RequestInit = { method: "POST" };

    if (isForm) {
      const formData = new URLSearchParams();
      for (const key in body) {
        // Convert value to string to satisfy URLSearchParams
        formData.append(key, String(body[key]));
      }
      options.body = formData;
      // Note: Fetch automatically sets Content-Type for URLSearchParams,
      // but being explicit is fine too.
      options.headers = { "Content-Type": "application/x-www-form-urlencoded" };
    } else {
      options.body = JSON.stringify(body);
    }

    return this.request(path, options);
  }
}
