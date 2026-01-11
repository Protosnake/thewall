import { faker } from "@faker-js/faker";
import assert from "assert";
import { test, describe } from "testing/integration/fixtures/index.js";
import routes from "testing/api/routes.js";
import User from "backend/entities/User.js";
import { expect } from "bun:test";
import HTTP_CODES from "constants/HTTP_CODES.js";
import { isHtmxError } from "../asserts.js";
import type { UserT } from "backend/database/schema.js";
import Post from "backend/entities/Post.js";
import Session from "backend/entities/Session.js";

describe("Posts", () => {
  test("Only authenticated user can fetch posts", async ({ apiClient, db }) => {
    await routes(apiClient)
      .getPost()
      .then((res) => {
        expect(res.status).toBe(HTTP_CODES.REDIRECT);
        expect(res.headers.get("location")).toBe("/login");
      });
  });
  test("Should not throw if no posts exist", async ({ db, apiClient }) => {
    await apiClient.authenticate();

    await routes(apiClient)
      .getPost()
      .then((res) => {
        expect(res.ok).toBe(true);
        expect(res.status).toBe(HTTP_CODES.OK);
      });
  });
  test("Create post", async ({ apiClient }) => {
    await apiClient.authenticate();

    await routes(apiClient)
      .createPost({ content: "Hello world!" })
      .then((res) => {
        expect(res.ok).toBe(true);
        expect(res.status).toBe(HTTP_CODES.OK);
      });
  });
  test("Get posts", async ({ apiClient }) => {
    await apiClient.authenticate();

    const postContent = "Hello world! " + faker.string.alphanumeric(5);
    await routes(apiClient).createPost({ content: postContent });

    const res = await routes(apiClient).getPost();

    expect(res.status).toBe(HTTP_CODES.OK);
    expect(res.headers.get("Content-Type")).toContain("text/html");

    const html = await res.text();

    expect(html).toContain(postContent);
    expect(html).not.toContain("The wall is quiet");
  });
  test("Like and dislike a post", async ({ apiClient, db }) => {
    await apiClient.authenticate();
    const sessionId = apiClient?.cookie?.split("=")[1].split(";")[0];
    assert(sessionId);
    const session = await new Session(db).find(sessionId);

    const post = await new Post(db).create({
      content: "KEK",
      author: session.userId,
    });

    await routes(apiClient)
      .likePost({ id: post.id })
      .then((res) => {
        expect(res.ok).toBe(true);
      });

    await new Post(db)
      .withLikes({ postId: post.id, userId: session.userId })
      .then(([updatedPost]) => {
        expect(updatedPost.id).toBe(post.id);
        expect(updatedPost.likeCount).toBe(1);
        expect(updatedPost.isLiked).toBe(true);
      });

    await routes(apiClient)
      .likePost({ id: post.id })
      .then((res) => {
        expect(res.ok).toBe(true);
      });

    await new Post(db)
      .withLikes({ postId: post.id, userId: session.userId })
      .then(([updatedPost]) => {
        expect(updatedPost.id).toBe(post.id);
        expect(updatedPost.likeCount).toBe(0);
      });
  });
});
