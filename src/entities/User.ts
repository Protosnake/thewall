import { z } from "zod";
import Entity from "./Entity.js";

const UserSchema = z.object({
  id: z.string(),
  email: z.email(),
  password: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  updatedBy: z.string(),
});
export type UserT = z.infer<typeof UserSchema>;

export default class User extends Entity<UserT> {
  async create(input: Omit<UserT, "id">) {
    const sql = `
    INSERT INTO users (email, password, createdAt, updatedAt) 
    VALUES (?, ?, ?, ?) 
    RETURNING *
  `;

    const result = this.db.get<UserT>(sql, [
      input.email,
      input.password,
      new Date().toISOString(),
      new Date().toISOString(),
    ]);

    return UserSchema.parse(result);
  }
  async read(payload: {
    id?: UserT["id"];
    filter?: Partial<UserT>;
    limit: number;
    offset: number;
  }): Promise<UserT[]> {
    if (payload.id) {
      const result = this.db.get<UserT>("SELECT * FROM users WHERE id = ?", [
        payload.id,
      ]);
      return result ? [UserSchema.parse(result)] : [];
    }

    let sql = `SELECT * FROM users`;
    const params: any[] = [];
    const filterEntries = Object.entries(payload.filter || {});

    if (filterEntries.length > 0) {
      const conditions = filterEntries.map(([key, value]) => {
        params.push(value);
        return `${key} = ?`;
      });
      sql += ` WHERE ` + conditions.join(" AND ");
    }

    // 3. Add Pagination
    sql += ` LIMIT ? OFFSET ?`;
    params.push(payload.limit, payload.offset);

    const results = this.db.query<UserT>(sql, params);

    // 4. Validate and Return
    return results.map((row) => UserSchema.parse(row));
  }

  async update(input: Partial<UserT> & { id: string }): Promise<UserT> {
    const { id, ...fields } = input;
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    // Dynamically build: SET email = ?, password = ?
    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    const sql = `UPDATE users SET ${setClause}, updatedAt = ? WHERE id = ? RETURNING *`;

    const result = this.db.get<UserT>(sql, [
      ...values,
      new Date().toISOString(),
      id,
    ]);

    if (!result) throw new Error("User not found for update");
    return UserSchema.parse(result);
  }

  async delete(payload: Pick<UserT, "id">): Promise<boolean> {
    // Note: your interface uses Pick<T, "id">, so we access payload.id
    this.db.run("DELETE FROM users WHERE id = ?", [payload.id]);
    return true;
  }
}
