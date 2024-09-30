import { hash, compare } from "bcrypt-ts";
import { decode, verify, sign } from "@tsndr/cloudflare-worker-jwt";

const JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 30; // 30 minutes

class Auth {
  static async hashPassword(
    password: string,
    saltRounds = 10
  ): Promise<string> {
    // Assuming bcrypt-ts or an equivalent hashing method
    return await hash(password, saltRounds);
  }

  static async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    // Assuming bcrypt-ts or an equivalent comparison method
    return await compare(password, hashedPassword);
  }

  static async generateToken(
    payload: object,
    secretKey: string,
    options?: { expiresIn?: string; notBefore?: string }
  ): Promise<string> {

    // Adjust payload to include `exp` and `nbf` based on options if provided
    if (options?.expiresIn) {
      payload = {
        ...payload,
        exp:
          Math.floor(Date.now() / JWT_ACCESS_TOKEN_EXPIRE_MINUTES) +
          Auth.parseDurationToSeconds(options.expiresIn),
      };
    }

    if (options?.notBefore) {
      payload = {
        ...payload,
        nbf:
          Math.floor(Date.now() / 1000) +
          Auth.parseDurationToSeconds(options.notBefore),
      };
    }

    return await sign(payload, secretKey);
  }

  static async verifyToken(token: string, secretKey: string): Promise<boolean> {
    return await verify(token, secretKey);
  }

  static decodeToken(token: string) {
    return decode(token);
  }

  // Helper method to parse a duration string (e.g., "1h", "30m") into seconds
  static parseDurationToSeconds(duration: string): number {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1), 10);
    switch (unit) {
      case "h":
        return value * 60 * 60;
      case "m":
        return value * 60;
      case "s":
        return value;
      default:
        throw new Error("Invalid duration unit");
    }
  }
}

export default Auth;
