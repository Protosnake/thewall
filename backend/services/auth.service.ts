import { type SessionT, type UserT } from "backend/database/schema.js";
import type DatabaseClient from "backend/database/DatabaseClient.js";
import { verifyPassword } from "backend/database/encrypt.js";
import type { LoginBody, SignupBody } from "backend/schemas/auth.schema.js";
import User from "backend/entities/User.js";
import Session from "backend/entities/Session.js";

export default class {
  constructor(private db: DatabaseClient) {}

  async login(payload: LoginBody): Promise<UserT> {
    const userRepo = new User(this.db);
    const [user] = await userRepo.search({
      filter: { email: payload.email },
      limit: 1,
      offset: 0,
    });

    if (!user || !verifyPassword(payload.password, user.password)) {
      throw new Error("Invalid credentials");
    }

    return user;
  }

  async signup(payload: SignupBody): Promise<UserT> {
    const userRepo = new User(this.db);

    const [existingUser] = await userRepo.search({
      filter: { email: payload.email },
      limit: 1,
      offset: 0,
    });
    if (existingUser) throw new Error(`User with this email already exists`);

    return userRepo.create(payload);
  }

  async getValidSession(sessionId: string): Promise<SessionT | undefined> {
    const result = await new Session(this.db).find(sessionId);

    // Ensure session hasn't expired
    if (result && result.expiresAt > new Date()) {
      return result;
    }

    return undefined;
  }

  async revoke(sessionId: string): Promise<void> {
    await new Session(this.db).delete(sessionId);
  }
}
