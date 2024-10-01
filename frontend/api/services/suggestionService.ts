import { QuerySuggest, SearchResultFood } from "../../api/schemas/suggestion";
import { ApiService } from "./baseService";

export interface basicAPI {
  status: boolean;
  message: string;
  result: SearchResultFood
}



// Define a service for handling profile-related HTTP requests
class ProfileService extends ApiService {

  static async GeneralSuggestion(
    queryKey: QuerySuggest
    ): Promise<basicAPI | void> {
    try {
      const result =  await this.post<basicAPI>("api/suggestion", queryKey);

      return result;
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  }
}

export default ProfileService;
