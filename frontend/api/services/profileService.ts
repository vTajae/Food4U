import { ProfileSchema } from "../../api/schemas/profile";
import { WelcomeFormData } from "../schemas/welcome";
import { ApiService } from "./baseService";

interface basicAPI {
  status: boolean;
  message: string;
}

/** Backend `POST /profile` response: the internal row id plus the public id we sent. */
export interface EnsuredProfile {
  id: number;
  public_id?: string | null;
}

// Profile-related HTTP requests. Every method throws ApiError on a backend error;
// callers branch on `status` (403 = no profile for this identity yet).
class ProfileService extends ApiService {
  /**
   * Create-or-get the backend profile for the current identity. Idempotent.
   * Call this once after login (best effort) and whenever the backend reports
   * "User not found".
   */
  static async ensureProfile(): Promise<EnsuredProfile> {
    return this.post<EnsuredProfile>("profile");
  }

  static async createWelcomeProfile(welcomeProfile: WelcomeFormData): Promise<basicAPI> {
    return this.post<basicAPI>("welcome", welcomeProfile);
  }

  static async getAllData(): Promise<ProfileSchema> {
    return this.getSingle<ProfileSchema>("user/profile");
  }
}

export default ProfileService;
