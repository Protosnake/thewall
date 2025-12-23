import { eq, and } from "drizzle-orm";
import { users, type UserT, type UserInsertT } from "database/schema.js";
import { hashPassword } from "database/encrypt.js";
import Entity from "./Entity.js";

export default class extends Entity<UserT> {
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

  async find(id: string): Promise<UserT> {
    const res = this.db.select().from(users).where(eq(users.id, id)).get();
    if (!res) throw new Error(`Couldn't find user by id: ${id}`);
    return res;
  }
  async search(payload: {
    filter: Partial<UserT>;
    limit?: number;
    offset?: number;
  }) {
    // Case 2: Fetch multiple sessions with filters/pagination
    const { filter, limit = 50, offset = 0 } = payload;

    // Dynamically build the WHERE clause based on the filter object
    const conditions = Object.entries(filter).map(([key, value]) =>
      eq(users[key as keyof UserT], value)
    );

    return this.db
      .select()
      .from(users)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .all();
  }

  /**
   * Update user fields.
   * Drizzle handles partial updates automatically.
   */
  async update(input: Partial<UserInsertT> & { id: string }): Promise<UserT> {
    const [result] = await this.db
      .update(users)
      .set({
        ...input,
        updatedAt: new Date().toISOString(), // Manual update of timestamp if not using triggers
      })
      .where(eq(users.id, input.id))
      .returning();

    if (!result) throw new Error(`User with ID ${input.id} not found.`);
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
