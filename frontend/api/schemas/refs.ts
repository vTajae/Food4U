import { DietType, MealSuggestionSchema } from "./diet";
import { MedicalCode } from "./medical";

export type SuggestionItem = string | MedicalCode | DietType;

export interface Suggestion {
  name?: string;
  value?: string;
  code?: string;
}

export interface Question {
  questionId: number;
  questionText?: string;
  answers: Suggestion[]; // Adjusted to include string for price
}

export interface FormState {
  currentStep: number;
  answers: Question[];
}

export interface FormContextProps {
  state: FormState;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  setAnswer: (questionId: number, answers: Suggestion[] | string) => void;
}



export type FetcherDataType = {
  results?: MealSuggestionSchema[];
  message?: string;
  errors?: Record<string, string[]>;
  suggestions?: { code: string; name: string }[];
};

