// backend/database/DatabaseClient.ts
import { Database } from "bun:sqlite";
import { drizzle, type BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator"; // Standard helper
import * as schema from "./schema.js";

export default class DatabaseClient {
  private sqlite: Database;
  public db: BunSQLiteDatabase<typeof schema>;

  constructor(readonly name: string) {
    this.sqlite = new Database(name);
    this.sqlite.run("PRAGMA foreign_keys = ON;");
    this.db = drizzle(this.sqlite, { schema });
  }

  /**
   * This is the official way to sync your schema.
   * It looks at the folder we generate and applies it to the DB.
   */
  async initialise() {
    try {
      // Force a sync check
      await migrate(this.db, { migrationsFolder: "./drizzle" });
      console.log("✅ Database synced.");
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        console.warn(
          "⚠️ Tables already exist, skipping initial migration run."
        );
      } else {
        throw error;
      }
    }
  }

  close() {
    this.sqlite.close();
  }
}
