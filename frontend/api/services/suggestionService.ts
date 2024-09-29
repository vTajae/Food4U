import { ApiService } from "./baseService";

interface basicAPI {
  status: boolean;
  message: string;
}

// Define a service for handling profile-related HTTP requests
class ProfileService extends ApiService {

  static async GeneralSuggestion(
    queryKey: string
    ): Promise<basicAPI | void> {
    try {
      const result =  await this.post<basicAPI>("api/suggestion", queryKey);

      console.log(result);
      return result;
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  }
}

export default ProfileService;
