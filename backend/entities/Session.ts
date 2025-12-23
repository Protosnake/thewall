// backend/database/Session.entity.ts
import { eq } from "drizzle-orm";
import { sessions } from "database/schema.js"; // Standard Drizzle schema
import Entity from "./Entity.js";

export default class SessionEntity extends Entity {
  async create(data: typeof sessions.$inferInsert) {
    return this.db.insert(sessions).values(data).returning().get();
  }

  async findById(id: string) {
    return this.db.select().from(sessions).where(eq(sessions.id, id)).get();
  }

  async delete(id: string) {
    const result = await this.db
      .delete(sessions)
      .where(eq(sessions.id, id))
      .returning();
    return result.length > 0;
  }
}
