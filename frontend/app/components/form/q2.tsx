import { useState } from 'react';
import { useFormContext } from './context';

const Question2 = () => {
  const { nextStep, updateAnswer } = useFormContext();
  const [answer, setAnswer] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Make POST request to /user/preferences or /user/medical
    // try {
    //   const response = await fetch('/user/preferences', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ question: 1, answer }),
    //   });

    //   if (response.ok) {
    //     updateAnswer('question2', answer); // Save answer to context
    //     nextStep(); // Go to next question
    //   }
    // } catch (error) {
    //   console.error('Error submitting the answer', error);
    // }


    updateAnswer('q2', answer); // Save answer to context
    nextStep(); // Go to next question


  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>What is your __________________ ?</h2>
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        required
      />
      <button type="submit">Next</button>
    </form>
  );
};

export default Question2;
