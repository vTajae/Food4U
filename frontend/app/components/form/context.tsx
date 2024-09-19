import React, { createContext, useState, useContext } from 'react';
import Modal from './Modal'; // Assuming a Modal component exists for the "Are you sure?" prompt

// Create FormContext
const FormContext = createContext({
    currentStep: 0,
    nextStep: () => {},
    updateAnswer: (p0: string, answer: string) => {},
    answers: {},
    completed: false,
});

// Context Provider
export const FormProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0); // Track current step (0 to 4)
  const [answers, setAnswers] = useState({}); // Store answers for all questions
  const [completed, setCompleted] = useState(false); // Track if the form is completed
  const [showModal, setShowModal] = useState(false); // Show "Are you sure?" modal
  const [confirmSubmit, setConfirmSubmit] = useState(false); // Track modal confirmation

  // Function to open modal
  const openModal = () => setShowModal(true);
  
  // Function to close modal
  const closeModal = () => setShowModal(false);

  // Function to handle submission after confirmation
  const handleSubmit = () => {
    // Call the post request here
    console.log('Submitting data:', answers);

    setCompleted(true);
    closeModal(); // Close the modal after confirmation
  };

  // Update answers when user submits a question
  const updateAnswer = (question, answer) => {
    setAnswers((prev) => ({ ...prev, [question]: answer }));
  };

  // Proceed to the next step
  const nextStep = () => {
    // Ensure questions 1-4 are answered before completing the form
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === 4) {
      openModal(); // Open the modal after step 4 is completed
    }
  };

  // Function to check if questions 1–4 are completed
  const isMandatoryQuestionsAnswered = () => {
    return answers['1'] && answers['2'] && answers['3'] && answers['4'];
  };

  return (
    <FormContext.Provider value={{ currentStep, nextStep, updateAnswer, answers, completed }}>
      {children}

      {/* Show modal only if form is not yet submitted */}
      {showModal && (
        <Modal 
          title="Are you sure?" 
          description="Are you sure you want to submit the form?"
          onConfirm={handleSubmit} // Proceed with submission
          onCancel={closeModal} // Close modal without submission
        />
      )}
    </FormContext.Provider>
  );
};

// Custom hook to use FormContext
export const useFormContext = () => useContext(FormContext);

// Modal component
const Modal = ({ title, description, onConfirm, onCancel }) => (
  <div className="modal">
    <div className="modal-content">
      <h2>{title}</h2>
      <p>{description}</p>
      <button onClick={onConfirm}>Yes</button>
      <button onClick={onCancel}>No</button>
    </div>
  </div>
);

