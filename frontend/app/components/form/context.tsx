import React, { createContext, useState, useContext, ReactNode } from 'react';
import Modal from './modal';
import { WelcomeQuestions, MedicalCode } from '../../../api/interfaces/welcome';

interface FormContextType {
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  updateAnswer: (questionIndex: number, answer: MedicalCode[] | string[]) => void;
  answers: WelcomeQuestions;
  completed: boolean;
  openModal: () => void;
  isEditable: boolean;
  enableEdit: () => void;
  lockInValues: () => void;
  handleFinalSubmit: () => void;
}

const defaultAnswers: WelcomeQuestions = {
  questions: [
    { question: 'Favorite Cuisine?', answer: [],  options: ['Italian', 'Mexican', 'Chinese', 'Indian', 'Japanese', 'Thai']},
    { question: 'What type of diet do you follow?', answer: [], options: [] },
    { question: 'Do you have a medical condition?', options: [] },
    { question: 'Do you have any allergies or dietary restrictions?', answer: [], options: []
    },
    { question: 'Average Cost Per Meal', answer: [], options: [] },
  ],
};

const FormContext = createContext<FormContextType>({
  currentStep: 0,
  nextStep: () => {},
  prevStep: () => {},
  updateAnswer: () => {},
  answers: defaultAnswers,
  openModal: () => {},
  completed: false,
  isEditable: false,
  enableEdit: () => {},
  lockInValues: () => {},
  handleFinalSubmit: () => {},
});

interface FormProviderProps {
  children: ReactNode;
}

export const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<WelcomeQuestions>(defaultAnswers);
  const [completed, setCompleted] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditable, setIsEditable] = useState<boolean>(true);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const totalSteps = 6; // Total number of steps including Final

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const updateAnswer = (questionIndex: number, newAnswer: string[] | MedicalCode[]) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      questions: prevAnswers.questions.map((question, index) => {
        if (index === questionIndex) {
          if ('code' in question) {
            // MedicalQuestion: replace with new MedicalCode(s)
            const updatedAnswer = Array.isArray(newAnswer)
              ? newAnswer as MedicalCode[]
              : [newAnswer as unknown as MedicalCode];
            return { ...question, answer: updatedAnswer }; // Replace with MedicalCode array
          } else {
            // RegularQuestion: replace with new string(s)
            const updatedAnswer = Array.isArray(newAnswer)
              ? newAnswer as string[]
              : [newAnswer as string];
            return { ...question, answer: updatedAnswer }; // Replace with string array
          }
        }
        return question;
      }),
    }));
  };
  

  const handleFinalSubmit = () => {
    const formSubmissionData = {
      ...answers,
    };

    console.log('Final submission data:', formSubmissionData);
    setCompleted(true);
    setShowModal(false);
  };

  const enableEdit = () => setIsEditable(true);
  const lockInValues = () => setIsEditable(false);

  return (
    <FormContext.Provider
      value={{
        currentStep,
        nextStep,
        prevStep,
        updateAnswer,
        answers,
        completed,
        openModal,
        isEditable,
        enableEdit,
        lockInValues,
        handleFinalSubmit,
      }}
    >
      {children}

      {showModal && (
        <Modal
          title="Are you sure?"
          description="You have completed your application. Do you want to submit?"
          onConfirm={handleFinalSubmit}
          onCancel={closeModal}
        />
      )}
    </FormContext.Provider>
  );
};


export const useFormContext = () => useContext(FormContext);
