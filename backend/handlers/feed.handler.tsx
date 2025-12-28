import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import Feed from "frontend/pages/Feed.js";
import type DatabaseClient from "backend/database/DatabaseClient.js";
import { FeedSchema } from "backend/schemas/feed.schema.js";
import authMiddleware from "backend/middleware/authMiddleware.js";
import { zValidator } from "@hono/zod-validator";
import Post from "backend/entities/Post.js";
import PostComponent from "frontend/components/Post.js";
import ErrorComponent from "frontend/components/Error.js";
import Session from "backend/entities/Session.js";
import HTTP_CODES from "constants/HTTP_CODES.js";

const feed = new Hono<{ Variables: { db: DatabaseClient } }>();

// GET remains the same (renders the full page on load)
feed.get(FeedSchema.feed.path, authMiddleware, async (c) => {
  return c.html(<Feed />);
});
feed.get(FeedSchema.post.path, authMiddleware, async (c) => {
  const db = c.get("db");
  const posts = await new Post(db).search({ filter: {} });

  if (posts.length === 0) {
    return c.html(
      <div
        style={{
          textAlign: "center",
          padding: "3rem",
          color: "#999",
          fontStyle: "italic",
        }}
      >
        The wall is quiet... be the first to post!
      </div>
    );
  }

  return c.html(<>{posts.map((post) => PostComponent(post))}</>);
});

feed.post(
  FeedSchema.post.path,
  authMiddleware,
  zValidator("form", FeedSchema.post.POST.body),
  async (c) => {
    const db = c.get("db");
    const postService = new Post(db);

    const body = await c.req.parseBody();
    const result = FeedSchema.post.POST.body.safeParse(body);

    const sessionId = getCookie(c, "session");

    if (!result.success || typeof sessionId !== "string") {
      return c.html(
        <ErrorComponent
          error={
            result?.error?.issues[0].message || `Unexpected error encountered`
          }
        ></ErrorComponent>,
        HTTP_CODES.OK
      );
    }

    const { content } = result.data;
    const sessionRecord = await new Session(db).find(sessionId);

    // Create the post
    const post = await postService.create({
      content,
      author: sessionRecord.userId,
    });

    return c.html(PostComponent(post));
  }
);

export default feed;
