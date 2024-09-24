import { MedicalCode } from "./medical";

interface AutocompleteData {
  allergies?: string[];
  cuisines?: string[];
  intolerances?: string[];
  sensitivities?: string[];
  medicalCodes?: MedicalCode[];
}


 interface Suggestion {
  name: string;
  code?: string; // Optional, present in MedicalCode suggestions
}

// Fetcher data type
 interface RefbarFetchType {
  autocomplete: {
    [key: string]: string[] | MedicalCode[];
  };
  message?: string;
  errors?: Record<string, string[]>;
}



 export type { AutocompleteData, MedicalCode , Suggestion,RefbarFetchType };
