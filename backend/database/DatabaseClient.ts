// backend/database/DatabaseClient.ts
import { Database } from "bun:sqlite";
import { drizzle, type BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator"; // Standard helper
import * as schema from "./schema.js";
import path from "path";
import { logger } from "backend/lib/logger.js";

export default class DatabaseClient {
  private sqlite: Database;
  public db: BunSQLiteDatabase<typeof schema>;

  constructor(readonly name: string) {
    this.sqlite = new Database(name);
    this.sqlite.run("PRAGMA foreign_keys = ON;");
    this.db = drizzle(this.sqlite, { schema });
  }

  async initialise() {
    try {
      const migrationsPath = path.join(process.cwd(), "drizzle");
      await migrate(this.db, { migrationsFolder: migrationsPath });
      logger.debug("✅ Database synced.");
    } catch (error: any) {
      // Drizzle wraps the SQLite error, so we need to check the 'cause' or the nested message
      const errorMessage = error.message || "";
      const causeMessage = error.cause?.message || "";

      if (
        errorMessage.includes("already exists") ||
        causeMessage.includes("already exists")
      ) {
        logger.info("⚠️ Tables already exist, skipping migration.");
        return;
      }

      console.error("❌ Migration failed:", error);
      throw error;
    }
  }

  close() {
    this.sqlite.close();
  }
}
