import { Hono, type Context, type Next } from "hono";
import { getCookie } from "hono/cookie";
import { serveStatic } from "hono/bun";
import DatabaseClient from "./database/index.js";
import feedPage from "../frontend/pages/feed.js";
import { USER_TABLE_SQL } from "./entities/User.js";
import authHandlers from "./handlers/auth.handler.js";

/**
 * Server Factory
 * Allows injecting a custom database (like :memory: for tests)
 */
export const createServer = (testDb?: DatabaseClient) => {
  const app = new Hono<{ Variables: { db: DatabaseClient } }>();

  // 1. Determine which DB to use
  // If testDb is provided, use it. Otherwise, use the persistent file.
  const activeDb = testDb || new DatabaseClient("thewall.db");

  // 2. Initialize the Database
  // This ensures that if it's a fresh in-memory DB, the tables are created immediately
  activeDb.initialise([USER_TABLE_SQL]);

  // --- Middleware ---

  // Inject the DB into the context for all routes
  app.use("*", async (c, next) => {
    c.set("db", activeDb);
    await next();
  });

  const authMiddleware = async (c: Context, next: Next) => {
    const session = getCookie(c, "session");
    if (!session) {
      return c.redirect("/login");
    }
    await next();
  };

  // Static files
  app.use(
    "/styles/*",
    serveStatic({
      root: "./frontend",
    })
  );

  // --- Routes ---

  // Mount Handlers (Auth handles /login, /signup, /logout)
  app.route("/", authHandlers);

  app.get("/", (c) => {
    const session = getCookie(c, "session");
    if (!session) return c.redirect("/login");
    return c.redirect("/feed");
  });

  app.get("/feed", authMiddleware, (c) => {
    return c.html(feedPage());
  });

  return app;
};

// --- Execution Logic ---

// Create the production instance
const app = createServer();

// Export for both testing (the instance) and for the ApiClient
export default app;

// Only start the actual Bun server if this file is run directly
if (import.meta.main) {
  console.log("Starting server on http://localhost:3000");
  Bun.serve({
    fetch: app.fetch,
    port: 3000,
  });
}
