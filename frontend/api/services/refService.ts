// src/services/UserService.ts

import Auth from "../../app/context/auth/auth-service";
import { userLogin, userRegister } from "../models/user";
import UserRepository from "../repo/userRepository";
import { ApiService } from "./baseService";

class UserService {
  private userRepository: UserRepository;

  constructor(env: Env) {
    this.userRepository = new UserRepository(env);
  }



  async getAllergies(userData: userRegister) {
    console.log(userData, "userData");
    // Check if user already exists
    const existingUser = await this.userRepository.findUserByUsername(
      userData.username
    );

    if (existingUser) {
      return { success: false, message: "User already exists." };
    }

    // Use Auth class to hash the user's password before saving to the database
    userData.password = await Auth.hashPassword(userData.password);

    // Add the new user to the database

    const userId = await this.userRepository.addBasicUser(userData);

    console.log(userId, "userId");

    if (userId) {
      return {
        success: true,
        userId,
        message: "User registered successfully.",
      };
    } else {
      return { success: false, message: "Failed to register user." };
    }
  }



  async loginUser(userData: userLogin, env: Env) {
    try {
      const user = await this.userRepository.findUserByUsername(
        userData.username
      );

      if (!user) {
        return { success: false, message: "User does not exist." };
      }

      const passwordMatch = await Auth.verifyPassword(
        userData.password,
        user.user_password
      );

      if (!passwordMatch) {
        return { success: false, message: "Incorrect password." };
      }

      // Ensure all required properties are present
      if (
        passwordMatch &&
        user.username &&
        typeof user.user_id === "number" &&
        user.createdAt &&
        user.updatedAt &&
        user.user_role
      ) {
        const loginCookieData = {
          username: user.username,
          id: user.user_id,
          role: user.user_role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };

        const token = await Auth.generateToken(
          {
            user_id: user.user_id,
            username: user.username,
            role: user.user_role,
          },
          env.JWT_SECRET_KEY, // Your JWT secret key
          { expiresIn: env.JWT_ACCESS_TOKEN_EXPIRE_MINUTES } // Set token expiration
        );

        ApiService.setToken(token);

        return {
          success: true,
          user: loginCookieData,
          message: "User logged in successfully.",
        };
      } else {
        return { success: false, message: "User data incomplete." };
      }
    } catch (error) {
      console.error("Error during login:", error);
      return {
        success: false,
        message: "Login process failed due to a server error.",
      };
    }
  }

}

export default UserService;
