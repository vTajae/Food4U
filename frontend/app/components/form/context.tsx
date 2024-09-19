import React, { createContext, useState, useContext } from 'react';

// Create FormContext
const FormContext = createContext({
    currentStep: 0,
    nextStep: () => {},
    updateAnswer: () => {},
    answers: {},
    completed: false,
});

// Context Provider
export const FormProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0); // Track current step (0 to 4)
  const [answers, setAnswers] = useState({}); // Store answers for all questions
  const [completed, setCompleted] = useState(false); // Track if the form is completed

  // Update answers when user submits a question
  const updateAnswer = (question, answer) => {
    setAnswers((prev) => ({ ...prev, [question]: answer }));
  };

  // Proceed to the next step
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setCompleted(true); // Mark form as completed after last question
    }
  };

  return (
    <FormContext.Provider value={{ currentStep, nextStep, updateAnswer, answers, completed }}>
      {children}
    </FormContext.Provider>
  );
};

// Custom hook to use FormContext
export const useFormContext = () => useContext(FormContext);
