// Import Cloudflare's D1 Database interface

import { Env } from "../../app/context";
import { User, userRegister } from "../schemas/user";


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

    async findUserById(id: number): Promise<User | void> {
    const query = `SELECT * FROM user WHERE user_id = ?`;
    const { results } = await this.db.prepare(query).bind(Number(id)).all<User>();

    return results[0];
  }

  async addBasicUser(userData: userRegister): Promise<number | void> {
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
          "2",
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

  async addAdminUser(userData: userRegister): Promise<number | void> {
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
          "1",
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
