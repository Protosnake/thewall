import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import Feed from "frontend/pages/Feed.js";
import type DatabaseClient from "backend/database/DatabaseClient.js";
import { FeedSchema } from "backend/schemas/feed.schema.js";
import authMiddleware from "backend/middleware/authMiddleware.js";
import { zValidator } from "@hono/zod-validator";
import Post from "backend/entities/Post.js";
import Session from "backend/entities/Session.js";

const feed = new Hono<{ Variables: { db: DatabaseClient } }>();

feed.get(FeedSchema.feed.path, authMiddleware, async (c) => {
  const db = c.get("db");
  const posts = await new Post(db).search({ filter: {} });
  return c.html(<Feed posts={posts} />);
});
feed.post(
  FeedSchema.post.path,
  authMiddleware,
  zValidator("form", FeedSchema.post.POST.body, (result, c) => {
    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      return c.html(<Feed error={errorMessage} />);
    }
  }),
  async (c) => {
    const { content } = c.req.valid("form");
    const db = c.get("db");
    const sessionId = getCookie(c, "session");
    if (typeof sessionId !== "string") {
      throw new Error("Unexpected session id");
    }
    const service = new Post(db);
    const sessionRecord = await new Session(db).find(sessionId);

    await service.create({ content, author: sessionRecord.userId });
    const posts = await service.search({ filter: {} });
    return c.html(<Feed posts={posts} />);
  }
);

export default feed;
