// Import Cloudflare's D1 Database interface

import { Env } from "../../app/context";
import { User, userRegister } from "../models/user";


class UserRepository {
  private db: D1Database;

  constructor(env: Env) {
    this.db = env.cloudflare_db;
  }

  async findUserByUsername(username: string): Promise<User | void> {
    const query = `SELECT * FROM user WHERE username = ?`;
    const { results } = await this.db.prepare(query).bind(username).all<User>();

    return results[0];
  }

  async addUser(userData: userRegister): Promise<number | void> {
    const unixTimestamp = Math.floor(Date.now() / 1000); // Convert current time to Unix timestamp
    const query = `
      INSERT INTO user (username, user_password, user_role, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)`;

    try {
      const results = await this.db
        .prepare(query)
        .bind(
          userData.username,
          userData.password,
          userData.role,
          unixTimestamp,
          unixTimestamp
        )
        .run();
      return results.meta.last_row_id;
    } catch (e: any) {
      console.error({
        message: e.message,
      });
    }
  }
}

export default UserRepository;
