// backend/database/Session.entity.ts
import { eq } from "drizzle-orm";
import { sessions, type SessionT } from "database/schema.js"; // Standard Drizzle schema
import Entity from "./Entity.js";

export default class extends Entity {
  async create(userId: string, daysValid: number = 7): Promise<SessionT> {
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + daysValid);

    const [result] = await this.db
      .insert(sessions)
      .values({
        id: sessionToken,
        userId: userId,
        expiresAt: expiresAt,
      })
      .returning();

    return result;
  }

  async getValidSession(token: string): Promise<SessionT | undefined> {
    const result = this.db
      .select()
      .from(sessions)
      .where(eq(sessions.id, token))
      .get();

    // Ensure session hasn't expired
    if (result && result.expiresAt > new Date()) {
      return result;
    }

    return undefined;
  }

  async revoke(token: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.id, token));
  }
}
