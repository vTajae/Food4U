import { z } from "zod";
import { Suggestion } from "./refs";

export interface Question {
  questionId: number;
  questionText?: string;
  answers: Suggestion[] | string;
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

export interface welcomeProfile {
  submission: Answers[];
}

export interface Answers {
  queryKey: string;
  answers: Suggestion[];
}

// Define the schema for individual answers
const answerSchema = z.object({
  questionId: z.number(),
  queryKey: z.enum(["cuisines", "icd10cm", "conditions", "price", "allergies", "diets"]),
  answers: z.array(
    z.object({
      name: z.string().optional(),
      value: z.string().optional(),
      code: z.string().optional(),
    })
  )
});

// Define the schema for the entire form data
export const welcomeFormDataSchema = z.object({
  submission: z.array(answerSchema),
});

// Infer the TypeScript type from the schema
export type WelcomeFormData = z.infer<typeof welcomeFormDataSchema>;
