import { MedicalCode } from "./medical";

// Interface for each question's structure
export interface QuestionData {
    question: string; // The text of the question
    options?: string[]; // Optional array of options for multiple-choice questions
    answer?: string | string[]; // The user's submitted answer
  }

  export interface QuestionData3 {
    question: string; // The text of the question
    options?: string[]; // Optional array of options for multiple-choice questions
    answer?: MedicalCode;
  }


  
  // Main FormData model that tracks all questions
  export interface WelcomeQuestions {
    q1: QuestionData;
    q2: QuestionData;
    q3?: QuestionData3;
    q4: QuestionData;
    q5: QuestionData; // Optional question 5
  }
  
