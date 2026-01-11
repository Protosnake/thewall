import { Hono } from "hono";
import { logger } from "backend/lib/logger.js";
import { requestId } from "hono/request-id";
import { serveStatic } from "hono/bun";
import DatabaseClient from "./database/DatabaseClient.js";
import authHandlers from "./handlers/auth.handler.js";
import feedHandlers from "./handlers/feed.handler.js";
import { html } from "hono/html";
import authMiddleware from "./middleware/authMiddleware.js";
import HTTP_CODES from "constants/HTTP_CODES.js";
import type { Logger } from "pino";
import assert from "assert";

type Bindings = {
  db: DatabaseClient;
  log: Logger;
  requestId: string;
};
/**
 * Server Factory
 * Allows injecting a custom database (like :memory: for tests)
 */
export const createServer = (testDb?: DatabaseClient) => {
  const app = new Hono<{
    Variables: Bindings;
  }>();

  // 1. Determine which DB to use
  // If testDb is provided, use it. Otherwise, use the persistent file.
  assert(process.env.DATABASE_NAME, `Database name is required`);
  const activeDb = testDb || new DatabaseClient(process.env.DATABASE_NAME);

  // 2. Initialize the Database
  // This ensures that if it's a fresh in-memory DB, the tables are created immediately
  activeDb.initialise();

  // --- Middleware ---
  app.use("*", requestId());

  app.use("*", async (c, next) => {
    const start = performance.now();

    // 1. Setup: Create child logger and attach to context immediately
    const reqLogger = logger.child({
      requestId: c.get("requestId"),
      method: c.req.method,
      path: c.req.path,
    });
    c.set("log", reqLogger);

    // 2. Execute: Run the rest of the app
    await next();

    // 3. Finalize: Calculate time and log once with the right level
    const duration = `${(performance.now() - start).toFixed(2)}ms`;
    const logData = { status: c.res.status, duration };

    if (c.res.status >= HTTP_CODES.SERVER_ERROR) {
      reqLogger.error(logData, "Request failed (Server Error)");
    } else if (c.res.status >= HTTP_CODES.BAD_REQUEST) {
      reqLogger.warn(logData, "Request finished (Client Error)");
    } else {
      reqLogger.debug(logData, "Request completed");
    }
  });
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

  app.onError((err, c) => {
    // Log the actual error for your own debugging
    console.error(err);

    // TODO: add more generic error page
    return c.html(
      html`
        <div class="error-container">
          <h1>HOOPLA!</h1>
          <p>Something went wrong on our end.</p>
          <small>${err.message}</small>
        </div>
      `,
      500 // Correct status code for a server error
    );
  });
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

// Create the production instance
const app = createServer();

// Export for both testing (the instance) and for the ApiClient
export default {
  fetch: app.fetch,
  port: process.env.PORT || 3000,
};
