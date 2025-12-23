import { eq, and } from "drizzle-orm";
import { users, type UserT, type UserInsertT } from "database/schema.js";
import { hashPassword } from "database/encrypt.js";
import Entity from "./Entity.js";

export default class extends Entity {
  /**
   * Create a new user with hashed password.
   * Business logic like hashing stays here or in the Service layer.
   */
  async create(input: Pick<UserT, "email" | "password">): Promise<UserT> {
    const userId = crypto.randomUUID();
    const encryptedPassword = hashPassword(input.password);

    const [result] = await this.db
      .insert(users)
      .values({
        id: userId,
        email: input.email,
        password: encryptedPassword,
        updatedBy: userId, // Initial creator is the user themselves
      })
      .returning();

    return result;
  }

  /**
   * Flexible read method.
   * Drizzle handles the SQL generation safely.
   */
  async read(payload: {
    id?: string;
    filter?: Partial<UserT>;
    limit: number;
    offset: number;
  }): Promise<UserT[]> {
    // 1. Fast path for ID
    if (payload.id) {
      const result = await this.db
        .select()
        .from(users)
        .where(eq(users.id, payload.id))
        .get();
      return result ? [result] : [];
    }

    // 2. Build dynamic query
    const query = this.db.select().from(users);
    const conditions = [];

    if (payload.filter) {
      for (const [key, value] of Object.entries(payload.filter)) {
        if (value !== undefined && key in users) {
          conditions.push(eq((users as any)[key], value));
        }
      }
    }

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    return await query.limit(payload.limit).offset(payload.offset).all();
  }

  /**
   * Update user fields.
   * Drizzle handles partial updates automatically.
   */
  async update(id: string, input: Partial<UserInsertT>): Promise<UserT> {
    const [result] = await this.db
      .update(users)
      .set({
        ...input,
        updatedAt: new Date().toISOString(), // Manual update of timestamp if not using triggers
      })
      .where(eq(users.id, id))
      .returning();

    if (!result) throw new Error(`User with ID ${id} not found.`);
    return result;
  }

  /**
   * Simple delete by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    return result.length > 0;
  }
}
