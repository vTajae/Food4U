// src/services/RefService.ts

import { Suggestion } from "../../api/schemas/refs";
import { ApiService } from "./baseService";

interface DietType {
  diet_name: string;
  description: string;
}

class RefService extends ApiService {
  
static async getAllDiets(): Promise<Suggestion[]> {
  try {
    const dietsQuery = "diets";

    // Fetch raw diet data from the API
    const response: DietType[] = await this.get(`refs?queryKey=${dietsQuery}`);


    console.log(response);
    // If response is valid, transform and return it
    if (response) {
      const result = response.map((diet: DietType) => ({
        description: diet.description,
        name: diet.diet_name,
      }));

      return  result; // Return the transformed data
    }

    return []; // Return an empty array if no data
  } catch (error) {
    console.error("Error fetching diets:", error);
    return []; // Return an empty array in case of an error
  }
}
}

export default RefService;
