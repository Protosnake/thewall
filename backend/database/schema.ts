import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  index,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  createdAt: text("createdAt")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updatedAt")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});
export type UserT = typeof users.$inferSelect;
export type UserInsertT = typeof users.$inferInsert;

export const sessions = sqliteTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now') * 1000)`), // Store as ms for JS Date
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
});

export type SessionT = typeof sessions.$inferSelect;

export const posts = sqliteTable("posts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  content: text("content").notNull(),
  author: text("author")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now') * 1000)`), // Store as ms for JS Date
  updatedAt: text("updatedAt")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});
export type PostT = typeof posts.$inferSelect;
export type PostInsertT = typeof posts.$inferInsert;
export type PostWithLikesT = PostT & {
  likeCount: number;
  isLiked: boolean;
};

export const likes = sqliteTable(
  "likes",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id),
    createdAt: integer("created_at", { mode: "timestamp" }).default(
      sql`CURRENT_TIMESTAMP`
    ),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.postId] }),
    index("post_id_idx").on(t.postId),
  ]
);

export type LikeT = typeof likes.$inferSelect;
export type LikeInsertT = typeof likes.$inferInsert;
