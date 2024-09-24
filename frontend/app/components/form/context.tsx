

import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { FormContextProps, FormState, Question, Suggestion } from '../../../api/interfaces/welcome';

const FormContext = createContext<FormContextProps | undefined>(undefined);

export const useFormContext = (): FormContextProps => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};

interface FormProviderProps {
  children: ReactNode;
}

export const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
  const [state, setState] = useState<FormState>({ currentStep: 0, answers: [] });
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate the state from localStorage after the component mounts
  useEffect(() => {
    const savedState = localStorage.getItem('formState');
    if (savedState) {
      setState(JSON.parse(savedState));
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('formState', JSON.stringify(state));
    }
  }, [state, isHydrated]);

  const goToNextStep = () => {
    setState((prevState) => ({
      ...prevState,
      currentStep: prevState.currentStep + 1,
    }));
  };

  const goToPreviousStep = () => {
    setState((prevState) => ({
      ...prevState,
      currentStep: prevState.currentStep - 1,
    }));
  };

  const setAnswer = (questionId: number, answers: Suggestion[]) => {
    setState((prevState) => {
      const existingQuestionIndex = prevState.answers.findIndex(
        (q) => q.questionId === questionId
      );

      let updatedAnswers;
      if (existingQuestionIndex !== -1) {
        updatedAnswers = [...prevState.answers];
        updatedAnswers[existingQuestionIndex].answers = answers;
      } else {
        const newQuestion: Question = {
          questionId,
          answers,
        };
        updatedAnswers = [...prevState.answers, newQuestion];
      }

      return {
        ...prevState,
        answers: updatedAnswers,
      };
    });
  };

  if (!isHydrated) {
    // Optionally, render a loading state or null until hydration completes
    return null;
  }

  return (
    <FormContext.Provider value={{ state, goToNextStep, goToPreviousStep, setAnswer }}>
      {children}
    </FormContext.Provider>
  );
};
