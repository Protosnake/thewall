import { serve } from "@hono/node-server";
import { fileURLToPath } from "node:url";
import path from "path";
import { Hono, type Context, type Next } from "hono";
import { html } from "hono/html";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { serveStatic } from "@hono/node-server/serve-static";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import DatabaseClient from "./database/index.js";

// Import your page templates
import loginPage from "../frontend/pages/login.js";
import feedPage from "../frontend/pages/feed.js";
import signUpPage from "../frontend/pages/signUp.js";
import User, { USER_TABLE_SQL } from "./entities/User.js";
import { verifyPassword } from "./database/encrypt.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Hono();
const db = new DatabaseClient("thewall.db");

// Just a simple list of what needs to exist
db.initialise([
  USER_TABLE_SQL,
  // POST_TABLE_SQL
]);

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

app.use("*", async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`);
  await next();
});

app.get("/", (c) => {
  const session = getCookie(c, "session");
  if (!session) {
    return c.redirect("/login");
  }

  return c.html(feedPage());
});

app.get("/login", (c) => {
  return c.html(loginPage());
});

app.post(
  "/login",
  zValidator(
    "form",
    z.object({
      email: z.email(),
      password: z.string(),
    }),
    (result, c) => {
      if (!result.success) {
        const formData = result.data;
        return c.html(
          loginPage({
            email: formData?.email,
            error: `Please enter a valid email and password`,
          }),
          500
        );
      }
    }
  ),
  async (c) => {
    const { email, password } = c.req.valid("form");
    const userRepo = new User(db);

    try {
      // 1. Fetch the user by email
      const [user] = await userRepo.read({
        filter: { email },
        limit: 1,
        offset: 0,
      });

      // 2. Check if user exists and verify password
      // We use a constant time verification to prevent timing attacks
      if (user && verifyPassword(password, user.password)) {
        setCookie(c, "session", user.id, {
          path: "/",
          httpOnly: true,
          secure: true, // Set to true if using HTTPS
          sameSite: "Lax",
          maxAge: 60 * 60,
        });

        return c.redirect("/feed");
      }

      // 3. Generic error for security (don't tell them if it was the email or password)
      return c.html(
        loginPage({
          email, // Keep the email in the box
          error: "Invalid email or password",
        }),
        500
      );
    } catch (err) {
      console.error(err);
      const errorMessage =
        err instanceof Error ? err.message : "A server error occurred";

      return c.html(loginPage({ error: errorMessage }), 500);
    }
  }
);

// --- Protected Routes ---

app.get("/feed", authMiddleware, (c) => {
  return c.html(feedPage());
});

app.get("/signup", (c) => {
  return c.html(signUpPage());
});
app.post(
  "/signup",
  zValidator(
    "form",
    z
      .object({
        email: z.email("Please enter a valid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        repeatPassword: z.string(),
      })
      .refine((data) => data.password === data.repeatPassword, {
        message: "Passwords do not match",
        path: ["repeatPassword"],
      }),
    (result, c) => {
      if (!result.success) {
        const formData = result.data;
        return c.html(
          signUpPage({
            email: formData?.email,
            error: result.error.issues[0].message,
          })
        );
      }
    }
  ),
  async (c) => {
    const data = c.req.valid("form");

    await new User(db)
      .create({
        email: data.email,
        password: data.password,
      })
      .catch((error) => {
        return c.html(signUpPage({ error }));
      });

    setCookie(c, "session", data?.email, {
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60, // 1 hour
    });
    return c.redirect("/feed");
  }
);

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
