import { Suggestion } from "./refs";

export interface Question {
  questionId: number;
  questionText?: string;
  answers: Suggestion[]; // Each question may have multiple answers
}

export interface FormState {
  currentStep: number;
  answers: Question[];
}

export interface FormContextProps {
  state: FormState;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  setAnswer: (questionId: number, answers: Suggestion[]) => void;
}

export interface welcomeProfile {
  queryKey: string;
  answers: Suggestion[];
}
