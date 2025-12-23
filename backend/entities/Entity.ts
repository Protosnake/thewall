import type DatabaseClient from "backend/database/DatabaseClient.js";

export default abstract class<T> {
  db: DatabaseClient["db"];
  constructor(protected databaseClient: DatabaseClient) {
    this.db = databaseClient.db;
  }
  abstract create(payload: unknown): Promise<T>;
  abstract find(id: string): Promise<T>;
  abstract search(payload: {
    filter: Partial<T>;
    limit?: number;
    offset?: number;
  }): Promise<T[]>;
  abstract update(payload: Partial<T> & { id: string }): Promise<T>;
  abstract delete(id: string): Promise<boolean>;
}
