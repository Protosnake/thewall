import type DatabaseClient from "backend/database/DatabaseClient.js";
import type { LoginBody } from "backend/schemas/auth.schema.js";
import { createServer } from "backend/server.js";
import routes from "./routes.js";
import User from "backend/entities/User.js";
import { faker } from "@faker-js/faker";
import Session from "backend/entities/Session.js";

export default class ApiClient {
  cookie: string | undefined = undefined;
  private get headers() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.cookie) {
      // Extract only the 'name=value' part, stripping 'Path=/', etc.
      headers["Cookie"] = this.cookie.split(";")[0];
    }

    return headers;
  }

  server: ReturnType<typeof createServer>;
  constructor(private db: DatabaseClient) {
    this.server = createServer(db);
  }

  private resolvePath(path: string, params?: Record<string, string | number>) {
    if (!params) return path;

    let resolvedPath = path;
    for (const [key, value] of Object.entries(params)) {
      resolvedPath = resolvedPath.replace(`:${key}`, String(value));
    }
    return resolvedPath;
  }

  private async request(
    path: string,
    options: RequestInit,
    params?: Record<string, string | number> // Add params here
  ) {
    const resolvedPath = this.resolvePath(path, params);

    const request = new Request(`http://localhost${resolvedPath}`, {
      ...options,
      headers: { ...this.headers, ...options.headers },
    });

    return this.server.fetch(request, { db: this.db });
  }

  async get(path: string, params?: Record<string, string | number>) {
    return this.request(path, { method: "GET" }, params);
  }

  async post<T extends Record<string, unknown>>(
    path: string,
    body: T,
    isForm = true,
    params?: Record<string, string | number> // Add params here
  ) {
    const options: RequestInit = {
      method: "POST",
      headers: isForm
        ? { "Content-Type": "application/x-www-form-urlencoded" }
        : {},
    };

    if (isForm) {
      const formData = new URLSearchParams();
      for (const key in body) {
        formData.append(key, String(body[key]));
      }
      options.body = formData;
    } else {
      options.body = JSON.stringify(body);
    }

    return this.request(path, options, params);
  }

  async authenticate(body?: LoginBody) {
    if (!body) {
      body = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      const user = await new User(this.db).create(body);
      await new Session(this.db).create({ user });
    }
    const res = await routes(this).login(body);
    this.cookie = res.headers.get("set-cookie") || undefined;
    return !!this.cookie;
  }
}
