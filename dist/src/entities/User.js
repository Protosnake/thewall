import { z } from "zod";
import Entity from "./Entity.js";
import { hashPassword } from "../database/encrypt.js";
const UserSchema = z.object({
    id: z.string(),
    email: z.email(),
    password: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    updatedBy: z.string(),
});
export default class User extends Entity {
    async create(input) {
        const userId = crypto.randomUUID(); // No library needed in modern Node.js
        const now = new Date().toISOString();
        const encryptedPassword = hashPassword(input.password);
        const sql = `
      INSERT INTO users (id, email, password, createdAt, updatedAt, updatedBy) 
      VALUES (?, ?, ?, ?, ?, ?) 
      RETURNING *
    `;
        const result = this.db.get(sql, [
            userId,
            input.email,
            encryptedPassword,
            now,
            now,
            userId,
        ]);
        return UserSchema.parse(result);
    }
    async read(payload) {
        if (payload?.id) {
            const result = this.db.get("SELECT * FROM users WHERE id = ?", [
                payload.id,
            ]);
            return result ? [UserSchema.parse(result)] : [];
        }
        let sql = `SELECT * FROM users`;
        const params = [];
        const filterEntries = Object.entries(payload.filter || {});
        if (filterEntries.length > 0) {
            const conditions = filterEntries.map(([key, value]) => {
                params.push(value);
                return `${key} = ?`;
            });
            sql += ` WHERE ` + conditions.join(" AND ");
        }
        sql += ` LIMIT ? OFFSET ?`;
        params.push(payload.limit, payload.offset);
        const results = this.db.query(sql, params);
        return results.map((row) => UserSchema.parse(row));
    }
    async update(input) {
        const { id, ...fields } = input;
        const keys = Object.keys(fields);
        const values = Object.values(fields);
        // Dynamically build: SET email = ?, password = ?
        const setClause = keys.map((key) => `${key} = ?`).join(", ");
        const sql = `UPDATE users SET ${setClause}, updatedAt = ? WHERE id = ? RETURNING *`;
        const result = this.db.get(sql, [
            ...values,
            new Date().toISOString(),
            id,
        ]);
        if (!result)
            throw new Error("User not found for update");
        return UserSchema.parse(result);
    }
    async delete(payload) {
        // Note: your interface uses Pick<T, "id">, so we access payload.id
        this.db.run("DELETE FROM users WHERE id = ?", [payload.id]);
        return true;
    }
}
