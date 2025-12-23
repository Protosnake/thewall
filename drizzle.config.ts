import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./backend/database/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: "thewall.db",
  },
});
