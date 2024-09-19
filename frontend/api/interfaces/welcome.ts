
// Structure for standard questions
export interface RegularQuestion {
  question: string;      // The text of the question
  answer?: string |string[]; // The user's submitted answer
  options?: string[];     // Optional array of options
}

// Structure for the special MedicalQuestion
export interface MedicalCode {
  code: string;
  description: string;
}

export interface MedicalQuestion {
  question: string;               // The text of the medical question
  answer?: MedicalCode;     // The user's submitted answer or undefined
  options?: string[];              // Optional array of options
}

// Union type to represent all possible questions
export type WelcomeQuestion = RegularQuestion | MedicalQuestion;

// Main form data model now holds an array of questions
export interface WelcomeQuestions {
  questions: WelcomeQuestion[]; // Array of both regular and medical questions
}

