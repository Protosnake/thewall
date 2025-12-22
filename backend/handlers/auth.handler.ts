import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { AuthSchema } from "backend/schemas/auth.schema.js";
import { verifyPassword } from "../database/encrypt.js";
import User from "../entities/User.js";

// Pages
import loginPage from "frontend/pages/login.js";
import signUpPage from "frontend/pages/signUp.js";
import type DatabaseClient from "backend/database/index.js";

const auth = new Hono<{ Variables: { db: DatabaseClient } }>();

auth.get(AuthSchema.login.path, (c) => {
  const session = getCookie(c, "session");
  if (session) return c.redirect("/feed");
  return c.html(loginPage());
});
auth.post(
  AuthSchema.login.path,
  zValidator("form", AuthSchema.login.POST.body, (result, c) => {
    if (!result.success) {
      return c.html(
        loginPage({
          email: result.data?.email,
          error: "Invalid email or password",
        }),
        500
      );
    }
  }),
  async (c) => {
    const { email, password } = c.req.valid("form");
    const db = c.get("db"); // We'll pass the DB via middleware
    const userRepo = new User(db);

    const [user] = await userRepo.read({
      filter: { email },
      limit: 1,
      offset: 0,
    });

    if (user && verifyPassword(password, user.password)) {
      setCookie(c, "session", user.id, {
        path: "/",
        httpOnly: true,
        maxAge: 3600,
      });
      return c.redirect("/feed");
    }

    return c.html(loginPage({ email, error: "Invalid credentials" }), 500);
  }
);

auth.get(AuthSchema.signup.path, (c) => {
  return c.html(signUpPage());
});

auth.post(
  AuthSchema.signup.path,
  zValidator("form", AuthSchema.signup.POST.body, (result, c) => {
    if (!result.success) {
      const formData = result.data;
      return c.html(
        signUpPage({
          email: formData?.email,
          error: result.error.issues[0].message,
        })
      );
    }
  }),
  async (c) => {
    const data = c.req.valid("form");
    const db = c.get("db");

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
// GET /logout
auth.get(AuthSchema.logout.path, (c) => {
  deleteCookie(c, "session");
  return c.redirect(AuthSchema.login.path);
});

export default auth;
