import { WelcomeFormData } from "../schemas/welcome";
import { ApiService } from "./baseService";

interface basicAPI{
success: boolean;
message: string;
}


// Define a service for handling profile-related HTTP requests
export class ProfileService extends ApiService {
  // Method to create a new profile
  static async createWelcomeProfile(
    welcomeProfile: WelcomeFormData
  ): Promise<basicAPI | void> {
    try {

      console.log(welcomeProfile);

      return await this.post<basicAPI>("welcome", welcomeProfile);
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  }


  // Method to update an existing profile by ID
  static async updateProfile(
    profileId: number,
    welcomeProfile: welcomeProfile
  ): Promise<welcomeProfile | void> {
    try {
      return await this.patch<welcomeProfile>(
        `profile/${profileId}`,
        welcomeProfile
      );
    } catch (error) {
      console.error(`Error updating profile with ID ${profileId}:`, error);
    }
  }


  // Method to get a profile by ID
  static async getProfile(profileId: number): Promise<Profile | void> {
    try {
      return await this.getSingle<Profile>(`profile/${profileId}`);
    } catch (error) {
      console.error(`Error fetching profile with ID ${profileId}:`, error);
    }
  }
}
