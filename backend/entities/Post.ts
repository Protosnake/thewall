import { eq, and, desc } from "drizzle-orm";
import { posts, type PostInsertT, type PostT } from "database/schema.js";

import Entity from "./Entity.js";

export default class extends Entity<PostT> {
  /**
   * Create a new user with hashed password.
   * Business logic like hashing stays here or in the Service layer.
   */
  async create(input: Pick<PostT, "content" | "author">): Promise<PostT> {
    const [result] = await this.db
      .insert(posts)
      .values({
        content: input.content,
        author: input.author,
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
    const { filter, limit = 50, offset = 0 } = payload;

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
}
