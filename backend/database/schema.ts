import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // UUID
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  createdAt: text("createdAt")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updatedAt")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedBy: text("updatedBy").notNull(),
});
export type UserT = typeof users.$inferSelect;
export type UserInsertT = typeof users.$inferInsert;

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(), // UUID / Token
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now') * 1000)`), // Store as ms for JS Date
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
});

export type SessionT = typeof sessions.$inferSelect;
