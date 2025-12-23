import type DatabaseClient from "backend/database/index.js";
import { createServer } from "backend/server.js";

export default class ApiClient {
  private headers = {
    "Content-Type": "application/json",
  };

  server: ReturnType<typeof createServer>;
  constructor(private db: DatabaseClient) {
    this.server = createServer(db);
  }

  private async request(path: string, options: RequestInit) {
    // localhost is just a placeholder, server will never start anyway
    const request = new Request(`http://localhost${path}`, {
      ...options,
      headers: { ...this.headers, ...options.headers },
    });

    // This calls your app logic directly in-memory
    return this.server.fetch(request, { db: this.db });
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
