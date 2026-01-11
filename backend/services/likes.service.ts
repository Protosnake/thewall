import type DatabaseClient from "backend/database/DatabaseClient.js";
import { likes, type LikeInsertT } from "backend/database/schema.js";
import { and, eq, sql } from "drizzle-orm";

export default class LikeService {
  constructor(private client: DatabaseClient) {}

  async toggle(input: LikeInsertT) {
    const db = this.client.db;

    // Attempt to delete first. If it deletes a row, we know it was liked.
    const deleted = await db
      .delete(likes)
      .where(
        and(eq(likes.userId, input.userId), eq(likes.postId, input.postId))
      )
      .returning();

    // If nothing was deleted, it wasn't liked yet, so we insert.
    if (deleted.length === 0) {
      try {
        await db.insert(likes).values(input);
      } catch (e) {
        // If unique constraint fails, it means someone else liked it
        // in the millisecond between delete and insert. We can ignore.
      }
    }

    return this.getStats(input);
  }

  async getStats(input: {
    postId: string;
    userId?: string;
  }): Promise<{ count: number; isLiked: boolean }> {
    const stats = await this.client.db
      .select({
        count: sql<number>`count(*)`,
        isLiked: input.userId
          ? sql<number>`max(case when ${likes.userId} = ${input.userId} then 1 else 0 end)`
          : sql<number>`0`,
      })
      .from(likes)
      .where(eq(likes.postId, input.postId))
      .get(); // Returns the object directly, not an array

    return {
      count: stats?.count ?? 0,
      isLiked: Boolean(stats?.isLiked),
    };
  }
}
