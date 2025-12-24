import { type Context, type Next } from "hono";
import { getCookie } from "hono/cookie";
import Session from "backend/entities/Session.js"; // Import your entity

export default async (c: Context, next: Next) => {
  const db = c.get("db");
  const sessionId = getCookie(c, "session");

  const sessionRecord = sessionId
    ? await new Session(db).find(sessionId)
    : null;

  if (!sessionRecord) {
    if (c.req.header("HX-Request")) {
      c.header("HX-Redirect", "/login");
      return c.body(null, 200);
    }

    return c.redirect("/login");
  }

  await next();
};
