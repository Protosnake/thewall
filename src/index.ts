import { serve } from "@hono/node-server";
import { fileURLToPath } from "node:url";
import path from "path";
import { Hono, type Context, type Next } from "hono";
import { html } from "hono/html";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { serveStatic } from "@hono/node-server/serve-static";

// Import your page templates
import loginPage from "../frontend/pages/login.js";
import feed from "../frontend/pages/feed.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Hono();

// --- Middleware ---

const authMiddleware = async (c: Context, next: Next) => {
  const session = getCookie(c, "session");

  if (!session) {
    return c.redirect("/login");
  }

  await next();
};

// --- Public Routes ---

// If your css is in ./frontend/static/style.css
app.use(
  "/styles/*",
  serveStatic({
    // This creates an absolute path to the frontend folder
    root: path.resolve(__dirname, "../frontend"),
  })
);
app.get("/", (c) => {
  const session = getCookie(c, "session");
  if (!session) {
    return c.redirect("/login");
  }

  return c.html(feed());
});

app.get("/login", (c) => {
  return c.html(loginPage());
});

app.post("/login", async (c) => {
  const body = await c.req.parseBody();

  // Logic check (replace with DB check later)
  if (body.email === "admin@test.com" && body.password === "123") {
    setCookie(c, "session", "user_123", {
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60, // 1 hour
    });
    return c.redirect("/feed");
  }

  return c.html(loginPage({ isError: true }));
});

// --- Protected Routes ---

app.get("/feed", authMiddleware, (c) => {
  return c.html(feed());
});

app.get("/logout", (c) => {
  deleteCookie(c, "session");
  return c.redirect("/login");
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
