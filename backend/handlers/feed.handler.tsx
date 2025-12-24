import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import Feed from "frontend/pages/Feed.js";
import type DatabaseClient from "backend/database/DatabaseClient.js";
import { FeedSchema } from "backend/schemas/feed.schema.js";
import authMiddleware from "backend/middleware/authMiddleware.js";
import { zValidator } from "@hono/zod-validator";
import Post from "backend/entities/Post.js";
import Session from "backend/entities/Session.js";
import { AuthSchema } from "backend/schemas/auth.schema.js";
import HTTP_CODES from "constants/HTTP_CODES.js";

const feed = new Hono<{ Variables: { db: DatabaseClient } }>();

feed.get(FeedSchema.feed.path, authMiddleware, async (c) => {
  const db = c.get("db");
  const posts = await new Post(db).search({ filter: {} });
  return c.html(<Feed posts={posts} />);
});
feed.post(
  FeedSchema.post.path,
  authMiddleware,
  // We keep the validator but remove the hook/callback to handle it manually
  zValidator("form", FeedSchema.post.POST.body),
  async (c) => {
    const sessionId = getCookie(c, "session");
    if (!sessionId) return c.redirect("/login");

    const db = c.get("db");
    const postService = new Post(db);

    // 1. Manually check the result to keep the user on the Feed page
    const body = await c.req.parseBody();
    const result = FeedSchema.post.POST.body.safeParse(body);

    if (!result.success) {
      // Fetch posts so they don't disappear when an error shows
      const posts = await postService.search({ filter: {} });
      const errorMessage = result.error.issues[0].message;
      return c.html(
        <Feed error={errorMessage} posts={posts} />,
        HTTP_CODES.BAD_REQUEST
      );
    }

    const { content } = result.data;

    const sessionRecord = await new Session(db).find(sessionId);
    await postService.create({
      content,
      author: sessionRecord.userId,
    });

    return c.redirect(FeedSchema.feed.path);
  }
);

export default feed;
