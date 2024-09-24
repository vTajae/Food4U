import { Suggestion } from "../../api/interfaces/refs";
import { ApiService } from "./baseService";


export interface welcomeProfile {
  queryKey: string;
  answers: Suggestion[];
}

// Define a service for handling profile-related HTTP requests
export class profileService extends ApiService {
  // Method to create a new profile
  static async createWelomeProfile(welcomeProfile: welcomeProfile): Promise<welcomeProfile | void> {
    try {
      return await this.post<welcomeProfile>("profile", welcomeProfile);
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  }

  // Method to update an existing profile by ID
  static async updateProfile(profileId: number, welcomeProfile: welcomeProfile): Promise<welcomeProfile | void> {
    try {
      return await this.patch<welcomeProfile>(`profile/${profileId}`, welcomeProfile);
    } catch (error) {
      console.error(`Error updating profile with ID ${profileId}:`, error);
    }
  }

  // Method to get a profile by ID
  static async getProfile(profileId: number): Promise<welcomeProfile | void> {
    try {
      return await this.getSingle<welcomeProfile>(`profile/${profileId}`);
    } catch (error) {
      console.error(`Error fetching profile with ID ${profileId}:`, error);
    }
  }
}
