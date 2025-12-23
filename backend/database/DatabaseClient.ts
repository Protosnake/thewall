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
      // This will automatically create the tables if they don't exist
      migrate(this.db, { migrationsFolder: "./drizzle" });
      console.log("✅ Database tables synced via migrations.");
    } catch (error) {
      console.error(
        "❌ Migration failed. Did you run 'bunx drizzle-kit generate'?",
        error
      );
    }
  }

  close() {
    this.sqlite.close();
  }
}
