import { eq, and, desc, sql } from "drizzle-orm";
import {
  likes,
  posts,
  users,
  type PostInsertT,
  type PostT,
  type PostWithLikesT,
} from "database/schema.js";

import Entity from "./Entity.js";

export default class extends Entity<PostT> {
  /**
   * Create a new user with hashed password.
   * Business logic like hashing stays here or in the Service layer.
   */
  async create(input: Pick<PostT, "content" | "userId">): Promise<PostT> {
    const [result] = await this.db
      .insert(posts)
      .values({
        content: input.content,
        userId: input.userId,
      })
      .returning();

    return result;
  }

  async find(id: string): Promise<PostT> {
    const res = this.db.select().from(posts).where(eq(posts.id, id)).get();
    if (!res) throw new Error(`Couldn't find user by id: ${id}`);
    return res;
  }
  async search(payload: {
    filter: Partial<PostT>;
    limit?: number;
    offset?: number;
  }) {
    // Case 2: Fetch multiple sessions with filters/pagination
    const { filter, limit = 200, offset = 0 } = payload;

    // Dynamically build the WHERE clause based on the filter object
    const conditions = Object.entries(filter).map(([key, value]) =>
      eq(posts[key as keyof PostT], value)
    );

    return this.db
      .select()
      .from(posts)
      .where(and(...conditions))
      .orderBy(desc(posts.updatedAt))
      .limit(limit)
      .offset(offset)
      .all();
  }

  /**
   * Update user fields.
   * Drizzle handles partial updates automatically.
   */
  async update(input: Partial<PostInsertT> & { id: string }): Promise<PostT> {
    const [result] = await this.db
      .update(posts)
      .set({
        ...input,
        updatedAt: new Date().toISOString(), // Manual update of timestamp if not using triggers
      })
      .where(eq(posts.id, input.id))
      .returning();

    if (!result) throw new Error(`User with ID ${input.id} not found.`);
    return result;
  }

  /**
   * Simple delete by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(posts)
      .where(eq(posts.id, id))
      .returning({ id: posts.id });

    return result.length > 0;
  }

  async withLikes(input: {
    userId?: string;
    postId?: string;
    limit?: number;
  }): Promise<PostWithLikesT[]> {
    const { userId, postId, limit = 50 } = input;

    const query = this.db
      .select({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt,
        userId: users.id,
        updatedAt: posts.updatedAt,
        likeCount: sql<number>`(SELECT count(*) FROM ${likes} WHERE ${likes.postId} = ${posts.id})`,
        isLiked: userId
          ? sql<number>`EXISTS(SELECT 1 FROM ${likes} WHERE ${likes.postId} = ${posts.id} AND ${likes.userId} = ${userId})`.mapWith(
              Boolean
            )
          : sql<number>`0`.mapWith(Boolean),
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt))
      .limit(limit);

    // Apply conditional filtering if postId is provided
    if (postId) {
      return query.where(eq(posts.id, postId)).all();
    }

    return query.all();
  }
}
