import type { QuerySuggest, SearchResultFood } from "../../api/schemas/suggestion";
import { ApiService } from "./baseService";

export interface basicAPI {
  status: boolean;
  message: string;
  result: SearchResultFood[];
}

class SuggestionService extends ApiService {
  async GeneralSuggestion(queryKey: QuerySuggest): Promise<basicAPI> {
    // Preserve transport/status failures so the route can explain them to users.
    const response = await this.post<basicAPI>("api/suggestion", queryKey);
    if (!response || response.status !== true || !Array.isArray(response.result)) {
      throw new Error("Invalid suggestion response");
    }
    return response;
  }
}

export default SuggestionService;
