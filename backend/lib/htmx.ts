import { type Context } from "hono";

export const htmxError = (c: Context, component: any) => {
  c.header("X-Validation-Error", "true");
  return c.html(component, 200); // Always 200 for HTMX
};
