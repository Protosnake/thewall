import DatabaseClient from "../database/index.js";
export default class Entity {
    db;
    constructor(db) {
        this.db = db;
    }
}
