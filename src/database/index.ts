import Database from "better-sqlite3";

export interface IDatabase {}

export default class {
  private db;
  constructor(readonly name: string) {
    this.db = new Database(name);
  }

  query<T>(sql: string, params: any[] = []): T[] {
    return this.db.prepare(sql).all(...params) as T[];
  }

  // Get a single row
  get<T>(sql: string, params: any[] = []): T | undefined {
    return this.db.prepare(sql).get(...params) as T | undefined;
  }

  // Insert, Update, Delete
  run(sql: string, params: any[] = []): void {
    this.db.prepare(sql).run(...params);
  }
}
