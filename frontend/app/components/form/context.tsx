import React, { createContext, useState, useContext, ReactNode } from 'react';
import Modal from './modal';
import { WelcomeQuestions } from '../../../api/interfaces/welcome';
import { MedicalCode } from '../../../api/interfaces/medical';

interface FormContextType {
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  updateAnswer: (questionKey: keyof WelcomeQuestions, answer: string | MedicalCode | string[]) => void;
  answers: WelcomeQuestions;
  completed: boolean;
  openModal: () => void;
  isEditable: boolean;
  enableEdit: () => void;
  lockInValues: () => void;
  handleFinalSubmit: () => void;
}

const Answers: WelcomeQuestions = {
  q1: { question: '', answer: '', options: [] },
  q2: { question: '', answer: '', options: [] },
  q3: { question: '', answer: { code: '', description: '' }, options: [] },
  q4: { question: '', answer: '', options: [] },
  q5: { question: '', answer: '', options: [] },
};

const FormContext = createContext<FormContextType>({
  currentStep: 0,
  nextStep: () => {},
  prevStep: () => {},
  updateAnswer: () => {},
  answers: Answers,
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
  const [answers, setAnswers] = useState<WelcomeQuestions>(Answers);
  const [completed, setCompleted] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditable, setIsEditable] = useState<boolean>(true);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Update Answer function to support string or MedicalCode types
  const updateAnswer = (questionKey: keyof WelcomeQuestions, answer: string | MedicalCode | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionKey]: {
        ...prev[questionKey],
        answer, // Set the answer directly for both string and MedicalCode types
      },
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
