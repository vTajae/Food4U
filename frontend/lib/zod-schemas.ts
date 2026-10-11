// app/utils/ZodUtility.ts
import { z } from "zod";

// Define a utility class for Zod schemas
export class ZodUtility {
  // Schema for common form fields
  static commonSchemas = {
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters long" })
      .trim(),
    email: z
      .string()
      .email({ message: "Invalid email address" })
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" })
      .trim(),
  };

  // Method to get a registration schema
  static getRegistrationSchema() {
    return z.object({
      username: this.commonSchemas.username,
      email: this.commonSchemas.email,
      password: this.commonSchemas.password,
    });
  }

  // Example of a login schema, reusing the email and password schemas
  static getLoginSchema() {
    return z.object({
      email: this.commonSchemas.email,
      password: this.commonSchemas.password,
    });
  }

  // Example schema for profile update, allowing optional fields
  static getProfileUpdateSchema() {
    return z.object({
      username: this.commonSchemas.username.optional(),
      email: this.commonSchemas.email.optional(),
    });
  }

}
