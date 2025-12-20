import Database from "better-sqlite3";
export default class DatabaseClient {
    name;
    db;
    constructor(name) {
        this.name = name;
        this.db = new Database(name);
    }
    query(sql, params = []) {
        return this.db.prepare(sql).all(...params);
    }
    // Get a single row
    get(sql, params = []) {
        return this.db.prepare(sql).get(...params);
    }
    // Insert, Update, Delete
    run(sql, params = []) {
        this.db.prepare(sql).run(...params);
    }
}
