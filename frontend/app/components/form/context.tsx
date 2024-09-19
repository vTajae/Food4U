import React, { createContext, useState, useContext, ReactNode } from 'react';
import Modal from './modal';
import { WelcomeQuestions, MedicalCode } from '../../../api/interfaces/welcome';

interface FormContextType {
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  updateAnswer: (questionIndex: number, answer: string | MedicalCode | string[]) => void;
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
    { question: 'Regular Question 1', answer: '', options: [] },
    { question: 'Regular Question 2', answer: '', options: [] },
    { question: 'Medical Question 3', options: [] },
    { question: 'Regular Question 3', answer: '', options: [] },
    { question: 'Regular Question 4', answer: '', options: [] },
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

  const nextStep = () => {
    if (currentStep < answers.questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };


  const updateAnswer = (questionIndex: number, newAnswer: string | string[] | MedicalCode) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      questions: prevAnswers.questions.map((question, index) => {
        if (index === questionIndex) {

          console.log(index, questionIndex)
          // Check if the question is a MedicalQuestion
          if ('answer' in question && typeof question.answer === 'object' && 'code' in question.answer) {
            return { ...question, answer: newAnswer as MedicalCode }; // Treat it as a MedicalQuestion
          } else {
            return { ...question, answer: newAnswer as string | string[] }; // Treat it as a RegularQuestion
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
