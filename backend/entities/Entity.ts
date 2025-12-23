import type DatabaseClient from "backend/database/DatabaseClient.js";

export default abstract class {
  db: DatabaseClient["db"];
  constructor(protected databaseClient: DatabaseClient) {
    this.db = databaseClient.db;
  }
}
