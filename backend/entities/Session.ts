// backend/database/Session.entity.ts
import { and, eq } from "drizzle-orm";
import { sessions, type SessionT, type UserT } from "database/schema.js"; // Standard Drizzle schema
import Entity from "./Entity.js";

export default class extends Entity<SessionT> {
  async create(payload: {
    user: UserT;
    daysValid?: number;
  }): Promise<SessionT> {
    const { user, daysValid = 7 } = payload;
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + daysValid);
    const [result] = await this.db
      .insert(sessions)
      .values({
        id: sessionToken,
        userId: user.id,
        expiresAt: expiresAt,
      })
      .returning();
    return result;
  }

  async find(id: string): Promise<SessionT> {
    const result = this.db
      .select()
      .from(sessions)
      .where(eq(sessions.id, id))
      .get();
    if (!result) throw new Error(`Couldn't find Session by id: ${id}`);
    return result;
  }
  async search(payload: {
    filter: Partial<SessionT>;
    limit?: number;
    offset?: number;
  }): Promise<SessionT[]> {
    // Case 2: Fetch multiple sessions with filters/pagination
    const { filter, limit = 50, offset = 0 } = payload;

    // Dynamically build the WHERE clause based on the filter object
    const conditions = Object.entries(filter).map(([key, value]) =>
      eq(sessions[key as keyof SessionT], value)
    );

    return this.db
      .select()
      .from(sessions)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .all();
  }

  async update(payload: Partial<SessionT> & { id: string }): Promise<SessionT> {
    const { id, ...dataToUpdate } = payload;

    if (Object.keys(dataToUpdate).length === 0) {
      throw new Error("No fields provided for update");
    }

    const [updatedSession] = await this.db
      .update(sessions)
      .set(dataToUpdate)
      .where(eq(sessions.id, id))
      .returning();

    if (!updatedSession) {
      throw new Error(`Session with ID ${id} not found`);
    }

    return updatedSession;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(sessions)
      .where(eq(sessions.id, id))
      .returning({ deletedId: sessions.id });

    // If result has an entry, it means a row was actually found and deleted
    return result.length > 0;
  }
}
