import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { serveStatic } from "hono/bun";
import DatabaseClient from "./database/DatabaseClient.js";
import authHandlers from "./handlers/auth.handler.js";
import feedHandlers from "./handlers/feed.handler.js";
import { html } from "hono/html";
import authMiddleware from "./middleware/authMiddleware.js";
import HTTP_CODES from "constants/HTTP_CODES.js";

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
  activeDb.initialise();

  // --- Middleware ---

  // Inject the DB into the context for all routes
  app.use("*", async (c, next) => {
    c.set("db", activeDb);
    await next();
  });

  // Static files
  app.use(
    "/styles/*",
    serveStatic({
      root: "./frontend",
    })
  );
  app.use(
    "/svg-loaders/*",
    serveStatic({
      root: "./frontend",
    })
  );

  // --- Routes ---
  app.route("/", authHandlers);
  app.route("/", feedHandlers);
  app.notFound((c) => {
    // TODO: add generic NOT_FOUND page
    return c.html(html`<h1>HOOPLA, 404</h1>`, HTTP_CODES.NOT_FOUND);
  });
  // Mount Handlers (Auth handles /login, /signup, /logout)

  app.get("/messages", authMiddleware, (c) => {
    return c.redirect("/");
  });
  app.get("/profile", authMiddleware, (c) => {
    return c.redirect("/");
  });
  app.get("/settings", authMiddleware, (c) => {
    return c.redirect("/");
  });

  return app;
};

// --- Execution Logic ---

// Create the production instance
const app = createServer();

// Export for both testing (the instance) and for the ApiClient
export default {
  fetch: app.fetch,
  port: 3000,
};
