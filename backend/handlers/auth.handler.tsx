import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { AuthSchema } from "backend/schemas/auth.schema.js";
import AuthService from "backend/services/auth.service.js";

// Components
import Login from "frontend/pages/Login.js";
import SignUp from "frontend/pages/SignUp.js";
import type DatabaseClient from "backend/database/DatabaseClient.js";
import HTTP_CODES from "constants/HTTP_CODES.js";
import Session from "backend/entities/Session.js";

const auth = new Hono<{ Variables: { db: DatabaseClient } }>();

// GET /login
auth.get(AuthSchema.login.path, (c) => {
  if (getCookie(c, "session")) return c.redirect("/feed");
  return c.html(<Login />);
});

// POST /login
auth.post(
  AuthSchema.login.path,
  zValidator("form", AuthSchema.login.POST.body, (result, c) => {
    if (!result.success) {
      return c.html(
        <Login email={result.data?.email} error="Invalid email or password" />,
        HTTP_CODES.BAD_REQUEST
      );
    }
  }),
  async (c) => {
    const form = c.req.valid("form");
    const db = c.get("db");
    const auth = new AuthService(c.get("db"));

    try {
      const user = await auth.login(form);
      const session = await new Session(db).create({ user });
      setCookie(c, "session", session.id, {
        path: "/",
        httpOnly: true,
        maxAge: 3600,
        expires: session.expiresAt,
      });
      return c.redirect("/feed");
    } catch (error: any) {
      return c.html(
        <Login email={form.email} error={error.message} />,
        HTTP_CODES.BAD_REQUEST
      );
    }
  }
);

// GET /signup
auth.get(AuthSchema.signup.path, (c) => c.html(<SignUp />));

// POST /signup
auth.post(
  AuthSchema.signup.path,
  zValidator("form", AuthSchema.signup.POST.body, (result, c) => {
    if (!result.success) {
      return c.html(
        <SignUp
          email={result.data?.email}
          error={result.error.issues[0].message}
        />,
        HTTP_CODES.BAD_REQUEST
      );
    }
  }),
  async (c) => {
    const form = c.req.valid("form");
    const db = c.get("db");
    const service = new AuthService(db);

    try {
      const user = await service.signup(form);
      const session = await new Session(db).create({ user });
      setCookie(c, "session", session.id, {
        path: "/",
        httpOnly: true,
        expires: session.expiresAt,
        maxAge: 3600,
      });
      return c.redirect("/feed");
    } catch (error: any) {
      return c.html(
        <SignUp email={form.email} error={error.message} />,
        HTTP_CODES.BAD_REQUEST
      );
    }
  }
);

// GET /logout
auth.get(AuthSchema.logout.path, async (c) => {
  const token = getCookie(c, "session");
  if (token) {
    const db = c.get("db");
    await new AuthService(db).revoke(token);
  }
  deleteCookie(c, "session");
  return c.redirect(AuthSchema.login.path);
});

export default auth;
