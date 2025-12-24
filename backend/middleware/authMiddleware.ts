import { type Context, type Next } from "hono";
import { getCookie } from "hono/cookie";

export default async (c: Context, next: Next) => {
  const session = getCookie(c, "session");
  if (!session) {
    return c.redirect("/login");
  }
  await next();
};
