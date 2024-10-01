import { ProfileSchema } from "../../api/schemas/profile";
import { WelcomeFormData } from "../schemas/welcome";
import { ApiService } from "./baseService";

interface basicAPI {
  status: boolean;
  message: string;
}


// Define a service for handling profile-related HTTP requests
class ProfileService extends ApiService {
  // Method to create a new profile
  static async createWelcomeProfile(
    welcomeProfile: WelcomeFormData
  ): Promise<basicAPI | void> {
    try {
      const result =  await this.post<basicAPI>("welcome", welcomeProfile);

      return result;
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  }

  static async getAllData(): Promise<ProfileSchema | void> {
    try {
      
      const response = await this.getSingle<ProfileSchema>("user/profile");


      return response;
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  }

  // // Method to update an existing profile by ID
  // static async updateProfile(
  //   profileId: number,
  //   welcomeProfile: welcomeProfile
  // ): Promise<welcomeProfile | void> {
  //   try {
  //     return await this.patch<welcomeProfile>(
  //       `profile/${profileId}`,
  //       welcomeProfile
  //     );
  //   } catch (error) {
  //     console.error(`Error updating profile with ID ${profileId}:`, error);
  //   }
  // }
}

export default ProfileService;
