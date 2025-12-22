import { serve } from "@hono/node-server";
import { fileURLToPath } from "node:url";
import path from "path";
import { Hono, type Context, type Next } from "hono";
import { getCookie, deleteCookie } from "hono/cookie";
import { serveStatic } from "@hono/node-server/serve-static";
import DatabaseClient from "./database/index.js";
import feedPage from "../frontend/pages/feed.js";
import { USER_TABLE_SQL } from "./entities/User.js";
import authHandlers from "./handlers/auth.handler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Hono<{ Variables: { db: DatabaseClient } }>();
const db = new DatabaseClient("thewall.db");

// Just a simple list of what needs to exist
db.initialise([USER_TABLE_SQL]);

// --- Middleware ---
const authMiddleware = async (c: Context, next: Next) => {
  const session = getCookie(c, "session");

  if (!session) {
    return c.redirect("/login");
  }

  await next();
};

// If your css is in ./frontend/static/style.css
app.use(
  "/styles/*",
  serveStatic({
    // This creates an absolute path to the frontend folder
    root: path.resolve(__dirname, "../frontend"),
  })
);

app.use("*", async (c, next) => {
  // console.log(`[${c.req.method}] ${c.req.url}`);
  c.set("db", db);
  await next();
});
app.route("/", authHandlers);

app.get("/", (c) => {
  const session = getCookie(c, "session");
  if (!session) {
    return c.redirect("/login");
  }

  return c.html(feedPage());
});

app.get("/feed", authMiddleware, (c) => {
  return c.html(feedPage());
});

// --- Server Setup ---
const server = serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

// Graceful Shutdown
const shutdown = () => {
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
